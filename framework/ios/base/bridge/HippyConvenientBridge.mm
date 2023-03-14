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

#import "HippyConvenientBridge.h"

#import "HippyBridge.h"
#import "NativeRenderManager.h"
#import "HippyJSEnginesMapper.h"
#import "UIView+NativeRender.h"
#import "HPDefaultImageProvider.h"
#import "VFSUriLoader.h"
#import "HippyFileHandler.h"
#import "HippyMethodInterceptorProtocol.h"
#import "HPLog.h"

#include <memory>

#include "dom/root_node.h"

@interface HippyConvenientBridge ()<HippyBridgeDelegate> {
    HippyBridge *_bridge;
    std::shared_ptr<NativeRenderManager> _nativeRenderManager;
    std::shared_ptr<hippy::RootNode> _rootNode;
    std::shared_ptr<VFSUriLoader> _demoLoader;
    NSString *_engineKey;
    NSArray<Class> *_extraComponents;
}

@end

@implementation HippyConvenientBridge

@synthesize bridge = _bridge;

- (instancetype)initWithDelegate:(id<HippyConvenientBridgeDelegate> _Nullable)delegate
                  moduleProvider:(HippyBridgeModuleProviderBlock _Nullable)block
                 extraComponents:(NSArray<Class> * _Nullable)extraComponents
                   launchOptions:(NSDictionary * _Nullable)launchOptions
                       engineKey:(NSString *)engineKey {
    self = [super init];
    if (self) {
        _bridge = [[HippyBridge alloc] initWithDelegate:self moduleProvider:block
                                          launchOptions:launchOptions engineKey:engineKey];
        _engineKey = engineKey;
        _extraComponents = extraComponents;
        _delegate = delegate;
        [_bridge addImageProviderClass:[HPDefaultImageProvider class]];
        [_bridge setVFSUriLoader:[self URILoader]];
        [self setUpNativeRenderManager];
    }
    return self;
}

- (void)setUpNativeRenderManager {
    auto engineResource = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:_engineKey];
    auto domManager = engineResource->GetDomManager();
    //Create NativeRenderManager
    _nativeRenderManager = std::make_shared<NativeRenderManager>();
    //set dom manager
    _nativeRenderManager->SetDomManager(domManager);
    //set image provider for native render manager
    _nativeRenderManager->AddImageProviderClass([HPDefaultImageProvider class]);
    _nativeRenderManager->RegisterExtraComponent(_extraComponents);
    _nativeRenderManager->SetVFSUriLoader([self URILoader]);
}

- (std::shared_ptr<VFSUriLoader>)URILoader {
    if (!_demoLoader) {
        auto demoHandler = std::make_shared<VFSUriHandler>();
        _demoLoader = std::make_shared<VFSUriLoader>();
        _demoLoader->PushDefaultHandler(demoHandler);
        _demoLoader->AddConvenientDefaultHandler(demoHandler);
        auto fileHandler = std::make_shared<HippyFileHandler>(_bridge);
        _demoLoader->RegisterConvenientUriHandler(@"hpfile", fileHandler);
    }
    return _demoLoader;
}

- (void)setModuleName:(NSString *)moduleName {
    _bridge.moduleName = moduleName;
}

- (NSString *)moduleName {
    return _bridge.moduleName;
}

- (void)setContextName:(NSString *)contextName {
    _bridge.contextName = contextName;
}

- (NSString *)contextName {
    return _bridge.contextName;
}

- (void)setSandboxDirectory:(NSURL *)sandboxDirectory {
    _bridge.sandboxDirectory = sandboxDirectory;
}

- (NSURL *)sandboxDirectory {
    return _bridge.sandboxDirectory;
}

- (void)setMethodInterceptor:(id<HippyMethodInterceptorProtocol>)methodInterceptor {
    _bridge.methodInterceptor = methodInterceptor;
}

- (id<HippyMethodInterceptorProtocol>)methodInterceptor {
    return _bridge.methodInterceptor;
}

- (void)loadBundleURL:(NSURL *)bundleURL completion:(HippyBridgeBundleLoadCompletion)completion {
    [_bridge loadBundleURL:bundleURL completion:completion];
}

- (void)setRootView:(UIView *)rootView {
    auto engineResource = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:_engineKey];
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

- (void)addExtraComponents:(NSArray<Class> *)components {
    _nativeRenderManager->RegisterExtraComponent(components);
}

- (void)loadInstanceForRootViewTag:(NSNumber *)tag props:(NSDictionary *)props {
    [_bridge loadInstanceForRootView:tag withProperties:props];
}

- (void)unloadRootViewByTag:(NSNumber *)tag {
    [_bridge unloadInstanceForRootView:tag];
    _nativeRenderManager->UnregisterRootView([tag intValue]);
    _rootNode = nullptr;
}

- (void)addImageProviderClass:(Class<HPImageProviderProtocol>)cls {
    [_bridge addImageProviderClass:cls];
    _nativeRenderManager->AddImageProviderClass([HPDefaultImageProvider class]);
}

#pragma mark HippyBridge Delegate

- (BOOL)shouldStartInspector:(HippyBridge *)bridge {
    return [self.delegate respondsToSelector:@selector(shouldStartInspector:)] ?
    [self.delegate shouldStartInspector:self] :
    NO;
}

- (NSData *)cachedCodeForConnector:(HippyBridge *)bridge
                            script:(NSString *)script
                         sourceURL:(NSURL *)sourceURL {
    return [self.delegate respondsToSelector:@selector(cachedCodeForConnector:script:sourceURL:)] ?
    [self.delegate cachedCodeForConnector:self script:script sourceURL:sourceURL] :
    nil;
}

- (void)cachedCodeCreated:(NSData *)cachedCode ForBridge:(HippyBridge *)bridge script:(NSString *)script sourceURL:(NSURL *)sourceURL {
    if ([self.delegate respondsToSelector:@selector(cachedCodeCreated:ForConnector:script:sourceURL:)]) {
        [self.delegate cachedCodeCreated:cachedCode ForConnector:self script:script sourceURL:sourceURL];
    }
}

- (void)reload:(HippyBridge *)bridge {
    if ([self.delegate respondsToSelector:@selector(reload:)]) {
        [self.delegate reload:self];
    }
}

- (void)removeRootView:(NSNumber *)rootTag bridge:(HippyBridge *)bridge {
    if ([self.delegate respondsToSelector:@selector(removeRootView:connector:)]) {
        [self.delegate removeRootView:rootTag connector:self];
    }
}

- (void)invalidateForReason:(HPInvalidateReason)reason bridge:(HippyBridge *)bridge {
    [_nativeRenderManager->rootViews() enumerateObjectsUsingBlock:^(UIView * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if ([obj respondsToSelector:@selector(invalidate)]) {
            [obj performSelector:@selector(invalidate)];
        }
        [self unloadRootViewByTag:[obj componentTag]];
    }];
}

@end
