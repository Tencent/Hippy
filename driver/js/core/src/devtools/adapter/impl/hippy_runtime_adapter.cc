//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#include "devtools/adapter/hippy_runtime_adapter.h"

namespace hippy {
namespace devtools {
bool HippyRuntimeAdapter::IsDebug() {
  return debug_mode_;
}
}  // namespace devtools
}  // namespace hippy
