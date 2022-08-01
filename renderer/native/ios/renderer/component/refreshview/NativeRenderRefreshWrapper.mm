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

#import "NativeRenderRefreshWrapper.h"
#import "UIView+NativeRender.h"
#import "NativeRenderRefreshWrapperItemView.h"
#import "NativeRenderScrollableProtocol.h"

@interface NativeRenderRefreshWrapper () <UIScrollViewDelegate>

@property (nonatomic, weak) NativeRenderRefreshWrapperItemView *wrapperItemView;
@property (nonatomic, weak) id<NativeRenderScrollableProtocol> scrollableView;
@property (nonatomic, copy) NativeRenderDirectEventBlock onRefresh;
@property (nonatomic, assign) CGFloat bounceTime;

@end

@implementation NativeRenderRefreshWrapper
- (void)addSubview:(UIView *)view {
    if (view != _wrapperItemView) {
        [super addSubview:view];
    }
    [self refactorViews];
}

- (void)refactorViews {
    if (_wrapperItemView && _scrollableView) {
        CGSize size = _wrapperItemView.frame.size;
        _wrapperItemView.frame = CGRectMake(0, -size.height, size.width, size.height);
        [_scrollableView.realScrollView addSubview:_wrapperItemView];
    }
}

- (void)refreshCompleted {
    CGFloat duration = _bounceTime != 0 ? _bounceTime : 400;
    UIEdgeInsets contentInset = self->_scrollableView.realScrollView.contentInset;
    contentInset.top = 0;
    [UIView animateWithDuration:duration / 1000.f animations:^{
        [self->_scrollableView.realScrollView setContentInset:contentInset];
    }];
}

- (void)startRefresh {
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

- (void)insertNativeRenderSubview:(UIView *)view atIndex:(NSInteger)index {
    if ([view isKindOfClass:[NativeRenderRefreshWrapperItemView class]]) {
        _wrapperItemView = (NativeRenderRefreshWrapperItemView *)view;
    } else if ([view conformsToProtocol:@protocol(NativeRenderScrollableProtocol)]) {
        _scrollableView = (id<NativeRenderScrollableProtocol>)view;
        [_scrollableView addScrollListener:self];
    }
    [super insertNativeRenderSubview:view atIndex:index];
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
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
