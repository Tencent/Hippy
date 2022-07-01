/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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
#import "NativeRenderBorderDrawing.h"

NS_ASSUME_NONNULL_BEGIN

@interface NativeRenderGradientLocationParser : NSObject

@property(nonatomic, assign) NSUInteger locationsCount;

- (instancetype)initWithLocationsCount:(NSUInteger)count;

- (void)setLocationValue:(NSNumber * )value atLocation:(NSUInteger)location;

- (NSArray<NSNumber *> *) computeLocations;

@end

typedef NS_ENUM(NSUInteger, NativeRenderGradientType) {
    NativeRenderGradientTypeLinear,
    NativeRenderGradientTypeRadial,
};

typedef NS_ENUM(NSUInteger, NativeRenderGradientDirection) {
    NativeRenderGradientDirectionTop,
    NativeRenderGradientDirectionTopRight,
    NativeRenderGradientDirectionRight,
    NativeRenderGradientDirectionBottomRight,
    NativeRenderGradientDirectionBottom,
    NativeRenderGradientDirectionBottomLeft,
    NativeRenderGradientDirectionLeft,
    NativeRenderGradientDirectionTopLeft,
};

typedef struct _LinearGradientPoints {
    CGPoint startPoint;
    CGPoint endPoint;
}LinearGradientPoints;

typedef struct _CanvasInfo {
    CGSize size;
    NativeRenderCornerRadii cornerRadii;
    NativeRenderCornerInsets insets;
}CanvasInfo;

@interface NativeRenderGradientObject : NSObject

- (instancetype)initWithGradientObject:(NSDictionary *)object;

@property(nonatomic, strong) NSArray<UIColor *> *colors;
@property(nonatomic, strong) NSArray<NSNumber *> *locations;
//degree by angle
@property(nonatomic, assign) NSInteger degree;
@property(nonatomic, assign) NativeRenderGradientDirection direction;
//determine if gradient drawn by degree.Default is NO.
//if YES, gradient is drawn by degree,otherwise by direction
@property(nonatomic, assign, getter=isDrawnByDegree) BOOL drawnByDegree;
@property(nonatomic, assign) NativeRenderGradientType gradientType;

- (void)drawInContext:(CGContextRef)context canvasInfo:(CanvasInfo)canvasInfo;

- (LinearGradientPoints)linearGradientPointsFromSize:(CGSize)size;

@end

NATIVE_RENDER_EXTERN void NativeRenderDrawLinearGradientInContext(NativeRenderGradientObject *object, CGContextRef context, CanvasInfo canvasInfo);
NATIVE_RENDER_EXTERN void NativeRenderDrawRadialGradientInContext(NativeRenderGradientObject *object, CGContextRef context, CGSize);

NS_ASSUME_NONNULL_END
