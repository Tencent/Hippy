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

#import "HippyTextManager.h"
#import "HippyAssert.h"
#import "HippyConvert.h"
#import "HippyShadowText.h"
#import "HippyText.h"
#import "UIView+Hippy.h"

static void collectDirtyNonTextDescendants(HippyShadowText *renderObject, NSMutableArray *nonTextDescendants) {
    for (HippyShadowView *child in renderObject.subcomponents) {
        if ([child isKindOfClass:[HippyShadowText class]]) {
            collectDirtyNonTextDescendants((HippyShadowText *)child, nonTextDescendants);
        } else if ([child isTextDirty]) {
            [nonTextDescendants addObject:child];
        }
    }
}

@interface HippyShadowText (Private)
// hplayout
- (NSTextStorage *)buildTextStorageForWidth:(CGFloat)width widthMode:(hippy::LayoutMeasureMode)widthMode;
@end

@implementation HippyTextManager

HIPPY_EXPORT_MODULE(Text)

- (UIView *)view {
    return [HippyText new];
}

- (HippyShadowView *)shadowView {
    return [HippyShadowText new];
}

#pragma mark - Shadow properties

HIPPY_EXPORT_SHADOW_PROPERTY(color, UIColor)
HIPPY_EXPORT_SHADOW_PROPERTY(fontFamily, NSString)
HIPPY_EXPORT_SHADOW_PROPERTY(fontSize, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(fontWeight, NSString)
HIPPY_EXPORT_SHADOW_PROPERTY(fontStyle, NSString)
HIPPY_EXPORT_SHADOW_PROPERTY(fontVariant, NSArray)
HIPPY_EXPORT_SHADOW_PROPERTY(isHighlighted, BOOL)
HIPPY_EXPORT_SHADOW_PROPERTY(letterSpacing, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(lineHeightMultiple, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(lineSpacingMultiplier, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(lineHeight, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(numberOfLines, NSUInteger)
HIPPY_EXPORT_SHADOW_PROPERTY(ellipsizeMode, NSLineBreakMode)
HIPPY_EXPORT_SHADOW_PROPERTY(textAlign, NSTextAlignment)
HIPPY_EXPORT_SHADOW_PROPERTY(textDecorationStyle, NSUnderlineStyle)
HIPPY_EXPORT_SHADOW_PROPERTY(textDecorationColor, UIColor)
HIPPY_EXPORT_SHADOW_PROPERTY(textDecorationLine, HippyTextDecorationLineType)
HIPPY_EXPORT_SHADOW_PROPERTY(allowFontScaling, BOOL)
HIPPY_EXPORT_SHADOW_PROPERTY(opacity, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(textShadowOffset, CGSize)
HIPPY_EXPORT_SHADOW_PROPERTY(textShadowRadius, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(textShadowColor, UIColor)
HIPPY_EXPORT_SHADOW_PROPERTY(adjustsFontSizeToFit, BOOL)
HIPPY_EXPORT_SHADOW_PROPERTY(minimumFontScale, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(text, NSString)
HIPPY_EXPORT_SHADOW_PROPERTY(autoLetterSpacing, BOOL)

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowViewRegistry:(NSDictionary<NSNumber *, HippyShadowView *> *)renderObjectRegistry {
    for (HippyShadowView *rootView in renderObjectRegistry.allValues) {
        if (![rootView isHippyRootView]) {
            // This isn't a root view
            continue;
        }

        if (![rootView isTextDirty]) {
            // No text processing to be done
            continue;
        }

        NSMutableArray<HippyShadowView *> *queue = [NSMutableArray arrayWithObject:rootView];
        for (NSInteger i = 0; i < queue.count; i++) {
            HippyShadowView *shadowView = queue[i];
            if (!shadowView) {
                HippyLogWarn(@"shadowView is nil");
                continue;
            }
            HippyAssert([shadowView isTextDirty], @"Don't process any nodes that don't have dirty text");

            if ([shadowView isKindOfClass:[HippyShadowText class]]) {
                ((HippyShadowText *)shadowView).fontSizeMultiplier = 1.0;
                [(HippyShadowText *)shadowView recomputeText];
                collectDirtyNonTextDescendants((HippyShadowText *)shadowView, queue);
            } else {
                for (HippyShadowView *child in [shadowView subcomponents]) {
                    if ([child isTextDirty]) {
                        [queue addObject:child];
                    }
                }
            }

            [shadowView setTextComputed];
        }
    }

    return nil;
}

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowView:(HippyShadowText *)shadowView {
    NSNumber *componentTag = shadowView.hippyTag;
    UIEdgeInsets padding = shadowView.paddingAsInsets;

    return ^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, HippyText *> *viewRegistry) {
        HippyText *text = viewRegistry[componentTag];
        text.contentInset = padding;
    };
}

@end
