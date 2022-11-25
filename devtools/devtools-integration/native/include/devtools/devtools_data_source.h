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
  using VmRequestHandler = std::function<void(std::string)>;

  DevtoolsDataSource() = default;
  virtual ~DevtoolsDataSource() = default;

  virtual void Bind(int32_t runtime_id, uint32_t dom_id, int32_t render_id) = 0;
  virtual void Destroy(bool is_reload) = 0;
  virtual void SetContextName(const std::string& context_name) = 0;
  virtual void SetRootNode(std::weak_ptr<RootNode> weak_root_node) = 0;
  virtual void SetVmRequestHandler(VmRequestHandler request_handler) = 0;
  virtual std::shared_ptr<NotificationCenter> GetNotificationCenter() = 0;

#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  virtual void SendVmResponse(std::unique_ptr<v8_inspector::StringBuffer> message) = 0;
  virtual void SendVmNotification(std::unique_ptr<v8_inspector::StringBuffer> message) = 0;
#endif
};
}  // namespace hippy::devtools
