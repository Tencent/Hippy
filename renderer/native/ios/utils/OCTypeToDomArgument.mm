/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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

#import "OCTypeToDomArgument.h"

using HippyValue = footstone::value::HippyValue;
using DomArgument = hippy::DomArgument;

@implementation NSObject (DomArgument)

- (HippyValue)toDomValue {
    return HippyValue::Undefined();
}

- (DomArgument)toDomArgument {
    return DomArgument([self toDomValue]);
}

@end

@implementation NSArray (DomArgument)

- (HippyValue)toDomValue {
    HippyValue::DomValueArrayType array;
    for (NSObject *obj in self) {
        array.push_back([obj toDomValue]);
    }
    return HippyValue(array);
}

@end

@implementation NSDictionary (DomArgument)

- (HippyValue)toDomValue {
    __block HippyValue::HippyValueObjectType domObj([self count]);
    [self enumerateKeysAndObjectsUsingBlock:^(NSString *_Nonnull key, id  _Nonnull obj, BOOL * _Nonnull stop) {
        std::string objKey = [key UTF8String];
        HippyValue value = [obj toDomValue];
        domObj[objKey] = value;
    }];
    return HippyValue(domObj);
}

@end

@implementation NSNumber (DomArgument)

- (HippyValue)toDomValue {
    const char *objcType = [self objCType];
    if (0 == strcmp(objcType, @encode(float)) ||
        0 == strcmp(objcType, @encode(double))) {
        return HippyValue([self doubleValue]);
    }
    else {
        return HippyValue([self intValue]);
    }
}

@end

@implementation NSString (DomArgument)

- (HippyValue)toDomValue {
    return HippyValue([self UTF8String]);
}

@end
