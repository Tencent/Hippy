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

#include "core/modules/ui_manager_module.h"

#include <set>
#include <tuple>

#include "core/modules/module_register.h"
#include "core/base/string_view_utils.h"
#include "core/task/javascript_task.h"
#include "dom/node_props.h"
#include "dom/dom_node.h"
#include "dom/dom_event.h"
#include "dom/dom_argument.h"

REGISTER_MODULE(UIManagerModule, CallUIFunction)
REGISTER_MODULE(UIManagerModule, SetContextName)

using DomValue = tdf::base::DomValue;
using DomArgument = hippy::dom::DomArgument;
using unicode_string_view = tdf::base::unicode_string_view;

using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using CallbackInfo = hippy::napi::CallbackInfo;

UIManagerModule::UIManagerModule() = default;

UIManagerModule::~UIManagerModule() = default;

void UIManagerModule::CallUIFunction(const CallbackInfo &info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  TDF_BASE_CHECK(context);

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

  std::unordered_map<std::string, std::shared_ptr<DomValue>> param;
  DomArgument param_value = *(context->ToDomArgument(info[2]));
  hippy::CallFunctionCallback cb = nullptr;
  bool flag = context->IsFunction(info[3]);
  if (flag) {
    auto func = info[3];
    std::weak_ptr<Ctx> weak_context = context;
    std::weak_ptr<CtxValue> weak_func = func;
    std::weak_ptr<JavaScriptTaskRunner> weak_runner = scope->GetTaskRunner();
    cb = [weak_context, func,
          weak_runner](const std::shared_ptr<DomArgument> &argument) -> void {
      auto runner = weak_runner.lock();
      if (runner) {
        std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
        task->callback = [weak_context, func, argument]() {
          auto context = weak_context.lock();
          if (!context) {
            return;
          }

          if (!func) {
            return;
          }

          DomValue value;
          bool flag = argument->ToObject(value);
          if (flag) {
            auto param = context->CreateCtxValue(
                std::make_shared<DomValue>(std::move(value)));
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
        runner->PostTask(task);
      }
    };
  }
  auto dom_manager_weak = scope->GetDomManager();
  std::vector<std::function<void()>> ops = {[dom_manager_weak, id, name, param_value, cb]() {
    if (!dom_manager_weak.expired()) {
      dom_manager_weak.lock()->CallFunction(static_cast<uint32_t>(id), name, param_value, cb);
    }
  }};
  TDF_BASE_CHECK(!dom_manager_weak.expired());
  dom_manager_weak.lock()->PostTask(hippy::dom::Scene(std::move(ops)));
}

void UIManagerModule::SetContextName(const hippy::napi::CallbackInfo &info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  TDF_BASE_CHECK(context);

#if TDF_SERVICE_ENABLED
  auto ctx_context_name = info[0];
  unicode_string_view unicode_context_name;
  bool flag = context->GetValueString(ctx_context_name, &unicode_context_name);
  if (scope->GetDevtoolsDataSource() && flag) {
    auto context_name = hippy::base::StringViewUtils::ToU8StdStr(unicode_context_name);
    scope->GetDevtoolsDataSource()->SetContextName(context_name);
  }
#endif
}
