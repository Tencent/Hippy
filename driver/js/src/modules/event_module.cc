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

#include "driver/modules/event_module.h"

#include "dom/dom_event.h"
#include "dom/dom_node.h"
#include "driver/base/js_convert_utils.h"
#include "driver/modules/ui_manager_module.h"
#include "driver/scope.h"
#include "footstone/hippy_value.h"
#include "footstone/string_view_utils.h"

template <typename T>
using ClassTemplate = hippy::ClassTemplate<T>;

template <typename T>
using FunctionDefine = hippy::FunctionDefine<T>;

template <typename T>
using PropertyDefine = hippy::PropertyDefine<T>;

using CtxValue = hippy::napi::CtxValue;

namespace hippy {
inline namespace driver {
inline namespace module {

std::shared_ptr<DomEvent> DomEventWrapper::dom_event_ = nullptr;

std::shared_ptr<ClassTemplate<DomEvent>> MakeEventClassTemplate(
    const std::weak_ptr<Scope>& weak_scope) {
  using DomEvent = hippy::dom::DomEvent;
  ClassTemplate<DomEvent> class_template;
  class_template.name = "Event";
  class_template.constructor = [](size_t argument_count, const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<DomEvent> {
    auto event = DomEventWrapper::Get();
    DomEventWrapper::Release();
    return event;
  };

  // function
  FunctionDefine<DomEvent> stop_propagation;
  stop_propagation.name = "stopPropagation";
  stop_propagation.cb = [weak_scope](
      DomEvent* event, size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[])
      -> std::shared_ptr<CtxValue> {
    event->StopPropagation();
    FOOTSTONE_LOG(INFO) << "stop propagation" << std::endl;
    return nullptr;
  };
  class_template.functions.emplace_back(std::move(stop_propagation));

  // property type
  PropertyDefine<DomEvent> type;
  type.name = "type";
  type.getter = [weak_scope](DomEvent* event) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (scope) {
      if (event == nullptr) {
        scope->GetContext()->ThrowException(footstone::stringview::string_view("nullptr event pointer"));
        return scope->GetContext()->CreateUndefined();
      }
      std::string type = event->GetType();
      footstone::stringview::string_view string_view = footstone::stringview::string_view(type);
      std::shared_ptr<CtxValue> ctx_value = scope->GetContext()->CreateString(string_view);
      return ctx_value;
    }
    return nullptr;
  };
  type.setter = [](DomEvent* event, const std::shared_ptr<CtxValue>& value) {};
  class_template.properties.emplace_back(std::move(type));

  PropertyDefine<DomEvent> id;
  id.name = "id";
  id.getter = [weak_scope](DomEvent* event) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    if (!event) {
      scope->GetContext()->ThrowException(footstone::stringview::string_view("nullptr event pointer"));
      return nullptr;
    }
    auto weak_node = event->GetTarget();
    auto dom_node = weak_node.lock();
    FOOTSTONE_DCHECK(dom_node != nullptr);
    if (!dom_node) {
      scope->GetContext()->ThrowException(footstone::stringview::string_view("nullptr event node pointer"));
      return nullptr;
    }
    uint32_t id = dom_node->GetId();
    std::shared_ptr<CtxValue> ctx_value = scope->GetContext()->CreateNumber(id);
    return ctx_value;
  };
  id.setter = [](DomEvent* event, const std::shared_ptr<CtxValue>& value) {};
  class_template.properties.emplace_back(std::move(id));

  PropertyDefine<DomEvent> current_id;
  current_id.name = "currentId";
  current_id.getter = [weak_scope](DomEvent* event) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    if (!event) {
      scope->GetContext()->ThrowException(footstone::stringview::string_view("nullptr event pointer"));
      return nullptr;
    }
    auto weak_node = event->GetCurrentTarget();
    auto dom_node = weak_node.lock();
    FOOTSTONE_DCHECK(dom_node != nullptr);
    if (!dom_node) {
      scope->GetContext()->ThrowException(footstone::stringview::string_view("nullptr event node pointer"));
      return nullptr;
    }
    uint32_t current_id = dom_node->GetId();
    std::shared_ptr<CtxValue> ctx_value = scope->GetContext()->CreateNumber(current_id);
    return ctx_value;
  };
  current_id.setter = [](DomEvent* event, const std::shared_ptr<CtxValue>& value) {};
  class_template.properties.emplace_back(std::move(current_id));

  PropertyDefine<DomEvent> target;
  target.name = "target";
  target.getter = [weak_scope](DomEvent* event) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    if (!event) {
      scope->GetContext()->ThrowException(footstone::stringview::string_view("nullptr event pointer"));
      return nullptr;
    }
    auto weak_node = event->GetTarget();
    auto dom_node = weak_node.lock();
    FOOTSTONE_DCHECK(dom_node != nullptr);
    if (!dom_node) {
      scope->GetContext()->ThrowException(footstone::stringview::string_view("nullptr event node pointer"));
      return nullptr;
    }
    uint32_t target_id = dom_node->GetId();
    std::shared_ptr<CtxValue> ctx_value = scope->GetContext()->CreateNumber(target_id);
    return ctx_value;
  };
  target.setter = [](DomEvent* event, const std::shared_ptr<CtxValue>& value) {};
  class_template.properties.emplace_back(std::move(target));

  PropertyDefine<DomEvent> current_target;
  current_target.name = "currentTarget";
  current_target.getter = [weak_scope](DomEvent* event) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    if (!event) {
      scope->GetContext()->ThrowException(footstone::stringview::string_view("nullptr event pointer"));
      return nullptr;
    }
    auto weak_node = event->GetCurrentTarget();
    auto dom_node = weak_node.lock();
    FOOTSTONE_DCHECK(dom_node != nullptr);
    if (!dom_node) {
      scope->GetContext()->ThrowException(footstone::stringview::string_view("nullptr event node pointer"));
      return scope->GetContext()->CreateUndefined();
    }
    uint32_t current_target_id = dom_node->GetId();
    std::shared_ptr<CtxValue> ctx_value = scope->GetContext()->CreateNumber(current_target_id);
    return ctx_value;
  };
  current_target.setter = [](DomEvent* event, const std::shared_ptr<CtxValue>& value) {};
  class_template.properties.emplace_back(std::move(current_target));

  PropertyDefine<DomEvent> event_phase;
  event_phase.name = "eventPhase";
  event_phase.getter = [weak_scope](DomEvent* event) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    if (!event) {
      scope->GetContext()->ThrowException(footstone::stringview::string_view("nullptr event pointer"));
      return nullptr;
    }
    auto event_phase = event->GetEventPhase();
    uint8_t event_phase_number = static_cast<uint8_t>(event_phase);
    std::shared_ptr<CtxValue> ctx_value = scope->GetContext()->CreateNumber(event_phase_number);
    return ctx_value;
  };
  event_phase.setter = [](DomEvent* event, const std::shared_ptr<CtxValue>& value) {};
  class_template.properties.emplace_back(std::move(event_phase));

  PropertyDefine<DomEvent> params;
  params.name = "params";
  params.getter = [weak_scope](DomEvent* event) -> std::shared_ptr<CtxValue> {
    auto scope = weak_scope.lock();
    if (!scope)  {
      return nullptr;
    }
    if (!event) {
      scope->GetContext()->ThrowException(footstone::stringview::string_view("nullptr event pointer"));
      return nullptr;
    }
    std::shared_ptr<footstone::value::HippyValue> parameter = event->GetValue();
    std::shared_ptr<CtxValue> ctx_value = scope->GetContext()->CreateUndefined();
    if (parameter) {
      ctx_value = hippy::CreateCtxValue(scope->GetContext(), parameter);
    }
    return ctx_value;
  };
  params.setter = [](DomEvent* event, const std::shared_ptr<CtxValue>& value) {};
  class_template.properties.emplace_back(std::move(params));

  return std::make_shared<ClassTemplate<DomEvent>>(std::move(class_template));
}

} // namespace module
} // namespace driver
} // namespace hippy
