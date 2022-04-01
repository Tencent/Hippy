//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>

namespace tdf {
namespace devtools {
class TracingAdapter {
 public:
  using TracingDataCallback = std::function<void(const std::string&)>;
  /**
   * @brief 开始获取 Tracing
   */
  virtual void StartTracing() = 0;

  /**
   * @breif 结束获取 Tracing，并设置获取数据的回调
   */
  virtual void StopTracing(TracingDataCallback callback) = 0;
  virtual ~TracingAdapter(){}
};
}  // namespace devtools
}  // namespace tdf
