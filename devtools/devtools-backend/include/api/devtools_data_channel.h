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
#include "api/devtools_data_provider.h"
#include "api/devtools_notification_center.h"

namespace hippy::devtools {
/**
 * @brief Data interaction channel between external access framework and devtools,
 * 1. provide the provider data interface that needs to be charged for the external access framework;
 * 2. Provide notification interface that can be called by external access framework;
 */
class DataChannel {
 public:
  DataChannel(std::shared_ptr<DataProvider> provider, std::shared_ptr<NotificationCenter> notification_center)
      : provider_(provider), notification_center_(notification_center) {}
  inline std::shared_ptr<DataProvider> GetProvider() { return provider_; }
  inline std::shared_ptr<NotificationCenter> GetNotificationCenter() { return notification_center_; }

 private:
  std::shared_ptr<DataProvider> provider_;
  std::shared_ptr<NotificationCenter> notification_center_;
};
}  // namespace hippy::devtools
