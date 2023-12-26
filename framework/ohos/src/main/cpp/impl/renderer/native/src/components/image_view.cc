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

#include "renderer/components/image_view.h"
#include "renderer/dom_node/hr_node_props.h"
#include "renderer/utils/hr_event_utils.h"
#include "renderer/utils/hr_url_utils.h"
#include "renderer/utils/hr_value_utils.h"
#include "renderer/utils/hr_pixel_utils.h"

namespace hippy {
inline namespace render {
inline namespace native {

ImageView::ImageView(std::shared_ptr<NativeRenderContext> &ctx) : BaseView(ctx) {
}

ImageView::~ImageView() {}

ImageNode *ImageView::GetLocalRootArkUINode() {
  return imageNode_.get();
}

void ImageView::CreateArkUINodeImpl() {
  imageNode_ = std::make_shared<ImageNode>();
  imageNode_->SetNodeDelegate(this);
  imageNode_->SetDraggable(false);
}

void ImageView::DestroyArkUINodeImpl() {
  imageNode_->SetNodeDelegate(nullptr);
  imageNode_ = nullptr;
  ClearProps();
}

bool ImageView::RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  imageNode_->SetNodeDelegate(nullptr);
  imageNode_->ResetAllAttributes();
  recycleView->cachedNodes_.resize(1);
  recycleView->cachedNodes_[0] = imageNode_;
  imageNode_ = nullptr;
  ClearProps();
  return true;
}

bool ImageView::ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  if (recycleView->cachedNodes_.size() < 1) {
    return false;
  }
  imageNode_ = std::static_pointer_cast<ImageNode>(recycleView->cachedNodes_[0]);
  imageNode_->SetNodeDelegate(this);
  return true;
}

std::string ImageView::GetSrc() {
  return src_;
}

bool ImageView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == "src") {
    auto value = HRValueUtils::GetString(propValue);
    if (value != src_) {
      src_ = value;
      FetchImage(value);
    }
    return true;
  } else if (propKey == "resizeMode") {
    HRImageResizeMode mode = HRImageResizeMode::Contain;
    auto value = HRValueUtils::GetString(propValue);
    if (value == "center") {
      mode = HRImageResizeMode::Center;
    } else if (value == "contain") {
      mode = HRImageResizeMode::Contain;
    } else if (value == "cover") {
      mode = HRImageResizeMode::Cover;
		} else if (value == "stretch") {
			mode = HRImageResizeMode::FitXY;
		}
    GetLocalRootArkUINode()->SetResizeMode(mode);
    return true;
  } else if (propKey == "defaultSource") {
    auto value = HRValueUtils::GetString(propValue);
    if (!value.empty()) {
      FetchAltImage(value);
      return true;
    }
    return false;
  } else if (propKey == "tintColor") {
    uint32_t value = HRValueUtils::GetUint32(propValue);
    GetLocalRootArkUINode()->SetTintColor(value);
    return true;
  } else if (propKey == "tintColorBlendMode") {
    auto value = HRValueUtils::GetInt32(propValue);
    GetLocalRootArkUINode()->SetTintColorBlendMode(value);
    return true;
  } else if (propKey == "capInsets") {
    HippyValueObjectType m;
    if (propValue.ToObject(m)) {
      auto left = HRValueUtils::GetFloat(m["left"]);
      auto top = HRValueUtils::GetFloat(m["top"]);
      auto right = HRValueUtils::GetFloat(m["right"]);
      auto bottom = HRValueUtils::GetFloat(m["bottom"]);
      GetLocalRootArkUINode()->SetResizeable(left, top, right, bottom);
    } else {
      return false;
    }
	} else if (propKey == "blur") {
		auto value = HRPixelUtils::DpToPx(HRValueUtils::GetFloat(propValue));
    GetLocalRootArkUINode()->SetBlur(value);
	} else if (propKey == "draggable") {
		auto value = HRValueUtils::GetBool(propValue, false);
    GetLocalRootArkUINode()->SetDraggable(value);
	}
	return BaseView::SetPropImpl(propKey, propValue);
}

void ImageView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) {
  BaseView::UpdateRenderViewFrameImpl(frame, padding);
}

void ImageView::FetchAltImage(const std::string &imageUrl) {
  if (imageUrl.size() > 0) {
    auto bundlePath = ctx_->GetNativeRender().lock()->GetBundlePath();
    auto url = HRUrlUtils::ConvertImageUrl(bundlePath, ctx_->IsRawFile(), ctx_->GetResModuleName(), imageUrl);
    GetLocalRootArkUINode()->SetAlt(url);
  }
}

void ImageView::FetchImage(const std::string &imageUrl) {
  if (imageUrl.size() > 0) {
    auto bundlePath = ctx_->GetNativeRender().lock()->GetBundlePath();
    auto url = HRUrlUtils::ConvertImageUrl(bundlePath, ctx_->IsRawFile(), ctx_->GetResModuleName(), imageUrl);
    GetLocalRootArkUINode()->SetSources(url);
	}
}

void ImageView::OnComplete(float width, float height) {
  HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_IMAGE_ON_LOAD, nullptr);
  HippyValueObjectType paramsObj;
  paramsObj.insert_or_assign("success", 1);
  HippyValueObjectType imageSizeObj;
  imageSizeObj.insert_or_assign("width", width);
  imageSizeObj.insert_or_assign("height", height);
  paramsObj.insert_or_assign("image", imageSizeObj);
  std::shared_ptr<HippyValue> params = std::make_shared<HippyValue>(paramsObj);
  HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_IMAGE_LOAD_END, params);
}

void ImageView::OnError(int32_t errorCode) {
  FOOTSTONE_DLOG(INFO) << tag_ << "ImageView onErrorCode :" << errorCode;
  HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_IMAGE_LOAD_ERROR, nullptr);
  HippyValueObjectType paramsObj;
  paramsObj.insert_or_assign("success", 0);
  paramsObj.insert_or_assign("errorCode", errorCode);
  std::shared_ptr<HippyValue> params = std::make_shared<HippyValue>(paramsObj);
  HREventUtils::SendComponentEvent(ctx_, tag_, HREventUtils::EVENT_IMAGE_LOAD_END, params);
}

void ImageView::ClearProps() {
  src_.clear();
}

} // namespace native
} // namespace render
} // namespace hippy
