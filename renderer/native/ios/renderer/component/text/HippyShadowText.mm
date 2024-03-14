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

#import "HippyConvert.h"
#import "HippyI18nUtils.h"
#import "HippyUtils.h"
#import "HippyFont.h"
#import "HippyShadowText.h"
#import "HippyShadowView+Internal.h"
#import "HippyText.h"
#import "HippyTextView.h"
#import "HippyRenderUtils.h"

#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#include "dom/layout_node.h"


// Text Attachment use this key to ref shadow view, HippyShadowView value
NSAttributedStringKey const HippyShadowViewAttributeName = @"HippyShadowViewAttributeName";
// Highlighted or not
NSAttributedStringKey const HippyIsHighlightedAttributeName = @"IsHighlightedAttributeName";
// Hippy Tag Key
NSAttributedStringKey const HippyTagAttributeName = @"HippyTagAttributeName";
// VerticalAlign of Text or nested Text, NSNumber value
NSAttributedStringKey const HippyTextVerticalAlignAttributeName = @"HippyTextVerticalAlignAttributeName";
// Distance to the bottom of the baseline, for text attachment baseline layout, NSNumber value
NSAttributedStringKey const HippyVerticalAlignBaselineOffsetAttributeName = @"HippyVerticalAlignBaselineOffsetAttributeName";


CGFloat const HippyTextAutoSizeWidthErrorMargin = 0.05;
CGFloat const HippyTextAutoSizeHeightErrorMargin = 0.025;
CGFloat const HippyTextAutoSizeGranularity = 0.001;
static const CGFloat gDefaultFontSize = 14.0;

static BOOL DirtyTextEqual(BOOL v1, BOOL v2) {
    return v1 == v2;
}

static BOOL DirtyTextEqual(NSInteger v1, NSInteger v2) {
    return v1 == v2;
}

static BOOL DirtyTextEqual(NSUInteger v1, NSUInteger v2) {
    return v1 == v2;
}

static BOOL DirtyTextEqual(CGFloat v1, CGFloat v2) {
    return fabs(v1 - v2) < CGFLOAT_EPSILON;
}

static BOOL DirtyTextEqual(CGSize v1, CGSize v2) {
    return CGSizeEqualToSize(v1, v2);
}

static BOOL DirtyTextEqual(NSObject *v1, NSObject *v2) {
    return [v1 isEqual:v2];
}

#pragma mark - HippyAttributedStringStyleInfo

@implementation HippyAttributedStringStyleInfo

@end


#pragma mark - HippyShadowText

@interface HippyShadowText () <NSLayoutManagerDelegate>
{
    BOOL _isNestedText; // Indicates whether Text is nested, for speeding up typesetting calculations
    BOOL _needRelayoutText; // special styles require two layouts, eg. verticalAlign etc
}

@end


@implementation HippyShadowText

hippy::LayoutSize textMeasureFunc(
    HippyShadowText *weakShadowText, float width,hippy::LayoutMeasureMode widthMeasureMode,
                                 float height, hippy::LayoutMeasureMode heightMeasureMode, void *layoutContext) {
    hippy::LayoutSize retSize;
    HippyShadowText *strongShadowText = weakShadowText;
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
                if (nil != (id)kernValue) {
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
        _cachedTextStorageWidthMode = hippy::LayoutMeasureMode::Undefined;
        _fontSizeMultiplier = 1.0;
        _lineHeightMultiple = 1.0f;
        _textAlign = NSTextAlignmentLeft;
        if (NSWritingDirectionRightToLeft ==  [[HippyI18nUtils sharedInstance] writingDirectionForCurrentAppLanguage]) {
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
    [self dirtyText:YES];
}

- (NSDictionary<NSString *, id> *)processUpdatedProperties:(NSMutableSet<NativeRenderApplierBlock> *)applierBlocks
                                          parentProperties:(NSDictionary<NSString *, id> *)parentProperties {
    if ([[self parent] isKindOfClass:[HippyShadowText class]]) {
        return parentProperties;
    }

//    parentProperties = [super processUpdatedProperties:applierBlocks parentProperties:parentProperties];

    UIEdgeInsets padding = self.paddingAsInsets;
    CGFloat width = self.frame.size.width - (padding.left + padding.right);

    NSNumber *parentTag = [[self parent] hippyTag];
    // MTTlayout
    NSTextStorage *textStorage = [self buildTextStorageForWidth:width widthMode:hippy::LayoutMeasureMode::Exactly];
    CGRect textFrame = [self calculateTextFrame:textStorage];
    UIColor *color = self.color ?: [UIColor blackColor];
    [applierBlocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry, UIView * _Nullable lazyCreatedView) {
        HippyText *view = (HippyText *)(lazyCreatedView ?: viewRegistry[self.hippyTag]);
        if (!view) { return; }
        if (![view isKindOfClass:HippyText.class]) {
            // Going here indicates that there is a repeated refresh,
            // Check the refresh logic to eliminate duplicates.
            HippyLogError(@"Invalid View Type, Please Check!");
            return;
        }
        view.textFrame = textFrame;
        view.textStorage = textStorage;
        view.textColor = color;
        /**
         * NOTE: this logic is included to support rich text editing inside multiline
         * `<TextInput>` controls. It is required in order to ensure that the
         * textStorage (aka attributed string) is copied over from the HippyShadowText
         * to the HippyText view in time to be used to update the editable text content.
         * TODO: we should establish a delegate relationship betweeen NativeRenderTextView
         * and its contaned HippyText element when they get inserted and get rid of this
         */
        UIView *parentView = viewRegistry[parentTag];
        if ([parentView respondsToSelector:@selector(performTextUpdate)]) {
            [(HippyTextView *)parentView performTextUpdate];
        }
    }];
    return parentProperties;
}

- (void)amendLayoutBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)blocks {
    @try {
        UIEdgeInsets padding = self.paddingAsInsets;
        CGFloat width = self.frame.size.width - (padding.left + padding.right);
        NSTextStorage *textStorage = [self buildTextStorageForWidth:width widthMode:hippy::LayoutMeasureMode::Exactly];
        CGRect textFrame = [self calculateTextFrame:textStorage];
        
        NSLayoutManager *layoutManager = textStorage.layoutManagers.firstObject;
        NSTextContainer *textContainer = layoutManager.textContainers.firstObject;
        NSRange glyphRange = [layoutManager glyphRangeForTextContainer:textContainer];
        NSRange characterRange = [layoutManager characterRangeForGlyphRange:glyphRange actualGlyphRange:NULL];
        [textStorage enumerateAttribute:HippyShadowViewAttributeName inRange:characterRange options:0 usingBlock:^(
            HippyShadowView *child, NSRange range, __unused BOOL *_) {
            if (child) {
                float width = child.width, height = child.height;
                if (isnan(width) || isnan(height)) {
                    HippyLogError(@"Views nested within a <Text> must have a width and height");
                }
                
                // Use line fragment's rect instead of glyph rect for calculation,
                // since we have changed the baselineOffset.
                CGRect lineRect = [layoutManager lineFragmentRectForGlyphAtIndex:range.location
                                                                  effectiveRange:nil
                                                         withoutAdditionalLayout:YES];
                CGPoint location = [layoutManager locationForGlyphAtIndex:range.location];
                CGFloat roundedHeight = HippyRoundPixelValue(height);
                CGFloat roundedWidth = HippyRoundPixelValue(width);
                
                // take margin into account
                // FIXME: margin currently not working, may have some bug in layout process
                float left = 0;
                float top = 0;
                float marginV = child.nodeLayoutResult.marginTop + child.nodeLayoutResult.marginBottom;
                CGFloat roundedHeightWithMargin = HippyRoundPixelValue(height + marginV);
                
                CGFloat positionY = .0f;
                NSNumber *verticalAlignType = [textStorage attribute:HippyTextVerticalAlignAttributeName
                                                             atIndex:range.location effectiveRange:nil];
                switch (verticalAlignType.integerValue) {
                    case HippyTextVerticalAlignBottom: {
                        positionY = CGRectGetMaxY(lineRect) - roundedHeightWithMargin;
                        break;
                    }
                    case HippyTextVerticalAlignUndefined:
                    case HippyTextVerticalAlignBaseline: {
                        // get baseline-bottom distance from HippyVerticalAlignBaselineOffsetAttributeName
                        NSNumber *baselineToBottom = [textStorage attribute:HippyVerticalAlignBaselineOffsetAttributeName
                                                                    atIndex:range.location effectiveRange:nullptr];
                        positionY = CGRectGetMaxY(lineRect) - roundedHeightWithMargin - baselineToBottom.doubleValue;
                        break;
                    }
                    case HippyTextVerticalAlignTop: {
                        positionY = CGRectGetMinY(lineRect);
                        break;
                    }
                    case HippyTextVerticalAlignMiddle: {
                        positionY = CGRectGetMinY(lineRect) +
                        (CGRectGetHeight(lineRect) - roundedHeightWithMargin) / 2.0f - child.verticalAlignOffset;
                        break;
                    }
                    default:
                        break;
                }
                
                CGRect childFrameToSet = CGRectMake(textFrame.origin.x + location.x + left,
                                                    textFrame.origin.y + positionY + top,
                                                    roundedWidth, roundedHeight);
                CGRect childFrame = child.frame;
                if (!HippyCGRectNearlyEqual(childFrame, childFrameToSet)) {
                    [child setLayoutFrame:childFrameToSet dirtyPropagation:NO];
                }
            }
        }];
        
        // Nested <Text> inside <Text> should not call amendLayoutBeforeMount again,
        // so only call amendXxx when subcomponent is not a <Text>.
        if (NativeRenderUpdateLifecycleComputed != _propagationLifecycle) {
            _propagationLifecycle = NativeRenderUpdateLifecycleComputed;
            for (HippyShadowView *shadowView in self.subcomponents) {
                if (![shadowView isKindOfClass:HippyShadowText.class]) {
                    [shadowView amendLayoutBeforeMount:blocks];
                }
            }
        }
    } @catch (NSException *exception) {
        HippyLogError(@"Exception while doing %s: %@, %@", __func__, exception.description, self);
    }
    [self processUpdatedProperties:blocks parentProperties:nil];
}

- (void)applyConfirmedLayoutDirectionToSubviews:(hippy::Direction)confirmedLayoutDirection {
    if (DirtyTextEqual((NSInteger)self.confirmedLayoutDirection, (NSInteger)confirmedLayoutDirection)) {
        return;
    }
    [super applyConfirmedLayoutDirectionToSubviews:confirmedLayoutDirection];
    [self dirtyText:YES];
}

- (NSTextStorage *)buildTextStorageForWidth:(CGFloat)width widthMode:(hippy::LayoutMeasureMode)widthMode {
    if (isnan(width)) {
        width = 0;
    }

    if (_cachedTextStorage && width == _cachedTextStorageWidth && widthMode == _cachedTextStorageWidthMode) {
        return _cachedTextStorage;
    }

    // textContainer
    NSTextContainer *textContainer = [NSTextContainer new];
    textContainer.lineFragmentPadding = 0.0;

    if (_numberOfLines > 0) {
        textContainer.lineBreakMode = _ellipsizeMode;
    } else {
        textContainer.lineBreakMode = NSLineBreakByClipping;
    }

    textContainer.maximumNumberOfLines = _numberOfLines;
    textContainer.size = (CGSize) { widthMode == hippy::LayoutMeasureMode::Undefined ? CGFLOAT_MAX : width, CGFLOAT_MAX };
    
    // layoutManager && textStorage
    NSLayoutManager *layoutManager = [NSLayoutManager new];
    NSTextStorage *textStorage = [[NSTextStorage alloc] initWithAttributedString:self.attributedString];
    [textStorage addLayoutManager:layoutManager];
    
    layoutManager.delegate = self;
    [layoutManager addTextContainer:textContainer];
    [layoutManager ensureLayoutForTextContainer:textContainer];
    
    // for better perf, only do relayout when MeasureMode is MeasureModeExactly
    if (_needRelayoutText && hippy::LayoutMeasureMode::Exactly == widthMode) {
        // relayout text
        [layoutManager invalidateLayoutForCharacterRange:NSMakeRange(0, textStorage.length) actualCharacterRange:nil];
        [layoutManager removeTextContainerAtIndex:0];
        [layoutManager addTextContainer:textContainer];
        [layoutManager ensureLayoutForTextContainer:textContainer];
        _needRelayoutText = NO;
    }

    if (_autoLetterSpacing) {
        resetFontAttribute(textStorage);
        _cachedAttributedString = [[NSAttributedString alloc] initWithAttributedString:textStorage];
    }

    _cachedTextStorageWidth = width;
    _cachedTextStorageWidthMode = widthMode;
    _cachedTextStorage = textStorage;

    return textStorage;
}

- (void)dirtyText:(BOOL)needToDoLayout {
    [super dirtyText:needToDoLayout];
    _isTextDirty = YES;
    _cachedTextStorage = nil;
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
        }
        else {
            std::vector<std::function<void()>> ops = {domNodeAction};
            domManager->PostTask(hippy::dom::Scene(std::move(ops)));
        }
    }
}

- (BOOL)isTextDirty {
    return _isTextDirty;
}

- (void)recomputeText {
    [self attributedString];
    [self setTextComputed];
    [self dirtyPropagation:NativeRenderUpdateLifecycleAllDirtied];
}

#pragma mark - AttributeString

- (NSAttributedString *)attributedString {
    HippyAttributedStringStyleInfo *info = [HippyAttributedStringStyleInfo new];
    info.foregroundColor = self.color ?: [UIColor blackColor];
    info.backgroundColor = self.backgroundColor;
    info.opacity = self.opacity;
    info.isNestedText = self.subcomponents.count > 0;
    _isNestedText = info.isNestedText;
    return [self _attributedStringWithStyleInfo:info];
}

- (NSAttributedString *)_attributedStringWithStyleInfo:(HippyAttributedStringStyleInfo *)styleInfo {
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
        styleInfo.fontSize = @(_fontSize);
    }
    else if (nil == (id)styleInfo.fontSize) {
        //default font size is 14
        styleInfo.fontSize = @(gDefaultFontSize);
    }
    if (_fontWeight) {
        styleInfo.fontWeight = _fontWeight;
    }
    if (_fontStyle) {
        styleInfo.fontStyle = _fontStyle;
    }
    if (_fontFamily) {
        styleInfo.fontFamily = _fontFamily;
    }
    if (!isnan(_letterSpacing)) {
        styleInfo.letterSpacing = @(_letterSpacing);
    }

    _effectiveLetterSpacing = styleInfo.letterSpacing.doubleValue;

    UIFont *f = nil;
    if (styleInfo.fontFamily) {
        f = [UIFont fontWithName:styleInfo.fontFamily size:[styleInfo.fontSize floatValue]];
    }

    UIFont *font = [HippyFont updateFont:f
                                     withFamily:styleInfo.fontFamily
                                           size:styleInfo.fontSize
                                         weight:styleInfo.fontWeight
                                          style:styleInfo.fontStyle
                                        variant:_fontVariant
                                scaleMultiplier:_allowFontScaling ? _fontSizeMultiplier : 1.0];

    CGFloat heightOfTallestSubview = 0.0;
    NSMutableAttributedString *attributedString = [[NSMutableAttributedString alloc] initWithString:self.text ?: @""];
    for (HippyShadowView *child in [self subcomponents]) {
        if ([child isKindOfClass:[HippyShadowText class]]) {
            HippyShadowText *shadowText = (HippyShadowText *)child;
            HippyAttributedStringStyleInfo *childInfo = [HippyAttributedStringStyleInfo new];
            childInfo.fontFamily = styleInfo.fontFamily;
            childInfo.fontSize = styleInfo.fontSize;
            childInfo.fontWeight = styleInfo.fontWeight;
            childInfo.fontStyle = styleInfo.fontStyle;
            childInfo.letterSpacing = styleInfo.letterSpacing;
            childInfo.useBackgroundColor = YES;
            childInfo.foregroundColor = [shadowText color] ?: styleInfo.foregroundColor;
            childInfo.backgroundColor = shadowText.backgroundColor ?: styleInfo.backgroundColor;
            childInfo.opacity = styleInfo.opacity * shadowText.opacity;
            childInfo.isNestedText = styleInfo.isNestedText;
            NSAttributedString *subStr = [shadowText _attributedStringWithStyleInfo:childInfo];
            [attributedString appendAttributedString:subStr];
            [child setTextComputed];
        } else {
            float width = 0, height = 0;
            auto domManager = [child domManager].lock();
            if (domManager) {
                int32_t componentTag = [child.hippyTag intValue];
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
                HippyLogError(@"Views nested within a <Text> must have a width and height");
            }
            // take margin into account
            // FIXME: margin not working, may have bug in layout process
            float marginH = child.nodeLayoutResult.marginLeft + child.nodeLayoutResult.marginRight;
            float marginV = child.nodeLayoutResult.marginTop + child.nodeLayoutResult.marginBottom;
            width += marginH;
            height += marginV;
            
            // create text attachment and append to attachmentString
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
            [attachmentString addAttribute:NSFontAttributeName
                                     value:[UIFont systemFontOfSize:0]
                                     range:(NSRange) { 0, attachmentString.length }];
            [attachmentString addAttribute:HippyShadowViewAttributeName
                                     value:child
                                     range:(NSRange) { 0, attachmentString.length }];
            if (HippyTextVerticalAlignUndefined != child.verticalAlignType) {
                [attachmentString addAttribute:HippyTextVerticalAlignAttributeName
                                         value:@(child.verticalAlignType)
                                         range:(NSRange) { 0, attachmentString.length }];
            }
            [attributedString appendAttributedString:attachmentString];
            if (height > heightOfTallestSubview) {
                heightOfTallestSubview = height;
            }
            // Don't call setTextComputed on this child. HippyTextManager takes care of
            // processing inline UIViews.
        }
    }

    [self _addAttribute:NSForegroundColorAttributeName
              withValue:[styleInfo.foregroundColor
                         colorWithAlphaComponent:CGColorGetAlpha(styleInfo.foregroundColor.CGColor) * styleInfo.opacity]
     toAttributedString:attributedString];

    if (_isHighlighted) {
        [self _addAttribute:HippyIsHighlightedAttributeName withValue:@YES toAttributedString:attributedString];
    }
    if (styleInfo.useBackgroundColor && styleInfo.backgroundColor) {
        [self _addAttribute:NSBackgroundColorAttributeName
                  withValue:[styleInfo.backgroundColor
                             colorWithAlphaComponent:CGColorGetAlpha(styleInfo.backgroundColor.CGColor) * styleInfo.opacity]
         toAttributedString:attributedString];
    }

    [self _addAttribute:NSFontAttributeName withValue:font toAttributedString:attributedString];
    [self _addAttribute:NSKernAttributeName withValue:styleInfo.letterSpacing toAttributedString:attributedString];
    [self _addAttribute:HippyTagAttributeName withValue:self.hippyTag toAttributedString:attributedString];
    if (HippyTextVerticalAlignUndefined != self.verticalAlignType) {
        [self _addAttribute:HippyTextVerticalAlignAttributeName
                  withValue:@(self.verticalAlignType)
         toAttributedString:attributedString];
    }
    [self _setParagraphStyleOnAttributedString:attributedString
                                fontLineHeight:font.lineHeight
                        heightOfTallestSubview:heightOfTallestSubview
                                  isNestedText:styleInfo.isNestedText];
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
    _isTextDirty = NO;
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
                      heightOfTallestSubview:(CGFloat)heightOfTallestSubview
                                isNestedText:(BOOL)isNestedText {
    NSTextStorage *textStorage = [[NSTextStorage alloc] initWithAttributedString:attributedString];
    BOOL hasSetLineHeight = NO;
    if (fabs(self.lineHeight - 0) < DBL_EPSILON) {
        // If no fixed lineHeight is set, fontLineHeight is used.
        self.lineHeight = fontLineHeight;
    } else if (!self.adjustsFontSizeToFit) {
        // Only when adjustsFontSizeToFit is not set, the fixed lineHeight can be used.
        hasSetLineHeight = YES;
    }
    
    // check if we have lineHeight set on self
    __block BOOL hasParagraphStyle = NO;
    if (hasSetLineHeight || _textAlignSet || 1.0 != _lineHeightMultiple) {
        hasParagraphStyle = YES;
    }

    __block float newLineHeight = _lineHeight ?: 0.0;
    CGFloat fontSizeMultiplier = _allowFontScaling ? _fontSizeMultiplier : 1.0;

    // check for lineHeight on each of our children, update the max as we go (in self.lineHeight)
    [attributedString enumerateAttribute:NSParagraphStyleAttributeName
                                 inRange:NSMakeRange(0, attributedString.length)
                                 options:kNilOptions
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

    __block CGFloat maximumFontLineHeight = 0.0;
    [textStorage enumerateAttribute:NSFontAttributeName
                            inRange:NSMakeRange(0, attributedString.length)
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
        paragraphStyle.maximumLineHeight = hasSetLineHeight ? self.lineHeight : maxHeight;
        [attributedString addAttribute:NSParagraphStyleAttributeName
                                 value:paragraphStyle
                                 range:(NSRange) { 0, attributedString.length }];

        /**
         * for keeping text vertical center, we need to set baseline offset
         * Note: baseline offset adjustment of text with attachment or nested Text
         * is in NSLayoutManagerDelegate's imp
         */
        if (!isNestedText && (lineHeight > fontLineHeight)
            && HippyTextVerticalAlignUndefined == self.verticalAlignType) {
            CGFloat baselineOffset = (newLineHeight - maximumFontLineHeight) / 2.0f;
            if (baselineOffset > .0f) {
                [attributedString addAttribute:NSBaselineOffsetAttributeName
                                         value:@(baselineOffset)
                                         range:NSMakeRange(0, attributedString.length)];
            }
        }
    }
    
    // Text decoration
    if (_textDecorationLine == HippyTextDecorationLineTypeUnderline ||
        _textDecorationLine == HippyTextDecorationLineTypeUnderlineStrikethrough) {
        [self _addAttribute:NSUnderlineStyleAttributeName withValue:@(_textDecorationStyle) toAttributedString:attributedString];
    }
    if (_textDecorationLine == HippyTextDecorationLineTypeStrikethrough ||
        _textDecorationLine == HippyTextDecorationLineTypeUnderlineStrikethrough) {
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
    if (_needDirtyText) {
        [self dirtyText:NO];
        _needDirtyText =NO;
    }
}

#pragma mark - Autosizing

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
    frame.origin.y = self.paddingAsInsets.top + HippyRoundPixelValue((CGRectGetHeight(frame) - requiredSize.height) / 2.0f);
    return frame;
}

- (CGSize)calculateOptimumScaleInFrame:(CGRect)frame
                            forStorage:(NSTextStorage *)textStorage
                              minScale:(CGFloat)minScale
                              maxScale:(CGFloat)maxScale
                               prevMid:(CGFloat)prevMid {
    CGFloat midScale = (minScale + maxScale) / 2.0f;
    if (round((prevMid / HippyTextAutoSizeGranularity)) == round((midScale / HippyTextAutoSizeGranularity))) {
        // Bail because we can't meet error margin.
        return [self calculateSize:textStorage];
    } else {
        HippySizeComparison comparison = [self attemptScale:midScale inStorage:textStorage forFrame:frame];
        if (comparison == HippySizeWithinRange) {
            return [self calculateSize:textStorage];
        } else if (comparison == HippySizeTooLarge) {
            return [self calculateOptimumScaleInFrame:frame forStorage:textStorage minScale:minScale maxScale:midScale - HippyTextAutoSizeGranularity
                                              prevMid:midScale];
        } else {
            return [self calculateOptimumScaleInFrame:frame forStorage:textStorage minScale:midScale + HippyTextAutoSizeGranularity maxScale:maxScale
                                              prevMid:midScale];
        }
    }
}

- (HippySizeComparison)attemptScale:(CGFloat)scale inStorage:(NSTextStorage *)textStorage forFrame:(CGRect)frame {
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
        if ((requiredSize.width + (CGRectGetWidth(frame) * HippyTextAutoSizeWidthErrorMargin)) > CGRectGetWidth(frame)
            && (requiredSize.height + (CGRectGetHeight(frame) * HippyTextAutoSizeHeightErrorMargin)) > CGRectGetHeight(frame)) {
            return HippySizeWithinRange;
        } else {
            return HippySizeTooSmall;
        }
    } else {
        return HippySizeTooLarge;
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
    if (DirtyTextEqual(self.backgroundColor, backgroundColor)) {
        return;
    }
    super.backgroundColor = backgroundColor;
}

#define NATIVE_RENDER_TEXT_PROPERTY(setProp, ivar, type)    \
    -(void)set##setProp : (type)value                       \
    {                                                       \
        if (DirtyTextEqual(ivar, value)) return;            \
        ivar = value;                                       \
        _needDirtyText = YES;                               \
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
NATIVE_RENDER_TEXT_PROPERTY(TextDecorationLine, _textDecorationLine, HippyTextDecorationLineType);
NATIVE_RENDER_TEXT_PROPERTY(TextDecorationStyle, _textDecorationStyle, NSUnderlineStyle);
NATIVE_RENDER_TEXT_PROPERTY(Opacity, _opacity, CGFloat)
NATIVE_RENDER_TEXT_PROPERTY(TextShadowOffset, _textShadowOffset, CGSize);
NATIVE_RENDER_TEXT_PROPERTY(TextShadowRadius, _textShadowRadius, CGFloat);
NATIVE_RENDER_TEXT_PROPERTY(TextShadowColor, _textShadowColor, UIColor *);

- (void)setLineSpacingMultiplier:(CGFloat)lineSpacingMultiplier {
    if (DirtyTextEqual(_lineHeightMultiple, lineSpacingMultiplier)) {
        return;
    }
    _lineHeightMultiple = lineSpacingMultiplier;
    _needDirtyText = YES;
}

- (CGFloat)lineSpacingMultiplier {
    return _lineHeightMultiple;
}

- (void)setDomManager:(std::weak_ptr<hippy::DomManager>)domManager {
    [super setDomManager:domManager];
    auto shared_domNode = domManager.lock();
    if (shared_domNode) {
        int32_t componentTag = [self.hippyTag intValue];
        auto node = shared_domNode->GetNode(self.rootNode, componentTag);
        if (node) {
            __weak HippyShadowText *weakSelf = self;
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
        _needDirtyText = YES;
    }
}

- (void)setAllowFontScaling:(BOOL)allowFontScaling {
    if (DirtyTextEqual(_allowFontScaling, allowFontScaling)) {
        return;
    }
    _allowFontScaling = allowFontScaling;
    for (HippyShadowView *child in [self subcomponents]) {
        if ([child isKindOfClass:[HippyShadowText class]]) {
            ((HippyShadowText *)child).allowFontScaling = allowFontScaling;
        }
    }
    _needDirtyText = YES;
}

- (void)setFontSizeMultiplier:(CGFloat)fontSizeMultiplier {
    if (DirtyTextEqual(_fontSizeMultiplier, fontSizeMultiplier)) {
        return;
    }
    _fontSizeMultiplier = fontSizeMultiplier;
    if (_fontSizeMultiplier == 0) {
        HippyLogError(@"fontSizeMultiplier value must be > zero.");
        _fontSizeMultiplier = 1.0;
    }
    for (HippyShadowView *child in [self subcomponents]) {
        if ([child isKindOfClass:[HippyShadowText class]]) {
            ((HippyShadowText *)child).fontSizeMultiplier = fontSizeMultiplier;
        }
    }
    [self dirtyText:NO];
}

- (void)setMinimumFontScale:(CGFloat)minimumFontScale {
    if (DirtyTextEqual(_minimumFontScale, minimumFontScale)) {
        return;
    }
    if (minimumFontScale >= 0.01) {
        _minimumFontScale = minimumFontScale;
    }
    _needDirtyText = YES;
}

- (void)didUpdateHippySubviews {
    [super didUpdateHippySubviews];
    auto domManager = [self domManager].lock();
    if (domManager) {
        int32_t componentTag = [self.hippyTag intValue];
        auto node = domManager->GetNode(self.rootNode, componentTag);
        if (node) {
            node->GetLayoutNode()->MarkDirty();
        }
    }
}


#pragma mark - NSLayoutManagerDelegate

- (BOOL)layoutManager:(NSLayoutManager *)layoutManager shouldSetLineFragmentRect:(inout CGRect *)lineFragmentRect
 lineFragmentUsedRect:(inout CGRect *)lineFragmentUsedRect baselineOffset:(inout CGFloat *)baselineOffset
      inTextContainer:(NSTextContainer *)textContainer forGlyphRange:(NSRange)glyphRange {
    NSTextStorage *textStorage = layoutManager.textStorage;
    if (_isNestedText || HippyTextVerticalAlignUndefined != self.verticalAlignType) {
        __block CGFloat maxAttachmentHeight = .0f;
        __block BOOL hasAttachment = NO;
        NSRange storageRange = [layoutManager characterRangeForGlyphRange:glyphRange actualGlyphRange:nil];
        [textStorage enumerateAttribute:NSAttachmentAttributeName
                                inRange:storageRange options:0
                             usingBlock:^(NSTextAttachment *attachment, NSRange range, __unused BOOL *_) {
            if (attachment) {
                float height = CGRectGetHeight(attachment.bounds);
                if (height > maxAttachmentHeight) {
                    maxAttachmentHeight = height;
                }
                hasAttachment = YES;
            }
        }];
        
        __block BOOL hasBaselineAlign = NO;
        [textStorage enumerateAttribute:HippyTextVerticalAlignAttributeName
                                inRange:storageRange options:0
                             usingBlock:^(NSNumber *type, NSRange range, BOOL * _Nonnull stop) {
            if (HippyTextVerticalAlignBaseline == type.integerValue ||
                HippyTextVerticalAlignUndefined == type.integerValue) {
                hasBaselineAlign = YES;
                *stop = YES;
            }
        }];
        
        // find the max font
        CGFloat realBaselineOffset = .0f;
        if (hasBaselineAlign) {
            __block UIFont *maxFont = nil;
            [textStorage enumerateAttribute:NSFontAttributeName
                                    inRange:storageRange options:0
                                 usingBlock:^(id  _Nullable value, NSRange range, BOOL * _Nonnull stop) {
                UIFont *currentFont = (UIFont *)value;
                if (currentFont) {
                    if (!maxFont || currentFont.pointSize > maxFont.pointSize) {
                        maxFont = currentFont;
                    }
                }
            }];
            // calculate the position of 'baseline' for later layout
            CGFloat textBaselineToBottom = abs(maxFont.descender) + abs(maxFont.leading);
            CGFloat maxTotalHeight = MAX((maxAttachmentHeight + textBaselineToBottom), maxFont.lineHeight);
            realBaselineOffset = (CGRectGetHeight(*lineFragmentUsedRect) - maxTotalHeight) / 2.f;
            if (hasAttachment) {
                [textStorage addAttribute:HippyVerticalAlignBaselineOffsetAttributeName
                                    value:@(realBaselineOffset + textBaselineToBottom)
                                    range:storageRange];
            }
        }
        
        [textStorage enumerateAttributesInRange:storageRange
                                        options:kNilOptions
                                     usingBlock:^(NSDictionary<NSAttributedStringKey,id> * _Nonnull attrs,
                                                  NSRange range, BOOL * _Nonnull stop) {
            NSNumber *verticalAlignValue = attrs[HippyTextVerticalAlignAttributeName];
            // Calculate position of text
            id offsetValue = [textStorage attribute:NSBaselineOffsetAttributeName
                                            atIndex:range.location effectiveRange:nil];
            if (!offsetValue) {
                CGFloat offset = .0f;
                CGFloat lineHeight = CGRectGetHeight(*lineFragmentUsedRect);
                CGFloat baselineToBottom = lineHeight - *baselineOffset;
                switch (verticalAlignValue.integerValue) {
                    case HippyTextVerticalAlignTop: {
                        UIFont *font = attrs[NSFontAttributeName];
                        offset = lineHeight - font.ascender - baselineToBottom;
                        break;
                    }
                    case HippyTextVerticalAlignMiddle: {
                        UIFont *font = attrs[NSFontAttributeName];
                        offset = (lineHeight - font.lineHeight) / 2.f - baselineToBottom
                        + abs(font.descender) + abs(font.leading) + self.verticalAlignOffset;
                        break;
                    }
                    case HippyTextVerticalAlignUndefined:
                    case HippyTextVerticalAlignBaseline: {
                        offset = realBaselineOffset;
                        break;
                    }
                    case HippyTextVerticalAlignBottom: {
                        UIFont *font = attrs[NSFontAttributeName];
                        offset = abs(font.descender) + abs(font.leading) - baselineToBottom;
                        break;
                    }
                    default:
                        break;
                }
                if (abs(offset) > .0f && !attrs[HippyShadowViewAttributeName]) {
                    // only set for Text
                    [textStorage addAttribute:NSBaselineOffsetAttributeName value:@(offset) range:range];
                    _needRelayoutText = YES;
                }
            }
        }];
    }
    return NO;
}


@end
