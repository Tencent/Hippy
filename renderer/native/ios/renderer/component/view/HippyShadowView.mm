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
#import "HippyDomUtils.h"
#import "HippyI18nUtils.h"
#import "HippyShadowView.h"
#import "UIView+DirectionalLayout.h"
#import "UIView+Hippy.h"
#import "HippyShadowView+Internal.h"


static NSString *const HippyBackgroundColorPropKey = @"backgroundColor";

@implementation HippyShadowView

@synthesize hippyTag = _hippyTag;
@synthesize props = _props;
@synthesize rootTag = _rootTag;
@synthesize tagName = _tagName;
@synthesize viewName = _viewName;

- (void)amendLayoutBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)blocks {
    if (NativeRenderUpdateLifecycleComputed == _propagationLifecycle) {
        return;
    }
    _propagationLifecycle = NativeRenderUpdateLifecycleComputed;
    for (HippyShadowView *renderObjectView in self.subcomponents) {
        [renderObjectView amendLayoutBeforeMount:blocks];
    }
}

- (NSDictionary<NSString *, id> *)processUpdatedProperties:(NSMutableSet<NativeRenderApplierBlock> *)applierBlocks
                                          parentProperties:(NSDictionary<NSString *, id> *)parentProperties {
    if (_didUpdateSubviews) {
        _didUpdateSubviews = NO;
        [self didUpdateHippySubviews];
        [applierBlocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry, UIView * _Nullable lazyCreatedView) {
            UIView *view = lazyCreatedView ?: viewRegistry[self->_hippyTag];
            [view clearSortedSubviews];
            [view didUpdateHippySubviews];
        }];
    }
    if (_confirmedLayoutDirectionDidUpdated) {
        hippy::Direction direction = [self confirmedLayoutDirection];
        [applierBlocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry, UIView * _Nullable lazyCreatedView) {
            UIView *view = lazyCreatedView ?: viewRegistry[self->_hippyTag];
            [view applyLayoutDirectionFromParent:direction];
        }];
        _confirmedLayoutDirectionDidUpdated = NO;
    }
    if (!_backgroundColor) {
        UIColor *parentBackgroundColor = parentProperties[HippyBackgroundColorPropKey];
        if (parentBackgroundColor) {
            [applierBlocks addObject:^(NSDictionary<NSNumber *, UIView *> *viewRegistry, UIView * _Nullable lazyCreatedView) {
                UIView *view = lazyCreatedView ?: viewRegistry[self->_hippyTag];
                [view hippySetInheritedBackgroundColor:parentBackgroundColor];
            }];
        }
    } else {
        // Update parent properties for children
        NSMutableDictionary<NSString *, id> *properties = [NSMutableDictionary dictionaryWithDictionary:parentProperties];
        CGFloat alpha = CGColorGetAlpha(_backgroundColor.CGColor);
        if (alpha < 1.0) {
            // If bg is non-opaque, don't propagate further
            properties[HippyBackgroundColorPropKey] = [UIColor clearColor];
        } else {
            properties[HippyBackgroundColorPropKey] = _backgroundColor;
        }
        return properties;
    }
    return parentProperties;
}

- (instancetype)init {
    if ((self = [super init])) {
        _propagationLifecycle = NativeRenderUpdateLifecycleUninitialized;
        _frame = CGRectMake(0, 0, NAN, NAN);
        _objectSubviews = [NSMutableArray arrayWithCapacity:8];
        _confirmedLayoutDirection = hippy::Direction::Inherit;
        _layoutDirection = hippy::Direction::Inherit;
    }
    return self;
}

- (BOOL)isHippyRootView {
    return HippyIsHippyRootView(self.hippyTag);
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
    if ([self parent]) {
        [(HippyShadowView *)[self parent] dirtyText:needToDoLayout];
    }
}

- (BOOL)isTextDirty {
    return NO;
}

- (HippyCreationType)creationType {
    if (HippyCreationTypeUndetermined == _creationType) {
        HippyShadowView *superRenderObject = [self parent];
        if (superRenderObject && ![superRenderObject isHippyRootView]) {
            _creationType = [superRenderObject creationType];
        }
        else {
            _creationType = HippyCreationTypeInstantly;
        }
    }
    return _creationType;
}

- (void)setTextComputed {
//    _textLifecycle = NativeRenderUpdateLifecycleComputed;
}

- (void)synchronousRecusivelySetCreationTypeToInstant {
    self.creationType = HippyCreationTypeInstantly;
    for (HippyShadowView *subShadowView in self.subcomponents) {
        [subShadowView synchronousRecusivelySetCreationTypeToInstant];
    }
}

- (UIView *)createView:(HippyViewCreationBlock)creationBlock insertChildren:(HippyViewInsertionBlock)insertionBlock {
    UIView *container = creationBlock(self);
    NSMutableArray *children = [NSMutableArray arrayWithCapacity:[self.subcomponents count]];
    for (HippyShadowView *subviews in self.subcomponents) {
        UIView *subview = [subviews createView:creationBlock insertChildren:insertionBlock];
        if (subview) {
            [children addObject:subview];
        }
    }
    insertionBlock(container, children);
    return container;
}

- (void)insertHippySubview:(HippyShadowView *)subview atIndex:(NSInteger)atIndex {
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

- (void)moveHippySubview:(id<HippyComponent>)subview toIndex:(NSInteger)atIndex {
    if ([_objectSubviews containsObject:subview]) {
        [_objectSubviews removeObject:subview];
    }
    [self insertHippySubview:subview atIndex:atIndex];
}

- (void)removeHippySubview:(HippyShadowView *)subview {
    [subview dirtyText:NO];
    [subview dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
    _didUpdateSubviews = YES;
    subview->_superview = nil;
    [_objectSubviews removeObject:subview];
}

- (void)removeFromHippySuperview {
    id superview = [self parent];
    [superview removeHippySubview:self];
}

- (NSArray<HippyShadowView *> *)subcomponents {
    return _objectSubviews;
}

- (HippyShadowView *)parent {
    return _superview;
}

- (void)setParent:(id<HippyComponent>)parent {
    _superview = parent;
}

- (NSNumber *)hippyTagAtPoint:(CGPoint)point {
    for (HippyShadowView *renderObject in _objectSubviews) {
        if (CGRectContainsPoint(renderObject.frame, point)) {
            CGPoint relativePoint = point;
            CGPoint origin = renderObject.frame.origin;
            relativePoint.x -= origin.x;
            relativePoint.y -= origin.y;
            return [renderObject hippyTagAtPoint:relativePoint];
        }
    }
    return self.hippyTag;
}

- (NSString *)description {
    NSString *description = super.description;
    description = [[description substringToIndex:description.length - 1]
        stringByAppendingFormat:@"; viewName: %@; componentTag: %@; frame: %@>", self.viewName, self.hippyTag, NSStringFromCGRect(self.frame)];
    return description;
}

- (void)addRecursiveDescriptionToString:(NSMutableString *)string atLevel:(NSUInteger)level {
    for (NSUInteger i = 0; i < level; i++) {
        [string appendString:@"  | "];
    }

    [string appendString:self.description];
    [string appendString:@"\n"];

    for (HippyShadowView *subview in _objectSubviews) {
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
        __weak HippyShadowView *weakSelf = self;
        std::vector<std::function<void()>> ops = {[weakSelf, domManager, frame, dirtyPropagation](){
            @autoreleasepool {
                HippyShadowView *strongSelf = weakSelf;
                if (!strongSelf) {
                    return;
                }
                int32_t componentTag = [[strongSelf hippyTag] intValue];
                auto node = domManager->GetNode(strongSelf.rootNode, componentTag);
                auto renderManager = domManager->GetRenderManager().lock();
                if (!node || !renderManager) {
                    return;
                }
                node->SetLayoutOrigin(frame.origin.x, frame.origin.y);
                node->SetLayoutSize(frame.size.width, frame.size.height);
                std::vector<std::shared_ptr<hippy::DomNode>> changed_nodes;
                node->DoLayout(changed_nodes);
                if (!changed_nodes.empty()) {
                    renderManager->UpdateLayout(strongSelf.rootNode, changed_nodes);
                }
                if (dirtyPropagation) {
                    [strongSelf dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
                }
                renderManager->EndBatch(strongSelf.rootNode);
            }
        }};
        domManager->PostTask(hippy::dom::Scene(std::move(ops)));
    }
}

- (void)setBackgroundColor:(UIColor *)color {
    _backgroundColor = color;
    [self dirtyPropagation:NativeRenderUpdateLifecyclePropsDirtied];
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
    for (HippyShadowView *subviews in self.subcomponents) {
        [subviews applyConfirmedLayoutDirectionToSubviews:confirmedLayoutDirection];
    }
}

- (BOOL)isLayoutSubviewsRTL {
    BOOL layoutRTL = hippy::Direction::RTL == self.confirmedLayoutDirection;
    return layoutRTL;
}

- (void)checkLayoutDirection:(NSMutableSet<HippyShadowView *> *)viewsSet direction:(hippy::Direction *)direction{
    if (hippy::Direction::Inherit == self.confirmedLayoutDirection) {
        [viewsSet addObject:self];
        HippyShadowView *shadowSuperview = [self parent];
        if (!shadowSuperview) {
            if (direction) {
                NSWritingDirection writingDirection =
                    [[HippyI18nUtils sharedInstance] writingDirectionForCurrentAppLanguage];
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
        self.confirmedLayoutDirection = ((HippyShadowView *)[self parent]).confirmedLayoutDirection;
        for (HippyShadowView *subview in self.subcomponents) {
            [subview superviewLayoutDirectionChangedTo:self.confirmedLayoutDirection];
        }
    }
}

@end
