//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by  nolantang on 2022/3/31.
//

#pragma once

#include <string>

namespace tdf {
namespace devtools {
/**
 * Runtime相关Notification
 */
class RuntimeNotification {
 public:
  /**
   * @brief 更新 context_name
   * @param context_name context名称
   */
  virtual void UpdateContextName(const std::string& context_name) = 0;
};

}  // namespace devtools
}  // namespace tdf
