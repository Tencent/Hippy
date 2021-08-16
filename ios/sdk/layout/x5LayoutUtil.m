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

#import "x5LayoutUtil.h"

static void x5ExecuteOnMainThread(dispatch_block_t block, BOOL sync) {
    if (0 == strcmp(dispatch_queue_get_label(DISPATCH_CURRENT_QUEUE_LABEL), dispatch_queue_get_label(dispatch_get_main_queue()))) {
        block();
    } else if (sync) {
        dispatch_sync(dispatch_get_main_queue(), block);
    } else {
        dispatch_async(dispatch_get_main_queue(), block);
    }
}

static CGFloat x5ScreenScale() {
    static CGFloat scale;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        x5ExecuteOnMainThread(
            ^{
                scale = [UIScreen mainScreen].scale;
            }, YES);
    });

    return scale;
}

CGFloat x5CeilPixelValue(CGFloat value) {
    CGFloat scale = x5ScreenScale();
    return ceil(value * scale) / scale;
}

CGFloat x5RoundPixelValue(CGFloat value) {
    CGFloat scale = x5ScreenScale();
    return round(value * scale) / scale;
}
