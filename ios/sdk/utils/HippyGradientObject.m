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

#import "HippyGradientObject.h"

@implementation HippyGradientObject

- (void)drawInContext:(CGContextRef)context {
    switch (self.gradientType) {
        case HippyGradientTypeLinear:
            HippyDrawLinearGradientInContext(self, context);
            break;
        case HippyGradientTypeRadial:
            HippyDrawRadialGradientInContext(self, context);
            break;
        default:
            break;
    }
}

- (void)drawInGradientLayer:(CAGradientLayer *)gradientLayer {
    NSMutableArray *CGColorsArray = [NSMutableArray arrayWithCapacity:[self.colors count]];
    for (UIColor *color in self.colors) {
        [CGColorsArray addObject:(id)color.CGColor];
    }
    gradientLayer.colors = CGColorsArray;
    gradientLayer.locations = self.locations;
    gradientLayer.startPoint = self.startPoint;
    gradientLayer.endPoint = self.endPoint;
}

@end

static CFArrayRef UIColorsToCGColors(NSArray<UIColor *> *colors) {
    NSMutableArray *CGColorsArray = [NSMutableArray arrayWithCapacity:[colors count]];
    for (UIColor *color in colors) {
        [CGColorsArray addObject:(id)color.CGColor];
    }
    return (__bridge CFArrayRef)[NSArray arrayWithArray:CGColorsArray];
}

static CGFloat *CreateNSNumbersToCGFloats(NSArray<NSNumber *> * locations) {
    CGFloat *pLocs = malloc([locations count] * sizeof(CGFloat));
    for (long i = 0; i < [locations count]; i++) {
        NSNumber *num = locations[i];
        pLocs[i] = [num doubleValue];
    }
    return pLocs;
}

HIPPY_EXTERN void HippyDrawLinearGradientInContext(HippyGradientObject *object, CGContextRef context) {
    HippyAssert(context, @"context cannot be null for drawing linear gradient");
    CGColorSpaceRef spaceRef = CGColorSpaceCreateDeviceRGB();
    CFArrayRef colors = UIColorsToCGColors(object.colors);
    CGFloat *locations = CreateNSNumbersToCGFloats(object.locations);
    CGGradientRef gradient = CGGradientCreateWithColors(spaceRef, colors, locations);
    CGContextDrawLinearGradient(context, gradient, object.startPoint, object.endPoint, 0);
    CGGradientRelease(gradient);
    free(locations);
    CGColorSpaceRelease(spaceRef);
}

HIPPY_EXTERN void HippyDrawRadialGradientInContext(HippyGradientObject *object, CGContextRef context) {
    HippyAssert(context, @"context cannot be null for drawing radial gradient");
    HippyAssert(NO, @"HippyDrawRadialGradientInContext not implemented");
}

HIPPY_EXTERN HippyGradientObject *GradientToRight(void) {
    HippyGradientObject *obj = [[HippyGradientObject alloc] init];
    obj.colors = @[[UIColor redColor], [UIColor greenColor], [UIColor blueColor]];
    obj.locations = @[@(0), @(0.5f), @(1)];
    obj.startPoint = CGPointMake(0, 0.5f);
    obj.endPoint = CGPointMake(1, 0.5f);
    return obj;
}

HIPPY_EXTERN HippyGradientObject *GradientTo165Degree(CGSize size) {
    HippyGradientObject *obj = [[HippyGradientObject alloc] init];
    obj.colors = @[[UIColor redColor], [UIColor greenColor], [UIColor blueColor]];
    obj.locations = @[@(0), @(0.5f), @(1)];
    
    const CGFloat angle = 0;
    CGFloat degree = angle * M_PI / 180;
    CGFloat width = 1;
    CGFloat height = 1;
    CGPoint center = CGPointMake(width/2, height/2);
    CGPoint startPoint = CGPointMake(center.x - cos (degree) * width/2, center.y - sin(degree) * height/2);
    CGPoint endPoint = CGPointMake(center.x + cos (degree) * width/2, center.y + sin(degree) * height/2);
    
    
    obj.startPoint = startPoint;
    obj.endPoint = endPoint;
    return obj;
}
