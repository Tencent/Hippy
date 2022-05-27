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
#include "api/notification/devtools_runtime_notification.h"
#include "tunnel/tunnel_service.h"

namespace hippy::devtools {

class DefaultRuntimeNotification : public RuntimeNotification {
 public:
  explicit DefaultRuntimeNotification(std::shared_ptr<TunnelService> tunnel_service)
      : tunnel_service_(tunnel_service) {}

  void UpdateContextName(const std::string& context_name) override;

 private:
  std::shared_ptr<TunnelService> tunnel_service_;
};

}  // namespace hippy::devtools
