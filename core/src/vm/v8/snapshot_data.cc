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

#include "core/vm/v8/snapshot_data.h"

#include "core/vm/v8/snapshot_deserializer.h"
#include "core/vm/v8/snapshot_serializer.h"
#include "core/base/common.h"

void SnapshotData::WriteMetaData(v8::StartupData data) {
  startup_data = data;
  SnapshotSerializer serializer(buffer_holder);
  serializer.WriteUInt32(kMagicNumber);
  serializer.WriteString(kSdkVersion);
  auto size = hippy::base::checked_numeric_cast<int, uint32_t>(data.raw_size);
  serializer.WriteUInt32(size);
  serializer.WriteBuffer(data.data, size);
}

bool SnapshotData::ReadMetadata() {
  SnapshotDeserializer deserializer(buffer_holder);
  auto flag = deserializer.ReadUInt32(magic_number);
  if (!flag) {
    return false;
  }
  if (kMagicNumber != magic_number) {
    return false;
  }
  flag = deserializer.ReadString(sdk_version);
  if (!flag) {
    return false;
  }
  if (kSdkVersion != sdk_version) {
    return false;
  }
  uint32_t length;
  flag = deserializer.ReadUInt32(length);
  if (!flag) {
    return false;
  }
  startup_data.raw_size = hippy::base::checked_numeric_cast<uint32_t, int>(length);
  startup_data.data = reinterpret_cast<const char*>(&buffer_holder[0] + deserializer.GetPosition());
  return true;
}

bool SnapshotData::ReadMetaData(uint8_t* external_buffer_pointer, size_t length) {
  SnapshotDeserializer deserializer(external_buffer_pointer, length);
  auto flag = deserializer.ReadUInt32(magic_number);
  if (!flag) {
    return false;
  }
  if (kMagicNumber != magic_number) {
    return false;
  }
  flag = deserializer.ReadString(sdk_version);
  if (!flag) {
    return false;
  }
  if (kSdkVersion != sdk_version) {
    return false;
  }
  uint32_t startup_data_length;
  flag = deserializer.ReadUInt32(startup_data_length);
  if (!flag) {
    return false;
  }
  startup_data.raw_size = hippy::base::checked_numeric_cast<uint32_t, int>(startup_data_length);
  startup_data.data = reinterpret_cast<const char*>(external_buffer_pointer + deserializer.GetPosition());
  return true;
}
