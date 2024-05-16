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
#import "HippyShadowView.h"
#import "UIView+MountEvent.h"
#import "HippyLog.h"


#define HippyEventMethod(name, value, type)                                               \
-(void)set##name : (type)value {                                                          \
objc_setAssociatedObject(self, @selector(value), value, OBJC_ASSOCIATION_COPY_NONATOMIC); \
}                                                                                         \
-(type)value {                                                                            \
return objc_getAssociatedObject(self, _cmd);                                              \
}


@implementation UIView (Hippy)


#pragma mark - Event Related

HippyEventMethod(OnClick, onClick, OnTouchEventHandler)
HippyEventMethod(OnPressIn, onPressIn, OnTouchEventHandler)
HippyEventMethod(OnPressOut, onPressOut, OnTouchEventHandler)
HippyEventMethod(OnLongClick, onLongClick, OnTouchEventHandler)
HippyEventMethod(OnTouchDown, onTouchDown, OnTouchEventHandler)
HippyEventMethod(OnTouchMove, onTouchMove, OnTouchEventHandler)
HippyEventMethod(OnTouchCancel, onTouchCancel, OnTouchEventHandler)
HippyEventMethod(OnTouchEnd, onTouchEnd, OnTouchEventHandler)
//HippyEventMethod(OnAttachedToWindow, onAttachedToWindow, HippyDirectEventBlock)
//HippyEventMethod(OnDetachedFromWindow, onDetachedFromWindow, HippyDirectEventBlock)

- (BOOL)onInterceptTouchEvent {
    return [objc_getAssociatedObject(self, _cmd) boolValue];
}

- (void)setOnInterceptTouchEvent:(BOOL)onInterceptTouchEvent {
    objc_setAssociatedObject(self, @selector(onInterceptTouchEvent), @(onInterceptTouchEvent), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (BOOL)onInterceptPullUpEvent {
    return [objc_getAssociatedObject(self, _cmd) boolValue];
}

- (void)setOnInterceptPullUpEvent:(BOOL)onInterceptPullUpEvent {
    objc_setAssociatedObject(self, @selector(onInterceptPullUpEvent), @(onInterceptPullUpEvent), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}


#pragma mark -

- (NSNumber *)hippyTag {
    return objc_getAssociatedObject(self, _cmd);
}

- (void)setHippyTag:(NSNumber *)tag {
    objc_setAssociatedObject(self, @selector(hippyTag), tag, OBJC_ASSOCIATION_COPY_NONATOMIC);
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

- (__kindof HippyShadowView *)hippyShadowView {
    @synchronized (self) {
        NSHashTable *hashTable = objc_getAssociatedObject(self, _cmd);
        return [hashTable anyObject];
    }
}

- (void)setHippyShadowView:(__kindof HippyShadowView *)renderObject {
    @synchronized (self) {
        NSHashTable *hashTable = [NSHashTable weakObjectsHashTable];
        if (renderObject) {
            [hashTable addObject:renderObject];
        }
        objc_setAssociatedObject(self, @selector(hippyShadowView), hashTable, OBJC_ASSOCIATION_RETAIN);
    }
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

- (NSArray<UIView *> *)subcomponents {
    return objc_getAssociatedObject(self, _cmd);
}

- (UIView *)parent {
    return [objc_getAssociatedObject(self, _cmd) anyObject];
}

- (void)setParent:(id<HippyComponent>)parent {
    if (parent) {
        NSHashTable *hashTable = [NSHashTable weakObjectsHashTable];
        [hashTable addObject:parent];
        objc_setAssociatedObject(self, @selector(parent), hashTable, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    } else {
        objc_setAssociatedObject(self, @selector(parent), nil, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
}

- (void)insertHippySubview:(UIView *)subview atIndex:(NSUInteger)atIndex {
    // We access the associated object directly here in case someone overrides
    // the `subcomponents` getter method and returns an immutable array.
    if (nil == subview) {
        return;
    }
    NSMutableArray *subviews = objc_getAssociatedObject(self, @selector(subcomponents));
    if (!subviews) {
        subviews = [NSMutableArray new];
        objc_setAssociatedObject(self, @selector(subcomponents), subviews, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }

    if (atIndex <= [subviews count]) {
        [subviews insertObject:subview atIndex:atIndex];
    } else {
        [subviews addObject:subview];
    }
    subview.parent = self;
}

- (void)moveHippySubview:(UIView *)subview toIndex:(NSUInteger)atIndex {
    if (nil == subview) {
        return;
    }
    [self removeHippySubview:subview];
    [self insertHippySubview:subview atIndex:atIndex];
}

- (void)removeHippySubview:(UIView *)subview {
    // We access the associated object directly here in case someone overrides
    // the `subcomponents` getter method and returns an immutable array.
    NSMutableArray *subviews = objc_getAssociatedObject(self, @selector(subcomponents));
    [subviews removeObject:subview];
    [subview sendDetachedFromWindowEvent];
    [subview removeFromSuperview];
    subview.parent = nil;
}

- (void)removeFromHippySuperview {
    [(UIView *)self.parent removeHippySubview:self];
}

- (void)resetHippySubviews {
    NSMutableArray *subviews = objc_getAssociatedObject(self, @selector(subcomponents));
    if (subviews) {
        [subviews makeObjectsPerformSelector:@selector(sendDetachedFromWindowEvent)];
        [subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
        [subviews removeAllObjects];
    }
    [self clearSortedSubviews];
}

- (HippyRootView *)hippyRootView {
    UIView *candidateRootView = self;
    BOOL isRootView = [candidateRootView isHippyRootView];
    while (!isRootView && candidateRootView) {
        candidateRootView = [candidateRootView parent];
        isRootView = [candidateRootView isHippyRootView];
    }
    return isRootView ? (HippyRootView *)candidateRootView.superview : nil;
}

- (NSInteger)hippyZIndex {
    return [objc_getAssociatedObject(self, _cmd) integerValue];
}

- (void)setHippyZIndex:(NSInteger)zIndex {
    objc_setAssociatedObject(self, @selector(hippyZIndex), @(zIndex), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (BOOL)isHippySubviewsUpdated {
    return [objc_getAssociatedObject(self, _cmd) integerValue];
}

- (void)setHippySubviewsUpdated:(BOOL)subViewsUpdated {
    objc_setAssociatedObject(self, @selector(isHippySubviewsUpdated), @(subViewsUpdated), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (NSArray<UIView *> *)sortedHippySubviews {
    NSArray *subviews = objc_getAssociatedObject(self, _cmd);
    if (!subviews) {
        // Check if sorting is required - in most cases it won't be
        BOOL sortingRequired = NO;
        for (UIView *subview in self.subcomponents) {
            if (subview.hippyZIndex != 0) {
                sortingRequired = YES;
                break;
            }
        }
        subviews = sortingRequired ? [self.subcomponents sortedArrayUsingComparator:^NSComparisonResult(UIView *a, UIView *b) {
            if (a.hippyZIndex > b.hippyZIndex) {
                return NSOrderedDescending;
            } else {
                // ensure sorting is stable by treating equal zIndex as ascending so
                // that original order is preserved
                return NSOrderedAscending;
            }
        }] : self.subcomponents;
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
    // Avoid crashes due to NaN values
    if (isnan(frame.origin.x) || isnan(frame.origin.y) ||
        isnan(frame.size.width) || isnan(frame.size.height)) {
        HippyLogError(@"Invalid layout for (%@)%@. frame: %@", self.hippyTag, self, NSStringFromCGRect(frame));
        return;
    }
    
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

- (BOOL)interceptTouchEvent {
    return NO;
}

@end
