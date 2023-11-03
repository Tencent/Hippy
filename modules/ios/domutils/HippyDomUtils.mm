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

#import "HippyDomUtils.h"
#import "HippyFootstoneUtils.h"

#include "dom/dom_listener.h"
#include "dom/dom_node.h"
#include "footstone/hippy_value.h"

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

NSDictionary *StylesFromDomNode(const std::shared_ptr<hippy::DomNode> &domNode) {
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
      NSDictionary *dicStyles  = UnorderedMapDomValueToDictionary(styles);
      [allStyles addEntriesFromDictionary:dicStyles];
    }
    if (extStyles) {
      NSDictionary *dicExtStyles = UnorderedMapDomValueToDictionary(extStyles);
      [allStyles addEntriesFromDictionary:dicExtStyles];
    }
    return [allStyles copy];
}
