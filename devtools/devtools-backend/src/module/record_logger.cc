//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include "module/record_logger.h"
#include <sstream>
#include <utility>
#include "devtools_base/logging.h"
#include "devtools_base/transform_string_util.hpp"

namespace tdf {
namespace devtools {

static constexpr const char* kRecordLogKey = "log";
static constexpr const char* kRecordLogSourceKey = "source";
static constexpr const char* kRecordLogModuleKey = "module";
static constexpr const char* kRecordLogLevelKey = "level";
static constexpr const char* kRecordLogFileNameKey = "file_name";
static constexpr const char* kRecordLogLineNumberKey = "line_number";
static constexpr const char* kRecordLogTimestampKey = "timestamp";
static constexpr const char* kRecordLogMessageKey = "message";

std::string GetKeyValueString(const std::string& key, const std::string& value) {
  std::string qutoes = "\"";
  std::string colon = ":";
  std::string str_result = qutoes + key + qutoes + colon + qutoes + value + qutoes;
  return str_result;
}

std::string ConvertToLogJsonString(LoggerModel logger_model) {
  std::string element_string = "{\"";
  element_string += kRecordLogSourceKey;
  element_string += "\":\"";
  element_string += logger_model.source;
  element_string += "\",\"";
  element_string += kRecordLogModuleKey;
  element_string += "\":\"";
  element_string += logger_model.module;
  element_string += "\",\"";
  element_string += kRecordLogLevelKey;
  element_string += "\":\"";
  element_string += logger_model.level;
  element_string += "\",\"";
  element_string += kRecordLogFileNameKey;
  element_string += "\":\"";
  element_string += logger_model.file_name;
  element_string += "\",\"";
  element_string += kRecordLogLineNumberKey;
  element_string += "\":";
  element_string += TransformStringUtil::NumbertoString(logger_model.line_number);
  element_string += ",\"";
  element_string += kRecordLogTimestampKey;
  element_string += "\":";
  element_string += TransformStringUtil::NumbertoString(logger_model.time_stamp);
  element_string += ",\"";
  element_string += kRecordLogMessageKey;
  element_string += "\":\"";
  element_string += logger_model.log_data;
  element_string += "\"}";
  return element_string;
}

// RecordLogger
void RecordLogger::RecordLogData(LoggerModel logger_model) {
  std::lock_guard<std::recursive_mutex> lock(devtools_log_mutex_);
  std::string log_str = ConvertToLogJsonString(logger_model);
  record_logs_.emplace_back(std::move(log_str));
  if (record_logs_.size() > max_number_of_logs_ && operate_callback_) {
    // 若记录的日志条数大于最大条数，则回调完整日志数据给外部，并重置列表
    operate_callback_(GetRecordLogs());
    ResetRecordLogs();
  }
}

std::string RecordLogger::GetRecordLogs() {
  std::string result_string = "{\"";
  result_string += kRecordLogKey;
  result_string += "\":[";
  for (auto& log : record_logs_) {
    result_string += log;
    result_string += ",";
  }
  result_string.pop_back();
  result_string += record_logs_.size() ? "]}" : "[]}";
  return result_string;
}

void RecordLogger::ResetRecordLogs() { record_logs_.clear(); }

}  // namespace devtools
}  // namespace tdf
