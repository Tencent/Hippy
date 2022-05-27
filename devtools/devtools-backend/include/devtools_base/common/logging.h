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

#pragma once
#include <assert.h>
#include <codecvt>
#include <functional>
#include <locale>
#include <sstream>
#include <string>

#include "devtools_base/common/log_level.h"
#include "devtools_base/common/macros.h"
#include "devtools_base/common/unicode_string_view.h"

namespace hippy::devtools {
inline namespace log {
inline std::ostream& operator<<(std::ostream& stream, const unicode_string_view_temp& str_view) {
  unicode_string_view_temp::Encoding encoding = str_view.encoding();
  switch (encoding) {
    case unicode_string_view_temp::Encoding::Latin1: {
      const std::string& str = str_view.latin1_value();
      stream << str;
      break;
    }
    case unicode_string_view_temp::Encoding::Utf16: {
      const std::u16string& str = str_view.utf16_value();
      std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> convert;
      stream << convert.to_bytes(str);
      break;
    }
    case unicode_string_view_temp::Encoding::Utf32: {
      const std::u32string& str = str_view.utf32_value();
      std::wstring_convert<std::codecvt_utf8_utf16<char32_t>, char32_t> convert;
      stream << convert.to_bytes(str);
      break;
    }
    case unicode_string_view_temp::Encoding::Utf8: {
      const unicode_string_view_temp::u8string& str = str_view.utf8_value();
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

  inline static void SetDelegate(std::function<void(const std::ostringstream&, LogSeverity)> delegate) {
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
}  // namespace log
}  // namespace hippy::devtools
