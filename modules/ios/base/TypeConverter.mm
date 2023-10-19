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
#import "HippyUtils.h"

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
