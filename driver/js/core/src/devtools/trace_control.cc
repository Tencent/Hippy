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

#ifdef JS_V8

#include "devtools/trace_control.h"

#include <fstream>
#include <sstream>
#include <utility>

#include "base/logging.h"

namespace hippy::devtools {
constexpr char kCacheFileName[] = "/v8_trace.json";
constexpr char kTraceBeginTag[] = "{\"traceEvents\":[";
constexpr char kTraceEndTag[] = "]}";

bool TraceControl::OpenCacheFile() {
  if (cache_file_dir_.empty() || std::string::npos != cache_file_dir_.find("..")) {
    TDF_BASE_LOG(ERROR) << "TraceControl cache_file_dir_ is invalid";
    return false;
  }
  if (!cache_file_path_.empty()) {  // delete old file
    trace_file_.flush();
    trace_file_.close();
    remove(cache_file_path_.c_str());
  }
  cache_file_path_ = cache_file_dir_ + kCacheFileName;
  trace_file_.open(cache_file_path_);
  return trace_file_.is_open();
}

void TraceControl::SetGlobalTracingController(v8::platform::tracing::TracingController *tracing_control) {
  v8_trace_control_ = tracing_control;
  auto trace_buffer = v8::platform::tracing::TraceBuffer::CreateTraceBufferRingBuffer(
      v8::platform::tracing::TraceBuffer::kRingBufferChunks,
      v8::platform::tracing::TraceWriter::CreateJSONTraceWriter(trace_file_));
  // trace_buffer holder by TracingController, don't destroy, if destroy app will crash
  v8_trace_control_->Initialize(trace_buffer);
}

void TraceControl::StartTracing() {
  if (v8_trace_control_) {
    if (tracing_has_start_) {
      StopTracing();
    }
    if (!OpenCacheFile()) {
      return;
    }
    v8_trace_control_->StartTracing(v8::platform::tracing::TraceConfig::CreateDefaultTraceConfig());
    tracing_has_start_ = true;
  }
}

std::string TraceControl::GetTracingContent() {
  std::ifstream ifs(cache_file_path_);
  if (ifs.good()) {
    std::ostringstream buffer;
    buffer << ifs.rdbuf();
    std::string tracing_content = buffer.str();
    ifs.close();
    TDF_BASE_LOG(INFO) << "TraceControl content:" << tracing_content;
    if (!tracing_content.empty() && tracing_content[0] == ',') {
      tracing_content = tracing_content.substr(1);
    }
    return kTraceBeginTag + tracing_content + kTraceEndTag;
  }
  return "";
}

void TraceControl::StopTracing() {
  if (v8_trace_control_) {
    v8_trace_control_->StopTracing();
    trace_file_.flush();
    tracing_has_start_ = false;
  }
}
}  // namespace hippy::devtools

#endif
