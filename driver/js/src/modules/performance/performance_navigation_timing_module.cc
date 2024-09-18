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
constexpr char kBundleInfoStartKey[] = "executeSourceStart";
constexpr char kBundleInfoEndKey[] = "executeSourceEnd";

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
    return std::static_pointer_cast<PerformanceNavigationTiming>(entries.back());
  };

#define ADD_PROPERTY(prop_var, prop_name, get_prop_method) \
  PropertyDefine<PerformanceNavigationTiming> prop_var; \
  prop_var.name = prop_name; \
  prop_var.getter = [weak_scope](PerformanceNavigationTiming* thiz, \
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> { \
    auto scope = weak_scope.lock(); \
    if (!scope) { \
      return nullptr; \
    } \
    auto context = scope->GetContext(); \
    return context->CreateNumber(thiz->get_prop_method().ToEpochDelta().ToMillisecondsF()); \
  }; \
  class_template.properties.push_back(std::move(prop_var));

  ADD_PROPERTY(hippy_native_init_start, "hippyNativeInitStart", GetHippyNativeInitStart)
  ADD_PROPERTY(hippy_native_init_end, "hippyNativeInitEnd", GetHippyNativeInitEnd)
  ADD_PROPERTY(hippy_js_engine_init_start, "hippyJsEngineInitStart", GetHippyJsEngineInitStart)
  ADD_PROPERTY(hippy_js_engine_init_end, "hippyJsEngineInitEnd", GetHippyJsEngineInitEnd)
  ADD_PROPERTY(hippy_run_application_start, "hippyRunApplicationStart", GetHippyRunApplicationStart)
  ADD_PROPERTY(hippy_run_application_end, "hippyRunApplicationEnd", GetHippyRunApplicationEnd)
  ADD_PROPERTY(hippy_dom_start, "hippyDomStart", GetHippyDomStart)
  ADD_PROPERTY(hippy_dom_end, "hippyDomEnd", GetHippyDomEnd)
  ADD_PROPERTY(hippy_first_frame_start, "hippyFirstFrameStart", GetHippyFirstFrameStart)
  ADD_PROPERTY(hippy_first_frame_end, "hippyFirstFrameEnd", GetHippyFirstFrameEnd)
  ADD_PROPERTY(hippy_first_contentful_paint_end, "hippyFirstContentfulPaintEnd", GetHippyFirstContentfulPaintEnd)
#undef ADD_PROPERTY

  PropertyDefine<PerformanceNavigationTiming> bundle_info;
  bundle_info.name = "bundleInfo";
  bundle_info.getter = [weak_scope](PerformanceNavigationTiming* thiz,
                                    std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    auto bundle_info_array = thiz->GetBundleInfoArray();
    std::shared_ptr<CtxValue> array[bundle_info_array.size()];
    for (size_t i = 0; i < bundle_info_array.size(); ++i) {
      auto& info = bundle_info_array[i];
      auto object = context->CreateObject();
      context->SetProperty(object, context->CreateString(kBundleInfoUrlKey),
                           context->CreateString(info.url_));
      context->SetProperty(object, context->CreateString(kBundleInfoStartKey),
                           context->CreateNumber(info.execute_source_start_.ToEpochDelta().ToMillisecondsF()));
      context->SetProperty(object, context->CreateString(kBundleInfoEndKey),
                           context->CreateNumber(info.execute_source_end_.ToEpochDelta().ToMillisecondsF()));
      array[i] = object;
    }
    return context->CreateArray(bundle_info_array.size(), array);
  };
  class_template.properties.push_back(std::move(bundle_info));

  return std::make_shared<ClassTemplate<PerformanceNavigationTiming>>(std::move(class_template));
}

}
}
}
