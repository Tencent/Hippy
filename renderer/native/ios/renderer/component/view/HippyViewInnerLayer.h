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

#import <QuartzCore/QuartzCore.h>
#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

@interface HippyViewInnerLayer : CAShapeLayer

@property (nonatomic, assign) CGFloat mShadowOffsetX;
@property (nonatomic, assign) CGFloat mShadowOffsetY;
@property (nonatomic, assign) CGFloat mShadowBlur;
@property (nonatomic, assign) CGFloat mShadowSpread;
@property (nonatomic, strong) UIColor *mShadowColor;

@property (nonatomic, assign) CGFloat boxShadowOpacity;

@property (nonatomic, assign) CGPoint mInnerTopStart;
@property (nonatomic, assign) CGPoint mInnerTopEnd;
@property (nonatomic, assign) CGPoint mInnerLeftStart;
@property (nonatomic, assign) CGPoint mInnerLeftEnd;
@property (nonatomic, assign) CGPoint mInnerBottomStart;
@property (nonatomic, assign) CGPoint mInnerBottomEnd;
@property (nonatomic, assign) CGPoint mInnerRightStart;
@property (nonatomic, assign) CGPoint mInnerRightEnd;

@property (nonatomic, strong) UIBezierPath *outerBorderPath;
@end


