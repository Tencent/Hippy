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

#import <Foundation/Foundation.h>
#import <UIKit/UIColor.h>
#import <CoreGraphics/CGContext.h>
#import "HippyBorderDrawing.h"

NS_ASSUME_NONNULL_BEGIN

@interface HippyGradientLocationParser : NSObject

@property(nonatomic, assign) NSUInteger locationsCount;

- (instancetype)initWithLocationsCount:(NSUInteger)count;

- (void)setLocationValue:(NSNumber * )value atLocation:(NSUInteger)location;

- (NSArray<NSNumber *> *) computeLocations;

@end

typedef NS_ENUM(NSUInteger, HippyGradientType) {
    HippyGradientTypeLinear,
    HippyGradientTypeRadial,
};

typedef NS_ENUM(NSUInteger, HippyGradientDirection) {
    HippyGradientDirectionTop,
    HippyGradientDirectionTopRight,
    HippyGradientDirectionRight,
    HippyGradientDirectionBottomRight,
    HippyGradientDirectionBottom,
    HippyGradientDirectionBottomLeft,
    HippyGradientDirectionLeft,
    HippyGradientDirectionTopLeft,
};

typedef struct _LinearGradientPoints {
    CGPoint startPoint;
    CGPoint endPoint;
}LinearGradientPoints;

typedef struct _CanvasInfo {
    CGSize size;
    HippyCornerRadii cornerRadii;
    HippyCornerInsets insets;
}CanvasInfo;

@interface HippyGradientObject : NSObject

- (instancetype)initWithGradientObject:(NSDictionary *)object;

@property(nonatomic, strong) NSArray<UIColor *> *colors;
@property(nonatomic, strong) NSArray<NSNumber *> *locations;
//degree by angle
@property(nonatomic, assign) NSInteger degree;
@property(nonatomic, assign) HippyGradientDirection direction;
//determine if gradient drawn by degree.Default is NO.
//if YES, gradient is drawn by degree,otherwise by direction
@property(nonatomic, assign, getter=isDrawnByDegree) BOOL drawnByDegree;
@property(nonatomic, assign) HippyGradientType gradientType;

- (void)drawInContext:(CGContextRef)context canvasInfo:(CanvasInfo)canvasInfo;

- (LinearGradientPoints)linearGradientPointsFromSize:(CGSize)size;

@end

HIPPY_EXTERN void HippyDrawLinearGradientInContext(HippyGradientObject *object, CGContextRef context, CanvasInfo canvasInfo);
HIPPY_EXTERN void HippyDrawRadialGradientInContext(HippyGradientObject *object, CGContextRef context, CGSize);

NS_ASSUME_NONNULL_END
