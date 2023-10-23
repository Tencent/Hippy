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
#import "DemoConfigs.h"

#import "HippyMethodInterceptorProtocol.h"

#import <hippy/HippyBridge.h>
#import <hippy/HippyRootView.h>
#import <hippy/HippyLog.h>
#import <hippy/HippyAsserts.h>
#import <hippy/UIView+Hippy.h>

static NSString *const engineKey = @"Demo";

@interface HippyDemoViewController () <HippyMethodInterceptorProtocol, HippyBridgeDelegate, HippyRootViewDelegate> {
    DriverType _driverType;
    RenderType _renderType;
    BOOL _isDebugMode;
    NSURL *_debugURL;
    
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
        _isDebugMode = isDebugMode;
    }
    return self;
}

- (instancetype)initWithPageCache:(HippyPageCache *)pageCache {
    self = [super init];
    if (self) {
        _driverType = pageCache.driverType;
        _renderType = pageCache.renderType;
        _debugURL = pageCache.debugURL;
        _isDebugMode = pageCache.isDebugMode;
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

- (void)registerLogFunction {
    HippySetLogFunction(^(HippyLogLevel level, HippyLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
        NSLog(@"hippy says:%@ in file %@ at line %@", message, fileName, lineNumber);
    });
}

- (void)runHippyCache {
    _hippyRootView.frame = self.contentAreaView.bounds;
    [self.contentAreaView addSubview:_hippyRootView];
}

- (void)runHippyDemo {
    NSDictionary *launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO), @"DebugMode": @(_isDebugMode)};
    NSString *uniqueEngineKey = [NSString stringWithFormat:@"%@_%u", engineKey, arc4random()];
    
    _hippyBridge = [[HippyBridge alloc] initWithDelegate:self
                                          moduleProvider:nil
                                           launchOptions:launchOptions
                                             executorKey:uniqueEngineKey];
    _hippyBridge.contextName = uniqueEngineKey;
    _hippyBridge.moduleName = @"Demo";
    _hippyBridge.methodInterceptor = self;
    
    [_hippyBridge setInspectable:YES];
    
    [self mountConnector:_hippyBridge];
}

- (void)mountConnector:(HippyBridge *)hippyBridge {
    BOOL isSimulator = NO;
#if TARGET_IPHONE_SIMULATOR
    isSimulator = YES;
#endif
    
#if USE_NEW_LOAD
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:hippyBridge
                                                         moduleName:@"Demo"
                                                  initialProperties:@{@"isSimulator": @(isSimulator)}
                                                           delegate:self];
    
    if (_isDebugMode) {
        hippyBridge.sandboxDirectory = [_debugURL URLByDeletingLastPathComponent];
        [hippyBridge loadBundleURL:_debugURL completion:^(NSURL * _Nullable, NSError * _Nullable) {
            [rootView runHippyApplication];
        }];
    } else {
        NSURL *vendorBundleURL = [self vendorBundleURL];
        [hippyBridge loadBundleURL:vendorBundleURL completion:^(NSURL * _Nullable, NSError * _Nullable) {
            NSLog(@"url %@ load finish", vendorBundleURL);
        }];
        NSURL *indexBundleURL = [self indexBundleURL];
        hippyBridge.sandboxDirectory = [indexBundleURL URLByDeletingLastPathComponent];
        [hippyBridge loadBundleURL:indexBundleURL completion:^(NSURL * _Nullable, NSError * _Nullable) {
            NSLog(@"url %@ load finish", indexBundleURL);
            [rootView runHippyApplication];
        }];
    }
    
#else
    HippyRootView *rootView = nil;
    
    if (_isDebugMode) {
        hippyBridge.sandboxDirectory = [_debugURL URLByDeletingLastPathComponent];
        rootView = [[HippyRootView alloc] initWithBridge:hippyBridge
                                             businessURL:_debugURL
                                              moduleName:@"Demo"
                                       initialProperties:@{@"isSimulator": @(isSimulator)}
                                                delegate:self];
    } else {
        NSURL *vendorBundleURL = [self vendorBundleURL];
        NSURL *indexBundleURL = [self indexBundleURL];
        [hippyBridge loadBundleURL:vendorBundleURL completion:^(NSURL * _Nullable, NSError * _Nullable) {
            NSLog(@"url %@ load finish", vendorBundleURL);
        }];
        hippyBridge.sandboxDirectory = [indexBundleURL URLByDeletingLastPathComponent];
        rootView = [[HippyRootView alloc] initWithBridge:hippyBridge
                                             businessURL:indexBundleURL
                                              moduleName:@"Demo"
                                       initialProperties:@{@"isSimulator": @(isSimulator)}
                                                delegate:self];
    }
    
#endif
    
    rootView.frame = self.contentAreaView.bounds;
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    
    [self.contentAreaView addSubview:rootView];
    _hippyRootView = rootView;
}

- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];
    _hippyRootView.frame = self.contentAreaView.bounds;
}

- (NSURL *)vendorBundleURL {
    NSString *path = nil;
    if (DriverTypeReact == _driverType) {
        path = [[NSBundle mainBundle] pathForResource:@"vendor.ios" ofType:@"js" inDirectory:@"res/react"];
    }
    else if (DriverTypeVue == _driverType) {
        path = [[NSBundle mainBundle] pathForResource:@"vendor.ios" ofType:@"js" inDirectory:@"res/vue3"];
    }
    return [NSURL fileURLWithPath:path];
}

- (NSURL *)indexBundleURL {
    NSString *path = nil;
    if (DriverTypeReact == _driverType) {
        path = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res/react"];
    }
    else if (DriverTypeVue == _driverType) {
        path = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res/vue3"];
    }
    return [NSURL fileURLWithPath:path];
}

- (DriverType)driverType {
    return _driverType;
}

- (RenderType)renderType {
    return _renderType;
}

- (NSURL *)debugURL {
    return _debugURL;
}

- (BOOL)isDebugMode {
    return _isDebugMode;
}

- (void)reload:(HippyBridge *)bridge {
    [self mountConnector:_hippyBridge];
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
    pageCache.debugMode = _isDebugMode;
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


#pragma mark - HippyMethodInterceptorProtocol

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
