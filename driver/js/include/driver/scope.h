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

#pragma once

#include <string>
#include <unordered_map>

#include "dom/animation/animation_manager.h"
#include "dom/animation/cubic_bezier_animation.h"
#include "dom/animation/animation_set.h"
#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#include "dom/render_manager.h"
#include "dom/root_node.h"
#include "dom/scene_builder.h"
#include "driver/base/common.h"
#include "driver/engine.h"
#include "driver/napi/js_ctx.h"
#include "driver/napi/js_ctx_value.h"
#include "footstone/hippy_value.h"
#include "footstone/task.h"
#include "footstone/string_view.h"
#include "vfs/uri_loader.h"

namespace hippy {
namespace devtools {
class DevtoolsDataSource;
}
inline namespace driver {

inline namespace module {
class ModuleBase;
}

class Scope;

class ScopeWrapper {
 public:
  explicit ScopeWrapper(std::shared_ptr<Scope> scope) : scope(scope) {}

 public:
  std::weak_ptr<Scope> scope;
};

template<typename T>
using GetterCallback = std::function<std::shared_ptr<CtxValue>(T* thiz)>;

template<typename T>
using SetterCallback = std::function<void(T* thiz, const std::shared_ptr<CtxValue>& value)>;

template<typename T>
using FunctionCallback = std::function<std::shared_ptr<CtxValue>(
    T* thiz,
    size_t argument_count,
    const std::shared_ptr<CtxValue> arguments[])>;


template<typename T>
using Constructor = std::function<std::shared_ptr<T>(size_t argument_count,
                                                     const std::shared_ptr<CtxValue> arguments[])>;

template<typename T>
struct PropertyDefine {
  using string_view = footstone::stringview::string_view;

  GetterCallback<T> getter;
  SetterCallback<T> setter;
  string_view name;
};

template<typename T>
struct FunctionDefine {
  using string_view = footstone::stringview::string_view;

  FunctionCallback<T> cb;
  string_view name;
};

template<typename T>
struct ClassTemplate {
  using string_view = footstone::stringview::string_view;

  Constructor<T> constructor;
  std::vector<PropertyDefine<T>> properties{};
  std::vector<FunctionDefine<T>> functions{};
  std::vector<std::shared_ptr<PropertyDescriptor>> descriptor_holder{};
  std::unique_ptr<FunctionWrapper> constructor_wrapper = nullptr;
  string_view name;
  size_t size = SIZE_OF<T>;
  std::unordered_map<void*, std::shared_ptr<T>> holder_map;
};

class Scope : public std::enable_shared_from_this<Scope> {
 public:
  using string_view = footstone::stringview::string_view;
  using RegisterMap = hippy::base::RegisterMap;
  using CtxValue = hippy::napi::CtxValue;
  using Ctx = hippy::napi::Ctx;
  using DomManager = hippy::dom::DomManager;
  using FunctionWrapper = hippy::FunctionWrapper;
  using WeakCallbackWrapper = hippy::WeakCallbackWrapper;
  using HippyValue = footstone::value::HippyValue;
  using RenderManager = hippy::dom::RenderManager;
  using RootNode = hippy::dom::RootNode;
  using Encoding = hippy::napi::Encoding;
  using TaskRunner = footstone::runner::TaskRunner;
  using Task = footstone::Task;

  struct EventListenerInfo {
    uint32_t dom_id;
    std::string event_name;
    std::weak_ptr<hippy::napi::CtxValue> callback;
    bool use_capture;
  };

  Scope(std::weak_ptr<Engine> engine,
        std::string name,
        std::unique_ptr<RegisterMap> map);
  ~Scope();

  void WillExit();
  inline std::shared_ptr<Ctx> GetContext() { return context_; }
  inline std::unique_ptr<RegisterMap>& GetRegisterMap() { return map_; }
  inline std::weak_ptr<Engine> GetEngine() { return engine_; }

  inline std::any GetClassTemplate(const string_view& name) {
    auto engine = engine_.lock();
    FOOTSTONE_CHECK(engine);
    return engine->GetClassTemplate(wrapper_.get(), name);
  }

  inline bool HasClassTemplate(const string_view& name) {
    auto engine = engine_.lock();
    FOOTSTONE_CHECK(engine);
    return engine->HasClassTemplate(wrapper_.get(), name);
  }

  inline void SaveClassTemplate(const string_view& name, std::any&& class_template) {
    auto engine = engine_.lock();
    FOOTSTONE_CHECK(engine);
    engine->SaveClassTemplate(wrapper_.get(), name, std::move(class_template));
  }

  inline void SaveFunctionWrapper(std::unique_ptr<FunctionWrapper> wrapper) {
    auto engine = engine_.lock();
    FOOTSTONE_CHECK(engine);
    engine->SaveFunctionWrapper(wrapper_.get(), std::move(wrapper));
  }

  inline void SaveWeakCallbackWrapper(std::unique_ptr<WeakCallbackWrapper> wrapper) {
    auto engine = engine_.lock();
    FOOTSTONE_CHECK(engine);
    engine->SaveWeakCallbackWrapper(wrapper_.get(), std::move(wrapper));
  }

  inline std::shared_ptr<ModuleBase> GetModuleObject(const std::string& module_name) {
    return module_object_map_[module_name];
  }

  inline std::shared_ptr<TaskRunner> GetTaskRunner() {
    FOOTSTONE_CHECK(engine_.lock());
    return engine_.lock()->GetJsTaskRunner();
  }
  inline bool HasTurboInstance(const std::string& name) {
    return turbo_instance_map_.find(name) != turbo_instance_map_.end();
  }

  inline std::shared_ptr<CtxValue> GetTurboInstance(const std::string& name) {
    return turbo_instance_map_[name];
  }

  inline void SetTurboInstance(const std::string& name, const std::shared_ptr<CtxValue>& instance) {
    turbo_instance_map_[name] = instance;
  }

  inline std::any GetTurboHostObject(const std::string& name) {
    return turbo_host_object_map_[name];
  }

  inline void SetTurboHostObject(const std::string& name, const std::any& host_object) {
    turbo_host_object_map_[name] = host_object;
  }

  inline std::shared_ptr<CtxValue> GetEventClass() {
    return event_class_;
  }

  inline void SaveEventClass(std::shared_ptr<CtxValue> event_class) {
    event_class_ = event_class;
  }

  void* GetScopeWrapperPointer();

  hippy::dom::EventListenerInfo AddListener(const EventListenerInfo& event_listener_info);
  hippy::dom::EventListenerInfo RemoveListener(const EventListenerInfo& event_listener_info);
  bool HasListener(const EventListenerInfo& event_listener_info);
  uint64_t GetListenerId(const EventListenerInfo& event_listener_info);

  void RunJS(const string_view& js,
             const string_view& name,
             bool is_copy = true);

  std::shared_ptr<CtxValue> RunJSSync(const string_view& data,
                                      const string_view& name,
                                      bool is_copy = true);

  void LoadInstance(const std::shared_ptr<HippyValue>& value);
  void UnloadInstance(const std::shared_ptr<HippyValue>& value);

  inline void AddTask(std::unique_ptr<Task> task) {
    auto runner = GetTaskRunner();
    if (runner) {
      runner->PostTask(std::move(task));
    }
  }

  inline void SetUriLoader(std::weak_ptr<UriLoader> loader) {
    loader_ = loader;
  }

  inline std::weak_ptr<UriLoader> GetUriLoader() { return loader_; }

  inline void SetDomManager(std::shared_ptr<DomManager> dom_manager) {
    dom_manager_ = dom_manager;
  }

  inline std::weak_ptr<DomManager> GetDomManager() { return dom_manager_; }

  inline void SetRenderManager(std::shared_ptr<RenderManager> render_manager) {
    render_manager_ = render_manager;
  }

  inline std::weak_ptr<RenderManager> GetRenderManager() {
    return render_manager_;
  }

  inline std::weak_ptr<RootNode> GetRootNode() {
    return root_node_;
  }

  inline void SetRootNode(std::weak_ptr<RootNode> root_node) {
    root_node_ = root_node;
  }

  inline void AddWillExitCallback(std::function<void()> cb) { // cb will run in the js thread
    will_exit_cbs_.push_back(cb);
  }

#ifdef ENABLE_INSPECTOR
  inline void SetDevtoolsDataSource(std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source) {
    devtools_data_source_ = devtools_data_source;
  }
  inline std::shared_ptr<hippy::devtools::DevtoolsDataSource> GetDevtoolsDataSource() {
    return devtools_data_source_;
  }
#endif

  void RegisterJsClasses();

  template<typename T>
  std::shared_ptr<CtxValue> DefineClass(const std::shared_ptr<ClassTemplate<T>>& class_template) {
    class_template->constructor_wrapper = std::make_unique<FunctionWrapper>([](CallbackInfo& info, void* data) {
      auto class_template = reinterpret_cast<ClassTemplate<T>*>(data);
      auto len = info.Length();
      std::shared_ptr<CtxValue> argv[len];
      for (size_t i = 0; i < len; i++) {
        argv[i] = info[i];
      }
      auto receiver = info.GetReceiver();
      std::shared_ptr<T> ret = class_template->constructor(static_cast<size_t>(len), argv);
      info.SetData(ret.get());
      class_template->holder_map.insert({ret.get(), ret});

      auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
      auto scope = scope_wrapper->scope.lock();
      FOOTSTONE_CHECK(scope);
      auto context = scope->GetContext();
      FOOTSTONE_CHECK(context);
      auto weak_callback_wrapper = std::make_unique<WeakCallbackWrapper>([](void* callback_data, void* internal_data) {
        auto class_template = reinterpret_cast<ClassTemplate<T>*>(callback_data);
        auto holder_map = class_template->holder_map;
        auto it = holder_map.find(internal_data);
        if (it != holder_map.end()) {
          holder_map.erase(it);
        }
      }, class_template);
      context->SetWeak(receiver, weak_callback_wrapper);
      scope->SaveWeakCallbackWrapper(std::move(weak_callback_wrapper));
      info.GetReturnValue()->Set(receiver);
    }, class_template.get());
    std::vector<std::shared_ptr<PropertyDescriptor>> properties;
    for (size_t i = 0; i < class_template->properties.size(); ++i) {
      std::unique_ptr<FunctionWrapper> getter = nullptr;
      if (class_template->properties[i].getter) {
        auto property_getter_pointer = &class_template->properties[i].getter;
        getter = std::make_unique<FunctionWrapper>([](CallbackInfo& info, void* data) {
          auto getter_callback = reinterpret_cast<GetterCallback<T>*>(data);
          info.GetReturnValue()->Set((*getter_callback)(reinterpret_cast<T*>(info.GetData())));
        }, property_getter_pointer);
      }
      std::unique_ptr<FunctionWrapper> setter = nullptr;
      if (class_template->properties[i].setter) {
        auto property_setter_pointer = &class_template->properties[i].setter;
        setter = std::make_unique<FunctionWrapper>([](CallbackInfo& info, void* data) {
          auto setter_callback = reinterpret_cast<SetterCallback<T>*>(data);
          //TODO info[0]
          (*setter_callback)(reinterpret_cast<T*>(info.GetData()), info[0]);
        }, property_setter_pointer);
      }
      properties.push_back(std::make_shared<PropertyDescriptor>(context_->CreateString(class_template->properties[i].name),
                                                                nullptr,
                                                                std::move(getter),
                                                                std::move(setter),
                                                                nullptr,
                                                                PropertyAttribute::None,
                                                                nullptr));
    }
    for (size_t i = 0; i < class_template->functions.size(); ++i) {
      //todo(polly) why &
      auto function_define_pointer = &class_template->functions[i];
      auto function = std::make_unique<FunctionWrapper>([](CallbackInfo& info, void* data) {
        auto function_define = reinterpret_cast<FunctionDefine<T>*>(data);
        auto len = info.Length();
        std::shared_ptr<CtxValue> param[len];
        for (size_t i = 0; i < len; i++) {
          param[i] = info[i];
        }
        auto t = reinterpret_cast<T*>(info.GetData());
        auto ret = (function_define->cb)(t, static_cast<size_t>(len), param);
        info.GetReturnValue()->Set(ret);
      }, function_define_pointer);
      properties.push_back(std::make_shared<PropertyDescriptor>(context_->CreateString(function_define_pointer->name),
                                                                std::move(function),
                                                                nullptr,
                                                                nullptr,
                                                                nullptr,
                                                                PropertyAttribute::None,
                                                                nullptr));
    }
    class_template->descriptor_holder = properties;
    return context_->DefineClass(class_template->name,class_template->constructor_wrapper,
                                 properties.size(), properties.data());
  }

 private:
  friend class Engine;
  void Init();
  void CreateContext();
  void BindModule();
  void Bootstrap();
  void InvokeCallback();

 private:
  std::weak_ptr<Engine> engine_;
  std::shared_ptr<Ctx> context_;
  std::string name_;
  std::unique_ptr<RegisterMap> map_;
  std::unordered_map<uint32_t, std::unordered_map<std::string, std::unordered_map<uint64_t, std::shared_ptr<CtxValue>>>>
      bind_listener_map_; // bind js function and dom event listener id
  std::unique_ptr<ScopeWrapper> wrapper_;
  std::weak_ptr<UriLoader> loader_;
  std::weak_ptr<DomManager> dom_manager_;
  std::weak_ptr<RenderManager> render_manager_;
  std::weak_ptr<RootNode> root_node_;
  std::unordered_map<std::string, std::shared_ptr<ModuleBase>> module_object_map_;
  std::shared_ptr<CtxValue> event_class_;
  std::unordered_map<std::string, std::shared_ptr<CtxValue>> turbo_instance_map_;
  std::unordered_map<std::string, std::any> turbo_host_object_map_;
  std::vector<std::function<void()>> will_exit_cbs_;
#ifdef ENABLE_INSPECTOR
  std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source_;
#endif
};

}
}
