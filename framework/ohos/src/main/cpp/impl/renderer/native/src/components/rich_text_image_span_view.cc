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

#include "renderer/components/rich_text_image_span_view.h"
#include "renderer/dom_node/hr_node_props.h"
#include "renderer/utils/hr_text_convert_utils.h"
#include "renderer/utils/hr_url_utils.h"
#include "renderer/utils/hr_value_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

RichTextImageSpanView::RichTextImageSpanView(std::shared_ptr<NativeRenderContext> &ctx) : ImageBaseView(ctx) {
}

RichTextImageSpanView::~RichTextImageSpanView() {}

ImageSpanNode *RichTextImageSpanView::GetLocalRootArkUINode() {
  return imageSpanNode_.get();
}

void RichTextImageSpanView::CreateArkUINodeImpl() {
  imageSpanNode_ = std::make_shared<ImageSpanNode>();
  imageSpanNode_->SetImageObjectFit(ARKUI_OBJECT_FIT_FILL);
}

void RichTextImageSpanView::DestroyArkUINodeImpl() {
  imageSpanNode_ = nullptr;
  ClearProps();
}

bool RichTextImageSpanView::RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  imageSpanNode_->ResetAllAttributes();
  recycleView->cachedNodes_.resize(1);
  recycleView->cachedNodes_[0] = imageSpanNode_;
  imageSpanNode_ = nullptr;
  ClearProps();
  return true;
}

bool RichTextImageSpanView::ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  if (recycleView->cachedNodes_.size() < 1) {
    return false;
  }
  imageSpanNode_ = std::static_pointer_cast<ImageSpanNode>(recycleView->cachedNodes_[0]);
  imageSpanNode_->SetImageObjectFit(ARKUI_OBJECT_FIT_FILL);
  return true;
}

bool RichTextImageSpanView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == HRNodeProps::WIDTH) {
    auto value = HRValueUtils::GetFloat(propValue);
    GetLocalRootArkUINode()->SetWidth(value);
    return true;
  } else if (propKey == HRNodeProps::HEIGHT) {
    auto value = HRValueUtils::GetFloat(propValue);
    GetLocalRootArkUINode()->SetHeight(value);
    return true;
  } else if (propKey == "verticalAlign") {
    auto& value = HRValueUtils::GetString(propValue);
    if (value.size() > 0) {
      ArkUI_ImageSpanAlignment align = ARKUI_IMAGE_SPAN_ALIGNMENT_BASELINE;
      if (value == "top") {
        align = ARKUI_IMAGE_SPAN_ALIGNMENT_TOP;
      } else if (value == "middle") {
        align = ARKUI_IMAGE_SPAN_ALIGNMENT_CENTER;
      } else if (value == "bottom") {
        align = ARKUI_IMAGE_SPAN_ALIGNMENT_BOTTOM;
      } else if (value == "baseline") {
        align = ARKUI_IMAGE_SPAN_ALIGNMENT_BASELINE;
      }
      GetLocalRootArkUINode()->SetVerticalAlignment(align);
    }
    return true;
  } else if (propKey == "src") {
    auto& value = HRValueUtils::GetString(propValue);
    if (value != src_) {
      src_ = value;
      FetchImage(value);
    }
    return true;
  } else if (propKey == "defaultSource") {
    auto& value = HRValueUtils::GetString(propValue);
    if (!value.empty()) {
      FetchAltImage(value);
      return true;
    }
    return false;
  } else {
    bool handled = SetEventProp(propKey, propValue);
    return handled;
  }

  // Not to set some attributes for text span.
}

void RichTextImageSpanView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) {
  if (IsValidFrame(frame)) {
    // 1 绘制Text时：ImageSpan是单独的组件放到容器组件里，必须有位置指定。
    // 2 使用Text组件时：ImageSpan和Span都由父节点Text确定位置，不需要指定位置。
    // 使用Text组件时的问题：测量用的Drawing API，显示用的组件会导致不一致，
    // 如果不指定位置，由于行高不一致可能y位置误差，如果指定位置，由于主题字体不一致可能x位置误差。
#ifdef OHOS_DRAW_TEXT
    GetLocalRootArkUINode()->SetPosition(HRPosition(frame.x, frame.y));
#endif
    return;
  }
}

bool RichTextImageSpanView::IsValidFrame(const HRRect &frame) {
  if (frame.x != 0 || frame.y != 0) { // c 测得span的位置
    return true;
  }
  return false;
}

void RichTextImageSpanView::ClearProps() {
  src_.clear();
}

void RichTextImageSpanView::SetSourcesOrAlt(const std::string &imageUrl, bool isSources) {
  auto bundlePath = ctx_->GetNativeRender().lock()->GetBundlePath();
  auto url = HRUrlUtils::ConvertImageUrl(bundlePath, ctx_->IsRawFile(), ctx_->GetResModuleName(), imageUrl);
  if (isSources) {
    GetLocalRootArkUINode()->SetSources(url);
  } else {
    GetLocalRootArkUINode()->SetAlt(url);
  }
}

} // namespace native
} // namespace render
} // namespace hippy
