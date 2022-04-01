//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#pragma once

#include <string>
#include "api/adapter/devtools_tracing_adapter.h"

namespace hippy {
namespace devtools {
class HippyTracingAdapter : public tdf::devtools::TracingAdapter {
  void StartTracing() override;
  void StopTracing(TracingDataCallback callback) override;
};
}  // namespace devtools
}  // namespace hippy
