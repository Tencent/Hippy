//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>
#include "devtools_base/common/logging.h"
#include "module/record_logger.h"

namespace tdf {
namespace devtools {
class LogNotification {
 public:
  /**
   * JS 日志输出
   * @param log_message
   */
  virtual void PrintLog(const std::string& log_message, LogSeverity serverity, const std::string& file_name,
                        int32_t line_number) = 0;
};
}  // namespace devtools
}  // namespace tdf
