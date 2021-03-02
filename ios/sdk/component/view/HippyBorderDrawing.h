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

#import "HippyBorderStyle.h"

typedef struct {
    CGFloat topLeft;
    CGFloat topRight;
    CGFloat bottomLeft;
    CGFloat bottomRight;
} HippyCornerRadii;

typedef struct {
    CGSize topLeft;
    CGSize topRight;
    CGSize bottomLeft;
    CGSize bottomRight;
} HippyCornerInsets;

typedef struct {
    CGColorRef top;
    CGColorRef left;
    CGColorRef bottom;
    CGColorRef right;
} HippyBorderColors;

/**
 * Determine if the border widths, colors and radii are all equal.
 */
BOOL HippyBorderInsetsAreEqual(UIEdgeInsets borderInsets);
BOOL HippyCornerRadiiAreEqual(HippyCornerRadii cornerRadii);
BOOL HippyBorderColorsAreEqual(HippyBorderColors borderColors);

/**
 * Convert HippyCornerRadii to HippyCornerInsets by applying border insets.
 * Effectively, returns radius - inset, with a lower bound of 0.0.
 */
HippyCornerInsets HippyGetCornerInsets(HippyCornerRadii cornerRadii, UIEdgeInsets borderInsets);

/**
 * Create a CGPath representing a rounded rectangle with the specified bounds
 * and corner insets. Note that the CGPathRef must be released by the caller.
 */
CGPathRef HippyPathCreateWithRoundedRect(CGRect bounds, HippyCornerInsets cornerInsets, const CGAffineTransform *transform);

/**
 * Draw a CSS-compliant border as an image. You can determine if it's scalable
 * by inspecting the image's `capInsets`.
 *
 * `borderInsets` defines the border widths for each edge.
 */
UIImage *HippyGetBorderImage(HippyBorderStyle borderStyle, CGSize viewSize, HippyCornerRadii cornerRadii, UIEdgeInsets borderInsets,
    HippyBorderColors borderColors, CGColorRef backgroundColor, BOOL drawToEdge);
