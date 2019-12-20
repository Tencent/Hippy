//
//  HippyMemoryOpt.h
//  hippy
//
//  Created by ozonelmy on 2019/11/6.
//  Copyright © 2019 Tencent. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

/// 一些涉及内存优化的协议，仅限于UIView类型组件使用
@protocol HippyMemoryOpt <NSObject>
@required
/// invoked when memory warning received
- (void)didReceiveMemoryWarning;

/// invoked when application enter background
- (void)appDidEnterBackground;

/// invoked when application enter foreground
- (void)appWillEnterForeground;
@end

NS_ASSUME_NONNULL_END
