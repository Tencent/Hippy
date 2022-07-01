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

#import <UIKit/UIKit.h>

#import "NativeRenderBorderStyle.h"
#import "NativeRenderComponentProtocol.h"
#import "NativeRenderPointerEvents.h"
#import "NativeRenderTouchesView.h"

@protocol NativeRenderAutoInsetsProtocol;

@class NativeRenderGradientObject;

@interface NativeRenderView : NativeRenderTouchesView

/**
 * Used to control how touch events are processed.
 */
@property (nonatomic, assign) NativeRenderPointerEvents pointerEvents;

+ (void)autoAdjustInsetsForView:(UIView<NativeRenderAutoInsetsProtocol> *)parentView
                 withScrollView:(UIScrollView *)scrollView
                   updateOffset:(BOOL)updateOffset;

/**
 * Find the first view controller whose view, or any subview is the specified view.
 */
+ (UIEdgeInsets)contentInsetsForView:(UIView *)curView;

/**
 * z-index, used to override sibling order in didUpdateHippySubviews. This is
 * inherited from UIView+NativeRender, but we override it here to reduce the boxing
 * and associated object overheads.
 */
@property (nonatomic, assign) NSInteger hippyZIndex;

@property (nonatomic, assign) CGFloat shadowSpread;

/**
 * get content for layer
 * return YES if getting content synchronized,else return NO
 */
- (BOOL)getLayerContentForColor:(UIColor *)color completionBlock:(void (^)(UIImage *))contentBlock;

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
@property (nonatomic, assign) CGColorRef borderTopColor;
@property (nonatomic, assign) CGColorRef borderRightColor;
@property (nonatomic, assign) CGColorRef borderBottomColor;
@property (nonatomic, assign) CGColorRef borderLeftColor;
@property (nonatomic, assign) CGColorRef borderColor;

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
@property (nonatomic, assign) NativeRenderBorderStyle borderStyle;

/**
 * BackgroundImage styles.
 */
@property(nonatomic, strong) UIImage *backgroundImage;
@property (nonatomic, strong) NSString *backgroundSize;
@property (nonatomic, assign) CGFloat backgroundPositionX;
@property (nonatomic, assign) CGFloat backgroundPositionY;
@property (nonatomic, strong) NativeRenderGradientObject *gradientObject;
@end
