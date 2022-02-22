//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>

#include "devtools_backend/provider/devtools_runtime_adapter.h"

namespace hippy {
namespace devtools {
class HippyRuntimeAdapter : public tdf::devtools::RuntimeAdapter {
 public:
  explicit HippyRuntimeAdapter(int32_t runtime_id) : runtime_id_(runtime_id) {}
  void SetDebugMode(bool debug_mode) { debug_mode_ = debug_mode; }
  bool IsDebug() override;

 private:
  int32_t runtime_id_;
  bool debug_mode_;
};
}  // namespace devtools
}  // namespace hippy
