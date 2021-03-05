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

#import "HippyFooterRefresh.h"

@implementation HippyFooterRefresh

- (void)setScrollView:(UIScrollView *)scrollView {
    [super setScrollView:scrollView];
    [scrollView addObserver:self forKeyPath:@"contentSize" options:NSKeyValueObservingOptionNew context:NULL];
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary<NSKeyValueChangeKey, id> *)change
                       context:(void *)context {
    if ([keyPath isEqualToString:@"contentSize"]) {
        NSValue *sizeValue = change[@"new"];
        CGSize size = [sizeValue CGSizeValue];
        self.frame = CGRectMake(0, size.height, CGRectGetWidth(self.bounds), CGRectGetHeight(self.bounds));
    }
}

- (void)scrollViewDidScroll {
    if (_scrollView && _scrollView.contentSize.height > 0) {
        if (self.onFooterPulling && HippyRefreshStatusStartLoading != [self status] && HippyRefreshStatusFinishLoading != [self status]) {
            CGFloat offset = _scrollView.contentOffset.y;
            if (offset >= 0) {
                self.onFooterPulling(@{ @"contentOffset": @(offset) });
            }
        }
    }
}

- (void)scrollViewDidEndDragging {
    if (_scrollView) {
        CGFloat offset = _scrollView.contentOffset.y;
        if (offset > _scrollView.contentSize.height - CGRectGetHeight(_scrollView.bounds) + CGRectGetHeight(self.bounds)) {
            self.status = HippyRefreshStatusStartLoading;
        }
    }
}

- (void)setStatus:(HippyRefreshStatus)status {
    if (_status == status) {
        return;
    }
    switch (status) {
        case HippyRefreshStatusIdle: {
            [UIView animateWithDuration:.2f animations:^{
                UIEdgeInsets insets = self.scrollView.contentInset;
                self.scrollView.contentInset = UIEdgeInsetsMake(insets.top, insets.left, 0, insets.right);
            } completion:^(BOOL finished) {
            }];
        } break;
        case HippyRefreshStatusStartLoading: {
            CGFloat height = CGRectGetHeight(self.bounds);
            if (_refreshStick) {
                CGFloat currentOffset = _scrollView.contentOffset.y;
                CGFloat maxOffset = _scrollView.contentSize.height - height + CGRectGetHeight(self.bounds);
                height = currentOffset - maxOffset + height;
            }
            [UIView animateWithDuration:.2f animations:^{
                UIEdgeInsets insets = self.scrollView.contentInset;
                self.scrollView.contentInset = UIEdgeInsetsMake(insets.top, insets.left, height, insets.right);
            } completion:^(BOOL finished) {
                if (self.onFooterReleased) {
                    CGFloat offset = self.scrollView.contentOffset.y;
                    self.onFooterReleased(@{@"contentOffset": @(offset)});
                }
            }];
        } break;
        case HippyRefreshStatusFinishLoading: {
        } break;
        default:
            break;
    }
    _status = status;
    if ([_delegate respondsToSelector:@selector(refreshView:statusChanged:)]) {
        [_delegate refreshView:self statusChanged:_status];
    }
}

- (void)refresh {
    [UIView animateWithDuration:.2f animations:^{
        CGPoint bottomOffset
            = CGPointMake(0, self.scrollView.contentSize.height - self.scrollView.bounds.size.height + self.scrollView.contentInset.bottom);
        [self.scrollView setContentOffset:bottomOffset animated:YES];
    } completion:^(BOOL finished) {
        self.status = HippyRefreshStatusStartLoading;
    }];
}

- (void)dealloc {
    [_scrollView removeObserver:self forKeyPath:@"contentSize"];
}

@end
