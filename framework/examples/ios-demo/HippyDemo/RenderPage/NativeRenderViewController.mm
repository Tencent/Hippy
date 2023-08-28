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

#import "NativeRenderViewController.h"
#import "HPLog.h"
#import "HippyBridge.h"
#import "HippyConvenientBridge.h"
#import "DemoConfigs.h"
#import "HPAsserts.h"
#import "HippyMethodInterceptorProtocol.h"
#import "NativeRenderRootView.h"
#import "UIView+NativeRender.h"
#import "HippyPageCache.h"
#import "UIViewController+Title.h"

static NSString *const engineKey = @"Demo";

@interface NativeRenderViewController ()<HippyMethodInterceptorProtocol, HippyBridgeDelegate> {
    DriverType _driverType;
    RenderType _renderType;
    BOOL _isDebugMode;
    HippyConvenientBridge *_convenientBridge;
    NSURL *_debugURL;
    UIView *_rootView;
    BOOL _fromCache;
}

@end

@implementation NativeRenderViewController

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
        _rootView = pageCache.rootView;
        [_rootView addObserver:self forKeyPath:@"frame" options:NSKeyValueObservingOptionNew context:NULL];
        _convenientBridge = pageCache.convenientBridge;
        _fromCache = YES;
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    [self setNavigationAreaBackground:[UIColor whiteColor]];
    [self setNavigationItemTitle:@"Demo"];
    [self registerLogFunction];
    if (_fromCache) {
        [self runHippyCache];
    }
    else {
        [self runHippyDemo];
    }
}

- (void)registerLogFunction {
    HPSetLogFunction(^(HPLogLevel level, NSString *fileName, NSNumber *lineNumber,
                       NSString *message, NSArray<NSDictionary *> *stack, NSDictionary *userInfo) {
        if (HPLogLevelError <= level && userInfo) {
        }
        NSLog(@"hippy says:%@ in file %@ at line %@", message, fileName, lineNumber);
    });
}

- (void)runHippyCache {
    _rootView.frame = self.contentAreaView.bounds;
    [self.contentAreaView addSubview:_rootView];
}

- (void)runHippyDemo {
    NSDictionary *launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO), @"DebugMode": @(_isDebugMode)};
    NSString *key = [NSString stringWithFormat:@"%@_%u", engineKey, arc4random()];

    _convenientBridge = [[HippyConvenientBridge alloc] initWithDelegate:self
                                                         moduleProvider:nil
                                                        extraComponents:nil
                                                          launchOptions:launchOptions
                                                              engineKey:key];
    [_convenientBridge setInspectable:YES];
    _convenientBridge.contextName = key;
    _convenientBridge.moduleName = @"Demo";
    _convenientBridge.methodInterceptor = self;
    [self mountConnector:_convenientBridge];
}

- (void)mountConnector:(HippyConvenientBridge *)convenientBridge {
    BOOL isSimulator = NO;
#if TARGET_IPHONE_SIMULATOR
        isSimulator = YES;
#endif
    NativeRenderRootView *rootView = [[NativeRenderRootView alloc] initWithFrame:self.contentAreaView.bounds];
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    [convenientBridge setRootView:rootView];
    NSNumber *rootTag = [rootView componentTag];
    if (_isDebugMode) {
        convenientBridge.sandboxDirectory = [_debugURL URLByDeletingLastPathComponent];
        [convenientBridge loadBundleURL:_debugURL completion:^(NSURL * _Nullable, NSError * _Nullable) {
            [convenientBridge loadInstanceForRootViewTag:rootTag props:@{@"isSimulator": @(isSimulator)}];
        }];
    }
    else {
        NSURL *vendorBundleURL = [self vendorBundleURL];
        [convenientBridge loadBundleURL:vendorBundleURL completion:^(NSURL * _Nullable, NSError * _Nullable) {
            NSLog(@"url %@ load finish", vendorBundleURL);
        }];
        NSURL *indexBundleURL = [self indexBundleURL];
        convenientBridge.sandboxDirectory = [indexBundleURL URLByDeletingLastPathComponent];
        [convenientBridge loadBundleURL:indexBundleURL completion:^(NSURL * _Nullable, NSError * _Nullable) {
            NSLog(@"url %@ load finish", indexBundleURL);
            [convenientBridge loadInstanceForRootViewTag:rootTag props:@{@"isSimulator": @(isSimulator)}];
        }];
    }
    [self.contentAreaView addSubview:rootView];
    if (_rootView) {
        [_rootView removeObserver:self forKeyPath:@"frame" context:NULL];
    }
    [rootView addObserver:self
               forKeyPath:@"frame"
                  options:NSKeyValueObservingOptionNew | NSKeyValueObservingOptionOld
                  context:NULL];
    _rootView = rootView;
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary<NSKeyValueChangeKey,id> *)change
                       context:(void *)context {
    if ([keyPath isEqualToString:@"frame"] &&
        object == _rootView) {
        CGRect frame = [change[NSKeyValueChangeNewKey] CGRectValue];
        CGRect oldFrame = [change[NSKeyValueChangeOldKey] CGRectValue];
        if (!CGRectEqualToRect(frame, oldFrame)) {
            [_convenientBridge resetRootSize:frame.size];
        }
    }
}

- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];
    _rootView.frame = self.contentAreaView.bounds;
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
    [self mountConnector:_convenientBridge];
}

- (void)removeRootView:(NSNumber *)rootTag bridge:(HippyBridge *)bridge {
    [[[self.contentAreaView subviews] firstObject] removeFromSuperview];
}

- (BOOL)shouldStartInspector:(HippyBridge *)bridge {
    return bridge.debugMode;
}

- (BOOL)shouldInvokeWithModuleName:(NSString *)moduleName
                        methodName:(NSString *)methodName
                         arguments:(NSArray<id<HippyBridgeArgument>> *)arguments
                   argumentsValues:(NSArray *)argumentsValue
                   containCallback:(BOOL)containCallback {
    HPAssert(moduleName, @"module name must not be null");
    HPAssert(methodName, @"method name must not be null");
    return YES;
}

- (BOOL)shouldCallbackBeInvokedWithModuleName:(NSString *)moduleName
                                   methodName:(NSString *)methodName
                                   callbackId:(NSNumber *)cbId
                                    arguments:(id)arguments {
    HPAssert(moduleName, @"module name must not be null");
    HPAssert(methodName, @"method name must not be null");
    return YES;
}

- (HippyPageCache *)toPageCache {
    HippyPageCache *pageCache = [[HippyPageCache alloc] init];
    pageCache.convenientBridge = _convenientBridge;
    pageCache.rootView = _rootView;
    pageCache.driverType = _driverType;
    pageCache.renderType = _renderType;
    pageCache.debugURL = _debugURL;
    pageCache.debugMode = _isDebugMode;
    UIGraphicsBeginImageContextWithOptions(_rootView.bounds.size, NO, [UIScreen mainScreen].scale);
    [_rootView drawViewHierarchyInRect:_rootView.bounds afterScreenUpdates:YES];
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

- (UIInterfaceOrientation)preferredInterfaceOrientationForPresentation {
    return UIInterfaceOrientationPortrait;
}

- (void)dealloc {
    [_rootView removeObserver:self forKeyPath:@"frame"];
    [[HippyPageCacheManager defaultPageCacheManager] addPageCache:[self toPageCache]];
}

@end
