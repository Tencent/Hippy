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

#include "devtools/trace_control.h"

#include <fstream>
#include <sstream>
#include <utility>

#include "base/logging.h"

namespace hippy {
namespace devtools {
constexpr const char *kCacheFileName = "/v8_trace.json";

TraceControl::TraceControl() {
  TDF_BASE_LOG(INFO) << "TraceControl TraceControl construct";
}

#ifdef OS_ANDROID
void TraceControl::SetGlobalTracingController(v8::platform::tracing::TracingController *tracing_control) {
  if (tracing_control) {
    TDF_BASE_LOG(INFO) << "TraceControl SetGlobalTracingController tracing_control";
    v8_trace_control_ = static_cast<v8::platform::tracing::TracingController *>(tracing_control);
  } else {
    v8_trace_control_ = nullptr;
    TDF_BASE_LOG(INFO) << "TraceControl SetGlobalTracingController tracing_control is nullptr";
  }
}
#endif

void TraceControl::SetFileCacheDir(std::string file_cache_dir) {
  cache_file_dir_ = std::move(file_cache_dir);
}

void TraceControl::StartTracing() {
  std::lock_guard<std::mutex> lock(devtools_tracing_mutex_);
#ifdef OS_ANDROID
  if (v8_trace_control_) {
    if (tracing_has_start_) {
      StopTracing();
    }
    TDF_BASE_LOG(INFO) << "TraceControl TraceControl StartTracing:" << v8_trace_control_;
    OpenCacheFile();
    trace_writer_ = v8::platform::tracing::TraceWriter::CreateJSONTraceWriter(trace_file_);
    trace_buffer_ = v8::platform::tracing::TraceBuffer::CreateTraceBufferRingBuffer(
        v8::platform::tracing::TraceBuffer::kRingBufferChunks, trace_writer_);
    v8_trace_control_->Initialize(trace_buffer_);
    ClosePreviousBuffer();
    v8::platform::tracing::TraceConfig *traceConfig = v8::platform::tracing::TraceConfig::CreateDefaultTraceConfig();
    v8_trace_control_->StartTracing(traceConfig);
    control_has_init_ = true;
    tracing_has_start_ = true;
  } else {
    TDF_BASE_LOG(INFO) << "TraceControl StartTracing tracingControl is nullptr";
  }
#endif
}

#ifdef OS_ANDROID
bool TraceControl::OpenCacheFile() {
  struct timeval time;
  gettimeofday(&time, NULL);
  if (cache_file_dir_.empty() || std::string::npos != cache_file_dir_.find("..")) {
    TDF_BASE_LOG(ERROR) << "TraceControl cache_file_dir_ is invalid";
    return false;
  }
  if (!cache_file_path_.empty()) {
    remove(cache_file_path_.c_str());
  }
  cache_file_path_ = cache_file_dir_ + kCacheFileName;
  TDF_BASE_LOG(INFO) << "TraceControl trace_file_ open filepath:" << cache_file_path_.c_str();
  trace_file_.open(cache_file_path_);
  if (trace_file_.is_open()) {
    TDF_BASE_LOG(INFO) << "TraceControl trace_file_ open success";
    return true;
  } else {
    TDF_BASE_LOG(INFO) << "TraceControl trace_file_ open fail";
  }
  return false;
}
#endif

void TraceControl::ClosePreviousBuffer() {
  if (!control_has_init_) {
    return;
  }
#ifdef OS_ANDROID
  if (trace_buffer_) {
    trace_buffer_->Flush();
  }
  if (trace_writer_) {
    trace_writer_->Flush();
  }
  if (trace_file_) {
    trace_file_.seekp(-2, std::ios::end);
  }
#endif
}

std::string TraceControl::GetTracingContent() {
  std::ifstream ifs(cache_file_path_);
  if (ifs.good()) {
    std::ostringstream buffer;
    buffer << ifs.rdbuf();
    std::string content = buffer.str();
    ifs.close();
    return content;
  }
  return "";
}

void TraceControl::StopTracing() {
#ifdef OS_ANDROID
  if (v8_trace_control_) {
    v8_trace_control_->StopTracing();
    if (trace_writer_ != nullptr) {
      trace_file_ << "]}";
      TDF_BASE_LOG(INFO) << "TraceControl StopTracing trace_writer_ write end flag";
    } else {
      TDF_BASE_LOG(INFO) << "TraceControl StopTracing trace_writer_ is nullPtr";
    }
    trace_file_.flush();
    trace_file_.close();
    tracing_has_start_ = false;
    TDF_BASE_LOG(INFO) << "TraceControl StopTracing";
  } else {
    TDF_BASE_LOG(INFO) << "TraceControl StopTracing tracingControl is nullptr";
  }
#endif
}
}  // namespace devtools
}  // namespace hippy
