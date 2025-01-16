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

#import "HippyViewInnerLayer.h"

@interface HippyViewInnerLayer ()
@property (nonatomic, assign) CGPoint mRealInnerTopStart;
@property (nonatomic, assign) CGPoint mRealInnerTopEnd;
@property (nonatomic, assign) CGPoint mRealInnerLeftStart;
@property (nonatomic, assign) CGPoint mRealInnerLeftEnd;
@property (nonatomic, assign) CGPoint mRealInnerBottomStart;
@property (nonatomic, assign) CGPoint mRealInnerBottomEnd;
@property (nonatomic, assign) CGPoint mRealInnerRightStart;
@property (nonatomic, assign) CGPoint mRealInnerRightEnd;
@end

@implementation HippyViewInnerLayer
@dynamic boxShadowOpacity;

+ (BOOL)needsDisplayForKey:(NSString *)key
{
    if ([key isEqualToString:@"boxShadowOpacity"])
    {
        return YES;
    }
    return [super needsDisplayForKey:key];
}

- (id)actionForKey:(NSString *)key
{
    if ([key isEqualToString:@"boxShadowOpacity"])
    {
        CABasicAnimation *theAnimation = [CABasicAnimation animationWithKeyPath:key];
        theAnimation.fromValue = [self.presentationLayer valueForKey:key];
        return theAnimation;
    }
    return [super actionForKey:key];
}

- (void)calculateRealInnerPoint
{
    self.mShadowSpread = MIN(self.mShadowSpread, self.bounds.size.width/2.f);
    self.mShadowSpread = MIN(self.mShadowSpread, self.bounds.size.height/2.f);
    
    CGFloat leftX = self.mInnerLeftStart.x+self.mShadowSpread;
    CGFloat topStartX = self.mInnerTopStart.x+self.mShadowSpread;
    CGFloat topEndX = self.mInnerTopEnd.x-self.mShadowSpread;
    CGFloat bottomStartX = self.mInnerBottomStart.x+self.mShadowSpread;
    CGFloat bottomEndX = self.mInnerBottomEnd.x-self.mShadowSpread;
    CGFloat rightX = self.mInnerRightStart.x-self.mShadowSpread;
    
    CGFloat topY = self.mInnerTopStart.y+self.mShadowSpread;
    CGFloat leftStartY = self.mInnerLeftStart.y+self.mShadowSpread;
    CGFloat leftEndY = self.mInnerLeftEnd.y-self.mShadowSpread;
    CGFloat rightStartY = self.mInnerRightStart.y+self.mShadowSpread;
    CGFloat rightEndY = self.mInnerRightEnd.y-self.mShadowSpread;
    CGFloat bottomY = self.mInnerBottomStart.y-self.mShadowSpread;
    
    // makesure leftX < topStartX < topEndX < rightX
    topStartX = MAX(topStartX, leftX);
    topEndX = MAX(topEndX, topStartX);
    rightX = MAX(rightX, topEndX);
    
    // makesure leftX < bottomStartX < bottomEndX < rightX
    bottomStartX = MAX(bottomStartX, leftX);
    bottomEndX = MAX(bottomEndX, bottomStartX);
    rightX = MAX(rightX, bottomEndX);
    
    // makesure topY < leftStartY < leftEndY < bottomY
    leftStartY = MAX(leftStartY, topY);
    leftEndY = MAX(leftEndY, leftStartY);
    bottomY = MAX(bottomY, leftEndY);
    
    // makesure topY < rightStartY < rightEndY < bottomY
    rightStartY = MAX(rightStartY, topY);
    rightEndY = MAX(rightEndY, rightStartY);
    bottomY = MAX(bottomY, rightEndY);
    
    self.mRealInnerTopStart = CGPointMake(topStartX, topY);
    self.mRealInnerTopEnd = CGPointMake(topEndX, topY);
    self.mRealInnerRightStart = CGPointMake(rightX, rightStartY);
    self.mRealInnerRightEnd = CGPointMake(rightX, rightEndY);
    
    self.mRealInnerBottomStart = CGPointMake(bottomStartX, bottomY);
    self.mRealInnerBottomEnd = CGPointMake(bottomEndX, bottomY);
    self.mRealInnerLeftStart = CGPointMake(leftX, leftStartY);
    self.mRealInnerLeftEnd = CGPointMake(leftX, leftEndY);
}

- (void)drawInnerShadowOuterPath:(CGContextRef)context
{
    UIBezierPath *innerShadowPath = [UIBezierPath bezierPath];
    [innerShadowPath setLineWidth:1];
    [innerShadowPath moveToPoint:self.mInnerTopStart];
    
    [innerShadowPath addLineToPoint:self.mInnerTopEnd];
    [innerShadowPath addQuadCurveToPoint:self.mInnerRightStart controlPoint:CGPointMake(self.mInnerRightStart.x, self.mInnerTopEnd.y)];
    
    [innerShadowPath addLineToPoint:self.mInnerRightEnd];
    [innerShadowPath addQuadCurveToPoint:self.mInnerBottomEnd controlPoint:CGPointMake(self.mInnerRightEnd.x, self.mInnerBottomEnd.y)];
    
    [innerShadowPath addLineToPoint:self.mInnerBottomStart];
    [innerShadowPath addQuadCurveToPoint:self.mInnerLeftEnd controlPoint:CGPointMake(self.mInnerLeftEnd.x, self.mInnerBottomStart.y)];
    
    [innerShadowPath addLineToPoint:self.mInnerLeftStart];
    [innerShadowPath addQuadCurveToPoint:self.mInnerTopStart controlPoint:CGPointMake(self.mInnerLeftStart.x, self.mInnerTopStart.y)];
    
    CGContextAddPath(context, innerShadowPath.CGPath);
    CGContextClip(context);
}

- (void)drawLayerOuterPath:(CGContextRef)context
{
    if (self.outerBorderPath)
    {
        CGContextAddPath(context, self.outerBorderPath.CGPath);
        CGContextClip(context);
    }
}

- (void)handleColor:(CGContextRef)context
{
    CGColorSpaceRef colorspace = CGColorSpaceCreateDeviceRGB();
    CGFloat *oldComponents = (CGFloat *)CGColorGetComponents(self.mShadowColor.CGColor);
    CGFloat newComponents[4];
    NSInteger numberOfComponents = CGColorGetNumberOfComponents(self.mShadowColor.CGColor);
    switch (numberOfComponents)
    {
        case 2:
        {
            //grayscale
            newComponents[0] = oldComponents[0];
            newComponents[1] = oldComponents[0];
            newComponents[2] = oldComponents[0];
            newComponents[3] = oldComponents[1] * self.boxShadowOpacity;
            break;
        }
        case 4:
        {
            //RGBA
            newComponents[0] = oldComponents[0];
            newComponents[1] = oldComponents[1];
            newComponents[2] = oldComponents[2];
            newComponents[3] = oldComponents[3] * self.boxShadowOpacity;
            break;
        }
    }
    CGColorRef shadowColorWithMultipliedAlpha = CGColorCreate(colorspace, newComponents);
    CGColorSpaceRelease(colorspace);
    CGContextSetFillColorWithColor(context, shadowColorWithMultipliedAlpha);
    CGContextSetShadowWithColor(context, CGSizeMake(self.mShadowOffsetX, self.mShadowOffsetY), self.mShadowBlur, shadowColorWithMultipliedAlpha);
    CGColorRelease(shadowColorWithMultipliedAlpha);
}

- (void)drawInContext:(CGContextRef)context
{
    if (!context)
    {
        return;
    }
    
    CGRect rect = self.bounds;
    
    [self drawLayerOuterPath:context];
    
    [self drawInnerShadowOuterPath:context];
    
    [self calculateRealInnerPoint];
    UIBezierPath *innerPath = [UIBezierPath bezierPath];
    [innerPath setLineWidth:1];
    [innerPath moveToPoint:self.mRealInnerTopStart];
    
    [innerPath addLineToPoint:self.mRealInnerTopEnd];
    [innerPath addQuadCurveToPoint:self.mRealInnerRightStart controlPoint:CGPointMake(self.mRealInnerRightStart.x, self.mRealInnerTopEnd.y)];
    
    [innerPath addLineToPoint:self.mRealInnerRightEnd];
    [innerPath addQuadCurveToPoint:self.mRealInnerBottomEnd controlPoint:CGPointMake(self.mRealInnerRightEnd.x, self.mRealInnerBottomEnd.y)];
    
    [innerPath addLineToPoint:self.mRealInnerBottomStart];
    [innerPath addQuadCurveToPoint:self.mRealInnerLeftEnd controlPoint:CGPointMake(self.mRealInnerLeftEnd.x, self.mRealInnerBottomStart.y)];
    
    [innerPath addLineToPoint:self.mRealInnerLeftStart];
    [innerPath addQuadCurveToPoint:self.mRealInnerTopStart controlPoint:CGPointMake(self.mRealInnerLeftStart.x, self.mRealInnerTopStart.y)];
    
    CGContextSaveGState(context);
    CGContextAddPath(context, innerPath.CGPath);
    CGContextClip(context);
    CGContextRestoreGState(context);
    
    CGMutablePathRef outer = CGPathCreateMutable();
    CGPathAddRect(outer, NULL, CGRectInset(rect, -1 * rect.size.width, -1 * rect.size.height));
    CGPathAddPath(outer, NULL, innerPath.CGPath);
    CGPathCloseSubpath(outer);
    
    [self handleColor:context];
    
    CGContextAddPath(context, outer);
    CGContextEOFillPath(context);
    CGPathRelease(outer);
}

@end

