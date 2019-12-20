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
#import "HippyDefines.h"
#import "HippyFrameUpdate.h"
#import "HippyInvalidating.h"
#import "HippyImageViewCustomLoader.h"
#import "HippyCustomTouchHandlerProtocol.h"

@class JSValue;
@class HippyBridge;
@class HippyEventDispatcher;
@class HippyPerformanceLogger;
@class HippyUIManager;
@class HippyExtAnimationModule;
extern NSString *const _HippySDKVersion;
/**
 * This notification triggers a reload of all bridges currently running.
 * Deprecated, use HippyBridge::requestReload instead.
 */
HIPPY_EXTERN NSString *const HippyReloadNotification;

/**
 * This notification fires when the bridge starts loading the JS bundle.
 */
HIPPY_EXTERN NSString *const HippyJavaScriptWillStartLoadingNotification;

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

// MttRN: 业务代码已经成功加载的通知
HIPPY_EXTERN NSString *const HippyBusinessDidLoadNotification;

/**
 * This block can be used to instantiate modules that require additional
 * init parameters, or additional configuration prior to being used.
 * The bridge will call this block to instatiate the modules, and will
 * be responsible for invalidating/releasing them when the bridge is destroyed.
 * For this reason, the block should always return new module instances, and
 * module instances should not be shared between bridges.
 */
typedef NSArray<id<HippyBridgeModule>> *(^HippyBridgeModuleProviderBlock)(void);

/**
 * This function returns the module name for a given class.
 */
HIPPY_EXTERN NSString *HippyBridgeModuleNameForClass(Class bridgeModuleClass);


/**
 * Async batched bridge used to communicate with the JavaScript application.
 */
@interface HippyBridge : NSObject <HippyInvalidating>
/**
 * Creates a new bridge with a custom HippyBridgeDelegate.
 *
 * All the interaction with the JavaScript context should be done using the bridge
 * instance of the HippyBridgeModules. Modules will be automatically instantiated
 * using the default contructor, but you can optionally pass in an array of
 * pre-initialized module instances if they require additional init parameters
 * or configuration.
 */
- (instancetype)initWithDelegate:(id<HippyBridgeDelegate>)delegate
                   launchOptions:(NSDictionary *)launchOptions;

/**
 * DEPRECATED: Use initWithDelegate:launchOptions: instead
 *
 * The designated initializer. This creates a new bridge on top of the specified
 * executor. The bridge should then be used for all subsequent communication
 * with the JavaScript code running in the executor. Modules will be automatically
 * instantiated using the default contructor, but you can optionally pass in an
 * array of pre-initialized module instances if they require additional init
 * parameters or configuration.
 */
- (instancetype)initWithBundleURL:(NSURL *)bundleURL
                   moduleProvider:(HippyBridgeModuleProviderBlock)block
                    launchOptions:(NSDictionary *)launchOptions;

/**
 * This method is used to call functions in the JavaScript application context.
 * It is primarily intended for use by modules that require two-way communication
 * with the JavaScript code. Safe to call from any thread.
 */
- (void)enqueueJSCall:(NSString *)moduleDotMethod args:(NSArray *)args;
- (void)enqueueJSCall:(NSString *)module method:(NSString *)method args:(NSArray *)args completion:(dispatch_block_t)completion;

/**
 * This method is used to call functions in the JavaScript application context
 * synchronously.  This is intended for use by applications which do their own
 * thread management and are careful to manage multi-threaded access to the JSVM.
 * See also -[HippyBridgeDelgate shouldBridgeLoadJavaScriptSynchronously], which
 * may be needed to ensure that any requires JS code is loaded before this method
 * is called.  If the underlying executor is not JSC, this will return nil.  Safe
 * to call from any thread.
 *
 * @experimental
 */
- (JSValue *)callFunctionOnModule:(NSString *)module
                           method:(NSString *)method
                        arguments:(NSArray *)arguments
                            error:(NSError **)error;

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

/**
 * Call when your delegate's `whitelistedModulesForBridge:` value has changed.
 * In response to this, the bridge will immediately instantiate any (whitelisted)
 * native modules that require main thread initialization. Modules that do not require
 * main thread initialization will still be created lazily.
 *
 * This method must be called on the main thread, as any pending native modules
 * will be initialized immediately.
 */
- (void)whitelistedModulesDidChange;

/**
 * All registered bridge module classes.
 */
@property (nonatomic, copy, readonly) NSArray<Class> *moduleClasses;

/**
 * URL of the script that was loaded into the bridge.
 */
@property (nonatomic, strong, readonly) NSURL *bundleURL;

/**
 * The class of the executor currently being used. Changes to this value will
 * take effect after the bridge is reloaded.
 */
@property (nonatomic, strong) Class executorClass;

/**
 * The delegate provided during the bridge initialization
 */
@property (nonatomic, weak, readonly) id<HippyBridgeDelegate> delegate;

@property (nonatomic, weak, readonly) HippyExtAnimationModule *animationModule;

@property (nonatomic, strong, readonly) id <HippyImageViewCustomLoader> imageLoader;
@property (nonatomic, strong, readonly) id <HippyCustomTouchHandlerProtocol> customTouchHandler;

/**
 * The launch options that were used to initialize the bridge.
 */
@property (nonatomic, copy, readonly) NSDictionary *launchOptions;

/**
 * Use this to check if the bridge is currently loading.
 */
@property (nonatomic, readonly, getter=isLoading) BOOL loading;

/**
 * Use this to check if the bridge has been invalidated.
 */
@property (nonatomic, readonly, getter=isValid) BOOL valid;

//判断当前bridge载入JSBundle后是否发生过错误
@property (nonatomic, readonly, getter=isErrorOccured) BOOL errorOccured;

/**
 * Link to the Performance Logger that logs Hippy Native perf events.
 */
@property (nonatomic, readonly, strong) HippyPerformanceLogger *performanceLogger;
/**
 * Reload the bundle and reset executor & modules. Safe to call from any thread.
 */
- (void)reload;

/**
 * Inform the bridge, and anything subscribing to it, that it should reload.
 */
- (void)requestReload;

/**
 * Says whether bridge has started recieving calls from javascript.
 */
- (BOOL)isBatchActive;

// MttRN: 表示这个bridge是否使用了分包加载
@property (nonatomic, assign) BOOL useCommonBridge;

// MttRN: 表示是否是Debug模式
@property (nonatomic, assign) BOOL debugMode;

// MttRN: 共享数据通道
@property (nonatomic, strong) NSMutableDictionary *shareOptions;

// MttRN: bridge业务名, todo:单引擎的时候此值无效，多引擎的时候有效，目前为多引擎；
@property (nonatomic, strong) NSString *moduleName;

@property (nonatomic, strong) NSString *appVerson;//宿主App的版本号

/**
 * just for debugger
 */
- (void)bindKeys;


@end
