/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.
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

#include <core/napi/jsc/js_native_turbo_jsc.h>
#include "core/napi/jsc/js_native_jsc_helper.h"
#include "core/napi/jsc/js_native_api_jsc.h"

namespace hippy {
namespace napi {

struct HostObjectProxy {
    
    HostObjectProxy(
        ObjcTurboEnv& env,
        const std::shared_ptr<HostObject>& ho)
        : turboEnv(env), hostObject(ho) {}

    ObjcTurboEnv &turboEnv;
    const std::shared_ptr<HostObject> hostObject;
    
    static void finalize(JSObjectRef obj) {
      auto hostObject = static_cast<HostObjectProxy*>(JSObjectGetPrivate(obj));
      JSObjectSetPrivate(obj, nullptr);
      delete hostObject;
    }
    
    static JSValueRef getProperty(
      JSContextRef ctx,
      JSObjectRef object,
      JSStringRef propName,
      JSValueRef* exception) {
        auto proxy = static_cast<HostObjectProxy*>(JSObjectGetPrivate(object));
        ObjcTurboEnv& turboEnv = proxy->turboEnv;
        std::shared_ptr<JSCCtx> context = std::dynamic_pointer_cast<JSCCtx>(turboEnv.context_);
        auto props = context->CreateString(JsStrToUTF8(propName).c_str());
          
        auto ret = proxy->hostObject->Get(turboEnv, props);
        std::shared_ptr<JSCCtxValue> jscValue = std::static_pointer_cast<JSCCtxValue>(ret);
        return jscValue->value_;
    }

    static bool setProperty(
      JSContextRef ctx,
      JSObjectRef object,
      JSStringRef propName,
      JSValueRef value,
      JSValueRef* exception) {
        auto proxy = static_cast<HostObjectProxy*>(JSObjectGetPrivate(object));
        auto turboEnv = proxy->turboEnv;
        std::shared_ptr<JSCCtx> context = std::dynamic_pointer_cast<JSCCtx>(turboEnv.context_);
        auto props = context->CreateString(JsStrToUTF8(propName).c_str());
          
        auto jscValue = std::make_shared<JSCCtxValue>(context->context_, value);
        proxy->hostObject->Set(turboEnv, props, jscValue);
        return true;
    }

    static void getPropertyNames(
      JSContextRef ctx,
      JSObjectRef object,
      JSPropertyNameAccumulatorRef propertyNames) noexcept {
        auto proxy = static_cast<HostObjectProxy*>(JSObjectGetPrivate(object));
        auto turboEnv = proxy->turboEnv;
        
        auto names = proxy->hostObject->GetPropertyNames(turboEnv);
        for (auto& name : names) {
            std::shared_ptr<JSCCtxValue> jscValue = std::dynamic_pointer_cast<JSCCtxValue>(name);
            JSStringRef stringRef = JSValueToStringCopy(ctx, jscValue->value_, nullptr);
            JSPropertyNameAccumulatorAddName(propertyNames, stringRef);
        }
    }
};

#pragma mark -

JSStringRef getLengthString() {
  static JSStringRef length = JSStringCreateWithUTF8CString("length");
  return length;
}

JSStringRef getNameString() {
  static JSStringRef name = JSStringCreateWithUTF8CString("name");
  return name;
}

JSStringRef getFunctionString() {
  static JSStringRef func = JSStringCreateWithUTF8CString("Function");
  return func;
}

struct HostFunctionProxy {

    HostFunctionProxy(
        ObjcTurboEnv& env,
        HostFunctionType hf,
        unsigned ac,
        JSStringRef n)
        : turboEnv(env),
          argCount(ac),
          name(JSStringRetain(n)),
          hostFunction(hf) {}

    ObjcTurboEnv &turboEnv;
    unsigned argCount;
    JSStringRef name;
    HostFunctionType hostFunction;
    
    static void finalize(JSObjectRef object) {
        HostFunctionProxy* metadata = static_cast<HostFunctionProxy*>(JSObjectGetPrivate(object));
        JSObjectSetPrivate(object, nullptr);
        delete metadata;
    }

  static void initialize(JSContextRef ctx, JSObjectRef object) {

        auto proxy = static_cast<HostFunctionProxy*>(JSObjectGetPrivate(object));
        JSObjectRef global = JSContextGetGlobalObject(ctx);

        JSValueRef exc = nullptr;
        JSObjectSetProperty(
            ctx,
            global,
            getLengthString(),
            JSValueMakeNumber(ctx, proxy->argCount),
            kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontEnum | kJSPropertyAttributeDontDelete,
            &exc);
        if (exc) {
          exc = nullptr;
        }

        JSObjectSetProperty(
            ctx,
            global,
            getNameString(),
            JSValueMakeString(ctx, proxy->name),
            kJSPropertyAttributeReadOnly | kJSPropertyAttributeDontEnum | kJSPropertyAttributeDontDelete,
            &exc);
        if (exc) {
          exc = nullptr;
        }

        JSValueRef value = JSObjectGetProperty(ctx, global, getFunctionString(), &exc);
        JSObjectRef funcCtor = JSValueToObject(ctx, value, &exc);
        if (!funcCtor) {
          return;
        }
        JSValueRef funcProto = JSObjectGetPrototype(ctx, funcCtor);
        JSObjectSetPrototype(ctx, object, funcProto);
  }

  static JSValueRef call(
      JSContextRef ctx,
      JSObjectRef function,
      JSObjectRef thisObject,
      size_t argumentCount,
      const JSValueRef arguments[],
      JSValueRef* exception) {

        auto proxy = static_cast<HostFunctionProxy*>(JSObjectGetPrivate(function));
        ObjcTurboEnv &turboEnv = proxy->turboEnv;
        std::shared_ptr<JSCCtx> context = std::dynamic_pointer_cast<JSCCtx>(turboEnv.context_);

        const unsigned maxStackArgCount = 8;
        std::shared_ptr<CtxValue> *args;
        std::shared_ptr<CtxValue> stackArgs[maxStackArgCount];
        for (size_t i = 0; i < argumentCount; i++) {
            stackArgs[i] = std::make_shared<JSCCtxValue>(context->context_, arguments[i]);
        }
        args = stackArgs;

        auto thisVal = std::make_shared<JSCCtxValue>(context->context_, JSValueMakeString(context->context_, proxy->name));
        auto ret = proxy->hostFunction(turboEnv, thisVal, args, argumentCount);
        std::shared_ptr<JSCCtxValue> jscValue = std::static_pointer_cast<JSCCtxValue>(ret);
        return jscValue->value_;
  }
};

#pragma mark -

ObjcTurboEnv::ObjcTurboEnv(std::shared_ptr<Ctx> ctx) : TurboEnv(ctx){}
ObjcTurboEnv::~ObjcTurboEnv() {}

std::once_flag hostObjectClassOnceFlag;
JSClassRef hostObjectClass{};

std::shared_ptr<CtxValue> ObjcTurboEnv::CreateObject(const std::shared_ptr<HostObject> &hostObject) {

    std::call_once(hostObjectClassOnceFlag, []() {
        JSClassDefinition hostObjectClassDef = kJSClassDefinitionEmpty;
        hostObjectClassDef.version = 0;
        hostObjectClassDef.attributes = kJSClassAttributeNoAutomaticPrototype;
        hostObjectClassDef.finalize = HostObjectProxy::finalize;
        hostObjectClassDef.getProperty = HostObjectProxy::getProperty;
        hostObjectClassDef.setProperty = HostObjectProxy::setProperty;
        hostObjectClassDef.getPropertyNames = HostObjectProxy::getPropertyNames;
        hostObjectClass = JSClassCreate(&hostObjectClassDef);
    });

    std::shared_ptr<JSCCtx> context = std::dynamic_pointer_cast<JSCCtx>(context_);
    JSObjectRef obj = JSObjectMake(context->context_, hostObjectClass, new HostObjectProxy(*this, hostObject));

    auto jscValue = std::make_shared<JSCCtxValue>(context->context_, obj);
    return jscValue;
}

std::once_flag hostFunctionClassOnceFlag;
JSClassRef hostFunctionClass{};

std::shared_ptr<CtxValue> ObjcTurboEnv::CreateFunction( const std::shared_ptr<CtxValue> &name, int paramCount, HostFunctionType func) {

    std::call_once(hostFunctionClassOnceFlag, []() {
        JSClassDefinition functionClass = kJSClassDefinitionEmpty;
        functionClass.version = 0;
        functionClass.attributes = kJSClassAttributeNoAutomaticPrototype;
        functionClass.initialize = HostFunctionProxy::initialize;
        functionClass.finalize = HostFunctionProxy::finalize;
        functionClass.callAsFunction = HostFunctionProxy::call;
        hostFunctionClass = JSClassCreate(&functionClass);
    });

    auto jscName = std::static_pointer_cast<JSCCtxValue>(name);
    JSStringRef nameRef = (JSStringRef)(jscName->value_);

    std::shared_ptr<JSCCtx> context = std::dynamic_pointer_cast<JSCCtx>(context_);
    JSObjectRef funcRef = JSObjectMake(context->context_, hostFunctionClass, new HostFunctionProxy(*this, func, paramCount, nameRef));

    auto jscValue = std::make_shared<JSCCtxValue>(context->context_, funcRef);
    return jscValue;
}

}  // namespace napi
}  // namespace hippy

