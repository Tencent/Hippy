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

#import "UIView+Hippy.h"
#import <objc/runtime.h>
#import "NativeRenderObjectView.h"
#import "UIView+MountEvent.h"

@implementation UIView (Hippy)

- (NSNumber *)hippyTag {
    return objc_getAssociatedObject(self, _cmd);
}

- (void)setHippyTag:(NSNumber *)hippyTag {
    objc_setAssociatedObject(self, @selector(hippyTag), hippyTag, OBJC_ASSOCIATION_COPY_NONATOMIC);
}

- (NSNumber *)rootTag {
    return objc_getAssociatedObject(self, _cmd);
}

- (void)setRootTag:(NSNumber *)rootTag {
    objc_setAssociatedObject(self, @selector(rootTag), rootTag, OBJC_ASSOCIATION_COPY_NONATOMIC);
}

- (NSDictionary *)props {
    return objc_getAssociatedObject(self, _cmd);
}

- (void)setProps:(NSDictionary *)props {
    objc_setAssociatedObject(self, @selector(props), props, OBJC_ASSOCIATION_COPY_NONATOMIC);
}

- (NSNumber *)viewName {
    return objc_getAssociatedObject(self, _cmd);
}

- (void)setViewName:(NSString *)viewName {
    objc_setAssociatedObject(self, @selector(viewName), viewName, OBJC_ASSOCIATION_COPY_NONATOMIC);
}

- (NSString *)tagName {
    return objc_getAssociatedObject(self, _cmd);
}

- (void)setTagName:(NSString *)tagName {
    objc_setAssociatedObject(self, @selector(tagName), tagName, OBJC_ASSOCIATION_COPY_NONATOMIC);
}

- (void)setParent:(id<HippyComponent>)parent {
//    self.superview = parent;
}

- (id<HippyComponent>)parent {
    return self.superview;
}

- (__kindof NativeRenderObjectView *)nativeRenderObjectView {
    NSHashTable *hashTable = objc_getAssociatedObject(self, _cmd);
    return [hashTable anyObject];
}

- (void)setNativeRenderObjectView:(__kindof NativeRenderObjectView *)renderObject {
    NSHashTable *hashTable = [NSHashTable weakObjectsHashTable];
    if (renderObject) {
        [hashTable addObject:renderObject];
    }
    objc_setAssociatedObject(self, @selector(nativeRenderObjectView), hashTable, OBJC_ASSOCIATION_RETAIN);
}

- (BOOL)isHippyRootView {
    return HippyIsHippyRootView(self.hippyTag);
}

- (NSNumber *)hippyTagAtPoint:(CGPoint)point {
    UIView *view = [self hitTest:point withEvent:nil];
    while (view && !view.hippyTag) {
        view = view.superview;
    }
    return view.hippyTag;
}

- (NSArray<UIView *> *)hippySubviews {
    return objc_getAssociatedObject(self, _cmd);
}

- (UIView *)hippySuperview {
    return self.superview;
}

- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    // We access the associated object directly here in case someone overrides
    // the `hippySubviews` getter method and returns an immutable array.
    if (nil == subview) {
        return;
    }
    NSMutableArray *subviews = objc_getAssociatedObject(self, @selector(hippySubviews));
    if (!subviews) {
        subviews = [NSMutableArray new];
        objc_setAssociatedObject(self, @selector(hippySubviews), subviews, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }

    if (atIndex <= [subviews count]) {
        [subviews insertObject:subview atIndex:atIndex];
    }
    else {
        [subviews addObject:subview];
    }
}

- (void)removeHippySubview:(UIView *)subview {
    // We access the associated object directly here in case someone overrides
    // the `hippySubviews` getter method and returns an immutable array.
    NSMutableArray *subviews = objc_getAssociatedObject(self, @selector(hippySubviews));
    [subviews removeObject:subview];
    [subview sendDetachedFromWindowEvent];
    [subview removeFromSuperview];
}

- (void)removeFromHippySuperview {
    [self.hippySuperview removeHippySubview:self];
}

- (void)resetHippySubviews {
    NSMutableArray *subviews = objc_getAssociatedObject(self, @selector(hippySubviews));
    if (subviews) {
        [subviews makeObjectsPerformSelector:@selector(sendDetachedFromWindowEvent)];
        [subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
        [subviews removeAllObjects];
    }
    [self clearSortedSubviews];
}

- (UIView *)hippyRootView {
    UIView *candidateRootView = self;
    BOOL isHippyRootView = [candidateRootView isHippyRootView];
    while (!isHippyRootView && !candidateRootView) {
        candidateRootView = [candidateRootView superview];
        isHippyRootView = [candidateRootView isHippyRootView];
    }
    return candidateRootView;
}

- (UIView *)nextResponseViewAtPoint:(CGPoint)point {
    UIView *superView = [self superview];
    if (superView && self.hippyTag) {
        NSArray<UIView *> *subviews = [superView subviews];
        NSUInteger index = [subviews indexOfObject:self];
        if (0 != index) {
            for (NSInteger i = index - 1; i >= 0; i--) {
                UIView *siblingView = subviews[i];
                CGPoint pointInsiblingView = [self convertPoint:point toView:siblingView];
                BOOL pointInside = [siblingView pointInside:pointInsiblingView withEvent:nil];
                if (pointInside) {
                    UIView *hitTestView = [siblingView hitTest:pointInsiblingView withEvent:nil];
                    return hitTestView ? hitTestView : siblingView;
                }
            }
        }
    }
    return superView;
}

- (NSInteger)hippyZIndex {
    return [objc_getAssociatedObject(self, _cmd) integerValue];
}

- (void)setHippyZIndex:(NSInteger)hippyZIndex {
    objc_setAssociatedObject(self, @selector(hippyZIndex), @(hippyZIndex), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (BOOL)isHippySubviewsUpdated {
    return [objc_getAssociatedObject(self, _cmd) integerValue];
}

- (void)setHippySubviewsUpdated:(BOOL)hippySubViewsUpdated {
    objc_setAssociatedObject(self, @selector(isHippySubviewsUpdated), @(hippySubViewsUpdated), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (NSArray<UIView *> *)sortedHippySubviews {
    NSArray *subviews = objc_getAssociatedObject(self, _cmd);
    if (!subviews) {
        // Check if sorting is required - in most cases it won't be
        BOOL sortingRequired = NO;
        for (UIView *subview in self.hippySubviews) {
            if (subview.hippyZIndex != 0) {
                sortingRequired = YES;
                break;
            }
        }
        subviews = sortingRequired ? [self.hippySubviews sortedArrayUsingComparator:^NSComparisonResult(UIView *a, UIView *b) {
            if (a.hippyZIndex > b.hippyZIndex) {
                return NSOrderedDescending;
            } else {
                // ensure sorting is stable by treating equal zIndex as ascending so
                // that original order is preserved
                return NSOrderedAscending;
            }
        }] : self.hippySubviews;
        objc_setAssociatedObject(self, _cmd, subviews, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    return subviews;
}

- (void)clearSortedSubviews {
    objc_setAssociatedObject(self, @selector(sortedHippySubviews), nil, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (void)didUpdateHippySubviews {
    for (UIView *subview in self.sortedHippySubviews) {
        if (subview.superview != self) {
            [subview sendAttachedToWindowEvent];
        }

        [self addSubview:subview];
    }
}

- (void)hippySetFrame:(CGRect)frame {
    // These frames are in terms of anchorPoint = topLeft, but internally the
    // views are anchorPoint = center for easier scale and rotation animations.
    // Convert the frame so it works with anchorPoint = center.
    CGPoint position = { CGRectGetMidX(frame), CGRectGetMidY(frame) };
    CGRect bounds = { CGPointZero, frame.size };

    // Avoid crashes due to nan coords
    if (isnan(position.x) || isnan(position.y) || isnan(bounds.origin.x) || isnan(bounds.origin.y) || isnan(bounds.size.width)
        || isnan(bounds.size.height)) {
        //HippyLogError(
//            @"Invalid layout for (%@)%@. position: %@. bounds: %@", self.hippyTag, self, NSStringFromCGPoint(position), NSStringFromCGRect(bounds));
        return;
    }

    //  self.center = position;
    //  self.bounds = bounds;

    self.frame = frame;
}

- (void)hippySetInheritedBackgroundColor:(__unused UIColor *)inheritedBackgroundColor {
    // Does nothing by default
}

- (UIViewController *)hippyViewController {
    id responder = [self nextResponder];
    while (responder) {
        if ([responder isKindOfClass:[UIViewController class]]) {
            return responder;
        }
        responder = [responder nextResponder];
    }
    return nil;
}

- (BOOL)canBeRetrievedFromViewCache {
    return YES;
}

- (void)hippyAddControllerToClosestParent:(UIViewController *)controller {
    if (!controller.parentViewController) {
        UIView *parentView = (UIView *)self.hippySuperview;
        while (parentView) {
            if (parentView.hippyViewController) {
                [parentView.hippyViewController addChildViewController:controller];
                [controller didMoveToParentViewController:parentView.hippyViewController];
                break;
            }
            parentView = (UIView *)parentView.hippySuperview;
        }
        return;
    }
}

- (BOOL)interceptTouchEvent {
    return NO;
}

@end
