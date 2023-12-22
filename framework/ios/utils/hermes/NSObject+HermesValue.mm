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

#import "NSObject+HermesValue.h"
#import "HippyAssert.h"

@implementation NSObject (HermesValue)

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime {
#ifdef DEBUG
    BOOL isRightType =  [self isKindOfClass:[NSArray class]] ||
                        [self isKindOfClass:[NSDictionary class]] ||
                        [self isKindOfClass:[NSData class]] ||
                        [self isKindOfClass:[NSString class]] ||
                        [self isKindOfClass:[NSNumber class]];
    HippyAssert(isRightType, @"toHermesValueInRuntime is not supported by %@ class", NSStringFromClass([self class]));
#endif
    auto object = facebook::jsi::Object(runtime);
    return facebook::jsi::Value(runtime, object);
}

@end

@implementation NSArray (HermesValue)

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime {
    size_t count = [self count];
    auto array = facebook::jsi::Array(runtime, count);
    for (size_t i = 0; i < count; i++) {
        id obj = [self objectAtIndex:i];
        auto element =  [obj toHermesValueInRuntime:runtime];
        array.setValueAtIndex(runtime, i, element);
    }
    return facebook::jsi::Value(runtime, array);
}

@end

@implementation NSDictionary (HermesValue)

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime {
    auto object = facebook::jsi::Object(runtime);
    for (id key in self) {
        id value = [self objectForKey:key];
        auto hermes_key = [key toHermesValueInRuntime:runtime];
        auto hermes_value = [value toHermesValueInRuntime:runtime];
        if (hermes_key.isString()) {
            object.setProperty(runtime, hermes_key.asString(runtime), hermes_value);
        }
    }
    return object;
}

@end

@implementation NSData (HermesValue)


struct FixedBuffer : facebook::jsi::MutableBuffer {
    size_t size() const override { return arr.size(); }
    uint8_t *data() override { return arr.data(); }
    std::vector<uint8_t> arr;
};

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime {
    size_t length = [self length];
    std::shared_ptr<FixedBuffer> fixed_buffer = std::make_shared<FixedBuffer>();
    fixed_buffer->arr.resize(length);
    void* p = &(fixed_buffer->arr[0]);
    [self getBytes:p length:length];
    auto array_buffer = facebook::jsi::ArrayBuffer(runtime, fixed_buffer);
    return facebook::jsi::Value(runtime, array_buffer);
}

@end

@implementation NSString (HermesValue)

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime {
    return [self toHermesStringInRuntime:runtime];
}

- (facebook::jsi::Value)toHermesStringInRuntime:(facebook::jsi::Runtime&)runtime {
    const char *p = [self UTF8String]?:"";
    auto string = facebook::jsi::String::createFromUtf8(runtime, p);
    return facebook::jsi::Value(runtime, string);
}

@end

@implementation NSNumber (HermesValue)

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime {
    return facebook::jsi::Value([self doubleValue]);
}

@end

@implementation NSNull (HermesValue)

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime {
    return facebook::jsi::Value::undefined();
}

@end


id ObjectFromHermesValue(facebook::jsi::Runtime& runtime, facebook::jsi::Value& value) {
    if (value.isUndefined()) {
        return [NSNull null];
    } else if (value.isNull()) {
        return nil;
    } else if (value.isString()) {
        auto string = value.asString(runtime).utf8(runtime);
        void *buffer = malloc(string.size());
        size_t len = string.size();
        memcpy(buffer, string.data(), string.size());
        NSString *result = [[NSString alloc] initWithBytesNoCopy:buffer length:len encoding:NSUTF8StringEncoding freeWhenDone:YES];
        return result;
    } else if (value.isBool()) {
        return @(value.asBool());
    } else if (value.isNumber()) {
        return @(value.asNumber());
    } else if (value.isObject()) {
        auto object = value.asObject(runtime);
        if (object.isArray(runtime)) {
            auto array = object.asArray(runtime);
            size_t size = array.size(runtime);
            NSMutableArray *ns_array = [NSMutableArray arrayWithCapacity:size];
            for (size_t i = 0; i < size; i++) {
                auto element = array.getValueAtIndex(runtime, i);
                id add_element = ObjectFromHermesValue(runtime, element);
                if (add_element) {
                    [ns_array addObject:add_element];
                }
            }
            return [ns_array copy];
        } else if (object.isArrayBuffer(runtime)) {
            auto array_buffer = object.getArrayBuffer(runtime);
            size_t size = array_buffer.size(runtime);
            uint8_t* data = array_buffer.data(runtime);
            return [NSData dataWithBytes:data length:size];
        } else {
            facebook::jsi::Array names = object.getPropertyNames(runtime);
            if (names.size(runtime) == 0) {
                return [NSDictionary dictionary];
            }
            NSMutableDictionary *kvs = [NSMutableDictionary dictionaryWithCapacity:names.size(runtime)];
            for (size_t i = 0; i < names.size(runtime); i++) {
                auto name = names.getValueAtIndex(runtime, i);
                HippyAssert(name.isString(), @"ObjectFromHermesValue only supports keys as string");
                if (!name.isString()) {
                    continue;
                }
                NSString *add_key = ObjectFromHermesValue(runtime, name);
                //auto jsi_name = name.asString(runtime);
                auto name_value = object.getProperty(runtime, name.asString(runtime));
                id add_value = ObjectFromHermesValue(runtime, name_value);
                if (add_key && add_value) {
                    [kvs setObject:add_value forKey:add_key];
                }
            }
            return [kvs copy];
        }
    }
    return nil;
}

// NSString *TryToFetchStringFromV8Value(v8::Local<v8::Value> value, v8::Isolate *isolate) {
//     if (value.IsEmpty()) {
//         return nil;
//     }
//     v8::String::Utf8Value u8String(isolate, value);
//     return [NSString stringWithUTF8String:*u8String];
// }
