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

#include "base/logging.h"
#include "core/base/string_view_utils.h"
#include "core/napi/js_native_api.h"
#include "core/napi/jsc/js_native_api_jsc.h"
#include "core/napi/jsc/js_native_jsc_helper.h"
#include "core/napi/native_source_code.h"

namespace hippy {
namespace napi {

using StringViewUtils = hippy::base::StringViewUtils;

bool JSCCtx::GetValueNumber(std::shared_ptr<CtxValue> value, double* result) {
  if (!value) {
    return false;
  }
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (JSValueIsNumber(context_, value_ref)) {
    JSValueRef exception = nullptr;
    *result = JSValueToNumber(context_, value_ref, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return false;
    }
    return true;
  }

  return false;
}

bool JSCCtx::GetValueNumber(std::shared_ptr<CtxValue> value, int32_t* result) {
  if (!value) {
    return false;
  }
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (JSValueIsNumber(context_, value_ref)) {
    JSValueRef exception = nullptr;
    *result = JSValueToNumber(context_, value_ref, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return false;
    }
    return true;
  }

  return false;
}

bool JSCCtx::GetValueBoolean(std::shared_ptr<CtxValue> value, bool* result) {
  if (!value) {
    return false;
  }
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
                            unicode_string_view* result) {
  if (!value) {
    return false;
  }
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (JSValueIsString(context_, value_ref)) {
    JSValueRef exception = nullptr;
    JSStringRef str_ref = JSValueToStringCopy(context_, value_ref, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return false;
    }
    *result = unicode_string_view(reinterpret_cast<const char16_t*>(JSStringGetCharactersPtr(str_ref)), JSStringGetLength(str_ref));
    return true;
  }

  return false;
}

bool JSCCtx::IsArray(std::shared_ptr<CtxValue> value) {
  if (!value) {
    return false;
  }
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  return JSValueIsArray(context_, value_ref);
}

uint32_t JSCCtx::GetArrayLength(std::shared_ptr<CtxValue> value) {
  if (!value) {
    return 0;
  }
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  JSValueRef exception = nullptr;
  JSObjectRef array = JSValueToObject(context_, value_ref, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return 0;
  }
  //to do
  JSStringRef prop_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar*>(kLengthStr), arraysize(kLengthStr) - 1);
  exception = nullptr;
  JSValueRef val = JSObjectGetProperty(context_, array, prop_name, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return 0;
  }
  JSStringRelease(prop_name);
  exception = nullptr;
  uint32_t count = JSValueToNumber(context_, val, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return 0;
  }
  return count;
}

bool JSCCtx::GetValueJson(std::shared_ptr<CtxValue> value,
                          unicode_string_view* result) {
  if (!value) {
    return false;
  }
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  JSValueRef exception = nullptr;
  JSStringRef str_ref =
      JSValueCreateJSONString(context_, value_ref, 0, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return false;
  }
  *result = unicode_string_view(reinterpret_cast<const char16_t*>(JSStringGetCharactersPtr(str_ref)), JSStringGetLength(str_ref));
  JSStringRelease(str_ref);
  return true;
}

bool JSCCtx::HasNamedProperty(std::shared_ptr<CtxValue> value,
                              const unicode_string_view& name) {
  if (!value) {
    return false;
  }
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  JSValueRef exception = nullptr;
  JSObjectRef object = JSValueToObject(context_, value_ref, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return false;
  }
  JSStringRef property_name = CreateJSCString(name);
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

  JSValueRef exception = nullptr;
  JSObjectRef object = JSValueToObject(context_, value_ref, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return false;
  }
  return JSObjectIsFunction(context_, object);
}

unicode_string_view JSCCtx::CopyFunctionName(std::shared_ptr<CtxValue> function) {
  TDF_BASE_NOTIMPLEMENTED();
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

std::shared_ptr<CtxValue> JSCCtx::CreateString(const unicode_string_view& str_view) {
  JSStringRef str_ref = CreateJSCString(str_view);
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

std::shared_ptr<CtxValue> JSCCtx::CreateObject(const unicode_string_view& json) {
  JSStringRef str_ref = CreateJSCString(json);
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

  JSValueRef exception = nullptr;
  JSValueRef value_ref = JSObjectMakeArray(context_, count, values, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  return std::make_shared<JSCCtxValue>(context_, value_ref);
}

std::shared_ptr<CtxValue> JSCCtx::CreateJsError(const unicode_string_view& msg) {
  JSStringRef str_ref = CreateJSCString(msg);
  JSValueRef value = JSValueMakeString(context_, str_ref);
  JSStringRelease(str_ref);
  JSValueRef values[] = {value};
  JSObjectRef error = JSObjectMakeError(context_, 1, values, nullptr);
  return std::make_shared<JSCCtxValue>(context_, error);
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

  JSValueRef exception = nullptr;
  JSValueRef value_ref = array_value->value_;
  JSObjectRef array_ref = JSValueToObject(context_, value_ref, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  exception = nullptr;
  JSValueRef element =
      JSObjectGetPropertyAtIndex(context_, array_ref, index, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  return std::make_shared<JSCCtxValue>(context_, element);
}

std::shared_ptr<CtxValue> JSCCtx::CopyNamedProperty(
    std::shared_ptr<CtxValue> value,
    const unicode_string_view& name) {
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  JSValueRef exception = nullptr;
  JSObjectRef object = JSValueToObject(context_, value_ref, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  JSStringRef property_name = CreateJSCString(name);
  exception = nullptr;
  JSValueRef property =
      JSObjectGetProperty(context_, object, property_name, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
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
    const std::shared_ptr<CtxValue> args[]) {
  std::shared_ptr<JSCCtxValue> func_value =
      std::static_pointer_cast<JSCCtxValue>(function);
  JSValueRef func_ref = func_value->value_;
  JSValueRef exception = nullptr;
  JSObjectRef object = JSValueToObject(context_, func_ref, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  if (argc <= 0) {
    JSValueRef ret_value_ref = JSObjectCallAsFunction(context_, object, nullptr,
                                                      0, nullptr, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return nullptr;
    }
    return std::make_shared<JSCCtxValue>(context_, ret_value_ref);
  }

  JSValueRef values[argc];  // NOLINT(runtime/arrays)
  for (size_t i = 0; i < argc; i++) {
    std::shared_ptr<JSCCtxValue> arg_value =
        std::static_pointer_cast<JSCCtxValue>(args[i]);
    values[i] = arg_value->value_;
  }

  JSValueRef ret_value_ref = JSObjectCallAsFunction(context_, object, nullptr,
                                                    argc, values, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }

  if (!ret_value_ref) {
    return nullptr;
  }

  return std::make_shared<JSCCtxValue>(context_, ret_value_ref);
}

unicode_string_view JSCCtx::GetExceptionMsg(std::shared_ptr<CtxValue> exception) {
  if (!exception) {
    return unicode_string_view();
  }
  
  
  std::shared_ptr<CtxValue> msg_obj = CopyNamedProperty(exception, unicode_string_view(kMessageStr, arraysize(kMessageStr) - 1));
  unicode_string_view msg_view;
  GetValueString(msg_obj, &msg_view);
  std::u16string u16_msg;
  if (!StringViewUtils::IsEmpty(msg_view)) {
    u16_msg = msg_view.utf16_value();
  }
  std::shared_ptr<CtxValue> stack_obj = CopyNamedProperty(exception, unicode_string_view(kStackStr, arraysize(kStackStr) - 1));
  unicode_string_view stack_view;
  GetValueString(stack_obj, &stack_view);
  std::u16string u16_stack;
  if (!StringViewUtils::IsEmpty(stack_view)) {
    u16_stack = stack_view.utf16_value();
  }
  // to do
  std::u16string str = u"message: " + u16_msg + u", stack: " + u16_stack;
  unicode_string_view ret(str.c_str(), str.length());
  TDF_BASE_DLOG(ERROR) << "GetExceptionMsg msg = " << ret;
  return ret;
}

bool JSCCtx::ThrowExceptionToJS(std::shared_ptr<CtxValue> exception) {
  if (!exception) {
    return false;
  }

  std::shared_ptr<CtxValue> exception_handler =
      GetGlobalObjVar(kHippyErrorHandlerName);
  if (!IsFunction(exception_handler)) {
    const auto& source_code = hippy::GetNativeSourceCode(kErrorHandlerJSName);
    TDF_BASE_DCHECK(source_code.data_ && source_code.length_);
    unicode_string_view content(source_code.data_, source_code.length_);
    exception_handler =
        RunScript(content, kErrorHandlerJSName);
    bool is_func = IsFunction(exception_handler);
    TDF_BASE_CHECK(is_func) << "HandleUncaughtJsError ExceptionHandle.js don't return function!!!";
    SetGlobalObjVar(kHippyErrorHandlerName, exception_handler,
                    PropertyAttribute::ReadOnly);
  }

  std::shared_ptr<CtxValue> args[2];
  args[0] = CreateString("uncaughtException");
  args[1] = exception;
  CallFunction(exception_handler, 2, args);

  return true;
}

JSStringRef JSCCtx::CreateJSCString(const unicode_string_view& str_view) {
  unicode_string_view::Encoding encoding = str_view.encoding();
  JSStringRef ret;
  switch (encoding) {
    case unicode_string_view::Encoding::Unkown: {
      TDF_BASE_NOTREACHED();
      break;
    }
    case unicode_string_view::Encoding::Latin1: {
      ret = JSStringCreateWithUTF8CString(str_view.latin1_value().c_str());
      break;
    }
    case unicode_string_view::Encoding::Utf8: {
      std::string aaa(reinterpret_cast<const char*>(str_view.utf8_value().c_str()), str_view.utf8_value().length());
      ret = JSStringCreateWithUTF8CString(aaa.c_str());
      break;
    }
    case unicode_string_view::Encoding::Utf16: {
      std::u16string u16_str = str_view.utf16_value();
      ret = JSStringCreateWithCharacters(reinterpret_cast<const JSChar*>(u16_str.c_str()), u16_str.length());
      break;
    }
    case unicode_string_view::Encoding::Utf32: {
      std::u16string u16_str = StringViewUtils::Convert(str_view, unicode_string_view::Encoding::Utf16).utf16_value();
      ret = JSStringCreateWithCharacters(reinterpret_cast<const JSChar*>(u16_str.c_str()), u16_str.length());
      break;
    }
    default:
      TDF_BASE_NOTIMPLEMENTED();
      break;
  }
  return ret;
}

}  // namespace napi
}  // namespace hippy
