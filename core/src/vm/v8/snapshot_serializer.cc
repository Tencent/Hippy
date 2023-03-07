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

#include "core/vm/v8/snapshot_serializer.h"

#include <algorithm>

#include "core/base/common.h"

void SnapshotSerializer::WriteUInt32(uint32_t value) {
  WriteBuffer(&value, sizeof(value));
}

void SnapshotSerializer::WriteString(const std::string& value) {
  auto length = value.length();
  WriteUInt32(hippy::base::checked_numeric_cast<size_t, uint32_t>(length));
  WriteBuffer(value.c_str(), length);
}

void SnapshotSerializer::WriteBuffer(const void* p, size_t length) {
  if (buffer_.capacity() <= buffer_.size() + length) {
    buffer_.resize(buffer_.size() + length);
  }

  std::copy_n(reinterpret_cast<const uint8_t*>(p), length, &buffer_[0] + position_);
  position_ += length;
}
