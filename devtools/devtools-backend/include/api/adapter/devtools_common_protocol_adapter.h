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
#include "devtools_base/devtools_json.h"

namespace hippy::devtools {
/**
 * @brief common protocol adaptation
 * Deal with protocols that currently do not implement adapter adaptation
 */
class CommonProtocolAdapter {
 public:
  using CommonDataCallback = std::function<void(bool is_success, const nlohmann::json& data)>;
  /**
   * @brief handle common protocal
   * @param id increase id
   * @param method invoke Domain.method
   * @param params params list
   * @param callback async callback
   */
  virtual void HandleCommonProtocol(int32_t id, const std::string& method, const std::string& params,
                                    CommonDataCallback callback) = 0;
};
}  // namespace hippy::devtools
