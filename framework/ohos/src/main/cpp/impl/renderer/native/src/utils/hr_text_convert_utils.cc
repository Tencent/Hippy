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

#include "renderer/utils/hr_text_convert_utils.h"
#include <sstream>

namespace hippy {
inline namespace render {
inline namespace native {

ArkUI_FontWeight HRTextConvertUtils::FontWeightToArk(std::string &str) {
  if (str == "normal") {
    return ArkUI_FontWeight::ARKUI_FONT_WEIGHT_NORMAL;
  } else if (str == "bold") {
    return ArkUI_FontWeight::ARKUI_FONT_WEIGHT_BOLD;
  } else {
    auto w = std::atoi(str.c_str());
    if (std::isnan(w) || w == 0) {
      return ArkUI_FontWeight::ARKUI_FONT_WEIGHT_NORMAL;
    }
    if (w < 200) {
      return ArkUI_FontWeight::ARKUI_FONT_WEIGHT_W100;
    } else if (w < 300) {
      return ArkUI_FontWeight::ARKUI_FONT_WEIGHT_W200;
    } else if (w < 400) {
      return ArkUI_FontWeight::ARKUI_FONT_WEIGHT_W300;
    } else if (w < 500) {
      return ArkUI_FontWeight::ARKUI_FONT_WEIGHT_W400;
    } else if (w < 600) {
      return ArkUI_FontWeight::ARKUI_FONT_WEIGHT_W500;
    } else if (w < 700) {
      return ArkUI_FontWeight::ARKUI_FONT_WEIGHT_W600;
    } else if (w < 800) {
      return ArkUI_FontWeight::ARKUI_FONT_WEIGHT_W700;
    } else if (w < 900) {
      return ArkUI_FontWeight::ARKUI_FONT_WEIGHT_W800;
    } else {
      return ArkUI_FontWeight::ARKUI_FONT_WEIGHT_W900;
    }
  }
}

int32_t HRTextConvertUtils::FontStyleToArk(std::string &str) {
  if (str == "italic") {
    return 1;
  } else {
    return 0;
  }
}

ArkUI_TextAlignment HRTextConvertUtils::TextAlignToArk(std::string &str) {
  if (str == "left") {
    return ArkUI_TextAlignment::ARKUI_TEXT_ALIGNMENT_START;
  } else if (str == "right") {
    return ArkUI_TextAlignment::ARKUI_TEXT_ALIGNMENT_END;
  } else if (str == "center") {
    return ArkUI_TextAlignment::ARKUI_TEXT_ALIGNMENT_CENTER;
  } else {
    return ArkUI_TextAlignment::ARKUI_TEXT_ALIGNMENT_START;
  }
}

ArkUI_TextDecorationType HRTextConvertUtils::TextDecorationTypeToArk(std::string &str) {
  ArkUI_TextDecorationType type = ARKUI_TEXT_DECORATION_TYPE_NONE;
  std::stringstream ss(str);
  std::string token;
  while (std::getline(ss, token, ' ')) {
    if (token == "underline") {
      type = ARKUI_TEXT_DECORATION_TYPE_UNDERLINE;
    } else if (token == "line-through") {
      type = ARKUI_TEXT_DECORATION_TYPE_LINE_THROUGH;
    }
  }
  return type;
}

ArkUI_TextDecorationStyle HRTextConvertUtils::TextDecorationStyleToArk(std::string &str) {
  ArkUI_TextDecorationStyle style = ARKUI_TEXT_DECORATION_STYLE_SOLID;
  if (str == "double") {
    style = ARKUI_TEXT_DECORATION_STYLE_DOUBLE;
  } else if (str == "dotted") {
    style = ARKUI_TEXT_DECORATION_STYLE_DOTTED;
  } else if (str == "dashed") {
    style = ARKUI_TEXT_DECORATION_STYLE_DASHED;
  } else {
    style = ARKUI_TEXT_DECORATION_STYLE_SOLID;
  }
  return style;
}

bool HRTextConvertUtils::EllipsisModeToArk(std::string &str, ArkUI_EllipsisMode &ellipsisMode, ArkUI_TextOverflow &textOverflow) {
  if (str == "clip") {
    textOverflow = ARKUI_TEXT_OVERFLOW_CLIP;
    return true;
  } else {
    textOverflow = ARKUI_TEXT_OVERFLOW_ELLIPSIS;
    if (str == "head") {
      ellipsisMode = ARKUI_ELLIPSIS_MODE_START;
      return true;
    } else if (str == "middle") {
      ellipsisMode = ARKUI_ELLIPSIS_MODE_CENTER;
      return true;
    } else if (str == "tail") {
      ellipsisMode = ARKUI_ELLIPSIS_MODE_END;
      return true;
    }
  }
  return false;
}

ArkUI_WordBreak HRTextConvertUtils::WordBreakToArk(std::string &str) {
  if (str == "high_quality") {
    return ARKUI_WORD_BREAK_BREAK_ALL;
  } else if (str == "balanced") {
    return ARKUI_WORD_BREAK_BREAK_WORD;
  } else {
    return ARKUI_WORD_BREAK_BREAK_WORD;
  }
}

} // namespace native
} // namespace render
} // namespace hippy
