#include "dom/serializer.h"

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

std::pair<uint8_t*, size_t> Serializer::Release() { return std::make_pair(buffer_, buffer_size_); }

void Serializer::WriteUint32(uint32_t value) { WriteVarint<uint32_t>(value); }

void Serializer::WriteUint64(uint64_t value) { WriteVarint<uint64_t>(value); }

void Serializer::WriteDouble(double value) { WriteRawBytes(&value, sizeof(value)); }

void Serializer::WriteUtf8String(std::string& value) {}

void Serializer::WriteDenseJSArray(DomValue::DomValueArrayType& dom_value) {}

void Serializer::WriteJSMap(DomValue::DomValueObjectType& dom_value) {}

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

void Serializer::WriteRawBytes(const void* source, size_t length) {
  TDF_BASE_CHECK(length > 0);
  uint8_t* dest;
  dest = ReserveRawBytes(length);
  memcpy(dest, source, length);
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