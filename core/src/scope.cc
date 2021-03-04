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
#include <vector>

#include "core/base/common.h"
#include "core/base/logging.h"
#include "core/engine.h"
#include "core/modules/module_register.h"
#include "core/napi/native_source_code.h"
#include "core/task/javascript_task.h"
#include "core/task/javascript_task_runner.h"

using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using ModuleClassMap = hippy::napi::ModuleClassMap;
using BindingData = hippy::napi::BindingData;
using CtxValue = hippy::napi::CtxValue;
using TryCatch = hippy::napi::TryCatch;

const std::string DEALLOC_FUNCTION_NAME = "HippyDealloc";

Scope::Scope(Engine* engine,
             const std::string& name,
             std::unique_ptr<RegisterMap> map)
    : engine_(engine), context_(nullptr), name_(name), map_(std::move(map)) {}

Scope::~Scope() {
  HIPPY_DLOG(hippy::Debug, "~Scope");
  engine_->Exit();
}

void Scope::WillExit() {
  HIPPY_DLOG(hippy::Debug, "WillExit begin");
  std::promise<std::shared_ptr<CtxValue>> promise;
  std::future<std::shared_ptr<CtxValue>> future = promise.get_future();
  std::weak_ptr<Ctx> weak_context = context_;
  JavaScriptTask::Function cb = hippy::base::MakeCopyable(
      [weak_context, p = std::move(promise)]() mutable {
        HIPPY_DLOG(hippy::Debug, "run js WillExit begin");
        std::shared_ptr<CtxValue> rst = nullptr;
        std::shared_ptr<Ctx> context = weak_context.lock();
        if (context) {
          std::shared_ptr<CtxValue> fn =
              context->GetJsFn(DEALLOC_FUNCTION_NAME);
          bool is_fn = context->IsFunction(fn);
          if (is_fn) {
            std::shared_ptr<TryCatch> try_catch =
                CreateTryCatchScope(true, context);
            try_catch->SetVerbose(true);
            context->CallFunction(fn, 0, nullptr);
            if (try_catch->HasCaught()) {
              HIPPY_LOG(hippy::Error, "WillExit error, exception = %s",
                        try_catch->GetExceptionMsg().c_str());
            } else {
              HIPPY_DLOG(hippy::Debug, "js WillExit end");
            }
          }
        }
        p.set_value(rst);
      });
  std::shared_ptr<JavaScriptTaskRunner> runner = engine_->GetJSRunner();
  if (runner->IsJsThread()) {
    cb();
  } else {
    std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
    task->callback = cb;
    runner->PostTask(task);
  }

  future.get();
  HIPPY_DLOG(hippy::Debug, "ExitCtx end");
}

bool Scope::LoadModules() {
  return true;
}

void Scope::Initialized() {
  HIPPY_DLOG(hippy::Debug, "Scope Initialized");
  engine_->Enter();
  context_ = engine_->GetVM()->CreateContext();
  if (context_ == nullptr) {
    HIPPY_LOG(hippy::Error, "CreateContext return nullptr");
    return;
  }
  std::shared_ptr<Scope> self = wrapper_->scope_.lock();
  if (!self) {
    HIPPY_LOG(hippy::Error, "Scope wrapper_ error_");
    return;
  }
  RegisterMap::const_iterator it =
      map_->find(hippy::base::kContextCreatedCBKey);
  if (it != map_->end()) {
    RegisterFunction f = it->second;
    if (f) {
      HIPPY_DLOG(hippy::Debug, "run ContextCreatedCB begin");
      f(wrapper_.get());
      HIPPY_DLOG(hippy::Debug, "run ContextCreatedCB end");
      map_->erase(it);
    }
  }
  HIPPY_DLOG(hippy::Debug, "Scope RegisterGlobalInJs");
  context_->RegisterGlobalModule(self,
                                 ModuleRegister::instance()->GetGlobalList());
  ModuleClassMap map(ModuleRegister::instance()->GetInternalList());
  binding_data_ = std::make_unique<BindingData>(self, map);

  auto source_code = hippy::GetNativeSourceCode("bootstrap.js");
  HIPPY_DCHECK(source_code.data_ && source_code.length_);

  std::shared_ptr<CtxValue> function = nullptr;
  {
    std::shared_ptr<TryCatch> try_catch = CreateTryCatchScope(true, context_);
    function = context_->RunScript(
        source_code.data_, source_code.length_, "bootstrap.js", false, nullptr);
    it = map_->find(hippy::base::kHandleExceptionKey);
    if (it != map_->end() && try_catch->HasCaught()) {
      RegisterFunction f = it->second;
      if (f) {
        f((void*)try_catch->GetExceptionMsg().c_str());
      }
    }
  }
  
  bool is_func = context_->IsFunction(function);
  HIPPY_CHECK_WITH_MSG(is_func == true,
                       "bootstrap return not function, register fail!!!");
  if (!is_func) {
    const char* js = reinterpret_cast<const char*>(source_code.data_);
    HIPPY_LOG(hippy::Error, "bootstrap return not function, js = %s, len = %d",
              js, source_code.length_);
    return;
  }

  std::shared_ptr<CtxValue> internal_binding_fn =
      hippy::napi::GetInternalBindingFn(self);
  std::shared_ptr<CtxValue> argv[] = {internal_binding_fn};
  {
    std::shared_ptr<TryCatch> try_catch = CreateTryCatchScope(true, context_);
    std::shared_ptr<CtxValue> ret_value =
        context_->CallFunction(function, 1, argv);
    it = map_->find(hippy::base::kHandleExceptionKey);
    if (it != map_->end() && try_catch->HasCaught()) {
      RegisterFunction f = it->second;
      if (f) {
        f((void*)try_catch->GetExceptionMsg().c_str());
      }
    }
  }
  
  it = map_->find(hippy::base::KScopeInitializedCBKey);
  if (it != map_->end()) {
    RegisterFunction f = it->second;
    if (f) {
      HIPPY_DLOG(hippy::Debug, "run SCOPE_INITIALIEZED begin");
      f(wrapper_.get());
      HIPPY_DLOG(hippy::Debug, "run SCOPE_INITIALIEZED end");
      map_->erase(it);
    }
  }
}

ModuleBase* Scope::GetModuleClass(const std::string& moduleName) {
  auto it = module_class_map_.find(moduleName);
  return it != module_class_map_.end() ? it->second.get() : nullptr;
}

void Scope::AddModuleClass(const std::string& name,
                           std::unique_ptr<ModuleBase> module) {
  module_class_map_.insert({name, std::move(module)});
}

std::shared_ptr<hippy::napi::CtxValue> Scope::GetModuleValue(
    const std::string& moduleName) {
  auto it = module_value_map_.find(moduleName);
  return it != module_value_map_.end() ? it->second : nullptr;
}

void Scope::AddModuleValue(const std::string& name,
                           std::shared_ptr<CtxValue> value) {
  module_value_map_.insert({name, value});
}

void Scope::SaveFunctionData(std::unique_ptr<hippy::napi::FunctionData> data) {
  function_data_.push_back(std::move(data));
}

void Scope::RunJS(const std::string&& js,
                  const std::string& name,
                  Encoding encodeing) {
  std::weak_ptr<Ctx> weak_context = context_;
  JavaScriptTask::Function callback = [js, name, encodeing,
                                       weak_context] {
    std::shared_ptr<Ctx> context = weak_context.lock();
    if (!context) {
      return;
    }
    context->RunScript(std::move(js), name, false, nullptr,
                       encodeing);
  };

  std::shared_ptr<JavaScriptTaskRunner> runner = engine_->GetJSRunner();
  if (runner->IsJsThread()) {
    callback();
  } else {
    std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
    task->callback = callback;
    runner->PostTask(task);
  }
}

void Scope::RunJS(const uint8_t* data,
                  size_t len,
                  const std::string& name) {
  std::weak_ptr<Ctx> weak_context = context_;
  JavaScriptTask::Function callback = [data, len, name,
                                       weak_context] {
    std::shared_ptr<Ctx> context = weak_context.lock();
    if (!context) {
      return;
    }
    context->RunScript(data, len, name, false, nullptr,
                       hippy::napi::ONE_BYTE_ENCODING);
  };

  std::shared_ptr<JavaScriptTaskRunner> runner = engine_->GetJSRunner();
  if (runner->IsJsThread()) {
    callback();
  } else {
    std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
    task->callback = callback;
    runner->PostTask(task);
  }
}

std::shared_ptr<CtxValue> Scope::RunJSSync(const uint8_t* data,
                                           size_t len,
                                           const std::string& name) {
  std::promise<std::shared_ptr<CtxValue>> promise;
  std::future<std::shared_ptr<CtxValue>> future = promise.get_future();
  std::weak_ptr<Ctx> weak_context = context_;
  JavaScriptTask::Function cb =
      hippy::base::MakeCopyable([data, len, name, weak_context,
                                 p = std::move(promise)]() mutable {
        std::shared_ptr<CtxValue> rst = nullptr;
        std::shared_ptr<Ctx> context = weak_context.lock();
        if (context) {
          rst = context->RunScript(data, len, name, false, nullptr,
                                   hippy::napi::ONE_BYTE_ENCODING);
        }
        p.set_value(rst);
      });

  std::shared_ptr<JavaScriptTaskRunner> runner = engine_->GetJSRunner();
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
