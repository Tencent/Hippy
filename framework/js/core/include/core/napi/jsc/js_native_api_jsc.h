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

#pragma once

#include <JavaScriptCore/JavaScriptCore.h>
#include <stdio.h>

#include <mutex>
#include <vector>

#include "base/logging.h"
#include "base/unicode_string_view.h"
#include "core/base/macros.h"
#include "core/napi/js_native_api_types.h"
#include "core/scope.h"
#include "core/modules/scene_builder.h"
#include "dom/scene_builder.h"
#include "core/base/string_view_utils.h"
#include "core/modules/event_module.h"
#include "dom/dom_event.h"

template <std::size_t N>
constexpr JSStringRef CreateWithCharacters(const char16_t (&u16)[N]) noexcept {
  return JSStringCreateWithCharacters((const JSChar*)u16, N - 1);
}

namespace hippy {
namespace napi {

constexpr char16_t kLengthStr[] = u"length";
constexpr char16_t kMessageStr[] = u"message";
constexpr char16_t kStackStr[] = u"stack";
constexpr char16_t kDefinePropertyStr[] = u"defineProperty";
constexpr char16_t kPrototypeStr[] = u"prototype";
constexpr char16_t kObjectStr[] = u"Object";
constexpr char16_t kGetStr[] = u"get";
constexpr char16_t kSetStr[] = u"set";

constexpr char kGetterStr[] = "getter";
constexpr char kSetterStr[] = "setter";

class JSCVM : public VM {
 public:
  JSCVM(): VM(nullptr) { vm_ = JSContextGroupCreate(); }

  ~JSCVM() {
    JSContextGroupRelease(vm_);
    vm_ = nullptr;
  }
  JSContextGroupRef vm_;

  virtual void RegisterUncaughtExceptionCallback();
  virtual std::shared_ptr<Ctx> CreateContext();
};

class JSCCtxValue;

class JSCCtx : public Ctx {
 public:
  using unicode_string_view = tdf::base::unicode_string_view;
  using JSValueWrapper = hippy::base::JSValueWrapper;
  using DomValue = tdf::base::DomValue;

  explicit JSCCtx(JSContextGroupRef vm) {
    context_ = JSGlobalContextCreateInGroup(vm, nullptr);

    exception_ = nullptr;
    is_exception_handled_ = false;
  }

  ~JSCCtx() {
    exception_ = nullptr;

    JSGlobalContextRelease(context_);
    context_ = nullptr;
  }

  JSGlobalContextRef GetCtxRef() { return context_; }

  inline std::shared_ptr<JSCCtxValue> GetException() { return exception_; }
  inline void SetException(std::shared_ptr<JSCCtxValue> exception) {
    if (is_exception_handled_) {
      return;
    }
    exception_ = exception;
    if (exception) {
      is_exception_handled_ = false;
    }
  }
  inline bool IsExceptionHandled() { return is_exception_handled_; }
  inline void SetExceptionHandled(bool is_exception_handled) {
    is_exception_handled_ = is_exception_handled;
  }
  virtual bool RegisterGlobalInJs() override;
  virtual void RegisterClasses(std::weak_ptr<Scope> scope) override;
  virtual void RegisterDomEvent(std::weak_ptr<Scope> scope, const std::shared_ptr<CtxValue> callback, std::shared_ptr<DomEvent>& dom_event) override;
  virtual bool SetGlobalJsonVar(const unicode_string_view& name,
                                const unicode_string_view& json) override;
  virtual bool SetGlobalStrVar(const unicode_string_view& name,
                               const unicode_string_view& str) override;
  virtual bool SetGlobalObjVar(const unicode_string_view& name,
                               const std::shared_ptr<CtxValue>& obj,
                               const PropertyAttribute& attr) override;
  virtual std::shared_ptr<CtxValue> GetGlobalStrVar(
      const unicode_string_view& name) override;
  virtual std::shared_ptr<CtxValue> GetGlobalObjVar(
      const unicode_string_view& name) override;
  virtual std::shared_ptr<CtxValue> GetProperty(
      const std::shared_ptr<CtxValue>& obj,
      const unicode_string_view& name) override;
  virtual bool DeleteProperty(const std::shared_ptr<CtxValue>& obj,
                              const unicode_string_view& name) override;

  virtual void RegisterGlobalModule(const std::shared_ptr<Scope>& scope,
                                    const ModuleClassMap& modules) override;
  virtual void RegisterNativeBinding(const unicode_string_view& name,
                                     hippy::base::RegisterFunction fn,
                                     void* data) override;

  virtual std::shared_ptr<CtxValue> CreateNumber(double number) override;
  virtual std::shared_ptr<CtxValue> CreateBoolean(bool b) override;
  virtual std::shared_ptr<CtxValue> CreateString(
      const unicode_string_view& string) override;
  virtual std::shared_ptr<CtxValue> CreateUndefined() override;
  virtual std::shared_ptr<CtxValue> CreateNull() override;
  virtual std::shared_ptr<CtxValue> ParseJson(const unicode_string_view& json) override;
  virtual std::shared_ptr<CtxValue> CreateObject(const std::unordered_map<
      unicode_string_view,
      std::shared_ptr<CtxValue>>& object) override;
  virtual std::shared_ptr<CtxValue> CreateObject(const std::unordered_map<
      std::shared_ptr<CtxValue>,
      std::shared_ptr<CtxValue>>& object) override;
  virtual std::shared_ptr<CtxValue> CreateArray(
      size_t count,
      std::shared_ptr<CtxValue> value[]) override;
  virtual std::shared_ptr<CtxValue> CreateMap(const std::map<
      std::shared_ptr<CtxValue>,
      std::shared_ptr<CtxValue>>& map) override {
    TDF_BASE_UNIMPLEMENTED();
    return nullptr;
  }
  virtual std::shared_ptr<CtxValue> CreateError(
      const unicode_string_view& msg) override;

  // Get From Value
  virtual std::shared_ptr<CtxValue> CallFunction(
      const std::shared_ptr<CtxValue>& function,
      size_t argument_count = 0,
      const std::shared_ptr<CtxValue> argumets[] = nullptr) override;

  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value, double* result) override;
  virtual bool GetValueNumber(const std::shared_ptr<CtxValue>& value, int32_t* result) override;
  virtual bool GetValueBoolean(const std::shared_ptr<CtxValue>& value, bool* result) override;
  virtual bool GetValueString(const std::shared_ptr<CtxValue>& value,
                              unicode_string_view* result) override;
  virtual bool GetValueJson(const std::shared_ptr<CtxValue>& value,
                            unicode_string_view* result) override;
  virtual bool IsMap(const std::shared_ptr<CtxValue>& value) override {
    TDF_BASE_UNIMPLEMENTED();
    return false;
  }
  // Null Helpers
  virtual bool IsNullOrUndefined(const std::shared_ptr<CtxValue>& value) override;

  // Array Helpers

  virtual bool IsArray(const std::shared_ptr<CtxValue>& value) override;
  virtual uint32_t GetArrayLength(const std::shared_ptr<CtxValue>& value) override;
  virtual std::shared_ptr<CtxValue> CopyArrayElement(const std::shared_ptr<CtxValue>& value, uint32_t index) override;

  // Object Helpers

  virtual bool HasNamedProperty(const std::shared_ptr<CtxValue>& value,
                                const unicode_string_view& name) override;
  virtual std::shared_ptr<CtxValue> CopyNamedProperty(
      const std::shared_ptr<CtxValue>& value,
      const unicode_string_view& name) override;
  // Function Helpers

  virtual bool IsFunction(const std::shared_ptr<CtxValue>& value) override;
  virtual unicode_string_view CopyFunctionName(const std::shared_ptr<CtxValue>& value) override;

  virtual std::shared_ptr<CtxValue> RunScript(
      const unicode_string_view& data,
      const unicode_string_view& file_name) override;
  virtual std::shared_ptr<CtxValue> GetJsFn(const unicode_string_view& name) override;

  virtual void ThrowException(const std::shared_ptr<CtxValue> &exception) override;
  virtual void ThrowException(const unicode_string_view& exception) override;
  virtual void HandleUncaughtException(const std::shared_ptr<CtxValue>& exception) override;

  virtual std::shared_ptr<JSValueWrapper> ToJsValueWrapper(
      const std::shared_ptr<CtxValue>& value) override;
  virtual std::shared_ptr<CtxValue> CreateCtxValue(
      const std::shared_ptr<JSValueWrapper>& wrapper) override;

  virtual std::shared_ptr<DomValue> ToDomValue(
      const std::shared_ptr<CtxValue>& value) override;
  virtual std::shared_ptr<DomArgument> ToDomArgument(
      const std::shared_ptr<CtxValue>& value) override;
  virtual std::shared_ptr<CtxValue> CreateCtxValue(
      const std::shared_ptr<DomValue>& value) override;

  template <typename T>
  std::shared_ptr<JSCCtxValue> RegisterPrototype(const std::shared_ptr<InstanceDefine<T>> instance_define);

  template <typename T>
  JSObjectCallAsConstructorCallback NewConstructor();

  template <typename T>
  void RegisterJsClass(const std::shared_ptr<InstanceDefine<T>>& instance_define);

  unicode_string_view GetExceptionMsg(const std::shared_ptr<CtxValue>& exception);
  JSStringRef CreateJSCString(const unicode_string_view& str_view);

  JSGlobalContextRef context_;
  std::shared_ptr<JSCCtxValue> exception_;
  bool is_exception_handled_;
};

inline tdf::base::unicode_string_view ToStrView(JSStringRef str) {
  return tdf::base::unicode_string_view(
      reinterpret_cast<const char16_t*>(JSStringGetCharactersPtr(str)),
      JSStringGetLength(str));
}

class JSCCtxValue : public CtxValue {
 public:
  JSCCtxValue(JSGlobalContextRef context, JSValueRef value)
      : context_(context), value_(value) {
    JSValueProtect(context_, value_);
  }

  ~JSCCtxValue() { JSValueUnprotect(context_, value_); }
  JSCCtxValue(const JSCCtxValue&) = delete;
  JSCCtxValue &operator=(const JSCCtxValue&) = delete;

  JSGlobalContextRef context_;
  JSValueRef value_;
};

class JSCTryCatch : public TryCatch {
 public:
  JSCTryCatch(bool enable, std::shared_ptr<Ctx> ctx);
  virtual ~JSCTryCatch();
  virtual void ReThrow();
  virtual bool HasCaught();
  virtual bool CanContinue();
  virtual bool HasTerminated();
  virtual bool IsVerbose();
  virtual void SetVerbose(bool verbose);
  virtual std::shared_ptr<CtxValue> Exception();
  virtual tdf::base::unicode_string_view GetExceptionMsg();

 private:
  std::shared_ptr<JSCCtxValue> exception_;
  bool is_verbose_;
  bool is_rethrow_;
};

inline void JSCCtx::RegisterClasses(std::weak_ptr<Scope> scope) {
  auto build = hippy::RegisterSceneBuilder(scope);
  RegisterJsClass(build);
}

template <typename T>
std::shared_ptr<JSCCtxValue> JSCCtx::RegisterPrototype(const std::shared_ptr<InstanceDefine<T>> instance_define) {
  auto prototype = JSObjectMake(context_, nullptr, nullptr);
  JSValueRef exception;
  JSStringRef get_key_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar*>(kGetStr),
                                                          arraysize(kGetStr) - 1);
  JSStringRef set_key_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar*>(kSetStr),
                                                          arraysize(kSetStr) - 1);
  JSStringRef define_property_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar*>(kDefinePropertyStr),
                                                          arraysize(kDefinePropertyStr) - 1);
  JSStringRef object_name = JSStringCreateWithCharacters(reinterpret_cast<const JSChar*>(kObjectStr),
                                                          arraysize(kObjectStr) - 1);

  for (auto& prop : instance_define->properties) {
    auto prop_obj = JSObjectMake(context_, nullptr, nullptr);

    JSValueRef getter;
    JSValueRef setter;

    if (prop.getter) {
      JSClassDefinition js_cls_def = kJSClassDefinitionEmpty;
      js_cls_def.className = kGetterStr;
      js_cls_def.callAsFunction = [](JSContextRef ctx, JSObjectRef function, JSObjectRef this_object,
                                   size_t argumentCount, const JSValueRef arguments[],
                                   JSValueRef* exception) {
        auto* prop = static_cast<PropertyDefine<T>*>(JSObjectGetPrivate(function));
        auto* t = static_cast<T*>(JSObjectGetPrivate(this_object));
        auto ret = (prop->getter)(t);
        std::shared_ptr<JSCCtxValue> ret_value = std::static_pointer_cast<JSCCtxValue>(ret);
        JSValueRef value_ref = JSValueMakeUndefined(ctx);
        if (ret_value != nullptr) {
          value_ref = ret_value->value_;
        }
        return value_ref;
      };
      JSClassRef func_ref = JSClassCreate(&js_cls_def);
      getter = JSObjectMake(context_, func_ref, reinterpret_cast<void*>(&prop));
      JSClassRelease(func_ref);

      JSObjectSetProperty(context_, prop_obj, get_key_name, getter, kJSPropertyAttributeNone, &exception);
    }

    if (prop.setter) {
      JSClassDefinition js_cls_def = kJSClassDefinitionEmpty;
      js_cls_def.className = kSetterStr;
      js_cls_def.callAsFunction = [](JSContextRef ctx, JSObjectRef function, JSObjectRef this_object,
                                   size_t argc, const JSValueRef arguments[],
                                   JSValueRef* exception) {
        auto* prop = static_cast<PropertyDefine<T>*>(JSObjectGetPrivate(function));
        auto* t = static_cast<T*>(JSObjectGetPrivate(this_object));
        std::shared_ptr<CtxValue> value = std::static_pointer_cast<CtxValue>(std::make_shared<JSCCtxValue>((JSGlobalContextRef)ctx, arguments[0]));
        (prop->setter)(t, value);
        return JSValueMakeBoolean(ctx, true);
      };
      JSClassRef func_ref = JSClassCreate(&js_cls_def);
      setter = JSObjectMake(context_, func_ref, reinterpret_cast<void*>(&prop));
      JSClassRelease(func_ref);
      JSObjectSetProperty(context_, prop_obj, set_key_name, setter, kJSPropertyAttributeNone, &exception);
    }

    if (prop.getter || prop.setter) {
      JSValueRef values[3];
      values[0] = prototype;
      auto name = hippy::base::StringViewUtils::ToU8StdStr(prop.name);
      JSStringRef prop_name_ref = JSStringCreateWithUTF8CString(name.c_str());
      JSValueRef prop_name = JSValueMakeString(context_, prop_name_ref);
      JSStringRelease(prop_name_ref);
      values[1] = prop_name;
      values[2] = prop_obj;

      // get object define property function
      JSValueRef object_value_ref = JSObjectGetProperty(context_, JSContextGetGlobalObject(context_), object_name, &exception);
      JSObjectRef object = JSValueToObject(context_, object_value_ref, &exception);
      JSValueRef define_property_value_ref =  JSObjectGetProperty(context_, object, define_property_name, &exception);
      JSObjectRef define_property = JSValueToObject(context_, define_property_value_ref, &exception);
      JSObjectCallAsFunction(context_, define_property, object, 3, values, &exception);
    }
  }

  for (auto& func : instance_define->functions) {
    JSClassDefinition func_def = kJSClassDefinitionEmpty;
    std::string func_name = hippy::base::StringViewUtils::ToU8StdStr(func.name);
    func_def.className = func_name.c_str();
    func_def.callAsFunction = [](JSContextRef ctx, JSObjectRef function, JSObjectRef this_object,
                                 size_t argc, const JSValueRef argv[],
                                 JSValueRef* exception) {
      auto* func_def = static_cast<FunctionDefine<T>*>(JSObjectGetPrivate(function));
      auto* t = static_cast<T*>(JSObjectGetPrivate(this_object));
      std::shared_ptr<CtxValue> param[argc];
      for (auto i = 0; i < argc; ++i) {
        param[i] = std::static_pointer_cast<CtxValue>(std::make_shared<JSCCtxValue>((JSGlobalContextRef)ctx, argv[i]));
      }
      auto ret = func_def->cb(t, argc, param);
      std::shared_ptr<JSCCtxValue> ret_value = std::static_pointer_cast<JSCCtxValue>(ret);
      if (ret_value) {
        return ret_value->value_;
      }
      return JSValueMakeNull(ctx);
    };

    auto func_cls = JSClassCreate(&func_def);
    auto obj_ref = JSObjectMake(context_, func_cls, &func);
    JSClassRelease(func_cls);
    JSStringRef func_name_ref = JSStringCreateWithUTF8CString(func_name.c_str());
    JSObjectSetProperty(context_, prototype, func_name_ref, obj_ref, kJSPropertyAttributeNone, &exception);
    JSStringRelease(func_name_ref);
  }

  JSStringRelease(get_key_name);
  JSStringRelease(set_key_name);
  JSStringRelease(define_property_name);
  JSStringRelease(object_name);
  return std::make_shared<JSCCtxValue>(context_, prototype);
}

template<typename T>
struct PrivateData {
  InstanceDefine<T>* instance_define;
  JSClassRef cls_ref;
  std::shared_ptr<JSCCtxValue> prototype;
};

template <typename T>
JSObjectCallAsConstructorCallback JSCCtx::NewConstructor() {
  return [](JSContextRef ctx, JSObjectRef constructor_ref, size_t argc,
            const JSValueRef argv[], JSValueRef* exception) {
    auto* data = static_cast<PrivateData<T>*>(JSObjectGetPrivate(constructor_ref));
    auto instance_define = data->instance_define;
    auto cls_ref = data->cls_ref;
    auto prototype = data->prototype;
    auto constructor = instance_define->constructor;
    std::shared_ptr<CtxValue> param[argc];
    for (auto i = 0; i < argc; ++i) {
      auto p = std::make_shared<JSCCtxValue>((JSGlobalContextRef)ctx, argv[i]);
      param[i] = std::static_pointer_cast<CtxValue>(p);
    }
    std::shared_ptr<T> ret = constructor(argc, param);
    instance_define->holder.insert({ ret.get(), ret });
    JSObjectRef obj_ref = JSObjectMake(ctx, cls_ref, nullptr);
    JSObjectSetPrivate(obj_ref, ret.get());
    JSObjectSetPrototype(ctx, obj_ref, prototype->value_);
    return obj_ref;
  };
}

template <typename T>
void JSCCtx::RegisterJsClass(const std::shared_ptr<InstanceDefine<T>>& instance_define) {
  JSClassDefinition cls_def = kJSClassDefinitionEmpty;
  cls_def.attributes = kJSClassAttributeNone;
  cls_def.callAsConstructor = NewConstructor<T>();
  auto name = hippy::base::StringViewUtils::ToU8StdStr(instance_define->name);
  cls_def.className = name.c_str();
  auto cls_ref = JSClassCreate(&cls_def);
  auto* data = new PrivateData<T>{instance_define.get(), cls_ref, RegisterPrototype(instance_define)};
  auto obj = JSObjectMake(context_, cls_ref, data);
  auto name_ref = JSStringCreateWithUTF8CString(name.c_str());
  JSObjectSetProperty(context_, JSContextGetGlobalObject(context_), name_ref,
                      obj,
                      kJSPropertyAttributeDontDelete, nullptr);
  JSStringRelease(name_ref);
  cls_def.finalize = [](JSObjectRef object) {
    delete static_cast<PrivateData<T>*>(JSObjectGetPrivate(object));
  };
}


}  // namespace napi
}  // namespace hippy
