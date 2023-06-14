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

#import "HPToolUtils.h"
#import "NativeRenderUtils.h"

CGFloat NativeRenderScreenScale(void) {
    static CGFloat scale = CGFLOAT_MAX;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        scale = [UIScreen mainScreen].scale;
    });
    return scale;
}

CGSize NativeRenderScreenSize(void) {
    static CGSize size = { 0, 0 };
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        size = [UIScreen mainScreen].bounds.size;
    });
    return size;
}

CGFloat NativeRenderRoundPixelValue(CGFloat value) {
    CGFloat scale = NativeRenderScreenScale();
    return round(value * scale) / scale;
}

CGFloat NativeRenderCeilPixelValue(CGFloat value) {
    CGFloat scale = NativeRenderScreenScale();
    return ceil(value * scale) / scale;
}

CGFloat NativeRenderFloorPixelValue(CGFloat value) {
    CGFloat scale = NativeRenderScreenScale();
    return floor(value * scale) / scale;
}

CGSize NativeRenderSizeInPixels(CGSize pointSize, CGFloat scale) {
    return (CGSize) {
        ceil(pointSize.width * scale),
        ceil(pointSize.height * scale),
    };
}

BOOL NativeRenderCGRectNearlyEqual(CGRect frame1, CGRect frame2) {
    return NativeRenderCGPointNearlyEqual(frame1.origin, frame2.origin) &&
            NativeRenderCGSizeNearlyEqual(frame1.size, frame2.size);
}

BOOL NativeRenderCGPointNearlyEqual(CGPoint point1, CGPoint point2) {
    return fabs(point1.x - point2.x) < CGFLOAT_EPSILON &&
            fabs(point1.y - point2.y) < CGFLOAT_EPSILON;
}

BOOL NativeRenderCGSizeNearlyEqual(CGSize size1, CGSize size2) {
    return fabs(size1.width - size2.width) < CGFLOAT_EPSILON &&
            fabs(size1.height - size2.height) < CGFLOAT_EPSILON;
}
