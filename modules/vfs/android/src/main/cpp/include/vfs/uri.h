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

#include <jni.h>

#include <string>

#include "footstone/string_view.h"

namespace hippy {
inline namespace framework {

class Uri {
 public:
  using string_view = footstone::stringview::string_view;

  static std::shared_ptr<Uri> Create(const string_view &uri);
  explicit Uri(const string_view &uri);
  ~Uri();
  string_view GetPath();
  string_view GetScheme();
  string_view Normalize();

 private:
  jobject j_obj_uri_;
};

}
}
