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
#include "driver/base/js_convert_utils.h"
#include "dom/dom_argument.h"
#include "dom/dom_event.h"
#include "dom/dom_node.h"
#include "dom/node_props.h"
#include "footstone/task.h"

using HippyValue = footstone::value::HippyValue;
using DomArgument = hippy::dom::DomArgument;
using string_view = footstone::stringview::string_view;
using TaskRunner = footstone::runner::TaskRunner;

using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using CallbackInfo = hippy::napi::CallbackInfo;

namespace hippy {
inline namespace driver {
inline namespace module {

GEN_INVOKE_CB(UIManagerModule, CallUIFunction)

void UIManagerModule::CallUIFunction(CallbackInfo& info, void* data) {
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
  auto context = scope->GetContext();
  FOOTSTONE_CHECK(context);

  int32_t id = 0;
  auto id_value = hippy::ToDomValue(context, info[0]);
  if (id_value->IsNumber()) {
    id = static_cast<int32_t>(id_value->ToDoubleChecked());
  }

  std::string name;
  auto name_value = hippy::ToDomValue(context, info[1]);
  if (name_value->IsString()) {
    name = name_value->ToStringChecked();
  }

  std::unordered_map<std::string, std::shared_ptr<HippyValue>> param;
  DomArgument param_value = *(hippy::ToDomArgument(context, info[2]));
  hippy::CallFunctionCallback cb = nullptr;
  bool flag = context->IsFunction(info[3]);
  if (flag) {
    auto function = info[3];
    std::weak_ptr<Scope> weak_scope = scope;
    std::weak_ptr<CtxValue> weak_function = function;
    auto callback_id = scope->AddCallUIFunctionCallback(function);
    cb = [weak_scope, weak_function, callback_id](const std::shared_ptr<DomArgument> &argument) -> void {
      auto scope = weak_scope.lock();
      if (!scope) {
        return;
      }
      auto cb = [weak_scope, weak_function, argument, callback_id]() {
        auto scope  = weak_scope.lock();
        if (!scope) {
          return;
        }

        auto function = weak_function.lock();
        if (!function) {
          return;
        }

        auto context = scope->GetContext();
        HippyValue value;
        bool flag = argument->ToObject(value);
        if (flag) {
          auto param = hippy::CreateCtxValue(
              context, std::make_shared<HippyValue>(std::move(value)));
          if (param) {
            const std::shared_ptr<CtxValue> argus[] = {param};
            context->CallFunction(function, context->GetGlobalObject(), 1, argus);
          } else {
            const std::shared_ptr<CtxValue> argus[] = {};
            context->CallFunction(function, context->GetGlobalObject(), 0, argus);
          }
        } else {
          context->ThrowException(string_view("param ToObject failed"));
        }
        scope->removeCallUIFunctionCallback(callback_id);
      };
      auto runner = scope->GetTaskRunner();
      FOOTSTONE_CHECK(runner);
      runner->PostTask(std::move(cb));
    };
  }
  auto dom_manager = scope->GetDomManager().lock();
  if (!dom_manager) {
    return;
  }
  dom_manager->CallFunction(scope->GetRootNode(), static_cast<uint32_t>(id), name, param_value, cb);
}

std::shared_ptr<CtxValue> UIManagerModule::BindFunction(std::shared_ptr<Scope> scope,
                                                         std::shared_ptr<CtxValue> rest_args[]) {
  auto context = scope->GetContext();
  auto object = context->CreateObject();

  auto key = context->CreateString("CallUIFunction");
  auto wrapper = std::make_unique<hippy::napi::FunctionWrapper>(InvokeUIManagerModuleCallUIFunction, nullptr);
  auto value = context->CreateFunction(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  return object;
}

}
}
}

