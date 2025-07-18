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
#import "HippyAssert.h"
#import "HippyLog.h"
#include "driver/napi/js_ctx.h"
#include "driver/napi/js_ctx_value.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"

@implementation NSObject (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    HippyLogWarn(@"%@ No convertToCtxValue method", NSStringFromClass([self class]));
    std::unordered_map<CtxValuePtr, CtxValuePtr> valueMap;
    return context->CreateObject(valueMap);
}

@end

@implementation NSString (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    NSData *utf8Data = [self dataUsingEncoding:NSUTF8StringEncoding];
    const char *utf8Str = (const char *)[utf8Data bytes];
    size_t utf8Len = [utf8Data length];
    auto string_view = footstone::string_view::new_from_utf8(utf8Str, utf8Len);
    return context->CreateString(string_view);
}

@end

@implementation NSNumber (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    if ([self isKindOfClass:[@YES class]]) {
        return context->CreateBoolean(self.boolValue);
    } else {
        return context->CreateNumber(self.doubleValue);
    }
}

@end

@implementation NSArray (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    NSUInteger count = [self count];
    if (0 == count) {
        return context->CreateArray(0, nullptr);
    }
    std::vector<CtxValuePtr> values;
    values.reserve(count);
    for (id obj in self) {
        auto item = [obj convertToCtxValue:context];
        values.push_back(std::move(item));
    }
    return context->CreateArray(count, values.data());
}

@end

@implementation NSDictionary (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    std::unordered_map<CtxValuePtr, CtxValuePtr> valueMap;
    for (id key in self) {
        id value = [self objectForKey:key];
        auto keyPtr = [key convertToCtxValue:context];
        auto valuePtr = [value convertToCtxValue:context];
        if (keyPtr && valuePtr) {
            valueMap[keyPtr] = valuePtr;
        }
    }
    return context->CreateObject(valueMap);
}

@end

@implementation NSData (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    size_t bufferLength = [self length];
    if (bufferLength == 0) {
        return context->CreateNull();
    }
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

@implementation NSError (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    NSString *errorMessage = [self description];
    return [errorMessage convertToCtxValue:context];
}

@end

@implementation NSURL (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context {
    NSString *errorMessage = [self absoluteString];
    return [errorMessage convertToCtxValue:context];
}

@end

__nullable id ObjectFromCtxValue(CtxPtr context, CtxValuePtr value) {
    if (!context || !value) {
        return nil;
    }
    if (context->IsString(value)) {
        footstone::string_view view;
        if (context->GetValueString(value, &view)) {
            view = footstone::StringViewUtils::CovertToUtf16(view, view.encoding());
            footstone::string_view::u16string &u16String = view.utf16_value();
            NSString *string = [NSString stringWithCharacters:(const unichar *)u16String.c_str() length:u16String.length()];
            return string;
        }
    } else if (context->IsBoolean(value)) {
        bool result = false;
        if (context->GetValueBoolean(value, &result)) {
            return @(result);
        }
    } else if (context->IsNumber(value)) {
        double number = 0;
        if (context->GetValueNumber(value, &number)) {
            return @(number);
        }
    } else if (context->IsArray(value)) {
        uint32_t length = context->GetArrayLength(value);
        NSMutableArray *array = [NSMutableArray arrayWithCapacity:length];
        for (uint32_t index = 0; index < length; index++) {
            auto element = context->CopyArrayElement(value, index);
            id obj = ObjectFromCtxValue(context, element);
            if (obj) {
                [array addObject:obj];
            }
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
    } else if (context->IsObject(value)) {
        std::unordered_map<CtxValuePtr, CtxValuePtr> map;
        if (context->GetEntriesFromObject(value, map)) {
            NSMutableDictionary *dictionary = [NSMutableDictionary dictionaryWithCapacity:map.size()];
            for (auto &it : map) {
                footstone::string_view string_view;
                auto flag = context->GetValueString(it.first, &string_view);
                if (!flag) {
                    continue;
                }
                // Note that reference value (const auto &) cannot be used directly here,
                // since the temporary string_view object will destruct the uft16 value.
                // a wrong example is:
                // const auto &u16Str = footstone::StringViewUtils::CovertToUtf16(string_view, string_view.encoding()).utf16_value();
                string_view = footstone::StringViewUtils::CovertToUtf16(string_view, string_view.encoding());
                footstone::string_view::u16string &u16Str = string_view.utf16_value();
                NSString *string = [NSString stringWithCharacters:(const unichar *)u16Str.c_str() length:u16Str.length()];
                auto &value = it.second;
                id obj = ObjectFromCtxValue(context, value);
                if (string && obj) {
                    [dictionary setObject:obj forKey:string];
                }
            }
            return [dictionary copy];
        }
    } else if (context->IsNull(value)) {
        return [NSNull null];
    } else if (context->IsUndefined(value)) {
        return nil;
    }
    return nil;
}
