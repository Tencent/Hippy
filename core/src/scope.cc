/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "core/scope.h"

#include <future>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "base/logging.h"
#include "core/modules/console_module.h"
#include "core/modules/timer_module.h"
#include "core/modules/contextify_module.h"
#include "core/task/javascript_task.h"
#include "core/task/javascript_task_runner.h"
#include "core/vm/native_source_code.h"
#ifdef JS_V8
#include "core/napi/v8/v8_ctx.h"
#include "core/vm/v8/memory_module.h"
#include "core/vm/v8/snapshot_collector.h"
#endif

using unicode_string_view = tdf::base::unicode_string_view;

using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using CtxValue = hippy::napi::CtxValue;

constexpr char kDeallocFuncName[] = "HippyDealloc";
constexpr char kHippyBootstrapJSName[] = "bootstrap.js";

static void InternalBindingCallback(const hippy::napi::CallbackInfo& info, void* data) {
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  TDF_BASE_CHECK(scope);
  auto context = scope->GetContext();
  unicode_string_view module_name;
  context->GetValueString(info[0], &module_name);
  auto u8_module_name = hippy::base::StringViewUtils::ToU8StdStr(module_name);
  auto module_object = scope->GetModuleObject(u8_module_name);
  // TDF_BASE_CHECK(module_object);
  // todo(polly) MemoryModule
  if (!module_object) {
    return;
  }
  auto len = info.Length();
  auto argc = len > 1 ? (len - 1) : 0;
  std::shared_ptr<CtxValue> rest_args[argc];
  for (size_t i = 0; i < argc; ++i) {
    rest_args[i] = info[i + 1];
  }
  auto js_object = module_object->BindFunction(scope, rest_args);
  info.GetReturnValue()->Set(js_object);
}

REGISTER_EXTERNAL_REFERENCES(InternalBindingCallback)

Scope::Scope(std::weak_ptr<Engine> engine,
             std::string name,
             std::unique_ptr<RegisterMap> map)
    : engine_(std::move(engine)), context_(nullptr), name_(std::move(name)), map_(std::move(map)) {
}

Scope::~Scope() {
  TDF_BASE_DLOG(INFO) << "~Scope";
}

void Scope::WillExit() {
  TDF_BASE_DLOG(INFO) << "WillExit begin";
  std::promise<std::shared_ptr<CtxValue>> promise;
  auto future = promise.get_future();
  std::weak_ptr<Ctx> weak_context = context_;
  auto cb = hippy::base::MakeCopyable(
      [weak_context, will_exit_cbs = will_exit_cbs_, p = std::move(promise)]() mutable {
        TDF_BASE_LOG(INFO) << "run js WillExit begin";
        std::shared_ptr<CtxValue> rst = nullptr;
        auto context = weak_context.lock();
        if (context) {
          auto global_object = context->GetGlobalObject();
          auto func_name = context->CreateString(kDeallocFuncName);
          auto fn = context->GetProperty(global_object, func_name);
          bool is_fn = context->IsFunction(fn);
          if (is_fn) {
            context->CallFunction(fn, 0, nullptr);
          }
        }
        for (const auto& will_exit_cb: will_exit_cbs) {
          will_exit_cb();
        }
        p.set_value(rst);
      });
  auto runner = GetTaskRunner();
  if (runner->IsJsThread()) {
    cb();
  } else {
    std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
    task->callback = cb;
    runner->PostTask(task);
  }

  future.get();
  TDF_BASE_DLOG(INFO) << "ExitCtx end";
}

void Scope::Init(bool use_snapshot) {
  CreateContext();
  BindModule();
  if (!use_snapshot) {
    Bootstrap();
  }
  InvokeCallback();
}

void Scope::CreateContext() {
  auto engine = engine_.lock();
  TDF_BASE_CHECK(engine);
  context_ = engine->GetVM()->CreateContext();
  TDF_BASE_CHECK(context_);
  context_->SetExternalData(GetScopeWrapperPointer());
  if (map_) {
    auto it = map_->find(hippy::base::kContextCreatedCBKey);
    if (it != map_->end()) {
      auto f = it->second;
      if (f) {
        f(wrapper_.get());
        map_->erase(it);
      }
    }
  }
}


void Scope::BindModule() {
  module_object_map_["ConsoleModule"] = std::make_shared<ConsoleModule>();
  module_object_map_["TimerModule"] = std::make_shared<TimerModule>();
  module_object_map_["ContextifyModule"] = std::make_shared<ContextifyModule>();
#ifdef JS_V8
  module_object_map_["MemoryModule"] = std::make_shared<MemoryModule>();
#endif
}

void Scope::Bootstrap() {
  TDF_BASE_LOG(INFO) << "Bootstrap begin";
  auto source_code = hippy::GetNativeSourceCode(kHippyBootstrapJSName);
  TDF_BASE_DCHECK(source_code.data_ && source_code.length_);
  unicode_string_view str_view(source_code.data_, source_code.length_);
  auto function = context_->RunScript(str_view, kHippyBootstrapJSName);
  auto is_func = context_->IsFunction(function);
  TDF_BASE_CHECK(is_func) << "bootstrap return not function, len = " << source_code.length_;
  auto func_wrapper = std::make_unique<hippy::napi::FuncWrapper>(InternalBindingCallback, nullptr);
  std::shared_ptr<CtxValue> argv[] = { context_->CreateFunction(func_wrapper) };
  SaveFuncWrapper(std::move(func_wrapper));
  context_->CallFunction(function, 1, argv);
}

void Scope::InvokeCallback() {
  if (!map_) {
    return;
  }
  auto it = map_->find(hippy::base::KScopeInitializedCBKey);
  if (it != map_->end()) {
    auto f = it->second;
    if (f) {
      f(wrapper_.get());
      map_->erase(it);
    }
  }
}

void* Scope::GetScopeWrapperPointer() {
  TDF_BASE_CHECK(wrapper_);
  return wrapper_.get();
}

void Scope::RunJS(const unicode_string_view& data,
                  const unicode_string_view& name,
                  bool is_copy) {
  std::weak_ptr<Ctx> weak_context = context_;
  JavaScriptTask::Function callback = [data, name, is_copy, weak_context] {
#ifdef JS_V8
    auto context = std::static_pointer_cast<hippy::napi::V8Ctx>(weak_context.lock());
    if (context) {
      context->RunScript(data, name, false, nullptr, is_copy);
    }
#else
    auto context = weak_context.lock();
    if (context) {
      context->RunScript(data, name);
    }
#endif
  };

  auto runner = GetTaskRunner();
  if (runner->IsJsThread()) {
    callback();
  } else {
    std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
    task->callback = callback;
    runner->PostTask(task);
  }
}

std::shared_ptr<CtxValue> Scope::RunJSSync(const unicode_string_view& data,
                                           const unicode_string_view& name,
                                           bool is_copy) {
  std::promise<std::shared_ptr<CtxValue>> promise;
  std::future<std::shared_ptr<CtxValue>> future = promise.get_future();
  std::weak_ptr<Ctx> weak_context = context_;
  JavaScriptTask::Function cb = hippy::base::MakeCopyable(
      [data, name, is_copy, weak_context, p = std::move(promise)]() mutable {
        std::shared_ptr<CtxValue> rst = nullptr;
#ifdef JS_V8
        auto context = std::static_pointer_cast<hippy::napi::V8Ctx>(weak_context.lock());
        if (context) {
          rst = context->RunScript(data, name, false, nullptr, is_copy);
        }
#else
        auto context = weak_context.lock();
        if (context) {
          rst = context->RunScript(data, name);
        }
#endif
        p.set_value(rst);
      });

  auto runner = GetTaskRunner();
  if (runner->IsJsThread()) {
    cb();
  } else {
    std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
    task->callback = cb;
    runner->PostTask(task);
  }
  std::shared_ptr<CtxValue> ret = future.get();
  return ret;
}


