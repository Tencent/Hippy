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

/**
  Copyright (c) 2014-present, Facebook, Inc.
  All rights reserved.

  This source code is licensed under the BSD-style license found in the
  LICENSE file in the root directory of this source tree. An additional grant
  of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HPOPAnimatableProperty.h"

#import <QuartzCore/QuartzCore.h>

#import "HPOPAnimationRuntime.h"
#import "HPOPCGUtils.h"
#import "HPOPDefines.h"
#import "HPOPLayerExtras.h"

// common threshold definitions
static CGFloat const kHPOPThresholdColor = 0.01;
static CGFloat const kHPOPThresholdPoint = 1.0;
static CGFloat const kHPOPThresholdOpacity = 0.01;
static CGFloat const kHPOPThresholdScale = 0.005;
static CGFloat const kHPOPThresholdRotation = 0.01;
static CGFloat const kHPOPThresholdRadius = 0.01;

#pragma mark - Static

// CALayer
NSString * const kHPOPLayerBackgroundColor = @"backgroundColor";
NSString * const kHPOPLayerBounds = @"bounds";
NSString * const kHPOPLayerCornerRadius = @"cornerRadius";
NSString * const kHPOPLayerBorderWidth = @"borderWidth";
NSString * const kHPOPLayerBorderColor = @"borderColor";
NSString * const kHPOPLayerOpacity = @"opacity";
NSString * const kHPOPLayerPosition = @"position";
NSString * const kHPOPLayerPositionX = @"positionX";
NSString * const kHPOPLayerPositionY = @"positionY";
NSString * const kHPOPLayerRotation = @"rotation";
NSString * const kHPOPLayerRotationX = @"rotationX";
NSString * const kHPOPLayerRotationY = @"rotationY";
NSString * const kHPOPLayerScaleX = @"scaleX";
NSString * const kHPOPLayerScaleXY = @"scaleXY";
NSString * const kHPOPLayerScaleY = @"scaleY";
NSString * const kHPOPLayerSize = @"size";
NSString * const kHPOPLayerSubscaleXY = @"subscaleXY";
NSString * const kHPOPLayerSubtranslationX = @"subtranslationX";
NSString * const kHPOPLayerSubtranslationXY = @"subtranslationXY";
NSString * const kHPOPLayerSubtranslationY = @"subtranslationY";
NSString * const kHPOPLayerSubtranslationZ = @"subtranslationZ";
NSString * const kHPOPLayerTranslationX = @"translationX";
NSString * const kHPOPLayerTranslationXY = @"translationXY";
NSString * const kHPOPLayerTranslationY = @"translationY";
NSString * const kHPOPLayerTranslationZ = @"translationZ";
NSString * const kHPOPLayerZPosition = @"zPosition";
NSString * const kHPOPLayerShadowColor = @"shadowColor";
NSString * const kHPOPLayerShadowOffset = @"shadowOffset";
NSString * const kHPOPLayerShadowOpacity = @"shadowOpacity";
NSString * const kHPOPLayerShadowRadius = @"shadowRadius";

#import "HPOPDefines.h"
#if HPOP_CODE_TRIM

// CAShapeLayer
NSString * const kHPOPShapeLayerStrokeStart = @"shapeLayer.strokeStart";
NSString * const kHPOPShapeLayerStrokeEnd = @"shapeLayer.strokeEnd";
NSString * const kHPOPShapeLayerStrokeColor = @"shapeLayer.strokeColor";
NSString * const kHPOPShapeLayerFillColor = @"shapeLayer.fillColor";
NSString * const kHPOPShapeLayerLineWidth = @"shapeLayer.lineWidth";
NSString * const kHPOPShapeLayerLineDashPhase = @"shapeLayer.lineDashPhase";

// NSLayoutConstraint
NSString * const kHPOPLayoutConstraintConstant = @"layoutConstraint.constant";

#if TARGET_OS_IPHONE

// UIView
NSString * const kHPOPViewAlpha = @"view.alpha";
NSString * const kHPOPViewBackgroundColor = @"view.backgroundColor";
NSString * const kHPOPViewBounds = kHPOPLayerBounds;
NSString * const kHPOPViewCenter = @"view.center";
NSString * const kHPOPViewFrame = @"view.frame";
NSString * const kHPOPViewScaleX = @"view.scaleX";
NSString * const kHPOPViewScaleXY = @"view.scaleXY";
NSString * const kHPOPViewScaleY = @"view.scaleY";
NSString * const kHPOPViewSize = kHPOPLayerSize;
NSString * const kHPOPViewTintColor = @"view.tintColor";

// UIScrollView
NSString * const kHPOPScrollViewContentOffset = @"scrollView.contentOffset";
NSString * const kHPOPScrollViewContentSize = @"scrollView.contentSize";
NSString * const kHPOPScrollViewZoomScale = @"scrollView.zoomScale";
NSString * const kHPOPScrollViewContentInset = @"scrollView.contentInset";
NSString * const kHPOPScrollViewScrollIndicatorInsets = @"scrollView.scrollIndicatorInsets";

// UITableView
NSString * const kHPOPTableViewContentOffset = kHPOPScrollViewContentOffset;
NSString * const kHPOPTableViewContentSize = kHPOPScrollViewContentSize;

// UICollectionView
NSString * const kHPOPCollectionViewContentOffset = kHPOPScrollViewContentOffset;
NSString * const kHPOPCollectionViewContentSize = kHPOPScrollViewContentSize;

// UINavigationBar
NSString * const kHPOPNavigationBarBarTintColor = @"navigationBar.barTintColor";

// UIToolbar
NSString * const kHPOPToolbarBarTintColor = kHPOPNavigationBarBarTintColor;

// UITabBar
NSString * const kHPOPTabBarBarTintColor = kHPOPNavigationBarBarTintColor;

// UILabel
NSString * const kHPOPLabelTextColor = @"label.textColor";

#else /* TARGET_OS_IPHONE */

// NSView
NSString * const kHPOPViewFrame = @"view.frame";
NSString * const kHPOPViewBounds = @"view.bounds";
NSString * const kHPOPViewAlphaValue = @"view.alphaValue";
NSString * const kHPOPViewFrameRotation = @"view.frameRotation";
NSString * const kHPOPViewFrameCenterRotation = @"view.frameCenterRotation";
NSString * const kHPOPViewBoundsRotation = @"view.boundsRotation";

// NSWindow
NSString * const kHPOPWindowFrame = @"window.frame";
NSString * const kHPOPWindowAlphaValue = @"window.alphaValue";
NSString * const kHPOPWindowBackgroundColor = @"window.backgroundColor";

#endif /* TARGET_OS_IPHONE */
#endif /* HPOP_CODE_TRIM */


#if SCENEKIT_SDK_AVAILABLE

// SceneKit
NSString * const kHPOPSCNNodePosition = @"scnode.position";
NSString * const kHPOPSCNNodePositionX = @"scnnode.position.x";
NSString * const kHPOPSCNNodePositionY = @"scnnode.position.y";
NSString * const kHPOPSCNNodePositionZ = @"scnnode.position.z";
NSString * const kHPOPSCNNodeTranslation = @"scnnode.translation";
NSString * const kHPOPSCNNodeTranslationX = @"scnnode.translation.x";
NSString * const kHPOPSCNNodeTranslationY = @"scnnode.translation.y";
NSString * const kHPOPSCNNodeTranslationZ = @"scnnode.translation.z";
NSString * const kHPOPSCNNodeRotation = @"scnnode.rotation";
NSString * const kHPOPSCNNodeRotationX = @"scnnode.rotation.x";
NSString * const kHPOPSCNNodeRotationY = @"scnnode.rotation.y";
NSString * const kHPOPSCNNodeRotationZ = @"scnnode.rotation.z";
NSString * const kHPOPSCNNodeRotationW = @"scnnode.rotation.w";
NSString * const kHPOPSCNNodeEulerAngles = @"scnnode.eulerAngles";
NSString * const kHPOPSCNNodeEulerAnglesX = @"scnnode.eulerAngles.x";
NSString * const kHPOPSCNNodeEulerAnglesY = @"scnnode.eulerAngles.y";
NSString * const kHPOPSCNNodeEulerAnglesZ = @"scnnode.eulerAngles.z";
NSString * const kHPOPSCNNodeOrientation = @"scnnode.orientation";
NSString * const kHPOPSCNNodeOrientationX = @"scnnode.orientation.x";
NSString * const kHPOPSCNNodeOrientationY = @"scnnode.orientation.y";
NSString * const kHPOPSCNNodeOrientationZ = @"scnnode.orientation.z";
NSString * const kHPOPSCNNodeOrientationW = @"scnnode.orientation.w";
NSString * const kHPOPSCNNodeScale = @"scnnode.scale";
NSString * const kHPOPSCNNodeScaleX = @"scnnode.scale.x";
NSString * const kHPOPSCNNodeScaleY = @"scnnode.scale.y";
NSString * const kHPOPSCNNodeScaleZ = @"scnnode.scale.z";
NSString * const kHPOPSCNNodeScaleXY = @"scnnode.scale.xy";

#endif

/**
 State structure internal to static animatable property.
 */
typedef struct
{
  NSString *name;
  HPOPAnimatablePropertyReadBlock readBlock;
  HPOPAnimatablePropertyWriteBlock writeBlock;
  CGFloat threshold;
} _POPStaticAnimatablePropertyState;
typedef _POPStaticAnimatablePropertyState POPStaticAnimatablePropertyState;

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wglobal-constructors"
static POPStaticAnimatablePropertyState _staticStates[] =
{
  /* CALayer */

  {kHPOPLayerBackgroundColor,
    ^(CALayer *obj, CGFloat values[]) {
      POPCGColorGetRGBAComponents(obj.backgroundColor, values);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      CGColorRef color = POPCGColorRGBACreate(values);
      [obj setBackgroundColor:color];
      CGColorRelease(color);
    },
    kHPOPThresholdColor
  },

  {kHPOPLayerBounds,
    ^(CALayer *obj, CGFloat values[]) {
      values_from_rect(values, [obj bounds]);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      [obj setBounds:values_to_rect(values)];
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerCornerRadius,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = [obj cornerRadius];
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      [obj setCornerRadius:values[0]];
    },
    kHPOPThresholdRadius
  },

  {kHPOPLayerBorderWidth,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = [obj borderWidth];
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      [obj setBorderWidth:values[0]];
    },
    0.01
  },

  {kHPOPLayerBorderColor,
    ^(CALayer *obj, CGFloat values[]) {
      POPCGColorGetRGBAComponents(obj.borderColor, values);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      CGColorRef color = POPCGColorRGBACreate(values);
      [obj setBorderColor:color];
      CGColorRelease(color);
    },
    kHPOPThresholdColor
  },

  {kHPOPLayerPosition,
    ^(CALayer *obj, CGFloat values[]) {
      values_from_point(values, [(CALayer *)obj position]);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      [obj setPosition:values_to_point(values)];
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerPositionX,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = [(CALayer *)obj position].x;
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      CGPoint p = [(CALayer *)obj position];
      p.x = values[0];
      [obj setPosition:p];
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerPositionY,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = [(CALayer *)obj position].y;
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      CGPoint p = [(CALayer *)obj position];
      p.y = values[0];
      [obj setPosition:p];
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerOpacity,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = [obj opacity];
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      [obj setOpacity:((float)values[0])];
    },
    kHPOPThresholdOpacity
  },

  {kHPOPLayerScaleX,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = POPLayerGetScaleX(obj);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetScaleX(obj, values[0]);
    },
    kHPOPThresholdScale
  },

  {kHPOPLayerScaleY,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = POPLayerGetScaleY(obj);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetScaleY(obj, values[0]);
    },
    kHPOPThresholdScale
  },

  {kHPOPLayerScaleXY,
    ^(CALayer *obj, CGFloat values[]) {
      values_from_point(values, POPLayerGetScaleXY(obj));
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetScaleXY(obj, values_to_point(values));
    },
    kHPOPThresholdScale
  },

  {kHPOPLayerSubscaleXY,
    ^(CALayer *obj, CGFloat values[]) {
      values_from_point(values, POPLayerGetSubScaleXY(obj));
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetSubScaleXY(obj, values_to_point(values));
    },
    kHPOPThresholdScale
  },

  {kHPOPLayerTranslationX,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = POPLayerGetTranslationX(obj);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetTranslationX(obj, values[0]);
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerTranslationY,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = POPLayerGetTranslationY(obj);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetTranslationY(obj, values[0]);
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerTranslationZ,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = POPLayerGetTranslationZ(obj);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetTranslationZ(obj, values[0]);
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerTranslationXY,
    ^(CALayer *obj, CGFloat values[]) {
      values_from_point(values, POPLayerGetTranslationXY(obj));
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetTranslationXY(obj, values_to_point(values));
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerSubtranslationX,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = POPLayerGetSubTranslationX(obj);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetSubTranslationX(obj, values[0]);
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerSubtranslationY,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = POPLayerGetSubTranslationY(obj);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetSubTranslationY(obj, values[0]);
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerSubtranslationZ,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = POPLayerGetSubTranslationZ(obj);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetSubTranslationZ(obj, values[0]);
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerSubtranslationXY,
    ^(CALayer *obj, CGFloat values[]) {
      values_from_point(values, POPLayerGetSubTranslationXY(obj));
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetSubTranslationXY(obj, values_to_point(values));
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerZPosition,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = [obj zPosition];
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      [obj setZPosition:values[0]];
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerSize,
    ^(CALayer *obj, CGFloat values[]) {
      values_from_size(values, [obj bounds].size);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      CGSize size = values_to_size(values);
      if (size.width < 0. || size.height < 0.)
        return;

      CGRect b = [obj bounds];
      b.size = size;
      [obj setBounds:b];
    },
    kHPOPThresholdPoint
  },

  {kHPOPLayerRotation,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = POPLayerGetRotation(obj);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetRotation(obj, values[0]);
    },
    kHPOPThresholdRotation
  },

  {kHPOPLayerRotationY,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = POPLayerGetRotationY(obj);
    },
    ^(id obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetRotationY(obj, values[0]);
    },
    kHPOPThresholdRotation
  },

  {kHPOPLayerRotationX,
    ^(CALayer *obj, CGFloat values[]) {
      values[0] = POPLayerGetRotationX(obj);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetRotationX(obj, values[0]);
    },
    kHPOPThresholdRotation
  },

  {kHPOPLayerShadowColor,
    ^(CALayer *obj, CGFloat values[]) {
        POPCGColorGetRGBAComponents(obj.shadowColor, values);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
        CGColorRef color = POPCGColorRGBACreate(values);
        [obj setShadowColor:color];
        CGColorRelease(color);
    },
    0.01
  },

  {kHPOPLayerShadowOffset,
    ^(CALayer *obj, CGFloat values[]) {
        values_from_size(values, [obj shadowOffset]);
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
        CGSize size = values_to_size(values);
        [obj setShadowOffset:size];
    },
    0.01
  },

  {kHPOPLayerShadowOpacity,
    ^(CALayer *obj, CGFloat values[]) {
        values[0] = [obj shadowOpacity];
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
        [obj setShadowOpacity:values[0]];
    },
    kHPOPThresholdOpacity
  },

  {kHPOPLayerShadowRadius,
    ^(CALayer *obj, CGFloat values[]) {
        values[0] = [obj shadowRadius];
    },
    ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
        [obj setShadowRadius:values[0]];
    },
    kHPOPThresholdRadius
  },

#import "HPOPDefines.h"
#if HPOP_CODE_TRIM
  /* CAShapeLayer */

  {kHPOPShapeLayerStrokeStart,
    ^(CAShapeLayer *obj, CGFloat values[]) {
      values[0] = obj.strokeStart;
    },
    ^(CAShapeLayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.strokeStart = values[0];
    },
    0.01
  },

  {kHPOPShapeLayerStrokeEnd,
    ^(CAShapeLayer *obj, CGFloat values[]) {
      values[0] = obj.strokeEnd;
    },
    ^(CAShapeLayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.strokeEnd = values[0];
    },
    0.01
  },

  {kHPOPShapeLayerStrokeColor,
    ^(CAShapeLayer *obj, CGFloat values[]) {
        POPCGColorGetRGBAComponents(obj.strokeColor, values);
    },
    ^(CAShapeLayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
        CGColorRef color = POPCGColorRGBACreate(values);
        [obj setStrokeColor:color];
        CGColorRelease(color);
    },
    kHPOPThresholdColor
  },

  {kHPOPShapeLayerFillColor,
    ^(CAShapeLayer *obj, CGFloat values[]) {
        POPCGColorGetRGBAComponents(obj.fillColor, values);
    },
    ^(CAShapeLayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
        CGColorRef color = POPCGColorRGBACreate(values);
        [obj setFillColor:color];
        CGColorRelease(color);
    },
    kHPOPThresholdColor
  },

  {kHPOPShapeLayerLineWidth,
    ^(CAShapeLayer *obj, CGFloat values[]) {
        values[0] = obj.lineWidth;
    },
    ^(CAShapeLayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
        obj.lineWidth = values[0];
    },
    0.01
  },
    
    {kHPOPShapeLayerLineDashPhase,
        ^(CAShapeLayer *obj, CGFloat values[]) {
            values[0] = obj.lineDashPhase;
        },
        ^(CAShapeLayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
            obj.lineDashPhase = values[0];
        },
        0.01
    },

  {kHPOPLayoutConstraintConstant,
    ^(NSLayoutConstraint *obj, CGFloat values[]) {
      values[0] = obj.constant;
    },
    ^(NSLayoutConstraint *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.constant = values[0];
    },
    0.01
  },

#if TARGET_OS_IPHONE

  /* UIView */

  {kHPOPViewAlpha,
    ^(UIView *obj, CGFloat values[]) {
      values[0] = obj.alpha;
    },
    ^(UIView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.alpha = values[0];
    },
    kHPOPThresholdOpacity
  },

  {kHPOPViewBackgroundColor,
    ^(UIView *obj, CGFloat values[]) {
      POPUIColorGetRGBAComponents(obj.backgroundColor, values);
    },
    ^(UIView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.backgroundColor = POPUIColorRGBACreate(values);
    },
    kHPOPThresholdColor
  },

  {kHPOPViewCenter,
    ^(UIView *obj, CGFloat values[]) {
      values_from_point(values, obj.center);
    },
    ^(UIView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.center = values_to_point(values);
    },
    kHPOPThresholdPoint
  },

  {kHPOPViewFrame,
    ^(UIView *obj, CGFloat values[]) {
      values_from_rect(values, obj.frame);
    },
    ^(UIView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.frame = values_to_rect(values);
    },
    kHPOPThresholdPoint
  },

  {kHPOPViewScaleX,
    ^(UIView *obj, CGFloat values[]) {
      values[0] = POPLayerGetScaleX(obj.layer);
    },
    ^(UIView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetScaleX(obj.layer, values[0]);
    },
    kHPOPThresholdScale
  },

  {kHPOPViewScaleY,
    ^(UIView *obj, CGFloat values[]) {
      values[0] = POPLayerGetScaleY(obj.layer);
    },
    ^(UIView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetScaleY(obj.layer, values[0]);
    },
    kHPOPThresholdScale
  },

  {kHPOPViewScaleXY,
    ^(UIView *obj, CGFloat values[]) {
      values_from_point(values, POPLayerGetScaleXY(obj.layer));
    },
    ^(UIView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      POPLayerSetScaleXY(obj.layer, values_to_point(values));
    },
    kHPOPThresholdScale
  },

  {kHPOPViewTintColor,
    ^(UIView *obj, CGFloat values[]) {
      POPUIColorGetRGBAComponents(obj.tintColor, values);
    },
    ^(UIView *obj, const CGFloat values[], const CGFloat previousValues[]) {
        obj.tintColor = POPUIColorRGBACreate(values);
    },
    kHPOPThresholdColor
  },

  /* UIScrollView */

  {kHPOPScrollViewContentOffset,
    ^(UIScrollView *obj, CGFloat values[]) {
      values_from_point(values, obj.contentOffset);
    },
    ^(UIScrollView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      [obj setContentOffset:values_to_point(values) animated:NO];
    },
    kHPOPThresholdPoint
  },

  {kHPOPScrollViewContentSize,
    ^(UIScrollView *obj, CGFloat values[]) {
      values_from_size(values, obj.contentSize);
    },
    ^(UIScrollView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.contentSize = values_to_size(values);
    },
    kHPOPThresholdPoint
  },

  {kHPOPScrollViewZoomScale,
    ^(UIScrollView *obj, CGFloat values[]) {
      values[0]=obj.zoomScale;
    },
    ^(UIScrollView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.zoomScale=values[0];
    },
    kHPOPThresholdScale
  },

  {kHPOPScrollViewContentInset,
    ^(UIScrollView *obj, CGFloat values[]) {
      values[0] = obj.contentInset.top;
      values[1] = obj.contentInset.left;
      values[2] = obj.contentInset.bottom;
      values[3] = obj.contentInset.right;
    },
    ^(UIScrollView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.contentInset = values_to_edge_insets(values);
    },
    kHPOPThresholdPoint
  },

  {kHPOPScrollViewScrollIndicatorInsets,
    ^(UIScrollView *obj, CGFloat values[]) {
      values[0] = obj.scrollIndicatorInsets.top;
      values[1] = obj.scrollIndicatorInsets.left;
      values[2] = obj.scrollIndicatorInsets.bottom;
      values[3] = obj.scrollIndicatorInsets.right;
    },
    ^(UIScrollView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.scrollIndicatorInsets = values_to_edge_insets(values);
    },
    kHPOPThresholdPoint
  },

  /* UINavigationBar */

  {kHPOPNavigationBarBarTintColor,
    ^(UINavigationBar *obj, CGFloat values[]) {
      POPUIColorGetRGBAComponents(obj.barTintColor, values);
    },
    ^(UINavigationBar *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.barTintColor = POPUIColorRGBACreate(values);
    },
    kHPOPThresholdColor
  },

  /* UILabel */

  {kHPOPLabelTextColor,
    ^(UILabel *obj, CGFloat values[]) {
      POPUIColorGetRGBAComponents(obj.textColor, values);
    },
    ^(UILabel *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.textColor = POPUIColorRGBACreate(values);
    },
    kHPOPThresholdColor
  },

#else /* TARGET_OS_IPHONE */

  /* NSView */

  {kHPOPViewFrame,
    ^(NSView *obj, CGFloat values[]) {
      values_from_rect(values, NSRectToCGRect(obj.frame));
    },
    ^(NSView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.frame = NSRectFromCGRect(values_to_rect(values));
    },
    kHPOPThresholdPoint
  },

  {kHPOPViewBounds,
    ^(NSView *obj, CGFloat values[]) {
      values_from_rect(values, NSRectToCGRect(obj.frame));
    },
    ^(NSView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.bounds = NSRectFromCGRect(values_to_rect(values));
    },
    kHPOPThresholdPoint
  },

  {kHPOPViewAlphaValue,
    ^(NSView *obj, CGFloat values[]) {
      values[0] = obj.alphaValue;
    },
    ^(NSView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.alphaValue = values[0];
    },
    kHPOPThresholdOpacity
  },

  {kHPOPViewFrameRotation,
    ^(NSView *obj, CGFloat values[]) {
      values[0] = obj.frameRotation;
    },
    ^(NSView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.frameRotation = values[0];
    },
    kHPOPThresholdRotation
  },

  {kHPOPViewFrameCenterRotation,
    ^(NSView *obj, CGFloat values[]) {
      values[0] = obj.frameCenterRotation;
    },
    ^(NSView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.frameCenterRotation = values[0];
    },
    kHPOPThresholdRotation
  },

  {kHPOPViewBoundsRotation,
    ^(NSView *obj, CGFloat values[]) {
      values[0] = obj.boundsRotation;
    },
    ^(NSView *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.boundsRotation = values[0];
    },
    kHPOPThresholdRotation
  },

  /* NSWindow */

  {kHPOPWindowFrame,
    ^(NSWindow *obj, CGFloat values[]) {
      values_from_rect(values, NSRectToCGRect(obj.frame));
    },
    ^(NSWindow *obj, const CGFloat values[], const CGFloat previousValues[]) {
      [obj setFrame:NSRectFromCGRect(values_to_rect(values)) display:YES];
    },
    kHPOPThresholdPoint
  },

  {kHPOPWindowAlphaValue,
    ^(NSWindow *obj, CGFloat values[]) {
      values[0] = obj.alphaValue;
    },
    ^(NSWindow *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.alphaValue = values[0];
    },
    kHPOPThresholdOpacity
  },

  {kHPOPWindowBackgroundColor,
    ^(NSWindow *obj, CGFloat values[]) {
      POPNSColorGetRGBAComponents(obj.backgroundColor, values);
    },
    ^(NSWindow *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.backgroundColor = POPNSColorRGBACreate(values);
    },
    kHPOPThresholdColor
  },

#endif /* TARGET_OS_IPHONE */
#endif /* HPOP_CODE_TRIM */

#if SCENEKIT_SDK_AVAILABLE

  /* SceneKit */

  {kHPOPSCNNodePosition,
    ^(SCNNode *obj, CGFloat values[]) {
      values_from_vec3(values, obj.position);
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.position = values_to_vec3(values);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodePositionX,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.position.x;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.position = SCNVector3Make(values[0], obj.position.y, obj.position.z);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodePositionY,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.position.y;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.position = SCNVector3Make(obj.position.x, values[0], obj.position.z);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodePositionZ,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.position.z;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.position = SCNVector3Make(obj.position.x, obj.position.y, values[0]);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeTranslation,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.transform.m41;
      values[1] = obj.transform.m42;
      values[2] = obj.transform.m43;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.transform = SCNMatrix4MakeTranslation(values[0], values[1], values[2]);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeTranslationX,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.transform.m41;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.transform = SCNMatrix4MakeTranslation(values[0], obj.transform.m42, obj.transform.m43);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeTranslationY,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.transform.m42;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.transform = SCNMatrix4MakeTranslation(obj.transform.m41, values[0], obj.transform.m43);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeTranslationY,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.transform.m43;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.transform = SCNMatrix4MakeTranslation(obj.transform.m41, obj.transform.m42, values[0]);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeRotation,
    ^(SCNNode *obj, CGFloat values[]) {
      values_from_vec4(values, obj.rotation);
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.rotation = values_to_vec4(values);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeRotationX,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.rotation.x;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.rotation = SCNVector4Make(1.0, obj.rotation.y, obj.rotation.z, values[0]);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeRotationY,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.rotation.y;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.rotation = SCNVector4Make(obj.rotation.x, 1.0, obj.rotation.z, values[0]);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeRotationZ,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.rotation.z;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.rotation = SCNVector4Make(obj.rotation.x, obj.rotation.y, 1.0, values[0]);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeRotationW,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.rotation.w;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.rotation = SCNVector4Make(obj.rotation.x, obj.rotation.y, obj.rotation.z, values[0]);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeEulerAngles,
    ^(SCNNode *obj, CGFloat values[]) {
      values_from_vec3(values, obj.eulerAngles);
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.eulerAngles = values_to_vec3(values);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeEulerAnglesX,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.eulerAngles.x;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.eulerAngles = SCNVector3Make(values[0], obj.eulerAngles.y, obj.eulerAngles.z);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeEulerAnglesY,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.eulerAngles.y;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.eulerAngles = SCNVector3Make(obj.eulerAngles.x, values[0], obj.eulerAngles.z);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeEulerAnglesZ,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.eulerAngles.z;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.eulerAngles = SCNVector3Make(obj.eulerAngles.x, obj.eulerAngles.y, values[0]);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeOrientation,
    ^(SCNNode *obj, CGFloat values[]) {
      values_from_vec4(values, obj.orientation);
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.orientation = values_to_vec4(values);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeOrientationX,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.orientation.x;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.orientation = SCNVector4Make(values[0], obj.orientation.y, obj.orientation.z, obj.orientation.w);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeOrientationY,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.orientation.y;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.orientation = SCNVector4Make(obj.orientation.x, values[0], obj.orientation.z, obj.orientation.w);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeOrientationZ,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.orientation.z;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.orientation = SCNVector4Make(obj.orientation.x, obj.orientation.y, values[0], obj.orientation.w);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeOrientationW,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.orientation.w;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.orientation = SCNVector4Make(obj.orientation.x, obj.orientation.y, obj.orientation.z, values[0]);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeScale,
    ^(SCNNode *obj, CGFloat values[]) {
      values_from_vec3(values, obj.scale);
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.scale = values_to_vec3(values);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeScaleX,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.scale.x;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.scale = SCNVector3Make(values[0], obj.scale.y, obj.scale.z);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeScaleY,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.scale.y;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.position = SCNVector3Make(obj.scale.x, values[0], obj.scale.z);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeScaleZ,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.scale.z;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.scale = SCNVector3Make(obj.scale.x, obj.scale.y, values[0]);
    },
    kHPOPThresholdScale
  },

  {kHPOPSCNNodeScaleXY,
    ^(SCNNode *obj, CGFloat values[]) {
      values[0] = obj.scale.x;
      values[1] = obj.scale.y;
    },
    ^(SCNNode *obj, const CGFloat values[], const CGFloat previousValues[]) {
      obj.scale = SCNVector3Make(values[0], values[1], obj.scale.z);
    },
    kHPOPThresholdScale
  },

#endif

};
#pragma clang diagnostic pop

static NSUInteger staticIndexWithName(NSString *aName)
{
  NSUInteger idx = 0;

  while (idx < POP_ARRAY_COUNT(_staticStates)) {
    if ([_staticStates[idx].name isEqualToString:aName])
      return idx;
    idx++;
  }

  return NSNotFound;
}

/**
 Concrete static property class.
 */
@interface HPOPStaticAnimatableProperty : HPOPAnimatableProperty
{
@public
  POPStaticAnimatablePropertyState *_state;
}
@end

@implementation HPOPStaticAnimatableProperty

- (NSString *)name
{
  return _state->name;
}

- (HPOPAnimatablePropertyReadBlock)readBlock
{
  return _state->readBlock;
}

- (HPOPAnimatablePropertyWriteBlock)writeBlock
{
  return _state->writeBlock;
}

- (CGFloat)threshold
{
  return _state->threshold;
}

@end

#pragma mark - Concrete

/**
 Concrete immutable property class.
 */
@interface HPOPConcreteAnimatableProperty : HPOPAnimatableProperty
- (instancetype)initWithName:(NSString *)name readBlock:(HPOPAnimatablePropertyReadBlock)read writeBlock:(HPOPAnimatablePropertyWriteBlock)write threshold:(CGFloat)threshold;
@end

@implementation HPOPConcreteAnimatableProperty

// default synthesis
@synthesize name, readBlock, writeBlock, threshold;

- (instancetype)initWithName:(NSString *)aName readBlock:(HPOPAnimatablePropertyReadBlock)aReadBlock writeBlock:(HPOPAnimatablePropertyWriteBlock)aWriteBlock threshold:(CGFloat)aThreshold
{
  self = [super init];
  if (nil != self) {
    name = [aName copy];
    readBlock = [aReadBlock copy];
    writeBlock = [aWriteBlock copy];
    threshold = aThreshold;
  }
  return self;
}
@end

#pragma mark - Mutable

@implementation HPOPMutableAnimatableProperty

// default synthesis
@synthesize name, readBlock, writeBlock, threshold;

@end

#pragma mark - Cluster

/**
 Singleton placeholder property class to support class cluster.
 */
@interface HPOPPlaceholderAnimatableProperty : HPOPAnimatableProperty

@end

@implementation HPOPPlaceholderAnimatableProperty

// default synthesis
@synthesize name, readBlock, writeBlock, threshold;

@end

/**
 Cluster class.
 */
@implementation HPOPAnimatableProperty

// avoid creating backing ivars
@dynamic name, readBlock, writeBlock, threshold;

static HPOPAnimatableProperty *placeholder = nil;

+ (void)initialize
{
  if (self == [HPOPAnimatableProperty class]) {
    placeholder = [HPOPPlaceholderAnimatableProperty alloc];
  }
}

+ (id)allocWithZone:(struct _NSZone *)zone
{
  if (self == [HPOPAnimatableProperty class]) {
    if (nil == placeholder) {
      placeholder = [super allocWithZone:zone];
    }
    return placeholder;
  }
  return [super allocWithZone:zone];
}

- (id)copyWithZone:(NSZone *)zone
{
  if ([self isKindOfClass:[HPOPMutableAnimatableProperty class]]) {
    HPOPConcreteAnimatableProperty *copyProperty = [[HPOPConcreteAnimatableProperty alloc] initWithName:self.name readBlock:self.readBlock writeBlock:self.writeBlock threshold:self.threshold];
    return copyProperty;
  } else {
    return self;
  }
}

- (id)mutableCopyWithZone:(NSZone *)zone
{
  HPOPMutableAnimatableProperty *copyProperty = [[HPOPMutableAnimatableProperty alloc] init];
  copyProperty.name = self.name;
  copyProperty.readBlock = self.readBlock;
  copyProperty.writeBlock = self.writeBlock;
  copyProperty.threshold = self.threshold;
  return copyProperty;
}

+ (id)propertyWithName:(NSString *)aName
{
  return [self propertyWithName:aName initializer:NULL];
}

+ (id)propertyWithName:(NSString *)aName initializer:(void (^)(HPOPMutableAnimatableProperty *prop))aBlock
{
  HPOPAnimatableProperty *prop = nil;

  static NSMutableDictionary *_propertyDict = nil;
  if (nil == _propertyDict) {
    _propertyDict = [[NSMutableDictionary alloc] initWithCapacity:10];
  }

  prop = _propertyDict[aName];
  if (nil != prop) {
    return prop;
  }

  NSUInteger staticIdx = staticIndexWithName(aName);

  if (NSNotFound != staticIdx) {
    HPOPStaticAnimatableProperty *staticProp = [[HPOPStaticAnimatableProperty alloc] init];
    staticProp->_state = &_staticStates[staticIdx];
    _propertyDict[aName] = staticProp;
    prop = staticProp;
  } else if (NULL != aBlock) {
    HPOPMutableAnimatableProperty *mutableProp = [[HPOPMutableAnimatableProperty alloc] init];
    mutableProp.name = aName;
    mutableProp.threshold = 1.0;
    aBlock(mutableProp);
    prop = [mutableProp copy];
  }

  return prop;
}

- (NSString *)description
{
  NSMutableString *s = [NSMutableString stringWithFormat:@"%@ name:%@ threshold:%f", super.description, self.name, self.threshold];
  return s;
}

@end
