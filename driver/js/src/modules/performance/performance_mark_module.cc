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

#include "driver/modules/performance/performance_mark_module.h"

#include "driver/performance/performance_mark.h"
#include "footstone/time_point.h"
#include "footstone/time_delta.h"
#include "footstone/string_view.h"

using string_view = footstone::string_view;
using TimePoint = footstone::TimePoint;
using TimeDelta = footstone::TimeDelta;

namespace hippy {
inline namespace driver {
inline namespace module {

constexpr char kDetailKey[] = "detail";
constexpr char kStartTimeKey[] = "startTime";

std::shared_ptr<ClassTemplate<PerformanceMark>> RegisterPerformanceMark(const std::weak_ptr<Scope>& weak_scope) {
  ClassTemplate<PerformanceMark> class_template;
  class_template.name = "PerformanceMark";
  class_template.constructor = [weak_scope](
      const std::shared_ptr<CtxValue>& receiver,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      void* external,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<PerformanceMark> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    auto performance_entry_class = scope->GetJavascriptClass("PerformanceEntry");
    if (external) {
      auto mark = reinterpret_cast<PerformanceMark*>(external);
      return std::make_shared<PerformanceMark>(mark->GetName(), mark->GetStartTime(), mark->GetDetail());
    }
    if (!argument_count || argument_count > 2) {
      exception = context->CreateException("PerformanceMark parameter error");
      return nullptr;
    }
    string_view name;
    auto flag = context->GetValueString(arguments[0], &name);
    if (!flag) {
      exception = context->CreateException("PerformanceMark name error");
      return nullptr;
    }
    if (argument_count == 1) {
      return std::make_shared<PerformanceMark>(name, nullptr);
    } else if (argument_count == 2) {
      auto performance_mark_options = arguments[1];
      if (context->IsObject(performance_mark_options)) {
        exception = context->CreateException("The provided value is not of type 'PerformanceMarkOptions'");
        return nullptr;
      }
      auto start_time_key = context->CreateString(kStartTimeKey);
      auto start_time_value = context->GetProperty(performance_mark_options, start_time_key);
      if (!context->IsNumber(start_time_value)) {
        exception = context->CreateException("Failed to read the 'startTime' property from 'PerformanceMarkOptions'");
        return nullptr;
      }
      int32_t start_time;
      flag = context->GetValueNumber(start_time_value, &start_time);
      if (!flag) {
        exception = context->CreateException("PerformanceMarkOptions startTime error");
        return nullptr;
      }
      auto detail_key = context->CreateString(kDetailKey);
      auto detail_value = context->GetProperty(performance_mark_options, detail_key);
      return std::make_shared<PerformanceMark>(name, TimePoint::FromEpochDelta(
          TimeDelta::FromMilliseconds(static_cast<int64_t>(start_time))));
    } else {
      FOOTSTONE_UNREACHABLE();
    }
  };

  PropertyDefine<PerformanceMark> name_property_define;
  name_property_define.name = "detail";
  name_property_define.getter = [weak_scope](
      PerformanceMark* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    auto detail = thiz->GetDetail();
    if (!detail.has_value()) {
      return context->CreateNull();
    }
    return std::any_cast<std::shared_ptr<CtxValue>>(detail);
  };
  class_template.properties.push_back(std::move(name_property_define));

  return std::make_shared<ClassTemplate<PerformanceMark>>(std::move(class_template));
}

}
}
}
