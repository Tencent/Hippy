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

#import "AppDelegate.h"
#import "TestModule.h"
#import "HippyBundleURLProvider.h"
#import "HippyDemoLoader.h"
#import "HippyJSEnginesMapper.h"
#import "NativeRenderRootView.h"
#import "UIView+NativeRender.h"
#import "HippyConvenientBridge.h"
#import "HPLog.h"
#import "HippyRedBox.h"
#import "DemoConfigs.h"
#import "HippyMethodInterceptorProtocol.h"
#import "HPAsserts.h"

static NSString *const engineKey = @"Demo";

@interface TestModule ()<HippyMethodInterceptorProtocol, HippyBridgeDelegate> {
    HippyConvenientBridge *_connector;
}

@end

@implementation TestModule

HIPPY_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue {
	return dispatch_get_main_queue();
}

HIPPY_EXPORT_METHOD(debug:(nonnull NSNumber *)instanceId) {
}

HIPPY_EXPORT_METHOD(remoteDebug:(nonnull NSNumber *)instanceId bundleUrl:(nonnull NSString *)bundleUrl) {
    [self runCommonDemo:bundleUrl];
}

- (void)runCommonDemo:(nonnull NSString *)bundleUrl {
    BOOL isSimulator = NO;
    #if TARGET_IPHONE_SIMULATOR
        isSimulator = YES;
    #endif
    AppDelegate *delegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
    UIViewController *rootViewController = delegate.window.rootViewController;
    UIViewController *vc = [[UIViewController alloc] init];
    //JS Contexts holding the same engine key will share VM
    NSURL *url = [NSURL URLWithString:bundleUrl];
    NSDictionary *launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO), @"DebugMode": @(YES), @"DebugURL": url};
    NSURL *sandboxDirectory = [url URLByDeletingLastPathComponent];
    _connector = [[HippyConvenientBridge alloc] initWithDelegate:self moduleProvider:nil extraComponents:nil launchOptions:launchOptions engineKey:engineKey];
    [_connector setInspectable:YES];
    //set custom vfs loader
    _connector.sandboxDirectory = sandboxDirectory;
    _connector.contextName = @"Demo";
    _connector.moduleName = @"Demo";
    _connector.methodInterceptor = self;
    vc.modalPresentationStyle = UIModalPresentationFullScreen;
    [self mountConnector:_connector onView:vc.view];
    [rootViewController presentViewController:vc animated:YES completion:NULL];
}

- (void)mountConnector:(HippyConvenientBridge *)connector onView:(UIView *)view {
    BOOL isSimulator = NO;
#if TARGET_IPHONE_SIMULATOR
        isSimulator = YES;
#endif

    NSString *bundleStr = [HippyBundleURLProvider sharedInstance].bundleURLString;
    NSURL *bundleUrl = [NSURL URLWithString:bundleStr];

    NativeRenderRootView *rootView = [[NativeRenderRootView alloc] initWithFrame:view.bounds];
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    [_connector setRootView:rootView];
    NSNumber *rootTag = [rootView componentTag];
    [connector loadBundleURL:bundleUrl completion:^(NSURL * _Nullable, NSError * _Nullable) {
        NSLog(@"url %@ load finish", bundleStr);
        [connector loadInstanceForRootViewTag:rootTag props:@{@"isSimulator": @(isSimulator)}];
    }];
    [view addSubview:rootView];
}

- (void)reload:(HippyBridge *)bridge {
    AppDelegate *delegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
    UIViewController *rootViewController = delegate.window.rootViewController;
    UIViewController *vc = rootViewController.presentedViewController;
    [self mountConnector:_connector onView:vc.view];
}

- (void)removeRootView:(NSNumber *)rootTag bridge:(HippyBridge *)bridge {
    AppDelegate *delegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
    UIViewController *rootViewController = delegate.window.rootViewController;
    UIViewController *vc = rootViewController.presentedViewController;
    [[[vc.view subviews] firstObject] removeFromSuperview];
}

- (BOOL)shouldStartInspector:(HippyBridge *)bridge {
    return bridge.debugMode;
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
