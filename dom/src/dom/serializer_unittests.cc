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

#define private public
#define protected public

#include "gtest/gtest.h"

#include <codecvt>
#include <cstdlib>
#include <random>

#include "footstone/serializer.h"

namespace hippy {
namespace dom {
namespace testing {

template <typename T>
size_t Variant(T value, uint8_t* buffer, size_t len) {
  size_t variant_length = 0;
  buffer = (uint8_t*)memset(buffer, 0, len);
  do {
    *buffer = (value & 0x7F) | 0x80;
    buffer++;
    value >>= 7;
    variant_length++;
  } while (value);
  *(buffer - 1) &= 0x7F;
  return variant_length;
}

void CheckUint32(footstone::value::Serializer& serializer, uint32_t value, size_t last_size) {
  size_t len = sizeof(uint32_t) * 8 / 7 + 1;
  uint8_t* expect = (uint8_t*)malloc(len);
  memset(expect, 0, len);
  size_t variant_len = Variant<uint32_t>(value, expect, sizeof(uint32_t));
  size_t uint32_tag_length = 1;
  serializer.WriteUint32(value);
  EXPECT_EQ(serializer.buffer_[last_size], static_cast<uint8_t>(tdf::base::SerializationTag::kUint32))
      << "Serializer WriteUint32() error.";
  EXPECT_EQ(serializer.buffer_size_ - last_size, variant_len + uint32_tag_length) << "Serializer buffer size error.";
  EXPECT_EQ(memcmp(serializer.buffer_ + last_size + uint32_tag_length, expect, variant_len), 0)
      << "Serializer buffer compare error.";
  free(expect);
}

void CheckInt32(footstone::value::Serializer& serializer, int32_t value, size_t last_size) {
  size_t len = sizeof(int32_t) * 8 / 7 + 1;
  uint8_t* expect = (uint8_t*)malloc(len);
  memset(expect, 0, len);

  using UnsignedT = typename std::make_unsigned<int32_t>::type;
  uint32_t zigzag = (static_cast<UnsignedT>(value) << 1) ^ (value >> (8 * sizeof(int32_t) - 1));

  size_t variant_len = Variant<uint32_t>(zigzag, expect, sizeof(uint32_t));
  size_t int32_tag_length = 1;
  serializer.WriteInt32(value);
  EXPECT_EQ(serializer.buffer_[last_size], static_cast<uint8_t>(tdf::base::SerializationTag::kInt32))
      << "Serializer WriteInt32() error.";
  EXPECT_EQ(serializer.buffer_size_ - last_size, variant_len + int32_tag_length) << "Serializer buffer size error.";
  EXPECT_EQ(memcmp(serializer.buffer_ + last_size + int32_tag_length, expect, variant_len), 0)
      << "Serializer buffer compare error.";
  free(expect);
}

void CheckDouble(footstone::value::Serializer& serializer, double value, size_t last_size) {
  uint8_t* expect = (uint8_t*)malloc(sizeof(double));
  memset(expect, 0, sizeof(double));
  memcpy(expect, &value, sizeof(double));

  size_t double_tag_length = 1;
  serializer.WriteDouble(value);
  EXPECT_EQ(serializer.buffer_[last_size], static_cast<uint8_t>(tdf::base::SerializationTag::kDouble))
      << "Serializer WriteDouble() error.";
  EXPECT_EQ(serializer.buffer_size_ - last_size, sizeof(double) + double_tag_length) << "Serializer buffer size error.";
  EXPECT_EQ(memcmp(serializer.buffer_ + last_size + double_tag_length, expect, sizeof(double)), 0)
      << "Serializer buffer compare error.";
  free(expect);
}

bool IsOneByteString(std::string& value) {
  bool one_byte_string = true;
  const char* c = value.c_str();
  for (size_t i = 0; i < value.length(); i++) {
    if (static_cast<unsigned char>(*(c + i)) >= 0x80) {
      one_byte_string = false;
      break;
    }
  }
  return one_byte_string;
}

void CheckString(footstone::value::Serializer& serializer, std::string value, size_t last_size) {
  size_t string_tag_length = 1;
  tdf::base::SerializationTag tag = tdf::base::SerializationTag::kOneByteString;

  std::u16string u16;
  if (!IsOneByteString(value)) {
    tag = tdf::base::SerializationTag::kTwoByteString;
    std::wstring_convert<std::codecvt_utf8_utf16<char16_t>, char16_t> converter;
    u16 = converter.from_bytes(value);
  }

  size_t len = sizeof(uint32_t) * 8 / 7 + 1;
  uint8_t* expect = (uint8_t*)malloc(len);
  memset(expect, 0, len);
  uint32_t string_length = value.length();
  if(!IsOneByteString(value)) {
    string_length = u16.length() * sizeof(char16_t);
  }
  size_t variant_len = Variant<uint32_t>(string_length, expect, sizeof(uint32_t));

  serializer.WriteString(value);
  EXPECT_EQ(serializer.buffer_[last_size], static_cast<uint8_t>(tag)) << "Serializer WriteString() error.";
  EXPECT_EQ(memcmp(serializer.buffer_ + last_size + string_tag_length, expect, variant_len), 0)
      << "Serializer WriteString() error.";

  if (IsOneByteString(value)) {
    EXPECT_EQ(memcmp(serializer.buffer_ + last_size + string_tag_length + variant_len, value.c_str(), variant_len), 0)
        << "Serializer WriteString() error.";
  } else {
    EXPECT_EQ(memcmp(serializer.buffer_ + last_size + string_tag_length + variant_len, u16.c_str(), variant_len), 0)
        << "Serializer WriteString() error.";
  }
}

TEST(SerializerTest, Release) {
  footstone::value::Serializer serializer;
  footstone::value::SerializerHelper(serializer.Release());
  EXPECT_EQ(serializer.buffer_ == nullptr, true) << "Serializer buffer is not equal to nullptr.";
  EXPECT_EQ(serializer.buffer_size_, 0) << "Serializer buffer_size is not equal to 0.";
  EXPECT_EQ(serializer.buffer_capacity_, 0) << "Serializer buffer_capacity is not equal to 0.";
}

TEST(SerializerTest, WriteHeader) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();
  EXPECT_EQ(serializer.buffer_ != nullptr, true) << "Serializer buffer should not equal to nullptr.";
  EXPECT_EQ(serializer.buffer_size_, 2) << "Serializer buffer_size is not equal to 2.";
  EXPECT_EQ(serializer.buffer_capacity_ >= serializer.buffer_size_, true)
      << "Serializer buffer_capacity is small than buffer_size.";
}

TEST(SerializerTest, WriteOddball) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();

  serializer.WriteOddball(tdf::base::Oddball::kUndefined);
  EXPECT_EQ(serializer.buffer_size_, 3) << "Serializer buffer_size is not equal to 3.";
  EXPECT_EQ(serializer.buffer_[2], static_cast<uint8_t>(tdf::base::SerializationTag::kUndefined))
      << "Serializer WriteTag Oddball::kUndefined error.";

  serializer.WriteOddball(tdf::base::Oddball::kNull);
  EXPECT_EQ(serializer.buffer_size_, 4) << "Serializer buffer_size is not equal to 4.";
  EXPECT_EQ(serializer.buffer_[3], static_cast<uint8_t>(tdf::base::SerializationTag::kNull))
      << "Serializer WriteTag Oddball::kNull error.";

  serializer.WriteOddball(tdf::base::Oddball::kTrue);
  EXPECT_EQ(serializer.buffer_size_, 5) << "Serializer buffer_size is not equal to 5.";
  EXPECT_EQ(serializer.buffer_[4], static_cast<uint8_t>(tdf::base::SerializationTag::kTrue))
      << "Serializer WriteTag Oddball::kTrue error.";

  serializer.WriteOddball(tdf::base::Oddball::kFalse);
  EXPECT_EQ(serializer.buffer_size_, 6) << "Serializer buffer_size is not equal to 6.";
  EXPECT_EQ(serializer.buffer_[5], static_cast<uint8_t>(tdf::base::SerializationTag::kFalse))
      << "Serializer WriteTag Oddball::kFalse error.";
}

TEST(SerializerTest, WriteUint32) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();

  CheckUint32(serializer, 0, serializer.buffer_size_);
  CheckUint32(serializer, 1, serializer.buffer_size_);
  CheckUint32(serializer, -1, serializer.buffer_size_);
  CheckUint32(serializer, std::numeric_limits<uint32_t>::min(), serializer.buffer_size_);
  CheckUint32(serializer, std::numeric_limits<uint32_t>::max(), serializer.buffer_size_);

  // random
  std::random_device random_device;
  std::mt19937 mt19937(random_device());
  std::uniform_int_distribution<uint32_t> distribution(std::numeric_limits<uint32_t>::min(),
                                                       std::numeric_limits<uint32_t>::max());
  for (int i = 0; i < 300; i++) {
    CheckUint32(serializer, distribution(mt19937), serializer.buffer_size_);
  }
}

TEST(SerializerTest, WriteInt32) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();

  CheckInt32(serializer, 0, serializer.buffer_size_);
  CheckInt32(serializer, 1, serializer.buffer_size_);
  CheckInt32(serializer, -1, serializer.buffer_size_);
  CheckInt32(serializer, std::numeric_limits<int32_t>::min(), serializer.buffer_size_);
  CheckInt32(serializer, std::numeric_limits<int32_t>::max(), serializer.buffer_size_);

  // random
  std::random_device random_device;
  std::mt19937 mt19937(random_device());
  std::uniform_int_distribution<int32_t> distribution(std::numeric_limits<int32_t>::min(),
                                                      std::numeric_limits<int32_t>::max());
  for (int i = 0; i < 300; i++) {
    CheckInt32(serializer, distribution(mt19937), serializer.buffer_size_);
  }
}

TEST(SerializerTest, WriteDouble) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();

  CheckDouble(serializer, 0, serializer.buffer_size_);
  CheckDouble(serializer, 1.0, serializer.buffer_size_);
  CheckDouble(serializer, 0.99999, serializer.buffer_size_);
  CheckDouble(serializer, -1.0, serializer.buffer_size_);
  CheckDouble(serializer, -0.99999, serializer.buffer_size_);
  CheckDouble(serializer, 10000000, serializer.buffer_size_);
  CheckDouble(serializer, -10000000, serializer.buffer_size_);
  CheckDouble(serializer, 3.14151, serializer.buffer_size_);
  CheckDouble(serializer, -3.14151, serializer.buffer_size_);
  CheckDouble(serializer, std::numeric_limits<double>::min(), serializer.buffer_size_);
  CheckDouble(serializer, std::numeric_limits<double>::max(), serializer.buffer_size_);

  // random
  std::random_device random_device;
  std::mt19937 mt19937(random_device());
  std::uniform_int_distribution<double> distribution(std::numeric_limits<double>::min(),
                                                     std::numeric_limits<double>::max());
  for (int i = 0; i < 300; i++) {
    CheckDouble(serializer, distribution(mt19937), serializer.buffer_size_);
  }
}

TEST(SerializerTest, WriteString) {
  footstone::value::Serializer serializer;
  serializer.WriteHeader();

  CheckString(serializer, "", serializer.buffer_size_);
  CheckString(serializer, "a", serializer.buffer_size_);
  CheckString(serializer, "abcdefghijklmnopqrstuvwxyz", serializer.buffer_size_);
  CheckString(serializer, "~!@#$%^&*()", serializer.buffer_size_);
  CheckString(serializer, "01234567890", serializer.buffer_size_);
  CheckString(serializer, "腾讯", serializer.buffer_size_);
  CheckString(serializer, "动态化框架", serializer.buffer_size_);
}

}  // namespace testing
}  // namespace dom
}  // namespace hippy
