// Copyright 2020 Tencent
#pragma once
#include <codecvt>
#include <sstream>

#include "log_level.h"
#include "macros.h"
#include "unicode_string_view.h"

namespace tdf {
namespace base {

inline std::ostream& operator<<(std::ostream& stream, const unicode_string_view& str_view) {
  unicode_string_view::Encoding encoding = str_view.encoding();
  switch (encoding) {
    case unicode_string_view::Encoding::Latin1: {
      const std::string& str = str_view.latin1_value();
      stream << str;
      break;
    }
    case unicode_string_view::Encoding::Utf16: {
      const std::u16string& str = str_view.utf16_value();
      std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> convert;
      stream << convert.to_bytes(str);
      break;
    }
    case unicode_string_view::Encoding::Utf32: {
      const std::u32string& str = str_view.utf32_value();
      std::wstring_convert<std::codecvt_utf8<char32_t>, char32_t> convert;
      stream << convert.to_bytes(str);
      break;
    }
    case unicode_string_view::Encoding::Utf8: {
      const unicode_string_view::u8string& str = str_view.utf8_value();
      stream << std::string(reinterpret_cast<const char*>(str.c_str()), str.length());
      break;
    }
    default: {
      assert(false);
      break;
    }
  }

  return stream;
}

class LogMessageVoidify {
 public:
  void operator&(std::ostream&) {}
};

class LogMessage {
 public:
  LogMessage(LogSeverity severity, const char* file, int line, const char* condition);
  ~LogMessage();

  inline static void SetDelegate(
      std::function<void(const std::ostringstream&, LogSeverity)> delegate) {
    delegate_ = delegate;
  }

  inline static auto GetDelegate() { return delegate_; }

  std::ostringstream& stream() { return stream_; }

 private:
  static std::function<void(const std::ostringstream&, LogSeverity)> delegate_;

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

#define TDF_BASE_LOG_STREAM(severity)                                                       \
  ::tdf::base::LogMessage(::tdf::base::LogSeverity::TDF_LOG_##severity, __FILE__, __LINE__, \
                          nullptr)                                                          \
      .stream()

#define TDF_BASE_LAZY_STREAM(stream, condition) \
  !(condition) ? (void)0 : ::tdf::base::LogMessageVoidify() & (stream)

#define TDF_BASE_EAT_STREAM_PARAMETERS(ignored)                                             \
  true || (ignored)                                                                         \
      ? (void)0                                                                             \
      : ::tdf::base::LogMessageVoidify() &                                                  \
            ::tdf::base::LogMessage(::tdf::base::LogSeverity::TDF_LOG_FATAL, 0, 0, nullptr) \
                .stream()

#define TDF_BASE_LOG_IS_ON(severity) \
  (::tdf::base::ShouldCreateLogMessage(::tdf::base::LogSeverity::TDF_LOG_##severity))

#define TDF_BASE_LOG(severity) \
  TDF_BASE_LAZY_STREAM(TDF_BASE_LOG_STREAM(severity), TDF_BASE_LOG_IS_ON(severity))

#define TDF_BASE_CHECK(condition)                                                                 \
  TDF_BASE_LAZY_STREAM(::tdf::base::LogMessage(::tdf::base::LogSeverity::TDF_LOG_FATAL, __FILE__, \
                                               __LINE__, #condition)                              \
                           .stream(),                                                             \
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

#define TDF_BASE_NOTREACHED() \
  do {                        \
    TDF_BASE_DCHECK(false);   \
    abort();                  \
  } while (0)

#define TDF_BASE_NOTIMPLEMENTED() \
  TDF_BASE_LOG(ERROR) << "Not implemented in: " << __PRETTY_FUNCTION__

#define TDF_BASE_USE(expr) \
  do {                     \
    (void)(expr);          \
  } while (0)
