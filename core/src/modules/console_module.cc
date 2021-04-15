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

#include <string.h>

#include <string>

#include "base/logging.h"
#include "core/modules/module_register.h"
#include "core/napi/callback_info.h"
#include "core/napi/js_native_api.h"
#include "core/scope.h"

using Ctx = hippy::napi::Ctx;

REGISTER_MODULE(ConsoleModule, Log)

namespace {

std::string EscapeMessage(const std::string& message) {
  size_t length = message.length();
  std::string escapMsg;
  for (size_t i = 0; i < length; i++) {
    char c = message[i];
    escapMsg += c;
    if (c == '%') {
      escapMsg += '%';
    }
  }

  return escapMsg;
}

}  // namespace

void ConsoleModule::Log(const hippy::napi::CallbackInfo& info) {
  std::shared_ptr<Scope> scope = info.GetScope();
  std::shared_ptr<Ctx> context = scope->GetContext();
  TDF_BASE_CHECK(context);

  std::string message;
  if (!context->GetValueString(info[0], &message)) {
    info.GetExceptionValue()->Set(context,
                                  "The first argument must be string.");
    return;
  }

  std::string str = EscapeMessage(message);
  const char* log_msg = str.c_str();
  if (info.Length() == 1) {
    TDF_BASE_DLOG(INFO) << log_msg;
  } else {
    std::string type;
    if (!context->GetValueString(info[1], &type) || type.empty()) {
      info.GetExceptionValue()->Set(
          context, "The second argument must be non-empty string.");
      return;
    }

    if (type.compare("info") == 0) {
      TDF_BASE_DLOG(INFO) << log_msg;
    } else if (type.compare("warn") == 0) {
      TDF_BASE_DLOG(WARNING) << log_msg;
    } else if (type.compare("error_") == 0) {
      TDF_BASE_DLOG(ERROR) << log_msg;
    } else if (type.compare("fatal") == 0) {
      TDF_BASE_DLOG(FATAL) << log_msg;
    } else {
      TDF_BASE_DLOG(INFO) << log_msg;
    }
  }

  info.GetReturnValue()->SetUndefined();
}
