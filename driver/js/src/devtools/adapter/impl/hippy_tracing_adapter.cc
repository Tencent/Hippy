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
#ifdef ENABLE_INSPECTOR
#include "devtools/adapter/hippy_tracing_adapter.h"
#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
#include "devtools/trace_control.h"
#endif

namespace hippy::devtools {
void HippyTracingAdapter::StartTracing() {
#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  TraceControl::GetInstance().StartTracing();
#endif
}

void HippyTracingAdapter::StopTracing(const std::string& params_key, TracingDataCallback callback) {
#if defined(JS_V8) && !defined(V8_WITHOUT_INSPECTOR)
  TraceControl::GetInstance().StopTracing();
  if (callback) {
    callback(TraceControl::GetInstance().GetTracingContent(params_key));
  }
#else
  if (callback) {
    callback("{}");
  }
#endif
}
}  // namespace hippy::devtools
#endif
