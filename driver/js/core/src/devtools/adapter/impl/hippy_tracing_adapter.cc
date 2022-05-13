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

#include "devtools/adapter/hippy_tracing_adapter.h"
#include <string>
#ifdef JS_ENGINE_V8
#include "devtools/trace_control.h"
#endif

namespace hippy {
namespace devtools {
void HippyTracingAdapter::StartTracing() {
#ifdef JS_ENGINE_V8
  TraceControl::GetInstance().StartTracing();
#endif
}

void HippyTracingAdapter::StopTracing(TracingDataCallback callback) {
#ifdef JS_ENGINE_V8
  TraceControl::GetInstance().StopTracing();
  if (callback) {
    callback(TraceControl::GetInstance().GetTracingContent());
  }
#elif
  if (callback) {
    callback("");
  }
#endif
}
}  // namespace devtools
}  // namespace hippy
