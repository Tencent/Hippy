//
//  HippyRefreshWrapper.h
//  Hippy
//
//  Created by mengyanluo on 2018/9/19.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "HippyInvalidating.h"
NS_ASSUME_NONNULL_BEGIN
@class HippyBridge;
@interface HippyRefreshWrapper : UIView<HippyInvalidating>
- (void) refreshCompleted;
- (void) startRefresh;
@end

NS_ASSUME_NONNULL_END
