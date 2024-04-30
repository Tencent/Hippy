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

class SnapshotSerializer {
 public:
  SnapshotSerializer(std::vector<uint8_t>& buffer): buffer_(buffer) {}
  void WriteUInt32(uint32_t value);
  void WriteString(const std::string& value);
  void WriteBuffer(const void* p, size_t length);

 private:
  std::vector<uint8_t>& buffer_;
  size_t position_ = 0;
};

