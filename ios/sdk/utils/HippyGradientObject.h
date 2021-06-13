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
#import <QuartzCore/CAGradientLayer.h>
#import "HippyAssert.h"
#import "HippyDefines.h"

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSUInteger, HippyGradientType) {
    HippyGradientTypeLinear,
    HippyGradientTypeRadial,
};

@interface HippyGradientObject : NSObject

@property(nonatomic, strong) NSArray<UIColor *> *colors;
@property(nonatomic, strong) NSArray<NSNumber *> *locations;
@property(nonatomic, assign) CGPoint startPoint;
@property(nonatomic, assign) CGPoint endPoint;
@property(nonatomic, assign) HippyGradientType gradientType;

- (void)drawInContext:(CGContextRef)context;
- (void)drawInGradientLayer:(CAGradientLayer *)gradientLayer;

@end

HIPPY_EXTERN void HippyDrawLinearGradientInContext(HippyGradientObject *object, CGContextRef context);
HIPPY_EXTERN void HippyDrawRadialGradientInContext(HippyGradientObject *object, CGContextRef context);

//Test Code, delete when release

HIPPY_EXTERN HippyGradientObject *GradientToRight(void);
HIPPY_EXTERN HippyGradientObject *GradientTo165Degree(CGSize size);

//Test Code End here

NS_ASSUME_NONNULL_END
