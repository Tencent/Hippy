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

#import <Foundation/Foundation.h>

#import "HippyDefines.h"

#include <unordered_map>
#include "string_view.h"
    
NS_ASSUME_NONNULL_BEGIN

extern footstone::string_view NSStringToU8StringView(NSString* str);

extern footstone::string_view NSStringToU16StringView(NSString *string);

HIPPY_EXTERN NSString *StringViewToNSString(const footstone::string_view &view);

HIPPY_EXTERN NSURL *StringViewToNSURL(const footstone::string_view &uri);

HIPPY_EXTERN NSDictionary<NSString *, NSString *> *StringUnorderedMapToNSDictionary(const std::unordered_map<std::string, std::string> &);

NS_ASSUME_NONNULL_END
