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

#include <limits.h>

#include <iostream>

#include "core/base/logging.h"
#include "core/napi/js_native_api.h"
#include "core/napi/jsc/js_native_api_jsc.h"
#include "core/napi/jsc/js_native_jsc_helper.h"
#include "core/napi/native_source_code.h"

namespace hippy {
namespace napi {

bool JSCCtx::GetValueNumber(std::shared_ptr<CtxValue> value, double* result) {
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (JSValueIsNumber(context_, value_ref)) {
    JSValueRef exception_ref = nullptr;
    *result = JSValueToNumber(context_, value_ref, &exception_ref);
    std::string exception_str;
    if (exception_ref) {
      HandleJsException(exception_ref, exception_str);
    }
    return true;
  }

  return false;
}

bool JSCCtx::GetValueNumber(std::shared_ptr<CtxValue> value, int32_t* result) {
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (JSValueIsNumber(context_, value_ref)) {
    JSValueRef exception_ref = nullptr;
    *result = JSValueToNumber(context_, value_ref, &exception_ref);
    std::string exception_str;
    if (exception_ref) {
      HandleJsException(exception_ref, exception_str);
    }
    return true;
  }

  return false;
}

bool JSCCtx::GetValueBoolean(std::shared_ptr<CtxValue> value, bool* result) {
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (JSValueIsBoolean(context_, value_ref)) {
    *result = JSValueToBoolean(context_, value_ref);
    return true;
  }

  return false;
}

bool JSCCtx::GetValueString(std::shared_ptr<CtxValue> value,
                            std::string* result) {
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (JSValueIsString(context_, value_ref)) {
    JSValueRef exception_ref = nullptr;
    JSStringRef str_ref =
        JSValueToStringCopy(context_, value_ref, &exception_ref);
    std::string exception_str;
    if (exception_ref) {
      HandleJsException(exception_ref, exception_str);
    }
    size_t max_size = JSStringGetMaximumUTF8CStringSize(str_ref);
    char* buf = new char[max_size];
    JSStringGetUTF8CString(str_ref, buf, max_size);
    std::string js_str(buf);
    delete[] buf;
    *result = js_str;
    return true;
  }

  return false;
}

bool JSCCtx::IsArray(std::shared_ptr<CtxValue> value) {
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (JSValueIsObject(context_, value_ref)) {
    JSStringRef name = JSStringCreateWithUTF8CString("Array");
    JSValueRef exception_ref = nullptr;
    JSObjectRef array = (JSObjectRef)JSObjectGetProperty(
        context_, JSContextGetGlobalObject(context_), name, &exception_ref);
    std::string exception_str;
    if (exception_ref) {
      HandleJsException(exception_ref, exception_str);
    }
    JSStringRelease(name);
    name = JSStringCreateWithUTF8CString("isArray");
    exception_ref = nullptr;
    JSObjectRef isArray =
        (JSObjectRef)JSObjectGetProperty(context_, array, name, &exception_ref);
    if (exception_ref) {
      HandleJsException(exception_ref, exception_str);
    }
    JSStringRelease(name);
    exception_ref = nullptr;
    JSValueRef retval = JSObjectCallAsFunction(context_, isArray, NULL, 1,
                                               &value_ref, &exception_ref);
    if (exception_ref) {
      HandleJsException(exception_ref, exception_str);
    }
    if (JSValueIsBoolean(context_, retval)) {
      return JSValueToBoolean(context_, retval);
    }
  }

  return false;
}

uint32_t JSCCtx::GetArrayLength(std::shared_ptr<CtxValue> value) {
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  JSValueRef exception_ref = nullptr;
  JSObjectRef array = JSValueToObject(context_, value_ref, &exception_ref);
  std::string exception_str;
  if (exception_ref) {
    HandleJsException(exception_ref, exception_str);
  }
  JSStringRef pname = JSStringCreateWithUTF8CString("length");
  exception_ref = nullptr;
  JSValueRef val = JSObjectGetProperty(context_, array, pname, &exception_ref);
  if (exception_ref) {
    HandleJsException(exception_ref, exception_str);
  }
  JSStringRelease(pname);
  exception_ref = nullptr;
  uint32_t count = JSValueToNumber(context_, val, &exception_ref);
  if (exception_ref) {
    HandleJsException(exception_ref, exception_str);
  }
  return count;
}

bool JSCCtx::GetValueJson(std::shared_ptr<CtxValue> value,
                          std::string* result) {
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  JSValueRef exception_ref = nullptr;
  JSStringRef str_ref =
      JSValueCreateJSONString(context_, value_ref, 0, &exception_ref);
  std::string exception_str;
  if (exception_ref) {
    HandleJsException(exception_ref, exception_str);
  }
  size_t max_size = JSStringGetMaximumUTF8CStringSize(str_ref);
  JSStringRelease(str_ref);
  char* buf = new char[max_size];
  JSStringGetUTF8CString(str_ref, buf, max_size);
  std::string js_str(buf);
  delete[] buf;
  *result = js_str;
  return true;
}

bool JSCCtx::HasNamedProperty(std::shared_ptr<CtxValue> value,
                              const char* name) {
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  JSValueRef exception_ref = nullptr;
  JSObjectRef object = JSValueToObject(context_, value_ref, &exception_ref);
  std::string exception_str;
  if (exception_ref) {
    HandleJsException(exception_ref, exception_str);
  }
  JSStringRef property_name = JSStringCreateWithUTF8CString(name);
  bool ret = JSObjectHasProperty(context_, object, property_name);
  JSStringRelease(property_name);
  return ret;
}

bool JSCCtx::IsFunction(std::shared_ptr<CtxValue> value) {
  if (!value) {
    return false;
  }
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (!JSValueIsObject(context_, value_ref)) {
    return false;
  }

  JSValueRef exception_ref = nullptr;
  JSObjectRef object = JSValueToObject(context_, value_ref, &exception_ref);
  std::string exception_str;
  if (exception_ref) {
    HandleJsException(exception_ref, exception_str);
  }
  return JSObjectIsFunction(context_, object);
}

std::string JSCCtx::CopyFunctionName(std::shared_ptr<CtxValue> function) {
  return "";
}

std::shared_ptr<CtxValue> JSCCtx::CreateNumber(double number) {
  JSValueRef value = JSValueMakeNumber(context_, number);
  return std::make_shared<JSCCtxValue>(context_, value);
}

std::shared_ptr<CtxValue> JSCCtx::CreateBoolean(bool b) {
  JSValueRef value = JSValueMakeBoolean(context_, b);
  return std::make_shared<JSCCtxValue>(context_, value);
}

std::shared_ptr<CtxValue> JSCCtx::CreateString(const char* string) {
  JSStringRef str_ref = JSStringCreateWithUTF8CString(string);
  JSValueRef value = JSValueMakeString(context_, str_ref);
  JSStringRelease(str_ref);
  return std::make_shared<JSCCtxValue>(context_, value);
}

std::shared_ptr<CtxValue> JSCCtx::CreateUndefined() {
  JSValueRef value = JSValueMakeUndefined(context_);
  return std::make_shared<JSCCtxValue>(context_, value);
}

std::shared_ptr<CtxValue> JSCCtx::CreateNull() {
  JSValueRef value = JSValueMakeNull(context_);
  return std::make_shared<JSCCtxValue>(context_, value);
}

std::shared_ptr<CtxValue> JSCCtx::CreateObject(const char* json) {
  JSStringRef str_ref = JSStringCreateWithUTF8CString(json);
  JSValueRef value = JSValueMakeFromJSONString(context_, str_ref);
  JSStringRelease(str_ref);
  return std::make_shared<JSCCtxValue>(context_, value);
}

std::shared_ptr<CtxValue> JSCCtx::CreateArray(
    size_t count,
    std::shared_ptr<CtxValue> array[]) {
  if (count <= 0) {
    return nullptr;
  }

  JSValueRef values[count];  // NOLINT(runtime/arrays)
  for (size_t i = 0; i < count; i++) {
    std::shared_ptr<JSCCtxValue> ele_value =
        std::static_pointer_cast<JSCCtxValue>(array[i]);
    values[i] = ele_value->value_;
  }

  JSValueRef exception_ref = nullptr;
  JSValueRef value_ref =
      JSObjectMakeArray(context_, count, values, &exception_ref);
  std::string exception_str;
  if (exception_ref) {
    HandleJsException(exception_ref, exception_str);
  }
  return std::make_shared<JSCCtxValue>(context_, value_ref);
}

std::shared_ptr<CtxValue> JSCCtx::CopyArrayElement(
    std::shared_ptr<CtxValue> array,
    uint32_t index) {
  std::shared_ptr<JSCCtxValue> array_value =
      std::static_pointer_cast<JSCCtxValue>(array);
  uint32_t count = GetArrayLength(array_value);
  if (count <= 0 || index >= count) {
    return nullptr;
  }

  JSValueRef exception_ref = nullptr;
  JSValueRef value_ref = array_value->value_;
  JSObjectRef array_ref = JSValueToObject(context_, value_ref, &exception_ref);
  std::string exception_str;
  if (exception_ref) {
    HandleJsException(exception_ref, exception_str);
  }
  exception_ref = nullptr;
  JSValueRef element =
      JSObjectGetPropertyAtIndex(context_, array_ref, index, &exception_ref);
  if (exception_ref) {
    HandleJsException(exception_ref, exception_str);
  }
  return std::make_shared<JSCCtxValue>(context_, element);
}

std::shared_ptr<CtxValue> JSCCtx::CopyNamedProperty(
    std::shared_ptr<CtxValue> value,
    const char* name) {
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef exception_ref = nullptr;
  JSValueRef value_ref = ctx_value->value_;
  JSObjectRef object = JSValueToObject(context_, value_ref, &exception_ref);
  std::string exception_str;
  if (exception_ref) {
    HandleJsException(exception_ref, exception_str);
  }
  JSStringRef property_name = JSStringCreateWithUTF8CString(name);
  exception_ref = nullptr;
  JSValueRef property =
      JSObjectGetProperty(context_, object, property_name, &exception_ref);
  if (exception_ref) {
    HandleJsException(exception_ref, exception_str);
  }
  JSStringRelease(property_name);
  if (JSValueIsNull(context_, property) ||
      JSValueIsUndefined(context_, property)) {
    return nullptr;
  }

  return std::make_shared<JSCCtxValue>(context_, property);
}

std::shared_ptr<CtxValue> JSCCtx::CallFunction(
    std::shared_ptr<CtxValue> function,
    size_t argc,
    const std::shared_ptr<CtxValue> args[],
    std::shared_ptr<std::string>* exception) {
  std::shared_ptr<JSCCtxValue> func_value =
      std::static_pointer_cast<JSCCtxValue>(function);
  JSValueRef value_ref = func_value->value_;
  JSObjectRef object = const_cast<JSObjectRef>(value_ref);
  if (argc <= 0) {
    JSValueRef exception_ref = nullptr;
    JSValueRef ret_value_ref = JSObjectCallAsFunction(
        context_, object, nullptr, 0, nullptr, &exception_ref);
    std::string exception_str;
    if (exception_ref) {
      HandleJsException(exception_ref, exception_str);
    }
    return std::make_shared<JSCCtxValue>(context_, ret_value_ref);
  }

  JSValueRef values[argc];  // NOLINT(runtime/arrays)
  for (size_t i = 0; i < argc; i++) {
    std::shared_ptr<JSCCtxValue> arg_value =
        std::static_pointer_cast<JSCCtxValue>(args[i]);
    values[i] = arg_value->value_;
  }

  JSValueRef exception_ref = nullptr;
  JSValueRef ret_value_ref = JSObjectCallAsFunction(
      context_, object, nullptr, argc, values, &exception_ref);
  std::string exception_str;
  if (exception_ref) {
    HandleJsException(exception_ref, exception_str);
  }

  if (exception && exception_ref) {
    *exception = std::make_shared<std::string>(exception_str);
  }

  if (!ret_value_ref) {
    return nullptr;
  }

  return std::make_shared<JSCCtxValue>(context_, ret_value_ref);
}

bool JSCCtx::HandleJsException(JSValueRef value, std::string& exception_str) {
  if (!value) {
    return false;
  }

  std::shared_ptr<CtxValue> exception_obj =
      std::make_shared<JSCCtxValue>(context_, value);
  std::shared_ptr<CtxValue> msg_obj =
      CopyNamedProperty(exception_obj, "message");
  std::string msg_str;
  GetValueString(msg_obj, &msg_str);
  std::shared_ptr<CtxValue> stack_obj =
      CopyNamedProperty(exception_obj, "stack");
  std::string stack_str;
  GetValueString(stack_obj, &stack_str);
  exception_str = "{\"message\":\"" + msg_str + "\",\"stack\":\"" + stack_str +
                  std::string("\"}");

  auto source_code = hippy::GetNativeSourceCode("ExceptionHandle.js");
  HIPPY_DCHECK(source_code.data_ && source_code.length_);
  std::shared_ptr<CtxValue> function = EvaluateJavascript(
      source_code.data_, source_code.length_, "ExceptionHandle.js");
  bool is_func = IsFunction(function);
  HIPPY_CHECK_WITH_MSG(
      is_func == true,
      "HandleUncaughtJsError ExceptionHandle.js don't return function!!!");
  if (!is_func) {
    return false;
  }

  std::shared_ptr<CtxValue> args[2];
  args[0] = CreateString("uncaughtException");
  args[1] = exception_obj;
  CallFunction(function, 2, args, nullptr);

  return true;
}

}  // namespace napi
}  // namespace hippy
