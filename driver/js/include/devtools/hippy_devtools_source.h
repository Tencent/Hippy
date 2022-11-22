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
#ifdef ENABLE_INSPECTOR
#pragma once

#include "devtools/devtools_data_source.h"

#include "devtools/hippy_dom_data.h"

namespace hippy::devtools {
class HippyDevtoolsSource : public DevtoolsDataSource {
 public:
  HippyDevtoolsSource(const std::string& ws_url, std::shared_ptr<footstone::WorkerManager> worker_manager);
  ~HippyDevtoolsSource() = default;
  void Bind(int32_t runtime_id, uint32_t dom_id, int32_t render_id);
  void Destroy(bool is_reload);
  void SetContextName(const std::string& context_name);
  void SetRootNode(std::weak_ptr<RootNode> weak_root_node);
  inline std::shared_ptr<NotificationCenter> GetNotificationCenter() {
    return devtools_service_->GetNotificationCenter();
  }

  static uint32_t Insert(const std::shared_ptr<DevtoolsDataSource>& devtools_data_source);
  static std::shared_ptr<DevtoolsDataSource> Find(uint32_t id);
  static bool Erase(uint32_t id);

#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  void SetVmRequestHandler(VmRequestHandler request_handler);
  void SendVmResponse(std::unique_ptr<v8_inspector::StringBuffer> message);
  void SendVmNotification(std::unique_ptr<v8_inspector::StringBuffer> message);
  static void OnGlobalTracingControlGenerate(v8::platform::tracing::TracingController* tracingControl);
  static void SetFileCacheDir(const std::string& file_dir);
#endif

 private:
  void AddRootNodeListener(std::weak_ptr<RootNode> weak_root_node);
  void RemoveRootNodeListener(std::weak_ptr<RootNode> weak_root_node);
#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  void SendVmData(v8_inspector::StringView string_view);
#endif

  std::shared_ptr<HippyDomData> hippy_dom_;
  uint64_t listener_id_;
  std::shared_ptr<hippy::devtools::DevtoolsBackendService> devtools_service_;
};

}  // namespace hippy::devtools
#endif