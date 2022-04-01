//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/7/16.
//

#pragma once

#include <string>

namespace tdf {
namespace devtools {
/**
 * @brief page截屏回包数据
 */
class ScreenShotResponse {
 public:
  ScreenShotResponse() = default;
  ScreenShotResponse(const std::string &screen_data, int32_t width, int32_t height)
      : screen_data_(screen_data), screen_width_(width), screen_height_(height) {}

  /**
   * @brief 组装截屏数据
   * @return 截屏jsonString
   */
  std::string ToJsonString() const;

 private:
  std::string screen_data_;
  int32_t screen_width_;
  int32_t screen_height_;
};
}  // namespace devtools
}  // namespace tdf
