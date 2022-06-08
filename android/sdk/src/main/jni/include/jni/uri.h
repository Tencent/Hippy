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

#include "base/unicode_string_view.h"

class Uri {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;

  static std::shared_ptr<Uri> Create(const unicode_string_view& uri);
  explicit Uri(const unicode_string_view& uri);
  ~Uri();
  unicode_string_view GetPath();
  unicode_string_view GetScheme();
  unicode_string_view Normalize();
  static bool Init();
  static bool Destroy();

 private:
  jobject j_obj_uri_;
};
