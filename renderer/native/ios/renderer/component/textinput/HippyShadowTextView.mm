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

#import "HippyUtils.h"
#import "HippyShadowTextView.h"
#import "HippyShadowView+Internal.h"
#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#include "dom/layout_node.h"

/// Default font size of TextView
/// Note that in `HippyFont` it is defined as 14,
/// For the sake of compatibility, keep it the way it is.
static const CGFloat defaultFontSize = 16.0;

@interface HippyShadowTextView ()

/// Cached text attributes
@property (nonatomic, strong) NSDictionary *dicAttributes;

@end

static hippy::LayoutSize x5MeasureFunc(
                            HippyShadowTextView *weakShadowText,
                            float width, hippy::LayoutMeasureMode widthMeasureMode, float height,
                            hippy::LayoutMeasureMode heightMeasureMode, void *layoutContext) {
    hippy::LayoutSize result;
    if (weakShadowText) {
        HippyShadowTextView *shadowText = weakShadowText;
        NSString *text = shadowText.text ?: shadowText.placeholder;
        if (nil == shadowText.dicAttributes) {
            if (shadowText.font == nil) {
                
                shadowText.font = [UIFont systemFontOfSize:defaultFontSize];
            }
            NSDictionary *attrs = nil;
            if ((id)shadowText.lineHeight != nil ||
                (id)shadowText.lineSpacing != nil ||
                (id)shadowText.lineHeightMultiple != nil) {
                // Add paragraphStyle
                NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init];
                if ((id)shadowText.lineHeight != nil) {
                    paragraphStyle.minimumLineHeight = [shadowText.lineHeight doubleValue];
                    paragraphStyle.maximumLineHeight = [shadowText.lineHeight doubleValue];
                } else if ((id)shadowText.lineSpacing != nil) {
                    paragraphStyle.lineSpacing = [shadowText.lineSpacing doubleValue];
                } else if ((id)shadowText.lineHeightMultiple != nil) {
                    paragraphStyle.lineHeightMultiple = [shadowText.lineHeightMultiple doubleValue];
                }
                attrs = @{ NSFontAttributeName: shadowText.font,
                           NSParagraphStyleAttributeName : paragraphStyle };
            } else {
                attrs = @{ NSFontAttributeName: shadowText.font };
            }
            shadowText.dicAttributes = attrs;
        }
        CGSize computedSize = [text sizeWithAttributes:shadowText.dicAttributes];
        result.width = ceil(computedSize.width);
        result.height = ceil(computedSize.height);
    }
    return result;
}

@implementation HippyShadowTextView

- (instancetype)init {
    self = [super init];
    if (self) {
    }
    return self;
}

- (void)setDomManager:(std::weak_ptr<hippy::DomManager>)domManager {
    [super setDomManager:domManager];
    auto shared_domNode = domManager.lock();
    if (shared_domNode) {
        int32_t componentTag = [self.hippyTag intValue];
        auto node = shared_domNode->GetNode(self.rootNode, componentTag);
        if (node) {
            __weak HippyShadowTextView *weakSelf = self;
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

- (void)didUpdateHippySubviews {
    [super didUpdateHippySubviews];
    auto domManager = [self domManager].lock();
    if (domManager) {
        int32_t componentTag = [self.hippyTag intValue];
        __weak HippyShadowView *weakSelf = self;
        std::vector<std::function<void()>> ops_ = {[componentTag, weakSelf, domManager](){
            @autoreleasepool {
                HippyShadowView *strongSelf = weakSelf;
                if (strongSelf) {
                    auto domNode = domManager->GetNode(strongSelf.rootNode, componentTag);
                    if (domNode) {
                        domNode->GetLayoutNode()->MarkDirty();
                        domManager->DoLayout(strongSelf.rootNode);
                        domManager->EndBatch(strongSelf.rootNode);
                    }
                }
            }
        }};
    }
}

@end
