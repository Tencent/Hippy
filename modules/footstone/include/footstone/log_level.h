

#pragma once

namespace footstone {
inline namespace log {

enum LogSeverity {
  TDF_LOG_INFO,
  TDF_LOG_WARNING,
  TDF_LOG_ERROR,
  TDF_LOG_FATAL,
  TDF_LOG_NUM_SEVERITIES
};

#ifdef _WIN32
#define LOG_0 LOG_ERROR
#endif

#ifdef NDEBUG
constexpr LogSeverity TDF_LOG_DFATAL = TDF_LOG_ERROR;
#else
constexpr LogSeverity TDF_LOG_DFATAL = TDF_LOG_FATAL;
#endif

}  // namespace log
}  // namespace footstone
