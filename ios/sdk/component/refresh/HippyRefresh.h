//
//  HippyRefresh.h
//  QBCommonRNLib
//
//  Created by ozonelmy on 2020/3/8.
//  Copyright © 2020 Tencent. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "HippyComponent.h"

typedef NS_ENUM(NSUInteger, HippyRefreshStatus) {
    HippyRefreshStatusIdle,
    HippyRefreshStatusPulling,
    HippyRefreshStatusStartLoading,
    HippyRefreshStatusFinishLoading,
};

@class HippyRefresh;
@protocol HippyRefreshDelegate <NSObject>

@optional
- (void)refreshView:(HippyRefresh *)refreshView statusChanged:(HippyRefreshStatus)status;

@end

@interface HippyRefresh : UIView {
@protected
    __weak UIScrollView *_scrollView;
    HippyRefreshStatus _status;
    __weak id<HippyRefreshDelegate> _delegate;
}

@property (nonatomic, weak) UIScrollView *scrollView;
@property (nonatomic, readonly) HippyRefreshStatus status;
@property (nonatomic, weak) id<HippyRefreshDelegate> delegate;

- (void)scrollViewDidEndDragging;
- (void)scrollViewDidScroll;

- (void)refresh;
- (void)refreshFinish;

@end
