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

#include "render/tdf/image/net_image_loader.h"

namespace tdfrender {

NetImageLoader::NetImageLoader(std::string_view scheme, UriDataGetter uri_data_getter)
    : scheme_(scheme), uri_data_getter_(uri_data_getter) {
  assert(uri_data_getter);
}

std::shared_ptr<tdfcore::Task> NetImageLoader::Load(const std::string &url, const tdfcore::ImageOptions &options,
                                                    const tdfcore::ImageProgressCallback &progress_callback,
                                                    const tdfcore::ImageLoadCallback &loader_callback) {
  return TDF_MAKE_SHARED(tdfcore::FutureTask<void>, [WEAK_THIS, url, progress_callback, loader_callback] {
    DEFINE_AND_CHECK_SELF(NetImageLoader)
    StringView src_uri = footstone::unicode_string_view(self->scheme_ + "://" + url);
    self->uri_data_getter_(src_uri, [self, progress_callback, loader_callback](StringView::u8string data) {
      if (!data.empty()) {
        auto bytes = data.data();
        auto buffer = tdfcore::TData::MakeWithCopy(bytes, data.length());
        if (progress_callback) {
          progress_callback(1);
        }
        if (loader_callback) {
          loader_callback(buffer, tdfcore::ImageLoadStatus::kSuccess);
        }
      } else {
        if (progress_callback) {
          progress_callback(0);
        }
        if (loader_callback) {
          loader_callback(nullptr, tdfcore::ImageLoadStatus::kInvalidFileData);
        }
      }
    });
  });
}

}  // namespace tdfrender
