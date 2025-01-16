/*
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

#include "vfs/uri.h"

#include "footstone/string_view_utils.h"
#include "oh_napi/ark_ts.h"

using StringViewUtils = footstone::StringViewUtils;

namespace hippy {
inline namespace vfs {

  std::shared_ptr<Uri> Uri::Create(const string_view &uri) {
    auto ret = std::make_shared<Uri>(uri);
    return ret;
  }

  Uri::Uri(const string_view &uri) {
    u8_string_ = StringViewUtils::ConvertEncoding(uri, string_view::Encoding::Utf8).utf8_value();
  }

  string_view Uri::GetPath() {
    size_t pos = u8_string_.find_first_of(':');
    if (pos != std::string::npos) {
      // file: "file://foo/bar/vue2/vendor.android.js"
      // asset: "asset:/vue2/vendor.android.js"
      size_t offset = pos + 2;
      return string_view(u8_string_.substr(offset));
    }
    return {};
  }

  string_view Uri::GetScheme() {
    size_t pos = u8_string_.find_first_of(':');
    if (pos != std::string::npos) {
      return string_view(u8_string_.substr(0, pos));
    }
    return {};
  }

}
}