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

#include "footstone/hippy_value.h"

using HippyValue = footstone::HippyValue;

#ifdef __cplusplus
extern "C" {
#endif

struct HRAnyDataInternal {
  std::shared_ptr<HippyValue> anyValue;
  std::shared_ptr<HRAnyDataInternal> arrayElementData; // 局部存储数据元素数据
  ~HRAnyDataInternal() {
    anyValue = nullptr;
    arrayElementData = nullptr;
  }
};

#ifdef __cplusplus
}
#endif
