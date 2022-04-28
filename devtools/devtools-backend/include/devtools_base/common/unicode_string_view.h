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
#include <string>
#include <memory>
#include <utility>

#ifdef _MSC_VER
#pragma warning(disable : 26495)
#endif  // _MSC_VERR

#ifdef __cpp_char8_t
#define u8_type char8_t
#else
#define u8_type char
#endif

namespace hippy::devtools {
inline namespace stringview {
class unicode_string_view_temp final {
 public:
  enum class Encoding { Unkown, Latin1, Utf8, Utf16, Utf32 };
  using string = std::string;
#ifdef __cpp_char8_t
  using u8string = std::u8string;
  using char8_t_ = char8_t;
#else
  using char8_t_ = uint8_t;
  using u8string = std::basic_string<uint8_t, std::char_traits<uint8_t>, std::allocator<uint8_t> >;
#endif  // __cpp_char8_t
  using u16string = std::u16string;
  using u32string = std::u32string;

 public:
  inline static unicode_string_view_temp new_from_utf8(const u8_type* utf8_string, size_t length) {
    return unicode_string_view_temp(reinterpret_cast<const char8_t_*>(utf8_string), length);
  }
  inline static unicode_string_view_temp new_from_utf8(const u8_type* utf8_string) {
    return unicode_string_view_temp(reinterpret_cast<const char8_t_*>(utf8_string));
  }
  unicode_string_view_temp() {}
  unicode_string_view_temp(const unicode_string_view_temp& source); // NOLINT
#pragma region Latin - 1
  unicode_string_view_temp(const char* latin1_string)  // NOLINT
      : encoding_(Encoding::Latin1), latin1_string_(string(latin1_string)) {}
  unicode_string_view_temp(const char* latin1_string, size_t length)
      : encoding_(Encoding::Latin1), latin1_string_(string(latin1_string, length)) {}
  explicit unicode_string_view_temp(const string& latin1_string)
      : encoding_(Encoding::Latin1), latin1_string_(latin1_string) {}
  explicit unicode_string_view_temp(string&& latin1_string)
      : encoding_(Encoding::Latin1), latin1_string_(std::move(latin1_string)) {}
#pragma endregion
#pragma region UTF - 8
  unicode_string_view_temp(const char8_t_* utf8_string)  // NOLINT
      : encoding_(Encoding::Utf8), u8_string_(u8string(utf8_string)) {}
  unicode_string_view_temp(const char8_t_* utf8_string, size_t length)
      : encoding_(Encoding::Utf8), u8_string_(u8string(utf8_string, length)) {}
  explicit unicode_string_view_temp(const u8string& utf8_string)
      : encoding_(Encoding::Utf8), u8_string_(utf8_string) {}
  explicit unicode_string_view_temp(u8string&& utf8_string)
      : encoding_(Encoding::Utf8), u8_string_(std::move(utf8_string)) {}
#pragma endregion
#pragma region UTF - 16
  unicode_string_view_temp(const char16_t* utf16_string)  // NOLINT
      : encoding_(Encoding::Utf16), u16_string_(u16string(utf16_string)) {}
  unicode_string_view_temp(const char16_t* utf16_string, size_t length)
      : encoding_(Encoding::Utf16), u16_string_(u16string(utf16_string, length)) {}
  explicit unicode_string_view_temp(const u16string& utf16_string)
      : encoding_(Encoding::Utf16), u16_string_(utf16_string) {}
  explicit unicode_string_view_temp(u16string&& utf16_string)
      : encoding_(Encoding::Utf16), u16_string_(std::move(utf16_string)) {}
#pragma endregion
#pragma region UTF - 32
  unicode_string_view_temp(const char32_t* utf32_string)  // NOLINT
      : encoding_(Encoding::Utf32), u32_string_(u32string(utf32_string)) {}
  unicode_string_view_temp(const char32_t* utf32_string, size_t length)
      : encoding_(Encoding::Utf32), u32_string_(u32string(utf32_string, length)) {}
  explicit unicode_string_view_temp(const u32string& utf32_string)
      : encoding_(Encoding::Utf32), u32_string_(utf32_string) {}
  explicit unicode_string_view_temp(u32string&& utf32_string)
      : encoding_(Encoding::Utf32), u32_string_(std::move(utf32_string)) {}
#pragma endregion
  ~unicode_string_view_temp();

 public:
  unicode_string_view_temp& operator=(const unicode_string_view_temp& rhs) noexcept;
  unicode_string_view_temp& operator=(const string& rhs) noexcept;
  unicode_string_view_temp& operator=(const char* rhs) noexcept;
  unicode_string_view_temp& operator=(const u8string& rhs) noexcept;
  unicode_string_view_temp& operator=(const char8_t_* rhs) noexcept;
  unicode_string_view_temp& operator=(const u16string& rhs) noexcept;
  unicode_string_view_temp& operator=(const char16_t* rhs) noexcept;
  unicode_string_view_temp& operator=(const u32string& rhs) noexcept;
  unicode_string_view_temp& operator=(const char32_t* rhs) noexcept;

 public:
  bool operator==(const unicode_string_view_temp& rhs) const noexcept;
  bool operator!=(const unicode_string_view_temp& rhs) const noexcept;
  bool operator<(const unicode_string_view_temp& rhs) const noexcept;
  bool operator<=(const unicode_string_view_temp& rhs) const noexcept;
  bool operator>(const unicode_string_view_temp& rhs) const noexcept;
  bool operator>=(const unicode_string_view_temp& rhs) const noexcept;

 public:
  inline Encoding encoding() noexcept { return encoding_; }
  Encoding encoding() const noexcept { return encoding_; }

 public:
  bool is_latin1() const noexcept;
  bool is_utf8() const noexcept;
  bool is_utf16() const noexcept;
  bool is_utf32() const noexcept;

 public:
  string& latin1_value();
  const string& latin1_value() const;
  u8string& utf8_value();
  const u8string& utf8_value() const;
  u16string& utf16_value();
  const u16string& utf16_value() const;
  u32string& utf32_value();
  const u32string& utf32_value() const;

 private:
  inline void deallocate();

 private:
  Encoding encoding_ = Encoding::Unkown;
  union {
    string latin1_string_;
    u8string u8_string_;
    u16string u16_string_;
    u32string u32_string_;
  };

  friend std::hash<unicode_string_view_temp>;
};
}  // namespace stringview
}  // namespace hippy::devtools

template <>
struct std::hash<hippy::devtools::unicode_string_view_temp> {
  std::size_t operator()(const hippy::devtools::unicode_string_view_temp& value) const noexcept;
};

#if !defined(__cpp_char8_t) && (defined(__GLIBC__))
template <>
struct std::hash<hippy::devtools::stringview::unicode_string_view_temp::u8string>
  : public std::__hash_base<size_t, hippy::devtools::stringview::unicode_string_view_temp::u8string> {
  std::size_t operator()(
    const hippy::devtools::stringview::unicode_string_view_temp::u8string& value) const noexcept;
};
#endif

#undef u8_type
