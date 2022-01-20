//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/6/8.
//

#pragma once

#include <string>
#include <mutex>
#ifdef OS_ANDROID
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
  void StartTracing(const std::string& trace_file);
  void StopTracing();
#ifdef OS_ANDROID
  void SetGlobalTracingController(v8::platform::tracing::TracingController *tracing_control);
#endif
  std::string GetTracingContent();
  static void GlobalInit(const std::string& trace_dir);
  static char *trace_dir_;

 protected:
  TraceControl(TraceControl &&) = delete;
  TraceControl(const TraceControl &) = delete;
  void operator=(const TraceControl &) = delete;

 private:
  TraceControl();
  void ClosePreviousBuffer();
#ifdef OS_ANDROID
  v8::platform::tracing::TracingController *v8_trace_control_;
  v8::platform::tracing::TraceBuffer *trace_buffer_;
  v8::platform::tracing::TraceWriter *trace_writer_;
  std::ofstream trace_file_;
  void OpenCacheFile();
#endif
  std::string cache_file_path_;
  bool tracing_has_start_;
  std::mutex devtools_tracing_mutex_;
  bool control_has_init_ = false;
};

}  // namespace devtools
}  // namespace hippy
