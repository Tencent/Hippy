/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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

#import "NativeRenderObjectTextView.h"
#import "NativeRenderUtils.h"
#import "dom/layout_node.h"

@interface NativeRenderObjectTextView ()

@property (nonatomic, strong) NSDictionary *dicAttributes;

@end

static hippy::LayoutSize x5MeasureFunc(
                            NativeRenderObjectTextView *weakShadowText,
                            float width, hippy::LayoutMeasureMode widthMeasureMode, float height,
                            hippy::LayoutMeasureMode heightMeasureMode, void *layoutContext) {
    hippy::LayoutSize result;
    if (weakShadowText) {
        NativeRenderObjectTextView *strongShadowText = weakShadowText;
        NSString *text = strongShadowText.text ?: strongShadowText.placeholder;
        if (nil == strongShadowText.dicAttributes) {
            if (strongShadowText.font == nil) {
                strongShadowText.font = [UIFont systemFontOfSize:16];
            }
            strongShadowText.dicAttributes = @ { NSFontAttributeName: strongShadowText.font };
        }
        CGSize computedSize = [text sizeWithAttributes:strongShadowText.dicAttributes];
        result.width = ceil(computedSize.width);
        result.height = ceil(computedSize.height);
    }
    return result;
}

@implementation NativeRenderObjectTextView

- (instancetype)init {
    self = [super init];
    if (self) {
    }
    return self;
}

- (void)setDomManager:(const std::weak_ptr<hippy::DomManager>)domManager {
    [super setDomManager:domManager];
    auto shared_domNode = domManager.lock();
    if (shared_domNode) {
        int32_t hippyTag = [self.hippyTag intValue];
        auto node = shared_domNode->GetNode(self.rootNode, hippyTag);
        if (node) {
            __weak NativeRenderObjectTextView *weakSelf = self;
            hippy::MeasureFunction measureFunc =
                [weakSelf](float width, hippy::LayoutMeasureMode widthMeasureMode,
                                     float height, hippy::LayoutMeasureMode heightMeasureMode, void *layoutContext){
                    @autoreleasepool {
                        return x5MeasureFunc(weakSelf, width, widthMeasureMode,
                                               height, heightMeasureMode, layoutContext);
                    }
            };
            node->GetLayoutNode()->SetMeasureFunction(measureFunc);
        }
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
