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

#include <iostream>
#include <string>
#include "module/record_logger.h"

#define BACKEND_LOG(level, module, format, ...)                                                             \
    do {                                                                                            \
        hippy::devtools::Logger::Log(level, __FILE__, __LINE__, module, format, ##__VA_ARGS__);  \
    } while (0)

#define TDF_BACKEND "TDF_Backend"

#define BACKEND_LOGD(module, format, ...) \
  BACKEND_LOG(hippy::devtools::DEVTOOLS_LOG_DEBUG, module, format, ##__VA_ARGS__)
#define BACKEND_LOGI(module, format, ...) \
  BACKEND_LOG(hippy::devtools::DEVTOOLS_LOG_INFO, module, format, ##__VA_ARGS__)
#define BACKEND_LOGW(module, format, ...) \
  BACKEND_LOG(hippy::devtools::DEVTOOLS_LOG_WARNING, module, format, ##__VA_ARGS__)
#define BACKEND_LOGE(module, format, ...) \
  BACKEND_LOG(hippy::devtools::DEVTOOLS_LOG_ERROR, module, format, ##__VA_ARGS__)

namespace hippy::devtools {

typedef int LogLevel;

constexpr const LogLevel DEVTOOLS_LOG_INFO = 0;
constexpr const LogLevel DEVTOOLS_LOG_DEBUG = 1;
constexpr const LogLevel DEVTOOLS_LOG_WARNING = 2;
constexpr const LogLevel DEVTOOLS_LOG_ERROR = 3;
constexpr const LogLevel DEVTOOLS_LOG_FATAL = 4;

typedef std::function<void(LoggerModel logger_model)> LogCallback;

class Logger {
 public:
  static void Log(LogLevel level, const char *file,
                  int line, const char *module, const char *format, ...);
  static void RegisterCallback(const LogCallback& callback);
  static std::string GetTimeStamp();
 private:
  static void DispatchToCallbacks(const LoggerModel& logger_model);
};

}  // namespace hippy::devtools
