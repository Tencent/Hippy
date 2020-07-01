//
//  HippyFooterRefresh.m
//  QBCommonRNLib
//
//  Created by ozonelmy on 2020/3/9.
//  Copyright © 2020 Tencent. All rights reserved.
//

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
        if (self.onFooterPulling&&
        HippyRefreshStatusStartLoading != [self status] &&
        HippyRefreshStatusFinishLoading != [self status]) {
            CGFloat offset = _scrollView.contentOffset.y;
            self.onFooterPulling(@{@"contentOffset": @(offset)});
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
            [UIView animateWithDuration:.2f
                             animations:^{
                                UIEdgeInsets insets = self.scrollView.contentInset;
                                self.scrollView.contentInset = UIEdgeInsetsMake(insets.top, insets.left, 0, insets.right);
                             }
                             completion:^(BOOL finished) {
                             }];
        } break;
        case HippyRefreshStatusStartLoading: {
            CGFloat height = CGRectGetHeight(self.bounds);
            if (_refreshStick) {
                CGFloat currentOffset = _scrollView.contentOffset.y;
                CGFloat maxOffset = _scrollView.contentSize.height - height + CGRectGetHeight(self.bounds);
                height = currentOffset - maxOffset + height;
            }
            [UIView animateWithDuration:.2f
                animations:^{
                    UIEdgeInsets insets = self.scrollView.contentInset;
                    self.scrollView.contentInset = UIEdgeInsetsMake(insets.top, insets.left, -height, insets.right);
                }
                completion:^(BOOL finished) {
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

- (void)dealloc {
    [_scrollView removeObserver:self forKeyPath:@"contentSize"];
}

@end
