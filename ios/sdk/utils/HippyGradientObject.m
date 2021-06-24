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
#import "HippyUtils.h"

@interface HippyGradientLocationParser () {
    NSPointerArray *_locations;
    NSInteger _previousSettedLocation;
}

@end

@implementation HippyGradientLocationParser

- (instancetype)initWithLocationsCount:(NSUInteger)count {
    self = [super init];
    if (self) {
        [self setLocationsCount:count];
    }
    return self;
}

- (void)setLocationsCount:(NSUInteger)locationsCount {
    _locationsCount = locationsCount;
    _locations = [NSPointerArray strongObjectsPointerArray];
    _locations.count = locationsCount;
    _previousSettedLocation = -1;
}

- (void)setLocationValue:(NSNumber *)value atLocation:(NSUInteger)location {
    HippyAssert(location < _locationsCount, @"HippyGradientLocationParser location out of range,try to insert value at %lu, but count is %lu", location, _locationsCount);
    [_locations replacePointerAtIndex:location withPointer:(__bridge void *)value];
}

- (void)setLocationValuesBetweenLocations1:(NSUInteger)location1 location2:(NSUInteger)location2 {
    if (location2 - location1 < 1) {
        return;
    }
    CGFloat value1 = [(__bridge NSNumber *)[_locations pointerAtIndex:location1] floatValue];
    CGFloat value2 = [(__bridge NSNumber *)[_locations pointerAtIndex:location2] floatValue];
    CGFloat valueDiff = value2 - value1;
    CGFloat locationDiff = location2 - location1;
    CGFloat equalValueForEach = valueDiff / locationDiff;
    for (NSUInteger i = location1 + 1; i < location2; i++) {
        CGFloat value = value1 + (i - location1) * equalValueForEach;
        NSNumber *num = @(value);
        [_locations replacePointerAtIndex:i withPointer:(__bridge void *)num];
    }
}

- (NSArray<NSNumber *> *) computeLocations {
    if (_locations > 0) {
        void *first = [_locations pointerAtIndex:0];
        if (!first) {
            NSNumber *num = @(0);
            [_locations replacePointerAtIndex:0 withPointer:(__bridge void *)num];
        }
        NSUInteger lastIndex = [_locations count] - 1;
        void *last = [_locations pointerAtIndex:lastIndex];
        if (!last) {
            NSNumber *num = @(1);
            [_locations replacePointerAtIndex:lastIndex withPointer:(__bridge void *)num];
        }
        NSUInteger settedIndex = 0;
        for (NSUInteger i = 1; i <= lastIndex; i++) {
            const void *p = [_locations pointerAtIndex:i];
            if (p) {
                [self setLocationValuesBetweenLocations1:settedIndex location2:i];
                settedIndex = i;
            }
        }
        return [_locations allObjects];
    }
    return nil;
}

@end

@implementation HippyGradientObject

- (void)drawInContext:(CGContextRef)context withSize:(CGSize)size {
    switch (self.gradientType) {
        case HippyGradientTypeLinear:
            HippyDrawLinearGradientInContext(self, context, size);
            break;
        case HippyGradientTypeRadial:
            HippyDrawRadialGradientInContext(self, context, size);
            break;
        default:
            break;
    }
}

static CGPoint pointWithSizeAndDegree(CGSize size, CGFloat degree) {
    CGFloat halfWidth = size.width / 2.f;
    CGFloat halfHeight = size.height / 2.f;
    CGFloat rad = degree * M_PI / 180.f;
    CGPoint point = CGPointZero;
    if (degree >= 0 && degree < 90) {
        CGFloat sideLen = halfHeight * tan(rad);
        if (sideLen <= halfWidth) {
            point.x = halfWidth + sideLen;
            point.y = 0;
        }
        else {
            point.x = size.width;
            CGFloat diffRad = M_PI_2 - rad;
            CGFloat sideLen = halfWidth * tan(diffRad);
            point.y = halfHeight - sideLen;
        }
    }
    else if (degree >= 90 && degree < 180) {
        CGFloat revRad = rad - M_PI_2;
        CGFloat sideLen = halfWidth * tan(revRad);
        if (sideLen <= halfHeight) {
            point.x = size.width;
            point.y = sideLen + halfHeight;
        }
        else {
            point.y = size.height;
            CGFloat diffRad = M_PI_2 - revRad;
            CGFloat sideLen = halfHeight * tan(diffRad);
            point.x = halfWidth + sideLen;
        }
    }
    else {
        point.x = halfWidth;
        point.y = size.height;
    }
    return point;
}

static BOOL getDirectionFromString(NSString *string, HippyGradientDirection *direction) {
    BOOL isDrawnByDirection = NO;
    if (direction) {
        if ([string isEqualToString:@"totop"]) {
            *direction = HippyGradientDirectionTop;
            isDrawnByDirection = YES;
        }
        else if ([string isEqualToString:@"totopright"]) {
            *direction = HippyGradientDirectionTopRight;
            isDrawnByDirection = YES;
        }
        else if ([string isEqualToString:@"toright"]) {
            *direction = HippyGradientDirectionRight;
            isDrawnByDirection = YES;
        }
        else if ([string isEqualToString:@"tobottomright"]) {
            *direction = HippyGradientDirectionBottomRight;
            isDrawnByDirection = YES;
        }
        else if ([string isEqualToString:@"tobottom"]) {
            *direction = HippyGradientDirectionBottom;
            isDrawnByDirection = YES;
        }
        else if ([string isEqualToString:@"tobottomleft"]) {
            *direction = HippyGradientDirectionBottomLeft;
            isDrawnByDirection = YES;
        }
        else if ([string isEqualToString:@"toleft"]) {
            *direction = HippyGradientDirectionLeft;
            isDrawnByDirection = YES;
        }
        else if ([string isEqualToString:@"totopleft"]) {
            *direction = HippyGradientDirectionTopLeft;
            isDrawnByDirection = YES;
        }
    }
    return isDrawnByDirection;
}

static LinearGradientPoints pointsFromDirection(HippyGradientObject *object, CGSize size) {
//    LinearGradientPoints points = {CGPointZero, CGPointZero};
    CGPoint startPoint = CGPointMake(size.width / 2.f, size.height);
    switch (object.direction) {
        case HippyGradientDirectionTopRight:
            startPoint = CGPointMake(0, size.height);
            break;
        case HippyGradientDirectionRight:
            startPoint = CGPointMake(0, size.height / 2.f);
            break;
        case HippyGradientDirectionBottomRight:
            startPoint = CGPointMake(0, 0);
            break;
        case HippyGradientDirectionBottom:
            startPoint = CGPointMake(size.width / 2.f, 0);
            break;
        case HippyGradientDirectionBottomLeft:
            startPoint = CGPointMake(size.width, 0);
            break;
        case HippyGradientDirectionLeft:
            startPoint = CGPointMake(size.width, size.height / 2.f);
            break;
        case HippyGradientDirectionTopLeft:
            startPoint = CGPointMake(size.width, size.height);
            break;
        default:
            break;
    }
    CGPoint endPoint = CGPointMake(size.width - startPoint.x, size.height - startPoint.y);
    return (LinearGradientPoints){startPoint, endPoint};
}

- (instancetype)initWithGradientObject:(NSDictionary *)object {
    self = [super init];
    if (self) {
        //     style.linearGradient = {
        //             // @param {string} angle - 浮点数渐变线角度.
        //             angle: '45',
        //             /**
        //              * @param {Array} colorStopList - 颜色停止列表
        //              */
        //             colorStopList: [{ color: -11756806, ratio: 0.1 }, { color: -11756806, ratio: 0.6 }],
        //      };
        #if HIPPY_DEBUG
            @try {
        #endif //#if HIPPY_DEBUG
                NSString *angleString = [object objectForKey:@"angle"];
                HippyGradientDirection direction;
                if (getDirectionFromString(angleString, &direction)) {
                    self.direction = direction;
                }
                else {
                    self.degree = [angleString intValue];
                }
                
                NSArray<NSDictionary *> *colorStopList = [object objectForKey:@"colorStopList"];
                NSMutableArray<UIColor *> *colors = [NSMutableArray arrayWithCapacity:[colorStopList count]];
                HippyGradientLocationParser *locationParser = [[HippyGradientLocationParser alloc] initWithLocationsCount:[colorStopList count]];
                for (NSUInteger i = 0; i < [colorStopList count]; i++) {
                    NSDictionary *colorStop = [colorStopList objectAtIndex:i];
                    NSNumber *colorNumber = [colorStop objectForKey:@"color"];
                    UIColor *color = HippyConvertNumberToColor([colorNumber integerValue]);
                    [colors addObject:color];

                    NSNumber *stop = [colorStop objectForKey:@"ratio"];
                    if (stop) {
                        [locationParser setLocationValue:stop atLocation:i];
                    }
                }
                self.colors = [colors copy];
                self.locations = [locationParser computeLocations];
        #if HIPPY_DEBUG
            } @catch (NSException *exception) {
                return self;
            }
        #endif //#if HIPPY_DEBUG
    }
    return self;
}

- (LinearGradientPoints)linearGradientPointsFromSize:(CGSize)size {
    LinearGradientPoints points = {CGPointZero, CGPointZero};
    if (self.drawnByDegree) {
        self.degree %= 360;
        if (self.degree < 0) {
            self.degree += 360;
        }
        CGPoint startPoint = CGPointZero;
        CGPoint endPoint = CGPointZero;
        if (self.degree <= 180) {
            endPoint = pointWithSizeAndDegree(size, self.degree);
            startPoint = CGPointMake(size.width - endPoint.x, size.height - endPoint.y);
        }
        else {
            startPoint = pointWithSizeAndDegree(size, self.degree - 180);
            endPoint = CGPointMake(size.width - startPoint.x, size.height - startPoint.y);
        }
        points.startPoint = startPoint;
        points.endPoint = endPoint;
    }
    else {
        points = pointsFromDirection(self, size);
    }
    return points;
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

HIPPY_EXTERN void HippyDrawLinearGradientInContext(HippyGradientObject *object, CGContextRef context, CGSize size) {
    HippyAssert(context, @"context cannot be null for drawing linear gradient");
    CGColorSpaceRef spaceRef = CGColorSpaceCreateDeviceRGB();
    CFArrayRef colors = UIColorsToCGColors(object.colors);
    CGFloat *locations = CreateNSNumbersToCGFloats(object.locations);
    CGGradientRef gradient = CGGradientCreateWithColors(spaceRef, colors, locations);
    
    LinearGradientPoints points = [object linearGradientPointsFromSize:size];
    
    CGContextDrawLinearGradient(context,
                                gradient,
                                points.startPoint,
                                points.endPoint,
//                                CGPointMake(40, 80),
//                                CGPointMake(120, 0),
                                kCGGradientDrawsBeforeStartLocation | kCGGradientDrawsAfterEndLocation);
    CGGradientRelease(gradient);
    free(locations);
    CGColorSpaceRelease(spaceRef);
}

HIPPY_EXTERN void HippyDrawRadialGradientInContext(HippyGradientObject *object, CGContextRef context, CGSize size) {
    HippyAssert(context, @"context cannot be null for drawing radial gradient");
    HippyAssert(NO, @"HippyDrawRadialGradientInContext not implemented");
}

static void parseDirection(HippyGradientObject *object, NSString *direction) {

}

/**
 * in a coordinates, point P(x1,y1) rotates Angle θ about a coordinate point Q(x2,y2), and the new coordinate is set as the calculation formula of (x, y)
 * x= (x1 - x2)*cos(θ) - (y1 - y2)*sin(θ) + x2 ;
 * y= (x1 - x2)*sin(θ) + (y1 - y2)*cos(θ) + y2 ;
 */
static CGPoint pointRotateAroundAnchor(CGPoint point, CGPoint anchor, NSInteger degree) {
    CGFloat rad = degree * M_PI / 180.f;
    CGFloat x1 = point.x;
    CGFloat y1 = point.y;
    CGFloat x2 = anchor.x;
    CGFloat y2 = anchor.y;
    CGFloat x = (x1 - x2) * cos(rad) - (y1 - y2) * sin(rad) + x2;
    CGFloat y = (x1 - x2) * sin(rad) + (y1 - y2) * cos(rad) + y2;
    return CGPointMake(x, y);
}

/**
 * convert angle to startpoint & endpoint.
 * angle must be degree.
 */
static void parseDegree(HippyGradientObject *object, CGFloat degree) {
    //we use 'to top' point as initial point,
    //then rotate around center point(.5f,.5f) degree degree
    //then we get new start and end point
    CGPoint startPoint = CGPointMake(.5f, 1);
    CGPoint endPoint = CGPointMake(.5f, 0);
    const CGPoint anchorPoint = CGPointMake(.5f, .5f);
    
    startPoint = pointRotateAroundAnchor(startPoint, anchorPoint, degree);
    endPoint = pointRotateAroundAnchor(endPoint, anchorPoint, degree);
}

HIPPY_EXTERN HippyGradientObject* HippyParseLinearGradientString(NSString *string) {
#if HIPPY_DEBUG
    @try {
#endif //#if HIPPY_DEBUG
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
        if ([direction hasSuffix:@"deg"]) {
            direction = [direction stringByReplacingOccurrencesOfString:@"deg" withString:@""];
            CGFloat degree = [direction doubleValue];
            parseDegree(object, degree);
        }
        else if ([direction hasSuffix:@"rad"]) {
            direction = [direction stringByReplacingOccurrencesOfString:@"rad" withString:@""];
            CGFloat radius = [direction doubleValue];
            parseDegree(object, radius * 180.f / M_PI);
        }
        else {
            parseDirection(object, direction);
        }
        NSMutableArray *colors = [NSMutableArray arrayWithCapacity:[colorsAndLocations count]];
        NSMutableArray *locations = nil;
        for (NSString *colorAndLocation in colorsAndLocations) {
            NSString *filterColorAndLocation = [colorAndLocation stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
            NSArray<NSString *> *infos = [filterColorAndLocation componentsSeparatedByString:@" "];
            HippyAssert([infos count], @"color and location empty");
            UIColor *color = HippyConvertStringToColor([infos firstObject]);
            [colors addObject:color];

            if ([infos count] > 1) {
                if (!locations) {
                    locations = [NSMutableArray arrayWithCapacity:[colorsAndLocations count]];
                }
                //it could be @"0.3" or @"30%"
                NSString *location = [infos objectAtIndex:1];
                CGFloat fLocation = 0;
                if ([location hasSuffix:@"%"]) {
                    location = [location stringByReplacingOccurrencesOfString:@"%" withString:@""];
                    fLocation = [location doubleValue] / 100.f;
                }
                else {
                    fLocation = [location doubleValue];
                }
                [locations addObject:@(fLocation)];
            }
        }
        object.colors = colors;
        object.locations = locations;
        return object;
#if HIPPY_DEBUG
    } @catch (NSException *exception) {
    }
#endif //#if HIPPY_DEBUG
    return nil;
}
