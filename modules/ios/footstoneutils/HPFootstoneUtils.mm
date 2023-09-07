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

#import "HPFootstoneUtils.h"
#import "HPToolUtils.h"

#include "footstone/hippy_value.h"
#include "footstone/logging.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"

#pragma mark string_view utils
using string_view = footstone::string_view;

string_view NSStringToU8StringView(NSString* str) {
    if (!str) {
        return "";
    }
    std::string u8([str UTF8String]);
    return string_view(reinterpret_cast<const string_view::char8_t_*>(u8.c_str()), u8.length());
}

string_view NSStringToU16StringView(NSString *string) {
    string_view sv(reinterpret_cast<const char16_t*>([string cStringUsingEncoding:NSUTF16StringEncoding]), [string length]);
    return sv;
}

NSString *StringViewToNSString(const string_view &view) {
    string_view::Encoding encode = view.encoding();
    NSString *result = nil;
    switch (encode) {
        case string_view::Encoding::Latin1:
            result = [NSString stringWithUTF8String:view.latin1_value().c_str()];
            break;
        case string_view::Encoding::Utf8:
        {
            result = [[NSString alloc] initWithBytes:view.utf8_value().c_str()
                                              length:view.utf8_value().length()
                                            encoding:NSUTF8StringEncoding];
            break;
        }
        case string_view::Encoding::Utf16:
        {
            const string_view::u16string &u16String = view.utf16_value();
            result = [NSString stringWithCharacters:(const unichar *)u16String.c_str() length:u16String.length()];
        }
            break;
        case string_view::Encoding::Utf32:
        {
            string_view convertedString = footstone::stringview::StringViewUtils::ConvertEncoding(view, string_view::Encoding::Utf16);
            const string_view::u16string &u16String = convertedString.utf16_value();
            result = [NSString stringWithCharacters:(const unichar *)u16String.c_str() length:u16String.length()];
        }
            break;
        default:
            FOOTSTONE_UNREACHABLE();
            break;
    }
    return result;
}

NSURL *StringViewToNSURL(const footstone::string_view &uri) {
    NSString *uriString = StringViewToNSString(uri);
    NSCAssert(uriString, @"uriString must not be null");
    if (!uriString) {
        return nil;
    }
    return HPURLWithString(uriString, nil);
}

#pragma mark HippyValue utils

using HippyValue = footstone::HippyValue;
using DomValueType = footstone::HippyValue::Type;
using DomValueNumberType = footstone::value::HippyValue::NumberType;

id DomValueToOCType(const HippyValue *const pDomValue) {
    DomValueType type = pDomValue->GetType();
    id value = [NSNull null];
    switch (type) {
        case DomValueType::kBoolean:
            value = @(pDomValue->ToBooleanChecked());
            break;
        case DomValueType::kString:
            value = [NSString stringWithUTF8String:pDomValue->ToStringChecked().c_str()];
            break;
        case DomValueType::kObject: {
            HippyValue::HippyValueObjectType objectType = pDomValue->ToObjectChecked();
            std::unordered_map<std::string, std::shared_ptr<HippyValue>> map(objectType.size());
            for (const auto &pair : objectType) {
                map[pair.first] = std::make_shared<HippyValue>(pair.second);
            }
            std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<HippyValue>>> shared_map =
                    std::make_shared<std::unordered_map<std::string, std::shared_ptr<HippyValue>>>(std::move(map));
            value = UnorderedMapDomValueToDictionary(shared_map);
        }
            break;
        case DomValueType::kArray: {
            HippyValue::HippyValueArrayType hippyValueArray = pDomValue->ToArrayChecked();
            NSMutableArray *array = [NSMutableArray arrayWithCapacity:hippyValueArray.size()];
            for (auto it = hippyValueArray.begin(); it != hippyValueArray.end(); it++) {
                const HippyValue &v = *it;
                id subValue = DomValueToOCType(&v);
                [array addObject:subValue];
            }
            value = (id)[array copy];
        }
            break;
        case DomValueType::kNumber: {
            value = DomValueToNumber(pDomValue);
        }
            break;
        default:
            break;
    }
    return value;
}

NSDictionary *UnorderedMapDomValueToDictionary(const std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<HippyValue>>> &domValuesObject) {
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithCapacity:domValuesObject->size()];
    for (auto it = domValuesObject->begin(); it != domValuesObject->end(); it++) {
        NSString *key = [NSString stringWithUTF8String:it->first.c_str()];
        std::shared_ptr<HippyValue> domValue = it->second;
        id value = DomValueToOCType(domValue.get());
        [dic setObject:value forKey:key];
    }
    return [dic copy];
}

NSNumber *DomValueToNumber(const HippyValue *const pDomValue) {
    NSCAssert(pDomValue->IsNumber(), @"domvalue should be a number");
    NSNumber *number = nil;
    switch (pDomValue->GetNumberType()) {
        case DomValueNumberType::kInt32:
            number = @(pDomValue->ToInt32Checked());
            break;
        case DomValueNumberType::kUInt32:
            number = @(pDomValue->ToUint32Checked());
            break;
        case DomValueNumberType::kDouble:
            number = @(pDomValue->ToDoubleChecked());
            break;
        case DomValueNumberType::kNaN:
            number = [NSDecimalNumber notANumber];
            break;
        default:
            break;
    }
    return number;
}
