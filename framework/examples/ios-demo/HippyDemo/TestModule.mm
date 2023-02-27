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
#import "DemoConfigs.h"
#import "TestModule.h"
#import "HippyBridge.h"
#import "HippyBridgeDelegate.h"
#import "HippyBundleURLProvider.h"
#import "HippyDemoLoader.h"
#import "HippyJSEnginesMapper.h"
#import "NativeRenderManager.h"
#import "NativeRenderRootView.h"
#import "UIView+NativeRender.h"
#import "NativeRenderImpl.h"
#import "HippyJSExecutor.h"
#import "HPOCToHippyValue.h"
#import "HippyFileHandler.h"
#include "driver/scope.h"

static NSString *const engineKey = @"Demo";

@interface TestModule ()<HippyBridgeDelegate> {
    HippyBridge *_bridge;
    std::shared_ptr<NativeRenderManager> _nativeRenderManager;
    std::shared_ptr<hippy::RootNode> _rootNode;
    __weak UIViewController *_weakVC;
    std::shared_ptr<HippyDemoHandler> _demoHandler;
    std::shared_ptr<HippyDemoLoader> _demoLoader;
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
    AppDelegate *delegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
    UIViewController *rootViewController = delegate.window.rootViewController;
    UIViewController *vc = [[UIViewController alloc] init];
    BOOL isSimulator = NO;
#if TARGET_IPHONE_SIMULATOR
    isSimulator = YES;
#endif
    NSString *urlString = [[HippyBundleURLProvider sharedInstance] bundleURLString];
    if (bundleUrl.length > 0) {
        urlString = bundleUrl;
    }
    NSURL *url = [NSURL URLWithString:bundleUrl];
    NativeRenderRootView *rootView = [[NativeRenderRootView alloc] initWithFrame:rootViewController.view.bounds];
    NSDictionary *launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO), @"DebugMode": @(YES), @"DebugURL": url};
    NSArray<NSURL *> *bundleURLs = @[url];
    NSURL *sandboxDirectory = [url URLByDeletingLastPathComponent];
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                 moduleProvider:nil
                                                  launchOptions:launchOptions
                                                    engineKey:@"Demo"];
    [self setupBridge:bridge rootView:rootView bundleURLs:bundleURLs props:@{@"isSimulator": @(isSimulator)}];
    bridge.sandboxDirectory = sandboxDirectory;
    bridge.contextName = @"Demo";
    bridge.moduleName = @"Demo";
    _bridge = bridge;
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    [vc.view addSubview:rootView];
    vc.modalPresentationStyle = UIModalPresentationFullScreen;
    [rootViewController presentViewController:vc animated:YES completion:NULL];
    _weakVC = vc;
}

- (void)registerVFSLoader {
    _demoHandler = std::make_shared<HippyDemoHandler>();
    _demoLoader = std::make_shared<HippyDemoLoader>();
    _demoLoader->PushDefaultHandler(_demoHandler);
    _demoLoader->AddConvenientDefaultHandler(_demoHandler);
    
    auto fileHandler = std::make_shared<HippyFileHandler>(_bridge);
    _demoLoader->RegisterConvenientUriHandler(@"hpfile", fileHandler);
    
    [_bridge setVFSUriLoader:_demoLoader];
    
    _nativeRenderManager->SetVFSUriLoader(_demoLoader);
}


- (void)setupBridge:(HippyBridge *)bridge rootView:(UIView *)rootView bundleURLs:(NSArray<NSURL *> *)bundleURLs props:(NSDictionary *)props {
    //Get DomManager from HippyJSEnginesMapper with Engine key
    auto engineResource = [[HippyJSEnginesMapper defaultInstance] createJSEngineResourceForKey:engineKey];
    auto domManager = engineResource->GetDomManager();
    NSNumber *rootTag = [rootView componentTag];
    //Create a RootNode instance with a root tag
    auto rootNode = std::make_shared<hippy::RootNode>([rootTag unsignedIntValue]);
    //Set RootNode for AnimationManager in RootNode
    rootNode->GetAnimationManager()->SetRootNode(rootNode);
    //Set DomManager for RootNode
    rootNode->SetDomManager(domManager);
    //Set screen scale factor and size for Layout system in RooNode
    rootNode->GetLayoutNode()->SetScaleFactor([UIScreen mainScreen].scale);
    rootNode->SetRootSize(rootView.frame.size.width, rootView.frame.size.height);
    
    //Create NativeRenderManager
    _nativeRenderManager = std::make_shared<NativeRenderManager>();
    //set dom manager
    _nativeRenderManager->SetDomManager(domManager);
    
    //set rendermanager for dommanager
    domManager->SetRenderManager(_nativeRenderManager);
    //bind rootview and root node
    _nativeRenderManager->RegisterRootView(rootView, rootNode);
    
    //setup necessary params for bridge
    [bridge setupDomManager:domManager rootNode:rootNode];
    [bridge loadBundleURLs:bundleURLs completion:^(NSURL * _Nullable url, NSError * _Nullable error) {
        NSLog(@"url %@ completion", url);
    }];
    [bridge loadInstanceForRootView:rootTag withProperties:props];
    
    _rootNode = rootNode;
}

- (void)removeRootView {
    //1.remove root view from UI hierarchy
    UIViewController *vc = _weakVC;
    if (vc) {
        [[[vc.view subviews] firstObject] removeFromSuperview];
    }
    //2.unregister root node from render context by id.
    _nativeRenderManager->UnregisterRootView(_rootNode->GetId());
    //3.set elements holding by user to nil
    _rootNode = nil;
}

- (void)reload:(HippyBridge *)bridge {
    [self removeRootView];
    UIViewController *vc = _weakVC;
    if (!vc) {
        return;
    }
    AppDelegate *delegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
    UIViewController *rootViewController = delegate.window.rootViewController;
    NativeRenderRootView *rootView = [[NativeRenderRootView alloc] initWithFrame:rootViewController.view.bounds];
    NSArray<NSURL *> *bundleURLs = nil;
    NSString *bundleStr = [HippyBundleURLProvider sharedInstance].bundleURLString;
    NSURL *bundleUrl = [NSURL URLWithString:bundleStr];
    bundleURLs = @[bundleUrl];
    BOOL isSimulator = NO;
#if TARGET_IPHONE_SIMULATOR
    isSimulator = YES;
#endif

    [self setupBridge:bridge rootView:rootView bundleURLs:bundleURLs props:@{@"isSimulator": @(isSimulator)}];
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    [vc.view addSubview:rootView];
}

- (BOOL)shouldStartInspector:(HippyBridge *)bridge {
    return bridge.debugMode;
}

- (void)invalidateForReason:(HPInvalidateReason)reason bridge:(HippyBridge *)bridge {
    [_nativeRenderManager->rootViews() enumerateObjectsUsingBlock:^(UIView * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if ([obj respondsToSelector:@selector(invalidate)]) {
            [obj performSelector:@selector(invalidate)];
        }
        NSDictionary *param = @{@"id": [obj componentTag]};
        footstone::value::HippyValue value = [param toHippyValue];
        std::shared_ptr<footstone::value::HippyValue> domValue = std::make_shared<footstone::value::HippyValue>(value);
        bridge.javaScriptExecutor.pScope->UnloadInstance(domValue);
    }];
}

- (void)removeRootNode:(NSNumber *)rootTag bridge:(HippyBridge *)bridge{
    _nativeRenderManager->UnregisterRootView([rootTag intValue]);
}

@end
