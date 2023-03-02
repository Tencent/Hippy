/*
 *
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "core/vm/v8/snapshot_deserializer.h"

#include "core/base/common.h"

SnapshotDeserializer::SnapshotDeserializer(const std::vector<uint8_t>& buffer)
    : buffer_(buffer.data()), length_(buffer.size()), position_(0) {}

SnapshotDeserializer::SnapshotDeserializer(const uint8_t* buffer, size_t length)
    : buffer_(buffer), length_(length), position_(0) {}

bool SnapshotDeserializer::ReadUInt32(uint32_t& value) {
  if (position_ + sizeof(value) > length_) {
    return false;
  }
  memcpy(&value, buffer_ + position_, sizeof(value));
  position_ += sizeof(value);
  return true;
}

bool SnapshotDeserializer::ReadString(std::string& value) {
  uint32_t len;
  auto flag = ReadUInt32(len);
  if (!flag) {
    return false;
  }
  value.resize(len);
  flag = ReadBuffer(reinterpret_cast<void*>(&value[0]), len);
  if (!flag) {
    return false;
  }
  return true;
}

bool SnapshotDeserializer::ReadBuffer(void* p, size_t length) {
  if (position_ + length > length_) {
    return false;
  }
  memcpy(p, buffer_ + position_, length);
  position_ += length;
  return true;
}
