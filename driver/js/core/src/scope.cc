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

#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "footstone/task.h"
#include "footstone/task_runner.h"
#include "core/modules/module_register.h"
#include "core/napi/native_source_code.h"
#ifdef JS_V8
#include "core/napi/v8/js_native_api_v8.h"
#endif

using unicode_string_view = footstone::stringview::unicode_string_view;

using RegisterMap = hippy::base::RegisterMap;
using RegisterFunction = hippy::base::RegisterFunction;
using ModuleClassMap = hippy::napi::ModuleClassMap;
using CtxValue = hippy::napi::CtxValue;
using TryCatch = hippy::napi::TryCatch;

constexpr char kDeallocFuncName[] = "HippyDealloc";
constexpr char kLoadInstanceFuncName[] = "__loadInstance__";
constexpr char kHippyBootstrapJSName[] = "bootstrap.js";
#ifdef ENABLE_INSPECTOR
constexpr char kHippyModuleName[] = "name";
#endif
constexpr uint64_t kInvalidListenerId = 0;

Scope::Scope(Engine* engine, std::string name, std::unique_ptr<RegisterMap> map)
    : engine_(engine),
      context_(nullptr),
      name_(std::move(name)),
      map_(std::move(map)) {}

Scope::~Scope() {
  FOOTSTONE_DLOG(INFO) << "~Scope";
  engine_->Exit();
}

void Scope::WillExit() {
  FOOTSTONE_DLOG(INFO) << "WillExit begin";
  std::promise<std::shared_ptr<CtxValue>> promise;
  std::future<std::shared_ptr<CtxValue>> future = promise.get_future();
  std::weak_ptr<Ctx> weak_context = context_;
  auto cb = hippy::base::MakeCopyable(
      [weak_context, p = std::move(promise)]() mutable {
        FOOTSTONE_LOG(INFO) << "run js WillExit begin";
        std::shared_ptr<CtxValue> rst = nullptr;
        std::shared_ptr<Ctx> context = weak_context.lock();
        if (context) {
          std::shared_ptr<CtxValue> fn = context->GetJsFn(kDeallocFuncName);
          bool is_fn = context->IsFunction(fn);
          if (is_fn) {
            context->CallFunction(fn, 0, nullptr);
          }
        }
        p.set_value(rst);
      });
  auto runner = engine_->GetJsTaskRunner();
  if (footstone::Worker::IsTaskRunning() && runner == footstone::runner::TaskRunner::GetCurrentTaskRunner()) {
    cb();
  } else {
    runner->PostTask(std::move(cb));
  }

  future.get();
  FOOTSTONE_DLOG(INFO) << "ExitCtx end";
}

void Scope::Initialized() {
  FOOTSTONE_DLOG(INFO) << "Scope Initialized";
  engine_->Enter();
  context_ = engine_->GetVM()->CreateContext();
  if (context_ == nullptr) {
    FOOTSTONE_DLOG(ERROR) << "CreateContext return nullptr";
    return;
  }
  std::shared_ptr<Scope> self = wrapper_->scope_.lock();
  if (!self) {
    FOOTSTONE_DLOG(ERROR) << "Scope wrapper_ error_";
    return;
  }
  RegisterMap::const_iterator it =
      map_->find(hippy::base::kContextCreatedCBKey);
  if (it != map_->end()) {
    RegisterFunction f = it->second;
    if (f) {
      FOOTSTONE_DLOG(INFO) << "run ContextCreatedCB begin";
      f(wrapper_.get());
      FOOTSTONE_DLOG(INFO) << "run ContextCreatedCB end";
      map_->erase(it);
    }
  }
  FOOTSTONE_DLOG(INFO) << "Scope RegisterGlobalInJs";
  context_->RegisterGlobalModule(self,
                                 ModuleRegister::instance()->GetGlobalList());
  ModuleClassMap map(ModuleRegister::instance()->GetInternalList());
  binding_data_ = std::make_unique<BindingData>(self, map);

  auto source_code = hippy::GetNativeSourceCode(kHippyBootstrapJSName);
  FOOTSTONE_DCHECK(source_code.data_ && source_code.length_);
  unicode_string_view str_view(source_code.data_, source_code.length_);
  std::shared_ptr<CtxValue> function =
      context_->RunScript(str_view, kHippyBootstrapJSName);

  bool is_func = context_->IsFunction(function);
  FOOTSTONE_CHECK(is_func) << "bootstrap return not function, len = "
                          << source_code.length_;
  // TODO(super): The following statement will be removed when FOOTSTONE_CHECK
  // will be cause abort
  if (!is_func) {
    return;
  }

  std::shared_ptr<CtxValue> internal_binding_fn =
      hippy::napi::GetInternalBindingFn(self);
  std::shared_ptr<CtxValue> argv[] = {internal_binding_fn};
  context_->CallFunction(function, 1, argv);

  it = map_->find(hippy::base::KScopeInitializedCBKey);
  if (it != map_->end()) {
    RegisterFunction f = it->second;
    if (f) {
      FOOTSTONE_DLOG(INFO) << "run SCOPE_INITIALIZED begin";
      f(wrapper_.get());
      FOOTSTONE_DLOG(INFO) << "run SCOPE_INITIALIZED end";
      map_->erase(it);
    }
  }
}

ModuleBase* Scope::GetModuleClass(const unicode_string_view& moduleName) {
  auto it = module_class_map_.find(moduleName);
  return it != module_class_map_.end() ? it->second.get() : nullptr;
}

void Scope::AddModuleClass(const unicode_string_view& name,
                           std::unique_ptr<ModuleBase> module) {
  module_class_map_.insert({name, std::move(module)});
}

std::shared_ptr<hippy::napi::CtxValue> Scope::GetModuleValue(
    const unicode_string_view& module_name) {
  auto it = module_value_map_.find(module_name);
  return it != module_value_map_.end() ? it->second : nullptr;
}

void Scope::AddModuleValue(const unicode_string_view& name,
                           const std::shared_ptr<CtxValue>& value) {
  module_value_map_.insert({name, value});
}

void Scope::SaveFunctionData(std::unique_ptr<hippy::napi::FunctionData> data) {
  function_data_.push_back(std::move(data));
}

void Scope::AddListener(const EventListenerInfo& event_listener_info,
                        const uint64_t listener_id) {
  uint32_t dom_id = event_listener_info.dom_id;
  std::string event_name = event_listener_info.event_name;
  const auto& js_function = event_listener_info.callback;
  FOOTSTONE_DCHECK(js_function != nullptr);

  // bind dom event id and js function
  auto event_node_it = bind_listener_map_.find(dom_id);
  if (event_node_it == bind_listener_map_.end()) {
    bind_listener_map_[dom_id] = std::unordered_map<
        std::string, std::unordered_map<uint64_t, std::shared_ptr<CtxValue>>>();
  }
  auto event_name_it = bind_listener_map_[dom_id].find(event_name);
  if (event_name_it == bind_listener_map_[dom_id].end()) {
    bind_listener_map_[dom_id][event_name] =
        std::unordered_map<uint64_t, std::shared_ptr<CtxValue>>();
  }

  bind_listener_map_[dom_id][event_name][listener_id] = js_function;
}

void Scope::RemoveListener(const EventListenerInfo& event_listener_info,
                           const uint64_t listener_id) {
  uint32_t dom_id = event_listener_info.dom_id;
  std::string event_name = event_listener_info.event_name;
  const auto& js_function = event_listener_info.callback;
  FOOTSTONE_DCHECK(js_function != nullptr);

  // unbind dom event id and js function
  auto event_node_it = bind_listener_map_.find(dom_id);
  if (event_node_it == bind_listener_map_.end()) {
    return;
  }
  auto event_name_it = bind_listener_map_[dom_id].find(event_name);
  if (event_name_it == bind_listener_map_[dom_id].end()) {
    return;
  }
  bind_listener_map_[dom_id][event_name].erase(listener_id);
}

bool Scope::HasListener(const EventListenerInfo& event_listener_info) {
  uint32_t dom_id = event_listener_info.dom_id;
  std::string event_name = event_listener_info.event_name;
  const auto& js_function = event_listener_info.callback;
  FOOTSTONE_DCHECK(js_function != nullptr);

  auto id_it = bind_listener_map_.find(dom_id);
  if (id_it == bind_listener_map_.end()) {
    return false;
  }
  auto name_it = id_it->second.find(event_name);
  if (name_it == id_it->second.end()) {
    return false;
  }

  for (const auto& v : name_it->second) {
    FOOTSTONE_DCHECK(v.second != nullptr);
    if (v.second != nullptr) {
      bool ret = context_->Equals(v.second, js_function);
      if (ret)
        return true;
    }
  }

  return false;
}

uint64_t Scope::GetListenerId(const EventListenerInfo& event_listener_info) {
  uint32_t dom_id = event_listener_info.dom_id;
  std::string event_name = event_listener_info.event_name;
  const auto& js_function = event_listener_info.callback;
  FOOTSTONE_DCHECK(js_function != nullptr);

  auto event_node_it = bind_listener_map_.find(dom_id);
  if (event_node_it == bind_listener_map_.end()) {
    return kInvalidListenerId;
  }
  auto event_name_it = bind_listener_map_[dom_id].find(event_name);
  if (event_name_it == bind_listener_map_[dom_id].end()) {
    return kInvalidListenerId;
  }
  for (const auto& v : bind_listener_map_[dom_id][event_name]) {
    FOOTSTONE_DCHECK(v.second != nullptr);
    if (v.second != nullptr) {
      bool ret = context_->Equals(v.second, js_function);
      if (ret)
        return v.first;
    }
  }
  return kInvalidListenerId;
}

void Scope::RunJS(const unicode_string_view& data,
                  const unicode_string_view& name,
                  bool is_copy) {
  std::weak_ptr<Ctx> weak_context = context_;
  auto callback = [data, name, is_copy, weak_context] {
#ifdef JS_V8
    auto context =
        std::static_pointer_cast<hippy::napi::V8Ctx>(weak_context.lock());
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

  auto runner = engine_->GetJsTaskRunner();
  if (footstone::Worker::IsTaskRunning() && runner == footstone::runner::TaskRunner::GetCurrentTaskRunner()) {
    callback();
  } else {
    runner->PostTask(std::move(callback));
  }
}

std::shared_ptr<CtxValue> Scope::RunJSSync(const unicode_string_view& data,
                                           const unicode_string_view& name,
                                           bool is_copy) {
  std::promise<std::shared_ptr<CtxValue>> promise;
  std::future<std::shared_ptr<CtxValue>> future = promise.get_future();
  std::weak_ptr<Ctx> weak_context = context_;
  auto cb = hippy::base::MakeCopyable(
      [data, name, is_copy, weak_context, p = std::move(promise)]() mutable {
        std::shared_ptr<CtxValue> rst = nullptr;
#ifdef JS_V8
        auto context =
            std::static_pointer_cast<hippy::napi::V8Ctx>(weak_context.lock());
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

  auto runner = engine_->GetJsTaskRunner();
  if (footstone::Worker::IsTaskRunning() && runner == footstone::runner::TaskRunner::GetCurrentTaskRunner()) {
    cb();
  } else {
    runner->PostTask(std::move(cb));
  }
  std::shared_ptr<CtxValue> ret = future.get();
  return ret;
}

void Scope::LoadInstance(const std::shared_ptr<HippyValue>& value) {
  std::weak_ptr<Ctx> weak_context = context_;
#ifdef ENABLE_INSPECTOR
  std::weak_ptr<hippy::devtools::DevtoolsDataSource> weak_data_source = devtools_data_source_;
  auto cb = [weak_context, value, weak_data_source]() mutable {
#else
  auto cb = [weak_context, value]() mutable {
#endif
    std::shared_ptr<Ctx> context = weak_context.lock();
    if (context) {
      std::shared_ptr<CtxValue> fn = context->GetJsFn(kLoadInstanceFuncName);
      bool is_fn = context->IsFunction(fn);
      FOOTSTONE_DCHECK(is_fn);
      if (is_fn) {
        auto param = context->CreateCtxValue(value);
#ifdef ENABLE_INSPECTOR
        std::shared_ptr<CtxValue> module_name_value = context->GetProperty(param, kHippyModuleName);
        auto devtools_data_source = weak_data_source.lock();
        if (module_name_value && devtools_data_source != nullptr) {
          unicode_string_view module_name;
          bool flag = context->GetValueString(module_name_value, &module_name);
          if (flag) {
            std::string u8_module_name = hippy::base::StringViewUtils::ToU8StdStr(module_name);
            devtools_data_source->SetContextName(u8_module_name);
          } else {
            FOOTSTONE_DLOG(ERROR) << "module name get error. GetValueString return false";
          }
        }
#endif
        std::shared_ptr<CtxValue> argv[] = {param};
        context->CallFunction(fn, 1, argv);
      } else {
        context->ThrowException("Application entry not found");
      }
    }
  };
  auto runner = engine_->GetJsTaskRunner();
  if (footstone::Worker::IsTaskRunning() && runner == footstone::runner::TaskRunner::GetCurrentTaskRunner()) {
    cb();
  } else {
    runner->PostTask(std::move(cb));
  }
}
