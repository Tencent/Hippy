//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2022/3/28.
//

#pragma once

#include <string>

namespace tdf {
namespace devtools {
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
}  // namespace devtools
}  // namespace tdf
