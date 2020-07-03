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

#import "HippyHeaderRefresh.h"

@implementation HippyHeaderRefresh

- (void)setFrame:(CGRect)frame {
    CGRect properFrame = frame;
    if ([self superview]) {
        CGFloat width = CGRectGetWidth(frame);
        CGFloat height = CGRectGetHeight(frame);
        properFrame = CGRectMake(0, -height, width, height);
    }
    [super setFrame:properFrame];
}

- (void)scrollViewDidScroll {
    if (_scrollView) {
        if (self.onHeaderPulling &&
            HippyRefreshStatusStartLoading != [self status] &&
            HippyRefreshStatusFinishLoading != [self status]) {
            CGFloat offset = _scrollView.contentOffset.y;
            self.onHeaderPulling(@{@"contentOffset": @(-offset)});
        }
    }
}

- (void)scrollViewDidEndDragging {
    if (_scrollView && -_scrollView.contentOffset.y > CGRectGetHeight(self.bounds)) {
        self.status = HippyRefreshStatusStartLoading;
    }
}

- (void)setStatus:(HippyRefreshStatus)status {
    if (_status == status) {
        return;
    }
    switch (status) {
        case HippyRefreshStatusIdle: {
            [UIView animateWithDuration:.2f
                             animations:^{
                                UIEdgeInsets insets = self.scrollView.contentInset;
                                self.scrollView.contentInset = UIEdgeInsetsMake(0, insets.left, insets.bottom, insets.right);
                             }
                             completion:^(BOOL finished) {
                             }];
        } break;
        case HippyRefreshStatusStartLoading: {
            CGFloat height = CGRectGetHeight(self.bounds);
            [UIView animateWithDuration:.2f
                animations:^{
                    UIEdgeInsets insets = self.scrollView.contentInset;
                    self.scrollView.contentInset = UIEdgeInsetsMake(height, insets.left, insets.bottom, insets.right);
                }
                completion:^(BOOL finished) {
                    if (self.onHeaderReleased) {
                        CGFloat offset = self.scrollView.contentOffset.y;
                        self.onHeaderReleased(@{@"contentOffset": @(offset)});
                    }
                }];
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
    self.status = HippyRefreshStatusStartLoading;
}

- (void)refreshFinish {
    self.status = HippyRefreshStatusFinishLoading;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.status = HippyRefreshStatusIdle;
    });
}

@end
