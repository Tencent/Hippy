//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.

#pragma once

#include <string>
#include "nlohmann/json.hpp"

namespace tdf {
namespace devtools {

/**
 * @brief Domain 请求的基类，解析前端发来的 json_string 类型的请求数据
 */
class DomainBaseRequest {
 public:
  DomainBaseRequest() = default;
  ~DomainBaseRequest() = default;

  /**
   * @brief 解析前端请求数据，更新对应的属性
   * @param 前端发来的 json_string 类型请求数据
   */
  virtual void RefreshParams(const std::string& params);

  void SetId(int32_t id) { id_ = id; }
  int32_t GetId() const { return id_; }

 private:
  int32_t id_;  // 请求带有的唯一标识符
};

}  // namespace devtools
}  // namespace tdf
