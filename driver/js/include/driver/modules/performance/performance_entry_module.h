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

#pragma once

#include <memory>

#include "driver/napi/js_ctx_value.h"
#include "driver/performance/performance_entry.h"
#include "driver/scope.h"


namespace hippy {
inline namespace driver {
inline namespace module {

std::shared_ptr<ClassTemplate<PerformanceEntry>> RegisterPerformanceEntry(const std::weak_ptr<Scope>& weak_scope);

template<typename T>
std::vector<PropertyDefine<T>> RegisterPerformanceEntryPropertyDefine(const std::weak_ptr<Scope>& weak_scope) {
  std::vector<PropertyDefine<T>> defines;
  PropertyDefine<T> name_property_define;
  name_property_define.name = "name";
  name_property_define.getter = [weak_scope](
      T* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateString(thiz->GetName());
  };
  defines.push_back(std::move(name_property_define));

  PropertyDefine<T> entry_type_property_define;
  entry_type_property_define.name = "entryType";
  entry_type_property_define.getter = [weak_scope](
      T* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateString(PerformanceEntry::GetEntryTypeString(thiz->GetType()));
  };
  defines.push_back(std::move(entry_type_property_define));

  PropertyDefine<T> start_time_property_define;
  start_time_property_define.name = "startTime";
  start_time_property_define.getter = [weak_scope](
      T* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetStartTime().ToEpochDelta().ToMillisecondsF());
  };
  defines.push_back(std::move(start_time_property_define));

  PropertyDefine<T> duration_property_define;
  duration_property_define.name = "duration";
  duration_property_define.getter = [weak_scope](
      T* thiz,
      std::shared_ptr<CtxValue>& exception) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto context = scope->GetContext();
    return context->CreateNumber(thiz->GetDuration().ToMillisecondsF());
  };
  defines.push_back(std::move(duration_property_define));
  return defines;
}

}
}
}
