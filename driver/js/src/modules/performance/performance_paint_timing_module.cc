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

#include "driver/modules/performance/performance_paint_timing_module.h"

#include "driver/performance/performance_paint_timing.h"

using string_view = footstone::string_view;

namespace hippy {
inline namespace driver {
inline namespace module {

std::shared_ptr<ClassTemplate<PerformancePaintTiming>> RegisterPerformancePaintTiming(const std::weak_ptr<Scope>& weak_scope) {
  ClassTemplate<PerformancePaintTiming> class_template;
  class_template.name = "PerformancePaintTiming";
  class_template.constructor = [weak_scope](
      const std::shared_ptr<CtxValue>& receiver,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      void* external,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<PerformancePaintTiming> {
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
    return std::static_pointer_cast<PerformancePaintTiming>(entries.back());
  };

  return std::make_shared<ClassTemplate<PerformancePaintTiming>>(std::move(class_template));
}

}
}
}
