/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

#pragma once

#include <string>

namespace hippy::devtools {
/**
 * Network domain allows tracking network activities of the page. It exposes information about http, file, data and
 * other requests and responses, their headers, bodies, timing, etc.
 */
class NetworkAdapter {
 public:
  /**
   * 获取网络请求的数据包体
   * @param request_id 单个网络请求 id
   */
  virtual std::string GetResponseBody(std::string request_id) = 0;
};
}  // namespace devtools::devtools
