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

#import <Foundation/Foundation.h>

@class UIImage;

@protocol NativeRenderImageProviderProtocol <NSObject>

@required

/** ask delegate that can data be handled
 */
+ (BOOL)canHandleData:(NSData *)data;

/** ask delegate that data represent an animated image(gif,apng,etc)
 */
+ (BOOL)isAnimatedImage:(NSData *)data;

@property(nonatomic, copy)NSString *imageDataPath;

/**
 * Image scale
 */
@property(nonatomic, assign)CGFloat scale;

/**
 * Set image data for provider
 *
 * @param data Image data
 */
- (void)setImageData:(NSData *)data;

/** return image.If it is an animated image,return first frame
 */
- (UIImage *)image;

// for animated Image
@optional

/** return frame count for animated image
 */
- (NSUInteger)imageCount;

/** return frame at index
 */
- (UIImage *)imageAtFrame:(NSUInteger)frame;
/**return animated image loop count
 *  return 0 means loop forever
 */
- (NSUInteger)loopCount;

/** delay time for frame at index
 */
- (NSTimeInterval)delayTimeAtFrame:(NSUInteger)frame;

@end
