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

#include <js_native_api.h>
#include <js_native_api_types.h>
#include "oh_napi/oh_napi_object.h"
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/oh_napi_task_runner.h"
#include "oh_napi/ark_ts.h"
#include "footstone/check.h"

using OhNapiTaskRunner = hippy::OhNapiTaskRunner;

static bool s_is_initialized_ = false;

static napi_value SetNativeLogHandler(napi_env env, napi_callback_info info) {
  ArkTS arkTs(env);
  auto args = arkTs.GetCallbackArgs(info, 1);
  auto ts_log_adapter = args[0];
  auto ts_log_adapter_ref = arkTs.CreateReference(ts_log_adapter);

  if (!s_is_initialized_) {
    footstone::log::LogMessage::InitializeDelegate([env, ts_log_adapter_ref](
        const std::ostringstream& stream,
        footstone::log::LogSeverity severity) {
      auto msg = stream.str();
      OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(env);
      taskRunner->RunAsyncTask([env, ts_log_adapter_ref, severity, msg]() {
        ArkTS arkTs(env);
        std::vector<napi_value> args = {
          arkTs.CreateInt(severity), // level
          arkTs.CreateString("HippyLog"), // tag
          arkTs.CreateString(msg), // msg
        };
        auto delegateObject = arkTs.GetObject(ts_log_adapter_ref);
        delegateObject.Call("onReceiveLogMessage", args);
      });
    });
    s_is_initialized_ = true;
  }

  return arkTs.GetUndefined();
}

REGISTER_OH_NAPI("Entry", "Entry_SetNativeLogHandler", SetNativeLogHandler)
