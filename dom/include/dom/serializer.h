#pragma once

#include <string>

#include "dom/dom_value.h"

namespace tdf {
namespace base {
// V8 latest version
static const uint32_t kLatestVersion = 13;

enum class Oddball : uint8_t {
  kTheHole,
  kUndefined,
  kNull,
  kTrue,
  kFalse,
};

enum class SerializationTag : uint8_t {
  // version:uint32_t (if at beginning of data, sets version > 0)
  kVersion = 0xFF,
  // ignore
  kPadding = '\0',
  // Oddballs (no data).
  kTheHole = '-',
  kUndefined = '_',
  kNull = '0',
  kTrue = 'T',
  kFalse = 'F',
  // Number represented as 32-bit integer, ZigZag-encoded
  // (like sint32 in protobuf)
  kInt32 = 'I',
  // Number represented as 32-bit unsigned integer, varint-encoded
  // (like uint32 in protobuf)
  kUint32 = 'U',
  // Number represented as a 64-bit double.
  // Host byte order is used (N.B. this makes the format non-portable).
  kDouble = 'N',
  // byteLength:uint32_t, then raw data
  kUtf8String = 'S',
  kOneByteString = '"',
  kTwoByteString = 'c',
  // Beginning of a dense JS array. length:uint32_t
  // |length| elements, followed by properties as key/value pairs
  kBeginDenseJSArray = 'A',
  // End of a dense JS array. numProperties:uint32_t length:uint32_t
  kEndDenseJSArray = '$',
  // Beginning of a JS map.
  kBeginJSMap = ';',
  // End of a JS map. length:uint32_t.
  kEndJSMap = ':',
};

class Serializer {
 public:
  Serializer();
  ~Serializer();
  Serializer(const Serializer&) = delete;
  Serializer& operator=(const Serializer&) = delete;

  void WriteHeader();

  std::pair<uint8_t*, size_t> Release();

  void WriteOddball(Oddball oddball);

  void WriteUint32(uint32_t value);

  void WriteUint64(uint64_t value);

  void WriteInt32(int32_t value);

  void WriteDouble(double value);

  void WriteString(std::string& value);

  void WriteDenseJSArray(DomValue::DomValueArrayType& dom_value);

  void WriteJSMap(DomValue::DomValueObjectType& dom_value);

 private:
  void WriteTag(SerializationTag tag);

  template <typename T>
  void WriteVarint(T value);

  template <typename T>
  void WriteZigZag(T value);

  void WriteOneByteString(const char* str, size_t length);

  void WriteTwoByteString(const char16_t* str, size_t length);

  void WriteRawBytes(const void* source, size_t length);

  uint8_t* ReserveRawBytes(size_t bytes);

  void ExpandBuffer(size_t required_capacity);

  uint8_t* buffer_ = nullptr;
  size_t buffer_size_ = 0;
  size_t buffer_capacity_ = 0;
};

}  // namespace base
}  // namespace tdf