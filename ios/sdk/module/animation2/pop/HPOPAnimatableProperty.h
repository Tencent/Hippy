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

#import <CoreGraphics/CoreGraphics.h>

#import <Foundation/NSObject.h>

#import "HPOPDefines.h"
#import "HPOPAnimatablePropertyTypes.h"

@class HPOPMutableAnimatableProperty;

/**
 @abstract Describes an animatable property.
 */
@interface HPOPAnimatableProperty : NSObject <NSCopying, NSMutableCopying>

/**
 @abstract Property accessor.
 @param name The name of the property.
 @return The animatable property with that name or nil if it does not exist.
 @discussion Common animatable properties are included by default. Use the provided constants to reference.
 */
+ (id)propertyWithName:(NSString *)name;

/**
 @abstract The designated initializer.
 @param name The name of the property.
 @param block The block used to configure the property on creation.
 @return The animatable property with name if it exists, otherwise a newly created instance configured by block.
 @discussion Custom properties should use reverse-DNS naming. A newly created instance is only mutable in the scope of block. Once constructed, a property becomes immutable.
 */
+ (id)propertyWithName:(NSString *)name initializer:(void (^)(HPOPMutableAnimatableProperty *prop))block;

/**
 @abstract The name of the property.
 @discussion Used to uniquely identify an animatable property.
 */
@property (readonly, nonatomic, copy) NSString *name;

/**
 @abstract Block used to read values from a property into an array of floats.
 */
@property (readonly, nonatomic, copy) HPOPAnimatablePropertyReadBlock readBlock;

/**
 @abstract Block used to write values from an array of floats into a property.
 */
@property (readonly, nonatomic, copy) HPOPAnimatablePropertyWriteBlock writeBlock;

/**
 @abstract The threshold value used when determining completion of dynamics simulations.
 */
@property (readonly, nonatomic, assign) CGFloat threshold;

@end

/**
 @abstract A mutable animatable property intended for configuration.
 */
@interface HPOPMutableAnimatableProperty : HPOPAnimatableProperty

/**
 @abstract A read-write version of HPOPAnimatableProperty name property.
 */
@property (readwrite, nonatomic, copy) NSString *name;

/**
 @abstract A read-write version of HPOPAnimatableProperty readBlock property.
 */
@property (readwrite, nonatomic, copy) HPOPAnimatablePropertyReadBlock readBlock;

/**
 @abstract A read-write version of HPOPAnimatableProperty writeBlock property.
 */
@property (readwrite, nonatomic, copy) HPOPAnimatablePropertyWriteBlock writeBlock;

/**
 @abstract A read-write version of HPOPAnimatableProperty threshold property.
 */
@property (readwrite, nonatomic, assign) CGFloat threshold;

@end

POP_EXTERN_C_BEGIN

/**
 Common CALayer property names.
 */
extern NSString * const kHPOPLayerBackgroundColor;
extern NSString * const kHPOPLayerBounds;
extern NSString * const kHPOPLayerCornerRadius;
extern NSString * const kHPOPLayerBorderWidth;
extern NSString * const kHPOPLayerBorderColor;
extern NSString * const kHPOPLayerOpacity;
extern NSString * const kHPOPLayerPosition;
extern NSString * const kHPOPLayerPositionX;
extern NSString * const kHPOPLayerPositionY;
extern NSString * const kHPOPLayerRotation;
extern NSString * const kHPOPLayerRotationX;
extern NSString * const kHPOPLayerRotationY;
extern NSString * const kHPOPLayerScaleX;
extern NSString * const kHPOPLayerScaleXY;
extern NSString * const kHPOPLayerScaleY;
extern NSString * const kHPOPLayerSize;
extern NSString * const kHPOPLayerSubscaleXY;
extern NSString * const kHPOPLayerSubtranslationX;
extern NSString * const kHPOPLayerSubtranslationXY;
extern NSString * const kHPOPLayerSubtranslationY;
extern NSString * const kHPOPLayerSubtranslationZ;
extern NSString * const kHPOPLayerTranslationX;
extern NSString * const kHPOPLayerTranslationXY;
extern NSString * const kHPOPLayerTranslationY;
extern NSString * const kHPOPLayerTranslationZ;
extern NSString * const kHPOPLayerZPosition;
extern NSString * const kHPOPLayerShadowColor;
extern NSString * const kHPOPLayerShadowOffset;
extern NSString * const kHPOPLayerShadowOpacity;
extern NSString * const kHPOPLayerShadowRadius;


#import "HPOPDefines.h"
#if HPOP_CODE_TRIM

/**
 Common CAShapeLayer property names.
 */
extern NSString * const kHPOPShapeLayerStrokeStart;
extern NSString * const kHPOPShapeLayerStrokeEnd;
extern NSString * const kHPOPShapeLayerStrokeColor;
extern NSString * const kHPOPShapeLayerFillColor;
extern NSString * const kHPOPShapeLayerLineWidth;
extern NSString * const kHPOPShapeLayerLineDashPhase;

/**
 Common NSLayoutConstraint property names.
 */
extern NSString * const kHPOPLayoutConstraintConstant;


#if TARGET_OS_IPHONE

/**
 Common UIView property names.
 */
extern NSString * const kHPOPViewAlpha;
extern NSString * const kHPOPViewBackgroundColor;
extern NSString * const kHPOPViewBounds;
extern NSString * const kHPOPViewCenter;
extern NSString * const kHPOPViewFrame;
extern NSString * const kHPOPViewScaleX;
extern NSString * const kHPOPViewScaleXY;
extern NSString * const kHPOPViewScaleY;
extern NSString * const kHPOPViewSize;
extern NSString * const kHPOPViewTintColor;

/**
 Common UIScrollView property names.
 */
extern NSString * const kHPOPScrollViewContentOffset;
extern NSString * const kHPOPScrollViewContentSize;
extern NSString * const kHPOPScrollViewZoomScale;
extern NSString * const kHPOPScrollViewContentInset;
extern NSString * const kHPOPScrollViewScrollIndicatorInsets;

/**
 Common UITableView property names.
 */
extern NSString * const kHPOPTableViewContentOffset;
extern NSString * const kHPOPTableViewContentSize;

/**
 Common UICollectionView property names.
 */
extern NSString * const kHPOPCollectionViewContentOffset;
extern NSString * const kHPOPCollectionViewContentSize;

/**
 Common UINavigationBar property names.
 */
extern NSString * const kHPOPNavigationBarBarTintColor;

/**
 Common UIToolbar property names.
 */
extern NSString * const kHPOPToolbarBarTintColor;

/**
 Common UITabBar property names.
 */
extern NSString * const kHPOPTabBarBarTintColor;

/**
 Common UILabel property names.
 */
extern NSString * const kHPOPLabelTextColor;

#else /* TARGET_OS_IPHONE */

/**
 Common NSView property names.
 */
extern NSString * const kHPOPViewFrame;
extern NSString * const kHPOPViewBounds;
extern NSString * const kHPOPViewAlphaValue;
extern NSString * const kHPOPViewFrameRotation;
extern NSString * const kHPOPViewFrameCenterRotation;
extern NSString * const kHPOPViewBoundsRotation;

/**
 Common NSWindow property names.
 */
extern NSString * const kHPOPWindowFrame;
extern NSString * const kHPOPWindowAlphaValue;
extern NSString * const kHPOPWindowBackgroundColor;

#endif /* TARGET_OS_IPHONE */
#endif /* HPOP_CODE_TRIM */

#if SCENEKIT_SDK_AVAILABLE

/**
 Common SceneKit property names.
 */
extern NSString * const kHPOPSCNNodePosition;
extern NSString * const kHPOPSCNNodePositionX;
extern NSString * const kHPOPSCNNodePositionY;
extern NSString * const kHPOPSCNNodePositionZ;
extern NSString * const kHPOPSCNNodeTranslation;
extern NSString * const kHPOPSCNNodeTranslationX;
extern NSString * const kHPOPSCNNodeTranslationY;
extern NSString * const kHPOPSCNNodeTranslationZ;
extern NSString * const kHPOPSCNNodeRotation;
extern NSString * const kHPOPSCNNodeRotationX;
extern NSString * const kHPOPSCNNodeRotationY;
extern NSString * const kHPOPSCNNodeRotationZ;
extern NSString * const kHPOPSCNNodeRotationW;
extern NSString * const kHPOPSCNNodeEulerAngles;
extern NSString * const kHPOPSCNNodeEulerAnglesX;
extern NSString * const kHPOPSCNNodeEulerAnglesY;
extern NSString * const kHPOPSCNNodeEulerAnglesZ;
extern NSString * const kHPOPSCNNodeOrientation;
extern NSString * const kHPOPSCNNodeOrientationX;
extern NSString * const kHPOPSCNNodeOrientationY;
extern NSString * const kHPOPSCNNodeOrientationZ;
extern NSString * const kHPOPSCNNodeOrientationW;
extern NSString * const kHPOPSCNNodeScale;
extern NSString * const kHPOPSCNNodeScaleX;
extern NSString * const kHPOPSCNNodeScaleY;
extern NSString * const kHPOPSCNNodeScaleZ;
extern NSString * const kHPOPSCNNodeScaleXY;

#endif

POP_EXTERN_C_END
