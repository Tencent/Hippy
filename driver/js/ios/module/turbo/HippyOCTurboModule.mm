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

#import "HippyOCTurboModule.h"
#import <objc/message.h>
#import "HippyBridgeMethod.h"
#import "HippyAssert.h"
#import "HippyUtils.h"
#import "HippyLog.h"
#import "HippyModuleMethod.h"
#include <core/napi/jsc/js_native_turbo_jsc.h>
#include "core/napi/jsc/js_native_jsc_helper.h"
#include "core/napi/jsc/js_native_api_jsc.h"
#include <JavaScriptCore/JavaScriptCore.h>
#include <JavaScriptCore/JSObjectRef.h>
#import "NSObject+HippyTurbo.h"
#import "HippyLog.h"
#include "core/base/string_view_utils.h"
#import "HippyBridge+Private.h"
#import "HippyJSCExecutor.h"
#import "HippyTurboModuleManager.h"

using namespace hippy;
using namespace napi;

using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;

@interface HippyOCTurboModule () {
    std::shared_ptr<HippyTurboModule> _turboModule;

}
@property(nonatomic, weak, readwrite) HippyBridge *bridge;
@end

@implementation HippyOCTurboModule

HIPPY_EXPORT_TURBO_MODULE(HippyOCTurboModule)

- (void)dealloc {
    _turboModule->callback_ = nullptr;
    _turboModule = nullptr;
}

- (instancetype)initWithName:(NSString *)moduleName bridge:(HippyBridge *)bridge {
    if (self = [self init]) {
        _bridge = bridge;
        _turboModule = std::make_shared<HippyTurboModule>(std::string([moduleName UTF8String]));
        
        __weak HippyOCTurboModule *weakSelf = self;
        _turboModule->callback_ = [weakSelf](const TurboEnv& env,
                                             const std::shared_ptr<napi::CtxValue> &thisVal,
                                             const std::shared_ptr<napi::CtxValue> *args,
                                             size_t count) -> std::shared_ptr<napi::CtxValue> {
            std::shared_ptr<napi::Ctx> context = env.context_;

            // get method name
            unicode_string_view name;
            if (!context->GetValueString(thisVal, &name)) {
                return context->CreateNull();
            }
            std::string methodName = StringViewUtils::ToU8StdStr(name);

            // get argument
            NSInteger argumentCount = static_cast<long>(count);
            NSMutableArray *argumentArray = @[].mutableCopy;
            for (NSInteger i = 0; i < argumentCount; i++) {
                std::shared_ptr<napi::CtxValue> ctxValue = *(args + i);
                [argumentArray addObject:convertCtxValueToObjcObject(context, ctxValue, weakSelf)?: [NSNull null]];
            }

            id objcRes = [weakSelf invokeObjCMethodWithName:[NSString stringWithUTF8String:methodName.c_str()]
                                              argumentCount:argumentCount
                                              argumentArray:argumentArray];
            std::shared_ptr<napi::CtxValue> result = convertObjcObjectToCtxValue(context, objcRes, weakSelf);
            return result;
        };
    }
    return self;
}

- (std::shared_ptr<HippyTurboModule>)getTurboModule {
    return _turboModule;
}

- (id)invokeObjCMethodWithName:(NSString *)methodName
                 argumentCount:(NSInteger)argumentCount
                 argumentArray:(NSArray *)argumentArray {
    return [self invokeObjCMethodWithName:methodName
                            argumentCount:argumentCount
                            argumentArray:argumentArray
                                   object:self];
}

- (id)invokeObjCMethodWithName:(NSString *)methodName
                 argumentCount:(NSInteger)argumentCount
                 argumentArray:(NSArray *)argumentArray
                        object:(NSObject *)obj {
    NSArray<id<HippyBridgeMethod>> *moduleMethods = [obj hippyTurboModuleMethods];
    id<HippyBridgeMethod> method;
    for (id<HippyBridgeMethod> m in moduleMethods) {
        if ([m.JSMethodName isEqualToString:methodName]) {
            method = m;
            break;
        }
    }

    if (HIPPY_DEBUG && !method) {
        HippyLogError(@"Unknown methodID: %@ for module:%@", methodName, obj);
        return nil;
    }

    @try {
        id value = [method invokeWithBridge:_bridge module:obj arguments:argumentArray];
        return value;
    } @catch (NSException *exception) {
        // Pass on JS exceptions
        if ([exception.name hasPrefix:HippyFatalExceptionName]) {
            @throw exception;
        }

        NSString *message = [NSString stringWithFormat:@"Exception '%@' was thrown while invoking %@ on target %@ with params %@", exception,
                                      method.JSMethodName, NSStringFromClass([self class]) ,argumentArray];
        NSError *error = HippyErrorWithMessageAndModuleName(message, NSStringFromClass([self class]));
        HippyFatal(error);
        return nil;
    }
}

#pragma mark -

static std::shared_ptr<napi::CtxValue> convertObjcObjectToCtxValue(const std::shared_ptr<napi::Ctx> &context,
                                                                   id objcObject,
                                                                   HippyOCTurboModule *module) {

    std::shared_ptr<napi::CtxValue> result;

    if ([objcObject isKindOfClass:[NSString class]]) {
        result = context->CreateString([((NSString *)objcObject) UTF8String]);
    } else if ([objcObject isKindOfClass:[NSNumber class]]) {
      if ([objcObject isKindOfClass:[@YES class]]) {
          result = context->CreateBoolean(((NSNumber *)objcObject).boolValue);
      } else {
          result = context->CreateNumber(((NSNumber *)objcObject).doubleValue);
      }
    } else if ([objcObject isKindOfClass:[NSDictionary class]]) {
        result = convertNSDictionaryToCtxValue(context, objcObject, module);
    } else if ([objcObject isKindOfClass:[NSArray class]]) {
        result = convertNSArrayToCtxValue(context, objcObject, module);
    } else if ([objcObject isKindOfClass:[NSObject class]]) {
        result = convertNSObjectToCtxValue(context, objcObject, module);
    } else {
        result = context->CreateNull();
    }
    return result;
}

static std::shared_ptr<napi::CtxValue> convertNSDictionaryToCtxValue(const std::shared_ptr<napi::Ctx> &context,
                                                                     NSDictionary *dict,
                                                                     HippyOCTurboModule *module) {
    /*
         NSError *error;
         NSData *data = [NSJSONSerialization dataWithJSONObject:dict
                                                        options:NSJSONWritingFragmentsAllowed
                                                          error:&error];
         if (error) {
             HippyLogError(@"convert dict to data failed:%@", error);
         }

         // 直接使用下面这个类型转换，有时候后面会补\xa3\xa3\xa3....，怀疑是字节对齐问题
         // const char* json = (char *)[data bytes];

         NSString *str = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
         const char* json = [str UTF8String];
         result = context->CreateObject(json);
     */
    
    if (!dict) {
        return context->CreateNull();
    }
    
    std::shared_ptr<napi::JSCCtx> jscCtx = std::static_pointer_cast<napi::JSCCtx>(context);
    JSClassDefinition cls_def = kJSClassDefinitionEmpty;
    cls_def.className = [@"Object" UTF8String];
    JSClassRef cls_ref = JSClassCreate(&cls_def);
    JSObjectRef jsObj = JSObjectMake(jscCtx->context_, cls_ref, (__bridge void *)dict);
    JSClassRelease(cls_ref);
    for (NSString *propertyName in dict) {
        id propValue = [dict valueForKey:propertyName];
        std::shared_ptr<napi::CtxValue> propRef = convertObjcObjectToCtxValue(jscCtx, propValue, module);
        std::shared_ptr<JSCCtxValue> ctx_value =
            std::static_pointer_cast<JSCCtxValue>(propRef);
        JSValueRef valueRef = ctx_value->value_;
        
        JSStringRef propName = JSStringCreateWithCFString((__bridge CFStringRef)propertyName);
        JSValueRef jsError = NULL;
        JSObjectSetProperty(jscCtx->context_,
                            jsObj,
                            propName,
                            valueRef,
                            kJSPropertyAttributeNone,
                            &jsError);
        JSStringRelease(propName);
    }
    return std::make_shared<JSCCtxValue>(jscCtx->context_, jsObj);
}

static std::shared_ptr<napi::CtxValue> convertNSArrayToCtxValue(const std::shared_ptr<napi::Ctx> &context,
                                                                NSArray *array,
                                                                HippyOCTurboModule *module) {
    if (!array) {
        return context->CreateNull();
    }
    
    size_t size = static_cast<size_t>(array.count);
    std::shared_ptr<napi::CtxValue> buffer[size];
    for (size_t idx = 0; idx < array.count; idx++) {
        buffer[idx] = convertObjcObjectToCtxValue(context, array[idx], module);
    }
    return context->CreateArray(size, buffer);
}

static std::shared_ptr<napi::CtxValue> convertNSObjectToCtxValue(const std::shared_ptr<napi::Ctx> &context,
                                                                id objcObject,
                                                                HippyOCTurboModule *module) {
    std::shared_ptr<napi::JSCCtx> jscCtx = std::static_pointer_cast<napi::JSCCtx>(context);
    if ([objcObject isKindOfClass:[HippyOCTurboModule class]]) {
        NSString *name = [[objcObject class] turoboModuleName];
        HippyJSCExecutor *jsExecutor = (HippyJSCExecutor *)module.bridge.javaScriptExecutor;
        JSValueRef jsValueObj = [jsExecutor JSTurboObjectWithName:name];
        JSObjectRef jsObj = JSValueToObject(jscCtx->context_, jsValueObj, NULL);
        
        JSGlobalContextRef globalContextRef = JSContextGetGlobalContext(jscCtx->context_);
        JSContext *ctx = [JSContext contextWithJSGlobalContextRef:globalContextRef];
        JSValue *jsValue = [JSValue valueWithJSValueRef:jsValueObj inContext:ctx];
        HippyTurboModuleManager *turboManager = module.bridge.turboModuleManager;
        [turboManager bindJSObject:jsValue toModuleName:name];
        
        return std::make_shared<JSCCtxValue>(jscCtx->context_, jsObj);
    }
    return std::make_shared<JSCCtxValue>(jscCtx->context_, JSValueMakeNull(jscCtx->context_));
}

#pragma mark -

/// null & undefined : nil
/// bool * number    : NSNumber
/// string           : NSString
/// array            : NSArray
/// function         : HippyResponseSenderBlock
/// object           : NSDictionary
/// JSON             : NSArray & NSDictionary

static id convertCtxValueToObjcObject(const std::shared_ptr<napi::Ctx> &context,
                                      const std::shared_ptr<napi::CtxValue> &value,
                                      HippyOCTurboModule *module) {

    std::shared_ptr<napi::JSCCtx> jscCtx = std::static_pointer_cast<napi::JSCCtx>(context);
    std::shared_ptr<napi::JSCCtxValue> jscValue = std::static_pointer_cast<napi::JSCCtxValue>(value);

    id objcObject;
    double numberResult;
    bool boolResult;
    unicode_string_view result;

    if (context->IsNullOrUndefined(value)) {
        objcObject = nil;
    } else if (context->GetValueNumber(value, &numberResult)) {
        objcObject = @(numberResult);
    } else if (context->GetValueBoolean(value, &boolResult)) {
        objcObject = @(boolResult);
    } else if (context->GetValueString(value, &result)) {
        std::string resultStr = StringViewUtils::ToU8StdStr(result);
        objcObject = [NSString stringWithUTF8String:resultStr.c_str()];
    } else if (JSValueIsObject(jscCtx->context_, jscValue->value_)) {
        if (context->IsArray(value)) {
            objcObject = convertJSIArrayToNSArray(jscCtx, jscValue, module);
        } else if (context->IsFunction(value)) {
            // HippyResponseSenderBlock
            // NOTE: 方法必须走promise
//            return ^(NSArray *result) {
//                size_t argumentCount = static_cast<size_t>(result.count);
//                std::shared_ptr<CtxValue> argumets[argumentCount];
//                for(NSUInteger i = 0; i< result.count; i++){
//                    size_t index = static_cast<size_t>(i);
//                    argumets[index] = convertObjcObjectToCtxValue(context, result[i]);
//                }
//                context->CallFunction(value, argumentCount, argumets);
//            };
            objcObject = @(0);
        } else {
            objcObject = convertJSIObjectToTurboObject(jscCtx, jscValue, module);
            if (!objcObject) {
                //map
                objcObject = convertJSIObjectToNSDictionary(jscCtx, jscValue, module);
            }
        }
    } else if (context->GetValueJson(value, &result)) {
        objcObject = convertJSIObjectToNSObject(jscCtx, jscValue);
    }
    return objcObject;
}

static id convertJSIObjectToNSObject(const std::shared_ptr<napi::JSCCtx> &context,
                                     const std::shared_ptr<napi::JSCCtxValue> &value) {
    unicode_string_view result;
    if (!context->GetValueJson(value, &result)) {
        return nil;
    }
    std::string resultStr = StringViewUtils::ToU8StdStr(result);
    NSString *jsonString = [NSString stringWithCString:resultStr.c_str() encoding:[NSString defaultCStringEncoding]];
    NSData *data = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error;
    id objcObject = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];
    if (error) {
        HippyLogError(@"JSONObjectWithData error:%@", error);
    }
    return objcObject;
}

static NSArray *convertJSIArrayToNSArray(const std::shared_ptr<napi::JSCCtx> &context,
                                         const std::shared_ptr<napi::JSCCtxValue> &value,
                                         HippyOCTurboModule *module) {
    size_t length = context->GetArrayLength(value);
    NSMutableArray *result = [NSMutableArray new];
    for (uint32_t i = 0; i < length; i++) {
        std::shared_ptr<napi::CtxValue> v = context->CopyArrayElement(value, i);
        [result addObject:convertCtxValueToObjcObject(context, v, module) ?: [NSNull null]];
    }
    return [result copy];
}

static NSObject *convertJSIObjectToTurboObject(const std::shared_ptr<napi::JSCCtx> &context,
                                               const std::shared_ptr<napi::JSCCtxValue> &value,
                                               HippyOCTurboModule *module) {    
    JSGlobalContextRef globalContextRef = JSContextGetGlobalContext(context->context_);
    JSContext *ctx = [JSContext contextWithJSGlobalContextRef:globalContextRef];
    JSValue *jsValue = [JSValue valueWithJSValueRef:value->value_ inContext:ctx];
    HippyTurboModuleManager *turboManager = module.bridge.turboModuleManager;
    NSString *moduleNameStr = [turboManager turboModuleNameForJSObject:jsValue];
    
    if (moduleNameStr) {
        HippyOCTurboModule *turboModule = [module.bridge turboModuleWithName:moduleNameStr];
        return turboModule;
    }
    return nil;
}

static NSDictionary *convertJSIObjectToNSDictionary(const std::shared_ptr<napi::JSCCtx> &context,
                                                    const std::shared_ptr<napi::JSCCtxValue> &value,
                                                    HippyOCTurboModule *module) {
    JSValueRef exception = nullptr;
    JSObjectRef object = JSValueToObject(context->context_, value->value_, &exception);
    if (exception) {
        HippyLogInfo(@"JSValueToObject throw exception:%@", exception);
        id jsonObj = convertJSIObjectToNSObject(context, value);
        if (jsonObj && [jsonObj isKindOfClass:[NSDictionary class]]) {
            return (NSDictionary *)jsonObj;
        }
        HippyLogError(@"convertJSIJsonToDict failed:%@", jsonObj);
        return nil;
    }
    
    JSPropertyNameArrayRef names = JSObjectCopyPropertyNames(context->context_, object);
    size_t len = JSPropertyNameArrayGetCount(names);

    NSMutableDictionary *result = [NSMutableDictionary new];
    for (size_t i = 0; i < len; i++) {
        JSStringRef str = JSPropertyNameArrayGetNameAtIndex(names, i);
        size_t max_size = JSStringGetMaximumUTF8CStringSize(str);
        char* buf = new char[max_size];
        JSStringGetUTF8CString(str, buf, max_size);
        id objcValue = convertCtxValueToObjcObject(context,
                                                   context->CopyNamedProperty(value, buf),
                                                   module) ?: [NSNull null];
        [result setObject:objcValue forKey:[NSString stringWithUTF8String:buf]];
        delete[] buf;
    }
    JSPropertyNameArrayRelease(names);
    return [result copy];
}

@end
