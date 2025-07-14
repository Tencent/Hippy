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

#import <UIKit/UIApplication.h>
#import "HippyAssert.h"
#import "HippyUtils.h"
#import "HippyDeviceBaseInfo.h"
#import "HippyEventDispatcher.h"
#import "HippyRenderUtils.h"
#import "HippyUIManager.h"
#import "HippyBridge+Private.h"


NSDictionary *hippyExportedDimensions(HippyBridge * _Nonnull bridge,
                                      NSValue * _Nullable rootSizeValue) {
    NSCAssert([NSThread mainThread], @"this function can only be called in main thread");
    CGSize screenSize = HippyScreenSize();
    CGSize windowSize = HippyKeyWindow() ? HippyKeyWindow().bounds.size : screenSize;
    
    // Call bridge delegate method shouldUseRootViewSizeAsWindowSizeInDimensions if needed.
    if (!bridge.shouldUseRootSizeAsWindowSize) {
        if ([bridge.delegate respondsToSelector:@selector(shouldUseRootViewSizeAsWindowSizeInDimensions)]) {
            bridge.shouldUseRootSizeAsWindowSize = @(bridge.delegate.shouldUseRootViewSizeAsWindowSizeInDimensions);
        } else {
            // make default value YES.
            bridge.shouldUseRootSizeAsWindowSize = @(YES);
        }
    }
    BOOL useRootSizeAsWindowSize = [bridge.shouldUseRootSizeAsWindowSize boolValue];
    
    // Update RootView size
    if (rootSizeValue) {
        bridge.lastRootSizeForDimensions = rootSizeValue;
    }
    
    // Get a default value of the RootView's size from the host app,
    // instead of directly using the key window size,
    // since key window size may not be accurate in some cases.
    if (useRootSizeAsWindowSize && !bridge.lastRootSizeForDimensions) {
        if ([bridge.delegate respondsToSelector:@selector(defaultWindowSizeInDimensionsBeforeRootViewMount)]) {
            bridge.lastRootSizeForDimensions = @(bridge.delegate.defaultWindowSizeInDimensionsBeforeRootViewMount);
        }
    }
    
    // Get final RootSize
    CGSize rootSize = bridge.lastRootSizeForDimensions ? bridge.lastRootSizeForDimensions.CGSizeValue : windowSize;
    
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
    
    // FontSize Scale
    HippyUIManager *uiManager = bridge.uiManager;
    NSNumber *fontScale = uiManager.globalFontSizeMultiplier ?: @(1);
    
    NSNumber *screenScale = @(HippyScreenScale());
    NSDictionary *dimensions = @{
        @"window" : @{
            @"width": useRootSizeAsWindowSize ? @(rootSize.width) : @(windowSize.width),
            @"height": useRootSizeAsWindowSize ? @(rootSize.height) : @(windowSize.height),
            @"scale": screenScale,
            @"statusBarHeight": @(statusBarHeight)
        },
        @"screen" : @{
            @"width": @(screenSize.width),
            @"height": @(screenSize.height),
            @"scale": screenScale,
            @"fontScale": fontScale,
            @"statusBarHeight": @(statusBarHeight)
        },
        @"appwindow" : @{
            @"width": @(windowSize.width),
            @"height": @(windowSize.height),
            @"scale": screenScale,
            @"statusBarHeight": @(statusBarHeight)
        },
    };
    return dimensions;
}



#pragma mark -

@interface HippyDeviceBaseInfo () {
    id<NSObject> _statusBarOrientationNotificationObserver;
    id<NSObject> _applicationDidBecomeActiveNotificationObserver;
    UIInterfaceOrientation _currentInterfaceOrientation;
}

@end

@implementation HippyDeviceBaseInfo

HIPPY_EXPORT_MODULE(DeviceBaseInfo)

NSString *const HippyDimensionsShouldUpdateNotification = @"HippyDimensionsShouldUpdateNotification";

@synthesize bridge = _bridge;

static UIInterfaceOrientation getStatusBarOrientation(void) {
    return [[UIApplication sharedApplication] statusBarOrientation];
}

- (instancetype)init {
    self = [super init];
    if (self) {
        self->_currentInterfaceOrientation = getStatusBarOrientation();
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
                    NSDictionary *dim = hippyExportedDimensions(strongSelf->_bridge, nil);
                    [strongSelf->_bridge.eventDispatcher dispatchDimensionsUpdateEvent:dim];
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
                    NSDictionary *dim = hippyExportedDimensions(strongSelf->_bridge, nil);
                    [strongSelf->_bridge.eventDispatcher dispatchDimensionsUpdateEvent:dim];
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


#pragma mark - Uitls

+ (BOOL)isUIScreenInOSDarkMode {
    if (@available(iOS 12.0, *)) {
        return (UIUserInterfaceStyleDark == [UIScreen mainScreen].traitCollection.userInterfaceStyle);
    } else {
        return NO;
    }
}


@end
