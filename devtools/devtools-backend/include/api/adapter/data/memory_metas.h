/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

#pragma once

#include <string>
#include <vector>
#include "api/adapter/data/serializable.h"

namespace hippy::devtools {
struct HeapMeta {
  std::string type;
  std::string file;
  int32_t line;
  int64_t size;
  std::string address;
  HeapMeta(std::string type, std::string file, int32_t line, int64_t size, std::string address)
      : type(type), file(file), line(line), size(size), address(address) {}
};

class MemoryMetas : public Serializable {
 public:
  void AddHeapMeta(const HeapMeta& meta);
  std::string Serialize() const override;

 private:
  std::vector<HeapMeta> metas_;
};
}  // namespace hippy::devtools
