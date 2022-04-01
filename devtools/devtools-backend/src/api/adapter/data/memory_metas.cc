//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/2.
//

#include "api/adapter/data/memory_metas.h"
#include <sstream>
#include "devtools_base/transform_string_util.hpp"

namespace tdf {
namespace devtools {

constexpr const char* kMemoryKeyHeapMetas = "heapMetas";
constexpr const char* kMemoryKeyType = "t";
constexpr const char* kMemoryKeyFile = "f";
constexpr const char* kMemoryKeyLine = "l";
constexpr const char* kMemoryKeySize = "s";
constexpr const char* kMemoryKeyAddress = "a";

void MemoryMetas::AddHeapMeta(const HeapMeta& meta) { metas_.emplace_back(meta); }

std::string MemoryMetas::Serialize() const {
  std::string result_string = "{\"";
  result_string += kMemoryKeyHeapMetas;
  result_string += "\":[";
  for (const HeapMeta& meta : metas_) {
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
  result_string += metas_.size() ? "]}" : "[]}";
  return result_string;
}
}  // namespace devtools
}  // namespace tdf
