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

#include "driver/napi/jsc/jsc_ctx.h"

#include "footstone/logging.h"
#include "footstone/string_view_utils.h"
#include "driver/napi/jsc/jsc_ctx_value.h"
#include "driver/napi/callback_info.h"
#include "driver/vm/native_source_code.h"
#include "driver/vm/jsc/jsc_vm.h"

namespace hippy {
inline namespace driver {
inline namespace napi {

using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;
using JSCVM = hippy::vm::JSCVM;

const char kFunctionName[] = "Function";
constexpr char16_t kDefinePropertyStr[] = u"defineProperty";
constexpr char16_t kPrototypeStr[] = u"prototype";
constexpr char16_t kObjectStr[] = u"Object";
constexpr char16_t kGetStr[] = u"get";
constexpr char16_t kSetStr[] = u"set";

static std::once_flag global_class_flag;
static JSClassRef global_class;

JSCCtx::JSCCtx(JSContextGroupRef group, std::weak_ptr<VM> vm): vm_(vm) {
  std::call_once(global_class_flag, []() {
    JSClassDefinition global = kJSClassDefinitionEmpty;
    global_class = JSClassCreate(&global);
  });
  
  context_ = JSGlobalContextCreateInGroup(group, global_class);
  
  exception_ = nullptr;
  is_exception_handled_ = false;
  
}

JSCCtx::~JSCCtx() {
  JSGlobalContextRelease(context_);
  auto vm = vm_.lock();
  FOOTSTONE_CHECK(vm);
  auto jsc_vm = std::static_pointer_cast<JSCVM>(vm);
  auto& holder = jsc_vm->constructor_data_holder_;
  for (auto& item : holder) {
    item->prototype = nullptr;
  }
}

JSValueRef InvokeJsCallback(JSContextRef ctx,
                            JSObjectRef function,
                            JSObjectRef object,
                            size_t argument_count,
                            const JSValueRef arguments[],
                            JSValueRef* exception_ref) {
  void* data = JSObjectGetPrivate(function);
  if (!data) {
    return JSValueMakeUndefined(ctx);
  }
  auto function_wrapper = reinterpret_cast<FunctionWrapper*>(data);
  auto js_cb = function_wrapper->cb;
  void* external_data = function_wrapper->data;
  CallbackInfo cb_info;
  JSObjectRef global_obj = JSContextGetGlobalObject(ctx);
  auto global_external_data = JSObjectGetPrivate(global_obj);
  cb_info.SetSlot(global_external_data);
  auto context = const_cast<JSGlobalContextRef>(ctx);
  cb_info.SetReceiver(std::make_shared<JSCCtxValue>(context, object));
  auto object_private_data = JSObjectGetPrivate(object);
  if (object_private_data) {
    cb_info.SetData(reinterpret_cast<ConstructorData*>(object_private_data)->private_data);
  }
  for (size_t i = 0; i < argument_count; i++) {
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

JSObjectRef InvokeConstructorCallback(JSContextRef ctx,
                                      JSObjectRef constructor,
                                      size_t argument_count,
                                      const JSValueRef arguments[],
                                      JSValueRef* exception_ref) {
  void* data = JSObjectGetPrivate(constructor);
  if (!data) {
    return constructor;
  }
  auto constructor_data = reinterpret_cast<ConstructorData*>(data);
  auto function_wrapper = reinterpret_cast<FunctionWrapper*>(constructor_data->function_wrapper);
  auto js_cb = function_wrapper->cb;
  void* external_data = function_wrapper->data;
  CallbackInfo cb_info;
  JSObjectRef global_obj = JSContextGetGlobalObject(ctx);
  auto global_external_data = JSObjectGetPrivate(global_obj);
  cb_info.SetSlot(global_external_data);
  auto context = const_cast<JSGlobalContextRef>(ctx);
  auto proto = std::static_pointer_cast<JSCCtxValue>(constructor_data->prototype)->value_;
  JSObjectSetPrototype(ctx, constructor, proto);
  cb_info.SetReceiver(std::make_shared<JSCCtxValue>(context, constructor));
  for (size_t i = 0; i < argument_count; i++) {
    cb_info.AddValue(std::make_shared<JSCCtxValue>(context, arguments[i]));
  }
  js_cb(cb_info, external_data);
  auto privdate_data = cb_info.GetData();
  if (privdate_data) {
    constructor_data->private_data = privdate_data;
  }
  auto exception = std::static_pointer_cast<JSCCtxValue>(cb_info.GetExceptionValue()->Get());
  if (exception) {
    *exception_ref = exception->value_;
    return constructor;
  }
  
  auto ret_value = std::static_pointer_cast<JSCCtxValue>(cb_info.GetReturnValue()->Get());
  if (!ret_value) {
    return constructor;
  }
  
  JSObjectRef object = JSValueToObject(ctx, ret_value->value_, nullptr);
  return object;
}

std::shared_ptr<CtxValue> JSCCtx::CreateFunction(const std::unique_ptr<FunctionWrapper>& wrapper) {
  JSClassDefinition fn_def = kJSClassDefinitionEmpty;
  fn_def.callAsFunction = InvokeJsCallback;
  fn_def.attributes = kJSClassAttributeNoAutomaticPrototype;
  fn_def.initialize = [](JSContextRef ctx, JSObjectRef object) {
    JSObjectRef global = JSContextGetGlobalObject(ctx);
    JSValueRef value = JSObjectGetProperty(ctx, global, JSStringCreateWithUTF8CString(kFunctionName), nullptr);
    JSObjectRef base_func = JSValueToObject(ctx, value, nullptr);
    if (!base_func) {
      return;
    }
    JSValueRef proto = JSObjectGetPrototype(ctx, base_func);
    JSObjectSetPrototype(ctx, object, proto);
  };
  JSClassRef cls_ref = JSClassCreate(&fn_def);
  JSObjectRef fn_obj = JSObjectMake(context_, cls_ref, reinterpret_cast<void*>(wrapper.get()));
  JSClassRelease(cls_ref);
  return std::make_shared<JSCCtxValue>(context_, fn_obj);
}

static JSValueRef JSObjectGetPropertyCallback(JSContextRef ctx,
                                              JSObjectRef object,
                                              JSStringRef name,
                                              JSValueRef *exception_ref) {
  
  auto function_wrapper = JSObjectGetPrivate(object);
  auto context = const_cast<JSGlobalContextRef>(ctx);
  auto func_wrapper = reinterpret_cast<FunctionWrapper*>(function_wrapper);
  auto js_cb = func_wrapper->cb;
  void* external_data = func_wrapper->data;
  CallbackInfo cb_info;
  JSObjectRef global_obj = JSContextGetGlobalObject(ctx);
  auto global_external_data = JSObjectGetPrivate(global_obj);
  cb_info.SetSlot(global_external_data);
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

std::shared_ptr<CtxValue>  JSCCtx::DefineProxy(const std::unique_ptr<FunctionWrapper>& wrapper) {
  JSClassDefinition cls_def = kJSClassDefinitionEmpty;
  cls_def.getProperty = JSObjectGetPropertyCallback;
  auto cls_ref = JSClassCreate(&cls_def);
  JSObjectRef fn_obj = JSObjectMake(context_, cls_ref, reinterpret_cast<void*>(wrapper.get()));
  JSClassRelease(cls_ref);
  return std::make_shared<JSCCtxValue>(context_, fn_obj);
}

std::shared_ptr<CtxValue> JSCCtx::DefineClass(string_view name,
                                              const std::unique_ptr<FunctionWrapper>& constructor_wrapper,
                                              size_t property_count,
                                              std::shared_ptr<PropertyDescriptor> properties[]) {
  JSClassDefinition class_definition = kJSClassDefinitionEmpty;
  class_definition.attributes = kJSClassAttributeNone;
  class_definition.callAsConstructor = InvokeConstructorCallback;
  auto class_name = footstone::StringViewUtils::ToStdString(footstone::StringViewUtils::ConvertEncoding(name, string_view::Encoding::Utf8).utf8_value());
  class_definition.className = class_name.c_str();
  class_definition.finalize = [](JSObjectRef object) {
    auto constructor_data = reinterpret_cast<ConstructorData*>(JSObjectGetPrivate(object));
    auto weak_callback_wrapper = constructor_data->weak_callback_wrapper;
    if (weak_callback_wrapper) {
      auto wrapper = reinterpret_cast<WeakCallbackWrapper*>(weak_callback_wrapper);
      wrapper->cb(wrapper->data, constructor_data->private_data);
    }
  };
  auto cls_ref = JSClassCreate(&class_definition);


  auto prototype = JSObjectMake(context_, nullptr, nullptr);
  JSValueRef exception = nullptr;
  JSStringRef get_key_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar *>(kGetStr), ARRAY_SIZE(kGetStr) - 1);
  JSStringRef set_key_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar *>(kSetStr), ARRAY_SIZE(kSetStr) - 1);
  JSStringRef define_property_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar *>(kDefinePropertyStr), ARRAY_SIZE(kDefinePropertyStr) - 1);
  JSStringRef object_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar *>(kObjectStr), ARRAY_SIZE(kObjectStr) - 1);
  for (auto i = 0; i < property_count; ++i) {
    auto property_descriptor = properties[i];
    auto property_object = JSObjectMake(context_, nullptr, nullptr);
    if (property_descriptor->getter) {
      auto getter_function = CreateFunction(property_descriptor->getter);
      auto getter_function_value = std::static_pointer_cast<JSCCtxValue>(getter_function);
      JSObjectSetProperty(context_, property_object, get_key_name, getter_function_value->value_, kJSPropertyAttributeNone, &exception);
      if (exception) {
        SetException(std::make_shared<JSCCtxValue>(context_, exception));
        return nullptr;
      }
    }
    if (property_descriptor->setter) {
      auto setter_function = CreateFunction(property_descriptor->setter);
      auto setter_function_value = std::static_pointer_cast<JSCCtxValue>(setter_function);
      JSObjectSetProperty(context_, property_object, set_key_name, setter_function_value->value_, kJSPropertyAttributeNone, &exception);
      if (exception) {
        SetException(std::make_shared<JSCCtxValue>(context_, exception));
        return nullptr;
      }
    }
    if (property_descriptor->getter || property_descriptor->setter) {
      JSValueRef values[3];
      values[0] = prototype;
      auto name_value = std::static_pointer_cast<JSCCtxValue>(property_descriptor->name)->value_;
      if (exception) {
        SetException(std::make_shared<JSCCtxValue>(context_, exception));
        return nullptr;
      }
      values[1] = name_value;
      values[2] = property_object;

      JSValueRef object_value_ref = JSObjectGetProperty(context_, JSContextGetGlobalObject(context_), object_name, &exception);
      JSObjectRef object = JSValueToObject(context_, object_value_ref, &exception);
      JSValueRef define_property_value_ref = JSObjectGetProperty(context_, object, define_property_name, &exception);
      JSObjectRef define_property = JSValueToObject(context_, define_property_value_ref, &exception);
      JSObjectCallAsFunction(context_, define_property, object, 3, values, &exception);
      if (exception) {
        SetException(std::make_shared<JSCCtxValue>(context_, exception));
        return nullptr;
      }
    }
    if (property_descriptor->method) {
      auto function = CreateFunction(property_descriptor->method);
      auto function_value = std::static_pointer_cast<JSCCtxValue>(function)->value_;
      auto function_name = std::static_pointer_cast<JSCCtxValue>(property_descriptor->name)->value_;
      auto function_name_ref = JSValueToStringCopy(context_, function_name, &exception);
      if (exception) {
        SetException(std::make_shared<JSCCtxValue>(context_, exception));
        return nullptr;
      }
      JSObjectSetProperty(context_, prototype, function_name_ref, function_value, kJSPropertyAttributeNone, &exception);
    }
    property_descriptor->name = nullptr;
  }
  JSStringRelease(get_key_name);
  JSStringRelease(set_key_name);
  JSStringRelease(define_property_name);
  JSStringRelease(object_name);
  
  auto private_data = std::make_unique<ConstructorData>(reinterpret_cast<void*>(constructor_wrapper.get()), std::make_shared<JSCCtxValue>(context_, prototype));
  auto object = JSObjectMake(context_, cls_ref, private_data.get());
  SaveConstructorData(std::move(private_data));
  return std::make_shared<JSCCtxValue>(context_, object);
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
  if (external) {
    auto private_data = JSObjectGetPrivate(ret);
    if (private_data) {
      auto constructor_data = reinterpret_cast<ConstructorData*>(private_data);
      constructor_data->private_data = external;
    }
  }
  return std::make_shared<JSCCtxValue>(context_, ret);
}

void* JSCCtx::GetObjectExternalData(const std::shared_ptr<CtxValue>& object) {
  auto private_data = GetPrivateData(object);
  if (private_data) {
    auto constructor_data = reinterpret_cast<ConstructorData*>(private_data);
    return constructor_data->private_data;
  }
  return nullptr;
}

std::shared_ptr<CtxValue> JSCCtx::GetGlobalObject() {
  JSObjectRef global_obj = JSContextGetGlobalObject(context_);
  return std::make_shared<JSCCtxValue>(context_, global_obj);
}

void JSCCtx::SetExternalData(void* data) {
  JSObjectRef global_obj = JSContextGetGlobalObject(context_);
  auto flag = JSObjectSetPrivate(global_obj, data);
  FOOTSTONE_CHECK(flag);
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
                            string_view* result) {
  if (!value) {
    return false;
  }
  std::shared_ptr<JSCCtxValue> ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (JSValueIsString(context_, value_ref)) {
    JSValueRef exception = nullptr;
    JSStringRef str_ref = JSValueToStringCopy(context_, value_ref, &exception);
    if (exception) {
      JSStringRelease(str_ref);
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return false;
    }
    *result = string_view(reinterpret_cast<const char16_t*>(JSStringGetCharactersPtr(str_ref)),
                          JSStringGetLength(str_ref));
    JSStringRelease(str_ref);
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
                                                       reinterpret_cast<const JSChar*>(kLengthStr), ARRAY_SIZE(kLengthStr) - 1);
  exception = nullptr;
  JSValueRef val = JSObjectGetProperty(context_, array, prop_name, &exception);
  if (exception) {
    JSStringRelease(prop_name);
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

bool JSCCtx::IsByteBuffer(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (!JSValueIsObject(context_, value_ref)) {
    return false;
  }
  JSValueRef exception = nullptr;
  JSTypedArrayType type = JSValueGetTypedArrayType(context_, value_ref, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return false;
  }
  return kJSTypedArrayTypeNone != type;
}

bool JSCCtx::GetValueJson(const std::shared_ptr<CtxValue>& value,
                          string_view* result) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  JSValueRef exception = nullptr;
  JSStringRef str_ref = JSValueCreateJSONString(context_, value_ref, 0, &exception);
  if (exception) {
    JSStringRelease(str_ref);
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return false;
  }
  *result = string_view(
                        reinterpret_cast<const char16_t*>(JSStringGetCharactersPtr(str_ref)),
                        JSStringGetLength(str_ref));
  JSStringRelease(str_ref);
  return true;
}

bool JSCCtx::HasNamedProperty(const std::shared_ptr<CtxValue>& value,
                              const string_view& name) {
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

string_view JSCCtx::CopyFunctionName(const std::shared_ptr<CtxValue>& function) {
  FOOTSTONE_UNIMPLEMENTED();
  return "";
}

bool JSCCtx::GetEntries(const std::shared_ptr<CtxValue>& value,
                        std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  if (!JSValueIsObject(context_, value_ref)) {
    return false;
  }
  JSValueRef exception = nullptr;
  JSObjectRef obj_value = JSValueToObject(context_, value_ref, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return false;
  }
  JSPropertyNameArrayRef name_arry = JSObjectCopyPropertyNames(context_, obj_value);
  size_t len = JSPropertyNameArrayGetCount(name_arry);
  for (uint32_t i = 0; i < len; ++i) {
    JSStringRef key = JSPropertyNameArrayGetNameAtIndex(name_arry, i);
    JSValueRef prop_value = JSObjectGetProperty(context_, obj_value, key, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return false;
    }
    JSValueRef prop_key = JSValueMakeString(context_, key);
    map[std::make_shared<JSCCtxValue>(context_, prop_key)] = std::make_shared<JSCCtxValue>(context_, prop_value);
  }
  JSPropertyNameArrayRelease(name_arry);
  
  return true;
}

bool JSCCtx::Equals(const std::shared_ptr<CtxValue>& lhs, const std::shared_ptr<CtxValue>& rhs) {
  if (!lhs || !rhs) {
    return false;
  }
  auto lhs_value = std::static_pointer_cast<JSCCtxValue>(lhs);
  auto rhs_value =  std::static_pointer_cast<JSCCtxValue>(rhs);
  
  JSValueRef exception = nullptr;
  auto ret = JSValueIsEqual(context_, lhs_value->value_, rhs_value->value_, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return false;
  }
  return ret;
}

std::shared_ptr<CtxValue> JSCCtx::CreateObject() {
  JSClassDefinition fn_def = kJSClassDefinitionEmpty;
  JSClassRef cls_ref = JSClassCreate(&fn_def);
  JSObjectRef fn_obj = JSObjectMake(context_, cls_ref, nullptr);
  JSClassRelease(cls_ref);
  return std::make_shared<JSCCtxValue>(context_, fn_obj);
}

std::shared_ptr<CtxValue> JSCCtx::CreateMap(const std::map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>> &map) {
  FOOTSTONE_UNIMPLEMENTED();
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
                                               const string_view& str_view) {
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
                                               string_view,
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
    string_view key;
    auto flag = GetValueString(it.first, &key);
    FOOTSTONE_DCHECK(flag);
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
  if (count < 0) {
    return nullptr;
  }
  if (0 == count) {
    return std::make_shared<JSCCtxValue>(context_, JSObjectMakeArray(context_, 0, nullptr, nullptr));
  }
  
  JSValueRef values[count];  // NOLINT(runtime/arrays)
  for (size_t i = 0; i < count; i++) {
    auto ele_value = std::static_pointer_cast<JSCCtxValue>(array[i]);
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
                                              const string_view& msg) {
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
  JSValueRef element = JSObjectGetPropertyAtIndex(context_, array_ref, index, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  return std::make_shared<JSCCtxValue>(context_, element);
}

std::shared_ptr<CtxValue> JSCCtx::CopyNamedProperty(
                                                    const std::shared_ptr<CtxValue>& value,
                                                    const string_view& name) {
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

string_view JSCCtx::GetExceptionMsg(const std::shared_ptr<CtxValue>& exception) {
  if (!exception) {
    return string_view();
  }
  
  std::shared_ptr<CtxValue> msg_obj = CopyNamedProperty(exception, string_view(kMessageStr, ARRAY_SIZE(kMessageStr) - 1));
  string_view msg_view;
  GetValueString(msg_obj, &msg_view);
  std::u16string u16_msg;
  if (!StringViewUtils::IsEmpty(msg_view)) {
    u16_msg = msg_view.utf16_value();
  }
  std::shared_ptr<CtxValue> stack_obj = CopyNamedProperty(exception, string_view(kStackStr, ARRAY_SIZE(kStackStr) - 1));
  string_view stack_view;
  GetValueString(stack_obj, &stack_view);
  std::u16string u16_stack;
  if (!StringViewUtils::IsEmpty(stack_view)) {
    u16_stack = stack_view.utf16_value();
  }
  std::u16string str = u"message: " + u16_msg + u", stack: " + u16_stack;
  string_view ret(str.c_str(), str.length());
  FOOTSTONE_DLOG(ERROR) << "GetExceptionMsg msg = " << ret;
  return ret;
}

void* JSCCtx::GetPrivateData(const std::shared_ptr<CtxValue>& object) {
  auto object_value = std::static_pointer_cast<JSCCtxValue>(object);
  JSValueRef exception = nullptr;
  auto object_ref = JSValueToObject(context_, object_value->value_, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  return JSObjectGetPrivate(object_ref);
}

void JSCCtx::SaveConstructorData(std::unique_ptr<ConstructorData> constructor_data) {
  auto vm = vm_.lock();
  FOOTSTONE_CHECK(vm);
  auto jsc_vm = std::static_pointer_cast<JSCVM>(vm);
  jsc_vm->constructor_data_holder_.push_back(std::move(constructor_data));
}

void JSCCtx::ThrowException(const std::shared_ptr<CtxValue> &exception) {
  SetException(std::static_pointer_cast<JSCCtxValue>(exception));
}

void JSCCtx::ThrowException(const string_view& exception) {
  ThrowException(CreateError(exception));
}

//void JSCCtx::HandleUncaughtException(const std::shared_ptr<CtxValue>& exception) {
//  if (!exception) {
//    return;
//  }
//
//  auto global_object = GetGlobalObject();
//  auto exception_handler = GetProperty(global_object, kHippyErrorHandlerName);
//  if (!IsFunction(exception_handler)) {
//    const auto& source_code = hippy::GetNativeSourceCode(kErrorHandlerJSName);
//    TDF_BASE_DCHECK(source_code.data_ && source_code.length_);
//    string_view content(reinterpret_cast<const string_view::char8_t_ *>(source_code.data_),
//                                source_code.length_);
//    exception_handler = RunScript(content, kErrorHandlerJSName);
//    bool is_func = IsFunction(exception_handler);
//    FOOTSTONE_CHECK(is_func) << "HandleUncaughtJsError ExceptionHandle.js don't return function!!!";
//
//    auto exception_handler_key = CreateString(kHippyErrorHandlerName);
//    SetProperty(global_object, exception_handler_key, exception_handler, PropertyAttribute::ReadOnly);
//  }
//
//  std::shared_ptr<CtxValue> args[2];
//  args[0] = CreateString("uncaughtException");
//  args[1] = exception;
//  CallFunction(exception_handler, 2, args);
//}

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
  JSValueRef exception = nullptr;
  JSObjectRef obj_ref = JSValueToObject(context_, jsc_obj->value_, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return false;
  }
  
  auto jsc_key = std::static_pointer_cast<JSCCtxValue>(key);
  JSStringRef key_ref = JSValueToStringCopy(context_, jsc_key->value_, &exception);
  if (exception) {
    JSStringRelease(key_ref);
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return false;
  }
  
  auto jsc_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSPropertyAttributes jsc_attr = ConvertPropertyAttribute(attr);
  JSObjectSetProperty(context_, obj_ref, key_ref, jsc_value->value_, jsc_attr, &exception);
  JSStringRelease(key_ref);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return false;
  }
  return true;
}

std::shared_ptr<CtxValue> JSCCtx::GetProperty(const std::shared_ptr<CtxValue>& obj,
                                              const string_view& name) {
  FOOTSTONE_CHECK(obj);
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(obj);
  JSValueRef value_ref = ctx_value->value_;
  if (!JSValueIsObject(context_, value_ref)) {
    return nullptr;
  }
  JSValueRef exception = nullptr;
  JSObjectRef obj_ref = JSValueToObject(context_, value_ref, &exception);
  JSStringRef name_ref = JSCVM::CreateJSCString(name);
  JSValueRef prop_ref = JSObjectGetProperty(context_, obj_ref, name_ref, &exception);
  JSStringRelease(name_ref);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  return std::make_shared<JSCCtxValue>(context_, prop_ref);
}

std::shared_ptr<CtxValue> JSCCtx::GetProperty(const std::shared_ptr<CtxValue>& obj,
                                              std::shared_ptr<CtxValue> key) {
  FOOTSTONE_CHECK(obj && key);
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(obj);
  JSValueRef value_ref = ctx_value->value_;
  if (!JSValueIsObject(context_, value_ref)) {
    return nullptr;
  }
  JSValueRef exception = nullptr;
  JSObjectRef obj_ref = JSValueToObject(context_, value_ref, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  auto key_value = std::static_pointer_cast<JSCCtxValue>(key);
  JSValueRef key_ref = key_value->value_;
  JSStringRef key_str_ref = JSValueToStringCopy(context_, key_ref, &exception);
  if (exception) {
    JSStringRelease(key_str_ref);
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  JSValueRef prop_ref = JSObjectGetProperty(context_, obj_ref, key_str_ref, &exception);
  JSStringRelease(key_str_ref);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  return std::make_shared<JSCCtxValue>(context_, prop_ref);
}

std::shared_ptr<CtxValue> JSCCtx::RunScript(const string_view& data,
                                            const string_view& file_name) {
  if (StringViewUtils::IsEmpty(data)) {
    return nullptr;
  }
  
  JSStringRef js = JSCVM::CreateJSCString(data);
  JSValueRef exception = nullptr;
  JSStringRef file_name_ref = nullptr;
  if (!StringViewUtils::IsEmpty(file_name)) {
    file_name_ref = JSCVM::CreateJSCString(file_name);
  }
  JSValueRef value = JSEvaluateScript(context_, js, nullptr, file_name_ref, 1, &exception);
  if (file_name_ref) {
    JSStringRelease(file_name_ref);
  }
  JSStringRelease(js);
  
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  
  if (!value) {
    return nullptr;
  }
  
  return std::make_shared<JSCCtxValue>(context_, value);
}

bool JSCCtx::IsNull(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return true;
  }
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  return JSValueIsNull(context_, value_ref);
}

bool JSCCtx::IsUndefined(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return true;
  }
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  return JSValueIsUndefined(context_, value_ref);
}

bool JSCCtx::IsNullOrUndefined(const std::shared_ptr<CtxValue>& value) {
  return IsNull(value) || IsUndefined(value);
}

bool JSCCtx::IsBoolean(const std::shared_ptr<CtxValue> &value) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  return JSValueIsBoolean(context_, value_ref);
}

bool JSCCtx::IsNumber(const std::shared_ptr<CtxValue> &value) {
  if (!value) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  return JSValueIsNumber(context_, value_ref);
}

bool JSCCtx::IsMap(const std::shared_ptr<CtxValue> &value) {
  FOOTSTONE_UNIMPLEMENTED();
}

void JSCCtx_dataBufferFree(void* bytes, void* deallocatorContext) {
  free(bytes);
}

std::shared_ptr<CtxValue> JSCCtx::CreateByteBuffer(void* buffer, size_t length) {
  if (nullptr == buffer || 0 == length) {
    return nullptr;
  }
  JSValueRef exception = nullptr;
  JSValueRef value_ref = JSObjectMakeArrayBufferWithBytesNoCopy(context_, buffer, length, JSCCtx_dataBufferFree, nullptr, &exception);
  if (exception) {
    SetException(std::make_shared<hippy::napi::JSCCtxValue>(context_, exception));
    return nullptr;
  }
  return std::make_shared<hippy::napi::JSCCtxValue>(context_, value_ref);
}

bool JSCCtx::GetByteBuffer(const std::shared_ptr<CtxValue>& value,
                           void** out_data,
                           size_t& out_length,
                           uint32_t& out_type) {
  if (!value || *out_data) {
    return false;
  }
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
  JSValueRef value_ref = ctx_value->value_;
  JSObjectRef object_ref = JSValueToObject(context_, value_ref, nullptr);
  JSTypedArrayType type = JSValueGetTypedArrayType(context_, value_ref, nullptr);
  JSValueRef exception = nullptr;
  if (kJSTypedArrayTypeArrayBuffer == type) {
    *out_data = JSObjectGetArrayBufferBytesPtr(context_, object_ref, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return false;
    }
    out_length = JSObjectGetArrayBufferByteLength(context_, object_ref, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return false;
    }
  }
  else if (kJSTypedArrayTypeNone != type) {
    *out_data = JSObjectGetTypedArrayBytesPtr(context_, object_ref, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return false;
    }
    out_length = JSObjectGetTypedArrayByteLength(context_, object_ref, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return false;
    }
  }
  return true;
}

void JSCCtx::SetWeak(std::shared_ptr<CtxValue> value, const std::unique_ptr<WeakCallbackWrapper>& wrapper) {
  auto private_data = GetPrivateData(value);
  if (private_data) {
    auto constructor_data = reinterpret_cast<ConstructorData*>(private_data);
    constructor_data->weak_callback_wrapper = wrapper.get();
  }
}

}  // namespace napi
}
}  // namespace hippy
