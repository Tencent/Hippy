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

#include <string>

#ifdef _MSC_VER
#pragma warning(disable : 26495)
#endif  // _MSC_VER

#ifdef __cpp_char8_t
#define u8_type char8_t
#else
#define u8_type char
#endif

namespace footstone {
inline namespace stringview {

class string_view final {
 public:
  enum class Encoding { Unknown, Latin1, Utf8, Utf16, Utf32 };
  using string = std::string;
#ifdef __cpp_char8_t
  using u8string = std::u8string;
  using char8_t_ = char8_t;
#else
  using char8_t_ = uint8_t;
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated"
  using u8string = std::basic_string<uint8_t, std::char_traits<uint8_t>, std::allocator<uint8_t> >;
#pragma clang diagnostic pop
#endif  // __cpp_char8_t
  using u16string = std::u16string;
  using u32string = std::u32string;

 public:
  inline static string_view new_from_utf8(const u8_type* utf8_string, size_t length) {
    return string_view(reinterpret_cast<const char8_t_*>(utf8_string), length);
  }
  inline static string_view new_from_utf8(const u8_type* utf8_string) {
    return string_view(reinterpret_cast<const char8_t_*>(utf8_string));
  }
  string_view() {}
  string_view(const string_view& source); // NOLINT
#pragma region Latin - 1
  string_view(const char* latin1_string)  // NOLINT
      : encoding_(Encoding::Latin1), latin1_string_(string(latin1_string)) {}
  string_view(const char* latin1_string, size_t length)
      : encoding_(Encoding::Latin1), latin1_string_(string(latin1_string, length)) {}
  explicit string_view(const string& latin1_string)
      : encoding_(Encoding::Latin1), latin1_string_(latin1_string) {}
  explicit string_view(string&& latin1_string)
      : encoding_(Encoding::Latin1), latin1_string_(std::move(latin1_string)) {}
#pragma endregion
#pragma region UTF - 8
  string_view(const char8_t_* utf8_string)  // NOLINT
      : encoding_(Encoding::Utf8), u8_string_(u8string(utf8_string)) {}
  string_view(const char8_t_* utf8_string, size_t length)
      : encoding_(Encoding::Utf8), u8_string_(u8string(utf8_string, length)) {}
  explicit string_view(const u8string& utf8_string)
      : encoding_(Encoding::Utf8), u8_string_(utf8_string) {}
  explicit string_view(u8string&& utf8_string)
      : encoding_(Encoding::Utf8), u8_string_(std::move(utf8_string)) {}
#pragma endregion
#pragma region UTF - 16
  string_view(const char16_t* utf16_string)  // NOLINT
      : encoding_(Encoding::Utf16), u16_string_(u16string(utf16_string)) {}
  string_view(const char16_t* utf16_string, size_t length)
      : encoding_(Encoding::Utf16), u16_string_(u16string(utf16_string, length)) {}
  explicit string_view(const u16string& utf16_string)
      : encoding_(Encoding::Utf16), u16_string_(utf16_string) {}
  explicit string_view(u16string&& utf16_string)
      : encoding_(Encoding::Utf16), u16_string_(std::move(utf16_string)) {}
#pragma endregion
#pragma region UTF - 32
  string_view(const char32_t* utf32_string)  // NOLINT
      : encoding_(Encoding::Utf32), u32_string_(u32string(utf32_string)) {}
  string_view(const char32_t* utf32_string, size_t length)
      : encoding_(Encoding::Utf32), u32_string_(u32string(utf32_string, length)) {}
  explicit string_view(const u32string& utf32_string)
      : encoding_(Encoding::Utf32), u32_string_(utf32_string) {}
  explicit string_view(u32string&& utf32_string)
      : encoding_(Encoding::Utf32), u32_string_(std::move(utf32_string)) {}
#pragma endregion
  ~string_view();

 public:
  string_view& operator=(const string_view& rhs) noexcept;
  string_view& operator=(const string& rhs) noexcept;
  string_view& operator=(const char* rhs) noexcept;
  string_view& operator=(const u8string& rhs) noexcept;
  string_view& operator=(const char8_t_* rhs) noexcept;
  string_view& operator=(const u16string& rhs) noexcept;
  string_view& operator=(const char16_t* rhs) noexcept;
  string_view& operator=(const u32string& rhs) noexcept;
  string_view& operator=(const char32_t* rhs) noexcept;

 public:
  bool operator==(const string_view& rhs) const noexcept;
  bool operator!=(const string_view& rhs) const noexcept;
  bool operator<(const string_view& rhs) const noexcept;
  bool operator<=(const string_view& rhs) const noexcept;
  bool operator>(const string_view& rhs) const noexcept;
  bool operator>=(const string_view& rhs) const noexcept;

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
  Encoding encoding_ = Encoding::Unknown;
  union {
    string latin1_string_;
    u8string u8_string_;
    u16string u16_string_;
    u32string u32_string_;
  };

  friend std::hash<string_view>;
};

}  // namespace stringview
}  // namespace footstone

#ifdef __APPLE__
#if defined(__clang__) && __clang_major__ >= 15
template<>
struct std::hash<footstone::stringview::string_view::u8string> {
  std::size_t operator()(const footstone::stringview::string_view::u8string& value) const noexcept;
};
#endif
#endif

template<>
struct std::hash<footstone::stringview::string_view> {
  std::size_t operator()(const footstone::stringview::string_view& value) const noexcept;
};

inline namespace literals {
inline namespace string_literals {
[[nodiscard]] inline constexpr const footstone::stringview::string_view::char8_t_* operator "" _u8_ptr(
    const u8_type* u8, size_t) {
  return (footstone::stringview::string_view::char8_t_*) u8;
}

[[nodiscard]] inline const footstone::stringview::string_view operator "" _u8s(const u8_type* u8,
                                                                                       size_t length) {
  return footstone::stringview::string_view(u8, length);
}
}  // namespace string_literals
}  // namespace literals

#undef u8_type
