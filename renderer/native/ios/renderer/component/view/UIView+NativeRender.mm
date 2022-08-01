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

#import "UIView+NativeRender.h"
#import <objc/runtime.h>
#import "NativeRenderObjectView.h"
#import "UIView+MountEvent.h"
#import "NativeRenderLog.h"

@implementation UIView (NativeRender)

- (NSNumber *)componentTag {
    return objc_getAssociatedObject(self, _cmd);
}

- (void)setComponentTag:(NSNumber *)tag {
    objc_setAssociatedObject(self, @selector(componentTag), tag, OBJC_ASSOCIATION_COPY_NONATOMIC);
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

- (void)setParent:(id<NativeRenderComponentProtocol>)parent {
//    self.superview = parent;
}

- (id<NativeRenderComponentProtocol>)parent {
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

- (BOOL)isNativeRenderRootView {
    return NativeRenderIsRootView(self.componentTag);
}

- (NSNumber *)componentTagAtPoint:(CGPoint)point {
    UIView *view = [self hitTest:point withEvent:nil];
    while (view && !view.componentTag) {
        view = view.superview;
    }
    return view.componentTag;
}

- (NSArray<UIView *> *)nativeRenderSubviews {
    return objc_getAssociatedObject(self, _cmd);
}

- (UIView *)nativeRenderSuperview {
    return self.superview;
}

- (void)insertNativeRenderSubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    // We access the associated object directly here in case someone overrides
    // the `nativeRenderSubviews` getter method and returns an immutable array.
    if (nil == subview) {
        return;
    }
    NSMutableArray *subviews = objc_getAssociatedObject(self, @selector(nativeRenderSubviews));
    if (!subviews) {
        subviews = [NSMutableArray new];
        objc_setAssociatedObject(self, @selector(nativeRenderSubviews), subviews, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }

    if (atIndex <= [subviews count]) {
        [subviews insertObject:subview atIndex:atIndex];
    }
    else {
        [subviews addObject:subview];
    }
}

- (void)removeNativeRenderSubview:(UIView *)subview {
    // We access the associated object directly here in case someone overrides
    // the `nativeRenderSubviews` getter method and returns an immutable array.
    NSMutableArray *subviews = objc_getAssociatedObject(self, @selector(nativeRenderSubviews));
    [subviews removeObject:subview];
    [subview sendDetachedFromWindowEvent];
    [subview removeFromSuperview];
}

- (void)removeFromNativeRenderSuperview {
    [self.nativeRenderSuperview removeNativeRenderSubview:self];
}

- (void)resetNativeRenderSubviews {
    NSMutableArray *subviews = objc_getAssociatedObject(self, @selector(nativeRenderSubviews));
    if (subviews) {
        [subviews makeObjectsPerformSelector:@selector(sendDetachedFromWindowEvent)];
        [subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
        [subviews removeAllObjects];
    }
    [self clearSortedSubviews];
}

- (UIView *)NativeRenderRootView {
    UIView *candidateRootView = self;
    BOOL isRootView = [candidateRootView isNativeRenderRootView];
    while (!isRootView && !candidateRootView) {
        candidateRootView = [candidateRootView superview];
        isRootView = [candidateRootView isNativeRenderRootView];
    }
    return candidateRootView;
}

- (NSInteger)nativeRenderZIndex {
    return [objc_getAssociatedObject(self, _cmd) integerValue];
}

- (void)setNativeRenderZIndex:(NSInteger)zIndex {
    objc_setAssociatedObject(self, @selector(nativeRenderZIndex), @(zIndex), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (BOOL)isNativeRenderSubviewsUpdated {
    return [objc_getAssociatedObject(self, _cmd) integerValue];
}

- (void)setNativeRenderSubviewsUpdated:(BOOL)subViewsUpdated {
    objc_setAssociatedObject(self, @selector(isNativeRenderSubviewsUpdated), @(subViewsUpdated), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (NSArray<UIView *> *)sortedNativeRenderSubviews {
    NSArray *subviews = objc_getAssociatedObject(self, _cmd);
    if (!subviews) {
        // Check if sorting is required - in most cases it won't be
        BOOL sortingRequired = NO;
        for (UIView *subview in self.nativeRenderSubviews) {
            if (subview.nativeRenderZIndex != 0) {
                sortingRequired = YES;
                break;
            }
        }
        subviews = sortingRequired ? [self.nativeRenderSubviews sortedArrayUsingComparator:^NSComparisonResult(UIView *a, UIView *b) {
            if (a.nativeRenderZIndex > b.nativeRenderZIndex) {
                return NSOrderedDescending;
            } else {
                // ensure sorting is stable by treating equal zIndex as ascending so
                // that original order is preserved
                return NSOrderedAscending;
            }
        }] : self.nativeRenderSubviews;
        objc_setAssociatedObject(self, _cmd, subviews, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    return subviews;
}

- (void)clearSortedSubviews {
    objc_setAssociatedObject(self, @selector(sortedNativeRenderSubviews), nil, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (void)didUpdateNativeRenderSubviews {
    for (UIView *subview in self.sortedNativeRenderSubviews) {
        if (subview.superview != self) {
            [subview sendAttachedToWindowEvent];
        }

        [self addSubview:subview];
    }
}

- (void)nativeRenderSetFrame:(CGRect)frame {
    // These frames are in terms of anchorPoint = topLeft, but internally the
    // views are anchorPoint = center for easier scale and rotation animations.
    // Convert the frame so it works with anchorPoint = center.
    CGPoint position = { CGRectGetMidX(frame), CGRectGetMidY(frame) };
    CGRect bounds = { CGPointZero, frame.size };

    // Avoid crashes due to nan coords
    if (isnan(position.x) || isnan(position.y) || isnan(bounds.origin.x) || isnan(bounds.origin.y) || isnan(bounds.size.width)
        || isnan(bounds.size.height)) {
        NativeRenderLogError(
            @"Invalid layout for (%@)%@. position: %@. bounds: %@", self.componentTag, self, NSStringFromCGPoint(position), NSStringFromCGRect(bounds));
        return;
    }

    //  self.center = position;
    //  self.bounds = bounds;

    self.frame = frame;
}

- (void)nativeRenderSetInheritedBackgroundColor:(__unused UIColor *)inheritedBackgroundColor {
    // Does nothing by default
}

- (UIViewController *)nativeRenderViewController {
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

- (void)NativeRenderAddControllerToClosestParent:(UIViewController *)controller {
    if (!controller.parentViewController) {
        UIView *parentView = (UIView *)self.nativeRenderSuperview;
        while (parentView) {
            if (parentView.nativeRenderViewController) {
                [parentView.nativeRenderViewController addChildViewController:controller];
                [controller didMoveToParentViewController:parentView.nativeRenderViewController];
                break;
            }
            parentView = (UIView *)parentView.nativeRenderSuperview;
        }
        return;
    }
}

- (BOOL)interceptTouchEvent {
    return NO;
}

@end
