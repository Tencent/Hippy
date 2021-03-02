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

//clang-format off
HIPPY_EXPORT_METHOD(play:(nonnull NSNumber *)hippyTag) {
//clang-format on
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

//clang-format off
HIPPY_EXPORT_METHOD(pause:(nonnull NSNumber *)hippyTag) {
//clang-format on
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

//clang-format off
HIPPY_EXPORT_METHOD(seek:(nonnull NSNumber *)hippyTag
                  theTime:(__unused NSNumber *)theTime) {
//clang-format on
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
