// Copyright (c) 2020 Tencent Corporation. All rights reserved.

#pragma once

namespace tdf {
namespace base {

typedef int LogSeverity;

// Default log levels. Negative values can be used for verbose log levels.
constexpr LogSeverity TDF_LOG_INFO = 0;
constexpr LogSeverity TDF_LOG_WARNING = 1;
constexpr LogSeverity TDF_LOG_ERROR = 2;
constexpr LogSeverity TDF_LOG_FATAL = 3;
constexpr LogSeverity TDF_LOG_NUM_SEVERITIES = 4;

// One of the Windows headers defines ERROR to 0. This makes the token
// concatenation in BASE_LOG(ERROR) to resolve to LOG_0. We define this back to
// the appropriate log level.
#ifdef _WIN32
#define LOG_0 LOG_ERROR
#endif

// LOG_DFATAL is LOG_FATAL in debug mode, ERROR in normal mode
#ifdef NDEBUG
constexpr LogSeverity TDF_LOG_DFATAL = TDF_LOG_ERROR;
#else
constexpr LogSeverity TDF_LOG_DFATAL = TDF_LOG_FATAL;
#endif

}  // namespace base
}  // namespace tdf
