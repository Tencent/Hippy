//
//  HippyRefresh.m
//  QBCommonRNLib
//
//  Created by ozonelmy on 2020/3/8.
//  Copyright © 2020 Tencent. All rights reserved.
//

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
    [UIView animateWithDuration:.2f
        animations:^{
            self.scrollView.contentOffset = CGPointZero;
        }
        completion:^(BOOL finished) {
            self.status = HippyRefreshStatusStartLoading;
        }];
}

- (void)refreshFinish {
    self.status = HippyRefreshStatusFinishLoading;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        self.status = HippyRefreshStatusIdle;
    });
}

@end
