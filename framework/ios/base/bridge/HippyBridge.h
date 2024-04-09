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
#import "HippyImageProviderProtocol.h"
#import "HippyInvalidating.h"
#import "HippyDefines.h"

#ifdef __cplusplus
#include <memory>
#endif

@class HippyJSExecutor;
@class HippyModuleData;
@class HippyRootView;

#ifdef __cplusplus
class VFSUriLoader;
class NativeRenderManager;

namespace hippy {
inline namespace dom {
class DomManager;
class RootNode;
class RenderManager;
};
};
#endif

NS_ASSUME_NONNULL_BEGIN

/**
 * Indicate hippy sdk version
 * 注意：为兼容2.0版本，保持的相同的下划线前缀命名，不可修改
 */
HIPPY_EXTERN NSString *const _HippySDKVersion;
/**
 * This notification triggers a reload of all bridges currently running.
 * Deprecated, use HippyBridge::requestReload instead.
 */
HIPPY_EXTERN NSString *const HippyReloadNotification;

/**
 * This notification fires when the bridge has finished loading the JS bundle.
 */
HIPPY_EXTERN NSString *const HippyJavaScriptDidLoadNotification;

/**
 * This notification fires when the bridge failed to load the JS bundle. The
 * `error` key can be used to determine the error that occured.
 */
HIPPY_EXTERN NSString *const HippyJavaScriptDidFailToLoadNotification;

/**
 * This notification fires each time a native module is instantiated. The
 * `module` key will contain a reference to the newly-created module instance.
 * Note that this notification may be fired before the module is available via
 * the `[bridge moduleForClass:]` method.
 */
HIPPY_EXTERN NSString *const HippyDidInitializeModuleNotification;

/**
 * This function returns the module name for a given class.
 */
HIPPY_EXTERN NSString *HippyBridgeModuleNameForClass(Class bridgeModuleClass);



/// Async bridge used to communicate with the JavaScript application.
@interface HippyBridge : NSObject <HippyInvalidating>

/// The bridge delegate
@property (nonatomic, weak, readonly) id<HippyBridgeDelegate> delegate;

/// SDK launch config
/// TODO: 优化 launchOptions 参数
@property (nonatomic, copy, readonly) NSDictionary *launchOptions;


/// Create A HippyBridge instance, without load/execute any js bundle.
///
/// @param delegate bridge delegate
/// @param block for user-defined module
/// @param launchOptions launch options, will not be sent to frontend
/// @param executorKey key to engine instance. HippyBridge with same engine key will share same engine intance.
///
/// Note: 多个bridge使用相同的共享engineKey时，只有全部bridge实例销毁时engine资源才将释放，因此，请注意合理使用，避免出现意外的内存泄漏。
/// 传空时默认不共享，SDK内部默认分配一随机key。
- (instancetype)initWithDelegate:(id<HippyBridgeDelegate>)delegate
                  moduleProvider:(nullable HippyBridgeModuleProviderBlock)block
                   launchOptions:(nullable NSDictionary *)launchOptions
                     executorKey:(nullable NSString *)executorKey;


/// Create A HippyBridge instance with a common js bundle.
///
/// This method is compatible with the Hippy2 initializer function.
///
/// @param delegate bridge delegate
/// @param bundleURL the
/// @param block for user-defined module
/// @param launchOptions launch options, will not be sent to frontend
/// @param executorKey key to engine instance. HippyBridge with same engine key will share same engine intance.
///
/// Note: 多个bridge使用相同的共享engineKey时，只有全部bridge实例销毁时engine资源才将释放，因此，请注意合理使用，避免出现意外的内存泄漏。
/// 传空时默认不共享，SDK内部默认分配一随机key。
- (instancetype)initWithDelegate:(id<HippyBridgeDelegate>)delegate
                       bundleURL:(nullable NSURL *)bundleURL
                  moduleProvider:(nullable HippyBridgeModuleProviderBlock)block
                   launchOptions:(nullable NSDictionary *)launchOptions
                     executorKey:(nullable NSString *)executorKey;

/**
 * Context name for HippyBridge
 *
 * @discussion Context name will be shown on safari development menu.
 * only for JSC engine
 */
@property (nonatomic, copy) NSString *contextName;

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

#ifdef __cplusplus
@property(nonatomic, assign)std::weak_ptr<VFSUriLoader> VFSUriLoader;
#endif

/**
 * Image provider method
 * Users adds or obtains image providers in the following methods
 */
- (void)addImageProviderClass:(Class<HippyImageProviderProtocol>)cls;
- (NSArray<Class<HippyImageProviderProtocol>> *)imageProviderClasses;

#ifdef __cplusplus
/**
 * Set basic configuration for native render
 * @param domManager DomManager
 * @param rootNode RootNode
 */
- (void)setupDomManager:(std::shared_ptr<hippy::DomManager>)domManager
               rootNode:(std::weak_ptr<hippy::RootNode>)rootNode;
#endif

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


#ifdef __cplusplus
/// The C++ version of RenderManager instance, bridge holds
@property (nonatomic, assign) std::shared_ptr<NativeRenderManager> renderManager;
#endif


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


#pragma mark - Inspector Related Functions

/// Sets whether the context is inspectable in Web Inspector.
/// Default value is NO.
///
/// - Parameter isInspectable: BOOL
- (void)setInspectable:(BOOL)isInspectable;


#pragma mark -

/// All registered bridge module classes.
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

/// Get ModuleData by name
/// - Parameter moduleName: JS name of module
- (nullable HippyModuleData *)moduleDataForName:(NSString *)moduleName;

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
 *  only work on HIPPY_DEBUG mode
 */
- (void)setRedBoxShowEnabled:(BOOL)enabled;

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

@property (nonatomic, strong) NSString *appVerson;

@property (nonatomic, assign) HippyInvalidateReason invalidateReason;

@property (nonatomic, weak) id<HippyMethodInterceptorProtocol> methodInterceptor;

@property (nonatomic, assign) BOOL enableTurbo;

/// Shared data between different rootViews on same bridge.
/// Set by HippyRootView when runHippyApplication.
/// Reserved for compatible with hippy2.
///
/// Note: Deprecated property.
@property (nonatomic, strong) NSMutableDictionary<NSNumber *, NSDictionary *> *shareOptions;

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



- (void)setRootView:(UIView *)rootView;

- (void)resetRootSize:(CGSize)size;


#pragma mark - App UI State Related

/// NightMode or not, default is NO.
/// Updated by HippyRootView
@property (atomic, assign, readonly) BOOL isOSNightMode;

/// update `NightMode` state when changed
/// - Parameter isOSNightMode: bool
/// - Parameter rootViewTag: rootView's hippyTag
- (void)setOSNightMode:(BOOL)isOSNightMode withRootViewTag:(NSNumber *)rootViewTag;


@end


HIPPY_EXTERN void HippyBridgeFatal(NSError *, HippyBridge *);

HIPPY_EXTERN void HippyBridgeHandleException(NSException *exception, HippyBridge *bridge);

NS_ASSUME_NONNULL_END
