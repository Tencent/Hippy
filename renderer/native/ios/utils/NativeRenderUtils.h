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

#import <Foundation/Foundation.h>

#import "HippyDefines.h"

NS_ASSUME_NONNULL_BEGIN

// Get screen metrics in a thread-safe way
HIPPY_EXTERN CGFloat NativeRenderScreenScale(void);
HIPPY_EXTERN CGSize NativeRenderScreenSize(void);

// Round float coordinates to nearest whole screen pixel (not point)
HIPPY_EXTERN CGFloat NativeRenderRoundPixelValue(CGFloat value);
HIPPY_EXTERN CGFloat NativeRenderCeilPixelValue(CGFloat value);
HIPPY_EXTERN CGFloat NativeRenderFloorPixelValue(CGFloat value);

// Convert a size in points to pixels, rounded up to the nearest integral size
HIPPY_EXTERN CGSize NativeRenderSizeInPixels(CGSize pointSize, CGFloat scale);

HIPPY_EXTERN BOOL NativeRenderCGRectNearlyEqual(CGRect frame1, CGRect frame2);

HIPPY_EXTERN BOOL NativeRenderCGPointNearlyEqual(CGPoint point1, CGPoint point2);

HIPPY_EXTERN BOOL NativeRenderCGSizeNearlyEqual(CGSize size1, CGSize size2);

NS_ASSUME_NONNULL_END
