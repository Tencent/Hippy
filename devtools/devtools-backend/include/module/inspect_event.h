//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/7/13.
//

#pragma once

#include <string>
#include <utility>
#include "module/inspect_props.h"

namespace tdf {
namespace devtools {

/**
 * @brief 调试主动事件通知
 */
struct InspectEvent {
  /**
   * @brief 初始化通知事件
   * @param method  事件名
   * @param params 事件内容，string 类型
   */
  InspectEvent(const std::string& method, std::string&& params) {
    method_ = method;
    params_ = std::move(params);  // 这里的params可能会大于1M，所以这里用 move 提高性能
  }

  /**
   * @brief 将通知事件转换成string
   */
  std::string ToJsonString() const {
    std::string result = "{\"";
    result += kFrontendKeyMethod;
    result += "\":\"";
    result += method_;
    result += "\",\"";
    result += kFrontendKeyParams;
    result += "\":";
    result += params_;
    result += "}";
    return result;
  }

 private:
  std::string method_;
  std::string params_;
};

}  // namespace devtools
}  // namespace tdf
