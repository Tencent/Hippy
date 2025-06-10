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

#import "HippyOCToHippyValue.h"
#include "footstone/hippy_value.h"


using HippyValue = footstone::HippyValue;

@implementation NSObject (ToHippyValue)

- (HippyValue)toHippyValue {
    return HippyValue::Undefined();
}

@end

@implementation NSDictionary (ToHippyValue)

- (HippyValue)toHippyValue {
    __block HippyValue::HippyValueObjectType domObj;
    domObj.reserve([self count]);
    [self enumerateKeysAndObjectsUsingBlock:^(NSString *_Nonnull key, id  _Nonnull obj, BOOL * _Nonnull stop) {
        const char *cKey = [key UTF8String];
        if (!cKey) {
            // Handle invalid UTF-8
            NSString *fallbackKey = [NSString stringWithFormat:@"INVALID_UTF8_KEY_%p", key];
            cKey = [fallbackKey UTF8String];
        }
        std::string objKey(cKey);
        HippyValue value = [obj toHippyValue];
        domObj.emplace(std::move(objKey), std::move(value));
    }];
    return HippyValue(std::move(domObj));
}

@end

@implementation NSArray (ToHippyValue)

- (HippyValue)toHippyValue {
    HippyValue::HippyValueArrayType array;
    array.reserve([self count]);
    for (NSObject *obj in self) {
        array.push_back([obj toHippyValue]);
    }
    return HippyValue(std::move(array));
}

@end

@implementation NSNumber (ToHippyValue)

- (HippyValue)toHippyValue {
    const char *objcType = [self objCType];
    if (strcmp(objcType, @encode(BOOL)) == 0 ||
        strcmp(objcType, @encode(signed char)) == 0) {
        return HippyValue([self boolValue]);
    } else if (strcmp(objcType, @encode(int)) == 0 ||
               strcmp(objcType, @encode(short)) == 0) {
        return HippyValue([self intValue]);
    } else {
        // use double as default
        return HippyValue([self doubleValue]);
    }
}

@end

@implementation NSString (ToHippyValue)

- (HippyValue)toHippyValue {
    const char *cStr = [self UTF8String];
    if (!cStr) {
        // Handle invalid UTF-8
        NSString *fallback = [NSString stringWithFormat:@"INVALID_UTF8_STRING_%p", self];
        cStr = [fallback UTF8String];
    }
    return HippyValue(cStr);
}

@end
