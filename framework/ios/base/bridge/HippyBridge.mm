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
#import "HippyBundleLoadOperation.h"
#import "HippyBundleExecutionOperation.h"
#import "HippyBundleOperationQueue.h"
#import "HippyContextWrapper.h"
#import "HippyDeviceBaseInfo.h"
#import "HippyDisplayLink.h"
#import "HippyEventDispatcher.h"
#import "HippyFileHandler.h"
#import "HippyJSEnginesMapper.h"
#import "HippyJSExecutor.h"
#import "HippyKeyCommands.h"
#import "HippyModuleData.h"
#import "HippyModuleMethod.h"
#import "HippyTurboModuleManager.h"
#import "HippyOCTurboModule.h"
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
#import "NSObject+Render.h"
#import "TypeConverter.h"
#import "VFSUriLoader.h"
#import "HippyBase64DataHandler.h"

#include <objc/runtime.h>
#include <sys/utsname.h>
#include <string>

#include "dom/animation/animation_manager.h"
#include "dom/dom_manager.h"
#include "dom/scene.h"
#include "dom/render_manager.h"
#include "driver/scope.h"
#include "driver/performance/performance.h"
#include "footstone/worker_manager.h"
#include "vfs/uri_loader.h"
#include "VFSUriHandler.h"
#include "footstone/logging.h"

#import "NativeRenderManager.h"
#import "HippyRootView.h"
#import "UIView+Hippy.h"
#import "UIView+MountEvent.h"


#ifdef ENABLE_INSPECTOR
#include "devtools/vfs/devtools_handler.h"
#include "devtools/devtools_data_source.h"
#endif

NSString *const HippyReloadNotification = @"HippyReloadNotification";
NSString *const HippyJavaScriptDidLoadNotification = @"HippyJavaScriptDidLoadNotification";
NSString *const HippyJavaScriptDidFailToLoadNotification = @"HippyJavaScriptDidFailToLoadNotification";
NSString *const HippyDidInitializeModuleNotification = @"HippyDidInitializeModuleNotification";
NSString *const _HippySDKVersion = @HIPPY_STR(HIPPY_VERSION);


static NSString *const HippyNativeGlobalKeyOS = @"OS";
static NSString *const HippyNativeGlobalKeyOSVersion = @"OSVersion";
static NSString *const HippyNativeGlobalKeyDevice = @"Device";
static NSString *const HippyNativeGlobalKeySDKVersion = @"SDKVersion";
static NSString *const HippyNativeGlobalKeyAppVersion = @"AppVersion";
static NSString *const HippyNativeGlobalKeyDimensions = @"Dimensions";
static NSString *const HippyNativeGlobalKeyLocalization = @"Localization";
static NSString *const HippyNativeGlobalKeyNightMode = @"NightMode";


typedef NS_ENUM(NSUInteger, HippyBridgeFields) {
    HippyBridgeFieldRequestModuleIDs = 0,
    HippyBridgeFieldMethodIDs,
    HippyBridgeFieldParams,
    HippyBridgeFieldCallID,
};

/// Set the log delegate for hippy core module
static inline void registerLogDelegateToHippyCore() {
    static dispatch_once_t onceToken;
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
            HippyLogNativeInternal(logLevel, "tdf", 0, @"%s", stream.str().c_str());
        });
    });
}


@interface HippyBridge() {
    NSMutableArray<Class<HippyImageProviderProtocol>> *_imageProviders;
    __weak id<HippyMethodInterceptorProtocol> _methodInterceptor;
    HippyModulesSetup *_moduleSetup;
    __weak NSOperation *_lastOperation;
    BOOL _wasBatchActive;
    HippyDisplayLink *_displayLink;
    HippyBridgeModuleProviderBlock _moduleProvider;
    BOOL _valid;
    HippyBundleOperationQueue *_bundlesQueue;
    NSMutableArray<NSURL *> *_bundleURLs;
    NSURL *_sandboxDirectory;
    
    footstone::TimePoint _startTime;
    
    std::shared_ptr<VFSUriLoader> _uriLoader;
    std::shared_ptr<hippy::RootNode> _rootNode;
    
    // 缓存的设备信息
    NSDictionary *_cachedDeviceInfo;
}

/// 用于标记bridge所使用的JS引擎的Key
///
/// 注意：传入相同值的bridge将共享底层JS引擎。
/// 在共享情况下，只有全部bridge实例均释放，JS引擎资源才会销毁。
/// 默认情况下对每个bridge使用独立JS引擎
@property (nonatomic, strong) NSString *engineKey;
/// 等待加载(Load)的 Vendor bundleURL
@property (nonatomic, strong) NSURL *pendingLoadingVendorBundleURL;

@property(readwrite, strong) dispatch_semaphore_t moduleSemaphore;
@property(readwrite, assign) NSInteger loadingCount;


/// 缓存的Dimensions信息，用于传递给JS Side
@property (atomic, strong) NSDictionary *cachedDimensionsInfo;

@end

@implementation HippyBridge

dispatch_queue_t HippyJSThread;

dispatch_queue_t HippyBridgeQueue() {
    static dispatch_once_t onceToken;
    static dispatch_queue_t queue;
    dispatch_once(&onceToken, ^{
        dispatch_queue_attr_t attr =
            dispatch_queue_attr_make_with_qos_class(DISPATCH_QUEUE_SERIAL, QOS_CLASS_USER_INITIATED, 0);
        queue = dispatch_queue_create("com.hippy.bridge", attr);
    });
    return queue;
}

+ (void)initialize {
    [super initialize];
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        // Set up JS thread
        HippyJSThread = (id)kCFNull;
    });
}

- (instancetype)initWithDelegate:(id<HippyBridgeDelegate>)delegate
                  moduleProvider:(HippyBridgeModuleProviderBlock)block
                   launchOptions:(NSDictionary *)launchOptions
                     executorKey:(nullable NSString *)executorKey {
    return [self initWithDelegate:delegate
                        bundleURL:nil
                   moduleProvider:block
                    launchOptions:launchOptions
                      executorKey:executorKey];
}

- (instancetype)initWithDelegate:(id<HippyBridgeDelegate>)delegate
                       bundleURL:(NSURL *)bundleURL
                  moduleProvider:(HippyBridgeModuleProviderBlock)block
                   launchOptions:(NSDictionary *)launchOptions
                     executorKey:(nullable NSString *)executorKey {
    if (self = [super init]) {
        _delegate = delegate;
        _moduleProvider = block;
        _pendingLoadingVendorBundleURL = bundleURL;
        _bundleURLs = [NSMutableArray array];
        _shareOptions = [NSMutableDictionary dictionary];
        _debugMode = [launchOptions[@"DebugMode"] boolValue];
        _enableTurbo = !!launchOptions[@"EnableTurbo"] ? [launchOptions[@"EnableTurbo"] boolValue] : YES;
        _engineKey = executorKey.length > 0 ? executorKey : [NSString stringWithFormat:@"%p", self];
        _invalidateReason = HippyInvalidateReasonDealloc;
        _valid = YES;
        _bundlesQueue = [[HippyBundleOperationQueue alloc] init];
        _startTime = footstone::TimePoint::SystemNow();
        HippyLogInfo(@"HippyBridge init begin, self:%p", self);
        registerLogDelegateToHippyCore();
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(rootViewContentDidAppear:)
                                                     name:HippyContentDidAppearNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onFirstContentfulPaintEnd:)
                                                     name:HippyFirstContentfulPaintEndNotification object:nil];
        HippyExecuteOnMainThread(^{
            self->_isOSNightMode = [HippyDeviceBaseInfo isUIScreenInOSDarkMode];
            self.cachedDimensionsInfo = hippyExportedDimensions(self);
        }, YES);
        
        [self setUp];
        
        [self addImageProviderClass:[HippyDefaultImageProvider class]];
        [self setVFSUriLoader:[self createURILoaderIfNeeded]];
        [self setUpNativeRenderManager];
        
        [HippyBridge setCurrentBridge:self];
        
        [self loadPendingVendorBundleURLIfNeeded];
        
        // Set the default sandbox directory
        [self setSandboxDirectory:[bundleURL URLByDeletingLastPathComponent]];
        HippyLogInfo(@"HippyBridge init end, self:%p", self);
    }
    return self;
}

- (void)rootViewContentDidAppear:(NSNotification *)noti {
    UIView *rootView = [noti object];
    if (rootView) {
        auto viewRenderManager = [rootView renderManager];
        if (_renderManager && _renderManager == viewRenderManager.lock()) {
            std::shared_ptr<hippy::Scope> scope = _javaScriptExecutor.pScope;
            if (!scope) {
                return;
            }
            auto domManager = scope->GetDomManager().lock();
            auto performance = scope->GetPerformance();
            if (domManager && performance) {
                auto entry = performance->PerformanceNavigation(hippy::kPerfNavigationHippyInit);
                if (!entry) {
                    return;
                }
                entry->SetHippyDomStart(domManager->GetDomStartTimePoint());
                entry->SetHippyDomEnd(domManager->GetDomEndTimePoint());
                entry->SetHippyFirstFrameStart(domManager->GetDomEndTimePoint());
                entry->SetHippyFirstFrameEnd(footstone::TimePoint::SystemNow());
            }
        }
    }
}

- (void)onFirstContentfulPaintEnd:(NSNotification *)noti {
    UIView *fcpView = [noti object];
    if (fcpView) {
        auto viewRenderManager = [fcpView renderManager];
        if (_renderManager && _renderManager == viewRenderManager.lock()) {
            std::shared_ptr<hippy::Scope> scope = _javaScriptExecutor.pScope;
            if (!scope) {
                return;
            }
            auto domManager = scope->GetDomManager().lock();
            auto performance = scope->GetPerformance();
            if (domManager && performance) {
                auto entry = performance->PerformanceNavigation(hippy::kPerfNavigationHippyInit);
                if (!entry) {
                    return;
                }
                entry->SetHippyFirstContentfulPaintEnd(footstone::TimePoint::SystemNow());
            }
        }
    }
}

- (void)dealloc {
    /**
     * This runs only on the main thread, but crashes the subclass
     * HippyAssertMainQueue();
     */
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ dealloc %p", NSStringFromClass([self class]), self);
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    self.invalidateReason = HippyInvalidateReasonDealloc;
    [self invalidate];
    
    // FIXME: 检查问题
    if (_uriLoader) {
        _uriLoader->Terminate();
    }
    if (_rootNode) {
        _renderManager->RemoveVSyncEventListener(_rootNode);
        _rootNode->ReleaseResources();
    }
}

- (void)setUpNativeRenderManager {
    auto engineResource = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:self.engineKey];
    auto domManager = engineResource->GetDomManager();
    //Create NativeRenderManager
    auto nativeRenderManager = std::make_shared<NativeRenderManager>();
    nativeRenderManager->Initialize();
    //set dom manager
    nativeRenderManager->SetDomManager(domManager);
    nativeRenderManager->SetVFSUriLoader([self createURILoaderIfNeeded]);
    nativeRenderManager->SetHippyBridge(self);
    _renderManager = nativeRenderManager;
}

- (std::shared_ptr<VFSUriLoader>)createURILoaderIfNeeded {
    if (!_uriLoader) {
        auto uriHandler = std::make_shared<VFSUriHandler>();
        auto uriLoader = std::make_shared<VFSUriLoader>();
        uriLoader->PushDefaultHandler(uriHandler);
        uriLoader->AddConvenientDefaultHandler(uriHandler);
        auto fileHandler = std::make_shared<HippyFileHandler>(self);
        auto base64DataHandler = std::make_shared<HippyBase64DataHandler>();
        uriLoader->RegisterConvenientUriHandler(@"file", fileHandler);
        uriLoader->RegisterConvenientUriHandler(@"hpfile", fileHandler);
        uriLoader->RegisterConvenientUriHandler(@"data", base64DataHandler);
        _uriLoader = uriLoader;
    }
    return _uriLoader;
}

- (NSArray<Class> *)moduleClasses {
    return _moduleSetup.moduleClasses;
}

- (id)moduleForName:(NSString *)moduleName {
    return [_moduleSetup moduleForName:moduleName];
}

- (id)moduleForClass:(Class)moduleClass {
    return [_moduleSetup moduleForClass:moduleClass];
}

- (HippyModuleData *)moduleDataForName:(NSString *)moduleName {
    if (moduleName) {
        return _moduleSetup.moduleDataByName[moduleName];
    }
    return nil;
}

- (void)addImageProviderClass:(Class<HippyImageProviderProtocol>)cls {
    HippyAssertParam(cls);
    @synchronized (self) {
        if (!_imageProviders) {
            _imageProviders = [NSMutableArray array];
        }
        [_imageProviders addObject:cls];
    }
}

- (NSArray<Class<HippyImageProviderProtocol>> *)imageProviderClasses {
    @synchronized (self) {
        if (!_imageProviders) {
            _imageProviders = [NSMutableArray array];
        }
        return [_imageProviders copy];
    }
}

- (NSArray *)modulesConformingToProtocol:(Protocol *)protocol {
    NSMutableArray *modules = [NSMutableArray new];
    for (Class moduleClass in self.moduleClasses) {
        if ([moduleClass conformsToProtocol:protocol]) {
            id module = [self moduleForClass:moduleClass];
            if (module) {
                [modules addObject:module];
            }
        }
    }
    return [modules copy];
}

- (BOOL)moduleIsInitialized:(Class)moduleClass {
    return [_moduleSetup isModuleInitialized:moduleClass];
}


#pragma mark - Debug Reload

- (void)reload {
    if ([self.delegate respondsToSelector:@selector(reload:)]) {
        self.invalidateReason = HippyInvalidateReasonReload;
        [self invalidate];
        [self setUp];
        [self.delegate reload:self];
        self.invalidateReason = HippyInvalidateReasonDealloc;
    }
}

- (void)requestReload {
    if (_debugMode) {
        [[NSNotificationCenter defaultCenter] postNotificationName:HippyReloadNotification object:nil];
        [self reload];
    }
}


#pragma mark - Bridge SetUp

- (void)setUp {
    _valid = YES;
    self.moduleSemaphore = dispatch_semaphore_create(0);
    @try {
        __weak HippyBridge *weakSelf = self;
        _moduleSetup = [[HippyModulesSetup alloc] initWithBridge:self extraProviderModulesBlock:_moduleProvider];
        _javaScriptExecutor = [[HippyJSExecutor alloc] initWithEngineKey:self.engineKey bridge:self];
        _javaScriptExecutor.contextCreatedBlock = ^(id<HippyContextWrapper> ctxWrapper){
            HippyBridge *strongSelf = weakSelf;
            if (strongSelf) {
                dispatch_semaphore_wait(strongSelf.moduleSemaphore, DISPATCH_TIME_FOREVER);
                NSString *moduleConfig = [strongSelf moduleConfig];
                [ctxWrapper createGlobalObject:@"__hpBatchedBridgeConfig" withJsonValue:moduleConfig];
#if HIPPY_DEV
                //default is yes when debug mode
                [strongSelf setInspectable:YES];
#endif //HIPPY_DEV
            }
        };
        [_javaScriptExecutor setup];
        if (_contextName) {
            _javaScriptExecutor.contextName = _contextName;
        }
        _displayLink = [[HippyDisplayLink alloc] init];

        // Setup all extra and internal modules
        [_moduleSetup setupModulesWithCompletionBlock:^{
            HippyBridge *strongSelf = weakSelf;
            if (strongSelf) {
                dispatch_semaphore_signal(strongSelf.moduleSemaphore);
                footstone::TimePoint endTime = footstone::TimePoint::SystemNow();
                auto enty = strongSelf.javaScriptExecutor.pScope->GetPerformance()->PerformanceNavigation(hippy::kPerfNavigationHippyInit);
                enty->SetHippyNativeInitStart(strongSelf->_startTime);
                enty->SetHippyNativeInitEnd(endTime);
            }
        }];
        
    } @catch (NSException *exception) {
        HippyBridgeHandleException(exception, self);
    }
}


/// 加载初始化bridge时传入的Bundle URL
- (void)loadPendingVendorBundleURLIfNeeded {
    if (self.pendingLoadingVendorBundleURL) {
        [self loadBundleURL:self.pendingLoadingVendorBundleURL completion:^(NSURL * _Nullable url, NSError * _Nullable error) {
            if (error) {
                HippyLogError(@"[Hippy_OC_Log][HippyBridge], bundle loaded error:%@, %@", url, error.description);
            } else {
                HippyLogInfo(@"[Hippy_OC_Log][HippyBridge], bundle loaded success:%@", url);
            }
        }];
    }
}


- (void)loadBundleURL:(NSURL *)bundleURL
           completion:(void (^_Nullable)(NSURL  * _Nullable, NSError * _Nullable))completion {
    if (!bundleURL) {
        if (completion) {
            static NSString *bundleError = @"bundle url is nil";
            NSError *error = [NSError errorWithDomain:@"Bridge Bundle Loading Domain" code:1 userInfo:@{NSLocalizedFailureReasonErrorKey: bundleError}];
            completion(nil, error);
        }
        return;
    }
    HippyLogInfo(@"[HP PERF] Begin loading bundle(%s) at %s", HP_CSTR_NOT_NULL(bundleURL.absoluteString.lastPathComponent.UTF8String), HP_CSTR_NOT_NULL(bundleURL.absoluteString.UTF8String));
    [_bundleURLs addObject:bundleURL];
    dispatch_async(HippyBridgeQueue(), ^{
        [self beginLoadingBundle:bundleURL completion:completion];
    });
}

- (void)beginLoadingBundle:(NSURL *)bundleURL
                completion:(void (^)(NSURL  * _Nullable, NSError * _Nullable))completion {
    dispatch_group_t group = dispatch_group_create();
    __weak HippyBridge *weakSelf = self;
    __block NSData *script = nil;
    self.loadingCount++;
    dispatch_group_enter(group);
    NSOperationQueue *bundleQueue = [[NSOperationQueue alloc] init];
    bundleQueue.maxConcurrentOperationCount = 1;
    bundleQueue.name = @"com.hippy.bundleQueue";
    HippyBundleLoadOperation *fetchOp = [[HippyBundleLoadOperation alloc] initWithBridge:self
                                                                               bundleURL:bundleURL
                                                                                   queue:bundleQueue];
    fetchOp.onLoad = ^(NSData *source, NSError *error) {
        if (error) {
            HippyBridgeFatal(error, weakSelf);
        } else {
            script = source;
        }
        dispatch_group_leave(group);
    };
    
    dispatch_group_enter(group);
    HippyBundleExecutionOperation *executeOp = [[HippyBundleExecutionOperation alloc] initWithBlock:^{
        HippyBridge *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.valid) {
            dispatch_group_leave(group);
            return;
        }
        __weak __typeof(strongSelf)weakSelf = strongSelf;
        [strongSelf executeJSCode:script sourceURL:bundleURL onCompletion:^(id result, NSError *error) {
            HippyLogInfo(@"End loading bundle(%s) at %s",
                         HP_CSTR_NOT_NULL(bundleURL.absoluteString.lastPathComponent.UTF8String),
                         HP_CSTR_NOT_NULL(bundleURL.absoluteString.UTF8String));

            if (completion) {
                completion(bundleURL, error);
            }
            HippyBridge *strongSelf = weakSelf;
            if (!strongSelf || !strongSelf.valid) {
                dispatch_group_leave(group);
                return;
            }
            if (error) {
                HippyBridgeFatal(error, strongSelf);
            }
            dispatch_group_leave(group);
        }];
    } queue:bundleQueue];
    
    //set dependency
    [executeOp addDependency:fetchOp];
    if (_lastOperation) {
        [executeOp addDependency:_lastOperation];
        _lastOperation = executeOp;
    } else {
        _lastOperation = executeOp;
    }
    [_bundlesQueue addOperations:@[fetchOp, executeOp]];
    dispatch_block_t completionBlock = ^(void){
        HippyBridge *strongSelf = weakSelf;
        if (strongSelf && strongSelf.isValid) {
            strongSelf.loadingCount--;
        }
    };
    dispatch_group_notify(group, HippyBridgeQueue(), completionBlock);
}

- (void)unloadInstanceForRootView:(NSNumber *)rootTag {
    if (rootTag) {
        NSDictionary *param = @{@"id": rootTag};
        footstone::value::HippyValue value = [param toHippyValue];
        std::shared_ptr<footstone::value::HippyValue> domValue = std::make_shared<footstone::value::HippyValue>(value);
        self.javaScriptExecutor.pScope->UnloadInstance(domValue);
        
        _renderManager->UnregisterRootView([rootTag intValue]);
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
    NSDictionary *param = @{@"name": _moduleName,
                            @"id": rootTag,
                            @"params": props ?: @{},
                            @"version": _HippySDKVersion};
    footstone::value::HippyValue value = [param toHippyValue];
    std::shared_ptr<footstone::value::HippyValue> domValue = std::make_shared<footstone::value::HippyValue>(value);
    self.javaScriptExecutor.pScope->LoadInstance(domValue);
    HippyLogInfo(@"[HP PERF] End loading instance for HippyBridge(%p)", self);
}

- (void)rootViewSizeChangedEvent:(NSNumber *)tag params:(NSDictionary *)params {
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithDictionary:params];
    [dic setObject:tag forKey:@"rootViewId"];
    [self sendEvent:@"onSizeChanged" params:dic];
}

- (void)setVFSUriLoader:(std::weak_ptr<VFSUriLoader>)uriLoader {
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
#endif
}

- (std::weak_ptr<VFSUriLoader>)VFSUriLoader {
    return _uriLoader;
}

- (void)setInspectable:(BOOL)isInspectable {
    [self.javaScriptExecutor setInspecable:isInspectable];
}

- (void)executeJSCode:(NSData *)script
            sourceURL:(NSURL *)sourceURL
         onCompletion:(HippyJavaScriptCallback)completion {
    if (!script) {
        completion(nil, HippyErrorWithMessageAndModuleName(@"no valid data", _moduleName));
        return;
    }
    if (![self isValid] || !script || !sourceURL) {
        completion(nil, HippyErrorWithMessageAndModuleName(@"bridge is not valid", _moduleName));
        return;
    }
    HippyAssert(self.javaScriptExecutor, @"js executor must not be null");
    __weak HippyBridge *weakSelf = self;
    [self.javaScriptExecutor executeApplicationScript:script sourceURL:sourceURL onComplete:^(id result ,NSError *error) {
        HippyBridge *strongSelf = weakSelf;
        if (!strongSelf || ![strongSelf isValid]) {
            completion(result, error);
            return;
        }
        if (error) {
            [strongSelf stopLoadingWithError:error scriptSourceURL:sourceURL];
        }
        else {
            dispatch_async(dispatch_get_main_queue(), ^{
                NSDictionary *userInfo = @{@"bridge": self, sourceURL: sourceURL};
                [[NSNotificationCenter defaultCenter] postNotificationName:HippyJavaScriptDidLoadNotification
                                                                    object:self
                                                                  userInfo:userInfo];
            });
        }
        completion(result, error);
    }];
}

- (void)stopLoadingWithError:(NSError *)error scriptSourceURL:(NSURL *)sourceURL {
    HippyAssertMainQueue();
    if (![self isValid]) {
        return;
    }
    __weak HippyBridge *weakSelf = self;
    [self.javaScriptExecutor executeBlockOnJavaScriptQueue:^{
        @autoreleasepool {
            HippyBridge *strongSelf = weakSelf;
            if (!strongSelf || ![strongSelf isValid]) {
                [strongSelf.javaScriptExecutor invalidate];
            }
        }
    }];
    NSDictionary *userInfo = @{@"bridge": self, @"error": error, @"sourceURL": sourceURL};
    [[NSNotificationCenter defaultCenter] postNotificationName:HippyJavaScriptDidFailToLoadNotification
                                                        object:self
                                                      userInfo:userInfo];
    if ([error userInfo][HippyJSStackTraceKey]) {
        [self.redBox showErrorMessage:[error localizedDescription] withStack:[error userInfo][HippyJSStackTraceKey]];
    }
}

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
    }
    else {
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
        NSError *retError = HippyErrorFromErrorAndModuleName(error, self.moduleName);
        HippyBridgeFatal(retError, self);
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
                @autoreleasepool {
                    [moduleData.instance partialBatchDidFlush];
                }
            } queue:moduleData.methodQueue];
        }
    }
}

- (void)batchDidComplete {
    NSArray<HippyModuleData *> *moduleDataByID = [_moduleSetup moduleDataByID];
    for (HippyModuleData *moduleData in moduleDataByID) {
        if (moduleData.hasInstance && moduleData.implementsBatchDidComplete) {
            [self dispatchBlock:^{
                @autoreleasepool {
                    [moduleData.instance batchDidComplete];
                }
            } queue:moduleData.methodQueue];
        }
    }
}

- (void)handleBuffer:(NSArray *)buffer {
    NSArray *requestsArray = [HippyConvert NSArray:buffer];

    if (HIPPY_DEBUG && requestsArray.count <= HippyBridgeFieldParams) {
        HippyLogError(@"Buffer should contain at least %tu sub-arrays. Only found %tu", HippyBridgeFieldParams + 1, requestsArray.count);
        return;
    }

    NSArray<NSNumber *> *moduleIDs = [HippyConvert NSNumberArray:requestsArray[HippyBridgeFieldRequestModuleIDs]];
    NSArray<NSNumber *> *methodIDs = [HippyConvert NSNumberArray:requestsArray[HippyBridgeFieldMethodIDs]];
    NSArray<NSArray *> *paramsArrays = [HippyConvert NSArrayArray:requestsArray[HippyBridgeFieldParams]];

    int64_t callID = -1;

    if (requestsArray.count > 3) {
        callID = [requestsArray[HippyBridgeFieldCallID] longLongValue];
    }

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
    //    if (!_valid) {
    //        return nil;
    //    }
    BOOL isValid = [self isValid];
    NSArray<HippyModuleData *> *moduleDataByID = [_moduleSetup moduleDataByID];
    if (moduleID >= [moduleDataByID count]) {
        if (isValid) {
            HippyLogError(@"moduleID %lu exceed range of moduleDataByID %lu, bridge is valid %ld", moduleID, [moduleDataByID count], (long)isValid);
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
    // not for UI Actions if NO==_valid
    if (!isValid) {
        if ([[moduleData name] isEqualToString:@"UIManager"]) {
            return nil;
        }
    }
    NSArray<id<HippyBridgeMethod>> *methods = [moduleData.methods copy];
    if (methodID >= [methods count]) {
        if (isValid) {
            HippyLogError(@"methodID %lu exceed range of moduleData.methods %lu, bridge is valid %ld", moduleID, [methods count], (long)isValid);
        }
        return nil;
    }
    id<HippyBridgeMethod> method = methods[methodID];
    if (HIPPY_DEBUG && !method) {
        if (isValid) {
            HippyLogError(@"Unknown methodID: %lu for module: %lu (%@)", (unsigned long)methodID, (unsigned long)moduleID, moduleData.name);
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

        NSString *message = [NSString stringWithFormat:@"Exception '%@' was thrown while invoking %@ on target %@ with params %@", exception, method.JSMethodName, moduleData.name, params];
        NSError *error = HippyErrorWithMessageAndModuleName(message, self.moduleName);
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

        NSString *message = [NSString stringWithFormat:@"Exception '%@' was thrown while invoking %@ on target %@ with params %@", exception, method.JSMethodName, module.name, params];
        NSError *error = HippyErrorWithMessageAndModuleName(message, self.moduleName);
        HippyBridgeFatal(error, self);
        return nil;
    }
}

- (void)setMethodInterceptor:(id<HippyMethodInterceptorProtocol>)methodInterceptor {
    _methodInterceptor = methodInterceptor;
}

- (id<HippyMethodInterceptorProtocol>)methodInterceptor {
    return _methodInterceptor;
}

- (void)setupDomManager:(std::shared_ptr<hippy::DomManager>)domManager
                  rootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    __weak HippyBridge *weakSelf = self;
    dispatch_block_t block = ^(void){
        HippyBridge *strongSelf = weakSelf;
        HippyAssertParam(domManager);
        if (!strongSelf || !domManager) {
            return;
        }
        strongSelf.javaScriptExecutor.pScope->SetDomManager(domManager);
        strongSelf.javaScriptExecutor.pScope->SetRootNode(rootNode);
      #ifdef ENABLE_INSPECTOR
        auto devtools_data_source = strongSelf->_javaScriptExecutor.pScope->GetDevtoolsDataSource();
        if (devtools_data_source) {
            strongSelf->_javaScriptExecutor.pScope->GetDevtoolsDataSource()->Bind(domManager);
            devtools_data_source->SetRootNode(rootNode);
        }
      #endif
    };
    block();
}

- (BOOL)isValid {
    return _valid;
}

- (BOOL)isLoading {
    NSUInteger count = self.loadingCount;
    return 0 == count;
}

- (BOOL)moduleSetupComplete {
    return _moduleSetup.isModuleSetupComplete;
}

- (void)invalidate {
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ invalide %p", NSStringFromClass([self class]), self);
    if (![self isValid]) {
        return;
    }
    _valid = NO;
    [_bundleURLs removeAllObjects];
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
                @autoreleasepool {
                    [(id<HippyInvalidating>)instance invalidate];
                }
                dispatch_group_leave(group);
            } queue:moduleData.methodQueue];
        }
        [moduleData invalidate];
    }
    id displayLink = _displayLink;
    id jsExecutor = _javaScriptExecutor;
    id moduleSetup = _moduleSetup;
    _displayLink = nil;
    _javaScriptExecutor = nil;
    _moduleSetup = nil;
    _startTime = footstone::TimePoint::SystemNow();
    self.moduleSemaphore = nil;
    
    dispatch_group_notify(group, dispatch_get_main_queue(), ^{
        [jsExecutor executeBlockOnJavaScriptQueue:^{
            @autoreleasepool {
                [displayLink invalidate];
                [jsExecutor invalidate];
                [moduleSetup invalidate];
            }
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
    [deviceInfo setValue:@"ios" forKey:HippyNativeGlobalKeyOS];
    [deviceInfo setValue:iosVersion forKey:HippyNativeGlobalKeyOSVersion];
    [deviceInfo setValue:deviceModel forKey:HippyNativeGlobalKeyDevice];
    [deviceInfo setValue:_HippySDKVersion forKey:HippyNativeGlobalKeySDKVersion];
    
    NSString *appVer = [[NSBundle.mainBundle infoDictionary] objectForKey:@"CFBundleShortVersionString"];
    if (appVer) {
        [deviceInfo setValue:appVer forKey:HippyNativeGlobalKeyAppVersion];
    }
    
    if (self.cachedDimensionsInfo) {
        [deviceInfo setValue:self.cachedDimensionsInfo forKey:HippyNativeGlobalKeyDimensions];
    }
    
    NSString *countryCode = [[HippyI18nUtils sharedInstance] currentCountryCode];
    NSString *lanCode = [[HippyI18nUtils sharedInstance] currentAppLanguageCode];
    NSWritingDirection direction = [[HippyI18nUtils sharedInstance] writingDirectionForCurrentAppLanguage];
    NSDictionary *localizaitionInfo = @{
        @"country" : countryCode?:@"unknown",
        @"language" : lanCode?:@"unknown",
        @"direction" : @(direction)
    };
    [deviceInfo setValue:localizaitionInfo forKey:HippyNativeGlobalKeyLocalization];
    [deviceInfo setValue:@([self isOSNightMode]) forKey:HippyNativeGlobalKeyNightMode];
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


#pragma mark -

static NSString *const hippyOnNightModeChangedEvent = @"onNightModeChanged";
static NSString *const hippyOnNightModeChangedParam1 = @"NightMode";
static NSString *const hippyOnNightModeChangedParam2 = @"RootViewTag";

- (void)setOSNightMode:(BOOL)isOSNightMode withRootViewTag:(nonnull NSNumber *)rootViewTag {
    _isOSNightMode = isOSNightMode;
    // Notify to JS Driver Side
    // 1. Update global object
    [self.javaScriptExecutor updateNativeInfoToHippyGlobalObject:@{ HippyNativeGlobalKeyNightMode: @(isOSNightMode) }];
    
    // 2. Send event
    NSDictionary *args = @{@"eventName": hippyOnNightModeChangedEvent,
                           @"extra": @{ hippyOnNightModeChangedParam1 : @(isOSNightMode),
                                        hippyOnNightModeChangedParam2 : rootViewTag } };
    [self.eventDispatcher dispatchEvent:@"EventDispatcher"
                             methodName:@"receiveNativeEvent" args:args];
}


#pragma mark -

- (NSString *)moduleConfig {
    NSMutableArray<NSArray *> *config = [NSMutableArray new];
    for (HippyModuleData *moduleData in [_moduleSetup moduleDataByID]) {
        NSArray *moduleDataConfig = [moduleData config];
        [config addObject:HippyNullIfNil(moduleDataConfig)];
    }
    id jsonArray = @{
        @"remoteModuleConfig": config,
    };
    return HippyJSONStringify(jsonArray, NULL);
}

- (void)setRedBoxShowEnabled:(BOOL)enabled {
#if HIPPY_DEBUG
    HippyRedBox *redBox = [self redBox];
    redBox.showEnabled = enabled;
#endif  // HIPPY_DEBUG
}

- (HippyOCTurboModule *)turboModuleWithName:(NSString *)name {
    if (!self.enableTurbo) {
        return nil;
    }

    if (name.length <= 0) {
        return nil;
    }

    if(!self.turboModuleManager) {
        self.turboModuleManager = [[HippyTurboModuleManager alloc] initWithBridge:self];
    }

    // getTurboModule
    HippyOCTurboModule *turboModule = [self.turboModuleManager turboModuleWithName:name];
    return turboModule;
}

- (void)registerModuleForFrameUpdates:(id<HippyBridgeModule>)module withModuleData:(HippyModuleData *)moduleData {
    [_displayLink registerModuleForFrameUpdates:module withModuleData:moduleData];
}

- (NSArray *)configForModuleName:(NSString *)moduleName {
    HippyModuleData *moduleData = [_moduleSetup moduleDataByName][moduleName];
    return moduleData.config;
}

- (void)setSandboxDirectory:(NSURL *)sandboxDirectory {
    if (![_sandboxDirectory isEqual:sandboxDirectory]) {
        _sandboxDirectory = sandboxDirectory;
        [self.javaScriptExecutor setSandboxDirectory:[sandboxDirectory absoluteString]];
    }
}

- (NSArray<NSURL *> *)bundleURLs {
    return [_bundleURLs copy];
}

- (void)setContextName:(NSString *)contextName {
    if (![_contextName isEqualToString:contextName]) {
        _contextName = [contextName copy];
        [self.javaScriptExecutor setContextName:contextName];
    }
}

- (void)sendEvent:(NSString *)eventName params:(NSDictionary *_Nullable)params {
    [self.eventDispatcher dispatchEvent:@"EventDispatcher"
                             methodName:@"receiveNativeEvent"
                                   args:@{@"eventName": eventName, @"extra": params ? : @{}}];
}

- (NSData *)snapShotData {
    auto rootNode = _javaScriptExecutor.pScope->GetRootNode().lock();
    if (!rootNode) {
        return nil;
    }
    std::string data = hippy::DomManager::GetSnapShot(rootNode);
    return [NSData dataWithBytes:reinterpret_cast<const void *>(data.c_str()) length:data.length()];
}

- (void)setSnapShotData:(NSData *)data {
    auto domManager = _javaScriptExecutor.pScope->GetDomManager().lock();
    if (!domManager) {
        return;
    }
    auto rootNode = _javaScriptExecutor.pScope->GetRootNode().lock();
    if (!rootNode) {
        return;
    }
    std::string string(reinterpret_cast<const char *>([data bytes]), [data length]);
    domManager->SetSnapShot(rootNode, string);
}


#pragma mark -


//FIXME: 调整优化
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
    
    //set rendermanager for dommanager
    if (!domManager->GetRenderManager().lock()) {
        domManager->SetRenderManager(_renderManager);
    }
    //bind rootview and root node
    _renderManager->RegisterRootView(rootView, _rootNode);
    
    __weak HippyBridge *weakBridge = self;
    auto cb = [weakBridge](int32_t tag, NSDictionary *params){
        HippyBridge *strongBridge = weakBridge;
        if (strongBridge) {
            [strongBridge rootViewSizeChangedEvent:@(tag) params:params];
        }
    };
    _renderManager->SetRootViewSizeChangedEvent(cb);
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
    HippyFatal(error);
}

void HippyBridgeHandleException(NSException *exception, HippyBridge *bridge) {
    HippyHandleException(exception);
}

