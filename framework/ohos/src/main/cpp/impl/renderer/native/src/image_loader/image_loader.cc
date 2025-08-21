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

#include "renderer/image_loader/image_loader.h"
#include "footstone/logging.h"
#include "dom/root_node.h"
#include "footstone/string_view.h"
#include "renderer/utils/hr_url_utils.h"
#include "renderer/native_render_context.h"
#include <multimedia/image_framework/image/image_common.h>
#include <multimedia/image_framework/image/image_source_native.h>
#include <multimedia/image_framework/image/pixelmap_native.h>
#include <native_drawing/drawing_pixel_map.h>

using HippyValue = footstone::value::HippyValue;
using DomManager = hippy::dom::DomManager;
using RootNode = hippy::dom::RootNode;
using string_view = footstone::string_view;

namespace hippy {
inline namespace render {
inline namespace native {

ImageLoader::~ImageLoader() {
  for (auto it : pixelmapInfoMap_) {
    OH_Drawing_PixelMap *pixelmap = it.second->pixelmap_;
    if (pixelmap) {
      OH_Drawing_PixelMapDissolve(pixelmap);
      OH_PixelmapNative_Release(it.second->pixelmapNative_);
    }
  }
}

void ImageLoader::LoadImage(const std::string &uri, LoadImageCallback result_cb) {
  if (GetPixelmapInfo(uri)) {
    result_cb(true);
    return;
  }
  
  if (IsInDownload(uri)) {
    AddUrlListener(uri, result_cb);
    return;
  } else {
    AddToDownloadSet(uri);
  }

  auto ctx = weak_ctx_.lock();
  if (!ctx) {
    result_cb(false);
    return;
  }

  auto &root_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  bool ret = root_map.Find(ctx->GetRootId(), root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "LoadImage root_node is nullptr";
    result_cb(false);
    return;
  }
  
  std::shared_ptr<DomManager> dom_manager = root_node->GetDomManager().lock();
  if (dom_manager == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "LoadImage dom_manager is nullptr";
    result_cb(false);
    return;
  }

  auto render = ctx->GetNativeRender().lock();
  if (!render) {
    result_cb(false);
    return;
  }

  auto loader = render->GetUriLoader().lock();
  FOOTSTONE_CHECK(loader);
  if (!loader) {
    result_cb(false);
    return;
  }

  // 路径需要处理，如：hpfile://./assets/bg.png
  auto bundlePath = render->GetBundlePath();
  auto imageUrl = HRUrlUtils::ConvertImageUrl(bundlePath, ctx->IsRawFile(), ctx->GetResModuleName(), uri);

  auto cb = [WEAK_THIS, uri, result_cb](UriLoader::RetCode ret_code,
                        const std::unordered_map<std::string, std::string>&,
                        UriLoader::bytes content) {
    // in main thread
    DEFINE_AND_CHECK_SELF(ImageLoader)
    if (ret_code == UriLoader::RetCode::Success && content.length() > 0) {
      if (!self->GetPixelmapInfo(uri)) {
        self->BuildPixmap(uri, content);
      }
      result_cb(true);
      self->NotifyListeners(uri, true);
      self->RemoveFromDownloadSet(uri);
    } else {
      FOOTSTONE_LOG(ERROR) << "LoadImage request content error, uri: " << uri 
        << ", code: " << (int)ret_code << ", content len: " << content.length();
      result_cb(false);
    }
  };

  std::vector<std::function<void()>> ops;
  ops.emplace_back([loader, imageUrl, cb] {
    string_view url_str(imageUrl);
    loader->RequestUntrustedContent(url_str, {}, cb);
  });
  dom_manager->PostTask(Scene(std::move(ops)));
}

void ImageLoader::BuildPixmap(const std::string &uri, const std::string &content) {
  // 创建ImageSource实例
  OH_ImageSourceNative *source = nullptr;
  Image_ErrorCode errCode = OH_ImageSourceNative_CreateFromData((uint8_t*)content.c_str(), content.size(), &source);
  if (errCode != IMAGE_SUCCESS) {
    FOOTSTONE_LOG(ERROR) << "ImageSourceNative create failed, errCode: " << errCode;
    return;
  }

  // 创建定义图片信息的结构体对象，并获取图片信息
  OH_ImageSource_Info *imageInfo = nullptr;
  OH_ImageSourceInfo_Create(&imageInfo);
  errCode = OH_ImageSourceNative_GetImageInfo(source, 0, imageInfo);
  if (errCode != IMAGE_SUCCESS) {
    FOOTSTONE_LOG(ERROR) << "ImageSourceNative get image info failed, errCode: " << errCode;
    OH_ImageSourceInfo_Release(imageInfo);
    OH_ImageSourceNative_Release(source);
    return;
  }

  // 获取指定属性键的值
  uint32_t width = 0, height = 0;
  OH_ImageSourceInfo_GetWidth(imageInfo, &width);
  OH_ImageSourceInfo_GetHeight(imageInfo, &height);
  OH_ImageSourceInfo_Release(imageInfo);
  // FOOTSTONE_LOG(INFO) << "ImageSourceNative get image info success, w: " << width << ", h: " << height;

  // 通过图片解码参数创建PixelMap对象
  OH_DecodingOptions *ops = nullptr;
  OH_DecodingOptions_Create(&ops);
  // 设置为AUTO会根据图片资源格式解码，如果图片资源为HDR资源则会解码为HDR的pixelmap
  OH_DecodingOptions_SetDesiredDynamicRange(ops, IMAGE_DYNAMIC_RANGE_AUTO);

  OH_PixelmapNative *resPixmap = nullptr;
  errCode = OH_ImageSourceNative_CreatePixelmap(source, ops, &resPixmap);
  OH_DecodingOptions_Release(ops);
  if (errCode != IMAGE_SUCCESS) {
    FOOTSTONE_LOG(ERROR) << "ImageSourceNative create pixmap failed, errCode: " << errCode;
    OH_ImageSourceNative_Release(source);
    return;
  }

  if (resPixmap) {
    OH_Drawing_PixelMap *pixelmap = OH_Drawing_PixelMapGetFromOhPixelMapNative(resPixmap);
    if (pixelmap) {
      auto info = std::make_shared<PixelMapInfo>();
      info->width_ = width;
      info->height_ = height;
      info->pixelmapNative_ = resPixmap;
      info->pixelmap_ = pixelmap;
      pixelmapInfoMap_[uri] = info;
    } else {
      OH_PixelmapNative_Release(resPixmap);
    }
  }

  // 释放ImageSource实例
  OH_ImageSourceNative_Release(source);
}

std::shared_ptr<PixelMapInfo> ImageLoader::GetPixelmapInfo(const std::string &uri) {
  auto it = pixelmapInfoMap_.find(uri);
  return it != pixelmapInfoMap_.end() ? it->second : nullptr;
}

void ImageLoader::AddUrlListener(const std::string &uri, LoadImageCallback result_cb) {
  auto it = uriListeners_.find(uri);
  if (it != uriListeners_.end()) {
    auto &listeners = it->second;
    listeners.push_back(result_cb);
  } else {
    std::vector<LoadImageCallback> listeners;
    listeners.push_back(result_cb);
    uriListeners_[uri] = listeners;
  }
}

void ImageLoader::NotifyListeners(const std::string &uri, bool is_success) {
  auto it = uriListeners_.find(uri);
  if (it != uriListeners_.end()) {
    auto &listeners = it->second;
    for (auto cb : listeners) {
      cb(is_success);
    }
    uriListeners_.erase(it);
  }
}

bool ImageLoader::IsInDownload(const std::string &uri) {
  return downloadUris_.find(uri) != downloadUris_.end();
}

void ImageLoader::AddToDownloadSet(const std::string &uri) {
  downloadUris_.insert(uri);
}

void ImageLoader::RemoveFromDownloadSet(const std::string &uri) {
  downloadUris_.erase(uri);
}

} // namespace native
} // namespace render
} // namespace hippy
