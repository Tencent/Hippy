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

#import "HippyRootViewManager.h"
#import "HippyBridge.h"

NSString *const HippyDidDidRemoveRootViewNotification = @"HippyDidDidRemoveRootViewNotification";
NSString *const HippyRootViewTagKey = @"HippyRootViewTagKey";

@implementation HippyRootViewManager

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE(RootViewManager)

HIPPY_EXPORT_METHOD(removeRootView:(nonnull NSNumber *)rootTag) {
    __weak id<NativeRenderContext> weakContext = self.bridge.renderContext;
    dispatch_async(dispatch_get_main_queue(), ^{
        id<NativeRenderContext> strongContext = weakContext;
        if (strongContext) {
            [strongContext unregisterRootViewFromTag:rootTag];
        }
        [[NSNotificationCenter defaultCenter] postNotificationName:HippyDidDidRemoveRootViewNotification
                                                            object:nil
                                                          userInfo:@{HippyRootViewTagKey: rootTag}];
    });
}

@end
