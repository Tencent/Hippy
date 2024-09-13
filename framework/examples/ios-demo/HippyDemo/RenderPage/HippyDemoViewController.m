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

#import "HippyDemoViewController.h"
#import "UIViewController+Title.h"
#import "HippyPageCache.h"
@import hippy;


@interface HippyDemoViewController () <HippyMethodInterceptorProtocol, HippyBridgeDelegate, HippyRootViewDelegate> {
    HippyBridge *_hippyBridge;
    HippyRootView *_hippyRootView;
    BOOL _fromCache;
}

@end

@implementation HippyDemoViewController

- (instancetype)initWithDriverType:(DriverType)driverType
                        renderType:(RenderType)renderType
                          debugURL:(NSURL *)debugURL
                       isDebugMode:(BOOL)isDebugMode {
    self = [super init];
    if (self) {
        _driverType = driverType;
        _renderType = renderType;
        _debugURL = debugURL;
        _debugMode = isDebugMode;
    }
    return self;
}

- (instancetype)initWithPageCache:(HippyPageCache *)pageCache {
    self = [super init];
    if (self) {
        _driverType = pageCache.driverType;
        _renderType = pageCache.renderType;
        _debugURL = pageCache.debugURL;
        _debugMode = pageCache.isDebugMode;
        _hippyRootView = pageCache.rootView;
        _hippyBridge = pageCache.hippyBridge;
        _fromCache = YES;
    }
    return self;
}

- (void)dealloc {
    [[HippyPageCacheManager defaultPageCacheManager] addPageCache:[self toPageCache]];
    NSLog(@"%@ dealloc", self.class);
}

- (void)viewDidLoad {
    [super viewDidLoad];
    [self setNavigationAreaBackground:[UIColor whiteColor]];
    [self setNavigationItemTitle:@"Demo"];
    
    [self registerLogFunction];
    
    if (_fromCache) {
        [self runHippyCache];
    } else {
        [self runHippyDemo];
    }
}

- (void)runHippyCache {
    _hippyRootView.frame = self.contentAreaView.bounds;
    [self.contentAreaView addSubview:_hippyRootView];
}

#pragma mark - Hippy Setup

- (void)registerLogFunction {
    // Register your custom log function for Hippy,
    // use HippyDefaultLogFunction as an example, it outputs logs to stderr.
    HippySetLogFunction(HippyDefaultLogFunction);
}

- (void)runHippyDemo {
    // Necessary configuration:
    NSString *moduleName = @"Demo";
    NSDictionary *launchOptions = @{ @"DebugMode": @(_debugMode) };
    NSDictionary *initialProperties = @{ @"isSimulator": @(TARGET_OS_SIMULATOR) };
    
    HippyBridge *bridge = nil;
    HippyRootView *rootView = nil;
    if (_debugMode) {
        bridge = [[HippyBridge alloc] initWithDelegate:self
                                             bundleURL:_debugURL
                                        moduleProvider:nil
                                         launchOptions:launchOptions
                                           executorKey:nil];
        rootView = [[HippyRootView alloc] initWithBridge:bridge
                                              moduleName:moduleName
                                       initialProperties:initialProperties
                                                delegate:self];
    } else {
        NSURL *vendorBundleURL = [self vendorBundleURL];
        NSURL *indexBundleURL = [self indexBundleURL];
        bridge = [[HippyBridge alloc] initWithDelegate:self
                                             bundleURL:vendorBundleURL
                                        moduleProvider:nil
                                         launchOptions:launchOptions
                                           executorKey:moduleName];
        rootView = [[HippyRootView alloc] initWithBridge:bridge
                                             businessURL:indexBundleURL
                                              moduleName:moduleName
                                       initialProperties:initialProperties
                                                delegate:self];
    }
    
    // // Config whether jsc is inspectable, Highly recommended setting,
    // since inspectable of JSC is disabled by default since iOS 16.4
    [bridge setInspectable:YES];
    _hippyBridge = bridge;
    rootView.frame = self.contentAreaView.bounds;
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    [self.contentAreaView addSubview:rootView];
    _hippyRootView = rootView;
    
    
    // Optional configs:
    bridge.methodInterceptor = self; // see HippyMethodInterceptorProtocol
}


#pragma mark - Helpers

- (NSString *)currentJSBundleDir {
    NSString *dir = nil;
    if (DriverTypeVue2 == _driverType) {
        dir = @"res/vue2";
    } else if (DriverTypeVue3 == _driverType) {
        dir = @"res/vue3";
    } else if (DriverTypeReact == _driverType) {
        dir = @"res/react";
    }
    return dir;
}

- (NSURL *)vendorBundleURL {
    NSString *path = [[NSBundle mainBundle] pathForResource:@"vendor.ios" ofType:@"js" inDirectory:[self currentJSBundleDir]];
    return [NSURL fileURLWithPath:path];
}

- (NSURL *)indexBundleURL {
    NSString *path = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:[self currentJSBundleDir]];
    return [NSURL fileURLWithPath:path];
}

- (void)removeRootView:(NSNumber *)rootTag bridge:(HippyBridge *)bridge {
    [[[self.contentAreaView subviews] firstObject] removeFromSuperview];
}

- (HippyPageCache *)toPageCache {
    HippyPageCache *pageCache = [[HippyPageCache alloc] init];
    pageCache.hippyBridge = _hippyBridge;
    pageCache.rootView = _hippyRootView;
    pageCache.driverType = _driverType;
    pageCache.renderType = _renderType;
    pageCache.debugURL = _debugURL;
    pageCache.debugMode = _debugMode;
    UIGraphicsBeginImageContextWithOptions(_hippyRootView.bounds.size, NO, [UIScreen mainScreen].scale);
    [_hippyRootView drawViewHierarchyInRect:_hippyRootView.bounds afterScreenUpdates:YES];
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    pageCache.snapshot = image;
    return pageCache;
}

- (BOOL)shouldAutorotate {
    return YES;
}

- (UIInterfaceOrientationMask)supportedInterfaceOrientations {
    return UIInterfaceOrientationMaskAllButUpsideDown;
}


#pragma mark - HippyBridgeDelegate

- (BOOL)shouldStartInspector:(HippyBridge *)bridge {
    return bridge.debugMode;
}


#pragma mark - Optional - HippyMethodInterceptorProtocol

- (BOOL)shouldInvokeWithModuleName:(NSString *)moduleName
                        methodName:(NSString *)methodName
                         arguments:(NSArray<id<HippyBridgeArgument>> *)arguments
                   argumentsValues:(NSArray *)argumentsValue
                   containCallback:(BOOL)containCallback {
    HippyAssert(moduleName, @"module name must not be null");
    HippyAssert(methodName, @"method name must not be null");
    return YES;
}

- (BOOL)shouldCallbackBeInvokedWithModuleName:(NSString *)moduleName
                                   methodName:(NSString *)methodName
                                   callbackId:(NSNumber *)cbId
                                    arguments:(id)arguments {
    HippyAssert(moduleName, @"module name must not be null");
    HippyAssert(methodName, @"method name must not be null");
    return YES;
}

@end
