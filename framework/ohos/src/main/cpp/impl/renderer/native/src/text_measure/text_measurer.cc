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

#include "renderer/text_measure/text_measurer.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "oh_napi/ark_ts.h"
#include "renderer/dom_node/hr_node_props.h"
#include "renderer/utils/hr_pixel_utils.h"
#include <native_drawing/drawing_brush.h>

namespace hippy {
inline namespace render {
inline namespace native {

#ifdef MEASURE_TEXT_CHECK_PROP
void TextMeasurer::StartCollectProp() { usedProp_.clear(); }

void TextMeasurer::CheckUnusedProp(const char *tag, std::map<std::string, std::string> &propMap) {
  for (auto it = propMap.begin(); it != propMap.end(); ++it) {
    if (std::find(usedProp_.begin(), usedProp_.end(), it->first) == usedProp_.end()) {
      FOOTSTONE_DLOG(WARNING) << "hippy text - measure " << tag << " unused prop: " << it->first << " : " << it->second;
    }
  }
}
#endif

bool TextMeasurer::NeedFontWeightScale(float weightScale) {
  return weightScale > 1.f ? true : false;
}

OH_Drawing_FontWeight TextMeasurer::FontWeightToDrawing(const std::string &str, float weightScale) {
  bool needScale = NeedFontWeightScale(weightScale);
  if (needScale) {
    int weightValue = 0;
    if (str.length() == 0 || str == "normal") {
      weightValue = 400;
    } else if (str == "bold") {
      weightValue = 700;
    } else {
      auto w = std::atoi(str.c_str());
      if (std::isnan(w) || w == 0) {
        weightValue = 400;
      } else {
        weightValue = w;
      }
    }
    weightValue = (int)((float)weightValue * weightScale);
    return FontWeightValueToDrawing(weightValue);
  } else {
    if (str.length() == 0 || str == "normal") {
      return FONT_WEIGHT_400;
    } else if (str == "bold") {
      return FONT_WEIGHT_700;
    } else {
      auto w = std::atoi(str.c_str());
      if (std::isnan(w) || w == 0) {
        return FONT_WEIGHT_400;
      }
      return FontWeightValueToDrawing(w);
    }
  }
}

OH_Drawing_FontWeight TextMeasurer::FontWeightValueToDrawing(int w) {
  if (w <= 100) {
    return FONT_WEIGHT_100;
  } else if (w <= 200) {
    return FONT_WEIGHT_200;
  } else if (w <= 300) {
    return FONT_WEIGHT_300;
  } else if (w <= 400) {
    return FONT_WEIGHT_400;
  } else if (w <= 500) {
    return FONT_WEIGHT_500;
  } else if (w <= 600) {
    return FONT_WEIGHT_600;
  } else if (w <= 700) {
    return FONT_WEIGHT_700;
  } else if (w <= 800) {
    return FONT_WEIGHT_800;
  } else {
    return FONT_WEIGHT_900;
  }
}

bool TextMeasurer::GetPropValue(HippyValueObjectType &propMap, const char *prop, HippyValue &propValue) {
  auto it = propMap.find(prop);
  if (it == propMap.end()) {
    propValue = HippyValue::Undefined();
    return false;
  }
#ifdef MEASURE_TEXT_CHECK_PROP
  usedProp_.push_back(prop);
#endif
  propValue = it->second;
  return true;
}

void TextMeasurer::StartMeasure(HippyValueObjectType &propMap, const std::set<std::string> &fontFamilyNames, const std::shared_ptr<FontCollectionCache> fontCache) {
#ifdef MEASURE_TEXT_CHECK_PROP
  StartCollectProp();
#endif
  typographyStyle_ = OH_Drawing_CreateTypographyStyle();
  OH_Drawing_SetTypographyTextDirection(typographyStyle_, TEXT_DIRECTION_LTR); // 从左向右排版
  
  HippyValue propValue;
  
  text_align_ = TEXT_ALIGN_START;
  if (GetPropValue(propMap, HRNodeProps::TEXT_ALIGN, propValue)) {
    auto& strValue = HippyValue2String(propValue);
    if (strValue == "center") {
      text_align_ = TEXT_ALIGN_CENTER;
    } else if (strValue == "right") {
      text_align_ = TEXT_ALIGN_END;
    }
  }
  OH_Drawing_SetTypographyTextAlign(typographyStyle_, text_align_);

  int maxLines = 100000;
  if (GetPropValue(propMap, HRNodeProps::NUMBER_OF_LINES, propValue)) {
    auto intValue = HippyValue2Int(propValue);
    maxLines = intValue > 0 ? intValue : maxLines;
  }
  OH_Drawing_SetTypographyTextMaxLines(typographyStyle_, maxLines);

  if (GetPropValue(propMap, HRNodeProps::BREAK_STRATEGY, propValue)) {
    auto& strValue = HippyValue2String(propValue);
    OH_Drawing_BreakStrategy bs = BREAK_STRATEGY_GREEDY;
    if (strValue == "high_quality") {
      bs = BREAK_STRATEGY_HIGH_QUALITY;
    } else if (strValue == "balanced") {
      bs = BREAK_STRATEGY_BALANCED;
    }
    OH_Drawing_SetTypographyTextBreakStrategy(typographyStyle_, bs);
  }

  OH_Drawing_EllipsisModal em = ELLIPSIS_MODAL_TAIL;
  std::string ellipsis = "...";
  if (GetPropValue(propMap, HRNodeProps::ELLIPSIZE_MODE, propValue)) {
    auto& strValue = HippyValue2String(propValue);
    if (strValue == "head") {
      em = ELLIPSIS_MODAL_HEAD;
    } else if (strValue == "middle") {
      em = ELLIPSIS_MODAL_MIDDLE;
    } else if (strValue == "clip") {
      ellipsis = "";
    }
  }
  OH_Drawing_SetTypographyTextEllipsis(typographyStyle_, ellipsis.c_str());
  OH_Drawing_SetTypographyTextEllipsisModal(typographyStyle_, em);

  bool hasCustomFont = false;
  if (fontCache) {
    for (auto itName = fontFamilyNames.begin(); itName != fontFamilyNames.end(); itName++) {
      auto &fontName = *itName;
      if (fontCache->HasFont(fontName)) {
        hasCustomFont = true;
      } else {
        auto itFont = fontFamilyList_.find(fontName);
        if (itFont != fontFamilyList_.end()) {
          auto fontPath = itFont->second;
          fontCache->RegisterFont(fontName, fontPath);
          hasCustomFont = true;
        }
      }
    }
  }

// 因为使用了API14才有的接口，App也需要升级最低支持版本为API14，否则会加载so crash。
// 这里临时定义宏，如果有业务暂时不方便升级到API14，可以临时define为0。
#define OHOS_HAS_API14 1
#if OHOS_HAS_API14
  OH_Drawing_FontCollection *fontCollection = nullptr;
  if (hasCustomFont) {
    fontCollection = fontCache->fontCollection_;
  } else {
    fontCollection = OH_Drawing_GetFontCollectionGlobalInstance();
  }
#else
  (void)hasCustomFont;
  OH_Drawing_FontCollection *fontCollection = fontCache ? fontCache->fontCollection_ : nullptr;
#endif
  styled_string_ = OH_ArkUI_StyledString_Create(typographyStyle_, fontCollection);

  if (GetPropValue(propMap, HRNodeProps::LINE_HEIGHT, propValue)) {
    auto doubleValue = HippyValue2Double(propValue);
    lineHeight_ = doubleValue;
  }
  if (GetPropValue(propMap, HRNodeProps::PADDING_VERTICAL, propValue)) {
    auto doubleValue = HippyValue2Double(propValue);
    paddingTop_ = doubleValue;
    paddingBottom_ = doubleValue;
  }
  if (GetPropValue(propMap, HRNodeProps::PADDING_HORIZONTAL, propValue)) {
    auto doubleValue = HippyValue2Double(propValue);
    paddingLeft_ = doubleValue;
    paddingRight_ = doubleValue;
  }
  if (GetPropValue(propMap, HRNodeProps::PADDING_LEFT, propValue)) {
    auto doubleValue = HippyValue2Double(propValue);
    paddingLeft_ = doubleValue;
  }
  if (GetPropValue(propMap, HRNodeProps::PADDING_RIGHT, propValue)) {
    auto doubleValue = HippyValue2Double(propValue);
    paddingRight_ = doubleValue;
  }
  if (GetPropValue(propMap, HRNodeProps::PADDING_TOP, propValue)) {
    auto doubleValue = HippyValue2Double(propValue);
    paddingTop_ = doubleValue;
  }
  if (GetPropValue(propMap, HRNodeProps::PADDING_BOTTOM, propValue)) {
    auto doubleValue = HippyValue2Double(propValue);
    paddingBottom_ = doubleValue;
  }
  if (GetPropValue(propMap, HRNodeProps::BORDER_WIDTH, propValue)) {
    auto floatValue = HippyValue2Float(propValue);
    borderTopWidth_ = floatValue;
    borderRightWidth_ = floatValue;
    borderBottomWidth_ = floatValue;
    borderLeftWidth_ = floatValue;
  }
  if (GetPropValue(propMap, HRNodeProps::BORDER_TOP_WIDTH, propValue)) {
    auto floatValue = HippyValue2Float(propValue);
    borderTopWidth_ = floatValue;
  }
  if (GetPropValue(propMap, HRNodeProps::BORDER_RIGHT_WIDTH, propValue)) {
    auto floatValue = HippyValue2Float(propValue);
    borderRightWidth_ = floatValue;
  }
  if (GetPropValue(propMap, HRNodeProps::BORDER_BOTTOM_WIDTH, propValue)) {
    auto floatValue = HippyValue2Float(propValue);
    borderBottomWidth_ = floatValue;
  }
  if (GetPropValue(propMap, HRNodeProps::BORDER_LEFT_WIDTH, propValue)) {
    auto floatValue = HippyValue2Float(propValue);
    borderLeftWidth_ = floatValue;
  }

#ifdef MEASURE_TEXT_CHECK_PROP
  const static std::vector<std::string> dropProp = {
    "text",        "backgroundColor", "color",           "marginLeft",       "marginRight",
    "marginTop",   "marginBottom",    "textShadowColor", "textShadowOffset", "borderColor",
    "borderWidth", "breakStrategy",   "textShadowRadius"};
  for (uint32_t i = 0; i < dropProp.size(); i++) {
    usedProp_.push_back(dropProp[i]);
  }
  CheckUnusedProp("Start", propMap);
#endif
}

void TextMeasurer::AddText(HippyValueObjectType &propMap, float density, bool isTextInput) {
#ifdef MEASURE_TEXT_CHECK_PROP
  StartCollectProp();
#endif

  OH_Drawing_TextStyle *txtStyle = OH_Drawing_CreateTextStyle();
  
  HippyValue propValue;
  
  if (GetPropValue(propMap, HRNodeProps::LINE_HEIGHT, propValue)) {
    auto doubleValue = HippyValue2Double(propValue);
    lineHeight_ = doubleValue;
  }
  
  uint32_t color = 0xff000000; // 颜色默认值，绘制时必须有颜色设置
  if (GetPropValue(propMap, HRNodeProps::COLOR, propValue)) {
    auto uintValue = HippyValue2Uint(propValue);
    color = uintValue > 0 ? uintValue : color;
  }
  OH_Drawing_SetTextStyleColor(txtStyle, color);

  OH_Drawing_Brush *brush = nullptr;
  if (GetPropValue(propMap, HRNodeProps::BACKGROUND_COLOR, propValue)) {
    auto uintValue = HippyValue2Uint(propValue);
    brush = OH_Drawing_BrushCreate();
    if (brush) {
      OH_Drawing_BrushSetColor(brush, uintValue);
      OH_Drawing_SetTextStyleBackgroundBrush(txtStyle, brush);
    }
  }

  double fontSize = 14; // 默认的fontSize是14
  if (GetPropValue(propMap, HRNodeProps::FONT_SIZE, propValue)) {
    auto doubleValue = HippyValue2Double(propValue);
    fontSize = doubleValue > 0 ? doubleValue : fontSize;
  }
  OH_Drawing_SetTextStyleFontSize(txtStyle, fontSize * density);

  if (GetPropValue(propMap, HRNodeProps::FONT_WEIGHT, propValue)) {
    auto& strValue = HippyValue2String(propValue);
    int fontWeight = FontWeightToDrawing(strValue, HRPixelUtils::GetFontWeightScale());
    OH_Drawing_SetTextStyleFontWeight(txtStyle, fontWeight);
  } else if (NeedFontWeightScale(HRPixelUtils::GetFontWeightScale())) {
    int fontWeight = FontWeightToDrawing("", HRPixelUtils::GetFontWeightScale());
    OH_Drawing_SetTextStyleFontWeight(txtStyle, fontWeight);
  }

  OH_Drawing_SetTextStyleBaseLine(txtStyle, TEXT_BASELINE_ALPHABETIC);

  if (GetPropValue(propMap, HRNodeProps::TEXT_DECORATION_LINE, propValue)) {
    auto& strValue = HippyValue2String(propValue);
    OH_Drawing_TextDecoration td = TEXT_DECORATION_NONE;
    if (strValue == "underline") {
      td = TEXT_DECORATION_UNDERLINE;
    } else if (strValue == "line-through") {
      td = TEXT_DECORATION_LINE_THROUGH;
    } else if (strValue == "overline") {
      td = TEXT_DECORATION_OVERLINE;
    }
    OH_Drawing_SetTextStyleDecoration(txtStyle, td);
  }
  if (GetPropValue(propMap, HRNodeProps::TEXT_DECORATION_COLOR, propValue)) {
    auto uintValue = HippyValue2Uint(propValue);
    uint32_t dColor = uintValue;
    OH_Drawing_SetTextStyleDecorationColor(txtStyle, dColor);
  }
  if (GetPropValue(propMap, HRNodeProps::TEXT_DECORATION_STYLE, propValue)) {
    auto& strValue = HippyValue2String(propValue);
    OH_Drawing_TextDecorationStyle ds = TEXT_DECORATION_STYLE_SOLID;
    if (strValue == "dotted") {
      ds = TEXT_DECORATION_STYLE_DOTTED;
    } else if (strValue == "double") {
      ds = TEXT_DECORATION_STYLE_DOUBLE;
    } else if (strValue == "dashed") {
      ds = TEXT_DECORATION_STYLE_DASHED;
    } else if (strValue == "wavy") {
      ds = TEXT_DECORATION_STYLE_WAVY;
    }
    OH_Drawing_SetTextStyleDecorationStyle(txtStyle, ds);
  }
  
  uint32_t shadowColor = 0xff000000;
  double shadowOffsetX = 0;
  double shadowOffsetY = 0;
  double shadowRadius = 0;
  bool hasShadow = false;
  if (GetPropValue(propMap, HRNodeProps::TEXT_SHADOW_COLOR, propValue)) {
    auto uintValue = HippyValue2Uint(propValue);
    shadowColor = uintValue;
    hasShadow = true;
  }
  if (GetPropValue(propMap, HRNodeProps::TEXT_SHADOW_OFFSET, propValue)) {
    HippyValueObjectType obj;
    if (propValue.ToObject(obj)) {
      shadowOffsetX = HippyValue2Double(obj[HRNodeProps::WIDTH]);
      shadowOffsetY = HippyValue2Double(obj[HRNodeProps::HEIGHT]);
      hasShadow = true;
    }
  }
  if (GetPropValue(propMap, HRNodeProps::TEXT_SHADOW_RADIUS, propValue)) {
    auto doubleValue = HippyValue2Double(propValue);
    shadowRadius = doubleValue;
    hasShadow = true;
  }
  if (hasShadow) {
    OH_Drawing_TextShadow *shadow = OH_Drawing_CreateTextShadow();
    auto shadowOffset = OH_Drawing_PointCreate((float)shadowOffsetX, (float)shadowOffsetY);
    OH_Drawing_SetTextShadow(shadow, shadowColor, shadowOffset, shadowRadius);
    OH_Drawing_PointDestroy(shadowOffset);
    OH_Drawing_TextStyleAddShadow(txtStyle, shadow);
    OH_Drawing_DestroyTextShadow(shadow);
  }

#ifdef OHOS_DRAW_TEXT
  if (lineHeight_ > 0 && fontSize > 0) {
    double fontHeight = lineHeight_ / fontSize;
    OH_Drawing_SetTextStyleFontHeight(txtStyle, fontHeight);
    OH_Drawing_SetTextStyleHalfLeading(txtStyle, true);
  }
#endif
  
  // If font height is set, measure results for some special char will be wrong.
  // For example, ε (utf8 code: e0bdbdceb5). Measured height is less than drawn height.
  // OH_Drawing_SetTextStyleFontHeight(txtStyle, 1.25);

  if (GetPropValue(propMap, HRNodeProps::FONT_FAMILY, propValue)) {
    auto& strValue = HippyValue2String(propValue);
    const char *fontFamilies[] = { strValue.c_str() };
    OH_Drawing_SetTextStyleFontFamilies(txtStyle, 1, fontFamilies);
  }
  int fontStyle = FONT_STYLE_NORMAL;
  if (GetPropValue(propMap, HRNodeProps::FONT_STYLE, propValue) && HippyValue2String(propValue) == "italic") {
    fontStyle = FONT_STYLE_ITALIC;
  }
  OH_Drawing_SetTextStyleFontStyle(txtStyle, fontStyle);
    
  // use default locale,
  // If en is set, measure results for Chinese characters will be inaccurate.
  // OH_Drawing_SetTextStyleLocale(txtStyle, "zh");
  
  if (GetPropValue(propMap, HRNodeProps::LETTER_SPACING, propValue)) {
    auto doubleValue = HippyValue2Double(propValue);
    double letterSpacing = doubleValue;
    OH_Drawing_SetTextStyleLetterSpacing(txtStyle, letterSpacing * density);
  }
  
  OH_ArkUI_StyledString_PushTextStyle(styled_string_, txtStyle);
  if (GetPropValue(propMap, "text", propValue)) {
    auto& strValue = HippyValue2String(propValue);
    OH_ArkUI_StyledString_AddText(styled_string_, strValue.c_str());

    std::u16string str16 = footstone::StringViewUtils::CovertToUtf16(string_view((const string_view::char8_t_*)strValue.c_str()), string_view::Encoding::Utf8).utf16_value();
    int strLen = (int)str16.size();
    spanOffsets_.emplace_back(std::tuple(charOffset_, charOffset_ + strLen));
    charOffset_ += strLen;
    
#ifdef MEASURE_TEXT_LOG_RESULT
    logTextContent_ += "[span]";
    logTextContent_ += propValue;
#endif
  } else {
    // TextInput组件测量时，没有text内容，会返回错误的测量高度16，所以需要特殊处理下。
    if (isTextInput) {
      OH_ArkUI_StyledString_AddText(styled_string_, " ");
    }
  }

  OH_ArkUI_StyledString_PopTextStyle(styled_string_);
  OH_Drawing_DestroyTextStyle(txtStyle);
  if (brush) {
    OH_Drawing_BrushDestroy(brush);
  }

#ifdef MEASURE_TEXT_CHECK_PROP
  const static std::vector<std::string> dropProp = {
    "backgroundColor",  "lineHeight",        "margin",          "marginLeft",      "marginRight",
    "marginTop",        "marginBottom",      "textAlign",       "textShadowColor", "textShadowOffset",
    "ellipsizeMode",    "numberOfLines",     "borderColor",     "borderWidth",     "breakStrategy",
    "textShadowRadius", "paddingHorizontal", "paddingVertical", "verticalAlign"};
  for (uint32_t i = 0; i < dropProp.size(); i++) {
    usedProp_.push_back(dropProp[i]);
  }
  CheckUnusedProp("Text", propMap);
#endif
}

void TextMeasurer::AddImage(HippyValueObjectType &propMap, float density) {
#ifdef MEASURE_TEXT_CHECK_PROP
  StartCollectProp();
#endif

  HippyValue propValue;
  
  OH_Drawing_PlaceholderSpan span;
  if (GetPropValue(propMap, HRNodeProps::WIDTH, propValue)) {
    double doubleValue = HippyValue2Double(propValue);
    span.width = doubleValue * density;
  }
  if (GetPropValue(propMap, HRNodeProps::HEIGHT, propValue)) {
    double doubleValue = HippyValue2Double(propValue);
    span.height = doubleValue * density;
  }
  span.alignment = OH_Drawing_PlaceholderVerticalAlignment::ALIGNMENT_CENTER_OF_ROW_BOX;

  OH_ArkUI_StyledString_AddPlaceholder(styled_string_, &span);
  
  if (minLineHeight_ < span.height) {
    minLineHeight_ = span.height;
  }

  OhImageSpanHolder spanH;
  spanH.width = span.width;
  spanH.height = span.height;
  spanH.alignment = OH_Drawing_PlaceholderVerticalAlignment::ALIGNMENT_CENTER_OF_ROW_BOX;

  if (GetPropValue(propMap, HRNodeProps::VERTICAL_ALIGN, propValue)) {
    auto& strValue = HippyValue2String(propValue);
    if (strValue == "top") {
      spanH.alignment = OH_Drawing_PlaceholderVerticalAlignment::ALIGNMENT_TOP_OF_ROW_BOX;
    } else if (strValue == "middle") {
      spanH.alignment = OH_Drawing_PlaceholderVerticalAlignment::ALIGNMENT_CENTER_OF_ROW_BOX;
    } else if (strValue == "baseline") {
      spanH.alignment = OH_Drawing_PlaceholderVerticalAlignment::ALIGNMENT_OFFSET_AT_BASELINE;
    } else if (strValue == "bottom") {
      spanH.alignment = OH_Drawing_PlaceholderVerticalAlignment::ALIGNMENT_BOTTOM_OF_ROW_BOX;
    }
  }
  if (GetPropValue(propMap, "verticalAlignment", propValue)) {
    // TODO: check
    spanH.alignment = OH_Drawing_PlaceholderVerticalAlignment::ALIGNMENT_ABOVE_BASELINE;
  }
  if (GetPropValue(propMap, HRNodeProps::MARGIN, propValue)) {
    double doubleValue = HippyValue2Double(propValue);
    spanH.marginTop = doubleValue;
    spanH.marginBottom = doubleValue;
  }
  if (GetPropValue(propMap, HRNodeProps::TOP, propValue)) {
    double doubleValue = HippyValue2Double(propValue);
    spanH.top = doubleValue;
  }

  imageSpans_.push_back(spanH);
  
#ifdef MEASURE_TEXT_CHECK_PROP
  const static std::vector<std::string> dropProp = {"backgroundColor", "src", "tintColor"};
  for (uint32_t i = 0; i < dropProp.size(); i++) {
    usedProp_.push_back(dropProp[i]);
  }
  CheckUnusedProp("Image", propMap);
#endif
}

double TextMeasurer::CalcSpanPostion(OH_Drawing_Typography *typography, OhMeasureResult &ret, float density) {
  size_t lineCount = 0;
  std::vector<double> lineHeights;    // 真实每行高度
  std::vector<double> measureHeights; // 测得每行高度

  lineCount = OH_Drawing_TypographyGetLineCount(typography); // 总行数
  if (lineCount == 0) {
    return lineHeight_;
  }
  for (uint32_t i = 0; i < lineCount; i++) {                 // 获取每行行高
    // 当前行没有文本时，或者指定了lineHeight，baseLine获取的就不对
    // baseLine = OH_Drawing_TypographyGetAlphabeticBaseline(typography); //=h*11/16
    // baseLine = OH_Drawing_TypographyGetIdeographicBaseline(typography); //=h
    double h = OH_Drawing_TypographyGetLineHeight(typography, (int)i);
    measureHeights.push_back(h);
    if (lineHeight_ != 0) {
      lineHeights.push_back(lineHeight_);
    } else {
      lineHeights.push_back(h);
    }
  }

  OH_Drawing_TextBox *tb = OH_Drawing_TypographyGetRectsForPlaceholders(typography); // 获取每个imageSpan的区域
  size_t textBoxCount = OH_Drawing_GetSizeOfTextBox(tb); // 获取到的数量，应该和 imageSpans_ 一样多
  double bottom = lineHeights[0];
  for (uint32_t i = 0; i < textBoxCount; i++) { // i 对应到 imageSpans_ 下标
    float boxTop = OH_Drawing_GetTopFromTextBox(tb, (int)i);
    float boxLeft = OH_Drawing_GetLeftFromTextBox(tb, (int)i);

    OhImageSpanPos pos;
    pos.x = boxLeft;
    pos.y = boxTop;
    
    pos.x += (paddingLeft_ + borderLeftWidth_) * density;
    pos.y += (paddingTop_ + borderTopWidth_) * density;
    
    ret.spanPos.push_back(pos);
  }
  return bottom;
}

OhMeasureResult TextMeasurer::EndMeasure(int width, int widthMode, int height, int heightMode, bool isSizeIncludePadding, float density) {
  OhMeasureResult ret;
  size_t lineCount = 0;
  
  typography_ = OH_ArkUI_StyledString_CreateTypography(styled_string_);
  double maxWidth = double(width);
  if (maxWidth == 0 || std::isnan(maxWidth)) {
    // fix text measure width wrong when maxWidth is nan or 0
    maxWidth = std::numeric_limits<double>::max();
  }
  
  double paddingWidthReduce = 0;
  double paddingHeightReduce = 0;
  if (isSizeIncludePadding) {
    paddingWidthReduce = (paddingLeft_ + paddingRight_ + borderLeftWidth_ + borderRightWidth_) * density;
    paddingHeightReduce = (paddingTop_ + paddingBottom_ + borderTopWidth_ + borderBottomWidth_) * density;
  }
  maxWidth -= paddingWidthReduce;

  OH_Drawing_TypographyLayout(typography_, maxWidth);

  // MATE 60, beta5, "新品" "商店" text cannot be fully displayed. So add 0.5.
  ret.width = ceil(OH_Drawing_TypographyGetLongestLine(typography_) + paddingWidthReduce + 0.5 * density);
  double drawResultHeight = OH_Drawing_TypographyGetHeight(typography_);
  ret.height = drawResultHeight;
  ret.isEllipsized = OH_Drawing_TypographyDidExceedMaxLines(typography_);
  lineCount = OH_Drawing_TypographyGetLineCount(typography_);
  
  double realHeight = CalcSpanPostion(typography_, ret, density);
  ret.height = fmax(ret.height, realHeight);
  
  if (ret.height < minLineHeight_) {
    ret.height = minLineHeight_;
  }
  
#ifdef MEASURE_TEXT_LOG_RESULT
  FOOTSTONE_DLOG(INFO) << "hippy text - measure result, maxWidth: " << maxWidth
    << ", result: (" << ret.width << ", " << ret.height << "), "
    << logTextContent_.c_str() << ", lineCount: " << lineCount;
#endif

  if (lineHeight_ != 0) {
    ret.height = lineHeight_ * density * (double)lineCount;
#ifdef MEASURE_TEXT_LOG_RESULT
    FOOTSTONE_DLOG(INFO) << "hippy text - lineHeight fix result, result height: " << ret.height;
#endif
  }
  
  if (ret.height > drawResultHeight) {
    correctPxOffsetY_ = (float)(ret.height - drawResultHeight) / 2.f;
  }
  
  ret.height += paddingHeightReduce;
  
  measureWidth_ = maxWidth;
  resultWidth_ = ret.width;
  
  return ret;
}

void TextMeasurer::Destroy() {
  if (typography_) {
    OH_Drawing_DestroyTypography(typography_);
    typography_ = nullptr;
  }
  if (styled_string_) {
    OH_ArkUI_StyledString_Destroy(styled_string_);
    styled_string_ = nullptr;
  }
  if (typographyStyle_) {
    OH_Drawing_DestroyTypographyStyle(typographyStyle_);
    typographyStyle_ = nullptr;
  }
}

int TextMeasurer::SpanIndexAt(float spanX, float spanY, float density) {
    int resultIndex = -1;
    for (size_t index = 0; index < spanOffsets_.size(); ++index) {
        int lastSpanBegin = std::get<0>(spanOffsets_[index]);
        int lastSpanEnd =   std::get<1>(spanOffsets_[index]);
        OH_Drawing_TextBox* box  = OH_Drawing_TypographyGetRectsForRange(typography_, (size_t)lastSpanBegin, (size_t)lastSpanEnd, RECT_HEIGHT_STYLE_MAX, RECT_WIDTH_STYLE_MAX);
        int n = (int)OH_Drawing_GetSizeOfTextBox(box);
        float dpi = density;
        for (int boxIndex = 0; boxIndex < n; ++boxIndex) {
            float left = OH_Drawing_GetLeftFromTextBox(box, boxIndex) / dpi;
            float right = OH_Drawing_GetRightFromTextBox(box, boxIndex) / dpi;
            float top = OH_Drawing_GetTopFromTextBox(box, boxIndex) / dpi;
            float bottom = OH_Drawing_GetBottomFromTextBox(box, boxIndex) / dpi;
            if(spanX < left || spanX >= right || spanY < top || spanY >= bottom) {
                continue;
            }
            resultIndex = (int)index;
            break;
        }
        if (resultIndex != -1) {
            break;
        }
    }
    return resultIndex;
}

void TextMeasurer::DoRedraw(float maxWidth) {
  OH_Drawing_TypographyLayout(typography_, maxWidth);
  measureWidth_ = maxWidth;
}

const std::string& TextMeasurer::HippyValue2String(HippyValue &value) {
  return value.ToStringSafe();
}

double TextMeasurer::HippyValue2Double(HippyValue &value) {
  double d = 0;
  if (value.ToDouble(d)) {
    return d;
  }
  auto& str = value.ToStringSafe();
  if (str.size() > 0) {
    // try catch std::invalid_argument exception
    try {
      return std::stod(str);
    } catch (...) {
      return 0;
    }
  }
  return 0;
}

float TextMeasurer::HippyValue2Float(HippyValue &value) {
  double f = 0;
  if (value.ToDouble(f)) {
    return (float)f;
  }
  auto& str = value.ToStringSafe();
  if (str.size() > 0) {
    try {
      return std::stof(str);
    } catch (...) {
      return 0;
    }
  }
  return 0;
}

int32_t TextMeasurer::HippyValue2Int(HippyValue &value) {
  return (int32_t)HippyValue2Double(value);
}

uint32_t TextMeasurer::HippyValue2Uint(HippyValue &value) {
  return (uint32_t)(int64_t)HippyValue2Double(value);
}

} // namespace native
} // namespace render
} // namespace hippy
