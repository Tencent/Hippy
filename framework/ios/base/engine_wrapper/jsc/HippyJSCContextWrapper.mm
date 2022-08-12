/*!
 * iOS SDK
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
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "HippyJSCContextWrapper.h"
#import <JavaScriptCore/JavaScriptCore.h>
#import "HippyAssert.h"
#import "NSObject+JSValue.h"

#include <memory.h>
#include "driver/napi/jsc/js_native_api_jsc.h"

static id StringJSONToObject(NSString *string) {
    @autoreleasepool {
        NSData *data = [string dataUsingEncoding:NSUTF8StringEncoding];
        id obj = [NSJSONSerialization JSONObjectWithData:data options:(0) error:nil];
        return obj;
    }
}

static BOOL IsJSValueFunction(JSValue *value) {
    if (!value) {
        return NO;
    }
    JSGlobalContextRef contextRef = value.context.JSGlobalContextRef;
    JSValueRef valueRef = value.JSValueRef;
    if (!JSValueIsObject(contextRef, valueRef)) {
        return NO;
    }
    JSObjectRef objRef = JSValueToObject(contextRef, valueRef, nil);
    if (!objRef) {
        return NO;
    }
    return JSObjectIsFunction(contextRef, objRef);
}

@interface HippyJSCContextWrapper () {
    std::weak_ptr<hippy::napi::JSCCtx> _napiContext;
    JSContext *_context;
    NSMutableDictionary *_callbackDic;
}

@end

@implementation HippyJSCContextWrapper

- (instancetype)initWithContext:(std::weak_ptr<hippy::napi::Ctx>)context {
    self = [super init];
    if (self) {
        auto strongContext = context.lock();
        HippyAssert(strongContext, @"context must be available");
        if (strongContext) {
            auto jscontext = std::static_pointer_cast<hippy::napi::JSCCtx>(strongContext);
            _napiContext = jscontext;
            _context = [JSContext contextWithJSGlobalContextRef:jscontext->GetCtxRef()];
            _callbackDic = [NSMutableDictionary dictionaryWithCapacity:8];
        }
    }
    return self;
}

- (std::weak_ptr<hippy::napi::Ctx>)underlyingContext {
    return _napiContext;
}

- (JSContext *)context {
    return _context;
}

- (NSString *)exception {
    return [[_context exception] toString];
}

- (BOOL)createGlobalObject:(NSString *)name withValue:(NSString *)value {
    @autoreleasepool {
        if (!name || !value) {
            return NO;
        }
        [_context setObject:name forKeyedSubscript:value];
        return YES;
    }
}

- (BOOL)createGlobalObject:(NSString *)name withJsonValue:(NSString *)value {
    @autoreleasepool {
        if (!name || !value) {
            return NO;
        }
        id obj = StringJSONToObject(value);
        if (!obj) {
            return NO;
        }
        JSValue *objValue = [obj toJSValueInContext:_context];
        if (!objValue) {
            return NO;
        }
        [_context setObject:objValue forKeyedSubscript:name];
        return YES;
    }
}

- (BOOL)createGlobalObject:(NSString *)name withDictionary:(NSDictionary *)value {
    @autoreleasepool {
        if (!name || !value) {
            return NO;
        }
        JSValue *mapValue = [value toJSValueInContext:_context];
        if (!mapValue) {
            return NO;
        }
        [_context setObject:mapValue forKeyedSubscript:name];
        return YES;
    }
}

- (id)globalObjectForName:(NSString *)name {
    @autoreleasepool {
        JSValue *value = [_context objectForKeyedSubscript:name];
        JSValueRef exception = NULL;
        id object = ObjectFromJSValueRef(_context.JSGlobalContextRef, value.JSValueRef, &exception);
        if (exception) {
            _context.exception = [JSValue valueWithJSValueRef:exception inContext:_context];
            return nil;
        }
        return object;
    }
}

- (std::shared_ptr<hippy::napi::CtxValue>)globalJSValueForName:(NSString *)name {
    @autoreleasepool {
        JSValue *value = [_context objectForKeyedSubscript:name];
        return std::make_shared<hippy::napi::JSCCtxValue>(_context.JSGlobalContextRef, value.JSValueRef);
    }
}

- (std::shared_ptr<hippy::napi::CtxValue>)property:(NSString *)propertyName
                                       forJSObject:(std::shared_ptr<hippy::napi::CtxValue>)object {
    @autoreleasepool {
        auto jscValue = std::static_pointer_cast<hippy::napi::JSCCtxValue>(object);
        JSValue *ocValue = [JSValue valueWithJSValueRef:jscValue->value_ inContext:_context];
        JSValue *obj = [ocValue objectForKeyedSubscript:propertyName];
        return std::make_shared<hippy::napi::JSCCtxValue>(_context.JSGlobalContextRef, obj.JSValueRef);
    }
}

- (BOOL)setProperties:(NSDictionary *)properties toGlobalObject:(NSString *)objectName {
    @autoreleasepool {
        if (!properties || !objectName) {
            return NO;
        }
        JSValue *globalObject = _context[objectName];
        if ([globalObject isNull] || [globalObject isUndefined]) {
            return NO;
        }
        for (NSString *key in properties) {
            if (![key isKindOfClass:[NSString class]]) {
                continue;
            }
            id value = properties[key];
            JSValue *obj = [value toJSValueInContext:_context];
            globalObject[key] = obj;
        }
        return YES;
    }
}

- (BOOL)setProperty:(NSString *)propertyName
         forJSValue:(std::shared_ptr<hippy::napi::CtxValue>)value
         toJSObject:(std::shared_ptr<hippy::napi::CtxValue>)object {
    @autoreleasepool {
        if (!propertyName || !value || !object) {
            return NO;
        }
        auto objRef = std::static_pointer_cast<hippy::napi::JSCCtxValue>(object);
        auto valueRef = std::static_pointer_cast<hippy::napi::JSCCtxValue>(value);
        JSValue *objc = [JSValue valueWithJSValueRef:objRef->value_ inContext:_context];
        JSValueRef exception = NULL;
        JSValue *valueObject = [JSValue valueWithJSValueRef:valueRef->value_ inContext:_context];
        if (exception) {
            _context.exception = [JSValue valueWithJSValueRef:exception inContext:_context];
            return NO;
        }
        objc[propertyName] = valueObject;
        return YES;
    }
}

- (void)registerFunction:(NSString *)funcName implementation:(FunctionImplementationBlock)implementation {
    @autoreleasepool {
        if (!funcName || !implementation) {
            return;
        }
        FunctionImplementationBlock callback = [implementation copy];
        JSContext *context = _context;
        JSGlobalContextRef contextRef = [context JSGlobalContextRef];
        auto native_func_callback = [](JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t cnt, const JSValueRef arguments[], JSValueRef* exception) -> JSValueRef {
            @autoreleasepool {
                JSContext *context = [JSContext contextWithJSGlobalContextRef:(JSGlobalContextRef)ctx];
                void *privateData = JSObjectGetPrivate(function);
                if (!privateData) {
                    *exception = [JSValue valueWithNewErrorFromMessage:@"Get private data from function failed" inContext:context].JSValueRef;
                    return JSValueMakeUndefined(ctx);
                }
                FunctionImplementationBlock block = (__bridge FunctionImplementationBlock)privateData;
                NSMutableArray *argAry = [NSMutableArray arrayWithCapacity:cnt];
                for (size_t index = 0; index < cnt; index++) {
                    JSValueRef valueRef = arguments[index];
                    id obj = ObjectFromJSValueRef((JSGlobalContextRef)ctx, valueRef, exception);
                    if (*exception) {
                        continue;
                    }
                    [argAry addObject:obj];
                }
                id ret = block([argAry copy]);
                if (ret) {
                    JSValue *retValue = [ret toJSValueInContext:context];
                    return retValue.JSValueRef;
                }
                return JSValueMakeUndefined(ctx);
            }
        };
        [_callbackDic setObject:callback forKey:funcName];
        JSClassDefinition cls_def = kJSClassDefinitionEmpty;
        cls_def.callAsFunction = native_func_callback;
        JSClassRef cls_ref = JSClassCreate(&cls_def);
        JSObjectRef func_object = JSObjectMake(contextRef, cls_ref, (__bridge void *)callback);
        JSClassRelease(cls_ref);
        JSStringRef JSFunctionName = JSStringCreateWithUTF8CString([funcName UTF8String]);
        JSValueRef exception = NULL;
        JSObjectSetProperty(contextRef, JSContextGetGlobalObject(contextRef), JSFunctionName, func_object, kJSPropertyAttributeNone, &exception);
        if (exception) {
            _context.exception = [JSValue valueWithJSValueRef:exception inContext:_context];
        }
        JSStringRelease(JSFunctionName);
    }
}

- (id)callFunction:(NSString *)funcName arguments:(NSArray *)arguments {
    @autoreleasepool {
        if (!funcName) {
            return nil;
        }
        JSContext *context = _context;
        JSValue *batchedbridgeValue = context[@"__fbBatchedBridge"];
        if (!batchedbridgeValue) {
            return nil;
        }
        JSValue *methodValue = batchedbridgeValue[funcName];
        if (!IsJSValueFunction(methodValue)) {
            return nil;
        }
        JSValueRef arrayValues[[arguments count]];
        for (size_t i = 0; i < [arguments count]; i++) {
            arrayValues[i] = [arguments[i] toJSValueInContext:context].JSValueRef;
        }
        JSValueRef exception = NULL;
        JSObjectRef functionObject = JSValueToObject(context.JSGlobalContextRef, methodValue.JSValueRef, &exception);
        if (exception) {
            _context.exception = [JSValue valueWithJSValueRef:exception inContext:_context];
            return nil;
        }
        JSValueRef ret = JSObjectCallAsFunction(context.JSGlobalContextRef, functionObject, NULL, [arguments count], arrayValues, &exception);
        if (exception) {
            _context.exception = [JSValue valueWithJSValueRef:exception inContext:_context];
            return nil;
        }
        id obj = ObjectFromJSValueRef(context.JSGlobalContextRef, ret, &exception);
        if (exception) {
            _context.exception = [JSValue valueWithJSValueRef:exception inContext:_context];
            return nil;
        }
        return obj;
    }
}

- (id)runScript:(NSString *)script sourceURL:(NSURL *)sourceURL {
    @autoreleasepool {
        JSContext *context = _context;
        JSValue *result = [context evaluateScript:script withSourceURL:sourceURL?:[NSURL URLWithString:@""]];
        JSValueRef exception = NULL;
        id object = ObjectFromJSValueRef(context.JSGlobalContextRef, result.JSValueRef, &exception);
        if (exception) {
            _context.exception = [JSValue valueWithJSValueRef:exception inContext:_context];
        }
        return object;
    }
}

- (std::shared_ptr<hippy::napi::CtxValue>)createNumber:(NSNumber *)number {
    @autoreleasepool {
        HippyAssert(number, @"number must not be null");
        if (number) {
            JSValueRef valueRef = [number toJSValueInContext:_context].JSValueRef;
            return std::make_shared<hippy::napi::JSCCtxValue>(_context.JSGlobalContextRef, valueRef);
        }
        return [self createUndefined];
    }
}

- (std::shared_ptr<hippy::napi::CtxValue>)createBool:(NSNumber *)number {
    @autoreleasepool {
        HippyAssert(number, @"number must not be null");
        if (number) {
            JSValueRef valueRef = [number toJSValueInContext:_context].JSValueRef;
            return std::make_shared<hippy::napi::JSCCtxValue>(_context.JSGlobalContextRef, valueRef);
        }
        return [self createUndefined];
    }
}

- (std::shared_ptr<hippy::napi::CtxValue>)createString:(NSString *)string {
    @autoreleasepool {
        HippyAssert(string, @"string must not be null");
        if (string) {
            JSValueRef valueRef = [string toJSValueInContext:_context].JSValueRef;
            return std::make_shared<hippy::napi::JSCCtxValue>(_context.JSGlobalContextRef, valueRef);
        }
        return [self createUndefined];
    }
}

- (std::shared_ptr<hippy::napi::CtxValue>)createUndefined {
    return std::make_shared<hippy::napi::JSCCtxValue>(_context.JSGlobalContextRef, JSValueMakeUndefined(_context.JSGlobalContextRef));
}

- (std::shared_ptr<hippy::napi::CtxValue>)createNull {
    return std::make_shared<hippy::napi::JSCCtxValue>(_context.JSGlobalContextRef, JSValueMakeNull(_context.JSGlobalContextRef));
}

- (std::shared_ptr<hippy::napi::CtxValue>)createObject:(NSDictionary *)dictionary {
    @autoreleasepool {
        HippyAssert(dictionary, @"dictionary must not be null");
        if (dictionary) {
            JSValueRef valueRef = [dictionary toJSValueInContext:_context].JSValueRef;
            return std::make_shared<hippy::napi::JSCCtxValue>(_context.JSGlobalContextRef, valueRef);
        }
        return [self createUndefined];
    }
}

- (std::shared_ptr<hippy::napi::CtxValue>)createObjectFromJsonString:(NSString *)JsonString {
    @autoreleasepool {
        HippyAssert(JsonString, @"JsonString must not be null");
        id obj = StringJSONToObject(JsonString);
        if (obj) {
            JSValueRef valueRef = [obj toJSValueInContext:_context].JSValueRef;
            return std::make_shared<hippy::napi::JSCCtxValue>(_context.JSGlobalContextRef, valueRef);
        }
        return [self createUndefined];
    }
}

- (std::shared_ptr<hippy::napi::CtxValue>)createArray:(NSArray *)array {
    @autoreleasepool {
        HippyAssert(array, @"array must not be null");
        if (array) {
            JSValueRef valueRef = [array toJSValueInContext:_context].JSValueRef;
            return std::make_shared<hippy::napi::JSCCtxValue>(_context.JSGlobalContextRef, valueRef);
        }
        return [self createUndefined];
    }
}

- (std::shared_ptr<hippy::napi::CtxValue>)createError:(NSString *)description {
    @autoreleasepool {
        HippyAssert(description, @"description must not be null");
        description = description?:@"";
        JSValueRef arguments[1];
        arguments[0] = [description toJSValueInContext:_context].JSValueRef;
        JSValueRef exception = NULL;
        JSValueRef errorObj = JSObjectMakeError(_context.JSGlobalContextRef, 1, arguments, &exception);
        if (exception) {
            _context.exception = [JSValue valueWithJSValueRef:exception inContext:_context];
            return std::make_shared<hippy::napi::JSCCtxValue>(_context.JSGlobalContextRef, errorObj);
        }
        return [self createUndefined];
    }
}

- (void)setContextName:(NSString *)name {
    [_context setName:name];
}

@end
