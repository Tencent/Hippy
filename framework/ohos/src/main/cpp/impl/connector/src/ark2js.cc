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

#include "connector/ark2js.h"
#include <utility>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include "oh_napi/ark_ts.h"
#include "oh_napi/data_holder.h"
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/oh_napi_task_runner.h"
#include "vfs/uri_loader.h"
#include "driver/js_driver_utils.h"
#include "footstone/string_view_utils.h"

using string_view = footstone::stringview::string_view;
using byte_string = std::string;
using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using StringViewUtils = footstone::stringview::StringViewUtils;
using CALLFUNCTION_CB_STATE = hippy::CALL_FUNCTION_CB_STATE;
using V8BridgeUtils = hippy::JsDriverUtils;

namespace hippy {
inline namespace framework {
inline namespace bridge {

static napi_value CallFunction(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info);
  uint32_t scope_id = static_cast<uint32_t>(arkTs.GetInteger(args[0]));
  auto action_name = string_view(arkTs.GetString(args[1]));
  auto callback_ref = arkTs.CreateReference(args[2]);
  void *buffer_data = NULL;
  size_t byte_length = 0;
  if (arkTs.IsArrayBuffer(args[3])) {
    arkTs.GetArrayBufferInfo(args[3], &buffer_data, &byte_length);
  }
  byte_string buffer;
  if (buffer_data && byte_length > 0) {
    buffer.assign(static_cast<char*>(buffer_data), byte_length);
  }

  std::any scope_object;
  auto flag = hippy::global_data_holder.Find(scope_id, scope_object);
  if (!flag)  {
    FOOTSTONE_LOG(ERROR) << "scope can not found, scope id = " << scope_id << "!!!";
    return arkTs.GetUndefined();
  }
  auto scope = std::any_cast<std::shared_ptr<Scope>>(scope_object);
  JsDriverUtils::CallJs(
    action_name, scope,
    [env, callback_ref](CALLFUNCTION_CB_STATE state, const string_view &msg) {
      CallArkMethod(env, callback_ref, static_cast<int>(state), msg);
    },
    std::move(buffer),
    []() {});
  return arkTs.GetUndefined();
}

REGISTER_OH_NAPI("JsDriver", "JsDriver_CallFunction", CallFunction)

void CallArkMethod(napi_env env, napi_ref callback_ref, int value, const string_view &msg) {
  std::u16string msg_str = StringViewUtils::ConvertEncoding(msg, string_view::Encoding::Utf16).utf16_value();
  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(env);
  taskRunner->RunAsyncTask([env, callback_ref, value, msg_str]() {
    ArkTS arkTs(env);
    std::vector<napi_value> args = {
      arkTs.CreateInt(value),
      arkTs.CreateStringUtf16(msg_str)
    };
    auto callback = arkTs.GetReferenceValue(callback_ref);
    arkTs.Call(callback, args);
  });
}

}
}
}
