/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
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

#include "core/modules/event_module.h"
#include "core/modules/ui_manager_module.h"
#include "core/napi/js_native_api_types.h"
#include "core/scope.h"
#include "dom/dom_event.h"
#include "dom/dom_node.h"
#include "dom/dom_value.h"
#include "core/base/string_view_utils.h"

template <typename T>
using InstanceDefine = hippy::napi::InstanceDefine<T>;

template <typename T>
using FunctionDefine = hippy::napi::FunctionDefine<T>;

template <typename T>
using PropertyDefine = hippy::napi::PropertyDefine<T>;

using CtxValue = hippy::napi::CtxValue;

namespace hippy {

std::shared_ptr<InstanceDefine<DomEvent>> MakeEventInstanceDefine(
    const std::weak_ptr<Scope>& weak_scope, std::shared_ptr<DomEvent>& dom_event) {
  using DomEvent = hippy::dom::DomEvent;
  InstanceDefine<DomEvent> def;
  def.name = "Event";
  def.constructor = [dom_event](size_t argument_count,
                       const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<DomEvent> { return dom_event; };

  // function
  FunctionDefine<DomEvent> stop_propagation;
  stop_propagation.name = "stopPropagation";
  stop_propagation.cb = [weak_scope](
                            DomEvent* event, size_t argument_count,
                            const std::shared_ptr<CtxValue> arguments[])
      -> std::shared_ptr<CtxValue> {
    event->StopPropagation();    
    TDF_BASE_LOG(INFO) << "stop propagation" << std::endl;
    return nullptr;
  };
  def.functions.emplace_back(std::move(stop_propagation));

  // property type
  PropertyDefine<DomEvent> type;
  type.name = "type";
  type.getter = [weak_scope](DomEvent* event) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      if (event == nullptr) {
        scope->GetContext()->ThrowException(tdf::base::unicode_string_view("nullptr event pointer"));
        return scope->GetContext()->CreateUndefined();
      }
      std::string type = event->GetType();
      tdf::base::unicode_string_view string_view = tdf::base::unicode_string_view(type);
      std::shared_ptr<CtxValue> ctx_value = scope->GetContext()->CreateString(string_view);
      return ctx_value;
    }
    return nullptr;
  };
  type.setter = [](DomEvent* event, const std::shared_ptr<CtxValue>& value) {};
  def.properties.emplace_back(std::move(type));

  PropertyDefine<DomEvent> id;
  id.name = "id";
  id.getter = [weak_scope](DomEvent* event) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      if (event == nullptr) {
        scope->GetContext()->ThrowException(tdf::base::unicode_string_view("nullptr event pointer"));
        return scope->GetContext()->CreateUndefined();
      }
      auto dom_node = event->GetTarget();
      uint32_t id = dom_node.lock()->GetId();
      std::shared_ptr<CtxValue> ctx_value = scope->GetContext()->CreateNumber(id);
      return ctx_value;
    }
    return nullptr;
  };
  id.setter = [](DomEvent* event, const std::shared_ptr<CtxValue>& value) {};
  def.properties.emplace_back(std::move(id));

  PropertyDefine<DomEvent> current_id;
  current_id.name = "currentId";
  current_id.getter = [weak_scope](DomEvent* event) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      if (event == nullptr) {
        scope->GetContext()->ThrowException(tdf::base::unicode_string_view("nullptr event pointer"));
        return scope->GetContext()->CreateUndefined();
      }
      auto dom_node = event->GetCurrentTarget();
      uint32_t current_id = dom_node.lock()->GetId();
      std::shared_ptr<CtxValue> ctx_value = scope->GetContext()->CreateNumber(current_id);
      return ctx_value;
    }
    return nullptr;
  };
  current_id.setter = [](DomEvent* event, const std::shared_ptr<CtxValue>& value) {};
  def.properties.emplace_back(std::move(current_id));

  PropertyDefine<DomEvent> target;
  target.name = "target";
  target.getter = [weak_scope](DomEvent* event) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      if (event == nullptr) {
        scope->GetContext()->ThrowException(tdf::base::unicode_string_view("nullptr event pointer"));
        return scope->GetContext()->CreateUndefined();
      }
      auto dom_node = event->GetTarget();
      uint32_t target_id = dom_node.lock()->GetId();
      std::shared_ptr<CtxValue> ctx_value = scope->GetContext()->CreateNumber(target_id);
      return ctx_value;
    }
    return nullptr;
  };
  target.setter = [](DomEvent* event, const std::shared_ptr<CtxValue>& value) {};
  def.properties.emplace_back(std::move(target));

  PropertyDefine<DomEvent> current_target;
  current_target.name = "currentTarget";
  current_target.getter = [weak_scope](DomEvent* event) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      if (event == nullptr) {
        scope->GetContext()->ThrowException(tdf::base::unicode_string_view("nullptr event pointer"));
        return scope->GetContext()->CreateUndefined();
      }
      auto dom_node = event->GetCurrentTarget();
      uint32_t current_target_id = dom_node.lock()->GetId();
      std::shared_ptr<CtxValue> ctx_value = scope->GetContext()->CreateNumber(current_target_id);
      return ctx_value;
    }
    return nullptr;
  };
  current_target.setter = [](DomEvent* event, const std::shared_ptr<CtxValue>& value) {};
  def.properties.emplace_back(std::move(current_target));

  PropertyDefine<DomEvent> params;
  params.name = "params";
  params.getter = [weak_scope](DomEvent* event) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      if (event == nullptr) {
        scope->GetContext()->ThrowException(tdf::base::unicode_string_view("nullptr event pointer"));
        return scope->GetContext()->CreateUndefined();
      }
      std::shared_ptr<tdf::base::DomValue> parameter = event->GetValue();
      std::shared_ptr<CtxValue> ctx_value = scope->GetContext()->CreateUndefined();
      if (parameter != nullptr) {
        ctx_value = scope->GetContext()->CreateCtxValue(parameter);
      }
      return ctx_value;
    }
    return nullptr;
  };
  params.setter = [](DomEvent* event, const std::shared_ptr<CtxValue>& value) {};
  def.properties.emplace_back(std::move(params));

  std::shared_ptr<InstanceDefine<DomEvent>> event = std::make_shared<InstanceDefine<DomEvent>>(def);
  return event;
}

}  // namespace hippy
