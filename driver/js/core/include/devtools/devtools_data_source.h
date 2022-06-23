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
#include "core/engine.h"
#include "core/task/worker_task_runner.h"
#include "dom/root_node.h"
#include "devtools/adapter/hippy_runtime_adapter.h"
#include "devtools/adapter/hippy_vm_request_adapter.h"
#include "devtools/hippy_dom_data.h"

#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
#include "v8/libplatform/v8-tracing.h"
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wconversion"
#include "v8/v8-inspector.h"
#pragma clang diagnostic pop
#endif

namespace hippy::devtools {

/**
 * @brief Hippy debug data source, collect debug data by adapter implement and notification
 */
class DevtoolsDataSource : public std::enable_shared_from_this<hippy::devtools::DevtoolsDataSource> {
 public:
  explicit DevtoolsDataSource(const std::string& ws_url);
  ~DevtoolsDataSource() = default;
  void Bind(int32_t runtime_id, int32_t dom_id, int32_t render_id);
  void Destroy(bool is_reload);
  void SetRuntimeDebugMode(bool debug_mode);
  void SetVmRequestHandler(HippyVmRequestAdapter::VmRequestHandler request_handler);
  void SetContextName(const std::string& context_name);
  void SetRootNode(std::weak_ptr<RootNode> weak_root_node);

#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  static void OnGlobalTracingControlGenerate(v8::platform::tracing::TracingController* tracingControl);
  static void SetFileCacheDir(const std::string& file_dir);
  void SendVmResponse(std::unique_ptr<v8_inspector::StringBuffer> message);
  void SendVmNotification(std::unique_ptr<v8_inspector::StringBuffer> message);
#endif

 private:
  void AddRootNodeListener(std::weak_ptr<RootNode> weak_root_node);
  void RemoveRootNodeListener(std::weak_ptr<RootNode> weak_root_node);
#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  void SendVmData(v8_inspector::StringView string_view);
#endif

  std::shared_ptr<HippyDomData> hippy_dom_;
  uint64_t listener_id_;
  std::shared_ptr<HippyRuntimeAdapter> runtime_adapter_;
  std::shared_ptr<hippy::devtools::DevtoolsBackendService> devtools_service_;
};
}  // namespace hippy::devtools
