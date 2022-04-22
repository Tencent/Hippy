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
#include "nlohmann/json.hpp"

namespace tdf {
namespace devtools {

/**
 * @brief 通用协议适配
 * 处理当前未实现Adapter适配的协议
 */
class CommonProtocolAdapter {
 public:
  using CommonDataCallback = std::function<void(bool is_success, const nlohmann::json& data)>;
  /**
   * @brief 处理通用协议
   * @param id 唯一自增 id
   * @param method 调用域名&命令，如 Domain.method
   * @param params 调用参数
   * @param callback 回包数据，若失败则返回 false，若成功则返回 json 内容
   */
  virtual void HandleCommonProtocol(int32_t id, const std::string& method, const std::string& params,
                                    CommonDataCallback callback) = 0;
};


}  // namespace devtools
}  // namespace tdf
