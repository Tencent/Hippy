/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
#pragma once

#include <memory>
#include <string>

#include "api/devtools_backend_service.h"
#include "api/devtools_config.h"
#include "devtools/adapter/hippy_vm_request_adapter.h"
#include "devtools/devtools_data_source.h"
#include "devtools/hippy_dom_data.h"
#include "dom/root_node.h"
#include "footstone/task_runner.h"

#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
#include "v8/libplatform/v8-tracing.h"
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wconversion"
#include "v8/v8-inspector.h"
#pragma clang diagnostic pop
#endif

namespace hippy::devtools {
/**
 * @brief devtools data source, collect debug data by adapter implement and notification
 */
class DevtoolsDataSource : public std::enable_shared_from_this<hippy::devtools::DevtoolsDataSource> {
 public:
  DevtoolsDataSource() = default;
  ~DevtoolsDataSource() = default;
  /**
   * create devtools service
   * @param ws_url websocket url, if empty then use other tunnel
   * @param worker_manager worker thread for devtools
   */
  void CreateDevtoolsService(const std::string& ws_url, std::shared_ptr<footstone::WorkerManager> worker_manager);
  /**
   * @brief bind dom, so that devtools can access and collect data
   */
  void Bind(const std::weak_ptr<DomManager>& dom_manager);
  /**
   * @brief destroy devtools, need notify is_reload
   * @param is_reload create a new instance or just reload bundle, if true, the devtools frontend will reuse and not
   * close
   */
  void Destroy(bool is_reload);
  /**
   * @brief set context name when load bundle. devtools create earlier in engine create and then load bundle, it can't
   * obtain context name.
   * @param context_name current context name
   */
  void SetContextName(const std::string& context_name);
  /**
   * @brief set root node for listening the update event of dom tree
   */
  void SetRootNode(const std::weak_ptr<RootNode>& weak_root_node);
  /**
   * @brief set handler and receive message for vm engine
   */
  void SetVmRequestHandler(HippyVmRequestAdapter::VmRequestHandler request_handler);
  /**
   * @brief get devtools notification center, then can notify events to devtools frontend
   */
  inline std::shared_ptr<NotificationCenter> GetNotificationCenter() {
    return devtools_service_->GetNotificationCenter();
  }
  /**
   * @brief get devtools data provider, then can set adapter implement by your data source
   */
  inline std::shared_ptr<DataProvider> GetDataProvider() { return devtools_service_->GetDataProvider(); }

  /**
   * manage devtools_data_source instance by global data map
   */
  static uint32_t Insert(const std::shared_ptr<DevtoolsDataSource>& devtools_data_source);
  static std::shared_ptr<DevtoolsDataSource> Find(uint32_t id);
  static bool Erase(uint32_t id);
  static void SetFileCacheDir(const std::string& file_dir);

#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  void SendVmResponse(std::unique_ptr<v8_inspector::StringBuffer> message);
  void SendVmNotification(std::unique_ptr<v8_inspector::StringBuffer> message);
  static void OnGlobalTracingControlGenerate(v8::platform::tracing::TracingController* tracingControl);
#endif

 private:
  void AddRootNodeListener(const std::weak_ptr<RootNode>& weak_root_node);
  void RemoveRootNodeListener(const std::weak_ptr<RootNode>& weak_root_node);
#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  void SendVmData(v8_inspector::StringView string_view);
#endif

  std::shared_ptr<HippyDomData> hippy_dom_;
  uint64_t listener_id_{};
  std::shared_ptr<hippy::devtools::DevtoolsBackendService> devtools_service_;
  std::string context_name_;
};
}  // namespace hippy::devtools
