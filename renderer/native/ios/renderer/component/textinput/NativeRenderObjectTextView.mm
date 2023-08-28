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

#import "HPToolUtils.h"
#import "NativeRenderObjectTextView.h"

#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#include "dom/layout_node.h"

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

- (void)setDomManager:(std::weak_ptr<hippy::DomManager>)domManager {
    [super setDomManager:domManager];
    auto shared_domNode = domManager.lock();
    if (shared_domNode) {
        int32_t componentTag = [self.componentTag intValue];
        auto node = shared_domNode->GetNode(self.rootNode, componentTag);
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

- (void)didUpdateNativeRenderSubviews {
    [super didUpdateNativeRenderSubviews];
    auto domManager = [self domManager].lock();
    if (domManager) {
        int32_t componentTag = [self.componentTag intValue];
        __weak NativeRenderObjectView *weakSelf = self;
        std::vector<std::function<void()>> ops_ = {[componentTag, weakSelf, domManager](){
            @autoreleasepool {
                NativeRenderObjectView *strongSelf = weakSelf;
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
