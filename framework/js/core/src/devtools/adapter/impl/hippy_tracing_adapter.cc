//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/10/15.
//

#include "devtools/adapter/hippy_tracing_adapter.h"
#include <string>
#include "devtools/trace_control.h"

namespace hippy {
namespace devtools {
void HippyTracingAdapter::StartTracing() {
  TraceControl::GetInstance().StartTracing();
}

void HippyTracingAdapter::StopTracing(TracingDataCallback callback) {
  TraceControl::GetInstance().StopTracing();
  if (callback) {
    auto result = TraceControl::GetInstance().GetTracingContent();
    callback(result);
  }
}
}  // namespace devtools
}  // namespace hippy
