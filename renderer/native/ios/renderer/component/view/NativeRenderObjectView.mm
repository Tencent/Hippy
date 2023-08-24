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
#import "HPDomUtils.h"
#import "HPI18nUtils.h"
#import "NativeRenderObjectView.h"
#import "UIView+DirectionalLayout.h"
#import "UIView+NativeRender.h"

#include "dom/layout_node.h"
#include "dom/render_manager.h"

static NSString *const NativeRenderBackgroundColorProp = @"backgroundColor";

NSString *const NativeRenderShadowViewDiffInsertion = @"NativeRenderShadowViewDiffInsertion";
NSString *const NativeRenderShadowViewDiffRemove = @"NativeRenderShadowViewDiffRemove";
NSString *const NativeRenderShadowViewDiffUpdate = @"NativeRenderShadowViewDiffUpdate";
NSString *const NativeRenderShadowViewDiffTag = @"NativeRenderShadowViewDiffTag";


@interface NativeRenderObjectView () {
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
@synthesize tagName =_tagName;

- (void)amendLayoutBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)blocks {
    if (NativeRenderUpdateLifecycleComputed == _propagationLifecycle) {
        return;
    }
    _propagationLifecycle = NativeRenderUpdateLifecycleComputed;
    for (NativeRenderObjectView *renderObjectView in self.subcomponents) {
        [renderObjectView amendLayoutBeforeMount:blocks];
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
        hippy::Direction direction = [self confirmedLayoutDirection];
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
}

- (instancetype)init {
    if ((self = [super init])) {
        _propagationLifecycle = NativeRenderUpdateLifecycleUninitialized;
        _frame = CGRectMake(0, 0, NAN, NAN);
        _isDecendantOfLazilyRenderObject = -1;
        _objectSubviews = [NSMutableArray arrayWithCapacity:8];
        _confirmedLayoutDirection = hippy::Direction::Inherit;
        _layoutDirection = hippy::Direction::Inherit;
    }
    return self;
}

- (BOOL)isNativeRenderRootView {
    return NativeRenderIsRootView(self.componentTag);
}

- (BOOL)isCSSLeafNode {
    return NO;
}

- (void)dirtyPropagation:(NativeRenderUpdateLifecycle)dirtyType {
    if (dirtyType == _propagationLifecycle ||
        NativeRenderUpdateLifecycleAllDirtied == _propagationLifecycle) {
        return;
    }
    if (NativeRenderUpdateLifecycleUninitialized == _propagationLifecycle ||
        NativeRenderUpdateLifecycleComputed == _propagationLifecycle) {
        _propagationLifecycle = dirtyType;
    }
    else {
        _propagationLifecycle = NativeRenderUpdateLifecycleAllDirtied;
    }
    [_superview dirtyPropagation:dirtyType];
}

- (BOOL)isPropagationDirty:(NativeRenderUpdateLifecycle)dirtyType {
    BOOL isDirty = _propagationLifecycle == dirtyType || _propagationLifecycle == NativeRenderUpdateLifecycleAllDirtied;
    return isDirty;
}

- (void)dirtyText:(BOOL)needToDoLayout {
    if ([self parentComponent]) {
        [[self parentComponent] dirtyText:needToDoLayout];
    }
}

- (BOOL)isTextDirty {
    return NO;
}

- (NativeRenderCreationType)creationType {
    if (NativeRenderCreationTypeUndetermined == _creationType) {
        NativeRenderObjectView *superRenderObject = [self parentComponent];
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
//    _textLifecycle = NativeRenderUpdateLifecycleComputed;
}

- (void)recusivelySetCreationTypeToInstant {
    auto domManager = self.domManager.lock();
    if (domManager) {
        __weak NativeRenderObjectView *weakSelf = self;
        
        std::vector<std::function<void()>> ops = {[weakSelf](){
            if (weakSelf) {
                NativeRenderObjectView *strongSelf = weakSelf;
                strongSelf.creationType = NativeRenderCreationTypeInstantly;
                for (NativeRenderObjectView *subRenderObject in strongSelf.subcomponents) {
                    [subRenderObject synchronousRecusivelySetCreationTypeToInstant];
                }
            }
        }};
        domManager->PostTask(hippy::dom::Scene(std::move(ops)));
    }
}

- (void)synchronousRecusivelySetCreationTypeToInstant {
    self.creationType = NativeRenderCreationTypeInstantly;
    for (NativeRenderObjectView *subShadowView in self.subcomponents) {
        [subShadowView synchronousRecusivelySetCreationTypeToInstant];
    }
}

- (UIView *)createView:(NativeRenderViewCreationBlock)creationBlock insertChildren:(NativeRenderViewInsertionBlock)insertionBlock {
    UIView *container = creationBlock(self);
    NSMutableArray *children = [NSMutableArray arrayWithCapacity:[self.subcomponents count]];
    for (NativeRenderObjectView *subviews in self.subcomponents) {
        UIView *subview = [subviews createView:creationBlock insertChildren:insertionBlock];
        if (subview) {
            [children addObject:subview];
        }
    }
    insertionBlock(container, children);
    return container;
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
    [self dirtyText:NO];
    [self dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
}

- (void)moveNativeRenderSubview:(id<NativeRenderComponentProtocol>)subview toIndex:(NSInteger)atIndex {
    if ([_objectSubviews containsObject:subview]) {
        [_objectSubviews removeObject:subview];
    }
    [self insertNativeRenderSubview:subview atIndex:atIndex];
}

- (void)removeNativeRenderSubview:(NativeRenderObjectView *)subview {
    [subview dirtyText:NO];
    [subview dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
    _didUpdateSubviews = YES;
    subview->_superview = nil;
    [_objectSubviews removeObject:subview];
}

- (void)removeFromNativeRenderSuperview {
    id superview = [self parentComponent];
    [superview removeNativeRenderSubview:self];
}

- (NSArray<NativeRenderObjectView *> *)subcomponents {
    return _objectSubviews;
}

- (NativeRenderObjectView *)parentComponent {
    return _superview;
}

- (void)setParentComponent:(__kindof id<NativeRenderComponentProtocol>)parentComponent {
    _superview = parentComponent;
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
    }
}

- (void)setLayoutFrame:(CGRect)frame {
    [self setLayoutFrame:frame dirtyPropagation:YES];
}

- (void)setLayoutFrame:(CGRect)frame dirtyPropagation:(BOOL)dirtyPropagation {
    CGRect currentFrame = self.frame;
    if (CGRectEqualToRect(currentFrame, frame)) {
        return;
    }
    [self setFrame:frame];
    auto domManager = self.domManager.lock();
    if (domManager) {
        __weak NativeRenderObjectView *weakSelf = self;
        std::vector<std::function<void()>> ops = {[weakSelf, domManager, frame, dirtyPropagation](){
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
                if (dirtyPropagation) {
                    [strongSelf dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
                }
                domManager->EndBatch(strongSelf.rootNode);
            }
        }};
        domManager->PostTask(hippy::dom::Scene(std::move(ops)));
    }
}

- (void)setBackgroundColor:(UIColor *)color {
    _backgroundColor = color;
    [self dirtyPropagation:NativeRenderUpdateLifecyclePropsDirtied];
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

- (void)setLayoutDirection:(hippy::Direction)direction {
    _layoutDirection = direction;
    self.confirmedLayoutDirection = direction;
}

- (void)setConfirmedLayoutDirection:(hippy::Direction)confirmedLayoutDirection {
    if (_confirmedLayoutDirection != confirmedLayoutDirection) {
        _confirmedLayoutDirection = confirmedLayoutDirection;
        _confirmedLayoutDirectionDidUpdated = YES;
        [self applyConfirmedLayoutDirectionToSubviews:confirmedLayoutDirection];
    }
}

- (void)applyConfirmedLayoutDirectionToSubviews:(hippy::Direction)confirmedLayoutDirection {
    _confirmedLayoutDirection = confirmedLayoutDirection;
    for (NativeRenderObjectView *subviews in self.subcomponents) {
        [subviews applyConfirmedLayoutDirectionToSubviews:confirmedLayoutDirection];
    }
}

- (BOOL)isLayoutSubviewsRTL {
    BOOL layoutRTL = hippy::Direction::RTL == self.confirmedLayoutDirection;
    return layoutRTL;
}

- (void)checkLayoutDirection:(NSMutableSet<NativeRenderObjectView *> *)viewsSet direction:(hippy::Direction *)direction{
    if (hippy::Direction::Inherit == self.confirmedLayoutDirection) {
        [viewsSet addObject:self];
        NativeRenderObjectView *shadowSuperview = [self parentComponent];
        if (!shadowSuperview) {
            if (direction) {
                NSWritingDirection writingDirection =
                    [[HPI18nUtils sharedInstance] writingDirectionForCurrentAppLanguage];
                *direction = NSWritingDirectionRightToLeft == writingDirection ? hippy::Direction::RTL : hippy::Direction::LTR;
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

- (void)superviewLayoutDirectionChangedTo:(hippy::Direction)direction {
    if (hippy::Direction::Inherit == self.layoutDirection) {
        self.confirmedLayoutDirection = [self superview].confirmedLayoutDirection;
        for (NativeRenderObjectView *subview in self.subcomponents) {
            [subview superviewLayoutDirectionChangedTo:self.confirmedLayoutDirection];
        }
    }
}

@end
