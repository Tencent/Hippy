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
#import "HippyLog.h"
#import "HippyShadowText.h"
#import "HippyText.h"
#import "HippyTextView.h"
#import "UIView+Hippy.h"
#import "HippyVirtualTextNode.h"

//遍历该shadowView（shadowText）的dirty且非shadowText的子view，将之加入到queue
//子view如果是dirty，说明其子节点可能有dirtyView
//但现在似乎不存在这种情况，view能嵌套text，text能嵌套text，但text不能嵌套view
static void collectDirtyNonTextDescendants(HippyShadowText *shadowView, NSMutableArray *nonTextDescendants) {
  for (HippyShadowView *child in shadowView.hippySubviews) {
    if ([child isKindOfClass:[HippyShadowText class]]) {
      collectDirtyNonTextDescendants((HippyShadowText *)child, nonTextDescendants);
    }else if ([child isTextDirty]) {
      [nonTextDescendants addObject:child];
    }
  }
}

@interface HippyShadowText (Private)
//hplayout
- (NSTextStorage *)buildTextStorageForWidth:(CGFloat)width widthMode:(MeasureMode)widthMode;
@end


@implementation HippyTextManager

HIPPY_EXPORT_MODULE(Text)

- (UIView *)view
{
  return [HippyText new];
}

- (HippyShadowView *)shadowView
{
  return [HippyShadowText new];
}

- (HippyVirtualNode *)node:(NSNumber *)tag name:(NSString *)name props:(NSDictionary *)props
{
	return [HippyVirtualTextNode createNode: tag viewName: name props: props];
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

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowViewRegistry:(NSDictionary<NSNumber *, HippyShadowView *> *)shadowViewRegistry
{
  for (HippyShadowView *rootView in shadowViewRegistry.allValues) {
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
            HippyLogWarn(@"shadowView is nil, please remain xcode state and call rainywan");
            continue;
        }
      HippyAssert([shadowView isTextDirty], @"Don't process any nodes that don't have dirty text");

      if ([shadowView isKindOfClass:[HippyShadowText class]]) {
		  ((HippyShadowText *)shadowView).fontSizeMultiplier = 1.0;
        [(HippyShadowText *)shadowView recomputeText];
        collectDirtyNonTextDescendants((HippyShadowText *)shadowView, queue);
      }else {
        for (HippyShadowView *child in [shadowView hippySubviews]) {
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

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowView:(HippyShadowText *)shadowView
{
  NSNumber *hippyTag = shadowView.hippyTag;
  UIEdgeInsets padding = shadowView.paddingAsInsets;

  return ^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, HippyText *> *viewRegistry) {
    HippyText *text = viewRegistry[hippyTag];
    text.contentInset = padding;
  };
}

@end
