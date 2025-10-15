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

#include "renderer/components/rich_text_span_view.h"
#include "renderer/components/rich_text_view.h"
#include "renderer/dom_node/hr_node_props.h"
#include "renderer/utils/hr_pixel_utils.h"
#include "renderer/utils/hr_text_convert_utils.h"
#include "renderer/utils/hr_value_utils.h"
#include "renderer/uimanager/hr_gesture_dispatcher.h"

namespace hippy {
inline namespace render {
inline namespace native {

RichTextSpanView::RichTextSpanView(std::shared_ptr<NativeRenderContext> &ctx) : BaseView(ctx) {
}

RichTextSpanView::~RichTextSpanView() {}

SpanNode *RichTextSpanView::GetLocalRootArkUINode() {
  return spanNode_.get();
}

void RichTextSpanView::CreateArkUINodeImpl() {
#ifdef OHOS_DRAW_TEXT
#else
  spanNode_ = std::make_shared<SpanNode>();
#endif
}

void RichTextSpanView::DestroyArkUINodeImpl() {
#ifdef OHOS_DRAW_TEXT
#else
  spanNode_ = nullptr;
  ClearProps();
#endif
}

bool RichTextSpanView::RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
#ifdef OHOS_DRAW_TEXT
  return false;
#else
  spanNode_->ResetAllAttributes();
  recycleView->cachedNodes_.resize(1);
  recycleView->cachedNodes_[0] = spanNode_;
  spanNode_ = nullptr;
  ClearProps();
  return true;
#endif
}

bool RichTextSpanView::ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
#ifdef OHOS_DRAW_TEXT
  return false;
#else
  if (recycleView->cachedNodes_.size() < 1) {
    return false;
  }
  spanNode_ = std::static_pointer_cast<SpanNode>(recycleView->cachedNodes_[0]);
  return true;
#endif
}

bool RichTextSpanView::SetViewProp(const std::string &propKey, const HippyValue &propValue) {
#ifdef OHOS_DRAW_TEXT
  // 绘制文本时，SpanView重载了click的处理
  if (propKey == "click") {
    bool value = false;
    bool isBool = propValue.ToBoolean(value);
    if (isBool) {
      SetClickable(value);
    }
    return true;
  }
  // TODO(etk): touch等处理的重载，业务需要时可加
#endif
  return false;
}

bool RichTextSpanView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
#ifdef OHOS_DRAW_TEXT
  return false;
#else
  if (propKey == "text") {
    auto& value = HRValueUtils::GetString(propValue);
    if (!text_.has_value() || value != text_) {
      GetLocalRootArkUINode()->SetSpanContent(value);
      text_ = value;
    }
    return true;
  } else if (propKey == HRNodeProps::COLOR) {
    uint32_t value = HRValueUtils::GetUint32(propValue);
    if (!color_.has_value() || value != color_) {
      GetLocalRootArkUINode()->SetFontColor(value);
      color_ = value;
    }
    return true;
  } else if (propKey == HRNodeProps::FONT_FAMILY) {
    auto& value = HRValueUtils::GetString(propValue);
    if (!fontFamily_.has_value() || value != fontFamily_) {
      GetLocalRootArkUINode()->SetFontFamily(value);
      fontFamily_ = value;
    }
    return true;
  } else if (propKey == HRNodeProps::FONT_SIZE) {
    float value = HRValueUtils::GetFloat(propValue);
    if (!fontSize_.has_value() || value != fontSize_) {
      GetLocalRootArkUINode()->SetFontSize(value);
      fontSize_ = value;
    }
    return true;
  } else if (propKey == HRNodeProps::FONT_STYLE) {
    auto& value = HRValueUtils::GetString(propValue);
    int32_t style = HRTextConvertUtils::FontStyleToArk(value);
    if (!fontStyle_.has_value() || style != fontStyle_) {
      GetLocalRootArkUINode()->SetFontStyle(style);
      fontStyle_ = style;
    }
    return true;
  } else if (propKey == HRNodeProps::FONT_WEIGHT) {
    auto& value = HRValueUtils::GetString(propValue);
    ArkUI_FontWeight weight = HRTextConvertUtils::FontWeightToArk(value);
    if (!fontWeight_.has_value() || weight != fontWeight_) {
      GetLocalRootArkUINode()->SetFontWeight(weight);
      fontWeight_ = weight;
    }
    return true;
  } else if (propKey == HRNodeProps::LETTER_SPACING) {
    float value = HRValueUtils::GetFloat(propValue);
    if (!letterSpacing_.has_value() || value != letterSpacing_) {
      GetLocalRootArkUINode()->SetTextLetterSpacing(value);
      letterSpacing_ = value;
    }
    return true;
  } else if (propKey == HRNodeProps::LINE_HEIGHT) {
    float value = HRValueUtils::GetFloat(propValue);
    if (!lineHeight_.has_value() || value != lineHeight_) {
      GetLocalRootArkUINode()->SetTextLineHeight(value);
      lineHeight_ = value;
    }
    return true;
  } else if (propKey == HRNodeProps::TEXT_DECORATION_LINE) {
    auto& value = HRValueUtils::GetString(propValue);
    decorationType_ = HRTextConvertUtils::TextDecorationTypeToArk(value);
    toSetTextDecoration_ = true;
    return true;
  } else if (propKey == HRNodeProps::TEXT_DECORATION_COLOR) {
    decorationColor_ = HRValueUtils::GetUint32(propValue);
    toSetTextDecoration_ = true;
    return true;
  } else if (propKey == HRNodeProps::TEXT_DECORATION_STYLE) {
    auto& value = HRValueUtils::GetString(propValue);
    decorationStyle_ = HRTextConvertUtils::TextDecorationStyleToArk(value);
    toSetTextDecoration_ = true;
    return true;
  } else if (propKey == HRNodeProps::TEXT_SHADOW_COLOR) {
    textShadowColor_ = HRValueUtils::GetUint32(propValue);
    toSetTextShadow = true;
    return true;
  } else if (propKey == HRNodeProps::TEXT_SHADOW_OFFSET) {
    HippyValueObjectType m;
    if (propValue.ToObject(m)) {
      textShadowOffsetX_ = HRValueUtils::GetFloat(m["width"]);
      textShadowOffsetY_ = HRValueUtils::GetFloat(m["height"]);
    }
    toSetTextShadow = true;
    return true;
  } else if (propKey == HRNodeProps::TEXT_SHADOW_RADIUS) {
    textShadowRadius_ = HRValueUtils::GetFloat(propValue);
    toSetTextShadow = true;
    return true;
  } else if (propKey == HRNodeProps::BACKGROUND_COLOR) {
    uint32_t value = HRValueUtils::GetUint32(propValue);
    GetLocalRootArkUINode()->SetSpanTextBackgroundStyle(value);
    return true;
  }
  // Not to set some attributes for text span.
  // For example: NODE_BACKGROUND_COLOR will return ARKUI_ERROR_CODE_ATTRIBUTE_OR_EVENT_NOT_SUPPORTED (106102)
  bool handled = SetEventProp(propKey, propValue);
  return handled;
#endif
}

void RichTextSpanView::OnSetPropsEndImpl() {
#ifdef OHOS_DRAW_TEXT
#else
  if (toSetTextDecoration_) {
    toSetTextDecoration_ = false;
    GetLocalRootArkUINode()->SetTextDecoration(decorationType_, decorationColor_, decorationStyle_);
  }
  if (toSetTextShadow) {
    toSetTextShadow = false;
    GetLocalRootArkUINode()->SetTextShadow(HRPixelUtils::DpToVp(textShadowRadius_), ARKUI_SHADOW_TYPE_COLOR, textShadowColor_, HRPixelUtils::DpToVp(textShadowOffsetX_), HRPixelUtils::DpToVp(textShadowOffsetY_));
  }
#endif
  BaseView::OnSetPropsEndImpl();
}

void RichTextSpanView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) {
  // Nothing to set for text span.
  // NODE_POSITION / NODE_WIDTH will return ARKUI_ERROR_CODE_ATTRIBUTE_OR_EVENT_NOT_SUPPORTED (106102)
}

void RichTextSpanView::ClearProps() {
  text_.reset();
  color_.reset();
  fontFamily_.reset();
  fontSize_.reset();
  fontStyle_.reset();
  fontWeight_.reset();
  letterSpacing_.reset();
  lineHeight_.reset();
}

void RichTextSpanView::SetClickable(bool flag) {
#ifdef OHOS_DRAW_TEXT
  if (HandleGestureBySelf()) {
    return;
  }
  if (flag) {
    auto parentView = GetParent().lock();
    if (parentView) {
      auto textView = std::static_pointer_cast<RichTextView>(parentView);
      textView->RegisterSpanClickEvent(shared_from_this());
    }
    auto weak_view = weak_from_this();
    eventClick_ = [weak_view]() {
      auto view = weak_view.lock();
      if (view) {
        auto spanView = std::static_pointer_cast<RichTextSpanView>(view);
        HRGestureDispatcher::HandleClickEvent(spanView->ctx_, spanView->tag_, HRNodeProps::ON_CLICK);
      }
    };
  } else {
    auto parentView = GetParent().lock();
    if (parentView) {
      auto textView = std::static_pointer_cast<RichTextView>(parentView);
      textView->UnregisterSpanClickEvent(shared_from_this());
    }
    eventClick_ = nullptr;
  }
#else
  BaseView::SetClickable(flag);
#endif
}

} // namespace native
} // namespace render
} // namespace hippy
