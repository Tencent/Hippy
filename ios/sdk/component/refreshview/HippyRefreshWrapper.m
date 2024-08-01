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

@interface HippyRefreshWrapper () <UIScrollViewDelegate, HippyScrollableLayoutDelegate>

/// The child header view of RefreshWrapper
@property (nonatomic, weak) HippyRefreshWrapperItemView *headerItemView;
/// The child footer view of RefreshWrapper
@property (nonatomic, weak) HippyRefreshWrapperFooterItemView *footerItemView;
/// Scrollable target
@property (nonatomic, weak) id<HippyScrollableProtocol> scrollableView;

@end

@implementation HippyRefreshWrapper

- (void)addSubview:(UIView *)view {
    if (view != _headerItemView && view != _footerItemView) {
        [super addSubview:view];
    }
    [self refactorViews];
}

- (void)insertHippySubview:(UIView *)view atIndex:(NSInteger)index {
    if ([view isKindOfClass:[HippyRefreshWrapperItemView class]]) {
        _headerItemView = (HippyRefreshWrapperItemView *)view;
    } else if ([view conformsToProtocol:@protocol(HippyScrollableProtocol)]) {
        _scrollableView = (id<HippyScrollableProtocol>)view;
        [_scrollableView addScrollListener:self];
    } else if ([view isKindOfClass:[HippyRefreshWrapperFooterItemView class]]) {
        _footerItemView = (HippyRefreshWrapperFooterItemView *)view;
        [_scrollableView addHippyScrollableLayoutDelegate:self];
    }
    [super insertHippySubview:view atIndex:index];
}

- (void)invalidate {
    [_scrollableView removeScrollListener:self];
}


#pragma mark - Public & Private Methods

- (void)refactorViews {
    if (_headerItemView && _scrollableView) {
        CGSize size = _headerItemView.frame.size;
        if (self.isHorizontal) {
            _headerItemView.frame = CGRectMake(-size.width, 0, size.width, size.height);
        } else {
            _headerItemView.frame = CGRectMake(0, -size.height, size.width, size.height);
        }
        [_scrollableView.realScrollView addSubview:_headerItemView];
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

- (void)refreshFooterCompleted {
    CGFloat duration = _bounceTime != 0 ? _bounceTime : kHippyDefaultRefreshBounceTime;
    UIEdgeInsets contentInset = self.scrollableView.realScrollView.contentInset;
    if (self.isHorizontal) {
        contentInset.right = 0;
    } else {
        contentInset.bottom = 0;
    }
    [UIView animateWithDuration:duration / 1000.0 animations:^{
        [self.scrollableView.realScrollView setContentInset:contentInset];
    }];
}

- (void)startRefresh {
    UIEdgeInsets insets = _scrollableView.realScrollView.contentInset;
    CGPoint targetContentOffset;
    if (self.isHorizontal) {
        CGFloat wrapperItemViewWidth = CGRectGetWidth(_headerItemView.frame);
        insets.left = wrapperItemViewWidth;
        targetContentOffset = CGPointMake(-wrapperItemViewWidth, 0);
    } else {
        CGFloat wrapperItemViewHeight = CGRectGetHeight(_headerItemView.frame);
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

- (void)startRefreshFooter {
    UIScrollView *scrollView = _scrollableView.realScrollView;
    UIEdgeInsets insets = scrollView.contentInset;
    CGSize contentSize = _scrollableView.contentSize;
    CGPoint targetContentOffset;
    if (self.isHorizontal) {
        CGFloat wrapperItemViewWidth = CGRectGetWidth(_footerItemView.frame);
        CGFloat scrollViewWidth = CGRectGetWidth(scrollView.frame);
        insets.right = wrapperItemViewWidth;
        targetContentOffset = CGPointMake(contentSize.width - scrollViewWidth + wrapperItemViewWidth, 0);
    } else {
        CGFloat wrapperItemViewHeight = CGRectGetHeight(_footerItemView.frame);
        CGFloat scrollViewHeight = CGRectGetHeight(scrollView.frame);
        insets.bottom = wrapperItemViewHeight;
        targetContentOffset = CGPointMake(0, contentSize.height - scrollViewHeight + wrapperItemViewHeight);
    }
    
    CGFloat duration = _bounceTime > DBL_EPSILON ? _bounceTime : kHippyDefaultRefreshBounceTime;
    [UIView animateWithDuration:duration / 1000.0 animations:^{
        [self.scrollableView.realScrollView setContentInset:insets];
        [self.scrollableView.realScrollView setContentOffset:targetContentOffset];
    }];
    if (_onFooterRefresh) {
        _onFooterRefresh(@{});
    }
}

#pragma mark - ScrollListener, UIScrollViewDelegate

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView 
                     withVelocity:(CGPoint)velocity
              targetContentOffset:(inout CGPoint *)targetContentOffset {
    UIEdgeInsets insets = scrollView.contentInset;
    if (self.isHorizontal) {
        // horizontal, for example, wrapping a view pager
        CGFloat contentOffsetX = scrollView.contentOffset.x;
        if (_headerItemView) {
            CGFloat wrapperItemViewWidth = CGRectGetWidth(_headerItemView.frame);
            if (contentOffsetX <= -wrapperItemViewWidth && insets.left != wrapperItemViewWidth) {
                // Update the end sliding state of scrollview
                targetContentOffset->x = -wrapperItemViewWidth;
                // start refresh and call js
                [self startRefresh];
            }
        }
        
        if (_footerItemView) {
            CGSize contentSize = scrollView.contentSize;
            CGFloat scrollViewWidth = CGRectGetWidth(scrollView.frame);
            CGFloat footerItemWidth = CGRectGetWidth(_footerItemView.frame);
            if (contentOffsetX >= contentSize.width - scrollViewWidth + footerItemWidth && insets.right != footerItemWidth) {
                // Update the end sliding state of scrollview
                targetContentOffset->x = contentSize.width - scrollViewWidth + footerItemWidth;
                // start refresh and call js
                [self startRefreshFooter];
            }
        }
        
    } else {
        // vertical refresh wrapper, for example, wrapping a listview
        CGFloat contentOffsetY = scrollView.contentOffset.y;
        if (_headerItemView) {
            CGFloat wrapperItemViewHeight = CGRectGetHeight(_headerItemView.frame);
            if (contentOffsetY <= -wrapperItemViewHeight && insets.top != wrapperItemViewHeight) {
                insets.top = wrapperItemViewHeight;
                scrollView.contentInset = insets;
                if (_onRefresh) {
                    _onRefresh(@{});
                }
            }
        }
        
        if (_footerItemView) {
            CGFloat wrapperItemViewHeight = CGRectGetHeight(_footerItemView.frame);
            CGFloat scrollViewHeight = CGRectGetHeight(scrollView.frame);
            if (contentOffsetY >= wrapperItemViewHeight - scrollViewHeight && insets.bottom != wrapperItemViewHeight) {
                insets.bottom = wrapperItemViewHeight;
                scrollView.contentInset = insets;
                if (_onFooterRefresh) {
                    _onFooterRefresh(@{});
                }
            }
        }
    }
}

#pragma mark - HippyScrollableLayoutDelegate

- (void)scrollableDidLayout:(id<HippyScrollableProtocol>)scrollableView {
    if (_footerItemView && _scrollableView) {
        CGSize size = _footerItemView.frame.size;
        CGSize contentSize = _scrollableView.realScrollView.contentSize;
        
        if (self.isHorizontal) {
            _footerItemView.frame = CGRectMake(contentSize.width, 0, size.width, size.height);
        } else {
            _footerItemView.frame = CGRectMake(0, contentSize.height, size.width, size.height);
        }
        [_scrollableView.realScrollView addSubview:_footerItemView];
    }
}

@end
