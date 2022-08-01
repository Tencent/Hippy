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

#include "driver/modules/ui_manager_module.h"

#include <set>
#include <tuple>

#include "driver/modules/module_register.h"
#include "dom/dom_argument.h"
#include "dom/dom_event.h"
#include "dom/dom_node.h"
#include "dom/node_props.h"
#include "footstone/task.h"

REGISTER_MODULE(UIManagerModule, CallUIFunction)

using HippyValue = footstone::value::HippyValue;
using DomArgument = hippy::dom::DomArgument;
using unicode_string_view = footstone::stringview::unicode_string_view;
using TaskRunner = footstone::runner::TaskRunner;

using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using CallbackInfo = hippy::napi::CallbackInfo;

UIManagerModule::UIManagerModule() = default;

UIManagerModule::~UIManagerModule() = default;

void UIManagerModule::CallUIFunction(const CallbackInfo &info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  FOOTSTONE_CHECK(context);

  int32_t id = 0;
  auto id_value = context->ToDomValue(info[0]);
  if (id_value->IsNumber()) {
    id = static_cast<int32_t>(id_value->ToDoubleChecked());
  }

  std::string name;
  auto name_value = context->ToDomValue(info[1]);
  if (name_value->IsString()) {
    name = name_value->ToStringChecked();
  }

  std::unordered_map<std::string, std::shared_ptr<HippyValue>> param;
  DomArgument param_value = *(context->ToDomArgument(info[2]));
  hippy::CallFunctionCallback cb = nullptr;
  bool flag = context->IsFunction(info[3]);
  if (flag) {
    auto func = info[3];
    std::weak_ptr<Ctx> weak_context = context;
    std::weak_ptr<CtxValue> weak_func = func;
    std::weak_ptr<TaskRunner> weak_runner = scope->GetTaskRunner();
    cb = [weak_context, func, weak_runner](const std::shared_ptr<DomArgument> &argument) -> void {
      auto runner = weak_runner.lock();
      if (runner) {
        auto cb = [weak_context, func, argument]() {
          auto context = weak_context.lock();
          if (!context) {
            return;
          }

          if (!func) {
            return;
          }

          HippyValue value;
          bool flag = argument->ToObject(value);
          if (flag) {
            auto param = context->CreateCtxValue(
                std::make_shared<HippyValue>(std::move(value)));
            if (param) {
              const std::shared_ptr<CtxValue> argus[] = {param};
              context->CallFunction(func, 1, argus);
            } else {
              const std::shared_ptr<CtxValue> argus[] = {};
              context->CallFunction(func, 0, argus);
            }
            return;
          } else {
            context->ThrowException(unicode_string_view("param ToObject failed"));
          }
        };
        runner->PostTask(std::move(cb));
      }
    };
  }
  auto dom_manager = scope->GetDomManager().lock();
  if (dom_manager) {
    dom_manager->CallFunction(scope->GetRootNode(), static_cast<uint32_t>(id), name, param_value, cb);
  }

}
