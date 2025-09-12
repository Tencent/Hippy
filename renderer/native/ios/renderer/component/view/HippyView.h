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

#import <UIKit/UIKit.h>
#import "HippyComponent.h"
#import "NativeRenderTouchesView.h"
#import "HippyViewInnerLayer.h"

@class HippyGradientObject;

NS_ASSUME_NONNULL_BEGIN

@interface HippyView : NativeRenderTouchesView

/**
 * z-index, used to override sibling order in didUpdateHippySubviews. This is
 * inherited from UIView+Hippy, but we override it here to reduce the boxing
 * and associated object overheads.
 */
@property (nonatomic, assign) NSInteger hippyZIndex;

@property (nonatomic, assign) CGFloat shadowSpread;
@property (nonatomic, assign) BOOL isShadowInset;
@property (nonatomic, assign) BOOL isUseNewShadow;
@property (nonatomic, strong) HippyViewInnerLayer *innerShadowLayer;

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 260000
/// iOS 26+ Liquid Glass Effect
@property (nonatomic, assign) BOOL glassEffectEnabled;
/// iOS 26+ Liquid Glass Effect Interactive
@property (nonatomic, assign) BOOL glassEffectInteractive;
/// iOS 26+ Liquid Glass Effect Color
@property (nonatomic, strong) UIColor *glassEffectTintColor;
/// iOS 26+ Liquid Glass Effect Container Spacing
@property (nonatomic, strong) NSNumber *glassEffectContainerSpacing;
/// iOS 26+ Liquid Glass Effect Style (Regular/Clear)
@property (nonatomic, strong) NSString *glassEffectStyle;
#endif

/**
 * get content for layer
 * return YES if getting content synchronized,else return NO
 */
- (BOOL)getLayerContentForColor:(nullable UIColor *)color completionBlock:(void (^)(UIImage *_Nullable))contentBlock;

/**
 * CALayerContents Filter
 * Default is kCAFilterLinear for minificationFilter and kCAFilterNearest for magnificationFilter
 */
- (CALayerContentsFilter)minificationFilter;
- (CALayerContentsFilter)magnificationFilter;


#pragma mark - Border Related

/**
 * Border radii.
 */
@property (nonatomic, assign) CGFloat borderRadius;
@property (nonatomic, assign) CGFloat borderTopLeftRadius;
@property (nonatomic, assign) CGFloat borderTopRightRadius;
@property (nonatomic, assign) CGFloat borderBottomLeftRadius;
@property (nonatomic, assign) CGFloat borderBottomRightRadius;

/**
 * Border colors (actually retained).
 */
@property (nonatomic, strong) UIColor *borderTopColor;
@property (nonatomic, strong) UIColor *borderRightColor;
@property (nonatomic, strong) UIColor *borderBottomColor;
@property (nonatomic, strong) UIColor *borderLeftColor;
@property (nonatomic, strong) UIColor *borderColor;

/**
 * Border widths.
 */
@property (nonatomic, assign) CGFloat borderTopWidth;
@property (nonatomic, assign) CGFloat borderRightWidth;
@property (nonatomic, assign) CGFloat borderBottomWidth;
@property (nonatomic, assign) CGFloat borderLeftWidth;
@property (nonatomic, assign) CGFloat borderWidth;

/**
 * Border styles.
 */
@property (nonatomic, assign) HippyBorderStyle borderStyle;


#pragma mark - Background Styles

/// The backgroundImage
@property (nonatomic, strong, nullable) UIImage * backgroundImage;

/// Hash value of Background Image Path,
/// Used to eliminate duplication and ensure timing when updating images.
@property (nonatomic, assign) NSUInteger backgroundImageUrlHash;

/// The fail error of background image if any
@property (nonatomic, strong, nullable) NSError *backgroundImageFailError;

@property (nonatomic, strong) NSString *backgroundSize;
@property (nonatomic, assign) CGFloat backgroundPositionX;
@property (nonatomic, assign) CGFloat backgroundPositionY;
@property (nonatomic, strong) HippyGradientObject *gradientObject;


@end

NS_ASSUME_NONNULL_END
