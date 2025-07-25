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

#import "HippyBridge.h"
#import "HippyBridge+Private.h"
#import "HippyBridge+BundleLoad.h"
#import "HippyBridge+ModuleManage.h"
#import "HippyDeviceBaseInfo.h"
#import "HippyDisplayLink.h"
#import "HippyEventDispatcher.h"
#import "HippyFileHandler.h"
#import "HippyJSEnginesMapper.h"
#import "HippyJSExecutor+Internal.h"
#import "HippyKeyCommands.h"
#import "HippyModuleData.h"
#import "HippyBridgeMethod.h"
#import "HippyRedBox.h"
#import "HippyTurboModule.h"
#import "HippyUtils.h"
#import "HippyAssert.h"
#import "HippyConvert.h"
#import "HippyDefaultImageProvider.h"
#import "HippyI18nUtils.h"
#import "HippyInvalidating.h"
#import "HippyLog.h"
#import "HippyOCToHippyValue.h"
#import "HippyUtils.h"
#import "TypeConverter.h"
#import "VFSUriLoader.h"
#import "HippyBase64DataHandler.h"
#import "NativeRenderManager.h"
#import "HippyRootView.h"
#import "UIView+Hippy.h"
#import "UIView+MountEvent.h"
#import "HippyUIManager.h"
#import "HippyUIManager+Private.h"

#include "dom/animation/animation_manager.h"
#include "dom/dom_manager.h"
#include "dom/scene.h"
#include "dom/render_manager.h"
#include "dom/layer_optimized_render_manager.h"
#include "driver/scope.h"
#include "footstone/worker_manager.h"
#include "vfs/uri_loader.h"
#include "VFSUriHandler.h"
#include "footstone/logging.h"

#include <objc/runtime.h>
#include <sys/utsname.h>
#include <string>

#ifdef ENABLE_INSPECTOR
#include "devtools/vfs/devtools_handler.h"
#include "devtools/devtools_data_source.h"
#endif


// Notifications related
NSString *const _HippySDKVersion = @HIPPY_STR(HIPPY_VERSION);
NSString *const HippyReloadNotification = @"HippyReloadNotification";
NSString *const HippyJavaScriptWillStartLoadingNotification = @"HippyJavaScriptWillStartLoadingNotification";
NSString *const HippyJavaScripDidLoadSourceCodeNotification = @"HippyJavaScripDidLoadSourceCodeNotification";
NSString *const HippyJavaScriptDidLoadNotification = @"HippyJavaScriptDidLoadNotification";
NSString *const HippyJavaScriptDidFailToLoadNotification = @"HippyJavaScriptDidFailToLoadNotification";
NSString *const HippyDidInitializeModuleNotification = @"HippyDidInitializeModuleNotification";

// Notifications userinfo related
NSString *const kHippyNotiBridgeKey = @"bridge";
NSString *const kHippyNotiBundleUrlKey = @"bundleURL";
NSString *const kHippyNotiBundleTypeKey = @"bundleType";
NSString *const kHippyNotiErrorKey = @"error";
const NSUInteger HippyBridgeBundleTypeVendor = 1;
const NSUInteger HippyBridgeBundleTypeBusiness = 2;

// Global device info keys & values
static NSString *const kHippyNativeGlobalKeyOS = @"OS";
static NSString *const kHippyNativeGlobalKeyOSVersion = @"OSVersion";
static NSString *const kHippyNativeGlobalKeyDevice = @"Device";
static NSString *const kHippyNativeGlobalKeySDKVersion = @"SDKVersion";
static NSString *const kHippyNativeGlobalKeyAppVersion = @"AppVersion";
static NSString *const kHippyNativeGlobalKeyDimensions = @"Dimensions";
static NSString *const kHippyNativeGlobalKeyLocalization = @"Localization";
static NSString *const kHippyNativeGlobalKeyNightMode = @"NightMode";
static NSString *const kHippyNativeGlobalOSValue = @"ios";
static NSString *const kHippyCFBundleShortVersionKey = @"CFBundleShortVersionString";

// Localization infos
static NSString *const kHippyLocalizaitionCountryKey = @"country";
static NSString *const kHippyLocalizaitionLanguageKey = @"language";
static NSString *const kHippyLocalizaitionDirectionKey = @"direction";
static NSString *const kHippyLocalizaitionValueUnknown = @"unknown";

// Key of module config info for js side
static NSString *const kHippyRemoteModuleConfigKey = @"remoteModuleConfig";
static NSString *const kHippyBatchedBridgeConfigKey = @"__hpBatchedBridgeConfig";

// key of launch options, to be deprecated
static NSString *const kLaunchOptionsDebugMode = @"DebugMode";
static NSString *const kLaunchOptionsEnableTurbo = @"EnableTurbo";
static NSString *const kLaunchOptionsUseHermes = @"useHermesEngine";

// Define constants for the URI handlers
static NSString *const kFileUriScheme = @"file";
static NSString *const kHpFileUriScheme = @"hpfile";
static NSString *const kDataUriScheme = @"data";

// Load and Unload instance param keys
static NSString *const kHippyLoadInstanceNameKey = @"name";
static NSString *const kHippyLoadInstanceIdKey = @"id";
static NSString *const kHippyLoadInstanceParamsKey = @"params";
static NSString *const kHippyLoadInstanceVersionKey = @"version";

typedef NS_ENUM(NSUInteger, HippyBridgeFields) {
    HippyBridgeFieldRequestModuleIDs = 0,
    HippyBridgeFieldMethodIDs,
    HippyBridgeFieldParams,
    HippyBridgeFieldCallID,
};


@implementation HippyLaunchOptions

- (instancetype)init {
    self = [super init];
    if (self) {
        _enableTurbo = YES;
    }
    return self;
}

@end


@interface HippyBridge () {
    // Identifies whether batch updates are in progress.
    BOOL _wasBatchActive;
    
    // DisplayLink
    HippyDisplayLink *_displayLink;
    
    // Block used to get external injection modules
    HippyBridgeModuleProviderBlock _moduleProvider;
    
    // VFSUriLoader instance
    std::shared_ptr<VFSUriLoader> _uriLoader;
    
    // hippy::RootNode instance
    std::shared_ptr<hippy::RootNode> _rootNode;
    
    // The C++ version of RenderManager instance, bridge holds,
    // One NativeRenderManager holds multiple UIManager instance.
    std::shared_ptr<NativeRenderManager> _renderManager;
    
    // Cached device information, access only in single thread.
    NSDictionary *_cachedDeviceInfo;
}

/// The Key used to mark the JS engine used by the bridge
///
/// Note: Bridges passing the same value will share the underlying JS engine.
/// In a shared case, JS engine resources are destroyed only when all bridge instances are released.
/// A separate JS engine is used for each bridge by default.
@property (nonatomic, strong) NSString *engineKey;

/// Module setup semaphore
@property (nonatomic, strong) dispatch_semaphore_t moduleSemaphore;

/// Pending load bundle's URL
@property (nonatomic, strong) NSURL *pendingLoadingVendorBundleURL;

/// Cached Dimensions info，will be passed to JS Side.
@property (atomic, strong) NSDictionary *cachedDimensionsInfo;

@end


@implementation HippyBridge

@synthesize sandboxDirectory = _sandboxDirectory;
@synthesize imageLoader = _imageLoader;
@synthesize imageProviders = _imageProviders;
@synthesize startTime = _startTime;
@synthesize moduleSetup = _moduleSetup;
@synthesize allBundleURLs = _allBundleURLs;
@synthesize bundleQueue = _bundleQueue;
@synthesize loadingCount = _loadingCount;
@synthesize lastExecuteOperation = _lastExecuteOperation;
@synthesize lastRootSizeForDimensions = _lastRootSizeForDimensions;
@synthesize shouldUseRootSizeAsWindowSize = _shouldUseRootSizeAsWindowSize;

// Use kCFNull to identify the use of JS thread,
// Reserve it for compatibility with hippy2.
dispatch_queue_t HippyJSThread = (id)kCFNull;

- (instancetype)initWithDelegate:(nullable id<HippyBridgeDelegate>)delegate
                  moduleProvider:(nullable HippyBridgeModuleProviderBlock)block
                   launchOptions:(NSDictionary *)launchOptions
                     executorKey:(nullable NSString *)executorKey {
    return [self initWithDelegate:delegate
                        bundleURL:nil
                   moduleProvider:block
                    launchOptions:launchOptions
                      executorKey:executorKey];
}

- (instancetype)initWithDelegate:(nullable id<HippyBridgeDelegate>)delegate
                       bundleURL:(nullable NSURL *)bundleURL
                  moduleProvider:(nullable HippyBridgeModuleProviderBlock)block
                   launchOptions:(nullable id)launchOptions
                     executorKey:(nullable NSString *)executorKey {
    if (self = [super init]) {
        _delegate = delegate;
        _moduleProvider = block;
        _pendingLoadingVendorBundleURL = bundleURL;
        _allBundleURLs = [NSMutableArray array];
        _shareOptions = [NSMutableDictionary dictionary];
        [self parseLaunchOptions:launchOptions];
        if (executorKey.length > 0) {
            _engineKey = [NSString stringWithFormat:@"%@_%d", executorKey, _usingHermesEngine];
        } else {
            _engineKey = [NSString stringWithFormat:@"%p", self];
        }
        HippyLogInfo(@"HippyBridge init begin, self:%p", self);
        // Set the log delegate for hippy core module
        registerLogDelegateToHippyCore();
        
        // Create bundle operation queue
        [self prepareBundleQueue];
        
        // Setup
        [self setUp];
        
        // Record bridge instance for RedBox (Debug Only)
        [HippyBridge setCurrentBridge:self];
        HippyLogInfo(@"HippyBridge init end, self:%p", self);
    }
    return self;
}

- (void)parseLaunchOptions:(id _Nullable)launchOptions {
    if ([launchOptions isKindOfClass:NSDictionary.class]) {
        // Compatible with old versions
        _debugMode = [launchOptions[kLaunchOptionsDebugMode] boolValue];
        _enableTurbo = !!launchOptions[kLaunchOptionsEnableTurbo] ? [launchOptions[kLaunchOptionsEnableTurbo] boolValue] : YES;
        _usingHermesEngine = !!launchOptions[kLaunchOptionsUseHermes] ? [launchOptions[kLaunchOptionsUseHermes] boolValue] : NO;
    } else if ([launchOptions isKindOfClass:HippyLaunchOptions.class]) {
        HippyLaunchOptions *options = launchOptions;
        _debugMode = options.debugMode;
        _enableTurbo = options.enableTurbo;
        _usingHermesEngine = options.useHermesEngine;
    }

}

- (void)dealloc {
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ dealloc %p", NSStringFromClass([self class]), self);
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    self.invalidateReason = HippyInvalidateReasonDealloc;
    [self invalidate];
    
    if (_uriLoader) {
        _uriLoader->Terminate();
    }
    if (_renderManager) {
        _renderManager->RemoveVSyncEventListener(_rootNode);
    }
    if (_rootNode) {
        _rootNode->ReleaseResources();
    }
    if (self.uiManager) {
        // Prevents multi-threading from accessing weak properties
        [self.uiManager setBridge:nil];
    }
}

#pragma mark - Setup related

/// Set the log delegate for hippy core module
static inline void registerLogDelegateToHippyCore() {
    static dispatch_once_t onceToken;
    static const char coreLogkey[] = "tdf";
    dispatch_once(&onceToken, ^{
        footstone::LogMessage::InitializeDelegate([](const std::ostringstream& stream, footstone::LogSeverity severity) {
            HippyLogLevel logLevel = HippyLogLevelInfo;
            switch (severity) {
                case footstone::TDF_LOG_INFO:
                    logLevel = HippyLogLevelInfo;
                    break;
                case footstone::TDF_LOG_WARNING:
                    logLevel = HippyLogLevelWarning;
                    break;
                case footstone::TDF_LOG_ERROR:
                    logLevel = HippyLogLevelError;
                    break;
                case footstone::TDF_LOG_FATAL:
                    logLevel = HippyLogLevelFatal;
                    break;
                default:
                    break;
            }
            HippyLogNativeInternal(logLevel, coreLogkey, 0, @"%s", stream.str().c_str());
        });
    });
}

- (std::shared_ptr<VFSUriLoader>)createURILoaderIfNeeded {
    if (!_uriLoader) {
        auto uriHandler = std::make_shared<VFSUriHandler>();
        auto uriLoader = std::make_shared<VFSUriLoader>();
        uriLoader->PushDefaultHandler(uriHandler);
        uriLoader->AddConvenientDefaultHandler(uriHandler);
        auto fileHandler = std::make_shared<HippyFileHandler>(self);
        auto base64DataHandler = std::make_shared<HippyBase64DataHandler>();
        uriLoader->RegisterConvenientUriHandler(kFileUriScheme, fileHandler);
        uriLoader->RegisterConvenientUriHandler(kHpFileUriScheme, fileHandler);
        uriLoader->RegisterConvenientUriHandler(kDataUriScheme, base64DataHandler);
        _uriLoader = uriLoader;
    }
    return _uriLoader;
}

- (void)loadPendingVendorBundleURLIfNeeded {
    // Loads the Bundle URL that was passed when the bridge was initialized
    if (self.pendingLoadingVendorBundleURL) {
        [self loadBundleURL:self.pendingLoadingVendorBundleURL
                 bundleType:HippyBridgeBundleTypeVendor
                 completion:^(NSURL * _Nullable bundleURL, NSError * _Nullable error) {
            if (error) {
                HippyLogError(@"[Hippy_OC_Log][HippyBridge], bundle loaded error:%@, %@", bundleURL, error.description);
            } else {
                HippyLogInfo(@"[Hippy_OC_Log][HippyBridge], bundle loaded success:%@", bundleURL);
            }
        }];
    }
}

- (void)setupModuleAndJsExecutor {
    self.moduleSemaphore = dispatch_semaphore_create(0);
    @try {
        __weak HippyBridge *weakSelf = self;
        _moduleSetup = [[HippyModulesSetup alloc] initWithBridge:self extraProviderModulesBlock:_moduleProvider];
        _javaScriptExecutor = [[HippyJSExecutor alloc] initWithEngineKey:self.engineKey bridge:self];
        
        _javaScriptExecutor.contextCreatedBlock = ^(){
            __strong __typeof(weakSelf)strongSelf = weakSelf;
            dispatch_semaphore_t moduleSemaphore = strongSelf.moduleSemaphore;
            if (strongSelf.isValid && moduleSemaphore) {
                dispatch_semaphore_wait(moduleSemaphore, DISPATCH_TIME_FOREVER);
                NSDictionary *nativeModuleConfig = [strongSelf nativeModuleConfig];
                [strongSelf.javaScriptExecutor injectObjectSync:nativeModuleConfig
                                            asGlobalObjectNamed:kHippyBatchedBridgeConfigKey callback:nil];
#if HIPPY_DEV
                //default is yes when debug mode
                [strongSelf setInspectable:YES];
#endif //HIPPY_DEV
            }
        };
        [_javaScriptExecutor setup];
        
        // Setup all extra and internal modules
        [_moduleSetup setupModulesWithCompletionBlock:^{
            HippyBridge *strongSelf = weakSelf;
            if (strongSelf) {
                dispatch_semaphore_signal(strongSelf.moduleSemaphore);
            }
        }];
        
    } @catch (NSException *exception) {
        HippyHandleException(exception);
        dispatch_semaphore_signal(self.moduleSemaphore);
    }
}

- (void)setVfsUriLoader:(std::weak_ptr<VFSUriLoader>)uriLoader {
    [_javaScriptExecutor setUriLoader:uriLoader];
#ifdef ENABLE_INSPECTOR
    auto devtools_data_source = _javaScriptExecutor.pScope->GetDevtoolsDataSource();
    auto strongLoader = uriLoader.lock();
    if (devtools_data_source && strongLoader) {
        auto notification = devtools_data_source->GetNotificationCenter()->network_notification;
        auto devtools_handler = std::make_shared<hippy::devtools::DevtoolsHandler>();
        devtools_handler->SetNetworkNotification(notification);
        strongLoader->RegisterUriInterceptor(devtools_handler);
    }
#endif /* ENABLE_INSPECTOR */
}

- (std::weak_ptr<VFSUriLoader>)vfsUriLoader {
    return _uriLoader;
}

- (void)setUp {
    // Note that this method may be called multiple times, including on bridge reload.
    _valid = YES;
    _startTime = footstone::TimePoint::SystemNow();
    _displayLink = [[HippyDisplayLink alloc] init];
    
    // Get global enviroment info
    HippyExecuteOnMainThread(^{
        self->_isOSNightMode = [HippyDeviceBaseInfo isUIScreenInOSDarkMode];
        self.cachedDimensionsInfo = hippyExportedDimensions(self, nil);
    }, YES);
    
    // Setup module manager and js executor.
    [self setupModuleAndJsExecutor];
    
    // Setup default image provider
    [self addImageProviderClass:[HippyDefaultImageProvider class]];
    
    // Setup uri loader
    [self setVfsUriLoader:[self createURILoaderIfNeeded]];
    
    // Load pending js bundles
    [self loadPendingVendorBundleURLIfNeeded];
    
    // Set the default sandbox directory
    NSString *sandboxDir = [HippyUtils getBaseDirFromResourcePath:_pendingLoadingVendorBundleURL];
    [self setSandboxDirectory:sandboxDir];
}


#pragma mark - Lifecycle Related API

- (void)requestReload {
    [[NSNotificationCenter defaultCenter] postNotificationName:HippyReloadNotification object:nil];
    dispatch_async(dispatch_get_main_queue(), ^{
        self.invalidateReason = HippyInvalidateReasonReload;
        [self invalidate];
        [self setUp];
    });
}

- (void)unloadInstanceForRootView:(NSNumber *)rootTag {
    if (rootTag != nil) {
        NSDictionary *param = @{ kHippyLoadInstanceIdKey : rootTag};
        footstone::value::HippyValue value = [param toHippyValue];
        std::shared_ptr<footstone::value::HippyValue> domValue = std::make_shared<footstone::value::HippyValue>(value);
        if (auto scope = self.javaScriptExecutor.pScope) {
            scope->UnloadInstance(domValue);
        }
        if (_renderManager) {
            _renderManager->UnregisterRootView([rootTag intValue]);
        }
        if (_rootNode) {
            _rootNode->ReleaseResources();
            _rootNode = nullptr;
        }
    }
}

- (void)loadInstanceForRootView:(NSNumber *)rootTag withProperties:(NSDictionary *)props {
    [self innerLoadInstanceForRootView:rootTag withProperties:props];
}

- (void)innerLoadInstanceForRootView:(NSNumber *)rootTag withProperties:(NSDictionary *)props {
    HippyAssert(_moduleName, @"module name must not be null");
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],Running application %@ (%@)", _moduleName, props);
    HippyLogInfo(@"[HP PERF] Begin loading instance for HippyBridge(%p)", self);
    NSDictionary *param = @{ kHippyLoadInstanceNameKey : _moduleName,
                             kHippyLoadInstanceIdKey : rootTag,
                             kHippyLoadInstanceParamsKey : props ?: @{},
                             kHippyLoadInstanceVersionKey : _HippySDKVersion };
    footstone::value::HippyValue value = [param toHippyValue];
    std::shared_ptr<footstone::value::HippyValue> domValue = std::make_shared<footstone::value::HippyValue>(value);
    self.javaScriptExecutor.pScope->LoadInstance(domValue);
    HippyLogInfo(@"[HP PERF] End loading instance for HippyBridge(%p)", self);
}


#pragma mark - Image Config Related

- (id<HippyImageCustomLoaderProtocol>)imageLoader {
    @synchronized (self) {
        if (!_imageLoader) {
            // Only the last imageloader takes effect,
            // compatible with Hippy 2.x
            _imageLoader = [[self modulesConformingToProtocol:@protocol(HippyImageCustomLoaderProtocol)] lastObject];
        }
    }
    return _imageLoader;
}

- (void)setCustomImageLoader:(id<HippyImageCustomLoaderProtocol>)imageLoader {
    @synchronized (self) {
        if (imageLoader != _imageLoader) {
            if (_imageLoader) {
                HippyLogWarn(@"ImageLoader change from %@ to %@", _imageLoader, imageLoader);
            }
            _imageLoader = imageLoader;
        }
    }
}

- (NSArray<Class<HippyImageProviderProtocol>> *)imageProviders {
    @synchronized (self) {
        if (!_imageProviders) {
            NSMutableArray *moduleClasses = [NSMutableArray new];
            for (Class moduleClass in self.moduleClasses) {
                if ([moduleClass conformsToProtocol:@protocol(HippyImageProviderProtocol)]) {
                    [moduleClasses addObject:moduleClass];
                }
            }
            _imageProviders = moduleClasses;
        }
        return [_imageProviders copy];
    }
}

- (void)addImageProviderClass:(Class<HippyImageProviderProtocol>)cls {
    HippyAssertParam(cls);
    @synchronized (self) {
        _imageProviders = [self.imageProviders arrayByAddingObject:cls];
    }
}


#pragma mark - Private

- (void)enqueueJSCall:(NSString *)module method:(NSString *)method
                 args:(NSArray *)args completion:(dispatch_block_t)completion {
    /**
     * AnyThread
     */
    if (![self isValid]) {
        return;
    }
    [self actuallyInvokeAndProcessModule:module method:method arguments:args ?: @[]];
    if (completion) {
        completion();
    }
}

- (void)actuallyInvokeAndProcessModule:(NSString *)module method:(NSString *)method arguments:(NSArray *)args {
    __weak HippyBridge *weakSelf = self;
    [_javaScriptExecutor callFunctionOnModule:module method:method arguments:args callback:^(id json, NSError *error) {
        HippyBridge *strongSelf = weakSelf;
        if (strongSelf) {
            [strongSelf processResponse:json error:error];
        }
    }];
}

- (void)dispatchBlock:(dispatch_block_t)block queue:(dispatch_queue_t)queue {
    if (HippyJSThread == queue) {
        [_javaScriptExecutor executeBlockOnJavaScriptQueue:block];
    } else {
        dispatch_async(queue, block);
    }
}

- (void)processResponse:(id)json error:(NSError *)error {
    if (error) {
        if ([error userInfo][HippyJSStackTraceKey]) {
            if (error.localizedFailureReason) {
                [self.redBox
                    showErrorMessage:[NSString stringWithFormat:@"%@ 【reason】%@:", error.localizedDescription, error.localizedFailureReason]
                           withStack:[error userInfo][HippyJSStackTraceKey]];
            } else {
                [self.redBox showErrorMessage:[NSString stringWithFormat:@"%@", error.localizedDescription]
                                    withStack:[error userInfo][HippyJSStackTraceKey]];
            }
        }
        HippyBridgeFatal(error, self);
    }

    if (![self isValid]) {
        return;
    }
    [self handleBuffer:json batchEnded:YES];
}

- (void)handleBuffer:(id)buffer batchEnded:(BOOL)batchEnded {
    if (buffer != nil && buffer != (id)kCFNull) {
        _wasBatchActive = YES;
        [self handleBuffer:buffer];
        [self partialBatchDidFlush];
    }
    if (batchEnded) {
        if (_wasBatchActive) {
            [self batchDidComplete];
        }
        _wasBatchActive = NO;
    }
}

- (void)partialBatchDidFlush {
    NSArray<HippyModuleData *> *moduleDataByID = [_moduleSetup moduleDataByID];
    for (HippyModuleData *moduleData in moduleDataByID) {
        if (moduleData.hasInstance && moduleData.implementsPartialBatchDidFlush) {
            [self dispatchBlock:^{
                [moduleData.instance partialBatchDidFlush];
            } queue:moduleData.methodQueue];
        }
    }
}

- (void)batchDidComplete {
    NSArray<HippyModuleData *> *moduleDataByID = [_moduleSetup moduleDataByID];
    for (HippyModuleData *moduleData in moduleDataByID) {
        if (moduleData.hasInstance && moduleData.implementsBatchDidComplete) {
            [self dispatchBlock:^{
                [moduleData.instance batchDidComplete];
            } queue:moduleData.methodQueue];
        }
    }
}

- (void)handleBuffer:(NSArray *)buffer {
    NSArray *requestsArray = [HippyConvert NSArray:buffer];
    if (requestsArray.count <= HippyBridgeFieldParams) {
        HippyLogError(@"Buffer should contain at least %tu sub-arrays. Only found %tu", HippyBridgeFieldParams + 1, requestsArray.count);
        return;
    }

    NSArray<NSNumber *> *moduleIDs = [HippyConvert NSNumberArray:requestsArray[HippyBridgeFieldRequestModuleIDs]];
    NSArray<NSNumber *> *methodIDs = [HippyConvert NSNumberArray:requestsArray[HippyBridgeFieldMethodIDs]];
    NSArray<NSArray *> *paramsArrays = [HippyConvert NSArrayArray:requestsArray[HippyBridgeFieldParams]];

    if (HIPPY_DEBUG && (moduleIDs.count != methodIDs.count || moduleIDs.count != paramsArrays.count)) {
        HippyLogError(@"Invalid data message - all must be length: %lu", (unsigned long)moduleIDs.count);
        return;
    }

    @autoreleasepool {
        NSDictionary<NSString *, HippyModuleData *> *moduleDataByName = [_moduleSetup moduleDataByName];
        NSArray<HippyModuleData *> *moduleDataById = [_moduleSetup moduleDataByID];
        NSMapTable *buckets =
            [[NSMapTable alloc] initWithKeyOptions:NSPointerFunctionsStrongMemory
                                      valueOptions:NSPointerFunctionsStrongMemory
                                          capacity:[moduleDataByName count]];
        [moduleIDs enumerateObjectsUsingBlock:^(NSNumber *moduleID, NSUInteger i, __unused BOOL *stop) {
            HippyModuleData *moduleData = moduleDataById[moduleID.integerValue];
            dispatch_queue_t queue = moduleData.methodQueue;
            NSMutableOrderedSet<NSNumber *> *set = [buckets objectForKey:queue];
            if (!set) {
                set = [NSMutableOrderedSet new];
                [buckets setObject:set forKey:queue];
            }
            [set addObject:@(i)];
        }];

        for (dispatch_queue_t queue in buckets) {
            __weak id weakSelf = self;
            dispatch_block_t block = ^{
                @autoreleasepool {
                    id strongSelf = weakSelf;
                    if (!strongSelf) {
                        return;
                    }
                    NSOrderedSet *calls = [buckets objectForKey:queue];
                    for (NSNumber *indexObj in calls) {
                        NSUInteger index = indexObj.unsignedIntegerValue;
                        [strongSelf callNativeModule:[moduleIDs[index] integerValue]
                                              method:[methodIDs[index] integerValue]
                                              params:paramsArrays[index]];
                    }
                }
            };
            [self dispatchBlock:block queue:queue];
        }
    }
}

- (id)callNativeModule:(NSUInteger)moduleID method:(NSUInteger)methodID params:(NSArray *)params {
    // hippy will send 'destroyInstance' event to JS.
    // JS may call actions after that.
    // so HippyBatchBridge needs to be valid
    BOOL isValid = [self isValid];
    NSArray<HippyModuleData *> *moduleDataByID = [_moduleSetup moduleDataByID];
    if (moduleID >= [moduleDataByID count]) {
        if (isValid) {
            HippyLogError(@"moduleID %lu exceed range of moduleDataByID %lu, bridge is valid %ld", 
                          moduleID, [moduleDataByID count], (long)isValid);
        }
        return nil;
    }
    HippyModuleData *moduleData = moduleDataByID[moduleID];
    if (HIPPY_DEBUG && !moduleData) {
        if (isValid) {
            HippyLogError(@"No module found for id '%lu'", (unsigned long)moduleID);
        }
        return nil;
    }
    NSArray<id<HippyBridgeMethod>> *methods = [moduleData.methods copy];
    if (methodID >= [methods count]) {
        if (isValid) {
            HippyLogError(@"methodID %lu exceed range of moduleData.methods %lu, bridge is valid %ld", 
                          moduleID, [methods count], (long)isValid);
        }
        return nil;
    }
    id<HippyBridgeMethod> method = methods[methodID];
    if (HIPPY_DEBUG && !method) {
        if (isValid) {
            HippyLogError(@"Unknown methodID: %lu for module: %lu (%@)", 
                          (unsigned long)methodID, (unsigned long)moduleID, moduleData.name);
        }
        return nil;
    }

    @try {
        BOOL shouldInvoked = YES;
        if ([self.methodInterceptor respondsToSelector:@selector(shouldInvokeWithModuleName:methodName:arguments:argumentsValues:containCallback:)]) {
            HippyFunctionType funcType = [method functionType];
            BOOL containCallback = (HippyFunctionTypeCallback == funcType|| HippyFunctionTypePromise == funcType);
            NSArray<id<HippyBridgeArgument>> *arguments = [method arguments];
            shouldInvoked = [self.methodInterceptor shouldInvokeWithModuleName:moduleData.name
                                                                    methodName:method.JSMethodName
                                                                     arguments:arguments
                                                               argumentsValues:params
                                                               containCallback:containCallback];
        }
        if (shouldInvoked) {
            return [method invokeWithBridge:self module:moduleData.instance arguments:params];
        }
        else {
            return nil;
        }
    } @catch (NSException *exception) {
        // Pass on JS exceptions
        if ([exception.name hasPrefix:HippyFatalExceptionName]) {
            @throw exception;
        }

        NSString *message = [NSString stringWithFormat:@"Exception '%@' was thrown while invoking %@ on target %@ with params %@", 
                             exception, method.JSMethodName, moduleData.name, params];
        NSError *error = HippyErrorWithMessage(message);
        HippyBridgeFatal(error, self);
        return nil;
    }
}

- (id)callNativeModuleName:(NSString *)moduleName methodName:(NSString *)methodName params:(NSArray *)params {
    NSDictionary<NSString *, HippyModuleData *> *moduleByName = [_moduleSetup moduleDataByName];
    HippyModuleData *module = moduleByName[moduleName];
    if (!module) {
        return nil;
    }
    id<HippyBridgeMethod> method = module.methodsByName[methodName];
    if (!method) {
        return nil;
    }
    @try {
        return [method invokeWithBridge:self module:module.instance arguments:params];
    } @catch (NSException *exception) {
        if ([exception.name hasPrefix:HippyFatalExceptionName]) {
            @throw exception;
        }

        NSString *message = [NSString stringWithFormat:@"Exception '%@' was thrown while invoking %@ on target %@ with params %@", 
                             exception, method.JSMethodName, module.name, params];
        HippyBridgeFatal(HippyErrorWithMessage(message), self);
        return nil;
    }
}

- (void)setupDomManager:(std::shared_ptr<hippy::DomManager>)domManager
               rootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    HippyAssertParam(domManager);
    if (!domManager) {
        return;
    }
    self.javaScriptExecutor.pScope->SetDomManager(domManager);
    self.javaScriptExecutor.pScope->SetRootNode(rootNode);
#ifdef ENABLE_INSPECTOR
    auto devtools_data_source = self.javaScriptExecutor.pScope->GetDevtoolsDataSource();
    if (devtools_data_source) {
        self.javaScriptExecutor.pScope->GetDevtoolsDataSource()->Bind(domManager);
        devtools_data_source->SetRootNode(rootNode);
    }
#endif
}

- (void)invalidate {
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ invalide %p", NSStringFromClass([self class]), self);
    if (![self isValid]) {
        return;
    }
    _valid = NO;
    [_allBundleURLs removeAllObjects];
    if ([self.delegate respondsToSelector:@selector(invalidateForReason:bridge:)]) {
        [self.delegate invalidateForReason:self.invalidateReason bridge:self];
    }
    // Invalidate modules
    dispatch_group_t group = dispatch_group_create();
    for (HippyModuleData *moduleData in [_moduleSetup moduleDataByID]) {
        // Be careful when grabbing an instance here, we don't want to instantiate
        // any modules just to invalidate them.
        id<HippyBridgeModule> instance = nil;
        if ([moduleData hasInstance]) {
            instance = moduleData.instance;
        }
        if ([instance respondsToSelector:@selector(invalidate)]) {
            dispatch_group_enter(group);
            [self dispatchBlock:^{
                [(id<HippyInvalidating>)instance invalidate];
                dispatch_group_leave(group);
            } queue:moduleData.methodQueue];
        }
        [moduleData invalidate];
    }
    id displayLink = _displayLink;
    id jsExecutor = _javaScriptExecutor;
    id moduleSetup = _moduleSetup;
    _displayLink = nil;
    _moduleSetup = nil;
    _startTime = footstone::TimePoint::SystemNow();
    
    dispatch_group_notify(group, dispatch_get_main_queue(), ^{
        [jsExecutor executeBlockOnJavaScriptQueue:^{
            [displayLink invalidate];
            [jsExecutor invalidate];
            [moduleSetup invalidate];
        }];
    });
}

- (void)enqueueJSCall:(NSString *)moduleDotMethod args:(NSArray *)args {
    NSArray<NSString *> *ids = [moduleDotMethod componentsSeparatedByString:@"."];
    NSString *module = ids[0];
    NSString *method = ids[1];
    [self enqueueJSCall:module method:method args:args completion:NULL];
}

- (void)enqueueCallback:(NSNumber *)cbID args:(NSArray *)args {
    /**
     * AnyThread
     */
    if (!_valid) {
        return;
    }
    [self actuallyInvokeCallback:cbID arguments:args];
}

- (void)actuallyInvokeCallback:(NSNumber *)cbID arguments:(NSArray *)args {
    __weak __typeof(self) weakSelf = self;
    [_javaScriptExecutor invokeCallbackID:cbID arguments:args callback:^(id json, NSError *error) {
        [weakSelf processResponse:json error:error];
    }];
}


#pragma mark - DeviceInfo

- (NSDictionary *)genRawDeviceInfoDict {
    // This method may be called from a child thread
    NSString *iosVersion = [[UIDevice currentDevice] systemVersion];
    struct utsname systemInfo;
    uname(&systemInfo);
    NSString *deviceModel = [NSString stringWithCString:systemInfo.machine encoding:NSUTF8StringEncoding];
    NSMutableDictionary *deviceInfo = [NSMutableDictionary dictionary];
    deviceInfo[kHippyNativeGlobalKeyOS] = kHippyNativeGlobalOSValue;
    deviceInfo[kHippyNativeGlobalKeyOSVersion] = iosVersion;
    deviceInfo[kHippyNativeGlobalKeyDevice] = deviceModel;
    deviceInfo[kHippyNativeGlobalKeySDKVersion] = _HippySDKVersion;
    NSString *appVer = [[NSBundle.mainBundle infoDictionary] objectForKey:kHippyCFBundleShortVersionKey];
    if (appVer) {
        deviceInfo[kHippyNativeGlobalKeyAppVersion] = appVer;
    }
    
    if (self.cachedDimensionsInfo) {
        deviceInfo[kHippyNativeGlobalKeyDimensions] = self.cachedDimensionsInfo;
    }
    
    NSString *countryCode = [[HippyI18nUtils sharedInstance] currentCountryCode];
    NSString *lanCode = [[HippyI18nUtils sharedInstance] currentAppLanguageCode];
    NSWritingDirection direction = [[HippyI18nUtils sharedInstance] writingDirectionForCurrentAppLanguage];
    NSDictionary *localizaitionInfo = @{
        kHippyLocalizaitionCountryKey : countryCode ?: kHippyLocalizaitionValueUnknown,
        kHippyLocalizaitionLanguageKey : lanCode ?: kHippyLocalizaitionValueUnknown,
        kHippyLocalizaitionDirectionKey : @(direction)
    };
    deviceInfo[kHippyNativeGlobalKeyLocalization] = localizaitionInfo;
    deviceInfo[kHippyNativeGlobalKeyNightMode] = @([self isOSNightMode]);
    return deviceInfo;
}

- (NSDictionary *)deviceInfo {
    @synchronized (self) {
        if (!_cachedDeviceInfo) {
            _cachedDeviceInfo = [self genRawDeviceInfoDict];
        }
        return _cachedDeviceInfo;
    }
}


#pragma mark - App UI State Related

static NSString *const hippyOnNightModeChangedEvent = @"onNightModeChanged";
static NSString *const hippyOnNightModeChangedParam1 = @"NightMode";
static NSString *const hippyOnNightModeChangedParam2 = @"RootViewTag";

- (void)setOSNightMode:(BOOL)isOSNightMode withRootViewTag:(nonnull NSNumber *)rootViewTag {
    _isOSNightMode = isOSNightMode;
    // Notify to JS Driver Side
    // 1. Update global object
    [self.javaScriptExecutor updateNativeInfoToHippyGlobalObject:@{ kHippyNativeGlobalKeyNightMode: @(isOSNightMode) }];
    
    // 2. Send event
    [self sendEvent:hippyOnNightModeChangedEvent params:@{ hippyOnNightModeChangedParam1 : @(isOSNightMode),
                                                           hippyOnNightModeChangedParam2 : rootViewTag }];
}


#pragma mark - Debug and Others

- (void)setInspectable:(BOOL)isInspectable {
    [self.javaScriptExecutor setInspecable:isInspectable];
    if (isInspectable && !self.contextName) {
        // Set context name of JSC when inspectable
        self.contextName = self.moduleName;
    }
}

- (NSURL *)debugURL {
    if (_debugMode) {
        return self.bundleURLs.firstObject;
    }
    return nil;
}

- (void)setRedBoxShowEnabled:(BOOL)enabled {
#if HIPPY_DEBUG
    HippyRedBox *redBox = [self redBox];
    redBox.showEnabled = enabled;
#endif  // HIPPY_DEBUG
}

- (void)registerModuleForFrameUpdates:(id<HippyBridgeModule>)module withModuleData:(HippyModuleData *)moduleData {
    [_displayLink registerModuleForFrameUpdates:module withModuleData:moduleData];
}

- (NSString *)sandboxDirectory {
    @synchronized (self) {
        return _sandboxDirectory;
    }
}

- (void)setSandboxDirectory:(NSString *)sandboxDirectory {
    @synchronized (self) {
        if (![_sandboxDirectory isEqual:sandboxDirectory]) {
            _sandboxDirectory = sandboxDirectory;
            if (sandboxDirectory) {
                [self.javaScriptExecutor setSandboxDirectory:sandboxDirectory];
            }
        }
    }
}

- (NSArray<NSURL *> *)bundleURLs {
    return [_allBundleURLs copy];
}

- (void)setContextName:(NSString *)contextName {
    if (![_contextName isEqualToString:contextName]) {
        _contextName = [contextName copy];
        [self.javaScriptExecutor setContextName:contextName];
    }
}

- (void)sendEvent:(NSString *)eventName params:(NSDictionary *_Nullable)params {
    [self.eventDispatcher dispatchNativeEvent:eventName withParams:params];
}


#pragma mark - RootView Related

- (void)setRootView:(UIView *)rootView {
    auto engineResource = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:self.engineKey];
    auto domManager = engineResource->GetDomManager();
    NSNumber *rootTag = [rootView hippyTag];
    //Create a RootNode instance with a root tag
    _rootNode = std::make_shared<hippy::RootNode>([rootTag unsignedIntValue]);
    //Set RootNode for AnimationManager in RootNode
    _rootNode->GetAnimationManager()->SetRootNode(_rootNode);
    //Set DomManager for RootNode
    _rootNode->SetDomManager(domManager);
    //Set screen scale factor and size for Layout system in RooNode
    _rootNode->GetLayoutNode()->SetScaleFactor([UIScreen mainScreen].scale);
    _rootNode->SetRootSize(rootView.frame.size.width, rootView.frame.size.height);
    _rootNode->SetRootOrigin(rootView.frame.origin.x, rootView.frame.origin.y);
    
    // Create NativeRenderManager if needed
    auto renderManager = domManager->GetRenderManager().lock();
    std::shared_ptr<NativeRenderManager> nativeRenderManager;
    if (!renderManager) {
        // Register RenderManager to DomManager
        nativeRenderManager = std::make_shared<NativeRenderManager>(self.moduleName.UTF8String);
        domManager->SetRenderManager(nativeRenderManager);
    } else {
#ifdef HIPPY_EXPERIMENT_LAYER_OPTIMIZATION
        auto opRenderManager = std::static_pointer_cast<hippy::LayerOptimizedRenderManager>(renderManager);
        nativeRenderManager = std::static_pointer_cast<NativeRenderManager>(opRenderManager->GetInternalNativeRenderManager());
#else
        nativeRenderManager = std::static_pointer_cast<NativeRenderManager>(renderManager);
#endif /* HIPPY_EXPERIMENT_LAYER_OPTIMIZATION */
    }
    _renderManager = nativeRenderManager;
    
    // Create UIManager if needed and register it to NativeRenderManager
    // Note that one NativeRenderManager may have multiple UIManager,
    // and one UIManager may have multiple rootViews,
    // But one HippyBridge can only have one UIManager.
    HippyUIManager *uiManager = self.uiManager;
    if (!uiManager) {
        uiManager = [[HippyUIManager alloc] initWithBridge:self];
        [uiManager setDomManager:domManager];
        self.uiManager = uiManager;
    }
    
    //bind rootview and root node
    _renderManager->RegisterRootView(rootView, _rootNode, uiManager);
    
    //setup necessary params for bridge
    [self setupDomManager:domManager rootNode:_rootNode];
}

- (void)resetRootSize:(CGSize)size {
    auto engineResource = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:self.engineKey];
    std::weak_ptr<hippy::RootNode> rootNode = _rootNode;
    auto domManager = engineResource->GetDomManager();
    std::weak_ptr<hippy::DomManager> weakDomManager = domManager;
    std::vector<std::function<void()>> ops = {[rootNode, weakDomManager, size](){
        auto strongRootNode = rootNode.lock();
        auto strongDomManager = weakDomManager.lock();
        if (strongRootNode && strongDomManager) {
            if (std::abs(std::get<0>(strongRootNode->GetRootSize()) - size.width) < DBL_EPSILON &&
                std::abs(std::get<1>(strongRootNode->GetRootSize()) - size.height) < DBL_EPSILON) {
                return;
            }
            strongRootNode->SetRootSize(size.width, size.height);
            strongDomManager->DoLayout(strongRootNode);
            strongDomManager->EndBatch(strongRootNode);
        }
    }};
    domManager->PostTask(hippy::dom::Scene(std::move(ops)));
}

@end

void HippyBridgeFatal(NSError *error, HippyBridge *bridge) {
    // To maintain compatibility with hippy2,
    // the underlying API here does not extend the bridge parameter,
    // so we pass moduleName to distinguish which bridge we belong to.
    HippyFatal(HippyErrorFromErrorAndModuleName(error, bridge.moduleName));
}
