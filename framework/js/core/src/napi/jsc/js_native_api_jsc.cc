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

#include "core/napi/jsc/js_native_api_jsc.h"

#include <iostream>
#include <mutex>
#include <string>
#include <vector>

#include "base/logging.h"
#include "core/base/string_view_utils.h"
#include "core/napi/callback_info.h"
#include "core/napi/js_native_api.h"
#include "core/napi/jsc/js_native_jsc_helper.h"

namespace hippy {
namespace napi {

using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;
using JSValueWrapper = hippy::base::JSValueWrapper;
using DomValue = tdf::base::DomValue;

const char16_t kGlobalStr[] = u"global";

JSValueRef JsCallbackFunc(JSContextRef ctx,
                          JSObjectRef function,
                          JSObjectRef thisObject,
                          size_t argumentCount,
                          const JSValueRef arguments[],
                          JSValueRef* exception_ref) {
  void* data = JSObjectGetPrivate(function);
  if (!data) {
    return JSValueMakeUndefined(ctx);
  }
  FunctionData* fn_data = reinterpret_cast<FunctionData*>(data);
  std::shared_ptr<Scope> scope = fn_data->scope_.lock();
  if (!scope) {
    return JSValueMakeUndefined(ctx);
  }
  JsCallback cb = fn_data->callback_;
  std::shared_ptr<JSCCtx> context =
      std::static_pointer_cast<JSCCtx>(scope->GetContext());
  CallbackInfo info(scope);
  for (size_t i = 0; i < argumentCount; i++) {
    info.AddValue(
        std::make_shared<JSCCtxValue>(context->GetCtxRef(), arguments[i]));
  }
  cb(info);

  std::shared_ptr<JSCCtxValue> exception =
      std::static_pointer_cast<JSCCtxValue>(info.GetExceptionValue()->Get());
  if (exception) {
    *exception_ref = exception->value_;
    return JSValueMakeUndefined(ctx);
  }

  std::shared_ptr<JSCCtxValue> ret_value =
      std::static_pointer_cast<JSCCtxValue>(info.GetReturnValue()->Get());
  if (!ret_value) {
    return JSValueMakeUndefined(ctx);
  }

  JSValueRef valueRef = ret_value->value_;
  return valueRef;
}

JSObjectRef RegisterModule(std::shared_ptr<Scope> scope,
                           JSContextRef ctx,
                           const unicode_string_view& module_name,
                           ModuleClass module) {
  JSClassDefinition cls_def = kJSClassDefinitionEmpty;
  TDF_BASE_DCHECK(module_name.encoding() ==
                  unicode_string_view::Encoding::Latin1);
  cls_def.className = module_name.latin1_value().c_str();
  JSClassRef cls_ref = JSClassCreate(&cls_def);
  JSObjectRef module_obj = JSObjectMake(ctx, cls_ref, nullptr);
  JSClassRelease(cls_ref);
  for (auto fn : module) {
    JSClassDefinition fn_def = kJSClassDefinitionEmpty;
    TDF_BASE_DCHECK(fn.first.encoding() ==
                    unicode_string_view::Encoding::Latin1);
    fn_def.className = fn.first.latin1_value().c_str();
    fn_def.callAsFunction = JsCallbackFunc;
    std::unique_ptr<FunctionData> fn_data =
        std::make_unique<FunctionData>(scope, fn.second);
    JSClassRef fn_ref = JSClassCreate(&fn_def);
    JSObjectRef fn_obj =
        JSObjectMake(ctx, fn_ref, reinterpret_cast<void*>(fn_data.get()));
    JSStringRef fn_str_ref = JSStringCreateWithUTF8CString(fn_def.className);
    JSObjectSetProperty(ctx, module_obj, fn_str_ref, fn_obj,
                        kJSPropertyAttributeReadOnly, nullptr);
    JSStringRelease(fn_str_ref);
    JSClassRelease(fn_ref);
    scope->SaveFunctionData(std::move(fn_data));
  }

  std::shared_ptr<JSCCtx> context =
      std::static_pointer_cast<JSCCtx>(scope->GetContext());
  std::shared_ptr<JSCCtxValue> module_value =
      std::make_shared<JSCCtxValue>(context->GetCtxRef(), module_obj);
  scope->AddModuleValue(module_name, module_value);
  return module_obj;
}

std::shared_ptr<VM> CreateVM(const std::shared_ptr<VMInitParam>& param) {
  return std::make_shared<JSCVM>();
}

std::shared_ptr<TryCatch> CreateTryCatchScope(bool enable,
                                              std::shared_ptr<Ctx> ctx) {
  return std::make_shared<JSCTryCatch>(enable, ctx);
}

JSCTryCatch::JSCTryCatch(bool enable, std::shared_ptr<Ctx> ctx)
    : TryCatch(enable, ctx) {
  is_verbose_ = false;
}

JSCTryCatch::~JSCTryCatch() {
  if (HasCaught()) {
    if (is_rethrow_ || is_verbose_) {
      std::shared_ptr<JSCCtx> ctx = std::static_pointer_cast<JSCCtx>(ctx_);
      ctx->SetException(exception_);
      if (is_rethrow_) {
        ctx->SetExceptionHandled(false);
      } else {
        ctx->SetExceptionHandled(true);
      }
    }
  }
}

void JSCTryCatch::ReThrow() {
  is_rethrow_ = true;
}

bool JSCTryCatch::HasCaught() {
  if (enable_) {
    return !!exception_;
  }
  return false;
}

bool JSCTryCatch::CanContinue() {
  if (enable_) {
    return !exception_;
  }
  return true;
}

bool JSCTryCatch::HasTerminated() {
  if (enable_) {
    return !!exception_;
  }
  return false;
}

bool JSCTryCatch::IsVerbose() {
  return is_verbose_;
}

void JSCTryCatch::SetVerbose(bool is_verbose) {
  is_verbose_ = is_verbose;
}

std::shared_ptr<CtxValue> JSCTryCatch::Exception() {
  return exception_;
}

unicode_string_view JSCTryCatch::GetExceptionMsg() {
  if (enable_) {
    std::shared_ptr<JSCCtx> ctx = std::static_pointer_cast<JSCCtx>(ctx_);
    return ctx->GetExceptionMsg(exception_);
  }
  return "";
}

void DetachThread() {}

void JSCVM::RegisterUncaughtExceptionCallback() {}

std::shared_ptr<Ctx> JSCVM::CreateContext() {
  return std::make_shared<JSCCtx>(vm_);
}

JSValueRef GetInternalBinding(JSContextRef ctx,
                              JSObjectRef function,
                              JSObjectRef thisObject,
                              size_t argc,
                              const JSValueRef argv[],
                              JSValueRef* exception) {
  if (argc <= 0) {
    return JSValueMakeNull(ctx);
  }

  JSValueRef name_ref = argv[0];
  if (!JSValueIsString(ctx, name_ref)) {
    return JSValueMakeNull(ctx);
  }

  BindingData* binding_data =
      reinterpret_cast<BindingData*>(JSObjectGetPrivate(function));
  std::shared_ptr<Scope> scope = binding_data->scope_.lock();
  if (!scope) {
    return JSValueMakeNull(ctx);
  }

  JSStringRef name_str_ref = JSValueToStringCopy(ctx, name_ref, nullptr);
  unicode_string_view module_name = ToStrView(name_str_ref);
  JSStringRelease(name_str_ref);

  std::string module_name_str = StringViewUtils::ToU8StdStr(module_name);
  module_name = unicode_string_view(module_name_str);  // content is latin

  std::shared_ptr<JSCCtxValue> module_value =
      std::static_pointer_cast<JSCCtxValue>(scope->GetModuleValue(module_name));
  if (module_value) {
    return module_value->value_;
  }

  ModuleClassMap module_class_map = binding_data->map_;
  auto it = module_class_map.find(module_name);
  if (it == module_class_map.end()) {
    return JSValueMakeNull(ctx);
  }

  return RegisterModule(scope, ctx, module_name, it->second);
}

std::shared_ptr<CtxValue> GetInternalBindingFn(const std::shared_ptr<Scope>& scope) {
  std::shared_ptr<JSCCtx> context =
      std::static_pointer_cast<JSCCtx>(scope->GetContext());
  JSClassDefinition cls_def = kJSClassDefinitionEmpty;
  cls_def.callAsFunction = GetInternalBinding;
  JSClassRef cls_ref = JSClassCreate(&cls_def);
  JSObjectRef func = JSObjectMake(context->GetCtxRef(), cls_ref,
                                  scope->GetBindingData().get());
  JSClassRelease(cls_ref);
  return std::make_shared<JSCCtxValue>(context->GetCtxRef(), func);
}

bool JSCCtx::RegisterGlobalInJs() {
  JSStringRef global_ref = CreateWithCharacters(kGlobalStr);
  // JSStringRef global_ref = JSStringCreateWithUTF8CString("global");
  JSObjectSetProperty(context_, JSContextGetGlobalObject(context_), global_ref,
                      JSContextGetGlobalObject(context_),
                      kJSPropertyAttributeDontDelete, nullptr);
  JSStringRelease(global_ref);

  return true;
}

bool JSCCtx::SetGlobalJsonVar(const unicode_string_view& name,
                              const unicode_string_view& json) {
  JSObjectRef global_obj = JSContextGetGlobalObject(context_);
  JSStringRef name_ref = CreateJSCString(name);
  JSStringRef json_ref = CreateJSCString(json);
  JSValueRef value_ref = JSValueMakeFromJSONString(context_, json_ref);
  JSValueRef js_error = nullptr;
  JSObjectSetProperty(context_, global_obj, name_ref, value_ref,
                      kJSPropertyAttributeNone, &js_error);
  JSStringRelease(name_ref);
  JSStringRelease(json_ref);
  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
    return false;
  }
  return true;
}

bool JSCCtx::SetGlobalStrVar(const unicode_string_view& name,
                             const unicode_string_view& str) {
  JSObjectRef global_obj = JSContextGetGlobalObject(context_);
  JSStringRef name_ref = CreateJSCString(name);
  JSStringRef str_ref = CreateJSCString(str);
  JSValueRef value_ref = JSValueMakeString(context_, str_ref);
  JSValueRef js_error = nullptr;
  JSObjectSetProperty(context_, global_obj, name_ref, value_ref,
                      kJSPropertyAttributeNone, &js_error);
  JSStringRelease(name_ref);
  JSStringRelease(str_ref);
  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
    return false;
  }
  return true;
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

bool JSCCtx::SetGlobalObjVar(const unicode_string_view& name,
                             const std::shared_ptr<CtxValue>& obj,
                             const PropertyAttribute& attr) {
  JSObjectRef global_obj = JSContextGetGlobalObject(context_);
  JSStringRef name_ref = CreateJSCString(name);
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(obj);
  JSValueRef value_ref = ctx_value->value_;
  JSPropertyAttributes jsc_attr = ConvertPropertyAttribute(attr);
  JSValueRef js_error = nullptr;
  JSObjectSetProperty(context_, global_obj, name_ref, value_ref, jsc_attr,
                      &js_error);
  JSStringRelease(name_ref);
  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
    return false;
  }
  return true;
}

std::shared_ptr<CtxValue> JSCCtx::GetGlobalStrVar(
    const unicode_string_view& name) {
  JSObjectRef global_obj = JSContextGetGlobalObject(context_);
  JSStringRef name_ref = CreateJSCString(name);
  JSValueRef js_error = nullptr;
  JSValueRef value_ref =
      JSObjectGetProperty(context_, global_obj, name_ref, &js_error);
  bool is_str = JSValueIsString(context_, value_ref);
  JSStringRelease(name_ref);
  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
  }
  if (is_str) {
    return std::make_shared<JSCCtxValue>(context_, value_ref);
  }
  return nullptr;
}

std::shared_ptr<CtxValue> JSCCtx::GetGlobalObjVar(
    const unicode_string_view& name) {
  JSObjectRef global_obj = JSContextGetGlobalObject(context_);
  JSStringRef name_ref = CreateJSCString(name);
  JSValueRef js_error = nullptr;
  JSValueRef value_ref =
      JSObjectGetProperty(context_, global_obj, name_ref, &js_error);
  bool is_undefined = JSValueIsUndefined(context_, value_ref);
  JSStringRelease(name_ref);
  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
  }
  if (is_undefined) {
    return nullptr;
  }
  return std::make_shared<JSCCtxValue>(context_, value_ref);
}

std::shared_ptr<CtxValue> JSCCtx::GetProperty(
    const std::shared_ptr<CtxValue>& obj,
    const unicode_string_view& name) {
  std::shared_ptr<JSCCtxValue> ctx_value =
      std::static_pointer_cast<JSCCtxValue>(obj);
  JSValueRef value_ref = ctx_value->value_;
  if (!JSValueIsObject(context_, value_ref)) {
    return nullptr;
  }
  JSValueRef js_error = nullptr;
  JSObjectRef obj_ref = JSValueToObject(context_, value_ref, &js_error);
  JSStringRef name_ref = CreateJSCString(name);
  JSValueRef prop_ref =
      JSObjectGetProperty(context_, obj_ref, name_ref, &js_error);
  bool is_undefined = JSValueIsUndefined(context_, prop_ref);
  JSStringRelease(name_ref);
  if (js_error) {
    SetException(std::make_shared<JSCCtxValue>(context_, js_error));
  }
  if (is_undefined) {
    return nullptr;
  }
  return std::make_shared<JSCCtxValue>(context_, prop_ref);
}

void JSCCtx::RegisterGlobalModule(const std::shared_ptr<Scope>& scope,
                                  const ModuleClassMap& module_cls_map) {
  std::shared_ptr<JSCCtx> ctx =
      std::static_pointer_cast<JSCCtx>(scope->GetContext());
  JSGlobalContextRef ctx_ref = ctx->GetCtxRef();
  for (const auto& module : module_cls_map) {
    RegisterModule(scope, ctx_ref, module.first, module.second);
  }
}

void JSCCtx::RegisterNativeBinding(const unicode_string_view& name,
                                   hippy::base::RegisterFunction fn,
                                   void* data) {
  TDF_BASE_NOTIMPLEMENTED();
}

std::shared_ptr<CtxValue> JSCCtx::GetJsFn(const unicode_string_view& name) {
  return GetGlobalObjVar(name);
}

std::shared_ptr<CtxValue> JSCCtx::RunScript(
    const unicode_string_view& data,
    const unicode_string_view& file_name,
    bool is_use_code_cache,
    unicode_string_view* cache,
    bool is_copy) {
  if (StringViewUtils::IsEmpty(data)) {
    return nullptr;
  }

  JSStringRef js = CreateJSCString(data);
  JSValueRef js_error = nullptr;
  JSStringRef file_name_ref = nullptr;
  if (!StringViewUtils::IsEmpty(file_name)) {
    file_name_ref = CreateJSCString(file_name);
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

  TDF_BASE_NOTIMPLEMENTED();
  return nullptr;
}

std::shared_ptr<CtxValue> JSCCtx::CreateCtxValue(
    const std::shared_ptr<JSValueWrapper>& wrapper) {
  if (!wrapper) {
    return nullptr;
  }
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
    return CreateBoolean(wrapper->BooleanValue());
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
      JSObjectSetProperty(context_, obj_ref, prop_key, prop_value,
                          kJSPropertyAttributeNone, nullptr);
      JSStringRelease(prop_key);
    }
    return std::make_shared<JSCCtxValue>(context_, obj_ref);
  }
  TDF_BASE_NOTIMPLEMENTED();
  return nullptr;
}

std::shared_ptr<DomValue> JSCCtx::ToDomValue(const std::shared_ptr<CtxValue>& value) {
  std::shared_ptr<JSCCtxValue> ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (JSValueIsUndefined(context_, value_ref)) {
    return std::make_shared<DomValue>(DomValue::Undefined());
  } else if (JSValueIsNull(context_, value_ref)) {
    return std::make_shared<DomValue>(DomValue::Null());
  } else if (JSValueIsBoolean(context_, value_ref)) {
    bool jsc_value = JSValueToBoolean(context_, value_ref);
    return std::make_shared<DomValue>(jsc_value);
  } else if (JSValueIsString(context_, value_ref)) {
    JSStringRef str_ref = JSValueToStringCopy(context_, value_ref, nullptr);
    size_t size = JSStringGetMaximumUTF8CStringSize(str_ref);
    std::vector<char> buffer(size);
    JSStringGetUTF8CString(str_ref, buffer.data(), size);
    std::shared_ptr<DomValue> ret = std::make_shared<DomValue>(buffer.data());
    JSStringRelease(str_ref);
    return ret;
  } else if (JSValueIsNumber(context_, value_ref)) {
    double jsc_value = JSValueToNumber(context_, value_ref, nullptr);
    return std::make_shared<DomValue>(jsc_value);
  } else if (JSValueIsArray(context_, value_ref)) {
    JSObjectRef array_ref = JSValueToObject(context_, value_ref, nullptr);
    JSStringRef prop_name = JSStringCreateWithCharacters(
      reinterpret_cast<const JSChar*>(kLengthStr), arraysize(kLengthStr) - 1);
    JSValueRef val = JSObjectGetProperty(context_, array_ref, prop_name, nullptr);
    JSStringRelease(prop_name);
    uint32_t count = JSValueToNumber(context_, val, nullptr);
    DomValue::DomValueArrayType ret;
    for (uint32_t i = 0; i < count; ++i) {
      JSValueRef element = JSObjectGetPropertyAtIndex(context_, array_ref, i, nullptr);
      std::shared_ptr<DomValue> value_obj = ToDomValue(
        std::make_shared<JSCCtxValue>(context_, element));
      ret.push_back(*value_obj);
    }
    return std::make_shared<DomValue>(std::move(ret));
  } else if (JSValueIsObject(context_, value_ref)) {
    JSObjectRef obj_value = JSValueToObject(context_, value_ref, nullptr);
    JSPropertyNameArrayRef name_arry = JSObjectCopyPropertyNames(context_, obj_value);
    size_t len = JSPropertyNameArrayGetCount(name_arry);
    DomValue::DomValueObjectType ret;
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
      std::shared_ptr<DomValue> value_obj =
        ToDomValue(props_value_obj);
      ret[key_obj] = *value_obj;
  }
  JSPropertyNameArrayRelease(name_arry);
  return std::make_shared<DomValue>(ret);
}

TDF_BASE_NOTIMPLEMENTED();
return nullptr;
}

std::shared_ptr<DomArgument> JSCCtx::ToDomArgument(const std::shared_ptr<CtxValue>& value) {
  #ifdef IOS
    //TODO 等待OCDomvalue完成,和OCDomvalue一起修改编译宏
  #else
    std::shared_ptr<JSCCtxValue> ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
    JSValueRef value_ref = ctx_value->value_;
    if (JSValueIsUndefined(context_, value_ref)) {
      return std::make_shared<DomArgument>(DomValue::Undefined());
    } else if (JSValueIsNull(context_, value_ref)) {
      return std::make_shared<DomArgument>(DomValue::Null());
    } else if (JSValueIsBoolean(context_, value_ref)) {
      bool jsc_value = JSValueToBoolean(context_, value_ref);
      return std::make_shared<DomArgument>(DomValue(jsc_value));
    } else if (JSValueIsString(context_, value_ref)) {
      JSStringRef str_ref = JSValueToStringCopy(context_, value_ref, nullptr);
      size_t size = JSStringGetMaximumUTF8CStringSize(str_ref);
      std::vector<char> buffer(size);
      JSStringGetUTF8CString(str_ref, buffer.data(), size);
      std::shared_ptr<DomArgument> ret = std::make_shared<DomArgument>(DomValue(buffer.data()));
      JSStringRelease(str_ref);
      return ret;
    } else if (JSValueIsNumber(context_, value_ref)) {
      double jsc_value = JSValueToNumber(context_, value_ref, nullptr);
      return std::make_shared<DomArgument>(DomValue(jsc_value));
    } else if (JSValueIsArray(context_, value_ref)) {
      JSObjectRef array_ref = JSValueToObject(context_, value_ref, nullptr);
      JSStringRef prop_name = JSStringCreateWithCharacters(
        reinterpret_cast<const JSChar*>(kLengthStr), arraysize(kLengthStr) - 1);
      JSValueRef val = JSObjectGetProperty(context_, array_ref, prop_name, nullptr);
      JSStringRelease(prop_name);
      uint32_t count = JSValueToNumber(context_, val, nullptr);
      DomValue::DomValueArrayType ret;
      for (uint32_t i = 0; i < count; ++i) {
        JSValueRef element = JSObjectGetPropertyAtIndex(context_, array_ref, i, nullptr);
        std::shared_ptr<DomValue> value_obj = ToDomValue(
          std::make_shared<JSCCtxValue>(context_, element));
        ret.push_back(*value_obj);
      }
      return std::make_shared<DomArgument>(DomValue(std::move(ret)));
    } else if (JSValueIsObject(context_, value_ref)) {
      JSObjectRef obj_value = JSValueToObject(context_, value_ref, nullptr);
      JSPropertyNameArrayRef name_arry = JSObjectCopyPropertyNames(context_, obj_value);
      size_t len = JSPropertyNameArrayGetCount(name_arry);
      DomValue::DomValueObjectType ret;
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
        std::shared_ptr<DomValue> value_obj =
          ToDomValue(props_value_obj);
        ret[key_obj] = *value_obj;
      }
      JSPropertyNameArrayRelease(name_arry);
      return std::make_shared<DomArgument>(DomValue(std::move(ret)));
    }

    TDF_BASE_NOTIMPLEMENTED();
    return nullptr;
  #endif
}

std::shared_ptr<CtxValue> JSCCtx::CreateCtxValue(const std::shared_ptr<DomValue>& wrapper) {
  if (!wrapper) {
    return nullptr;
  }
  if (wrapper->IsUndefined()) {
    return CreateUndefined();
  } else if (wrapper->IsNull()) {
    return CreateNull();
  } else if (wrapper->IsString()) {
    std::string str = wrapper->ToString();
    unicode_string_view str_view(StringViewUtils::ToU8Pointer(str.c_str()), str.length());
    return CreateString(str_view);
  } else if (wrapper->IsInt32()) {
    return CreateNumber(wrapper->ToInt32());
  } else if (wrapper->IsDouble()) {
    return CreateNumber(wrapper->ToDouble());
  } else if (wrapper->IsBoolean()) {
    return CreateBoolean(wrapper->ToBoolean());
  } else if (wrapper->IsArray()) {
    auto arr = wrapper->ToArray();
    std::shared_ptr<CtxValue> args[arr.size()];
    for (auto i = 0; i < arr.size(); ++i) {
      args[i] = CreateCtxValue(std::make_shared<DomValue>(arr[i]));
    }
    return CreateArray(arr.size(), args);
  } else if (wrapper->IsObject()) {
      JSClassDefinition cls_def = kJSClassDefinitionEmpty;
      JSClassRef cls_ref = JSClassCreate(&cls_def);
      JSObjectRef obj_ref = JSObjectMake(context_, cls_ref, nullptr);
      JSClassRelease(cls_ref);

      auto obj = wrapper->ToObject();
      for (const auto& p : obj) {
        auto obj_key = p.first;
        auto obj_value = p.second;
        JSStringRef prop_key = JSStringCreateWithUTF8CString(obj_key.c_str());
        std::shared_ptr<JSCCtxValue> ctx_value = std::static_pointer_cast<JSCCtxValue>(
          CreateCtxValue(std::make_shared<DomValue>(obj_value)));
        JSValueRef prop_value = ctx_value->value_;
        JSObjectSetProperty(context_, obj_ref, prop_key, prop_value, kJSPropertyAttributeNone, nullptr);
        JSStringRelease(prop_key);
      }
      return std::make_shared<JSCCtxValue>(context_, obj_ref);
    }
    TDF_BASE_NOTIMPLEMENTED();
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
