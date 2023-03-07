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

#import "HippyBridgeConnector.h"

#import "HippyBridge.h"
#import "NativeRenderManager.h"
#import "HippyJSEnginesMapper.h"
#import "UIView+NativeRender.h"
#import "HPDefaultImageProvider.h"
#import "VFSUriLoader.h"
#import "HippyFileHandler.h"

#include <memory>

#include "dom/root_node.h"

@interface HippyBridgeConnector () {
    HippyBridge *_bridge;
    std::shared_ptr<NativeRenderManager> _nativeRenderManager;
    std::shared_ptr<hippy::RootNode> _rootNode;
    std::shared_ptr<VFSUriLoader> _demoLoader;
    NSString *_engineKey;
}

@end

@implementation HippyBridgeConnector

- (instancetype)initWithDelegate:(id<HippyBridgeDelegate> _Nullable)delegate
                  moduleProvider:(HippyBridgeModuleProviderBlock _Nullable)block
                   launchOptions:(NSDictionary * _Nullable)launchOptions
                       engineKey:(NSString *)engineKey {
    self = [super init];
    if (self) {
        _bridge = [[HippyBridge alloc] initWithDelegate:delegate moduleProvider:block
                                          launchOptions:launchOptions engineKey:engineKey];
        _engineKey = engineKey;
    }
    return self;
}

- (void)loadBundleURLs:(NSArray<NSURL *> *)bundleURLs
            completion:(void (^_Nullable)(NSURL  * _Nullable, NSError * _Nullable))completion {
    [_bridge loadBundleURLs:bundleURLs completion:completion];
}

- (void) setRootView:(UIView *)rootView {
    auto engineResource = [[HippyJSEnginesMapper defaultInstance] createJSEngineResourceForKey:_engineKey];
    auto domManager = engineResource->GetDomManager();
    NSNumber *rootTag = [rootView componentTag];
    //Create a RootNode instance with a root tag
    _rootNode = std::make_shared<hippy::RootNode>([rootTag unsignedIntValue]);
    //Set RootNode for AnimationManager in RootNode
    _rootNode->GetAnimationManager()->SetRootNode(_rootNode);
    //Set DomManager for RootNode
    _rootNode->SetDomManager(domManager);
    //Set screen scale factor and size for Layout system in RooNode
    _rootNode->GetLayoutNode()->SetScaleFactor([UIScreen mainScreen].scale);
    _rootNode->SetRootSize(rootView.frame.size.width, rootView.frame.size.height);
    
    //Create NativeRenderManager
    _nativeRenderManager = std::make_shared<NativeRenderManager>();
    //set dom manager
    _nativeRenderManager->SetDomManager(domManager);
    //set image provider for native render manager
    _nativeRenderManager->AddImageProviderClass([HPDefaultImageProvider class]);

    [self registerVFSLoader];
    
    //set rendermanager for dommanager
    domManager->SetRenderManager(_nativeRenderManager);
    //bind rootview and root node
    _nativeRenderManager->RegisterRootView(rootView, _rootNode);

    __weak HippyBridge *weakBridge = _bridge;
    auto cb = [weakBridge](int32_t tag, NSDictionary *params){
        HippyBridge *strongBridge = weakBridge;
        if (strongBridge) {
            [strongBridge rootViewSizeChangedEvent:@(tag) params:params];
        }
    };
    _nativeRenderManager->SetRootViewSizeChangedEvent(cb);
    
    //setup necessary params for bridge
    [_bridge setupDomManager:domManager rootNode:_rootNode];
}

- (void)loadInstanceForRootViewTag:(NSNumber *)tag props:(NSDictionary *)props {
    [_bridge loadInstanceForRootView:tag withProperties:props];
}

- (void)registerVFSLoader {
    auto demoHandler = std::make_shared<VFSUriHandler>();
    _demoLoader = std::make_shared<VFSUriLoader>();
    _demoLoader->PushDefaultHandler(demoHandler);
    _demoLoader->AddConvenientDefaultHandler(demoHandler);
    
    auto fileHandler = std::make_shared<HippyFileHandler>(_bridge);
    _demoLoader->RegisterConvenientUriHandler(@"hpfile", fileHandler);
    
    [_bridge setVFSUriLoader:_demoLoader];
    
    _nativeRenderManager->SetVFSUriLoader(_demoLoader);
}

@end
