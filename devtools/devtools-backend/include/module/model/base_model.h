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

namespace hippy {
namespace devtools {

/**
 * @brief model 处理基类
 */
class BaseModel {
 public:
  void SetDataProvider(std::shared_ptr<DataProvider> provider) { provider_ = provider; }

 protected:
  std::shared_ptr<DataProvider> provider_;
};

}  // namespace devtools
}  // namespace hippy
