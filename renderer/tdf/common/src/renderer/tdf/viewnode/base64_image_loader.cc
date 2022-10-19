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

#pragma clang diagnostic ignored "-Wextra-semi"
#include "renderer/tdf/viewnode/base64_image_loader.h"
#include "core/common/base64.h"

namespace hippy {
inline namespace render {
inline namespace tdf {

std::shared_ptr<tdfcore::Task> Base64ImageLoader::Load(const std::string &url,
                                                       const ProgressCallback &progress_callback,
                                                       const FinishCallback &finish_callback) {
  return TDF_MAKE_SHARED(tdfcore::FutureTask<void>, [WEAK_THIS, url, progress_callback, finish_callback] {
    DEFINE_AND_CHECK_SELF(Base64ImageLoader)

    auto index = url.find(self->scheme_tag_);
    auto length = index + self->scheme_tag_.length();
    std::string content = url.substr(length);
    // base64 decode
    std::string data = tdfcore::Base64::Decode(content);
    if (!data.empty()) {
      auto bytes = data.data();
      auto buffer = tdfcore::TData::MakeWithCopy(bytes, data.length());
      if (progress_callback) {
        progress_callback(1.0);
      }
      if (finish_callback) {
        finish_callback(buffer, tdfcore::ImageLoadError::kNone);
      }
    } else {
      if (finish_callback) {
        finish_callback(nullptr, tdfcore::ImageLoadError::kLoadFailed);
      }
    }
  });
}

}  // namespace tdf
}  // namespace render
}  // namespace hippy
