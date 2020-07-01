//
//  HippyHeaderRefresh.m
//  QBCommonRNLib
//
//  Created by ozonelmy on 2020/3/8.
//  Copyright © 2020 Tencent. All rights reserved.
//

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
