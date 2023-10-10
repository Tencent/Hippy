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

#import "NativeRenderTextManager.h"
#import "HippyConvert.h"
#import "NativeRenderObjectText.h"
#import "NativeRenderText.h"
#import "NativeRenderTextView.h"
#import "UIView+NativeRender.h"

static void collectDirtyNonTextDescendants(NativeRenderObjectText *renderObject, NSMutableArray *nonTextDescendants) {
    for (NativeRenderObjectView *child in renderObject.subcomponents) {
        if ([child isKindOfClass:[NativeRenderObjectText class]]) {
            collectDirtyNonTextDescendants((NativeRenderObjectText *)child, nonTextDescendants);
        } else if ([child isTextDirty]) {
            [nonTextDescendants addObject:child];
        }
    }
}

@interface NativeRenderObjectText (Private)
// hplayout
- (NSTextStorage *)buildTextStorageForWidth:(CGFloat)width widthMode:(hippy::LayoutMeasureMode)widthMode;
@end

@implementation NativeRenderTextManager

HIPPY_EXPORT_MODULE(Text)

- (UIView *)view {
    return [NativeRenderText new];
}

- (NativeRenderObjectView *)nativeRenderObjectView {
    return [NativeRenderObjectText new];
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
HIPPY_EXPORT_SHADOW_PROPERTY(textDecorationLine, NativeRenderTextDecorationLineType)
HIPPY_EXPORT_SHADOW_PROPERTY(allowFontScaling, BOOL)
HIPPY_EXPORT_SHADOW_PROPERTY(opacity, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(textShadowOffset, CGSize)
HIPPY_EXPORT_SHADOW_PROPERTY(textShadowRadius, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(textShadowColor, UIColor)
HIPPY_EXPORT_SHADOW_PROPERTY(adjustsFontSizeToFit, BOOL)
HIPPY_EXPORT_SHADOW_PROPERTY(minimumFontScale, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(text, NSString)
HIPPY_EXPORT_SHADOW_PROPERTY(autoLetterSpacing, BOOL)

- (HippyViewManagerUIBlock)uiBlockToAmendWithRenderObjectRegistry:(NSDictionary<NSNumber *, NativeRenderObjectView *> *)renderObjectRegistry {
    for (NativeRenderObjectView *rootView in renderObjectRegistry.allValues) {
        if (![rootView isHippyRootView]) {
            // This isn't a root view
            continue;
        }

        if (![rootView isTextDirty]) {
            // No text processing to be done
            continue;
        }

        NSMutableArray<NativeRenderObjectView *> *queue = [NSMutableArray arrayWithObject:rootView];
        for (NSInteger i = 0; i < queue.count; i++) {
            NativeRenderObjectView *renderObject = queue[i];
            if (!renderObject) {
                HippyLogWarn(@"renderObject is nil, please remain xcode state and call rainywan");
                continue;
            }
//            NSAssert([renderObject isTextDirty], @"Don't process any nodes that don't have dirty text");

            if ([renderObject isKindOfClass:[NativeRenderObjectText class]]) {
                ((NativeRenderObjectText *)renderObject).fontSizeMultiplier = 1.0;
                [(NativeRenderObjectText *)renderObject recomputeText];
                collectDirtyNonTextDescendants((NativeRenderObjectText *)renderObject, queue);
            } else {
                for (NativeRenderObjectView *child in [renderObject subcomponents]) {
                    if ([child isTextDirty]) {
                        [queue addObject:child];
                    }
                }
            }

            [renderObject setTextComputed];
        }
    }

    return nil;
}

- (HippyViewManagerUIBlock)uiBlockToAmendWithNativeRenderObjectView:(NativeRenderObjectText *)renderObjectText {
    NSNumber *componentTag = renderObjectText.hippyTag;
    UIEdgeInsets padding = renderObjectText.paddingAsInsets;

    return ^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, NativeRenderText *> *viewRegistry) {
        NativeRenderText *text = viewRegistry[componentTag];
        text.contentInset = padding;
    };
}

@end
