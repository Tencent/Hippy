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

#include "api/devtools_define.h"
#include "devtools/v8/trace_control.h"

#include <fstream>
#include <sstream>
#include <utility>

#include "footstone/logging.h"

namespace hippy::devtools {
constexpr char kCacheFileName[] = "/v8_trace.json";
constexpr char kTraceIncludedCategoryV8[] = "v8";

bool TraceControl::OpenCacheFile() {
  if (cache_file_dir_.empty() || std::string::npos != cache_file_dir_.find("..")) {
    FOOTSTONE_LOG(ERROR) << kDevToolsTag << "TraceControl cache_file_dir_ is invalid";
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
    auto trace_config = v8::platform::tracing::TraceConfig::CreateDefaultTraceConfig();
    trace_config->SetTraceRecordMode(v8::platform::tracing::TraceRecordMode::RECORD_CONTINUOUSLY);
    trace_config->AddIncludedCategory(kTraceIncludedCategoryV8);
    trace_config->EnableSystrace();
    trace_config->AddIncludedCategory("devtools.timeline");
    trace_config->AddIncludedCategory("v8.execute");
    trace_config->AddIncludedCategory("disabled-by-default-devtools.timeline");
    trace_config->AddIncludedCategory("disabled-by-default-devtools.timeline.frame");
    trace_config->AddIncludedCategory("disabled-by-default-devtools.timeline.stack");
    trace_config->AddIncludedCategory("disabled-by-default-v8.cpu_profiler");
    trace_config->AddIncludedCategory("disabled-by-default-v8.cpu_profiler.hires");
    trace_config->AddIncludedCategory("latencyInfo");
    v8_trace_control_->StartTracing(trace_config);
    tracing_has_start_ = true;
  }
}

std::string TraceControl::GetTracingContent(const std::string& params_key) {
  std::ifstream ifs(cache_file_path_);
  if (ifs.good()) {
    std::ostringstream buffer;
    buffer << ifs.rdbuf();
    std::string tracing_content = buffer.str();
    ifs.close();
    FOOTSTONE_LOG(INFO) << kDevToolsTag << "TraceControl content:" << tracing_content;
    if (!tracing_content.empty() && tracing_content[0] == ',') {
      tracing_content = tracing_content.substr(1);
    }
    std::string result = "{\"";
    result.append(params_key).append("\":[").append(tracing_content).append("]}");
    return result;
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
