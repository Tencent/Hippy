#include "dom/serializer.h"

#include <codecvt>
#include <type_traits>

#include "base/logging.h"

namespace tdf {
namespace base {
Serializer::Serializer() {}

Serializer::~Serializer() {
  if (buffer_) {
    free(buffer_);
  }
}

void Serializer::WriteHeader() {
  WriteTag(SerializationTag::kVersion);
  WriteVarint(kLatestVersion);
};

std::pair<uint8_t*, size_t> Serializer::Release() {
  auto result = std::make_pair(buffer_, buffer_size_);
  buffer_ = nullptr;
  buffer_size_ = 0;
  buffer_capacity_ = 0;
  return result;
}

void Serializer::WriteOddball(Oddball oddball) {
  SerializationTag tag = SerializationTag::kUndefined;
  switch (oddball) {
    case Oddball::kUndefined:
      tag = SerializationTag::kUndefined;
      break;
    case Oddball::kFalse:
      tag = SerializationTag::kFalse;
      break;
    case Oddball::kTrue:
      tag = SerializationTag::kTrue;
      break;
    case Oddball::kNull:
      tag = SerializationTag::kNull;
      break;
    default:
      TDF_BASE_NOTREACHED();
  }
  WriteTag(tag);
};

void Serializer::WriteUint32(uint32_t value) { WriteVarint<uint32_t>(value); }

//void Serializer::WriteUint64(uint64_t value) { WriteVarint<uint64_t>(value); }

void Serializer::WriteInt32(int32_t value) {
  WriteTag(SerializationTag::kInt32);
  WriteZigZag<int32_t>(value);
}

void Serializer::WriteDouble(double value) { WriteRawBytes(&value, sizeof(value)); }

void Serializer::WriteString(const std::string& value) {
  bool oneByteString = true;
  const char* c = value.c_str();
  for (size_t i = 0; i < value.length(); i++) {
    if (*(c + i) >= 0x80) {
      oneByteString = false;
      break;
    }
  }

  if (oneByteString) {
    WriteTag(SerializationTag::kOneByteString);
    WriteOneByteString(c, value.length());
  } else {
    std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> converter;
    std::u16string u16 = converter.from_bytes(value);

    WriteTag(SerializationTag::kTwoByteString);
    WriteTwoByteString(u16.c_str(), value.length());
  }
}

void Serializer::WriteDenseJSArray(const DomValue::DomValueArrayType& dom_value) {
  uint32_t length = 0;
  length = dom_value.size();

  WriteTag(SerializationTag::kBeginDenseJSArray);
  WriteVarint<uint32_t>(length);
  uint32_t i = 0;

  for (; i < length; i++) {
    WriteObject(dom_value[i]);
  }

  uint32_t properties_written = 0;
  WriteTag(SerializationTag::kEndDenseJSArray);
  WriteVarint<uint32_t>(properties_written);
  WriteVarint<uint32_t>(length);
}

void Serializer::WriteJSMap(const DomValue::DomValueObjectType& dom_value) {
  uint32_t length = dom_value.size();
  WriteTag(SerializationTag::kBeginJSMap);
  for (const auto& it : dom_value) {
    WriteString(it.first);
    WriteObject(it.second);
  }
  WriteTag(SerializationTag::kEndJSMap);
  WriteVarint<uint32_t>(length * 2);
}

void Serializer::WriteTag(SerializationTag tag) {
  uint8_t raw_tag = static_cast<uint8_t>(tag);
  WriteRawBytes(&raw_tag, sizeof(raw_tag));
}

template <typename T>
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
  WriteRawBytes(stack_buffer, next_byte - stack_buffer);
}

template <typename T>
void Serializer::WriteZigZag(T value) {
  // Writes a signed integer as a varint using ZigZag encoding (i.e. 0 is
  // encoded as 0, -1 as 1, 1 as 2, -2 as 3, and so on).
  // See also https://developers.google.com/protocol-buffers/docs/encoding
  // Note that this implementation relies on the right shift being arithmetic.
  static_assert(std::is_integral<T>::value && std::is_signed<T>::value,
                "Only signed integer types can be written as zigzag.");
  using UnsignedT = typename std::make_unsigned<T>::type;
  WriteVarint((static_cast<UnsignedT>(value) << 1) ^ (value >> (8 * sizeof(T) - 1)));
}

void Serializer::WriteOneByteString(const char* chars, size_t length) {
  WriteVarint<uint32_t>(length);
  WriteRawBytes(chars, length * sizeof(char));
}

void Serializer::WriteTwoByteString(const char16_t* chars, size_t length) {
  WriteVarint<uint32_t>(length * sizeof(char16_t));
  WriteRawBytes(chars, length * sizeof(char16_t));
}

void Serializer::WriteRawBytes(const void* source, size_t length) {
  TDF_BASE_CHECK(length > 0);
  uint8_t* dest;
  dest = ReserveRawBytes(length);
  memcpy(dest, source, length);
}

void Serializer::WriteObject(const DomValue& dom_value) {
  DomValue::Type type = dom_value.GetType();
  switch (type) {
    case DomValue::Type::kUndefined:
    case DomValue::Type::kNull:
    case DomValue::Type::kBoolean: {
      Oddball ball = Oddball::kUndefined;
      if (type == DomValue::Type::kNull) {
        ball = Oddball::kNull;
      } else if (type == DomValue::Type::kBoolean && dom_value.ToBoolean()) {
        ball = Oddball::kTrue;
      } else if (type == DomValue::Type::kBoolean && !dom_value.ToBoolean()) {
        ball = Oddball::kFalse;
      }
      WriteOddball(ball);
      break;
    }
    case DomValue::Type::kNumber: {
      DomValue::NumberType number_type = dom_value.GetNumberType();
      switch (number_type) {
        case DomValue::NumberType::kInt32: {
          WriteInt32(dom_value.ToInt32());
          break;
        }
        case DomValue::NumberType::kUInt32: {
          WriteUint32(dom_value.ToUint32());
          break;
        }
        case DomValue::NumberType::kDouble: {
          WriteDouble(dom_value.ToDouble());
          break;
        }
        default: {
          TDF_BASE_CHECK(false);
        }
      }
      break;
    }
    case DomValue::Type::kString: {
      WriteString(dom_value.ToString());
      break;
    }
    case DomValue::Type::kObject: {
      WriteJSMap(dom_value.ToObject());
      break;
    }
    case DomValue::Type::kArray: {
      WriteDenseJSArray(dom_value.ToArray());
      break;
    }
    default:
      TDF_BASE_CHECK(true);
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
  TDF_BASE_CHECK(new_buffer != NULL);
  buffer_ = reinterpret_cast<uint8_t*>(new_buffer);
  buffer_capacity_ = requested_capacity;
}

}  // namespace base
}  // namespace tdf