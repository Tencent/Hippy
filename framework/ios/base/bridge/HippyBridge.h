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
 * Note: To be compatible with version 2.0,
 * the same underscore prefix is ​​used and cannot be modified.
 */
HIPPY_EXTERN NSString *const _HippySDKVersion;

/// Launch Options Key: DebugMode
/// Set to YES will automatically start debugger.
/// Default is NO.
HIPPY_EXTERN NSString *const kHippyLaunchOptionsDebugModeKey;

/// Launch Options Key: EnableTurbo
/// Set to YES will enable jsi mode.
/// Default is YES.
HIPPY_EXTERN NSString *const kHippyLaunchOptionsEnableTurboKey;


// Keys of userInfo for the following notifications
/// key of bridge in userInfo
HIPPY_EXTERN NSString *const kHippyNotiBridgeKey;
/// url key in userInfo
HIPPY_EXTERN NSString *const kHippyNotiBundleUrlKey;
/// bundle type key in userInfo
HIPPY_EXTERN NSString *const kHippyNotiBundleTypeKey;
/// error key in userInfo
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
 * Note: Notification of bundle loading. 
 * Note that unlike Hippy2, this notification is sent not only for `Common package`, but also for `Business package`.
 * It can be distinguished by the bundleType parameter in userInfo, see: HippyBridgeBundleTypeVendor for more.
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
 * Note: Notification when the source code data of the Bundle package is obtained.
 */
HIPPY_EXTERN NSString *const HippyJavaScripDidLoadSourceCodeNotification;

/**
 * This notification fires when bridge has finished loading JS bundle.
 * @discussion
 * Notification.object: instance of HippyBridge
 * Notification.userInfo:
 *  @{
 *     kHippyNotiBridgeKey : $(instance of HippyBridge),
 *     kHippyNotiBundleUrlKey : $(bundleURL),
 *     kHippyNotiBundleTypeKey : $(bundleType),
 *  }
 *
 * Note: Notification of the end of Bundle `loading and execution`
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
 * Note: Notification of Bundle package `loading and execution` failure
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
 * This notification is sent when hippy bridge is reloaded.
 */
HIPPY_EXTERN NSString *const HippyReloadNotification;

/**
 * This function returns the module name for a given class.
 */
HIPPY_EXTERN NSString *HippyBridgeModuleNameForClass(Class bridgeModuleClass);


#pragma mark - Bridge Launch Options

/// Launch Options for HippyBridge
@interface HippyLaunchOptions : NSObject

/// Whether is in debug mode
/// debug mode will open DevMenu and make JS inspectable
@property (nonatomic, assign) BOOL debugMode;

/// Whether enable turboMode(jsi), default is YES.
@property (nonatomic, assign) BOOL enableTurbo;

/// Whether use `hermes` as JS engine
/// This property requires the `JS_HERMES` compilation macro enabled to take effect.
/// default is NO.
@property (nonatomic, assign) BOOL useHermesEngine;

@end

#pragma mark - HippyBridge

/// Async bridge used to communicate with the JavaScript application.
@interface HippyBridge : NSObject <HippyInvalidating>

/// Create A HippyBridge instance, without load/execute any js bundle.
///
/// @param delegate bridge delegate
/// @param block for user-defined module
/// @param launchOptions launch options, will not be sent to frontend, see `HippyLaunchOptions`
/// For compatible with historical versions, launchOptions can also pass a NSDictionary object, but not recommended.
/// @param executorKey key to engine instance. HippyBridge with same engine key will share same engine intance.
///
/// Note: When multiple bridges use the same shared engineKey, 
/// the engine resources will be released only when all bridge instances are destroyed.
/// Therefore, please use it properly to avoid unexpected memory leaks.
/// When executorKey is empty, it is not shared by default. A random key is assigned by default in the SDK.
- (instancetype)initWithDelegate:(nullable id<HippyBridgeDelegate>)delegate
                  moduleProvider:(nullable HippyBridgeModuleProviderBlock)block
                   launchOptions:(nullable id)launchOptions
                     executorKey:(nullable NSString *)executorKey;


/// Create A HippyBridge instance with a common js bundle.
///
/// This method is compatible with the Hippy2 initializer function.
///
/// @param delegate bridge delegate
/// @param bundleURL the
/// @param block for user-defined module
/// @param launchOptions launch options, will not be sent to frontend, see `HippyLaunchOptions`
/// For compatible with historical versions, launchOptions can also pass a NSDictionary object, but not recommended.
/// @param executorKey key to engine instance. HippyBridge with same engine key will share same engine intance.
///
/// Note: When multiple bridges use the same shared engineKey,
/// the engine resources will be released only when all bridge instances are destroyed.
/// Therefore, please use it properly to avoid unexpected memory leaks.
/// When executorKey is empty, it is not shared by default. A random key is assigned by default in the SDK.
- (instancetype)initWithDelegate:(nullable id<HippyBridgeDelegate>)delegate
                       bundleURL:(nullable NSURL *)bundleURL
                  moduleProvider:(nullable HippyBridgeModuleProviderBlock)block
                   launchOptions:(nullable id)launchOptions
                     executorKey:(nullable NSString *)executorKey NS_DESIGNATED_INITIALIZER;

// Not available
- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;

/// The delegate of bridge
@property (nonatomic, weak, readonly) id<HippyBridgeDelegate> delegate;

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

/// All loaded bundle urls
@property (nonatomic, copy, readonly) NSArray<NSURL *> *bundleURLs;

/// Path of sandbox directory
@property (nonatomic, copy) NSString *sandboxDirectory;

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


#pragma mark - JS Communication Related

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
@property (nonatomic, assign, readonly) BOOL debugMode;

/// Debug URL for devtools
@property (nonatomic, strong, nullable, readonly) NSURL *debugURL;

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

/// Whether is using Hermes as JS Engine
@property (nonatomic, assign, readonly) BOOL usingHermesEngine;

/// Interceptor for methods
@property (nonatomic, weak) id<HippyMethodInterceptorProtocol> methodInterceptor;

@end

/// Same as `HippyFatal`, with moduleName in userinfo.
/// see `HippyFatalModuleName` for more.
HIPPY_EXTERN void HippyBridgeFatal(NSError *error, HippyBridge *bridge);

NS_ASSUME_NONNULL_END


// For compile compatibility
#import "HippyBridge+BundleLoad.h"
#import "HippyBridge+ModuleManage.h"
