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

#import "NSURLResponse+ToUnorderedMap.h"
#import "TypeConverter.h"
#import "HPToolUtils.h"

#include "footstone/string_view_utils.h"

using string_view = footstone::string_view;

string_view NSStringToU8StringView(NSString* str) {
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

NSDictionary<NSString *, NSString *> *StringUnorderedMapToNSDictionary(const std::unordered_map<std::string, std::string> &map) {
    NSMutableDictionary *dictionary = [NSMutableDictionary dictionaryWithCapacity:map.size()];
    for (const auto &it : map) {
        NSString *key = [NSString stringWithUTF8String:it.first.c_str()];
        NSString *value = [NSString stringWithUTF8String:it.second.c_str()];
        [dictionary setObject:value forKey:key];
    }
    return [dictionary copy];
}

std::unordered_map<std::string, std::string> NSDictionaryToStringUnorderedMap(NSDictionary<NSString *, NSString *> *dictionary) {
    std::unordered_map<std::string, std::string> map;
    map.reserve([dictionary count]);
    for (NSString *key in dictionary) {
        NSString *value = dictionary[key];
        std::string mapKey = [key UTF8String];
        std::string mapValue = [value UTF8String];
        map[mapKey] = mapValue;
    }
    return map;
}

NSURLResponse *ResponseMapToURLResponse(NSURL *url, const std::unordered_map<std::string, std::string> &headerMap, size_t contentsLength) {
    NSURLResponse *response = nil;
    if ([[url absoluteString] hasPrefix:@"http"]) {
        NSDictionary<NSString *, NSString *> *headers = StringUnorderedMapToNSDictionary(headerMap);
        auto find = headerMap.find(kStatusCode);
        NSInteger statusCode = 502;
        if (headerMap.end() != find) {
            statusCode = std::stoi(find->second);
        }
        response = [[NSHTTPURLResponse alloc] initWithURL:url statusCode:statusCode HTTPVersion:@"1.1" headerFields:headers];
    }
    else {
        NSString *mimeType = @"";
        auto find = headerMap.find(kMIMEType);
        if (headerMap.end() != find) {
            mimeType = [NSString stringWithUTF8String:find->second.c_str()];
        }
        NSString *textEncodingName = @"";
        find = headerMap.find(kTextEncodingName);
        if (headerMap.end() != find) {
            textEncodingName = [NSString stringWithUTF8String:find->second.c_str()];
        }
        response = [[NSURLResponse alloc] initWithURL:url MIMEType:mimeType expectedContentLength:contentsLength textEncodingName:textEncodingName];
    }
    return response;
}

using HippyValue = footstone::value::HippyValue;
using DomManager = hippy::DomManager;
using DomNode = hippy::DomNode;
using LayoutResult = hippy::LayoutResult;
using DomValueType = footstone::value::HippyValue::Type;
using DomValueNumberType = footstone::value::HippyValue::NumberType;
using RenderInfo = hippy::DomNode::RenderInfo;

id domValueToOCType(const HippyValue *const pDomValue) {
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
            value = unorderedMapDomValueToDictionary(shared_map);
        }
            break;
        case DomValueType::kArray: {
            HippyValue::DomValueArrayType domValueArray = pDomValue->ToArrayChecked();
            NSMutableArray *array = [NSMutableArray arrayWithCapacity:domValueArray.size()];
            for (auto it = domValueArray.begin(); it != domValueArray.end(); it++) {
                const HippyValue &v = *it;
                id subValue = domValueToOCType(&v);
                [array addObject:subValue];
            }
            value = (id)[array copy];
        }
            break;
        case DomValueType::kNumber: {
            value = domValueToNumber(pDomValue);
        }
            break;
        default:
            break;
    }
    return value;
}

HippyValue OCTypeToDomValue(id value) {
    if ([value isKindOfClass:[NSString class]]) {
        return HippyValue([value UTF8String]);
    }
    else if ([value isKindOfClass:[NSNumber class]]) {
        CFNumberRef numberRef = (__bridge CFNumberRef)value;
        CFNumberType numberType = CFNumberGetType(numberRef);
        if (kCFNumberSInt32Type == numberType ||
            kCFNumberSInt64Type == numberType ||
            kCFNumberShortType == numberType ||
            kCFNumberIntType == numberType ||
            kCFNumberLongType == numberType ||
            kCFNumberLongLongType == numberType) {
            return HippyValue([value unsignedIntValue]);
        }
        else if (kCFNumberFloatType == numberType ||
                 kCFNumberDoubleType == numberType) {
            return HippyValue([value doubleValue]);
        }
        else {
            BOOL flag = [value boolValue];
            return HippyValue(flag);;
        }
    }
    else if (value == [NSNull null]) {
        return HippyValue::Null();
    }
    else if ([value isKindOfClass:[NSDictionary class]]) {
        HippyValue::HippyValueObjectType object;
        for (NSString *key in value) {
            std::string objKey = [key UTF8String];
            id objValue = [value objectForKey:key];
            auto dom_obj = OCTypeToDomValue(objValue);
            object[objKey] = std::move(dom_obj);
        }
        return HippyValue(std::move(object));
    }
    else if ([value isKindOfClass:[NSArray class]]) {
        HippyValue::DomValueArrayType array;
        for (id obj in value) {
            auto dom_obj = OCTypeToDomValue(obj);
            array.push_back(std::move(dom_obj));
        }
        return HippyValue(std::move(array));
    }
    else {
        return HippyValue::Undefined();
    }
}

NSDictionary *unorderedMapDomValueToDictionary(const std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<HippyValue>>> &domValuesObject) {
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithCapacity:domValuesObject->size()];
    for (auto it = domValuesObject->begin(); it != domValuesObject->end(); it++) {
        NSString *key = [NSString stringWithUTF8String:it->first.c_str()];
        std::shared_ptr<HippyValue> domValue = it->second;
        id value = domValueToOCType(domValue.get());
        [dic setObject:value forKey:key];
    }
    return [dic copy];
}

std::unordered_map<std::string, std::shared_ptr<HippyValue>> dictionaryToUnorderedMapDomValue(NSDictionary *dictionary) {
    std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>> style;
    for (NSString *key in dictionary) {
        id value = dictionary[key];
        std::string style_key = [key UTF8String];
        footstone::value::HippyValue dom_value = OCTypeToDomValue(value);
        style[style_key] = std::make_shared<footstone::value::HippyValue>(std::move(dom_value));
    }
    return style;
}

CGRect CGRectMakeFromLayoutResult(hippy::LayoutResult result) {
    return CGRectMake(result.left, result.top, result.width, result.height);
}

UIEdgeInsets UIEdgeInsetsFromLayoutResult(hippy::LayoutResult result) {
    return UIEdgeInsetsMake(result.paddingTop, result.paddingLeft, result.paddingBottom, result.paddingRight);
}

CGSize CGSizeMakeFromLayoutResult(hippy::LayoutResult result) {
    return CGSizeMake(result.width, result.height);
}

CGRect CGRectMakeFromDomNode(const std::shared_ptr<hippy::DomNode> &domNode) {
    return CGRectMakeFromLayoutResult(domNode->GetLayoutResult());
}

NSNumber *domValueToNumber(const HippyValue *const pDomValue) {
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

NSDictionary *stylesFromDomNode(const std::shared_ptr<hippy::DomNode> &domNode) {
    auto &styles = domNode->GetStyleMap();
    auto &extStyles = domNode->GetExtStyle();
    auto capacity = 0;

    if (styles) {
      capacity += styles->size();
    }
    if (extStyles) {
      capacity += extStyles->size();
    }
    NSMutableDictionary *allStyles = [NSMutableDictionary dictionaryWithCapacity:capacity];
    if (styles) {
      NSDictionary *dicStyles  = unorderedMapDomValueToDictionary(styles);
      [allStyles addEntriesFromDictionary:dicStyles];
    }
    if (extStyles) {
      NSDictionary *dicExtStyles = unorderedMapDomValueToDictionary(extStyles);
      [allStyles addEntriesFromDictionary:dicExtStyles];
    }
    return [allStyles copy];
}
