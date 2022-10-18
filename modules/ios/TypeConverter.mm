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

#import "TypeConverter.h"
#import "NSURLResponse+ToUnorderedMap.h"

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
    return [NSURL URLWithString:uriString];
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
