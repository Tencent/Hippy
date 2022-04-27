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

#if defined(OS_IOS) | defined(IOS)

#include "devtools_base/common/logging.h"

#include <syslog.h>

#include <algorithm>
#include <iostream>

#include "devtools_base/common/log_settings.h"

namespace hippy {
namespace devtools {
inline namespace log {
namespace {

const char* const kLogSeverityNames[TDF_LOG_NUM_SEVERITIES] = {"INFO", "WARNING", "ERROR", "FATAL"};

const char* GetNameForLogSeverity(LogSeverity severity) {
  if (severity >= LOG_INFO && severity < TDF_LOG_NUM_SEVERITIES) return kLogSeverityNames[severity];
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

std::function<void(const std::ostringstream&, LogSeverity)> LogMessage::delegate_ =
    [](const std::ostringstream& stream, LogSeverity severity) {
      syslog(LOG_ALERT, "tdf: %s", stream.str().c_str());

      if (severity >= TDF_LOG_FATAL) {
        abort();
      }
    };

LogMessage::LogMessage(LogSeverity severity, const char* file, int line, const char* condition)
    : severity_(severity), file_(file), line_(line) {
  stream_ << "[";
  if (severity >= LOG_INFO)
    stream_ << GetNameForLogSeverity(severity);
  else
    stream_ << "VERBOSE" << -severity;
  stream_ << ":" << (severity > LOG_INFO ? StripDots(file_) : StripPath(file_)) << "(" << line_
          << ")] ";

  if (condition) stream_ << "Check failed: " << condition << ". ";
}

LogMessage::~LogMessage() {
  stream_ << std::endl;

  if (delegate_) {
    delegate_(stream_, severity_);
    return;
  }
}

int GetVlogVerbosity() { return std::max(-1, LOG_INFO - GetMinLogLevel()); }

bool ShouldCreateLogMessage(LogSeverity severity) { return severity >= GetMinLogLevel(); }
}  // namespace log
}  // namespace devtools
}  // namespace hippy
#endif
