#pragma once

#include <vector>

#include "dom/serializer.h"

namespace tdf {
namespace base {

class Deserializer {
  using DomValueObjectType = DomValue::DomValueObjectType;
 public:
  Deserializer(const std::vector<const uint8_t>& data);
  Deserializer(const uint8_t* data, size_t size);
  ~Deserializer();

  Deserializer(const Deserializer&) = delete;
  Deserializer& operator=(const Deserializer&) = delete;

  void ReadHeader();

  bool ReadValue(DomValue& value);

 private:
  bool ReadObject(DomValue& value);

  bool PeekTag(SerializationTag& tag);

  bool ReadTag(SerializationTag& tag);

  void ConsumeTag(SerializationTag peek_tag);

  bool ReadInt32(int32_t& value);

  bool ReadInt32(DomValue& dom_value);

  bool ReadUInt32(uint32_t& value);

  bool ReadUInt32(DomValue& dom_value);

  bool ReadDouble(double& value);

  bool ReadDouble(DomValue& dom_value);

  bool ReadUtf8String(std::string& value);

  bool ReadUtf8String(DomValue& dom_value);

  bool ReadOneByteString(std::string& value);

  bool ReadOneByteString(DomValue& dom_value);

  bool ReadTwoByteString(std::string& value);

  bool ReadTwoByteString(DomValue& dom_value);

  bool ReadDenseJSArray(DomValue& dom_value);

  bool ReadJSObject(DomValue& dom_value);

 private:
  template <typename T>
  T ReadVarint();

  template <typename T>
  T ReadZigZag();

  uint32_t ReadObjectProperties(DomValueObjectType& value, SerializationTag end_tag);

  uint32_t ReadObjectProperties(SerializationTag end_tag);

 private:
  const uint8_t* position_;
  const uint8_t* const end_;
  uint32_t version_ = 0;
};
}  // namespace base
}  // namespace tdf
