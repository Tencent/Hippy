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

#import "NativeRenderObjectView.h"
#import "NativeRenderConvert.h"
#import "UIView+NativeRender.h"
#import "NativeRenderI18nUtils.h"
#import "UIView+DirectionalLayout.h"
#include "dom/layout_node.h"
#include "dom/render_manager.h"
#include "Flex.h"

static NSString *const NativeRenderBackgroundColorProp = @"backgroundColor";

NSString *const NativeRenderShadowViewDiffInsertion = @"NativeRenderShadowViewDiffInsertion";
NSString *const NativeRenderShadowViewDiffRemove = @"NativeRenderShadowViewDiffRemove";
NSString *const NativeRenderShadowViewDiffUpdate = @"NativeRenderShadowViewDiffUpdate";
NSString *const NativeRenderShadowViewDiffTag = @"NativeRenderShadowViewDiffTag";


@interface NativeRenderObjectView () {
    NativeRenderUpdateLifecycle _propagationLifecycle;
    NativeRenderUpdateLifecycle _textLifecycle;
    NSDictionary *_lastParentProperties;
    NSMutableArray<NativeRenderObjectView *> *_objectSubviews;
    BOOL _recomputePadding;
    BOOL _recomputeMargin;
    BOOL _recomputeBorder;
    BOOL _didUpdateSubviews;
    //TODO remove it
    NSInteger _isDecendantOfLazilyRenderObject;
    std::vector<std::string> _eventNames;
}

@end

@implementation NativeRenderObjectView

@synthesize componentTag = _componentTag;
@synthesize props = _props;
@synthesize rootTag = _rootTag;
@synthesize parent = _parent;
@synthesize tagName =_tagName;

- (void)amendLayoutBeforeMount {
    if (NativeRenderUpdateLifecycleDirtied == _propagationLifecycle || _visibilityChanged) {
        _visibilityChanged = NO;
        for (NativeRenderObjectView *renderObjectView in self.nativeRenderSubviews) {
            [renderObjectView amendLayoutBeforeMount];
        }
    }
}

- (NSDictionary<NSString *, id> *)processUpdatedProperties:(NSMutableSet<NativeRenderApplierBlock> *)applierBlocks
                                          parentProperties:(NSDictionary<NSString *, id> *)parentProperties {
    if (_didUpdateSubviews) {
        _didUpdateSubviews = NO;
        [self didUpdateNativeRenderSubviews];
        [applierBlocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry) {
            UIView *view = viewRegistry[self->_componentTag];
            [view clearSortedSubviews];
            [view didUpdateNativeRenderSubviews];
        }];
    }
    if (_confirmedLayoutDirectionDidUpdated) {
        HPDirection direction = [self confirmedLayoutDirection];
        [applierBlocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry) {
            UIView *view = viewRegistry[self->_componentTag];
            [view applyLayoutDirectionFromParent:direction];
        }];
        _confirmedLayoutDirectionDidUpdated = NO;
    }
    if (!_backgroundColor) {
        UIColor *parentBackgroundColor = parentProperties[NativeRenderBackgroundColorProp];
        if (parentBackgroundColor) {
            [applierBlocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry) {
                UIView *view = viewRegistry[self->_componentTag];
                [view nativeRenderSetInheritedBackgroundColor:parentBackgroundColor];
            }];
        }
    } else {
        // Update parent properties for children
        NSMutableDictionary<NSString *, id> *properties = [NSMutableDictionary dictionaryWithDictionary:parentProperties];
        CGFloat alpha = CGColorGetAlpha(_backgroundColor.CGColor);
        if (alpha < 1.0) {
            // If bg is non-opaque, don't propagate further
            properties[NativeRenderBackgroundColorProp] = [UIColor clearColor];
        } else {
            properties[NativeRenderBackgroundColorProp] = _backgroundColor;
        }
        return properties;
    }
    return parentProperties;
}

- (void)collectUpdatedProperties:(NSMutableSet<NativeRenderApplierBlock> *)applierBlocks parentProperties:(NSDictionary<NSString *, id> *)parentProperties {
    if (_propagationLifecycle == NativeRenderUpdateLifecycleComputed && [parentProperties isEqualToDictionary:_lastParentProperties]) {
        return;
    }
    _propagationLifecycle = NativeRenderUpdateLifecycleComputed;
    _lastParentProperties = parentProperties;
    NSDictionary<NSString *, id> *nextProps = [self processUpdatedProperties:applierBlocks parentProperties:parentProperties];
    for (NativeRenderObjectView *child in _objectSubviews) {
        [child collectUpdatedProperties:applierBlocks parentProperties:nextProps];
    }
}

- (instancetype)init {
    if ((self = [super init])) {
        _frame = CGRectMake(0, 0, NAN, NAN);
        _isDecendantOfLazilyRenderObject = -1;
        _propagationLifecycle = NativeRenderUpdateLifecycleUninitialized;
        _textLifecycle = NativeRenderUpdateLifecycleUninitialized;
        _hasNewLayout = YES;
        _objectSubviews = [NSMutableArray array];
        _confirmedLayoutDirection = DirectionInherit;
        _layoutDirection = DirectionInherit;
    }
    return self;
}

- (BOOL)isNativeRenderRootView {
    return NativeRenderIsRootView(self.componentTag);
}

- (BOOL)isCSSLeafNode {
    return NO;
}

- (void)dirtyPropagation {
    if (_propagationLifecycle != NativeRenderUpdateLifecycleDirtied) {
        _propagationLifecycle = NativeRenderUpdateLifecycleDirtied;
        [_superview dirtyPropagation];
    }
}

- (void)dirtySelfPropagation {
    _propagationLifecycle = NativeRenderUpdateLifecycleDirtied;
}

- (void)dirtyDescendantPropagation {
    [self dirtySelfPropagation];
    for (NativeRenderObjectView *renderObjectView in self.nativeRenderSubviews) {
        [renderObjectView dirtyDescendantPropagation];
    }
}

- (BOOL)isPropagationDirty {
    return _propagationLifecycle != NativeRenderUpdateLifecycleComputed;
}

- (void)dirtyText {
    if (_textLifecycle != NativeRenderUpdateLifecycleDirtied) {
        _textLifecycle = NativeRenderUpdateLifecycleDirtied;
        [_superview dirtyText];
    }
}

- (BOOL)isTextDirty {
    return _textLifecycle != NativeRenderUpdateLifecycleComputed;
}

- (NativeRenderCreationType)creationType {
    if (NativeRenderCreationTypeUndetermined == _creationType) {
        NativeRenderObjectView *superRenderObject = [self nativeRenderSuperview];
        if (superRenderObject && ![superRenderObject isNativeRenderRootView]) {
            _creationType = [superRenderObject creationType];
        }
        else {
            _creationType = NativeRenderCreationTypeInstantly;
        }
    }
    return _creationType;
}

- (void)setTextComputed {
    _textLifecycle = NativeRenderUpdateLifecycleComputed;
}

- (void)recusivelySetCreationTypeToInstant {
    auto domManager = self.domManager.lock();
    if (domManager) {
        __weak NativeRenderObjectView *weakSelf = self;
        
        std::vector<std::function<void()>> ops = {[weakSelf](){
            if (weakSelf) {
                NativeRenderObjectView *strongSelf = weakSelf;
                strongSelf.creationType = NativeRenderCreationTypeInstantly;
                for (NativeRenderObjectView *subRenderObject in strongSelf.nativeRenderSubviews) {
                    [subRenderObject synchronousRecusivelySetCreationTypeToInstant];
                }
            }
        }};
        domManager->PostTask(hippy::dom::Scene(std::move(ops)));
    }
}

- (void)synchronousRecusivelySetCreationTypeToInstant {
    self.creationType = NativeRenderCreationTypeInstantly;
    for (NativeRenderObjectView *subShadowView in self.nativeRenderSubviews) {
        [subShadowView synchronousRecusivelySetCreationTypeToInstant];
    }
}

- (UIView *)createView:(NativeRenderViewCreationBlock)creationBlock insertChildren:(NativeRenderViewInsertionBlock)insertionBlock {
    UIView *container = creationBlock(self);
    NSMutableArray *children = [NSMutableArray arrayWithCapacity:[self.nativeRenderSubviews count]];
    for (NativeRenderObjectView *subviews in self.nativeRenderSubviews) {
        UIView *subview = [subviews createView:creationBlock insertChildren:insertionBlock];
        if (subview) {
            [children addObject:subview];
        }
    }
    insertionBlock(container, children);
    return container;
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

- (void)insertNativeRenderSubview:(NativeRenderObjectView *)subview atIndex:(NSInteger)atIndex {
    if (atIndex <= [_objectSubviews count]) {
        [_objectSubviews insertObject:subview atIndex:atIndex];
    }
    else {
        [_objectSubviews addObject:subview];
    }
    subview->_superview = self;
    _didUpdateSubviews = YES;
    [self dirtyText];
    [self dirtyPropagation];
}

- (void)removeNativeRenderSubview:(NativeRenderObjectView *)subview {
    [subview dirtyText];
    [subview dirtyPropagation];
    _didUpdateSubviews = YES;
    subview->_superview = nil;
    [_objectSubviews removeObject:subview];
}

- (void)removeFromNativeRenderSuperview {
    id superview = [self nativeRenderSuperview];
    [superview removeNativeRenderSubview:self];
}

- (NSArray<NativeRenderObjectView *> *)nativeRenderSubviews {
    return _objectSubviews;
}

- (NativeRenderObjectView *)nativeRenderSuperview {
    return _superview;
}

- (NSNumber *)componentTagAtPoint:(CGPoint)point {
    for (NativeRenderObjectView *renderObject in _objectSubviews) {
        if (CGRectContainsPoint(renderObject.frame, point)) {
            CGPoint relativePoint = point;
            CGPoint origin = renderObject.frame.origin;
            relativePoint.x -= origin.x;
            relativePoint.y -= origin.y;
            return [renderObject componentTagAtPoint:relativePoint];
        }
    }
    return self.componentTag;
}

- (NSString *)description {
    NSString *description = super.description;
    description = [[description substringToIndex:description.length - 1]
        stringByAppendingFormat:@"; viewName: %@; componentTag: %@; frame: %@>", self.viewName, self.componentTag, NSStringFromCGRect(self.frame)];
    return description;
}

- (void)addRecursiveDescriptionToString:(NSMutableString *)string atLevel:(NSUInteger)level {
    for (NSUInteger i = 0; i < level; i++) {
        [string appendString:@"  | "];
    }

    [string appendString:self.description];
    [string appendString:@"\n"];

    for (NativeRenderObjectView *subview in _objectSubviews) {
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
    insets = UIEdgeInsetsFromLayoutResult(_nodeLayoutResult);
    return insets;
}

- (void)setFrame:(CGRect)frame {
    if (!CGRectEqualToRect(frame, _frame)) {
        _frame = frame;
        self.hasNewLayout = YES;
    }
}

- (void)setLayoutFrame:(CGRect)frame {
    auto domManager = self.domManager.lock();
    if (domManager) {
        __weak NativeRenderObjectView *weakSelf = self;
        std::vector<std::function<void()>> ops = {[weakSelf, domManager, frame](){
            @autoreleasepool {
                if (!weakSelf) {
                    return;
                }
                NativeRenderObjectView *strongSelf = weakSelf;
                int32_t componentTag = [[strongSelf componentTag] intValue];
                auto node = domManager->GetNode(strongSelf.rootNode, componentTag);
                auto renderManager = domManager->GetRenderManager().lock();
                if (!node || !renderManager) {
                    return;
                }
                node->SetLayoutOrigin(frame.origin.x, frame.origin.y);
                node->SetLayoutSize(frame.size.width, frame.size.height);
                std::vector<std::shared_ptr<hippy::DomNode>> changed_nodes;
                node->DoLayout(changed_nodes);
                renderManager->UpdateLayout(strongSelf.rootNode, std::move(changed_nodes));
                [strongSelf dirtyPropagation];
                strongSelf.hasNewLayout = YES;
                domManager->EndBatch(strongSelf.rootNode);
            }
        }};
        domManager->PostTask(hippy::dom::Scene(std::move(ops)));
    }
}

- (void)setBackgroundColor:(UIColor *)color {
    _backgroundColor = color;
    [self dirtyPropagation];
}

- (void)didUpdateNativeRenderSubviews {
    // Does nothing by default
}

- (void)didSetProps:(__unused NSArray<NSString *> *)changedProps {
}

- (void)nativeRenderSetFrame:(__unused CGRect)frame {
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
        if ([key isEqualToString:@"rootTag"]) {
            return;
        }
        if (needUpdatedProps[key] == nil) {
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

- (void)addEventName:(const std::string &)name {
    _eventNames.push_back(name);
}

- (const std::vector<std::string> &)allEventNames {
    return _eventNames;
}

- (void)clearEventNames {
    _eventNames.clear();
}

- (void)setLayoutDirection:(HPDirection)direction {
    _layoutDirection = direction;
    self.confirmedLayoutDirection = direction;
}

- (void)setConfirmedLayoutDirection:(HPDirection)confirmedLayoutDirection {
    if (_confirmedLayoutDirection != confirmedLayoutDirection) {
        _confirmedLayoutDirection = confirmedLayoutDirection;
        _confirmedLayoutDirectionDidUpdated = YES;
        [self applyConfirmedLayoutDirectionToSubviews:confirmedLayoutDirection];
    }
}

- (void)applyConfirmedLayoutDirectionToSubviews:(HPDirection)confirmedLayoutDirection {
    _confirmedLayoutDirection = confirmedLayoutDirection;
    for (NativeRenderObjectView *subviews in self.nativeRenderSubviews) {
        [subviews applyConfirmedLayoutDirectionToSubviews:confirmedLayoutDirection];
    }
}

- (BOOL)isLayoutSubviewsRTL {
    BOOL layoutRTL = DirectionRTL == self.confirmedLayoutDirection;
    return layoutRTL;
}

- (void)checkLayoutDirection:(NSMutableSet<NativeRenderObjectView *> *)viewsSet direction:(HPDirection *)direction{
    if (DirectionInherit == self.confirmedLayoutDirection) {
        [viewsSet addObject:self];
        NativeRenderObjectView *shadowSuperview = [self nativeRenderSuperview];
        if (!shadowSuperview) {
            if (direction) {
                NSWritingDirection writingDirection =
                    [[NativeRenderI18nUtils sharedInstance] writingDirectionForCurrentAppLanguage];
                *direction = NSWritingDirectionRightToLeft == writingDirection ? DirectionRTL : DirectionLTR;
            }
        }
        else {
            [shadowSuperview checkLayoutDirection:viewsSet direction:direction];
        }
    }
    else if (direction) {
        *direction = self.confirmedLayoutDirection;
    }
}

- (void)superviewLayoutDirectionChangedTo:(HPDirection)direction {
    if (DirectionInherit == self.layoutDirection) {
        self.confirmedLayoutDirection = [self superview].confirmedLayoutDirection;
        for (NativeRenderObjectView *subview in self.nativeRenderSubviews) {
            [subview superviewLayoutDirectionChangedTo:self.confirmedLayoutDirection];
        }
    }
}

@end
