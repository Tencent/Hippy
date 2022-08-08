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

#import "NativeRenderText.h"
#import "NativeRenderObjectText.h"
#import "NativeRenderUtils.h"
#import "UIView+NativeRender.h"
#import "NativeRenderLog.h"

static void collectNonTextDescendants(NativeRenderText *view, NSMutableArray *nonTextDescendants) {
    for (UIView *child in view.nativeRenderSubviews) {
        if ([child isKindOfClass:[NativeRenderText class]]) {
            collectNonTextDescendants((NativeRenderText *)child, nonTextDescendants);
        } else {
            [nonTextDescendants addObject:child];
        }
    }
}

@implementation NativeRenderText

- (instancetype)initWithFrame:(CGRect)frame {
    if ((self = [super initWithFrame:frame])) {
        self.isAccessibilityElement = YES;
        self.accessibilityTraits |= UIAccessibilityTraitStaticText;

        self.opaque = NO;
        self.contentMode = UIViewContentModeRedraw;
    }
    return self;
}

- (NSString *)description {
    NSString *superDescription = super.description;
    NSRange semicolonRange = [superDescription rangeOfString:@";"];
    NSString *replacement = [NSString stringWithFormat:@"; componentTag: %@; text: %@", self.componentTag, self.textStorage.string];
    return [superDescription stringByReplacingCharactersInRange:semicolonRange withString:replacement];
}

- (void)nativeRenderSetFrame:(CGRect)frame {
    // Text looks super weird if its frame is animated.
    // This disables the frame animation, without affecting opacity, etc.
    [UIView performWithoutAnimation:^{
        [super nativeRenderSetFrame:frame];
    }];
}

- (void)removeNativeRenderSubview:(UIView *)subview {
    if ([[self nativeRenderSubviews] containsObject:subview]) {
        [super removeNativeRenderSubview:subview];
    }
    else {
        NSArray<UIView *> *hippySubviews = [self nativeRenderSubviews];
        for (UIView *hippySubview in hippySubviews) {
            [hippySubview removeNativeRenderSubview:subview];
        }
    }
}

- (BOOL)canBeRetrievedFromViewCache {
    return NO;
}

- (void)nativeRenderSetInheritedBackgroundColor:(__unused UIColor *)inheritedBackgroundColor {
    // mttrn:
    //	UIColor *backgroundColor = [self rightBackgroundColorOfTheme];
    //
    //	if (backgroundColor) {
    //		self.backgroundColor = backgroundColor;
    //	} else
    //  	self.backgroundColor = inheritedBackgroundColor;
}

- (void)didUpdateNativeRenderSubviews {
    // Do nothing, as subviews are managed by `setTextStorage:` method
}

// mttrn:
- (void)setTextStorage:(NSTextStorage *)textStorage {
    if (_textStorage != textStorage) {
        _textStorage = textStorage;

        // Update subviews
        NSMutableArray *nonTextDescendants = [NSMutableArray new];
        collectNonTextDescendants(self, nonTextDescendants);
        NSArray *subviews = self.subviews;
        if (![subviews isEqualToArray:nonTextDescendants]) {
            for (UIView *child in subviews) {
                if (![nonTextDescendants containsObject:child]) {
                    [child removeFromSuperview];
                }
            }
            for (UIView *child in nonTextDescendants) {
                [self addSubview:child];
            }
        }

        [self setNeedsDisplay];
    }
}

- (void)drawRect:(__unused CGRect)rect {
    if (!_textStorage) {
        return;
    }

    NSLayoutManager *layoutManager = [_textStorage.layoutManagers firstObject];
    NSTextContainer *textContainer = [layoutManager.textContainers firstObject];

    NSRange glyphRange = [layoutManager glyphRangeForTextContainer:textContainer];
    CGRect textFrame = self.textFrame;
    [layoutManager drawBackgroundForGlyphRange:glyphRange atPoint:textFrame.origin];
    [layoutManager drawGlyphsForGlyphRange:glyphRange atPoint:textFrame.origin];

    __block UIBezierPath *highlightPath = nil;
    NSRange characterRange = [layoutManager characterRangeForGlyphRange:glyphRange actualGlyphRange:NULL];
    [layoutManager.textStorage enumerateAttribute:NativeRenderIsHighlightedAttributeName inRange:characterRange options:0 usingBlock:^(
        NSNumber *value, NSRange range, __unused BOOL *_) {
        if (!value.boolValue) {
            return;
        }

        [layoutManager enumerateEnclosingRectsForGlyphRange:range withinSelectedGlyphRange:range inTextContainer:textContainer
                                                 usingBlock:^(CGRect enclosingRect, __unused BOOL *__) {
                                                     UIBezierPath *path = [UIBezierPath bezierPathWithRoundedRect:CGRectInset(enclosingRect, -2, -2)
                                                                                                     cornerRadius:2];
                                                     if (highlightPath) {
                                                         [highlightPath appendPath:path];
                                                     } else {
                                                         highlightPath = path;
                                                     }
                                                 }];
    }];

    if (highlightPath) {
        if (!_highlightLayer) {
            _highlightLayer = [CAShapeLayer layer];
            _highlightLayer.fillColor = [UIColor colorWithWhite:0 alpha:0.25].CGColor;
            [self.layer addSublayer:_highlightLayer];
        }
        _highlightLayer.position = (CGPoint) { _contentInset.left, _contentInset.top };
        _highlightLayer.path = highlightPath.CGPath;
    } else {
        [_highlightLayer removeFromSuperlayer];
        _highlightLayer = nil;
    }
}

- (NSNumber *)componentTagAtPoint:(CGPoint)point {
    NSNumber *componentTag = self.componentTag;

    CGFloat fraction;
    NSLayoutManager *layoutManager = _textStorage.layoutManagers.firstObject;
    NSTextContainer *textContainer = layoutManager.textContainers.firstObject;
    NSUInteger characterIndex = [layoutManager characterIndexForPoint:point inTextContainer:textContainer
                             fractionOfDistanceBetweenInsertionPoints:&fraction];

    // If the point is not before (fraction == 0.0) the first character and not
    // after (fraction == 1.0) the last character, then the attribute is valid.
    if (_textStorage.length > 0 && (fraction > 0 || characterIndex > 0) && (fraction < 1 || characterIndex < _textStorage.length - 1)) {
        componentTag = [_textStorage attribute:NativeRenderComponentTagAttributeName atIndex:characterIndex effectiveRange:NULL];
    }
    return componentTag;
}

- (void)setBorderColor:(CGColorRef)color {
    if (CGColorEqualToColor(_borderColor, color)) {
        return;
    }

    CGColorRelease(_borderColor);
    _borderColor = CGColorRetain(color);
    [self refreshBorderColor];
}

- (void)refreshBorderColor {
    if (_borderColor) {
        self.layer.borderColor = _borderColor;
    }
}

- (void)didMoveToWindow {
    [super didMoveToWindow];

    if (!self.window) {
        self.layer.contents = nil;
        if (_highlightLayer) {
            [_highlightLayer removeFromSuperlayer];
            _highlightLayer = nil;
        }
    } else if (_textStorage.length) {
        [self setNeedsDisplay];
    }
}

- (void)dealloc {
    CGColorRelease(_borderColor);
}

#pragma mark - Accessibility

- (NSString *)accessibilityLabel {
    return _textStorage.string;
}

- (void)setBackgroundImageUrl:(NSString *)backgroundImageUrl {
    NativeRenderLogWarn(@"Warning: backgroundImage is not available in NativeRenderText.");
}

@end
