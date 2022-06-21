

#pragma once

#include "log_level.h"

#include <string>

namespace footstone {
inline namespace log {
struct LogSettings {
  LogSeverity min_log_level = TDF_LOG_INFO;
};

void SetLogSettings(const LogSettings& settings);

LogSettings GetLogSettings();

int GetMinLogLevel();

}  // namespace log
}  // namespace footstone
