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
#import <UIKit/UIKit.h>

#import "MacroDefines.h"

#include <string>
#include <unordered_map>

#include "footstone/string_view.h"
#include "footstone/hippy_value.h"
#include "dom/dom_listener.h"
#include "dom/dom_node.h"

NS_ASSUME_NONNULL_BEGIN

extern footstone::string_view NSStringToU8StringView(NSString *str);

footstone::string_view NSStringToU16StringView(NSString *string);

HP_EXTERN NSString *StringViewToNSString(const footstone::string_view &view);

HP_EXTERN NSURL *StringViewToNSURL(const footstone::string_view &uri);

HP_EXTERN NSDictionary<NSString *, NSString *> *StringUnorderedMapToNSDictionary(const std::unordered_map<std::string, std::string> &);

std::unordered_map<std::string, std::string> NSDictionaryToStringUnorderedMap(NSDictionary<NSString *, NSString *> *dictionary);

HP_EXTERN NSURLResponse *ResponseMapToURLResponse(NSURL *url, const std::unordered_map<std::string, std::string> &headerMap, size_t contentsLength);

HP_EXTERN id domValueToOCType(const footstone::value::HippyValue *const pDomValue);

extern footstone::value::HippyValue OCTypeToDomValue(id value);

HP_EXTERN NSDictionary *unorderedMapDomValueToDictionary(const std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>> &domValuesObject);

extern std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>> dictionaryToUnorderedMapDomValue(NSDictionary *dictionary);

HP_EXTERN CGRect CGRectMakeFromLayoutResult(hippy::LayoutResult result);

HP_EXTERN UIEdgeInsets UIEdgeInsetsFromLayoutResult(hippy::LayoutResult result);

HP_EXTERN CGSize CGSizeMakeFromLayoutResult(hippy::LayoutResult result);

HP_EXTERN CGRect CGRectMakeFromDomNode(const std::shared_ptr<hippy::DomNode> &domNode);

HP_EXTERN NSNumber *domValueToNumber(const footstone::value::HippyValue *const pDomValue);

HP_EXTERN NSDictionary *stylesFromDomNode(const std::shared_ptr<hippy::DomNode> &domNode);

NS_ASSUME_NONNULL_END
