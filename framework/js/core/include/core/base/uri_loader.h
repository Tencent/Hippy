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

#include <memory>
#include <string>
#include <vector>

#include "base/unicode_string_view.h"

namespace hippy {
namespace base {

class UriLoader {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;
  using u8string = unicode_string_view::u8string;

  UriLoader() {}
  virtual ~UriLoader() {}

  virtual bool RequestUntrustedContent(const unicode_string_view& uri,
                                       std::function<void(u8string)> cb) = 0;

  virtual bool RequestUntrustedContent(
      const unicode_string_view& uri,
      u8string& content) = 0;
};
}  // namespace base
}  // namespace hippy
