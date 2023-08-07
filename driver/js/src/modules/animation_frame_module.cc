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

#include "driver/modules/animation_frame_module.h"

#include <string>

#include "driver/modules/module_register.h"
#include "driver/napi/js_ctx.h"
#include "driver/napi/js_ctx_value.h"
#include "driver/scope.h"
#include "footstone/string_view_utils.h"

using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;
using Ctx = hippy::Ctx;
using CallbackInfo = hippy::CallbackInfo;

namespace hippy {
inline namespace driver {
inline namespace module {

constexpr char kVSyncKey[] = "frameupdate";

GEN_INVOKE_CB(AnimationFrameModule, RequestAnimationFrame) // NOLINT(cert-err58-cpp)
GEN_INVOKE_CB(AnimationFrameModule, CancelAnimationFrame) // NOLINT(cert-err58-cpp)

void AnimationFrameModule::RequestAnimationFrame(hippy::napi::CallbackInfo &info, void* data) { // NOLINT(readability-convert-member-functions-to-static)
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
  auto context = scope->GetContext();
  FOOTSTONE_CHECK(context);

  if (!context->GetValueNumber(info[0], &frame_id_)) {
    info.GetExceptionValue()->Set(context, "The first argument must be int.");
    return;
  }

  auto dom_manager = scope->GetDomManager().lock();
  if (!dom_manager) {
    return;
  }

  auto root_node = scope->GetRootNode().lock();
  if (!root_node) {
    return;
  }

  enable_update_frame_ = true;

  if (has_event_listener_) {
    return;
  }
  has_event_listener_ = true;

  listener_id_ = hippy::dom::FetchListenerId();
  auto weak_this = weak_from_this();
  std::weak_ptr<Scope> weak_scope = scope;
  dom_manager->AddEventListener(root_node,
                                root_node->GetId(),
                                kVSyncKey,
                                listener_id_,
                                false,
                                [weak_this, weak_scope]
                                    (const std::shared_ptr<DomEvent>&) {
                                  auto frame_module = weak_this.lock();
                                  auto scope = weak_scope.lock();
                                  if(!frame_module || !scope) {
                                    return;
                                  }
                                  frame_module->UpdateFrame(scope);
                                });
  dom_manager->EndBatch(root_node);

  info.GetReturnValue()->SetUndefined();
}

void AnimationFrameModule::CancelAnimationFrame(hippy::napi::CallbackInfo &info, void* data) { // NOLINT(readability-convert-member-functions-to-static)
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
  auto context = scope->GetContext();
  FOOTSTONE_CHECK(context);

  auto dom_manager = scope->GetDomManager().lock();
  if (!dom_manager) {
    return;
  }

  auto root_node = scope->GetRootNode().lock();
  if (!root_node) {
    return;
  }

  dom_manager->RemoveEventListener(root_node, root_node->GetId(), kVSyncKey, listener_id_);
  dom_manager->EndBatch(root_node);

  has_event_listener_ = false;

  info.GetReturnValue()->SetUndefined();
}

std::shared_ptr<CtxValue> AnimationFrameModule::BindFunction(std::shared_ptr<Scope> scope,
                                                      std::shared_ptr<CtxValue>* rest_args) {
  auto context = scope->GetContext();
  auto object = context->CreateObject();

  auto key = context->CreateString("RequestAnimationFrame");
  auto wrapper = std::make_unique<hippy::napi::FunctionWrapper>(
      InvokeAnimationFrameModuleRequestAnimationFrame, nullptr);
  auto value = context->CreateFunction(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  key = context->CreateString("CancelAnimationFrame");
  wrapper = std::make_unique<hippy::napi::FunctionWrapper>(
      InvokeAnimationFrameModuleCancelAnimationFrame, nullptr);
  value = context->CreateFunction(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  return object;
}

void AnimationFrameModule::UpdateFrame(const std::shared_ptr<Scope>& scope) {
  if(!enable_update_frame_) {
    return;
  }
  enable_update_frame_ = false;

  std::shared_ptr<hippy::napi::Ctx> context = scope->GetContext();

#ifdef ANDROID
  std::shared_ptr<CtxValue> action_value = context->CreateString("callBack");
  auto param = context->CreateObject();
  auto result_key = context->CreateString("result");
  auto result_value = context->CreateNumber(0);
  context->SetProperty(param, result_key, result_value);
  auto module_name_key = context->CreateString("moduleName");
  auto module_name_value = context->CreateString("AnimationFrameModule");
  context->SetProperty(param, module_name_key, module_name_value);
  auto module_func_key = context->CreateString("moduleFunc");
  auto module_func_value = context->CreateString("requestAnimationFrame");
  context->SetProperty(param, module_func_key, module_func_value);
  auto frame_id_key = context->CreateString("frameId");
  auto frame_id_value = context->CreateNumber(frame_id_);
  context->SetProperty(param, frame_id_key, frame_id_value);
  std::shared_ptr<CtxValue> argv[] = {action_value, param};
  context->CallFunction(scope->GetBridgeObject(), context->GetGlobalObject(), 2, argv);
#elif defined __APPLE__
  auto global_object = context->GetGlobalObject();
  auto bridge_key = context->CreateString("__hpBatchedBridge");
  auto batchedbridge_value = context->GetProperty(global_object, bridge_key);
  if (batchedbridge_value) {
    std::shared_ptr<CtxValue> method_value = context->GetProperty(batchedbridge_value, "callFunctionReturnFlushedQueue");
    if (method_value && context->IsFunction(method_value)) {
      std::shared_ptr<CtxValue> function_params[3];
      function_params[0] = context->CreateString("AnimationFrameModule"); // module
      function_params[1] = context->CreateString("requestAnimationFrame"); // method
      std::shared_ptr<CtxValue> values[1] = { context->CreateNumber(frame_id_) };
      function_params[2] = context->CreateArray(1, values); // args
      context->CallFunction(method_value, context->GetGlobalObject(), 3, function_params);
    }
  }
#endif
}

}
}
}
