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

#include "driver/scope.h"

#include <future>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include "dom/dom_node.h"
#include "driver/base/js_convert_utils.h"
#include "driver/modules/module_register.h"
#include "driver/modules/animation_module.h"
#include "driver/modules/contextify_module.h"
#include "driver/modules/console_module.h"
#include "driver/modules/event_module.h"
#include "driver/modules/animation_frame_module.h"
#include "driver/modules/performance/performance_entry_module.h"
#include "driver/modules/performance/performance_frame_timing_module.h"
#include "driver/modules/performance/performance_mark_module.h"
#include "driver/modules/performance/performance_measure_module.h"
#include "driver/modules/performance/performance_module.h"
#include "driver/modules/performance/performance_navigation_timing_module.h"
#include "driver/modules/performance/performance_paint_timing_module.h"
#include "driver/modules/performance/performance_resource_timing_module.h"
#include "driver/modules/scene_builder_module.h"
#include "driver/modules/timer_module.h"
#include "driver/modules/ui_manager_module.h"
#include "driver/vm/native_source_code.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "footstone/task.h"
#include "footstone/task_runner.h"

#ifdef JS_V8
#include "driver/vm/v8/memory_module.h"
#include "driver/napi/v8/v8_ctx.h"
#include "driver/vm/v8/v8_vm.h"
#endif

#ifdef ENABLE_INSPECTOR
#include "devtools/devtools_data_source.h"
#endif

using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;

using RegisterMap = hippy::RegisterMap;
using RegisterFunction = hippy::RegisterFunction;
using ModuleClassMap = hippy::ModuleClassMap;
using CtxValue = hippy::CtxValue;
using DomEvent = hippy::DomEvent;
using DomNode = hippy::DomNode;
using FunctionWrapper = hippy::FunctionWrapper;

constexpr char kBootstrapJSName[] = "bootstrap.js";
constexpr char kDeallocFuncName[] = "HippyDealloc";
constexpr char kHippyName[] = "Hippy";
constexpr char kEventName[] = "Event";
constexpr char kLoadInstanceFuncName[] = "__loadInstance__";
constexpr char kUnloadInstanceFuncName[] = "__unloadInstance__";
constexpr char kPerformanceName[] = "performance";

#ifdef ENABLE_INSPECTOR
constexpr char kHippyModuleName[] = "name";
#endif
constexpr uint64_t kInvalidListenerId = hippy::dom::EventListenerInfo::kInvalidListenerId;

namespace hippy {
inline namespace driver {


static void InternalBindingCallback(hippy::napi::CallbackInfo& info, void* data) {
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
  auto context = scope->GetContext();
  string_view module_name;
  auto flag = context->GetValueString(info[0], &module_name);
  // FOOTSTONE_DCHECK(flag);
  if (!flag) {
    return;
  }
  auto u8_module_name = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(
      module_name, string_view::Encoding::Utf8).utf8_value());
  auto module_object = scope->GetModuleObject(u8_module_name);
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

// REGISTER_EXTERNAL_REFERENCES(InternalBindingCallback)

Scope::Scope(std::weak_ptr<Engine> engine,
             std::string name)
    : engine_(std::move(engine)),
      context_(nullptr),
      name_(std::move(name)),
      call_ui_function_callback_id_(0),
      performance_(std::make_shared<Performance>()) {}

Scope::~Scope() {
  FOOTSTONE_DLOG(INFO) << "~Scope";
#ifdef JS_JSC
/*
 * JSObjectFinalizeCallback will be called when you call JSContextGroupRelease, so it is necessary to hold the wrapper when ctx is destroyed.
 */
#else
  auto engine = engine_.lock();
  FOOTSTONE_DCHECK(engine);
  if (engine) {
    auto key = wrapper_.get();
    engine->ClearWeakCallbackWrapper(key);
    engine->ClearFunctionWrapper(key);
    engine->ClearClassTemplate(key);
  }
#endif
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
          auto global_object = context->GetGlobalObject();
          auto func_name = context->CreateString(kDeallocFuncName);
          auto fn = context->GetProperty(global_object, func_name);
          bool is_fn = context->IsFunction(fn);
          if (is_fn) {
            context->CallFunction(fn, context->GetGlobalObject(), 0, nullptr);
          }
        }
        p.set_value(rst);
      });
  auto runner =GetTaskRunner();
  if (footstone::Worker::IsTaskRunning() && runner == footstone::runner::TaskRunner::GetCurrentTaskRunner()) {
    cb();
  } else {
    runner->PostTask(std::move(cb));
  }

  future.get();
  FOOTSTONE_DLOG(INFO) << "ExitCtx end";
}

void Scope::SyncInitialize() {
  RegisterJavascriptClasses();
  BindModule();
  Bootstrap();
}

void Scope::CreateContext() {
  auto engine = engine_.lock();
  FOOTSTONE_CHECK(engine);
  context_ = engine->GetVM()->CreateContext();
  FOOTSTONE_CHECK(context_);
  wrapper_ = std::make_unique<ScopeWrapper>(weak_from_this());
  context_->SetExternalData(wrapper_.get());
}


void Scope::BindModule() {
  module_object_map_["ConsoleModule"] = std::make_shared<ConsoleModule>();
  module_object_map_["TimerModule"] = std::make_shared<TimerModule>();
  module_object_map_["ContextifyModule"] = std::make_shared<ContextifyModule>();
  module_object_map_["UIManagerModule"] = std::make_shared<UIManagerModule>();
  module_object_map_["AnimationFrameModule"] = std::make_shared<AnimationFrameModule>();
#ifdef JS_V8
  module_object_map_["MemoryModule"] = std::make_shared<MemoryModule>();
#endif
}

void Scope::Bootstrap() {
  FOOTSTONE_LOG(INFO) << "Bootstrap begin";
  auto source_code = hippy::GetNativeSourceCode(kBootstrapJSName);
  FOOTSTONE_DCHECK(source_code.data_ && source_code.length_);
  string_view str_view(source_code.data_, source_code.length_);
  auto function = context_->RunScript(str_view, kBootstrapJSName);
  auto is_func = context_->IsFunction(function);
  FOOTSTONE_CHECK(is_func) << "bootstrap return not function, len = " << source_code.length_;
  auto function_wrapper = std::make_unique<FunctionWrapper>(InternalBindingCallback, nullptr);
  std::shared_ptr<CtxValue> argv[] = { context_->CreateFunction(function_wrapper) };
  SaveFunctionWrapper(std::move(function_wrapper));
  context_->CallFunction(function, context_->GetGlobalObject(), 1, argv);
}

void Scope::RegisterJavascriptClasses() {
  auto weak_scope = weak_from_this();
  auto global_object = context_->GetGlobalObject();
  auto scene_builder = hippy::RegisterSceneBuilder(weak_scope);
  auto scene_builder_class = DefineClass(scene_builder);
  auto key = scene_builder->name;
  SaveClassTemplate(key, std::move(scene_builder));
  auto hippy_object = context_->GetProperty(global_object,
                                            context_->CreateString(kHippyName));
  context_->SetProperty(hippy_object,
                        context_->CreateString(key),
                        scene_builder_class,
                        PropertyAttribute::ReadOnly);
  auto animation = hippy::RegisterAnimation(weak_scope);
  auto animation_class = DefineClass(animation);
  key = animation->name;
  SaveClassTemplate(key, std::move(animation));
  context_->SetProperty(hippy_object,
                        context_->CreateString(key),
                        animation_class,
                        PropertyAttribute::ReadOnly);
  auto animation_set = hippy::RegisterAnimationSet(weak_scope);
  auto animation_set_class = DefineClass(animation_set);
  key = animation_set->name;
  SaveClassTemplate(key, std::move(animation_set));
  context_->SetProperty(hippy_object,
                        context_->CreateString(key),
                        animation_set_class,
                        PropertyAttribute::ReadOnly);

  auto event = hippy::MakeEventClassTemplate(weak_scope);
  auto event_class = DefineClass(event);
  key = event->name;
  SaveClassTemplate(key, std::move(event));
  SetJavascriptClass(key, event_class);

  auto performance = hippy::RegisterPerformance(weak_scope);
  auto performance_class = DefineClass(performance);
  key = performance->name;
  SaveClassTemplate(key, std::move(performance));
  SetJavascriptClass(key, performance_class);
  context_->SetProperty(global_object,
                        context_->CreateString(key),
                        performance_class,
                        PropertyAttribute::ReadOnly);
  auto performance_object = context_->NewInstance(performance_class, 0, nullptr, performance_.get());
  context_->SetProperty(global_object, context_->CreateString(kPerformanceName), performance_object);

  auto performance_entry = hippy::RegisterPerformanceEntry(weak_scope);
  auto performance_entry_properties = hippy::RegisterPerformanceEntryPropertyDefine<PerformanceEntry>(weak_scope);
  performance_entry->properties.insert(performance_entry->properties.end(),
                                       performance_entry_properties.begin(),
                                       performance_entry_properties.end());
  auto performance_entry_class = DefineClass(performance_entry);
  key = performance_entry->name;
  auto performance_entry_name = key;
  SaveClassTemplate(key, std::move(performance_entry));
  SetJavascriptClass(key, performance_entry_class);
  context_->SetProperty(global_object,
                        context_->CreateString(key),
                        performance_entry_class,
                        PropertyAttribute::ReadOnly);

  auto performance_mark = hippy::RegisterPerformanceMark(weak_scope);
  performance_mark->parent = context_->GetClassDefinition(performance_entry_name);
  auto performance_mark_class = DefineClass(performance_mark);
  key = performance_mark->name;
  SaveClassTemplate(key, std::move(performance_mark));
  SetJavascriptClass(key, performance_mark_class);
  context_->SetProperty(global_object,
                        context_->CreateString(key),
                        performance_mark_class,
                        PropertyAttribute::ReadOnly);

  auto performance_measure = hippy::RegisterPerformanceMeasure(weak_scope);
  performance_measure->parent = context_->GetClassDefinition(performance_entry_name);
  auto performance_measure_class = DefineClass(performance_measure);
  key = performance_measure->name;
  SaveClassTemplate(key, std::move(performance_measure));
  SetJavascriptClass(key, performance_measure_class);
  context_->SetProperty(global_object,
                        context_->CreateString(key),
                        performance_measure_class,
                        PropertyAttribute::ReadOnly);

  auto performance_resource_timing = hippy::RegisterPerformanceResourceTiming(weak_scope);
  performance_resource_timing->parent = context_->GetClassDefinition(performance_entry_name);
  auto performance_resource_timing_class = DefineClass(performance_resource_timing);
  key = performance_resource_timing->name;
  SaveClassTemplate(key, std::move(performance_resource_timing));
  SetJavascriptClass(key, performance_resource_timing_class);
  context_->SetProperty(global_object,
                        context_->CreateString(key),
                        performance_resource_timing_class,
                        PropertyAttribute::ReadOnly);

  auto performance_navigation_timing = hippy::RegisterPerformanceNavigationTiming(weak_scope);
  performance_navigation_timing->parent = context_->GetClassDefinition(performance_entry_name);
  auto performance_navigation_timing_class = DefineClass(performance_navigation_timing);
  key = performance_navigation_timing->name;
  SaveClassTemplate(key, std::move(performance_navigation_timing));
  SetJavascriptClass(key, performance_navigation_timing_class);
  context_->SetProperty(global_object,
                        context_->CreateString(key),
                        performance_navigation_timing_class,
                        PropertyAttribute::ReadOnly);

  auto performance_frame_timing = hippy::RegisterPerformanceFrameTiming(weak_scope);
  performance_frame_timing->parent = context_->GetClassDefinition(performance_entry_name);
  auto performance_frame_timing_class = DefineClass(performance_frame_timing);
  key = performance_frame_timing->name;
  SaveClassTemplate(key, std::move(performance_frame_timing));
  SetJavascriptClass(key, performance_frame_timing_class);
  context_->SetProperty(global_object,
                        context_->CreateString(key),
                        performance_frame_timing_class,
                        PropertyAttribute::ReadOnly);

  auto performance_paint_timing = hippy::RegisterPerformancePaintTiming(weak_scope);
  performance_paint_timing->parent = context_->GetClassDefinition(performance_entry_name);
  auto performance_paint_timing_class = DefineClass(performance_paint_timing);
  key = performance_paint_timing->name;
  SaveClassTemplate(key, std::move(performance_paint_timing));
  SetJavascriptClass(key, performance_paint_timing_class);
  context_->SetProperty(global_object,
                        context_->CreateString(key),
                        performance_paint_timing_class,
                        PropertyAttribute::ReadOnly);
}

hippy::dom::EventListenerInfo Scope::AddListener(const EventListenerInfo& event_listener_info) {
  uint32_t dom_id = event_listener_info.dom_id;
  const std::string& event_name = event_listener_info.event_name;
  const auto& js_function = event_listener_info.callback.lock();
  FOOTSTONE_DCHECK(js_function != nullptr);
  const bool added = HasListener(event_listener_info);
  if (added)  {
    return hippy::dom::EventListenerInfo{dom_id, event_name, event_listener_info.use_capture,
                                         kInvalidListenerId, nullptr};
  }
  uint64_t listener_id = hippy::dom::FetchListenerId();

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
  return hippy::dom::EventListenerInfo{dom_id, event_name, event_listener_info.use_capture, listener_id,
                                       [weak_scope = weak_from_this(), event_listener_info](
                                               const std::shared_ptr<hippy::dom::DomEvent>& event) {
    auto scope = weak_scope.lock();
    if (!scope) {
      return;
    }
    std::weak_ptr<Ctx> weak_context = scope->GetContext();
    auto context = weak_context.lock();
    if (context) {
      auto callback = event_listener_info.callback.lock();
      if (callback == nullptr) return;
      scope->SetCurrentEvent(std::make_any<std::shared_ptr<hippy::dom::DomEvent>>(event));
      auto event_class = scope->GetJavascriptClass(kEventName);
      auto event_instance = context->NewInstance(event_class, 0, nullptr, nullptr);
      FOOTSTONE_DCHECK(callback) << "callback is nullptr";
      if (!callback) {
        return;
      }
      auto flag = context->IsFunction(callback);
      if (!flag) {
        context->ThrowException(footstone::string_view("callback is not a function"));
        return;
      }
      std::shared_ptr<CtxValue> argv[] = { event_instance };
      context->CallFunction(callback, context->GetGlobalObject(), 1, argv);
    }
  }};
}

hippy::dom::EventListenerInfo Scope::RemoveListener(const EventListenerInfo& event_listener_info) {
  uint32_t dom_id = event_listener_info.dom_id;
  const std::string& event_name = event_listener_info.event_name;
  const auto& js_function = event_listener_info.callback.lock();
  FOOTSTONE_DCHECK(js_function != nullptr);

  hippy::dom::EventListenerInfo result{dom_id, event_name, event_listener_info.use_capture,
                                       kInvalidListenerId, nullptr};
  const uint64_t listener_id = GetListenerId(event_listener_info);
  if (listener_id == kInvalidListenerId) {
    return result;
  }

  // unbind dom event id and js function
  auto event_node_it = bind_listener_map_.find(dom_id);
  if (event_node_it == bind_listener_map_.end()) {
    return result;
  }
  auto event_name_it = bind_listener_map_[dom_id].find(event_name);
  if (event_name_it == bind_listener_map_[dom_id].end()) {
    return result;
  }
  bind_listener_map_[dom_id][event_name].erase(listener_id);
  result.listener_id = listener_id;
  return result;
}

bool Scope::HasListener(const EventListenerInfo& event_listener_info) {
  uint32_t dom_id = event_listener_info.dom_id;
  const std::string& event_name = event_listener_info.event_name;
  const auto& js_function = event_listener_info.callback.lock();
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
  const std::string& event_name = event_listener_info.event_name;
  const auto& js_function = event_listener_info.callback.lock();
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

void Scope::RunJS(const string_view& data,
                  const string_view& uri,
                  const string_view& name,
                  bool is_copy) {
  std::weak_ptr<Ctx> weak_context = context_;
  auto callback = [WEAK_THIS, data, uri, name, is_copy, weak_context] {
    DEFINE_AND_CHECK_SELF(Scope)
    // perfromance start time
    auto entry = self->GetPerformance()->PerformanceNavigation(kPerfNavigationHippyInit);
    entry->BundleInfoOfUrl(uri).execute_source_start_ = footstone::TimePoint::SystemNow();

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

    // perfromance end time
    entry->BundleInfoOfUrl(uri).execute_source_end_ = footstone::TimePoint::SystemNow();
  };

  auto runner = GetTaskRunner();
  if (footstone::Worker::IsTaskRunning() && runner == footstone::runner::TaskRunner::GetCurrentTaskRunner()) {
    callback();
  } else {
    runner->PostTask(std::move(callback));
  }
}

void Scope::LoadInstance(const std::shared_ptr<HippyValue>& value) {
  std::weak_ptr<Ctx> weak_context = context_;
#ifdef ENABLE_INSPECTOR
  std::weak_ptr<hippy::devtools::DevtoolsDataSource> weak_data_source = devtools_data_source_;
  auto cb = [WEAK_THIS, weak_context, value, weak_data_source]() mutable {
#else
  auto cb = [WEAK_THIS, weak_context, value]() mutable {
#endif
    DEFINE_AND_CHECK_SELF(Scope)
    // perfromance start time
    auto entry = self->GetPerformance()->PerformanceNavigation(kPerfNavigationHippyInit);
    entry->SetHippyRunApplicationStart(footstone::TimePoint::SystemNow());

    std::shared_ptr<Ctx> context = weak_context.lock();
    if (context) {
      auto global_object = context->GetGlobalObject();
      auto func_name = context->CreateString(kLoadInstanceFuncName);
      auto fn = context->GetProperty(global_object, func_name);
      bool is_fn = context->IsFunction(fn);
      FOOTSTONE_DCHECK(is_fn);
      if (is_fn) {
        auto param = hippy::CreateCtxValue(context, value);
#ifdef ENABLE_INSPECTOR
        std::shared_ptr<CtxValue> module_name_value = context->GetProperty(param, kHippyModuleName);
        auto devtools_data_source = weak_data_source.lock();
        if (module_name_value && devtools_data_source != nullptr) {
          string_view module_name;
          bool flag = context->GetValueString(module_name_value, &module_name);
          if (flag) {
            std::string u8_module_name = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(
                module_name, string_view::Encoding::Utf8).utf8_value());
            devtools_data_source->SetContextName(u8_module_name);
          } else {
            FOOTSTONE_DLOG(ERROR) << "module name get error. GetValueString return false";
          }
        }
#endif
        std::shared_ptr<CtxValue> argv[] = {param};
        context->CallFunction(fn, context->GetGlobalObject(), 1, argv);
      } else {
        context->ThrowException("Application entry not found");
      }
    }

    // perfromance end time
    entry->SetHippyRunApplicationEnd(footstone::TimePoint::SystemNow());
  };
  auto runner = GetTaskRunner();
  if (footstone::Worker::IsTaskRunning() && runner == footstone::runner::TaskRunner::GetCurrentTaskRunner()) {
    cb();
  } else {
    runner->PostTask(std::move(cb));
  }
}


void Scope::UnloadInstance(const std::shared_ptr<HippyValue>& value) {
    std::weak_ptr<Ctx> weak_context = context_;
        auto cb = [weak_context, value]() mutable {
        auto context = weak_context.lock();
        if (context) {
          auto global_object = context->GetGlobalObject();
          auto func_name = context->CreateString(kUnloadInstanceFuncName);
          auto fn = context->GetProperty(global_object, func_name);
          bool is_fn = context->IsFunction(fn);
          FOOTSTONE_DCHECK(is_fn);
          if (is_fn) {
              auto param = hippy::CreateCtxValue(context, value);
              std::shared_ptr<CtxValue> argv[] = {param};
              context->CallFunction(fn, context->GetGlobalObject(), 1, argv);
          } else {
              context->ThrowException("Application entry not found");
          }
        }
    };
    auto runner = GetTaskRunner();
    if (footstone::Worker::IsTaskRunning() && runner == footstone::runner::TaskRunner::GetCurrentTaskRunner()) {
        cb();
    } else {
        runner->PostTask(std::move(cb));
    }
}

void Scope::SetCallbackForUriLoader() {
  auto the_loader = loader_.lock();
  if (the_loader) {
    the_loader->SetRequestResultCallback([WEAK_THIS](const string_view& uri,
        const TimePoint& start, const TimePoint& end,
        const int32_t ret_code, const string_view& error_msg) {
      DEFINE_AND_CHECK_SELF(Scope)
      auto runner = self->GetTaskRunner();
      if (runner) {
        auto task = [weak_this, uri, start, end, ret_code, error_msg]() {
          DEFINE_AND_CHECK_SELF(Scope)
          auto entry = self->GetPerformance()->PerformanceResource(uri);
          if (entry) {
            entry->SetLoadSourceStart(start);
            entry->SetLoadSourceEnd(end);
          }
          if (ret_code != 0) {
            self->HandleUriLoaderError(uri, ret_code, error_msg);
          }
        };
        runner->PostTask(std::move(task));
      }
    });
  }
}

void Scope::HandleUriLoaderError(const string_view& uri, const int32_t ret_code, const string_view& error_msg) {
  std::unordered_map<string_view, std::shared_ptr<CtxValue>> error_map;
  error_map["code"] = context_->CreateNumber(static_cast<double>(ret_code));
  error_map["message"] = context_->CreateString(error_msg);
  auto event = context_->CreateString("vfs error");
  auto source = context_->CreateString(uri);
  auto lineno = context_->CreateNumber(0);
  auto colno = context_->CreateNumber(0);
  auto error = context_->CreateObject(error_map);
  std::shared_ptr<CtxValue> arr[5] = {event, source, lineno, colno, error};
  auto exception = context_->CreateArray(5, arr);
  VM::HandleException(context_, "error", exception);
}

}
}
