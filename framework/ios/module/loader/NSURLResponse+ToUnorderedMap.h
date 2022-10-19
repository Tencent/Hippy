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

#import <Foundation/Foundation.h>

#include <unordered_map>

constexpr const char* kURL = "URL";
constexpr const char* kMIMEType = "MIMEType";
constexpr const char* kExpectedContentLength = "expectedContentLength";
constexpr const char* kTextEncodingName = "textEncodingName";
constexpr const char* kSuggestedFilename = "suggestedFilename";
constexpr const char* kStatusCode = "statusCode";

@interface NSURLResponse (ToUnorderedMap)

- (std::unordered_map<std::string, std::string>)toUnorderedMap;

@end

@interface NSHTTPURLResponse (ToUnorderedMap)

- (std::unordered_map<std::string, std::string>)toUnorderedMap;

@end
