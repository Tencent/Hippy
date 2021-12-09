#include "dom/deserializer.h"

#include <cstring>

#include "base/logging.h"
#include "base/unicode_string_view.h"
#include "core/base/string_view_utils.h"
#include "dom/dom_value.h"
#include "dom/serializer.h"

namespace tdf {
namespace base {

Deserializer::Deserializer(std::vector<const uint8_t> data) : position_(&data[0]), end_(&data[0] + data.size()) {}

Deserializer::Deserializer(const uint8_t* data, size_t size) : position_(data), end_(data + size) {}

void Deserializer::ReadHeader() {
  if (position_ < end_ && *position_ == static_cast<uint8_t>(SerializationTag::kVersion)) {
    version_ = ReadVarint<uint32_t>();
    TDF_BASE_CHECK(version_ > kLatestVersion);
  }
};

bool Deserializer::PeekTag(SerializationTag& tag) {
  const uint8_t* peek_position = position_;
  do {
    if (peek_position >= end_) return false;
    tag = static_cast<SerializationTag>(*peek_position);
    peek_position++;
  } while (tag == SerializationTag::kPadding);
  return true;
};

bool Deserializer::ReadTag(SerializationTag& tag) {
  do {
    if (position_ >= end_) return false;
    tag = static_cast<SerializationTag>(*position_);
    position_++;
  } while (tag == SerializationTag::kPadding);
  return true;
};

void Deserializer::ConsumeTag(SerializationTag peek_tag) {
  SerializationTag tag;
  ReadTag(tag);
  TDF_BASE_DCHECK(tag == peek_tag);
};

bool Deserializer::ReadInt32(int32_t& value) {
  value = ReadZigZag<int32_t>();
  return true;
};

bool Deserializer::ReadInt32(DomValue& dom_value) {
  dom_value = DomValue(ReadZigZag<int32_t>());
  return true;
};

bool Deserializer::ReadUInt32(uint32_t& value) {
  value = ReadVarint<uint32_t>();
  return true;
};

bool Deserializer::ReadUInt32(DomValue& dom_value) {
  dom_value = DomValue(ReadVarint<uint32_t>());
  return true;
};

bool Deserializer::ReadDouble(double& value) {
  if (sizeof(double) > static_cast<unsigned>(end_ - position_)) return false;
  memcpy(&value, position_, sizeof(double));
  position_ += sizeof(double);
  if (std::isnan(value)) value = std::numeric_limits<double>::quiet_NaN();
  return true;
};

bool Deserializer::ReadDouble(DomValue& dom_value) {
  if (sizeof(double) > static_cast<unsigned>(end_ - position_)) return false;
  double value;
  memcpy(&value, position_, sizeof(double));
  position_ += sizeof(double);
  if (std::isnan(value)) value = std::numeric_limits<double>::quiet_NaN();
  dom_value = DomValue(value);
  return true;
};

bool Deserializer::ReadUtf8String(std::string& value) {
  uint32_t utf8_length;
  utf8_length = ReadVarint<uint32_t>();
  if (utf8_length > end_ - position_) return false;

  const uint8_t* start = const_cast<uint8_t*>(position_);
  position_ += utf8_length;
  unicode_string_view string_view(start, utf8_length);
  value = hippy::base::StringViewUtils::ToU8StdStr(string_view);
  return true;
};

bool Deserializer::ReadUtf8String(DomValue& dom_value) {
  uint32_t utf8_length;
  utf8_length = ReadVarint<uint32_t>();
  if (utf8_length > end_ - position_) return false;

  const uint8_t* start = position_;
  position_ += utf8_length;
  unicode_string_view string_view(start, utf8_length);
  dom_value = hippy::base::StringViewUtils::ToU8StdStr(string_view);
  return true;
};

bool Deserializer::ReadOneByteString(std::string& value) {
  uint32_t one_byte_length;
  one_byte_length = ReadVarint<uint32_t>();
  if (one_byte_length > end_ - position_) return false;

  const char* start = reinterpret_cast<char*>(const_cast<uint8_t*>(position_));
  position_ += one_byte_length;
  unicode_string_view string_view(start, one_byte_length);
  value = hippy::base::StringViewUtils::ToU8StdStr(string_view);
  return true;
};

bool Deserializer::ReadOneByteString(DomValue& dom_value) {
  uint32_t one_byte_length;
  one_byte_length = ReadVarint<uint32_t>();
  if (one_byte_length > end_ - position_) return false;

  const char* start = reinterpret_cast<char*>(const_cast<uint8_t*>(position_));
  position_ += one_byte_length;
  unicode_string_view string_view(start, one_byte_length);
  dom_value = hippy::base::StringViewUtils::ToU8StdStr(string_view);
  return true;
};

bool Deserializer::ReadTwoByteString(std::string& value) {
  uint32_t two_byte_length;
  two_byte_length = ReadVarint<uint32_t>();
  if (two_byte_length > end_ - position_) return false;

  const char16_t* start = reinterpret_cast<char16_t*>(const_cast<uint8_t*>(position_));
  position_ += two_byte_length;
  unicode_string_view string_view(start, two_byte_length);
  value = hippy::base::StringViewUtils::ToU8StdStr(string_view);
  return true;
};

bool Deserializer::ReadTwoByteString(DomValue& dom_value) {
  uint32_t two_byte_length;
  two_byte_length = ReadVarint<uint32_t>();
  if (two_byte_length > end_ - position_) return false;

  const char16_t* start = reinterpret_cast<char16_t*>(const_cast<uint8_t*>(position_));
  position_ += two_byte_length;
  unicode_string_view string_view(start, two_byte_length);
  dom_value = hippy::base::StringViewUtils::ToU8StdStr(string_view);
  return true;
};

bool Deserializer::ReadDenseJSArray(DomValue& dom_value) {
  uint32_t length = ReadVarint<uint32_t>();
  TDF_BASE_CHECK(length > static_cast<size_t>(end_ - position_));

  DomValue::DomValueArrayType array;
  array.resize(length);

  for (uint32_t i = 0; i < length; i++) {
    SerializationTag tag;
    PeekTag(tag);
    if (tag == SerializationTag::kTheHole) {
      ConsumeTag(SerializationTag::kTheHole);
      continue;
    }

    DomValue value;
    ReadObject(value);
    array[i] = value;
  }

  uint32_t num_properties;
  uint32_t expected_num_properties;
  uint32_t expected_length;
  num_properties = ReadObjectProperties(SerializationTag::kEndDenseJSArray);
  expected_num_properties = ReadVarint<uint32_t>();
  expected_length = ReadVarint<uint32_t>();
  if (num_properties != expected_num_properties) return false;
  if (length != expected_length) return false;

  dom_value = array;
  return true;
};

bool Deserializer::ReadJSMap(DomValue& dom_value) {
  uint32_t length = 0;
  DomValue::DomValueObjectType object;

  bool ret = true;
  while (true) {
    SerializationTag tag;
    PeekTag(tag);
    if (tag == SerializationTag::kEndJSMap) {
      ConsumeTag(SerializationTag::kEndJSMap);
      break;
    }

    DomValue key;
    ret = ReadObject(key);
    if (!ret || !key.IsString()) return false;

    DomValue value;
    ret = ReadObject(value);
    if (!ret) return false;
    object[key.ToString()] = value;
    length += 2;
  }

  uint32_t expected_length;
  expected_length = ReadVarint<uint32_t>();
  if (expected_length != length) return false;

  dom_value = object;
  return ret;
};

template <typename T>
T Deserializer::ReadVarint() {
  // Reads an unsigned integer as a base-128 varint.
  // The number is written, 7 bits at a time, from the least significant to the
  // most significant 7 bits. Each byte, except the last, has the MSB set.
  // If the varint is larger than T, any more significant bits are discarded.
  // See also https://developers.google.com/protocol-buffers/docs/encoding
  static_assert(std::is_integral<T>::value && std::is_unsigned<T>::value,
                "Only unsigned integer types can be read as varints.");

  T value = 0;
  unsigned shift = 0;
  bool has_another_byte;
  do {
    TDF_BASE_CHECK(position_ >= end_);
    uint8_t byte = *position_;
    if (shift < sizeof(T) * 8) {
      value |= static_cast<T>(byte & 0x7F) << shift;
      shift += 7;
    }
    has_another_byte = byte & 0x80;
    position_++;
  } while (has_another_byte);
  return value;
}

template <typename T>
T Deserializer::ReadZigZag() {
  // Writes a signed integer as a varint using ZigZag encoding (i.e. 0 is
  // encoded as 0, -1 as 1, 1 as 2, -2 as 3, and so on).
  // See also https://developers.google.com/protocol-buffers/docs/encoding
  static_assert(std::is_integral<T>::value && std::is_signed<T>::value,
                "Only signed integer types can be read as zigzag.");
  using UnsignedT = typename std::make_unsigned<T>::type;
  UnsignedT unsigned_value;
  unsigned_value = ReadVarint<UnsignedT>();
  return static_cast<T>((unsigned_value >> 1) ^ -static_cast<T>(unsigned_value & 1));
}

bool Deserializer::ReadObject(DomValue& value) {
  bool ret = false;
  SerializationTag tag;
  ReadTag(tag);
  switch (tag) {
    case SerializationTag::kUndefined: {
      value = DomValue::Undefined();
      return true;
    }
    case SerializationTag::kNull: {
      value = DomValue::Null();
      return true;
    }
    case SerializationTag::kTrue: {
      value = DomValue(true);
      return true;
    }
    case SerializationTag::kFalse: {
      value = DomValue(false);
      return true;
    }
    case SerializationTag::kInt32: {
      int32_t i32 = ReadZigZag<int32_t>();
      value = DomValue(i32);
      return true;
    }
    case SerializationTag::kUint32: {
      uint32_t u32 = ReadVarint<uint32_t>();
      value = DomValue(u32);
      return true;
    }
    case SerializationTag::kDouble: {
      double d;
      ReadDouble(d);
      value = DomValue(d);
      return true;
    }
    case SerializationTag::kUtf8String: {
      ret = ReadUtf8String(value);
      return ret;
    }
    case SerializationTag::kOneByteString: {
      ret = ReadOneByteString(value);
      return ret;
    }
    case SerializationTag::kTwoByteString: {
      ret = ReadTwoByteString(value);
      return ret;
    }
    case SerializationTag::kBeginDenseJSArray: {
      ret = ReadDenseJSArray(value);
      return ret;
    }
    case SerializationTag::kBeginJSMap: {
      ret = ReadJSMap(value);
      return ret;
    }
    default: {
      ret = false;
    }
  }

  return ret;
}

uint32_t Deserializer::ReadObjectProperties(SerializationTag end_tag) {
  uint32_t num_properties = 0;

  // Slow path.
  for (;; num_properties++) {
    SerializationTag tag;
    PeekTag(tag);
    if (tag == end_tag) {
      ConsumeTag(end_tag);
      return num_properties;
    }

    DomValue key;
    ReadObject(key);

    DomValue value;
    ReadObject(value);
  }

  return num_properties;
}

}  // namespace base
}  // namespace tdf