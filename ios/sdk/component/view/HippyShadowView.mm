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
#import "HPNode.h"
#import "HippyI18nUtils.h"
#include "dom/taitank_layout_node.h"

CGRect getShadowViewRectFromDomNode(HippyShadowView *shadowView) {
    if (shadowView) {
        std::shared_ptr<hippy::DomNode> node = shadowView.domNode.lock();
        if (node) {
            const hippy::LayoutResult &layoutResult = node->GetLayoutResult();
            return CGRectMake(layoutResult.left, layoutResult.top, layoutResult.width, layoutResult.height);
        }
    }
    return CGRectZero;
}

hippy::TaitankLayoutNode *layoutNodeFromShadowView(HippyShadowView *shadowView) {
    auto domNode = shadowView.domNode.lock();
    if (domNode) {
        std::shared_ptr<hippy::TaitankLayoutNode>layoutNode =
            std::static_pointer_cast<hippy::TaitankLayoutNode>(domNode->GetLayoutNode());
        return layoutNode.get();
    }
    return nullptr;
}


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

@interface HippyShadowView () {
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
    std::weak_ptr<hippy::DomNode> _domNode;
}

@end

@implementation HippyShadowView

@synthesize hippyTag = _hippyTag;
@synthesize props = _props;
@synthesize rootTag = _rootTag;
@synthesize parent = _parent;
@synthesize tagName;

- (void)collectShadowViewsHaveNewLayoutResults:(NSMutableSet<HippyShadowView *> *)shadowViewsHaveNewLayoutResult {
    HippyAssert(shadowViewsHaveNewLayoutResult, @"we need shadowViewsNeedToApplyLayout to collect shadow views");
    //FIXME 由于获取shadowview改变的方法是从root shadow view开始递归，因此深层次subviews的更新以及subviews的改变需要一直dirty到rootview
    //这里先简单处理
//    if (_hasNewLayout || _visibilityChanged) {
    if (1) {
        _hasNewLayout = NO;
        _visibilityChanged = NO;
        [shadowViewsHaveNewLayoutResult addObject:self];
        for (HippyShadowView *shadowView in self.hippySubviews) {
            [shadowView collectShadowViewsHaveNewLayoutResults:shadowViewsHaveNewLayoutResult];
        }
    }
}

- (NSDictionary<NSString *, id> *)processUpdatedProperties:(NSMutableSet<HippyApplierBlock> *)applierBlocks
                                          parentProperties:(NSDictionary<NSString *, id> *)parentProperties {
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
        _hasNewLayout = YES;
        _hippySubviews = [NSMutableArray array];
    }
    return self;
}

- (BOOL)isHippyRootView {
    return HippyIsHippyRootView(self.hippyTag);
}

- (void)dealloc {
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

- (void)setDomNode:(std::weak_ptr<hippy::DomNode>)domNode {
    _domNode = domNode;
}

- (const std::weak_ptr<hippy::DomNode> &)domNode {
    return _domNode;
}

- (void)setTextComputed {
    _textLifecycle = HippyUpdateLifecycleComputed;
}

- (BOOL)isHidden {
    return _hidden || [_visibility isEqualToString:@"hidden"];
}

- (void)setVisibility:(NSString *)visibility {
    if (![_visibility isEqualToString:visibility]) {
        _visibility = visibility;
        _visibilityChanged = YES;
    }
}

- (void)insertHippySubview:(HippyShadowView *)subview atIndex:(NSInteger)atIndex {
    [_hippySubviews insertObject:subview atIndex:atIndex];
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

- (UIEdgeInsets)paddingAsInsets {
    UIEdgeInsets insets = UIEdgeInsetsZero;
    auto domNode = self.domNode.lock();
    if (domNode) {
        insets = UIEdgeInsetsFromLayoutResult(domNode->GetLayoutResult());
    }
    return insets;
}

- (void)setFrame:(CGRect)frame {
    if (!CGRectEqualToRect(frame, _frame)) {
        _frame = frame;
        self.hasNewLayout = YES;
    }
}

- (void)setLayoutFrame:(CGRect)frame {
    auto layoutNode = layoutNodeFromShadowView(self);
    if (layoutNode) {
        HPNodeRef nodeRef = layoutNode->GetLayoutEngineNodeRef();
        HPNodeStyleSetPosition(nodeRef, CSSLeft, frame.origin.x);
        HPNodeStyleSetPosition(nodeRef, CSSTop, frame.origin.y);
        HPNodeStyleSetWidth(nodeRef, frame.size.width);
        HPNodeStyleSetHeight(nodeRef, frame.size.height);
        HPNodeMarkDirty(nodeRef);
        [self dirtyPropagation];
    }
}

static inline void x5AssignSuggestedDimension(HPNodeRef cssNode, Dimension dimension, CGFloat amount) {
    if (amount != UIViewNoIntrinsicMetric) {
        switch (dimension) {
            case DimWidth:
                if (isnan(HPNodeLayoutGetWidth(cssNode))) {
                    HPNodeStyleSetWidth(cssNode, amount);
                }
                break;
            case DimHeight:
                if (isnan(HPNodeLayoutGetHeight(cssNode))) {
                    HPNodeStyleSetHeight(cssNode, amount);
                }
                break;
        }
    }
}

- (void)setBackgroundColor:(UIColor *)color {
    _backgroundColor = color;
    [self dirtyPropagation];
}

- (void)didUpdateHippySubviews {
    // Does nothing by default
}

- (void)didSetProps:(__unused NSArray<NSString *> *)changedProps {
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
