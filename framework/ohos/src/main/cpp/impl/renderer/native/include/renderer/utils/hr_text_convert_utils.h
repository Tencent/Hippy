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
#include <sys/stat.h>
#include "renderer/utils/hr_types.h"

namespace hippy {
inline namespace render {
inline namespace native {

class HRTextConvertUtils {
public:
  static ArkUI_FontWeight FontWeightToArk(std::string &str);
  static int32_t FontStyleToArk(std::string &str);
  static ArkUI_TextAlignment TextAlignToArk(std::string &str);
  static ArkUI_TextDecorationType TextDecorationTypeToArk(std::string &str);
  static ArkUI_TextDecorationStyle TextDecorationStyleToArk(std::string &str);
  static bool EllipsisModeToArk(std::string &str, ArkUI_EllipsisMode &ellipsisMode, ArkUI_TextOverflow &textOverflow);
  static ArkUI_WordBreak WordBreakToArk(std::string &str);
};

} // namespace native
} // namespace render
} // namespace hippy
