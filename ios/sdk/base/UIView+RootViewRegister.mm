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

#import "UIView+RootViewRegister.h"
#import "HippyTouchHandler.h"
#import "HippyUIManager.h"
#import "HippyInvalidating.h"

@implementation UIView (RootViewRegister)

- (void)registerAsHippyRootView:(HippyBridge *)bridge {
    id touchHander = [[HippyTouchHandler alloc] initWithRootView:self bridge:bridge];
    [self addGestureRecognizer:touchHander];
    [bridge.uiManager registerRootView:self withSizeFlexibility:HippyRootViewSizeFlexibilityNone];
    self.bridge = bridge;
}

- (void)cancelTouches {
    NSArray<UIGestureRecognizer *> *grs = [self gestureRecognizers];
    for (HippyTouchHandler *handler in grs) {
        if ([handler isKindOfClass:[HippyTouchHandler class]]) {
            [handler cancelTouch];
            break;
        }
    }
}

- (void)invalidate {}

@end
