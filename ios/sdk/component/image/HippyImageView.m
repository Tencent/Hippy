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

#import "HippyImageView.h"
#import <objc/runtime.h>
#import "HippyUtils.h"
#import "UIView+Hippy.h"
#import "HippyImageViewCustomLoader.h"
#import "HippyBridge+LocalFileSource.h"
#import "HippyImageCacheManager.h"
#import "HippyAnimatedImage.h"
#import <Accelerate/Accelerate.h>
#import "NSData+Format.h"

static NSOperationQueue *hippy_image_queue() {
    static dispatch_once_t onceToken;
    static NSOperationQueue *_hippy_image_queue = nil;
    dispatch_once(&onceToken, ^{
        _hippy_image_queue = [[NSOperationQueue alloc] init];
        _hippy_image_queue.maxConcurrentOperationCount = 1;
    });
    return _hippy_image_queue;
}

static NSOperationQueue *animated_image_queue() {
    static dispatch_once_t onceToken;
    static NSOperationQueue *_animatedImageOQ = nil;
    dispatch_once(&onceToken, ^{
        _animatedImageOQ = [[NSOperationQueue alloc] init];
        _animatedImageOQ.maxConcurrentOperationCount = 1;
    });
    return _animatedImageOQ;
}

UIImage *HippyBlurredImageWithRadiusv(UIImage *inputImage, CGFloat radius)
{
	CGImageRef imageRef = inputImage.CGImage;
	CGFloat imageScale = inputImage.scale;
	UIImageOrientation imageOrientation = inputImage.imageOrientation;
	
	// Image must be nonzero size
	if (CGImageGetWidth(imageRef) * CGImageGetHeight(imageRef) == 0) {
		return inputImage;
	}
	
	//convert to ARGB if it isn't
	if (CGImageGetBitsPerPixel(imageRef) != 32 ||
		CGImageGetBitsPerComponent(imageRef) != 8 ||
		!((CGImageGetBitmapInfo(imageRef) & kCGBitmapAlphaInfoMask))) {
		UIGraphicsBeginImageContextWithOptions(inputImage.size, NO, inputImage.scale);
		[inputImage drawAtPoint:CGPointZero];
		imageRef = UIGraphicsGetImageFromCurrentImageContext().CGImage;
		UIGraphicsEndImageContext();
	}
	
	vImage_Buffer buffer1, buffer2;
	buffer1.width = buffer2.width = CGImageGetWidth(imageRef);
	buffer1.height = buffer2.height = CGImageGetHeight(imageRef);
	buffer1.rowBytes = buffer2.rowBytes = CGImageGetBytesPerRow(imageRef);
	size_t bytes = buffer1.rowBytes * buffer1.height;
	buffer1.data = malloc(bytes);
	buffer2.data = malloc(bytes);
	
	// A description of how to compute the box kernel width from the Gaussian
	// radius (aka standard deviation) appears in the SVG spec:
	// http://www.w3.org/TR/SVG/filters.html#feGaussianBlurElement
	uint32_t boxSize = floor((radius * imageScale * 3 * sqrt(2 * M_PI) / 4 + 0.5) / 2);
	boxSize |= 1; // Ensure boxSize is odd
	
	//create temp buffer
	void *tempBuffer = malloc((size_t)vImageBoxConvolve_ARGB8888(&buffer1, &buffer2, NULL, 0, 0, boxSize, boxSize,
																 NULL, kvImageEdgeExtend + kvImageGetTempBufferSize));
	
	//copy image data
	CFDataRef dataSource = CGDataProviderCopyData(CGImageGetDataProvider(imageRef));
	memcpy(buffer1.data, CFDataGetBytePtr(dataSource), bytes);
	CFRelease(dataSource);
	
	//perform blur
	vImageBoxConvolve_ARGB8888(&buffer1, &buffer2, tempBuffer, 0, 0, boxSize, boxSize, NULL, kvImageEdgeExtend);
	vImageBoxConvolve_ARGB8888(&buffer2, &buffer1, tempBuffer, 0, 0, boxSize, boxSize, NULL, kvImageEdgeExtend);
	vImageBoxConvolve_ARGB8888(&buffer1, &buffer2, tempBuffer, 0, 0, boxSize, boxSize, NULL, kvImageEdgeExtend);
	
	//free buffers
	free(buffer2.data);
	free(tempBuffer);
	
	//create image context from buffer
	CGContextRef ctx = CGBitmapContextCreate(buffer1.data, buffer1.width, buffer1.height,
											 8, buffer1.rowBytes, CGImageGetColorSpace(imageRef),
											 CGImageGetBitmapInfo(imageRef));
	
	//create image from context
	imageRef = CGBitmapContextCreateImage(ctx);
	UIImage *outputImage = [UIImage imageWithCGImage:imageRef scale:imageScale orientation:imageOrientation];
	CGImageRelease(imageRef);
	CGContextRelease(ctx);
	free(buffer1.data);
	return outputImage;
}

@interface UIImage (Hippy)
@property (nonatomic, copy) CAKeyframeAnimation *hippyKeyframeAnimation;
@end

@interface HippyImageView () {
    NSURLSessionDataTask *_task;
    long long _totalLength;
    NSMutableData *_data;
    __weak CALayer *_borderWidthLayer;
}

@property (nonatomic) HippyAnimatedImageOperation *animatedImageOperation;
@end

@implementation HippyImageView

- (instancetype)initWithBridge:(HippyBridge *)bridge
{
	if (self = [super init]) {
		_bridge = bridge;
		self.clipsToBounds = YES;
	}
	return self;
}

- (void)dealloc
{
	[[NSNotificationCenter defaultCenter] removeObserver: self];
}

- (void)didMoveToWindow
{
	[super didMoveToWindow];
	if (!self.window) {
		[self cancelImageLoad];
	} else {
		[self reloadImage];
	}
}

- (void)didReceiveMemoryWarning {
    [self clearImageIfDetached];
}

- (void)appDidEnterBackground {
    [self clearImageIfDetached];
}

- (void)appWillEnterForeground {
    
}

- (void)clearImageIfDetached
{
	if (!self.window) {
		[self clearImage];
	}
}

- (void)setSource:(NSArray *)source
{
	if (![_source isEqualToArray: source]) {
		_source = [source copy];
        self.animatedImage = nil;
		[self updateImage: nil];
		[self reloadImage];
	}
}

- (void)setDefaultImage:(UIImage *)defaultImage
{
    if (_defaultImage != defaultImage) {
        BOOL shouldUpdateImage = (self.image == _defaultImage);
        _defaultImage = defaultImage;
        if (shouldUpdateImage) {
            [self updateImage:_defaultImage];
        }
    }
}

- (void)setCapInsets:(UIEdgeInsets)capInsets
{
	if (!UIEdgeInsetsEqualToEdgeInsets(_capInsets, capInsets)) {
		if (UIEdgeInsetsEqualToEdgeInsets(_capInsets, UIEdgeInsetsZero) ||
			UIEdgeInsetsEqualToEdgeInsets(capInsets, UIEdgeInsetsZero)) {
			_capInsets = capInsets;
			[self reloadImage];
		} else {
			_capInsets = capInsets;
			[self updateImage: self.image];
		}
	}
}

- (void)setBlurRadius:(CGFloat)blurRadius
{
	if (blurRadius != _blurRadius) {
		_blurRadius = blurRadius;
		[self reloadImage];
	}
}

- (void) setFrame:(CGRect)frame {
    [super setFrame:frame];
    if (nil == self.image) {
        [self reloadImage];
    }
}

- (void)setResizeMode:(HippyResizeMode)resizeMode
{
	if (_resizeMode != resizeMode) {
		_resizeMode = resizeMode;
		
		if (_resizeMode == HippyResizeModeRepeat) {
			self.contentMode = UIViewContentModeScaleToFill;
		} else {
			self.contentMode = (UIViewContentMode)resizeMode;
		}
	}
}

- (void)setRenderingMode:(UIImageRenderingMode)renderingMode
{
	if (_renderingMode != renderingMode) {
		_renderingMode = renderingMode;
		[self updateImage: self.image];
	}
}

- (void)reloadImage
{
    NSDictionary *source = [self.source firstObject];
	if (source && CGRectGetWidth(self.frame) > 0 && CGRectGetHeight(self.frame) > 0) {
		if (_onLoadStart) {
			_onLoadStart(@{});
		}
        NSString *uri = source[@"uri"];
        
        BOOL isBlurredImage = NO;
        UIImage *image = [[HippyImageCacheManager sharedInstance] loadImageFromCacheForURLString:uri radius:_blurRadius isBlurredImage:&isBlurredImage];
        if (image) {
            [self loadImage:image url:uri error:nil needBlur:!isBlurredImage needCache:NO];
            return;
        }
        NSData *uriData = [uri dataUsingEncoding:NSUTF8StringEncoding];
        if (nil == uriData) {
            return;
        }
        CFURLRef urlRef = CFURLCreateWithBytes(NULL, [uriData bytes], [uriData length], kCFStringEncodingUTF8, NULL);
        NSURL *source_url = CFBridgingRelease(urlRef);
        if ([HippyBridge isHippyLocalFileURLString:uri]) {
            NSString *localPath = [_bridge absoluteStringFromHippyLocalFileURLString:uri];
            BOOL isDirectory = NO;
            BOOL fileExist = [[NSFileManager defaultManager] fileExistsAtPath:localPath isDirectory:&isDirectory];
            if (fileExist && !isDirectory) {
                NSData *imageData = [NSData dataWithContentsOfFile:localPath];
                BOOL isSharpP = NO;
                if ([imageData hippy_isGif] || isSharpP) {
                    if (_animatedImageOperation) {
                        [_animatedImageOperation cancel];
                    }
                    _animatedImageOperation = [[HippyAnimatedImageOperation alloc] initWithAnimatedImageData:imageData imageView:self imageURL:source[@"uri"]];
                    [animated_image_queue() addOperation:_animatedImageOperation];
                }
                else {
                    UIImage *image = [self imageFromData:imageData];
                    [self loadImage:image url:source_url.absoluteString error:nil needBlur:YES needCache:YES];
                }
            }
            else {
                NSError *error = [NSError errorWithDomain:HippyLocalFileReadErrorDomain code:HippyLocalFileNOFilExist userInfo:@{@"fileExist": @(fileExist), @"isDirectory": @(isDirectory), @"uri": uri}];
                [self loadImage:nil url:source_url.absoluteString error:error needBlur:YES needCache:NO];
            }
            return;
        }
		__weak typeof(self) weakSelf = self;
		if(_bridge.imageLoader && source_url) {
            if (_defaultImage) {
                weakSelf.image = _defaultImage;
            }
            [_bridge.imageLoader imageView:weakSelf loadAtUrl:source_url placeholderImage:_defaultImage context: NULL progress:^(long long currentLength, long long totalLength) {
				if (weakSelf.onProgress) {
					weakSelf.onProgress(@{@"loaded": @((double)currentLength), @"total": @((double)totalLength)});
				}
			} completed:^(NSData *data, NSURL *url, NSError *error) {
                BOOL isSharpP = NO;
                if ([data hippy_isGif] || isSharpP) {
                    if (weakSelf.animatedImageOperation) {
                        [weakSelf.animatedImageOperation cancel];
                    }
                    weakSelf.animatedImageOperation = [[HippyAnimatedImageOperation alloc] initWithAnimatedImageData:data imageView:weakSelf imageURL:url.absoluteString];
                    [animated_image_queue() addOperation:weakSelf.animatedImageOperation];
                }
                else {
                    UIImage *image = [weakSelf imageFromData:data];
                    [weakSelf loadImage: image url: url.absoluteString error: error needBlur:YES needCache:YES];
                }
			}];
		} else {
			if ([uri hasPrefix: @"data:image/"]) {
                NSString *base64Data = uri;
                NSRange range = [uri rangeOfString:@";base64,"];
                if (NSNotFound != range.location) {
                    base64Data = [uri substringFromIndex:range.location + range.length];
                }
				NSData *imageData = [[NSData alloc] initWithBase64EncodedString:base64Data options: NSDataBase64DecodingIgnoreUnknownCharacters];
                BOOL isSharpP = NO;
                if ([imageData hippy_isGif] || isSharpP) {
                    if (_animatedImageOperation) {
                        [_animatedImageOperation cancel];
                    }
                    _animatedImageOperation = [[HippyAnimatedImageOperation alloc] initWithAnimatedImageData:imageData imageView:self imageURL:uri];
                    [animated_image_queue() addOperation:_animatedImageOperation];
                }
                else {
                    UIImage *image = [self imageFromData:imageData];
                    NSError *error = nil;
                    if (!image) {
                        error = [NSError errorWithDomain: NSURLErrorDomain code: -1 userInfo: @{NSLocalizedDescriptionKey: @"base64 url is invalidated"}];
                    }
                    [weakSelf loadImage: image url: source[@"uri"] error: error needBlur:YES needCache:YES];
                }
			}
            else {
                if (_task) {
                    [self cancelImageLoad];
                }
                NSURLSessionConfiguration *sessionConfiguration = [NSURLSessionConfiguration ephemeralSessionConfiguration];
                NSURLSession *session = [NSURLSession sessionWithConfiguration:sessionConfiguration delegate: self delegateQueue:hippy_image_queue()];
                _task = [session dataTaskWithURL:source_url];
                [_task resume];
            }
		}
	}
}

- (void)cancelImageLoad
{
	NSDictionary *source = [self.source firstObject];
	if (_bridge.imageLoader) {
        [_animatedImageOperation cancel];
        _animatedImageOperation = nil;
		[_bridge.imageLoader cancelImageDownload: self withUrl: source[@"uri"]];
	} else {
		[_task cancel];
		_task = nil;
        [hippy_image_queue() addOperationWithBlock:^{
            self->_data = nil;
            self->_totalLength = 0;
        }];
	}
}

- (void)clearImage
{
	[self cancelImageLoad];
	[self.layer removeAnimationForKey:@"contents"];
	self.image = nil;
}

- (UIImage *) imageFromData:(NSData *)data {
    if (nil == data) {
        return nil;
    }
#ifdef DEBUG
    CGImageSourceRef imageSourceRef = CGImageSourceCreateWithData((__bridge CFDataRef)data, NULL);
    if (imageSourceRef) {
        size_t imageCount = CGImageSourceGetCount(imageSourceRef);
        CFRelease(imageSourceRef);
        HippyAssert(imageCount < 2, @"not for GIF image");
    }
#endif
    return [UIImage imageWithData:data];
}

#pragma mark  -
- (void)URLSession:(__unused NSURLSession *)session dataTask:(__unused NSURLSessionDataTask *)dataTask didReceiveResponse:(NSURLResponse *)response completionHandler:(void (^)(NSURLSessionResponseDisposition disposition))completionHandler
{
    if (_task == dataTask) {
        _totalLength = response.expectedContentLength;
        completionHandler(NSURLSessionResponseAllow);
        NSUInteger capacity = NSURLResponseUnknownLength != _totalLength ? (NSUInteger)_totalLength : 256;
        _data = [[NSMutableData alloc] initWithCapacity:capacity];
    }
}

- (void)URLSession:(__unused NSURLSession *)session dataTask:(__unused NSURLSessionDataTask *)dataTask didReceiveData:(NSData *)data
{
    if (_task == dataTask) {
        if (_onProgress && NSURLResponseUnknownLength != _totalLength) {
            _onProgress(@{@"loaded": @((double)data.length), @"total": @((double)_totalLength)});
        }
        [_data appendData: data];
    }
}

- (void)URLSession:(__unused NSURLSession *)session task:(nonnull NSURLSessionTask *)task didCompleteWithError:(nullable NSError *)error
{
    if (_task == task) {
        NSDictionary *source = [self.source firstObject];
        if (!error) {
            BOOL isGif = [_data hippy_isGif];
            if (isGif) {
                if (_animatedImageOperation) {
                    [_animatedImageOperation cancel];
                }
                _animatedImageOperation = [[HippyAnimatedImageOperation alloc] initWithAnimatedImageData:_data imageView:self imageURL:source[@"uri"]];
                [animated_image_queue() addOperation:_animatedImageOperation];
            }
            else {
                [[HippyImageCacheManager sharedInstance] setImageCacheData:_data forURLString:source[@"uri"]];
                UIImage *image = [self imageFromData:_data];;
                if (image) {
                    [self loadImage: image url:source[@"uri"] error:nil needBlur:YES needCache:YES];
                } else {
                    NSError *theError = [NSError errorWithDomain:@"imageFromDataErrorDomain" code:1 userInfo:@{@"reason": @"Error in imageFromData"}];
                    [self loadImage: nil url:source[@"uri"] error:theError needBlur:YES needCache:YES];
                }
            }
        } else {
            [self loadImage:nil url:source[@"uri"] error:error needBlur:YES needCache:YES];
        }
    }
    [session finishTasksAndInvalidate];
}

#pragma mark -


- (void)loadImage:(UIImage *)image url:(NSString *)url error:(NSError *)error needBlur:(BOOL)needBlur needCache:(BOOL)needCache
{
	if (error) {
		if (_onError && error.code != NSURLErrorCancelled) {
			_onError(@{@"error": error.localizedDescription});
		}
		if (_onLoadEnd) {
			_onLoadEnd(nil);
		}
		return;
	}
	
	__weak typeof(self) weakSelf = self;
	void (^setImageBlock)(UIImage *) = ^(UIImage *image) {
		if (image.hippyKeyframeAnimation) {
			[weakSelf.layer addAnimation:image.hippyKeyframeAnimation forKey:@"contents"];
		} else {
			[weakSelf.layer removeAnimationForKey:@"contents"];
			[weakSelf updateImage: image];
		}
		
		if (weakSelf.onLoad)
			weakSelf.onLoad(@{@"width": @(image.size.width),@"height": @(image.size.height), @"url":url ? :@""});
		if (weakSelf.onLoadEnd)
			weakSelf.onLoadEnd(nil);
	};
    
    if (_blurRadius > 100 && [NSProcessInfo processInfo].physicalMemory <= 1024 * 1024 * 1000) {
        _blurRadius = 100;
    }
    
    CGFloat br = _blurRadius;
	if (_blurRadius > __FLT_EPSILON__ && needBlur) {
		// Blur on a background thread to avoid blocking interaction
		dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
			UIImage *blurredImage = HippyBlurredImageWithRadiusv(image, br);
            if (needCache) {
                [[HippyImageCacheManager sharedInstance] setImage:blurredImage forURLString:url blurRadius:br];
            }
			HippyExecuteOnMainQueue(^{
				setImageBlock(blurredImage);
			});
		});
	} else {
		HippyExecuteOnMainQueue(^{
            if (needCache) {
                [[HippyImageCacheManager sharedInstance] setImage:image forURLString:url blurRadius:br];
            }
			setImageBlock(image);
		});
	}
}

- (void)updateImage:(UIImage *)image
{
	image = image ? : _defaultImage;
	if (!image) {
		self.image = nil;
		return;
	}
	
	if (_renderingMode != image.renderingMode) {
		image = [image imageWithRenderingMode:_renderingMode];
	}
	
	if (_resizeMode == HippyResizeModeRepeat) {
		image = [image resizableImageWithCapInsets: _capInsets resizingMode: UIImageResizingModeTile];
	} else if (!UIEdgeInsetsEqualToEdgeInsets(UIEdgeInsetsZero, _capInsets)) {
		// Applying capInsets of 0 will switch the "resizingMode" of the image to "tile" which is undesired
		image = [image resizableImageWithCapInsets:_capInsets resizingMode:UIImageResizingModeStretch];
	}
	
	// Apply trilinear filtering to smooth out mis-sized images
//    self.layer.minificationFilter = kCAFilterTrilinear;
//    self.layer.magnificationFilter = kCAFilterTrilinear;

    if (image.images) {
        HippyAssert(NO, @"GIF图片不应该进入这个逻辑");
	}
	else {
		self.image = image;
        [self updateCornerRadius];
	}
}

- (void) updateCornerRadius {
    if (_borderWidthLayer) {
        [_borderWidthLayer removeFromSuperlayer];
    }
    if ([self needsUpdateCornerRadius]) {
        CGRect contentRect = UIEdgeInsetsInsetRect(self.bounds, _capInsets);
        
#ifdef HippyLog
        CGFloat width = CGRectGetWidth(contentRect);
        CGFloat height = CGRectGetHeight(contentRect);
        BOOL flag1 = _borderTopLeftRadius <= MIN(width, height) / 2;
        if (!flag1) {
            HippyLog(@"[warning] _borderTopLeftRadius must be shorter than width / 2");
        }
        BOOL flag2 = _borderTopRightRadius <= MIN(width, height) / 2;
        if (!flag2) {
            HippyLog(@"[warning] _borderTopRightRadius must be shorter than width / 2");
        }
        BOOL flag3 = _borderBottomLeftRadius <= MIN(width, height) / 2;
        if (!flag3) {
            HippyLog(@"[warning] _borderBottomLeftRadius must be shorter than width / 2");
        }
        BOOL flag4 = _borderBottomRightRadius <= MIN(width, height) / 2;
        if (!flag4) {
            HippyLog(@"[warning] _borderBottomRightRadius must be shorter than width / 2");
        }
#endif
        
        CGFloat minX = CGRectGetMinX(contentRect);
        CGFloat minY = CGRectGetMinY(contentRect);
        CGFloat maxX = CGRectGetMaxX(contentRect);
        CGFloat maxY = CGRectGetMaxY(contentRect);
        
        UIBezierPath *bezierPath = [UIBezierPath bezierPath];
        CGPoint p1 = CGPointMake(minX + _borderTopLeftRadius, minY);
        [bezierPath moveToPoint:p1];
        CGPoint p2 = CGPointMake(maxX - _borderTopRightRadius, minY);
        [bezierPath addLineToPoint:p2];
        CGPoint p3 = CGPointMake(maxX - _borderTopRightRadius, minY + _borderTopRightRadius);
        [bezierPath addArcWithCenter:p3 radius:_borderTopRightRadius startAngle:M_PI_2 + M_PI endAngle:0 clockwise:YES];
        
        CGPoint p4 = CGPointMake(maxX, maxY - _borderBottomRightRadius);
        [bezierPath addLineToPoint:p4];
        CGPoint p5 = CGPointMake(maxX - _borderBottomRightRadius, maxY - _borderBottomRightRadius);
        [bezierPath addArcWithCenter:p5 radius:_borderBottomRightRadius startAngle:0 endAngle:M_PI_2 clockwise:YES];
        
        CGPoint p6 = CGPointMake(minX + _borderBottomLeftRadius, maxY);
        [bezierPath addLineToPoint:p6];
        CGPoint p7 = CGPointMake(minX + _borderBottomLeftRadius, maxY - _borderBottomLeftRadius);
        [bezierPath addArcWithCenter:p7 radius:_borderBottomLeftRadius startAngle:M_PI_2 endAngle:M_PI clockwise:YES];
        
        CGPoint p8 = CGPointMake(minX, minY + _borderTopLeftRadius);
        [bezierPath addLineToPoint:p8];
        CGPoint p9 = CGPointMake(minX + _borderTopLeftRadius, minY + _borderTopLeftRadius);
        [bezierPath addArcWithCenter:p9 radius:_borderTopLeftRadius startAngle:M_PI endAngle:M_PI + M_PI_2 clockwise:YES];
        [bezierPath closePath];
        
        CAShapeLayer *mask = [CAShapeLayer layer];
        mask.path = bezierPath.CGPath;
        self.layer.mask = mask;
        
        CAShapeLayer *borderLayer = [CAShapeLayer layer];
        borderLayer.path = bezierPath.CGPath;
        borderLayer.fillColor = [UIColor clearColor].CGColor;
        borderLayer.strokeColor = self.layer.borderColor;
        borderLayer.lineWidth = self.layer.borderWidth * 2;
        borderLayer.frame = contentRect;
        _borderWidthLayer = borderLayer;
        [self.layer addSublayer:borderLayer];
    }
    else {
        self.layer.mask = nil;
    }
}

- (BOOL) needsUpdateCornerRadius {
    if (_borderTopLeftRadius > CGFLOAT_MIN ||
        _borderTopRightRadius > CGFLOAT_MIN ||
        _borderBottomLeftRadius > CGFLOAT_MIN ||
        _borderBottomRightRadius > CGFLOAT_MIN) {
        return YES;
    }
    return NO;
}

@end

@implementation UIImage (Hippy)

- (CAKeyframeAnimation *)hippyKeyframeAnimation
{
	return objc_getAssociatedObject(self, _cmd);
}

- (void)setHippyKeyframeAnimation:(CAKeyframeAnimation *)hippyKeyframeAnimation
{
	objc_setAssociatedObject(self, @selector(hippyKeyframeAnimation), hippyKeyframeAnimation, OBJC_ASSOCIATION_COPY_NONATOMIC);
}

@end

@implementation HippyConvert(HippyResizeMode)

HIPPY_ENUM_CONVERTER(HippyResizeMode, (@{
									 @"cover": @(HippyResizeModeCover),
									 @"contain": @(HippyResizeModeContain),
									 @"stretch": @(HippyResizeModeStretch),
									 @"center": @(HippyResizeModeCenter),
									 @"repeat": @(HippyResizeModeRepeat),
									 }), HippyResizeModeStretch, integerValue)

@end



@implementation HippyAnimatedImageOperation

- (id) initWithAnimatedImageData:(NSData *)data imageView:(HippyImageView *)imageView imageURL:(NSString *)url {
    self = [super init];
    if (self) {
        _animatedImageData = data;
        _url = url;
        _imageView = imageView;
    }
    return self;
}
- (void) main {
    if (![self isCancelled] && _animatedImageData &&_imageView) {
        HippyAnimatedImage *animatedImage  = [HippyAnimatedImage animatedImageWithGIFData:_animatedImageData];
        if (![self isCancelled] && _imageView) {
            __weak HippyImageView *wIV = _imageView;
            __weak NSString *wURL = _url;
            dispatch_async(dispatch_get_main_queue(), ^{
                HippyImageView *sIV = wIV;
                NSString *sURL = wURL;
                [sIV loadImage:animatedImage.posterImage url:sURL error:nil needBlur:NO needCache:NO];
                sIV.animatedImage = animatedImage;
            });
        }
    }
}

@end
