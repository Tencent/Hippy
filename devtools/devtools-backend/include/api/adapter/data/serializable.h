//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/2.
//

#pragma once

#include <string>

namespace tdf {
namespace devtools {
/**
 * 可序列化基类
 */
class Serializable {
 public:
  /**
   * 序列化接口
   * @return 以一定规则组织结构的string格式数据
   */
  virtual std::string Serialize() const = 0;
  virtual ~Serializable() {}
};
}  // namespace devtools
}  // namespace tdf
