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

#import "HippyUtils.h"
#import "HippyRenderUtils.h"

// Use global variable to facilitate unit test
CGFloat gHippyScreenScaleValue = CGFLOAT_MAX;

CGFloat HippyScreenScale(void) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        gHippyScreenScaleValue = [UIScreen mainScreen].scale;
    });
    return gHippyScreenScaleValue;
}

CGSize HippyScreenSize(void) {
    static CGSize size = { 0, 0 };
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        size = [UIScreen mainScreen].bounds.size;
    });
    return size;
}

CGFloat HippyRoundPixelValue(CGFloat value) {
    CGFloat scale = HippyScreenScale();
    return round(value * scale) / scale;
}

CGFloat HippyCeilPixelValue(CGFloat value) {
    CGFloat scale = HippyScreenScale();
    return ceil(value * scale) / scale;
}

CGFloat HippyFloorPixelValue(CGFloat value) {
    CGFloat scale = HippyScreenScale();
    return floor(value * scale) / scale;
}

CGSize HippySizeCeilInPixels(CGSize pointSize, CGFloat scale) {
    return (CGSize) {
        ceil(pointSize.width * scale),
        ceil(pointSize.height * scale),
    };
}

CGSize HippySizeRoundInPixels(CGSize pointSize, CGFloat scale) {
    return (CGSize) {
        round(pointSize.width * scale),
        round(pointSize.height * scale),
    };
}

BOOL HippyCGRectNearlyEqual(CGRect frame1, CGRect frame2) {
    return HippyCGPointNearlyEqual(frame1.origin, frame2.origin) &&
            HippyCGSizeNearlyEqual(frame1.size, frame2.size);
}

BOOL HippyCGPointNearlyEqual(CGPoint point1, CGPoint point2) {
    return fabs(point1.x - point2.x) < 3 * CGFLOAT_EPSILON &&
            fabs(point1.y - point2.y) < 3 * CGFLOAT_EPSILON;
}

BOOL HippyCGSizeNearlyEqual(CGSize size1, CGSize size2) {
    return fabs(size1.width - size2.width) < 3 * CGFLOAT_EPSILON &&
            fabs(size1.height - size2.height) < 3 * CGFLOAT_EPSILON;
}

BOOL HippyCGSizeRoundInPixelNearlyEqual(CGSize size1, CGSize size2) {
    CGFloat scale = HippyScreenScale();
    CGSize sizeA = HippySizeRoundInPixels(size1, scale);
    CGSize sizeB = HippySizeRoundInPixels(size2, scale);
    return HippyCGSizeNearlyEqual(sizeA,sizeB);
}

BOOL HippyCGPointRoundInPixelNearlyEqual(CGPoint point1, CGPoint point2) {
    CGFloat scale = HippyScreenScale();
    CGPoint pointA = (CGPoint) {
        round(point1.x * scale),
        round(point1.y * scale),
    };
    CGPoint pointB = (CGPoint) {
        round(point2.x * scale),
        round(point2.y * scale),
    };
    return fabs(pointA.x - pointB.x) < CGFLOAT_EPSILON &&
    fabs(pointA.y - pointB.y) < CGFLOAT_EPSILON;
}

BOOL HippyCGRectRoundInPixelNearlyEqual(CGRect frame1, CGRect frame2) {
    return HippyCGPointRoundInPixelNearlyEqual(frame1.origin, frame2.origin) &&
    HippyCGSizeRoundInPixelNearlyEqual(frame1.size, frame2.size);
}
