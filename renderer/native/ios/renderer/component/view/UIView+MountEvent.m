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

#import "UIView+MountEvent.h"
#import "objc/runtime.h"
#import "UIView+Hippy.h"
#import "HippyRootView.h"
#import "HippyBridge+PerformanceAPI.h"

/// The FCP Notification Imp
const NSNotificationName HippyFirstContentfulPaintEndNotification = @"HippyFirstContentfulPaintEndNotification";

@interface HippyRootView (PaintEventSupport)

/// Send FCP Notification only for the first time
/// - Parameter fcpView: fcp view
- (void)sendFCPNotiIfNeeded:(UIView *)fcpView;

@end


@implementation UIView (MountEvent)

#define MountEvent(setter, getter)                                                      \
    - (void)setter:(HippyDirectEventBlock)getter {                                          \
        objc_setAssociatedObject(self, @selector(getter), getter, OBJC_ASSOCIATION_COPY);   \
    }                                                                                       \
                                                                                            \
    - (HippyDirectEventBlock)getter {                                                       \
        return objc_getAssociatedObject(self, @selector(getter));                           \
    }

MountEvent(setOnAppear, onAppear)
MountEvent(setOnDisappear, onDisappear)
MountEvent(setOnWillAppear, onWillAppear)
MountEvent(setOnWillDisappear, onWillDisappear)
MountEvent(setOnDidMount, onDidMount)
MountEvent(setOnDidUnmount, onDidUnmount)
MountEvent(setOnAttachedToWindow, onAttachedToWindow)
MountEvent(setOnDetachedFromWindow, onDetachedFromWindow)

- (void)viewAppearEvent {
    if (self.onAppear) {
        self.onAppear(@{});
    }
}

- (void)viewDisappearEvent {
    if (self.onDisappear) {
        self.onDisappear(@{});
    }
}

- (void)viewWillAppearEvent {
    if (self.onWillAppear) {
        self.onWillAppear(@{});
    }
}

- (void)viewWillDisappearEvent {
    if (self.onWillDisappear) {
        self.onWillDisappear(@{});
    }
}

- (void)viewDidMountEvent {
    if (self.onDidMount) {
        self.onDidMount(@{});
    }
}
- (void)viewDidUnmoundEvent {
    if (self.onDidUnmount) {
        self.onDidUnmount(@{});
    }
}

- (void)sendAttachedToWindowEvent {
    if (HippyPaintTypeFCP == self.paintType) {
        HippyRootView *rootView = (HippyRootView *)[self hippyRootView];
        [rootView sendFCPNotiIfNeeded:self];
    }
    if (self.onAttachedToWindow) {
        self.onAttachedToWindow(nil);
    }
}

- (void)sendDetachedFromWindowEvent {
    if (self.onDetachedFromWindow) {
        self.onDetachedFromWindow(nil);
    }
}

#pragma mark -

- (HippyPaintType)paintType {
    return [objc_getAssociatedObject(self, @selector(paintType)) integerValue];
}

- (void)setPaintType:(HippyPaintType)paintType {
    objc_setAssociatedObject(self, @selector(paintType), @(paintType), OBJC_ASSOCIATION_RETAIN);
}


@end


@implementation HippyRootView (PaintEventSupport)

- (void)sendFCPNotiIfNeeded:(UIView *)fcpView {
    if (nil == objc_getAssociatedObject(self, @selector(sendFCPNotiIfNeeded:))) {
        objc_setAssociatedObject(self, @selector(sendFCPNotiIfNeeded:), @(YES), OBJC_ASSOCIATION_RETAIN);
        [self.bridge updatePerfRecordOnFirstContentfulPaintEnd];
        [NSNotificationCenter.defaultCenter postNotificationName:HippyFirstContentfulPaintEndNotification object:fcpView];
    }
}

@end
