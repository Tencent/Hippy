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

#import <UIKit/UIKit.h>

#import "HippyBridgeDelegate.h"
#import "HippyBridgeModule.h"
#import "HippyMethodInterceptorProtocol.h"
#import "HippyModulesSetup.h"
#import "HPImageProviderProtocol.h"
#import "HPInvalidating.h"
#import "MacroDefines.h"

#include <memory>

@class HippyJSExecutor;
@class HippyModuleData;

class VFSUriLoader;

namespace hippy {
inline namespace dom {
class DomManager;
class RootNode;
class RenderManager;
};
};

NS_ASSUME_NONNULL_BEGIN

/**
 * Indicate hippy sdk version
 */
HP_EXTERN NSString *const HippySDKVersion;
/**
 * This notification triggers a reload of all bridges currently running.
 * Deprecated, use HippyBridge::requestReload instead.
 */
HP_EXTERN NSString *const HippyReloadNotification;

/**
 * This notification fires when the bridge has finished loading the JS bundle.
 */
HP_EXTERN NSString *const HippyJavaScriptDidLoadNotification;

/**
 * This notification fires when the bridge failed to load the JS bundle. The
 * `error` key can be used to determine the error that occured.
 */
HP_EXTERN NSString *const HippyJavaScriptDidFailToLoadNotification;

/**
 * This notification fires each time a native module is instantiated. The
 * `module` key will contain a reference to the newly-created module instance.
 * Note that this notification may be fired before the module is available via
 * the `[bridge moduleForClass:]` method.
 */
HP_EXTERN NSString *const HippyDidInitializeModuleNotification;

/**
 * This function returns the module name for a given class.
 */
HP_EXTERN NSString *HippyBridgeModuleNameForClass(Class bridgeModuleClass);

/**
 * Async batched bridge used to communicate with the JavaScript application.
 */
@interface HippyBridge : NSObject <HPInvalidating>

@property (nonatomic, weak, readonly) id<HippyBridgeDelegate> delegate;

@property (nonatomic, copy, readonly) NSDictionary *launchOptions;

@property (nonatomic, assign) std::weak_ptr<hippy::RenderManager> renderManager;

/**
 *  Create A HippyBridge instance
 *
 *  @param delegate bridge delegate
 *  @param block for user-defined module
 *  @param launchOptions launch options, will not be sent to frontend
 *  @param engineKey key to engine instance. HippyBridge with same engine key will share same engine intance
 *  @return A HippyBridge instance
 */
- (instancetype)initWithDelegate:(id<HippyBridgeDelegate>)delegate
                  moduleProvider:(HippyBridgeModuleProviderBlock)block
                   launchOptions:(NSDictionary *)launchOptions
                       engineKey:(NSString *)engineKey;

/**
 * Context name for HippyBridge
 *
 * @discussion Context name will be shown on safari development menu.
 * only for JSC engine
 */
@property(nonatomic, copy)NSString *contextName;

/**
 * Set module name
 *
 *@discussion module name will show in error infomation
 */
@property (nonatomic, strong) NSString *moduleName;

/**
 * URLs of the script that was loaded into the bridge.
 */
@property (nonatomic, copy, readonly) NSArray<NSURL *> *bundleURLs;

/**
 * Set debug url for devtools
 */
@property (nonatomic, strong, readonly) NSURL *debugURL;

/**
 *  Load js bundles from urls
 *
 *  @param bundleURL bundles url
 *  @discussion HippyBridge makes sure bundles will be loaded in order.
 */
- (void)loadBundleURL:(NSURL *)bundleURL
           completion:(void (^_Nullable)(NSURL * _Nullable, NSError * _Nullable))completion;

@property(nonatomic, assign)std::weak_ptr<VFSUriLoader> VFSUriLoader;

/**
 * Image provider method
 * Users adds or obtains image providers in the following methods
 */
- (void)addImageProviderClass:(Class<HPImageProviderProtocol>)cls;
- (NSArray<Class<HPImageProviderProtocol>> *)imageProviderClasses;

/**
 * Set basic configuration for native render
 * @param domManager DomManager
 * @param rootNode RootNode
 */
- (void)setupDomManager:(std::shared_ptr<hippy::DomManager>)domManager
               rootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 *  Load instance for root view and show views
 *  @param rootTag RootTag for specific root view
 *  @param props Initial parameters for instance.
 */
- (void)loadInstanceForRootView:(NSNumber *)rootTag withProperties:(NSDictionary *)props;

- (void)unloadInstanceForRootView:(NSNumber *)rootTag;

- (void)rootViewSizeChangedEvent:(NSNumber *)tag params:(NSDictionary *)params;

/**
 * Access the underlying JavaScript executor. You can use this in unit tests to detect
 * when the executor has been invalidated, or when you want to schedule calls on the
 * JS VM outside of Hippy Native. Use with care!
 */
@property (nonatomic, readonly) HippyJSExecutor *javaScriptExecutor;

/**
 * JS invocation methods
 */
- (void)enqueueJSCall:(NSString *)moduleDotMethod args:(NSArray *)args;
- (void)enqueueJSCall:(NSString *)module method:(NSString *)method
                 args:(NSArray *)args
           completion:(dispatch_block_t _Nullable)completion;

- (void)enqueueCallback:(NSNumber *)cbID args:(NSArray *)args;

- (void)registerModuleForFrameUpdates:(id<HippyBridgeModule>)module withModuleData:(HippyModuleData *)moduleData;

- (void)handleBuffer:(id _Nullable)buffer batchEnded:(BOOL)batchEnded;

- (void)setInspectable:(BOOL)isInspectable;

/**
 * All registered bridge module classes.
 */
@property (nonatomic, copy, readonly) NSArray<Class> *moduleClasses;

- (NSString *)moduleConfig;

- (NSArray *)configForModuleName:(NSString *)moduleName;

- (BOOL)moduleSetupComplete;
/**
 * Retrieve a bridge module instance by name or class. Note that modules are
 * lazily instantiated, so calling these methods for the first time with a given
 * module name/class may cause the class to be sychronously instantiated,
 * potentially blocking both the calling thread and main thread for a short time.
 */
- (id)moduleForName:(NSString *)moduleName;
- (id)moduleForClass:(Class)moduleClass;

/**
 * Convenience method for retrieving all modules conforming to a given protocol.
 * Modules will be sychronously instantiated if they haven't already been,
 * potentially blocking both the calling thread and main thread for a short time.
 */
- (NSArray *)modulesConformingToProtocol:(Protocol *)protocol;

/**
 * Test if a module has been initialized. Use this prior to calling
 * `moduleForClass:` or `moduleForName:` if you do not want to cause the module
 * to be instantiated if it hasn't been already.
 */
- (BOOL)moduleIsInitialized:(Class)moduleClass;

/** A red box will show when error occurs by default
 *  only work on HP_DEBUG mode
 */
- (void)setRedBoxShowEnabled:(BOOL)enabled;

/**
 * just for debugger
 */
- (void)bindKeys;

/**
 * Use this to check if the bridge has been invalidated.
 */
@property (nonatomic, readonly, getter=isValid) BOOL valid;

@property (nonatomic, readonly, getter=isLoading) BOOL loading;

/**
 * Reload the bundle and reset executor & modules. Safe to call from any thread.
 */
- (void)reload;

/**
 * Inform the bridge, and anything subscribing to it, that it should reload.
 */
- (void)requestReload;

@property (nonatomic, assign) BOOL debugMode;

@property (nonatomic, strong) NSString *appVerson;  //

@property (nonatomic, assign) HPInvalidateReason invalidateReason;

@property (nonatomic, weak) id<HippyMethodInterceptorProtocol> methodInterceptor;


@property (nonatomic, assign) BOOL enableTurbo;
/**
 * Get  the turbo module for a given name.
 */
- (id)turboModuleWithName:(NSString *)name;

- (NSDictionary *)deviceInfo;

/**
 * property to path of sandbox directory
 */
@property (nonatomic, strong) NSURL *sandboxDirectory;

#pragma mark event dispatcher
- (void)sendEvent:(NSString *)eventName params:(NSDictionary *_Nullable)params;

#pragma mark snapshot
- (NSData *)snapShotData;

- (void)setSnapShotData:(NSData *)data;

@end


@interface HippyBridge (RedBoxDebug)

/// The last current active bridge instance.
+ (instancetype)currentBridge;

/// Record the last active bridge instance.
/// - Parameter currentBridge: bridge instance, pass nil to reset.
+ (void)setCurrentBridge:(nullable HippyBridge *)currentBridge;

@end


HP_EXTERN void HippyBridgeFatal(NSError *, HippyBridge *);

HP_EXTERN void HippyBridgeHandleException(NSException *exception, HippyBridge *bridge);

NS_ASSUME_NONNULL_END
