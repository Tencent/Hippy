#pragma once
#include <string>

#ifdef _MSC_VER
#pragma warning(disable : 26495)
#endif  // _MSC_VERR

#ifdef __cpp_char8_t
#define u8_type char8_t
#else
#define u8_type char
#endif

namespace tdf {
namespace base {

class unicode_string_view final {
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
  inline static unicode_string_view new_from_utf8(const u8_type* utf8_string, size_t length) {
    return unicode_string_view(reinterpret_cast<const char8_t_*>(utf8_string), length);
  }
  inline static unicode_string_view new_from_utf8(const u8_type* utf8_string) {
    return unicode_string_view(reinterpret_cast<const char8_t_*>(utf8_string));
  }
  unicode_string_view() {}
  unicode_string_view(const unicode_string_view& source);
#pragma region Latin - 1
  unicode_string_view(const char* latin1_string)
      : encoding_(Encoding::Latin1), latin1_string_(string(latin1_string)) {}
  unicode_string_view(const char* latin1_string, size_t length)
      : encoding_(Encoding::Latin1), latin1_string_(string(latin1_string, length)) {}
  explicit unicode_string_view(const string& latin1_string)
      : encoding_(Encoding::Latin1), latin1_string_(latin1_string) {}
  explicit unicode_string_view(string&& latin1_string)
      : encoding_(Encoding::Latin1), latin1_string_(std::move(latin1_string)) {}
#pragma endregion
#pragma region UTF - 8
  unicode_string_view(const char8_t_* utf8_string)
      : encoding_(Encoding::Utf8), u8_string_(u8string(utf8_string)) {}
  unicode_string_view(const char8_t_* utf8_string, size_t length)
      : encoding_(Encoding::Utf8), u8_string_(u8string(utf8_string, length)) {}
  explicit unicode_string_view(const u8string& utf8_string)
      : encoding_(Encoding::Utf8), u8_string_(utf8_string) {}
  explicit unicode_string_view(u8string&& utf8_string)
      : encoding_(Encoding::Utf8), u8_string_(std::move(utf8_string)) {}
#pragma endregion
#pragma region UTF - 16
  unicode_string_view(const char16_t* utf16_string)
      : encoding_(Encoding::Utf16), u16_string_(u16string(utf16_string)) {}
  unicode_string_view(const char16_t* utf16_string, size_t length)
      : encoding_(Encoding::Utf16), u16_string_(u16string(utf16_string, length)) {}
  explicit unicode_string_view(const u16string& utf16_string)
      : encoding_(Encoding::Utf16), u16_string_(utf16_string) {}
  explicit unicode_string_view(u16string&& utf16_string)
      : encoding_(Encoding::Utf16), u16_string_(std::move(utf16_string)) {}
#pragma endregion
#pragma region UTF - 32
  unicode_string_view(const char32_t* utf32_string)
      : encoding_(Encoding::Utf32), u32_string_(u32string(utf32_string)) {}
  unicode_string_view(const char32_t* utf32_string, size_t length)
      : encoding_(Encoding::Utf32), u32_string_(u32string(utf32_string, length)) {}
  explicit unicode_string_view(const u32string& utf32_string)
      : encoding_(Encoding::Utf32), u32_string_(utf32_string) {}
  explicit unicode_string_view(u32string&& utf32_string)
      : encoding_(Encoding::Utf32), u32_string_(std::move(utf32_string)) {}
#pragma endregion
  ~unicode_string_view();

 public:
  unicode_string_view& operator=(const unicode_string_view& rhs) noexcept;
  unicode_string_view& operator=(const string& rhs) noexcept;
  unicode_string_view& operator=(const char* rhs) noexcept;
  unicode_string_view& operator=(const u8string& rhs) noexcept;
  unicode_string_view& operator=(const char8_t_* rhs) noexcept;
  unicode_string_view& operator=(const u16string& rhs) noexcept;
  unicode_string_view& operator=(const char16_t* rhs) noexcept;
  unicode_string_view& operator=(const u32string& rhs) noexcept;
  unicode_string_view& operator=(const char32_t* rhs) noexcept;

 public:
  bool operator==(const unicode_string_view& rhs) const noexcept;
  bool operator!=(const unicode_string_view& rhs) const noexcept;
  bool operator<(const unicode_string_view& rhs) const noexcept;
  bool operator<=(const unicode_string_view& rhs) const noexcept;
  bool operator>(const unicode_string_view& rhs) const noexcept;
  bool operator>=(const unicode_string_view& rhs) const noexcept;

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

  friend std::hash<unicode_string_view>;
};

}  // namespace base
}  // namespace tdf

template <>
struct std::hash<tdf::base::unicode_string_view> {
  std::size_t operator()(const tdf::base::unicode_string_view& value) const noexcept;
};

inline namespace literals {
inline namespace string_literals {
[[nodiscard]] inline constexpr const tdf::base::unicode_string_view::char8_t_* operator"" _u8_ptr(
    const u8_type* u8, size_t) {
  return (tdf::base::unicode_string_view::char8_t_*)u8;
}

[[nodiscard]] inline const tdf::base::unicode_string_view operator"" _u8s(const u8_type* u8,
                                                                          size_t length) {
  return tdf::base::unicode_string_view::new_from_utf8(u8, length);
}
}  // namespace string_literals
}  // namespace literals

#undef u8_type
