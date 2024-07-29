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

#import "HippyRefreshWrapper.h"
#import "UIView+Hippy.h"
#import "HippyRefreshWrapperItemView.h"
#import "HippyScrollableProtocol.h"


static NSTimeInterval const kHippyDefaultRefreshBounceTime = 400.0;

@interface HippyRefreshWrapper () <UIScrollViewDelegate>

/// The child view of RefreshWrapper
@property (nonatomic, weak) HippyRefreshWrapperItemView *wrapperItemView;
/// Scrollable target
@property (nonatomic, weak) id<HippyScrollableProtocol> scrollableView;

@end

@implementation HippyRefreshWrapper

- (void)addSubview:(UIView *)view {
    if (view != _wrapperItemView) {
        [super addSubview:view];
    }
    [self refactorViews];
}

- (void)insertHippySubview:(UIView *)view atIndex:(NSInteger)index {
    if ([view isKindOfClass:[HippyRefreshWrapperItemView class]]) {
        _wrapperItemView = (HippyRefreshWrapperItemView *)view;
    } else if ([view conformsToProtocol:@protocol(HippyScrollableProtocol)]) {
        _scrollableView = (id<HippyScrollableProtocol>)view;
        [_scrollableView addScrollListener:self];
    }
    [super insertHippySubview:view atIndex:index];
}

- (void)invalidate {
    [_scrollableView removeScrollListener:self];
}


#pragma mark - Public & Private Methods

- (void)refactorViews {
    if (_wrapperItemView && _scrollableView) {
        CGSize size = _wrapperItemView.frame.size;
        if (self.isHorizontal) {
            _wrapperItemView.frame = CGRectMake(-size.width, 0, size.width, size.height);
        } else {
            _wrapperItemView.frame = CGRectMake(0, -size.height, size.width, size.height);
        }
        [_scrollableView.realScrollView addSubview:_wrapperItemView];
    }
}

- (void)refreshCompleted {
    CGFloat duration = _bounceTime != 0 ? _bounceTime : kHippyDefaultRefreshBounceTime;
    UIEdgeInsets contentInset = self.scrollableView.realScrollView.contentInset;
    if (self.isHorizontal) {
        contentInset.left = 0;
    } else {
        contentInset.top = 0;
    }
    [UIView animateWithDuration:duration / 1000.0 animations:^{
        [self.scrollableView.realScrollView setContentInset:contentInset];
    }];
}

- (void)startRefresh {
    UIEdgeInsets insets = _scrollableView.realScrollView.contentInset;
    CGPoint targetContentOffset;
    if (self.isHorizontal) {
        CGFloat wrapperItemViewWidth = CGRectGetWidth(_wrapperItemView.frame);
        insets.left = wrapperItemViewWidth;
        targetContentOffset = CGPointMake(-wrapperItemViewWidth, 0);
    } else {
        CGFloat wrapperItemViewHeight = CGRectGetHeight(_wrapperItemView.frame);
        insets.top = wrapperItemViewHeight;
        targetContentOffset = CGPointMake(0, -wrapperItemViewHeight);
    }
    
    CGFloat duration = _bounceTime > DBL_EPSILON ? _bounceTime : kHippyDefaultRefreshBounceTime;
    [UIView animateWithDuration:duration / 1000.0 animations:^{
        [self.scrollableView.realScrollView setContentInset:insets];
        [self.scrollableView.realScrollView setContentOffset:targetContentOffset];
    }];
    if (_onRefresh) {
        _onRefresh(@{});
    }
}

#pragma mark - ScrollListener, UIScrollViewDelegate

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView 
                     withVelocity:(CGPoint)velocity
              targetContentOffset:(inout CGPoint *)targetContentOffset {
    UIEdgeInsets insets = scrollView.contentInset;
    if (self.isHorizontal) {
        CGFloat wrapperItemViewWidth = CGRectGetWidth(_wrapperItemView.frame);
        CGFloat contentOffsetX = scrollView.contentOffset.x;
        if (contentOffsetX <= -wrapperItemViewWidth && insets.left != wrapperItemViewWidth) {
            // Update the end sliding state of scrollview
            targetContentOffset->x = -wrapperItemViewWidth;
            // start refresh and call js
            [self startRefresh];
        }
    } else {
        CGFloat wrapperItemViewHeight = CGRectGetHeight(_wrapperItemView.frame);
        CGFloat contentOffsetY = scrollView.contentOffset.y;
        if (contentOffsetY <= -wrapperItemViewHeight && insets.top != wrapperItemViewHeight) {
            insets.top = wrapperItemViewHeight;
            scrollView.contentInset = insets;
            if (_onRefresh) {
                _onRefresh(@{});
            }
        }
    }
}

@end
