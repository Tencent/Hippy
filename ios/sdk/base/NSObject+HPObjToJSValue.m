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

#import "NSObject+HPObjToJSValue.h"
#import "HippyAssert.h"

static JSValue *objectToJSValueInContext(id obj, JSContext *context) {
    if ([obj conformsToProtocol:@protocol(HippyObjToJSValueProtocol)]) {
        return [obj toJSValueInContext:context];
    }
    else {
        return [JSValue valueWithObject:obj inContext:context];
    }
}

@implementation NSArray (HPObjToJSValue)

- (JSValue *)toJSValueInContext:(JSContext *)context {
    NSUInteger size = [self count];
    JSValueRef *valueRefs = malloc(size * sizeof(JSValueRef));
    [self enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        valueRefs[idx] = objectToJSValueInContext(obj, context).JSValueRef;
    }];
    JSObjectRef object = JSObjectMakeArray(context.JSGlobalContextRef, size, valueRefs, NULL);
    free(valueRefs);
    return [JSValue valueWithJSValueRef:object inContext:context];
}

@end

@implementation NSSet (HPObjToJSValue)

- (JSValue *)toJSValueInContext:(JSContext *)context {
    NSUInteger size = [self count];
    JSValueRef *valueRefs = malloc(size * sizeof(JSValueRef));
    __block NSUInteger idx = 0;
    [self enumerateObjectsUsingBlock:^(id  _Nonnull obj, BOOL * _Nonnull stop) {
        valueRefs[idx++] = objectToJSValueInContext(obj, context).JSValueRef;
    }];
    JSObjectRef object = JSObjectMakeArray(context.JSGlobalContextRef, size, valueRefs, NULL);
    free(valueRefs);
    return [JSValue valueWithJSValueRef:object inContext:context];
}

@end

@implementation NSHashTable (HPObjToJSValue)

- (JSValue *)toJSValueInContext:(JSContext *)context {
    NSUInteger size = [self count];
    JSValueRef *valueRefs = malloc(size * sizeof(JSValueRef));
    [[self allObjects] enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        valueRefs[idx++] = objectToJSValueInContext(obj, context).JSValueRef;
    }];
    JSObjectRef object = JSObjectMakeArray(context.JSGlobalContextRef, size, valueRefs, NULL);
    free(valueRefs);
    return [JSValue valueWithJSValueRef:object inContext:context];
}

@end

@implementation NSDictionary (HPObjToJSValue)

- (JSValue *)toJSValueInContext:(JSContext *)context {
    JSValue *objectDic = [JSValue valueWithNewObjectInContext:context];
    [self enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, id  _Nonnull obj, BOOL * _Nonnull stop) {
        HippyAssert([key isKindOfClass:[NSString class]], @"key must be a string");
        if ([key isKindOfClass:[NSString class]]) {
            NSString *keyString = (NSString *)key;
            JSStringRef stringRef = JSStringCreateWithUTF8CString([keyString UTF8String]);
            JSValueRef objectRef = objectToJSValueInContext(obj, context).JSValueRef;
            if (JSValueIsObject(context.JSGlobalContextRef, objectDic.JSValueRef)) {
                JSObjectRef objRef = (JSObjectRef)objectDic.JSValueRef;
                JSObjectSetProperty(context.JSGlobalContextRef, objRef, stringRef, objectRef, kJSPropertyAttributeNone, NULL);
            }
            JSStringRelease(stringRef);
        }
    }];
    return objectDic;
}

@end

@implementation NSMapTable (HPObjToJSValue)

- (JSValue *)toJSValueInContext:(JSContext *)context {
    JSValue *objectDic = [JSValue valueWithNewObjectInContext:context];
    [[self dictionaryRepresentation] enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, id  _Nonnull obj, BOOL * _Nonnull stop) {
        HippyAssert([key isKindOfClass:[NSString class]], @"key must be a string");
        if ([key isKindOfClass:[NSString class]]) {
            NSString *keyString = (NSString *)key;
            JSStringRef stringRef = JSStringCreateWithUTF8CString([keyString UTF8String]);
            JSValueRef objectRef = objectToJSValueInContext(obj, context).JSValueRef;
            if (JSValueIsObject(context.JSGlobalContextRef, objectDic.JSValueRef)) {
                JSObjectRef objRef = (JSObjectRef)objectDic.JSValueRef;
                JSObjectSetProperty(context.JSGlobalContextRef, objRef, stringRef, objectRef, kJSPropertyAttributeNone, NULL);
            }
        }
    }];
    return objectDic;
}

@end

@implementation NSData (HPObjToJSValue)

static void bytesDeallocator(void* bytes, void* deallocatorContext) {
    CFDataRef dataRef = (CFDataRef)deallocatorContext;
    CFRelease(dataRef);
}

- (JSValue *)toJSValueInContext:(JSContext *)context {
    if (@available(iOS 10.0, *)) {
        CFDataRef dataRef = CFBridgingRetain(self);
        const void *data = [self bytes];
        NSUInteger size = [self length];
        JSObjectRef objectRef = JSObjectMakeArrayBufferWithBytesNoCopy(context.JSGlobalContextRef, (void *)data, size, bytesDeallocator, (void *)dataRef, NULL);
        return [JSValue valueWithJSValueRef:objectRef inContext:context];
    }
    return [JSValue valueWithObject:self inContext:context];
}

@end
