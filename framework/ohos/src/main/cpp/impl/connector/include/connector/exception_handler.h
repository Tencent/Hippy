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

#include <any>
#include "footstone/string_view.h"
#include "oh_napi/ark_ts.h"

namespace hippy {
inline namespace framework {

class ExceptionHandler {
 public:
  using string_view = footstone::stringview::string_view;

  ExceptionHandler() = default;
  ~ExceptionHandler() = default;

  static void Init(napi_env env);
  static void ReportJsException(const std::any& bridge,
                                const string_view& desc,
                                const string_view& stack);
};

}
}
