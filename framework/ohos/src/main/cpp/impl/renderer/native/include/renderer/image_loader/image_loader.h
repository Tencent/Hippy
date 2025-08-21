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

#include "footstone/hippy_value.h"
#include "renderer/text_measure/font_collection_manager.h"
#include <multimedia/image_framework/image/pixelmap_native.h>
#include <string>
#include <map>
#include <native_drawing/drawing_types.h>

namespace hippy {
inline namespace render {
inline namespace native {

using HippyValue = footstone::value::HippyValue;
using HippyValueObjectType = footstone::value::HippyValue::HippyValueObjectType;

using LoadImageCallback = std::function<void(bool is_success)>;

class NativeRenderContext;

class PixelMapInfo {
public:
  uint32_t width_ = 0;
  uint32_t height_ = 0;
  OH_PixelmapNative *pixelmapNative_ = nullptr;
  OH_Drawing_PixelMap *pixelmap_ = nullptr;
};

class ImageLoader : public std::enable_shared_from_this<ImageLoader> {
public:
  ImageLoader(std::weak_ptr<NativeRenderContext> weak_ctx)
    : weak_ctx_(weak_ctx) {}
  ~ImageLoader();

  void LoadImage(const std::string &uri, LoadImageCallback result_cb);

  std::shared_ptr<PixelMapInfo> GetPixelmapInfo(const std::string &uri);

private:
  void BuildPixmap(const std::string &uri, const std::string &content);
  
  void AddUrlListener(const std::string &uri, LoadImageCallback result_cb);
  void NotifyListeners(const std::string &uri, bool is_success);
  
  bool IsInDownload(const std::string &uri);
  void AddToDownloadSet(const std::string &uri);
  void RemoveFromDownloadSet(const std::string &uri);

  std::weak_ptr<NativeRenderContext> weak_ctx_;
  std::map<std::string, std::shared_ptr<PixelMapInfo>> pixelmapInfoMap_;
  std::map<std::string, std::vector<LoadImageCallback>> uriListeners_;
  std::set<std::string> downloadUris_;
};

} // namespace native
} // namespace render
} // namespace hippy
