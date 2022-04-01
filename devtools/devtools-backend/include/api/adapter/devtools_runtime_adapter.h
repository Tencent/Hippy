//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>

namespace tdf {
namespace devtools {
class RuntimeAdapter {
 public:
  virtual bool IsDebug() = 0;
  virtual ~RuntimeAdapter(){}
};
}  // namespace devtools
}  // namespace tdf
