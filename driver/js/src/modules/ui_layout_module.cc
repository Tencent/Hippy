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

#include "driver/modules/ui_layout_module.h"

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

GEN_INVOKE_CB(LayoutModule, ResetLayoutCache)

void LayoutModule::ResetLayoutCache(CallbackInfo& info, void* data) {
  std::any slot_any = info.GetSlot();
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(&slot_any));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
  if (!scope) {
    return;
  }
  auto root_node = scope->GetRootNode().lock();
  if (root_node != nullptr) {
    root_node->ResetLayoutCache();
  }
}

std::shared_ptr<CtxValue> LayoutModule::BindFunction(std::shared_ptr<Scope> scope,
                                                         std::shared_ptr<CtxValue> rest_args[]) {
  auto context = scope->GetContext();
  auto object = context->CreateObject();

  auto key = context->CreateString("ResetLayoutCache");
  auto wrapper = std::make_unique<hippy::napi::FunctionWrapper>(InvokeLayoutModuleResetLayoutCache, nullptr);
  auto value = context->CreateFunction(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  return object;
}

}
}
}

