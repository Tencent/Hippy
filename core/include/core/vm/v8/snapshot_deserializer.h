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

#pragma once

#include <cstdint>
#include <string>
#include <vector>

class SnapshotDeserializer {
 public:
  SnapshotDeserializer(const std::vector<uint8_t>& buffer);
  SnapshotDeserializer(const uint8_t* buffer, size_t length);

  inline size_t GetPosition() { return position_; }
  inline std::string GetLastErrorMessage() { return error_message_; }

  bool ReadUInt32(uint32_t& value);
  bool ReadString(std::string& value);
  bool ReadBuffer(void* p, size_t length);

 private:
  static std::string GetErrorMessage(const std::string& type, size_t excepted, size_t received);

  const uint8_t* buffer_;
  size_t length_;
  size_t position_ = 0;
  std::string error_message_;
};

