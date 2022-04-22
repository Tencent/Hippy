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

namespace tdf {
namespace devtools {

// 定义 LogSource 类型
typedef std::string LogSource;
static LogSource DEVTOOLS_CORE_SOURCE = "TDF Core";
static LogSource DEVTOOLS_BACKEND_SOURCE = "TDF Devtools";

class LoggerModel {
 public:
    LogSource source;
    std::string module;
    std::string level;
    std::string file_name;
    int32_t line_number;
    int64_t time_stamp;
    std::string log_data;
};

// 定义记录日志达最大条数后的操作回调，附带完整的日志JSON数据
using RecordLogOperateCallback = std::function<void(std::string&& log)>;
/**
 * @brief   Log寄存器
 *          主要能力是保存日志数据
 *          当存储的日志数据超过一定值时会通过callback把完整日志回调回调用方处理
 *          并且当前存储的日志数据会清空
 *          日志存储的最大条数可自定义
 */
class RecordLogger {
 public:
  RecordLogger() = default;

  /**
   * @brief 设置RecordLogOperateCallback
   * 当记录的日志足够多时，会回调此callback供外部处理相应的日志
   */
  void SetRecordLogOperateCallback(RecordLogOperateCallback callback) {
    operate_callback_ = std::move(callback);
  }

  /**
   * @brief 设置最大日志记录条数
   * @param max_number_of_logs
   */
  constexpr void SetMaxNumberOfLogs(uint32_t max_number_of_logs) {
    max_number_of_logs_ = max_number_of_logs;
  }

  /**
   * @brief 记录日志数据, 当记录的日志达到最大条数时，会触发LogOperate回调
   *        内部数据处理加锁，线程安全
   * @param logger_model   日志数据模型
   */
  void RecordLogData(LoggerModel logger_model);

 private:
  // 获取已记录的所有日志(非线程安全)
  std::string GetRecordLogs();
  // 重置日志列表(非线程安全)
  void ResetRecordLogs();

  std::recursive_mutex devtools_log_mutex_;
  std::vector<std::string> record_logs_;
  RecordLogOperateCallback operate_callback_;
  uint32_t max_number_of_logs_ = 10;
};

}  // namespace devtools
}  // namespace tdf
