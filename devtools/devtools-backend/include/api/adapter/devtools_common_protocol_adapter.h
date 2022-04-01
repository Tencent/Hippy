//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/11/2.
//

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
