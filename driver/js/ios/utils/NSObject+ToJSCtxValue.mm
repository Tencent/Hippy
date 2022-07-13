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

#import "NSObject+ToJSCtxValue.h"
#import "HippyAssert.h"
#import "footstone/unicode_string_view.h"

@implementation NSObject (ToJSCtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context; {
    HippyAssert(NO, @"%@ must implemente convertToCtxValue method", NSStringFromClass([self class]));
    std::unordered_map<CtxValuePtr, CtxValuePtr> valueMap;
    return context->CreateObject(valueMap);
}

@end

@implementation NSString (ToJSCtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    footstone::unicode_string_view string_view([self UTF8String]);
    return context->CreateString(string_view);
}

@end

@implementation NSNumber (ToJSCtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    return context->CreateNumber([self doubleValue]);
}

@end

@implementation NSArray (ToJSCtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
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

@end

@implementation NSDictionary (ToJSCtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    if (0 == [self count]) {
        return nullptr;
    }
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

@implementation NSNull (ToJSCtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    return context->CreateNull();
}

@end

id ObjectFromJSValue(CtxPtr context, CtxValuePtr value) {
    @autoreleasepool {
        if (context->IsString(value)) {
            footstone::unicode_string_view string_view;
            if (context->GetValueString(value, &string_view)) {
                footstone::unicode_string_view::u16string &u16String =string_view.utf16_value();
                NSString *string =
                    [NSString stringWithCharacters:(const unichar *)u16String.c_str() length:u16String.length()];
                return string;
            }
        }
        if (context->IsNumber(value)) {
            double number = 0;
            if (context->GetValueNumber(value, &number)) {
                return @(number);
            }
        }
        if (context->IsArray(value)) {
            uint32_t length = context->GetArrayLength(value);
            NSMutableArray *array = [NSMutableArray arrayWithCapacity:length];
            for (uint32_t index = 0; index < length; index++) {
                auto element = context->CopyArrayElement(value, index);
                id obj = ObjectFromJSValue(context, element);
                [array addObject:obj];
            }
            return [array copy];
        }
        if (context->IsObject(value)) {
            std::map<footstone::unicode_string_view, CtxValuePtr> map;
            if (context->GetEntriesFromObject(value, map)) {
                NSMutableDictionary *dictionary = [NSMutableDictionary dictionaryWithCapacity:map.size()];
                for (auto &it : map) {
                    auto &string_view = it.first;
                    const auto &u16String = string_view.utf16_value();
                    NSString *string =
                        [NSString stringWithCharacters:(const unichar *)u16String.c_str() length:u16String.length()];
                    auto &value = it.second;
                    id obj = ObjectFromJSValue(context, value);
                    [dictionary setObject:obj forKey:string];
                }
                return [dictionary copy];
            }
        }
        return [NSNull null];
    }
}
