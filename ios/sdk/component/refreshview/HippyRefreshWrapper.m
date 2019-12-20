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
#import "UIView+React.h"
#import "HippyRefreshWrapperItemView.h"
#import "HippyScrollableProtocol.h"
@interface HippyRefreshWrapper()<UIScrollViewDelegate>
@property (nonatomic, weak) HippyRefreshWrapperItemView *wrapperItemView;
@property (nonatomic, weak) id<HippyScrollableProtocol> scrollableView;
@property (nonatomic, copy) HippyDirectEventBlock onRefresh;
@property (nonatomic, assign) CGFloat bounceTime;
@property (nonatomic, weak) HippyBridge *bridge;
@end
@implementation HippyRefreshWrapper
- (void) addSubview:(UIView *)view {
    if (view != _wrapperItemView) {
        [super addSubview:view];
    }
    [self refactorViews];
}

- (void) refactorViews {
    if (_wrapperItemView && _scrollableView) {
        CGSize size = _wrapperItemView.frame.size;
        _wrapperItemView.frame = CGRectMake(0, -size.height, size.width, size.height);
        [_scrollableView.realScrollView addSubview:_wrapperItemView];
    }
}

- (void) refreshCompleted {
    CGFloat duration = _bounceTime != 0 ? _bounceTime : 400;
    [UIView animateWithDuration:duration / 1000.f animations:^{
        [self->_scrollableView.realScrollView setContentInset:UIEdgeInsetsZero];
    }];
}

- (void) startRefresh {
    CGFloat wrapperItemViewHeight = _wrapperItemView.frame.size.height;
    UIEdgeInsets insets = _scrollableView.realScrollView.contentInset;
    insets.top = wrapperItemViewHeight;
    CGFloat duration = _bounceTime != 0 ? _bounceTime : 400;
    [UIView animateWithDuration:duration / 1000.f animations:^{
        [self->_scrollableView.realScrollView setContentInset:insets];
        [self->_scrollableView.realScrollView setContentOffset:CGPointMake(0, -insets.top)];
    }];
    if (_onRefresh) {
        _onRefresh(@{});
    }
}

- (void) insertHippySubview:(UIView *)view atIndex:(NSInteger)index {
    if ([view isKindOfClass:[HippyRefreshWrapperItemView class]]) {
        _wrapperItemView = (HippyRefreshWrapperItemView *)view;
    }
    else if ([view conformsToProtocol:@protocol(HippyScrollableProtocol)]) {
        _scrollableView = (id<HippyScrollableProtocol>) view;
        [_scrollableView addScrollListener:self];
    }
    [super insertHippySubview:view atIndex:index];
}

- (void) invalidate {
    [_scrollableView removeScrollListener:self];
}

- (void) scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
    CGFloat wrapperItemViewHeight = _wrapperItemView.frame.size.height;
    UIEdgeInsets insets = scrollView.contentInset;
    CGFloat contentOffsetY = scrollView.contentOffset.y;
    if (contentOffsetY <= -wrapperItemViewHeight && insets.top != wrapperItemViewHeight) {
        insets.top = wrapperItemViewHeight;
        scrollView.contentInset = insets;
        if (_onRefresh) {
            _onRefresh(@{});
        }
    }
}

@end
