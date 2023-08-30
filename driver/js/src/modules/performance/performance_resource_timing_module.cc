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

#include "driver/modules/performance/performance_resource_timing_module.h"

#include "driver/performance/performance_resource_timing.h"
#include "footstone/time_point.h"
#include "footstone/string_view.h"

using string_view = footstone::string_view;
using PerformanceResourceTiming = hippy::PerformanceResourceTiming;

namespace hippy {
inline namespace driver {
inline namespace module {

std::shared_ptr<ClassTemplate<PerformanceResourceTiming>> RegisterPerformanceResourceTiming(const std::weak_ptr<Scope>& weak_scope) {
  ClassTemplate<PerformanceResourceTiming> class_template;
  class_template.name = "PerformanceResourceTiming";
  class_template.constructor = [weak_scope](
      const std::shared_ptr<CtxValue>& receiver,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      void* external,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<PerformanceResourceTiming> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    if (!external) {
      exception = context->CreateException("illegal constructor");
      return nullptr;
    }
    string_view name;
    auto flag = context->GetValueString(arguments[0], &name);
    if (!flag) {
      exception = context->CreateException("name error");
      return nullptr;
    }
    int32_t type;
    flag = context->GetValueNumber(arguments[1], &type);
    if (!flag || type < 0) {
      exception = context->CreateException("type error");
      return nullptr;
    }

    auto entries = scope->GetPerformance()->GetEntriesByName(name, static_cast<PerformanceEntry::Type>(type));
    if (entries.empty()) {
      exception = context->CreateException("entry not found");
      return nullptr;
    }
    return std::static_pointer_cast<PerformanceResourceTiming>(entries.back());
  };

  PropertyDefine<PerformanceResourceTiming> initiator_type;
  initiator_type.name = "initiatorType";
  initiator_type.getter = [weak_scope](PerformanceResourceTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateString(PerformanceResourceTiming::GetInitiatorString(thiz->GetInitiatorType()));
  };
  class_template.properties.push_back(std::move(initiator_type));

#define ADD_PROPERTY(prop_var, prop_name, get_prop_method) \
  PropertyDefine<PerformanceResourceTiming> prop_var; \
  prop_var.name = prop_name; \
  prop_var.getter = [weak_scope](PerformanceResourceTiming* thiz, \
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> { \
    auto scope = weak_scope.lock(); \
    if (!scope) { \
      return nullptr; \
    } \
    auto context = scope->GetContext(); \
    return context->CreateNumber(thiz->get_prop_method().ToEpochDelta().ToMillisecondsF()); \
  }; \
  class_template.properties.push_back(std::move(prop_var));

  ADD_PROPERTY(load_source_start, "loadSourceStart", GetLoadSourceStart)
  ADD_PROPERTY(load_source_end, "loadSourceEnd", GetLoadSourceEnd)
#undef ADD_PROPERTY

  return std::make_shared<ClassTemplate<PerformanceResourceTiming>>(std::move(class_template));
}

}
}
}
