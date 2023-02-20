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

#import "HippyShadowView.h"
#import "HippyTextEnumDefines.h"

typedef NS_ENUM(NSInteger, HippySizeComparison) {
    HippySizeTooLarge,
    HippySizeTooSmall,
    HippySizeWithinRange,
};

extern NSAttributedStringKey const HippyIsHighlightedAttributeName;
extern NSAttributedStringKey const HippyHippyTagAttributeName;
extern NSAttributedStringKey const HippyShadowViewAttributeName;

@interface HippyShadowText : HippyShadowView {
@protected
    NSTextStorage *_cachedTextStorage;
    CGFloat _cachedTextStorageWidth;
    CGFloat _cachedTextStorageWidthMode;
    NSAttributedString *_cachedAttributedString;
    CGFloat _effectiveLetterSpacing;
    BOOL _textAlignSet;
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
@property (nonatomic, assign) NSUInteger numberOfLines;
@property (nonatomic, assign) NSLineBreakMode ellipsizeMode;
@property (nonatomic, assign) CGSize shadowOffset;
@property (nonatomic, assign) NSTextAlignment textAlign;
@property (nonatomic, strong) UIColor *textDecorationColor;
@property (nonatomic, assign) NSUnderlineStyle textDecorationStyle;
@property (nonatomic, assign) HippyTextDecorationLineType textDecorationLine;
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

@end


/// Style information passed when generating attributedString
@interface HippyAttributedStringStyleInfo : NSObject

@property (nonatomic, strong) NSString *fontFamily;
@property (nonatomic, strong) NSNumber *fontSize;
@property (nonatomic, strong) NSString *fontWeight;
@property (nonatomic, strong) NSString *fontStyle;
@property (nonatomic, strong) NSNumber *letterSpacing;
@property (nonatomic, assign) BOOL useBackgroundColor;
@property (nonatomic, strong) UIColor *foregroundColor;
@property (nonatomic, strong) UIColor *backgroundColor;
@property (nonatomic, assign) CGFloat opacity;
@property (nonatomic, assign) BOOL isNestedText;

@end
