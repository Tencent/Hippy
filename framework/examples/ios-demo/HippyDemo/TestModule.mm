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

@interface TestModule ()<HippyBridgeDelegate> {
    HippyBridge *_bridge;
    std::shared_ptr<NativeRenderManager> _nativeRenderManager;
    std::shared_ptr<hippy::RootNode> _rootNode;
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
    static NSString *const engineKey = @"Demo";
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
    NSNumber *rootTag = rootView.componentTag;
    NSDictionary *launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO), @"DebugMode": @(YES)};;
    NSArray<NSURL *> *bundleURLs = @[url];
    NSURL *sandboxDirectory = [url URLByDeletingLastPathComponent];
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                 moduleProvider:nil
                                                  launchOptions:launchOptions
                                                    engineKey:@"Demo"];
    
    //Get DomManager from HippyJSEnginesMapper with Engine key
    auto engineResource = [[HippyJSEnginesMapper defaultInstance] createJSEngineResourceForKey:engineKey];
    auto domManager = engineResource->GetDomManager();
    
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
    auto renderManager = std::make_shared<NativeRenderManager>();
    //Set frameproxy for render manager
    renderManager->SetFrameworkProxy(bridge);
    //bind rootview and root node
    renderManager->RegisterRootView(rootView, rootNode);
    //set dom manager
    renderManager->SetDomManager(domManager);
    
    //set rendermanager for dommanager
    domManager->SetRenderManager(renderManager);
    id<HPRenderContext> renderContext = renderManager->GetRenderContext();
    
    //setup necessary params for bridge
    [bridge setupDomManager:domManager rootNode:rootNode renderContext:renderContext];
    //set custom vfs loader
    bridge.uriLoader = std::make_shared<HippyDemoLoader>();
    
    [bridge loadBundleURLs:bundleURLs];
    [bridge loadInstanceForRootView:rootTag  withProperties:@{@"isSimulator": @(isSimulator)}];
    bridge.sandboxDirectory = sandboxDirectory;
    bridge.contextName = @"Demo";
    bridge.moduleName = @"Demo";
    _bridge = bridge;
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    [vc.view addSubview:rootView];
    vc.modalPresentationStyle = UIModalPresentationFullScreen;
    [rootViewController presentViewController:vc animated:YES completion:NULL];
    
    _rootNode = rootNode;
    _nativeRenderManager = renderManager;
    _bridge = bridge;

}

- (BOOL)shouldStartInspector:(HippyBridge *)bridge {
    return bridge.debugMode;
}

- (NSURL *)inspectorSourceURLForBridge:(HippyBridge *)bridge {
    return bridge.bundleURL;
}

@end
