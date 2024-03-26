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
    NSString *replacement = [NSString stringWithFormat:@"; componentTag: %@;", self.hippyTag];
    return [superDescription stringByReplacingCharactersInRange:semicolonRange withString:replacement];
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
    if (!CGSizeEqualToSize(self.bounds.size, oldSize)) {
        [self.layer setNeedsDisplay];
    }
}

- (void)setFrame:(CGRect)frame {
    [super setFrame:frame];
}

- (HippyBorderColors)borderColors {
    return (HippyBorderColors) {
        _borderTopColor ?: _borderColor,
        _borderLeftColor ?: _borderColor,
        _borderBottomColor ?: _borderColor,
        _borderRightColor ?: _borderColor,
    };
}

void NativeRenderBoarderColorsRetain(HippyBorderColors c) {
    if (c.top) {
        CGColorRetain(c.top);
    }
    if (c.bottom) {
        CGColorRetain(c.bottom);
    }
    if (c.left) {
        CGColorRetain(c.left);
    }
    if (c.right) {
        CGColorRetain(c.right);
    }
}

void NativeRenderBoarderColorsRelease(HippyBorderColors c) {
    if (c.top) {
        CGColorRelease(c.top);
    }
    if (c.bottom) {
        CGColorRelease(c.bottom);
    }
    if (c.left) {
        CGColorRelease(c.left);
    }
    if (c.right) {
        CGColorRelease(c.right);
    }
}

- (void)drawShadowForLayer {
    self.layer.shadowPath = nil;
    if (0 != self.shadowSpread) {
        CGRect rect = CGRectInset(self.layer.bounds, -self.shadowSpread, -self.shadowSpread);
        UIBezierPath *path = [UIBezierPath bezierPathWithRect:rect];
        self.layer.shadowPath = path.CGPath;
    }
}

- (CALayerContentsFilter)minificationFilter {
    return kCAFilterLinear;
}

- (CALayerContentsFilter)magnificationFilter {
    return kCAFilterNearest;
}

- (void)displayLayer:(CALayer *)layer {
    if (CGSizeEqualToSize(layer.bounds.size, CGSizeZero)) {
        return;
    }

    [self drawShadowForLayer];

    const HippyCornerRadii cornerRadii = [self cornerRadii];
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
    BOOL borderColorCheck = (borderInsets.top == 0 || (borderColors.top && CGColorGetAlpha(borderColors.top) == 0) || self.clipsToBounds);
    
    BOOL useIOSBorderRendering = !isRunningInTest && isCornerEqual && isBorderInsetsEqual && isBorderColorsEqual && borderStyle && borderColorCheck;

    // iOS clips to the outside of the border, but CSS clips to the inside. To
    // solve this, we'll need to add a container view inside the main view to
    // correctly clip the subviews.

    if (useIOSBorderRendering && !self.backgroundImage && !self.gradientObject) {
        layer.cornerRadius = cornerRadii.topLeft;
        layer.borderColor = borderColors.left;
        layer.borderWidth = borderInsets.left;
        layer.backgroundColor = backgroundColor.CGColor;
        layer.contents = nil;
        layer.needsDisplayOnBoundsChange = NO;
        layer.mask = nil;
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
    
    CGRect theFrame = self.frame;
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
                                               borderColors, backgroundColor.CGColor, clipToBounds, !self.gradientObject);
    if (!self.backgroundImage && !self.gradientObject) {
        contentBlock(borderImage);
        return nil != borderImage;
    }
    else if (self.backgroundImage) {
        UIImage *decodedImage = self.backgroundImage;
        CGFloat backgroundPositionX = self.backgroundPositionX;
        CGFloat backgroundPositionY = self.backgroundPositionY;
        
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
    }
    else if (self.gradientObject) {
        CGSize size = theFrame.size;
        if (0 >= size.width || 0 >= size.height) {
            contentBlock(nil);
            return NO;
        }
        CanvasInfo info = {size, {0,0,0,0}, {{0,0},{0,0},{0,0},{0,0}}};
        info.size = size;
        info.cornerRadii = cornerRadii;
        UIGraphicsBeginImageContextWithOptions(size, NO, 0);
        [self.gradientObject drawInContext:UIGraphicsGetCurrentContext() canvasInfo:info];
        [borderImage drawInRect:(CGRect) { CGPointZero, size }];
        UIImage *resultingImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        contentBlock(resultingImage);
    }
    return YES;
}

static BOOL NativeRenderLayerHasShadow(CALayer *layer) {
    return layer.shadowOpacity * CGColorGetAlpha(layer.shadowColor) > 0;
}

- (void)hippySetInheritedBackgroundColor:(UIColor *)inheritedBackgroundColor {
    // Inherit background color if a shadow has been set, as an optimization
    if (NativeRenderLayerHasShadow(self.layer)) {
        self.backgroundColor = inheritedBackgroundColor;
    }
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

#define setBorderColor(side)                                    \
    -(void)setBorder##side##Color : (CGColorRef)color {         \
        if (CGColorEqualToColor(_border##side##Color, color)) { \
            return;                                             \
        }                                                       \
        CGColorRelease(_border##side##Color);                   \
        _border##side##Color = CGColorRetain(color);            \
        [self.layer setNeedsDisplay];                           \
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

- (void)dealloc {
    CGColorRelease(_borderColor);
    CGColorRelease(_borderTopColor);
    CGColorRelease(_borderRightColor);
    CGColorRelease(_borderBottomColor);
    CGColorRelease(_borderLeftColor);
}

@end
