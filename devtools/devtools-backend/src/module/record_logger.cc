/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "module/record_logger.h"
#include <sstream>
#include <utility>
#include "devtools_base/logging.h"
#include "devtools_base/transform_string_util.hpp"

namespace hippy {
namespace devtools {

constexpr char kRecordLogKey[] = "log";
constexpr char kRecordLogSourceKey[] = "source";
constexpr char kRecordLogModuleKey[] = "module";
constexpr char kRecordLogLevelKey[] = "level";
constexpr char kRecordLogFileNameKey[] = "file_name";
constexpr char kRecordLogLineNumberKey[] = "line_number";
constexpr char kRecordLogTimestampKey[] = "timestamp";
constexpr char kRecordLogMessageKey[] = "message";

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
  if (!record_logs_.empty() && operate_callback_) {
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
}  // namespace hippy
