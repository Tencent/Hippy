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

#include "api/adapter/data/memory_metas.h"
#include "devtools_base/transform_string_util.h"

namespace hippy::devtools {

constexpr char kMemoryKeyHeapMetas[] = "heapMetas";
constexpr char kMemoryKeyType[] = "t";
constexpr char kMemoryKeyFile[] = "f";
constexpr char kMemoryKeyLine[] = "l";
constexpr char kMemoryKeySize[] = "s";
constexpr char kMemoryKeyAddress[] = "a";

std::string MemoryMetas::Serialize() const {
  std::string result_string = "{\"";
  result_string += kMemoryKeyHeapMetas;
  result_string += "\":[";
  for (auto& meta : metas_) {
    std::string element_string = "{\"";
    element_string += kMemoryKeyType;
    element_string += "\":\"";
    element_string += meta.type;
    element_string += "\",\"";
    element_string += kMemoryKeyFile;
    element_string += "\":\"";
    element_string += meta.file;
    element_string += "\",\"";
    element_string += kMemoryKeyLine;
    element_string += "\":";
    element_string += TransformStringUtil::NumbertoString(meta.line);
    element_string += ",\"";
    element_string += kMemoryKeySize;
    element_string += "\":";
    element_string += TransformStringUtil::NumbertoString(meta.size);
    element_string += ",\"";
    element_string += kMemoryKeyAddress;
    element_string += "\":\"";
    element_string += meta.address;
    element_string += "\"},";
    result_string += element_string;
  }
  result_string.pop_back();
  result_string += !metas_.empty() ? "]}" : "[]}";
  return result_string;
}
}  // namespace hippy::devtools
