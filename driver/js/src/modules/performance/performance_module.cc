/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "driver/modules/performance/performance_module.h"

#include "driver/performance/performance.h"
#include "driver/performance/performance_entry.h"
#include "driver/performance/performance_navigation_timing.h"
#include "driver/performance/performance_resource_timing.h"
#include "driver/performance/performance_mark.h"
#include "driver/performance/performance_measure.h"
#include "driver/performance/performance_frame_timing.h"
#include "driver/performance/performance_paint_timing.h"
#include "footstone/time_point.h"
#include "footstone/string_view.h"
#ifdef JS_V8
#include "driver/vm/v8/memory_module.h"
#endif

using string_view = footstone::string_view;

namespace hippy {
inline namespace driver {
inline namespace module {

constexpr char kFunctionNowName[] = "now";
constexpr char kFunctionMarkName[] = "mark";
constexpr char kFunctionClearMarksName[] = "clearMarks";
constexpr char kFunctionMeasureName[] = "measure";
constexpr char kFunctionClearMeasuresName[] = "clearMeasures";
constexpr char kFunctionGetEntriesName[] = "getEntries";
constexpr char kFunctionGetEntriesByName[] = "getEntriesByName";
constexpr char kFunctionGetEntriesByType[] = "getEntriesByType";
constexpr char kFunctionClearResourceTimings[] = "clearResourceTimings";
constexpr char kFunctionSetResourceTimingBufferSize[] = "setResourceTimingBufferSize";

std::shared_ptr<ClassTemplate<Performance>> RegisterPerformance(const std::weak_ptr<Scope>& weak_scope) {
  ClassTemplate<Performance> class_template;
  class_template.name = "Performance";
  class_template.constructor = [weak_scope](
      const std::shared_ptr<CtxValue>& receiver,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      void* external,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<Performance> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    if (!external) {
      exception = context->CreateException("illegal constructor");
      return nullptr;
    }
    return scope->GetPerformance();
  };

  FunctionDefine<Performance> now_function_define;
  now_function_define.name = kFunctionNowName;
  now_function_define.callback = [weak_scope](
      Performance* performance,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>&) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    auto now = hippy::Performance::Now().ToEpochDelta().ToMillisecondsF();
    return context->CreateNumber(now);
  };
  class_template.functions.emplace_back(std::move(now_function_define));

  FunctionDefine<Performance> mark_function_define;
  mark_function_define.name = kFunctionMarkName;
  mark_function_define.callback = [weak_scope](
      Performance* performance,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    if (argument_count <= 0) {
      exception = context->CreateException("mark parameter error");
      return nullptr;
    }
    string_view name;
    auto flag = context->GetValueString(arguments[0], &name);
    if (!flag) {
      exception = context->CreateException("mark parameter error");
      return nullptr;
    }
    performance->Mark(name);
    return nullptr;
  };
  class_template.functions.emplace_back(std::move(mark_function_define));

  FunctionDefine<Performance> clear_mark_function_define;
  clear_mark_function_define.name = kFunctionClearMarksName;
  clear_mark_function_define.callback = [weak_scope](
      Performance* performance,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    if (!argument_count) {
      performance->ClearMarks();
      return nullptr;
    }
    if (argument_count > 1) {
      exception = context->CreateException("clearMarks parameter error");
      return nullptr;
    }
    string_view name;
    auto flag = context->GetValueString(arguments[0], &name);
    if (!flag) {
      exception = context->CreateException("clearMarks parameter error");
      return nullptr;
    }
    performance->ClearMarks(name);
    return nullptr;
  };
  class_template.functions.emplace_back(std::move(clear_mark_function_define));

  FunctionDefine<Performance> measure_function_define;
  measure_function_define.name = kFunctionMeasureName;
  measure_function_define.callback = [weak_scope](
      Performance* performance,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    if (argument_count <= 0 || argument_count > 3) {
      exception = context->CreateException("measure parameter error");
      return nullptr;
    }
    string_view name;
    auto flag = context->GetValueString(arguments[0], &name);
    if (!flag) {
      exception = context->CreateException("measure name error");
      return nullptr;
    }
    if (argument_count == 1) {
      performance->Measure(name);
      return nullptr;
    }
    string_view start_mark;
    flag = context->GetValueString(arguments[1], &start_mark);
    if (!flag) {
      exception = context->CreateException("measure startMark error");
      return nullptr;
    }
    if (argument_count == 2) {
      flag = performance->Measure(name, start_mark);
      if (!flag) {
        exception = context->CreateException("measure startMark not found");
        return nullptr;
      }
      return nullptr;
    }
    string_view end_mark;
    flag = context->GetValueString(arguments[2], &end_mark);
    if (!flag) {
      exception = context->CreateException("measure endMark error");
      return nullptr;
    }
    flag = performance->Measure(name, start_mark, end_mark);
    if (!flag) {
      exception = context->CreateException("measure Mark not found");
      return nullptr;
    }
    return nullptr;
  };
  class_template.functions.emplace_back(std::move(measure_function_define));

  FunctionDefine<Performance> clear_measure_function_define;
  clear_measure_function_define.name = kFunctionClearMeasuresName;
  clear_measure_function_define.callback = [weak_scope](
      Performance* performance,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    if (!argument_count) {
      performance->ClearMeasures();
      return nullptr;
    }
    string_view name;
    auto flag = context->GetValueString(arguments[0], &name);
    if (!flag) {
      exception = context->CreateException("clearMeasures name error");
      return nullptr;
    }
    performance->ClearMeasures(name);
    return nullptr;
  };
  class_template.functions.emplace_back(std::move(clear_measure_function_define));

  FunctionDefine<Performance> get_entries_by_name_function_define;
  get_entries_by_name_function_define.name = kFunctionGetEntriesByName;
  get_entries_by_name_function_define.callback = [weak_scope](
      Performance* performance,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    if (argument_count <= 0 || argument_count > 2) {
      exception = context->CreateException("getEntriesByName parameter error");
      return nullptr;
    }
    string_view name;
    auto flag = context->GetValueString(arguments[0], &name);
    if (!flag) {
      exception = context->CreateException("getEntriesByName name error");
      return nullptr;
    }
    if (argument_count == 1) {
      auto entries = performance->GetEntriesByName(name);
      std::shared_ptr<CtxValue> instances[entries.size()];
      for (size_t i = 0; i < entries.size(); ++i) {
        auto entry = entries[i];
        auto javascript_class = scope->GetJavascriptClass(PerformanceEntry::GetSubTypeString(entry->GetSubType()));
        std::shared_ptr<CtxValue> argv[] = { context->CreateString(entry->GetName()),
                                             context->CreateNumber(static_cast<uint32_t>(entry->GetType())) };
        instances[i] = context->NewInstance(javascript_class, 2, argv, entry.get());
      }
      return context->CreateArray(entries.size(), instances);
    }
    string_view type;
    flag = context->GetValueString(arguments[1], &type);
    if (!flag) {
      exception = context->CreateException("getEntriesByName type error");
      return nullptr;
    }
    auto entry_type = PerformanceEntry::GetEntryType(type);
    if (entry_type == PerformanceEntry::Type::kError) {
      exception = context->CreateException("entry_type error");
      return nullptr;
    }
    auto entries = performance->GetEntriesByName(name, entry_type);
    std::shared_ptr<CtxValue> instances[entries.size()];
    for (size_t i = 0; i < entries.size(); ++i) {
      auto entry = entries[i];
      auto javascript_class = scope->GetJavascriptClass(PerformanceEntry::GetSubTypeString(entry->GetSubType()));
      std::shared_ptr<CtxValue> argv[] = { context->CreateString(entry->GetName()),
                                           context->CreateNumber(static_cast<uint32_t>(entry->GetType())) };
      instances[i] = context->NewInstance(javascript_class, 2, argv, entry.get());
    }
    return context->CreateArray(entries.size(), instances);
  };
  class_template.functions.emplace_back(std::move(get_entries_by_name_function_define));

  FunctionDefine<Performance> get_entries_by_type_function_define;
  get_entries_by_type_function_define.name = kFunctionGetEntriesByType;
  get_entries_by_type_function_define.callback = [weak_scope](
      Performance* performance,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    if (argument_count != 1) {
      exception = context->CreateException("getEntriesByType parameter error");
      return nullptr;
    }
    string_view type;
    auto flag = context->GetValueString(arguments[0], &type);
    if (!flag) {
      exception = context->CreateException("getEntriesByType type error");
      return nullptr;
    }
    auto entry_type = PerformanceEntry::GetEntryType(type);
    if (entry_type == PerformanceEntry::Type::kError) {
      exception = context->CreateException("getEntriesByType error");
      return nullptr;
    }
    auto entries = performance->GetEntriesByType(entry_type);
    std::shared_ptr<CtxValue> instances[entries.size()];
    for (size_t i = 0; i < entries.size(); ++i) {
      auto entry = entries[i];
      auto javascript_class = scope->GetJavascriptClass(PerformanceEntry::GetSubTypeString(entry->GetSubType()));
      std::shared_ptr<CtxValue> argv[] = { context->CreateString(entry->GetName()),
                                           context->CreateNumber(static_cast<uint32_t>(entry->GetType())) };
      instances[i] = context->NewInstance(javascript_class, 2, argv, entry.get());
    }
    return context->CreateArray(entries.size(), instances);
  };
  class_template.functions.emplace_back(std::move(get_entries_by_type_function_define));

  FunctionDefine<Performance> clear_resource_timings_function_define;
  clear_resource_timings_function_define.name = kFunctionClearResourceTimings;
  clear_resource_timings_function_define.callback = [weak_scope](
      Performance* performance,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    if (argument_count > 0) {
      exception = context->CreateException("clearResourceTimings parameter error");
      return nullptr;
    }
    performance->ClearResourceTimings();
    return nullptr;
  };
  class_template.functions.emplace_back(std::move(clear_resource_timings_function_define));

  FunctionDefine<Performance> set_resource_timing_buffer_size_function_define;
  set_resource_timing_buffer_size_function_define.name = kFunctionSetResourceTimingBufferSize;
  set_resource_timing_buffer_size_function_define.callback = [weak_scope](
      Performance* performance,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    if (argument_count != 1) {
      exception = context->CreateException("setResourceTimingBufferSize parameter error");
      return nullptr;
    }
    int32_t size;
    auto flag = context->GetValueNumber(arguments[0], &size);
    if (!flag) {
      exception = context->CreateException("setResourceTimingBufferSize size error");
      return nullptr;
    }
    performance->SetResourceTimingBufferSize(static_cast<uint32_t>(size));
    return nullptr;
  };
  class_template.functions.emplace_back(std::move(set_resource_timing_buffer_size_function_define));

  FunctionDefine<Performance> get_entries_function_define;
  get_entries_function_define.name = kFunctionGetEntriesName;
  get_entries_function_define.callback = [weak_scope](
      Performance* performance,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    auto entries = performance->GetEntries();
    std::shared_ptr<CtxValue> instances[entries.size()];
    for (size_t i = 0; i < entries.size(); ++i) {
      auto entry = entries[i];
      auto javascript_class = scope->GetJavascriptClass(PerformanceEntry::GetSubTypeString(entry->GetSubType()));
      std::shared_ptr<CtxValue> argv[] = { context->CreateString(entry->GetName()),
                                           context->CreateNumber(static_cast<uint32_t>(entry->GetType())) };
      instances[i] = context->NewInstance(javascript_class, 2, argv, entry.get());
    }
    return context->CreateArray(entries.size(), instances);
  };
  class_template.functions.emplace_back(std::move(get_entries_function_define));

  PropertyDefine<Performance> memory_property_define;
  memory_property_define.name = "memory";
  memory_property_define.getter = [weak_scope](
      Performance* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
#ifdef JS_V8
    return GetV8Memory(scope);
#else
    auto context = scope->GetContext();
    return context->CreateUndefined();
#endif
  };
  class_template.properties.push_back(std::move(memory_property_define));

  return std::make_shared<ClassTemplate<Performance>>(std::move(class_template));
}

}
}
}
