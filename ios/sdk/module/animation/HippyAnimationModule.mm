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

#import "HippyAnimationModule.h"
#import "HippyUIManager.h"
#import <objc/runtime.h>
#import <UIKit/UIKit.h>
#import "UIView+Hippy.h"

@interface HippyAnimationModule () <CAAnimationDelegate>
@end

@implementation HippyAnimationModule

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE(AnimationModule)

- (dispatch_queue_t)methodQueue {
    return HippyGetUIManagerQueue();
}

- (instancetype)init {
    if (self = [super init]) {
    }
    return self;
}

- (void)invalidate {

}

// clang-format off
HIPPY_EXPORT_METHOD(createAnimation:(NSNumber *__nonnull)animationId mode:(NSString *)mode params:(NSDictionary *)params) {

}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(createAnimationSet:(NSNumber *__nonnull)animationId animations:(NSDictionary *)animations) {

}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(startAnimation:(NSNumber *__nonnull)animationId) {

}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(pauseAnimation:(NSNumber *__nonnull)animationId) {

}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(resumeAnimation:(NSNumber *__nonnull)animationId) {

}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(updateAnimation:(NSNumber *__nonnull)animationId params:(NSDictionary *)params) {

}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(destroyAnimation:(NSNumber * __nonnull)animationId) {
}
// clang-format on

@end
