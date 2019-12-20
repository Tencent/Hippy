/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
HippyCornerInsets HippyGetCornerInsets(HippyCornerRadii cornerRadii,
                                   UIEdgeInsets borderInsets);

/**
 * Create a CGPath representing a rounded rectangle with the specified bounds
 * and corner insets. Note that the CGPathRef must be released by the caller.
 */
CGPathRef HippyPathCreateWithRoundedRect(CGRect bounds,
                                       HippyCornerInsets cornerInsets,
                                       const CGAffineTransform *transform);

/**
 * Draw a CSS-compliant border as an image. You can determine if it's scalable
 * by inspecting the image's `capInsets`.
 *
 * `borderInsets` defines the border widths for each edge.
 */
UIImage *HippyGetBorderImage(HippyBorderStyle borderStyle,
                           CGSize viewSize,
                           HippyCornerRadii cornerRadii,
                           UIEdgeInsets borderInsets,
                           HippyBorderColors borderColors,
                           CGColorRef backgroundColor,
                           BOOL drawToEdge);
