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

#pragma once

#include <string>
#ifdef JS_V8
#include "v8/libplatform/v8-tracing.h"
#endif

namespace hippy {
namespace devtools {
class TraceControl {
 public:
  static TraceControl &GetInstance() {
    static TraceControl trace_control;
    return trace_control;
  }
  void StartTracing();
  void StopTracing();
#ifdef JS_V8
  void SetGlobalTracingController(v8::platform::tracing::TracingController *tracing_control);
#endif
  std::string GetTracingContent();
  inline void SetFileCacheDir(std::string file_cache_dir) { cache_file_dir_ = std::move(file_cache_dir); }

 private:
  TraceControl() = default;
  TraceControl(const TraceControl &) = delete;
  void operator=(const TraceControl &) = delete;
#ifdef JS_V8
  v8::platform::tracing::TracingController *v8_trace_control_ = nullptr;
#endif
  std::ofstream trace_file_;
  bool OpenCacheFile();
  std::string cache_file_dir_;
  std::string cache_file_path_;
  bool tracing_has_start_ = false;
};
}  // namespace devtools
}  // namespace hippy
