// Copyright (c) 2020 Tencent Corporation. All rights reserved.

#include "footstone/log_settings.h"

#include <fcntl.h>
#include <string.h>

#include <algorithm>
#include <iostream>

namespace footstone {
inline namespace log {

extern LogSettings global_log_settings;

void SetLogSettings(const LogSettings& settings) {
  // Validate the new settings as we set them.
  global_log_settings.min_log_level = std::min(TDF_LOG_FATAL, settings.min_log_level);
}

LogSettings GetLogSettings() { return global_log_settings; }

int GetMinLogLevel() { return std::min(global_log_settings.min_log_level, TDF_LOG_FATAL); }

}  // namespace log
}  // namespace footstone
