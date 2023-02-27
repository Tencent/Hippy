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

CGFloat NativeRenderScreenScale() {
    static CGFloat scale = CGFLOAT_MAX;
    static dispatch_once_t onceToken;
    if (CGFLOAT_MAX == scale) {
        HPExecuteOnMainThread(
            ^{
                dispatch_once(&onceToken, ^{
                    scale = [UIScreen mainScreen].scale;
                });
            }, YES);
    }

    return scale;
}

CGSize NativeRenderScreenSize() {
    static CGSize size = { 0, 0 };
    static dispatch_once_t onceToken;
    if (CGSizeEqualToSize(CGSizeZero, size)) {
        HPExecuteOnMainThread(
            ^{
                dispatch_once(&onceToken, ^{
                    size = [UIScreen mainScreen].bounds.size;
                });
            }, YES);
    }

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
