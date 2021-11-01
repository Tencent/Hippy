// Copyright (c) 2020 Tencent Corporation. All rights reserved.

#include "base/logging.h"

#include <algorithm>
#include <iostream>

#include "base/log_settings.h"

namespace tdf {
namespace base {
namespace {

const char* const kLogSeverityNames[TDF_LOG_NUM_SEVERITIES] = {"INFO", "WARNING", "ERROR", "FATAL"};

const char* GetNameForLogSeverity(LogSeverity severity) {
  if (severity >= TDF_LOG_INFO && severity < TDF_LOG_NUM_SEVERITIES) return kLogSeverityNames[severity];
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

  std::cerr << stream_.str();
  std::cerr.flush();

  if (severity_ >= TDF_LOG_FATAL) {
    abort();
  }
}

int GetVlogVerbosity() { return std::max(-1, TDF_LOG_INFO - GetMinLogLevel()); }

bool ShouldCreateLogMessage(LogSeverity severity) { return severity >= GetMinLogLevel(); }

}  // namespace base
}  // namespace tdf