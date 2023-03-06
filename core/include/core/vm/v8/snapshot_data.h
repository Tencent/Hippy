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

#include <any>
#include <cstdint>
#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wconversion"
#include "v8/v8.h"
#pragma clang diagnostic pop

// Snapshot file layout:
// magic number 0x66886688
// sdk version string "2.15.7"
// blob length uint32_t
// blob raw data

constexpr uint32_t kMagicNumber = 0x66886688;

#define STR(x) #x
#define VERSION_NAME_STR(x) STR(x)
#define VERSION_NAME_STRING VERSION_NAME_STR(VERSION_NAME)
constexpr char kSdkVersion[] = VERSION_NAME_STRING;
#undef VERSION_NAME_STR
#undef STR

struct SnapshotData {
 public:
  uint32_t magic_number;
  std::string sdk_version;
  v8::StartupData startup_data;

  std::vector<uint8_t> buffer_holder; // hold v8::StartupData data
  std::any external_buffer_holder;    // hold DirectBuffer to avoid copying

  void WriteMetaData(v8::StartupData data);
  bool ReadMetadata();                // use meta data in buffer_holder
  bool ReadMetaData(uint8_t* external_buffer_pointer, size_t length);
};

