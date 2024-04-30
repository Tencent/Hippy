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

#import "HippyBridgeModule.h"
@class HippyImageView;

NS_ASSUME_NONNULL_BEGIN

typedef NS_OPTIONS(NSUInteger, HippyImageCustomLoaderControlOptions) {
    /**
     * This flag controls the HippyImageView from doing image data decoding or downsampling,
     * Only takes effect when image is not null in the completion block.
     */
    HippyImageCustomLoaderControl_SkipDecodeOrDownsample = 1 << 0,
};

typedef void(^HippyImageLoaderProgressBlock)(long long currentLength, long long totalLength);
typedef void(^HippyImageLoaderCompletionBlock)(NSData *_Nullable data,
                                               NSURL * _Nonnull url,
                                               NSError *_Nullable error,
                                               UIImage *_Nullable image,
                                               HippyImageCustomLoaderControlOptions options);


@protocol HippyImageViewCustomLoader <HippyBridgeModule>

@optional

- (BOOL)canHandleImageURL:(NSURL *)url;

@required

- (void)imageView:(HippyImageView *)imageView
        loadAtUrl:(NSURL *)url
 placeholderImage:(UIImage *)placeholderImage
         progress:(HippyImageLoaderProgressBlock)progressBlock
        completed:(HippyImageLoaderCompletionBlock)completedBlock;

- (void)cancelImageDownload:(UIImageView *)imageView withUrl:(NSURL *)url;

- (void)loadImage:(NSURL *)url completed:(void (^)(NSData *, NSURL *, NSError *, BOOL cached))completedBlock;

@end

NS_ASSUME_NONNULL_END
