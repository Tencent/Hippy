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

#import "HippyShadowView.h"
#import "HippyDefines.h"
#include "dom/dom_node.h"
#include "dom/dom_listener.h"
#include "dom/dom_value.h"

NS_ASSUME_NONNULL_BEGIN

HIPPY_EXTERN id domValueToOCType(const tdf::base::DomValue *const pDomValue);

HIPPY_EXTERN NSDictionary *unorderedMapDomValueToDictionary(const std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>> &domValuesObject);

HIPPY_EXTERN CGRect CGRectMakeFromLayoutResult(hippy::LayoutResult result);

HIPPY_EXTERN UIEdgeInsets UIEdgeInsetsFromLayoutResult(hippy::LayoutResult result);

HIPPY_EXTERN CGRect CGRectMakeFromDomNode(const std::shared_ptr<hippy::DomNode> &domNode);

HIPPY_EXTERN NSNumber *domValueToNumber(const tdf::base::DomValue *const pDomValue);

NS_ASSUME_NONNULL_END
