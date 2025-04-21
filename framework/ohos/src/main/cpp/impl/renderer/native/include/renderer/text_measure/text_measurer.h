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

#include "footstone/logging.h"
#include "footstone/hippy_value.h"
#include "renderer/text_measure/font_collection_manager.h"
#include "renderer/utils/hr_pixel_utils.h"
#include <string>
#include <map>
#include <set>
#include <unordered_map>
#include <arkui/native_node.h>
#include <arkui/native_type.h>
#include <arkui/styled_string.h>
#include <native_drawing/drawing_color.h>
#include <native_drawing/drawing_font_collection.h>
#include <native_drawing/drawing_point.h>
#include <native_drawing/drawing_text_declaration.h>
#include <native_drawing/drawing_types.h>
#include <native_drawing/drawing_text_typography.h>
#include <native_drawing/drawing_register_font.h>

// Note: Do not open normally, it impacts performance.
// #define MEASURE_TEXT_CHECK_PROP
// #define MEASURE_TEXT_LOG_RESULT

namespace hippy {
inline namespace render {
inline namespace native {

using HippyValue = footstone::value::HippyValue;
using HippyValueObjectType = footstone::value::HippyValue::HippyValueObjectType;

struct OhImageSpanHolder {
  double width;
  double height;
  OH_Drawing_PlaceholderVerticalAlignment alignment;
  double top = 0;

  double marginTop = 0;
  double marginBottom = 0;
};

struct OhImageSpanPos {
  double x;
  double y;
};

struct OhMeasureResult {
  double width;
  double height;
  std::vector<OhImageSpanPos> spanPos; // 指定imageSpan的位置
  bool isEllipsized;
};

class TextMeasurer {
public:
  TextMeasurer() {}
  TextMeasurer(const std::unordered_map<std::string, std::string>& fontFamilyList) : fontFamilyList_(fontFamilyList) {}
  ~TextMeasurer() {
    Destroy();
  }
  
  void StartMeasure(HippyValueObjectType &propMap, const std::set<std::string> &fontFamilyNames, const std::shared_ptr<FontCollectionCache> fontCache);
  void AddText(HippyValueObjectType &propMap, float density, bool isTextInput = false);
  void AddImage(HippyValueObjectType &propMap, float density);
  OhMeasureResult EndMeasure(int width, int widthMode, int height, int heightMode, float density);
  
  void Destroy();
  
  ArkUI_StyledString *GetStyledString() {
    return styled_string_;
  }
    
  OH_Drawing_Typography *GetTypography() {
    return typography_;
  }
  
  bool IsRedraw(float maxWidth) {
    return text_align_ != TEXT_ALIGN_START && fabs(measureWidth_ - maxWidth) >= HRPixelUtils::DpToPx(1.0);
  }

  void DoRedraw(float maxWidth);

  int SpanIndexAt(float spanX, float spanY, float density);
  
private:
#ifdef MEASURE_TEXT_CHECK_PROP
  void StartCollectProp();
  void CheckUnusedProp(const char *tag, std::map<std::string, std::string> &propMap);
  std::vector<std::string> usedProp_;
#endif
#ifdef MEASURE_TEXT_LOG_RESULT
  std::string logTextContent_;
#endif
  
private:
  // 测量Text和组件显示Text是鸿蒙的两套系统，测量的时候需要感知和对应系统设置“字体大小和界面缩放”里的字体粗细值。
  // 但是，App不重启这个值总是不变，所以为了最大情况下字体能显示完全，每次App启动scale值大于1会放大测量。
  // 该方法用来判断是否放大测量。
  bool NeedFontWeightScale(float weightScale);
  OH_Drawing_FontWeight FontWeightToDrawing(const std::string &str, float weightScale = 1.f);
  OH_Drawing_FontWeight FontWeightValueToDrawing(int w);
  bool GetPropValue(HippyValueObjectType &propMap, const char *prop, HippyValue &propValue);
  double CalcSpanPostion(OH_Drawing_Typography *typography, OhMeasureResult &ret);
  
  const std::string& HippyValue2String(HippyValue &value);
  double HippyValue2Double(HippyValue &value);
  int32_t HippyValue2Int(HippyValue &value);
  uint32_t HippyValue2Uint(HippyValue &value);
  
  std::unordered_map<std::string, std::string> fontFamilyList_;
  
  OH_Drawing_TypographyStyle *typographyStyle_ = nullptr;
  OH_Drawing_Typography *typography_ = nullptr;
  ArkUI_StyledString *styled_string_ = nullptr;
  int text_align_ = TEXT_ALIGN_START;
  double measureWidth_ = 0;
  
  std::vector<OhImageSpanHolder> imageSpans_;
  std::vector<std::tuple<int, int>> spanOffsets_; // begin, end

  int charOffset_ = 0;

  double lineHeight_ = 0; // 外部指定的行高，最高优先级
  double minLineHeight_ = 0; // 子组件中只有ImageSpan，没有TextSpan时，Placeholder不能撑大高度，使用ImageSpan的高度
  double paddingTop_ = 0;
  double paddingBottom_ = 0;
  double paddingLeft_ = 0;
  double paddingRight_ = 0;
};

} // namespace native
} // namespace render
} // namespace hippy
