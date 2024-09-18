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

#include <codecvt>
#include <locale>
#include <string>
#include <utility>

#include "footstone/logging.h"
#include "footstone/string_view.h"

#define EXTEND_LITERAL(ch) ch, ch, u##ch, U##ch

namespace footstone {
inline namespace stringview {

constexpr char kCharConversionFailedPrompt[] = "<string conversion failed>";
constexpr char16_t kU16CharConversionFailedPrompt[] = u"<u16string conversion failed>";
constexpr char32_t kU32CharConversionFailedPrompt[] = U"<u32string conversion failed>";

class StringViewUtils {
 public:
  using string_view = footstone::string_view;
  using u8string = string_view::u8string;
  using char8_t_ = string_view::char8_t_;

  inline static bool IsEmpty(const string_view &str_view) {
    string_view::Encoding encoding = str_view.encoding();
    switch (encoding) {
      case string_view::Encoding::Unknown: {
        return true;
      }
      case string_view::Encoding::Latin1: {
        return str_view.latin1_value().empty();
      }
      case string_view::Encoding::Utf16: {
        return str_view.utf16_value().empty();
      }
      case string_view::Encoding::Utf32: {
        return str_view.utf32_value().empty();
      }
      case string_view::Encoding::Utf8: {
        return str_view.utf8_value().empty();
      }
      default: {
        break;
      }
    }

    FOOTSTONE_UNREACHABLE();
  }

  static string_view CovertToLatin(
      const string_view &str_view,
      string_view::Encoding src_encoding) {
    switch (src_encoding) {
      case string_view::Encoding::Latin1: {
        return string_view(str_view.latin1_value());
      }
      case string_view::Encoding::Utf16:
      case string_view::Encoding::Utf32:
      case string_view::Encoding::Utf8:
      default: {
        FOOTSTONE_UNREACHABLE();
      }
    }
    FOOTSTONE_UNREACHABLE();
  }

  static string_view CovertToUtf16(
      const string_view &str_view,
      string_view::Encoding src_encoding) {
    switch (src_encoding) {
      case string_view::Encoding::Latin1: {
        return string_view(
            CopyChars<char, char16_t>(str_view.latin1_value()));
      }
      case string_view::Encoding::Utf16: {
        return string_view(str_view.utf16_value());
      }
      case string_view::Encoding::Utf32: {
        return string_view(U32ToU16(str_view.utf32_value()));
      }
      case string_view::Encoding::Utf8: {
        return string_view(U8ToU16(str_view.utf8_value()));
      }
      default: {
        FOOTSTONE_UNREACHABLE();
      }
    }
    FOOTSTONE_UNREACHABLE();
  }

  static string_view CovertToUtf32(
      const string_view &str_view,
      string_view::Encoding src_encoding) {
    switch (src_encoding) {
      case string_view::Encoding::Latin1: {
        return string_view(
            CopyChars<char, char32_t>(str_view.latin1_value()));
      }
      case string_view::Encoding::Utf16: {
        return string_view(U16ToU32(str_view.utf16_value()));
      }
      case string_view::Encoding::Utf32: {
        return string_view(str_view.utf32_value());
      }
      case string_view::Encoding::Utf8: {
        return string_view(U8ToU32(str_view.utf8_value()));
      }
      default: {
        FOOTSTONE_UNREACHABLE();
      }
    }
    FOOTSTONE_UNREACHABLE();
  }

  static string_view CovertToUtf8(
      const string_view &str_view,
      string_view::Encoding src_encoding) {
    switch (src_encoding) {
      case string_view::Encoding::Latin1: {
        u8string u8;
        for (const auto& ch : str_view.latin1_value()){
          auto c = static_cast<uint8_t>(ch);
          if (c < 0x80) {
            u8 += c;
          } else {
            u8 += (0xc0 | c >> 6);
            u8 += (0x80 | (c & 0x3f));
          }
        }
        return string_view(std::move(u8));
      }
      case string_view::Encoding::Utf16: {
        return string_view(U16ToU8(str_view.utf16_value()));
      }
      case string_view::Encoding::Utf32: {
        return string_view(U32ToU8(str_view.utf32_value()));
      }
      case string_view::Encoding::Utf8: {
        return string_view(str_view.utf8_value());
      }
      default: {
        FOOTSTONE_UNREACHABLE();
      }
    }
    FOOTSTONE_UNREACHABLE();
  }

  static string_view ConvertEncoding(
      const string_view &str_view,
      string_view::Encoding dst_encoding) {
    string_view::Encoding src_encoding = str_view.encoding();
    switch (dst_encoding) {
      case string_view::Encoding::Latin1: {
        return CovertToLatin(str_view, src_encoding);
      }
      case string_view::Encoding::Utf16: {
        return CovertToUtf16(str_view, src_encoding);
      }
      case string_view::Encoding::Utf32: {
        return CovertToUtf32(str_view, src_encoding);
      }
      case string_view::Encoding::Utf8: {
        return CovertToUtf8(str_view, src_encoding);
      }
      default: {
        FOOTSTONE_UNREACHABLE();
      }
    }
    FOOTSTONE_UNREACHABLE();
  }

  inline static std::string ToStdString(const string_view::u8string& u8string) {
    return std::string(reinterpret_cast<const char*>(u8string.c_str()), u8string.length());
  }

  static const size_t npos = static_cast<size_t>(-1);

  inline static size_t FindLastOf(const string_view &str_view,
                                  string_view::char8_t_ u8_ch,
                                  char ch,
                                  char16_t u16_ch,
                                  char32_t u32_ch) {
    string_view::Encoding encoding = str_view.encoding();
    switch (encoding) {
      case string_view::Encoding::Latin1: {
        const std::string &str = str_view.latin1_value();
        return str.find_last_of(ch);
      }
      case string_view::Encoding::Utf16: {
        const std::u16string &str = str_view.utf16_value();
        return str.find_last_of(u16_ch);
      }
      case string_view::Encoding::Utf32: {
        const std::u32string &str = str_view.utf32_value();
        return str.find_last_of(u32_ch);
      }
      case string_view::Encoding::Utf8: {
        const string_view::u8string &str = str_view.utf8_value();
        return str.find_last_of(u8_ch);
      }
      default: {
        FOOTSTONE_UNREACHABLE();
      }
    }

    FOOTSTONE_UNREACHABLE();
  }

  inline static string_view SubStr(const string_view &str_view,
                                   size_t pos,
                                   size_t n) {
    string_view::Encoding encoding = str_view.encoding();
    switch (encoding) {
      case string_view::Encoding::Latin1: {
        const std::string &str = str_view.latin1_value();
        return string_view(str.substr(pos, n));
      }
      case string_view::Encoding::Utf16: {
        const std::u16string &str = str_view.utf16_value();
        return string_view(str.substr(pos, n));
      }
      case string_view::Encoding::Utf32: {
        const std::u32string &str = str_view.utf32_value();
        return string_view(str.substr(pos, n));
      }
      case string_view::Encoding::Utf8: {
        const string_view::u8string &str = str_view.utf8_value();
        return string_view(str.substr(pos, n));
      }
      default: {
        FOOTSTONE_UNREACHABLE();
      }
    }

    FOOTSTONE_UNREACHABLE();
  }

  inline static size_t GetLength(const string_view &str_view) {
    string_view::Encoding encoding = str_view.encoding();
    switch (encoding) {
      case string_view::Encoding::Latin1: {
        const std::string &str = str_view.latin1_value();
        return str.length();
      }
      case string_view::Encoding::Utf16: {
        const std::u16string &str = str_view.utf16_value();
        return str.length();
      }
      case string_view::Encoding::Utf32: {
        const std::u32string &str = str_view.utf32_value();
        return str.length();
      }
      case string_view::Encoding::Utf8: {
        const string_view::u8string &str = str_view.utf8_value();
        return str.length();
      }
      default: {
        FOOTSTONE_UNREACHABLE();
      }
    }

    FOOTSTONE_UNREACHABLE();
  }

 private:
  template<typename SrcChar, typename DstChar>
  inline static std::basic_string<DstChar> CopyChars(
      const std::basic_string<SrcChar> &src) {
    static_assert(sizeof(SrcChar) <= sizeof(DstChar), "copy downgrade");

    size_t len = src.length();
    std::basic_string<DstChar> dst;
    dst.resize(len);
    std::copy_n(src.c_str(), len, &dst[0]);
    return dst;
  }

  inline static string_view::u8string U32ToU8(
      const std::u32string &str) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated"
    std::wstring_convert<std::codecvt_utf8<char32_t>, char32_t> convert(
        kCharConversionFailedPrompt, kU32CharConversionFailedPrompt);
#pragma clang diagnostic pop
    std::string bytes = convert.to_bytes(str);
    const string_view::char8_t_ *ptr =
        reinterpret_cast<const string_view::char8_t_ *>(bytes.data());
    return string_view::u8string(ptr, bytes.length());
  }

  inline static std::u32string U8ToU32(
      const string_view::u8string &str) {
    const char *ptr = reinterpret_cast<const char *>(str.c_str());
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated"
    std::wstring_convert<std::codecvt_utf8<char32_t>, char32_t> convert(
        kCharConversionFailedPrompt, kU32CharConversionFailedPrompt);
#pragma clang diagnostic pop
    return convert.from_bytes(ptr, ptr + str.length());
  }

  inline static string_view::u8string U16ToU8(
      const std::u16string &str) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated"
    std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> convert(
        kCharConversionFailedPrompt, kU16CharConversionFailedPrompt);
#pragma clang diagnostic pop
    std::string bytes = convert.to_bytes(str);
    const string_view::char8_t_ *ptr =
        reinterpret_cast<const string_view::char8_t_ *>(bytes.data());
    return string_view::u8string(ptr, bytes.length());
  }

  inline static std::u16string U8ToU16(
      const string_view::u8string &str) {
    const char *ptr = reinterpret_cast<const char *>(str.c_str());
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated"
    std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> convert(
        kCharConversionFailedPrompt, kU16CharConversionFailedPrompt);
#pragma clang diagnostic pop
    return convert.from_bytes(ptr, ptr + str.length());
  }

  inline static std::u16string U32ToU16(const std::u32string &str) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated"
    std::wstring_convert<std::codecvt_utf16<char32_t>, char32_t> convert(
        kCharConversionFailedPrompt, kU32CharConversionFailedPrompt);
#pragma clang diagnostic pop
    std::string bytes = convert.to_bytes(str);
    return std::u16string(reinterpret_cast<const char16_t *>(bytes.c_str()),
                          bytes.length() / sizeof(char16_t));
  }

  inline static std::u32string U16ToU32(const std::u16string &str) {
    const char16_t *ptr = str.c_str();
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated"
    std::wstring_convert<std::codecvt_utf16<char32_t>, char32_t>
        convert(kCharConversionFailedPrompt, kU32CharConversionFailedPrompt);
#pragma clang diagnostic pop
    return convert.from_bytes(
        reinterpret_cast<const char *>(ptr),
        reinterpret_cast<const char *>(ptr + str.length()));
  }
};

}  // namespace base
}  // namespace hippy

namespace footstone {
inline namespace stringview {

inline string_view operator+(const string_view &lhs,
                                     const string_view &rhs) {
  using StringViewUtils = footstone::stringview::StringViewUtils;
  string_view::string_view::Encoding lhs_encoding =
      lhs.encoding();
  string_view::Encoding rhs_encoding = rhs.encoding();
  if (lhs_encoding <= rhs_encoding) {
    switch (rhs_encoding) {
      case string_view::Encoding::Latin1: {
        return string_view(
            StringViewUtils::ConvertEncoding(lhs, rhs_encoding).latin1_value() +
                rhs.latin1_value());
      }
      case string_view::Encoding::Utf16: {
        return string_view(
            StringViewUtils::ConvertEncoding(lhs, rhs_encoding).utf16_value() +
                rhs.utf16_value());
      }
      case string_view::Encoding::Utf32: {
        return string_view(
            StringViewUtils::ConvertEncoding(lhs, rhs_encoding).utf32_value() +
                rhs.utf32_value());
      }
      case string_view::Encoding::Utf8: {
        return string_view(
            StringViewUtils::ConvertEncoding(lhs, rhs_encoding).utf8_value() +
                rhs.utf8_value());
      }
      default: {
        FOOTSTONE_UNREACHABLE();
      }
    }
  }

  switch (lhs_encoding) {
    case string_view::Encoding::Latin1: {
      return string_view(
          lhs.latin1_value() +
              StringViewUtils::ConvertEncoding(rhs, lhs_encoding).latin1_value());
    }
    case string_view::Encoding::Utf16: {
      return string_view(
          lhs.utf16_value() +
              StringViewUtils::ConvertEncoding(rhs, lhs_encoding).utf16_value());
    }
    case string_view::Encoding::Utf32: {
      return string_view(
          lhs.utf32_value() +
              StringViewUtils::ConvertEncoding(rhs, lhs_encoding).utf32_value());
    }
    case string_view::Encoding::Utf8: {
      return string_view(
          lhs.utf8_value() +
              StringViewUtils::ConvertEncoding(rhs, lhs_encoding).utf8_value());
    }
    default: {
      FOOTSTONE_UNREACHABLE();
    }
  }
  FOOTSTONE_UNREACHABLE();
}

}  // namespace base
}  // namespace tdf
