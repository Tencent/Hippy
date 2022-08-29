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

#include "bridge/js2native.h"

#include <memory>

#include "driver/napi/js_native_api_types.h"
#include "footstone/logging.h"

constexpr char kHippy[] = "Hippy";
constexpr char kBridge[] = "bridge";
constexpr char kGlobal[] = "global";
constexpr char kDocument[] = "document";
constexpr char kHippyCallNatives[] = "hippyCallNatives";
constexpr char kCallUIFunction[] = "callUIFunction";

constexpr char kCallNative[] = "callNative";
constexpr char kCallNativeWithPromise[] = "callNativeWithPromise";
constexpr char kCallNativeWithCallbackId[] = "callNativeWithCallbackId";
constexpr char kRemoveNativeCallback[] = "removeNativeCallback";

constexpr char kUiManagerModule[] = "UIManagerModule";
constexpr char kMeasure[] = "measure";
constexpr char kMeasureInWindow[] = "measureInWindow";
constexpr char kMeasureInAppWindow[] = "measureInAppWindow";
constexpr char kGlobalProto[] = "__GLOBAL__";
constexpr char kModuleCallId[] = "moduleCallId";
constexpr char kModuleCallList[] = "moduleCallList";
constexpr char kType[] = "type";

using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using string_view = footstone::stringview::string_view;
using NativeFunction = hippy::napi::Ctx::NativeFunction;

namespace hippy {
inline namespace framework {
inline namespace bridge {

bool IsMeasureFunction(const std::string& module_name, const std::string& method_name) {
  if (module_name == kUiManagerModule &&
      (method_name == kMeasure || method_name == kMeasureInWindow || method_name == kMeasureInAppWindow)) {
    return true;
  }
  return false;
}

void CallNative(const std::shared_ptr<Ctx>& ctx, const hippy::napi::CBCtxValueTuple& data_tuple) {
  auto global = ctx->GetGlobalObjVar(kGlobal);
  if (ctx->IsNullOrUndefined(global)) {
    auto error = ctx->CreateTypeError("global not defined");
    ctx->ThrowException(error);
    return;
  }

  auto call_native_function = ctx->GetProperty(global, kHippyCallNatives);
  if (ctx->IsNullOrUndefined(call_native_function)) {
    auto error = ctx->CreateTypeError("hippyCallNatives not defined");
    ctx->ThrowException(error);
    return;
  }

  if (data_tuple.count_ < 2) {
    auto error = ctx->CreateTypeError("callNative arguments length must be larger than 2");
    ctx->ThrowException(error);
    return;
  }
  auto args = data_tuple.arguments_;

  string_view native_module_name;
  ctx->GetValueString(args[0], &native_module_name);
  std::string module_name = native_module_name.latin1_value();

  string_view native_method_name;
  ctx->GetValueString(args[1], &native_method_name);
  std::string method_name = native_method_name.latin1_value();

  // compatible for Hippy2.0
  if (IsMeasureFunction(module_name, method_name)) {
    auto hippy = ctx->GetProperty(global, kHippy);
    auto document = ctx->GetProperty(hippy, kDocument);
    auto ui_function = ctx->GetProperty(document, kCallUIFunction);
    std::shared_ptr<CtxValue> argv[] = {args[2], args[1], ctx->CreateArray(0, nullptr), args[3]};
    ctx->CallFunction(ui_function, 4, argv);
    return;
  }

  auto global_proto = ctx->GetGlobalObjVar(kGlobalProto);
  auto module_call_id = ctx->GetProperty(global_proto, kModuleCallId);
  int32_t current_call_id;
  ctx->GetValueNumber(module_call_id, &current_call_id);
  ctx->SetProperty(global_proto, kModuleCallId, ctx->CreateNumber(current_call_id + 1), PropertyAttribute::None);

  bool has_callback_function = false;
  int32_t call_id = -1;
  std::vector<std::shared_ptr<CtxValue>> param_vector;

  for (size_t i = 2; i < data_tuple.count_; i++) {
    if (ctx->IsFunction(args[i]) && !has_callback_function) {
      has_callback_function = true;
      auto module_call_list = ctx->GetProperty(global_proto, kModuleCallList);
      std::unordered_map<string_view, std::shared_ptr<CtxValue>> callback_object = {
          {"cb", args[i]}, {"type", ctx->CreateNumber(0)}};
      ctx->SetProperty(module_call_list, string_view(std::to_string(current_call_id)),
                       ctx->CreateObject(callback_object), PropertyAttribute::None);
    } else {
      param_vector.push_back(args[i]);
    }
  }
  std::shared_ptr<CtxValue> param_list[param_vector.size()];
  for (size_t i = 0; i < param_vector.size(); i++) {
    param_list[i] = param_vector[i];
  }

  if (has_callback_function) {
    call_id = current_call_id;
  }

  std::shared_ptr<CtxValue> argv[] = {args[0], args[1], ctx->CreateString(string_view(std::to_string(call_id))),
                                      ctx->CreateArray(param_vector.size(), param_list)};
  ctx->CallFunction(call_native_function, 4, argv);
}

std::shared_ptr<hippy::napi::CtxValue> CallNativeWithPromise(const std::shared_ptr<Ctx>& ctx,
                                                             const hippy::napi::CBCtxValueTuple& data_tuple) {
  auto global = ctx->GetGlobalObjVar(kGlobal);
  if (ctx->IsNullOrUndefined(global)) {
    auto error = ctx->CreateTypeError("global not defined");
    return ctx->CreateRejectPromise(error);
  }

  auto call_native_function = ctx->GetProperty(global, kHippyCallNatives);
  if (ctx->IsNullOrUndefined(call_native_function)) {
    auto error = ctx->CreateTypeError("hippyCallNatives not defined");
    return ctx->CreateRejectPromise(error);
  }

  if (data_tuple.count_ < 2) {
    auto error = ctx->CreateTypeError("callNativeWithPromise arguments length must be larger than 2");
    return ctx->CreateRejectPromise(error);
  }

  PromiseCallback callback = [ctx, data_tuple](const std::shared_ptr<CtxValue>& resolve,
                                               const std::shared_ptr<CtxValue>& reject) {
    auto args = data_tuple.arguments_;

    string_view native_module_name;
    ctx->GetValueString(args[0], &native_module_name);
    std::string module_name = native_module_name.latin1_value();

    string_view native_method_name;
    ctx->GetValueString(args[1], &native_method_name);
    std::string method_name = native_method_name.latin1_value();

    auto global_proto = ctx->GetGlobalObjVar(kGlobalProto);
    auto module_call_id = ctx->GetProperty(global_proto, kModuleCallId);
    int32_t current_call_id;
    ctx->GetValueNumber(module_call_id, &current_call_id);
    ctx->SetProperty(global_proto, kModuleCallId, ctx->CreateNumber(current_call_id + 1), PropertyAttribute::None);

    bool has_callback_function = false;
    std::vector<std::shared_ptr<CtxValue>> param_vector;

    for (size_t i = 2; i < data_tuple.count_; i++) {
      if (ctx->IsFunction(args[i]) && !has_callback_function) {
        has_callback_function = true;
        auto module_call_list = ctx->GetProperty(global_proto, kModuleCallList);
        std::unordered_map<string_view, std::shared_ptr<CtxValue>> callback_object = {
            {"reject", reject}, {"cb", args[i]}, {"type", ctx->CreateNumber(0)}};
        ctx->SetProperty(module_call_list, string_view(std::to_string(current_call_id)),
                         ctx->CreateObject(callback_object), PropertyAttribute::None);
      } else {
        param_vector.push_back(args[i]);
      }
    }
    std::shared_ptr<CtxValue> param_list[param_vector.size()];
    for (size_t i = 0; i < param_vector.size(); i++) {
      param_list[i] = param_vector[i];
    }

    if (!has_callback_function) {
      auto module_call_list = ctx->GetProperty(global_proto, kModuleCallList);
      std::unordered_map<string_view, std::shared_ptr<CtxValue>> callback_object = {
          {"reject", reject}, {"cb", resolve}, {"type", ctx->CreateNumber(0)}};
      ctx->SetProperty(module_call_list, string_view(std::to_string(current_call_id)),
                       ctx->CreateObject(callback_object), PropertyAttribute::None);
    }

    auto global = ctx->GetGlobalObjVar(kGlobal);
    auto call_native_function = ctx->GetProperty(global, kHippyCallNatives);
    std::shared_ptr<CtxValue> argv[] = {args[0], args[1],
                                        ctx->CreateString(string_view(std::to_string(current_call_id))),
                                        ctx->CreateArray(param_vector.size(), param_list)};
    ctx->CallFunction(call_native_function, 4, argv);
  };
  return ctx->CreatePromiseWithCallback(callback);
}

std::shared_ptr<hippy::napi::CtxValue> CallNativeWithCallbackId(const std::shared_ptr<Ctx>& ctx,
                                                                const hippy::napi::CBCtxValueTuple& data_tuple) {
  auto global = ctx->GetGlobalObjVar(kGlobal);
  if (ctx->IsNullOrUndefined(global)) {
    auto error = ctx->CreateTypeError("global not defined");
    ctx->ThrowException(error);
    return ctx->CreateUndefined();
  }

  auto call_native_function = ctx->GetProperty(global, kHippyCallNatives);
  if (ctx->IsNullOrUndefined(call_native_function)) {
    auto error = ctx->CreateTypeError("hippyCallNatives not defined");
    ctx->ThrowException(error);
    return ctx->CreateUndefined();
  }

  if (data_tuple.count_ < 3) {
    auto error = ctx->CreateTypeError("callNativeWithCallbackId arguments length must be larger than 3");
    ctx->ThrowException(error);
    return ctx->CreateUndefined();
  }
  auto args = data_tuple.arguments_;

  string_view native_module_name;
  ctx->GetValueString(args[0], &native_module_name);
  std::string module_name = native_module_name.latin1_value();

  string_view native_method_name;
  ctx->GetValueString(args[1], &native_method_name);
  std::string method_name = native_method_name.latin1_value();

  bool auto_delete = false;
  ctx->GetValueBoolean(args[2], &auto_delete);

  auto global_proto = ctx->GetGlobalObjVar(kGlobalProto);
  auto module_call_id = ctx->GetProperty(global_proto, kModuleCallId);
  int32_t current_call_id;
  ctx->GetValueNumber(module_call_id, &current_call_id);
  ctx->SetProperty(global_proto, kModuleCallId, ctx->CreateNumber(current_call_id + 1), PropertyAttribute::None);

  bool has_callback_function = false;
  std::vector<std::shared_ptr<CtxValue>> param_vector;

  for (size_t i = 3; i < data_tuple.count_; i++) {
    if (ctx->IsFunction(args[i]) && !has_callback_function) {
      has_callback_function = true;
      auto module_call_list = ctx->GetProperty(global_proto, kModuleCallList);

      std::unordered_map<string_view, std::shared_ptr<CtxValue>> callback_object = {
          {"cb", args[i]}, {"type", ctx->CreateNumber(auto_delete ? 1 : 2)}};
      ctx->SetProperty(module_call_list, string_view(std::to_string(current_call_id)),
                       ctx->CreateObject(callback_object), PropertyAttribute::None);
    } else {
      param_vector.push_back(args[i]);
    }
  }
  std::shared_ptr<CtxValue> param_list[param_vector.size()];
  for (size_t i = 0; i < param_vector.size(); i++) {
    param_list[i] = param_vector[i];
  }

  std::shared_ptr<CtxValue> argv[] = {args[0], args[1],
                                      ctx->CreateString(string_view(std::to_string(current_call_id))),
                                      ctx->CreateArray(param_vector.size(), param_list)};
  ctx->CallFunction(call_native_function, 4, argv);
  return ctx->CreateNumber(current_call_id);
}

void RemoveNativeCallback(const std::shared_ptr<Ctx>& ctx, const hippy::napi::CBCtxValueTuple& data_tuple) {
  if (data_tuple.count_ != 1) {
    auto error = ctx->CreateTypeError("removeNativeCallback invalid arguments, argument length is not 1");
    ctx->ThrowException(error);
    return;
  }
  auto args = data_tuple.arguments_;

  bool ret = ctx->IsNumber(args[0]);
  if (!ret) {
    auto error = ctx->CreateTypeError("removeNativeCallback invalid arguments, call id is not a number");
    ctx->ThrowException(error);
    return;
  }
  int32_t call_id;
  ret = ctx->GetValueNumber(args[0], &call_id);
  if (!ret) {
    auto error = ctx->CreateTypeError("removeNativeCallback invalid arguments, get call id error");
    ctx->ThrowException(error);
    return;
  }

  auto global = ctx->GetGlobalObjVar(kGlobal);
  if (ctx->IsNullOrUndefined(global)) {
    auto error = ctx->CreateTypeError("removeNativeCallback global not defined");
    ctx->ThrowException(error);
    return;
  }

  auto module_call_list = ctx->GetProperty(global, kModuleCallList);
  if (ctx->IsNullOrUndefined(module_call_list)) {
    auto error = ctx->CreateReferenceError("removeNativeCallback moduleCallList not defined");
    ctx->ThrowException(error);
    return;
  }

  auto callback_object = ctx->GetProperty(module_call_list, string_view(std::to_string(call_id)));
  if (ctx->IsObject(callback_object)) {
    auto type_object = ctx->GetProperty(callback_object, kType);
    if (ctx->IsNumber(type_object)) {
      int32_t type_value;
      ctx->GetValueNumber(type_object, &type_value);
      if (type_value == 1 || type_value == 2) {
        ctx->DeleteProperty(module_call_list, string_view(std::to_string(call_id)));
      }
    }
  }
}

bool Js2Native::Run(std::shared_ptr<Scope> scope) {
  std::shared_ptr<Ctx> ctx = scope->GetContext();
  auto hippy = ctx->GetGlobalObjVar(kHippy);
  if (ctx->IsNullOrUndefined(hippy)) {
    FOOTSTONE_DLOG(INFO) << "Js To Native Hippy Object is null or undefined.";
    return false;
  }

  auto bridge = ctx->GetProperty(hippy, kBridge);
  if (ctx->IsNullOrUndefined(bridge)) {
    FOOTSTONE_DLOG(INFO) << "Js To Native Bridge Object is null or undefined.";
    return false;
  }

  RegisterFunction call_native = [ctx](void* data) {
    hippy::napi::CBCtxValueTuple* cb_tuple = reinterpret_cast<hippy::napi::CBCtxValueTuple*>(data);
    CallNative(ctx, *cb_tuple);
  };
  ctx->RegisterFunction(bridge, kCallNative, call_native, nullptr);

  NativeFunction call_native_with_promise = [ctx](void* data) -> std::shared_ptr<hippy::napi::CtxValue> {
    hippy::napi::CBCtxValueTuple* cb_tuple = reinterpret_cast<hippy::napi::CBCtxValueTuple*>(data);
    return CallNativeWithPromise(ctx, *cb_tuple);
  };
  ctx->RegisterFunction(bridge, kCallNativeWithPromise, call_native_with_promise, nullptr);

  NativeFunction call_native_with_callback_id = [ctx](void* data) -> std::shared_ptr<hippy::napi::CtxValue> {
    hippy::napi::CBCtxValueTuple* cb_tuple = reinterpret_cast<hippy::napi::CBCtxValueTuple*>(data);
    return CallNativeWithCallbackId(ctx, *cb_tuple);
  };
  ctx->RegisterFunction(bridge, kCallNativeWithCallbackId, call_native_with_callback_id, nullptr);

  RegisterFunction remove_native_callback = [ctx](void* data) {
    hippy::napi::CBCtxValueTuple* cb_tuple = reinterpret_cast<hippy::napi::CBCtxValueTuple*>(data);
    RemoveNativeCallback(ctx, *cb_tuple);
  };
  ctx->RegisterFunction(bridge, kRemoveNativeCallback, remove_native_callback, nullptr);
  return true;
}

}  // namespace bridge
}  // namespace framework
}  // namespace hippy
