/**
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "core/tdfi/view/view.h"
#include "footstone/hippy_value.h"

namespace tdfrender {
namespace util {

using Point = tdfcore::TPoint;
using Color = tdfcore::Color;
using DomStyleMap = std::unordered_map<std::string, std::shared_ptr<footstone::HippyValue>>;

Color ConversionIntToColor(uint32_t value);
SkColor ConversionIntToSkColor(uint32_t value);
static bool ConvertDirectionToPoint(const std::string& direction, Point& begin_point, Point& end_point);
void ParseLinearGradientInfo(tdfcore::View& view, const footstone::HippyValue::HippyValueObjectType& gradient_map);
void ParseShadowInfo(tdfcore::View& view, const DomStyleMap& style_map);
void ParseBorderInfo(tdfcore::View& view, const DomStyleMap& style_map);
tdfcore::BorderStyle ParseBorderStyle(const DomStyleMap& style_map, const char* width_name, const char* color_name,
                                      std::pair<float, tdfcore::Color> default_style);

}  // namespace util
}  // namespace tdfrender
