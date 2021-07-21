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

#import "HippyConvert.h"
#import "HippyLog.h"
#import "HippyUtils.h"
#import "UIView+Hippy.h"
#import "UIView+Private.h"

static NSString *const HippyBackgroundColorProp = @"backgroundColor";

typedef NS_ENUM(unsigned int, meta_prop_t) {
    META_PROP_LEFT,
    META_PROP_TOP,
    META_PROP_RIGHT,
    META_PROP_BOTTOM,
    META_PROP_HORIZONTAL,
    META_PROP_VERTICAL,
    META_PROP_ALL,
    META_PROP_COUNT,
};

@implementation HippyShadowView {
    HippyUpdateLifecycle _propagationLifecycle;
    HippyUpdateLifecycle _textLifecycle;
    NSDictionary *_lastParentProperties;
    NSMutableArray<HippyShadowView *> *_hippySubviews;
    BOOL _recomputePadding;
    BOOL _recomputeMargin;
    BOOL _recomputeBorder;
    BOOL _didUpdateSubviews;
    float _paddingMetaProps[META_PROP_COUNT];
    float _marginMetaProps[META_PROP_COUNT];
    float _borderMetaProps[META_PROP_COUNT];
}

@synthesize hippyTag = _hippyTag;
@synthesize props = _props;
@synthesize rootTag = _rootTag;
@synthesize parent = _parent;

// not used function
// static void HippyPrint(void *context)
//{
//  HippyShadowView *shadowView = (__bridge HippyShadowView *)context;
//  printf("%s(%zd), ", shadowView.viewName.UTF8String, shadowView.hippyTag.integerValue);
//}
#define DEFINE_PROCESS_META_PROPS(type)                                                                \
    static void HippyProcessMetaProps##type(const float metaProps[META_PROP_COUNT], MTTNodeRef node) { \
        if (!isnan(metaProps[META_PROP_LEFT])) {                                                       \
            MTTNodeStyleSet##type(node, CSSLeft, metaProps[META_PROP_LEFT]);                           \
        } else if (!isnan(metaProps[META_PROP_HORIZONTAL])) {                                          \
            MTTNodeStyleSet##type(node, CSSLeft, metaProps[META_PROP_HORIZONTAL]);                     \
        } else if (!isnan(metaProps[META_PROP_ALL])) {                                                 \
            MTTNodeStyleSet##type(node, CSSLeft, metaProps[META_PROP_ALL]);                            \
        } else {                                                                                       \
            MTTNodeStyleSet##type(node, CSSLeft, 0);                                                   \
        }                                                                                              \
                                                                                                       \
        if (!isnan(metaProps[META_PROP_RIGHT])) {                                                      \
            MTTNodeStyleSet##type(node, CSSRight, metaProps[META_PROP_RIGHT]);                         \
        } else if (!isnan(metaProps[META_PROP_HORIZONTAL])) {                                          \
            MTTNodeStyleSet##type(node, CSSRight, metaProps[META_PROP_HORIZONTAL]);                    \
        } else if (!isnan(metaProps[META_PROP_ALL])) {                                                 \
            MTTNodeStyleSet##type(node, CSSRight, metaProps[META_PROP_ALL]);                           \
        } else {                                                                                       \
            MTTNodeStyleSet##type(node, CSSRight, 0);                                                  \
        }                                                                                              \
                                                                                                       \
        if (!isnan(metaProps[META_PROP_TOP])) {                                                        \
            MTTNodeStyleSet##type(node, CSSTop, metaProps[META_PROP_TOP]);                             \
        } else if (!isnan(metaProps[META_PROP_VERTICAL])) {                                            \
            MTTNodeStyleSet##type(node, CSSTop, metaProps[META_PROP_VERTICAL]);                        \
        } else if (!isnan(metaProps[META_PROP_ALL])) {                                                 \
            MTTNodeStyleSet##type(node, CSSTop, metaProps[META_PROP_ALL]);                             \
        } else {                                                                                       \
            MTTNodeStyleSet##type(node, CSSTop, 0);                                                    \
        }                                                                                              \
                                                                                                       \
        if (!isnan(metaProps[META_PROP_BOTTOM])) {                                                     \
            MTTNodeStyleSet##type(node, CSSBottom, metaProps[META_PROP_BOTTOM]);                       \
        } else if (!isnan(metaProps[META_PROP_VERTICAL])) {                                            \
            MTTNodeStyleSet##type(node, CSSBottom, metaProps[META_PROP_VERTICAL]);                     \
        } else if (!isnan(metaProps[META_PROP_ALL])) {                                                 \
            MTTNodeStyleSet##type(node, CSSBottom, metaProps[META_PROP_ALL]);                          \
        } else {                                                                                       \
            MTTNodeStyleSet##type(node, CSSBottom, 0);                                                 \
        }                                                                                              \
    }

DEFINE_PROCESS_META_PROPS(Padding);
DEFINE_PROCESS_META_PROPS(Margin);
DEFINE_PROCESS_META_PROPS(Border);

// The absolute stuff is so that we can take into account our absolute position when rounding in order to
// snap to the pixel grid. For example, say you have the following structure:
//
// +--------+---------+--------+
// |        |+-------+|        |
// |        ||       ||        |
// |        |+-------+|        |
// +--------+---------+--------+
//
// Say the screen width is 320 pts so the three big views will get the following x bounds from our layout system:
// {0, 106.667}, {106.667, 213.333}, {213.333, 320}
//
// Assuming screen scale is 2, these numbers must be rounded to the nearest 0.5 to fit the pixel grid:
// {0, 106.5}, {106.5, 213.5}, {213.5, 320}
// You'll notice that the three widths are 106.5, 107, 106.5.
//
// This is great for the parent views but it gets trickier when we consider rounding for the subview.
//
// When we go to round the bounds for the subview in the middle, it's relative bounds are {0, 106.667}
// which gets rounded to {0, 106.5}. This will cause the subview to be one pixel smaller than it should be.
// this is why we need to pass in the absolute position in order to do the rounding relative to the screen's
// grid rather than the view's grid.
//
// After passing in the absolutePosition of {106.667, y}, we do the following calculations:
// absoluteLeft = round(absolutePosition.x + viewPosition.left) = round(106.667 + 0) = 106.5
// absoluteRight = round(absolutePosition.x + viewPosition.left + viewSize.left) + round(106.667 + 0 + 106.667) = 213.5
// width = 213.5 - 106.5 = 107
// You'll notice that this is the same width we calculated for the parent view because we've taken its position into account.

- (void)applyLayoutNode:(MTTNodeRef)node
      viewsWithNewFrame:(NSMutableSet<HippyShadowView *> *)viewsWithNewFrame
       absolutePosition:(CGPoint)absolutePosition {
    if (!MTTNodeHasNewLayout(node)) {
        return;
    }
    MTTNodesetHasNewLayout(node, false);
    float left = MTTNodeLayoutGetLeft(node);
    float top = MTTNodeLayoutGetTop(node);
    float width = MTTNodeLayoutGetWidth(node);
    float height = MTTNodeLayoutGetHeight(node);
    
    CGPoint absoluteTopLeft = { absolutePosition.x + left, absolutePosition.y + top };

    CGPoint absoluteBottomRight = { absolutePosition.x + left + width,
        absolutePosition.y + top + height };

    CGRect frame = { {
                         HippyRoundPixelValue(MTTNodeLayoutGetLeft(node)),
                         HippyRoundPixelValue(MTTNodeLayoutGetTop(node)),
                     },
        { HippyRoundPixelValue(absoluteBottomRight.x - absoluteTopLeft.x), HippyRoundPixelValue(absoluteBottomRight.y - absoluteTopLeft.y) } };

    if (!CGRectEqualToRect(frame, _frame)) {
        _frame = frame;
        [viewsWithNewFrame addObject:self];
    }

    absolutePosition.x += MTTNodeLayoutGetLeft(node);
    absolutePosition.y += MTTNodeLayoutGetTop(node);

    [self applyLayoutToChildren:node viewsWithNewFrame:viewsWithNewFrame absolutePosition:absolutePosition];
}

- (void)applyLayoutToChildren:(MTTNodeRef)node
            viewsWithNewFrame:(NSMutableSet<HippyShadowView *> *)viewsWithNewFrame
             absolutePosition:(CGPoint)absolutePosition {
    for (unsigned int i = 0; i < MTTNodeChildCount(node); ++i) {
        HippyShadowView *child = (HippyShadowView *)_hippySubviews[i];
        [child applyLayoutNode:MTTNodeGetChild(node, i) viewsWithNewFrame:viewsWithNewFrame absolutePosition:absolutePosition];
    }
}

- (NSDictionary<NSString *, id> *)processUpdatedProperties:(NSMutableSet<HippyApplierBlock> *)applierBlocks
                                          parentProperties:(NSDictionary<NSString *, id> *)parentProperties {
    // TODO: we always refresh all propagated properties when propagation is
    // dirtied, but really we should track which properties have changed and
    // only update those.

    if (_didUpdateSubviews) {
        _didUpdateSubviews = NO;
        [self didUpdateHippySubviews];
        [applierBlocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry) {
            UIView *view = viewRegistry[self->_hippyTag];
            [view clearSortedSubviews];
            [view didUpdateHippySubviews];
        }];
    }

    if (!_backgroundColor) {
        UIColor *parentBackgroundColor = parentProperties[HippyBackgroundColorProp];
        if (parentBackgroundColor) {
            [applierBlocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry) {
                UIView *view = viewRegistry[self->_hippyTag];
                [view hippySetInheritedBackgroundColor:parentBackgroundColor];
            }];
        }
    } else {
        // Update parent properties for children
        NSMutableDictionary<NSString *, id> *properties = [NSMutableDictionary dictionaryWithDictionary:parentProperties];
        CGFloat alpha = CGColorGetAlpha(_backgroundColor.CGColor);
        if (alpha < 1.0) {
            // If bg is non-opaque, don't propagate further
            properties[HippyBackgroundColorProp] = [UIColor clearColor];
        } else {
            properties[HippyBackgroundColorProp] = _backgroundColor;
        }
        return properties;
    }
    return parentProperties;
}

- (void)collectUpdatedProperties:(NSMutableSet<HippyApplierBlock> *)applierBlocks parentProperties:(NSDictionary<NSString *, id> *)parentProperties {
    if (_propagationLifecycle == HippyUpdateLifecycleComputed && [parentProperties isEqualToDictionary:_lastParentProperties]) {
        return;
    }
    _propagationLifecycle = HippyUpdateLifecycleComputed;
    _lastParentProperties = parentProperties;
    NSDictionary<NSString *, id> *nextProps = [self processUpdatedProperties:applierBlocks parentProperties:parentProperties];
    for (HippyShadowView *child in _hippySubviews) {
        [child collectUpdatedProperties:applierBlocks parentProperties:nextProps];
    }
}

- (NSDictionary<NSString *, id> *)processUpdatedProperties:(NSMutableSet<HippyApplierBlock> *)applierBlocks
                                      virtualApplierBlocks:(__unused NSMutableSet<HippyApplierVirtualBlock> *)virtualApplierBlocks
                                          parentProperties:(NSDictionary<NSString *, id> *)parentProperties {
    // TODO: we always refresh all propagated properties when propagation is
    // dirtied, but really we should track which properties have changed and
    // only update those.

    if (_didUpdateSubviews) {
        _didUpdateSubviews = NO;
        [self didUpdateHippySubviews];
        [applierBlocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry) {
            UIView *view = viewRegistry[self->_hippyTag];
            [view clearSortedSubviews];
            [view didUpdateHippySubviews];
        }];
    }

    if (!_backgroundColor) {
        UIColor *parentBackgroundColor = parentProperties[HippyBackgroundColorProp];
        if (parentBackgroundColor) {
            [applierBlocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry) {
                UIView *view = viewRegistry[self->_hippyTag];
                [view hippySetInheritedBackgroundColor:parentBackgroundColor];
            }];
        }
    } else {
        // Update parent properties for children
        NSMutableDictionary<NSString *, id> *properties = [NSMutableDictionary dictionaryWithDictionary:parentProperties];
        CGFloat alpha = CGColorGetAlpha(_backgroundColor.CGColor);
        if (alpha < 1.0) {
            // If bg is non-opaque, don't propagate further
            properties[HippyBackgroundColorProp] = [UIColor clearColor];
        } else {
            properties[HippyBackgroundColorProp] = _backgroundColor;
        }
        return properties;
    }
    return parentProperties;
}

- (void)collectUpdatedProperties:(NSMutableSet<HippyApplierBlock> *)applierBlocks
            virtualApplierBlocks:(NSMutableSet<HippyApplierVirtualBlock> *)virtualApplierBlocks
                parentProperties:(NSDictionary<NSString *, id> *)parentProperties {
    if (_propagationLifecycle == HippyUpdateLifecycleComputed && [parentProperties isEqualToDictionary:_lastParentProperties]) {
        return;
    }
    _propagationLifecycle = HippyUpdateLifecycleComputed;
    _lastParentProperties = parentProperties;
    NSDictionary<NSString *, id> *nextProps = [self processUpdatedProperties:applierBlocks virtualApplierBlocks:virtualApplierBlocks
                                                            parentProperties:parentProperties];
    for (HippyShadowView *child in _hippySubviews) {
        [child collectUpdatedProperties:applierBlocks virtualApplierBlocks:virtualApplierBlocks parentProperties:nextProps];
    }
}

- (void)collectUpdatedFrames:(NSMutableSet<HippyShadowView *> *)viewsWithNewFrame
                   withFrame:(CGRect)frame
                      hidden:(BOOL)hidden
            absolutePosition:(CGPoint)absolutePosition {
    if (_hidden != hidden) {
        // The hidden state has changed. Even if the frame hasn't changed, add
        // this ShadowView to viewsWithNewFrame so the UIManager will process
        // this ShadowView's UIView and update its hidden state.
        _hidden = hidden;
        [viewsWithNewFrame addObject:self];
    }

    if (!CGRectEqualToRect(frame, _frame)) {
        MTTNodeStyleSetPositionType(_nodeRef, PositionTypeAbsolute);
        MTTNodeStyleSetWidth(_nodeRef, CGRectGetWidth(frame));
        MTTNodeStyleSetHeight(_nodeRef, CGRectGetHeight(frame));
        MTTNodeStyleSetPosition(_nodeRef, CSSLeft, frame.origin.x);
        MTTNodeStyleSetPosition(_nodeRef, CSSTop, frame.origin.y);
    }

    //  CSSNodeCalculateLayout(_cssNode, frame.size.width, frame.size.height, CSSDirectionInherit);
    NSWritingDirection direction = HippyGetCurrentWritingDirectionForAppLanguage();
    MTTDirection nodeDirection = (NSWritingDirectionRightToLeft == direction) ? DirectionRTL : DirectionLTR;
    nodeDirection = self.layoutDirection != DirectionInherit ? self.layoutDirection : nodeDirection;
    MTTNodeDoLayout(_nodeRef, frame.size.width, frame.size.height, nodeDirection);
    //  [self applyLayoutNode:_cssNode viewsWithNewFrame:viewsWithNewFrame absolutePosition:absolutePosition];
    [self applyLayoutNode:_nodeRef viewsWithNewFrame:viewsWithNewFrame absolutePosition:absolutePosition];
}

- (CGRect)measureLayoutRelativeToAncestor:(HippyShadowView *)ancestor {
    CGPoint offset = CGPointZero;
    NSInteger depth = 30;  // max depth to search
    HippyShadowView *shadowView = self;
    while (depth && shadowView && shadowView != ancestor) {
        offset.x += shadowView.frame.origin.x;
        offset.y += shadowView.frame.origin.y;
        shadowView = shadowView->_superview;
        depth--;
    }
    if (ancestor != shadowView) {
        return CGRectNull;
    }
    return (CGRect) { offset, self.frame.size };
}

- (BOOL)viewIsDescendantOf:(HippyShadowView *)ancestor {
    NSInteger depth = 30;  // max depth to search
    HippyShadowView *shadowView = self;
    while (depth && shadowView && shadowView != ancestor) {
        shadowView = shadowView->_superview;
        depth--;
    }
    return ancestor == shadowView;
}

- (instancetype)init {
    if ((self = [super init])) {
        _frame = CGRectMake(0, 0, NAN, NAN);

        for (unsigned int ii = 0; ii < META_PROP_COUNT; ii++) {
            _paddingMetaProps[ii] = NAN;
            _marginMetaProps[ii] = NAN;
            _borderMetaProps[ii] = NAN;
        }

        _newView = YES;
        _propagationLifecycle = HippyUpdateLifecycleUninitialized;
        _textLifecycle = HippyUpdateLifecycleUninitialized;

        _hippySubviews = [NSMutableArray array];

        _nodeRef = MTTNodeNew();
    }
    return self;
}

- (BOOL)isHippyRootView {
    return HippyIsHippyRootView(self.hippyTag);
}

- (void)dealloc {
    MTTNodeFree(_nodeRef);
}

- (BOOL)isCSSLeafNode {
    return NO;
}

- (void)dirtyPropagation {
    if (_propagationLifecycle != HippyUpdateLifecycleDirtied) {
        _propagationLifecycle = HippyUpdateLifecycleDirtied;
        [_superview dirtyPropagation];
    }
}

- (BOOL)isPropagationDirty {
    return _propagationLifecycle != HippyUpdateLifecycleComputed;
}

- (void)dirtyText {
    if (_textLifecycle != HippyUpdateLifecycleDirtied) {
        _textLifecycle = HippyUpdateLifecycleDirtied;
        [_superview dirtyText];
    }
}

- (BOOL)isTextDirty {
    return _textLifecycle != HippyUpdateLifecycleComputed;
}

- (void)setTextComputed {
    _textLifecycle = HippyUpdateLifecycleComputed;
}

- (void)insertHippySubview:(HippyShadowView *)subview atIndex:(NSInteger)atIndex {
    [_hippySubviews insertObject:subview atIndex:atIndex];
    if (![self isCSSLeafNode]) {
        MTTNodeInsertChild(_nodeRef, subview.nodeRef, (uint32_t)atIndex);
    }
    subview->_superview = self;
    _didUpdateSubviews = YES;
    [self dirtyText];
    [self dirtyPropagation];
}

- (void)removeHippySubview:(HippyShadowView *)subview {
    [subview dirtyText];
    [subview dirtyPropagation];
    _didUpdateSubviews = YES;
    subview->_superview = nil;
    [_hippySubviews removeObject:subview];
    if (![self isCSSLeafNode]) {
        MTTNodeRemoveChild(_nodeRef, subview.nodeRef);
    }
}

- (NSArray<HippyShadowView *> *)hippySubviews {
    return _hippySubviews;
}

- (HippyShadowView *)hippySuperview {
    return _superview;
}

- (NSNumber *)hippyTagAtPoint:(CGPoint)point {
    for (HippyShadowView *shadowView in _hippySubviews) {
        if (CGRectContainsPoint(shadowView.frame, point)) {
            CGPoint relativePoint = point;
            CGPoint origin = shadowView.frame.origin;
            relativePoint.x -= origin.x;
            relativePoint.y -= origin.y;
            return [shadowView hippyTagAtPoint:relativePoint];
        }
    }
    return self.hippyTag;
}

- (NSString *)description {
    NSString *description = super.description;
    description = [[description substringToIndex:description.length - 1]
        stringByAppendingFormat:@"; viewName: %@; hippyTag: %@; frame: %@>", self.viewName, self.hippyTag, NSStringFromCGRect(self.frame)];
    return description;
}

- (void)addRecursiveDescriptionToString:(NSMutableString *)string atLevel:(NSUInteger)level {
    for (NSUInteger i = 0; i < level; i++) {
        [string appendString:@"  | "];
    }

    [string appendString:self.description];
    [string appendString:@"\n"];

    for (HippyShadowView *subview in _hippySubviews) {
        [subview addRecursiveDescriptionToString:string atLevel:level + 1];
    }
}

- (NSString *)recursiveDescription {
    NSMutableString *description = [NSMutableString string];
    [self addRecursiveDescriptionToString:description atLevel:0];
    return description;
}

// Margin

#define HIPPY_MARGIN_PROPERTY(prop, metaProp)           \
    -(void)setMargin##prop : (CGFloat)value {           \
        _marginMetaProps[META_PROP_##metaProp] = value; \
        _recomputeMargin = YES;                         \
    }                                                   \
    -(CGFloat)margin##prop {                            \
        return _marginMetaProps[META_PROP_##metaProp];  \
    }

HIPPY_MARGIN_PROPERTY(, ALL)
HIPPY_MARGIN_PROPERTY(Vertical, VERTICAL)
HIPPY_MARGIN_PROPERTY(Horizontal, HORIZONTAL)
HIPPY_MARGIN_PROPERTY(Top, TOP)
HIPPY_MARGIN_PROPERTY(Left, LEFT)
HIPPY_MARGIN_PROPERTY(Bottom, BOTTOM)
HIPPY_MARGIN_PROPERTY(Right, RIGHT)

// Padding

#define HIPPY_PADDING_PROPERTY(prop, metaProp)           \
    -(void)setPadding##prop : (CGFloat)value {           \
        _paddingMetaProps[META_PROP_##metaProp] = value; \
        _recomputePadding = YES;                         \
    }                                                    \
    -(CGFloat)padding##prop {                            \
        return _paddingMetaProps[META_PROP_##metaProp];  \
    }

HIPPY_PADDING_PROPERTY(, ALL)
HIPPY_PADDING_PROPERTY(Vertical, VERTICAL)
HIPPY_PADDING_PROPERTY(Horizontal, HORIZONTAL)
HIPPY_PADDING_PROPERTY(Top, TOP)
HIPPY_PADDING_PROPERTY(Left, LEFT)
HIPPY_PADDING_PROPERTY(Bottom, BOTTOM)
HIPPY_PADDING_PROPERTY(Right, RIGHT)

- (UIEdgeInsets)paddingAsInsets {
    CGFloat top = MTTNodeLayoutGetPadding(_nodeRef, CSSTop);
    if (isnan(top)) {
        top = 0;
    }
    CGFloat left = MTTNodeLayoutGetPadding(_nodeRef, CSSLeft);
    if (isnan(left)) {
        left = 0;
    }
    CGFloat bottom = MTTNodeLayoutGetPadding(_nodeRef, CSSBottom);
    if (isnan(bottom)) {
        bottom = 0;
    }
    CGFloat right = MTTNodeLayoutGetPadding(_nodeRef, CSSRight);
    if (isnan(right)) {
        right = 0;
    }
    return UIEdgeInsetsMake(top, left, bottom, right);
}

// Border
#define HIPPY_BORDER_PROPERTY(prop, metaProp)           \
    -(void)setBorder##prop##Width : (CGFloat)value {    \
        _borderMetaProps[META_PROP_##metaProp] = value; \
        _recomputeBorder = YES;                         \
    }                                                   \
    -(CGFloat)border##prop##Width {                     \
        return _borderMetaProps[META_PROP_##metaProp];  \
    }

HIPPY_BORDER_PROPERTY(, ALL)
HIPPY_BORDER_PROPERTY(Top, TOP)
HIPPY_BORDER_PROPERTY(Left, LEFT)
HIPPY_BORDER_PROPERTY(Bottom, BOTTOM)
HIPPY_BORDER_PROPERTY(Right, RIGHT)

// Dimensions
#define X5_DIMENSION_PROPERTY(setProp, getProp, cssProp) \
    -(void)set##setProp : (CGFloat)value {               \
        MTTNodeStyleSet##cssProp(_nodeRef, value);       \
        [self dirtyText];                                \
    }                                                    \
    -(CGFloat)getProp {                                  \
        return MTTNodeLayoutGet##cssProp(_nodeRef);      \
    }
X5_DIMENSION_PROPERTY(Width, width, Width)
X5_DIMENSION_PROPERTY(Height, height, Height)
X5_DIMENSION_PROPERTY(MinWidth, minWidth, MinWidth)
X5_DIMENSION_PROPERTY(MinHeight, minHeight, MinHeight)
X5_DIMENSION_PROPERTY(MaxWidth, maxWidth, MaxWidth)
X5_DIMENSION_PROPERTY(MaxHeight, maxHeight, MaxHeight)

// Position
#define X5_POSITION_PROPERTY(setProp, getProp, edge)     \
    -(void)set##setProp : (CGFloat)value {               \
        MTTNodeStyleSetPosition(_nodeRef, edge, value);  \
        [self dirtyText];                                \
    }                                                    \
    -(CGFloat)getProp {                                  \
        return MTTNodeLayoutGetPosition(_nodeRef, edge); \
    }
X5_POSITION_PROPERTY(Top, top, CSSTop)
X5_POSITION_PROPERTY(Right, right, CSSRight)
X5_POSITION_PROPERTY(Bottom, bottom, CSSBottom)
X5_POSITION_PROPERTY(Left, left, CSSLeft)

- (void)setFrame:(CGRect)frame {
    if (!CGRectEqualToRect(frame, _frame)) {
        _frame = frame;
        MTTNodeStyleSetPosition(_nodeRef, CSSLeft, CGRectGetMinX(frame));
        MTTNodeStyleSetPosition(_nodeRef, CSSTop, CGRectGetMinY(frame));
        MTTNodeStyleSetWidth(_nodeRef, CGRectGetWidth(frame));
        MTTNodeStyleSetHeight(_nodeRef, CGRectGetHeight(frame));
    }
}

static inline void x5AssignSuggestedDimension(MTTNodeRef cssNode, Dimension dimension, CGFloat amount) {
    if (amount != UIViewNoIntrinsicMetric) {
        switch (dimension) {
            case DimWidth:
                if (isnan(MTTNodeLayoutGetWidth(cssNode))) {
                    MTTNodeStyleSetWidth(cssNode, amount);
                }
                break;
            case DimHeight:
                if (isnan(MTTNodeLayoutGetHeight(cssNode))) {
                    MTTNodeStyleSetHeight(cssNode, amount);
                }
                break;
        }
    }
}

- (void)setIntrinsicContentSize:(CGSize)size {
    if (MTTNodeLayoutGetFlexGrow(_nodeRef) == 0.f && MTTNodeLayoutGetFlexShrink(_nodeRef) == 0.f) {
        x5AssignSuggestedDimension(_nodeRef, DimHeight, size.height);
        x5AssignSuggestedDimension(_nodeRef, DimWidth, size.width);
    }
}

- (void)setTopLeft:(CGPoint)topLeft {
    MTTNodeStyleSetPosition(_nodeRef, CSSLeft, topLeft.x);
    MTTNodeStyleSetPosition(_nodeRef, CSSLeft, topLeft.y);
}

- (void)setSize:(CGSize)size {
    MTTNodeStyleSetWidth(_nodeRef, size.width);
    MTTNodeStyleSetHeight(_nodeRef, size.height);
}

// Flex

- (void)setFlex:(CGFloat)value {
    MTTNodeStyleSetFlex(_nodeRef, value);
}

#define X5_STYLE_PROPERTY(setProp, getProp, cssProp, type) \
    -(void)set##setProp : (type)value {                    \
        MTTNodeStyleSet##cssProp(_nodeRef, value);         \
    }                                                      \
    -(type)getProp {                                       \
        return MTTNodeLayoutGet##cssProp(_nodeRef);        \
    }

X5_STYLE_PROPERTY(FlexGrow, flexGrow, FlexGrow, CGFloat)
X5_STYLE_PROPERTY(FlexShrink, flexShrink, FlexShrink, CGFloat)
X5_STYLE_PROPERTY(FlexBasis, flexBasis, FlexBasis, CGFloat)
X5_STYLE_PROPERTY(FlexDirection, flexDirection, FlexDirection, FlexDirection)
X5_STYLE_PROPERTY(JustifyContent, justifyContent, JustifyContent, FlexAlign)
X5_STYLE_PROPERTY(AlignSelf, alignSelf, AlignSelf, FlexAlign)
X5_STYLE_PROPERTY(AlignItems, alignItems, AlignItems, FlexAlign)
X5_STYLE_PROPERTY(Position, position, PositionType, PositionType)
X5_STYLE_PROPERTY(FlexWrap, flexWrap, FlexWrap, FlexWrapMode)
X5_STYLE_PROPERTY(Overflow, overflow, Overflow, OverflowType)
X5_STYLE_PROPERTY(DisplayType, displayType, Display, DisplayType)

- (void)setBackgroundColor:(UIColor *)color {
    _backgroundColor = color;
    [self dirtyPropagation];
}

- (void)setZIndex:(NSInteger)zIndex {
    _zIndex = zIndex;
    if (_superview) {
        // Changing zIndex means the subview order of the parent needs updating
        _superview->_didUpdateSubviews = YES;
        [_superview dirtyPropagation];
    }
}

- (void)didUpdateHippySubviews {
    // Does nothing by default
}

- (void)didSetProps:(__unused NSArray<NSString *> *)changedProps {
    if (_recomputePadding) {
        HippyProcessMetaPropsPadding(_paddingMetaProps, _nodeRef);
    }
    if (_recomputeMargin) {
        HippyProcessMetaPropsMargin(_marginMetaProps, _nodeRef);
    }
    if (_recomputeBorder) {
        HippyProcessMetaPropsBorder(_borderMetaProps, _nodeRef);
    }
    _recomputeMargin = NO;
    _recomputePadding = NO;
    _recomputeBorder = NO;
}

- (void)hippySetFrame:(__unused CGRect)frame {
}

- (NSDictionary *)mergeProps:(NSDictionary *)props {
    if (self.props == nil) {
        self.props = props;
        return self.props;
    }

    if ([_props isEqualToDictionary:props]) {
        return @{};
    }

    NSMutableDictionary *needUpdatedProps = [[NSMutableDictionary alloc] initWithDictionary:props];
    NSMutableArray<NSString *> *sameKeys = [NSMutableArray new];
    [self.props enumerateKeysAndObjectsUsingBlock:^(NSString *_Nonnull key, id _Nonnull obj, __unused BOOL *stop) {
        if (needUpdatedProps[key] == nil) {
            // HippyNilIfNull方法会将NULL转化为nil,对于数字类型属性则为0，导致实际上为kCFNull的属性，最终会转化为0
            //比如view长宽属性，前端并没有设置其具体数值，而使用css需要终端计算大小，但由于上述机制，导致MTT排版引擎将其宽高设置为0，0，引发bug
            //因此这里做个判断，遇到mergeprops时，如果需要删除的属性是布局相关类型，那一律将新值设置为默认值
            needUpdatedProps[key] = [self defaultValueForKey:key];
        } else {
            if ([needUpdatedProps[key] isEqual:obj]) {
                [sameKeys addObject:key];
            }
        }
    }];
    self.props = needUpdatedProps;
    [needUpdatedProps removeObjectsForKeys:sameKeys];
    return needUpdatedProps;
}

- (id)defaultValueForKey:(NSString *)key {
    static dispatch_once_t onceToken;
    static NSArray *layoutKeys = nil;
    id ret = nil;
    dispatch_once(&onceToken, ^{
        layoutKeys = @[
            @"top", @"left", @"bottom", @"right", @"width", @"height", @"minWidth", @"maxWidth", @"minHeight", @"maxHeight", @"borderTopWidth",
            @"borderRightWidth", @"borderBottomWidth", @"borderLeftWidth", @"borderWidth", @"marginTop", @"marginLeft", @"marginBottom",
            @"marginRight", @"marginVertical", @"marginHorizontal", @"paddingTpp", @"paddingRight", @"paddingBottom", @"paddingLeft",
            @"paddingVertical", @"paddingHorizontal"
        ];
    });
    if ([layoutKeys containsObject:key]) {
        ret = @(NAN);
    } else if ([key isEqualToString:@"display"]) {
        ret = @"block";
    } else {
        ret = (id)kCFNull;
    }
    return ret;
}
@end
