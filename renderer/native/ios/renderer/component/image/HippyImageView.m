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

#import <Accelerate/Accelerate.h>

#import "HippyAssert.h"
#import "HippyUtils.h"
#import "HippyImageView.h"
#import "HippyAnimatedImage.h"
#import "UIView+MountEvent.h"

NSString *const HippyImageErrorDomain = @"HippyImageErrorDomain";

typedef NS_ENUM(NSUInteger, ImageDataError) {
    ImageDataUnavailable = 10001,
    ImageDataNotExist,
    ImageDataReceivedError,
    ImageDataBlurredError,
};

typedef struct _BorderRadiusStruct {
    CGFloat topLeftRadius;
    CGFloat topRightRadius;
    CGFloat bottomLeftRadius;
    CGFloat bottomRightRadius;
} BorderRadiusStruct;

static NSOperationQueue *animated_image_queue(void) {
    static dispatch_once_t onceToken;
    static NSOperationQueue *_animatedImageOQ = nil;
    dispatch_once(&onceToken, ^{
        _animatedImageOQ = [[NSOperationQueue alloc] init];
        _animatedImageOQ.name = @"com.hippy.animatedImage";
    });
    return _animatedImageOQ;
}

static BOOL HippyImageNeedsShrinkForSize(UIImage *inputImage, CGSize size) {
    CGSize inputImageSize = inputImage.size;
    if (inputImageSize.width > size.width || inputImageSize.height > size.height) {
        return YES;
    }
    return NO;
}

UIImage *HippyBlurredImageWithRadiusv(UIImage *inputImage, CGFloat radius, NSError **error) {
    CGImageRef imageRef = inputImage.CGImage;
    CGFloat imageScale = inputImage.scale;
    UIImageOrientation imageOrientation = inputImage.imageOrientation;

    // Image must be nonzero size
    if (CGImageGetWidth(imageRef) * CGImageGetHeight(imageRef) == 0) {
        return inputImage;
    }

    // convert to ARGB if it isn't
    if (CGImageGetBitsPerPixel(imageRef) != 32 || CGImageGetBitsPerComponent(imageRef) != 8
        || !((CGImageGetBitmapInfo(imageRef) & kCGBitmapAlphaInfoMask))) {
        UIGraphicsBeginImageContextWithOptions(inputImage.size, NO, inputImage.scale);
        [inputImage drawAtPoint:CGPointZero];
        imageRef = UIGraphicsGetImageFromCurrentImageContext().CGImage;
        UIGraphicsEndImageContext();
    }
    
    vImage_Buffer buffer1, buffer2;
    memset(&buffer1, 0, sizeof(vImage_Buffer));
    memset(&buffer2, 0, sizeof(vImage_Buffer));
    void *tempBuffer = NULL;
    CFDataRef dataSource = NULL;
    CGContextRef ctx = NULL;
    CGImageRef blurredImageRef = NULL;
    @try {
        buffer1.width = buffer2.width = CGImageGetWidth(imageRef);
        buffer1.height = buffer2.height = CGImageGetHeight(imageRef);
        buffer1.rowBytes = buffer2.rowBytes = CGImageGetBytesPerRow(imageRef);
        size_t bytes = buffer1.rowBytes * buffer1.height;
        buffer1.data = malloc(bytes);
        if (NULL == buffer1.data) {
            return inputImage;
        }
        buffer2.data = malloc(bytes);
        if (NULL == buffer2.data) {
            free(buffer1.data);
            return inputImage;
        }
        // A description of how to compute the box kernel width from the Gaussian
        // radius (aka standard deviation) appears in the SVG spec:
        // http://www.w3.org/TR/SVG/filters.html#feGaussianBlurElement
        uint32_t boxSize = floor((radius * imageScale * 3 * sqrt(2 * M_PI) / 4 + 0.5) / 2);
        boxSize |= 1;  // Ensure boxSize is odd

        // create temp buffer
        tempBuffer = malloc(
            (size_t)vImageBoxConvolve_ARGB8888(&buffer1, &buffer2, NULL, 0, 0, boxSize, boxSize, NULL, kvImageEdgeExtend + kvImageGetTempBufferSize));

        // copy image data
        dataSource = CGDataProviderCopyData(CGImageGetDataProvider(imageRef));
        memcpy(buffer1.data, CFDataGetBytePtr(dataSource), bytes);
        CFRelease(dataSource);
        dataSource = NULL;

        // perform blur
        vImage_Error error;
        error = vImageBoxConvolve_ARGB8888(&buffer1, &buffer2, tempBuffer, 0, 0, boxSize, boxSize, NULL, kvImageEdgeExtend);
        if (error) {
            return inputImage;
        }
        error = vImageBoxConvolve_ARGB8888(&buffer2, &buffer1, tempBuffer, 0, 0, boxSize, boxSize, NULL, kvImageEdgeExtend);
        if (error) {
            return inputImage;
        }
        error = vImageBoxConvolve_ARGB8888(&buffer1, &buffer2, tempBuffer, 0, 0, boxSize, boxSize, NULL, kvImageEdgeExtend);
        if (error) {
            return inputImage;
        }

        // free buffers
        free(buffer2.data);
        buffer2.data = NULL;
        free(tempBuffer);
        tempBuffer = NULL;

        CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
        CGBitmapInfo bitmapInfoMasked = CGImageGetBitmapInfo(imageRef);
        CGBitmapInfo bitmapInfo = bitmapInfoMasked & kCGBitmapByteOrderMask;
        CGImageAlphaInfo alphaInfo = CGImageGetAlphaInfo(imageRef);
        if (alphaInfo == kCGImageAlphaNone || alphaInfo == kCGImageAlphaOnly) {
            alphaInfo = kCGImageAlphaNoneSkipFirst;
        } else if (alphaInfo == kCGImageAlphaFirst) {
            alphaInfo = kCGImageAlphaPremultipliedFirst;
        } else if (alphaInfo == kCGImageAlphaLast) {
            alphaInfo = kCGImageAlphaPremultipliedLast;
        }
        // "The constants for specifying the alpha channel information are declared with the `CGImageAlphaInfo` type but can be passed to this parameter safely." (source: docs)
        bitmapInfo |= alphaInfo;
        // create image context from buffer
        ctx = CGBitmapContextCreate(
            buffer1.data, buffer1.width, buffer1.height, 8, buffer1.rowBytes, colorSpace, bitmapInfo);
        CGColorSpaceRelease(colorSpace);
        // create image from context
        blurredImageRef = CGBitmapContextCreateImage(ctx);
        UIImage *outputImage = [UIImage imageWithCGImage:blurredImageRef scale:imageScale orientation:imageOrientation];
        CGImageRelease(blurredImageRef);
        blurredImageRef = NULL;
        CGContextRelease(ctx);
        ctx = NULL;
        free(buffer1.data);
        buffer1.data = NULL;
        return outputImage;
    } @catch (NSException *exception) {
        if (buffer1.data) {
            free(buffer1.data);
        }
        if (buffer2.data) {
            free(buffer2.data);
        }
        if (tempBuffer) {
            free(tempBuffer);
        }
        if (dataSource) {
            CFRelease(dataSource);
        }
        if (blurredImageRef) {
            CGImageRelease(blurredImageRef);
        }
        if (ctx) {
            CGContextRelease(ctx);
        }
        if (error) {
            NSDictionary *useInfo = @{NSLocalizedDescriptionKey: exception.reason ?: @""};
            *error = [NSError errorWithDomain:HippyImageErrorDomain code:ImageDataBlurredError userInfo:useInfo];
        }
        return inputImage;
    }
}

NSError *imageErrorFromParams(NSInteger errorCode, NSString *errorDescription) {
    return [NSError errorWithDomain:HippyImageErrorDomain code:errorCode userInfo:@ { NSLocalizedDescriptionKey: errorDescription ?: @"" }];
}

@interface HippyImageView () {
    __weak CALayer *_borderWidthLayer;
    BOOL _needsUpdateBorderRadiusManully;
    BOOL _needsReloadImage;
    BOOL _needsUpdateImage;
    id<HippyImageProviderProtocol> _imageProvider;
}

@property (nonatomic) HippyAnimatedImageOperation *animatedImageOperation;
@property (atomic, strong) NSString *pendingImageSourceUri;  // The image source that's being loaded from the network
@property (atomic, strong) NSString *imageSourceUri;         // The image source that's currently displayed

@end

@implementation HippyImageView

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        self.clipsToBounds = YES;
        _needsUpdateBorderRadiusManully = NO;
        _borderTopLeftRadius = CGFLOAT_MAX;
        _borderTopRightRadius = CGFLOAT_MAX;
        _borderBottomLeftRadius = CGFLOAT_MAX;
        _borderBottomRightRadius = CGFLOAT_MAX;
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(didReceiveMemoryWarning) name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
    }
    return self;
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)setTintColor:(UIColor *)tintColor{
    [super setTintColor:tintColor];
    if(_animatedImageOperation){
        _needsReloadImage = YES;
    }else{
        _needsUpdateImage = YES;
    }
}

- (void)didMoveToWindow {
    [super didMoveToWindow];
    if (!self.window) {
    } else if ([self shouldChangeImageSource]) {
        [self reloadImage];
    }
}

- (void)didMoveToSuperview {
    [super didMoveToSuperview];
    if (self.superview) {
        [self viewDidMountEvent];
    }
    else {
        [self viewDidUnmoundEvent];
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

- (void)clearImageIfDetached {
    if (!self.window) {
        [self clearImage];
    }
}

- (void)setSource:(NSArray *)source {
    if (![_source isEqualToArray:source]) {
        _source = [source copy];
        _needsReloadImage = YES;
    }
}

- (void)setDefaultImage:(UIImage *)defaultImage {
    if (_defaultImage != defaultImage) {
        BOOL shouldUpdateImage = (self.image == _defaultImage);
        _defaultImage = defaultImage;
        if (shouldUpdateImage) {
            [self updateImage:_defaultImage];
        }
    }
}

- (void)setCapInsets:(UIEdgeInsets)capInsets {
    if (!UIEdgeInsetsEqualToEdgeInsets(_capInsets, capInsets)) {
        if (UIEdgeInsetsEqualToEdgeInsets(_capInsets, UIEdgeInsetsZero) || UIEdgeInsetsEqualToEdgeInsets(capInsets, UIEdgeInsetsZero)) {
            _capInsets = capInsets;
            _needsReloadImage = YES;
        } else {
            _capInsets = capInsets;
            _needsUpdateImage = YES;
        }
    }
}

- (void)setBlurRadius:(CGFloat)blurRadius {
    if (blurRadius != _blurRadius) {
        _blurRadius = blurRadius;
        _needsReloadImage = YES;
    }
}

- (void)setFrame:(CGRect)frame {
    CGSize originSize = self.frame.size;
    [super setFrame:frame];
    BOOL currentImageIsDefaultImage = self.image == _defaultImage && nil != self.image;
    if (CGSizeEqualToSize(CGSizeZero, originSize) || !currentImageIsDefaultImage) {
        [self reloadImage];
    }
    [self updateCornerRadius];
}

- (void)setShape:(HippyShapeMode)shape {
    if (shape != _shape) {
        _shape = shape;
        if (shape == HippyResizeModeCircle) {
            self.contentMode = UIViewContentModeScaleAspectFit;
        }
    }
}

- (void)setResizeMode:(HippyResizeMode)resizeMode {
    if (_resizeMode != resizeMode) {
        _resizeMode = resizeMode;
        if (_resizeMode == HippyResizeModeRepeat) {
            self.contentMode = UIViewContentModeScaleToFill;
        } else {
            self.contentMode = (UIViewContentMode)resizeMode;
        }
        if (self.image) {
            _needsUpdateImage = YES;
        }
    }
}

- (void)setRenderingMode:(UIImageRenderingMode)renderingMode {
    if (_renderingMode != renderingMode) {
        _renderingMode = renderingMode;
        _needsUpdateImage = YES;
    }
}

- (void)setImageProvider:(id<HippyImageProviderProtocol>)imageProvider {
    if (_imageProvider != imageProvider) {
        _imageProvider = imageProvider;
    }
}

- (void)didSetProps:(NSArray<NSString *> *)changedProps {
    if (_needsReloadImage) {
        self.animatedImage = nil;
        [self updateImage:nil];
        [self reloadImage];
    }
    else if (_needsUpdateImage) {
        [self updateImage:self.image];
    }
    _needsReloadImage = NO;
    _needsUpdateImage = NO;
}

- (BOOL)shouldChangeImageSource {
    // We need to reload if the desired image source is different from the current image
    // source AND the image load that's pending
    NSDictionary *source = [self.source firstObject];
    if (source) {
        NSString *desiredImageSource = source[@"uri"];

        return ![desiredImageSource isEqualToString:self.imageSourceUri] && ![desiredImageSource isEqualToString:self.pendingImageSourceUri];
    }
    return NO;
}

- (void)reloadImage {
    if (_imageProvider) {
        NSString *imagePath = _imageProvider.imageDataPath;
        BOOL isAnimatedImage = [_imageProvider imageCount] > 1;
        if (isAnimatedImage) {
            if (_animatedImageOperation) {
                [_animatedImageOperation cancel];
            }
            _animatedImageOperation =
                [[HippyAnimatedImageOperation alloc] initWithAnimatedImageProvider:_imageProvider
                                                                         imageView:self
                                                                          imageURL:imagePath];
            [animated_image_queue() addOperation:_animatedImageOperation];
        }else {
            UIImage *image = [_imageProvider image];
            if (image) {
                [self loadImage:image url:imagePath error:nil needBlur:YES];
            } else {
                NSString *errorMessage = [NSString stringWithFormat:@"image data unavailable for uri %@", _imageProvider.imageDataPath];
                NSError *theError = imageErrorFromParams(ImageDataUnavailable, errorMessage);
                [self loadImage:nil url:imagePath error:theError needBlur:YES];
            }
        }
    }
}

- (void)clearImage {
    [self.layer removeAnimationForKey:@"contents"];
    self.image = nil;
    self.imageSourceUri = nil;
}

#pragma mark -

- (void)loadImage:(UIImage *)image url:(NSString *)url error:(NSError *)error needBlur:(BOOL)needBlur {
    if (error) {
        if (_onError && error.code != NSURLErrorCancelled) {
            _onError(@{ @"error": error.localizedDescription, @"errorCode": @(error.code), @"errorURL": url });
        }
        if (_onLoadEnd) {
            _onLoadEnd(@{ @"success": @0 });
        }
        return;
    }
    NSString *currentImageURLString = _imageProvider.imageDataPath;
    BOOL shouldContinue = url && currentImageURLString && [url isEqualToString:currentImageURLString];
    if (!shouldContinue) {
        return;
    }
    __weak __typeof(self) weakSelf = self;
    void (^setImageBlock)(UIImage *) = ^(UIImage *image) {
        HippyImageView *strongSelf = weakSelf;
        if (!strongSelf) {
            return;
        }
        strongSelf.pendingImageSourceUri = nil;
        strongSelf.imageSourceUri = url;
        [strongSelf.layer removeAnimationForKey:@"contents"];
        [strongSelf updateImage:image];
        if (strongSelf.onLoad)
            strongSelf.onLoad(@{ @"width": @(image.size.width), @"height": @(image.size.height), @"url": url ?: @"" });
        if (strongSelf.onLoadEnd)
            strongSelf.onLoadEnd(@{ @"success": @1, @"width": @(image.size.width), @"height": @(image.size.height) });
    };

    if (_blurRadius > 100 && [NSProcessInfo processInfo].physicalMemory <= 1024 * 1024 * 1000) {
        _blurRadius = 100;
    }

    CGFloat br = _blurRadius;
    if (_blurRadius > __FLT_EPSILON__ && needBlur) {
        // Blur on a background thread to avoid blocking interaction
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            NSError *error = nil;
            UIImage *blurredImage = HippyBlurredImageWithRadiusv(image, br, &error);
            if (error) {
                NSError *finalError = HippyErrorFromErrorAndModuleName(error, @"unknown");
                HippyFatal(finalError);
            }
            HippyExecuteOnMainQueue(^{
                setImageBlock(blurredImage);
            });
        });
    } else {
        HippyExecuteOnMainQueue(^{
            setImageBlock(image);
        });
    }
}

- (void)updateImage:(UIImage *)image {
    image = image ?: _defaultImage;
    if (!image) {
        self.image = nil;
        self.imageSourceUri = nil;
        return;
    }

    if (_renderingMode != image.renderingMode) {
        image = [image imageWithRenderingMode:_renderingMode];
    }

    if (HippyResizeModeRepeat == _resizeMode) {
        image = [image resizableImageWithCapInsets:_capInsets resizingMode:UIImageResizingModeTile];
    }
    else if (HippyResizeModeCenter == _resizeMode) {
        if (HippyImageNeedsShrinkForSize(image, self.bounds.size)) {
            self.contentMode = UIViewContentModeScaleAspectFit;
        }
    }
    else if (!UIEdgeInsetsEqualToEdgeInsets(UIEdgeInsetsZero, _capInsets)) {
        // Applying capInsets of 0 will switch the "resizingMode" of the image to "tile" which is undesired
        image = [image resizableImageWithCapInsets:_capInsets resizingMode:UIImageResizingModeStretch];
    }
    
    if (_shape == HippyResizeModeCircle) {
        image = [self circleImage:image];
    }

    // Apply trilinear filtering to smooth out mis-sized images
    //    self.layer.minificationFilter = kCAFilterTrilinear;
    //    self.layer.magnificationFilter = kCAFilterTrilinear;

    if (image.images) {
        NSAssert(NO, @"GIF should not invoke this");
    } else {
        self.image = image;
    }
}

/// 生成一个圆形图
/// @param oldImage UIImage
- (UIImage *)circleImage:(UIImage *)oldImage {
    CGSize oldImageSize = CGSizeMake(oldImage.size.width * 3, oldImage.size.height * 3);
    CGFloat minLength = MIN(oldImageSize.width, oldImageSize.height);
    CGFloat centerX = minLength * 0.5;
    CGFloat centerY = minLength * 0.5;
    UIGraphicsBeginImageContextWithOptions(CGSizeMake(minLength, minLength), NO, 0.0);
    CGContextRef ctx = UIGraphicsGetCurrentContext();
    // 画小圆
    CGFloat smallRadius = minLength * 0.5;
    CGContextAddArc(ctx, centerX, centerY, smallRadius, 0, M_PI * 2, 0);
    CGContextClip(ctx);
    CGFloat imageX = centerX - oldImageSize.width * 0.5;
    CGFloat imageY = centerY - oldImageSize.height * 0.5;
    [oldImage drawInRect:CGRectMake(imageX, imageY, oldImageSize.width, oldImageSize.height)];
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return newImage;
}

- (void)updateCornerRadius {
    if (_borderWidthLayer) {
        [_borderWidthLayer removeFromSuperlayer];
    }
    if ([self needsUpdateCornerRadiusManully] && ![self isAllCornerRadiussEqualToCornerRadius]) {
        CGRect contentRect = self.bounds;
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

        BorderRadiusStruct boderRadiusStruct = [self properBorderRadius];
        UIBezierPath *bezierPath = [self bezierPathFromBorderRadius:boderRadiusStruct contentRect:contentRect];
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
    } else {
        //radius must be smaller than MIN(self.frame.size.width, self.frame.size.height) / 2.0
        CGFloat minOfRadius = MIN(self.frame.size.width, self.frame.size.height) / 2.0f;
        double radius = HippyZeroIfNaN(MIN(minOfRadius, _borderRadius));
        self.layer.mask = nil;
        self.layer.cornerRadius = radius;
    }
}

- (UIBezierPath *)bezierPathFromBorderRadius:(BorderRadiusStruct)boderRadiusStruct contentRect:(CGRect)contentRect {
    CGFloat minX = CGRectGetMinX(contentRect);
    CGFloat minY = CGRectGetMinY(contentRect);
    CGFloat maxX = CGRectGetMaxX(contentRect);
    CGFloat maxY = CGRectGetMaxY(contentRect);

    UIBezierPath *bezierPath = [UIBezierPath bezierPath];
    CGPoint p1 = CGPointMake(minX + boderRadiusStruct.topLeftRadius, minY);
    [bezierPath moveToPoint:p1];
    CGPoint p2 = CGPointMake(maxX - boderRadiusStruct.topRightRadius, minY);
    [bezierPath addLineToPoint:p2];
    CGPoint p3 = CGPointMake(maxX - boderRadiusStruct.topRightRadius, minY + boderRadiusStruct.topRightRadius);
    [bezierPath addArcWithCenter:p3 radius:boderRadiusStruct.topRightRadius startAngle:M_PI_2 + M_PI endAngle:0 clockwise:YES];

    CGPoint p4 = CGPointMake(maxX, maxY - boderRadiusStruct.bottomRightRadius);
    [bezierPath addLineToPoint:p4];
    CGPoint p5 = CGPointMake(maxX - boderRadiusStruct.bottomRightRadius, maxY - boderRadiusStruct.bottomRightRadius);
    [bezierPath addArcWithCenter:p5 radius:boderRadiusStruct.bottomRightRadius startAngle:0 endAngle:M_PI_2 clockwise:YES];

    CGPoint p6 = CGPointMake(minX + boderRadiusStruct.bottomLeftRadius, maxY);
    [bezierPath addLineToPoint:p6];
    CGPoint p7 = CGPointMake(minX + boderRadiusStruct.bottomLeftRadius, maxY - boderRadiusStruct.bottomLeftRadius);
    [bezierPath addArcWithCenter:p7 radius:boderRadiusStruct.bottomLeftRadius startAngle:M_PI_2 endAngle:M_PI clockwise:YES];

    CGPoint p8 = CGPointMake(minX, minY + boderRadiusStruct.topLeftRadius);
    [bezierPath addLineToPoint:p8];
    CGPoint p9 = CGPointMake(minX + boderRadiusStruct.topLeftRadius, minY + boderRadiusStruct.topLeftRadius);
    [bezierPath addArcWithCenter:p9 radius:boderRadiusStruct.topLeftRadius startAngle:M_PI endAngle:M_PI + M_PI_2 clockwise:YES];
    [bezierPath closePath];
    return bezierPath;
}

- (void)setBorderTopLeftRadius:(CGFloat)borderTopLeftRadius {
    _borderTopLeftRadius = borderTopLeftRadius;
    _needsUpdateBorderRadiusManully = YES;
}

- (void)setBorderTopRightRadius:(CGFloat)borderTopRightRadius {
    _borderTopRightRadius = borderTopRightRadius;
    _needsUpdateBorderRadiusManully = YES;
}

- (void)setBorderBottomLeftRadius:(CGFloat)borderBottomLeftRadius {
    _borderBottomLeftRadius = borderBottomLeftRadius;
    _needsUpdateBorderRadiusManully = YES;
}

- (void)setBorderBottomRightRadius:(CGFloat)borderBottomRightRadius {
    _borderBottomRightRadius = borderBottomRightRadius;
    _needsUpdateBorderRadiusManully = YES;
}

- (void)setBorderRadius:(CGFloat)borderRadius {
    _borderRadius = borderRadius;
}

- (void)setBackgroundSize:(NSString *)backgroundSize {
    //do nothing
}

- (BOOL)needsUpdateCornerRadiusManully {
    return _needsUpdateBorderRadiusManully;
}

- (BOOL)isAllCornerRadiussEqualToCornerRadius {
#define CornerRadiusCompare(x) (x != CGFLOAT_MAX && fabs(_borderRadius - x) > CGFLOAT_EPSILON)
    if (_needsUpdateBorderRadiusManully) {
        if (CornerRadiusCompare(_borderTopLeftRadius) ||
            CornerRadiusCompare(_borderTopRightRadius) ||
            CornerRadiusCompare(_borderBottomLeftRadius) ||
            CornerRadiusCompare(_borderBottomRightRadius)) {
            return NO;
        }
    }
    return YES;
}

- (BorderRadiusStruct)properBorderRadius {
    BorderRadiusStruct radius = { 0, 0, 0, 0 };
    CGFloat halfWidth = CGRectGetWidth(self.bounds) / 2.f;
    CGFloat halfHeight = CGRectGetHeight(self.bounds) / 2.f;
    CGFloat halfSide = MIN(halfWidth, halfHeight);
    CGFloat topLeftRadius = _borderTopLeftRadius != CGFLOAT_MAX ? _borderTopLeftRadius : _borderRadius;
    CGFloat topRightRadius = _borderTopRightRadius != CGFLOAT_MAX ? _borderTopRightRadius : _borderRadius;
    CGFloat bottomLeftRadius = _borderBottomLeftRadius != CGFLOAT_MAX ? _borderBottomLeftRadius : _borderRadius;
    CGFloat bottomRightRadius = _borderBottomRightRadius != CGFLOAT_MAX ? _borderBottomRightRadius : _borderRadius;
    radius.topLeftRadius = MIN(topLeftRadius, halfSide);
    radius.topRightRadius = MIN(topRightRadius, halfSide);
    radius.bottomLeftRadius = MIN(bottomLeftRadius, halfSide);
    radius.bottomRightRadius = MIN(bottomRightRadius, halfSide);
    return radius;
}

@end

@implementation HippyConvert (HippyResizeMode)

HIPPY_ENUM_CONVERTER(HippyResizeMode, (@{
    @"cover": @(HippyResizeModeCover),
    @"contain": @(HippyResizeModeContain),
    @"stretch": @(HippyResizeModeStretch),
    @"center": @(HippyResizeModeCenter),
    @"repeat": @(HippyResizeModeRepeat),
}),
    HippyResizeModeStretch, integerValue)

HIPPY_ENUM_CONVERTER(HippyShapeMode, (@{
    @"normal": @(HippyResizeModeDefalt),
    @"circle": @(HippyResizeModeCircle)
}), HippyResizeModeDefalt, integerValue)

@end

@implementation HippyAnimatedImageOperation

- (id)initWithAnimatedImageProvider:(id<HippyImageProviderProtocol>)imageProvider imageView:(HippyImageView *)imageView imageURL:(NSString *)url {
    self = [super init];
    if (self) {
        _imageProvider = imageProvider;
        _url = url;
        _imageView = imageView;
    }
    return self;
}

- (id)initWithAnimatedImageData:(NSData *)data imageView:(HippyImageView *)imageView imageURL:(NSString *)url {
    self = [super init];
    if (self) {
        _animatedImageData = data;
        _url = url;
        _imageView = imageView;
    }
    return self;
}

- (void)main {
    if (![self isCancelled] && (_animatedImageData || _imageProvider) && _imageView) {
        HippyAnimatedImage *animatedImage = nil;
        if (_imageProvider) {
            animatedImage = [HippyAnimatedImage animatedImageWithAnimatedImageProvider:_imageProvider];
        } else if (_animatedImageData) {
            animatedImage = [HippyAnimatedImage animatedImageWithGIFData:_animatedImageData];
        }
        if (![self isCancelled] && _imageView) {
            __weak HippyImageView *wIV = _imageView;
            __weak NSString *wURL = _url;
            dispatch_async(dispatch_get_main_queue(), ^{
                HippyImageView *sIV = wIV;
                NSString *sURL = wURL;
                if (sIV && sURL) {
                    [sIV loadImage:animatedImage.posterImage url:sURL error:nil needBlur:YES];
                    sIV.animatedImage = animatedImage;
                }
            });
        }
    }
}

@end
