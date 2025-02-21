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

#import "HippyNestedScrollCoordinator.h"
#import "HippyAssert.h"
#import "HippyLog.h"


static NSString *const kHippyNestedScrollLog= @"NestedScroll";
#define HippyNSLogTrace(...) HippyLogTrace(@"%@ %p %@", kHippyNestedScrollLog, self, [NSString stringWithFormat:__VA_ARGS__])
#define HIPPY_NESTED_OPEN_BOUNCES 0 // Turn off the outer bounces feature for now


typedef NS_ENUM(char, HippyNestedScrollDirection) {
    HippyNestedScrollDirectionNone = 0,
    HippyNestedScrollDirectionLeft,
    HippyNestedScrollDirectionRight,
    HippyNestedScrollDirectionUp,
    HippyNestedScrollDirectionDown,
};

typedef NS_ENUM(char, HippyNestedScrollDragType) {
    HippyNestedScrollDragTypeUndefined = 0,
    HippyNestedScrollDragTypeOuterOnly,
    HippyNestedScrollDragTypeBoth,
};

static CGFloat const kHippyNestedScrollFloatThreshold = 0.1;

@interface HippyNestedScrollCoordinator ()

/// Current drag type, used to judge the sliding order.
@property (nonatomic, assign) HippyNestedScrollDragType dragType;

/// Whether should `unlock` the outerScrollView
/// One thing to note is the OuterScrollView may jitter in PrioritySelf mode since lock is a little bit late,
/// we need to make sure the initial state is NO to lock the outerScrollView.
@property (nonatomic, assign) BOOL shouldUnlockOuterScrollView;

/// Whether should `unlock` the innerScrollView
@property (nonatomic, assign) BOOL shouldUnlockInnerScrollView;

@end


@implementation HippyNestedScrollCoordinator

- (void)setInnerScrollView:(UIScrollView<HippyNestedScrollProtocol> *)innerScrollView {
    HippyAssertParam(innerScrollView);
    _innerScrollView = innerScrollView;
    // Disable inner's bounces when nested scroll.
    _innerScrollView.bounces = NO;
}

- (void)setOuterScrollView:(UIScrollView<HippyNestedScrollProtocol> *)outerScrollView {
    _outerScrollView = outerScrollView;
    _outerScrollView.bounces = NO;
}


#pragma mark - Private

- (BOOL)isDirection:(HippyNestedScrollDirection)direction hasPriority:(HippyNestedScrollPriority)priority {
    // Note that the top and bottom defined in the nestedScroll attribute refer to the finger orientation,
    // as opposed to the page orientation.
    HippyNestedScrollPriority presetPriority = HippyNestedScrollPriorityUndefined;
    switch (direction) {
        case HippyNestedScrollDirectionUp:
            presetPriority = self.nestedScrollBottomPriority;
            break;
        case HippyNestedScrollDirectionDown:
            presetPriority = self.nestedScrollTopPriority;
            break;
        case HippyNestedScrollDirectionLeft:
            presetPriority = self.nestedScrollRightPriority;
            break;
        case HippyNestedScrollDirectionRight:
            presetPriority = self.nestedScrollLeftPriority;
            break;
        default:
            break;
    }
    if ((presetPriority == HippyNestedScrollPriorityUndefined) &&
        (self.nestedScrollPriority == HippyNestedScrollPriorityUndefined)) {
        // Default value is `PrioritySelf`.
        return (HippyNestedScrollPrioritySelf == priority);
    }
    return ((presetPriority == HippyNestedScrollPriorityUndefined) ?
            (self.nestedScrollPriority == priority) :
            (presetPriority == priority));
}

static inline BOOL hasScrollToTheDirectionEdge(const UIScrollView *scrollview,
                                               const HippyNestedScrollDirection direction) {
    if (HippyNestedScrollDirectionDown == direction) {
        return ((scrollview.contentOffset.y + CGRectGetHeight(scrollview.frame)) 
                >= scrollview.contentSize.height - kHippyNestedScrollFloatThreshold);
    } else if (HippyNestedScrollDirectionUp == direction) {
        return scrollview.contentOffset.y <= kHippyNestedScrollFloatThreshold;
    } else if (HippyNestedScrollDirectionLeft == direction) {
        return scrollview.contentOffset.x <= kHippyNestedScrollFloatThreshold;
    } else if (HippyNestedScrollDirectionRight == direction) {
        return ((scrollview.contentOffset.x + CGRectGetWidth(scrollview.frame))
                >= scrollview.contentSize.width - kHippyNestedScrollFloatThreshold);
    }
    return NO;
}

static inline BOOL isScrollInSpringbackState(const UIScrollView *scrollview,
                                             const HippyNestedScrollDirection direction) {
    if (HippyNestedScrollDirectionDown == direction) {
        return scrollview.contentOffset.y <= -kHippyNestedScrollFloatThreshold;
    } else if (HippyNestedScrollDirectionUp == direction) {
        return (scrollview.contentOffset.y + CGRectGetHeight(scrollview.frame)
                >= scrollview.contentSize.height + kHippyNestedScrollFloatThreshold);
    } if (HippyNestedScrollDirectionLeft == direction) {
        return scrollview.contentOffset.x <= -kHippyNestedScrollFloatThreshold;
    } else if (HippyNestedScrollDirectionRight == direction) {
        return (scrollview.contentOffset.x + CGRectGetWidth(scrollview.frame)
                >= scrollview.contentSize.width - kHippyNestedScrollFloatThreshold);
    }
    return NO;
}

static inline void lockScrollView(const UIScrollView<HippyNestedScrollProtocol> *scrollView) {
    scrollView.contentOffset = scrollView.lastContentOffset;
    scrollView.isLockedInNestedScroll = YES;
}

#pragma mark - ScrollEvents Delegate

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    const UIScrollView<HippyNestedScrollProtocol> *sv = (UIScrollView<HippyNestedScrollProtocol> *)scrollView;
    const UIScrollView<HippyNestedScrollProtocol> *outerScrollView = self.outerScrollView;
    const UIScrollView<HippyNestedScrollProtocol> *innerScrollView = self.innerScrollView;
    BOOL isOuter = (sv == outerScrollView);
    BOOL isInner = (sv == innerScrollView);
    
    // 0. Exclude irrelevant scroll events using `activeInnerScrollView`
    if (outerScrollView.activeInnerScrollView &&
        outerScrollView.activeInnerScrollView != innerScrollView) {
        HippyNSLogTrace(@"Not active inner return.");
        return;
    }
    
    // 1. Determine direction of scrolling
    HippyNestedScrollDirection direction = HippyNestedScrollDirectionNone;
    if (sv.lastContentOffset.y > sv.contentOffset.y) {
        direction = HippyNestedScrollDirectionUp;
    } else if (sv.lastContentOffset.y < sv.contentOffset.y) {
        direction = HippyNestedScrollDirectionDown;
    } else if (sv.lastContentOffset.x > sv.contentOffset.x) {
        direction = HippyNestedScrollDirectionLeft;
    } else if (sv.lastContentOffset.x < sv.contentOffset.x) {
        direction = HippyNestedScrollDirectionRight;
    }
    if (direction == HippyNestedScrollDirectionNone) {
        HippyNSLogTrace(@"No direction return. %p", sv);
        return;
    }
    
    HippyNSLogTrace(@"%@(%p) did scroll: %@",
                    isOuter ? @"Outer" : @"Inner", sv,
                    isOuter ?
                    NSStringFromCGPoint(outerScrollView.contentOffset) :
                    NSStringFromCGPoint(innerScrollView.contentOffset));
    
    // 2. Lock inner scrollview if necessary
    if ([self isDirection:direction hasPriority:HippyNestedScrollPriorityParent]) {
        if (isOuter || (isInner && !self.shouldUnlockInnerScrollView)) {
            if (hasScrollToTheDirectionEdge(outerScrollView, direction)) {
                // Outer has slipped to the edge,
                // need to further determine whether the Inner can still slide
                if (hasScrollToTheDirectionEdge(innerScrollView, direction)) {
                    self.shouldUnlockInnerScrollView = NO;
                    HippyNSLogTrace(@"set lock inner !");
                } else {
                    self.shouldUnlockInnerScrollView = YES;
                    HippyNSLogTrace(@"set unlock inner ~");
                }
            } else {
                self.shouldUnlockInnerScrollView = NO;
                HippyNSLogTrace(@"set lock inner !!");
            }
        } 
        
        // Do lock inner action!
        if (isInner && !self.shouldUnlockInnerScrollView) {
            HippyNSLogTrace(@"lock inner (%p) !!!!", sv);
            lockScrollView(innerScrollView);
        }
        
        // Handle the scenario where the Inner can slide when the Outer's bounces on.
        if (HIPPY_NESTED_OPEN_BOUNCES &&
            self.shouldUnlockInnerScrollView &&
            isOuter && sv.bounces == YES &&
            self.dragType == HippyNestedScrollDragTypeBoth &&
            hasScrollToTheDirectionEdge(outerScrollView, direction)) {
            // When the finger is dragging, the Outer has slipped to the edge and is ready to bounce,
            // but the Inner can still slide.
            // At this time, the sliding of the Outer needs to be locked.
            lockScrollView(outerScrollView);
            HippyNSLogTrace(@"lock outer due to inner scroll");
        }
        
        // Deal with the multi-level nesting (greater than or equal to three layers).
        // If inner has an activeInnerScrollView, that means it has a 'scrollable' nested inside it.
        // In this case, if the outer-layer locks inner, it should be passed to the outer of the inner-layer.
        if (!self.shouldUnlockInnerScrollView &&
            isOuter && innerScrollView.activeInnerScrollView) {
            innerScrollView.cascadeLockForNestedScroll = YES;
            innerScrollView.activeInnerScrollView.cascadeLockForNestedScroll = YES;
            if (outerScrollView.cascadeLockForNestedScroll) {
                outerScrollView.cascadeLockForNestedScroll = NO;
            }
            HippyNSLogTrace(@"set cascadeLock to %p", innerScrollView);
        }
        
        // Also need to handle unlock conflicts when multiple levels are nested 
        // (greater than or equal to three levels) and priorities are different.
        // When the inner of the inner-layer and the outer of outer-layer are unlocked at the same time,
        // if the inner layer has locked the outer, the outer of outer layer should be locked too.
        if (self.shouldUnlockInnerScrollView &&
            isInner && outerScrollView.activeOuterScrollView) {
            outerScrollView.activeOuterScrollView.cascadeLockForNestedScroll = YES;
        }
        
        // Do cascade lock action!
        if (isOuter && outerScrollView.cascadeLockForNestedScroll) {
            lockScrollView(outerScrollView);
            HippyNSLogTrace(@"lock outer due to cascadeLock");
            outerScrollView.cascadeLockForNestedScroll = NO;
        } else if (isInner && innerScrollView.cascadeLockForNestedScroll) {
            lockScrollView(innerScrollView);
            HippyNSLogTrace(@"lock outer due to cascadeLock");
            innerScrollView.cascadeLockForNestedScroll = NO;
        }
    }
    
    // 3. Lock outer scrollview if necessary
    else if ([self isDirection:direction hasPriority:HippyNestedScrollPrioritySelf]) {
        if (isInner || (isOuter && !self.shouldUnlockOuterScrollView)) {
            if (hasScrollToTheDirectionEdge(innerScrollView, direction)) {
                self.shouldUnlockOuterScrollView = YES;
                HippyNSLogTrace(@"set unlock outer ~");
            } else {
                self.shouldUnlockOuterScrollView = NO;
                HippyNSLogTrace(@"set lock outer !");
            }
        }
        
        // Handle the effect of outerScroll auto bouncing back when bounces is on.
        if (HIPPY_NESTED_OPEN_BOUNCES &&
            !self.shouldUnlockOuterScrollView &&
            isOuter && sv.bounces == YES &&
            self.dragType == HippyNestedScrollDragTypeUndefined &&
            isScrollInSpringbackState(outerScrollView, direction)) {
            self.shouldUnlockOuterScrollView = YES;
        }
        
        // Do lock outer action!
        if (self.dragType != HippyNestedScrollDragTypeOuterOnly &&
            isOuter && !self.shouldUnlockOuterScrollView) {
            HippyNSLogTrace(@"lock outer (%p) !!!!", sv);
            lockScrollView(outerScrollView);
        }
        
        // Deal with the multi-level nesting (greater than or equal to three layers).
        // If the outer has an activeOuterScrollView, this means it has a scrollable nested around it.
        // At this point, if the inner-layer lock `Outer`, it should be passed to the Inner in outer-layer.
        if (isInner && !self.shouldUnlockOuterScrollView &&
            outerScrollView.activeOuterScrollView) {
            outerScrollView.cascadeLockForNestedScroll = YES;
            outerScrollView.activeOuterScrollView.cascadeLockForNestedScroll = YES;
            HippyNSLogTrace(@"set cascadeLock to %p", innerScrollView);
        }
        
        // Do cascade lock action!
        if (isInner && innerScrollView.cascadeLockForNestedScroll) {
            lockScrollView(innerScrollView);
            HippyNSLogTrace(@"lock outer due to cascadeLock");
            innerScrollView.cascadeLockForNestedScroll = NO;
        } else if (isOuter && outerScrollView.cascadeLockForNestedScroll) {
            lockScrollView(outerScrollView);
            HippyNSLogTrace(@"lock outer due to cascadeLock");
            outerScrollView.cascadeLockForNestedScroll = NO;
        }
    }
    
    // 4. Update the lastContentOffset record
    sv.lastContentOffset = sv.contentOffset;
    HippyNSLogTrace(@"end handle %@(%p) scroll -------------",
                    isOuter ? @"Outer" : @"Inner", sv);
}


- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    if (scrollView == self.outerScrollView) {
        self.shouldUnlockOuterScrollView = NO;
        HippyNSLogTrace(@"reset outer scroll lock");
    } else if (scrollView == self.innerScrollView) {
        self.shouldUnlockInnerScrollView = NO;
        HippyNSLogTrace(@"reset inner scroll lock");
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if (scrollView == self.innerScrollView) {
            // record active scroll for filtering events in scrollViewDidScroll
            self.outerScrollView.activeInnerScrollView = self.innerScrollView;
            self.innerScrollView.activeOuterScrollView = self.outerScrollView;
            
            self.dragType = HippyNestedScrollDragTypeBoth;
        } else if (self.dragType == HippyNestedScrollDragTypeUndefined) {
            self.dragType = HippyNestedScrollDragTypeOuterOnly;
        }
    });
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
    self.dragType = HippyNestedScrollDragTypeUndefined;
    if (!decelerate) {
        // reset active scroll
        self.outerScrollView.activeInnerScrollView = nil;
        self.innerScrollView.activeOuterScrollView = nil;
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    // reset active scroll
    self.outerScrollView.activeInnerScrollView = nil;
    self.innerScrollView.activeOuterScrollView = nil;
}


#pragma mark - HippyNestedScrollGestureDelegate

- (BOOL)shouldRecognizeScrollGestureSimultaneouslyWithView:(UIView *)view {
    // Setup outer scrollview if needed
    if (!self.outerScrollView) {
        id<HippyScrollableProtocol> scrollableView = [self.class findNestedOuterScrollView:self.innerScrollView];
        if (scrollableView) {
            [scrollableView addScrollListener:self];
            self.outerScrollView = (UIScrollView<HippyNestedScrollProtocol> *)scrollableView.realScrollView;
        }
    }
    
    if (view == self.outerScrollView) {
        if (self.nestedScrollPriority > HippyNestedScrollPriorityNone ||
            self.nestedScrollTopPriority > HippyNestedScrollPriorityNone ||
            self.nestedScrollBottomPriority > HippyNestedScrollPriorityNone ||
            self.nestedScrollLeftPriority > HippyNestedScrollPriorityNone ||
            self.nestedScrollRightPriority > HippyNestedScrollPriorityNone) {
            return YES;
        }
    } else if (self.outerScrollView.nestedGestureDelegate) {
        return [self.outerScrollView.nestedGestureDelegate shouldRecognizeScrollGestureSimultaneouslyWithView:view];
    }
    return NO;
}

#pragma mark - Utils

+ (id<HippyScrollableProtocol>)findNestedOuterScrollView:(UIScrollView *)innerScrollView {
    // Use superview.superview since scrollview is a subview of hippy view.
    UIView<HippyScrollableProtocol> *innerScrollable = (UIView<HippyScrollableProtocol> *)innerScrollView.superview;
    UIView *outerScrollView = innerScrollable.superview;
    while (outerScrollView) {
        if ([outerScrollView conformsToProtocol:@protocol(HippyScrollableProtocol)]) {
            UIView<HippyScrollableProtocol> *outerScrollable = (UIView<HippyScrollableProtocol> *)outerScrollView;
            // Make sure to find scrollable with same direction.
            BOOL isInnerHorizontal = [innerScrollable respondsToSelector:@selector(horizontal)] ? [innerScrollable horizontal] : NO;
            BOOL isOuterHorizontal = [outerScrollable respondsToSelector:@selector(horizontal)] ? [outerScrollable horizontal] : NO;
            if (isInnerHorizontal == isOuterHorizontal) {
                break;
            }
        }
        outerScrollView = outerScrollView.superview;
    }
    return (id<HippyScrollableProtocol>)outerScrollView;
}

@end

