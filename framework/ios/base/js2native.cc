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

#include "js2native.h"

#include <memory>

#include "driver/napi/js_native_api_types.h"
#include "footstone/logging.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"

using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using string_view = footstone::stringview::string_view;
using string_view_utils = footstone::stringview::StringViewUtils;
using NativeFunction = hippy::napi::Ctx::NativeFunction;

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
constexpr char kNativeModules[] = "NativeModules";
constexpr char kModuleCallId[] = "moduleCallId";
constexpr char kType[] = "type";
constexpr char kStorageModule[] = "StorageModule";
constexpr char kMultiGet[] = "multiGet";

namespace hippy {
inline namespace framework {
inline namespace bridge {

bool NeedReject(const std::string& module_name, const std::string& method_name) {
  return !(module_name == kStorageModule || method_name == kMultiGet);
}

bool IsMeasureFunction(const std::string& module_name, const std::string& method_name) {
  if (module_name == kUiManagerModule &&
      (method_name == kMeasure || method_name == kMeasureInWindow || method_name == kMeasureInAppWindow)) {
    return true;
  }
  return false;
}

std::string ErrorMessage(const std::string& prefix, const std::string& module_name, const std::string& method_name) {
  return prefix + " " + module_name + '.' + method_name + "() not found";
}

void CallNative(const std::shared_ptr<Ctx>& ctx, const hippy::napi::CBCtxValueTuple& data_tuple) {
  if (data_tuple.count_ < 2) {
    auto error = ctx->CreateTypeError("callNative arguments length must be larger than 2");
    ctx->ThrowException(error);
    return;
  }
  auto args = data_tuple.arguments_;

  string_view native_module_name;
  ctx->GetValueString(args[0], &native_module_name);
  string_view u8_string = string_view_utils::CovertToUtf8(native_module_name, native_module_name.encoding());
  std::string module_name = footstone::StringViewUtils::ToStdString(u8_string.utf8_value());

  string_view native_method_name;
  ctx->GetValueString(args[1], &native_method_name);
  u8_string = string_view_utils::CovertToUtf8(native_method_name, native_method_name.encoding());
  std::string method_name = footstone::StringViewUtils::ToStdString(u8_string.utf8_value());

  // compatible for Hippy2.0
  if (IsMeasureFunction(module_name, method_name)) {
    auto global = ctx->GetGlobalObjVar(kGlobal);
    auto hippy = ctx->GetProperty(global, kHippy);
    auto document = ctx->GetProperty(hippy, kDocument);
    auto ui_function = ctx->GetProperty(document, kCallUIFunction);
    std::shared_ptr<CtxValue> argv[] = {args[2], args[1], ctx->CreateArray(0, nullptr), args[3]};
    ctx->CallFunction(ui_function, 4, argv);
    return;
  }

  auto global_proto = ctx->GetGlobalObjVar(kGlobalProto);
  auto native_modules = ctx->GetProperty(global_proto, kNativeModules);
  auto call_native_module = ctx->GetProperty(native_modules, native_module_name);
  auto call_module_method = ctx->GetProperty(call_native_module, native_method_name);
  if (!ctx->IsNullOrUndefined(call_module_method) && ctx->IsFunction(call_module_method)) {
    if (data_tuple.count_ > 2) {
      std::shared_ptr<CtxValue> params[data_tuple.count_ - 2];
      for (size_t i = 2; i < data_tuple.count_; i++) {
        params[i - 2] = args[i];
      }
      ctx->CallFunction(call_module_method, data_tuple.count_ - 2, params);
      return;
    } else {
      std::shared_ptr<CtxValue> params[1];
      params[0] = ctx->CreateUndefined();
      ctx->CallFunction(call_module_method, 1, params);
      return;
    }
  }

  std::string message = ErrorMessage("callNative Native", module_name, method_name);
  auto error = ctx->CreateTypeError(string_view(message));
  ctx->ThrowException(error);
  return;
}

std::shared_ptr<hippy::napi::CtxValue> CallNativeWithPromise(const std::shared_ptr<Ctx>& ctx,
                                                             const hippy::napi::CBCtxValueTuple& data_tuple) {
  if (data_tuple.count_ < 2) {
    auto error = ctx->CreateTypeError("callNativeWithPromise arguments length must be larger than 2");
    return ctx->CreateRejectPromise(error);
  }

  auto args = data_tuple.arguments_;

  string_view native_module_name;
  ctx->GetValueString(args[0], &native_module_name);
  string_view u8_string = string_view_utils::CovertToUtf8(native_module_name, native_module_name.encoding());
  std::string module_name = footstone::StringViewUtils::ToStdString(u8_string.utf8_value());

  string_view native_method_name;
  ctx->GetValueString(args[1], &native_method_name);
  u8_string = string_view_utils::CovertToUtf8(native_method_name, native_method_name.encoding());
  std::string method_name = footstone::StringViewUtils::ToStdString(u8_string.utf8_value());

  auto global_proto = ctx->GetGlobalObjVar(kGlobalProto);
  auto native_modules = ctx->GetProperty(global_proto, kNativeModules);
  auto call_native_module = ctx->GetProperty(native_modules, native_module_name);
  if (!ctx->IsNullOrUndefined(call_native_module)) {
    auto call_module_method = ctx->GetProperty(call_native_module, native_method_name);
    if (!ctx->IsNullOrUndefined(call_module_method)) {
      std::shared_ptr<std::vector<std::shared_ptr<CtxValue>>> param_list =
          std::make_shared<std::vector<std::shared_ptr<CtxValue>>>();
      for (size_t i = 2; i < data_tuple.count_; i++) {
        param_list->push_back(args[i]);
      }
      auto type_object = ctx->GetProperty(call_module_method, kType);
      if (ctx->IsString(type_object)) {
        string_view type_string_view;
        ctx->GetValueString(type_object, &type_string_view);
        if (type_string_view == u"promise") {
          return ctx->CallFunction(call_module_method, param_list->size(), &(*param_list)[0]);
        }
        bool need_reject = NeedReject(module_name, method_name);
        PromiseCallback callback = [ctx, need_reject, call_module_method, param_list](
                                       const std::shared_ptr<CtxValue>& resolve,
                                       const std::shared_ptr<CtxValue>& reject) {
          if (need_reject) {
            param_list->push_back(resolve);
          }
          param_list->push_back(resolve);
          ctx->CallFunction(call_module_method, param_list->size(), &(*param_list)[0]);
        };
        return ctx->CreatePromiseWithCallback(callback);
      }
    }
  }

  std::string message = ErrorMessage("callNativeWithPromise Native", module_name, method_name);
  auto error = ctx->CreateReferenceError(string_view(message));
  return ctx->CreateRejectPromise(error);
}

std::shared_ptr<hippy::napi::CtxValue> CallNativeWithCallbackId(const std::shared_ptr<Ctx>& ctx,
                                                                const hippy::napi::CBCtxValueTuple& data_tuple) {
  if (data_tuple.count_ < 3) {
    auto error = ctx->CreateTypeError("callNativeWithCallbackId arguments length must be larger than 3");
    ctx->ThrowException(error);
    return ctx->CreateUndefined();
  }
  auto args = data_tuple.arguments_;

  string_view native_module_name;
  ctx->GetValueString(args[0], &native_module_name);
  string_view u8_string = string_view_utils::CovertToUtf8(native_module_name, native_module_name.encoding());
  std::string module_name = footstone::StringViewUtils::ToStdString(u8_string.utf8_value());

  string_view native_method_name;
  ctx->GetValueString(args[1], &native_method_name);
  u8_string = string_view_utils::CovertToUtf8(native_module_name, native_module_name.encoding());
  std::string method_name = footstone::StringViewUtils::ToStdString(u8_string.utf8_value());

  bool auto_delete = false;
  ctx->GetValueBoolean(args[2], &auto_delete);

  auto global_proto = ctx->GetGlobalObjVar(kGlobalProto);
  auto native_modules = ctx->GetProperty(global_proto, kNativeModules);
  auto call_native_module = ctx->GetProperty(native_modules, native_module_name);
  if (!ctx->IsNullOrUndefined(call_native_module)) {
    auto call_module_method = ctx->GetProperty(call_native_module, native_method_name);
    if (!ctx->IsNullOrUndefined(call_module_method)) {
      if (data_tuple.count_ == 3) {
        if (auto_delete) {
          std::shared_ptr<CtxValue> param_list[1];
          param_list[0] = ctx->CreateObject({{"notDelete", ctx->CreateBoolean(true)}});
          return ctx->CallFunction(call_module_method, 1, param_list);
        }
        return ctx->CallFunction(call_module_method, 0, nullptr);
      } else {
        std::vector<std::shared_ptr<CtxValue>> param_list;
        auto module_call_id = ctx->GetProperty(global_proto, kModuleCallId);
        int32_t current_call_id;
        ctx->GetValueNumber(module_call_id, &current_call_id);
        ctx->SetProperty(global_proto, kModuleCallId, ctx->CreateNumber(current_call_id + 1), PropertyAttribute::None);
        if (!auto_delete) {
          auto not_delete = ctx->CreateObject({{"notDelete", ctx->CreateBoolean(true)}});
          param_list.push_back(not_delete);
        }

        for (size_t i = 3; i < data_tuple.count_; ++i) {
          param_list.push_back(args[i]);
        }
        param_list.push_back(ctx->CreateNumber(current_call_id));
        auto native_param = ctx->CreateArray(param_list.size(), &param_list[0]);
        std::shared_ptr<CtxValue> call_param[2];
        call_param[0] = call_module_method;
        call_param[1] = native_param;
        ctx->CallFunction(call_module_method, 2, call_param);
        return ctx->CreateNumber(current_call_id);
      }
    }
  }

  std::string message = ErrorMessage("callNativeWithCallbackId Native", module_name, method_name);
  auto error = ctx->CreateReferenceError(string_view(message));
  ctx->ThrowException(error);
  return ctx->CreateUndefined();
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

  NativeFunction call_native = [ctx](void* data) -> std::shared_ptr<hippy::napi::CtxValue> {
    hippy::napi::CBCtxValueTuple* cb_tuple = reinterpret_cast<hippy::napi::CBCtxValueTuple*>(data);
    CallNative(ctx, *cb_tuple);
    return ctx->CreateBoolean(true);
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

  NativeFunction remove_native_callback = [ctx](void* data) { return ctx->CreateUndefined(); };
  ctx->RegisterFunction(bridge, kRemoveNativeCallback, remove_native_callback, nullptr);
  return true;
}

}  // namespace bridge
}  // namespace framework
}  // namespace hippy
