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

static UIColor *colorFromHexString(NSString *colorString) {
    NSInteger hex = [colorString integerValue];
    NSInteger r = (hex >> 24) & 0xFF;
    NSInteger g = (hex >> 16) & 0xFF;
    NSInteger b = (hex >> 8) & 0xFF;
    NSInteger a = hex & 0xFF;
    return [UIColor colorWithRed:r / 255.0f
                         green:g / 255.0f
                          blue:b / 255.0f
                         alpha:a];
}

static void parseDirection(HippyGradientObject *object, NSString *direction) {
    if (object) {
        if ([direction isEqualToString:@"to top"]) {
            object.startPoint = CGPointMake(0.5, 1);
            object.endPoint = CGPointMake(0.5, 0);
        }
        else if ([direction isEqualToString:@"to left"]) {
            object.startPoint = CGPointMake(1, 0.5);
            object.endPoint = CGPointMake(0, 0.5);
        }
        else if ([direction isEqualToString:@"to bottom"]) {
            object.startPoint = CGPointMake(0.5, 0);
            object.endPoint = CGPointMake(0.5, 1);
        }
        else if ([direction isEqualToString:@"to right"]) {
            object.startPoint = CGPointMake(0, 0.5);
            object.endPoint = CGPointMake(1, 0.5);
        }
        else if ([direction isEqualToString:@"to topleft"]) {
            object.startPoint = CGPointMake(1, 1);
            object.endPoint = CGPointMake(0, 0);
        }
        else if ([direction isEqualToString:@"to bottomleft"]) {
            object.startPoint = CGPointMake(1, 0);
            object.endPoint = CGPointMake(0, 1);
        }
        else if ([direction isEqualToString:@"to bottomright"]) {
            object.startPoint = CGPointMake(0, 0);
            object.endPoint = CGPointMake(1, 1);
        }
        else if ([direction isEqualToString:@"to topright"]) {
            object.startPoint = CGPointMake(0, 1);
            object.endPoint = CGPointMake(1, 0);
        }
    }
}

HIPPY_EXTERN HippyGradientObject* HippyParseLinearGradientString(NSString *string) {
    if (![string length]) {
        return nil;
    }
    static NSString *linearGradientStringPrefix = @"linear-gradient";
    if (![string hasPrefix:linearGradientStringPrefix]) {
        return nil;
    }
    NSMutableString *linearGradientString = [string mutableCopy];
    [linearGradientString replaceOccurrencesOfString:@"linear-gradient(" withString:@"" options:NSCaseInsensitiveSearch range:NSMakeRange(0, 16)];
    [linearGradientString replaceOccurrencesOfString:@")" withString:@"" options:NSCaseInsensitiveSearch range:NSMakeRange([linearGradientString length] - 1, 1)];
    NSArray<NSString *> *description = [linearGradientString componentsSeparatedByString:@","];
    
    NSString *direction = [description firstObject];
    
    NSArray<NSString *> *colorsAndLocations = [description subarrayWithRange:NSMakeRange(1, [description count] - 1)];
    
    HippyGradientObject *object = [[HippyGradientObject alloc] init];
    parseDirection(object, direction);
    
    NSMutableArray *colors = [NSMutableArray arrayWithCapacity:[colorsAndLocations count]];
    NSMutableArray *locations = [NSMutableArray arrayWithCapacity:[colorsAndLocations count]];
    for (NSString *colorAndLocation in colorsAndLocations) {
        NSString *filterColorAndLocation = [colorAndLocation stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
        NSArray<NSString *> *infos = [filterColorAndLocation componentsSeparatedByString:@" "];
        UIColor *color = colorFromHexString([infos firstObject]);
        NSNumber *location = @([[infos objectAtIndex:1] floatValue]);
        [colors addObject:color];
        [locations addObject:location];
    }
    object.colors = colors;
    object.locations = locations;
    return object;
}
