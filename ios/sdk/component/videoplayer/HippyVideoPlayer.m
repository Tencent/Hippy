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

#import "HippyVideoPlayer.h"

#import "UIView+Hippy.h"

@interface HippyVideoPlayer ()
@property (nonatomic,strong) AVPlayer *avplayer;
@property (nonatomic,strong) AVPlayerLayer *avplayerLayer;
@property (nonatomic,strong) AVPlayerItem *playerItem;

@end

#define KScreemWidth  [UIScreen mainScreen].bounds.size.width
#define KScreemHeight  [UIScreen mainScreen].bounds.size.height


@implementation HippyVideoPlayer

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
    }
    return self;
}

- (void)hippySetFrame:(CGRect)frame {
    [super hippySetFrame:frame];
    self.avplayerLayer.frame = self.bounds;
}

- (AVPlayerLayer *)avplayerLayer {
    if (_avplayer) {
        //显示画面
        _avplayerLayer = [AVPlayerLayer playerLayerWithPlayer:self.avplayer];
        //视频填充模式
        _avplayerLayer.videoGravity = AVLayerVideoGravityResizeAspect;
        //设置画布frame
        _avplayerLayer.frame = self.bounds;
        //添加到当前视图
        [self.layer addSublayer:_avplayerLayer];
    }
    return _avplayerLayer;
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSString *,id> *)change context:(void *)context
{
    AVPlayerItem *playerItem = (AVPlayerItem *)object;
    
    if ([keyPath isEqualToString:@"loadedTimeRanges"]){
        
    }else if ([keyPath isEqualToString:@"status"]){
        if (playerItem.status == AVPlayerItemStatusReadyToPlay){
            if (self.onLoad) {
                self.onLoad(@{});
            }
            if (self.autoPlay) {
                [self.avplayer play];
            }
            
        } else{
        }
    }
}

- (void)setSrc:(NSString *)src {
    NSData *uriData = [src dataUsingEncoding:NSUTF8StringEncoding];
    CFURLRef urlRef = CFURLCreateWithBytes(NULL, [uriData bytes], [uriData length], kCFStringEncodingUTF8, NULL);
    NSURL *mediaUrl = CFBridgingRelease(urlRef);
    
    self.playerItem = [AVPlayerItem playerItemWithURL:mediaUrl];
    
    self.avplayer = [[AVPlayer alloc]initWithPlayerItem:self.playerItem];
    
    [self.playerItem addObserver:self forKeyPath:@"loadedTimeRanges" options:NSKeyValueObservingOptionNew context:nil];
    [self.playerItem addObserver:self forKeyPath:@"status" options:NSKeyValueObservingOptionNew context:nil];
    
    [[NSNotificationCenter defaultCenter]addObserver:self selector:@selector(moviePlayDidEnd:) name:AVPlayerItemDidPlayToEndTimeNotification object:_playerItem];
}

//播放结束的回调
- (void)moviePlayDidEnd:(NSNotification *)notification {
    [self.avplayer seekToTime:kCMTimeZero completionHandler:^(BOOL finished) {
        if (self.loop) {
            [self.avplayer play];
        }
    }];
}

#pragma mark - Action Methods
- (void)play {
    [self.avplayer play];
}

- (void)pause {
    [self.avplayer pause];
    
}

- (void)seekToTime:(CMTime)time {
    [self.avplayer seekToTime:time];
}

- (void)dealloc {
    [self.playerItem removeObserver:self forKeyPath:@"status" context:nil];
    [self.playerItem removeObserver:self forKeyPath:@"loadedTimeRanges" context:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:AVPlayerItemDidPlayToEndTimeNotification object:self.playerItem];
}

@end
