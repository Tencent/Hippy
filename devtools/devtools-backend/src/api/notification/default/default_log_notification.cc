//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#include "api/notification/default/default_log_notification.h"
#include <chrono>
#include <string>

namespace tdf {
namespace devtools {

const char *const kLogSeverityNames[tdf::devtools::TDF_LOG_NUM_SEVERITIES] = {"INFO", "WARNING", "ERROR", "FATAL"};
constexpr const char *kSeverityUnknown = "UNKNOWN";
const char *GetNameForLogSeverity(tdf::devtools::LogSeverity severity) {
  if (severity >= tdf::devtools::TDF_LOG_INFO && severity < tdf::devtools::TDF_LOG_NUM_SEVERITIES) {
    return kLogSeverityNames[severity];
  }
  return kSeverityUnknown;
}

DefaultLogAdapter::DefaultLogAdapter(BackendLogHandler log_handler) {}

void DefaultLogAdapter::PrintLog(const std::string &log_message, tdf::devtools::LogSeverity severity,
                                 const std::string &file_name, int32_t line_number) {
  if (log_handler_) {
    auto nano_time_point = std::chrono::time_point_cast<std::chrono::nanoseconds>(std::chrono::system_clock::now());
    int64_t nano_time_stamp = nano_time_point.time_since_epoch().count();
    tdf::devtools::LoggerModel logger_model;
    logger_model.source = tdf::devtools::DEVTOOLS_CORE_SOURCE;
    logger_model.module = "";
    logger_model.level = GetNameForLogSeverity(severity);
    logger_model.file_name = file_name;
    logger_model.line_number = line_number;
    logger_model.time_stamp = nano_time_stamp;
    logger_model.log_data = log_message;
    log_handler_(logger_model);
  }
}

}  // namespace devtools
}  // namespace tdf
