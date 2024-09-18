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

#import "HippyAssert.h"
#import "HippyUtils.h"
#import "HippyBorderDrawing.h"
#import "HippyGradientObject.h"

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
    NSAssert(location < _locationsCount, @" location out of range, try to insert value at %lu, but count is %lu", location, _locationsCount);
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

- (void)drawInContext:(CGContextRef)context canvasInfo:(CanvasInfo)canvasInfo {
    switch (self.gradientType) {
        case HippyGradientTypeLinear:
            HippyDrawLinearGradientInContext(self, context, canvasInfo);
            break;
        case HippyGradientTypeRadial:
            HippyDrawRadialGradientInContext(self, context, canvasInfo.size);
            break;
        default:
            break;
    }
}

//get the symmetric point to the 'anchor' point
static CGPoint oppositePointToAnchorPoint(CGPoint point, CGPoint anchor) {
    CGFloat x = anchor.x - (point.x - anchor.x);
    CGFloat y = anchor.y - (point.y - anchor.y);
    return CGPointMake(x, y);
}

static CGPoint oppositePointToHorizontalAnchorPoint(CGPoint point, CGPoint anchor) {
    CGFloat x = point.x;
    CGFloat y = anchor.y + (anchor.y - point.y);
    return CGPointMake(x, y);
}

static LinearGradientPoints gradientPointsWithSizeAndDegree(CGSize size, NSInteger degree) {
    CGFloat halfWidth = size.width / 2.f;
    CGFloat halfHeight = size.height / 2.f;
    CGFloat diagonalLen = sqrt(size.width * size.width + size.height * size.height) / 2.f;
    CGFloat diagonalRad = atan(size.width / size.height);
    CGFloat rad = degree * M_PI / 180.f;
    CGPoint anchorPoint = CGPointMake(size.width / 2.f, size.height / 2.f);
    CGPoint endPoint = CGPointZero;
    CGPoint startPoint = CGPointZero;
    if (degree >= 0 && degree < 90) {
        if (rad <= diagonalRad) {
            CGFloat diffRad = diagonalRad - rad;
            CGFloat sideLen = diagonalLen * cos(diffRad);
            CGFloat x = sin(rad) * sideLen;
            CGFloat y = cos(rad) * sideLen;
            endPoint = CGPointMake(halfWidth + x, halfHeight - y);
        }
        else {
            CGFloat diffRad1 = rad - diagonalRad;
            CGFloat diffLen = diagonalLen / cos(diffRad1);
            CGFloat diffRad2 = M_PI_2 - rad;
            CGFloat ySideLen = diffLen * tan(diffRad2) / cos(diffRad2);
            CGFloat y = halfHeight - ySideLen;
            CGFloat xSideLen = ySideLen / tan(diffRad2);
            CGFloat x = halfWidth + xSideLen;
            endPoint = CGPointMake(x, y);
        }
        startPoint = oppositePointToAnchorPoint(endPoint, anchorPoint);
    }
    else if (90 == degree) {
        endPoint = CGPointMake(size.width, size.height / 2.f);
        startPoint = CGPointMake(0, size.height / 2.f);
    }
    else if (degree > 90 && degree < 180) {
        LinearGradientPoints point = gradientPointsWithSizeAndDegree(size, 180 - degree);
        endPoint = oppositePointToHorizontalAnchorPoint(point.endPoint, anchorPoint);
        startPoint = oppositePointToAnchorPoint(endPoint, anchorPoint);
    }
    else if (degree >= 180 && degree < 360) {
        LinearGradientPoints points = gradientPointsWithSizeAndDegree(size, degree - 180);
        startPoint = points.endPoint;
        endPoint = points.startPoint;
    }
    return (LinearGradientPoints){startPoint, endPoint};
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

static CGFloat degreeFromDirection(HippyGradientDirection direction, CGSize size) {
    CGFloat degree = 0.0f;
    switch (direction) {
        case HippyGradientDirectionTopRight:
            degree = atan(size.height / size.width);
            break;
        case HippyGradientDirectionRight:
            degree = M_PI_2;
            break;
        case HippyGradientDirectionBottomRight:
            degree = M_PI - atan(size.height / size.width);
            break;
        case HippyGradientDirectionBottom:
            degree = M_PI;
            break;
        case HippyGradientDirectionBottomLeft:
            degree = M_PI + atan(size.height / size.width);
            break;
        case HippyGradientDirectionLeft:
            degree = M_PI + M_PI_2;
            break;
        case HippyGradientDirectionTopLeft:
            degree = M_PI + M_PI - atan(size.height / size.width);
            break;
        default:
            break;
    }
    return degree * 180.f / M_PI;
}

static LinearGradientPoints pointsFromDirection(HippyGradientObject *object, CGSize size) {
    return gradientPointsWithSizeAndDegree(size, degreeFromDirection(object.direction, size));
}

- (instancetype)initWithGradientObject:(NSDictionary *)object {
    self = [super init];
    if (self) {
//     style.linearGradient = {
//             // @param {string} angle - degree for linear gradient line.
//             angle: '45',
//             /**
//              * @param {Array} colorStopList - colors & stops
//              */
//             colorStopList: [{ color: -11756806, ratio: 0.1 }, { color: -11756806, ratio: 0.6 }],
//      };
        @try {
            NSString *angleString = [object objectForKey:@"angle"];
            HippyGradientDirection direction;
            if (getDirectionFromString(angleString, &direction)) {
                self.direction = direction;
            }
            else {
                self.degree = [angleString intValue];
                self.drawnByDegree = YES;
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
        } @catch (NSException *exception) {
            NSString *errorString = [NSString stringWithFormat:@"gradient parse error:%@", [exception reason]];
            NSError *error = HippyErrorWithMessageAndModuleName(errorString, nil);
            HippyFatal(error);
            return self;
        }
    }
    return self;
}

- (LinearGradientPoints)linearGradientPointsFromSize:(CGSize)size {
    LinearGradientPoints points;
    if (self.drawnByDegree) {
        self.degree %= 360;
        if (self.degree < 0) {
            self.degree += 360;
        }
        points = gradientPointsWithSizeAndDegree(size, self.degree);
    } else {
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

void HippyDrawLinearGradientInContext(HippyGradientObject *object, CGContextRef context, CanvasInfo canvasInfo) {
    NSCAssert(context, @"context cannot be null for drawing linear gradient");
    if (nil == context) {
        return;
    }
    CGColorSpaceRef spaceRef = CGColorSpaceCreateDeviceRGB();
    CFArrayRef colors = UIColorsToCGColors(object.colors);
    CGFloat *locations = CreateNSNumbersToCGFloats(object.locations);
    CGGradientRef gradient = CGGradientCreateWithColors(spaceRef, colors, locations);
    
    CGContextSaveGState(context);
    CGSize size = canvasInfo.size;
    CGPathRef pathRef = HippyPathCreateOuterOutline(NO, CGRectMake(0, 0, size.width, size.height), canvasInfo.cornerRadii);
    CGContextAddPath(context, pathRef);
    CGContextClip(context);
    LinearGradientPoints points = [object linearGradientPointsFromSize:size];
    CGContextDrawLinearGradient(context,
                                gradient,
                                points.startPoint,
                                points.endPoint,
                                kCGGradientDrawsBeforeStartLocation | kCGGradientDrawsAfterEndLocation
                                );
    CGPathRelease(pathRef);
    CGGradientRelease(gradient);
    free(locations);
    CGColorSpaceRelease(spaceRef);
    CGContextRestoreGState(context);
}

HIPPY_EXTERN void HippyDrawRadialGradientInContext(HippyGradientObject *object, CGContextRef context, CGSize size) {
    NSCAssert(context, @"context cannot be null for drawing radial gradient");
    NSCAssert(NO, @"HippyDrawRadialGradientInContext not implemented");
}
