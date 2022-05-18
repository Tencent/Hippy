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
#pragma once
#include <functional>
#include <iostream>
#include <string>
#include <utility>
#include <vector>

namespace hippy::devtools {

class LoggerModel {
 public:
  std::string source;
  std::string module;
  std::string level;
  std::string file_name;
  int32_t line_number;
  int64_t time_stamp;
  std::string log_data;
};

using RecordLogOperateCallback = std::function<void(std::string&& log)>;
/**
 * @brief record log, and provide callback to handle if over max numbers
 */
class RecordLogger {
 public:
  inline void SetRecordLogOperateCallback(RecordLogOperateCallback callback) {
    operate_callback_ = std::move(callback);
  }

  void RecordLogData(LoggerModel logger_model);

 private:
  std::string GetRecordLogs();
  void ResetRecordLogs();

  std::recursive_mutex devtools_log_mutex_;
  std::vector<std::string> record_logs_;
  RecordLogOperateCallback operate_callback_;
};
}  // namespace hippy::devtools
