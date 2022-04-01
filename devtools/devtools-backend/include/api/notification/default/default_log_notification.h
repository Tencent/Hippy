//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>
#include "api/notification/devtools_log_notification.h"
#include "devtools_base/common/logging.h"
#include "module/record_logger.h"

namespace tdf {
namespace devtools {
class DefaultLogAdapter : public LogNotification {
 public:
  using BackendLogHandler = std::function<void(LoggerModel logger_model)>;
  explicit DefaultLogAdapter(BackendLogHandler log_handler);
  /**
   * JS 日志输出
   * @param log_message
   */
  void PrintLog(const std::string& log_message, LogSeverity severity, const std::string& file_name,
                int32_t line_number) override;

 private:
  BackendLogHandler log_handler_;
};
}  // namespace devtools
}  // namespace tdf
