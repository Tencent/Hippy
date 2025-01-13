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
#include "driver/napi/hermes/hermes_try_catch.h"
#include "driver/scope.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"
#include "driver/vm/hermes/native_source_code_hermes.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wshorten-64-to-32"
#include "hermes/hermes.h"
#include "jsi/jsi-inl.h"
#include "hermes/cdp/CDPDebugAPI.h"
#pragma clang diagnostic pop


namespace hippy {
inline namespace driver {
inline namespace napi {

using Scope = driver::Scope;
using CallbackInfo = hippy::CallbackInfo;
using string_view = footstone::string_view;
using StringViewUtils = footstone::StringViewUtils;
using Runtime = facebook::jsi::Runtime;
using HermesRuntime = facebook::hermes::HermesRuntime;
using ConsoleAPIType = facebook::hermes::cdp::ConsoleAPIType;

constexpr int kScopeWrapperIndex = 5;
constexpr char kProtoKey[] = "__proto__";
constexpr char kUniqueIdInLocalStateKey[] = "__uniqueID";
std::atomic<int> unique_id_counter{0}; // for saving this_value to LocalNativeState

constexpr char kConstructor[] = "function() { this.hostfunction_constructor.apply(this, arguments); return this; }";
constexpr char kProxyFunction[] = "function(handler) { return new Proxy(this, handler); }";
constexpr char kProxyTargetObject[] = "proxy_target_object";
constexpr char kIsProxyObject[] = "is_proxy_object";
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

static void HandleJsException(std::shared_ptr<Scope> scope, std::shared_ptr<HermesExceptionCtxValue> exception) {
  VM::HandleException(scope->GetContext(), "uncaughtException", exception);
  auto engine = scope->GetEngine().lock();
  FOOTSTONE_CHECK(engine);
  auto callback = engine->GetVM()->GetUncaughtExceptionCallback();
  auto context = scope->GetContext();
  footstone::string_view description("Hermes Engine JS Exception");
  footstone::string_view stack(exception->Message());
  callback(scope->GetBridge(), description, stack);
}

static Value InvokePropertyCallback(Runtime& runtime, 
                                    const Value& this_value,
                                    const std::string& property,
                                    void* function_pointer) {
  auto global_native_state = runtime.global().getNativeState<GlobalNativeState>(runtime);
  std::any scope_any;
  if (!global_native_state->Get(kScopeWrapperIndex, scope_any)) {
    return facebook::jsi::Value::undefined();
  }
  auto any_pointer = std::any_cast<void*>(&scope_any);
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(static_cast<void *>(*any_pointer));
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
  auto exception = std::static_pointer_cast<HermesExceptionCtxValue>(cb_info.GetExceptionValue()->Get());
  if (exception) {
    HandleJsException(scope, exception);
    return Value::undefined();
  }

  auto ret_value = std::static_pointer_cast<HermesCtxValue>(cb_info.GetReturnValue()->Get());
  if (!ret_value) {
    return Value::undefined();
  }
  return ret_value->GetValue(hermes_ctx->GetRuntime());
}

static Value InvokeConstructorJsCallback(Runtime& runtime, 
                                         const Value& this_value,
                                         const Value* args,
                                         size_t count,
                                         void* function_pointer) {
  // 1. Get GlobalNativeState
  auto global_native_state = runtime.global().getNativeState<GlobalNativeState>(runtime);
  std::any scope_any;
  if (!global_native_state->Get(kScopeWrapperIndex, scope_any)) {
    return Value::undefined();
  }
  // 2. Get Scope
  auto any_pointer = std::any_cast<void*>(&scope_any);
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(static_cast<void *>(*any_pointer));
  auto scope = scope_wrapper->scope.lock();
  if (scope == nullptr) return facebook::jsi::Value::undefined();
  auto hermes_ctx = std::static_pointer_cast<HermesCtx>(scope->GetContext());
  if (hermes_ctx == nullptr) return facebook::jsi::Value::undefined();

  // 3. Create CallbackInfo, CallbackInfo bind Scope
  CallbackInfo cb_info;
  cb_info.SetSlot(scope_any);

  // 4. CallbackInfo set data getting from proto.constructor.LocalNativeState
  if (this_value.isObject()) {
    auto prototype = this_value.asObject(runtime).getProperty(runtime, kProtoKey);
    if (prototype.isObject()) {
      auto constructor_func = prototype.asObject(runtime).getProperty(runtime, "constructor");
      if (constructor_func.asObject(runtime).asFunction(runtime).hasNativeState<LocalNativeState>(runtime)) {
        auto local_native_state = constructor_func.asObject(runtime).getNativeState<LocalNativeState>(runtime);
        auto data = local_native_state->Get();
        cb_info.SetData(data);
      }
    }
  }

  // 5. CallbackInfo set receiver (may be object)
  if (this_value.isObject()) {
    cb_info.SetReceiver(std::make_shared<HermesCtxValue>(runtime, this_value.asObject(runtime)));
  } else {
    cb_info.SetReceiver(std::make_shared<HermesCtxValue>(runtime, this_value));
  }

  // 6. CallbackInfo add args
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

  // 7. Get function wrapper (which is constructor_wrapper when calling DefineClass())
  // and Execute wrapper->callback
  auto function_wrapper = reinterpret_cast<FunctionWrapper*>(function_pointer);
  auto js_cb = function_wrapper->callback;
  auto external_data = function_wrapper->data;
  js_cb(cb_info, external_data);
  auto exception = std::static_pointer_cast<HermesExceptionCtxValue>(cb_info.GetExceptionValue()->Get());
  if (exception) {
    HandleJsException(scope, exception);
    return Value::undefined();
  }

  // 8. Binding new constructor return value in proto
  if (this_value.isObject()) {
    auto prototype = this_value.asObject(runtime).getProperty(runtime, kProtoKey);
    if (prototype.isObject()) {
      // currently internal_data is the C++ object
      auto internal_data = cb_info.GetData();
      if (internal_data != nullptr) {
        // Set a unique id for this_value and save this id in LocalNativeState as the key,
        // which is used to retrieve the saved value in LocalNativeState based on the id.
        // Sets the unique ID to an attribute of this_value.
        int uniqueID = ++unique_id_counter;
        this_value.asObject(runtime).setProperty(runtime, kUniqueIdInLocalStateKey, Value(uniqueID));
        
        std::shared_ptr<LocalNativeState> local_state = nullptr;
        if (prototype.asObject(runtime).hasNativeState(runtime)) {
          local_state = prototype.asObject(runtime).getNativeState<LocalNativeState>(runtime);
        } else {
          local_state = std::make_shared<LocalNativeState>();
        }
        local_state->Set(uniqueID, internal_data);
        prototype.asObject(runtime).setNativeState(runtime, local_state);
      }
    }
  }
  
  // 9. Return the generated hermes ctx value
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
  auto any_pointer = std::any_cast<void*>(&scope_any);
  auto scope_wrapper = reinterpret_cast<ScopeWrapper*>(static_cast<void *>(*any_pointer));
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

        if (instance_object.hasProperty(runtime, kProtoKey)) {
            auto proto_object = instance_object.getProperty(runtime, kProtoKey).asObject(runtime);
            if (proto_object.hasNativeState<LocalNativeState>(runtime)) {
                auto local_native_state = proto_object.getNativeState<LocalNativeState>(runtime);
                void *data;
                if (instance_object.hasProperty(runtime, kUniqueIdInLocalStateKey)) {
                    int uniqueID = instance_object.getProperty(runtime, kUniqueIdInLocalStateKey).asNumber();
                    data = local_native_state->Get(uniqueID);
                } else {
                    data = local_native_state->Get();
                }
                cb_info.SetData(data);
            }
        }
    }

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
  auto exception = std::static_pointer_cast<HermesExceptionCtxValue>(cb_info.GetExceptionValue()->Get());
  if (exception) {
    HandleJsException(scope, exception);
    return Value::undefined();
  }

  auto ret_value = std::static_pointer_cast<HermesCtxValue>(cb_info.GetReturnValue()->Get());
  if (!ret_value) {
    return Value::undefined();
  }
  return ret_value->GetValue(hermes_ctx->GetRuntime());
}

void fatalHandler(const std::string &message) {
    FOOTSTONE_LOG(FATAL) << "Received Hermes Fatal Error: %s\n" << message.c_str();
}

constexpr char kHippyHermes[] = "HippyHermesBridge";
HermesCtx::HermesCtx() {
  auto runtimeConfigBuilder = ::hermes::vm::RuntimeConfig::Builder()
    .withGCConfig(::hermes::vm::GCConfig::Builder()
                  // Default to 3GB
                  .withMaxHeapSize(3072 << 20)
                  .withName(kHippyHermes)
                  // For the next two arguments: avoid GC before TTI
                  // by initializing the runtime to allocate directly
                  // in the old generation, but revert to normal
                  // operation when we reach the (first) TTI point.
                  //.withAllocInYoung(false)
                  //.withRevertToYGAtTTI(true)
                  .build())
    .withEnableSampleProfiling(true)
    .withES6Class(true)
    .withES6Proxy(true)
    .withES6Promise(false)
    .withMicrotaskQueue(true);
  
  // TODO: Use Hermes's Crash Manager in future
  // like: runtimeConfigBuilder.withCrashMgr(cm);

  runtime_ = facebook::hermes::makeHermesRuntime(runtimeConfigBuilder.build());
  facebook::hermes::HermesRuntime::setFatalHandler(fatalHandler);
    
  global_native_state_ = std::make_shared<GlobalNativeState>();
  runtime_->global().setNativeState(*runtime_, global_native_state_);

  // Hermes doesn't support the console object, so we implement a console module
  BuiltinModule();
}

HermesCtx::~HermesCtx() {
#ifdef ENABLE_INSPECTOR
  cdpAgent_ = nullptr;
  cdpDebugAPI_ = nullptr;
#endif /* ENABLE_INSPECTOR */
}

#ifdef ENABLE_INSPECTOR
void HermesCtx::SetupDebugAgent(facebook::hermes::debugger::EnqueueRuntimeTaskFunc enqueueRuntimeTask,
                                facebook::hermes::cdp::OutboundMessageFunc messageCallback) {
    cdpDebugAPI_ = CDPDebugAPI::create(*runtime_);
    cdpAgent_ = CDPAgent::create(0,
                                 *cdpDebugAPI_,
                                 enqueueRuntimeTask,
                                 messageCallback);
}
#endif /* ENABLE_INSPECTOR */

std::shared_ptr<CtxValue> HermesCtx::DefineProxy(const std::unique_ptr<FunctionWrapper>& getter) {
  auto constructor = EvalFunction(kProxyFunction);
  return std::make_shared<HermesCtxValue>(*runtime_, constructor);
}

std::shared_ptr<CtxValue> HermesCtx::DefineProxyHandler(const std::unique_ptr<FunctionWrapper>& proxy_handler) {
  auto proxy_getter = facebook::jsi::Function::createFromHostFunction(
      *runtime_, PropNameID::forAscii(*runtime_, ""), 3,
      [proxy_handler_pointer = proxy_handler.get()](Runtime& runtime, const Value& this_value, const Value* args,
                                                    size_t count) -> Value {
        // proxy get method argument (target, property, receiver)
        if (count != 3) return Value::undefined();
        if (!args[1].isString()) return Value::undefined();
        std::string method_name = args[1].toString(runtime).utf8(runtime);

        // 获取 Proxy 对象的原始 target 对象
        if (method_name == kProxyTargetObject) return Value(runtime, args[0]);
        // 判断是否是 Proxy 对象
        if (method_name == kIsProxyObject) return Value(true);

        // 返回 jsi 需要的函数, 现在只支持了函数的返回
        return facebook::jsi::Function::createFromHostFunction(
            runtime, PropNameID::forAscii(runtime, ""), 1,
            [proxy_handler_pointer = proxy_handler_pointer, method_name](Runtime& runtime, const Value& this_value,
                                                                         const Value* args, size_t count) -> Value {
              auto jsi_call_method = InvokePropertyCallback(runtime, this_value, method_name, proxy_handler_pointer);
              if (jsi_call_method.isObject() && jsi_call_method.asObject(runtime).isFunction(runtime)) {
                auto f = jsi_call_method.asObject(runtime).asFunction(runtime);
                if (this_value.isObject()) {
                  return f.callWithThis(runtime, this_value.asObject(runtime), args, count);
                } else {
                  return f.call(runtime, args, count);
                }
              }
              return Value::undefined();
            });
      });
  facebook::jsi::Object handler = facebook::jsi::Object(*runtime_);
  handler.setProperty(*runtime_, "get", proxy_getter);
  return std::make_shared<HermesCtxValue>(*runtime_, handler);
}

std::shared_ptr<CtxValue> HermesCtx::DefineClass(const string_view& name,
                                                 const std::shared_ptr<ClassDefinition>& parent,
                                                 const std::unique_ptr<FunctionWrapper>& constructor_wrapper,
                                                 size_t property_count,
                                                 std::shared_ptr<PropertyDescriptor> properties[]) {
  auto class_name = StringViewUtils::CovertToUtf8(name, name.encoding());

  // 1. host function (Create a function which, when invoked, calls C++ code)
  auto func_tpl = facebook::jsi::Function::createFromHostFunction(
      *runtime_, PropNameID::forUtf8(*runtime_, class_name.utf8_value().data(), class_name.utf8_value().size()), 0,
      [pointer = constructor_wrapper.get()](Runtime& runtime, const Value& this_value, const Value* args, size_t count)
          -> Value { return InvokeConstructorJsCallback(runtime, this_value, args, count, pointer); });

  // 2. Make constructor
  // Since hostfunction cannot be a constructor in Hermes,
  // so implemented through a function wrapper
  auto ctor_function = EvalFunction(kConstructor);
  auto ctor_prototype = ctor_function.getProperty(*runtime_, "prototype").asObject(*runtime_);
  ctor_prototype.setProperty(*runtime_, "hostfunction_constructor", func_tpl);

  // 3. Add properties
  // use "Object.defineProperty(...)"
  for (size_t i = 0; i < property_count; i++) {
    const auto& property = properties[i];
    auto define_property =
        runtime_->global().getPropertyAsObject(*runtime_, "Object").getPropertyAsFunction(*runtime_, "defineProperty");
    auto property_name = std::static_pointer_cast<HermesCtxValue>(property->name)->GetValue(runtime_);
    if (property->getter || property->setter) {
      auto descriptor = facebook::jsi::Object(*runtime_);
      if (property->getter) {
        auto getter = facebook::jsi::Function::createFromHostFunction(
            *runtime_, PropNameID::forString(*runtime_, property_name.asString(*runtime_)), 0,
            [function_pointer = property->getter.get()](Runtime& runtime, const Value& this_value, const Value* args,
                                                        size_t count) -> Value {
              return InvokeJsCallback(runtime, this_value, args, count, function_pointer);
            });
        descriptor.setProperty(*runtime_, "get", getter);
      } else {
        auto setter = facebook::jsi::Function::createFromHostFunction(
            *runtime_, PropNameID::forString(*runtime_, property_name.asString(*runtime_)), 0,
            [function_pointer = property->setter.get()](Runtime& runtime, const Value& this_value, const Value* args,
                                                        size_t count) -> Value {
              return InvokeJsCallback(runtime, this_value, args, count, function_pointer);
            });
        descriptor.setProperty(*runtime_, "set", setter);
      }
      define_property.call(*runtime_, ctor_prototype, property_name, descriptor);
    } else if (property->method) {
      auto method = facebook::jsi::Function::createFromHostFunction(
          *runtime_, PropNameID::forString(*runtime_, property_name.asString(*runtime_)), 0,
          [function_pointer = property->method.get(), name = property_name.asString(*runtime_).utf8(*runtime_)](
              Runtime& runtime, const Value& this_value, const Value* args, size_t count) -> Value {
            auto ret = InvokeJsCallback(runtime, this_value, args, count, function_pointer);
            return ret;
          });
      ctor_prototype.setProperty(*runtime_, property_name.asString(*runtime_), method);
    } else if (property->value) {
      auto jsi_value = std::static_pointer_cast<HermesCtxValue>(property->value);
      ctor_prototype.setProperty(*runtime_, property_name.asString(*runtime_), jsi_value->GetValue(runtime_));
    }
  }

  // 4. child inherit from parent
  // Implementation:
  //   child.prototype.__proto__ = parent.prototype
  if (parent) {
    auto parent_tpl = std::static_pointer_cast<HermesClassDefinition>(parent);
    auto parent_prototype = parent_tpl->GetTemplate().asObject(*runtime_).getProperty(*runtime_, "prototype");
    ctor_prototype.setProperty(*runtime_, kProtoKey, parent_prototype);
  }

  template_map_[name] = std::make_shared<HermesClassDefinition>(*runtime_, name, ctor_function);
  return std::make_shared<HermesCtxValue>(*runtime_, ctor_function);
}

std::shared_ptr<CtxValue> HermesCtx::NewInstance(const std::shared_ptr<CtxValue>& cls, int argc,
                                                 std::shared_ptr<CtxValue> argv[], void* external) {
  auto hermes_ctx = std::static_pointer_cast<HermesCtxValue>(cls);
  auto value = hermes_ctx->GetValue(runtime_);
  if (!value.isObject()) return nullptr;

  auto object = value.asObject(*runtime_);
  bool is_function = object.isFunction(*runtime_);
  if (!is_function) return nullptr;

  // Provide external pointer for the constructor
  auto function = object.asFunction(*runtime_);
  auto local_native_state = std::make_shared<LocalNativeState>();
  local_native_state->Set(external);
  function.setNativeState(*runtime_, local_native_state);

  std::vector<Value> arguments;
  size_t len = static_cast<size_t>(argc);
  arguments.reserve(len);
  for (size_t i = 0; i < len; ++i) {
    auto arg = std::static_pointer_cast<HermesCtxValue>(argv[i]);
    arguments.push_back(arg->GetValue(runtime_));
  }
  const Value* val = &arguments[0];
  Value instance = argc == 0 ? function.callAsConstructor(*runtime_) : function.callAsConstructor(*runtime_, val, len);

  // Delete the external pointer after it is used in the constructor,
  // and bind the corresponding external pointer to the instance object.
  function.setNativeState(*runtime_, nullptr);
  if (instance.isObject()) {
    const auto &instanceObj = instance.asObject(*runtime_);
    // In order to unify all functional interfaces, Hermes implements JSI interception through Proxy objects, 
    // but setNativeState cannot function on Proxy and HostObject.
    // Therefore, for the Proxy object, we need to bind the external pointer to the Proxy target object,
    // and the external pointer needs to be obtained from the Proxy target object.
    auto is_proxy = instanceObj.getProperty(*runtime_, kIsProxyObject);
    if (is_proxy.isBool() && is_proxy.asBool()) {
      auto target_object = instanceObj.getProperty(*runtime_, kProxyTargetObject);
      if (target_object.isObject()) target_object.asObject(*runtime_).setNativeState(*runtime_, local_native_state);
    } else {
      if (instanceObj.hasNativeState(*runtime_)) {
        auto native_state = instanceObj.getNativeState<LocalNativeState>(*runtime_);
        native_state->Set(external);
      } else {
        instanceObj.setNativeState(*runtime_, local_native_state);
      }
    }
  }
  return std::make_shared<HermesCtxValue>(*runtime_, instance);
}

void* HermesCtx::GetObjectExternalData(const std::shared_ptr<CtxValue>& object) {
  auto hermes_ctx = std::static_pointer_cast<HermesCtxValue>(object);
  auto value = hermes_ctx->GetValue(runtime_);

  if (!value.isObject()) {
    return nullptr;
  }

  auto hermes_object = value.asObject(*runtime_);
  auto is_proxy = hermes_object.getProperty(*runtime_, kIsProxyObject);

  // hermes jsi 通过 Proxy 对象实现， Proxy 对象的 external 指针绑定在 target 对象上
  if (is_proxy.isBool() && is_proxy.asBool()) {
    auto target_object = hermes_object.getProperty(*runtime_, kProxyTargetObject);
    if (target_object.isObject() && target_object.asObject(*runtime_).hasNativeState<LocalNativeState>(*runtime_)) {
      auto state = target_object.asObject(*runtime_).getNativeState<LocalNativeState>(*runtime_);
      return state->Get();
    }
    return nullptr;
  }

  if (hermes_object.hasNativeState<LocalNativeState>(*runtime_)) {
    auto state = hermes_object.getNativeState<LocalNativeState>(*runtime_);
    return state->Get();
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
  const auto& key_value = hermes_key->GetValue(runtime_);
  auto ret = key_value.isString();
  if (!ret) {
    return false;
  }
  hermes_object->GetValue(runtime_).asObject(*runtime_).setProperty(
      *runtime_, hermes_key->GetValue(runtime_).asString(*runtime_), hermes_value->GetValue(runtime_));
  return true;
}

bool HermesCtx::SetProperty(std::shared_ptr<CtxValue> object, std::shared_ptr<CtxValue> key,
                            std::shared_ptr<CtxValue> value, __unused const PropertyAttribute& attr) {
  // key must be string
  // `attr` currently not in use, since hermes do not support.
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


// MARK: - Create Funtions

std::shared_ptr<CtxValue> HermesCtx::CreateObject() {
  return std::make_shared<HermesCtxValue>(*runtime_, Object(*runtime_));
}

std::shared_ptr<CtxValue> HermesCtx::CreateNumber(double number) {
  return std::make_shared<HermesCtxValue>(*runtime_, Value(number));
}

std::shared_ptr<CtxValue> HermesCtx::CreateBoolean(bool b) {
  return std::make_shared<HermesCtxValue>(*runtime_, Value(b));
}

std::shared_ptr<CtxValue> HermesCtx::CreateString(const string_view& string_view) {
  auto u8_string = StringViewUtils::CovertToUtf8(string_view, string_view.encoding());
  auto jsi_string = String::createFromUtf8(*runtime_, u8_string.utf8_value().c_str(), u8_string.utf8_value().size());
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

std::shared_ptr<CtxValue> HermesCtx::CreateFunction(const std::unique_ptr<FunctionWrapper>& wrapper) {
  auto func = facebook::jsi::Function::createFromHostFunction(
      *runtime_, PropNameID::forAscii(*runtime_, ""), 0,
      [pointer = wrapper.get()](Runtime& runtime, const Value& this_value, const Value* args, size_t count) -> Value {
        return InvokeJsCallback(runtime, this_value, args, count, pointer);
      });
  return std::make_shared<HermesCtxValue>(*runtime_, func);
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
        String::createFromUtf8(*runtime_, u8_string.utf8_value().c_str(), u8_string.utf8_value().size());
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

std::shared_ptr<CtxValue> HermesCtx::CreateMap(
    const std::map<std::shared_ptr<CtxValue>, std::shared_ptr<CtxValue>>& map) {
  auto js_map = runtime_->global().getProperty(*runtime_, "Map");
  auto instance = js_map.asObject(*runtime_).asFunction(*runtime_).callAsConstructor(*runtime_);
  auto set_function = js_map.asObject(*runtime_)
                          .getProperty(*runtime_, "prototype")
                          .asObject(*runtime_)
                          .getProperty(*runtime_, "set")
                          .asObject(*runtime_)
                          .asFunction(*runtime_);
  for (const auto& kv : map) {
    auto ctx_k = std::static_pointer_cast<HermesCtxValue>(kv.first);
    auto ctx_v = std::static_pointer_cast<HermesCtxValue>(kv.second);
    set_function.callWithThis(*runtime_, instance.asObject(*runtime_),
                              {ctx_k->GetValue(runtime_), ctx_v->GetValue(runtime_)});
  }
  return std::make_shared<HermesCtxValue>(*runtime_, instance.asObject(*runtime_));
}

std::shared_ptr<CtxValue> HermesCtx::CreateArray(size_t count, std::shared_ptr<CtxValue> values[]) {
  if (count < 0) {
    return nullptr;
  }
  facebook::jsi::Array array = facebook::jsi::Array(*runtime_, count);
  for (size_t i = 0; i < count; i++) {
    std::shared_ptr<HermesCtxValue> value = std::static_pointer_cast<HermesCtxValue>(values[i]);
    array.setValueAtIndex(*runtime_, i, value->GetValue(runtime_));
  }
  return std::make_shared<HermesCtxValue>(*runtime_, array);
}

std::shared_ptr<CtxValue> HermesCtx::CreateException(const string_view& msg) {
  FOOTSTONE_DLOG(INFO) << "HermesCtx::CreateException msg = " << msg;
  auto u8_msg = StringViewUtils::CovertToUtf8(msg, msg.encoding());
  auto str = StringViewUtils::ToStdString(u8_msg.utf8_value());
  auto exptr = std::make_exception_ptr(facebook::jsi::JSINativeException(str));
  return std::make_shared<HermesExceptionCtxValue>(exptr, str);
}

std::shared_ptr<CtxValue> HermesCtx::CreateByteBuffer(void* buffer, size_t length) {
  auto mutableBuffer = std::make_shared<HippyMutableBuffer>(buffer, length);
  auto arrayBuffer = facebook::jsi::ArrayBuffer(*runtime_, std::move(mutableBuffer));
  return std::make_shared<HermesCtxValue>(*runtime_, std::move(arrayBuffer));
}

std::shared_ptr<CtxValue> HermesCtx::CallFunction(const std::shared_ptr<CtxValue>& function,
                                                  const std::shared_ptr<CtxValue>& receiver, 
                                                  size_t argument_count,
                                                  const std::shared_ptr<CtxValue> arguments[]) {
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(function);
  auto jsi_value = ctx_value->GetValue(runtime_);
  if (!jsi_value.isObject()) {
    return nullptr;
  }
  if (!jsi_value.asObject(*runtime_).isFunction(*runtime_)) {
    return nullptr;
  }
  try {
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
        FOOTSTONE_DCHECK(argument_ctx_val);
        arg_vec[i] = argument_ctx_val ? argument_ctx_val->GetValue(runtime_) : facebook::jsi::Value::null();
      }
      const Value* jsi_arg = &arg_vec[0];
      Value value = jsi_func.callWithThis(*runtime_, this_object.asObject(*runtime_), jsi_arg, jsi_arg_count);
      return std::make_shared<HermesCtxValue>(*runtime_, value);
    }
  } catch (facebook::jsi::JSIException& err) {
    auto exptr = std::current_exception();
    std::string message(err.what());
    exception_ = std::make_shared<HermesExceptionCtxValue>(exptr, message);
    return nullptr;
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
  String jsi_str = ctx_value->GetValue(runtime_).asString(*runtime_);
  const std::string utf8_string = jsi_str.utf8(*runtime_);
  *result = string_view::new_from_utf8(utf8_string.data(), utf8_string.size());
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
    *result = string_view(utf8_string);
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
  if (!value) return false;
  std::shared_ptr<HermesCtxValue> ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  const auto &jsi_value = ctx_value->GetValue(runtime_);
  return jsi_value.isObject() && jsi_value.asObject(*runtime_).isArrayBuffer(*runtime_);
}

bool HermesCtx::GetByteBuffer(const std::shared_ptr<CtxValue>& value, 
                              void** out_data,
                              size_t& out_length,
                              uint32_t& out_type) {
  if (!value || *out_data) {
    return false;
  }
  // Get ArrayBuffer Object
  // Assume that type has already been checked using IsByteBuffer for performance.
  auto ctx_value = std::static_pointer_cast<HermesCtxValue>(value);
  const auto &jsi_value = ctx_value->GetValue(runtime_);
  auto arrayBuffer = jsi_value.getObject(*runtime_).getArrayBuffer(*runtime_);;
  
  // Extract data and length
  *out_data = arrayBuffer.data(*runtime_);
  out_length = arrayBuffer.size(*runtime_);
  out_type = 0; // hermes not support
  return true;
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
  return std::make_shared<HermesCtxValue>(*runtime_, index_val);
}

bool HermesCtx::HasNamedProperty(const std::shared_ptr<CtxValue>& value, const string_view& name) {
  // TODO: add has named property, currently unused
  FOOTSTONE_UNIMPLEMENTED();
  return false;
}

std::shared_ptr<CtxValue> HermesCtx::CopyNamedProperty(const std::shared_ptr<CtxValue>& value,
                                                       const string_view& name) {
  // TODO: add copy named property, currently unused
  FOOTSTONE_UNIMPLEMENTED();
  return nullptr;
}

string_view HermesCtx::CopyFunctionName(const std::shared_ptr<CtxValue>& function) {
  // TODO: add copy function name, currently unused
  FOOTSTONE_UNIMPLEMENTED();
  return "";
}

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
  bool is_hbc = facebook::hermes::HermesRuntime::isHermesBytecode(reinterpret_cast<const uint8_t*>(u8_script.utf8_value().data()),
                                                                  u8_script.utf8_value().size());
  FOOTSTONE_DLOG(INFO) << "is hbc file " << is_hbc << ", file name " << u8_file_name.utf8_value().c_str();
  try {
    if (is_hbc) {
      auto jsi_file_name =
      String::createFromUtf8(*runtime_, u8_file_name.utf8_value().c_str(), u8_file_name.utf8_value().size());
      auto jsi_script = std::make_shared<HippyJsiBuffer>(static_cast<const uint8_t*>(u8_script.utf8_value().c_str()),
                                                         u8_script.utf8_value().size());
      facebook::jsi::Value value = runtime_->evaluateJavaScript(jsi_script, jsi_file_name.utf8(*runtime_));
      return std::make_shared<HermesCtxValue>(*runtime_, value);
    } else {
      auto jsi_file_name = facebook::jsi::String::createFromUtf8(*runtime_, u8_file_name.utf8_value().c_str(),
                                                                 u8_file_name.utf8_value().size());
      std::shared_ptr<const facebook::jsi::PreparedJavaScript> prepare_js = nullptr;
      auto jsi_script = String::createFromUtf8(*runtime_, u8_script.utf8_value().c_str(), u8_script.utf8_value().size());
      auto buffer = std::make_shared<facebook::jsi::StringBuffer>(jsi_script.utf8(*runtime_));
      prepare_js = runtime_->prepareJavaScript(buffer, jsi_file_name.utf8(*runtime_));
      auto value = runtime_->evaluatePreparedJavaScript(prepare_js);
      return std::make_shared<HermesCtxValue>(*runtime_, value);
    }
  } catch (facebook::jsi::JSIException& err) {
    auto exptr = std::current_exception();
    std::string message(err.what());
    exception_ = std::make_shared<HermesExceptionCtxValue>(exptr, message);
    return nullptr;
  }
}

// MARK: - Exception Handle

// TODO: add throw exception
void HermesCtx::ThrowException(const std::shared_ptr<CtxValue>& exception) {}

// TODO: add throw exception
void HermesCtx::ThrowException(const string_view& exception) {}

std::shared_ptr<TryCatch> HermesCtx::CreateTryCatchScope(bool enable, std::shared_ptr<Ctx> ctx) {
  return std::make_shared<HermesTryCatch>(enable, ctx);
}

string_view HermesCtx::GetExceptionMessage(const std::shared_ptr<CtxValue>& exception) {
  if (!exception) {
    return string_view();
  }
  auto hermes_exception = std::static_pointer_cast<HermesExceptionCtxValue>(exception);
  std::string message = hermes_exception->Message();
  FOOTSTONE_DLOG(ERROR) << "GetExceptionMessage msg = " << message;
  return string_view(message);
}

// MARK: -

void HermesCtx::SetExternalData(void* address) {
  global_native_state_->Set(kScopeWrapperIndex, address);
}

std::shared_ptr<ClassDefinition> HermesCtx::GetClassDefinition(const string_view& name) {
  FOOTSTONE_DCHECK(template_map_.find(name) != template_map_.end());
  return template_map_[name];
}

void HermesCtx::SetWeak(std::shared_ptr<CtxValue> value, const std::unique_ptr<WeakCallbackWrapper>& wrapper) {
  FOOTSTONE_UNREACHABLE();
}

void HermesCtx::SetWeak(std::shared_ptr<CtxValue> value, std::unique_ptr<WeakCallbackWrapper>&& wrapper) {
  // value must be an object
  auto hermes_value = std::static_pointer_cast<HermesCtxValue>(value);
  auto js_object = hermes_value->GetValue(runtime_).asObject(*runtime_);
  
  std::shared_ptr<LocalNativeState> local_state = nullptr;
  if (js_object.hasNativeState(*runtime_)) {
    local_state = js_object.getNativeState<LocalNativeState>(*runtime_);
  } else {
    local_state = std::make_shared<LocalNativeState>();
    js_object.setNativeState(*runtime_, local_state);
  }
  local_state->SetWeakCallbackWrapper(std::move(wrapper));
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

// MARK: - Inspector Helper Functions

#ifdef ENABLE_INSPECTOR
// Get the current time in milliseconds as a double.
inline double getTimestampMs() {
  return std::chrono::duration_cast<std::chrono::duration<double, std::milli>>(std::chrono::system_clock::now()
                                                                               .time_since_epoch()).count();
}

inline ConsoleAPIType consoleTypeForName(const std::string& name) {
  static const std::unordered_map<std::string, facebook::hermes::cdp::ConsoleAPIType> nameToTypeMap = {
    {"log", facebook::hermes::cdp::ConsoleAPIType::kLog},
    {"error", facebook::hermes::cdp::ConsoleAPIType::kError},
    {"warn", facebook::hermes::cdp::ConsoleAPIType::kWarning},
    {"debug", facebook::hermes::cdp::ConsoleAPIType::kDebug},
    {"info", facebook::hermes::cdp::ConsoleAPIType::kInfo},
    {"trace", facebook::hermes::cdp::ConsoleAPIType::kTrace},
    {"clear", facebook::hermes::cdp::ConsoleAPIType::kClear}
  };
  
  auto it = nameToTypeMap.find(name);
  if (it != nameToTypeMap.end()) {
    return it->second;
  } else {
    throw std::invalid_argument("Unknown console function name: " + name);
  }
}

#endif /* ENABLE_INSPECTOR */

void HermesCtx::BuiltinFunction(facebook::jsi::Object& module,
                                const std::string& name) {
  auto name_id = facebook::jsi::PropNameID::forUtf8(*runtime_, name);
  auto function = facebook::jsi::Function::createFromHostFunction(
                                                                  *runtime_, name_id, 1,
                                                                  [=](facebook::jsi::Runtime& runtime,
                                                                      const facebook::jsi::Value& thisVal,
                                                                      const facebook::jsi::Value* args,
                                                                      size_t count) {
#ifdef ENABLE_INSPECTOR
                                                                        std::vector<facebook::jsi::Value> argsVec;
                                                                        auto timestampMs = getTimestampMs();
                                                                        for (size_t i = 0; i != count; ++i) {
                                                                          argsVec.emplace_back(runtime, args[i]);
                                                                        }
                                                                        auto stackTrace = runtime_->getDebugger().captureStackTrace();
                                                                        if (cdpDebugAPI_) {
                                                                          auto type = consoleTypeForName(name);
                                                                          cdpDebugAPI_->addConsoleMessage({timestampMs, type, std::move(argsVec), stackTrace});
                                                                        }
#endif /* ENABLE_INSPECTOR */
                                                                        return facebook::jsi::Value::undefined();
                                                                      });
  module.setProperty(*runtime_, name_id, function);
}

std::unique_ptr<NativeSourceCodeProvider> HermesCtx::GetNativeSourceCodeProvider() const {
  return std::make_unique<NativeSourceCodeProviderHermes>();
}


}  // namespace napi
}  // namespace driver
}  // namespace hippy
