#include <cassert>

#include "base/unicode_string_view.h"

using unicode_string_view = tdf::base::unicode_string_view;

std::size_t std::hash<unicode_string_view>::operator()(
    const unicode_string_view& value) const noexcept {
  switch (value.encoding_) {
    case unicode_string_view::Encoding::Latin1:
      return std::hash<unicode_string_view::string>{}(value.latin1_string_);
    case unicode_string_view::Encoding::Utf8:
      return std::hash<unicode_string_view::u8string>{}(value.u8_string_);
    case unicode_string_view::Encoding::Utf16:
      return std::hash<unicode_string_view::u16string>{}(value.u16_string_);
    case unicode_string_view::Encoding::Utf32:
      return std::hash<unicode_string_view::u32string>{}(value.u32_string_);
    default:
      break;
  }
  return 0;
}

namespace tdf {
namespace base {

unicode_string_view::unicode_string_view(const unicode_string_view& source)
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

unicode_string_view::~unicode_string_view() { deallocate(); }

inline void unicode_string_view::deallocate() {
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
  encoding_ = Encoding::Unkown;
}

unicode_string_view& unicode_string_view::operator=(const unicode_string_view& rhs) noexcept {
  if (this == &rhs) {
    return *this;
  }

  switch (rhs.encoding_) {
    case unicode_string_view::Encoding::Latin1:
      if (encoding_ != Encoding::Latin1) {
        deallocate();
        new (&latin1_string_) string(rhs.latin1_string_);
      } else {
        latin1_string_ = rhs.latin1_string_;
      }
      break;
    case unicode_string_view::Encoding::Utf8:
      if (encoding_ != Encoding::Utf8) {
        deallocate();
        new (&u8_string_) u8string(rhs.u8_string_);
      } else {
        u8_string_ = rhs.u8_string_;
      }
      break;
    case unicode_string_view::Encoding::Utf16:
      if (encoding_ != Encoding::Utf16) {
        deallocate();
        new (&u16_string_) u16string(rhs.u16_string_);
      } else {
        u16_string_ = rhs.u16_string_;
      }
      break;
    case unicode_string_view::Encoding::Utf32:
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
unicode_string_view& unicode_string_view::operator=(const char* rhs) noexcept {
  if (encoding_ != Encoding::Latin1) {
    deallocate();
    new (&latin1_string_) string;
    encoding_ = Encoding::Latin1;
  }
  latin1_string_ = rhs;
  return *this;
}
unicode_string_view& unicode_string_view::operator=(const string& rhs) noexcept {
  if (encoding_ != Encoding::Latin1) {
    deallocate();
    new (&latin1_string_) string;
    encoding_ = Encoding::Latin1;
  }
  latin1_string_ = rhs;
  return *this;
}
unicode_string_view& unicode_string_view::operator=(const char8_t_* rhs) noexcept {
  if (encoding_ != Encoding::Utf8) {
    deallocate();
    new (&u8_string_) u8string(rhs);
    encoding_ = Encoding::Utf8;
  }
  return *this;
}
unicode_string_view& unicode_string_view::operator=(const u8string& rhs) noexcept {
  if (encoding_ != Encoding::Utf8) {
    deallocate();
    new (&u8_string_) u8string(rhs);
    encoding_ = Encoding::Utf8;
  }
  return *this;
}
unicode_string_view& unicode_string_view::operator=(const char16_t* rhs) noexcept {
  if (encoding_ != Encoding::Utf16) {
    deallocate();
    new (&u16_string_) u16string(rhs);
    encoding_ = Encoding::Utf16;
  }
  return *this;
}
unicode_string_view& unicode_string_view::operator=(const u16string& rhs) noexcept {
  if (encoding_ != Encoding::Utf16) {
    deallocate();
    new (&u16_string_) u16string(rhs);
    encoding_ = Encoding::Utf16;
  }
  return *this;
}
unicode_string_view& unicode_string_view::operator=(const char32_t* rhs) noexcept {
  if (encoding_ != Encoding::Utf32) {
    deallocate();
    new (&u32_string_) u32string(rhs);
    encoding_ = Encoding::Utf32;
  }
  return *this;
}
unicode_string_view& unicode_string_view::operator=(const u32string& rhs) noexcept {
  if (encoding_ != Encoding::Utf32) {
    deallocate();
    new (&u32_string_) u32string(rhs);
    encoding_ = Encoding::Utf32;
  }
  return *this;
}
bool unicode_string_view::operator==(const unicode_string_view& rhs) const noexcept {
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
bool unicode_string_view::operator!=(const unicode_string_view& rhs) const noexcept {
  return !operator==(rhs);
}

bool unicode_string_view::operator<(const unicode_string_view& rhs) const noexcept {
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
bool unicode_string_view::operator>(const unicode_string_view& rhs) const noexcept {
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
bool unicode_string_view::operator<=(const unicode_string_view& rhs) const noexcept {
  if (encoding_ != rhs.encoding_) {
    return false;
  }
  return !operator>(rhs);
}
bool unicode_string_view::operator>=(const unicode_string_view& rhs) const noexcept {
  if (encoding_ != rhs.encoding_) {
    return false;
  }
  return !operator<(rhs);
}

bool unicode_string_view::is_latin1() const noexcept { return encoding_ == Encoding::Latin1; }
bool unicode_string_view::is_utf8() const noexcept { return encoding_ == Encoding::Utf8; }
bool unicode_string_view::is_utf16() const noexcept { return encoding_ == Encoding::Utf16; }
bool unicode_string_view::is_utf32() const noexcept { return encoding_ == Encoding::Utf32; }

unicode_string_view::string& unicode_string_view::latin1_value() {
  assert(encoding_ == Encoding::Latin1);
  return latin1_string_;
}
const unicode_string_view::string& unicode_string_view::latin1_value() const {
  assert(encoding_ == Encoding::Latin1);
  return latin1_string_;
}
unicode_string_view::u8string& unicode_string_view::utf8_value() {
  assert(encoding_ == Encoding::Utf8);
  return u8_string_;
}
const unicode_string_view::u8string& unicode_string_view::utf8_value() const {
  assert(encoding_ == Encoding::Utf8);
  return u8_string_;
}
unicode_string_view::u16string& unicode_string_view::utf16_value() {
  assert(encoding_ == Encoding::Utf16);
  return u16_string_;
}
const unicode_string_view::u16string& unicode_string_view::utf16_value() const {
  assert(encoding_ == Encoding::Utf16);
  return u16_string_;
}
unicode_string_view::u32string& unicode_string_view::utf32_value() {
  assert(encoding_ == Encoding::Utf32);
  return u32_string_;
}
const unicode_string_view::u32string& unicode_string_view::utf32_value() const {
  assert(encoding_ == Encoding::Utf32);
  return u32_string_;
}

}  // namespace base
}  // namespace tdf
