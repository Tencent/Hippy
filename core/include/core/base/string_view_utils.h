/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#pragma once

#include <codecvt>
#include <locale>
#include <string>
#include <utility>

#include "base/logging.h"
#include "base/unicode_string_view.h"

#define EXTEND_LITERAL(ch) ch, ch, u##ch, U##ch

namespace hippy {
namespace base {

class StringViewUtils {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;
  using u8string = unicode_string_view::u8string;
  using char8_t_ = unicode_string_view::char8_t_;

  inline static bool IsEmpty(const unicode_string_view& str_view) {
    unicode_string_view::Encoding encoding = str_view.encoding();
    switch (encoding) {
      case unicode_string_view::Encoding::Unkown: {
        return true;
      }
      case unicode_string_view::Encoding::Latin1: {
        return str_view.latin1_value().empty();
      }
      case unicode_string_view::Encoding::Utf16: {
        return str_view.utf16_value().empty();
      }
      case unicode_string_view::Encoding::Utf32: {
        return str_view.utf32_value().empty();
      }
      case unicode_string_view::Encoding::Utf8: {
        return str_view.utf8_value().empty();
      }
      default:
        break;
    }

    TDF_BASE_NOTREACHED();
    return true;
  }

  static unicode_string_view CovertToLatin(
      const unicode_string_view& str_view,
      unicode_string_view::Encoding src_encoding) {
    switch (src_encoding) {
      case unicode_string_view::Encoding::Latin1: {
        return unicode_string_view(str_view.latin1_value());
      }
      case unicode_string_view::Encoding::Utf16:
      case unicode_string_view::Encoding::Utf32:
      case unicode_string_view::Encoding::Utf8:
      default: {
        TDF_BASE_NOTREACHED();
        break;
      }
    }
    return unicode_string_view();
  }

  static unicode_string_view CovertToUtf16(
      const unicode_string_view& str_view,
      unicode_string_view::Encoding src_encoding) {
    switch (src_encoding) {
      case unicode_string_view::Encoding::Latin1: {
        return unicode_string_view(
            CopyChars<char, char16_t>(str_view.latin1_value()));
      }
      case unicode_string_view::Encoding::Utf16: {
        return unicode_string_view(str_view.utf16_value());
      }
      case unicode_string_view::Encoding::Utf32: {
        return unicode_string_view(U32ToU16(str_view.utf32_value()));
      }
      case unicode_string_view::Encoding::Utf8: {
        return unicode_string_view(U8ToU16(str_view.utf8_value()));
      }
      default: {
        TDF_BASE_NOTREACHED();
        break;
      }
    }
    return unicode_string_view();
  }

  static unicode_string_view CovertToUtf32(
      const unicode_string_view& str_view,
      unicode_string_view::Encoding src_encoding) {
    switch (src_encoding) {
      case unicode_string_view::Encoding::Latin1: {
        return unicode_string_view(
            CopyChars<char, char32_t>(str_view.latin1_value()));
      }
      case unicode_string_view::Encoding::Utf16: {
        return unicode_string_view(U16ToU32(str_view.utf16_value()));
      }
      case unicode_string_view::Encoding::Utf32: {
        return unicode_string_view(str_view.utf32_value());
      }
      case unicode_string_view::Encoding::Utf8: {
        return unicode_string_view(U8ToU32(str_view.utf8_value()));
      }
      default: {
        TDF_BASE_NOTREACHED();
        break;
      }
    }
    return unicode_string_view();
  }

  static unicode_string_view CovertToUtf8(
      const unicode_string_view& str_view,
      unicode_string_view::Encoding src_encoding) {
    switch (src_encoding) {
      case unicode_string_view::Encoding::Latin1: {
        const auto& str = str_view.latin1_value();
        auto ptr =
            reinterpret_cast<const unicode_string_view::char8_t_*>(str.c_str());
        return unicode_string_view(ptr, str.length());
      }
      case unicode_string_view::Encoding::Utf16: {
        return unicode_string_view(U16ToU8(str_view.utf16_value()));
      }
      case unicode_string_view::Encoding::Utf32: {
        return unicode_string_view(U32ToU8(str_view.utf32_value()));
      }
      case unicode_string_view::Encoding::Utf8: {
        return unicode_string_view(str_view.utf8_value());
      }
      default: {
        TDF_BASE_NOTREACHED();
        break;
      }
    }
    return unicode_string_view();
  }

  static unicode_string_view Convert(
      const unicode_string_view& str_view,
      unicode_string_view::Encoding dst_encoding) {
    unicode_string_view::Encoding src_encoding = str_view.encoding();
    switch (dst_encoding) {
      case unicode_string_view::Encoding::Latin1: {
        return CovertToLatin(str_view, src_encoding);
      }
      case unicode_string_view::Encoding::Utf16: {
        return CovertToUtf16(str_view, src_encoding);
      }
      case unicode_string_view::Encoding::Utf32: {
        return CovertToUtf32(str_view, src_encoding);
      }
      case unicode_string_view::Encoding::Utf8: {
        return CovertToUtf8(str_view, src_encoding);
      }
      default: {
        TDF_BASE_NOTREACHED();
        break;
      }
    }
    return unicode_string_view();
  }

  inline static const char* U8ToConstCharPointer(
      const unicode_string_view::char8_t_* p) {
    return reinterpret_cast<const char*>(p);
  }

  inline static const unicode_string_view::char8_t_* ToU8Pointer(
      const char* p) {
    return reinterpret_cast<const unicode_string_view::char8_t_*>(p);
  }

  inline static const char* ToConstCharPointer(
      const unicode_string_view& str_view,
      unicode_string_view& view_owner) {
    TDF_BASE_DCHECK(view_owner.encoding() ==
                    unicode_string_view::Encoding::Utf8);
    unicode_string_view::Encoding encoding = str_view.encoding();
    switch (encoding) {
      case unicode_string_view::Encoding::Latin1: {
        return str_view.latin1_value().c_str();
      }
      case unicode_string_view::Encoding::Utf8: {
        return U8ToConstCharPointer(str_view.utf8_value().c_str());
      }
      case unicode_string_view::Encoding::Utf16:
      case unicode_string_view::Encoding::Utf32: {
        unicode_string_view::u8string& ref = view_owner.utf8_value();
        ref =
            Convert(str_view, unicode_string_view::Encoding::Utf8).utf8_value();
        return U8ToConstCharPointer(ref.c_str());
      }
      default: {
        TDF_BASE_NOTREACHED();
        break;
      }
    }
    TDF_BASE_NOTREACHED();
    return nullptr;
  }

  inline static unicode_string_view ConstCharPointerToStrView(const char* p,
                                                              size_t len = -1) {
    size_t length;
    if (len == -1) {
      length = strlen(p);
    } else {
      length = len;
    }
    return unicode_string_view(
        reinterpret_cast<const unicode_string_view::char8_t_*>(p), length);
  }

  inline static std::string ToU8StdStr(const unicode_string_view& str_view) {
    unicode_string_view::u8string str =
        Convert(str_view, unicode_string_view::Encoding::Utf8).utf8_value();
    return std::string(U8ToConstCharPointer(str.c_str()), str.length());
  }

  inline static size_t FindLastOf(const unicode_string_view& str_view,
                                  unicode_string_view::char8_t_ u8_ch,
                                  char ch,
                                  char16_t u16_ch,
                                  char32_t u32_ch) {
    unicode_string_view::Encoding encoding = str_view.encoding();
    switch (encoding) {
      case unicode_string_view::Encoding::Latin1: {
        const std::string& str = str_view.latin1_value();
        return str.find_last_of(ch);
        break;
      }
      case unicode_string_view::Encoding::Utf16: {
        const std::u16string& str = str_view.utf16_value();
        return str.find_last_of(u16_ch);
        break;
      }
      case unicode_string_view::Encoding::Utf32: {
        const std::u32string& str = str_view.utf32_value();
        return str.find_last_of(u32_ch);
        break;
      }
      case unicode_string_view::Encoding::Utf8: {
        const unicode_string_view::u8string& str = str_view.utf8_value();
        return str.find_last_of(u8_ch);
      }
      default: {
        TDF_BASE_NOTREACHED();
        break;
      }
    }

    TDF_BASE_NOTREACHED();
    return 0;
  }

  inline static unicode_string_view SubStr(const unicode_string_view& str_view,
                                           size_t pos,
                                           size_t n) {
    unicode_string_view::Encoding encoding = str_view.encoding();
    switch (encoding) {
      case unicode_string_view::Encoding::Latin1: {
        const std::string& str = str_view.latin1_value();
        return unicode_string_view(str.substr(pos, n));
        break;
      }
      case unicode_string_view::Encoding::Utf16: {
        const std::u16string& str = str_view.utf16_value();
        return unicode_string_view(str.substr(pos, n));
        break;
      }
      case unicode_string_view::Encoding::Utf32: {
        const std::u32string& str = str_view.utf32_value();
        return unicode_string_view(str.substr(pos, n));
        break;
      }
      case unicode_string_view::Encoding::Utf8: {
        const unicode_string_view::u8string& str = str_view.utf8_value();
        return unicode_string_view(str.substr(pos, n));
        break;
      }
      default: {
        TDF_BASE_NOTREACHED();
        break;
      }
    }

    TDF_BASE_NOTREACHED();
    return unicode_string_view();
  }

  inline static size_t GetLength(const unicode_string_view& str_view) {
    unicode_string_view::Encoding encoding = str_view.encoding();
    switch (encoding) {
      case unicode_string_view::Encoding::Latin1: {
        const std::string& str = str_view.latin1_value();
        return str.length();
        break;
      }
      case unicode_string_view::Encoding::Utf16: {
        const std::u16string& str = str_view.utf16_value();
        return str.length();
        break;
      }
      case unicode_string_view::Encoding::Utf32: {
        const std::u32string& str = str_view.utf32_value();
        return str.length();
        break;
      }
      case unicode_string_view::Encoding::Utf8: {
        const unicode_string_view::u8string& str = str_view.utf8_value();
        return str.length();
        break;
      }
      default: {
        TDF_BASE_NOTREACHED();
        break;
      }
    }

    TDF_BASE_NOTREACHED();
    return 0;
  }

 private:
  template <typename SrcChar, typename DstChar>
  inline static std::basic_string<DstChar> CopyChars(
      const std::basic_string<SrcChar>& src) {
    static_assert(sizeof(SrcChar) <= sizeof(DstChar), "copy downgrade");

    size_t len = src.length();
    std::basic_string<DstChar> dst;
    dst.resize(len);
    std::copy_n(src.c_str(), len, &dst[0]);
    return dst;
  }

  inline static unicode_string_view::u8string U32ToU8(
      const std::u32string& str) {
    std::wstring_convert<std::codecvt_utf8<char32_t>, char32_t> conv;
    std::string bytes = conv.to_bytes(str);
    const unicode_string_view::char8_t_* ptr =
        reinterpret_cast<const unicode_string_view::char8_t_*>(bytes.data());
    return unicode_string_view::u8string(ptr, bytes.length());
  }

  inline static std::u32string U8ToU32(
      const unicode_string_view::u8string& str) {
    const char* ptr = reinterpret_cast<const char*>(str.c_str());
    std::wstring_convert<std::codecvt_utf8<char32_t>, char32_t> conv;
    return conv.from_bytes(ptr, ptr + str.length());
  }

  inline static unicode_string_view::u8string U16ToU8(
      const std::u16string& str) {
    std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> convert;
    std::string bytes = convert.to_bytes(str);
    const unicode_string_view::char8_t_* ptr =
        reinterpret_cast<const unicode_string_view::char8_t_*>(bytes.data());
    return unicode_string_view::u8string(ptr, bytes.length());
  }

  inline static std::u16string U8ToU16(
      const unicode_string_view::u8string& str) {
    const char* ptr = reinterpret_cast<const char*>(str.c_str());
    std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> convert;
    return convert.from_bytes(ptr, ptr + str.length());
  }

  inline static std::u16string U32ToU16(const std::u32string& str) {
    std::wstring_convert<std::codecvt_utf16<char32_t>, char32_t> convert;
    std::string bytes = convert.to_bytes(str);
    return std::u16string(reinterpret_cast<const char16_t*>(bytes.c_str()),
                          bytes.length() / sizeof(char16_t));
  }

  inline static std::u32string U16ToU32(const std::u16string& str) {
    const char16_t* ptr = str.c_str();
    std::wstring_convert<std::codecvt_utf16<char32_t>, char32_t> convert;
    return convert.from_bytes(
        reinterpret_cast<const char*>(ptr),
        reinterpret_cast<const char*>(ptr + str.length()));
  }
};

}  // namespace base
}  // namespace hippy

namespace tdf {
namespace base {

inline unicode_string_view operator+(const unicode_string_view& lhs,
                                     const unicode_string_view& rhs) {
  using StringViewUtils = hippy::base::StringViewUtils;
  unicode_string_view::unicode_string_view::Encoding lhs_encoding =
      lhs.encoding();
  unicode_string_view::Encoding rhs_encoding = rhs.encoding();
  if (lhs_encoding <= rhs_encoding) {
    switch (rhs_encoding) {
      case unicode_string_view::Encoding::Latin1: {
        return unicode_string_view(
            StringViewUtils::Convert(lhs, rhs_encoding).latin1_value() +
            rhs.latin1_value());
      }
      case unicode_string_view::Encoding::Utf16: {
        return unicode_string_view(
            StringViewUtils::Convert(lhs, rhs_encoding).utf16_value() +
            rhs.utf16_value());
      }
      case unicode_string_view::Encoding::Utf32: {
        return unicode_string_view(
            StringViewUtils::Convert(lhs, rhs_encoding).utf32_value() +
            rhs.utf32_value());
      }
      case unicode_string_view::Encoding::Utf8: {
        return unicode_string_view(
            StringViewUtils::Convert(lhs, rhs_encoding).utf8_value() +
            rhs.utf8_value());
      }
      default: {
        TDF_BASE_NOTREACHED();
        return unicode_string_view();
      }
    }
  }

  switch (lhs_encoding) {
    case unicode_string_view::Encoding::Latin1: {
      return unicode_string_view(
          lhs.latin1_value() +
          StringViewUtils::Convert(rhs, lhs_encoding).latin1_value());
    }
    case unicode_string_view::Encoding::Utf16: {
      return unicode_string_view(
          lhs.utf16_value() +
          StringViewUtils::Convert(rhs, lhs_encoding).utf16_value());
    }
    case unicode_string_view::Encoding::Utf32: {
      return unicode_string_view(
          lhs.utf32_value() +
          StringViewUtils::Convert(rhs, lhs_encoding).utf32_value());
    }
    case unicode_string_view::Encoding::Utf8: {
      return unicode_string_view(
          lhs.utf8_value() +
          StringViewUtils::Convert(rhs, lhs_encoding).utf8_value());
    }
    default: {
      TDF_BASE_NOTREACHED();
    }
  }
  return unicode_string_view();
}

}  // namespace base
}  // namespace tdf
