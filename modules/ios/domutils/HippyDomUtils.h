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

#import "HippyDefines.h"
#include "dom/dom_listener.h"
#include "dom/dom_node.h"
#include "footstone/hippy_value.h"

NS_ASSUME_NONNULL_BEGIN

/// CGRect from hippy::LayoutResult
/// - Parameter result: CGRect
static inline CGRect CGRectMakeFromLayoutResult(hippy::LayoutResult result) {
    return CGRectMake(result.left, result.top, result.width, result.height);
}

/// UIEdgeInsets from hippy::LayoutResult
/// - Parameter result: UIEdgeInsets
static inline UIEdgeInsets UIEdgeInsetsFromLayoutResult(hippy::LayoutResult result) {
    return UIEdgeInsetsMake(result.paddingTop, result.paddingLeft, result.paddingBottom, result.paddingRight);
}

/// CGSize from hippy::LayoutResult
/// - Parameter result: CGSize
static inline CGSize CGSizeMakeFromLayoutResult(hippy::LayoutResult result) {
    return CGSizeMake(result.width, result.height);
}

/// OC Props from hippy::DomNode
/// - Parameter domNode: hippy::DomNode
HIPPY_EXTERN NSDictionary *HippyStylesFromDomNode(const std::shared_ptr<hippy::DomNode> &domNode);

NS_ASSUME_NONNULL_END
