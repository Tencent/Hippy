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

#import "HippyShadowTextView.h"
#import "Hippy.h"
#import "HippyUtils.h"
#import "dom/layout_node.h"


@interface HippyShadowTextView ()
@property (nonatomic, strong) NSDictionary *dicAttributes;
@end

static hippy::LayoutSize x5MeasureFunc(
                            HippyShadowTextView *shadowText,
                            float width, hippy::LayoutMeasureMode widthMeasureMode, float height,
                            hippy::LayoutMeasureMode heightMeasureMode, void *layoutContext) {
    NSString *text = shadowText.text ?: shadowText.placeholder;
    if (nil == shadowText.dicAttributes) {
        if (shadowText.font == nil) {
            shadowText.font = [UIFont systemFontOfSize:16];
        }
        shadowText.dicAttributes = @ { NSFontAttributeName: shadowText.font };
    }
    CGSize computedSize = [text sizeWithAttributes:shadowText.dicAttributes];
    hippy::LayoutSize result;
    result.width = HippyCeilPixelValue(computedSize.width);
    result.height = HippyCeilPixelValue(computedSize.height);
    return result;
}

@implementation HippyShadowTextView

- (instancetype)init {
    self = [super init];
    if (self) {
    }
    return self;
}

- (void)setDomNode:(std::weak_ptr<hippy::DomNode>)domNode {
    [super setDomNode:domNode];
    std::shared_ptr<hippy::DomNode> node = domNode.lock();
    if (node) {
        hippy::dom::MeasureFunction measureFunc =
            [shadow_view = self](float width, hippy::LayoutMeasureMode widthMeasureMode, float height,
                                 hippy::LayoutMeasureMode heightMeasureMode, void *layoutContext){
            return x5MeasureFunc(shadow_view, width, widthMeasureMode,
                                   height, heightMeasureMode, layoutContext);
        };
        node->GetLayoutNode()->SetMeasureFunction(measureFunc);
    }
}

- (NSDictionary *)mergeProps:(NSDictionary *)props {
    NSDictionary *newProps = [super mergeProps:props];
    BOOL oldPropsContainsText = [[props allKeys] containsObject:@"text"];
    BOOL newPropsContainsText = [[newProps allKeys] containsObject:@"text"];
    if (!newPropsContainsText && oldPropsContainsText) {
        NSDictionary *textDic = [props dictionaryWithValuesForKeys:@[@"text"]];
        NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithDictionary:newProps];
        [dic addEntriesFromDictionary:textDic];
        newProps = dic;
    }
    return newProps;
}

@end
