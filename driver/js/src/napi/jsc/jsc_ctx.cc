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
#include "driver/napi/jsc/jsc_class_definition.h"
#include "driver/napi/callback_info.h"
#include "driver/vm/native_source_code.h"
#include "driver/vm/jsc/jsc_vm.h"


namespace hippy {
inline namespace driver {
inline namespace napi {

using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;
using JSCVM = hippy::vm::JSCVM;

constexpr char16_t kFunctionName[] = u"Function";
constexpr char16_t kDefinePropertyStr[] = u"defineProperty";
constexpr char16_t kPrototypeStr[] = u"prototype";
constexpr char16_t kObjectStr[] = u"Object";
constexpr char16_t kGetStr[] = u"get";
constexpr char16_t kSetStr[] = u"set";
constexpr char16_t kSetPrototypeOfName[] = u"setPrototypeOf";

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
  auto& holder = jsc_vm->constructor_data_holder_[this];
  for (auto& [key, item] : holder) {
    item->prototype = nullptr;
    JSCVM::ClearConstructorDataPtr(item.get());
  }
}

JSValueRef InvokeJsCallback(JSContextRef ctx,
                            JSObjectRef function,
                            JSObjectRef object,
                            size_t argument_count,
                            const JSValueRef arguments[],
                            JSValueRef* exception) {
  void* data = JSObjectGetPrivate(function);
  if (!data) {
    return JSValueMakeUndefined(ctx);
  }
  auto function_wrapper = reinterpret_cast<FunctionWrapper*>(data);
  auto js_cb = function_wrapper->callback;
  void* external_data = function_wrapper->data;
  CallbackInfo cb_info;
  JSObjectRef global_object = JSContextGetGlobalObject(ctx);
  auto global_external_data = JSObjectGetPrivate(global_object);
  cb_info.SetSlot(global_external_data);
  auto context = JSContextGetGlobalContext(ctx);
  cb_info.SetReceiver(std::make_shared<JSCCtxValue>(context, object));
  if (object != global_object) {
    auto object_private_data = JSObjectGetPrivate(object);
    if (object_private_data) {
      auto constructor_data = reinterpret_cast<ConstructorData*>(object_private_data);
      auto object_data = constructor_data->object_data_map[object];
      cb_info.SetData(object_data);
    }
  }
  for (size_t i = 0; i < argument_count; i++) {
    cb_info.AddValue(std::make_shared<JSCCtxValue>(context, arguments[i]));
  }
  js_cb(cb_info, external_data);
  auto exception_object = std::static_pointer_cast<JSCCtxValue>(cb_info.GetExceptionValue()->Get());
  if (exception_object) {
    *exception = exception_object->value_;
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
                                      JSValueRef* exception) {
  void* data = JSObjectGetPrivate(constructor);
  if (!data) {
    JSStringRef string_ref = JSCVM::CreateJSCString("InvokeConstructorCallback JSObjectGetPrivate error");
    *exception = JSValueMakeString(ctx, string_ref);
    JSStringRelease(string_ref);
    return constructor;
  }
  auto constructor_data = reinterpret_cast<ConstructorData*>(data);
  auto class_def = constructor_data->class_ref;
  auto instance = JSObjectMake(ctx, class_def, constructor_data);
  auto function_wrapper = reinterpret_cast<FunctionWrapper*>(constructor_data->function_wrapper);
  auto js_cb = function_wrapper->callback;
  void* external_data = function_wrapper->data;
  CallbackInfo cb_info;
  JSObjectRef global_obj = JSContextGetGlobalObject(ctx);
  auto global_external_data = JSObjectGetPrivate(global_obj);
  cb_info.SetSlot(global_external_data);
  auto context = JSContextGetGlobalContext(ctx);
  auto proto = std::static_pointer_cast<JSCCtxValue>(constructor_data->prototype)->value_;
  JSObjectSetPrototype(ctx, instance, proto);
  cb_info.SetReceiver(std::make_shared<JSCCtxValue>(context, instance));
  auto new_instance_external_data = constructor_data->object_data_map[constructor];
  if (new_instance_external_data) {
    cb_info.SetData(new_instance_external_data);
  }
  for (size_t i = 0; i < argument_count; i++) {
    cb_info.AddValue(std::make_shared<JSCCtxValue>(context, arguments[i]));
  }
  js_cb(cb_info, external_data);
  auto exception_object = std::static_pointer_cast<JSCCtxValue>(cb_info.GetExceptionValue()->Get());
  if (exception_object) {
    *exception = exception_object->value_;
    return constructor;
  }

  auto ret_value = std::static_pointer_cast<JSCCtxValue>(cb_info.GetReturnValue()->Get());
  if (!ret_value) {
    JSStringRef string_ref = JSCVM::CreateJSCString("InvokeConstructorCallback GetReturnValue error");
    *exception = JSValueMakeString(ctx, string_ref);
    JSStringRelease(string_ref);
    return constructor;
  }

  auto object_data = cb_info.GetData();
  if (object_data) {
    auto object_value = std::static_pointer_cast<JSCCtxValue>(ret_value);
    auto object_ref = JSValueToObject(object_value->context_, object_value->value_, exception);
    constructor_data->object_data_map[object_ref] = object_data;
    JSObjectSetPrivate(instance, constructor_data);
  }

  return JSValueToObject(ctx, ret_value->value_, exception);
}

std::shared_ptr<CtxValue> JSCCtx::CreateFunction(const std::unique_ptr<FunctionWrapper>& wrapper) {
  JSClassDefinition fn_def = kJSClassDefinitionEmpty;
  fn_def.callAsFunction = InvokeJsCallback;
  fn_def.attributes = kJSClassAttributeNoAutomaticPrototype;
  fn_def.initialize = [](JSContextRef ctx, JSObjectRef object) {
    JSObjectRef global = JSContextGetGlobalObject(ctx);
    JSStringRef func_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar *>(kFunctionName), ARRAY_SIZE(kFunctionName) - 1);
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
  JSObjectRef fn_obj = JSObjectMake(context_, cls_ref, reinterpret_cast<void*>(wrapper.get()));
  JSClassRelease(cls_ref);
  return std::make_shared<JSCCtxValue>(context_, fn_obj);
}

static JSValueRef JSObjectGetPropertyCallback(JSContextRef ctx,
                                              JSObjectRef object,
                                              JSStringRef name,
                                              JSValueRef *exception_ref) {

  auto data = JSObjectGetPrivate(object);
  auto context = JSContextGetGlobalContext(ctx);
  auto constructor_data = reinterpret_cast<ConstructorData*>(data);
  auto function_wrapper = reinterpret_cast<FunctionWrapper*>(constructor_data->function_wrapper);
  auto js_cb = function_wrapper->callback;
  void* external_data = function_wrapper->data;
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
  auto private_data = std::make_unique<ConstructorData>(reinterpret_cast<void*>(wrapper.get()), nullptr, cls_ref);
  JSObjectRef fn_obj = JSObjectMake(context_, cls_ref, private_data.get());
  SaveConstructorData(std::move(private_data));
  return std::make_shared<JSCCtxValue>(context_, fn_obj);
}

std::shared_ptr<CtxValue> JSCCtx::DefineClass(const string_view& name,
                                              const std::shared_ptr<ClassDefinition>& parent,
                                              const std::unique_ptr<FunctionWrapper>& constructor_wrapper,
                                              size_t property_count,
                                              std::shared_ptr<PropertyDescriptor> properties[]) {
  JSClassDefinition class_definition = kJSClassDefinitionEmpty;
  class_definition.callAsConstructor = InvokeConstructorCallback;
  auto class_name = footstone::StringViewUtils::ToStdString(footstone::StringViewUtils::ConvertEncoding(name, string_view::Encoding::Utf8).utf8_value());
  class_definition.className = class_name.c_str();
  class_definition.finalize = [](JSObjectRef object) {
    auto private_data = JSObjectGetPrivate(object);
    if (!private_data) {
      return;
    }
    if (!JSCVM::IsValidConstructorDataPtr(private_data)) {
      return;
    }
    auto constructor_data = reinterpret_cast<ConstructorData*>(private_data);
    auto weak_callback_wrapper = constructor_data->weak_callback_wrapper;
    if (weak_callback_wrapper) {
      auto wrapper = reinterpret_cast<WeakCallbackWrapper*>(weak_callback_wrapper);
      auto& object_data_map = constructor_data->object_data_map;
      wrapper->callback(wrapper->data, object_data_map[object]);
      object_data_map.erase(object);
    }
  };
  class_definition.hasInstance = [](JSContextRef ctx, JSObjectRef constructor, JSValueRef instance, JSValueRef* exception) -> bool {
    auto constructor_private = JSObjectGetPrivate(constructor);
    if (!constructor) {
      return false;
    }
    auto instance_object = JSValueToObject(ctx, instance, exception);
    if (*exception) {
      return false;
    }
    auto constructor_prototype = reinterpret_cast<ConstructorData*>(constructor_private)->prototype;
    auto constructor_prototype_value = std::static_pointer_cast<JSCCtxValue>(constructor_prototype)->value_;
    auto instance_prototype = JSObjectGetPrototype(ctx, instance_object);

    while (!JSValueIsNull(ctx, instance_prototype)) {
      if (JSValueIsEqual(ctx, instance_prototype, constructor_prototype_value, exception)) {
        return true;
      }
      auto instance_prototype_object = JSValueToObject(ctx, instance_prototype, exception);
      if (*exception) {
        return false;
      }
      instance_prototype = JSObjectGetPrototype(ctx, instance_prototype_object);
    }

    return false;
  };
  JSClassRef parent_class_ref = nullptr;
  JSValueRef parent_prototype_value = nullptr;
  if (parent) {
    auto jsc_parent = std::static_pointer_cast<JSCClassDefinition>(parent);
    parent_class_ref = jsc_parent->GetClassRef();
    class_definition.parentClass = parent_class_ref;
    auto parent_prototype = GetClassPrototype(parent_class_ref);
    if (parent_prototype) {
      parent_prototype_value = std::static_pointer_cast<JSCCtxValue>(parent_prototype)->value_;
    }
  }
  auto class_ref = JSClassCreate(&class_definition);
  auto prototype = JSObjectMake(context_, parent_class_ref, nullptr);
  JSValueRef exception = nullptr;
  JSStringRef get_key_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar *>(kGetStr), ARRAY_SIZE(kGetStr) - 1);
  JSStringRef set_key_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar *>(kSetStr), ARRAY_SIZE(kSetStr) - 1);
  JSStringRef define_property_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar *>(kDefinePropertyStr), ARRAY_SIZE(kDefinePropertyStr) - 1);
  JSStringRef object_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar *>(kObjectStr), ARRAY_SIZE(kObjectStr) - 1);
  for (auto i = 0; i < property_count; ++i) {
    auto property_descriptor = properties[i];
    auto property_object = JSObjectMake(context_, parent_class_ref, nullptr);
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
        FOOTSTONE_LOG(ERROR) << GetExceptionMessage(exception_);
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

  if (parent_prototype_value) {
    JSObjectSetPrototype(context_, prototype, parent_prototype_value);
  }

  auto private_data = std::make_unique<ConstructorData>(reinterpret_cast<void*>(constructor_wrapper.get()), std::make_shared<JSCCtxValue>(context_, prototype), class_ref);
  auto object = JSObjectMake(context_, class_ref, private_data.get());
  SaveConstructorData(std::move(private_data));
  class_definition_map_[name] = std::make_shared<JSCClassDefinition>(class_ref);
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
  JSObjectRef clazz = JSValueToObject(context_, jsc_cls->value_, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  if (external) {
    auto private_data = JSObjectGetPrivate(clazz);
    if (private_data) {
      auto constructor_data = reinterpret_cast<ConstructorData*>(private_data);
      constructor_data->object_data_map[clazz] = external;
    }
  }
  auto ret = JSObjectCallAsConstructor(context_, clazz, argc, values, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  return std::make_shared<JSCCtxValue>(context_, ret);
}

void* JSCCtx::GetObjectExternalData(const std::shared_ptr<CtxValue>& object) {
  auto private_data = GetPrivateData(object);
  if (!private_data) {
    return nullptr;
  }
  auto constructor_data = reinterpret_cast<ConstructorData*>(private_data);
  auto object_value = std::static_pointer_cast<JSCCtxValue>(object);
  JSValueRef exception = nullptr;
  auto object_ref = JSValueToObject(object_value->context_, object_value->value_, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  return constructor_data->object_data_map[object_ref];
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

std::shared_ptr<ClassDefinition> JSCCtx::GetClassDefinition(const string_view& name) {
  FOOTSTONE_DCHECK(class_definition_map_.find(name) != class_definition_map_.end());
  return class_definition_map_[name];
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
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
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
  auto ctx_value = std::static_pointer_cast<JSCCtxValue>(value);
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

bool JSCCtx::GetEntriesFromObject(const std::shared_ptr<CtxValue>& value,
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

bool JSCCtx::GetEntriesFromMap(const std::shared_ptr<CtxValue>& value,
                               std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) {
  FOOTSTONE_UNIMPLEMENTED();
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

std::shared_ptr<CtxValue> JSCCtx::CreateMap(const std::map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) {
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

std::shared_ptr<CtxValue> JSCCtx::CreateString(const string_view& str_view) {
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
      auto error = CreateException("CreateObject");
      SetException(std::static_pointer_cast<JSCCtxValue>(error));
      return nullptr;
    }
    auto object_key = JSCVM::CreateJSCString(key);
    auto ctx_value = std::static_pointer_cast<JSCCtxValue>(it.second);
    if (!ctx_value) {
      auto error = CreateException("CreateObject ctx_value is nullptr");
      SetException(std::static_pointer_cast<JSCCtxValue>(error));
      continue;
    }
    JSObjectSetProperty(context_, obj, object_key, ctx_value->value_, kJSPropertyAttributeNone, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      return nullptr;
    }
  }
  return std::make_shared<JSCCtxValue>(context_, obj);
}

std::shared_ptr<CtxValue> JSCCtx::CreateArray(size_t count,
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
    values[i] = ele_value ? ele_value->value_ : nullptr;
  }

  JSValueRef exception = nullptr;
  JSValueRef value_ref = JSObjectMakeArray(context_, count, values, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    return nullptr;
  }
  return std::make_shared<JSCCtxValue>(context_, value_ref);
}

std::shared_ptr<CtxValue> JSCCtx::CreateException(const string_view& msg) {
  JSStringRef str_ref = JSCVM::CreateJSCString(msg);
  JSValueRef value = JSValueMakeString(context_, str_ref);
  JSStringRelease(str_ref);
  JSValueRef values[] = {value};
  JSObjectRef error = JSObjectMakeError(context_, 1, values, nullptr);
  return std::make_shared<JSCCtxValue>(context_, error);
}

std::shared_ptr<CtxValue> JSCCtx::CopyArrayElement(const std::shared_ptr<CtxValue>& array,
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

std::shared_ptr<CtxValue> JSCCtx::CopyNamedProperty(const std::shared_ptr<CtxValue>& value,
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

std::shared_ptr<CtxValue> JSCCtx::CallFunction(const std::shared_ptr<CtxValue>& function,
                                               const std::shared_ptr<CtxValue>& receiver,
                                               size_t argc,
                                               const std::shared_ptr<CtxValue> argv[]) {
  auto function_value = std::static_pointer_cast<JSCCtxValue>(function);
  JSValueRef exception = nullptr;
  auto function_object = JSValueToObject(context_, function_value->value_, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    FOOTSTONE_LOG(ERROR) << GetExceptionMessage(exception_);
    return nullptr;
  }

  auto receiver_value = std::static_pointer_cast<JSCCtxValue>(receiver);
  auto receiver_object = JSValueToObject(context_, receiver_value->value_, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    FOOTSTONE_LOG(ERROR) << GetExceptionMessage(exception_);
    return nullptr;
  }

  if (argc <= 0) {
    auto ret_value_ref = JSObjectCallAsFunction(context_, function_object, receiver_object, 0, nullptr, &exception);
    if (exception) {
      SetException(std::make_shared<JSCCtxValue>(context_, exception));
      FOOTSTONE_LOG(ERROR) << GetExceptionMessage(exception_);
      return nullptr;
    }
    return std::make_shared<JSCCtxValue>(context_, ret_value_ref);
  }

  JSValueRef values[argc];  // NOLINT(runtime/arrays)
  for (size_t i = 0; i < argc; i++) {
    auto arg_value = std::static_pointer_cast<JSCCtxValue>(argv[i]);
    values[i] = arg_value->value_;
  }

  auto ret_value_ref = JSObjectCallAsFunction(context_, function_object, receiver_object, argc, values, &exception);
  if (exception) {
    SetException(std::make_shared<JSCCtxValue>(context_, exception));
    FOOTSTONE_LOG(ERROR) << GetExceptionMessage(exception_);
    return nullptr;
  }

  if (!ret_value_ref) {
    return nullptr;
  }

  return std::make_shared<JSCCtxValue>(context_, ret_value_ref);
}

string_view JSCCtx::GetExceptionMessage(const std::shared_ptr<CtxValue>& exception) {
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
  FOOTSTONE_DLOG(ERROR) << "GetExceptionMessage msg = " << ret;
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
  auto& holder = jsc_vm->constructor_data_holder_;
  auto it = holder.find(this);
  if (it == holder.end()) {
    holder[this] = std::unordered_map<JSClassRef, std::unique_ptr<ConstructorData>>{};
  }
  JSCVM::SaveConstructorDataPtr(constructor_data.get());
  holder[this][constructor_data->class_ref] = std::move(constructor_data);
}

std::shared_ptr<JSCCtxValue> JSCCtx::GetClassPrototype(JSClassRef ref) {
  auto vm = vm_.lock();
  FOOTSTONE_CHECK(vm);
  auto jsc_vm = std::static_pointer_cast<JSCVM>(vm);
  auto& holder = jsc_vm->constructor_data_holder_;
  auto it = holder.find(this);
  if (it == holder.end()) {
    return nullptr;
  }
  auto& class_map = it->second;
  auto iterator = class_map.find(ref);
  if (iterator == class_map.end()) {
    return nullptr;
  }
  return iterator->second->prototype;
}

void JSCCtx::ThrowException(const std::shared_ptr<CtxValue> &exception) {
  SetException(std::static_pointer_cast<JSCCtxValue>(exception));
}

void JSCCtx::ThrowException(const string_view& exception) {
  ThrowException(CreateException(exception));
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
  if (JSValueIsNull(context_, prop_ref) || JSValueIsUndefined(context_, prop_ref)) {
    auto xxx = JSObjectGetPrototype(context_, obj_ref);
    return nullptr;
  }
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
