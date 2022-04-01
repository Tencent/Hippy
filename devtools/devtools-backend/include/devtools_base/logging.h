//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <iostream>
#include <string>
#include "module/record_logger.h"

#define BACKEND_LOG(level, module, format, ...)                                                             \
    do {                                                                                            \
        tdf::devtools::Logger::Log(level, __FILE__, __LINE__, module, format, ##__VA_ARGS__);  \
    } while (0)

#define TDF_BACKEND "TDF_Backend"

#define BACKEND_LOGD(module, format, ...) \
  BACKEND_LOG(tdf::devtools::DEVTOOLS_LOG_DEBUG, module, format, ##__VA_ARGS__)
#define BACKEND_LOGI(module, format, ...) \
  BACKEND_LOG(tdf::devtools::DEVTOOLS_LOG_INFO, module, format, ##__VA_ARGS__)
#define BACKEND_LOGW(module, format, ...) \
  BACKEND_LOG(tdf::devtools::DEVTOOLS_LOG_WARNING, module, format, ##__VA_ARGS__)
#define BACKEND_LOGE(module, format, ...) \
  BACKEND_LOG(tdf::devtools::DEVTOOLS_LOG_ERROR, module, format, ##__VA_ARGS__)

namespace tdf {
namespace devtools {

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
  static void RegisterCallback(LogCallback callback);
  static std::string GetTimeStamp();
 private:
  static void DispatchToCallbacks(LoggerModel logger_model);
};

}  // namespace devtools
}  // namespace tdf
