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
#include "driver/napi/js_native_api.h"
#include "driver/napi/js_native_api_types.h"
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
  explicit ScopeWrapper(std::shared_ptr<Scope> scope) : scope_(scope) {}

 public:
  std::weak_ptr<Scope> scope_;
};

class Scope : public std::enable_shared_from_this<Scope> {
 public:
  using string_view = footstone::stringview::string_view;
  using RegisterMap = hippy::base::RegisterMap;
  using CtxValue = hippy::napi::CtxValue;
  using Ctx = hippy::napi::Ctx;
  using DomManager = hippy::dom::DomManager;
  using HippyValue = footstone::value::HippyValue;
  using RenderManager = hippy::dom::RenderManager;
  using RootNode = hippy::dom::RootNode;
  using FunctionData = hippy::napi::FunctionData;
  using BindingData = hippy::napi::BindingData;
  using Encoding = hippy::napi::Encoding;
  using TaskRunner = footstone::runner::TaskRunner;
  using Task = footstone::Task;
  template <typename T>
  using InstanceDefine = hippy::napi::InstanceDefine<T>;

  struct EventListenerInfo {
    uint32_t dom_id;
    std::string event_name;
    std::weak_ptr<hippy::napi::CtxValue> callback;
    bool use_capture;
  };

  Scope(Engine* engine, std::string name, std::unique_ptr<RegisterMap> map);
  ~Scope();

  void WillExit();
  inline std::shared_ptr<Ctx> GetContext() { return context_; }
  inline std::unique_ptr<RegisterMap>& GetRegisterMap() { return map_; }

  ModuleBase* GetModuleClass(const string_view& moduleName);
  void AddModuleClass(const string_view& name,
                      std::unique_ptr<ModuleBase> module);
  std::shared_ptr<CtxValue> GetModuleValue(
      const string_view& module_name);
  void AddModuleValue(const string_view& name,
                      const std::shared_ptr<CtxValue>& value);

  void SaveFunctionData(std::unique_ptr<FunctionData> data);

  inline void SaveSceneBuildClassInstance(
      std::shared_ptr<InstanceDefine<hippy::SceneBuilder>> instance) {
    scene_build_holder_ = instance;
  }

  inline void SaveDomEventClassInstance(
      std::shared_ptr<InstanceDefine<hippy::DomEvent>> instance) {
    dom_event_holder_ = instance;
  }

  inline std::shared_ptr<InstanceDefine<hippy::DomEvent>> GetDomEventClassInstance() {
    return dom_event_holder_;
  }

  inline void SaveHippyAnimationClassInstance(
      std::shared_ptr<InstanceDefine<hippy::CubicBezierAnimation>> instance) {
    animation_holder_ = instance;
  }

  inline void SaveHippyAnimationSetClassInstance(
      std::shared_ptr<InstanceDefine<hippy::AnimationSet>> instance) {
    animation_set_holder_ = instance;
  }

  inline void SaveBindingData(std::unique_ptr<BindingData> data) {
    binding_data_ = std::move(data);
  }

  inline const std::unique_ptr<BindingData>& GetBindingData() {
    return binding_data_;
  }

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

  inline std::shared_ptr<TaskRunner> GetTaskRunner() {
    return engine_->GetJsTaskRunner();
  }

  inline std::shared_ptr<TaskRunner> GetWorkerTaskRunner() {
    return engine_->GetWorkerTaskRunner();
  }

  inline void AddTask(std::unique_ptr<Task> task) {
    std::shared_ptr<TaskRunner> runner = engine_->GetJsTaskRunner();
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

#ifdef ENABLE_INSPECTOR
  inline void SetDevtoolsDataSource(std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source) {
    devtools_data_source_ = devtools_data_source;
  }
  inline std::shared_ptr<hippy::devtools::DevtoolsDataSource> GetDevtoolsDataSource() {
    return devtools_data_source_;
  }
#endif

 private:
  friend class Engine;
  void Initialized();

 private:
  Engine* engine_;
  std::shared_ptr<Ctx> context_;
  std::string name_;
  std::unique_ptr<RegisterMap> map_;
  std::unordered_map<string_view, std::shared_ptr<CtxValue>>
      module_value_map_;
  std::unordered_map<string_view, std::unique_ptr<ModuleBase>>
      module_class_map_;
  std::unordered_map<uint32_t, std::unordered_map<std::string, std::unordered_map<uint64_t, std::shared_ptr<CtxValue>>>>
      bind_listener_map_; // bind js function and dom event listener id
  std::vector<std::unique_ptr<FunctionData>> function_data_;
  std::shared_ptr<InstanceDefine<hippy::SceneBuilder>> scene_build_holder_;
  std::shared_ptr<InstanceDefine<hippy::DomEvent>> dom_event_holder_;
  std::shared_ptr<InstanceDefine<hippy::CubicBezierAnimation>> animation_holder_;
  std::shared_ptr<InstanceDefine<hippy::AnimationSet>> animation_set_holder_;
  std::unique_ptr<BindingData> binding_data_;
  std::unique_ptr<ScopeWrapper> wrapper_;
  std::weak_ptr<UriLoader> loader_;
  std::weak_ptr<DomManager> dom_manager_;
  std::weak_ptr<RenderManager> render_manager_;
  std::weak_ptr<RootNode> root_node_;
#ifdef ENABLE_INSPECTOR
  std::shared_ptr<hippy::devtools::DevtoolsDataSource> devtools_data_source_;
#endif
};

}
}
