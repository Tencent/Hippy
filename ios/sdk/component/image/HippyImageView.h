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

#import <UIKit/UIKit.h>
#import "HippyComponent.h"
#import "HippyConvert.h"
#import "HippyAnimatedImageView.h"
#import "HippyMemoryOpt.h"
#import "HippyImageProviderProtocol.h"

@class HippyBridge;
@class HippyImageView;

@interface HippyAnimatedImageOperation : NSOperation {
    NSData *_animatedImageData;
    NSString *_url;
    __weak HippyImageView *_imageView;
    id<HippyImageProviderProtocol> _imageProvider;
}

- (id) initWithAnimatedImageData:(NSData *)data imageView:(HippyImageView *)imageView imageURL:(NSString *)url;
- (id) initWithAnimatedImageProvider:(id<HippyImageProviderProtocol>)imageProvider imageView:(HippyImageView *)imageView imageURL:(NSString *)url;

@end

typedef NS_ENUM(NSInteger, HippyResizeMode) {
	HippyResizeModeCover = UIViewContentModeScaleAspectFill,
	HippyResizeModeContain = UIViewContentModeScaleAspectFit,
	HippyResizeModeStretch = UIViewContentModeScaleToFill,
	HippyResizeModeCenter = UIViewContentModeCenter,
	HippyResizeModeRepeat = -1, // Use negative values to avoid conflicts with iOS enum values.
};

@interface HippyImageView : HippyAnimatedImageView <NSURLSessionDelegate, HippyMemoryOpt>

@property (nonatomic, assign) CGFloat blurRadius;
@property (nonatomic, assign) UIEdgeInsets capInsets;
@property (nonatomic, assign) HippyResizeMode resizeMode;
@property (nonatomic, copy) NSArray *source;
@property (nonatomic, strong) UIImage *defaultImage;
@property (nonatomic, assign) UIImageRenderingMode renderingMode;
@property (nonatomic, weak) HippyBridge *bridge;
@property (nonatomic, assign) BOOL needDownsampleing;
@property (nonatomic, assign) CGFloat borderTopLeftRadius;
@property (nonatomic, assign) CGFloat borderTopRightRadius;
@property (nonatomic, assign) CGFloat borderBottomLeftRadius;
@property (nonatomic, assign) CGFloat borderBottomRightRadius;
@property (nonatomic, assign) CGFloat borderRadius;

@property (nonatomic, copy) HippyDirectEventBlock onLoadStart;
@property (nonatomic, copy) HippyDirectEventBlock onProgress;
@property (nonatomic, copy) HippyDirectEventBlock onError;
@property (nonatomic, copy) HippyDirectEventBlock onLoad;
@property (nonatomic, copy) HippyDirectEventBlock onLoadEnd;

- (instancetype)initWithBridge:(HippyBridge *)bridge NS_DESIGNATED_INITIALIZER;

- (void)reloadImage;

- (void)updateImage:(UIImage *)image;

- (UIImage *) imageFromData:(NSData *)data;

- (BOOL) needsUpdateCornerRadius;
@end

@interface HippyConvert(HippyResizeMode)
+ (HippyResizeMode)HippyResizeMode:(id)json;
@end

