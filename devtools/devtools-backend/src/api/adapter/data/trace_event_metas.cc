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

#include "api/adapter/data/trace_event_metas.h"
#include <sstream>
#include "devtools_base/transform_string_util.hpp"

namespace hippy::devtools {

constexpr char kTraceEvents[] = "traceEvents";
constexpr char kTraceName[] = "name";
constexpr char kTracePh[] = "ph";
constexpr char kTracePid[] = "pid";
constexpr char kTraceTid[] = "tid";
constexpr char kTraceTimestamp[] = "ts";

constexpr char kThreadMetas[] = "threadMetas";
constexpr char kThreadName[] = "name";
constexpr char kThreadId[] = "tid";

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
  trace_result_string += !trace_metas_.empty() ? "]" : "[]";
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
  thread_result_string += !thread_metas_.empty() ? "]" : "[]";
  return thread_result_string;
}

}  // namespace hippy::devtools
