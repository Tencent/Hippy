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

#import "NSObject+CtxValue.h"
#import "HPAsserts.h"

#include "driver/napi/js_native_api_types.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"

@implementation NSObject (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context; {
    @autoreleasepool {
        HPAssert(NO, @"%@ must implemente convertToCtxValue method", NSStringFromClass([self class]));
        std::unordered_map<CtxValuePtr, CtxValuePtr> valueMap;
        return context->CreateObject(valueMap);
    }
}

@end

@implementation NSString (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    @autoreleasepool {
        footstone::string_view string_view([self UTF8String]);
        return context->CreateString(string_view);
    }
}

@end

@implementation NSNumber (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    return context->CreateNumber([self doubleValue]);
}

@end

@implementation NSArray (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    @autoreleasepool {
        if (0 == [self count]) {
            return context->CreateArray(0, nullptr);
        }
        CtxValuePtr value[[self count]];
        size_t index = 0;
        for (id obj in self) {
            auto item = [obj convertToCtxValue:context];
            value[index++] = std::move(item);
        }
        return context->CreateArray([self count], value);
    }
}

@end

@implementation NSDictionary (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    std::unordered_map<CtxValuePtr, CtxValuePtr> valueMap;
    for (id key in self) {
        id value = [self objectForKey:key];
        auto keyPtr = [key convertToCtxValue:context];
        auto valuePtr = [value convertToCtxValue:context];
        valueMap[keyPtr] = valuePtr;
    }
    return context->CreateObject(valueMap);
}

@end

@implementation NSData (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    size_t bufferLength = [self length];
    void *buffer = malloc(bufferLength);
    if (buffer) {
        [self getBytes:buffer length:bufferLength];
        return context->CreateByteBuffer(buffer, bufferLength);
    }
    return context->CreateUndefined();
}

@end

@implementation NSNull (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    return context->CreateNull();
}

@end

id ObjectFromCtxValue(CtxPtr context, CtxValuePtr value) {
    @autoreleasepool {
        if (!context || !value) {
            return [NSNull null];
        }
        if (context->IsString(value)) {
            footstone::string_view view;
            if (context->GetValueString(value, &view)) {
                view = footstone::StringViewUtils::ConvertEncoding(view, footstone::string_view::Encoding::Utf16);
                footstone::string_view::u16string &u16String = view.utf16_value();
                NSString *string =
                    [NSString stringWithCharacters:(const unichar *)u16String.c_str() length:u16String.length()];
                return string;
            }
        }
        else if (context->IsNumber(value)) {
            double number = 0;
            if (context->GetValueNumber(value, &number)) {
                return @(number);
            }
        }
        else if (context->IsArray(value)) {
            uint32_t length = context->GetArrayLength(value);
            NSMutableArray *array = [NSMutableArray arrayWithCapacity:length];
            for (uint32_t index = 0; index < length; index++) {
                auto element = context->CopyArrayElement(value, index);
                id obj = ObjectFromCtxValue(context, element);
                [array addObject:obj];
            }
            return [array copy];
        }
        //ArrayBuffer is kindof Object, so we must check if it is byte buffer first
        else if(context->IsByteBuffer(value)) {
            size_t length = 0;
            uint32_t type;
            void *bytes = NULL;
            if (context->GetByteBuffer(value, &bytes, length, type)) {
                return [NSData dataWithBytes:bytes length:length];
            }
        }
        else if (context->IsObject(value)) {
            std::unordered_map<footstone::string_view, CtxValuePtr> map;
            if (context->GetEntriesFromObject(value, map)) {
                NSMutableDictionary *dictionary = [NSMutableDictionary dictionaryWithCapacity:map.size()];
                for (auto &it : map) {
                    auto &string_view = it.first;
                    const auto &u16String = string_view.utf16_value();
                    NSString *string =
                        [NSString stringWithCharacters:(const unichar *)u16String.c_str() length:u16String.length()];
                    auto &value = it.second;
                    id obj = ObjectFromCtxValue(context, value);
                    [dictionary setObject:obj forKey:string];
                }
                return [dictionary copy];
            }
        }
        else {

        }
        return [NSNull null];
    }
}
