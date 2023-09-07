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

#import "HPAsserts.h"
#import "HPToolUtils.h"
#import "HippyDeviceBaseInfo.h"
#import "HippyEventDispatcher.h"

static BOOL IsiPhoneX() {
    if (@available(iOS 11.0, *)) {
        CGFloat height = [[UIApplication sharedApplication] delegate].window.safeAreaInsets.bottom;
        return (height > 0);
    } else {
        return NO;
    }
}

static NSDictionary *gDimensions = nil;

static dispatch_semaphore_t DimesionSemaphore(void) {
    static dispatch_semaphore_t semaphore = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        semaphore = dispatch_semaphore_create(1);
    });
    return semaphore;
}

static NSDictionary *InitializeDimesions(void) {
    __block CGSize screenSize = CGSizeZero;
    __block CGSize windowSize = CGSizeZero;
    __block CGFloat statusBarHeight = 0.f;
    __block NSNumber *screenScale = nil;
    
    dispatch_block_t block = ^(void){
        screenSize = [UIScreen mainScreen].bounds.size;
        windowSize = HPKeyWindow() ? HPKeyWindow().bounds.size : screenSize;
        statusBarHeight = [[UIApplication sharedApplication] statusBarFrame].size.height;
        if (statusBarHeight == 0) {
            statusBarHeight = IsiPhoneX() ? 44 : 20;
        }
        screenScale = @([UIScreen mainScreen].scale);
    };
    HPExecuteOnMainThread(block, YES);
    gDimensions = @{
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
    return gDimensions;
}

static void DisposeDimesions(void) {
    dispatch_semaphore_wait(DimesionSemaphore(), DISPATCH_TIME_FOREVER);
    gDimensions = nil;
    dispatch_semaphore_signal(DimesionSemaphore());
}

NSDictionary *HippyExportedDimensions(void) {
    NSDictionary *dic = nil;
    dispatch_semaphore_wait(DimesionSemaphore(), DISPATCH_TIME_FOREVER);
    if (gDimensions) {
        dic = [gDimensions copy];
    }
    else {
        dic = [InitializeDimesions() copy];
    }
    dispatch_semaphore_signal(DimesionSemaphore());
    return dic;
}

@protocol HippyStatusBarOrientationChangedProtocol <NSObject>

@required
- (void)statusBarOrientationChanged;

@end

@interface HippyBaseInfoInternal : NSObject {
    NSHashTable<id<HippyStatusBarOrientationChangedProtocol>> *_observers;
}

+ (instancetype)sharedInstance;

- (void)addObserver:(id<HippyStatusBarOrientationChangedProtocol>)observer;

- (void)removeObserver:(id<HippyStatusBarOrientationChangedProtocol>)observer;

@end

@implementation HippyBaseInfoInternal

+ (instancetype)sharedInstance {
    static HippyBaseInfoInternal *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[HippyBaseInfoInternal alloc] init];
    });
    return instance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _observers = [NSHashTable weakObjectsHashTable];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(statusBarOrientationChanged)
                                                     name:UIApplicationDidChangeStatusBarOrientationNotification
                                                   object:nil];
    }
    return self;
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)addObserver:(id<HippyStatusBarOrientationChangedProtocol>)observer {
    [_observers addObject:observer];
}

- (void)removeObserver:(id<HippyStatusBarOrientationChangedProtocol>)observer {
    [_observers removeObject:observer];
}

- (void)statusBarOrientationChanged {
    DisposeDimesions();
    for (id<HippyStatusBarOrientationChangedProtocol> observer in _observers) {
        [observer statusBarOrientationChanged];
    }
}

@end

@interface HippyDeviceBaseInfo ()<HippyStatusBarOrientationChangedProtocol> {
}

@end

@implementation HippyDeviceBaseInfo

HIPPY_EXPORT_MODULE(DeviceBaseInfo)

@synthesize bridge = _bridge;

- (instancetype)init {
    self = [super init];
    if (self) {
        [[HippyBaseInfoInternal sharedInstance] addObserver:self];
    }
    return self;
}

- (void)statusBarOrientationChanged {
    NSDictionary *dim = HippyExportedDimensions();
    [[self bridge].eventDispatcher dispatchEvent:@"Dimensions" methodName:@"set" args:dim];
}

@end
