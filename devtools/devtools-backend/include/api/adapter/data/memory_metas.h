//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/2.
//

#pragma once

#include <string>
#include <vector>
#include "api/adapter/data/serializable.h"

namespace tdf {
namespace devtools {
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
}  // namespace devtools
}  // namespace tdf
