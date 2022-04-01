//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/7/16.
//

#pragma once

#include <string>
#include "module/request/domain_base_request.h"

namespace tdf {
namespace devtools {
/**
 * @brief 截屏请求
 */
class ScreenShotRequest : public DomainBaseRequest {
 public:
  void RefreshParams(const std::string& params) override;

  int32_t GetQuality() const { return quality_; }
  int32_t GetMaxWidth() const { return max_width_; }
  int32_t GetMaxHeight() const { return max_height_; }
  std::string GetFormat() const { return format_; }

 private:
  std::string format_;
  int32_t quality_;
  int32_t max_width_;
  int32_t max_height_;
};
}  // namespace devtools
}  // namespace tdf
