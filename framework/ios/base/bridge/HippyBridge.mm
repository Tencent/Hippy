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
#import "HPAsserts.h"
#import "HPConvert.h"
#import "HPDefaultImageProvider.h"
#import "HPI18nUtils.h"
#import "HPInvalidating.h"
#import "HPLog.h"
#import "HPOCToHippyValue.h"
#import "HPToolUtils.h"
#import "NSObject+Render.h"
#import "TypeConverter.h"
#import "VFSUriLoader.h"

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

#ifdef ENABLE_INSPECTOR
#include "devtools/vfs/devtools_handler.h"
#include "devtools/devtools_data_source.h"
#endif

NSString *const HippyReloadNotification = @"HippyReloadNotification";
NSString *const HippyJavaScriptDidLoadNotification = @"HippyJavaScriptDidLoadNotification";
NSString *const HippyJavaScriptDidFailToLoadNotification = @"HippyJavaScriptDidFailToLoadNotification";
NSString *const HippyDidInitializeModuleNotification = @"HippyDidInitializeModuleNotification";
NSString *const HippySDKVersion = @"unspecified";

typedef NS_ENUM(NSUInteger, HippyBridgeFields) {
    HippyBridgeFieldRequestModuleIDs = 0,
    HippyBridgeFieldMethodIDs,
    HippyBridgeFieldParams,
    HippyBridgeFieldCallID,
};

@interface HippyBridge() {
    NSMutableArray<Class<HPImageProviderProtocol>> *_imageProviders;
    __weak id<HippyMethodInterceptorProtocol> _methodInterceptor;
    HippyModulesSetup *_moduleSetup;
    __weak NSOperation *_lastOperation;
    BOOL _wasBatchActive;
    HippyDisplayLink *_displayLink;
    HippyBridgeModuleProviderBlock _moduleProvider;
    NSString *_engineKey;
    BOOL _valid;
    HippyBundleOperationQueue *_bundlesQueue;
    NSMutableArray<NSURL *> *_bundleURLs;
    NSURL *_sandboxDirectory;
    std::weak_ptr<VFSUriLoader> _uriLoader;
    std::weak_ptr<hippy::RenderManager> _renderManager;
    footstone::TimePoint _startTime;
}

@property(readwrite, strong) dispatch_semaphore_t moduleSemaphore;
@property(readwrite, assign) NSInteger loadingCount;

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
                     engineKey:(NSString *)engineKey {
    if (self = [super init]) {
        _delegate = delegate;
        _moduleProvider = block;
        _bundleURLs = [NSMutableArray arrayWithCapacity:8];
        _debugMode = [launchOptions[@"DebugMode"] boolValue];
        _enableTurbo = !!launchOptions[@"EnableTurbo"] ? [launchOptions[@"EnableTurbo"] boolValue] : YES;
        _engineKey = engineKey;
        _invalidateReason = HPInvalidateReasonDealloc;
        _valid = YES;
        _bundlesQueue = [[HippyBundleOperationQueue alloc] init];
        _startTime = footstone::TimePoint::SystemNow();
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(rootViewContentDidAppear:) name:kRootViewDidAddContent object:nil];
        [self setUp];
        HPExecuteOnMainThread(^{
            [self bindKeys];
        }, YES);
        [HippyBridge setCurrentBridge:self];
        HPLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ Init %p", NSStringFromClass([self class]), self);
    }
    return self;
}

- (void)rootViewContentDidAppear:(NSNotification *)noti {
    UIView *rootView = [[noti userInfo] objectForKey:kRootViewKey];
    if (rootView) {
        auto domManager = _javaScriptExecutor.pScope->GetDomManager().lock();
        if (domManager) {
            auto viewRenderManager = [rootView renderManager];
            if (_renderManager.lock() == viewRenderManager.lock()) {
                auto entry = _javaScriptExecutor.pScope->GetPerformance()->PerformanceNavigation("hippyInit");
                entry->SetHippyDomStart(domManager->GetDomStartTimePoint());
                entry->SetHippyDomEnd(domManager->GetDomEndTimePoint());
                entry->SetHippyFirstFrameStart(domManager->GetDomEndTimePoint());
                entry->SetHippyFirstFrameEnd(footstone::TimePoint::SystemNow());
            }
        }
    }
}

- (void)dealloc {
    /**
     * This runs only on the main thread, but crashes the subclass
     * HPAssertMainQueue();
     */
    HPLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ dealloc %p", NSStringFromClass([self class]), self);
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    self.invalidateReason = HPInvalidateReasonDealloc;
    [self invalidate];
}

- (void)bindKeys {
#if TARGET_IPHONE_SIMULATOR
    HPAssertMainQueue();
    HippyKeyCommands *commands = [HippyKeyCommands sharedInstance];

    // reload in current mode
    __weak __typeof(self) weakSelf = self;
    [commands registerKeyCommandWithInput:@"r" modifierFlags:UIKeyModifierCommand action:^(__unused UIKeyCommand *command) {
        [weakSelf requestReload];
    }];
#endif
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

- (void)addImageProviderClass:(Class<HPImageProviderProtocol>)cls {
    HPAssertParam(cls);
    @synchronized (self) {
        if (!_imageProviders) {
            _imageProviders = [NSMutableArray arrayWithCapacity:8];
        }
        [_imageProviders addObject:cls];
    }
}
- (NSArray<Class<HPImageProviderProtocol>> *)imageProviderClasses {
    @synchronized (self) {
        if (!_imageProviders) {
            _imageProviders = [NSMutableArray arrayWithCapacity:8];
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
    return [_moduleSetup moduleIsInitialized:moduleClass];
}

- (void)reload {
    if ([self.delegate respondsToSelector:@selector(reload:)]) {
        self.invalidateReason = HPInvalidateReasonReload;
        [self invalidate];
        [self setUp];
        [self.delegate reload:self];
        self.invalidateReason = HPInvalidateReasonDealloc;
    }
}

- (void)requestReload {
    if (_debugMode) {
        [[NSNotificationCenter defaultCenter] postNotificationName:HippyReloadNotification object:nil];
        [self reload];
    }
}

- (void)setUp {
    _valid = YES;
    self.moduleSemaphore = dispatch_semaphore_create(0);
    @try {
        __weak HippyBridge *weakSelf = self;
        _moduleSetup = [[HippyModulesSetup alloc] initWithBridge:self extraProviderModulesBlock:_moduleProvider];
        _javaScriptExecutor = [[HippyJSExecutor alloc] initWithEngineKey:_engineKey bridge:self];
        _javaScriptExecutor.contextCreatedBlock = ^(id<HippyContextWrapper> ctxWrapper){
            HippyBridge *strongSelf = weakSelf;
            if (strongSelf) {
                dispatch_semaphore_wait(strongSelf.moduleSemaphore, DISPATCH_TIME_FOREVER);
                NSString *moduleConfig = [strongSelf moduleConfig];
                [ctxWrapper createGlobalObject:@"__hpBatchedBridgeConfig" withJsonValue:moduleConfig];
#if HP_DEV
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
        //The caller may attempt to look up a module immediately after creating the HippyBridge,
        //therefore the initialization of all modules cannot be placed in a sub-thread
//        dispatch_async(HippyBridgeQueue(), ^{
        [self initWithModulesCompletion:^{
            HippyBridge *strongSelf = weakSelf;
            if (strongSelf) {
                dispatch_semaphore_signal(strongSelf.moduleSemaphore);
                footstone::TimePoint endTime = footstone::TimePoint::SystemNow();
                auto enty =
                    strongSelf.javaScriptExecutor.pScope->GetPerformance()->PerformanceNavigation("hippyInit");
                enty->SetHippyNativeInitStart(strongSelf->_startTime);
                enty->SetHippyNativeInitEnd(endTime);
            }
        }];
//        });
    } @catch (NSException *exception) {
        HippyBridgeHandleException(exception, self);
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
    [_bundleURLs addObject:bundleURL];
    dispatch_async(HippyBridgeQueue(), ^{
        [self beginLoadingBundle:bundleURL completion:completion];
    });
}



- (void)initWithModulesCompletion:(dispatch_block_t)completion {
    [_moduleSetup setupModulesCompletion:completion];
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
        }
        else {
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
        [strongSelf executeJSCode:script sourceURL:bundleURL onCompletion:^(id result, NSError *error) {
            if (completion) {
                completion(bundleURL, error);
            }
            HippyBridge *strongSelf = weakSelf;
            if (!strongSelf || !strongSelf.valid) {
                dispatch_group_leave(group);
                return;
            }
            if (error) {
                HippyBridgeFatal(error, weakSelf);
            }
            dispatch_group_leave(group);
        }];
    } queue:bundleQueue];
    //set dependency
    [executeOp addDependency:fetchOp];
    if (_lastOperation) {
        [executeOp addDependency:_lastOperation];
        _lastOperation = executeOp;
    }
    else {
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
    }
}

- (void)loadInstanceForRootView:(NSNumber *)rootTag withProperties:(NSDictionary *)props {
    [self innerLoadInstanceForRootView:rootTag withProperties:props];
}

- (void)innerLoadInstanceForRootView:(NSNumber *)rootTag withProperties:(NSDictionary *)props {
    HPAssert(_moduleName, @"module name must not be null");
    HPLogInfo(@"[Hippy_OC_Log][Life_Circle],Running application %@ (%@)", _moduleName, props);
    NSDictionary *param = @{@"name": _moduleName,
                            @"id": rootTag,
                            @"params": props ?: @{},
                            @"version": HippySDKVersion};
    footstone::value::HippyValue value = [param toHippyValue];
    std::shared_ptr<footstone::value::HippyValue> domValue = std::make_shared<footstone::value::HippyValue>(value);
    self.javaScriptExecutor.pScope->LoadInstance(domValue);
}

- (void)rootViewSizeChangedEvent:(NSNumber *)tag params:(NSDictionary *)params {
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithDictionary:params];
    [dic setObject:tag forKey:@"rootViewId"];
    [self sendEvent:@"onSizeChanged" params:dic];
}

- (void)setVFSUriLoader:(std::weak_ptr<VFSUriLoader>)uriLoader {
    _uriLoader = uriLoader;
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
        completion(nil, HPErrorWithMessageAndModuleName(@"no valid data", _moduleName));
        return;
    }
    if (![self isValid] || !script || !sourceURL) {
        completion(nil, HPErrorWithMessageAndModuleName(@"bridge is not valid", _moduleName));
        return;
    }
    HPAssert(self.javaScriptExecutor, @"js executor must not be null");
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
                                                                    object:nil
                                                                  userInfo:userInfo];
            });
        }
        completion(result, error);
    }];
}

- (void)stopLoadingWithError:(NSError *)error scriptSourceURL:(NSURL *)sourceURL {
    HPAssertMainQueue();
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
                                                        object:nil
                                                      userInfo:userInfo];
    if ([error userInfo][HPJSStackTraceKey]) {
        [self.redBox showErrorMessage:[error localizedDescription] withStack:[error userInfo][HPJSStackTraceKey]];
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
        if ([error userInfo][HPJSStackTraceKey]) {
            if (error.localizedFailureReason) {
                [self.redBox
                    showErrorMessage:[NSString stringWithFormat:@"%@ 【reason】%@:", error.localizedDescription, error.localizedFailureReason]
                           withStack:[error userInfo][HPJSStackTraceKey]];
            } else {
                [self.redBox showErrorMessage:[NSString stringWithFormat:@"%@", error.localizedDescription]
                                    withStack:[error userInfo][HPJSStackTraceKey]];
            }
        }
        NSError *retError = HPErrorFromErrorAndModuleName(error, self.moduleName);
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
    NSArray *requestsArray = [HPConvert NSArray:buffer];

    if (HP_DEBUG && requestsArray.count <= HippyBridgeFieldParams) {
        HPLogError(@"Buffer should contain at least %tu sub-arrays. Only found %tu", HippyBridgeFieldParams + 1, requestsArray.count);
        return;
    }

    NSArray<NSNumber *> *moduleIDs = [HPConvert NSNumberArray:requestsArray[HippyBridgeFieldRequestModuleIDs]];
    NSArray<NSNumber *> *methodIDs = [HPConvert NSNumberArray:requestsArray[HippyBridgeFieldMethodIDs]];
    NSArray<NSArray *> *paramsArrays = [HPConvert NSArrayArray:requestsArray[HippyBridgeFieldParams]];

    int64_t callID = -1;

    if (requestsArray.count > 3) {
        callID = [requestsArray[HippyBridgeFieldCallID] longLongValue];
    }

    if (HP_DEBUG && (moduleIDs.count != methodIDs.count || moduleIDs.count != paramsArrays.count)) {
        HPLogError(@"Invalid data message - all must be length: %lu", (unsigned long)moduleIDs.count);
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
            HPLogError(@"moduleID %lu exceed range of moduleDataByID %lu, bridge is valid %ld", moduleID, [moduleDataByID count], (long)isValid);
        }
        return nil;
    }
    HippyModuleData *moduleData = moduleDataByID[moduleID];
    if (HP_DEBUG && !moduleData) {
        if (isValid) {
            HPLogError(@"No module found for id '%lu'", (unsigned long)moduleID);
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
            HPLogError(@"methodID %lu exceed range of moduleData.methods %lu, bridge is valid %ld", moduleID, [methods count], (long)isValid);
        }
        return nil;
    }
    id<HippyBridgeMethod> method = methods[methodID];
    if (HP_DEBUG && !method) {
        if (isValid) {
            HPLogError(@"Unknown methodID: %lu for module: %lu (%@)", (unsigned long)methodID, (unsigned long)moduleID, moduleData.name);
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
        if ([exception.name hasPrefix:HPFatalExceptionName]) {
            @throw exception;
        }

        NSString *message = [NSString stringWithFormat:@"Exception '%@' was thrown while invoking %@ on target %@ with params %@", exception, method.JSMethodName, moduleData.name, params];
        NSError *error = HPErrorWithMessageAndModuleName(message, self.moduleName);
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
        if ([exception.name hasPrefix:HPFatalExceptionName]) {
            @throw exception;
        }

        NSString *message = [NSString stringWithFormat:@"Exception '%@' was thrown while invoking %@ on target %@ with params %@", exception, method.JSMethodName, module.name, params];
        NSError *error = HPErrorWithMessageAndModuleName(message, self.moduleName);
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
        HPAssertParam(domManager);
        if (!strongSelf || !domManager) {
            return;
        }
        strongSelf->_javaScriptExecutor.pScope->SetDomManager(domManager);
        strongSelf->_javaScriptExecutor.pScope->SetRootNode(rootNode);
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
    return _moduleSetup.moduleSetupComplete;
}

- (void)invalidate {
    HPLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ invalide %p", NSStringFromClass([self class]), self);
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
                    [(id<HPInvalidating>)instance invalidate];
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
    
    if ([HippyBridge currentBridge] == self) {
        [HippyBridge setCurrentBridge:nil];
    }
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
    [deviceInfo setValue:HippySDKVersion forKey:@"SDKVersion"];
    [deviceInfo setValue:HippyExportedDimensions() forKey:@"Dimensions"];
    NSString *countryCode = [[HPI18nUtils sharedInstance] currentCountryCode];
    NSString *lanCode = [[HPI18nUtils sharedInstance] currentAppLanguageCode];
    NSWritingDirection direction = [[HPI18nUtils sharedInstance] writingDirectionForCurrentAppLanguage];
    NSDictionary *local = @{@"country": countryCode?:@"unknown", @"language": lanCode?:@"unknown", @"direction": @(direction)};
    [deviceInfo setValue:local forKey:@"Localization"];
    return [NSDictionary dictionaryWithDictionary:deviceInfo];
}

- (NSString *)moduleConfig {
    NSMutableArray<NSArray *> *config = [NSMutableArray new];
    for (HippyModuleData *moduleData in [_moduleSetup moduleDataByID]) {
        NSArray *moduleDataConfig = [moduleData config];
        [config addObject:HPNullIfNil(moduleDataConfig)];
    }
    id jsonArray = @{
        @"remoteModuleConfig": config,
    };
    return HippyJSONStringify(jsonArray, NULL);
}

- (void)setRedBoxShowEnabled:(BOOL)enabled {
#if HP_DEBUG
    HippyRedBox *redBox = [self redBox];
    redBox.showEnabled = enabled;
#endif  // HP_DEBUG
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

@end

void HippyBridgeFatal(NSError *error, HippyBridge *bridge) {
    HPFatal(error, bridge?@{@"bridge": bridge}:nil);
}

void HippyBridgeHandleException(NSException *exception, HippyBridge *bridge) {
    HPHandleException(exception, bridge?@{@"bridge": bridge}:nil);
}


#pragma mark -

@implementation HippyBridge (RedBoxDebug)

static HippyBridge *HippyCurrentBridgeInstance = nil;

/**
 * The last current active bridge instance. This is set automatically whenever
 * the bridge is accessed. It can be useful for static functions or singletons
 * that need to access the bridge for purposes such as logging, but should not
 * be relied upon to return any particular instance, due to race conditions.
 */
+ (instancetype)currentBridge {
    return HippyCurrentBridgeInstance;
}

+ (void)setCurrentBridge:(nullable HippyBridge *)currentBridge {
    HippyCurrentBridgeInstance = currentBridge;
}

@end
