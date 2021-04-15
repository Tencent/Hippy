// Copyright 2020 Tencent
#pragma once
#include <sstream>

#include "log_level.h"
#include "macros.h"

namespace tdf {
namespace base {

class LogMessageVoidify {
 public:
  void operator&(std::ostream&) {}
};

class LogMessage {
 public:
  LogMessage(LogSeverity severity, const char* file, int line, const char* condition);
  ~LogMessage();

  inline static void SetDefaultDelegate(std::function<void(const std::ostringstream&)> delegate) {
    delegate_ = delegate;
  }

  std::ostream& stream() { return stream_; }

 private:
  static std::function<void(const std::ostringstream&)> delegate_;

  std::ostringstream stream_;
  const LogSeverity severity_;
  const char* file_;
  const int line_;

  TDF_BASE_DISALLOW_COPY_AND_ASSIGN(LogMessage);
};

int GetVlogVerbosity();

bool ShouldCreateLogMessage(LogSeverity severity);

}  // namespace base
}  // namespace tdf

#define TDF_BASE_LOG_STREAM(severity) \
  ::tdf::base::LogMessage(::tdf::base::TDF_LOG_##severity, __FILE__, __LINE__, nullptr).stream()

#define TDF_BASE_LAZY_STREAM(stream, condition) \
  !(condition) ? (void)0 : ::tdf::base::LogMessageVoidify() & (stream)

#define TDF_BASE_EAT_STREAM_PARAMETERS(ignored) \
  true || (ignored)                             \
      ? (void)0                                 \
      : ::tdf::base::LogMessageVoidify() &      \
            ::tdf::base::LogMessage(::tdf::base::TDF_LOG_FATAL, 0, 0, nullptr).stream()

#define TDF_BASE_LOG_IS_ON(severity) \
  (::tdf::base::ShouldCreateLogMessage(::tdf::base::TDF_LOG_##severity))

#define TDF_BASE_LOG(severity) \
  TDF_BASE_LAZY_STREAM(TDF_BASE_LOG_STREAM(severity), TDF_BASE_LOG_IS_ON(severity))

#define TDF_BASE_CHECK(condition)                                                         \
  TDF_BASE_LAZY_STREAM(                                                                   \
      ::tdf::base::LogMessage(::tdf::base::TDF_LOG_FATAL, __FILE__, __LINE__, #condition) \
          .stream(),                                                                      \
      !(condition))

#define TDF_BASE_VLOG_IS_ON(verbose_level) ((verbose_level) <= ::tdf::base::GetVlogVerbosity())

#define TDF_BASE_VLOG_STREAM(verbose_level) \
  ::tdf::base::LogMessage(-verbose_level, __FILE__, __LINE__, nullptr).stream()

#define TDF_BASE_VLOG(verbose_level) \
  TDF_BASE_LAZY_STREAM(TDF_BASE_VLOG_STREAM(verbose_level), TDF_BASE_VLOG_IS_ON(verbose_level))

#ifndef NDEBUG
#define TDF_BASE_DLOG(severity) TDF_BASE_LOG(severity)
#define TDF_BASE_DCHECK(condition) TDF_BASE_CHECK(condition)
#else
#define TDF_BASE_DLOG(severity) TDF_BASE_EAT_STREAM_PARAMETERS(true)
#define TDF_BASE_DCHECK(condition) TDF_BASE_EAT_STREAM_PARAMETERS(condition)
#endif

#define TDF_BASE_NOTREACHED() TDF_BASE_DCHECK(false)

#define TDF_BASE_NOTIMPLEMENTED() \
  TDF_BASE_LOG(ERROR) << "Not implemented in: " << __PRETTY_FUNCTION__

#define TDF_BASE_USE(expr) \
  do {                     \
    (void)(expr);          \
  } while (0)
