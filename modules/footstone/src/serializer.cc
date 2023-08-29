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

#include "include/footstone/serializer.h"

#include <codecvt>
#include <type_traits>

#include "include/footstone/check.h"
#include "include/footstone/logging.h"

namespace footstone {
inline namespace value {

constexpr uint32_t kVersion = 13;

Serializer::Serializer() = default;

Serializer::~Serializer() {
  if (buffer_) {
    free(buffer_);
  }
}

void Serializer::WriteValue(const HippyValue& hippy_value) {
  WriteObject(hippy_value);
}

void Serializer::WriteHeader() {
  WriteTag(SerializationTag::kVersion);
  WriteVarint(kVersion);
}

std::pair<uint8_t*, size_t> Serializer::Release() {
  auto result = std::make_pair(buffer_, buffer_size_);
  buffer_ = nullptr;
  buffer_size_ = 0;
  buffer_capacity_ = 0;
  return result;
}

void Serializer::WriteOddball(Oddball oddball) {
  SerializationTag tag;
  switch (oddball) {
    case Oddball::kUndefined:tag = SerializationTag::kUndefined;
      break;
    case Oddball::kFalse:tag = SerializationTag::kFalse;
      break;
    case Oddball::kTrue:tag = SerializationTag::kTrue;
      break;
    case Oddball::kNull:tag = SerializationTag::kNull;
      break;
    default:FOOTSTONE_UNREACHABLE();
  }
  WriteTag(tag);
}

void Serializer::WriteUint32(uint32_t value) {
  WriteTag(SerializationTag::kUint32);
  WriteVarint<uint32_t>(value);
}

void Serializer::WriteInt32(int32_t value) {
  WriteTag(SerializationTag::kInt32);
  WriteZigZag<int32_t>(value);
}

void Serializer::WriteDouble(double value) {
  WriteTag(SerializationTag::kDouble);
  WriteRawBytes(&value, sizeof(value));
}

void Serializer::WriteString(const std::string& value) {
  bool one_byte_string = true;
  const char* c = value.c_str();
  for (size_t i = 0; i < value.length(); i++) {
    if (static_cast<unsigned char>(*(c + i)) >= 0x80) {
      one_byte_string = false;
      break;
    }
  }

  if (one_byte_string) {
    WriteTag(SerializationTag::kOneByteString);
    WriteOneByteString(c, value.length());
  } else {
    std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> converter;
    std::u16string u16 = converter.from_bytes(value);

    WriteTag(SerializationTag::kTwoByteString);
    WriteTwoByteString(u16.c_str(), u16.length());
  }
}

void Serializer::WriteDenseJSArray(const HippyValue::HippyValueArrayType& hippy_value_array) {
  uint32_t length = footstone::check::checked_numeric_cast<size_t, uint32_t>(hippy_value_array.size());

  WriteTag(SerializationTag::kBeginDenseJSArray);
  WriteVarint<uint32_t>(length);
  uint32_t i = 0;

  for (; i < length; i++) {
    WriteObject(hippy_value_array[i]);
  }

  uint32_t properties_written = 0;
  WriteTag(SerializationTag::kEndDenseJSArray);
  WriteVarint<uint32_t>(properties_written);
  WriteVarint<uint32_t>(length);
}

void Serializer::WriteJSObject(const HippyValue::HippyValueObjectType& hippy_value_object) {
  uint32_t length = footstone::check::checked_numeric_cast<size_t, uint32_t>(hippy_value_object.size());
  WriteTag(SerializationTag::kBeginJSObject);
  for (const auto& it: hippy_value_object) {
    WriteString(it.first);
    WriteObject(it.second);
  }
  WriteTag(SerializationTag::kEndJSObject);
  WriteVarint<uint32_t>(length);
}

void Serializer::WriteTag(SerializationTag tag) {
  auto raw_tag = static_cast<uint8_t>(tag);
  WriteRawBytes(&raw_tag, sizeof(raw_tag));
}

template<typename T>
void Serializer::WriteVarint(T value) {
  // Writes an unsigned integer as a base-128 varint.
  // The number is written, 7 bits at a time, from the least significant to the
  // most significant 7 bits. Each byte, except the last, has the MSB set.
  // See also https://developers.google.com/protocol-buffers/docs/encoding
  static_assert(std::is_integral<T>::value && std::is_unsigned<T>::value,
                "Only unsigned integer types can be written as varints.");
  uint8_t stack_buffer[sizeof(T) * 8 / 7 + 1];
  uint8_t* next_byte = &stack_buffer[0];
  do {
    *next_byte = (value & 0x7F) | 0x80;
    next_byte++;
    value >>= 7;
  } while (value);
  *(next_byte - 1) &= 0x7F;
  WriteRawBytes(stack_buffer, static_cast<size_t>(next_byte - stack_buffer));
}

template<typename T>
void Serializer::WriteZigZag(T value) {
  // Writes a signed integer as a varint using ZigZag encoding (i.e. 0 is
  // encoded as 0, -1 as 1, 1 as 2, -2 as 3, and so on).
  // See also https://developers.google.com/protocol-buffers/docs/encoding
  // Note that this implementation relies on the right shift being arithmetic.
  static_assert(std::is_integral<T>::value && std::is_signed<T>::value,
                "Only signed integer types can be written as zigzag.");
  using UnsignedT = typename std::make_unsigned<T>::type;
  WriteVarint((static_cast<UnsignedT>(value) << 1)
                  ^ (static_cast<unsigned int>(value >> (8 * sizeof(T) - 1))));
}

void Serializer::WriteOneByteString(const char* chars, size_t length) {
  WriteVarint<uint32_t>(footstone::check::checked_numeric_cast<size_t, uint32_t>(length));
  WriteRawBytes(chars, length * sizeof(char));
}

void Serializer::WriteTwoByteString(const char16_t* chars, size_t length) {
  WriteVarint<uint32_t>(footstone::check::checked_numeric_cast<size_t, uint32_t>(
      length * sizeof(char16_t)));
  WriteRawBytes(chars, length * sizeof(char16_t));
}

void Serializer::WriteRawBytes(const void* source, size_t length) {
  FOOTSTONE_DCHECK(length >= 0);
  uint8_t* dest;
  dest = ReserveRawBytes(length);
  memcpy(dest, source, length);
}

void Serializer::WriteObject(const HippyValue& hippy_value) {
  HippyValue::Type type = hippy_value.GetType();
  switch (type) {
    case HippyValue::Type::kUndefined:
    case HippyValue::Type::kNull:
    case HippyValue::Type::kBoolean: {
      Oddball ball = Oddball::kUndefined;
      if (type == HippyValue::Type::kNull) {
        ball = Oddball::kNull;
      } else if (type == HippyValue::Type::kBoolean && hippy_value.ToBooleanChecked()) {
        ball = Oddball::kTrue;
      } else if (type == HippyValue::Type::kBoolean && !hippy_value.ToBooleanChecked()) {
        ball = Oddball::kFalse;
      }
      WriteOddball(ball);
      break;
    }
    case HippyValue::Type::kNumber: {
      HippyValue::NumberType number_type = hippy_value.GetNumberType();
      switch (number_type) {
        case HippyValue::NumberType::kInt32: {
          WriteInt32(hippy_value.ToInt32Checked());
          break;
        }
        case HippyValue::NumberType::kUInt32: {
          WriteUint32(hippy_value.ToUint32Checked());
          break;
        }
        case HippyValue::NumberType::kDouble: {
          WriteDouble(hippy_value.ToDoubleChecked());
          break;
        }
        default: {
          FOOTSTONE_UNREACHABLE();
        }
      }
      break;
    }
    case HippyValue::Type::kString: {
      WriteString(hippy_value.ToStringChecked());
      break;
    }
    case HippyValue::Type::kObject: {
      WriteJSObject(hippy_value.ToObjectChecked());
      break;
    }
    case HippyValue::Type::kArray: {
      WriteDenseJSArray(hippy_value.ToArrayChecked());
      break;
    }
    default:FOOTSTONE_UNREACHABLE();
  }
}

uint8_t* Serializer::ReserveRawBytes(size_t bytes) {
  size_t old_size = buffer_size_;
  size_t new_size = old_size + bytes;
  if (new_size > buffer_capacity_) {
    ExpandBuffer(new_size);
  }
  buffer_size_ = new_size;
  return &buffer_[old_size];
}

void Serializer::ExpandBuffer(size_t required_capacity) {
  size_t requested_capacity = std::max(required_capacity, buffer_capacity_ * 2) + 64;
  void* new_buffer = nullptr;
  new_buffer = realloc(buffer_, requested_capacity);
  FOOTSTONE_DCHECK(new_buffer != nullptr);
  buffer_ = reinterpret_cast<uint8_t*>(new_buffer);
  buffer_capacity_ = requested_capacity;
}

}
}
