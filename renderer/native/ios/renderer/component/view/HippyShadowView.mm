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
#import "HippyAssert.h"
#import "HippyRenderUtils.h"


@implementation HippyShadowView

@synthesize hippyTag = _hippyTag;
@synthesize props = _props;
@synthesize rootTag = _rootTag;
@synthesize tagName = _tagName;
@synthesize viewName = _viewName;

- (void)amendLayoutBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)blocks {
    // Skip processing if layout has already been computed in this batch
    if (_isLayoutComputed) {
        return;
    }
    
    // Process any updated properties before mounting
    [self processUpdatedPropertiesBeforeMount:blocks];
    
    // Mark as computed to prevent redundant processing
    _isLayoutComputed = YES;
    
    // Recursively process subviews
    for (HippyShadowView *subShadowView in self.hippySubviews) {
        [subShadowView amendLayoutBeforeMount:blocks];
    }
}

- (void)processUpdatedPropertiesBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)applierBlocks {
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
}

- (instancetype)init {
    if ((self = [super init])) {
        _isLayoutComputed = NO;
        _frame = CGRectMake(0, 0, NAN, NAN);
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

- (void)markLayoutDirty {
    // Mark this view as needing layout processing
    _isLayoutComputed = NO;
    // Note: We don't propagate to parent anymore as it provides no benefit.
    // Layout calculation always starts from root and traverses the entire tree.
}

- (BOOL)isLayoutComputed {
    return _isLayoutComputed;
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

- (void)synchronousRecursivelySetCreationTypeToInstant {
    self.creationType = HippyCreationTypeInstantly;
    for (HippyShadowView *subShadowView in self.hippySubviews) {
        [subShadowView synchronousRecursivelySetCreationTypeToInstant];
    }
}

- (UIView *)createView:(HippyViewCreationBlock)creationBlock insertChildren:(HippyViewInsertionBlock)insertionBlock {
    UIView *container = creationBlock(self);
    NSMutableArray *children = [NSMutableArray arrayWithCapacity:[self.hippySubviews count]];
    for (HippyShadowView *subviews in self.hippySubviews) {
        UIView *subview = [subviews createView:creationBlock insertChildren:insertionBlock];
        if (subview) {
            [children addObject:subview];
        }
    }
    insertionBlock(container, children);
    return container;
}

- (void)insertHippySubview:(HippyShadowView *)subview atIndex:(NSUInteger)atIndex {
    if (!subview) {
        HippyAssert(subview != nil, @"subview should not be nil!");
        HippyFatal(HippyErrorWithMessage(@"Illegal nil shadow subview in insertHippySubview!"));
        return;
    }

    @synchronized (self) {
        if (!_shadowSubviews) {
            _shadowSubviews = [NSMutableArray array];
        }
        
        if (atIndex <= [_shadowSubviews count]) {
            [_shadowSubviews insertObject:subview atIndex:atIndex];
        } else {
            [_shadowSubviews addObject:subview];
        }
    }
    
    subview->_superview = self;
    _didUpdateSubviews = YES;
    [self dirtyText:NO];
    [self markLayoutDirty];
}

- (void)moveHippySubview:(id<HippyComponent>)subview toIndex:(NSUInteger)atIndex {
    if (!subview) {
        HippyAssert(subview != nil, @"subview should not be nil!");
        return;
    }
    [self removeHippySubview:subview];
    [self insertHippySubview:subview atIndex:atIndex];
}

- (void)removeHippySubview:(HippyShadowView *)subview {
    [subview dirtyText:NO];
    [subview markLayoutDirty];
    _didUpdateSubviews = YES;
    subview->_superview = nil;
    
    @synchronized (self) {
        [_shadowSubviews removeObject:subview];
    }
}

- (void)removeFromHippySuperview {
    id superview = [self parent];
    [superview removeHippySubview:self];
}

- (NSArray<HippyShadowView *> *)hippySubviews {
    NSArray<HippyShadowView *> *subviews;
    @synchronized (self) {
        subviews = _shadowSubviews.copy ?: @[];
    }
    return subviews;
}

- (HippyShadowView *)parent {
    return _superview;
}

- (void)setParent:(id<HippyComponent>)parent {
    _superview = parent;
}

- (NSNumber *)hippyTagAtPoint:(CGPoint)point {
    for (HippyShadowView *renderObject in self.hippySubviews) {
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

    for (HippyShadowView *subview in self.hippySubviews) {
        [subview addRecursiveDescriptionToString:string atLevel:level + 1];
    }
}

- (NSString *)recursiveDescription {
    NSMutableString *description = [NSMutableString string];
    [self addRecursiveDescriptionToString:description atLevel:0];
    return description;
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
    if (HippyCGRectRoundInPixelNearlyEqual(currentFrame, frame)) {
        return;
    }
    [self setFrame:frame];
    auto domManager = self.domManager.lock();
    if (domManager) {
        __weak HippyShadowView *weakSelf = self;
        std::vector<std::function<void()>> ops = {[weakSelf, domManager, frame, dirtyPropagation](){
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
                [strongSelf markLayoutDirty];
            }
            renderManager->EndBatch(strongSelf.rootNode);
        }};
        domManager->PostTask(hippy::dom::Scene(std::move(ops)));
    }
}

- (void)setBackgroundColor:(UIColor *)color {
    _backgroundColor = color;
    [self markLayoutDirty];
}

- (void)setZIndex:(NSInteger)zIndex {
    _zIndex = zIndex;
    HippyShadowView *superShadowView = _superview;
    if (superShadowView) {
        // Changing zIndex means the subview order of the parent needs updating
        superShadowView->_didUpdateSubviews = YES;
        [superShadowView markLayoutDirty];
    }
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
    for (HippyShadowView *subviews in self.hippySubviews) {
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
        for (HippyShadowView *subview in self.hippySubviews) {
            [subview superviewLayoutDirectionChangedTo:self.confirmedLayoutDirection];
        }
    }
}

#pragma mark - Layout Style Getters

- (CGSize)getStyleSize {
    CGFloat width = NAN;
    CGFloat height = NAN;
    
    auto domManager = [self domManager].lock();
    if (domManager) {
        int32_t componentTag = [self.hippyTag intValue];
        auto domNode = domManager->GetNode(self.rootNode, componentTag);
        if (domNode) {
            width = domNode->GetLayoutNode()->GetStyleWidth();
            height = domNode->GetLayoutNode()->GetStyleHeight();
        }
    }
    
    return CGSizeMake(width, height);
}

- (CGFloat)getStyleWidth {
    CGFloat width = NAN;
    
    auto domManager = [self domManager].lock();
    if (domManager) {
        int32_t componentTag = [self.hippyTag intValue];
        auto domNode = domManager->GetNode(self.rootNode, componentTag);
        if (domNode) {
            width = domNode->GetLayoutNode()->GetStyleWidth();
        }
    }
    
    return width;
}

- (CGFloat)getStyleHeight {
    CGFloat height = NAN;
    
    auto domManager = [self domManager].lock();
    if (domManager) {
        int32_t componentTag = [self.hippyTag intValue];
        auto domNode = domManager->GetNode(self.rootNode, componentTag);
        if (domNode) {
            height = domNode->GetLayoutNode()->GetStyleHeight();
        }
    }
    
    return height;
}

- (UIEdgeInsets)paddingAsInsets {
    UIEdgeInsets insets = UIEdgeInsetsZero;
    insets = UIEdgeInsetsFromLayoutResult(_nodeLayoutResult);
    return insets;
}

@end
