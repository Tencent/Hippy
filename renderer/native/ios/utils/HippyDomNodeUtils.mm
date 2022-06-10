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
            value = @(pDomValue->ToBooleanChecked());
            break;
        case DomValueType::kString:
            value = [NSString stringWithUTF8String:pDomValue->ToStringChecked().c_str()];
            break;
        case DomValueType::kObject: {
            DomValue::DomValueObjectType objectType = pDomValue->ToObjectChecked();
            std::unordered_map<std::string, std::shared_ptr<DomValue>> map(objectType.size());
            for (const auto &pair : objectType) {
                map[pair.first] = std::make_shared<DomValue>(pair.second);
            }
            std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> shared_map =
                    std::make_shared<std::unordered_map<std::string, std::shared_ptr<DomValue>>>(std::move(map));
            value = unorderedMapDomValueToDictionary(shared_map);
        }
            break;
        case DomValueType::kArray: {
            DomValue::DomValueArrayType domValueArray = pDomValue->ToArrayChecked();
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

DomValue OCTypeToDomValue(id value) {
    if ([value isKindOfClass:[NSString class]]) {
        return DomValue([value UTF8String]);
    }
    else if ([value isKindOfClass:[NSNumber class]]) {
        CFNumberRef numberRef = (__bridge CFNumberRef)value;
        CFNumberType numberType = CFNumberGetType(numberRef);
        if (kCFNumberSInt32Type == numberType ||
            kCFNumberSInt64Type == numberType ||
            kCFNumberShortType == numberType ||
            kCFNumberIntType == numberType ||
            kCFNumberLongType == numberType ||
            kCFNumberLongLongType == numberType) {
            return DomValue([value unsignedIntValue]);
        }
        else if (kCFNumberFloatType == numberType ||
                 kCFNumberDoubleType == numberType) {
            return DomValue([value doubleValue]);
        }
        else {
            BOOL flag = [value boolValue];
            return DomValue(flag);;
        }
    }
    else if (value == [NSNull null]) {
        return DomValue::Null();
    }
    else if ([value isKindOfClass:[NSDictionary class]]) {
        DomValue::DomValueObjectType object;
        for (NSString *key in value) {
            std::string objKey = [key UTF8String];
            id objValue = [value objectForKey:key];
            auto dom_obj = OCTypeToDomValue(objValue);
            object[objKey] = std::move(dom_obj);
        }
        return DomValue(std::move(object));
    }
    else if ([value isKindOfClass:[NSArray class]]) {
        DomValue::DomValueArrayType array;
        for (id obj in value) {
            auto dom_obj = OCTypeToDomValue(obj);
            array.push_back(std::move(dom_obj));
        }
        return DomValue(std::move(array));
    }
    else {
        return DomValue::Undefined();
    }
}

NSDictionary *unorderedMapDomValueToDictionary(const std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> &domValuesObject) {
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithCapacity:domValuesObject->size()];
    for (auto it = domValuesObject->begin(); it != domValuesObject->end(); it++) {
        NSString *key = [NSString stringWithUTF8String:it->first.c_str()];
        std::shared_ptr<DomValue> domValue = it->second;
        id value = domValueToOCType(domValue.get());
        [dic setObject:value forKey:key];
    }
    return [dic copy];
}

std::unordered_map<std::string, std::shared_ptr<DomValue>> dictionaryToUnorderedMapDomValue(NSDictionary *dictionary) {
    std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>> style;
    for (NSString *key in dictionary) {
        id value = dictionary[key];
        std::string style_key = [key UTF8String];
        tdf::base::DomValue dom_value = OCTypeToDomValue(value);
        style[style_key] = std::make_shared<tdf::base::DomValue>(std::move(dom_value));
    }
    return style;
}

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

NSNumber *domValueToNumber(const DomValue *const pDomValue) {
    NSCAssert(pDomValue->IsNumber(), @"domvalue should be a number");
    NSNumber *number = nil;
    switch (pDomValue->GetNumberType()) {
        case DomValueNumberType::kInt32:
            number = @(pDomValue->ToInt32Checked());
            break;
        case DomValueNumberType::kUInt32:
            number = @(pDomValue->ToUint32Checked());
            break;
        case DomValueNumberType::kDouble:
            number = @(pDomValue->ToDoubleChecked());
            break;
        case DomValueNumberType::kNaN:
            number = [NSDecimalNumber notANumber];
            break;
        default:
            break;
    }
    return number;
}

NSDictionary *stylesFromDomNode(const std::shared_ptr<hippy::DomNode> &domNode) {
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
      NSDictionary *dicStyles  = unorderedMapDomValueToDictionary(styles);
      [allStyles addEntriesFromDictionary:dicStyles];
    }
    if (extStyles) {
      NSDictionary *dicExtStyles = unorderedMapDomValueToDictionary(extStyles);
      [allStyles addEntriesFromDictionary:dicExtStyles];
    }
    return [allStyles copy];
}
