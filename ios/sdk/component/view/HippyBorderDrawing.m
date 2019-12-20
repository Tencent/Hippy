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

#import "HippyBorderDrawing.h"
#import "HippyLog.h"

static const CGFloat HippyViewBorderThreshold = 0.001;

BOOL HippyBorderInsetsAreEqual(UIEdgeInsets borderInsets)
{
  return
  ABS(borderInsets.left - borderInsets.right) < HippyViewBorderThreshold &&
  ABS(borderInsets.left - borderInsets.bottom) < HippyViewBorderThreshold &&
  ABS(borderInsets.left - borderInsets.top) < HippyViewBorderThreshold;
}

BOOL HippyCornerRadiiAreEqual(HippyCornerRadii cornerRadii)
{
  return
  ABS(cornerRadii.topLeft - cornerRadii.topRight) < HippyViewBorderThreshold &&
  ABS(cornerRadii.topLeft - cornerRadii.bottomLeft) < HippyViewBorderThreshold &&
  ABS(cornerRadii.topLeft - cornerRadii.bottomRight) < HippyViewBorderThreshold;
}

BOOL HippyBorderColorsAreEqual(HippyBorderColors borderColors)
{
  return
  CGColorEqualToColor(borderColors.left, borderColors.right) &&
  CGColorEqualToColor(borderColors.left, borderColors.top) &&
  CGColorEqualToColor(borderColors.left, borderColors.bottom);
}

HippyCornerInsets HippyGetCornerInsets(HippyCornerRadii cornerRadii,
                                   UIEdgeInsets edgeInsets)
{
  return (HippyCornerInsets) {
    {
      MAX(0, cornerRadii.topLeft - edgeInsets.left),
      MAX(0, cornerRadii.topLeft - edgeInsets.top),
    },
    {
      MAX(0, cornerRadii.topRight - edgeInsets.right),
      MAX(0, cornerRadii.topRight - edgeInsets.top),
    },
    {
      MAX(0, cornerRadii.bottomLeft - edgeInsets.left),
      MAX(0, cornerRadii.bottomLeft - edgeInsets.bottom),
    },
    {
      MAX(0, cornerRadii.bottomRight - edgeInsets.right),
      MAX(0, cornerRadii.bottomRight - edgeInsets.bottom),
    }
  };
}

static void HippyPathAddEllipticArc(CGMutablePathRef path,
                                  const CGAffineTransform *m,
                                  CGPoint origin,
                                  CGSize size,
                                  CGFloat startAngle,
                                  CGFloat endAngle,
                                  BOOL clockwise)
{
  CGFloat xScale = 1, yScale = 1, radius = 0;
  if (size.width != 0) {
    xScale = 1;
    yScale = size.height / size.width;
    radius = size.width;
  } else if (size.height != 0) {
    xScale = size.width / size.height;
    yScale = 1;
    radius = size.height;
  }

  CGAffineTransform t = CGAffineTransformMakeTranslation(origin.x, origin.y);
  t = CGAffineTransformScale(t, xScale, yScale);
  if (m != NULL) {
    t = CGAffineTransformConcat(t, *m);
  }

  CGPathAddArc(path, &t, 0, 0, radius, startAngle, endAngle, clockwise);
}

CGPathRef HippyPathCreateWithRoundedRect(CGRect bounds,
                                       HippyCornerInsets cornerInsets,
                                       const CGAffineTransform *transform)
{
  const CGFloat minX = CGRectGetMinX(bounds);
  const CGFloat minY = CGRectGetMinY(bounds);
  const CGFloat maxX = CGRectGetMaxX(bounds);
  const CGFloat maxY = CGRectGetMaxY(bounds);

  const CGSize topLeft = {
    MAX(0, MIN(cornerInsets.topLeft.width, bounds.size.width - cornerInsets.topRight.width)),
    MAX(0, MIN(cornerInsets.topLeft.height, bounds.size.height - cornerInsets.bottomLeft.height)),
  };
  const CGSize topRight = {
    MAX(0, MIN(cornerInsets.topRight.width, bounds.size.width - cornerInsets.topLeft.width)),
    MAX(0, MIN(cornerInsets.topRight.height, bounds.size.height - cornerInsets.bottomRight.height)),
  };
  const CGSize bottomLeft = {
    MAX(0, MIN(cornerInsets.bottomLeft.width, bounds.size.width - cornerInsets.bottomRight.width)),
    MAX(0, MIN(cornerInsets.bottomLeft.height, bounds.size.height - cornerInsets.topLeft.height)),
  };
  const CGSize bottomRight = {
    MAX(0, MIN(cornerInsets.bottomRight.width, bounds.size.width - cornerInsets.bottomLeft.width)),
    MAX(0, MIN(cornerInsets.bottomRight.height, bounds.size.height - cornerInsets.topRight.height)),
  };

  CGMutablePathRef path = CGPathCreateMutable();
  HippyPathAddEllipticArc(path, transform, (CGPoint){
    minX + topLeft.width, minY + topLeft.height
  }, topLeft, M_PI, 3 * M_PI_2, NO);
  HippyPathAddEllipticArc(path, transform, (CGPoint){
    maxX - topRight.width, minY + topRight.height
  }, topRight, 3 * M_PI_2, 0, NO);
  HippyPathAddEllipticArc(path, transform, (CGPoint){
    maxX - bottomRight.width, maxY - bottomRight.height
  }, bottomRight, 0, M_PI_2, NO);
  HippyPathAddEllipticArc(path, transform, (CGPoint){
    minX + bottomLeft.width, maxY - bottomLeft.height
  }, bottomLeft, M_PI_2, M_PI, NO);
  CGPathCloseSubpath(path);
  return path;
}

static void HippyEllipseGetIntersectionsWithLine(CGRect ellipseBounds,
                                               CGPoint lineStart,
                                               CGPoint lineEnd,
                                               CGPoint intersections[2])
{
  const CGPoint ellipseCenter = {
    CGRectGetMidX(ellipseBounds),
    CGRectGetMidY(ellipseBounds)
  };

  lineStart.x -= ellipseCenter.x;
  lineStart.y -= ellipseCenter.y;
  lineEnd.x -= ellipseCenter.x;
  lineEnd.y -= ellipseCenter.y;

  const CGFloat m = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x);
  const CGFloat a = ellipseBounds.size.width / 2;
  const CGFloat b = ellipseBounds.size.height / 2;
  const CGFloat c = lineStart.y - m * lineStart.x;
  const CGFloat A = (b * b + a * a * m * m);
  const CGFloat B = 2 * a * a * c * m;
  const CGFloat D = sqrt((a * a * (b * b - c * c)) / A + pow(B / (2 * A), 2));

  const CGFloat x_ = -B / (2 * A);
  const CGFloat x1 = x_ + D;
  const CGFloat x2 = x_ - D;
  const CGFloat y1 = m * x1 + c;
  const CGFloat y2 = m * x2 + c;

  intersections[0] = (CGPoint){x1 + ellipseCenter.x, y1 + ellipseCenter.y};
  intersections[1] = (CGPoint){x2 + ellipseCenter.x, y2 + ellipseCenter.y};
}

NS_INLINE BOOL HippyCornerRadiiAreAboveThreshold(HippyCornerRadii cornerRadii) {
  return (cornerRadii.topLeft > HippyViewBorderThreshold ||
    cornerRadii.topRight > HippyViewBorderThreshold      ||
    cornerRadii.bottomLeft > HippyViewBorderThreshold    ||
    cornerRadii.bottomRight > HippyViewBorderThreshold);
}

static CGPathRef HippyPathCreateOuterOutline(BOOL drawToEdge, CGRect rect, HippyCornerRadii cornerRadii) {
  if (drawToEdge) {
    return CGPathCreateWithRect(rect, NULL);
  }

  return HippyPathCreateWithRoundedRect(rect, HippyGetCornerInsets(cornerRadii, UIEdgeInsetsZero), NULL);
}

static CGContextRef HippyUIGraphicsBeginImageContext(CGSize size, CGColorRef backgroundColor, BOOL hasCornerRadii, BOOL drawToEdge) {
  const CGFloat alpha = CGColorGetAlpha(backgroundColor);
  const BOOL opaque = (drawToEdge || !hasCornerRadii) && alpha == 1.0;
  UIGraphicsBeginImageContextWithOptions(size, opaque, 0.0);
  return UIGraphicsGetCurrentContext();
}

static UIImage *HippyGetSolidBorderImage(HippyCornerRadii cornerRadii,
                                       CGSize viewSize,
                                       UIEdgeInsets borderInsets,
                                       HippyBorderColors borderColors,
                                       CGColorRef backgroundColor,
                                       BOOL drawToEdge)
{
  const BOOL hasCornerRadii = HippyCornerRadiiAreAboveThreshold(cornerRadii);
  const HippyCornerInsets cornerInsets = HippyGetCornerInsets(cornerRadii, borderInsets);

  const BOOL makeStretchable =
  (borderInsets.left + cornerInsets.topLeft.width +
   borderInsets.right + cornerInsets.bottomRight.width <= viewSize.width) &&
  (borderInsets.left + cornerInsets.bottomLeft.width +
   borderInsets.right + cornerInsets.topRight.width <= viewSize.width) &&
  (borderInsets.top + cornerInsets.topLeft.height +
   borderInsets.bottom + cornerInsets.bottomRight.height <= viewSize.height) &&
  (borderInsets.top + cornerInsets.topRight.height +
   borderInsets.bottom + cornerInsets.bottomLeft.height <= viewSize.height);

  const UIEdgeInsets edgeInsets = (UIEdgeInsets){
    borderInsets.top + MAX(cornerInsets.topLeft.height, cornerInsets.topRight.height),
    borderInsets.left + MAX(cornerInsets.topLeft.width, cornerInsets.bottomLeft.width),
    borderInsets.bottom + MAX(cornerInsets.bottomLeft.height, cornerInsets.bottomRight.height),
    borderInsets.right + MAX(cornerInsets.bottomRight.width, cornerInsets.topRight.width)
  };

  const CGSize size = makeStretchable ? (CGSize){
    // 1pt for the middle stretchable area along each axis
    edgeInsets.left + 1 + edgeInsets.right,
    edgeInsets.top + 1 + edgeInsets.bottom
  } : viewSize;

  CGContextRef ctx = HippyUIGraphicsBeginImageContext(size, backgroundColor, hasCornerRadii, drawToEdge);
  const CGRect rect = {.size = size};
  CGPathRef path = HippyPathCreateOuterOutline(drawToEdge, rect, cornerRadii);

  if (backgroundColor) {
    CGContextSetFillColorWithColor(ctx, backgroundColor);
    CGContextAddPath(ctx, path);
    CGContextFillPath(ctx);
  }

  CGContextAddPath(ctx, path);
  CGPathRelease(path);

  CGPathRef insetPath = HippyPathCreateWithRoundedRect(UIEdgeInsetsInsetRect(rect, borderInsets), cornerInsets, NULL);

  CGContextAddPath(ctx, insetPath);
  CGContextEOClip(ctx);

  BOOL hasEqualColors = HippyBorderColorsAreEqual(borderColors);
  if ((drawToEdge || !hasCornerRadii) && hasEqualColors) {

    CGContextSetFillColorWithColor(ctx, borderColors.left);
    CGContextAddRect(ctx, rect);
    CGContextAddPath(ctx, insetPath);
    CGContextEOFillPath(ctx);

  } else {

    CGPoint topLeft = (CGPoint){borderInsets.left, borderInsets.top};
    if (cornerInsets.topLeft.width > 0 && cornerInsets.topLeft.height > 0) {
      CGPoint points[2];
      HippyEllipseGetIntersectionsWithLine((CGRect){
        topLeft, {2 * cornerInsets.topLeft.width, 2 * cornerInsets.topLeft.height}
      }, CGPointZero, topLeft, points);
      if (!isnan(points[1].x) && !isnan(points[1].y)) {
        topLeft = points[1];
      }
    }

    CGPoint bottomLeft = (CGPoint){borderInsets.left, size.height - borderInsets.bottom};
    if (cornerInsets.bottomLeft.width > 0 && cornerInsets.bottomLeft.height > 0) {
      CGPoint points[2];
      HippyEllipseGetIntersectionsWithLine((CGRect){
        {bottomLeft.x, bottomLeft.y - 2 * cornerInsets.bottomLeft.height},
        {2 * cornerInsets.bottomLeft.width, 2 * cornerInsets.bottomLeft.height}
      }, (CGPoint){0, size.height}, bottomLeft, points);
      if (!isnan(points[1].x) && !isnan(points[1].y)) {
        bottomLeft = points[1];
      }
    }

    CGPoint topRight = (CGPoint){size.width - borderInsets.right, borderInsets.top};
    if (cornerInsets.topRight.width > 0 && cornerInsets.topRight.height > 0) {
      CGPoint points[2];
      HippyEllipseGetIntersectionsWithLine((CGRect){
        {topRight.x - 2 * cornerInsets.topRight.width, topRight.y},
        {2 * cornerInsets.topRight.width, 2 * cornerInsets.topRight.height}
      }, (CGPoint){size.width, 0}, topRight, points);
      if (!isnan(points[0].x) && !isnan(points[0].y)) {
        topRight = points[0];
      }
    }

    CGPoint bottomRight = (CGPoint){size.width - borderInsets.right, size.height - borderInsets.bottom};
    if (cornerInsets.bottomRight.width > 0 && cornerInsets.bottomRight.height > 0) {
      CGPoint points[2];
      HippyEllipseGetIntersectionsWithLine((CGRect){
        {bottomRight.x - 2 * cornerInsets.bottomRight.width, bottomRight.y - 2 * cornerInsets.bottomRight.height},
        {2 * cornerInsets.bottomRight.width, 2 * cornerInsets.bottomRight.height}
      }, (CGPoint){size.width, size.height}, bottomRight, points);
      if (!isnan(points[0].x) && !isnan(points[0].y)) {
        bottomRight = points[0];
      }
    }

    CGColorRef currentColor = NULL;

    // RIGHT
    if (borderInsets.right > 0) {

      const CGPoint points[] = {
        (CGPoint){size.width, 0},
        topRight,
        bottomRight,
        (CGPoint){size.width, size.height},
      };

      currentColor = borderColors.right;
      CGContextAddLines(ctx, points, sizeof(points)/sizeof(*points));
    }

    // BOTTOM
    if (borderInsets.bottom > 0) {

      const CGPoint points[] = {
        (CGPoint){0, size.height},
        bottomLeft,
        bottomRight,
        (CGPoint){size.width, size.height},
      };

      if (!CGColorEqualToColor(currentColor, borderColors.bottom)) {
        CGContextSetFillColorWithColor(ctx, currentColor);
        CGContextFillPath(ctx);
        currentColor = borderColors.bottom;
      }
      CGContextAddLines(ctx, points, sizeof(points)/sizeof(*points));
    }

    // LEFT
    if (borderInsets.left > 0) {

      const CGPoint points[] = {
        CGPointZero,
        topLeft,
        bottomLeft,
        (CGPoint){0, size.height},
      };

      if (!CGColorEqualToColor(currentColor, borderColors.left)) {
        CGContextSetFillColorWithColor(ctx, currentColor);
        CGContextFillPath(ctx);
        currentColor = borderColors.left;
      }
      CGContextAddLines(ctx, points, sizeof(points)/sizeof(*points));
    }

    // TOP
    if (borderInsets.top > 0) {

      const CGPoint points[] = {
        CGPointZero,
        topLeft,
        topRight,
        (CGPoint){size.width, 0},
      };

      if (!CGColorEqualToColor(currentColor, borderColors.top)) {
        CGContextSetFillColorWithColor(ctx, currentColor);
        CGContextFillPath(ctx);
        currentColor = borderColors.top;
      }
      CGContextAddLines(ctx, points, sizeof(points)/sizeof(*points));
    }

    CGContextSetFillColorWithColor(ctx, currentColor);
    CGContextFillPath(ctx);
  }

  CGPathRelease(insetPath);

  UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
  UIGraphicsEndImageContext();

  if (makeStretchable) {
    image = [image resizableImageWithCapInsets:edgeInsets];
  }

  return image;
}

// Currently, the dashed / dotted implementation only supports a single colour +
// single width, as that's currently required and supported on Android.
//
// Supporting individual widths + colours on each side is possible by modifying
// the current implementation. The idea is that we will draw four different lines
// and clip appropriately for each side (might require adjustment of phase so that
// they line up but even browsers don't do a good job at that).
//
// Firstly, create two paths for the outer and inner paths. The inner path is
// generated exactly the same way as the outer, just given an inset rect, derived
// from the insets on each side. Then clip using the odd-even rule
// (CGContextEOClip()). This will give us a nice rounded (possibly) clip mask.
//
// +----------------------------------+
// |@@@@@@@@  Clipped Space  @@@@@@@@@|
// |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@|
// |@@+----------------------+@@@@@@@@|
// |@@|                      |@@@@@@@@|
// |@@|                      |@@@@@@@@|
// |@@|                      |@@@@@@@@|
// |@@+----------------------+@@@@@@@@|
// |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@|
// +----------------------------------+
//
// Afterwards, we create a clip path for each border side (CGContextSaveGState()
// and CGContextRestoreGState() when drawing each side). The clip mask for each
// segment is a trapezoid connecting corresponding edges of the inner and outer
// rects. For example, in the case of the top edge, the points would be:
// - (MinX(outer), MinY(outer))
// - (MaxX(outer), MinY(outer))
// - (MinX(inner) + topLeftRadius, MinY(inner) + topLeftRadius)
// - (MaxX(inner) - topRightRadius, MinY(inner) + topRightRadius)
//
//         +------------------+
//         |\                /|
//         | \              / |
//         |  \    top     /  |
//         |   \          /   |
//         |    \        /    |
//         |     +------+     |
//         |     |      |     |
//         |     |      |     |
//         |     |      |     |
//         |left |      |right|
//         |     |      |     |
//         |     |      |     |
//         |     +------+     |
//         |    /        \    |
//         |   /          \   |
//         |  /            \  |
//         | /    bottom    \ |
//         |/                \|
//         +------------------+
//
//
// Note that this approach will produce discontinous colour changes at the edge
// (which is okay). The reason is that Quartz does not currently support drawing
// of gradients _along_ a path (NB: clipping a path and drawing a linear gradient
// is _not_ equivalent).

static UIImage *HippyGetDashedOrDottedBorderImage(HippyBorderStyle borderStyle,
                                                HippyCornerRadii cornerRadii,
                                                CGSize viewSize,
                                                UIEdgeInsets borderInsets,
                                                HippyBorderColors borderColors,
                                                CGColorRef backgroundColor,
                                                BOOL drawToEdge)
{
  NSCParameterAssert(borderStyle == HippyBorderStyleDashed || borderStyle == HippyBorderStyleDotted);

  if (!HippyBorderColorsAreEqual(borderColors) || !HippyBorderInsetsAreEqual(borderInsets)) {
    HippyLogWarn(@"Unsupported dashed / dotted border style");
    return nil;
  }

  const CGFloat lineWidth = borderInsets.top;
  if (lineWidth <= 0.0) {
    return nil;
  }

  const BOOL hasCornerRadii = HippyCornerRadiiAreAboveThreshold(cornerRadii);
  CGContextRef ctx = HippyUIGraphicsBeginImageContext(viewSize, backgroundColor, hasCornerRadii, drawToEdge);
  const CGRect rect = {.size = viewSize};

  if (backgroundColor) {
    CGPathRef outerPath = HippyPathCreateOuterOutline(drawToEdge, rect, cornerRadii);
    CGContextAddPath(ctx, outerPath);
    CGPathRelease(outerPath);

    CGContextSetFillColorWithColor(ctx, backgroundColor);
    CGContextFillPath(ctx);
  }

  // Stroking means that the width is divided in half and grows in both directions
  // perpendicular to the path, that's why we inset by half the width, so that it
  // reaches the edge of the rect.
  CGRect pathRect = CGRectInset(rect, lineWidth / 2.0, lineWidth / 2.0);
  CGPathRef path = HippyPathCreateWithRoundedRect(pathRect, HippyGetCornerInsets(cornerRadii, UIEdgeInsetsZero), NULL);

  CGFloat dashLengths[2];
  dashLengths[0] = dashLengths[1] = (borderStyle == HippyBorderStyleDashed ? 3 : 1) * lineWidth;

  CGContextSetLineWidth(ctx, lineWidth);
  CGContextSetLineDash(ctx, 0, dashLengths, sizeof(dashLengths) / sizeof(*dashLengths));

  CGContextSetStrokeColorWithColor(ctx, [UIColor yellowColor].CGColor);

  CGContextAddPath(ctx, path);
  CGContextSetStrokeColorWithColor(ctx, borderColors.top);
  CGContextStrokePath(ctx);

  CGPathRelease(path);

  UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
  UIGraphicsEndImageContext();

  return image;
}

UIImage *HippyGetBorderImage(HippyBorderStyle borderStyle,
                           CGSize viewSize,
                           HippyCornerRadii cornerRadii,
                           UIEdgeInsets borderInsets,
                           HippyBorderColors borderColors,
                           CGColorRef backgroundColor,
                           BOOL drawToEdge)
{

  switch (borderStyle) {
    case HippyBorderStyleSolid:
      return HippyGetSolidBorderImage(cornerRadii, viewSize, borderInsets, borderColors, backgroundColor, drawToEdge);
    case HippyBorderStyleDashed:
    case HippyBorderStyleDotted:
      return HippyGetDashedOrDottedBorderImage(borderStyle, cornerRadii, viewSize, borderInsets, borderColors, backgroundColor, drawToEdge);
    case HippyBorderStyleUnset:
      break;
  }

  return nil;
}
