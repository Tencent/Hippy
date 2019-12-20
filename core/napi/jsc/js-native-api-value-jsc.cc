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

#include "core/napi/jsc/js-native-api-jsc.h"

#include <limits.h>
#include <iostream>

#include "core/base/logging.h"
#include "core/napi/js-native-api.h"
#include "core/napi/jsc/js-native-jsc-helper.h"

namespace hippy {
namespace napi {

bool napi_get_value_number(napi_context context,
                           napi_value value,
                           double* result) {
  HIPPY_DCHECK(context);

  JSValueRef valueRef = value->value_;
  if (JSValueIsNumber(context->context_, valueRef)) {
    *result = JSValueToNumber(context->context_, valueRef, nullptr);
    return true;
  }

  return false;
}

bool napi_get_value_number(napi_context context,
                           napi_value value,
                           int32_t* result) {
  HIPPY_DCHECK(context);

  JSValueRef valueRef = value->value_;
  if (JSValueIsNumber(context->context_, valueRef)) {
    *result = JSValueToNumber(context->context_, valueRef, nullptr);
    return true;
  }

  return false;
}

bool napi_get_value_boolean(napi_context context,
                            napi_value value,
                            bool* result) {
  HIPPY_DCHECK(context);

  JSValueRef valueRef = value->value_;
  if (JSValueIsBoolean(context->context_, valueRef)) {
    *result = JSValueToBoolean(context->context_, valueRef);
    return true;
  }

  return false;
}

bool napi_get_value_string(napi_context context,
                           napi_value value,
                           std::string* result) {
  HIPPY_DCHECK(context);

  JSValueRef valueRef = value->value_;
  if (JSValueIsString(context->context_, valueRef)) {
    JSStringRef stringRef =
        JSValueToStringCopy(context->context_, valueRef, nullptr);
    size_t maxBufferSize = JSStringGetMaximumUTF8CStringSize(stringRef);
    char* utf8Buffer = new char[maxBufferSize];
    JSStringGetUTF8CString(stringRef, utf8Buffer, maxBufferSize);
    std::string jsString(utf8Buffer);
    delete[] utf8Buffer;
    *result = jsString;
    return true;
  }

  return false;
}

bool napi_is_array(napi_context context, napi_value value) {
  HIPPY_DCHECK(context);

  JSValueRef valueRef = value->value_;
  if (JSValueIsObject(context->context_, valueRef)) {
    JSStringRef name = JSStringCreateWithUTF8CString("Array");
    JSObjectRef array = (JSObjectRef)JSObjectGetProperty(
        context->context_, JSContextGetGlobalObject(context->context_), name,
        NULL);
    JSStringRelease(name);
    name = JSStringCreateWithUTF8CString("isArray");
    JSObjectRef isArray =
        (JSObjectRef)JSObjectGetProperty(context->context_, array, name, NULL);
    JSStringRelease(name);
    JSValueRef retval = JSObjectCallAsFunction(context->context_, isArray, NULL,
                                               1, &valueRef, NULL);
    if (JSValueIsBoolean(context->context_, retval)) {
      return JSValueToBoolean(context->context_, retval);
    }
  }

  return false;
}

uint32_t napi_get_array_length(napi_context context, napi_value value) {
  HIPPY_DCHECK(context);

  JSValueRef valueRef = value->value_;
  JSObjectRef array = JSValueToObject(context->context_, valueRef, nullptr);
  JSStringRef pname = JSStringCreateWithUTF8CString("length");
  JSValueRef val =
      JSObjectGetProperty(context->context_, array, pname, nullptr);
  JSStringRelease(pname);
  uint32_t count = JSValueToNumber(context->context_, val, nullptr);

  return count;
}

napi_value napi_copy_array_element(napi_context context,
                                   napi_value value,
                                   uint32_t index) {
  HIPPY_DCHECK(context);

  uint32_t count = napi_get_array_length(context, value);
  if (count <= 0 || index >= count) {
    return nullptr;
  }

  JSValueRef valueRef = value->value_;
  JSObjectRef array = JSValueToObject(context->context_, valueRef, nullptr);
  JSValueRef elem =
      JSObjectGetPropertyAtIndex(context->context_, array, index, nullptr);
  napi_value v = std::make_shared<napi_value__>(context, elem);
  return v;
}

bool napi_get_value_json(napi_context context,
                         napi_value value,
                         std::string* result) {
  HIPPY_DCHECK(context);

  JSValueRef valueRef = value->value_;
  JSStringRef stringRef =
      JSValueCreateJSONString(context->context_, valueRef, 0, nullptr);
  size_t maxBufferSize = JSStringGetMaximumUTF8CStringSize(stringRef);
  JSStringRelease(stringRef);
  char* utf8Buffer = new char[maxBufferSize];
  JSStringGetUTF8CString(stringRef, utf8Buffer, maxBufferSize);
  std::string jsString(utf8Buffer);
  delete[] utf8Buffer;
  *result = jsString;
  return true;
}

bool napi_has_named_property(napi_context context,
                             napi_value value,
                             const char* utf8name) {
  HIPPY_DCHECK(context);

  JSValueRef valueRef = value->value_;
  JSObjectRef object = JSValueToObject(context->context_, valueRef, nullptr);
  JSStringRef property_name = JSStringCreateWithUTF8CString(utf8name);
  bool hasProperty =
      JSObjectHasProperty(context->context_, object, property_name);
  JSStringRelease(property_name);
  return hasProperty;
}

napi_value napi_copy_named_property(napi_context context,
                                    napi_value value,
                                    const char* utf8name) {
  HIPPY_DCHECK(context);

  JSValueRef valueRef = value->value_;
  JSObjectRef object = JSValueToObject(context->context_, valueRef, nullptr);
  JSStringRef property_name = JSStringCreateWithUTF8CString(utf8name);
  JSValueRef property =
      JSObjectGetProperty(context->context_, object, property_name, nullptr);
  JSStringRelease(property_name);
  if (JSValueIsNull(context->context_, property) ||
      JSValueIsUndefined(context->context_, property)) {
    return nullptr;
  }

  napi_value v = std::make_shared<napi_value__>(context, property);
  return v;
}

bool napi_is_function(napi_context context, napi_value value) {
  HIPPY_DCHECK(context);

  if (!value) {
    return false;
  }

  JSValueRef valueRef = value->value_;
  if (!JSValueIsObject(context->context_, valueRef)) {
    return false;
  }

  JSObjectRef object = JSValueToObject(context->context_, valueRef, nullptr);
  return JSObjectIsFunction(context->context_, object);
}

std::string napi_copy_function_name(napi_context context, napi_value function) {
  return "";
}

napi_value napi_create_number(napi_context context, double number) {
  HIPPY_DCHECK(context);

  JSValueRef value = JSValueMakeNumber(context->context_, number);
  napi_value v = std::make_shared<napi_value__>(context, value);
  return v;
}

napi_value napi_create_boolean(napi_context context, bool b) {
  HIPPY_DCHECK(context);

  JSValueRef value = JSValueMakeBoolean(context->context_, b);
  napi_value v = std::make_shared<napi_value__>(context, value);
  return v;
}

napi_value napi_create_string(napi_context context, const char* string) {
  HIPPY_DCHECK(context);

  JSStringRef stringRef = JSStringCreateWithUTF8CString(string);
  JSValueRef value = JSValueMakeString(context->context_, stringRef);
  JSStringRelease(stringRef);
  napi_value v = std::make_shared<napi_value__>(context, value);
  return v;
}

napi_value napi_create_undefined(napi_context context) {
  HIPPY_DCHECK(context);

  JSValueRef value = JSValueMakeUndefined(context->context_);
  napi_value v = std::make_shared<napi_value__>(context, value);
  return v;
}

napi_value napi_create_null(napi_context context) {
  HIPPY_DCHECK(context);

  JSValueRef value = JSValueMakeNull(context->context_);
  napi_value v = std::make_shared<napi_value__>(context, value);
  return v;
}

napi_value napi_create_object(napi_context context, const char* json) {
  HIPPY_DCHECK(context);

  JSStringRef stringRef = JSStringCreateWithUTF8CString(json);
  JSValueRef value = JSValueMakeFromJSONString(context->context_, stringRef);
  JSStringRelease(stringRef);
  napi_value v = std::make_shared<napi_value__>(context, value);
  return v;
}

napi_value napi_create_array(napi_context context,
                             size_t count,
                             napi_value value[]) {
  HIPPY_DCHECK(context);

  if (count <= 0) {
    return nullptr;
  }

  JSValueRef valuesRef[count];  // NOLINT(runtime/arrays)
  for (size_t i = 0; i < count; i++) {
    valuesRef[i] = value[i]->value_;
  }
  JSValueRef valueRef =
      JSObjectMakeArray(context->context_, count, valuesRef, nullptr);
  napi_value v = std::make_shared<napi_value__>(context, valueRef);
  return v;
}

napi_value napi_call_function(napi_context context,
                              napi_value function,
                              size_t argument_count,
                              const napi_value argumets[]) {
  HIPPY_DCHECK(context);

  JSValueRef valueRef = function->value_;
  JSObjectRef object = const_cast<JSObjectRef>(valueRef);
  if (argument_count <= 0) {
    JSValueRef exception = nullptr;
    JSValueRef retValueRef = JSObjectCallAsFunction(
        context->context_, object, nullptr, 0, nullptr, &exception);
    exception_description(context->context_, exception);
    napi_value retValue = std::make_shared<napi_value__>(context, retValueRef);
    return retValue;
  }

  JSValueRef values[argument_count];  // NOLINT(runtime/arrays)
  for (size_t i = 0; i < argument_count; i++) {
    values[i] = argumets[i]->value_;
  }

  JSValueRef exception = nullptr;
  JSValueRef retValueRef = JSObjectCallAsFunction(
      context->context_, object, nullptr, argument_count, values, &exception);
  exception_description(context->context_, exception);

  if (!retValueRef) {
    return nullptr;
  }

  return std::make_shared<napi_value__>(context, retValueRef);
}

}  // namespace napi
}  // namespace hippy
