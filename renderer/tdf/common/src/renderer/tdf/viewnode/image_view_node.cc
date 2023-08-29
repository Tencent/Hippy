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

#include "renderer/tdf/viewnode/image_view_node.h"

#include "core/common/image.h"
#include "dom/node_props.h"
#include "renderer/tdf/tdf_render_manager.h"
#include "renderer/tdf/viewnode/base64_image_loader.h"
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wextra-semi"
#include "tdfui/view/image_view.h"
#pragma clang diagnostic pop

namespace hippy {
inline namespace render {
inline namespace tdf {

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunused-const-variable"
constexpr const char kImage[] = "Image";
inline namespace image {
constexpr const char kBackgroundColor[] = "backgroundColor";        // int
constexpr const char kCapInsets[] = "capInsets";                    // HippyMap
constexpr const char kDefaultSource[] = "defaultSource";            // String
constexpr const char kHeight[] = "height";                          // float
constexpr const char kImageType[] = "imageType";                    // String
constexpr const char kLeft[] = "left";                              // float
constexpr const char kOnError[] = "onError";                        // boolean
constexpr const char kOnLoad[] = "onLoad";                          // boolean
constexpr const char kOnLoadEnd[] = "onLoadEnd";                    // boolean
constexpr const char kOnLoadStart[] = "onLoadStart";                // boolean
constexpr const char kOnProgress[] = "onProgress";                  // boolean
constexpr const char kResizeMode[] = "resizeMode";                  // String
constexpr const char kSrc[] = "src";                                // String
constexpr const char kTintColor[] = "tintColor";                    // int
constexpr const char kTintColorBlendMode[] = "tintColorBlendMode";  // int
constexpr const char kTop[] = "top";                                // float
constexpr const char kVerticalAlignment[] = "verticalAlignment";    // int
constexpr const char kWidth[] = "width";                            // float
constexpr const char kScaleTypeCover[] = "cover";
constexpr const char kScaleTypeContain[] = "contain";
constexpr const char kScaleTypeStretch[] = "stretch";
constexpr const char kScaleTypeRepeat[] = "repeat";
constexpr const char kScaleTypeCenter[] = "center";
constexpr const char kError[] = "error";
constexpr const char kLoad[] = "load";
constexpr const char kLoadEnd[] = "loadEnd";
constexpr const char kLoadStart[] = "loadStart";
constexpr const char kProgress[] = "progress";
}  // namespace image
#pragma clang diagnostic pop

constexpr const char kAssetPrex[] = "hpfile://./";

std::shared_ptr<tdfcore::View> ImageViewNode::CreateView(const std::shared_ptr<ViewContext> &context) {
  auto image_view = TDF_MAKE_SHARED(tdfcore::ImageView, context);
  image_view->SetClipToBounds(true);
  image_view->SetScaleType(tdfcore::ScaleType::kAspectFill);
  return image_view;
}

void ImageViewNode::HandleStyleUpdate(const DomStyleMap &dom_style, const DomDeleteProps& dom_delete_props) {
  ViewNode::HandleStyleUpdate(dom_style, dom_delete_props);

  if (auto it = dom_style.find(hippy::kImageResizeMode); it != dom_style.end() && it->second != nullptr) {
    SetScaleType(it->second->ToStringChecked());
  }
  if (auto it = dom_style.find(hippy::kIMAGEDefaultSource); it != dom_style.end() && it->second != nullptr) {
    SetDefaultSrc(it->second->ToStringChecked());
  }
  if (auto it = dom_style.find(hippy::kImageSrc);
      it != dom_style.end() && it->second != nullptr && !it->second->IsUndefined()) {
    SetSrc(it->second->ToStringChecked());
  }
}

void ImageViewNode::SetScaleType(const std::string &type) {
  tdfcore::ScaleType scale_type;
  if (type == kScaleTypeCover) {
    scale_type = tdfcore::ScaleType::kAspectFill;
  } else if (type == kScaleTypeStretch) {
    scale_type = tdfcore::ScaleType::kStretch;
  } else {
    scale_type = tdfcore::ScaleType::kAspectFit;
  }
  GetView<tdfcore::ImageView>()->SetScaleType(scale_type);
}

void ImageViewNode::SetDefaultSrc(const std::string &src) {
  default_src_ = src;
  LoadImage(default_src_);
}

void ImageViewNode::SetSrc(const std::string &src) {
  image_src_ = src;
  LoadImage(image_src_);
}

void ImageViewNode::LoadImage(std::string url) {
  FOOTSTONE_LOG(INFO) << "---ImageViewNode::LoadImage--- src = " << url;
  // base64 image
  if (url.rfind(Base64ImageLoader::GetScheme(), 0) == 0) {
    url = Base64ImageLoader::GetScheme() + "://" + url;
  }

  // asset image
  if (url.rfind(kAssetPrex, 0) == 0) {
    auto index = url.find(kAssetPrex);
    auto length = index + strlen(kAssetPrex);
    url = "asset://" + url.substr(length);
  }

  if (auto image_view = GetView<tdfcore::ImageView>()) {
    if (auto current_image = image_view->GetImage()) {
      auto current_url = current_image->GetUrl();
      if (!current_url.empty() && current_url == url) {
        return;
      }
    }

    image_view->SetImageLoadStartCallback([WEAK_THIS]() {
      DEFINE_AND_CHECK_SELF(ImageViewNode)
      // send loadStart event
      self->SendUIDomEvent(kLoadStart);
    });

    image_view->SetImageLoadFinishCallback([WEAK_THIS, image_view](tdfcore::ImageError error) {
      DEFINE_AND_CHECK_SELF(ImageViewNode)
      if (error == tdfcore::ImageError::kNone) {
        // send load event
        self->SendUIDomEvent(kLoad);

        // send loadEnd event
        auto frame = image_view->GetFrame();
        DomValueObjectType size;
        size["width"] = frame.Width();
        size["height"] = frame.Height();
        DomValueObjectType param;
        param["success"] = 1;
        param["image"] = size;
        self->SendUIDomEvent(kLoadEnd, std::make_shared<footstone::HippyValue>(param));
      } else {
        // send error event
        self->SendUIDomEvent(kError);

        // send loadEnd event
        DomValueObjectType param;
        param["success"] = 0;
        self->SendUIDomEvent(kLoadEnd, std::make_shared<footstone::HippyValue>(param));
      }
    });

    image_view->SetImageLoadProgressCallback([WEAK_THIS](float progress) {
      DEFINE_AND_CHECK_SELF(ImageViewNode)
      // send progress event
      DomValueObjectType param;
      param["loaded"] = progress;
      param["total"] = 1.f;
      self->SendUIDomEvent(kProgress, std::make_shared<footstone::HippyValue>(param));
    });

    image_view->SetImage(TDF_MAKE_SHARED(tdfcore::Image, url));
  }
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
