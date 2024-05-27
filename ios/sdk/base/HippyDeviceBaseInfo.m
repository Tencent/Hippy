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

#import "HippyDeviceBaseInfo.h"
#import <UIKit/UIApplication.h>
#import "HippyEventDispatcher.h"
#import "HippyAssert.h"
#import "HippyUtils.h"

BOOL isHippyScreenInOSDarkMode(void) {
    if (@available(iOS 12.0, *)) {
        return (UIUserInterfaceStyleDark == [UIScreen mainScreen].traitCollection.userInterfaceStyle);
    } else {
        return NO;
    }
}

NSDictionary *hippyExportedDimensions(HippyBridge *bridge) {
    NSCAssert([NSThread mainThread], @"this function can only be called in main thread");
    CGSize screenSize = [UIScreen mainScreen].bounds.size;
    CGSize windowSize = HippyKeyWindow() ? HippyKeyWindow().bounds.size : screenSize;
    // To be replace by HippyKeyWindow().windowScene.statusBarManager.statusBarFrame;
    CGFloat statusBarHeight = [[UIApplication sharedApplication] statusBarFrame].size.height;
    if (statusBarHeight == 0) {
        // Since different devices have different statusbar height values,
        // It is not recommended to use it for layout,
        // but, it has been used in some scenarios,
        // To reduce the impact of the problem, provide a default value when not available.
        if ([bridge.delegate respondsToSelector:@selector(defaultStatusBarHeightNoMatterHiddenOrNot)]) {
            statusBarHeight = bridge.delegate.defaultStatusBarHeightNoMatterHiddenOrNot ?: 0.0;
        }
    }
    NSNumber *screenScale = @(HippyScreenScale());
    NSDictionary *dimensions = @{
        @"window" : @{
            @"width": @(windowSize.width),
            @"height": @(windowSize.height),
            @"scale": screenScale,
            @"statusBarHeight": @(statusBarHeight)
        },
        @"screen" : @{
            @"width": @(screenSize.width),
            @"height": @(screenSize.height),
            @"scale": screenScale,
            @"fontScale": @(1),
            @"statusBarHeight": @(statusBarHeight)
        }
    };
    return dimensions;
}

@interface HippyDeviceBaseInfo () {
    __weak HippyBridge *_bridge;
    id<NSObject> _statusBarOrientationNotificationObserver;
    id<NSObject> _applicationDidBecomeActiveNotificationObserver;

    UIInterfaceOrientation _currentInterfaceOrientation;
}

@end

@implementation HippyDeviceBaseInfo

NSString *const HippyDimensionsShouldUpdateNotification = @"HippyDimensionsShouldUpdateNotification";

static UIInterfaceOrientation getStatusBarOrientation(void) {
    return [[UIApplication sharedApplication] statusBarOrientation];
}

- (instancetype)initWithHippyBridge:(HippyBridge *)bridge  {
    self = [super init];
    if (self) {
        _bridge = bridge;
        __weak HippyDeviceBaseInfo *devInfo = self;
        NSString *notificationName;
        if ([_bridge.delegate respondsToSelector:@selector(shouldUseViewWillTransitionMethodToMonitorOrientation)]
            && _bridge.delegate.shouldUseViewWillTransitionMethodToMonitorOrientation) {
            notificationName = HippyDimensionsShouldUpdateNotification;
        } else {
            notificationName = UIApplicationDidChangeStatusBarOrientationNotification;
        }
        _statusBarOrientationNotificationObserver = [[NSNotificationCenter defaultCenter]
            addObserverForName:notificationName
                        object:nil
                         queue:[NSOperationQueue mainQueue]
                    usingBlock:^(NSNotification *_Nonnull note) {
                        if (devInfo) {
                            HippyDeviceBaseInfo *strongSelf = devInfo;
                            UIInterfaceOrientation previousInterfaceOrientation = strongSelf->_currentInterfaceOrientation;
                            UIInterfaceOrientation currentInterfaceOrientation = getStatusBarOrientation();
                            if (previousInterfaceOrientation != currentInterfaceOrientation) {
                                NSDictionary *dim = hippyExportedDimensions(strongSelf->_bridge);
                                [strongSelf->_bridge.eventDispatcher dispatchEvent:@"Dimensions" methodName:@"set" args:dim];
                            }
                            strongSelf->_currentInterfaceOrientation = currentInterfaceOrientation;
                        }
                    }];

        _applicationDidBecomeActiveNotificationObserver = [[NSNotificationCenter defaultCenter]
            addObserverForName:UIApplicationDidBecomeActiveNotification
                        object:nil
                         queue:[NSOperationQueue mainQueue]
                    usingBlock:^(NSNotification *_Nonnull note) {
                        if (devInfo) {
                            HippyDeviceBaseInfo *strongSelf = devInfo;
                            UIInterfaceOrientation currentInterfaceOrientation = strongSelf->_currentInterfaceOrientation;
                            UIInterfaceOrientation activeStatusBarOrientation = getStatusBarOrientation();
                            if (currentInterfaceOrientation != activeStatusBarOrientation) {
                                NSDictionary *dim = hippyExportedDimensions(strongSelf->_bridge);
                                [strongSelf->_bridge.eventDispatcher dispatchEvent:@"Dimensions" methodName:@"set" args:dim];
                            }
                            strongSelf->_currentInterfaceOrientation = activeStatusBarOrientation;
                        }
                    }];
    }
    return self;
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:_statusBarOrientationNotificationObserver];
    [[NSNotificationCenter defaultCenter] removeObserver:_applicationDidBecomeActiveNotificationObserver];
}

@end
