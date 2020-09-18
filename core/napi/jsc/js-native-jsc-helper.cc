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

#include "core/napi/jsc/js-native-jsc-helper.h"

#include <iostream>

#include "core/base/logging.h"
#include "core/napi/js-native-api-types.h"
#include "core/napi/js-native-api.h"
#include "core/napi/jsc/js-native-api-jsc.h"
#include "core/napi/native-source-code.h"

namespace hippy {
namespace napi {

std::string JSValueToStdString(JSGlobalContextRef ctx, JSValueRef value) {
  if (value == nullptr) {
    return "";
  }

  JSStringRef str_ref = JSValueToStringCopy(ctx, value, nullptr);
  size_t max_buf_size = JSStringGetMaximumUTF8CStringSize(str_ref);
  if (max_buf_size <= 0) {
    return "";
  }

  char *utf8_buf = new char[max_buf_size];
  JSStringGetUTF8CString(str_ref, utf8_buf, max_buf_size);
  std::string rst(utf8_buf);
  delete[] utf8_buf;

  return rst;
}

void ReportJSExecption(std::shared_ptr<JSCCtx> context, JSValueRef value) {
  if (!value || !context) {
    return;
  }

  JSGlobalContextRef ctx = context->context_;
  JSObjectRef object = JSValueToObject(ctx, value, nullptr);
  if (!object) {
    return;
  }

  JSStringRef property_name = JSStringCreateWithUTF8CString("stack");
  JSValueRef stack_property =
      JSObjectGetProperty(ctx, object, property_name, nullptr);
  JSGlobalContextRef global_context = JSContextGetGlobalContext(ctx);
  std::string stack = JSValueToStdString(global_context, stack_property);
  std::string message = JSValueToStdString(global_context, value);

  std::string json_str = std::string("{\"message\":\"") + message +
                         std::string("\",\"stack\":\"") + stack +
                         std::string("\"}");
  JSStringRelease(property_name);

  std::shared_ptr<CtxValue> json_object =
      context->CreateObject(json_str.c_str());
  if (!json_object) {
    return;
  }
  auto source_code = hippy::GetNativeSourceCode("ExceptionHandle.js");
  HIPPY_DCHECK(source_code.data_ && source_code.length_);
  std::shared_ptr<CtxValue> function = context->EvaluateJavascript(
      source_code.data_, source_code.length_, "ExceptionHandle.js");
  bool is_func = context->IsFunction(function);
  HIPPY_CHECK_WITH_MSG(
      is_func == true,
      "HandleUncaughtJsError ExceptionHandle.js don't return function!!!");
  if (!is_func) {
    return;
  }

  std::shared_ptr<CtxValue> args[2];
  args[0] = context->CreateString("uncaughtException");
  args[1] = json_object;
  context->CallFunction(function, 2, args);
}

std::string JsStrToUTF8(JSStringRef str) {
  size_t max_size = JSStringGetMaximumUTF8CStringSize(str);
  char *buf = new char[max_size];
  size_t bytes = JSStringGetUTF8CString(str, buf, max_size);
  std::string utf_string = std::string(buf, bytes - 1);
  delete[] buf;
  return utf_string;
}

void ExceptionDescription(JSContextRef ctx, JSValueRef exception) {
  if (!exception) {
    return;
  }

  JSStringRef exception_ref = JSValueToStringCopy(ctx, exception, nullptr);
  size_t max_size = JSStringGetMaximumUTF8CStringSize(exception_ref);
  if (max_size <= 0) {
    return;
  }
  char *buf = new char[max_size];
  JSStringGetUTF8CString(exception_ref, buf, max_size);

  std::cout << "call function expection: " << buf << std::endl;
  delete[] buf;
}

}  // namespace napi
}  // namespace hippy
