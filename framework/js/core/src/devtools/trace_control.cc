//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#include <sstream>
#include <fstream>
#include <utility>

#include "devtools/trace_control.h"
#include "base/logging.h"

namespace hippy {
namespace devtools {

TraceControl::TraceControl() { TDF_BASE_LOG(INFO) <<"TraceControl TraceControl construct"; }

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
  file_cache_dir_ = std::move(file_cache_dir);
}

std::string TraceControl::GetFileCacheDir() {
  return file_cache_dir_;
}

void TraceControl::StartTracing() {
  std::lock_guard<std::mutex> lock(devtools_tracing_mutex_);
#ifdef OS_ANDROID
//  if (!v8_trace_control_) {
//    v8_trace_control_ = hippy::devtools::ServiceDevToolsJS::Instance()
//                            ->GetGlobalTracingControl();
//    TDF_BASE_LOG(INFO)<<"TraceControl StartTracing tracingControl is nullptr, get it";
//  }
  GlobalInit(GetFileCacheDir());
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
void TraceControl::OpenCacheFile() {
  struct timeval time;
  gettimeofday(&time, NULL);
  if (!trace_dir_) {
    if (!cache_file_path_.empty()) {
      remove(cache_file_path_.c_str());
    }
    cache_file_path_ = "/v8_trace_" + std::to_string(time.tv_usec) + ".json";
    trace_file_.open(cache_file_path_);
  } else {
    if (!cache_file_path_.empty()) {
      remove(cache_file_path_.c_str());
    }
    std::string dir_string = trace_dir_;
    cache_file_path_ = dir_string + ("/v8_trace_" + std::to_string(time.tv_usec)) + ".json";
    TDF_BASE_LOG(INFO) << "TraceControl trace_file_ open filepath:" << cache_file_path_.c_str();
    trace_file_.open(cache_file_path_);
  }
  if (trace_file_.is_open()) {
    TDF_BASE_LOG(INFO) << "TraceControl trace_file_ open success";
  } else {
    TDF_BASE_LOG(INFO) << "TraceControl trace_file_ open fail";
  }
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

char* TraceControl::trace_dir_;

void TraceControl::GlobalInit(const std::string &trace_dir) {
  trace_dir_ = new char[trace_dir.length() + 1];
  trace_dir.copy(trace_dir_, trace_dir.length(), 0);
  trace_dir_[trace_dir.length()] = '\0';
  TraceControl::GetInstance();
  if (trace_dir.empty()) {
    TDF_BASE_LOG(INFO) << "TraceControl TraceControl init, traceDir is empty";
  } else {
    TDF_BASE_LOG(INFO) << "TraceControl TraceControl init, traceDir:%s", trace_dir.c_str();
  }

  // test code
//  DomRestore snap_shot_restore;
//  snap_shot_restore.restore(trace_dir + "/test.png");
}

}  // namespace devtools
}  // namespace hippy
