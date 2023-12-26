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

#include "connector/exception_handler.h"
#include "connector/bridge.h"
#include "footstone/string_view_utils.h"
#include <js_native_api.h>
#include <js_native_api_types.h>
#include "oh_napi/ark_ts.h"
#include "oh_napi/data_holder.h"
#include "oh_napi/oh_napi_object.h"
#include "oh_napi/oh_napi_register.h"
#include "oh_napi/oh_napi_task_runner.h"

namespace hippy {
inline namespace framework {

using StringViewUtils = footstone::stringview::StringViewUtils;

static napi_env s_env = 0;

void ExceptionHandler::Init(napi_env env) { s_env = env; }

void ExceptionHandler::ReportJsException(const std::any& bridge,
                                         const string_view& description,
                                         const string_view& stack) {
  FOOTSTONE_DLOG(INFO) << "ReportJsException begin";

  auto bridge_ptr = std::any_cast<std::shared_ptr<Bridge>>(bridge);
  napi_ref object_ref = bridge_ptr->GetRef();
  std::u16string exception_str = StringViewUtils::ConvertEncoding(description, string_view::Encoding::Utf16).utf16_value();
  std::u16string stack_trace_str = StringViewUtils::ConvertEncoding(stack, string_view::Encoding::Utf16).utf16_value();

  OhNapiTaskRunner *taskRunner = OhNapiTaskRunner::Instance(s_env);
  taskRunner->RunAsyncTask([env = s_env, object_ref, exception_str, stack_trace_str]() {
    ArkTS arkTs(env);
    std::vector<napi_value> args = {arkTs.CreateStringUtf16(exception_str),
                                    arkTs.CreateStringUtf16(stack_trace_str)};
    auto jsDriverObject = arkTs.GetObject(object_ref);
    jsDriverObject.Call("reportException", args);
  });

  FOOTSTONE_DLOG(INFO) << "ReportJsException end";
}

}
}
