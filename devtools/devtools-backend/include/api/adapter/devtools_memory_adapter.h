//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>
#include "api/adapter/data/memory_metas.h"

namespace tdf {
namespace devtools {
class MemoryAdapter {
 public:
  using CoreMemoryUsageCallback = std::function<void(const MemoryMetas& metas)>;

  /**
   * 获取内存使用情况
   * @param callback 回调接口
   */
  virtual void CollectMemoryUsage(CoreMemoryUsageCallback callback) = 0;
};
}  // namespace devtools
}  // namespace tdf
