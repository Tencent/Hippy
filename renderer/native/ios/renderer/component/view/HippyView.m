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

#import "HippyConvert.h"
#import "HippyUtils.h"
#import "HippyBorderDrawing.h"
#import "HippyGradientObject.h"
#import "HippyView.h"
#import "UIView+DomEvent.h"
#import "UIView+Hippy.h"
#import "HippyRenderUtils.h"
#import "UIBezierPath+HippyShadow.h"

static CGSize makeSizeConstrainWithType(CGSize originSize, CGSize constrainSize, NSString *resizeMode) {
    // width / height
    const CGFloat deviceHeight = originSize.width / originSize.height;
    if (resizeMode && NSOrderedSame == [resizeMode compare:@"contain" options:NSCaseInsensitiveSearch]) {
        CGSize result = originSize;
        result.width = constrainSize.width;
        result.height = result.width / deviceHeight;
        if (result.height > constrainSize.height) {
            result.height = constrainSize.height;
            result.width = result.height * deviceHeight;
        }
        return result;
    } else if (resizeMode && NSOrderedSame == [resizeMode compare:@"cover" options:NSCaseInsensitiveSearch]) {
        CGSize result = originSize;
        result.width = constrainSize.width;
        result.height = result.width / deviceHeight;
        if (result.height < constrainSize.height) {
            result.height = constrainSize.height;
            result.width = result.height * deviceHeight;
        }
        return result;
    }
    return originSize;
}

static NSString *NativeRenderRecursiveAccessibilityLabel(UIView *view) {
    NSMutableString *str = [NSMutableString stringWithString:@""];
    for (UIView *subview in view.subviews) {
        NSString *label = subview.accessibilityLabel;
        if (label) {
            [str appendString:@" "];
            [str appendString:label];
        } else {
            [str appendString:NativeRenderRecursiveAccessibilityLabel(subview)];
        }
    }
    return str;
}

@implementation HippyView {
    UIColor *_backgroundColor;
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 260000
    // iOS 26+ Liquid Glass EffectView
    UIVisualEffectView *_effectView;
#endif
}

@synthesize hippyZIndex = _hippyZIndex;

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        _borderWidth = -1;
        _borderTopWidth = -1;
        _borderRightWidth = -1;
        _borderBottomWidth = -1;
        _borderLeftWidth = -1;
        _borderTopLeftRadius = -1;
        _borderTopRightRadius = -1;
        _borderBottomLeftRadius = -1;
        _borderBottomRightRadius = -1;
        _backgroundColor = super.backgroundColor;
        self.layer.shadowOffset = CGSizeZero;
        self.layer.shadowRadius = 0.f;
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 260000
        _glassEffectInteractive = YES;
#endif
    }
    return self;
}

- (NSString *)accessibilityLabel {
    if (super.accessibilityLabel) {
        return super.accessibilityLabel;
    }
    return NativeRenderRecursiveAccessibilityLabel(self);
}

- (NSString *)description {
    NSString *superDescription = super.description;
    NSRange semicolonRange = [superDescription rangeOfString:@";"];
    NSString *replacement = [NSString stringWithFormat:@"; hippyTag: %@;", self.hippyTag];
    return [superDescription stringByReplacingCharactersInRange:semicolonRange withString:replacement];
}

#pragma mark - Hippy Lifecycle override

- (void)didUpdateHippySubviews {
    [super didUpdateHippySubviews];
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 260000
    if (@available(iOS 26.0, *)) {
        [self moveSubviewsToEffectView];
    }
#endif
}

#pragma mark - Borders

- (UIColor *)backgroundColor {
    return _backgroundColor;
}

- (void)setBackgroundColor:(UIColor *)backgroundColor {
    if ([_backgroundColor isEqual:backgroundColor]) {
        return;
    }

    _backgroundColor = backgroundColor;
    [self.layer setNeedsDisplay];
}

- (void)setBackgroundImage:(UIImage *)backgroundImage {
    if (_backgroundImage != backgroundImage) {
        _backgroundImage = backgroundImage;
        [self.layer setNeedsDisplay];
    }
}

- (UIEdgeInsets)bordersAsInsets {
    const CGFloat borderWidth = MAX(0, _borderWidth);

    return (UIEdgeInsets) {
        _borderTopWidth >= 0 ? _borderTopWidth : borderWidth,
        _borderLeftWidth >= 0 ? _borderLeftWidth : borderWidth,
        _borderBottomWidth >= 0 ? _borderBottomWidth : borderWidth,
        _borderRightWidth >= 0 ? _borderRightWidth : borderWidth,
    };
}

- (HippyCornerRadii)cornerRadii {
    // Get corner radii
    const CGFloat radius = MAX(0, _borderRadius);
    const CGFloat topLeftRadius = _borderTopLeftRadius >= 0 ? _borderTopLeftRadius : radius;
    const CGFloat topRightRadius = _borderTopRightRadius >= 0 ? _borderTopRightRadius : radius;
    const CGFloat bottomLeftRadius = _borderBottomLeftRadius >= 0 ? _borderBottomLeftRadius : radius;
    const CGFloat bottomRightRadius = _borderBottomRightRadius >= 0 ? _borderBottomRightRadius : radius;

    // Get scale factors required to prevent radii from overlapping
    const CGSize size = self.bounds.size;
    const CGFloat topScaleFactor = HippyZeroIfNaN(MIN(1, size.width / (topLeftRadius + topRightRadius)));
    const CGFloat bottomScaleFactor = HippyZeroIfNaN(MIN(1, size.width / (bottomLeftRadius + bottomRightRadius)));
    const CGFloat rightScaleFactor = HippyZeroIfNaN(MIN(1, size.height / (topRightRadius + bottomRightRadius)));
    const CGFloat leftScaleFactor = HippyZeroIfNaN(MIN(1, size.height / (topLeftRadius + bottomLeftRadius)));

    // Return scaled radii
    return (HippyCornerRadii) {
        topLeftRadius * MIN(topScaleFactor, leftScaleFactor),
        topRightRadius * MIN(topScaleFactor, rightScaleFactor),
        bottomLeftRadius * MIN(bottomScaleFactor, leftScaleFactor),
        bottomRightRadius * MIN(bottomScaleFactor, rightScaleFactor),
    };
}

- (void)hippySetFrame:(CGRect)frame {
    // If frame is zero, or below the threshold where the border radii can
    // be rendered as a stretchable image, we'll need to re-render.
    // TODO: detect up-front if re-rendering is necessary
    CGSize oldSize = self.bounds.size;
    [super hippySetFrame:frame];
    if (!HippyCGSizeNearlyEqual(self.bounds.size, oldSize)) {
        [self.layer setNeedsDisplay];
    }
}

- (void)setFrame:(CGRect)frame {
    [super setFrame:frame];
    
    // Update effect view frame if it exists
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 260000
    if (_effectView) {
        _effectView.frame = self.bounds;
    }
#endif
}

- (void)layoutSubviews {
    [super layoutSubviews];
    
    // Update effect view frame and corner radius
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 260000
    if (_effectView) {
        _effectView.frame = self.bounds;
        _effectView.layer.cornerRadius = self.layer.cornerRadius;
    }
#endif
}

- (HippyBorderColors)borderColors {
    return (HippyBorderColors) {
        _borderTopColor ?: _borderColor,
        _borderLeftColor ?: _borderColor,
        _borderBottomColor ?: _borderColor,
        _borderRightColor ?: _borderColor,
    };
}

- (void)drawShadowForLayer:(HippyCornerRadii)cornerRadii {
    self.layer.shadowPath = nil;
    if (0 != self.shadowSpread && !self.isUseNewShadow) {
        CGRect rect = CGRectInset(self.layer.bounds, -self.shadowSpread, -self.shadowSpread);
        UIBezierPath *path = [UIBezierPath bezierPathWithRect:rect];
        self.layer.shadowPath = path.CGPath;
    } else if (self.isUseNewShadow) {
        [self drawShaow:self.isShadowInset radii:cornerRadii];
    }
}

- (void)drawShaow:(BOOL)isInset radii:(HippyCornerRadii)cornerRadii {
    CGFloat topLeft = cornerRadii.topLeft;
    CGFloat topRight = cornerRadii.topRight;
    CGFloat bottomLeft = cornerRadii.bottomLeft;
    CGFloat bottomRight = cornerRadii.bottomRight;
    if (isInset) {
        self.layer.masksToBounds = YES;
        self.innerShadowLayer.frame = self.bounds;
        if (self.layer.shadowRadius > 0)
        {
            self.innerShadowLayer.mShadowBlur = self.layer.shadowRadius;
        }
        if (self.layer.shadowColor)
        {
            self.innerShadowLayer.mShadowColor = [UIColor colorWithCGColor:self.layer.shadowColor];
        }
        self.innerShadowLayer.mShadowSpread = self.shadowSpread;
        self.innerShadowLayer.mShadowOffsetX = self.layer.shadowOffset.width;
        self.innerShadowLayer.mShadowOffsetY = self.layer.shadowOffset.height;
        CGFloat viewWidth = self.frame.size.width;
        CGFloat viewHeight = self.frame.size.height;

        UIBezierPath *outerBorderPath = [UIBezierPath shadow_bezierPathWithRoundedRect:self.bounds topLeft:topLeft topRight:topRight bottomLeft:bottomLeft bottomRight:bottomRight];
        self.innerShadowLayer.outerBorderPath = outerBorderPath;

        CGPoint topRightEndPoint = CGPointMake(viewWidth - MAX(topRight, _borderRightWidth), MAX(topRight, _borderTopWidth));
        CGPoint topLeftEndPoint = CGPointMake(MAX(topLeft, _borderLeftWidth), MAX(topLeft, _borderTopWidth));
        CGPoint bottomRightEndPoint = CGPointMake(viewWidth - MAX(bottomRight, _borderRightWidth), viewHeight -  MAX(bottomRight, _borderBottomWidth));
        CGPoint bottomLeftEndPoint = CGPointMake(MAX(bottomLeft, _borderLeftWidth), viewHeight - MAX(bottomLeft, _borderBottomWidth));

        self.innerShadowLayer.mInnerTopStart = CGPointMake(topLeftEndPoint.x, _borderTopWidth);
        self.innerShadowLayer.mInnerTopEnd = CGPointMake(topRightEndPoint.x, _borderTopWidth);
        self.innerShadowLayer.mInnerRightStart = CGPointMake(viewWidth - _borderRightWidth, topRightEndPoint.y);
        self.innerShadowLayer.mInnerRightEnd = CGPointMake(viewWidth - _borderRightWidth, bottomRightEndPoint.y);
        self.innerShadowLayer.mInnerBottomStart = CGPointMake(bottomLeftEndPoint.x, viewHeight - _borderBottomWidth);
        self.innerShadowLayer.mInnerBottomEnd = CGPointMake(bottomRightEndPoint.x, viewHeight - _borderBottomWidth);
        self.innerShadowLayer.mInnerLeftStart = CGPointMake(_borderLeftWidth, topLeftEndPoint.y);
        self.innerShadowLayer.mInnerLeftEnd = CGPointMake(_borderLeftWidth, bottomLeftEndPoint.y);

        [self.innerShadowLayer setNeedsDisplay];
    } else {
        if (_innerShadowLayer) {
            [_innerShadowLayer removeFromSuperlayer];
            _innerShadowLayer = nil;
        }
        CGRect shadowRect = CGRectMake(self.bounds.origin.x - self.shadowSpread, self.bounds.origin.y - self.shadowSpread, self.bounds.size.width + 2 * self.shadowSpread, self.bounds.size.height + 2 * self.shadowSpread);
        UIBezierPath *shadownPath = [UIBezierPath shadow_bezierPathWithRoundedRect:shadowRect topLeft:topLeft topRight:topRight bottomLeft:bottomLeft bottomRight:bottomRight];
        self.layer.shadowPath = shadownPath.CGPath;
        self.layer.masksToBounds = NO;
    }
}

- (HippyViewInnerLayer *)innerShadowLayer {
    if (!_innerShadowLayer) {
        _innerShadowLayer = [[HippyViewInnerLayer alloc] init];
        _innerShadowLayer.frame = self.bounds;
        _innerShadowLayer.boxShadowOpacity = 1;
        [self.layer addSublayer:_innerShadowLayer];
    }
    return _innerShadowLayer;
}

- (CALayerContentsFilter)minificationFilter {
    return kCAFilterLinear;
}

- (CALayerContentsFilter)magnificationFilter {
    return kCAFilterNearest;
}

- (void)displayLayer:(CALayer *)layer {
    if (HippyCGSizeNearlyEqual(layer.bounds.size, CGSizeZero)) {
        return;
    }

    const HippyCornerRadii cornerRadii = [self cornerRadii];
    [self drawShadowForLayer:cornerRadii];

    const UIEdgeInsets borderInsets = [self bordersAsInsets];
    const HippyBorderColors borderColors = [self borderColors];
    UIColor *backgroundColor = self.backgroundColor;

    BOOL isRunningInTest = HippyRunningInTestEnvironment();
    BOOL isCornerEqual = HippyCornerRadiiAreEqual(cornerRadii);
    BOOL isBorderInsetsEqual = HippyBorderInsetsAreEqual(borderInsets);
    BOOL isBorderColorsEqual = HippyBorderColorsAreEqual(borderColors);
    BOOL borderStyle = (_borderStyle == HippyBorderStyleSolid || _borderStyle == HippyBorderStyleNone);
    // iOS draws borders in front of the content whereas CSS draws them behind
    // the content. For this reason, only use iOS border drawing when clipping
    // or when the border is hidden.
    BOOL borderColorCheck = (borderInsets.top == 0 || (borderColors.top && CGColorGetAlpha(borderColors.top.CGColor) == 0) || self.clipsToBounds);

    BOOL useIOSBorderRendering = !isRunningInTest && isCornerEqual && isBorderInsetsEqual && isBorderColorsEqual && borderStyle && borderColorCheck;

    // iOS clips to the outside of the border, but CSS clips to the inside. To
    // solve this, we'll need to add a container view inside the main view to
    // correctly clip the subviews.

    if (useIOSBorderRendering && !self.backgroundImage && !self.gradientObject) {
        layer.cornerRadius = cornerRadii.topLeft;
        layer.borderColor = borderColors.left.CGColor;
        layer.borderWidth = borderInsets.left;
        layer.backgroundColor = backgroundColor.CGColor;
        layer.contents = nil;
        layer.needsDisplayOnBoundsChange = NO;
        layer.mask = nil;
        
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 260000
        if (_effectView) {
            _effectView.layer.cornerRadius = cornerRadii.topLeft;
        }
#endif
        
        return;
    }

    __weak __typeof(self) weakSelf = self;
    [self getLayerContentForColor:nil completionBlock:^(UIImage *contentImage) {
        if (nil == contentImage) {
            return;
        }
        dispatch_async(dispatch_get_main_queue(), ^{
            __strong __typeof(weakSelf) strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            CALayer *strongLayer = strongSelf.layer;
            CGRect contentsCenter = ({
                CGSize size = contentImage.size;
                UIEdgeInsets insets = contentImage.capInsets;
                CGRectMake(insets.left / size.width, insets.top / size.height, 1.0 / size.width, 1.0 / size.height);
            });
            BOOL needsDisplay = [strongLayer needsDisplay];
            strongLayer.contents = (id)contentImage.CGImage;

            strongLayer.backgroundColor = NULL;

            //  weakLayer.contents = (id)image.CGImage;
            strongLayer.contentsScale = contentImage.scale;
            strongLayer.needsDisplayOnBoundsChange = YES;
            strongLayer.magnificationFilter = [strongSelf magnificationFilter];
            strongLayer.minificationFilter = [strongSelf minificationFilter];

            const BOOL isResizable = !UIEdgeInsetsEqualToEdgeInsets(contentImage.capInsets, UIEdgeInsetsZero);

            [strongSelf updateClippingForLayer:strongLayer];

            if (isResizable) {
                strongLayer.contentsCenter = contentsCenter;
            } else {
                strongLayer.contentsCenter = CGRectMake(0.0, 0.0, 1.0, 1.0);
            }
            if (needsDisplay) {
                [strongLayer setNeedsDisplay];
            }
        });
    }];
}

- (BOOL)getLayerContentForColor:(UIColor *)color completionBlock:(void (^)(UIImage *))contentBlock {
    const HippyCornerRadii cornerRadii = [self cornerRadii];
    const UIEdgeInsets borderInsets = [self bordersAsInsets];
    const HippyBorderColors borderColors = [self borderColors];
    UIColor *backgroundColor = color?:self.backgroundColor;

    // make sure frame is proportional to device pixel
    CGRect theFrame = CGRectMake(HippyRoundPixelValue(self.frame.origin.x),
                                 HippyRoundPixelValue(self.frame.origin.y),
                                 HippyRoundPixelValue(self.frame.size.width),
                                 HippyRoundPixelValue(self.frame.size.height));
    
    /**
     * If view has already applied a 3d transform,
     * to get its origin frame ,we have to revert 3d transform to its frame
     */
    if (!CATransform3DIsIdentity(self.layer.transform)) {
        CGAffineTransform t = CATransform3DGetAffineTransform(self.layer.transform);
        theFrame = CGRectApplyAffineTransform(theFrame, CGAffineTransformInvert(t));
    }
    NSInteger clipToBounds = self.clipsToBounds;
    NSString *backgroundSize = self.backgroundSize;
    UIImage *borderImage = HippyGetBorderImage(self.borderStyle, theFrame.size, cornerRadii, borderInsets,
                                               borderColors, backgroundColor, clipToBounds, !self.gradientObject);
    if (!self.backgroundImage && !self.gradientObject) {
        contentBlock(borderImage);
        return YES;
    } else if (self.backgroundImage) {
        UIImage *decodedImage = self.backgroundImage;
        CGFloat backgroundPositionX = self.backgroundPositionX;
        CGFloat backgroundPositionY = self.backgroundPositionY;
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            UIGraphicsImageRendererFormat *rendererFormat = [UIGraphicsImageRendererFormat preferredFormat];
            rendererFormat.scale = borderImage.scale;
            UIGraphicsImageRenderer *imageRenderer = [[UIGraphicsImageRenderer alloc] initWithSize:theFrame.size format:rendererFormat];
            UIImage *renderedImage = [imageRenderer imageWithActions:^(UIGraphicsImageRendererContext * _Nonnull rendererContext) {
                // draw background image
                CGSize imageSize = decodedImage.size;
                CGSize targetSize = UIEdgeInsetsInsetRect(theFrame, borderInsets).size;
                CGSize drawSize = makeSizeConstrainWithType(imageSize, targetSize, backgroundSize);
                CGPoint originOffset = CGPointMake((targetSize.width - drawSize.width) / 2.0, (targetSize.height - drawSize.height) / 2.0);
                [decodedImage drawInRect:CGRectMake(borderInsets.left + backgroundPositionX + originOffset.x,
                                                    borderInsets.top + backgroundPositionY + originOffset.y,
                                                    drawSize.width,
                                                    drawSize.height)];
                // draw border
                if (borderImage) {
                    CGSize size = theFrame.size;
                    [borderImage drawInRect:(CGRect) { CGPointZero, size }];
                }
            }];
            contentBlock(renderedImage);
        });
        return NO;
    } else if (self.gradientObject) {
        CGSize size = theFrame.size;
        if (0 >= size.width || 0 >= size.height) {
            contentBlock(nil);
            return YES;
        }
        HippyGradientObject *gradientObject = self.gradientObject;
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            CanvasInfo info = {size, {0,0,0,0}, {{0,0},{0,0},{0,0},{0,0}}};
            info.size = size;
            info.cornerRadii = cornerRadii;
            
            UIGraphicsImageRendererFormat *rendererFormat = [UIGraphicsImageRendererFormat preferredFormat];
            UIGraphicsImageRenderer *renderer = [[UIGraphicsImageRenderer alloc] initWithSize:size format:rendererFormat];
            UIImage *resultingImage = [renderer imageWithActions:^(UIGraphicsImageRendererContext * _Nonnull rendererContext) {
                CGContextRef context = rendererContext.CGContext;
                // Draw gradient
                [gradientObject drawInContext:context canvasInfo:info];
                // Draw border image
                [borderImage drawInRect:CGRectMake(0, 0, size.width, size.height)];
            }];
            contentBlock(resultingImage);
        });
        return NO;
    }
    return YES;
}

- (void)updateClippingForLayer:(CALayer *)layer {
    CALayer *mask = nil;
    CGFloat cornerRadius = 0;

    if (self.clipsToBounds) {
        const HippyCornerRadii cornerRadii = [self cornerRadii];
        if (HippyCornerRadiiAreEqual(cornerRadii)) {
            cornerRadius = cornerRadii.topLeft;

        } else {
            CAShapeLayer *shapeLayer = [CAShapeLayer layer];
            CGPathRef path = HippyPathCreateWithRoundedRect(self.bounds, HippyGetCornerInsets(cornerRadii, UIEdgeInsetsZero), NULL);
            shapeLayer.path = path;
            CGPathRelease(path);
            mask = shapeLayer;
        }
    }

    layer.cornerRadius = cornerRadius;
    layer.mask = mask;
}

#pragma mark Border Color

#define setBorderColor(side)                                                    \
    -(void)setBorder##side##Color : (UIColor *)color {                          \
        if (CGColorEqualToColor(_border##side##Color.CGColor, color.CGColor)) { \
            return;                                                             \
        }                                                                       \
        _border##side##Color = color;                                           \
        [self.layer setNeedsDisplay];                                           \
    }

setBorderColor()
setBorderColor(Top)
setBorderColor(Right)
setBorderColor(Bottom)
setBorderColor(Left)

#pragma mark - Border Width

#define setBorderWidth(side)                         \
    -(void)setBorder##side##Width : (CGFloat)width { \
        if (_border##side##Width == width) {         \
            return;                                  \
        }                                            \
        _border##side##Width = width;                \
        [self.layer setNeedsDisplay];                \
    }

setBorderWidth()
setBorderWidth(Top)
setBorderWidth(Right)
setBorderWidth(Bottom)
setBorderWidth(Left)

#pragma mark - Border Radius

#define setBorderRadius(side)                          \
    -(void)setBorder##side##Radius : (CGFloat)radius { \
        if (_border##side##Radius == radius) {         \
            return;                                    \
        }                                              \
        _border##side##Radius = radius;                \
        [self.layer setNeedsDisplay];                  \
    }

setBorderRadius()
setBorderRadius(TopLeft)
setBorderRadius(TopRight)
setBorderRadius(BottomLeft)
setBorderRadius(BottomRight)

#pragma mark - Border Style

#define setBorderStyle(side)                                  \
    -(void)setBorder##side##Style : (HippyBorderStyle)style { \
        if (_border##side##Style == style) {                  \
            return;                                           \
        }                                                     \
        _border##side##Style = style;                         \
        [self.layer setNeedsDisplay];                         \
    }

setBorderStyle()


#pragma mark - Liquid Glass Effect

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 260000

- (void)setGlassEffectEnabled:(BOOL)glassEffectEnabled {
    if (_glassEffectEnabled == glassEffectEnabled) {
        return;
    }
    _glassEffectEnabled = glassEffectEnabled;
    
    if (@available(iOS 26.0, *)) {
        if (glassEffectEnabled) {
            [self setupGlassEffect];
        } else {
            [self removeGlassEffect];
        }
    }
}

- (void)setGlassEffectTintColor:(UIColor *)glassEffectTintColor {
    if ([_glassEffectTintColor isEqual:glassEffectTintColor]) {
        return;
    }
    _glassEffectTintColor = glassEffectTintColor;
    
    if (@available(iOS 26.0, *)) {
        if (_glassEffectEnabled && _effectView) {
            UIGlassEffectStyle style = [self glassEffectStyleFromString:_glassEffectStyle];
            UIGlassEffect *glassEffect = [UIGlassEffect effectWithStyle:style];
            glassEffect.tintColor = glassEffectTintColor;
            glassEffect.interactive = _glassEffectInteractive;
            _effectView.effect = glassEffect;
        }
    }
}

- (void)setGlassEffectInteractive:(BOOL)glassEffectInteractive {
    if (_glassEffectInteractive == glassEffectInteractive) {
        return;
    }
    _glassEffectInteractive = glassEffectInteractive;
    
    if (@available(iOS 26.0, *)) {
        if (_glassEffectEnabled && _effectView) {
            [self setupGlassEffect];
        }
    }
}

- (void)setGlassEffectContainerSpacing:(NSNumber *)glassEffectContainerSpacing {
    if ([_glassEffectContainerSpacing isEqual:glassEffectContainerSpacing]) {
        return;
    }
    _glassEffectContainerSpacing = glassEffectContainerSpacing;
    
    if (@available(iOS 26.0, *)) {
        if (glassEffectContainerSpacing && glassEffectContainerSpacing.doubleValue > 0) {
            [self setupGlassContainerEffect];
        } else {
            [self removeGlassEffect];
        }
    }
}

- (void)setGlassEffectStyle:(NSString *)glassEffectStyle {
    if ([_glassEffectStyle isEqualToString:glassEffectStyle]) {
        return;
    }
    _glassEffectStyle = glassEffectStyle;
    
    if (@available(iOS 26.0, *)) {
        if (_glassEffectEnabled && _effectView) {
            [self setupGlassEffect];
        }
    }
}

#endif // __IPHONE_OS_VERSION_MAX_ALLOWED >= 260000

#pragma mark - Private Liquid Glass Methods

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 260000

- (UIGlassEffectStyle)glassEffectStyleFromString:(NSString *)styleString API_AVAILABLE(ios(26.0)) {
    if (@available(iOS 26.0, *)) {
        if ([styleString isEqualToString:@"clear"]) {
            return UIGlassEffectStyleClear;
        }
    }
    return UIGlassEffectStyleRegular; // Default to Regular
}

- (void)setupGlassEffect {
    if (@available(iOS 26.0, *)) {
        [self removeGlassEffect];
        
        // Create glass effect with specified style
        UIGlassEffectStyle style = [self glassEffectStyleFromString:_glassEffectStyle];
        UIGlassEffect *glassEffect = [UIGlassEffect effectWithStyle:style];
        glassEffect.tintColor = _glassEffectTintColor;
        glassEffect.interactive = _glassEffectInteractive;
        
        _effectView = [[UIVisualEffectView alloc] initWithEffect:glassEffect];
        _effectView.frame = self.bounds;
        _effectView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        _effectView.layer.cornerRadius = self.layer.cornerRadius;
        
        [self addSubview:_effectView];
        [self sendSubviewToBack:_effectView];
    }
}

- (void)setupGlassContainerEffect {
    if (@available(iOS 26.0, *)) {
        [self removeGlassEffect];
        
        UIGlassContainerEffect *glassContainerEffect = [[UIGlassContainerEffect alloc] init];
        glassContainerEffect.spacing = _glassEffectContainerSpacing.doubleValue;
        
        _effectView = [[UIVisualEffectView alloc] initWithEffect:glassContainerEffect];
        _effectView.frame = self.bounds;
        _effectView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        _effectView.layer.cornerRadius = self.layer.cornerRadius;
        
        [self addSubview:_effectView];
        [self sendSubviewToBack:_effectView];
        
        // Move existing subviews to the effect view's content view
        [self moveSubviewsToEffectView];
    }
}

- (void)removeGlassEffect API_AVAILABLE(ios(26.0)) {
    if (_effectView) {
        // Move subviews back to self before removing effect view
        [self moveSubviewsFromEffectView];
        [_effectView removeFromSuperview];
        _effectView = nil;
    }
}

- (void)moveSubviewsToEffectView API_AVAILABLE(ios(26.0)) {
    if (_effectView && _effectView.contentView) {
        NSArray *subviews = [self.subviews copy];
        for (UIView *subview in subviews) {
            if (subview != _effectView && subview.superview != _effectView.contentView) {
                [subview removeFromSuperview];
                [_effectView.contentView addSubview:subview];
            }
        }
    }
}

- (void)moveSubviewsFromEffectView API_AVAILABLE(ios(26.0)) {
    if (_effectView && _effectView.contentView) {
        NSArray *subviews = [_effectView.contentView.subviews copy];
        for (UIView *subview in subviews) {
            [subview removeFromSuperview];
            [self addSubview:subview];
        }
    }
}

#endif // __IPHONE_OS_VERSION_MAX_ALLOWED >= 260000

@end
