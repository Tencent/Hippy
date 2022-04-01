//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/23.
//

#include "api/adapter/data/trace_event_metas.h"
#include <sstream>
#include "devtools_base/transform_string_util.hpp"

namespace tdf {
namespace devtools {

constexpr const char* kTraceEvents = "traceEvents";
constexpr const char* kTraceName = "name";
constexpr const char* kTracePh = "ph";
constexpr const char* kTracePid = "pid";
constexpr const char* kTraceTid = "tid";
constexpr const char* kTraceTimestamp = "ts";

constexpr const char* kThreadMetas = "threadMetas";
constexpr const char* kThreadName = "name";
constexpr const char* kThreadId = "tid";

void TraceEventMetas::AddTraceMeta(const TraceMeta& meta) { trace_metas_.emplace_back(meta); }
void TraceEventMetas::AddThreadMeta(const ThreadMeta& meta) { thread_metas_.emplace_back(meta); }

std::string TraceEventMetas::Serialize() const {
  std::string result_string = "{";
  result_string += SerializeTrace();
  result_string += ",";
  result_string += SerializeThread();
  result_string += "}";
  return result_string;
}

std::string TraceEventMetas::SerializeTrace() const {
  std::string trace_result_string = "\"";
  trace_result_string += kTraceEvents;
  trace_result_string += "\":[";
  for (auto& trace_meta : trace_metas_) {
    std::string element_string = "{\"";
    element_string += kTraceName;
    element_string += "\":\"";
    element_string += trace_meta.name_;
    element_string += "\",\"";
    element_string += kTracePh;
    element_string += "\":\"";
    element_string += trace_meta.event_;
    element_string += "\",\"";
    element_string += kTracePid;
    element_string += "\":";
    element_string += TransformStringUtil::NumbertoString(trace_meta.timestamp_.time_since_epoch().count());
    element_string += ",\"";
    std::ostringstream oss;
    oss << trace_meta.thread_id_;
    std::string stid = oss.str();
    element_string += kTraceTid;
    element_string += "\":";
    element_string += stid;
    element_string += ",\"";
    element_string += kTraceTimestamp;
    element_string += "\":\"";
    element_string += TransformStringUtil::NumbertoString(trace_meta.timestamp_.time_since_epoch().count());
    element_string += "\"},";
    trace_result_string += element_string;
  }
  trace_result_string.pop_back();
  trace_result_string += trace_metas_.size() ? "]" : "[]";
  return trace_result_string;
}

std::string TraceEventMetas::SerializeThread() const {
  std::string thread_result_string = "\"";
  thread_result_string += kThreadMetas;
  thread_result_string += "\":[";
  for (auto& thread_meta : thread_metas_) {
    std::string element_string = "{\"";
    element_string += kThreadId;
    element_string += "\":\"";
    element_string += TransformStringUtil::NumbertoString(thread_meta.thread_id_);
    element_string += "\",\"";
    element_string += kThreadName;
    element_string += "\":\"";
    element_string += thread_meta.thread_name_;
    element_string += "\"},";
    thread_result_string += element_string;
  }
  thread_result_string.pop_back();
  thread_result_string += thread_metas_.size() ? "]" : "[]";
  return thread_result_string;
}

}  // namespace devtools
}  // namespace tdf
