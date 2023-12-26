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
#include <arkui/native_type.h>
#include "renderer/utils/hr_types.h"
#include "footstone/hippy_value.h"

namespace hippy {
inline namespace render {
inline namespace native {

using HippyValue = footstone::HippyValue;
using HippyValueObjectType = footstone::value::HippyValue::HippyValueObjectType;
using HippyValueArrayType = footstone::value::HippyValue::HippyValueArrayType;

class HRConvertUtils {
public:
  static ArkUI_BorderStyle BorderStyleToArk(std::string &str);
  static ArkUI_ImageSize BackgroundImageSizeToArk(std::string &str);
  static float ToDegrees(const HippyValue &value);
  static bool TransformToArk(HippyValueArrayType &valueArray, HRTransform &transform);
};

} // namespace native
} // namespace render
} // namespace hippy
