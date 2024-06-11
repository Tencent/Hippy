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
#import "HippyImageViewCustomLoader.h"
#import "HippyInvalidating.h"
#import "HippyDefines.h"

@class HippyJSExecutor;
@class HippyModuleData;
@class HippyRootView;


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


// Keys of userInfo for the following notifications
HIPPY_EXTERN NSString *const kHippyNotiBridgeKey;
HIPPY_EXTERN NSString *const kHippyNotiBundleUrlKey;
HIPPY_EXTERN NSString *const kHippyNotiBundleTypeKey;
HIPPY_EXTERN NSString *const kHippyNotiErrorKey;

/// Bundle Type of Vendor (or Common Bundle),
/// used in kHippyNotiBundleTypeKey
HIPPY_EXTERN const NSUInteger HippyBridgeBundleTypeVendor;
/// Bundle Type Business,
/// used in kHippyNotiBundleTypeKey
HIPPY_EXTERN const NSUInteger HippyBridgeBundleTypeBusiness;

/**
 * This notification fires when the bridge starts loading and executing the JS bundle.
 * @discussion
 * Notification.object: instance of HippyBridge
 * Notification.userInfo:
 *  @{
 *     kHippyNotiBridgeKey : $(instance of HippyBridge),
 *     kHippyNotiBundleUrlKey : $(bundleURL),
 *     kHippyNotiBundleTypeKey : $(bundleType),
 *  }
 *
 * 备注：bundle包开始加载的通知, 注意与Hippy2不同的是，不仅指代`Common包`，`Business包`同样会发送该通知，
 * 可通过userInfo中bundleType参数进行区分，see: HippyBridgeBundleTypeVendor
  */
HIPPY_EXTERN NSString *const HippyJavaScriptWillStartLoadingNotification;

/**
 * This notification fires when bridge has fetched JS bundle's source code.
 * @discussion
 * Notification.object: instance of HippyBridge
 * Notification.userInfo:
 *  @{
 *     kHippyNotiBridgeKey : $(instance of HippyBridge),
 *     kHippyNotiBundleUrlKey : $(bundleURL),
 *     kHippyNotiBundleTypeKey : $(bundleType),
 *     kHippyNotiErrorKey : $(error), // NSError object
 *  }
 *
 * 备注：获取到Bundle包的source code data时的通知
 */
HIPPY_EXTERN NSString *const HippyJavaScripDidLoadSourceCodeNotification;

/**
 * This notification fires when the bridge has finished loading the JS bundle.
 * @discussion
 * Notification.object: instance of HippyBridge
 * Notification.userInfo:
 *  @{
 *     kHippyNotiBridgeKey : $(instance of HippyBridge),
 *     kHippyNotiBundleUrlKey : $(bundleURL),
 *     kHippyNotiBundleTypeKey : $(bundleType),
 *  }
 *
 * 备注：Bundle包`加载和执行`结束的通知
 */
HIPPY_EXTERN NSString *const HippyJavaScriptDidLoadNotification;

/**
 * This notification fires when the bridge failed to load the JS bundle. The
 * `error` key can be used to determine the error that occured.
 * @discussion
 * Notification.object: instance of HippyBridge
 * Notification.userInfo:
 *  @{
 *     kHippyNotiBridgeKey : $(instance of HippyBridge),
 *     kHippyNotiBundleUrlKey : $(bundleURL),
 *     kHippyNotiBundleTypeKey : $(bundleType),
 *     kHippyNotiErrorKey : $(error), // NSError object
 *  }
 *
 * 备注：Bundle包`加载和执行`失败的通知
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



#pragma mark -

/// Async bridge used to communicate with the JavaScript application.
@interface HippyBridge : NSObject <HippyInvalidating>

/// Create A HippyBridge instance, without load/execute any js bundle.
///
/// @param delegate bridge delegate
/// @param block for user-defined module
/// @param launchOptions launch options, will not be sent to frontend
/// @param executorKey key to engine instance. HippyBridge with same engine key will share same engine intance.
///
/// Note: 多个bridge使用相同的共享engineKey时，只有全部bridge实例销毁时engine资源才将释放，因此，请注意合理使用，避免出现意外的内存泄漏。
/// 传空时默认不共享，SDK内部默认分配一随机key。
- (instancetype)initWithDelegate:(nullable id<HippyBridgeDelegate>)delegate
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
- (instancetype)initWithDelegate:(nullable id<HippyBridgeDelegate>)delegate
                       bundleURL:(nullable NSURL *)bundleURL
                  moduleProvider:(nullable HippyBridgeModuleProviderBlock)block
                   launchOptions:(nullable NSDictionary *)launchOptions
                     executorKey:(nullable NSString *)executorKey;

/// The delegate of bridge
@property (nonatomic, weak, readonly) id<HippyBridgeDelegate> delegate;

/// SDK launch config
/// TODO: optimizes the launchOptions parameter
@property (nonatomic, copy, readonly) NSDictionary *launchOptions;

/// Module name
///
/// @discussion
/// Module name is the only Key used to identify the bridge instance,
/// It must be set and cannot be nil.
@property (nonatomic, strong) NSString *moduleName;

/// Context name for HippyBridge
///
/// @discussion 
/// Context name will be shown on safari development menu. Only for JSC engine.
/// By default, moduleName is the contextName.
@property (nonatomic, copy) NSString *contextName;

/// Use this to check if the bridge has been invalidated.
@property (nonatomic, readonly, getter=isValid) BOOL valid;

/// Reason for bridge invalidate state
@property (nonatomic, assign) HippyInvalidateReason invalidateReason;

/// Whether the bridge is loading bundle
@property (nonatomic, readonly, getter=isLoading) BOOL loading;

/// All loaded bundle urls
@property (nonatomic, copy, readonly) NSArray<NSURL *> *bundleURLs;

/// Path of sandbox directory
@property (nonatomic, strong) NSURL *sandboxDirectory;

/// Shared data between different rootViews on same bridge.
/// Set by HippyRootView when runHippyApplication.
/// Reserved for compatible with hippy2.
///
/// Note: Deprecated property.
@property (nonatomic, strong) NSMutableDictionary<NSNumber *, NSDictionary *> *shareOptions;

/// Get Device Info
- (NSDictionary *)deviceInfo;

#pragma mark - Image Related

/// Get the custom Image Loader
///
/// Note that A custom ImageLoader can be registered in two ways:
/// One is through the registration method provided below,
/// The other is to register globally with the HIPPY_EXPORT_MODULE macro.
///
/// Only one image loader can take effect at a time.
@property (nonatomic, strong, nullable, readonly) id<HippyImageCustomLoaderProtocol> imageLoader;

/// Set a custom Image Loader for current `hippyBridge`
/// The globally registered ImageLoader is ignored when set by this method.
///
/// - Parameter imageLoader: id
- (void)setCustomImageLoader:(id<HippyImageCustomLoaderProtocol>)imageLoader;

/// Get all classes that confirms to HippyImageProviderProtocol
@property (nonatomic, strong, nonnull, readonly) NSArray<Class<HippyImageProviderProtocol>> *imageProviders;

/// Add a custom ImageProvider class.
/// - Parameter cls: class confirms to HippyImageProviderProtocol
- (void)addImageProviderClass:(Class<HippyImageProviderProtocol>)cls;


#pragma mark - Lifecycle Related API

/// Register RootView
///
/// Internally, will create a dom root node and bind to the root view,
/// and connect all parts together, prepare for `loadInstance`.
/// - Parameter rootView: A view instance
- (void)setRootView:(UIView *)rootView;

/// Load instance for hippy root view and show views
/// This is the Entry of Hippy Application
/// - Parameters:
///   - rootTag: tag of rootView
///   - props: props(appProperties) for hippy frontend application
- (void)loadInstanceForRootView:(NSNumber *)rootTag withProperties:(nullable NSDictionary *)props;

/// Unload the instance
/// - Parameter rootTag: tag of rootView
- (void)unloadInstanceForRootView:(NSNumber *)rootTag;

/// Reload the bundle and reset executor & modules.
/// Safe to call from any thread.
/// Internally sends `HippyReloadNotification` Notification.
- (void)requestReload;


#pragma mark -

/// Access the underlying JavaScript executor.
/// You can use this in unit tests to detect when the executor has been invalidated,
/// or when you want to schedule calls on the JS VM outside of Hippy Native. Use with care!
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

/// Handle msg(buffer) from JS side
/// - Parameters:
///   - buffer: id
///   - batchEnded: whether is batch end
- (void)handleBuffer:(id _Nullable)buffer batchEnded:(BOOL)batchEnded;

/// Send native event to JS side
/// - Parameters:
///   - eventName: event name
///   - params: event info
- (void)sendEvent:(NSString *)eventName params:(NSDictionary *_Nullable)params;


#pragma mark - Module Management

/// Whether is turboModule enabled
/// default is YES
@property (nonatomic, assign) BOOL enableTurbo;

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

/**
 * Get  the turbo module for a given name.
 */
- (id)turboModuleWithName:(NSString *)name;


#pragma mark - Snapshot

- (NSData *)snapShotData;

- (void)setSnapShotData:(NSData *)data;


#pragma mark - App UI State Related

/// NightMode or not, default is NO.
/// Updated by HippyRootView
@property (atomic, assign, readonly) BOOL isOSNightMode;

/// update `NightMode` state when changed
/// - Parameter isOSNightMode: bool
/// - Parameter rootViewTag: rootView's hippyTag
- (void)setOSNightMode:(BOOL)isOSNightMode withRootViewTag:(NSNumber *)rootViewTag;

/// Update the size of RootView
/// - Parameter size: CGSize
- (void)resetRootSize:(CGSize)size;


#pragma mark - Debug Related

/// Whether is in debug mode
/// debug mode will open DevMenu and make JSC inspectable
@property (nonatomic, assign) BOOL debugMode;

/// Debug URL for devtools
/// TODO: debugURL not working ?
@property (nonatomic, strong, readonly) NSURL *debugURL;

/// Sets whether the context is inspectable in Web Inspector.
/// Default value is NO.
///
/// - Parameter isInspectable: BOOL
- (void)setInspectable:(BOOL)isInspectable;

/// A red box will show when error occurs by default
/// only work on HIPPY_DEBUG mode
///
/// - Parameter enabled: BOOL
- (void)setRedBoxShowEnabled:(BOOL)enabled;


#pragma mark - Advanced Usages

/* 说明：
 * 以下方法一般情况下无需调用，仅供高级定制化使用。
 * Following methods are only used for advanced customization, no need to be invoked in general.
 */

/// Interceptor for methods
@property (nonatomic, weak) id<HippyMethodInterceptorProtocol> methodInterceptor;


typedef NSUInteger HippyBridgeBundleType;
typedef void (^HippyBridgeBundleLoadCompletionBlock)(NSURL * _Nullable bundleURL, NSError * _Nullable error);

/// Load and Execute bundle from the given bundle URL
/// - Parameters:
///   - bundleURL: bundle url
///   - bundleType: type of bundle, e.g.: whether is `Vendor Bundle`(Common Bundle) or `Business Bundle`
///   - completion: Completion block
///
/// - Disscusion: HippyBridge makes sure bundles will be loaded and execute in order.
- (void)loadBundleURL:(NSURL *)bundleURL
           bundleType:(HippyBridgeBundleType)bundleType
           completion:(HippyBridgeBundleLoadCompletionBlock)completion;


@end


HIPPY_EXTERN void HippyBridgeFatal(NSError *, HippyBridge *);

HIPPY_EXTERN void HippyBridgeHandleException(NSException *exception, HippyBridge *bridge);

NS_ASSUME_NONNULL_END
