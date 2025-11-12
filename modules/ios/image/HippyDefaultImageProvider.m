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
#import "HippyDefaultImageProvider.h"
#import "NSData+DataType.h"
#import <CoreServices/CoreServices.h>
#import <os/lock.h>

@interface HippyDefaultImageProvider () {
    NSData *_data;
    UIImage *_image;
    CGImageSourceRef _imageSourceRef;
    os_unfair_lock _imageSourceLock;
}

@end

@implementation HippyDefaultImageProvider

@synthesize scale = _scale;
@synthesize imageDataPath = _imageDataPath;

+ (BOOL)canHandleData:(NSData *)data {
    return YES;
}

+ (BOOL)isAnimatedImage:(NSData *)data {
    BOOL ret = [data datatype_isAnimatedImage];
    return ret;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _scale = 1.0;
        _imageSourceLock = OS_UNFAIR_LOCK_INIT;
    }
    return self;
}

- (void)setImageData:(NSData *)imageData {
    if ([[self class] isAnimatedImage:imageData]) {
        _imageSourceRef = CGImageSourceCreateWithData((__bridge CFDataRef)imageData, NULL);
    } else {
        _data = imageData;
    }
}

- (void)setDecodedImage:(UIImage *)image {
    if (_image != image) {
        _image = image;
    }
}

- (dispatch_queue_t)prepareQueue{
    return dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
}

- (void)prepareForDisplay:(void (^)(UIImage *_Nullable))completionHandler{
    UIImage *theImage = [self image];
    BOOL fallback = YES;
    
    if(theImage){
        __weak typeof(self) weakSelf = self;
        if (@available(iOS 15.0, *)) {
            CFStringRef ut = CGImageGetUTType(theImage.CGImage);
            // prepareForDisplayWithCompletionHandler support jpeg and heif only
            if(ut != nil && (kCFCompareEqualTo == CFStringCompare(ut, kUTTypeJPEG, 0) ||
                             kCFCompareEqualTo == CFStringCompare(ut, (__bridge CFStringRef)@"public.heif", 0))){
                fallback = NO;
                
                [theImage prepareForDisplayWithCompletionHandler:^(UIImage * _Nullable prepared) {
                    typeof(self) strongSelf = weakSelf;
                    if(strongSelf){
                        @synchronized(strongSelf){
                            if(prepared){
                                strongSelf->_image = prepared;
                            }
                            completionHandler(prepared);
                        }
                    }
                }];
                return;
            }
        }
        
        
        dispatch_async([self prepareQueue], ^{
            @autoreleasepool {
                UIImage *prepared = nil;
                
                // Check image dimensions to prevent memory spikes
                CGFloat imageWidth = theImage.size.width * theImage.scale;
                CGFloat imageHeight = theImage.size.height * theImage.scale;
                const CGFloat maxDimension = 4096.0; // Max dimension limit
                
                // Skip rendering for oversized images to avoid memory spikes
                if (imageWidth > maxDimension || imageHeight > maxDimension) {
                    // Use original image for oversized images
                    prepared = theImage;
                } else {
                    UIGraphicsImageRendererFormat *format = [UIGraphicsImageRendererFormat preferredFormat];
                    CGImageAlphaInfo alphaInfo = CGImageGetAlphaInfo(theImage.CGImage);
                    BOOL hasAlpha = (alphaInfo != kCGImageAlphaNone && 
                                    alphaInfo != kCGImageAlphaNoneSkipFirst && 
                                    alphaInfo != kCGImageAlphaNoneSkipLast);
                    format.opaque = !hasAlpha;
                    
                    UIGraphicsImageRenderer *renderer = [[UIGraphicsImageRenderer alloc]
                                                         initWithSize:theImage.size
                                                         format:format];
                    prepared = [renderer imageWithActions:^(UIGraphicsImageRendererContext * _Nonnull rendererContext) {
                        [theImage drawAtPoint:CGPointZero];
                    }];
                }
                
                typeof(self) strongSelf = weakSelf;
                if(strongSelf){
                    @synchronized(strongSelf){
                        if(prepared){
                            strongSelf->_image = prepared;
                        }
                        completionHandler(prepared);
                    }
                }
            }
        });
        return;
    }
    
    
    if(fallback){
        completionHandler(nil);
    }
}

- (UIImage *)image {
    @synchronized (self) {
        if (_image) {
            return _image;
        }
    }
    
    @autoreleasepool {
        UIImage *decodedImage = nil;
        
        if (_data) {
            decodedImage = [self decodeImageFromData];
        } else {
            decodedImage = [self imageAtFrame:0];
        }
        
        // Fallback to simple decoding if needed
        if (!decodedImage) {
            decodedImage = [UIImage imageWithData:_data scale:self.scale];
        }
        
        @synchronized (self) {
            if (!_image) {
                _image = decodedImage;
            }
            return _image;
        }
    }
}

- (nullable UIImage *)decodeImageFromData {
    if (!_data) {
        return nil;
    }
    
    // Try downsampling if enabled and view size is available
    if (_downSample && _imageViewSize.width > 0 && _imageViewSize.height > 0) {
        UIImage *downsampledImage = [self createDownsampledImageFromData];
        if (downsampledImage) {
            return downsampledImage;
        }
    }
    
    return nil;
}

- (nullable UIImage *)createDownsampledImageFromData {
    CGFloat scale = self.scale;
    CGFloat targetWidth = _imageViewSize.width * scale;
    CGFloat targetHeight = _imageViewSize.height * scale;
    
    // Create image source without caching
    NSDictionary *sourceOptions = @{ (NSString *)kCGImageSourceShouldCache: @(NO) };
    CGImageSourceRef imageSource = CGImageSourceCreateWithData((__bridge CFDataRef)_data, 
                                                               (__bridge CFDictionaryRef)sourceOptions);
    if (!imageSource) {
        return nil;
    }
    
    UIImage *result = nil;
    CGSize imageSize = [self getImageSizeFromSource:imageSource];
    
    // Only downsample if image is larger than target size
    if (imageSize.width > targetWidth || imageSize.height > targetHeight) {
        result = [self createThumbnailFromSource:imageSource 
                                      targetSize:_imageViewSize 
                                           scale:scale];
    }
    
    CFRelease(imageSource);
    return result;
}

- (CGSize)getImageSizeFromSource:(CGImageSourceRef)imageSource {
    CGSize size = CGSizeZero;
    
    CFDictionaryRef properties = CGImageSourceCopyPropertiesAtIndex(imageSource, 0, NULL);
    if (!properties) {
        return size;
    }
    
    CFTypeRef widthValue = CFDictionaryGetValue(properties, kCGImagePropertyPixelWidth);
    CFTypeRef heightValue = CFDictionaryGetValue(properties, kCGImagePropertyPixelHeight);
    
    NSInteger width = 0, height = 0;
    if (widthValue) {
        CFNumberGetValue(widthValue, kCFNumberLongType, &width);
    }
    if (heightValue) {
        CFNumberGetValue(heightValue, kCFNumberLongType, &height);
    }
    
    size = CGSizeMake(width, height);
    CFRelease(properties);
    
    return size;
}

- (nullable UIImage *)createThumbnailFromSource:(CGImageSourceRef)imageSource 
                                     targetSize:(CGSize)targetSize 
                                          scale:(CGFloat)scale {
    NSInteger maxDimension = MAX(targetSize.width, targetSize.height) * scale;
    
    NSDictionary *thumbnailOptions = @{
        (NSString *)kCGImageSourceCreateThumbnailFromImageAlways: @(YES),
        (NSString *)kCGImageSourceShouldCacheImmediately: @(YES),
        (NSString *)kCGImageSourceCreateThumbnailWithTransform: @(YES),
        (NSString *)kCGImageSourceThumbnailMaxPixelSize: @(maxDimension)
    };
    
    CGImageRef thumbnailImage = CGImageSourceCreateThumbnailAtIndex(imageSource, 0, 
                                                                    (__bridge CFDictionaryRef)thumbnailOptions);
    if (!thumbnailImage) {
        return nil;
    }
    
    UIImage *result = [UIImage imageWithCGImage:thumbnailImage 
                                          scale:scale 
                                    orientation:UIImageOrientationUp];
    CGImageRelease(thumbnailImage);
    
    return result;
}

- (UIImage *)imageAtFrame:(NSUInteger)index {
    if (_imageSourceRef) {
        os_unfair_lock_lock(&_imageSourceLock);
        if (!_imageSourceRef) {
            os_unfair_lock_unlock(&_imageSourceLock);
            return nil;
        }
        CGImageRef imageRef = CGImageSourceCreateImageAtIndex(_imageSourceRef, index, NULL);
        os_unfair_lock_unlock(&_imageSourceLock);
        if (!imageRef) return nil;
        UIImage *image = [UIImage imageWithCGImage:imageRef];
        CGImageRelease(imageRef);
        return image;
    } else if (_data) {
        return [self image];
    }
    return nil;
}

- (NSUInteger)imageCount {
    os_unfair_lock_lock(&_imageSourceLock);
    if (!_imageSourceRef) {
        os_unfair_lock_unlock(&_imageSourceLock);
        return 0;
    }
    size_t count = CGImageSourceGetCount(_imageSourceRef);
    os_unfair_lock_unlock(&_imageSourceLock);
    return count;
}

- (NSUInteger)loopCount {
    os_unfair_lock_lock(&_imageSourceLock);
    if (!_imageSourceRef) {
        os_unfair_lock_unlock(&_imageSourceLock);
        return 0;
    }
    
    CFStringRef imageSourceContainerType = CGImageSourceGetType(_imageSourceRef);
    NSDictionary *imageProperties = CFBridgingRelease(CGImageSourceCopyProperties(_imageSourceRef, NULL));
    os_unfair_lock_unlock(&_imageSourceLock);
    
    NSString *imagePropertyKey = (NSString *)kCGImagePropertyGIFDictionary;
    NSString *loopCountKey = (NSString *)kCGImagePropertyGIFLoopCount;
    if (UTTypeConformsTo(imageSourceContainerType, kUTTypePNG)) {
        imagePropertyKey = (NSString *)kCGImagePropertyPNGDictionary;
        loopCountKey = (NSString *)kCGImagePropertyAPNGLoopCount;
    }
    
    id loopCountObject = [[imageProperties objectForKey:imagePropertyKey] objectForKey:loopCountKey];
    if (loopCountObject) {
        NSUInteger loopCount = [loopCountObject unsignedIntegerValue];
        return 0 == loopCount ? NSUIntegerMax : loopCount;
    } else {
        return NSUIntegerMax;
    }
}

- (NSTimeInterval)delayTimeAtFrame:(NSUInteger)frame {
    const NSTimeInterval kDelayTimeIntervalDefault = 0.1;
    
    os_unfair_lock_lock(&_imageSourceLock);
    if (!_imageSourceRef) {
        os_unfair_lock_unlock(&_imageSourceLock);
        return kDelayTimeIntervalDefault;
    }
    
    NSDictionary *frameProperties = CFBridgingRelease(CGImageSourceCopyPropertiesAtIndex(_imageSourceRef, frame, NULL));
    CFStringRef _Nullable utType = CGImageSourceGetType(_imageSourceRef);
    os_unfair_lock_unlock(&_imageSourceLock);
    
    NSString *imagePropertyKey = (NSString *)kCGImagePropertyGIFDictionary;
    NSString *delayTimeKey = (NSString *)kCGImagePropertyGIFDelayTime;
    NSString *unclampedDelayTime = (NSString *)kCGImagePropertyGIFUnclampedDelayTime;
    
    if (UTTypeConformsTo(utType, kUTTypePNG)) {
        imagePropertyKey = (NSString *)kCGImagePropertyPNGDictionary;
        delayTimeKey = (NSString *)kCGImagePropertyAPNGDelayTime;
        unclampedDelayTime = (NSString *)kCGImagePropertyAPNGUnclampedDelayTime;
    }
    
    NSDictionary *framePropertiesAni = [frameProperties objectForKey:imagePropertyKey];
    NSNumber *delayTime = [framePropertiesAni objectForKey:unclampedDelayTime];
    if (!delayTime) {
        delayTime = [framePropertiesAni objectForKey:delayTimeKey];
    }
    if (!delayTime) {
        delayTime = @(kDelayTimeIntervalDefault);
    }
    return [delayTime doubleValue];
}

- (void)dealloc {
    os_unfair_lock_lock(&_imageSourceLock);
    if (_imageSourceRef) {
        CFRelease(_imageSourceRef);
        _imageSourceRef = NULL;
    }
    os_unfair_lock_unlock(&_imageSourceLock);
    _data = nil;
}

@end
