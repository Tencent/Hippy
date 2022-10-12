/*
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#import "NSURLResponse+ToUnorderedMap.h"

#include <string>

@implementation NSURLResponse (ToUnorderedMap)

- (std::unordered_map<std::string, std::string>)toUnorderedMap {
    std::unordered_map<std::string, std::string> map;
    map.reserve(5);
    map[kURL] = [[[self URL] absoluteString] UTF8String];
    map[kMIMEType] = [[self MIMEType] UTF8String];
    map[kExpectedContentLength] = std::to_string([self expectedContentLength]);
    map[kTextEncodingName] = [[self textEncodingName] UTF8String];
    map[kSuggestedFilename] = [[self suggestedFilename] UTF8String];
    return map;
}

@end

@implementation NSHTTPURLResponse (ToUnorderedMap)

- (std::unordered_map<std::string, std::string>)toUnorderedMap {
    std::unordered_map<std::string, std::string> superMap = [super toUnorderedMap];
    std::unordered_map<std::string, std::string> selfMap;
    NSDictionary *headerFields = [self allHeaderFields];
    selfMap.reserve([headerFields count] + 6);
    for (NSString *key in headerFields) {
        NSString *value = [headerFields objectForKey:key];
        selfMap[[key UTF8String]] = [value UTF8String];
    }
    selfMap[kStatusCode] = std::to_string([self statusCode]);
    selfMap.insert(superMap.begin(), superMap.end());
    return selfMap;
}

@end
