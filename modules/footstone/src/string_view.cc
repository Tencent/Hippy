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

#include "include/footstone/string_view.h"

#include "include/footstone/logging.h"

using string_view = footstone::stringview::string_view;

#if defined(__GLIBC__) && !defined(__cpp_char8_t)
std::size_t std::hash<string_view::u8string>::operator()(
  const string_view::u8string& value) const noexcept {
  return std::_Hash_impl::hash(
    value.data(), value.length() * sizeof(string_view::char8_t_));
}
#endif

std::size_t std::hash<string_view>::operator()(
  const footstone::string_view& value) const noexcept {
  switch (value.encoding_) {
    case footstone::string_view::Encoding::Latin1:
      return std::hash<footstone::string_view::string>{}(value.latin1_string_);
    case footstone::string_view::Encoding::Utf8:
      return std::hash<footstone::string_view::u8string>{}(value.u8_string_);
    case footstone::string_view::Encoding::Utf16:
      return std::hash<footstone::string_view::u16string>{}(value.u16_string_);
    case footstone::string_view::Encoding::Utf32:
      return std::hash<footstone::string_view::u32string>{}(value.u32_string_);
    default:
      break;
  }
  return 0;
}

namespace footstone {
inline namespace stringview {

string_view::string_view(const string_view& source)
    : encoding_(source.encoding_) {
  switch (encoding_) {
    case Encoding::Latin1:
      new (&latin1_string_) string(source.latin1_string_);
      break;
    case Encoding::Utf8:
      new (&u8_string_) u8string(source.u8_string_);
      break;
    case Encoding::Utf16:
      new (&u16_string_) u16string(source.u16_string_);
      break;
    case Encoding::Utf32:
      new (&u32_string_) u32string(source.u32_string_);
      break;
    default:
      break;
  }
}

string_view::~string_view() { deallocate(); }

inline void string_view::deallocate() {
  switch (encoding_) {
    case Encoding::Latin1:
      latin1_string_.~basic_string();
      break;
    case Encoding::Utf8:
      u8_string_.~basic_string();
      break;
    case Encoding::Utf16:
      u16_string_.~basic_string();
      break;
    case Encoding::Utf32:
      u32_string_.~basic_string();
      break;
    default:
      break;
  }
  encoding_ = Encoding::Unknown;
}

string_view& string_view::operator=(const string_view& rhs) noexcept {
  if (this == &rhs) {
    return *this;
  }

  switch (rhs.encoding_) {
    case string_view::Encoding::Latin1:
      if (encoding_ != Encoding::Latin1) {
        deallocate();
        new (&latin1_string_) string(rhs.latin1_string_);
      } else {
        latin1_string_ = rhs.latin1_string_;
      }
      break;
    case string_view::Encoding::Utf8:
      if (encoding_ != Encoding::Utf8) {
        deallocate();
        new (&u8_string_) u8string(rhs.u8_string_);
      } else {
        u8_string_ = rhs.u8_string_;
      }
      break;
    case string_view::Encoding::Utf16:
      if (encoding_ != Encoding::Utf16) {
        deallocate();
        new (&u16_string_) u16string(rhs.u16_string_);
      } else {
        u16_string_ = rhs.u16_string_;
      }
      break;
    case string_view::Encoding::Utf32:
      if (encoding_ != Encoding::Utf32) {
        deallocate();
        new (&u32_string_) u32string(rhs.u32_string_);
      } else {
        u32_string_ = rhs.u32_string_;
      }
      break;
    default:
      break;
  }
  encoding_ = rhs.encoding_;
  return *this;
}
string_view& string_view::operator=(const char* rhs) noexcept {
  if (encoding_ != Encoding::Latin1) {
    deallocate();
    new (&latin1_string_) string;
    encoding_ = Encoding::Latin1;
  }
  latin1_string_ = rhs;
  return *this;
}
string_view& string_view::operator=(const string& rhs) noexcept {
  if (encoding_ != Encoding::Latin1) {
    deallocate();
    new (&latin1_string_) string;
    encoding_ = Encoding::Latin1;
  }
  latin1_string_ = rhs;
  return *this;
}
string_view& string_view::operator=(const char8_t_* rhs) noexcept {
  if (encoding_ != Encoding::Utf8) {
    deallocate();
    new (&u8_string_) u8string(rhs);
    encoding_ = Encoding::Utf8;
  }
  return *this;
}
string_view& string_view::operator=(const u8string& rhs) noexcept {
  if (encoding_ != Encoding::Utf8) {
    deallocate();
    new (&u8_string_) u8string(rhs);
    encoding_ = Encoding::Utf8;
  }
  return *this;
}
string_view& string_view::operator=(const char16_t* rhs) noexcept {
  if (encoding_ != Encoding::Utf16) {
    deallocate();
    new (&u16_string_) u16string(rhs);
    encoding_ = Encoding::Utf16;
  }
  return *this;
}
string_view& string_view::operator=(const u16string& rhs) noexcept {
  if (encoding_ != Encoding::Utf16) {
    deallocate();
    new (&u16_string_) u16string(rhs);
    encoding_ = Encoding::Utf16;
  }
  return *this;
}
string_view& string_view::operator=(const char32_t* rhs) noexcept {
  if (encoding_ != Encoding::Utf32) {
    deallocate();
    new (&u32_string_) u32string(rhs);
    encoding_ = Encoding::Utf32;
  }
  return *this;
}
string_view& string_view::operator=(const u32string& rhs) noexcept {
  if (encoding_ != Encoding::Utf32) {
    deallocate();
    new (&u32_string_) u32string(rhs);
    encoding_ = Encoding::Utf32;
  }
  return *this;
}
bool string_view::operator==(const string_view& rhs) const noexcept {
  if (encoding_ != rhs.encoding_) {
    return false;
  }

  switch (encoding_) {
    case Encoding::Latin1:
      return latin1_string_ == rhs.latin1_string_;
    case Encoding::Utf8:
      return u8_string_ == rhs.u8_string_;
    case Encoding::Utf16:
      return u16_string_ == rhs.u16_string_;
    case Encoding::Utf32:
      return u32_string_ == rhs.u32_string_;
    default:
      break;
  }
  return false;
}
bool string_view::operator!=(const string_view& rhs) const noexcept {
  return !operator==(rhs);
}

bool string_view::operator<(const string_view& rhs) const noexcept {
  if (encoding_ != rhs.encoding_) {
    return false;
  }

  switch (encoding_) {
    case Encoding::Latin1:
      return latin1_string_ < rhs.latin1_string_;
    case Encoding::Utf8:
      return u8_string_ < rhs.u8_string_;
    case Encoding::Utf16:
      return u16_string_ < rhs.u16_string_;
    case Encoding::Utf32:
      return u32_string_ < rhs.u32_string_;
    default:
      break;
  }
  return false;
}
bool string_view::operator>(const string_view& rhs) const noexcept {
  if (encoding_ != rhs.encoding_) {
    return false;
  }

  switch (encoding_) {
    case Encoding::Latin1:
      return latin1_string_ > rhs.latin1_string_;
    case Encoding::Utf8:
      return u8_string_ > rhs.u8_string_;
    case Encoding::Utf16:
      return u16_string_ > rhs.u16_string_;
    case Encoding::Utf32:
      return u32_string_ > rhs.u32_string_;
    default:
      break;
  }
  return false;
}
bool string_view::operator<=(const string_view& rhs) const noexcept {
  if (encoding_ != rhs.encoding_) {
    return false;
  }
  return !operator>(rhs);
}
bool string_view::operator>=(const string_view& rhs) const noexcept {
  if (encoding_ != rhs.encoding_) {
    return false;
  }
  return !operator<(rhs);
}

bool string_view::is_latin1() const noexcept { return encoding_ == Encoding::Latin1; }
bool string_view::is_utf8() const noexcept { return encoding_ == Encoding::Utf8; }
bool string_view::is_utf16() const noexcept { return encoding_ == Encoding::Utf16; }
bool string_view::is_utf32() const noexcept { return encoding_ == Encoding::Utf32; }

string_view::string& string_view::latin1_value() {
  FOOTSTONE_CHECK(encoding_ == Encoding::Latin1);
  return latin1_string_;
}
const string_view::string& string_view::latin1_value() const {
  FOOTSTONE_CHECK(encoding_ == Encoding::Latin1);
  return latin1_string_;
}
string_view::u8string& string_view::utf8_value() {
  FOOTSTONE_CHECK(encoding_ == Encoding::Utf8);
  return u8_string_;
}
const string_view::u8string& string_view::utf8_value() const {
  FOOTSTONE_CHECK(encoding_ == Encoding::Utf8);
  return u8_string_;
}
string_view::u16string& string_view::utf16_value() {
  FOOTSTONE_CHECK(encoding_ == Encoding::Utf16);
  return u16_string_;
}
const string_view::u16string& string_view::utf16_value() const {
  FOOTSTONE_CHECK(encoding_ == Encoding::Utf16);
  return u16_string_;
}
string_view::u32string& string_view::utf32_value() {
  FOOTSTONE_CHECK(encoding_ == Encoding::Utf32);
  return u32_string_;
}
const string_view::u32string& string_view::utf32_value() const {
  FOOTSTONE_CHECK(encoding_ == Encoding::Utf32);
  return u32_string_;
}

} // namespace stringview
} // namespace footstone
