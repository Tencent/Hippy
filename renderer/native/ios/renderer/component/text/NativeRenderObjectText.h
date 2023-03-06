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

#import "HPConvert+NativeRender.h"
#import "NativeRenderObjectView.h"

typedef NS_ENUM(NSInteger, NativeRenderSizeComparison) {
    NativeRenderSizeTooLarge,
    NativeRenderSizeTooSmall,
    NativeRenderSizeWithinRange,
};

namespace hippy {
inline namespace dom {
enum class LayoutMeasureMode;
struct LayoutSize;
}
}

extern NSString *const NativeRenderIsHighlightedAttributeName;
extern NSString *const NativeRenderComponentTagAttributeName;
extern NSString *const NativeRenderRenderObjectAttributeName;

hippy::LayoutSize textMeasureFunc(float width, hippy::LayoutMeasureMode widthMeasureMode,
                                            __unused float height,
                                            __unused hippy::LayoutMeasureMode heightMeasureMode,
                                            void *layoutContext);

@interface NativeRenderObjectText : NativeRenderObjectView {
@protected
    NSTextStorage *_cachedTextStorage;
    CGFloat _cachedTextStorageWidth;
    hippy::LayoutMeasureMode _cachedTextStorageWidthMode;
    NSAttributedString *_cachedAttributedString;
    CGFloat _effectiveLetterSpacing;
    BOOL _textAlignSet;
    CGFloat _maximumFontLineHeight;
}

@property (nonatomic, strong) UIColor *color;
@property (nonatomic, copy) NSString *fontFamily;
@property (nonatomic, assign) CGFloat fontSize;
@property (nonatomic, copy) NSString *fontWeight;
@property (nonatomic, copy) NSString *fontStyle;
@property (nonatomic, copy) NSArray *fontVariant;
@property (nonatomic, assign) BOOL isHighlighted;
@property (nonatomic, assign) CGFloat letterSpacing;
@property (nonatomic, assign) CGFloat lineHeight;
@property (nonatomic, assign) CGFloat lineHeightMultiple;
@property (nonatomic, assign) NSUInteger numberOfLines;
@property (nonatomic, assign) NSLineBreakMode ellipsizeMode;
@property (nonatomic, assign) CGSize shadowOffset;
@property (nonatomic, assign) NSTextAlignment textAlign;
@property (nonatomic, strong) UIColor *textDecorationColor;
@property (nonatomic, assign) NSUnderlineStyle textDecorationStyle;
@property (nonatomic, assign) NativeRenderTextDecorationLineType textDecorationLine;
@property (nonatomic, assign) CGFloat fontSizeMultiplier;
@property (nonatomic, assign) BOOL allowFontScaling;
@property (nonatomic, assign) CGFloat opacity;
@property (nonatomic, assign) CGSize textShadowOffset;
@property (nonatomic, assign) CGFloat textShadowRadius;
@property (nonatomic, strong) UIColor *textShadowColor;
@property (nonatomic, assign) BOOL adjustsFontSizeToFit;
@property (nonatomic, assign) CGFloat minimumFontScale;
@property (nonatomic, copy) NSString *text;
@property (nonatomic, assign) BOOL autoLetterSpacing;

- (void)recomputeText;
- (NSAttributedString *)_attributedStringWithFontFamily:(NSString *)fontFamily
                                               fontSize:(NSNumber *)fontSize
                                             fontWeight:(NSString *)fontWeight
                                              fontStyle:(NSString *)fontStyle
                                          letterSpacing:(NSNumber *)letterSpacing
                                     useBackgroundColor:(BOOL)useBackgroundColor
                                        foregroundColor:(UIColor *)foregroundColor
                                        backgroundColor:(UIColor *)backgroundColor
                                                opacity:(CGFloat)opacity;
- (void)_addAttribute:(NSString *)attribute withValue:(id)attributeValue toAttributedString:(NSMutableAttributedString *)attributedString;
- (void)_setParagraphStyleOnAttributedString:(NSMutableAttributedString *)attributedString
                              fontLineHeight:(CGFloat)fontLineHeight
                      heightOfTallestSubview:(CGFloat)heightOfTallestSubview;
@end
