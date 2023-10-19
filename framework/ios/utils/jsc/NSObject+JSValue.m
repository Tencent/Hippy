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

#import "NSObject+JSValue.h"
#import "HippyLog.h"

@implementation NSObject (JSValue)

- (JSValue *)toJSValueInContext:(JSContext *)context {
    @autoreleasepool {
#ifdef DEBUG
        if ([self isKindOfClass:NSClassFromString(@"NSString")] ||
            [self isKindOfClass:NSClassFromString(@"NSNumber")] ||
            [self isKindOfClass:NSClassFromString(@"NSDate")] ||
            [self isKindOfClass:NSClassFromString(@"NSNull")]) {
        }
        else {
            HippyLogError(@"unsupport type to JSValue:%@", NSStringFromClass([self class]));
        }
#endif //DEBUG
        return [JSValue valueWithObject:self inContext:context];
    }
}

@end

@implementation NSArray (JSValue)

- (JSValue *)toJSValueInContext:(JSContext *)context {
    @autoreleasepool {
        JSValue *value = [JSValue valueWithNewArrayInContext:context];
        for (int index = 0; index < [self count]; index++) {
            id obj = [self objectAtIndex:index];
            value[index] = [obj toJSValueInContext:context];
        }
        return value;
    }
}

@end

@implementation NSDictionary (JSValue)

- (JSValue *)toJSValueInContext:(JSContext *)context {
    @autoreleasepool {
        JSValue *dicValue = [JSValue valueWithNewObjectInContext:context];
        for (id key in self) {
            id value = [self objectForKey:key];
            JSValue *JSKey = [key toJSValueInContext:context];
            JSValue *JSValue = [value toJSValueInContext:context];
            dicValue[JSKey] = JSValue;
        }
        return dicValue;
    }
}

@end

@implementation NSData (JSValue)

static void JSCCtx_dataBufferFree(void* bytes, void* deallocatorContext) {
    free(bytes);
}

- (JSValue *)toJSValueInContext:(JSContext *)context {
    @autoreleasepool {
        size_t length = [self length];
        void *data = malloc(length);
        if (!data) {
            HippyLogError(@"out of memory, NSData to JSValue memory allocation failure");
            return [JSValue valueWithObject:self inContext:context];
        }
        [self getBytes:data length:length];
        JSValueRef exception = NULL;
        JSValueRef value_ref = JSObjectMakeArrayBufferWithBytesNoCopy(context.JSGlobalContextRef, data, length, JSCCtx_dataBufferFree, NULL, &exception);
        if (exception) {
            return [JSValue valueWithUndefinedInContext:context];
        }
        return [JSValue valueWithJSValueRef:value_ref inContext:context];
    }
}

@end

static NSString *StringFromJSStringRef(JSStringRef stringRef) {
    @autoreleasepool {
        if (!stringRef) {
            return nil;
        }
        size_t size = JSStringGetMaximumUTF8CStringSize(stringRef);
        void *buffer = malloc(size);
        memset(buffer, 0, size);
        JSStringGetUTF8CString(stringRef, buffer, size);
        NSString *string = [NSString stringWithUTF8String:buffer];
        free(buffer);
        return string;
    }
}

id ObjectFromJSValueRef(JSGlobalContextRef const context, JSValueRef const value, JSValueRef *exception) {
    @autoreleasepool {
        id object = nil;
        if (JSValueIsUndefined(context, value)) {
        }
        else if (JSValueIsNull(context, value)) {
            object = [NSNull null];
        }
        else if (JSValueIsBoolean(context, value)) {
            object = @(JSValueToBoolean(context, value));
        }
        else if (JSValueIsString(context, value)) {
            JSStringRef stringRef = JSValueToStringCopy(context, value, exception);
            if (*exception) {
                JSStringRelease(stringRef);
                return nil;
            }
            object = StringFromJSStringRef(stringRef);
            JSStringRelease(stringRef);
        }
        else if (JSValueIsNumber(context, value)) {
            double number = JSValueToNumber(context, value, exception);
            if (*exception) {
                return nil;
            }
            object = @(number);
        }
        else if (JSValueIsArray(context, value)) {
            JSObjectRef arrayRef = JSValueToObject(context, value, exception);
            if (*exception) {
                return nil;
            }
            if (!arrayRef) {
                return nil;
            }
            static CFStringRef len_string = CFSTR("length");
            JSStringRef propName = JSStringCreateWithCFString(len_string);
            JSValueRef val = JSObjectGetProperty(context, arrayRef, propName, exception);
            if (*exception) {
                JSStringRelease(propName);
                return nil;
            }
            if (!val) {
                JSStringRelease(propName);
                return nil;
            }
            JSStringRelease(propName);
            int32_t count = JSValueToNumber(context, val, exception);
            if (*exception) {
                return nil;
            }
            NSMutableArray *array = [NSMutableArray arrayWithCapacity:count];
            for (int32_t i = 0; i < count; ++i) {
                JSValueRef element = JSObjectGetPropertyAtIndex(context, arrayRef, i, exception);
                if (*exception) {
                    return nil;
                }
                if (!element) {
                    continue;
                }
                id elementObject = ObjectFromJSValueRef(context, element, exception);
                if (*exception) {
                    return nil;
                }
                if (elementObject) {
                    [array addObject:elementObject];
                }
            }
            object = array;
        }
        else if (kJSTypedArrayTypeNone != JSValueGetTypedArrayType(context, value, exception)) {
            JSTypedArrayType type = JSValueGetTypedArrayType(context, value, exception);
            JSObjectRef objectRef = JSValueToObject(context, value, exception);
            if (kJSTypedArrayTypeArrayBuffer == type) {
                void *arrayBufferPtr = JSObjectGetArrayBufferBytesPtr(context, objectRef, exception);
                if (*exception) {
                    return nil;
                }
                if (!arrayBufferPtr) {
                    return nil;
                }
                size_t length = JSObjectGetArrayBufferByteLength(context, objectRef, exception);
                if (*exception) {
                    return nil;
                }
                object = [NSData dataWithBytes:arrayBufferPtr length:length];
            }
            else if (kJSTypedArrayTypeNone != type) {
                void *typedArrayPtr = JSObjectGetTypedArrayBytesPtr(context, objectRef, exception);
                if (*exception) {
                    return nil;
                }
                if (typedArrayPtr) {
                    return nil;
                }
                size_t length = JSObjectGetTypedArrayByteLength(context, objectRef, exception);
                if (*exception) {
                    return nil;
                }
                object = [NSData dataWithBytes:typedArrayPtr length:length];
            }
        }
        else if (JSValueIsObject(context, value)) {
            JSObjectRef objectRef = JSValueToObject(context, value, exception);
            if (*exception) {
                return nil;
            }
            if (!objectRef) {
                return nil;
            }
            JSPropertyNameArrayRef nameArray = JSObjectCopyPropertyNames(context, objectRef);
            size_t len = JSPropertyNameArrayGetCount(nameArray);
            NSMutableDictionary<NSString *, id> *dic = [NSMutableDictionary dictionaryWithCapacity:len];
            for (size_t i = 0; i < len; i++) {
                JSStringRef propertyNameRef = JSPropertyNameArrayGetNameAtIndex(nameArray, i);
                JSValueRef valueRef = JSObjectGetProperty(context, objectRef, propertyNameRef, exception);
                if (*exception) {
                    JSPropertyNameArrayRelease(nameArray);
                    return nil;
                }
                if (!valueRef) {
                    continue;
                }
                NSString *dicKey = StringFromJSStringRef(propertyNameRef);
                id dicValue = ObjectFromJSValueRef(context, valueRef, exception);
                if (dicKey && dicValue) {
                    dic[dicKey] = dicValue;
                }
            }
            object = dic;
            JSPropertyNameArrayRelease(nameArray);
        }
        return object;
    }
}
