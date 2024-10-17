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
#import "HippyFont.h"
#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#include "dom/layout_node.h"

/// Default font size of TextView
/// Note that in `HippyFont` it is defined as 14,
/// For the sake of compatibility, keep it the way it is.
static const CGFloat defaultFontSize = 16.0;

@interface HippyShadowTextView ()

/// Cached font
@property (nonatomic, strong) UIFont *font;
/// Whether font needs to be updated.
@property (nonatomic, assign) BOOL isFontDirty;
/// Cached text attributes
@property (nonatomic, strong) NSDictionary *dicAttributes;

/// rebuild and update the font property
- (void)rebuildAndUpdateFont;

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
            if (shadowText.isFontDirty) {
                [shadowText rebuildAndUpdateFont];
                shadowText.isFontDirty = NO;
            }
            // Keep this historical code, default fontSize 16.
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

- (void)dirtyText:(BOOL)needToDoLayout {
    [super dirtyText:needToDoLayout];
    self.isFontDirty = YES;
    self.dicAttributes = nil;
    
    // mark layout node dirty
    auto domManager = self.domManager.lock();
    auto weakDomManager = self.domManager;
    if (domManager) {
        __weak HippyShadowView *weakSelf = self;
        auto domNodeAction = [needToDoLayout, weakSelf, weakDomManager](){
            @autoreleasepool {
                HippyShadowView *strongSelf = weakSelf;
                if (!strongSelf) {
                    return;
                }
                auto strongDomManager = weakDomManager.lock();
                if (!strongDomManager) {
                    return;
                }
                int32_t componentTag = [[strongSelf hippyTag] intValue];
                auto domNode = strongDomManager->GetNode(strongSelf.rootNode, componentTag);
                if (domNode) {
                    domNode->GetLayoutNode()->MarkDirty();
                    if (needToDoLayout) {
                        strongDomManager->DoLayout(strongSelf.rootNode);
                        strongDomManager->EndBatch(strongSelf.rootNode);
                    }
                }
            }
        };
        BOOL isJSTaskRunner = (domManager->GetTaskRunner() && footstone::TaskRunner::GetCurrentTaskRunner());
        if (isJSTaskRunner) {
            domNodeAction();
        } else {
            std::vector<std::function<void()>> ops = {domNodeAction};
            domManager->PostTask(hippy::dom::Scene(std::move(ops)));
        }
    }
}

- (void)amendLayoutBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)blocks {
    if (NativeRenderUpdateLifecycleComputed != _propagationLifecycle) {
        //Set needs layout for font change event, etc.
        NSNumber *currentTag = self.hippyTag;
        [blocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry, UIView * _Nullable lazyCreatedView) {
            UIView *view = lazyCreatedView ?: viewRegistry[currentTag];
            [view setNeedsLayout];
        }];
    }
    [super amendLayoutBeforeMount:blocks];
}


#pragma mark - Font Related

- (void)setFontSize:(NSNumber *)fontSize {
    _fontSize = fontSize;
    self.isFontDirty = YES;
}

- (void)setFontStyle:(NSString *)fontStyle {
    _fontStyle = fontStyle;
    self.isFontDirty = YES;
}

- (void)setFontWeight:(NSString *)fontWeight {
    _fontWeight = fontWeight;
    self.isFontDirty = YES;
}

- (void)setFontFamily:(NSString *)fontFamily {
    _fontFamily = fontFamily;
    self.isFontDirty = YES;
}

- (void)setFontUrl:(NSString *)fontUrl {
    _fontUrl = fontUrl;
    self.isFontDirty = YES;
}

- (void)rebuildAndUpdateFont {
    // Convert fontName to fontFamily if needed
    CGFloat scaleMultiplier = 1.0; // scale not supported
    NSString *familyName = [HippyFont familyNameWithCSSNameMatching:self.fontFamily];
    if (!familyName) {
        familyName = self.fontFamily;
    }
    UIFont *font = [HippyFont updateFont:self.font
                              withFamily:familyName
                                     url:self.fontUrl
                                    size:self.fontSize
                                  weight:self.fontWeight
                                   style:self.fontStyle
                                 variant:nil
                         scaleMultiplier:scaleMultiplier];
    if (self.font != font) {
        self.font = font;
    }
}

@end
