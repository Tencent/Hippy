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

#include "driver/modules/performance/performance_navigation_timing_module.h"

#include "driver/performance/performance_resource_timing.h"
#include "footstone/time_point.h"
#include "footstone/string_view.h"

using string_view = footstone::string_view;

namespace hippy {
inline namespace driver {
inline namespace module {

constexpr char kBundleInfoUrlKey[] = "url";
constexpr char kBundleInfoStartKey[] = "start";
constexpr char kBundleInfoEndKey[] = "end";

std::shared_ptr<ClassTemplate<PerformanceNavigationTiming>> RegisterPerformanceNavigationTiming(const std::weak_ptr<Scope>& weak_scope) {
  ClassTemplate<PerformanceNavigationTiming> class_template;
  class_template.name = "PerformanceNavigationTiming";
  class_template.constructor = [weak_scope](
      const std::shared_ptr<CtxValue>& receiver,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[],
      void* external,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<PerformanceNavigationTiming> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    if (!external) {
      exception = context->CreateException("legal constructor");
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

    auto entry = scope->GetPerformance()->GetEntriesByName(name, static_cast<PerformanceEntry::Type>(type));
    if (!entry) {
      exception = context->CreateException("entry not found");
      return nullptr;
    }
    return std::static_pointer_cast<PerformanceNavigationTiming>(entry);
  };

  PropertyDefine<PerformanceNavigationTiming> engine_initialization_start;
  engine_initialization_start.name = "engineInitializationStart";
  engine_initialization_start.getter = [weak_scope](PerformanceNavigationTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetEngineInitializationStart().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(engine_initialization_start));

  PropertyDefine<PerformanceNavigationTiming> engine_initialization_end;
  engine_initialization_end.name = "engineInitializationEnd";
  engine_initialization_end.getter = [weak_scope](PerformanceNavigationTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetEngineInitializationEnd().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(engine_initialization_end));

  PropertyDefine<PerformanceNavigationTiming> bundle_info;
  bundle_info.name = "bundleInfo";
  bundle_info.getter = [weak_scope](PerformanceNavigationTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    auto bundle_info = thiz->GetBundleInfo();
    std::shared_ptr<CtxValue> array[bundle_info.size()];
    for (const auto& info: bundle_info) {
      auto object = context->CreateObject();
      context->SetProperty(object, context->CreateString(kBundleInfoUrlKey), context->CreateString(info.bundle_url));
      context->SetProperty(object, context->CreateString(kBundleInfoStartKey),
                           context->CreateNumber(info.start.ToEpochDelta().ToMillisecondsF()));
      context->SetProperty(object, context->CreateString(kBundleInfoEndKey),
                           context->CreateNumber(info.end.ToEpochDelta().ToMillisecondsF()));
    }
    return context->CreateArray(bundle_info.size(), array);
  };
  class_template.properties.push_back(std::move(bundle_info));

  PropertyDefine<PerformanceNavigationTiming> load_instance_start;
  load_instance_start.name = "loadInstanceStart";
  load_instance_start.getter = [weak_scope](PerformanceNavigationTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetLoadInstanceStart().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(load_instance_start));

  PropertyDefine<PerformanceNavigationTiming> load_instance_end;
  load_instance_end.name = "loadInstanceEnd";
  load_instance_end.getter = [weak_scope](PerformanceNavigationTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetLoadInstanceEnd().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(load_instance_end));

  PropertyDefine<PerformanceNavigationTiming> first_frame;
  first_frame.name = "firstFrame";
  first_frame.getter = [weak_scope](PerformanceNavigationTiming* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetFirstFrame().ToEpochDelta().ToMillisecondsF());
  };
  class_template.properties.push_back(std::move(first_frame));

  return std::make_shared<ClassTemplate<PerformanceNavigationTiming>>(std::move(class_template));
}

}
}
}
