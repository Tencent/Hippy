/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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
#import "NativeRenderComponentProtocol.h"
#import "NativeRenderConvert.h"
#import "NativeRenderAnimatedImageView.h"
#import "NativeRenderImageProviderProtocol.h"

@class NativeRenderImageView;

@interface NativeRenderAnimatedImageOperation : NSOperation {
    NSData *_animatedImageData;
    NSString *_url;
    __weak NativeRenderImageView *_imageView;
    id<NativeRenderImageProviderProtocol> _imageProvider;
}

- (id)initWithAnimatedImageData:(NSData *)data imageView:(NativeRenderImageView *)imageView imageURL:(NSString *)url;
- (id)initWithAnimatedImageProvider:(id<NativeRenderImageProviderProtocol>)imageProvider imageView:(NativeRenderImageView *)imageView imageURL:(NSString *)url;

@end

typedef NS_ENUM(NSInteger, NativeRenderResizeMode) {
    NativeRenderResizeModeCover = UIViewContentModeScaleAspectFill,
    NativeRenderResizeModeContain = UIViewContentModeScaleAspectFit,
    NativeRenderResizeModeStretch = UIViewContentModeScaleToFill,
    NativeRenderResizeModeCenter = UIViewContentModeCenter,
    NativeRenderResizeModeRepeat = -1,  // Use negative values to avoid conflicts with iOS enum values.
};

typedef NS_ENUM(NSInteger, NativeRenderShapeMode) {
    NativeRenderResizeModeDefalt = 0,
    NativeRenderResizeModeCircle,
};

@interface NativeRenderImageView : NativeRenderAnimatedImageView

@property (nonatomic, assign) CGFloat blurRadius;
@property (nonatomic, assign) UIEdgeInsets capInsets;
@property (nonatomic, assign) NativeRenderResizeMode resizeMode;
@property (nonatomic, copy) NSArray *source;
@property (nonatomic, strong) UIImage *defaultImage;
@property (nonatomic, assign) UIImageRenderingMode renderingMode;
@property (nonatomic, assign) BOOL downSample;
@property (nonatomic, assign) CGFloat borderTopLeftRadius;
@property (nonatomic, assign) CGFloat borderTopRightRadius;
@property (nonatomic, assign) CGFloat borderBottomLeftRadius;
@property (nonatomic, assign) CGFloat borderBottomRightRadius;
@property (nonatomic, assign) CGFloat borderRadius;
@property (nonatomic, assign) NativeRenderShapeMode shape;

@property (nonatomic, copy) NativeRenderDirectEventBlock onLoadStart;
@property (nonatomic, copy) NativeRenderDirectEventBlock onProgress;
@property (nonatomic, copy) NativeRenderDirectEventBlock onError;
@property (nonatomic, copy) NativeRenderDirectEventBlock onLoad;
@property (nonatomic, copy) NativeRenderDirectEventBlock onLoadEnd;

- (void)reloadImage;

- (void)updateImage:(UIImage *)image;

- (void)setImageProvider:(id<NativeRenderImageProviderProtocol>)imageProvider;

- (void)clearImageIfDetached;

- (BOOL)needsUpdateCornerRadiusManully;
@end

@interface NativeRenderConvert (NativeRenderResizeMode)

+ (NativeRenderResizeMode)NativeRenderResizeMode:(id)json;
+ (NativeRenderShapeMode)NativeRenderShapeMode:(id)json;

@end
