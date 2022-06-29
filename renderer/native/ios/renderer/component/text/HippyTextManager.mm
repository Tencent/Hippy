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
#import "HippyConvert.h"
#import "NativeRenderObjectText.h"
#import "HippyText.h"
#import "HippyTextView.h"
#import "UIView+Hippy.h"

static void collectDirtyNonTextDescendants(NativeRenderObjectText *renderObject, NSMutableArray *nonTextDescendants) {
    for (NativeRenderObjectView *child in renderObject.hippySubviews) {
        if ([child isKindOfClass:[NativeRenderObjectText class]]) {
            collectDirtyNonTextDescendants((NativeRenderObjectText *)child, nonTextDescendants);
        } else if ([child isTextDirty]) {
            [nonTextDescendants addObject:child];
        }
    }
}

@interface NativeRenderObjectText (Private)
// hplayout
- (NSTextStorage *)buildTextStorageForWidth:(CGFloat)width widthMode:(MeasureMode)widthMode;
@end

@implementation HippyTextManager

- (UIView *)view {
    return [HippyText new];
}

- (NativeRenderObjectView *)nativeRenderObjectView {
    return [NativeRenderObjectText new];
}

#pragma mark - Shadow properties

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(color, UIColor)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(fontFamily, NSString)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(fontSize, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(fontWeight, NSString)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(fontStyle, NSString)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(fontVariant, NSArray)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(isHighlighted, BOOL)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(letterSpacing, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(lineHeightMultiple, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(lineSpacingMultiplier, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(lineHeight, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(numberOfLines, NSUInteger)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(ellipsizeMode, NSLineBreakMode)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(textAlign, NSTextAlignment)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(textDecorationStyle, NSUnderlineStyle)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(textDecorationColor, UIColor)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(textDecorationLine, HippyTextDecorationLineType)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(allowFontScaling, BOOL)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(opacity, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(textShadowOffset, CGSize)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(textShadowRadius, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(textShadowColor, UIColor)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(adjustsFontSizeToFit, BOOL)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(minimumFontScale, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(text, NSString)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(autoLetterSpacing, BOOL)

- (HippyRenderUIBlock)uiBlockToAmendWithRenderObjectRegistry:(NSDictionary<NSNumber *, NativeRenderObjectView *> *)renderObjectRegistry {
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
                //HippyLogWarn(@"renderObject is nil, please remain xcode state and call rainywan");
                continue;
            }
            NSAssert([renderObject isTextDirty], @"Don't process any nodes that don't have dirty text");

            if ([renderObject isKindOfClass:[NativeRenderObjectText class]]) {
                ((NativeRenderObjectText *)renderObject).fontSizeMultiplier = 1.0;
                [(NativeRenderObjectText *)renderObject recomputeText];
                collectDirtyNonTextDescendants((NativeRenderObjectText *)renderObject, queue);
            } else {
                for (NativeRenderObjectView *child in [renderObject hippySubviews]) {
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

- (HippyRenderUIBlock)uiBlockToAmendWithNativeRenderObjectView:(NativeRenderObjectText *)renderObjectText {
    NSNumber *hippyTag = renderObjectText.hippyTag;
    UIEdgeInsets padding = renderObjectText.paddingAsInsets;

    return ^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, HippyText *> *viewRegistry) {
        HippyText *text = viewRegistry[hippyTag];
        text.contentInset = padding;
    };
}

@end
