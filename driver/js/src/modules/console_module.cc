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

#include "driver/modules/console_module.h"

#include <string>

#include "driver/modules/module_register.h"
#include "driver/napi/js_ctx.h"
#include "driver/napi/js_ctx_value.h"
#include "driver/scope.h"
#include "footstone/logging.h"
#include "footstone/string_view_utils.h"

using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;
using Ctx = hippy::Ctx;
using CallbackInfo = hippy::CallbackInfo;

namespace {

string_view EscapeMessage(const string_view& str_view) {
  std::string u8_str = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(
      str_view, string_view::Encoding::Utf8).utf8_value());
  size_t len = u8_str.length();
  std::string ret;
  for (size_t i = 0; i < len; i++) {
    auto c = u8_str[i];
    ret += c;
    if (c == '%') {
      ret += '%';
    }
  }

  return string_view(ret);
}

}  // namespace

namespace hippy {
inline namespace driver {
inline namespace module {

GEN_INVOKE_CB(ConsoleModule, Log) // NOLINT(cert-err58-cpp)

void ConsoleModule::Log(hippy::napi::CallbackInfo &info, void* data) { // NOLINT(readability-convert-member-functions-to-static)
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  FOOTSTONE_CHECK(scope);
  auto context = scope->GetContext();
  FOOTSTONE_CHECK(context);

  string_view message;
  if (!context->GetValueString(info[0], &message)) {
    info.GetExceptionValue()->Set(context,
                                  "The first argument must be string.");
    return;
  }

  string_view view_msg = EscapeMessage(message);
  if (info.Length() == 1) {
    FOOTSTONE_LOG(INFO) << view_msg;
  } else {
    string_view view_type;
    if (!context->GetValueString(info[1], &view_type) ||
        StringViewUtils::IsEmpty(view_type)) {
      info.GetExceptionValue()->Set(
          context, "The second argument must be non-empty string.");
      return;
    }

    std::string u8_type = StringViewUtils::ToStdString(StringViewUtils::ConvertEncoding(
        view_type, string_view::Encoding::Utf8).utf8_value());
    if (u8_type == "info") {
      FOOTSTONE_LOG(INFO) << view_msg;
    } else if (u8_type == "warn") {
      FOOTSTONE_LOG(WARNING) << view_msg;
    } else if (u8_type == "error") {
      FOOTSTONE_LOG(ERROR) << view_msg;
    } else if (u8_type == "fatal") {
      FOOTSTONE_LOG(FATAL) << view_msg;
    } else {
      FOOTSTONE_LOG(INFO) << view_msg;
    }
  }

  info.GetReturnValue()->SetUndefined();
}

std::shared_ptr<CtxValue> ConsoleModule::BindFunction(std::shared_ptr<Scope> scope,
                                                      std::shared_ptr<CtxValue>* rest_args) {
  auto context = scope->GetContext();
  auto object = context->CreateObject();

  auto key = context->CreateString("Log");
  auto wrapper = std::make_unique<hippy::napi::FunctionWrapper>(
      InvokeConsoleModuleLog, nullptr);
  auto value = context->CreateFunction(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  return object;
}

}
}
}
