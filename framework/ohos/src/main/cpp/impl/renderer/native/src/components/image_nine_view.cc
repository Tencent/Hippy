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

#include "renderer/components/image_nine_view.h"
#include "oh_napi/ark_ts.h"
#include "oh_napi/oh_napi_object.h"
#include "renderer/utils/hr_event_utils.h"
#include "renderer/utils/hr_url_utils.h"
#include "renderer/utils/hr_value_utils.h"
#include "renderer/utils/hr_pixel_utils.h"
#include <native_drawing/drawing_pixel_map.h>
#include <native_drawing/drawing_rect.h>

namespace hippy {
inline namespace render {
inline namespace native {

ImageNineView::ImageNineView(std::shared_ptr<NativeRenderContext> &ctx) : ImageBaseView(ctx) {
}

ImageNineView::~ImageNineView() {}

CustomNode *ImageNineView::GetLocalRootArkUINode() {
  return customNode_.get();
}

void ImageNineView::CreateArkUINodeImpl() {
  customNode_ = std::make_shared<CustomNode>();
  customNode_->SetCustomNodeDelegate(this);
}

void ImageNineView::DestroyArkUINodeImpl() {
  customNode_->SetCustomNodeDelegate(nullptr);
  customNode_ = nullptr;
  ClearProps();
}

bool ImageNineView::RecycleArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  customNode_->SetCustomNodeDelegate(nullptr);
  customNode_->ResetAllAttributes();
  recycleView->cachedNodes_.resize(1);
  recycleView->cachedNodes_[0] = customNode_;
  customNode_ = nullptr;
  ClearProps();
  return true;
}

bool ImageNineView::ReuseArkUINodeImpl(std::shared_ptr<RecycleView> &recycleView) {
  if (recycleView->cachedNodes_.size() < 1) {
    return false;
  }
  // 图片组件衍生出整图和9图两种情况，这里做个判断
  if (!recycleView->cachedNodes_[0]->IsCustomNode()) {
    return false;
  }
  customNode_ = std::static_pointer_cast<CustomNode>(recycleView->cachedNodes_[0]);
  customNode_->SetCustomNodeDelegate(this);
  return true;
}

std::string ImageNineView::GetSrc() {
  return src_;
}

bool ImageNineView::SetPropImpl(const std::string &propKey, const HippyValue &propValue) {
  if (propKey == "src") {
    auto& value = HRValueUtils::GetString(propValue);
    if (value != src_) {
      src_ = value;
      FetchNineImage(value);
    }
    return true;
  } else if (propKey == "defaultSource") {
    auto& value = HRValueUtils::GetString(propValue);
    if (!value.empty()) {
      FetchAltNineImage(value);
      return true;
    }
    return false;
  } else if (propKey == "capInsets") {
    HippyValueObjectType m;
    if (propValue.IsObject() && propValue.ToObject(m)) {
      capInsetsLeft_ = HRValueUtils::GetInt32(m["left"]);
      capInsetsTop_ = HRValueUtils::GetInt32(m["top"]);
      capInsetsRight_ = HRValueUtils::GetInt32(m["right"]);
      capInsetsBottom_= HRValueUtils::GetInt32(m["bottom"]);
      return true;
    } else {
      return false;
    }
	}
	return BaseView::SetPropImpl(propKey, propValue);
}

void ImageNineView::UpdateRenderViewFrameImpl(const HRRect &frame, const HRPadding &padding) {
  BaseView::UpdateRenderViewFrameImpl(frame, padding);
}

void ImageNineView::OnForegroundDraw(ArkUI_NodeCustomEvent *event) {
  auto *drawContext = OH_ArkUI_NodeCustomEvent_GetDrawContextInDraw(event);
  if (drawContext == nullptr) {
    return;
  }
  auto *drawingHandle = reinterpret_cast<OH_Drawing_Canvas *>(OH_ArkUI_DrawContext_GetCanvas(drawContext));
  if (drawingHandle == nullptr) {
    return;
  }

  ArkUI_IntSize size = OH_ArkUI_DrawContext_GetSize(drawContext);

  auto info = ctx_->GetImageLoader()->GetPixelmapInfo(src_);
  if (info) {
    // 采样选项
    OH_Drawing_SamplingOptions* samplingOptions = OH_Drawing_SamplingOptionsCreate(
      OH_Drawing_FilterMode::FILTER_MODE_LINEAR,
      OH_Drawing_MipmapMode::MIPMAP_MODE_NONE);

    // 9块图之间的间隙
    int32_t SPACE_PIXEL = 0;

    // left top
    int32_t left = 0;
    int32_t top = 0;
    int32_t right = capInsetsLeft_;
    int32_t bottom = capInsetsTop_;
    int32_t dstLeft = 0;
    int32_t dstTop = 0;
    int32_t dstRight = (int32_t)HRPixelUtils::DpToPx((float)capInsetsLeft_);
    int32_t dstBottom = (int32_t)HRPixelUtils::DpToPx((float)capInsetsTop_);
    OH_Drawing_Rect *src = OH_Drawing_RectCreate((float)left, (float)top, (float)right, (float)bottom);
    OH_Drawing_Rect *dst = OH_Drawing_RectCreate((float)dstLeft, (float)dstTop, (float)dstRight, (float)dstBottom);
    OH_Drawing_CanvasDrawPixelMapRect(drawingHandle, info->pixelmap_, src, dst, samplingOptions);
    OH_Drawing_RectDestroy(src);
    OH_Drawing_RectDestroy(dst);
    
    // center top
    left = capInsetsLeft_;
    top = 0;
    right = (int32_t)info->width_ - capInsetsRight_;
    bottom = capInsetsTop_;
    dstLeft = (int32_t)HRPixelUtils::DpToPx((float)capInsetsLeft_) - SPACE_PIXEL;
    dstTop = 0;
    dstRight = size.width - (int32_t)HRPixelUtils::DpToPx((float)capInsetsRight_) + SPACE_PIXEL;
    dstBottom = (int32_t)HRPixelUtils::DpToPx((float)capInsetsTop_);
    dstLeft = dstLeft < 0 ? 0 : dstLeft;
    dstRight = dstRight > size.width ? size.width : dstRight;
    src = OH_Drawing_RectCreate((float)left, (float)top, (float)right, (float)bottom);
    dst = OH_Drawing_RectCreate((float)dstLeft, (float)dstTop, (float)dstRight, (float)dstBottom);
    OH_Drawing_CanvasDrawPixelMapRect(drawingHandle, info->pixelmap_, src, dst, samplingOptions);
    OH_Drawing_RectDestroy(src);
    OH_Drawing_RectDestroy(dst);
    
    // right top
    left = (int32_t)info->width_ - capInsetsRight_;
    top = 0;
    right = (int32_t)info->width_;
    bottom = capInsetsTop_;
    dstLeft = size.width - (int32_t)HRPixelUtils::DpToPx((float)capInsetsRight_);
    dstTop = 0;
    dstRight = size.width;
    dstBottom = (int32_t)HRPixelUtils::DpToPx((float)capInsetsTop_);
    src = OH_Drawing_RectCreate((float)left, (float)top, (float)right, (float)bottom);
    dst = OH_Drawing_RectCreate((float)dstLeft, (float)dstTop, (float)dstRight, (float)dstBottom);
    OH_Drawing_CanvasDrawPixelMapRect(drawingHandle, info->pixelmap_, src, dst, samplingOptions);
    OH_Drawing_RectDestroy(src);
    OH_Drawing_RectDestroy(dst);
    
    // left center
    left = 0;
    top = capInsetsTop_;
    right = capInsetsLeft_;
    bottom = (int32_t)info->height_ - capInsetsBottom_;
    dstLeft = 0;
    dstTop = (int32_t)HRPixelUtils::DpToPx((float)capInsetsTop_) - SPACE_PIXEL;
    dstRight = (int32_t)HRPixelUtils::DpToPx((float)capInsetsLeft_);
    dstBottom = size.height - (int32_t)HRPixelUtils::DpToPx((float)capInsetsBottom_) + SPACE_PIXEL;
    dstTop = dstTop < 0 ? 0 : dstTop;
    dstBottom = dstBottom > size.height ? size.height : dstBottom;
    src = OH_Drawing_RectCreate((float)left, (float)top, (float)right, (float)bottom);
    dst = OH_Drawing_RectCreate((float)dstLeft, (float)dstTop, (float)dstRight, (float)dstBottom);
    OH_Drawing_CanvasDrawPixelMapRect(drawingHandle, info->pixelmap_, src, dst, samplingOptions);
    OH_Drawing_RectDestroy(src);
    OH_Drawing_RectDestroy(dst);
    
    // center center
    left = capInsetsLeft_;
    top = capInsetsTop_;
    right = (int32_t)info->width_ - capInsetsRight_;
    bottom = (int32_t)info->height_ - capInsetsBottom_;
    dstLeft = (int32_t)HRPixelUtils::DpToPx((float)capInsetsLeft_) - SPACE_PIXEL;
    dstTop = (int32_t)HRPixelUtils::DpToPx((float)capInsetsTop_) - SPACE_PIXEL;
    dstRight = size.width - (int32_t)HRPixelUtils::DpToPx((float)capInsetsRight_) + SPACE_PIXEL;
    dstBottom = size.height - (int32_t)HRPixelUtils::DpToPx((float)capInsetsBottom_) + SPACE_PIXEL;
    dstLeft = dstLeft < 0 ? 0 : dstLeft;
    dstRight = dstRight > size.width ? size.width : dstRight;
    dstTop = dstTop < 0 ? 0 : dstTop;
    dstBottom = dstBottom > size.height ? size.height : dstBottom;
    src = OH_Drawing_RectCreate((float)left, (float)top, (float)right, (float)bottom);
    dst = OH_Drawing_RectCreate((float)dstLeft, (float)dstTop, (float)dstRight, (float)dstBottom);
    OH_Drawing_CanvasDrawPixelMapRect(drawingHandle, info->pixelmap_, src, dst, samplingOptions);
    OH_Drawing_RectDestroy(src);
    OH_Drawing_RectDestroy(dst);
    
    // right center
    left = (int32_t)info->width_ - capInsetsRight_;
    top = capInsetsTop_;
    right = (int32_t)info->width_;
    bottom = (int32_t)info->height_ - capInsetsBottom_;
    dstLeft = size.width - (int32_t)HRPixelUtils::DpToPx((float)capInsetsRight_);
    dstTop = (int32_t)HRPixelUtils::DpToPx((float)capInsetsTop_) - SPACE_PIXEL;
    dstRight = size.width;
    dstBottom = size.height - (int32_t)HRPixelUtils::DpToPx((float)capInsetsBottom_) + SPACE_PIXEL;
    dstTop = dstTop < 0 ? 0 : dstTop;
    dstBottom = dstBottom > size.height ? size.height : dstBottom;
    src = OH_Drawing_RectCreate((float)left, (float)top, (float)right, (float)bottom);
    dst = OH_Drawing_RectCreate((float)dstLeft, (float)dstTop, (float)dstRight, (float)dstBottom);
    OH_Drawing_CanvasDrawPixelMapRect(drawingHandle, info->pixelmap_, src, dst, samplingOptions);
    OH_Drawing_RectDestroy(src);
    OH_Drawing_RectDestroy(dst);
    
    // left bottom
    left = 0;
    top = (int32_t)info->height_ - capInsetsBottom_;
    right = capInsetsLeft_;
    bottom = (int32_t)info->height_;
    dstLeft = 0;
    dstTop = size.height - (int32_t)HRPixelUtils::DpToPx((float)capInsetsBottom_);
    dstRight = (int32_t)HRPixelUtils::DpToPx((float)capInsetsLeft_);
    dstBottom = size.height;
    src = OH_Drawing_RectCreate((float)left, (float)top, (float)right, (float)bottom);
    dst = OH_Drawing_RectCreate((float)dstLeft, (float)dstTop, (float)dstRight, (float)dstBottom);
    OH_Drawing_CanvasDrawPixelMapRect(drawingHandle, info->pixelmap_, src, dst, samplingOptions);
    OH_Drawing_RectDestroy(src);
    OH_Drawing_RectDestroy(dst);
    
    // center bottom
    left = capInsetsLeft_;
    top = (int32_t)info->height_ - capInsetsBottom_;
    right = (int32_t)info->width_ - capInsetsRight_;
    bottom = (int32_t)info->height_;
    dstLeft = (int32_t)HRPixelUtils::DpToPx((float)capInsetsLeft_) - SPACE_PIXEL;
    dstTop = size.height - (int32_t)HRPixelUtils::DpToPx((float)capInsetsBottom_);
    dstRight = size.width - (int32_t)HRPixelUtils::DpToPx((float)capInsetsRight_) + SPACE_PIXEL;
    dstBottom = size.height;
    dstLeft = dstLeft < 0 ? 0 : dstLeft;
    dstRight = dstRight > size.width ? size.width : dstRight;
    src = OH_Drawing_RectCreate((float)left, (float)top, (float)right, (float)bottom);
    dst = OH_Drawing_RectCreate((float)dstLeft, (float)dstTop, (float)dstRight, (float)dstBottom);
    OH_Drawing_CanvasDrawPixelMapRect(drawingHandle, info->pixelmap_, src, dst, samplingOptions);
    OH_Drawing_RectDestroy(src);
    OH_Drawing_RectDestroy(dst);
    
    // right bottom
    left = (int32_t)info->width_ - capInsetsRight_;
    top = (int32_t)info->height_ - capInsetsBottom_;
    right = (int32_t)info->width_;
    bottom = (int32_t)info->height_;
    dstLeft = size.width - (int32_t)HRPixelUtils::DpToPx((float)capInsetsRight_);
    dstTop = size.height - (int32_t)HRPixelUtils::DpToPx((float)capInsetsBottom_);
    dstRight = size.width;
    dstBottom = size.height;
    src = OH_Drawing_RectCreate((float)left, (float)top, (float)right, (float)bottom);
    dst = OH_Drawing_RectCreate((float)dstLeft, (float)dstTop, (float)dstRight, (float)dstBottom);
    OH_Drawing_CanvasDrawPixelMapRect(drawingHandle, info->pixelmap_, src, dst, samplingOptions);
    OH_Drawing_RectDestroy(src);
    OH_Drawing_RectDestroy(dst);
    
    // destroy
    OH_Drawing_SamplingOptionsDestroy(samplingOptions);
  }
}

void ImageNineView::OnFetchLocalPathAsyncResult(bool success, const std::string &path) {
  if (success) {
    LoadNineImage(path);
  }
}

void ImageNineView::FetchAltNineImage(const std::string &imageUrl) {
  if (imageUrl.size() > 0) {
    LoadNineImage(imageUrl);
  }
}

void ImageNineView::FetchNineImage(const std::string &imageUrl) {
  if (imageUrl.size() > 0) {
    auto localPath = GetLocalPathFromAdapter(imageUrl);
    if (localPath.length() > 0) {
      LoadNineImage(imageUrl);
    } else {
      if (!GetLocalPathAsyncFromAdapter(imageUrl)) {
        LoadNineImage(imageUrl);
      }
    }
	}
}

void ImageNineView::LoadNineImage(const std::string &imageUrl) {
  ctx_->GetImageLoader()->LoadImage(imageUrl, [WEAK_THIS](bool is_success) {
    DEFINE_AND_CHECK_SELF(ImageNineView)
    if (is_success && self->customNode_) {
      self->customNode_->MarkDirty(NODE_NEED_RENDER);
    }
  });
}

void ImageNineView::ClearProps() {
  src_.clear();
  capInsetsLeft_ = 0;
  capInsetsTop_ = 0;
  capInsetsRight_ = 0;
  capInsetsBottom_ = 0;
}

} // namespace native
} // namespace render
} // namespace hippy
