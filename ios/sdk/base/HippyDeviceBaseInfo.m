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

static BOOL isiPhoneX() {
    if (@available(iOS 11.0, *)) {
        CGFloat height = [[UIApplication sharedApplication] delegate].window.safeAreaInsets.bottom;
        return (height > 0);
    } else {
        return NO;
    }
}

NSDictionary *hippyExportedDimensions() {
    NSCAssert([NSThread mainThread], @"this function can only be called in main thread");
    CGSize screenSize = [UIScreen mainScreen].bounds.size;
    CGSize windowSize = HippyKeyWindow() ? HippyKeyWindow().bounds.size : screenSize;
    CGFloat statusBarHeight = [[UIApplication sharedApplication] statusBarFrame].size.height;
    if (statusBarHeight == 0) {
        statusBarHeight = isiPhoneX() ? 44 : 20;
    }
    static NSNumber *screenScale = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        screenScale = @([UIScreen mainScreen].scale);
    });
    NSDictionary *dimensions = @{
        // 备注，window和screen的区别在于有没有底bar虚拟导航栏，而iOS没有这个东西，所以window和screen是一样的
        @"window":
            @ { @"width": @(windowSize.width), @"height": @(windowSize.height), @"scale": screenScale, @"statusBarHeight": @(statusBarHeight) },
        @"screen": @ {
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
    id<NSObject> _statusBarOrientationNotificationObserver;
    id<NSObject> _applicationDidBecomeActiveNotificationObserver;

    UIInterfaceOrientation _currentInterfaceOrientation;
}

@end

@implementation HippyDeviceBaseInfo

HIPPY_EXPORT_MODULE(DeviceBaseInfo)

@synthesize bridge = _bridge;

- (instancetype)init {
    self = [super init];
    if (self) {
        __weak HippyDeviceBaseInfo *devInfo = self;
        _statusBarOrientationNotificationObserver = [[NSNotificationCenter defaultCenter]
            addObserverForName:UIApplicationDidChangeStatusBarOrientationNotification
                        object:nil
                         queue:[NSOperationQueue mainQueue]
                    usingBlock:^(NSNotification *_Nonnull note) {
                        if (devInfo) {
                            HippyDeviceBaseInfo *strongSelf = devInfo;
                            UIInterfaceOrientation previousInterfaceOrientation
                                = (UIInterfaceOrientation)[note.userInfo[UIApplicationStatusBarOrientationUserInfoKey] integerValue];
                            UIInterfaceOrientation currentInterfaceOrientation = [[UIApplication sharedApplication] statusBarOrientation];
                            if (previousInterfaceOrientation != currentInterfaceOrientation) {
                                NSDictionary *dim = hippyExportedDimensions();
                                [[strongSelf bridge].eventDispatcher dispatchEvent:@"Dimensions" methodName:@"set" args:dim];
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
                            UIInterfaceOrientation activeStatusBarOrientation = [[UIApplication sharedApplication] statusBarOrientation];
                            if (currentInterfaceOrientation != activeStatusBarOrientation) {
                                NSDictionary *dim = hippyExportedDimensions();
                                [[strongSelf bridge].eventDispatcher dispatchEvent:@"Dimensions" methodName:@"set" args:dim];
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
