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

#import "HippyRefresh.h"

@implementation HippyRefresh

- (void)setScrollView:(UIScrollView *)scrollView {
    _scrollView = scrollView;
    [_scrollView addSubview:self];
}

- (void)scrollViewDidScroll {
}

- (void)scrollViewDidEndDragging {
}

- (void)setStatus:(HippyRefreshStatus)status {
    if (_status == status) {
        return;
    }
    _status = status;
    if ([_delegate respondsToSelector:@selector(refreshView:statusChanged:)]) {
        [_delegate refreshView:self statusChanged:_status];
    }
}

- (void)refresh {
    [UIView animateWithDuration:.2f animations:^{
        self.scrollView.contentOffset = CGPointZero;
    } completion:^(BOOL finished) {
        self.status = HippyRefreshStatusStartLoading;
    }];
}

- (void)refreshFinish {
    self.status = HippyRefreshStatusFinishLoading;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.status = HippyRefreshStatusIdle;
    });
}

- (void)refreshFinishWithOption:(NSDictionary *)options {
    self.status = HippyRefreshStatusFinishLoading;
    CGFloat time = [options[@"time"] doubleValue] / 1000.f;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(time * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.status = HippyRefreshStatusIdle;
    });
}

@end
