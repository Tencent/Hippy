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
#import "MTTLayout.h"
#import "x5LayoutUtil.h"
#import "HippyShadowView+MTTLayout.h"
#import "HippyFont.h"


@interface HippyShadowTextView ()

/// Cached font
@property (nonatomic, strong) UIFont *font;
/// Whether font needs to be updated.
@property (nonatomic, assign) BOOL isFontDirty;
/// Cached attributes
@property (nonatomic, strong) NSDictionary *dicAttributes;

/// rebuild and update the font property
- (void)rebuildAndUpdateFont;

@end

static MTTSize x5MeasureFunc(
    MTTNodeRef node, float width, MeasureMode widthMeasureMode, __unused float height, __unused MeasureMode heightMeasureMode, void *layoutContext) {
    HippyShadowTextView *shadowText = (__bridge HippyShadowTextView *)MTTNodeGetContext(node);
    NSString *text = shadowText.text ?: shadowText.placeholder;
    if (nil == shadowText.dicAttributes) {
        if (shadowText.isFontDirty) {
            [shadowText rebuildAndUpdateFont];
            shadowText.isFontDirty = NO;
        }
        // Keep this historical code, default fontSize 16.
        if (shadowText.font == nil) {
            shadowText.font = [UIFont systemFontOfSize:16];
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
    MTTSize result;
    result.width = x5CeilPixelValue(computedSize.width);
    result.height = x5CeilPixelValue(computedSize.height);
    return result;
}

@implementation HippyShadowTextView

- (instancetype)init {
    self = [super init];
    if (self) {
        MTTNodeSetMeasureFunc(self.nodeRef, x5MeasureFunc);
        MTTNodeSetContext(self.nodeRef, (__bridge void *)self);
    }
    return self;
}

/*
 * text类型控件会响应用户输入交互，但是并不会更新shadowText中的props属性，
 * 导致前端下发新的props属性与当前属性实际值不一致
 * 因此需要对特定属性进行判断.
 * 这个案例中是text属性
 */
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

- (void)dirtyText {
    [super dirtyText];
    self.isFontDirty = YES;
    self.dicAttributes = nil;
}

- (void)collectUpdatedProperties:(NSMutableSet<HippyApplierBlock> *)applierBlocks
            virtualApplierBlocks:(NSMutableSet<HippyApplierVirtualBlock> *)virtualApplierBlocks
                parentProperties:(NSDictionary<NSString *,id> *)parentProperties {
    [super collectUpdatedProperties:applierBlocks 
               virtualApplierBlocks:virtualApplierBlocks
                   parentProperties:parentProperties];
    
    // Set needs layout for font change event, etc.
    NSNumber *currentTag = self.hippyTag;
    [applierBlocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[currentTag];
        [view setNeedsLayout];
    }];
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

- (void)rebuildAndUpdateFont {
    // Convert fontName to fontFamily if needed
    NSString *familyName = [HippyFont familyNameWithCSSNameMatching:self.fontFamily];
    UIFont *font = [HippyFont updateFont:self.font
                              withFamily:familyName
                                    size:self.fontSize
                                  weight:self.fontWeight
                                   style:self.fontStyle
                                 variant:nil
                         scaleMultiplier:1.0];
    if (self.font != font) {
        self.font = font;
    }
}

@end
