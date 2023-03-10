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

#import "DemoConfigs.h"
#import "HippyBundleURLProvider.h"
#import "HippyRedBox.h"
#import "HPAsserts.h"
#import "HPDefaultImageProvider.h"
#import "HPLog.h"
#import "ViewController.h"
#import "HippyBridgeConnector.h"
#import "NativeRenderRootView.h"
#import "UIView+NativeRender.h"

static NSString *const engineKey = @"Demo";

@interface ViewController ()<HippyMethodInterceptorProtocol, HippyBridgeConnectorDelegate> {
    HippyBridgeConnector *_connector;
}

@end

@implementation ViewController

//release macro below for debug mode
//#define HIPPYDEBUG

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    HPSetLogFunction(^(HPLogLevel level, NSString *fileName, NSNumber *lineNumber,
                       NSString *message, NSArray<NSDictionary *> *stack, NSDictionary *userInfo) {
        if (HPLogLevelError <= level && userInfo) {
            dispatch_async(dispatch_get_main_queue(), ^{
                HippyBridge *strongBridge = [userInfo objectForKey:@"bridge"];
                if (strongBridge) {
                    [strongBridge.redBox showErrorMessage:message withStack:stack];
                }
            });
        }
        NSLog(@"hippy says:%@ in file %@ at line %@", message, fileName, lineNumber);
    });
    [self runCommonDemo];
    // [self runDemoWithoutRuntime];
}

- (void)runCommonDemo {
    BOOL isSimulator = NO;
    #if TARGET_IPHONE_SIMULATOR
        isSimulator = YES;
    #endif
    //JS Contexts holding the same engine key will share VM
    NativeRenderRootView *rootView = [[NativeRenderRootView alloc] initWithFrame:self.view.bounds];
    NSDictionary *launchOptions = nil;
    NSArray<NSURL *> *bundleURLs = nil;
    NSURL *sandboxDirectory = nil;
#ifdef HIPPYDEBUG
    NSString *bundleStr = [HippyBundleURLProvider sharedInstance].bundleURLString;
    NSURL *bundleUrl = [NSURL URLWithString:bundleStr];
    launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO), @"DebugMode": @(YES), @"DebugURL": bundleUrl};
    bundleURLs = @[bundleUrl];
    sandboxDirectory = [bundleUrl URLByDeletingLastPathComponent];
    launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO), @"DebugMode": @(YES), @"DebugURL": bundleUrl};
#else
    NSString *commonBundlePath = [[NSBundle mainBundle] pathForResource:@"vendor.ios" ofType:@"js" inDirectory:@"res"];
    NSString *businessBundlePath = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res"];
    launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO)};
    bundleURLs = @[[NSURL fileURLWithPath:commonBundlePath], [NSURL fileURLWithPath:businessBundlePath]];
    sandboxDirectory = [[NSURL fileURLWithPath:businessBundlePath] URLByDeletingLastPathComponent];
#endif
    _connector = [[HippyBridgeConnector alloc] initWithDelegate:self moduleProvider:nil extraComponents:nil launchOptions:launchOptions engineKey:engineKey];
    //set custom vfs loader
    _connector.sandboxDirectory = sandboxDirectory;
    _connector.contextName = @"Demo";
    _connector.moduleName = @"Demo";
    _connector.methodInterceptor = self;
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    [_connector setRootView:rootView];
    [_connector loadBundleURLs:bundleURLs completion:^(NSURL * _Nullable url, NSError * _Nullable error) {
        NSLog(@"url %@ load finish", [url absoluteString]);
    }];
    [_connector loadInstanceForRootViewTag:[rootView componentTag] props:@{@"isSimulator": @(isSimulator)}];
    [self.view addSubview:rootView];
}

- (HippyBridgeConnectorReloadData *)reload:(HippyBridgeConnector *)connector {
    NativeRenderRootView *rootView = [[NativeRenderRootView alloc] initWithFrame:self.view.bounds];
    NSDictionary *launchOptions = nil;
    NSArray<NSURL *> *bundleURLs = nil;
    NSURL *sandboxDirectory = nil;
#ifdef HIPPYDEBUG
    NSString *bundleStr = [HippyBundleURLProvider sharedInstance].bundleURLString;
    NSURL *bundleUrl = [NSURL URLWithString:bundleStr];
    launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO), @"DebugMode": @(YES), @"DebugURL": bundleUrl};
    bundleURLs = @[bundleUrl];
    sandboxDirectory = [bundleUrl URLByDeletingLastPathComponent];
    launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO), @"DebugMode": @(YES), @"DebugURL": bundleUrl};
#else
    NSString *commonBundlePath = [[NSBundle mainBundle] pathForResource:@"vendor.ios" ofType:@"js" inDirectory:@"res"];
    NSString *businessBundlePath = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res"];
    launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO)};
    bundleURLs = @[[NSURL fileURLWithPath:commonBundlePath], [NSURL fileURLWithPath:businessBundlePath]];
    sandboxDirectory = [[NSURL fileURLWithPath:businessBundlePath] URLByDeletingLastPathComponent];
#endif
    BOOL isSimulator = NO;
    #if TARGET_IPHONE_SIMULATOR
        isSimulator = YES;
    #endif
    NSDictionary *props = @{@"isSimulator": @(isSimulator)};
    HippyBridgeConnectorReloadData *data = [[HippyBridgeConnectorReloadData alloc] init];
    data.rootView = rootView;
    data.props = props;
    data.URLs = bundleURLs;
    [self.view addSubview:rootView];
    return data;
}

- (void)removeRootView:(NSNumber *)rootTag connector:(HippyBridgeConnector *)connector {
    [[[self.view subviews] firstObject] removeFromSuperview];
}

- (BOOL)shouldStartInspector:(HippyBridgeConnector *)connector {
    return connector.bridge.debugMode;
}

- (BOOL)shouldInvokeWithModuleName:(NSString *)moduleName methodName:(NSString *)methodName arguments:(NSArray<id<HippyBridgeArgument>> *)arguments argumentsValues:(NSArray *)argumentsValue containCallback:(BOOL)containCallback {
    HPAssert(moduleName, @"module name must not be null");
    HPAssert(methodName, @"method name must not be null");
    return YES;
}

- (BOOL)shouldCallbackBeInvokedWithModuleName:(NSString *)moduleName methodName:(NSString *)methodName callbackId:(NSNumber *)cbId arguments:(id)arguments {
    HPAssert(moduleName, @"module name must not be null");
    HPAssert(methodName, @"method name must not be null");
    return YES;
}

@end
