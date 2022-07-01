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
#import "NativeRenderDefines.h"

typedef struct {
    CGFloat topLeft;
    CGFloat topRight;
    CGFloat bottomLeft;
    CGFloat bottomRight;
} NativeRenderCornerRadii;

typedef struct {
    CGSize topLeft;
    CGSize topRight;
    CGSize bottomLeft;
    CGSize bottomRight;
} NativeRenderCornerInsets;

typedef struct {
    CGColorRef top;
    CGColorRef left;
    CGColorRef bottom;
    CGColorRef right;
} NativeRenderBorderColors;

/**
 * Determine if the border widths, colors and radii are all equal.
 */
NATIVE_RENDER_EXTERN BOOL NativeRenderBorderInsetsAreEqual(UIEdgeInsets borderInsets);
NATIVE_RENDER_EXTERN BOOL NativeRenderCornerRadiiAreEqual(NativeRenderCornerRadii cornerRadii);
NATIVE_RENDER_EXTERN BOOL NativeRenderBorderColorsAreEqual(NativeRenderBorderColors borderColors);

/**
 * Convert NativeRenderCornerRadii to NativeRenderCornerInsets by applying border insets.
 * Effectively, returns radius - inset, with a lower bound of 0.0.
 */
NATIVE_RENDER_EXTERN NativeRenderCornerInsets NativeRenderGetCornerInsets(NativeRenderCornerRadii cornerRadii, UIEdgeInsets borderInsets);

/**
 * Create a CGPath representing a rounded rectangle with the specified bounds
 * and corner insets. Note that the CGPathRef must be released by the caller.
 */
NATIVE_RENDER_EXTERN CGPathRef NativeRenderPathCreateWithRoundedRect(CGRect bounds, NativeRenderCornerInsets cornerInsets, const CGAffineTransform *transform);

/**
 * Draw a CSS-compliant border as an image. You can determine if it's scalable
 * by inspecting the image's `capInsets`.
 *
 * `borderInsets` defines the border widths for each edge.
 */
NATIVE_RENDER_EXTERN UIImage *NativeRenderGetBorderImage(NativeRenderBorderStyle borderStyle, CGSize viewSize, NativeRenderCornerRadii cornerRadii, UIEdgeInsets borderInsets,
    NativeRenderBorderColors borderColors, CGColorRef backgroundColor, BOOL drawToEdge, BOOL drawBackgroundColor);

NATIVE_RENDER_EXTERN CGPathRef NativeRenderPathCreateOuterOutline(BOOL drawToEdge, CGRect rect, NativeRenderCornerRadii cornerRadii);
