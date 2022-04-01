//
// Copyright (c) Tencent Corporation. All rights reserved.
//

#pragma once

#include <string>
#include "devtools_base/common/log_level.h"

namespace tdf::devtools {
inline namespace log {
struct LogSettings {
  LogSeverity min_log_level = TDF_LOG_INFO;
};

void SetLogSettings(const LogSettings& settings);

LogSettings GetLogSettings();

int GetMinLogLevel();
}  // namespace log
}  // namespace tdf::devtools
