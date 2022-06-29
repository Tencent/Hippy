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

#import "NativeRenderObjectView.h"
#include "dom/dom_node.h"
#include "dom/dom_listener.h"
#include "footstone/hippy_value.h"
#import "NativeRenderDefines.h"

NS_ASSUME_NONNULL_BEGIN

NATIVE_RENDER_EXTERN id domValueToOCType(const footstone::value::HippyValue *const pDomValue);

extern footstone::value::HippyValue OCTypeToDomValue(id value);

NATIVE_RENDER_EXTERN NSDictionary *unorderedMapDomValueToDictionary(const std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>> &domValuesObject);

extern std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>> dictionaryToUnorderedMapDomValue(NSDictionary *dictionary);

NATIVE_RENDER_EXTERN CGRect CGRectMakeFromLayoutResult(hippy::LayoutResult result);

NATIVE_RENDER_EXTERN UIEdgeInsets UIEdgeInsetsFromLayoutResult(hippy::LayoutResult result);

NATIVE_RENDER_EXTERN CGSize CGSizeMakeFromLayoutResult(hippy::LayoutResult result);

NATIVE_RENDER_EXTERN CGRect CGRectMakeFromDomNode(const std::shared_ptr<hippy::DomNode> &domNode);

NATIVE_RENDER_EXTERN NSNumber *domValueToNumber(const footstone::value::HippyValue *const pDomValue);

NATIVE_RENDER_EXTERN NSDictionary *stylesFromDomNode(const std::shared_ptr<hippy::DomNode> &domNode);

NS_ASSUME_NONNULL_END
