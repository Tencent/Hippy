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

#include "core/modules/console_module.h"

#include <string>

#include "base/logging.h"
#include "core/base/string_view_utils.h"
#include "core/scope.h"


using unicode_string_view = tdf::base::unicode_string_view;
using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using StringViewUtils = hippy::base::StringViewUtils;

GEN_INVOKE_CB(ConsoleModule, Log) // NOLINT(cert-err58-cpp)

namespace {

unicode_string_view EscapeMessage(const unicode_string_view& str_view) {
  unicode_string_view::u8string u8_str = StringViewUtils::Convert(str_view, unicode_string_view::Encoding::Utf8).utf8_value();
  size_t len = u8_str.length();
  unicode_string_view::u8string ret;
  for (size_t i = 0; i < len; i++) {
    auto c = u8_str[i];
    ret += c;
    if (c == '%') {
      ret += '%';
    }
  }

  return unicode_string_view(ret);
}

}  // namespace

void ConsoleModule::Log(const hippy::napi::CallbackInfo& info, void* data) { // NOLINT(readability-convert-member-functions-to-static)
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
  auto scope = scope_wrapper->scope.lock();
  TDF_BASE_CHECK(scope);
  auto context = scope->GetContext();
  TDF_BASE_CHECK(context);

  unicode_string_view message;
  if (!context->GetValueString(info[0], &message)) {
    info.GetExceptionValue()->Set(context,"The first argument must be string.");
    return;
  }

  unicode_string_view view_msg = EscapeMessage(message);
  if (info.Length() == 1) {
    TDF_BASE_LOG(INFO) << view_msg;
  } else {
    unicode_string_view view_type;
    if (!context->GetValueString(info[1], &view_type) ||
        StringViewUtils::IsEmpty(view_type)) {
      info.GetExceptionValue()->Set(
          context, "The second argument must be non-empty string.");
      return;
    }

    std::string u8_type = StringViewUtils::ToU8StdStr(view_type);
    if (u8_type == "info") {
      TDF_BASE_LOG(INFO) << view_msg;
    } else if (u8_type == "warn") {
      TDF_BASE_LOG(WARNING) << view_msg;
    } else if (u8_type == "error") {
      TDF_BASE_LOG(ERROR) << view_msg;
    } else if (u8_type == "fatal") {
      TDF_BASE_LOG(FATAL) << view_msg;
    } else {
      TDF_BASE_LOG(INFO) << view_msg;
    }
  }

  info.GetReturnValue()->SetUndefined();
}

std::shared_ptr<CtxValue> ConsoleModule::BindFunction(std::shared_ptr<Scope> scope,
                                                      std::shared_ptr<CtxValue>* rest_args) {
  auto context = scope->GetContext();
  auto object = context->CreateObject();

  auto key = context->CreateString("Log");
  auto wrapper = std::make_unique<hippy::napi::FuncWrapper>(
      InvokeConsoleModuleLog,nullptr);
  auto value = context->CreateFunction(wrapper);
  scope->SaveFuncWrapper(std::move(wrapper));
  context->SetProperty(object, key, value);

  return object;
}
