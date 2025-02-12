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

#include "connector/js2ark.h"
#include <memory>
#include <js_native_api.h>
#include <js_native_api_types.h>
#include "oh_napi/ark_ts.h"
#include "oh_napi/data_holder.h"
#include "oh_napi/oh_napi_object.h"
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/oh_napi_task_runner.h"
#include "connector/bridge.h"
#include "driver/js_driver_utils.h"
#include "driver/scope.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "footstone/string_view.h"

namespace hippy {
inline namespace framework {
inline namespace bridge {

using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;
using JsDriverUtils = hippy::JsDriverUtils;
using byte_string = std::string;

static napi_env s_env = 0;

void InitBridge(napi_env env) {
  s_env = env;
}

void CallHost(CallbackInfo& info) {
  auto cb = [env = s_env](
      const std::shared_ptr<Scope>& scope,
      const string_view& module,
      const string_view& func,
      const string_view& cb_id,
      bool is_heap_buffer,
      const byte_string& buffer) {
    auto bridge = std::any_cast<std::shared_ptr<Bridge>>(scope->GetBridge());
    napi_ref object_ref = bridge->GetRef();
    std::u16string module_str = StringViewUtils::ConvertEncoding(module, string_view::Encoding::Utf16).utf16_value();
    std::u16string func_str = StringViewUtils::ConvertEncoding(func, string_view::Encoding::Utf16).utf16_value();
    std::u16string cb_id_str = StringViewUtils::ConvertEncoding(cb_id, string_view::Encoding::Utf16).utf16_value();

    void* new_buffer = malloc(buffer.size());
    FOOTSTONE_DCHECK(new_buffer != nullptr);
    if (!new_buffer) {
      FOOTSTONE_LOG(ERROR) << "CallHost cb, malloc fail, size = " << buffer.size();
      return;
    }
    memcpy(new_buffer, buffer.data(), buffer.size());
    auto buffer_pair = std::make_pair(reinterpret_cast<uint8_t*>(new_buffer), buffer.size());

    OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(env);
    taskRunner->RunAsyncTask([env, object_ref, module_str, func_str, cb_id_str, buffer_pair]() {
      ArkTS arkTs(env);
      std::vector<napi_value> args = {
        arkTs.CreateStringUtf16(module_str),
        arkTs.CreateStringUtf16(func_str),
        arkTs.CreateStringUtf16(cb_id_str),
        arkTs.CreateExternalArrayBuffer(buffer_pair.first, buffer_pair.second)
      };
      auto jsDriverObject = arkTs.GetObject(object_ref);
      jsDriverObject.Call("callNatives", args);
    });
  };
  JsDriverUtils::CallNative(info, cb);
}

}
}
}
