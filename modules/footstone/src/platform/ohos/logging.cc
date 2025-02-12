/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "include/footstone/logging.h"
#include <hilog/log.h>
#include <algorithm>
#include <iostream>
#include "include/footstone/log_settings.h"

#undef LOG_DOMAIN
#undef LOG_TAG
#define LOG_DOMAIN 0x0001
#define LOG_TAG "hippy"

namespace footstone {
inline namespace log {

namespace {

const char* const kLogSeverityNames[TDF_LOG_NUM_SEVERITIES] = {"INFO", "WARNING", "ERROR", "FATAL"};

const char* GetNameForLogSeverity(LogSeverity severity) {
  if (severity >= TDF_LOG_INFO && severity < TDF_LOG_NUM_SEVERITIES)
    return kLogSeverityNames[severity];
  return "UNKNOWN";
}

const char* StripDots(const char* path) {
  while (strncmp(path, "../", 3) == 0) path += 3;
  return path;
}

const char* StripPath(const char* path) {
  auto* p = strrchr(path, '/');
  if (p)
    return p + 1;
  else
    return path;
}

}  // namespace

std::function<void(const std::ostringstream&, LogSeverity severity)> LogMessage::delegate_ = nullptr;
std::mutex  LogMessage::mutex_;
std::function<void(const std::ostringstream&, LogSeverity severity)> LogMessage::default_delegate_ =
    [](const std::ostringstream& stream, LogSeverity severity) {
        switch (severity) {
        case TDF_LOG_INFO:
          OH_LOG_INFO(LOG_APP, "%{public}s", stream.str().c_str());
          break;
        case TDF_LOG_WARNING:
          OH_LOG_WARN(LOG_APP, "%{public}s", stream.str().c_str());
          break;
        case TDF_LOG_ERROR:
          OH_LOG_ERROR(LOG_APP, "%{public}s", stream.str().c_str());
          break;
        case TDF_LOG_FATAL:
          OH_LOG_FATAL(LOG_APP, "%{public}s", stream.str().c_str());
          break;
        default:
          OH_LOG_DEBUG(LOG_APP, "%{public}s", stream.str().c_str());
          break;
      }
    };

LogMessage::LogMessage(LogSeverity severity, const char* file, int line, const char* condition)
    : severity_(severity), file_(file), line_(line) {
  stream_ << "[";
  if (severity >= TDF_LOG_INFO)
    stream_ << GetNameForLogSeverity(severity);
  else
    stream_ << "VERBOSE" << -severity;
  stream_ << ":" << (severity > TDF_LOG_INFO ? StripDots(file_) : StripPath(file_)) << "(" << line_
          << ")] ";

  if (condition) stream_ << "Check failed: " << condition << ". ";
}

LogMessage::~LogMessage() {
  stream_ << std::endl;

  if (delegate_) {
    delegate_(stream_, severity_);
  } else {
    default_delegate_(stream_, severity_);
  }

  if (severity_ >= TDF_LOG_FATAL) {
    abort();
  }
}

int GetVlogVerbosity() { return std::max(-1, TDF_LOG_INFO - GetMinLogLevel()); }

bool ShouldCreateLogMessage(LogSeverity severity) { return severity >= GetMinLogLevel(); }

bool gEnableUpdateAnimLog = true;
bool gInUpdateAnimScope = false;

} // namespace log
} // namespace footstone
