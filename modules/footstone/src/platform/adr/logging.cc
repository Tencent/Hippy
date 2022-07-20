// Copyright (c) 2020 Tencent Corporation. All rights reserved.

#include "../../logging.h"

#include <android/log.h>

#include <algorithm>
#include <iostream>

#include "../../log_settings.h"

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
      android_LogPriority priority = (severity < 0) ? ANDROID_LOG_VERBOSE : ANDROID_LOG_UNKNOWN;
      switch (severity) {
        case TDF_LOG_INFO:
          priority = ANDROID_LOG_INFO;
          break;
        case TDF_LOG_WARNING:
          priority = ANDROID_LOG_WARN;
          break;
        case TDF_LOG_ERROR:
          priority = ANDROID_LOG_ERROR;
          break;
        case TDF_LOG_FATAL:
          priority = ANDROID_LOG_FATAL;
          break;
        default:
          break;
      }
      __android_log_write(priority, "tdf", stream.str().c_str());
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

} // namespace log
} // namespace footstone
