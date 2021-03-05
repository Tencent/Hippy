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

#import <Foundation/Foundation.h>

#import "HippyAssert.h"
#import "HippyBridge.h"
#import "HippyBridge+Private.h"
#import "HippyBridgeMethod.h"
#import "HippyConvert.h"
#import "HippyDisplayLink.h"
#import "HippyJSCExecutor.h"
#import "HippyJavaScriptLoader.h"
#import "HippyLog.h"
#import "HippyModuleData.h"
#import "HippyPerformanceLogger.h"
#import "HippyUtils.h"
#import "HippyRedBox.h"
#import "HippyDevLoadingView.h"
#import "HippyDeviceBaseInfo.h"
#include "core/scope.h"

#define HippyAssertJSThread()
//
// #define HippyAssertJSThread() \
//HippyAssert(![NSStringFromClass([self->_javaScriptExecutor class]) isEqualToString:@"HippyJSCExecutor"] || \
//[[[NSThread currentThread] name] isEqualToString:HippyJSCThreadName], \
//@"This method must be called on JS thread")
#import <sys/utsname.h>

#define HippyAssertJSThread() \
//HippyAssert(![NSStringFromClass([self->_javaScriptExecutor class]) isEqualToString:@"HippyJSCExecutor"] || \
//[[[NSThread currentThread] name] isEqualToString:HippyJSCThreadName], \
//@"This method must be called on JS thread")

/**
 * Must be kept in sync with `MessageQueue.js`.
 */
typedef NS_ENUM(NSUInteger, HippyBridgeFields) {
    HippyBridgeFieldRequestModuleIDs = 0,
    HippyBridgeFieldMethodIDs,
    HippyBridgeFieldParams,
    HippyBridgeFieldCallID,
};

@implementation HippyBatchedBridge {
    BOOL _wasBatchActive;
    NSMutableArray<dispatch_block_t> *_pendingCalls;
    NSDictionary<NSString *, HippyModuleData *> *_moduleDataByName;
    NSArray<HippyModuleData *> *_moduleDataByID;
    NSArray<Class> *_moduleClassesByID;
    NSUInteger _modulesInitializedOnMainQueue;
    HippyDisplayLink *_displayLink;
    NSDictionary *_dimDic;
}

@synthesize flowID = _flowID;
@synthesize flowIDMap = _flowIDMap;
@synthesize flowIDMapLock = _flowIDMapLock;
@synthesize loading = _loading;
@synthesize valid = _valid;
@synthesize errorOccured = _errorOccured;
@synthesize performanceLogger = _performanceLogger;

- (instancetype)initWithParentBridge:(HippyBridge *)bridge {
    HippyAssertParam(bridge);

    if (self = [super initWithDelegate:bridge.delegate bundleURL:bridge.bundleURL moduleProvider:bridge.moduleProvider
                         launchOptions:bridge.launchOptions
                           executorKey:bridge.executorKey]) {
        HippyExecuteOnMainThread(
            ^{
                self->_dimDic = hippyExportedDimensions();
            }, YES);
        _parentBridge = bridge;
        _performanceLogger = [bridge performanceLogger];

        HippyLogInfo(@"Initializing %@ (parent: %@, executor: %@)", self, bridge, [self executorClass]);

        /**
         * Set Initial State
         */
        _valid = YES;
        _loading = YES;
        _pendingCalls = [NSMutableArray new];
        _displayLink = [HippyDisplayLink new];

        [HippyBridge setCurrentBridge:self];
    }
    return self;
}

HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithDelegate
                      : (id<HippyBridgeDelegate>)delegate bundleURL
                      : (NSURL *)bundleURL moduleProvider
                      : (HippyBridgeModuleProviderBlock)block launchOptions
                      : (NSDictionary *)launchOptions)

- (void)start {
    self.semaphore = dispatch_semaphore_create(0);
    self.moduleSemaphore = dispatch_semaphore_create(1);
    [[NSNotificationCenter defaultCenter] postNotificationName:HippyJavaScriptWillStartLoadingNotification object:_parentBridge
                                                      userInfo:@{ @"bridge": self }];

    // HIPPY_PROFILE_BEGIN_EVENT(0, @"-[HippyBatchedBridge setUp]", nil);

    dispatch_queue_t bridgeQueue = dispatch_queue_create("com.tencent.hippy.HippyBridgeQueue", DISPATCH_QUEUE_CONCURRENT);

    dispatch_group_t initModulesAndLoadSource = dispatch_group_create();

    // Asynchronously load source code
    dispatch_group_enter(initModulesAndLoadSource);
    __weak HippyBatchedBridge *weakSelf = self;
    __block NSData *sourceCode;
    [self loadSource:^(NSError *error, NSData *source, __unused int64_t sourceLength) {
        if (error) {
            HippyLogWarn(@"Failed to load source: %@", error);
            dispatch_async(dispatch_get_main_queue(), ^{
                [weakSelf stopLoadingWithError:error];
            });
        }

        sourceCode = source;
        dispatch_group_leave(initModulesAndLoadSource);
    } onProgress:^(HippyLoadingProgress *progressData) {
#ifdef HIPPY_DEV
        HippyDevLoadingView *loadingView = [weakSelf moduleForClass:[HippyDevLoadingView class]];
        [loadingView updateProgress:progressData];
#endif
    }];

    // Synchronously initialize all native modules that cannot be loaded lazily
    [self initModulesWithDispatchGroup:initModulesAndLoadSource];

    HippyPerformanceLogger *performanceLogger = self->_performanceLogger;
    __block NSString *config;
    dispatch_group_enter(initModulesAndLoadSource);
    dispatch_async(bridgeQueue, ^{
        dispatch_group_t setupJSExecutorAndModuleConfig = dispatch_group_create();

        // Asynchronously initialize the JS executor
        dispatch_group_async(setupJSExecutorAndModuleConfig, bridgeQueue, ^{
            [performanceLogger markStartForTag:HippyPLJSCExecutorSetup];
            [weakSelf setUpExecutor];
            [performanceLogger markStopForTag:HippyPLJSCExecutorSetup];
        });

        // Asynchronously gather the module config
        dispatch_group_async(setupJSExecutorAndModuleConfig, bridgeQueue, ^{
            if (weakSelf.valid) {
                // HIPPY_PROFILE_BEGIN_EVENT(0, @"-[HippyBatchedBridge moduleConfig", nil);
                [performanceLogger markStartForTag:HippyPLNativeModulePrepareConfig];
                config = [weakSelf moduleConfig];
                [performanceLogger markStopForTag:HippyPLNativeModulePrepareConfig];
                // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"");
            }
        });

        dispatch_group_notify(setupJSExecutorAndModuleConfig, bridgeQueue, ^{
            // We're not waiting for this to complete to leave dispatch group, since
            // injectJSONConfiguration and executeSourceCode will schedule operations
            // on the same queue anyway.
            [performanceLogger markStartForTag:HippyPLNativeModuleInjectConfig];
            [weakSelf injectJSONConfiguration:config onComplete:^(NSError *error) {
                [performanceLogger markStopForTag:HippyPLNativeModuleInjectConfig];
                if (error) {
                    HippyLogWarn(@"Failed to inject config: %@", error);
                    dispatch_async(dispatch_get_main_queue(), ^{
                        [weakSelf stopLoadingWithError:error];
                    });
                }
            }];
            dispatch_group_leave(initModulesAndLoadSource);
        });
    });

    dispatch_group_notify(initModulesAndLoadSource, bridgeQueue, ^{
        HippyBatchedBridge *strongSelf = weakSelf;
        if (sourceCode && strongSelf.loading) {
            [strongSelf executeSourceCode:sourceCode];
        }
    });

    // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"");
}

- (void)loadSource:(HippySourceLoadBlock)_onSourceLoad onProgress:(HippySourceLoadProgressBlock)onProgress {
    [_performanceLogger markStartForTag:HippyPLScriptDownload];

    HippyPerformanceLogger *performanceLogger = _performanceLogger;
    HippySourceLoadBlock onSourceLoad = ^(NSError *error, NSData *source, int64_t sourceLength) {
        [performanceLogger markStopForTag:HippyPLScriptDownload];
        [performanceLogger setValue:sourceLength forTag:HippyPLBundleSize];
        _onSourceLoad(error, source, sourceLength);
    };

    if ([self.delegate respondsToSelector:@selector(loadSourceForBridge:onProgress:onComplete:)]) {
        [self.delegate loadSourceForBridge:_parentBridge onProgress:onProgress onComplete:onSourceLoad];
    } else if ([self.delegate respondsToSelector:@selector(loadSourceForBridge:withBlock:)]) {
        [self.delegate loadSourceForBridge:_parentBridge withBlock:onSourceLoad];
    } else {
        HippyAssert(self.bundleURL, @"bundleURL must be non-nil when not implementing loadSourceForBridge");

        [HippyJavaScriptLoader
            loadBundleAtURL:self.bundleURL
                 onProgress:onProgress
                 onComplete:^(NSError *error, NSData *source, int64_t sourceLength) {
                     if (error && [self.delegate respondsToSelector:@selector(fallbackSourceURLForBridge:)]) {
                         NSURL *fallbackURL = [self.delegate fallbackSourceURLForBridge:self->_parentBridge];
                         if (fallbackURL && ![fallbackURL isEqual:self.bundleURL]) {
                             HippyLogError(@"Failed to load bundle(%@) with error:(%@)", self.bundleURL, error.localizedDescription);
                             self.bundleURL = fallbackURL;
                             [HippyJavaScriptLoader loadBundleAtURL:self.bundleURL onProgress:onProgress onComplete:onSourceLoad];
                             return;
                         }
                     }
                     onSourceLoad(error, source, sourceLength);
                 }];
    }
}

- (NSArray<Class> *)moduleClasses {
    if (HIPPY_DEBUG && _valid && _moduleClassesByID == nil) {
        HippyLogError(@"Bridge modules have not yet been initialized. You may be "
                       "trying to access a module too early in the startup procedure.");
    }
    return _moduleClassesByID;
}

/**
 * Used by HippyUIManager
 */
- (HippyModuleData *)moduleDataForName:(NSString *)moduleName {
    return _moduleDataByName[moduleName];
}

- (id)moduleForName:(NSString *)moduleName {
    id module = _moduleDataByName[moduleName].instance;
    return module;
}

- (BOOL)moduleIsInitialized:(Class)moduleClass {
    return _moduleDataByName[HippyBridgeModuleNameForClass(moduleClass)].hasInstance;
}

- (NSArray *)configForModuleName:(NSString *)moduleName {
    HippyModuleData *moduleData = _moduleDataByName[moduleName];
    if (moduleData) {
#if HIPPY_DEV
        if ([self.delegate respondsToSelector:@selector(whitelistedModulesForBridge:)]) {
            NSArray *whitelisted = [self.delegate whitelistedModulesForBridge:self];
            HippyAssert(!whitelisted || [whitelisted containsObject:[moduleData moduleClass]], @"Required config for %@, which was not whitelisted",
                moduleName);
        }
#endif
    }
    return moduleData.config;
}

- (void)initModulesWithDispatchGroup:(__unused dispatch_group_t)dispatchGroup {
    // HIPPY_PROFILE_BEGIN_EVENT(0, @"-[HippyBatchedBridge initModules]", nil);
    dispatch_semaphore_wait(self.moduleSemaphore, DISPATCH_TIME_FOREVER);
    [_performanceLogger markStartForTag:HippyPLNativeModuleInit];

    NSArray<id<HippyBridgeModule>> *extraModules = nil;
    if (self.delegate && [self.delegate respondsToSelector:@selector(extraModulesForBridge:)]) {
        extraModules = [self.delegate extraModulesForBridge:_parentBridge];
    } else if (self.moduleProvider) {
        extraModules = self.moduleProvider();
    }

#if HIPPY_DEBUG
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        HippyVerifyAllModulesExported(extraModules);
    });
#endif

    NSMutableArray<Class> *moduleClassesByID = [NSMutableArray new];
    NSMutableArray<HippyModuleData *> *moduleDataByID = [NSMutableArray new];
    NSMutableDictionary<NSString *, HippyModuleData *> *moduleDataByName = [NSMutableDictionary new];

    // Set up moduleData for pre-initialized module instances
    // HIPPY_PROFILE_BEGIN_EVENT(0, @"extraModules", nil);
    for (id<HippyBridgeModule> module in extraModules) {
        Class moduleClass = [module class];
        NSString *moduleName = HippyBridgeModuleNameForClass(moduleClass);

        if (HIPPY_DEBUG) {
            // Check for name collisions between preregistered modules
            HippyModuleData *moduleData = moduleDataByName[moduleName];
            if (moduleData) {
                HippyLogError(@"Attempted to register HippyBridgeModule class %@ for the "
                               "name '%@', but name was already registered by class %@",
                    moduleClass, moduleName, moduleData.moduleClass);
                continue;
            }
        }

        // Instantiate moduleData container
        HippyModuleData *moduleData = [[HippyModuleData alloc] initWithModuleInstance:module bridge:self];
        moduleDataByName[moduleName] = moduleData;
        [moduleClassesByID addObject:moduleClass];
        [moduleDataByID addObject:moduleData];

        // Set executor instance
        if (moduleClass == self.executorClass) {
            _javaScriptExecutor = (id<HippyJavaScriptExecutor>)module;
        }
    }
    // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"");

    // The executor is a bridge module, but we want it to be instantiated before
    // any other module has access to the bridge, in case they need the JS thread.
    // TODO: once we have more fine-grained control of init (t11106126) we can
    // probably just replace this with [self moduleForClass:self.executorClass]
    // HIPPY_PROFILE_BEGIN_EVENT(0, @"JavaScriptExecutor", nil);
    if (!_javaScriptExecutor) {
        id<HippyJavaScriptExecutor> executorModule = [[self.executorClass alloc] initWithExecurotKey:self.executorKey bridge:self];
        HippyModuleData *moduleData = [[HippyModuleData alloc] initWithModuleInstance:executorModule bridge:self];
        moduleDataByName[moduleData.name] = moduleData;
        [moduleClassesByID addObject:self.executorClass];
        [moduleDataByID addObject:moduleData];

        // NOTE: _javaScriptExecutor is a weak reference
        _javaScriptExecutor = executorModule;
    }
    // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"");

    // Set up moduleData for automatically-exported modules
    // HIPPY_PROFILE_BEGIN_EVENT(0, @"ModuleData", nil);
    for (Class moduleClass in HippyGetModuleClasses()) {
        NSString *moduleName = HippyBridgeModuleNameForClass(moduleClass);

        // Check for module name collisions
        HippyModuleData *moduleData = moduleDataByName[moduleName];
        if (moduleData) {
            if (moduleData.hasInstance) {
                // Existing module was preregistered, so it takes precedence
                continue;
            } else if ([moduleClass new] == nil) {
                // The new module returned nil from init, so use the old module
                continue;
            } else if ([moduleData.moduleClass new] != nil) {
                // Both modules were non-nil, so it's unclear which should take precedence
                HippyLogError(@"Attempted to register HippyBridgeModule class %@ for the "
                               "name '%@', but name was already registered by class %@",
                    moduleClass, moduleName, moduleData.moduleClass);
            }
        }

        // Instantiate moduleData (TODO: can we defer this until config generation?)
        moduleData = [[HippyModuleData alloc] initWithModuleClass:moduleClass bridge:self];
        moduleDataByName[moduleName] = moduleData;
        [moduleClassesByID addObject:moduleClass];
        [moduleDataByID addObject:moduleData];
    }

    // Store modules
    _moduleDataByID = [moduleDataByID copy];
    _moduleDataByName = [moduleDataByName copy];
    _moduleClassesByID = [moduleClassesByID copy];
    // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"");
    dispatch_semaphore_signal(self.moduleSemaphore);

    // Synchronously set up the pre-initialized modules
    // HIPPY_PROFILE_BEGIN_EVENT(0, @"extraModules", nil);
    for (HippyModuleData *moduleData in _moduleDataByID) {
        if (moduleData.hasInstance && (!moduleData.requiresMainQueueSetup || HippyIsMainQueue())) {
            // Modules that were pre-initialized should ideally be set up before
            // bridge init has finished, otherwise the caller may try to access the
            // module directly rather than via `[bridge moduleForClass:]`, which won't
            // trigger the lazy initialization process. If the module cannot safely be
            // set up on the current thread, it will instead be async dispatched
            // to the main thread to be set up in the loop below.
            (void)[moduleData instance];
        }
    }
    // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"");

    // From this point on, HippyDidInitializeModuleNotification notifications will
    // be sent the first time a module is accessed.
    _moduleSetupComplete = YES;

    [self prepareModulesWithDispatchGroup:NULL];

    [_performanceLogger markStopForTag:HippyPLNativeModuleInit];
    // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"");
}

- (void)prepareModulesWithDispatchGroup:(dispatch_group_t)dispatchGroup {
    // HIPPY_PROFILE_BEGIN_EVENT(0, @"-[HippyBatchedBridge prepareModulesWithDispatch]", nil);

    NSArray<Class> *whitelistedModules = nil;
    if ([self.delegate respondsToSelector:@selector(whitelistedModulesForBridge:)]) {
        whitelistedModules = [self.delegate whitelistedModulesForBridge:self];
    }

    BOOL initializeImmediately = NO;
    if (dispatchGroup == NULL) {
        // If no dispatchGroup is passed in, we must prepare everything immediately.
        // We better be on the right thread too.
        HippyAssertMainQueue();
        initializeImmediately = YES;
    } else if ([self.delegate respondsToSelector:@selector(shouldBridgeInitializeNativeModulesSynchronously:)]) {
        initializeImmediately = [self.delegate shouldBridgeInitializeNativeModulesSynchronously:self];
    }

    // Set up modules that require main thread init or constants export
    for (HippyModuleData *moduleData in _moduleDataByID) {
        if (whitelistedModules && ![whitelistedModules containsObject:[moduleData moduleClass]]) {
            continue;
        }

        if (moduleData.requiresMainQueueSetup || moduleData.hasConstantsToExport) {
            // Modules that need to be set up on the main thread cannot be initialized
            // lazily when required without doing a dispatch_sync to the main thread,
            // which can result in deadlock. To avoid this, we initialize all of these
            // modules on the main thread in parallel with loading the JS code, so
            // they will already be available before they are ever required.
            dispatch_block_t block = ^{
                if (self.valid) {
                    [self->_performanceLogger appendStartForTag:HippyPLNativeModuleMainThread];
                    (void)[moduleData instance];
                    [moduleData gatherConstants];
                    [self->_performanceLogger appendStopForTag:HippyPLNativeModuleMainThread];
                }
            };

            if (initializeImmediately && HippyIsMainQueue()) {
                block();
            } else {
                // We've already checked that dispatchGroup is non-null, but this satisifies the
                // Xcode analyzer
                if (dispatchGroup) {
                    dispatch_group_async(dispatchGroup, dispatch_get_main_queue(), block);
                }
            }
            _modulesInitializedOnMainQueue++;
        }
    }

    [_performanceLogger setValue:_modulesInitializedOnMainQueue forTag:HippyPLNativeModuleMainThreadUsesCount];
    // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"");
}

- (void)whitelistedModulesDidChange {
    HippyAssertMainQueue();
    [self prepareModulesWithDispatchGroup:NULL];
}

- (void)setUpExecutor {
    [_javaScriptExecutor setUp];
}

- (void)registerModuleForFrameUpdates:(id<HippyBridgeModule>)module withModuleData:(HippyModuleData *)moduleData {
    [_displayLink registerModuleForFrameUpdates:module withModuleData:moduleData];
}

- (NSString *)moduleConfig {
    NSMutableArray<NSArray *> *config = [NSMutableArray new];
    dispatch_semaphore_wait(self.moduleSemaphore, DISPATCH_TIME_FOREVER);
    for (HippyModuleData *moduleData in _moduleDataByID) {
        if (self.executorClass == [HippyJSCExecutor class]) {
            [config addObject:@[moduleData.name]];
        } else {
            [config addObject:HippyNullIfNil(moduleData.config)];
        }
    }
    dispatch_semaphore_signal(self.moduleSemaphore);
    return HippyJSONStringify(@{
        @"remoteModuleConfig": config,
    },
        NULL);
}

- (void)injectJSONConfiguration:(NSString *)configJSON onComplete:(void (^)(NSError *))onComplete {
    if (!_valid) {
        return;
    }

    [_javaScriptExecutor injectJSONText:configJSON asGlobalObjectNamed:@"__fbBatchedBridgeConfig" callback:onComplete];
}

- (void)executeSourceCode:(NSData *)sourceCode {
    if (!_valid || !_javaScriptExecutor) {
        return;
    }

    [self->_performanceLogger markStartForTag:HippyExecuteSource];
    [self enqueueApplicationScript:sourceCode url:self.bundleURL onComplete:^(NSError *loadError) {
        if (!self->_valid) {
            return;
        }

        if (loadError) {
            HippyLogWarn(@"Failed to execute source code: %@", [loadError localizedDescription]);
            dispatch_async(dispatch_get_main_queue(), ^{
                [self stopLoadingWithError:loadError];
            });
            return;
        }

        // Register the display link to start sending js calls after everything is setup
        //        NSRunLoop *targetRunLoop = [self->_javaScriptExecutor isKindOfClass:[HippyJSCExecutor class]] ? [NSRunLoop currentRunLoop] :
        //        [NSRunLoop mainRunLoop];
        // hipp core功能中线程全部由c++创建，因此将所有displayLink放在mainRunLoop
        [self->_displayLink addToRunLoop:[NSRunLoop mainRunLoop]];

        // Log metrics about native requires during the bridge startup.
        uint64_t nativeRequiresCount = [self->_performanceLogger valueForTag:HippyPLRAMNativeRequiresCount];
        [self->_performanceLogger setValue:nativeRequiresCount forTag:HippyPLRAMStartupNativeRequiresCount];
        uint64_t nativeRequires = [self->_performanceLogger valueForTag:HippyPLRAMNativeRequires];
        [self->_performanceLogger setValue:nativeRequires forTag:HippyPLRAMStartupNativeRequires];

        [self->_performanceLogger markStopForTag:HippyPLBridgeStartup];
        [self->_performanceLogger markStopForTag:HippyExecuteSource];
        // Perform the notification on the main thread, so we can't run into
        // timing issues with HippyRootView

#ifdef DEBUG
        NSUInteger HippyPLScriptDownloads = (NSUInteger)[self->_performanceLogger durationForTag:HippyPLScriptDownload];
        NSUInteger HippyPLNativeModuleInits = (NSUInteger)[self->_performanceLogger durationForTag:HippyPLNativeModuleInit];
        NSUInteger HippyPLJSCExecutorSetups = (NSUInteger)[self->_performanceLogger durationForTag:HippyPLJSCExecutorSetup];
        NSUInteger HippyPLNativeModuleInjectConfigs = (NSUInteger)[self->_performanceLogger durationForTag:HippyPLNativeModuleInjectConfig];
        NSUInteger HippyPLNativeModulePrepareConfigs = (NSUInteger)[self->_performanceLogger durationForTag:HippyPLNativeModulePrepareConfig];
        NSUInteger HippyExecuteSources = (NSUInteger)[self->_performanceLogger durationForTag:HippyExecuteSource];
        NSUInteger HippyPLBridgeStartups = (NSUInteger)[self->_performanceLogger durationForTag:HippyPLBridgeStartup];

        NSLog(@"common cost: read source:%@ init module:%@ executor setups:%@ inject config:%@ prepare config:%@ load source:%@ bridge starup:%@",
            @(HippyPLScriptDownloads), @(HippyPLNativeModuleInits), @(HippyPLJSCExecutorSetups), @(HippyPLNativeModuleInjectConfigs),
            @(HippyPLNativeModulePrepareConfigs), @(HippyExecuteSources), @(HippyPLBridgeStartups));
#endif

        dispatch_async(dispatch_get_main_queue(), ^{
            [[NSNotificationCenter defaultCenter] postNotificationName:HippyJavaScriptDidLoadNotification object:self->_parentBridge
                                                              userInfo:@ { @"bridge": self }];
        });

        [self _flushPendingCalls];

        dispatch_semaphore_signal(self.semaphore);
    }];

#if HIPPY_DEV
    if ([HippyGetURLQueryParam(self.bundleURL, @"hot") boolValue]) {
        NSString *path = [self.bundleURL.path substringFromIndex:1];  // strip initial slash
        NSString *host = self.bundleURL.host;
        NSNumber *port = self.bundleURL.port;
        [self enqueueJSCall:@"HMRClient" method:@"enable" args:@[@"ios", path, host, HippyNullIfNil(port)] completion:NULL];
    }
#endif
}

- (NSDictionary *)deviceInfo {
    //该方法可能从非UI线程调用
    NSString *iosVersion = [[UIDevice currentDevice] systemVersion];
    struct utsname systemInfo;
    uname(&systemInfo);
    NSString *deviceModel = [NSString stringWithCString:systemInfo.machine encoding:NSUTF8StringEncoding];
    NSMutableDictionary *deviceInfo = [NSMutableDictionary dictionary];
    [deviceInfo setValue:@"ios" forKey:@"OS"];
    [deviceInfo setValue:iosVersion forKey:@"OSVersion"];
    [deviceInfo setValue:deviceModel forKey:@"Device"];
    [deviceInfo setValue:_HippySDKVersion forKey:@"SDKVersion"];
    [deviceInfo setValue:_parentBridge.appVerson forKey:@"AppVersion"];
    if (_dimDic) {
        [deviceInfo setValue:_dimDic forKey:@"Dimensions"];
    }
    return [NSDictionary dictionaryWithDictionary:deviceInfo];
}

- (void)_flushPendingCalls {
    HippyAssertJSThread();

    // HIPPY_PROFILE_BEGIN_EVENT(0, @"Processing pendingCalls", @{ @"count": @(_pendingCalls.count) });
    _loading = NO;
    NSArray *pendingCalls = _pendingCalls;
    _pendingCalls = nil;
    for (dispatch_block_t call in pendingCalls) {
        call();
    }
    // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"");
}

- (void)stopLoadingWithError:(NSError *)error {
    HippyAssertMainQueue();

    if (!_valid || !_loading) {
        return;
    }

    _loading = NO;
    [_javaScriptExecutor executeBlockOnJavaScriptQueue:^{
        [self->_javaScriptExecutor invalidate];
    }];

    [[NSNotificationCenter defaultCenter] postNotificationName:HippyJavaScriptDidFailToLoadNotification object:_parentBridge
                                                      userInfo:@{ @"bridge": self, @"error": error }];

    if ([error userInfo][HippyJSStackTraceKey]) {
        [self.redBox showErrorMessage:[error localizedDescription] withStack:[error userInfo][HippyJSStackTraceKey]];
    }
    NSError *retError = HippyErrorFromErrorAndModuleName(error, self.moduleName);
    HippyFatal(retError);
}

HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithBundleURL
                      : (__unused NSURL *)bundleURL moduleProvider
                      : (__unused HippyBridgeModuleProviderBlock)block launchOptions
                      : (__unused NSDictionary *)launchOptions)

/**
 * Prevent super from calling setUp (that'd create another batchedBridge)
 */
- (void)setUp {
}
- (void)bindKeys {
}

- (void)reload {
    [_parentBridge reload];
}

- (void)requestReload {
    [_parentBridge requestReload];
}

- (Class)executorClass {
    return _parentBridge.executorClass ?: [HippyJSCExecutor class];
}

- (BOOL)debugMode {
    return _parentBridge.debugMode ?: NO;
}

- (void)setExecutorClass:(Class)executorClass {
    HippyAssertMainQueue();
    _parentBridge.executorClass = executorClass;
}

- (NSURL *)bundleURL {
    return _parentBridge.bundleURL;
}

- (void)setBundleURL:(NSURL *)bundleURL {
    _parentBridge.bundleURL = bundleURL;
}

- (NSString *)moduleName {
    return _parentBridge.moduleName;
}

- (id<HippyBridgeDelegate>)delegate {
    return _parentBridge.delegate;
}

- (BOOL)isLoading {
    return _loading;
}

- (BOOL)isValid {
    return _valid;
}

- (BOOL)isErrorOccured {
    return _errorOccured;
}

- (void)dispatchBlock:(dispatch_block_t)block queue:(dispatch_queue_t)queue {
    if (queue == HippyJSThread) {
        // HippyProfileBeginFlowEvent();
        HippyAssert(_javaScriptExecutor != nil, @"Need JS executor to schedule JS work");

        [_javaScriptExecutor executeBlockOnJavaScriptQueue:^{
            // HippyProfileEndFlowEvent();

            // HIPPY_PROFILE_BEGIN_EVENT(0, @"-[HippyBatchedBridge dispatchBlock", @{ @"loading": @(self.loading) });

            @autoreleasepool {
                if (self.loading) {
                    HippyAssert(self->_pendingCalls != nil, @"Can't add pending call, bridge is no longer loading");
                    [self->_pendingCalls addObject:block];
                } else {
                    block();
                }
            }

            // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"");
        }];
    } else if (queue) {
        dispatch_async(queue, block);
    }
}

#pragma mark - HippyInvalidating

- (void)invalidate {
    if (!_valid) {
        return;
    }

    HippyAssertMainQueue();
    HippyAssert(_javaScriptExecutor != nil, @"Can't complete invalidation without a JS executor");

    _loading = NO;
    _valid = NO;
    if ([HippyBridge currentBridge] == self) {
        [HippyBridge setCurrentBridge:nil];
    }

    // Invalidate modules
    dispatch_group_t group = dispatch_group_create();
    for (HippyModuleData *moduleData in _moduleDataByID) {
        // Be careful when grabbing an instance here, we don't want to instantiate
        // any modules just to invalidate them.
        id<HippyBridgeModule> instance = nil;
        if ([moduleData hasInstance]) {
            instance = moduleData.instance;
        }

        if (instance == _javaScriptExecutor) {
            continue;
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

    dispatch_group_notify(group, dispatch_get_main_queue(), ^{
        [self->_javaScriptExecutor executeBlockOnJavaScriptQueue:^{
            [self->_displayLink invalidate];
            self->_displayLink = nil;

            [self->_javaScriptExecutor invalidate];
            self->_javaScriptExecutor = nil;

            self->_moduleDataByName = nil;
            self->_moduleDataByID = nil;
            self->_moduleClassesByID = nil;
            self->_pendingCalls = nil;

            if (self->_flowIDMap != NULL) {
                CFRelease(self->_flowIDMap);
            }
        }];
    });
}

- (void)logMessage:(NSString *)message level:(NSString *)level {
    if (HIPPY_DEBUG && [_javaScriptExecutor isValid]) {
        [self enqueueJSCall:@"HippyLog" method:@"logIfNoNativeHook" args:@[level, message] completion:NULL];
    }
}

#pragma mark - HippyBridge methods

/**
 * Public. Can be invoked from any thread.
 */
- (void)enqueueJSCall:(NSString *)module method:(NSString *)method args:(NSArray *)args completion:(dispatch_block_t)completion {
    /**
     * AnyThread
     */
    if (!_valid) {
        return;
    }

    // HIPPY_PROFILE_BEGIN_EVENT(HippyProfileTagAlways, @"-[HippyBatchedBridge enqueueJSCall:]", nil);
    __weak __typeof(self) weakSelf = self;
    [self dispatchBlock:^{
        [weakSelf _actuallyInvokeAndProcessModule:module method:method arguments:args ?: @[]];
        if (completion) {
            completion();
        }
    } queue:HippyJSThread];
    // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"");
}

/**
 * Called by HippyModuleMethod from any thread.
 */
- (void)enqueueCallback:(NSNumber *)cbID args:(NSArray *)args {
    /**
     * AnyThread
     */
    if (!_valid) {
        return;
    }

    __weak __typeof(self) weakSelf = self;
    [self dispatchBlock:^{
        [weakSelf _actuallyInvokeCallback:cbID arguments:args];
    } queue:HippyJSThread];
}

/**
 * JS thread only
 */
- (JSValue *)callFunctionOnModule:(NSString *)module
                           method:(NSString *)method
                        arguments:(NSArray *)arguments
                            error:(NSError *__autoreleasing *)error {
    HippyJSCExecutor *jsExecutor = (HippyJSCExecutor *)_javaScriptExecutor;
    if (![jsExecutor isKindOfClass:[HippyJSCExecutor class]]) {
        HippyLogWarn(@"FBHippyBridgeJSExecutor is only supported when running in JSC");
        return nil;
    }

    __block JSValue *jsResult = nil;

    HippyAssertJSThread();
    // HIPPY_PROFILE_BEGIN_EVENT(0, @"callFunctionOnModule", (@{ @"module": module, @"method": method }));
    [jsExecutor callFunctionOnModule:module method:method arguments:arguments ?: @[] jsValueCallback:^(JSValue *result, NSError *jsError) {
        if (error) {
            *error = jsError;
        }
#ifdef DEBUG
        JSValue *length = result[@"length"];
        HippyAssert([length isNumber] && [length toUInt32] == 2, @"Return value of a callFunction must be an array of size 2");
#endif
        jsResult = [result valueAtIndex:0];

        NSArray *nativeModuleCalls = [[result valueAtIndex:1] toArray];
        [self handleBuffer:nativeModuleCalls batchEnded:YES];
    }];

    // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"js_call");

    return jsResult;
}

/**
 * Private hack to support `setTimeout(fn, 0)`
 */
- (void)_immediatelyCallTimer:(NSNumber *)timer {
    HippyAssertJSThread();
    [_javaScriptExecutor executeAsyncBlockOnJavaScriptQueue:^{
        [self _actuallyInvokeAndProcessModule:@"JSTimersExecution" method:@"callTimers" arguments:@[@[timer]]];
    }];
}

- (void)enqueueApplicationScript:(NSData *)script url:(NSURL *)url onComplete:(HippyJavaScriptCompleteBlock)onComplete {
    HippyAssert(onComplete != nil, @"onComplete block passed in should be non-nil");
    _errorOccured = NO;
    // HippyProfileBeginFlowEvent();
    [_javaScriptExecutor executeApplicationScript:script sourceURL:url onComplete:^(NSError *scriptLoadError) {
        // HippyProfileEndFlowEvent();
        HippyAssertJSThread();
        if (scriptLoadError) {
            self->_errorOccured = YES;
            onComplete(scriptLoadError);
            return;
        }

        // HIPPY_PROFILE_BEGIN_EVENT(HippyProfileTagAlways, @"FetchApplicationScriptCallbacks", nil);
        [self->_javaScriptExecutor flushedQueue:^(id json, NSError *error) {
            // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"js_call,init");
            [self handleBuffer:json batchEnded:YES];
            if (error) {
                self->_errorOccured = YES;
            }
            onComplete(error);
        }];
    }];
}

#pragma mark - Payload Generation

- (void)_actuallyInvokeAndProcessModule:(NSString *)module method:(NSString *)method arguments:(NSArray *)args {
    HippyAssertJSThread();

    __weak __typeof(self) weakSelf = self;
    [_javaScriptExecutor callFunctionOnModule:module method:method arguments:args callback:^(id json, NSError *error) {
        [weakSelf processResponse:json error:error];
    }];
}

- (void)_actuallyInvokeCallback:(NSNumber *)cbID arguments:(NSArray *)args {
    HippyAssertJSThread();

    __weak __typeof(self) weakSelf = self;
    [_javaScriptExecutor invokeCallbackID:cbID arguments:args callback:^(id json, NSError *error) {
        [weakSelf processResponse:json error:error];
    }];
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
        HippyFatal(retError);
    }

    if (!_valid) {
        return;
    }
    [self handleBuffer:json batchEnded:YES];
}

#pragma mark - Payload Processing

- (void)handleBuffer:(id)buffer batchEnded:(BOOL)batchEnded {
    HippyAssertJSThread();

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
        NSMapTable *buckets = [[NSMapTable alloc] initWithKeyOptions:NSPointerFunctionsStrongMemory valueOptions:NSPointerFunctionsStrongMemory
                                                            capacity:_moduleDataByName.count];

        [moduleIDs enumerateObjectsUsingBlock:^(NSNumber *moduleID, NSUInteger i, __unused BOOL *stop) {
            HippyModuleData *moduleData = self->_moduleDataByID[moduleID.integerValue];
            dispatch_queue_t queue = moduleData.methodQueue;
            NSMutableOrderedSet<NSNumber *> *set = [buckets objectForKey:queue];
            if (!set) {
                set = [NSMutableOrderedSet new];
                [buckets setObject:set forKey:queue];
            }
            [set addObject:@(i)];
        }];

        for (dispatch_queue_t queue in buckets) {
            // HippyProfileBeginFlowEvent();

            dispatch_block_t block = ^{
                // HippyProfileEndFlowEvent();

                NSOrderedSet *calls = [buckets objectForKey:queue];
                // HIPPY_PROFILE_BEGIN_EVENT(HippyProfileTagAlways, @"-[HippyBatchedBridge handleBuffer:]", (@{
                //        @"calls": @(calls.count),
                //      }));

                @autoreleasepool {
                    for (NSNumber *indexObj in calls) {
                        NSUInteger index = indexObj.unsignedIntegerValue;
                        [self callNativeModule:[moduleIDs[index] integerValue] method:[methodIDs[index] integerValue] params:paramsArrays[index]];
                    }
                }

                // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"objc_call,dispatch_async");
            };

            [self dispatchBlock:block queue:queue];
        }
    }

    _flowID = callID;
}

- (void)partialBatchDidFlush {
    for (HippyModuleData *moduleData in _moduleDataByID) {
        if (moduleData.hasInstance && moduleData.implementsPartialBatchDidFlush) {
            [self dispatchBlock:^{
                [moduleData.instance partialBatchDidFlush];
            } queue:moduleData.methodQueue];
        }
    }
}

- (void)batchDidComplete {
    // TODO: batchDidComplete is only used by HippyUIManager - can we eliminate this special case?
    for (HippyModuleData *moduleData in _moduleDataByID) {
        if (moduleData.hasInstance && moduleData.implementsBatchDidComplete) {
            [self dispatchBlock:^{
                [moduleData.instance batchDidComplete];
            } queue:moduleData.methodQueue];
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

    HippyModuleData *moduleData = _moduleDataByID[moduleID];
    if (HIPPY_DEBUG && !moduleData) {
        HippyLogError(@"No module found for id '%lu'", (unsigned long)moduleID);
        return nil;
    }
    // not for UI Actions if NO==_valid
    if (!_valid) {
        if ([[moduleData name] isEqualToString:@"UIManager"]) {
            return nil;
        }
    }
    id<HippyBridgeMethod> method = moduleData.methods[methodID];
    if (HIPPY_DEBUG && !method) {
        HippyLogError(@"Unknown methodID: %lu for module: %lu (%@)", (unsigned long)methodID, (unsigned long)moduleID, moduleData.name);
        return nil;
    }

    @try {
        return [method invokeWithBridge:self module:moduleData.instance arguments:params];
    } @catch (NSException *exception) {
        // Pass on JS exceptions
        if ([exception.name hasPrefix:HippyFatalExceptionName]) {
            @throw exception;
        }

        NSString *message = [NSString stringWithFormat:@"Exception '%@' was thrown while invoking %@ on target %@ with params %@", exception,
                                      method.JSMethodName, moduleData.name, params];
        NSError *error = HippyErrorWithMessageAndModuleName(message, self.moduleName);
        if (self.parentBridge.useCommonBridge) {
            NSDictionary *errorInfo = @{ NSLocalizedDescriptionKey: message, @"module": self.parentBridge.moduleName ?: @"" };
            error = [[NSError alloc] initWithDomain:HippyErrorDomain code:0 userInfo:errorInfo];
        }
        HippyFatal(error);
        return nil;
    }
}

- (BOOL)isBatchActive {
    return _wasBatchActive;
}

@end
