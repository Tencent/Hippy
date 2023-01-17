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

#import "HPConvert.h"
#import "HPI18nUtils.h"
#import "HPToolUtils.h"
#import "NativeRenderFont.h"
#import "NativeRenderObjectText.h"
#import "NativeRenderText.h"
#import "NativeRenderTextView.h"
#import "NativeRenderUtils.h"

#include "dom/layout_node.h"

NSString *const NativeRenderRenderObjectAttributeName = @"NativeRenderRenderObjectAttributeName";
NSString *const NativeRenderIsHighlightedAttributeName = @"IsHighlightedAttributeName";
NSString *const NativeRenderComponentTagAttributeName = @"NativeRenderTagAttributeName";

CGFloat const NativeRenderTextAutoSizeWidthErrorMargin = 0.05f;
CGFloat const NativeRenderTextAutoSizeHeightErrorMargin = 0.025f;
CGFloat const NativeRenderTextAutoSizeGranularity = 0.001f;

static const CGFloat gDefaultFontSize = 14.f;

@implementation NativeRenderObjectText

hippy::LayoutSize textMeasureFunc(
    NativeRenderObjectText *weakShadowText, float width,hippy::LayoutMeasureMode widthMeasureMode,
                                 float height, hippy::LayoutMeasureMode heightMeasureMode, void *layoutContext) {
    hippy::LayoutSize retSize;
    NativeRenderObjectText *strongShadowText = weakShadowText;
    if (strongShadowText) {
        NSTextStorage *textStorage = [strongShadowText buildTextStorageForWidth:width widthMode:widthMeasureMode];
        [strongShadowText calculateTextFrame:textStorage];
        NSLayoutManager *layoutManager = textStorage.layoutManagers.firstObject;
        NSTextContainer *textContainer = layoutManager.textContainers.firstObject;
        CGSize size = [layoutManager usedRectForTextContainer:textContainer].size;
        retSize.width = ceil(size.width);
        retSize.height = ceil(size.height);
    }
    return retSize;
}

static void resetFontAttribute(NSTextStorage *textStorage) {
    NSLayoutManager *layoutManager = textStorage.layoutManagers.firstObject;
    NSUInteger numberOfGlyphs = [layoutManager numberOfGlyphs];
    if (0 != numberOfGlyphs) {
        NSUInteger stringLength = [textStorage length];
        NSRange lineFramentEffectiveRange = { 0, 0 };
        [layoutManager lineFragmentUsedRectForGlyphAtIndex:numberOfGlyphs - 1 effectiveRange:&lineFramentEffectiveRange];
        while (1 == lineFramentEffectiveRange.length) {
            NSUInteger attributeIndex = 0;
            NSRange shrinkEffectiveRange = { 0, 0 };
            BOOL didShrinkKernSpacing = NO;
            do {
                NSNumber *kernValue = [textStorage attribute:NSKernAttributeName atIndex:attributeIndex effectiveRange:&shrinkEffectiveRange];
                if (nil != kernValue) {
                    NSNumber *previousKernValue = @([kernValue integerValue] - 1);
                    [textStorage addAttribute:NSKernAttributeName value:previousKernValue range:shrinkEffectiveRange];
                    didShrinkKernSpacing = YES;
                }
                attributeIndex += shrinkEffectiveRange.length;
            } while (attributeIndex < stringLength);

            if (NO == didShrinkKernSpacing) {
                attributeIndex = 0;
                shrinkEffectiveRange = { 0, 0 };
                do {
                    UIFont *fontValue = [textStorage attribute:NSFontAttributeName atIndex:attributeIndex effectiveRange:&shrinkEffectiveRange];
                    if (nil != fontValue) {
                        CGFloat fontSize = [fontValue pointSize];
                        UIFont *smallerFont = [fontValue fontWithSize:fontSize - 1];
                        [textStorage addAttribute:NSFontAttributeName value:smallerFont range:shrinkEffectiveRange];
                    }
                    attributeIndex += shrinkEffectiveRange.length;
                } while (attributeIndex < stringLength);
            }
            [layoutManager lineFragmentUsedRectForGlyphAtIndex:numberOfGlyphs - 1 effectiveRange:&lineFramentEffectiveRange];
        }
    }
}

- (instancetype)init {
    if ((self = [super init])) {
        _fontSize = NAN;
        _letterSpacing = NAN;
        _isHighlighted = NO;
        _textDecorationStyle = NSUnderlineStyleSingle;
        _opacity = 1.0;
        _ellipsizeMode = NSLineBreakByTruncatingTail;
        _cachedTextStorageWidth = -1;
        _cachedTextStorageWidthMode = -1;
        _fontSizeMultiplier = 1.0;
        _lineHeightMultiple = 1.0f;
        _textAlign = NSTextAlignmentLeft;
        if (NSWritingDirectionRightToLeft ==  [[HPI18nUtils sharedInstance] writingDirectionForCurrentAppLanguage]) {
            self.textAlign = NSTextAlignmentRight;
        }
    }
    return self;
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (NSString *)description {
    NSString *superDescription = super.description;
    return [[superDescription substringToIndex:superDescription.length - 1] stringByAppendingFormat:@"; text: %@>", [self attributedString].string];
}

- (BOOL)isCSSLeafNode {
    return YES;
}

- (void)contentSizeMultiplierDidChange:(__unused NSNotification *)note {
    [self dirtyText];
}

- (NSDictionary<NSString *, id> *)processUpdatedProperties:(NSMutableSet<NativeRenderApplierBlock> *)applierBlocks
                                          parentProperties:(NSDictionary<NSString *, id> *)parentProperties {
    if ([[self parentComponent] isKindOfClass:[NativeRenderObjectText class]]) {
        return parentProperties;
    }

    parentProperties = [super processUpdatedProperties:applierBlocks parentProperties:parentProperties];

    UIEdgeInsets padding = self.paddingAsInsets;
    CGFloat width = self.frame.size.width - (padding.left + padding.right);

    NSNumber *parentTag = [[self parentComponent] componentTag];
    // MTTlayout
    NSTextStorage *textStorage = [self buildTextStorageForWidth:width widthMode:hippy::Exactly];
    CGRect textFrame = [self calculateTextFrame:textStorage];
    UIColor *color = self.color ?: [UIColor blackColor];
    [applierBlocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        NativeRenderText *view = (NativeRenderText *)viewRegistry[self.componentTag];
        view.textFrame = textFrame;
        view.textStorage = textStorage;
        view.textColor = color;
        /**
         * NOTE: this logic is included to support rich text editing inside multiline
         * `<TextInput>` controls. It is required in order to ensure that the
         * textStorage (aka attributed string) is copied over from the NativeRenderShadowText
         * to the NativeRenderText view in time to be used to update the editable text content.
         * TODO: we should establish a delegate relationship betweeen NativeRenderTextView
         * and its contaned NativeRenderText element when they get inserted and get rid of this
         */
        UIView *parentView = viewRegistry[parentTag];
        if ([parentView respondsToSelector:@selector(performTextUpdate)]) {
            [(NativeRenderTextView *)parentView performTextUpdate];
        }
    }];
    return parentProperties;
}

- (void)amendLayoutBeforeMount {
    @try {
        UIEdgeInsets padding = self.paddingAsInsets;
        CGFloat width = self.frame.size.width - (padding.left + padding.right);
        NSTextStorage *textStorage = [self buildTextStorageForWidth:width widthMode:hippy::Exactly];
        CGRect textFrame = [self calculateTextFrame:textStorage];
        
        NSLayoutManager *layoutManager = textStorage.layoutManagers.firstObject;
        NSTextContainer *textContainer = layoutManager.textContainers.firstObject;
        NSRange glyphRange = [layoutManager glyphRangeForTextContainer:textContainer];
        NSRange characterRange = [layoutManager characterRangeForGlyphRange:glyphRange actualGlyphRange:NULL];
        [layoutManager.textStorage enumerateAttribute:NativeRenderRenderObjectAttributeName inRange:characterRange options:0 usingBlock:^(
            NativeRenderObjectView *child, NSRange range, __unused BOOL *_) {
            if (child) {
                float width = child.frame.size.width, height = child.frame.size.height;
                if (isnan(width) || isnan(height)) {
                    HPLogError(@"Views nested within a <Text> must have a width and height");
                }

                /**
                 * For RichText, a view, which is top aligment by default, should be center alignment to text,
                 */
                
                //rect for attachment at its line fragment
                CGRect glyphRect = [layoutManager boundingRectForGlyphRange:range inTextContainer:textContainer];
                CGPoint location = [layoutManager locationForGlyphAtIndex:range.location];
                CGFloat roundedHeight = NativeRenderRoundPixelValue(height);
                CGFloat roundedWidth = NativeRenderRoundPixelValue(width);
                CGFloat positionY = glyphRect.origin.y + glyphRect.size.height - roundedHeight;
                CGRect childFrameToSet = CGRectMake(NativeRenderRoundPixelValue(textFrame.origin.x + location.x),
                                                    NativeRenderRoundPixelValue(textFrame.origin.y + positionY),
                                                    roundedWidth, roundedHeight);
                CGRect childFrame = child.frame;
#define ChildFrameParamNearlyEqual(x, y) (fabs((x) - (y)) < 0.00001f)
                if (!ChildFrameParamNearlyEqual(childFrame.origin.x, childFrameToSet.origin.x) ||
                    !ChildFrameParamNearlyEqual(childFrame.origin.y, childFrameToSet.origin.y) ||
                    !ChildFrameParamNearlyEqual(childFrame.size.width, childFrameToSet.size.width) ||
                    !ChildFrameParamNearlyEqual(childFrame.size.height, childFrameToSet.size.height)) {
                    [child setLayoutFrame:childFrameToSet];
                }
            }
        }];
        [super amendLayoutBeforeMount];
    }
    @catch (NSException *exception) {
        [super amendLayoutBeforeMount];
    }
}

- (void)applyConfirmedLayoutDirectionToSubviews:(HPDirection)confirmedLayoutDirection {
    [super applyConfirmedLayoutDirectionToSubviews:confirmedLayoutDirection];
    [self dirtyText];
}

- (NSTextStorage *)buildTextStorageForWidth:(CGFloat)width widthMode:(hippy::LayoutMeasureMode)widthMode {
    // MttRN: https://github.com/Tencent/hippy-native/issues/11412
    if (isnan(width)) {
        width = 0;
    }

    if (_cachedTextStorage && width == _cachedTextStorageWidth && widthMode == _cachedTextStorageWidthMode) {
        return _cachedTextStorage;
    }

    NSLayoutManager *layoutManager = [NSLayoutManager new];

    NSTextStorage *textStorage = [[NSTextStorage alloc] initWithAttributedString:self.attributedString];
    [textStorage addLayoutManager:layoutManager];

    NSTextContainer *textContainer = [NSTextContainer new];
    textContainer.lineFragmentPadding = 0.0;

    if (_numberOfLines > 0) {
        textContainer.lineBreakMode = _ellipsizeMode;
    } else {
        textContainer.lineBreakMode = NSLineBreakByClipping;
    }

    textContainer.maximumNumberOfLines = _numberOfLines;
    textContainer.size = (CGSize) { widthMode == hippy::Undefined ? CGFLOAT_MAX : width, CGFLOAT_MAX };

    [layoutManager addTextContainer:textContainer];
    [layoutManager ensureLayoutForTextContainer:textContainer];

    if (_autoLetterSpacing) {
        resetFontAttribute(textStorage);
        _cachedAttributedString = [[NSAttributedString alloc] initWithAttributedString:textStorage];
    }

    _cachedTextStorageWidth = width;
    _cachedTextStorageWidthMode = widthMode;
    _cachedTextStorage = textStorage;

    return textStorage;
}

- (void)dirtyText {
    [super dirtyText];
    _cachedTextStorage = nil;
    auto domManager = self.domManager.lock();
    if (domManager) {
        __weak NativeRenderObjectView *weakSelf = self;
        std::vector<std::function<void()>> ops_ = {[weakSelf, domManager](){
            @autoreleasepool {
                if (weakSelf) {
                    NativeRenderObjectView *strongSelf = weakSelf;
                    int32_t componentTag = [[strongSelf componentTag] intValue];
                    auto domNode = domManager->GetNode(strongSelf.rootNode, componentTag);
                    if (domNode) {
                        auto layoutNode = domNode->GetLayoutNode();
                        layoutNode->MarkDirty();
                        [strongSelf dirtyPropagation];
                        strongSelf.hasNewLayout = YES;
                    }
                }
            }
        }};
        domManager->PostTask(hippy::dom::Scene(std::move(ops_)));
    }
}

- (void)recomputeText {
    [self attributedString];
    [self setTextComputed];
    [self dirtyPropagation];
}

- (NSAttributedString *)attributedString {
    return [self _attributedStringWithFontFamily:nil fontSize:nil fontWeight:nil fontStyle:nil letterSpacing:nil useBackgroundColor:NO
                                 foregroundColor:self.color ?: [UIColor blackColor]
                                 backgroundColor:self.backgroundColor
                                         opacity:self.opacity];
}

- (NSAttributedString *)_attributedStringWithFontFamily:(NSString *)fontFamily
                                               fontSize:(NSNumber *)fontSize
                                             fontWeight:(NSString *)fontWeight
                                              fontStyle:(NSString *)fontStyle
                                          letterSpacing:(NSNumber *)letterSpacing
                                     useBackgroundColor:(BOOL)useBackgroundColor
                                        foregroundColor:(UIColor *)foregroundColor
                                        backgroundColor:(UIColor *)backgroundColor
                                                opacity:(CGFloat)opacity {
    if (!_textAlignSet) {
        if ([self isLayoutSubviewsRTL]) {
            self.textAlign = NSTextAlignmentRight;
        }
        else {
            self.textAlign = NSTextAlignmentLeft;
        }
    }

    if (![self isTextDirty] && _cachedAttributedString) {
        return _cachedAttributedString;
    }

    if (_fontSize && !isnan(_fontSize)) {
        fontSize = @(_fontSize);
    }
    else if (nil == fontSize) {
        //default font size is 14
        fontSize = @(gDefaultFontSize);
    }
    if (_fontWeight) {
        fontWeight = _fontWeight;
    }
    if (_fontStyle) {
        fontStyle = _fontStyle;
    }
    if (_fontFamily) {
        fontFamily = _fontFamily;
    }
    if (!isnan(_letterSpacing)) {
        letterSpacing = @(_letterSpacing);
    }

    _effectiveLetterSpacing = letterSpacing.doubleValue;

    UIFont *f = nil;
    if (fontFamily) {
        f = [UIFont fontWithName:fontFamily size:[fontSize floatValue]];
    }

    UIFont *font = [NativeRenderFont updateFont:f withFamily:fontFamily size:fontSize weight:fontWeight style:fontStyle variant:_fontVariant
                         scaleMultiplier:_allowFontScaling ? _fontSizeMultiplier : 1.0];

    CGFloat heightOfTallestSubview = 0.0;
    NSMutableAttributedString *attributedString = [[NSMutableAttributedString alloc] initWithString:self.text ?: @""];
    for (NativeRenderObjectView *child in [self subcomponents]) {
        if ([child isKindOfClass:[NativeRenderObjectText class]]) {
            NativeRenderObjectText *shadowText = (NativeRenderObjectText *)child;
            [attributedString appendAttributedString:[shadowText _attributedStringWithFontFamily:fontFamily fontSize:fontSize fontWeight:fontWeight
                                                                                       fontStyle:fontStyle
                                                                                   letterSpacing:letterSpacing
                                                                              useBackgroundColor:YES
                                                                                 foregroundColor:[shadowText color] ?: foregroundColor
                                                                                 backgroundColor:shadowText.backgroundColor ?: backgroundColor
                                                                                         opacity:opacity * shadowText.opacity]];
            [child setTextComputed];
        } else {
            float width = 0, height = 0;
            auto domManager = [child domManager].lock();
            if (domManager) {
                int32_t componentTag = [child.componentTag intValue];
                auto domNode = domManager->GetNode(child.rootNode, componentTag);
                if (domNode) {
                    width = domNode->GetLayoutNode()->GetStyleWidth();
                    height = domNode->GetLayoutNode()->GetStyleHeight();
                    CGRect frame = child.frame;
                    frame.size.width = width;
                    frame.size.height = height;
                    child.frame = frame;
                }
            }
            if (isnan(width) || isnan(height)) {
                HPLogError(@"Views nested within a <Text> must have a width and height");
            }
            static UIImage *placehoderImage = nil;
            static dispatch_once_t onceToken;
            dispatch_once(&onceToken, ^{
                placehoderImage = [[UIImage alloc] init];
            });
            NSTextAttachment *attachment = [NSTextAttachment new];
            attachment.bounds = (CGRect) { CGPointZero, { width, height } };
            attachment.image = placehoderImage;
            NSMutableAttributedString *attachmentString = [NSMutableAttributedString new];
            [attachmentString appendAttributedString:[NSAttributedString attributedStringWithAttachment:attachment]];
            [attachmentString addAttribute:NativeRenderRenderObjectAttributeName value:child range:(NSRange) { 0, attachmentString.length }];
            [attributedString appendAttributedString:attachmentString];
            if (height > heightOfTallestSubview) {
                heightOfTallestSubview = height;
            }
            // Don't call setTextComputed on this child. NativeRenderTextManager takes care of
            // processing inline UIViews.
        }
    }

    [self _addAttribute:NSForegroundColorAttributeName
                 withValue:[foregroundColor colorWithAlphaComponent:CGColorGetAlpha(foregroundColor.CGColor) * opacity]
        toAttributedString:attributedString];

    if (_isHighlighted) {
        [self _addAttribute:NativeRenderIsHighlightedAttributeName withValue:@YES toAttributedString:attributedString];
    }
    if (useBackgroundColor && backgroundColor) {
        [self _addAttribute:NSBackgroundColorAttributeName
                     withValue:[backgroundColor colorWithAlphaComponent:CGColorGetAlpha(backgroundColor.CGColor) * opacity]
            toAttributedString:attributedString];
    }

    [self _addAttribute:NSFontAttributeName withValue:font toAttributedString:attributedString];
    [self _addAttribute:NSKernAttributeName withValue:letterSpacing toAttributedString:attributedString];
    [self _addAttribute:NativeRenderComponentTagAttributeName withValue:self.componentTag toAttributedString:attributedString];
    [self _setParagraphStyleOnAttributedString:attributedString fontLineHeight:font.lineHeight heightOfTallestSubview:heightOfTallestSubview];
    if ([self isLayoutSubviewsRTL]) {
        NSDictionary *dic = @{NSWritingDirectionAttributeName: @[@(NSWritingDirectionRightToLeft | NSWritingDirectionEmbedding)]};
        [attributedString addAttributes:dic range:NSMakeRange(0, [attributedString length])];
    }
    else {
        NSDictionary *dic = @{NSWritingDirectionAttributeName: @[@(NSWritingDirectionLeftToRight | NSWritingDirectionOverride)]};
        [attributedString addAttributes:dic range:NSMakeRange(0, [attributedString length])];
    }

    // create a non-mutable attributedString for use by the Text system which avoids copies down the line
    _cachedAttributedString = [[NSAttributedString alloc] initWithAttributedString:attributedString];
    return _cachedAttributedString;
}

- (void)_addAttribute:(NSString *)attribute withValue:(id)attributeValue toAttributedString:(NSMutableAttributedString *)attributedString {
    [attributedString enumerateAttribute:attribute inRange:NSMakeRange(0, attributedString.length) options:0
                              usingBlock:^(id value, NSRange range, __unused BOOL *stop) {
                                  if (!value && attributeValue) {
                                      [attributedString addAttribute:attribute value:attributeValue range:range];
                                  }
                              }];
}

/*
 * LineHeight works the same way line-height works in the web: if children and self have
 * varying lineHeights, we simply take the max.
 */
- (void)_setParagraphStyleOnAttributedString:(NSMutableAttributedString *)attributedString
                              fontLineHeight:(CGFloat)fontLineHeight
                      heightOfTallestSubview:(CGFloat)heightOfTallestSubview {
    NSTextStorage *textStorage = [[NSTextStorage alloc] initWithAttributedString:attributedString];
    if (fabs(_lineHeight - 0) < DBL_EPSILON) {
        _lineHeight = fontLineHeight;
    }
    // check if we have lineHeight set on self
    __block BOOL hasParagraphStyle = NO;
    if (_lineHeight || _textAlignSet || 1.f != _lineHeightMultiple) {
        hasParagraphStyle = YES;
    }

    __block float newLineHeight = _lineHeight ?: 0.0;

    CGFloat fontSizeMultiplier = _allowFontScaling ? _fontSizeMultiplier : 1.0;

    // check for lineHeight on each of our children, update the max as we go (in self.lineHeight)
    [attributedString enumerateAttribute:NSParagraphStyleAttributeName inRange:(NSRange) { 0, attributedString.length } options:0
                              usingBlock:^(id value, __unused NSRange range, __unused BOOL *stop) {
                                  if (value) {
                                      NSParagraphStyle *paragraphStyle = (NSParagraphStyle *)value;
                                      CGFloat maximumLineHeight = round(paragraphStyle.maximumLineHeight / fontSizeMultiplier);
                                      if (maximumLineHeight > newLineHeight) {
                                          newLineHeight = maximumLineHeight;
                                      }
                                      hasParagraphStyle = YES;
                                  }
                              }];

    if (self.lineHeight != newLineHeight) {
        self.lineHeight = newLineHeight;
    }

    __block CGFloat maximumFontLineHeight = 0;

    [textStorage enumerateAttribute:NSFontAttributeName inRange:NSMakeRange(0, attributedString.length)
                            options:NSAttributedStringEnumerationLongestEffectiveRangeNotRequired
                         usingBlock:^(UIFont *font, NSRange range, __unused BOOL *stop) {
                             if (!font) {
                                 return;
                             }

                             if (maximumFontLineHeight <= font.lineHeight) {
                                 maximumFontLineHeight = font.lineHeight;
                             }
                         }];

    // if we found anything, set it :D
    if (hasParagraphStyle) {
        NSMutableParagraphStyle *paragraphStyle = [NSMutableParagraphStyle new];
        paragraphStyle.alignment = _textAlign;
        CGFloat lineHeight = round(_lineHeight * fontSizeMultiplier);
        CGFloat maxHeight = lineHeight;
        if (heightOfTallestSubview > lineHeight) {
            maxHeight = ceilf(heightOfTallestSubview);
        }
        paragraphStyle.lineHeightMultiple = _lineHeightMultiple;
        maxHeight = MAX(maxHeight, maximumFontLineHeight);
        paragraphStyle.minimumLineHeight = lineHeight;
        paragraphStyle.maximumLineHeight = maxHeight;
        [attributedString addAttribute:NSParagraphStyleAttributeName value:paragraphStyle range:(NSRange) { 0, attributedString.length }];

        /**
         * for keeping text ertical center, we need to set baseline offset
         */
        if (lineHeight > fontLineHeight) {
            CGFloat baselineOffset = newLineHeight / 2 - maximumFontLineHeight / 2;
            [attributedString addAttribute:NSBaselineOffsetAttributeName value:@(baselineOffset)
                                     range:(NSRange) { 0, attributedString.length }];
        }
    }
    _maximumFontLineHeight = maximumFontLineHeight;
    // Text decoration
    if (_textDecorationLine == NativeRenderTextDecorationLineTypeUnderline || _textDecorationLine == NativeRenderTextDecorationLineTypeUnderlineStrikethrough) {
        [self _addAttribute:NSUnderlineStyleAttributeName withValue:@(_textDecorationStyle) toAttributedString:attributedString];
    }
    if (_textDecorationLine == NativeRenderTextDecorationLineTypeStrikethrough || _textDecorationLine == NativeRenderTextDecorationLineTypeUnderlineStrikethrough) {
        [self _addAttribute:NSStrikethroughStyleAttributeName withValue:@(_textDecorationStyle) toAttributedString:attributedString];
    }
    if (_textDecorationColor) {
        [self _addAttribute:NSStrikethroughColorAttributeName withValue:_textDecorationColor toAttributedString:attributedString];
        [self _addAttribute:NSUnderlineColorAttributeName withValue:_textDecorationColor toAttributedString:attributedString];
    }

    // Text shadow
    if (!CGSizeEqualToSize(_textShadowOffset, CGSizeZero)) {
        NSShadow *shadow = [NSShadow new];
        shadow.shadowOffset = _textShadowOffset;
        shadow.shadowBlurRadius = _textShadowRadius;
        shadow.shadowColor = _textShadowColor;
        [self _addAttribute:NSShadowAttributeName withValue:shadow toAttributedString:attributedString];
    }
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {
    [super didSetProps:changedProps];
    if ([changedProps containsObject:@"textAlign"]) {
        _textAlignSet = YES;
    }
}

#pragma mark Autosizing

- (CGRect)calculateTextFrame:(NSTextStorage *)textStorage {
    CGRect textFrame = UIEdgeInsetsInsetRect((CGRect) { CGPointZero, self.frame.size }, self.paddingAsInsets);

    if (_adjustsFontSizeToFit) {
        textFrame = [self updateStorage:textStorage toFitFrame:textFrame];
    }

    return textFrame;
}

- (CGRect)updateStorage:(NSTextStorage *)textStorage toFitFrame:(CGRect)frame {
    BOOL fits = [self attemptScale:1.0f inStorage:textStorage forFrame:frame];
    CGSize requiredSize;
    if (!fits) {
        requiredSize = [self calculateOptimumScaleInFrame:frame forStorage:textStorage minScale:self.minimumFontScale maxScale:1.0 prevMid:INT_MAX];
    } else {
        requiredSize = [self calculateSize:textStorage];
    }

    // Vertically center draw position for new text sizing.
    frame.origin.y = self.paddingAsInsets.top + NativeRenderRoundPixelValue((CGRectGetHeight(frame) - requiredSize.height) / 2.0f);
    return frame;
}

- (CGSize)calculateOptimumScaleInFrame:(CGRect)frame
                            forStorage:(NSTextStorage *)textStorage
                              minScale:(CGFloat)minScale
                              maxScale:(CGFloat)maxScale
                               prevMid:(CGFloat)prevMid {
    CGFloat midScale = (minScale + maxScale) / 2.0f;
    if (round((prevMid / NativeRenderTextAutoSizeGranularity)) == round((midScale / NativeRenderTextAutoSizeGranularity))) {
        // Bail because we can't meet error margin.
        return [self calculateSize:textStorage];
    } else {
        NativeRenderSizeComparison comparison = [self attemptScale:midScale inStorage:textStorage forFrame:frame];
        if (comparison == NativeRenderSizeWithinRange) {
            return [self calculateSize:textStorage];
        } else if (comparison == NativeRenderSizeTooLarge) {
            return [self calculateOptimumScaleInFrame:frame forStorage:textStorage minScale:minScale maxScale:midScale - NativeRenderTextAutoSizeGranularity
                                              prevMid:midScale];
        } else {
            return [self calculateOptimumScaleInFrame:frame forStorage:textStorage minScale:midScale + NativeRenderTextAutoSizeGranularity maxScale:maxScale
                                              prevMid:midScale];
        }
    }
}

- (NativeRenderSizeComparison)attemptScale:(CGFloat)scale inStorage:(NSTextStorage *)textStorage forFrame:(CGRect)frame {
    NSLayoutManager *layoutManager = [textStorage.layoutManagers firstObject];
    NSTextContainer *textContainer = [layoutManager.textContainers firstObject];

    NSRange glyphRange = NSMakeRange(0, textStorage.length);
    [textStorage beginEditing];
    [textStorage enumerateAttribute:NSFontAttributeName inRange:glyphRange options:0 usingBlock:^(UIFont *font, NSRange range, __unused BOOL *stop) {
        if (font) {
            UIFont *originalFont = [self.attributedString attribute:NSFontAttributeName atIndex:range.location effectiveRange:&range];
            UIFont *newFont = [font fontWithSize:originalFont.pointSize * scale];
            [textStorage removeAttribute:NSFontAttributeName range:range];
            [textStorage addAttribute:NSFontAttributeName value:newFont range:range];
        }
    }];

    [textStorage endEditing];

    NSInteger linesRequired = [self numberOfLinesRequired:[textStorage.layoutManagers firstObject]];
    CGSize requiredSize = [self calculateSize:textStorage];

    BOOL fitSize = requiredSize.height <= CGRectGetHeight(frame) && requiredSize.width <= CGRectGetWidth(frame);

    BOOL fitLines = linesRequired <= textContainer.maximumNumberOfLines || textContainer.maximumNumberOfLines == 0;

    if (fitLines && fitSize) {
        if ((requiredSize.width + (CGRectGetWidth(frame) * NativeRenderTextAutoSizeWidthErrorMargin)) > CGRectGetWidth(frame)
            && (requiredSize.height + (CGRectGetHeight(frame) * NativeRenderTextAutoSizeHeightErrorMargin)) > CGRectGetHeight(frame)) {
            return NativeRenderSizeWithinRange;
        } else {
            return NativeRenderSizeTooSmall;
        }
    } else {
        return NativeRenderSizeTooLarge;
    }
}

// Via Apple Text Layout Programming Guide
// https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/TextLayout/Tasks/CountLines.html
- (NSInteger)numberOfLinesRequired:(NSLayoutManager *)layoutManager {
    NSInteger numberOfLines, index, numberOfGlyphs = [layoutManager numberOfGlyphs];
    NSRange lineRange;
    for (numberOfLines = 0, index = 0; index < numberOfGlyphs; numberOfLines++) {
        (void)[layoutManager lineFragmentRectForGlyphAtIndex:index effectiveRange:&lineRange];
        index = NSMaxRange(lineRange);
    }

    return numberOfLines;
}

// Via Apple Text Layout Programming Guide
// https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/TextLayout/Tasks/StringHeight.html
- (CGSize)calculateSize:(NSTextStorage *)storage {
    NSLayoutManager *layoutManager = [storage.layoutManagers firstObject];
    NSTextContainer *textContainer = [layoutManager.textContainers firstObject];

    [textContainer setLineBreakMode:NSLineBreakByWordWrapping];
    NSInteger maxLines = [textContainer maximumNumberOfLines];
    [textContainer setMaximumNumberOfLines:0];
    (void)[layoutManager glyphRangeForTextContainer:textContainer];
    CGSize requiredSize = [layoutManager usedRectForTextContainer:textContainer].size;
    [textContainer setMaximumNumberOfLines:maxLines];

    return requiredSize;
}

- (void)setBackgroundColor:(UIColor *)backgroundColor {
    super.backgroundColor = backgroundColor;
    [self dirtyText];
}

#define NATIVE_RENDER_TEXT_PROPERTY(setProp, ivar, type)    \
    -(void)set##setProp : (type)value;                      \
    {                                                       \
        ivar = value;                                       \
        [self dirtyText];                                   \
    }

NATIVE_RENDER_TEXT_PROPERTY(AdjustsFontSizeToFit, _adjustsFontSizeToFit, BOOL)
NATIVE_RENDER_TEXT_PROPERTY(Color, _color, UIColor *)
NATIVE_RENDER_TEXT_PROPERTY(FontFamily, _fontFamily, NSString *)
NATIVE_RENDER_TEXT_PROPERTY(FontSize, _fontSize, CGFloat)
NATIVE_RENDER_TEXT_PROPERTY(FontWeight, _fontWeight, NSString *)
NATIVE_RENDER_TEXT_PROPERTY(FontStyle, _fontStyle, NSString *)
NATIVE_RENDER_TEXT_PROPERTY(FontVariant, _fontVariant, NSArray *)
NATIVE_RENDER_TEXT_PROPERTY(IsHighlighted, _isHighlighted, BOOL)
NATIVE_RENDER_TEXT_PROPERTY(LetterSpacing, _letterSpacing, CGFloat)
NATIVE_RENDER_TEXT_PROPERTY(LineHeight, _lineHeight, CGFloat)
NATIVE_RENDER_TEXT_PROPERTY(LineHeightMultiple, _lineHeightMultiple, CGFloat)
NATIVE_RENDER_TEXT_PROPERTY(NumberOfLines, _numberOfLines, NSUInteger)
NATIVE_RENDER_TEXT_PROPERTY(EllipsizeMode, _ellipsizeMode, NSLineBreakMode)
NATIVE_RENDER_TEXT_PROPERTY(TextDecorationColor, _textDecorationColor, UIColor *);
NATIVE_RENDER_TEXT_PROPERTY(TextDecorationLine, _textDecorationLine, NativeRenderTextDecorationLineType);
NATIVE_RENDER_TEXT_PROPERTY(TextDecorationStyle, _textDecorationStyle, NSUnderlineStyle);
NATIVE_RENDER_TEXT_PROPERTY(Opacity, _opacity, CGFloat)
NATIVE_RENDER_TEXT_PROPERTY(TextShadowOffset, _textShadowOffset, CGSize);
NATIVE_RENDER_TEXT_PROPERTY(TextShadowRadius, _textShadowRadius, CGFloat);
NATIVE_RENDER_TEXT_PROPERTY(TextShadowColor, _textShadowColor, UIColor *);

- (void)setLineSpacingMultiplier:(CGFloat)lineSpacingMultiplier {
    _lineHeightMultiple = lineSpacingMultiplier;
    [self dirtyText];
}

- (CGFloat)lineSpacingMultiplier {
    return _lineHeightMultiple;
}

- (void)setTextAlign:(NSTextAlignment)textAlign {
    _textAlign = textAlign;
    [self dirtyText];
}

- (void)setDomManager:(std::weak_ptr<hippy::DomManager>)domManager {
    [super setDomManager:domManager];
    auto shared_domNode = domManager.lock();
    if (shared_domNode) {
        int32_t componentTag = [self.componentTag intValue];
        auto node = shared_domNode->GetNode(self.rootNode, componentTag);
        if (node) {
            __weak NativeRenderObjectText *weakSelf = self;
            hippy::MeasureFunction measureFunc =
                [weakSelf](float width, hippy::LayoutMeasureMode widthMeasureMode,
                                     float height, hippy::LayoutMeasureMode heightMeasureMode, void *layoutContext){
                    @autoreleasepool {
                        return textMeasureFunc(weakSelf, width, widthMeasureMode,
                                               height, heightMeasureMode, layoutContext);
                    }
            };
            node->GetLayoutNode()->SetMeasureFunction(measureFunc);
        }
    }
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

- (void)setText:(NSString *)text {
    double version = UIDevice.currentDevice.systemVersion.doubleValue;
    if (version >= 10.0 && version < 12.0) {
        text = [text stringByReplacingOccurrencesOfString:@"జ్ఞ‌ా" withString:@" "];
    }
    if (_text != text && ![_text isEqualToString:text]) {
        _text = [text copy];
        [self dirtyText];
    }
}

- (void)setAllowFontScaling:(BOOL)allowFontScaling {
    _allowFontScaling = allowFontScaling;
    for (NativeRenderObjectView *child in [self subcomponents]) {
        if ([child isKindOfClass:[NativeRenderObjectText class]]) {
            ((NativeRenderObjectText *)child).allowFontScaling = allowFontScaling;
        }
    }
    [self dirtyText];
}

- (void)setFontSizeMultiplier:(CGFloat)fontSizeMultiplier {
    _fontSizeMultiplier = fontSizeMultiplier;
    if (_fontSizeMultiplier == 0) {
        HPLogError(@"fontSizeMultiplier value must be > zero.");
        _fontSizeMultiplier = 1.0;
    }
    for (NativeRenderObjectView *child in [self subcomponents]) {
        if ([child isKindOfClass:[NativeRenderObjectText class]]) {
            ((NativeRenderObjectText *)child).fontSizeMultiplier = fontSizeMultiplier;
        }
    }
    [self dirtyText];
}

- (void)setMinimumFontScale:(CGFloat)minimumFontScale {
    if (minimumFontScale >= 0.01) {
        _minimumFontScale = minimumFontScale;
    }
    [self dirtyText];
}

- (void)insertNativeRenderSubview:(NativeRenderObjectView *)subview atIndex:(NSInteger)atIndex {
    [super insertNativeRenderSubview:subview atIndex:atIndex];
    auto domManager = [self domManager].lock();
    if (domManager) {
        int32_t componentTag = [self.componentTag intValue];
        auto node = domManager->GetNode(self.rootNode, componentTag);
        __weak NativeRenderObjectText *weakSelf = self;
        hippy::MeasureFunction measureFunc =
            [weakSelf](float width, hippy::LayoutMeasureMode widthMeasureMode,
                                 float height, hippy::LayoutMeasureMode heightMeasureMode, void *layoutContext){
                @autoreleasepool {
                    return textMeasureFunc(weakSelf, width, widthMeasureMode,
                                           height, heightMeasureMode, layoutContext);
                }
        };
        node->GetLayoutNode()->SetMeasureFunction(measureFunc);
    }
}

@end
