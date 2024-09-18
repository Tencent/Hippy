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

// The ImageView object in `extraInfo` parameter of `loadImageAtUrl:...`
#define HIPPY_CUSTOMLOADER_IMAGEVIEW_IN_EXTRA_KEY "kHippyImageViewInExtra"


typedef NS_OPTIONS(NSUInteger, HippyImageLoaderControlOptions) {
    HippyImageLoaderControl_Nil = 0, // kNilOptions
    /**
     * This flag controls the HippyImageView from doing image data decoding or downsampling,
     * Only takes effect when image is not null in the completion block.
     */
    HippyImageLoaderControl_SkipDecodeOrDownsample = 1 << 0,
};

typedef void(^HippyImageLoaderProgressBlock)(NSUInteger currentLength, NSUInteger totalLength);
typedef void(^HippyImageLoaderCompletionBlock)(NSData *_Nullable data,
                                               NSURL * _Nonnull url,
                                               NSError *_Nullable error,
                                               UIImage *_Nullable image,
                                               HippyImageLoaderControlOptions options);


/// A Resource Loader for custom image loading
@protocol HippyImageCustomLoaderProtocol <HippyBridgeModule>

@required

/// Load Image with given URL
/// Note that If you want to skip the decoding process lately,
/// such as using a third-party SDWebImage to decode,
/// Just set the ControlOptions parameters in the CompletionBlock.
/// 
/// - Parameters:
///   - imageUrl: image url
///   - extraInfo: extraInfo
///   - progressBlock: progress block
///   - completedBlock: completion block
- (void)loadImageAtUrl:(NSURL *)imageUrl
             extraInfo:(nullable NSDictionary *)extraInfo
              progress:(nullable HippyImageLoaderProgressBlock)progressBlock
             completed:(nullable HippyImageLoaderCompletionBlock)completedBlock;

@end

NS_ASSUME_NONNULL_END
