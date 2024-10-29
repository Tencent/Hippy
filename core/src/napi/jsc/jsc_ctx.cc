/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "core/napi/jsc/jsc_ctx.h"

#include "base/logging.h"
#include "core/base/string_view_utils.h"
#include "core/napi/jsc/jsc_ctx_value.h"
#include "core/napi/callback_info.h"
#include "core/vm/native_source_code.h"
#include "core/vm/jsc/jsc_vm.h"

namespace hippy {
namespace napi {

using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;
using JSValueWrapper = hippy::base::JSValueWrapper;
using JSCVM = hippy::vm::JSCVM;

constexpr char16_t kFunctionName[] = u"Function";

JSValueRef InvokeJsCallback(JSContextRef ctx,
                            JSObjectRef function,
                            JSObjectRef object,
                            size_t argumentCount,
                            const JSValueRef arguments[],
                            JSValueRef* exception_ref) {
  void* data = JSObjectGetPrivate(function);
  if (!data) {
    return JSValueMakeUndefined(ctx);
  }
  FuncData* func_data = reinterpret_cast<FuncData*>(data);
  auto func_wrapper = reinterpret_cast<FuncWrapper*>(func_data->func_wrapper);
  auto js_cb = func_wrapper->cb;
  void* external_data = func_wrapper->data;
  CallbackInfo cb_info;
  cb_info.SetSlot(func_data->global_external_data);
  auto context = JSContextGetGlobalContext(ctx);
  cb_info.SetReceiver(std::make_shared<JSCCtxValue>(context, object));
  for (size_t i = 0; i < argumentCount; i++) {
    cb_info.AddValue(std::make_shared<JSCCtxValue>(context, arguments[i]));
  }
  js_cb(cb_info, external_data);
  auto exception = std::static_pointer_cast<JSCCtxValue>(cb_info.GetExceptionValue()->Get());
  if (exception) {
    *exception_ref = exception->value_;
    return JSValueMakeUndefined(ctx);
  }

  auto ret_value = std::static_pointer_cast<JSCCtxValue>(cb_info.GetReturnValue()->Get());
  if (!ret_value) {
    return JSValueMakeUndefined(ctx);
  }

  JSValueRef valueRef = ret_value->value_;
  return valueRef;
}

std::shared_ptr<CtxValue> JSCCtx::CreateFunction(std::unique_ptr<FuncWrapper>& wrapper) {
  auto func_data = std::make_unique<FuncData>(external_data_, reinterpret_cast<void*>(wrapper.get()));
  JSClassDefinition fn_def = kJSClassDefinitionEmpty;
  fn_def.callAsFunction = InvokeJsCallback;
  fn_def.attributes = kJSClassAttributeNoAutomaticPrototype;
  fn_def.initialize = [](JSContextRef ctx, JSObjectRef object) {
    JSObjectRef global = JSContextGetGlobalObject(ctx);
    JSStringRef func_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar *>(kFunctionName), arraysize(kFunctionName) - 1);
    if (!func_name) {
      return;
    }
    JSValueRef value = JSObjectGetProperty(ctx, global, func_name, nullptr);
    JSStringRelease(func_name);
    JSObjectRef base_func = JSValueToObject(ctx, value, nullptr);
    if (!base_func) {
      return;
    }
    JSValueRef proto = JSObjectGetPrototype(ctx, base_func);
    JSObjectSetPrototype(ctx, object, proto);
  };
  JSClassRef cls_ref = JSClassCreate(&fn_def);
  JSObjectRef fn_obj = JSObjectMake(context_, cls_ref, func_data.get());
  JSClassRelease(cls_ref);
  SaveFuncData(std::move(func_data));
  return std::make_shared<JSCCtxValue>(context_, fn_obj);
}

static JSValueRef JSObjectGetPropertyCallback(
  JSContextRef ctx,
  JSObjectRef object,
  JSStringRef name,
  JSValueRef *exception_ref) {

  FuncData* func_data = reinterpret_cast<FuncData*>(JSObjectGetPrivate(object));
  auto context = JSContextGetGlobalContext(ctx);
  auto func_wrapper = reinterpret_cast<FuncWrapper*>(func_data->func_wrapper);
  auto js_cb = func_wrapper->cb;
  void* external_data = func_wrapper->data;
  CallbackInfo cb_info;
  cb_info.SetSlot(func_data->global_external_data);
  cb_info.SetReceiver(std::make_shared<JSCCtxValue>(context, object));

  JSValueRef name_ref = JSValueMakeString(context, name);
  cb_info.AddValue(std::make_shared<JSCCtxValue>(context, name_ref));
  js_cb(cb_info, external_data);
  auto exception = std::static_pointer_cast<JSCCtxValue>(cb_info.GetExceptionValue()->Get());
  if (exception) {
    *exception_ref = exception->value_;
    return JSValueMakeUndefined(ctx);
  }

  auto ret_value = std::static_pointer_cast<JSCCtxValue>(cb_info.GetReturnValue()->Get());
  if (!ret_value) {
    return JSValueMakeUndefined(ctx);
  }

  JSValueRef valueRef = ret_value->value_;
  return valueRef;
}

std::shared_ptr<CtxValue>  JSCCtx::DefineProxy(const std::unique_ptr<FuncWrapper>& wrapper) {
  JSClassDefinition cls_def = kJSClassDefinitionEmpty;
  cls_def.getProperty = JSObjectGetPropertyCallback;
  auto cls_ref = JSClassCreate(&cls_def);
  auto func_data = std::make_unique<FuncData>(external_data_, reinterpret_cast<void*>(wrapper.get()));
  JSObjectRef fn_obj = JSObjectMake(context_, cls_ref, reinterpret_cast<void*>(func_data.get()));
  JSClassRelease(cls_ref);
  SaveFuncData(std::move(func_data));
  return std::make_shared<JSCCtxValue>(context_, fn_obj);
}

std::shared_ptr<CtxValue> JSCCtx::DefineClass(unicode_string_view name,
                                              const std::unique_ptr<FuncWrapper>& constructor_wrapper,
                                              size_t property_count,
                                              std::shared_ptr<PropertyDescriptor> properties[]) {
  TDF_BASE_UNIMPLEMENTED();
  return nullptr;
}

std::shared_ptr<CtxValue> JSCCtx::NewInstance(const std::shared_ptr<CtxValue>& cls, int argc, std::shared_ptr<CtxValue> argv[], void* external) {
  auto jsc_cls = std::static_pointer_cast<JSCCtxValue>(cls);
  JSValueRef values[argc];  // NOLINT(runtime/arrays)
  for (size_t i = 0; i < argc; i++) {
    auto arg_value = std::static_pointer_cast<JSCCtxValue>(argv[i]);
    values[i] = arg_value->value_;
  }
  JSValueRef exception = nullptr;
  JSObjectRef object = JSValueToObject(context_, jsc_cls->value_, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  auto ret = JSObjectCallAsConstructor(context_, object, argc, values, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  return std::make_shared<JSCCtxValue>(context_, ret);
}

std::shared_ptr<CtxValue> JSCCtx::GetGlobalObject() {
  JSObjectRef global_obj = JSContextGetGlobalObject(context_);
  return std::make_shared<JSCCtxValue>(context_, global_obj);
}

void JSCCtx::SetExternalData(void* data) {
  external_data_ = data;
};

bool JSCCtx::GetValueNumber(const std::shared_ptr<CtxValue>& value, double* result) {
  if (!value) {
    return false;
  }
  std::shared_ptr<JSCCtxValue> ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
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

bool JSCCtx::GetValueNumber(const std::shared_ptr<CtxValue>& value, int32_t* result) {
  if (!value) {
    return false;
  }
  std::shared_ptr<JSCCtxValue> ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
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

bool JSCCtx::GetValueBoolean(const std::shared_ptr<CtxValue>& value, bool* result) {
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

bool JSCCtx::GetValueString(const std::shared_ptr<CtxValue>& value,
                            unicode_string_view* result) {
  if (!value) {
    return false;
  }
  std::shared_ptr<JSCCtxValue> ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (JSValueIsString(context_, value_ref)) {
    JSValueRef exception = nullptr;
    JSStringRef str_ref = JSValueToStringCopy(context_, value_ref, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return false;
    }
    *result = unicode_string_view(
        reinterpret_cast<const char16_t*>(JSStringGetCharactersPtr(str_ref)),
        JSStringGetLength(str_ref));
    return true;
  }

  return false;
}

bool JSCCtx::IsArray(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  return JSValueIsArray(context_, value_ref);
}

uint32_t JSCCtx::GetArrayLength(const std::shared_ptr<CtxValue>& value) {
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
  // to do
  JSStringRef prop_name = JSStringCreateWithCharacters(
      reinterpret_cast<const JSChar*>(kLengthStr), arraysize(kLengthStr) - 1);
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

bool JSCCtx::GetValueJson(const std::shared_ptr<CtxValue>& value,
                          unicode_string_view* result) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  JSValueRef exception = nullptr;
  JSStringRef str_ref =
      JSValueCreateJSONString(context_, value_ref, 0, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return false;
  }
  *result = unicode_string_view(
      reinterpret_cast<const char16_t*>(JSStringGetCharactersPtr(str_ref)),
      JSStringGetLength(str_ref));
  JSStringRelease(str_ref);
  return true;
}

bool JSCCtx::HasNamedProperty(const std::shared_ptr<CtxValue>& value,
                              const unicode_string_view& name) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  JSValueRef exception = nullptr;
  JSObjectRef object = JSValueToObject(context_, value_ref, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return false;
  }
  JSStringRef property_name = JSCVM::CreateJSCString(name);
  bool ret = JSObjectHasProperty(context_, object, property_name);
  JSStringRelease(property_name);
  return ret;
}

bool JSCCtx::IsString(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  return JSValueIsString(context_, value_ref);
}

bool JSCCtx::IsFunction(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
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

bool JSCCtx::IsObject(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  return JSValueIsObject(context_, ctx_value->value_);
}

unicode_string_view JSCCtx::CopyFunctionName(
    const std::shared_ptr<CtxValue>& function) {
  TDF_BASE_UNIMPLEMENTED();
  return "";
}

std::shared_ptr<CtxValue> JSCCtx::CreateObject() {
  JSClassDefinition fn_def = kJSClassDefinitionEmpty;
  JSClassRef cls_ref = JSClassCreate(&fn_def);
  JSObjectRef fn_obj = JSObjectMake(context_, cls_ref, nullptr);
  JSClassRelease(cls_ref);
  return std::make_shared<JSCCtxValue>(context_, fn_obj);
}


std::shared_ptr<CtxValue> JSCCtx::CreateNumber(double number) {
  JSValueRef value = JSValueMakeNumber(context_, number);
  return std::make_shared<JSCCtxValue>(context_, value);
}

std::shared_ptr<CtxValue> JSCCtx::CreateBoolean(bool b) {
  JSValueRef value = JSValueMakeBoolean(context_, b);
  return std::make_shared<JSCCtxValue>(context_, value);
}

std::shared_ptr<CtxValue> JSCCtx::CreateString(
    const unicode_string_view& str_view) {
  JSStringRef str_ref = JSCVM::CreateJSCString(str_view);
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

std::shared_ptr<CtxValue> JSCCtx::CreateObject(const std::unordered_map<
    unicode_string_view,
    std::shared_ptr<CtxValue>>& object) {
  std::unordered_map<std::shared_ptr<CtxValue>,std::shared_ptr<CtxValue>> obj;
  for (const auto& it : object) {
    auto key = CreateString(it.first);
    obj[key] = it.second;
  }
  return CreateObject(obj);
}

std::shared_ptr<CtxValue> JSCCtx::CreateObject(const std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>> &object) {
  JSClassDefinition cls_def = kJSClassDefinitionEmpty;
  JSClassRef cls_ref = JSClassCreate(&cls_def);
  JSObjectRef obj = JSObjectMake(context_, cls_ref, nullptr);
  JSClassRelease(cls_ref);
  JSValueRef exception = nullptr;
  for (const auto& it : object) {
    unicode_string_view key;
    auto flag = GetValueString(it.first, &key);
    TDF_BASE_DCHECK(flag);
    if (!flag) {
      auto error = CreateError("CreateObject");
      SetException(std::static_pointer_cast<JSCCtxValue>(error));
      return nullptr;
    }
    auto object_key = JSCVM::CreateJSCString(key);
    auto ctx_value = std::static_pointer_cast<JSCCtxValue>(it.second);
    auto object_value = JSValueToObject(context_, ctx_value->value_, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return nullptr;
    }
    JSObjectSetProperty(context_, obj, object_key, object_value, kJSPropertyAttributeNone, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return nullptr;
    }
  }
  return std::make_shared<JSCCtxValue>(context_, obj);
}

std::shared_ptr<CtxValue> JSCCtx::CreateArray(
    size_t count,
    std::shared_ptr<CtxValue> array[]) {

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

std::shared_ptr<CtxValue> JSCCtx::CreateError(
    const unicode_string_view& msg) {
  JSStringRef str_ref = JSCVM::CreateJSCString(msg);
  JSValueRef value = JSValueMakeString(context_, str_ref);
  JSStringRelease(str_ref);
  JSValueRef values[] = {value};
  JSObjectRef error = JSObjectMakeError(context_, 1, values, nullptr);
  return std::make_shared<JSCCtxValue>(context_, error);
}

std::shared_ptr<CtxValue> JSCCtx::CopyArrayElement(
    const std::shared_ptr<CtxValue>& array,
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
    const std::shared_ptr<CtxValue>& value,
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
  JSStringRef property_name = JSCVM::CreateJSCString(name);
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
    const std::shared_ptr<CtxValue>& function,
    size_t argc,
    const std::shared_ptr<CtxValue> argv[]) {
  auto func_value = std::static_pointer_cast<JSCCtxValue>(function);
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
    auto arg_value = std::static_pointer_cast<JSCCtxValue>(argv[i]);
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

unicode_string_view JSCCtx::GetExceptionMsg(
    const std::shared_ptr<CtxValue>& exception) {
  if (!exception) {
    return unicode_string_view();
  }

  std::shared_ptr<CtxValue> msg_obj = CopyNamedProperty(
      exception, unicode_string_view(kMessageStr, arraysize(kMessageStr) - 1));
  unicode_string_view msg_view;
  GetValueString(msg_obj, &msg_view);
  std::u16string u16_msg;
  if (!StringViewUtils::IsEmpty(msg_view)) {
    u16_msg = msg_view.utf16_value();
  }
  std::shared_ptr<CtxValue> stack_obj = CopyNamedProperty(
      exception, unicode_string_view(kStackStr, arraysize(kStackStr) - 1));
  unicode_string_view stack_view;
  GetValueString(stack_obj, &stack_view);
  std::u16string u16_stack;
  if (!StringViewUtils::IsEmpty(stack_view)) {
    u16_stack = stack_view.utf16_value();
  }
  std::u16string str = u"message: " + u16_msg + u", stack: " + u16_stack;
  unicode_string_view ret(str.c_str(), str.length());
  TDF_BASE_DLOG(ERROR) << "GetExceptionMsg msg = " << ret;
  return ret;
}

void JSCCtx::ThrowException(const std::shared_ptr<CtxValue> &exception) {
  SetException(std::static_pointer_cast<JSCCtxValue>(exception));
}

void JSCCtx::ThrowException(const unicode_string_view& exception) {
  ThrowException(CreateError(exception));
}

void JSCCtx::HandleUncaughtException(const std::shared_ptr<CtxValue>& exception) {
  if (!exception) {
    return;
  }

  auto global_object = GetGlobalObject();
  auto exception_handler = GetProperty(global_object, kHippyErrorHandlerName);
  if (!IsFunction(exception_handler)) {
    const auto& source_code = hippy::GetNativeSourceCode(kErrorHandlerJSName);
    TDF_BASE_DCHECK(source_code.data_ && source_code.length_);
    unicode_string_view content(reinterpret_cast<const unicode_string_view::char8_t_ *>(source_code.data_),
                                source_code.length_);
    exception_handler = RunScript(content, kErrorHandlerJSName);
    bool is_func = IsFunction(exception_handler);
    TDF_BASE_CHECK(is_func) << "HandleUncaughtJsError ExceptionHandle.js don't return function!!!";

    auto exception_handler_key = CreateString(kHippyErrorHandlerName);
    SetProperty(global_object, exception_handler_key, exception_handler, PropertyAttribute::ReadOnly);
  }

  std::shared_ptr<CtxValue> args[2];
  args[0] = CreateString("uncaughtException");
  args[1] = exception;
  CallFunction(exception_handler, 2, args);
}

JSPropertyAttributes ConvertPropertyAttribute(PropertyAttribute attr) {
  switch (attr) {
    case None:
      return kJSPropertyAttributeNone;
      break;
    case ReadOnly:
      return kJSPropertyAttributeReadOnly;
      break;
    case DontEnum:
      return kJSPropertyAttributeDontEnum;
      break;
    case DontDelete:
      return kJSPropertyAttributeDontDelete;
      break;
    default:
      return kJSPropertyAttributeNone;
      break;
  }
}

bool JSCCtx::SetProperty(std::shared_ptr<CtxValue> object,
                        std::shared_ptr<CtxValue> key,
                        std::shared_ptr<CtxValue> value) {
  return SetProperty(object, key, value, hippy::napi::PropertyAttribute::None);
}

bool JSCCtx::SetProperty(std::shared_ptr<CtxValue> object,
                        std::shared_ptr<CtxValue> key,
                        std::shared_ptr<CtxValue> value,
                         const PropertyAttribute& attr) {
  auto jsc_obj = std::static_pointer_cast<JSCCtxValue>(object);
  JSValueRef js_error = nullptr;
  JSObjectRef obj_ref = JSValueToObject(context_, jsc_obj->value_, &js_error);
  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
    return false;
  }

  auto jsc_key = std::static_pointer_cast<JSCCtxValue>(key);
  JSStringRef key_ref = JSValueToStringCopy(context_, jsc_key->value_, &js_error);
  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
    return false;
  }

  auto jsc_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSPropertyAttributes jsc_attr = ConvertPropertyAttribute(attr);
  JSObjectSetProperty(context_, obj_ref, key_ref, jsc_value->value_, jsc_attr, &js_error);
  JSStringRelease(key_ref);
  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
    return false;
  }
  return true;
}

std::shared_ptr<CtxValue> JSCCtx::GetProperty(
    const std::shared_ptr<CtxValue>& obj,
    const unicode_string_view& name) {
  TDF_BASE_CHECK(obj);
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(obj);
  JSValueRef value_ref = ctx_value->value_;
  if (!JSValueIsObject(context_, value_ref)) {
    return nullptr;
  }
  JSValueRef js_error = nullptr;
  JSObjectRef obj_ref = JSValueToObject(context_, value_ref, &js_error);
  JSStringRef name_ref = JSCVM::CreateJSCString(name);
  JSValueRef prop_ref = JSObjectGetProperty(context_, obj_ref, name_ref, &js_error);
  JSStringRelease(name_ref);
  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
    return nullptr;
  }
  return std::make_shared<JSCCtxValue>(context_, prop_ref);
}

std::shared_ptr<CtxValue> JSCCtx::GetProperty(
    const std::shared_ptr<CtxValue>& obj,
    std::shared_ptr<CtxValue> key) {
  TDF_BASE_CHECK(obj && key);
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(obj);
  JSValueRef value_ref = ctx_value->value_;
  if (!JSValueIsObject(context_, value_ref)) {
    return nullptr;
  }
  JSValueRef js_error = nullptr;
  JSObjectRef obj_ref = JSValueToObject(context_, value_ref, &js_error);
  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
    return nullptr;
  }
  auto key_value = std::static_pointer_cast<JSCCtxValue>(key);
  JSValueRef key_ref = key_value->value_;
  JSStringRef key_str_ref = JSValueToStringCopy(context_, key_ref, &js_error);
  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
    return nullptr;
  }
  JSValueRef prop_ref = JSObjectGetProperty(context_, obj_ref, key_str_ref, &js_error);
  JSStringRelease(key_str_ref);
  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
    return nullptr;
  }
  return std::make_shared<JSCCtxValue>(context_, prop_ref);
}

std::shared_ptr<CtxValue> JSCCtx::RunScript(
    const unicode_string_view& data,
    const unicode_string_view& file_name) {
  if (StringViewUtils::IsEmpty(data)) {
    return nullptr;
  }

  JSStringRef js = JSCVM::CreateJSCString(data);
  JSValueRef js_error = nullptr;
  JSStringRef file_name_ref = nullptr;
  if (!StringViewUtils::IsEmpty(file_name)) {
    file_name_ref = JSCVM::CreateJSCString(file_name);
  }
  JSValueRef value =
      JSEvaluateScript(context_, js, nullptr, file_name_ref, 1, &js_error);

  if (file_name_ref) {
    JSStringRelease(file_name_ref);
  }
  JSStringRelease(js);

  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
    return nullptr;
  }

  if (!value) {
    return nullptr;
  }

  return std::make_shared<JSCCtxValue>(context_, value);
}

std::shared_ptr<JSValueWrapper> JSCCtx::ToJsValueWrapper(
    const std::shared_ptr<CtxValue>& value) {
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (JSValueIsUndefined(context_, value_ref)) {
    return std::make_shared<JSValueWrapper>(JSValueWrapper::Undefined());
  } else if (JSValueIsNull(context_, value_ref)) {
    return std::make_shared<JSValueWrapper>(JSValueWrapper::Null());
  } else if (JSValueIsBoolean(context_, value_ref)) {
    bool jsc_value = JSValueToBoolean(context_, value_ref);
    return std::make_shared<JSValueWrapper>(jsc_value);
  } else if (JSValueIsString(context_, value_ref)) {
    JSStringRef str_ref = JSValueToStringCopy(context_, value_ref, nullptr);
    size_t size = JSStringGetMaximumUTF8CStringSize(str_ref);
    std::vector<char> buffer(size);
    JSStringGetUTF8CString(str_ref, buffer.data(), size);
    std::shared_ptr<JSValueWrapper> ret =
        std::make_shared<JSValueWrapper>(buffer.data());
    JSStringRelease(str_ref);
    return ret;
  } else if (JSValueIsNumber(context_, value_ref)) {
    double jsc_value = JSValueToNumber(context_, value_ref, nullptr);
    return std::make_shared<JSValueWrapper>(jsc_value);
  } else if (JSValueIsArray(context_, value_ref)) {
    JSObjectRef array_ref = JSValueToObject(context_, value_ref, nullptr);
    JSStringRef prop_name = JSStringCreateWithCharacters(
        reinterpret_cast<const JSChar*>(kLengthStr), arraysize(kLengthStr) - 1);
    JSValueRef val =
        JSObjectGetProperty(context_, array_ref, prop_name, nullptr);
    JSStringRelease(prop_name);
    uint32_t count = JSValueToNumber(context_, val, nullptr);
    JSValueWrapper::JSArrayType ret;
    for (uint32_t i = 0; i < count; ++i) {
      JSValueRef element =
          JSObjectGetPropertyAtIndex(context_, array_ref, i, nullptr);
      std::shared_ptr<JSValueWrapper> value_obj =
          ToJsValueWrapper(std::make_shared<JSCCtxValue>(context_, element));
      ret.push_back(*value_obj);
    }
    return std::make_shared<JSValueWrapper>(std::move(ret));
  } else if (JSValueIsObject(context_, value_ref)) {
    JSObjectRef obj_value = JSValueToObject(context_, value_ref, nullptr);
    JSPropertyNameArrayRef name_arry =
        JSObjectCopyPropertyNames(context_, obj_value);
    size_t len = JSPropertyNameArrayGetCount(name_arry);
    JSValueWrapper::JSObjectType ret;
    for (uint32_t i = 0; i < len; ++i) {
      JSStringRef props_key = JSPropertyNameArrayGetNameAtIndex(name_arry, i);
      JSValueRef props_value =
          JSObjectGetProperty(context_, obj_value, props_key, nullptr);
      size_t size = JSStringGetMaximumUTF8CStringSize(props_key);
      std::vector<char> buffer(size);
      JSStringGetUTF8CString(props_key, buffer.data(), size);
      std::string key_obj(buffer.data());
      std::shared_ptr<JSCCtxValue> props_value_obj =
          std::make_shared<JSCCtxValue>(context_, props_value);
      std::shared_ptr<JSValueWrapper> value_obj =
          ToJsValueWrapper(props_value_obj);
      ret[key_obj] = *value_obj;
    }
    JSPropertyNameArrayRelease(name_arry);
    return std::make_shared<JSValueWrapper>(ret);
  }

  TDF_BASE_UNIMPLEMENTED();
  return nullptr;
}

std::shared_ptr<CtxValue> JSCCtx::CreateCtxValue(
    const std::shared_ptr<JSValueWrapper>& wrapper) {
  if (wrapper->IsUndefined()) {
    return CreateUndefined();
  } else if (wrapper->IsNull()) {
    return CreateNull();
  } else if (wrapper->IsString()) {
    std::string str = wrapper->StringValue();
    unicode_string_view str_view(StringViewUtils::ToU8Pointer(str.c_str()),
                                 str.length());
    return CreateString(str_view);
  } else if (wrapper->IsInt32()) {
    return CreateNumber(wrapper->Int32Value());
  } else if (wrapper->IsDouble()) {
    return CreateNumber(wrapper->DoubleValue());
  } else if (wrapper->IsBoolean()) {
    return CreateBoolean(wrapper->DoubleValue());
  } else if (wrapper->IsArray()) {
    auto arr = wrapper->ArrayValue();
    std::shared_ptr<CtxValue> args[arr.size()];
    for (auto i = 0; i < arr.size(); ++i) {
      args[i] = CreateCtxValue(std::make_shared<JSValueWrapper>(arr[i]));
    }
    return CreateArray(arr.size(), args);
  } else if (wrapper->IsObject()) {
    JSClassDefinition cls_def = kJSClassDefinitionEmpty;
    JSClassRef cls_ref = JSClassCreate(&cls_def);
    JSObjectRef obj_ref = JSObjectMake(context_, cls_ref, nullptr);
    JSClassRelease(cls_ref);

    auto obj = wrapper->ObjectValue();
    for (const auto& p : obj) {
      auto obj_key = p.first;
      auto obj_value = p.second;
      JSStringRef prop_key = JSStringCreateWithUTF8CString(obj_key.c_str());
      std::shared_ptr<JSCCtxValue> ctx_value =
          std::static_pointer_cast<JSCCtxValue>(
              CreateCtxValue(std::make_shared<JSValueWrapper>(obj_value)));
      JSValueRef prop_value = ctx_value->value_;
      JSObjectSetProperty(context_, obj_ref, prop_key, prop_value, kJSPropertyAttributeNone, nullptr);
      JSStringRelease(prop_key);
    }
    return std::make_shared<JSCCtxValue>(context_, obj_ref);
  }
  TDF_BASE_UNIMPLEMENTED();
  return nullptr;
}

bool JSCCtx::IsNullOrUndefined(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return true;
  }
  std::shared_ptr<JSCCtxValue> ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  return (JSValueIsNull(context_, value_ref) || JSValueIsUndefined(context_, value_ref));
}

}  // namespace napi
}  // namespace hippy
