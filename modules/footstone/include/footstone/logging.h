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

#pragma once

#if defined(__cplusplus)

#include <cassert>
#include <codecvt>
#include <mutex>
#include <sstream>
#include <functional>

#include "footstone/log_level.h"
#include "footstone/macros.h"
#include "footstone/string_view.h"

namespace footstone {
inline namespace log {

constexpr char kCharConversionFailedPrompt[] = "<string conversion failed>";
constexpr char16_t kU16CharConversionFailedPrompt[] = u"<u16string conversion failed>";
constexpr char32_t kU32CharConversionFailedPrompt[] = U"<u32string conversion failed>";

inline std::ostream& operator<<(std::ostream& stream, const string_view& str_view) {
  string_view::Encoding encoding = str_view.encoding();
  switch (encoding) {
    case string_view::Encoding::Latin1: {
      std::string u8;
      for (const auto& ch: str_view.latin1_value()) {
        if (static_cast<uint8_t>(ch) < 0x80) {
          u8 += ch;
        } else {
          u8 += static_cast<char>((0xc0 | ch >> 6));
          u8 += static_cast<char>((0x80 | (ch & 0x3f)));
        }
      }
      stream << u8;
      break;
    }
    case string_view::Encoding::Utf16: {
      const std::u16string& str = str_view.utf16_value();
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated"
      std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> convert(
          kCharConversionFailedPrompt, kU16CharConversionFailedPrompt);
#pragma clang diagnostic pop
      stream << convert.to_bytes(str);
      break;
    }
    case string_view::Encoding::Utf32: {
      const std::u32string& str = str_view.utf32_value();
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated"
      std::wstring_convert<std::codecvt_utf8<char32_t>, char32_t> convert(
          kCharConversionFailedPrompt, kU32CharConversionFailedPrompt);
#pragma clang diagnostic pop
      stream << convert.to_bytes(str);
      break;
    }
    case string_view::Encoding::Utf8: {
      const string_view::u8string& str = str_view.utf8_value();
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

  LogMessage(LogMessage&) = delete;
  LogMessage& operator=(LogMessage&) = delete;

  inline static void InitializeDelegate(
      std::function<void(const std::ostringstream&, LogSeverity)> delegate) {
    if (!delegate) {
      return;
    }

    std::lock_guard<std::mutex> lock(mutex_);
    if (delegate_) {
      abort(); // delegate can only be initialized once
    }
    delegate_ = delegate;
  }

  inline static void LogWithFormat(const char * file, int line, const char *format, ...){
    char *log_msg = NULL;
    va_list args;
    va_start(args, format);
    int ret = vasprintf(&log_msg, format, args);
    va_end(args);
    
    if (ret <= 0 && log_msg == NULL) {
        return;
    }
    
    std::ostringstream s;
    s<<"["<<file<<":"<<line<<"]"
     <<"[thread:"<<pthread_self()<<"], "<<log_msg<<std::endl;
    
    if (LogMessage::delegate_) {
      delegate_(s, TDF_LOG_INFO);
    } else {
      default_delegate_(s, TDF_LOG_INFO);
    }
    
    free(log_msg);
  }
    
  std::ostringstream& stream() { return stream_; }

 private:
  static std::function<void(const std::ostringstream&, LogSeverity)> delegate_;
  static std::function<void(const std::ostringstream&, LogSeverity)> default_delegate_;
  static std::mutex mutex_;

  std::ostringstream stream_;
  const LogSeverity severity_;
  const char* file_;
  const int line_;
};

int GetVlogVerbosity();

bool ShouldCreateLogMessage(LogSeverity severity);

}  // namespace base
}  // namespace tdf

#define FOOTSTONE_LOG_STREAM(severity)                                                                \
  ::footstone::log::LogMessage(::footstone::log::LogSeverity::TDF_LOG_##severity, __FILE__, __LINE__, \
                          nullptr)                                                                    \
      .stream()

#define FOOTSTONE_LAZY_STREAM(stream, condition) \
  !(condition) ? (void)0 : ::footstone::log::LogMessageVoidify() & (stream)

#define FOOTSTONE_EAT_STREAM_PARAMETERS(ignored)                                                      \
  true || (ignored)                                                                                   \
      ? (void)0                                                                                       \
      : ::footstone::log::LogMessageVoidify() &                                                       \
            ::footstone::log::LogMessage(::footstone::log::LogSeverity::TDF_LOG_FATAL, 0, 0, nullptr) \
                .stream()

#define FOOTSTONE_LOG_IS_ON(severity) \
  (::footstone::log::ShouldCreateLogMessage(::footstone::log::LogSeverity::TDF_LOG_##severity))

#define FOOTSTONE_LOG(severity) \
  FOOTSTONE_LAZY_STREAM(FOOTSTONE_LOG_STREAM(severity), FOOTSTONE_LOG_IS_ON(severity))

#define FOOTSTONE_CHECK(condition)                                                                           \
  FOOTSTONE_LAZY_STREAM(::footstone::log::LogMessage(::footstone::log::LogSeverity::TDF_LOG_FATAL, __FILE__, \
                                               __LINE__, #condition)                                         \
                           .stream(),                                                                        \
                       !(condition))

#define FOOTSTONE_VLOG_IS_ON(verbose_level) ((verbose_level) <= ::footstone::log::GetVlogVerbosity())

#define FOOTSTONE_VLOG_STREAM(verbose_level) \
  ::footstone::log::LogMessage(-verbose_level, __FILE__, __LINE__, nullptr).stream()

#define FOOTSTONE_VLOG(verbose_level) \
  FOOTSTONE_LAZY_STREAM(FOOTSTONE_VLOG_STREAM(verbose_level), FOOTSTONE_VLOG_IS_ON(verbose_level))

#ifndef NDEBUG
#define FOOTSTONE_DLOG(severity) FOOTSTONE_LOG(severity)
#define FOOTSTONE_DCHECK(condition) FOOTSTONE_CHECK(condition)
#else
#define FOOTSTONE_DLOG(severity) FOOTSTONE_EAT_STREAM_PARAMETERS(true)
#define FOOTSTONE_DCHECK(condition) FOOTSTONE_EAT_STREAM_PARAMETERS(condition)
#endif

#define FOOTSTONE_UNREACHABLE() \
  do {                          \
    FOOTSTONE_DCHECK(false);    \
    abort();                    \
  } while (0)

#define FOOTSTONE_UNIMPLEMENTED()                                             \
  do {                                                                        \
    FOOTSTONE_LOG(ERROR) << "Not implemented in: " << __PRETTY_FUNCTION__;    \
    abort();                                                                  \
  } while (0)


#define FOOTSTONE_USE(expr) \
  do {                      \
    (void)(expr);           \
  } while (0)

#endif


#define HP_CSTR_NOT_NULL( p ) (p ? p : "")

#ifdef DEBUG

// enable perf log output in debug mode only
#define TDF_PERF_LOG(format, ...) \
footstone::LogMessage::LogWithFormat(__FILE_NAME__, __LINE__, "[HP PERF] " format,                                    \
         ##__VA_ARGS__)

#define TDF_PERF_DO_STMT_AND_LOG( STMT , format , ...)  STMT \
footstone::LogMessage::LogWithFormat(__FILE_NAME__, __LINE__, "[HP PERF] " format,                                    \
         ##__VA_ARGS__)

#else

#define TDF_PERF_LOG(format, ...)
#define TDF_PERF_DO_STMT_AND_LOG(STMT , format, ...)

#endif
