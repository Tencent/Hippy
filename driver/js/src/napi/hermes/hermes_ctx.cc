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

#include "driver/napi/hermes/hermes_ctx.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wextra-semi"
#include "hermes/hermes.h"
#include "jsi/jsi-inl.h"
#pragma clang diagnostic pop

//#include "driver/napi/hermes/hermes_dynamic.h"
#include "driver/scope.h"
#include "footstone/string_view_utils.h"

namespace hippy {
inline namespace driver {
inline namespace napi {

using Scope = driver::Scope;
using CallbackInfo = hippy::CallbackInfo;
using StringViewUtils = footstone::StringViewUtils;
using Runtime = facebook::jsi::Runtime;
using HermesRuntime = facebook::hermes::HermesRuntime;

constexpr static int kScopeWrapperIndex = 5;

constexpr char kConstructor[] = "function() {  this.call_hostfuncion.apply(this, arguments); return this; }";
constexpr char kHostConstructor[] = "function() {}";
constexpr char kJsonStringify[] = "function(obj) { return JSON.stringify(obj); }";

// 确保返回数据以空字符结尾
static uint8_t* EnsureNullTerminated(const uint8_t* data, size_t len) {
  if (!data || len == 0) {
    return nullptr;
  }
  unsigned char last_byte = data[len - 1];
  uint8_t* p = nullptr;
  if (last_byte == '\0') {
    p = static_cast<uint8_t*>(malloc(sizeof(uint8_t) * len));
    memset(p, 0, len);
    memcpy(p, data, len);
  } else {
    p = static_cast<uint8_t*>(malloc(sizeof(uint8_t) * (len + 1)));
    memset(p, 0, len + 1);
    memcpy(p, data, len);
  }
  return p;
}

HippyJsiBuffer::HippyJsiBuffer(const uint8_t* data, size_t len) {
  data_ = EnsureNullTerminated(data, len);
  len_ = len;
}

HippyJsiBuffer::~HippyJsiBuffer() { delete data_; }

static Value InvokePropertyCallback(Runtime& runtime, const Value& this_value, const std::string& property,
                                    void* function_pointer) {
  auto global_native_state = runtime.global().getNativeState<GlobalNativeState>(runtime);
  std::any scope_any;
  if (!global_native_state->Get(kScopeWrapperIndex, scope_any)) {
    return facebook::jsi::Value::undefined();
  }
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(scope_any));
  auto scope = scope_wrapper->scope.lock();
  if (scope == nullptr) return facebook::jsi::Value::undefined();
  auto hermes_ctx = std::static_pointer_cast<HermesCtx>(scope->GetContext());
  if (hermes_ctx == nullptr) return facebook::jsi::Value::undefined();

  CallbackInfo cb_info;
  cb_info.SetSlot(scope_any);
  cb_info.SetReceiver(std::make_shared<HermesCtxValue>(runtime, this_value));
  cb_info.AddValue(std::make_shared<HermesCtxValue>(runtime, String::createFromAscii(runtime, property)));

  auto* func_wrapper = reinterpret_cast<FunctionWrapper*>(function_pointer);
  FOOTSTONE_CHECK(func_wrapper && func_wrapper->callback);
  (func_wrapper->callback)(cb_info, func_wrapper->data);

  // auto exception = std::static_pointer_cast<V8CtxValue>(cb_info.GetExceptionValue()->Get());
  // if (exception) {
  //   const auto& global_value = exception->global_value_;
  //   auto handle_value = v8::Local<v8::Value>::New(isolate, global_value);
  //   isolate->ThrowException(handle_value);
  //   info.GetReturnValue().SetUndefined();
  //   return;
  // }

  auto ret_value = std::static_pointer_cast<HermesCtxValue>(cb_info.GetReturnValue()->Get());
  if (!ret_value) {
    return Value::undefined();
  }
  return ret_value->GetValue(hermes_ctx->GetRuntime());
}

static Value InvokeConstructorJsCallback(Runtime& runtime, const Value& this_value, const Value* args, size_t count,
                                         void* function_pointer) {
  auto global_native_state = runtime.global().getNativeState<GlobalNativeState>(runtime);
  std::any scope_any;
  if (!global_native_state->Get(kScopeWrapperIndex, scope_any)) {
    return Value::undefined();
  }
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(scope_any));
  auto scope = scope_wrapper->scope.lock();
  if (scope == nullptr) return facebook::jsi::Value::undefined();
  auto hermes_ctx = std::static_pointer_cast<HermesCtx>(scope->GetContext());
  if (hermes_ctx == nullptr) return facebook::jsi::Value::undefined();

  CallbackInfo cb_info;
  cb_info.SetSlot(scope_any);

  if (this_value.isObject()) {
    auto prototype = this_value.asObject(runtime).getProperty(runtime, "__proto__");
    if (prototype.isObject()) {
      auto constructor_func = prototype.asObject(runtime).getProperty(runtime, "constructor");
      if (constructor_func.asObject(runtime).asFunction(runtime).hasNativeState<LocalNativeState>(runtime)) {
        auto local_native_state = constructor_func.asObject(runtime).getNativeState<LocalNativeState>(runtime);
        auto data = local_native_state->Get();
        cb_info.SetData(data);
      }
    }
  }

  // TODO construct call
  if (this_value.isObject()) {
    cb_info.SetReceiver(std::make_shared<HermesCtxValue>(runtime, this_value.asObject(runtime)));
  } else {
    cb_info.SetReceiver(std::make_shared<HermesCtxValue>(runtime, this_value));
  }
  for (size_t i = 0; i < count; i++) {
    if (args[i].isString()) {
      cb_info.AddValue(std::make_shared<HermesCtxValue>(runtime, args[i].asString(runtime)));
    } else if (args[i].isSymbol()) {
      cb_info.AddValue(std::make_shared<HermesCtxValue>(runtime, args[i].asSymbol(runtime)));
    } else if (args[i].isObject()) {
      cb_info.AddValue(std::make_shared<HermesCtxValue>(runtime, args[i].asObject(runtime)));
    } else if (args[i].isBigInt()) {
      cb_info.AddValue(std::make_shared<HermesCtxValue>(runtime, args[i].asBigInt(runtime)));
    } else {
      cb_info.AddValue(std::make_shared<HermesCtxValue>(runtime, args[i]));
    }
  }

  auto function_wrapper = reinterpret_cast<FunctionWrapper*>(function_pointer);
  auto js_cb = function_wrapper->callback;
  auto external_data = function_wrapper->data;
  js_cb(cb_info, external_data);

  // TODO exception
  // auto exception = std::static_pointer_cast<V8CtxValue>(cb_info.GetExceptionValue()->Get());
  // if (exception) {
  //   const auto& global_value = exception->global_value_;
  //   auto handle_value = v8::Local<v8::Value>::New(isolate, global_value);
  //   isolate->ThrowException(handle_value);
  //   info.GetReturnValue().SetUndefined();
  //   return;
  // }

  // biding new constructor return value in proto
  if (this_value.isObject()) {
    auto prototype = this_value.asObject(runtime).getProperty(runtime, "__proto__");
    if (prototype.isObject()) {
      auto internal_data = cb_info.GetData();
      if (internal_data != nullptr) {
        auto local_state = std::make_shared<LocalNativeState>();
        local_state->Set(internal_data);
        prototype.asObject(runtime).setNativeState(runtime, local_state);
      }
    }
  }

  auto ret_value = std::static_pointer_cast<HermesCtxValue>(cb_info.GetReturnValue()->Get());
  if (!ret_value) {
    return Value::undefined();
  }
  return ret_value->GetValue(hermes_ctx->GetRuntime());
}

static Value InvokeJsCallback(Runtime& runtime, const Value& this_value, const Value* args, size_t count,
                              void* function_pointer) {
  auto global_native_state = runtime.global().getNativeState<GlobalNativeState>(runtime);
  std::any scope_any;
  if (!global_native_state->Get(kScopeWrapperIndex, scope_any)) {
    return Value::undefined();
  }
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(std::any_cast<void*>(scope_any));
  auto scope = scope_wrapper->scope.lock();
  if (scope == nullptr) return facebook::jsi::Value::undefined();
  auto hermes_ctx = std::static_pointer_cast<HermesCtx>(scope->GetContext());
  if (hermes_ctx == nullptr) return facebook::jsi::Value::undefined();

  CallbackInfo cb_info;
  cb_info.SetSlot(scope_any);

  if (this_value.isObject()) {
    auto instance_object = this_value.asObject(runtime);
    if (instance_object.hasNativeState<LocalNativeState>(runtime)) {
      auto local_native_state = instance_object.getNativeState<LocalNativeState>(runtime);
      auto data = local_native_state->Get();
      cb_info.SetData(data);
    }

    if (instance_object.hasProperty(runtime, "__proto__")) {
      auto proto_object = instance_object.getProperty(runtime, "__proto__").asObject(runtime);
      if (proto_object.hasNativeState<LocalNativeState>(runtime)) {
        auto local_native_state = proto_object.getNativeState<LocalNativeState>(runtime);
        auto data = local_native_state->Get();
        cb_info.SetData(data);
      }
    }
  }

  // TODO construct call
  if (this_value.isObject()) {
    cb_info.SetReceiver(std::make_shared<HermesCtxValue>(runtime, this_value.asObject(runtime)));
  } else {
    cb_info.SetReceiver(std::make_shared<HermesCtxValue>(runtime, this_value));
  }
  for (size_t i = 0; i < count; i++) {
    if (args[i].isString()) {
      cb_info.AddValue(std::make_shared<HermesCtxValue>(runtime, args[i].asString(runtime)));
    } else if (args[i].isSymbol()) {
      cb_info.AddValue(std::make_shared<HermesCtxValue>(runtime, args[i].asSymbol(runtime)));
    } else if (args[i].isObject()) {
      cb_info.AddValue(std::make_shared<HermesCtxValue>(runtime, args[i].asObject(runtime)));
    } else if (args[i].isBigInt()) {
      cb_info.AddValue(std::make_shared<HermesCtxValue>(runtime, args[i].asBigInt(runtime)));
    } else {
      cb_info.AddValue(std::make_shared<HermesCtxValue>(runtime, args[i]));
    }
  }

  auto function_wrapper = reinterpret_cast<FunctionWrapper*>(function_pointer);
  auto js_cb = function_wrapper->callback;
  auto external_data = function_wrapper->data;
  js_cb(cb_info, external_data);

  // TODO exception
  // auto exception = std::static_pointer_cast<V8CtxValue>(cb_info.GetExceptionValue()->Get());
  // if (exception) {
  //   const auto& global_value = exception->global_value_;
  //   auto handle_value = v8::Local<v8::Value>::New(isolate, global_value);
  //   isolate->ThrowException(handle_value);
  //   info.GetReturnValue().SetUndefined();
  //   return;
  // }

  auto ret_value = std::static_pointer_cast<HermesCtxValue>(cb_info.GetReturnValue()->Get());
  if (!ret_value) {
    return Value::undefined();
  }
  return ret_value->GetValue(hermes_ctx->GetRuntime());
}

HermesCtx::HermesCtx() {
  auto config = hermes::vm::RuntimeConfig::Builder().withMicrotaskQueue(true).build();
  runtime_ = facebook::hermes::makeHermesRuntime(config);
  global_native_state_ = std::make_shared<GlobalNativeState>();
  runtime_->global().setNativeState(*runtime_, global_native_state_);

  // Hermes doesn't support the console object, so we implement a console module
  BuiltinModule();
}

std::shared_ptr<CtxValue> HermesCtx::DefineProxy(const std::unique_ptr<FunctionWrapper>& getter,
                                                 std::vector<std::string> properties) {
  auto constructor = EvalFunction(kHostConstructor);
  auto prototype = constructor.getProperty(*runtime_, "prototype").asObject(*runtime_);
  for (const auto& property : properties) {
    auto func_name = PropNameID::forAscii(*runtime_, property.data(), property.size());
    auto property_callback = facebook::jsi::Function::createFromHostFunction(
        *runtime_, func_name, 0,
        [property = property, function_pointer = getter.get()](Runtime& runtime, const Value& this_value,
                                                               const Value* args, size_t count) -> Value {
          // get call java method
          auto call_java = InvokePropertyCallback(runtime, this_value, property, function_pointer);

          // call java method to get property value
          if (call_java.isObject() && call_java.asObject(runtime).isFunction(runtime)) {
            return call_java.asObject(runtime).asFunction(runtime).callWithThis(runtime, this_value.asObject(runtime),
                                                                                args, count);
          }
          return Value::undefined();
        });
    prototype.setProperty(*runtime_, func_name, property_callback);
  }
  return std::make_shared<HermesCtxValue>(*runtime_, constructor);
}

std::shared_ptr<CtxValue> HermesCtx::DefineClass(const string_view& name,
                                                 const std::shared_ptr<ClassDefinition>& parent,
                                                 const std::unique_ptr<FunctionWrapper>& constructor_wrapper,
                                                 size_t property_count,
                                                 std::shared_ptr<PropertyDescriptor> properties[]) {
  auto u8_string = StringViewUtils::CovertToUtf8(name, name.encoding());

  // host function
  auto func_tpl = facebook::jsi::Function::createFromHostFunction(
      *runtime_, PropNameID::forUtf8(*runtime_, u8_string.utf8_value().data(), u8_string.utf8_value().size()), 0,
      [pointer = constructor_wrapper.get()](Runtime& runtime, const Value& this_value, const Value* args, size_t count)
          -> Value { return InvokeConstructorJsCallback(runtime, this_value, args, count, pointer); });

  // constructor function wrapper for function
  auto ctor_function = EvalFunction(kConstructor);
  auto ctor_prototype = ctor_function.getProperty(*runtime_, "prototype").asObject(*runtime_);
  ctor_prototype.setProperty(*runtime_, "call_hostfuncion", func_tpl);

  // proto for function
  for (size_t i = 0; i < property_count; i++) {
    const auto& property = properties[i];
    auto define_property =
        runtime_->global().getPropertyAsObject(*runtime_, "Object").getPropertyAsFunction(*runtime_, "defineProperty");
    auto jsi_property = std::static_pointer_cast<HermesCtxValue>(property->name)->GetValue(runtime_);
    if (property->getter || property->setter) {
      auto descriptor = facebook::jsi::Object(*runtime_);
      if (property->getter) {
        auto getter = facebook::jsi::Function::createFromHostFunction(
            *runtime_, PropNameID::forString(*runtime_, jsi_property.asString(*runtime_)), 0,
            [function_pointer = property->getter.get()](Runtime& runtime, const Value& this_value, const Value* args,
                                                        size_t count) -> Value {
              return InvokeJsCallback(runtime, this_value, args, count, function_pointer);
            });
        descriptor.setProperty(*runtime_, "get", getter);
      } else {
        auto setter = facebook::jsi::Function::createFromHostFunction(
            *runtime_, PropNameID::forString(*runtime_, jsi_property.asString(*runtime_)), 0,
            [function_pointer = property->setter.get()](Runtime& runtime, const Value& this_value, const Value* args,
                                                        size_t count) -> Value {
              return InvokeJsCallback(runtime, this_value, args, count, function_pointer);
            });
        descriptor.setProperty(*runtime_, "set", setter);
      }
      define_property.call(*runtime_, ctor_prototype, jsi_property, descriptor);
    } else if (property->method) {
      auto method = facebook::jsi::Function::createFromHostFunction(
          *runtime_, PropNameID::forString(*runtime_, jsi_property.asString(*runtime_)), 0,
          [function_pointer = property->method.get(), name = jsi_property.asString(*runtime_).utf8(*runtime_)](
              Runtime& runtime, const Value& this_value, const Value* args, size_t count) -> Value {
            auto ret = InvokeJsCallback(runtime, this_value, args, count, function_pointer);
            return ret;
          });
      ctor_prototype.setProperty(*runtime_, jsi_property.asString(*runtime_), method);
    } else if (property->value) {
      auto jsi_value = std::static_pointer_cast<HermesCtxValue>(property->value);
      ctor_prototype.setProperty(*runtime_, jsi_property.asString(*runtime_), jsi_value->GetValue(runtime_));
    }
  }

  /// child inherit from parent
  /// Implementation:
  ///   child.prototype.__proto__ = parent.prototype
  if (parent) {
    auto parent_tpl = std::static_pointer_cast<HermesClassDefinition>(parent);
    auto parent_prototype = parent_tpl->GetTemplate().asObject(*runtime_).getProperty(*runtime_, "prototype");
    ctor_prototype.setProperty(*runtime_, "__proto__", parent_prototype);
  }

  template_map_[name] = std::make_shared<HermesClassDefinition>(*runtime_, name, ctor_function);
  return std::make_shared<HermesCtxValue>(*runtime_, ctor_function);
}

std::shared_ptr<CtxValue> HermesCtx::NewFromConstructorFunction(Function& function, size_t argc, const Value* args,
                                                                void* external) {
  auto local_state = std::make_shared<LocalNativeState>();
  local_state->Set(external);
  function.setNativeState(*runtime_, local_state);

  Value instance;
  if (argc == 0) {
    instance = function.callAsConstructor(*runtime_);
  } else {
    instance = function.callAsConstructor(*runtime_, args, argc);
  }
  return std::make_shared<HermesCtxValue>(*runtime_, instance);
}

std::shared_ptr<CtxValue> HermesCtx::NewInstance(const std::shared_ptr<CtxValue>& cls, int argc,
                                                 std::shared_ptr<CtxValue> argv[], void* external) {
  std::shared_ptr<HermesCtxValue> hermes_ctx = std::static_pointer_cast<HermesCtxValue>(cls);
  if (!hermes_ctx->GetValue(runtime_).isObject()) return nullptr;

  bool is_constructor_function = hermes_ctx->GetValue(runtime_).asObject(*runtime_).isFunction(*runtime_);

  // new from constructor function
  if (is_constructor_function) {
    auto function = hermes_ctx->GetValue(runtime_).asObject(*runtime_).asFunction(*runtime_);
    size_t len = static_cast<size_t>(argc);
    const Value* val = nullptr;
    if (len > 0) {
      std::vector<Value> arguments;
      arguments.resize(len);
      for (size_t i = 0; i < len; i++) {
        auto arg = std::static_pointer_cast<HermesCtxValue>(argv[i]);
        arguments[i] = arg->GetValue(runtime_);
      }
      val = &arguments[0];
    }
    return NewFromConstructorFunction(function, len, val, external);
  }
  return nullptr;
}

void* HermesCtx::GetObjectExternalData(const std::shared_ptr<CtxValue>& object) {
  auto hermes_object = std::static_pointer_cast<HermesCtxValue>(object);
  auto jsi_object = hermes_object->GetValue(runtime_).asObject(*runtime_);
  if (jsi_object.hasNativeState<LocalNativeState>(*runtime_)) {
    auto local_native_state = jsi_object.getNativeState<LocalNativeState>(*runtime_);
    return local_native_state->Get();
  }
  return nullptr;
}

std::shared_ptr<CtxValue> HermesCtx::GetGlobalObject() {
  return std::make_shared<HermesCtxValue>(*runtime_, runtime_->global());
}

bool HermesCtx::SetProperty(std::shared_ptr<CtxValue> object, std::shared_ptr<CtxValue> key,
                            std::shared_ptr<CtxValue> value) {
  auto hermes_object = std::static_pointer_cast<HermesCtxValue>(object);
  auto hermes_key = std::static_pointer_cast<HermesCtxValue>(key);
  auto hermes_value = std::static_pointer_cast<HermesCtxValue>(value);
  auto get_value = hermes_key->GetValue(runtime_);
  auto get_value_value = hermes_value->GetValue(runtime_);
  auto ret = get_value.isString();
  if (!ret) return false;
  hermes_object->GetValue(runtime_).asObject(*runtime_).setProperty(
      *runtime_, hermes_key->GetValue(runtime_).asString(*runtime_), hermes_value->GetValue(runtime_));
  return true;
}

// key must be string
bool HermesCtx::SetProperty(std::shared_ptr<CtxValue> object, std::shared_ptr<CtxValue> key,
                            std::shared_ptr<CtxValue> value, const PropertyAttribute& attr) {
  return SetProperty(object, key, value);
}

std::shared_ptr<CtxValue> HermesCtx::GetProperty(const std::shared_ptr<CtxValue>& object, const string_view& name) {
  auto hermes_object = std::static_pointer_cast<HermesCtxValue>(object);
  auto u8_key = StringViewUtils::CovertToUtf8(name, name.encoding());
  auto property = hermes_object->GetValue(runtime_).asObject(*runtime_).getProperty(
      *runtime_, PropNameID::forUtf8(*runtime_, u8_key.utf8_value().data(), u8_key.utf8_value().size()));
  return std::make_shared<HermesCtxValue>(*runtime_, property);
}

std::shared_ptr<CtxValue> HermesCtx::GetProperty(const std::shared_ptr<CtxValue>& object,
                                                 std::shared_ptr<CtxValue> key) {
  auto hermes_object = std::static_pointer_cast<HermesCtxValue>(object);
  auto hermes_key = std::static_pointer_cast<HermesCtxValue>(key);
  auto property = hermes_object->GetValue(runtime_).asObject(*runtime_).getProperty(
      *runtime_, hermes_key->GetValue(runtime_).asString(*runtime_));
  return std::make_shared<HermesCtxValue>(*runtime_, property);
}

std::shared_ptr<CtxValue> HermesCtx::CreateObject() {
  auto obj = Object(*runtime_);
  return std::make_shared<HermesCtxValue>(*runtime_, obj);
}

std::shared_ptr<CtxValue> HermesCtx::CreateNumber(double number) {
  auto obj = Value(number);
  return std::make_shared<HermesCtxValue>(*runtime_, obj);
}

std::shared_ptr<CtxValue> HermesCtx::CreateBoolean(bool b) {
  auto obj = Value(b);
  return std::make_shared<HermesCtxValue>(*runtime_, obj);
}

std::shared_ptr<CtxValue> HermesCtx::CreateString(const string_view& string_view) {
  auto u8_string = StringViewUtils::CovertToUtf8(string_view, string_view.encoding());
  auto jsi_string =
      facebook::jsi::String::createFromUtf8(*runtime_, u8_string.utf8_value().c_str(), u8_string.utf8_value().size());
  return std::make_shared<HermesCtxValue>(*runtime_, jsi_string);
}

std::shared_ptr<CtxValue> HermesCtx::CreateUndefined() {
  facebook::jsi::Value value = facebook::jsi::Value::undefined();
  return std::make_shared<HermesCtxValue>(*runtime_, value);
}

std::shared_ptr<CtxValue> HermesCtx::CreateNull() {
  facebook::jsi::Value value = facebook::jsi::Value::null();
  return std::make_shared<HermesCtxValue>(*runtime_, value);
}

std::shared_ptr<CtxValue> HermesCtx::CreateObject(
    const std::unordered_map<string_view, std::shared_ptr<CtxValue>>& kvs) {
  facebook::jsi::Object obj = facebook::jsi::Object(*runtime_);
  for (const auto& [k, v] : kvs) {
    if (StringViewUtils::IsEmpty(k) || v == nullptr) {
      continue;
    }

    auto u8_string = StringViewUtils::CovertToUtf8(k, k.encoding());
    auto key_jsi_string =
        facebook::jsi::String::createFromUtf8(*runtime_, u8_string.utf8_value().c_str(), u8_string.utf8_value().size());
    std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(v);

    obj.setProperty(*runtime_, key_jsi_string, ctx_value->GetValue(runtime_));
  }
  return std::make_shared<HermesCtxValue>(*runtime_, obj);
}

std::shared_ptr<CtxValue> HermesCtx::CreateObject(
    const std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& kvs) {
  facebook::jsi::Object obj = facebook::jsi::Object(*runtime_);
  for (const auto& [k, v] : kvs) {
    std::shared_ptr<HermesCtxValue> key_ctx_value = std::static_pointer_cast<HermesCtxValue>(k);
    if (!key_ctx_value->GetValue(runtime_).isString()) {
      continue;
    }
    String jsi_key = key_ctx_value->GetValue(runtime_).asString(*runtime_);
    std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(v);
    Value jsi_val = ctx_value->GetValue(runtime_);
    obj.setProperty(*runtime_, jsi_key, jsi_val);
  }
  return std::make_shared<HermesCtxValue>(*runtime_, obj);
}

std::shared_ptr<CtxValue> HermesCtx::CreateArray(size_t count, std::shared_ptr<CtxValue> values[]) {
  if (count <= 0) {
    return nullptr;
  }
  facebook::jsi::Array array = facebook::jsi::Array(*runtime_, count);
  for (size_t i = 0; i < count; i++) {
    std::shared_ptr<HermesCtxValue> value = std::static_pointer_cast<HermesCtxValue>(values[i]);
    array.setValueAtIndex(*runtime_, i, value->GetValue(runtime_));
  }
  return std::make_shared<HermesCtxValue>(*runtime_, array);
}

std::shared_ptr<CtxValue> HermesCtx::CreateMap(
    const std::map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) {
  auto js_map = runtime_->global().getProperty(*runtime_, "Map");
  auto map_constructor = js_map.asObject(*runtime_)
                             .getProperty(*runtime_, "prototype")
                             .asObject(*runtime_)
                             .getProperty(*runtime_, "constructor")
                             .asObject(*runtime_)
                             .asFunction(*runtime_);
  auto instance = map_constructor.callAsConstructor(*runtime_);
  auto set_function = js_map.asObject(*runtime_)
                          .getProperty(*runtime_, "prototype")
                          .asObject(*runtime_)
                          .getProperty(*runtime_, "set")
                          .asObject(*runtime_)
                          .asFunction(*runtime_);
  for (const auto& kv : map) {
    auto ctx_k = std::static_pointer_cast<HermesCtxValue>(kv.first);
    auto ctx_v = std::static_pointer_cast<HermesCtxValue>(kv.second);
    set_function.callWithThis(*runtime_, instance.asObject(*runtime_), ctx_k->GetValue(runtime_),
                              ctx_v->GetValue(runtime_));
  }
  return std::make_shared<HermesCtxValue>(*runtime_, instance.asObject(*runtime_));
}

std::shared_ptr<CtxValue> HermesCtx::CreateException(const string_view& msg) { return nullptr; }

std::shared_ptr<CtxValue> HermesCtx::CreateByteBuffer(void* buffer, size_t length) { return nullptr; }

std::shared_ptr<CtxValue> HermesCtx::CallFunction(const std::shared_ptr<CtxValue>& function,
                                                  const std::shared_ptr<CtxValue>& receiver, size_t argument_count,
                                                  const std::shared_ptr<CtxValue> arguments[]) {
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(function);
  auto jsi_value = ctx_value->GetValue(runtime_);
  if (!jsi_value.isObject()) {
    return nullptr;
  }
  if (!jsi_value.asObject(*runtime_).isFunction(*runtime_)) {
    return nullptr;
  }
  facebook::jsi::Function jsi_func = jsi_value.asObject(*runtime_).asFunction(*runtime_);
  std::shared_ptr<HermesCtxValue> receiver_ctx_value = std::static_pointer_cast<HermesCtxValue>(receiver);
  facebook::jsi::Value this_object = receiver_ctx_value->GetValue(runtime_);
  const size_t jsi_arg_count = argument_count;
  if (jsi_arg_count == 0) {
    Value value = jsi_func.callWithThis(*runtime_, this_object.asObject(*runtime_));
    return std::make_shared<HermesCtxValue>(*runtime_, value);
  } else {
    std::vector<Value> arg_vec;
    arg_vec.resize(jsi_arg_count);
    for (size_t i = 0; i < jsi_arg_count; i++) {
      std::shared_ptr<HermesCtxValue> argument_ctx_val = std::static_pointer_cast<HermesCtxValue>(arguments[i]);
      arg_vec[i] = argument_ctx_val->GetValue(runtime_);
    }
    const Value* jsi_arg = &arg_vec[0];
    Value value = jsi_func.callWithThis(*runtime_, this_object.asObject(*runtime_), jsi_arg, jsi_arg_count);
    return std::make_shared<HermesCtxValue>(*runtime_, value);
  }
}

bool HermesCtx::GetValueNumber(const std::shared_ptr<CtxValue>& value, double* result) {
  if (!value) {
    result = nullptr;
    return false;
  }
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  if (!ctx_value->GetValue(runtime_).isNumber()) {
    result = nullptr;
    return false;
  }
  *result = ctx_value->GetValue(runtime_).asNumber();
  return true;
}

bool HermesCtx::GetValueNumber(const std::shared_ptr<CtxValue>& value, int32_t* result) {
  if (!value) {
    result = nullptr;
    return false;
  }
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  if (!ctx_value->GetValue(runtime_).isNumber()) {
    result = nullptr;
    return false;
  }
  *result = static_cast<int32_t>(ctx_value->GetValue(runtime_).asNumber());
  return true;
}

bool HermesCtx::GetValueBoolean(const std::shared_ptr<CtxValue>& value, bool* result) {
  if (!value) {
    result = nullptr;
    return false;
  }
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  if (!ctx_value->GetValue(runtime_).isBool()) {
    result = nullptr;
    return false;
  }
  *result = ctx_value->GetValue(runtime_).asBool();
  return true;
}

bool HermesCtx::GetValueString(const std::shared_ptr<CtxValue>& value, string_view* result) {
  if (!value) {
    result = nullptr;
    return false;
  }
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  if (!ctx_value->GetValue(runtime_).isString()) {
    result = nullptr;
    return false;
  }
  facebook::jsi::String jsi_str = ctx_value->GetValue(runtime_).asString(*runtime_);
  const std::string utf8_string = jsi_str.utf8(*runtime_);
  *result = hippy::string_view ::new_from_utf8(utf8_string.data(), utf8_string.size());
  return true;
}

bool HermesCtx::GetValueJson(const std::shared_ptr<CtxValue>& value, string_view* result) {
  if (!value) {
    result = nullptr;
    return false;
  }
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  if (ctx_value->GetValue(runtime_).isString()) {
    return GetValueString(value, result);
  } else if (ctx_value->GetValue(runtime_).isObject()) {
    facebook::jsi::Object jsi_obj = ctx_value->GetValue(runtime_).asObject(*runtime_);
    Function stringify = EvalFunction(kJsonStringify);
    Value ret = stringify.call(*runtime_, ctx_value->GetValue(runtime_).asObject(*runtime_));
    if (!ret.isString()) return false;
    const std::string utf8_string = ret.asString(*runtime_).utf8(*runtime_);
    *result = hippy::string_view(utf8_string);
    return true;
  } else {
    return false;
  }
}

bool HermesCtx::GetEntriesFromObject(const std::shared_ptr<CtxValue>& value,
                                     std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) {
  if (!value) return false;
  auto ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  Value val = ctx_value->GetValue(runtime_);

  if (!val.isObject()) return false;
  auto obj = val.asObject(*runtime_);
  Array prop_names = obj.getPropertyNames(*runtime_);
  for (size_t i = 0; i < prop_names.size(*runtime_); i++) {
    auto prop_name = prop_names.getValueAtIndex(*runtime_, i);
    if (!prop_name.isString()) continue;
    auto prop_value = obj.getProperty(*runtime_, prop_name.asString(*runtime_));
    map[std::make_shared<HermesCtxValue>(*runtime_, prop_name)] =
        std::make_shared<HermesCtxValue>(*runtime_, prop_value);
  }
  return true;
}

bool HermesCtx::GetEntriesFromMap(const std::shared_ptr<CtxValue>& value,
                                  std::unordered_map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) {
  if (!value) return false;
  auto ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  Value val = ctx_value->GetValue(runtime_);

  if (!val.isObject()) return false;
  auto obj = val.asObject(*runtime_);

  auto entries = obj.getProperty(*runtime_, "entries");
  if (entries.isUndefined()) return false;
  auto size = obj.getProperty(*runtime_, "size");
  if (!size.isNumber()) return false;
  auto iterator = entries.asObject(*runtime_).asFunction(*runtime_).callWithThis(*runtime_, obj);
  for (size_t i = 0; i < static_cast<size_t>(size.asNumber()); i++) {
    auto next = iterator.asObject(*runtime_).getProperty(*runtime_, "next");
    if (!next.isObject()) return false;
    if (!next.asObject(*runtime_).isFunction(*runtime_)) return false;
    auto next_ret =
        next.asObject(*runtime_).asFunction(*runtime_).callWithThis(*runtime_, iterator.asObject(*runtime_));
    if (!next_ret.isObject()) return false;
    auto kv_array = next_ret.asObject(*runtime_).getProperty(*runtime_, "value");
    if (!kv_array.asObject(*runtime_).isArray(*runtime_)) return false;
    if (kv_array.asObject(*runtime_).asArray(*runtime_).size(*runtime_) != 2) return false;
    auto k = kv_array.asObject(*runtime_).asArray(*runtime_).getValueAtIndex(*runtime_, 0);
    auto v = kv_array.asObject(*runtime_).asArray(*runtime_).getValueAtIndex(*runtime_, 1);
    std::shared_ptr<HermesCtxValue> ctx_k = nullptr;
    if (k.isString()) {
      ctx_k = std::make_shared<HermesCtxValue>(*runtime_, k.asString(*runtime_));
    } else if (k.isSymbol()) {
      ctx_k = std::make_shared<HermesCtxValue>(*runtime_, k.asSymbol(*runtime_));
    } else if (k.isObject()) {
      ctx_k = std::make_shared<HermesCtxValue>(*runtime_, k.asObject(*runtime_));
    } else if (k.isBigInt()) {
      ctx_k = std::make_shared<HermesCtxValue>(*runtime_, k.asBigInt(*runtime_));
    } else {
      ctx_k = std::make_shared<HermesCtxValue>(*runtime_, k);
    }

    std::shared_ptr<HermesCtxValue> ctx_v = nullptr;
    if (v.isString()) {
      ctx_v = std::make_shared<HermesCtxValue>(*runtime_, v.asString(*runtime_));
    } else if (v.isSymbol()) {
      ctx_v = std::make_shared<HermesCtxValue>(*runtime_, v.asSymbol(*runtime_));
    } else if (v.isObject()) {
      ctx_v = std::make_shared<HermesCtxValue>(*runtime_, v.asObject(*runtime_));
    } else if (v.isBigInt()) {
      ctx_v = std::make_shared<HermesCtxValue>(*runtime_, v.asBigInt(*runtime_));
    } else {
      ctx_v = std::make_shared<HermesCtxValue>(*runtime_, v);
    }
    map[ctx_k] = ctx_v;
  }
  return true;
}

bool HermesCtx::IsNull(const std::shared_ptr<CtxValue>& value) {
  if (!value) return false;
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  return ctx_value->GetValue(runtime_).isNull();
}

bool HermesCtx::IsUndefined(const std::shared_ptr<CtxValue>& value) {
  if (!value) return false;
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  return ctx_value->GetValue(runtime_).isUndefined();
}

bool HermesCtx::IsNullOrUndefined(const std::shared_ptr<CtxValue>& value) {
  if (!value) return false;
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  return ctx_value->GetValue(runtime_).isNull() || ctx_value->GetValue(runtime_).isUndefined();
}

bool HermesCtx::IsBoolean(const std::shared_ptr<CtxValue>& value) {
  if (!value) return false;
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  return ctx_value->GetValue(runtime_).isBool();
}

bool HermesCtx::IsNumber(const std::shared_ptr<CtxValue>& value) {
  if (!value) return false;
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  return ctx_value->GetValue(runtime_).isNumber();
}

bool HermesCtx::IsString(const std::shared_ptr<CtxValue>& value) {
  if (!value) return false;
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  return ctx_value->GetValue(runtime_).isString();
}

bool HermesCtx::IsFunction(const std::shared_ptr<CtxValue>& value) {
  if (!value) {
    return false;
  }
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  if (ctx_value->GetValue(runtime_).isObject()) {
    return ctx_value->GetValue(runtime_).asObject(*runtime_).isFunction(*runtime_);
  }
  return false;
}

bool HermesCtx::IsObject(const std::shared_ptr<CtxValue>& value) {
  if (!value) return false;
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  return ctx_value->GetValue(runtime_).isObject();
}

bool HermesCtx::IsMap(const std::shared_ptr<CtxValue>& value) {
  if (!value) return false;
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  return ctx_value->GetValue(runtime_).isObject();
}

bool HermesCtx::IsArray(const std::shared_ptr<CtxValue>& value) {
  if (!value) return false;
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  if (ctx_value->GetValue(runtime_).isObject()) {
    auto jsi_object = ctx_value->GetValue(runtime_).asObject(*runtime_);
    return jsi_object.isArray(*runtime_);
  }
  return false;
}

bool HermesCtx::IsByteBuffer(const std::shared_ptr<CtxValue>& value) {
  //    if (!value) return false;
  //    std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  //    return ctx_value->GetValue().isObject();
  return false;
}

bool HermesCtx::GetByteBuffer(const std::shared_ptr<CtxValue>& value, void** out_data, size_t& out_length,
                              uint32_t& out_type) {
  return false;
}

uint32_t HermesCtx::GetArrayLength(const std::shared_ptr<CtxValue>& value) {
  if (value == nullptr) return 0;

  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  Value val = ctx_value->GetValue(runtime_);

  if (!val.isObject()) return 0;
  if (!val.asObject(*runtime_).isArray(*runtime_)) return 0;

  auto arr = val.asObject(*runtime_).asArray(*runtime_);
  return static_cast<uint32_t>(arr.size(*runtime_));
}

std::shared_ptr<CtxValue> HermesCtx::CopyArrayElement(const std::shared_ptr<CtxValue>& value, uint32_t index) {
  if (!value) return nullptr;

  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  Value val = ctx_value->GetValue(runtime_);

  if (!val.isObject()) return nullptr;
  if (!val.asObject(*runtime_).isArray(*runtime_)) return nullptr;

  auto arr = val.asObject(*runtime_).asArray(*runtime_);
  Value index_val = arr.getValueAtIndex(*runtime_, index);
  //  return std::make_shared<HermesCtxValue>(std::move(Value(*runtime_, index_val)));
  return std::make_shared<HermesCtxValue>(*runtime_, index_val);
}

// Map Helpers
// size_t HermesCtx::GetMapLength(std::shared_ptr<CtxValue>& value) {}
// std::shared_ptr<CtxValue> HermesCtx::ConvertMapToArray(const std::shared_ptr<CtxValue>& value) {}

// Object Helpers
bool HermesCtx::HasNamedProperty(const std::shared_ptr<CtxValue>& value, const string_view& name) { return false; }

std::shared_ptr<CtxValue> HermesCtx::CopyNamedProperty(const std::shared_ptr<CtxValue>& value,
                                                       const string_view& name) {
  return nullptr;
}

// std::shared_ptr<CtxValue> HermesCtx::GetPropertyNames(const std::shared_ptr<CtxValue>& value) {}

// std::shared_ptr<CtxValue> HermesCtx::GetOwnPropertyNames(const std::shared_ptr<CtxValue>& value) {}

string_view HermesCtx::CopyFunctionName(const std::shared_ptr<CtxValue>& function) { return ""; }

bool HermesCtx::Equals(const std::shared_ptr<CtxValue>& lhs, const std::shared_ptr<CtxValue>& rhs) {
  auto l = std::static_pointer_cast<HermesCtxValue>(lhs);
  auto r = std::static_pointer_cast<HermesCtxValue>(rhs);
  return Value::strictEquals(*runtime_, l->GetValue(runtime_), r->GetValue(runtime_));
}

std::shared_ptr<CtxValue> HermesCtx::RunScript(const string_view& data, const string_view& file_name) {
  if (StringViewUtils::IsEmpty(data)) {
    return nullptr;
  }

  auto u8_file_name = StringViewUtils::CovertToUtf8(file_name, file_name.encoding());
  auto u8_script = StringViewUtils::CovertToUtf8(data, data.encoding());
  bool is_hbc = facebook::hermes::HermesRuntime::isHermesBytecode(
      reinterpret_cast<const uint8_t*>(u8_script.utf8_value().data()), u8_script.utf8_value().size());
  FOOTSTONE_DLOG(INFO) << "is hbc file " << is_hbc << ", file name " << u8_file_name.utf8_value().c_str();
  if (is_hbc) {
    auto jsi_file_name = facebook::jsi::String::createFromUtf8(*runtime_, u8_file_name.utf8_value().c_str(),
                                                               u8_file_name.utf8_value().size());
    auto jsi_script = std::make_shared<HippyJsiBuffer>(static_cast<const uint8_t *>(u8_script.utf8_value().c_str()), u8_script.utf8_value().size());
    facebook::jsi::Value value = runtime_->evaluateJavaScript(jsi_script, jsi_file_name.utf8(*runtime_));
    return std::make_shared<HermesCtxValue>(*runtime_, value);
  } else {
    auto jsi_file_name = facebook::jsi::String::createFromUtf8(*runtime_, u8_file_name.utf8_value().c_str(),
                                                               u8_file_name.utf8_value().size());
    std::shared_ptr<const facebook::jsi::PreparedJavaScript> prepare_js = nullptr;
    auto jsi_script =
        facebook::jsi::String::createFromUtf8(*runtime_, u8_script.utf8_value().c_str(), u8_script.utf8_value().size());
    auto buffer = std::make_shared<facebook::jsi::StringBuffer>(jsi_script.utf8(*runtime_));
    prepare_js = runtime_->prepareJavaScript(buffer, jsi_file_name.utf8(*runtime_));
    auto value = runtime_->evaluatePreparedJavaScript(prepare_js);
    return std::make_shared<HermesCtxValue>(*runtime_, value);
  }
}

// void HermesCtx::SetDefaultContext(const std::shared_ptr<v8::SnapshotCreator>& creator) {}

void HermesCtx::ThrowException(const std::shared_ptr<CtxValue>& exception) {}

void HermesCtx::ThrowException(const string_view& exception) {}

std::shared_ptr<CtxValue> HermesCtx::CreateFunction(const std::unique_ptr<FunctionWrapper>& wrapper) {
  auto func = facebook::jsi::Function::createFromHostFunction(
      *runtime_, PropNameID::forAscii(*runtime_, ""), 0,
      [pointer = wrapper.get()](Runtime& runtime, const Value& this_value, const Value* args, size_t count) -> Value {
        return InvokeJsCallback(runtime, this_value, args, count, pointer);
      });
  return std::make_shared<HermesCtxValue>(*runtime_, func);
}

void HermesCtx::SetWeak(std::shared_ptr<CtxValue> value, const std::unique_ptr<WeakCallbackWrapper>& wrapper) {}

// std::shared_ptr<CtxValue> HermesCtx::GetPropertyNames(const std::shared_ptr<CtxValue>& value);

// std::shared_ptr<CtxValue> HermesCtx::GetOwnPropertyNames(const std::shared_ptr<CtxValue>& value);

void HermesCtx::SetExternalData(void* address) { global_native_state_->Set(kScopeWrapperIndex, address); }

std::shared_ptr<ClassDefinition> HermesCtx::GetClassDefinition(const string_view& name) {
  FOOTSTONE_DCHECK(template_map_.find(name) != template_map_.end());
  return template_map_[name];
}

Value HermesCtx::Eval(const char* code) {
  return runtime_->global().getPropertyAsFunction(*runtime_, "eval").call(*runtime_, code);
}

Function HermesCtx::EvalFunction(const std::string& code) {
  return Eval(("(" + code + ")").c_str()).getObject(*runtime_).getFunction(*runtime_);
}

void HermesCtx::BuiltinModule() {
  auto console = facebook::jsi::Object(*runtime_);
  BuiltinFunction(console, "log");
  BuiltinFunction(console, "error");
  BuiltinFunction(console, "warn");
  BuiltinFunction(console, "debug");
  BuiltinFunction(console, "info");
  BuiltinFunction(console, "trace");
  BuiltinFunction(console, "clear");
  runtime_->global().setProperty(*runtime_, "console", console);
}

void HermesCtx::BuiltinFunction(facebook::jsi::Object& module, const std::string& name) {
  auto name_id = facebook::jsi::PropNameID::forUtf8(*runtime_, name);
  auto function = facebook::jsi::Function::createFromHostFunction(
      *runtime_, name_id, 1,
      [=](facebook::jsi::Runtime& runtime, const facebook::jsi::Value& thisVal, const facebook::jsi::Value* args,
          size_t count) { return facebook::jsi::Value::undefined(); });
  module.setProperty(*runtime_, name_id, function);
}

}  // namespace napi
}  // namespace driver
}  // namespace hippy
