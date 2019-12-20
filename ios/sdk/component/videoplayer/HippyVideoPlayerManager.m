//
//  HippyVideoPlayerManager.m
//  Hippy
//
//  Created by 万致远 on 2019/4/29.
//  Copyright © 2019 Tencent. All rights reserved.
//

#import "HippyVideoPlayerManager.h"
#import "HippyVideoPlayer.h"

@implementation HippyVideoPlayerManager

HIPPY_EXPORT_MODULE(VideoPlayer)

- (UIView *)view
{
    return [HippyVideoPlayer new];
}

HIPPY_EXPORT_VIEW_PROPERTY(src, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(autoPlay, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(loop, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(onLoad, HippyDirectEventBlock)

HIPPY_EXPORT_METHOD(play:(nonnull NSNumber *)hippyTag) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[hippyTag];
        if (view == nil || ![view isKindOfClass:[HippyVideoPlayer class]]) {
            HippyLogError(@"tried to setPage: on an error viewPager %@ "
                        "with tag #%@", view, hippyTag);
        }
        HippyVideoPlayer *videoPlayer = (HippyVideoPlayer *)view;
        [videoPlayer play];
    }];
}

HIPPY_EXPORT_METHOD(pause:(nonnull NSNumber *)hippyTag) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[hippyTag];
        if (view == nil || ![view isKindOfClass:[HippyVideoPlayer class]]) {
            HippyLogError(@"tried to setPage: on an error viewPager %@ "
                        "with tag #%@", view, hippyTag);
        }
        HippyVideoPlayer *videoPlayer = (HippyVideoPlayer *)view;
        [videoPlayer pause];
    }];
}

HIPPY_EXPORT_METHOD(seek:(nonnull NSNumber *)hippyTag
                  theTime:(__unused NSNumber *)theTime//毫秒单位
                  ) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[hippyTag];
        if (view == nil || ![view isKindOfClass:[HippyVideoPlayer class]]) {
            HippyLogError(@"tried to setPage: on an error viewPager %@ "
                        "with tag #%@", view, hippyTag);
        }
        HippyVideoPlayer *videoPlayer = (HippyVideoPlayer *)view;
        NSInteger seceonds = theTime.integerValue / 1000.0;
        [videoPlayer seekToTime:CMTimeMakeWithSeconds(seceonds, 1)];
    }];
}
@end
