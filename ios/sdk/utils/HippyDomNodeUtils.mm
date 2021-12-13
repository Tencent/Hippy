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

#import "HippyDomNodeUtils.h"

using DomValue = tdf::base::DomValue;
using DomManager = hippy::DomManager;
using DomNode = hippy::DomNode;
using LayoutResult = hippy::LayoutResult;
using DomValueType = tdf::base::DomValue::Type;
using DomValueNumberType = tdf::base::DomValue::NumberType;
using RenderInfo = hippy::DomNode::RenderInfo;

id domValueToOCType(const DomValue *const pDomValue) {
    DomValueType type = pDomValue->GetType();
    id value = [NSNull null];
    switch (type) {
        case DomValueType::kBoolean:
            value = @(pDomValue->ToBoolean());
            break;
        case DomValueType::kString:
            value = [NSString stringWithUTF8String:pDomValue->ToString().c_str()];
            break;
        case DomValueType::kObject: {
            DomValue::DomValueObjectType objectType = pDomValue->ToObject();
            std::unordered_map<std::string, std::shared_ptr<DomValue>> map(objectType.size());
            for (const auto &pair : objectType) {
                map[pair.first] = std::make_shared<DomValue>(pair.second);
            }
            value = unorderedMapDomValueToDictionary(map);
        }
            break;
        case DomValueType::kArray: {
            DomValue::DomValueArrayType domValueArray = pDomValue->ToArray();
            NSMutableArray *array = [NSMutableArray arrayWithCapacity:domValueArray.size()];
            for (auto it = domValueArray.begin(); it != domValueArray.end(); it++) {
                const DomValue &v = *it;
                id subValue = domValueToOCType(&v);
                [array addObject:subValue];
            }
            value = (id)[array copy];
        }
            break;
        case DomValueType::kNumber: {
            value = domValueToNumber(pDomValue);
        }
            break;
        default:
            break;
    }
    return value;
}

NSDictionary *unorderedMapDomValueToDictionary(const std::unordered_map<std::string, std::shared_ptr<DomValue>> &domValuesObject) {
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithCapacity:domValuesObject.size()];
    for (auto it = domValuesObject.begin(); it != domValuesObject.end(); it++) {
        NSString *key = [NSString stringWithUTF8String:it->first.c_str()];
        std::shared_ptr<DomValue> domValue = it->second;
        id value = domValueToOCType(domValue.get());
        [dic setObject:value forKey:key];
    }
    return [dic copy];
}


CGRect CGRectMakeFromLayoutResult(hippy::LayoutResult result) {
    return CGRectMake(result.left, result.top, result.width, result.height);
}

UIEdgeInsets UIEdgeInsetsFromLayoutResult(hippy::LayoutResult result) {
    return UIEdgeInsetsMake(result.paddingTop, result.paddingLeft, result.paddingBottom, result.paddingRight);
}

CGRect CGRectMakeFromDomNode(const std::shared_ptr<hippy::DomNode> &domNode) {
    return CGRectMakeFromLayoutResult(domNode->GetLayoutResult());
}

NSNumber *domValueToNumber(const DomValue *const pDomValue) {
    HippyAssert(pDomValue->IsNumber(), @"domvalue should be a number");
    NSNumber *number = nil;
    switch (pDomValue->GetNumberType()) {
        case DomValueNumberType::kInt32:
            number = @(pDomValue->ToInt32());
            break;
        case DomValueNumberType::kUInt32:
            number = @(pDomValue->ToUint32());
            break;
        case DomValueNumberType::kDouble:
            number = @(pDomValue->ToDouble());
            break;
        case DomValueNumberType::kNaN:
            number = [NSDecimalNumber notANumber];
            break;
        default:
            break;
    }
    return number;
}
