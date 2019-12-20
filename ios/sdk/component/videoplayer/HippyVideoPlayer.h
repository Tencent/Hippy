//
//  HippyVideoPlayer.h
//  Hippy
//
//  Created by 万致远 on 2019/4/29.
//  Copyright © 2019 Tencent. All rights reserved.
//

#import "HippyView.h"
#import <AVFoundation/AVFoundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface HippyVideoPlayer : HippyView
- (void)play;
- (void)pause;
- (void)seekToTime:(CMTime)time;
@property (nonatomic, strong) NSString *src;
@property (nonatomic, assign) BOOL *autoPlay;
@property (nonatomic, assign) BOOL *loop;
@property (nonatomic, strong) HippyDirectEventBlock onLoad;
@end

NS_ASSUME_NONNULL_END
