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
#import "HippyInstanceLoadBlock.h"
#import "HippyJSEnginesMapper.h"
#import "HippyJSExecutor.h"
#import "HippyKeyCommands.h"
#import "HippyModuleData.h"
#import "HippyModuleMethod.h"
#import "HippyTurboModuleManager.h"
#import "HippyOCTurboModule.h"
#import "HippyPerformanceLogger.h"
#import "HippyRedBox.h"
#import "HippyTurboModule.h"

#import "HPAsserts.h"
#import "HPComponentTag.h"
#import "HPConvert.h"
#import "HPDefaultImageProvider.h"
#import "HPI18nUtils.h"
#import "HPInvalidating.h"
#import "HPLog.h"
#import "HPToolUtils.h"

#import "TypeConverter.h"
#import "VFSUriLoader.h"

#include <objc/runtime.h>
#include <sys/utsname.h>

#include "dom/scene.h"
#include "driver/scope.h"

#ifdef ENABLE_INSPECTOR
#include "devtools/vfs/devtools_handler.h"
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
    NSSet<Class<HPImageProviderProtocol>> *_imageProviders;
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
    NSURL *_debugURL;
    NSMutableArray<HippyInstanceLoadBlock *> *_instanceBlocks;
    NSMutableArray<dispatch_block_t> *_nativeSetupBlocks;
    NSURL *_sandboxDirectory;
    std::shared_ptr<VFSUriLoader> _uriLoader;
}

@property(readwrite, assign) NSUInteger currentIndexOfBundleExecuted;
@property(readwrite, assign) NSUInteger loadingCount;
@property(readwrite, strong) dispatch_semaphore_t moduleSemaphore;

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
        _debugURL = launchOptions[@"DebugURL"];
        _enableTurbo = !!launchOptions[@"EnableTurbo"] ? [launchOptions[@"EnableTurbo"] boolValue] : YES;
        _debugURL = launchOptions[@"DebugURL"];
        _engineKey = engineKey;
        _invalidateReason = HPInvalidateReasonDealloc;
        _valid = YES;
        _bundlesQueue = [[HippyBundleOperationQueue alloc] init];
        _nativeSetupBlocks = [NSMutableArray arrayWithCapacity:8];
        _instanceBlocks = [NSMutableArray arrayWithCapacity:4];
        [self setUp];
        HPExecuteOnMainThread(^{
            [self bindKeys];
        }, YES);
        HPLogInfo(self, @"[Hippy_OC_Log][Life_Circle],%@ Init %p", NSStringFromClass([self class]), self);
    }
    return self;
}

- (void)dealloc {
    /**
     * This runs only on the main thread, but crashes the subclass
     * HPAssertMainQueue();
     */
    HPLogInfo(self, @"[Hippy_OC_Log][Life_Circle],%@ dealloc %p", NSStringFromClass([self class]), self);
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

- (NSSet<Class<HPImageProviderProtocol>> *)imageProviders {
    if (!_imageProviders) {
        NSMutableSet *set = [NSMutableSet setWithCapacity:8];
        for (Class moduleClass in self.moduleClasses) {
            if ([moduleClass conformsToProtocol:@protocol(HPImageProviderProtocol)]) {
                [set addObject:moduleClass];
            }
        }
        _imageProviders = [NSSet setWithSet:set];
    }
    return _imageProviders;
}

- (id<HPRenderFrameworkProxy>)frameworkProxy {
    return _frameworkProxy ?: self;
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
        [self invalidate];
        [self setUp];
        [self.delegate reload:self];
    }
}

- (void)requestReload {
    if (_debugMode) {
        [[NSNotificationCenter defaultCenter] postNotificationName:HippyReloadNotification object:nil];
        [self reload];
    }
}

- (void)setUp {
    _performanceLogger = [HippyPerformanceLogger new];
    [_performanceLogger markStartForTag:HippyPLBridgeStartup];
    _valid = YES;
    self.loadingCount = 0;
    self.currentIndexOfBundleExecuted = NSNotFound;
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
            }
        };
        [_javaScriptExecutor setup];
        _displayLink = [[HippyDisplayLink alloc] init];
        dispatch_async(HippyBridgeQueue(), ^{
            [self initWithModulesCompletion:^{
                HippyBridge *strongSelf = weakSelf;
                if (strongSelf) {
                    dispatch_semaphore_signal(strongSelf.moduleSemaphore);
                }
            }];
        });
    } @catch (NSException *exception) {
        HippyBridgeHandleException(exception, self);
    }
    if (nil == self.renderContext.frameworkProxy) {
        self.renderContext.frameworkProxy = self;
    }
}

- (void)loadBundleURLs:(NSArray<NSURL *> *)bundleURLs {
    if (!bundleURLs) {
        return;
    }
    [_bundleURLs addObjectsFromArray:bundleURLs];
    dispatch_async(HippyBridgeQueue(), ^{
        [self beginLoadingBundles:bundleURLs];
    });
}



- (void)initWithModulesCompletion:(dispatch_block_t)completion {
    [_moduleSetup setupModulesCompletion:completion];
}

- (void)beginLoadingBundles:(NSArray<NSURL *> *)bundleURLs {
    dispatch_group_t group = dispatch_group_create();
    self.loadingCount++;
    for (NSURL *bundleURL in bundleURLs) {
        __weak HippyBridge *weakSelf = self;
        __block NSString *script = nil;
        dispatch_group_enter(group);
        HippyBundleLoadOperation *fetchOp = [[HippyBundleLoadOperation alloc] initWithBridge:self bundleURL:bundleURL];
        fetchOp.onLoad = ^(NSData *source, NSError *error) {
            if (error) {
                HippyBridgeFatal(error, weakSelf);
            }
            else {
                script = [[NSString alloc] initWithData:source encoding:NSUTF8StringEncoding];
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
                HippyBridge *strongSelf = weakSelf;
                if (!strongSelf || !strongSelf.valid) {
                    dispatch_group_leave(group);
                    return;
                }
                if (error) {
                    HippyBridgeFatal(error, weakSelf);
                }
                if (NSNotFound == strongSelf.currentIndexOfBundleExecuted) {
                    strongSelf.currentIndexOfBundleExecuted = 0;
                }
                else {
                    strongSelf.currentIndexOfBundleExecuted++;
                }
                NSArray<HippyInstanceLoadBlock *> *blocks = [strongSelf->_instanceBlocks copy];
                for (NSUInteger i = 0; i < [blocks count]; i++) {
                    HippyInstanceLoadBlock *blockInstance = blocks[i];
                    if (![blockInstance isLoaded] &&
                        strongSelf.currentIndexOfBundleExecuted <= blockInstance.index &&
                        blockInstance.loadedBlock) {
                        dispatch_async(dispatch_get_main_queue(), blockInstance.loadedBlock);
                        blockInstance.loaded = YES;
                    }
                }
                dispatch_group_leave(group);
            }];
        }];
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
    }
    __weak HippyBridge *weakSelf = self;
    dispatch_block_t completionBlock = ^(void){
        HippyBridge *strongSelf = weakSelf;
        if (strongSelf) {
            strongSelf.loadingCount--;
        }
    };
    dispatch_group_notify(group, HippyBridgeQueue(), completionBlock);
}

- (void)loadInstanceForRootView:(NSNumber *)rootTag withProperties:(NSDictionary *)props {
    HPAssert([_bundleURLs count], @"At least one bundle should be settled before load instance");
    NSUInteger index = [_bundleURLs count] - 1;
    __weak HippyBridge *weakBridge = self;
    dispatch_block_t loadInstanceBlock = ^(void){
        HippyBridge *strongSelf = weakBridge;
        if (strongSelf) {
            [strongSelf innerLoadInstanceForRootView:rootTag withProperties:props];
        }
    };
    [_instanceBlocks addObject:[[HippyInstanceLoadBlock alloc] initWithBlock:loadInstanceBlock index:index]];
}

- (void)innerLoadInstanceForRootView:(NSNumber *)rootTag withProperties:(NSDictionary *)props {
    NSString *moduleName = _moduleName ?: @"";
    HPLogInfo(self, @"[Hippy_OC_Log][Life_Circle],Running application %@ (%@)", moduleName, props);
    NSDictionary *param = @{@"name": moduleName,
                            @"id": rootTag,
                            @"params": props ?: @{},
                            @"version": HippySDKVersion};
    footstone::value::HippyValue value = OCTypeToDomValue(param);
    std::shared_ptr<footstone::value::HippyValue> domValue = std::make_shared<footstone::value::HippyValue>(value);
    self.javaScriptExecutor.pScope->LoadInstance(domValue);
}

- (void)setUriLoader:(std::shared_ptr<VFSUriLoader>)uriLoader {
    if (_uriLoader != uriLoader) {
        _uriLoader = uriLoader;
        [_javaScriptExecutor setUriLoader:uriLoader];
    }
#ifdef ENABLE_INSPECTOR
  auto devtools_data_source = _javaScriptExecutor.pScope->GetDevtoolsDataSource();
  if (devtools_data_source) {
      auto notification = devtools_data_source->GetNotificationCenter()->network_notification;
      auto devtools_handler = std::make_shared<hippy::devtools::DevtoolsHandler>();
      devtools_handler->SetNetworkNotification(notification);
      auto default_handler = _uriLoader->GetDefaultHandler();
      _uriLoader->RegisterUriHandler(hippy::devtools::kHttpSchemep, devtools_handler);
      _uriLoader->RegisterUriHandler(hippy::devtools::kHttpSchemep, default_handler);
      _uriLoader->RegisterUriHandler(hippy::devtools::kHttpsSchemep, devtools_handler);
      _uriLoader->RegisterUriHandler(hippy::devtools::kHttpsSchemep, default_handler);
  }
#endif
}

- (std::shared_ptr<VFSUriLoader>)uriLoader {
    if (!_uriLoader) {
        self.uriLoader = std::make_shared<VFSUriLoader>();
    }
    return _uriLoader;
}

- (void)executeJSCode:(NSString *)script
            sourceURL:(NSURL *)sourceURL
         onCompletion:(HippyJavaScriptCallback)completion {
    if (![self isValid] || !script || !sourceURL) {
        completion(nil, HPErrorWithMessageAndModuleName(@"bridge is not valid", _moduleName));
        return;
    }
    HPAssert(self.javaScriptExecutor, @"js executor must not be null");
    [_performanceLogger markStartForTag:HippyExecuteSource];
    BOOL shouldInvalidate = YES;
    if ([self.delegate respondsToSelector:@selector(scriptWillBeExecuted:sourceURL:)]) {
        shouldInvalidate = [self.delegate scriptWillBeExecuted:script sourceURL:sourceURL];
    }
    __weak HippyBridge *weakSelf = self;
    [self.javaScriptExecutor executeApplicationScript:script sourceURL:sourceURL onComplete:^(id result ,NSError *error) {
        HippyBridge *strongSelf = weakSelf;
        if (!strongSelf || ![strongSelf isValid]) {
            completion(result, error);
            return;
        }
        if (error) {
            [strongSelf stopLoadingWithError:error scriptSourceURL:sourceURL shouldInvalidateContext:shouldInvalidate];
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

- (void)stopLoadingWithError:(NSError *)error scriptSourceURL:(NSURL *)sourceURL shouldInvalidateContext:(BOOL)shouldInvalidate {
    HPAssertMainQueue();
    if (![self isValid]) {
        return;
    }
    if (shouldInvalidate) {
        __weak HippyBridge *weakSelf = self;
        [self.javaScriptExecutor executeBlockOnJavaScriptQueue:^{
            HippyBridge *strongSelf = weakSelf;
            if (!strongSelf || ![strongSelf isValid]) {
                [strongSelf.javaScriptExecutor invalidate];
            }
        }];
    }
    NSDictionary *userInfo = @{@"bridge": self, @"error": error, @"sourceURL": sourceURL};
    [[NSNotificationCenter defaultCenter] postNotificationName:HippyJavaScriptDidFailToLoadNotification
                                                        object:nil
                                                      userInfo:userInfo];

    if ([error userInfo][HPJSStackTraceKey]) {
        [self.redBox showErrorMessage:[error localizedDescription] withStack:[error userInfo][HPJSStackTraceKey]];
    }
    if (shouldInvalidate) {
        NSError *retError = HPErrorFromErrorAndModuleName(error, self.moduleName);
        HippyBridgeFatal(retError, self);
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
    NSArray *requestsArray = [HPConvert NSArray:buffer];

    if (HP_DEBUG && requestsArray.count <= HippyBridgeFieldParams) {
        HPLogError(self, @"Buffer should contain at least %tu sub-arrays. Only found %tu", HippyBridgeFieldParams + 1, requestsArray.count);
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
        HPLogError(self, @"Invalid data message - all must be length: %lu", (unsigned long)moduleIDs.count);
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
                id strongSelf = weakSelf;
                if (!strongSelf) {
                    return;
                }
                NSOrderedSet *calls = [buckets objectForKey:queue];
                @autoreleasepool {
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
            HPLogError(self, @"moduleID %lu exceed range of moduleDataByID %lu, bridge is valid %ld", moduleID, [moduleDataByID count], (long)isValid);
        }
        return nil;
    }
    HippyModuleData *moduleData = moduleDataByID[moduleID];
    if (HP_DEBUG && !moduleData) {
        if (isValid) {
            HPLogError(self, @"No module found for id '%lu'", (unsigned long)moduleID);
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
            HPLogError(self, @"methodID %lu exceed range of moduleData.methods %lu, bridge is valid %ld", moduleID, [methods count], (long)isValid);
        }
        return nil;
    }
    id<HippyBridgeMethod> method = methods[methodID];
    if (HP_DEBUG && !method) {
        if (isValid) {
            HPLogError(self, @"Unknown methodID: %lu for module: %lu (%@)", (unsigned long)methodID, (unsigned long)moduleID, moduleData.name);
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
                  rootNode:(std::weak_ptr<hippy::RootNode>)rootNode
             renderContext:(id<HPRenderContext>)renderContext {
    __weak HippyBridge *weakSelf = self;
    dispatch_block_t block = ^(void){
        HippyBridge *strongSelf = weakSelf;
        HPAssertParam(domManager);
        HPAssertParam(renderContext);
        if (!strongSelf || !domManager || !renderContext) {
            return;
        }
        strongSelf->_javaScriptExecutor.pScope->SetDomManager(domManager);
      #ifdef ENABLE_INSPECTOR
        auto devtools_data_source = strongSelf->_javaScriptExecutor.pScope->GetDevtoolsDataSource();
        if (devtools_data_source) {
            hippy::DomManager::Insert(domManager);
            strongSelf->_javaScriptExecutor.pScope->GetDevtoolsDataSource()->Bind(0, domManager->GetId(), 0); // runtime_id for iOS is useless, set 0
            devtools_data_source->SetRootNode(rootNode);
        }
      #endif
        strongSelf->_javaScriptExecutor.pScope->SetRootNode(rootNode);
        strongSelf->_renderContext = renderContext;
    };
    block();
    [_nativeSetupBlocks addObject:block];
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

- (NSURL *)bundleURL {
    return [_bundleURLs firstObject];
}

- (void)invalidate {
    HPLogInfo(self, @"[Hippy_OC_Log][Life_Circle],%@ invalide %p", NSStringFromClass([self class]), self);
    if (![self isValid]) {
        return;
    }
    _valid = NO;
    self.loadingCount = 0;
    NSArray<HippyInstanceLoadBlock *> *blocks = [_instanceBlocks copy];
    for (NSUInteger i = 0; i < [blocks count]; i++) {
        HippyInstanceLoadBlock *blockInstance = blocks[i];
        blockInstance.loaded = NO;
    }
    [_bundleURLs removeAllObjects];
    [_nativeSetupBlocks removeAllObjects];
    [_instanceBlocks removeAllObjects];
    id<HPRenderContext> renderContext = self.renderContext;
    self.renderContext = nil;
    [[renderContext rootViews] enumerateObjectsUsingBlock:^(__kindof UIView * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if ([obj respondsToSelector:@selector(invalidate)]) {
            [obj performSelector:@selector(invalidate)];
        }
        NSDictionary *param = @{@"id": [obj componentTag]};
        footstone::value::HippyValue value = OCTypeToDomValue(param);
        std::shared_ptr<footstone::value::HippyValue> domValue = std::make_shared<footstone::value::HippyValue>(value);
        self.javaScriptExecutor.pScope->UnloadInstance(domValue);
    }];
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
                [(id<HPInvalidating>)instance invalidate];
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
    self.moduleSemaphore = nil;
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
    return HPJSONStringify(jsonArray, NULL);
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

#pragma mark HPRenderFrameworkProxy Delegate Implementation
- (NSString *)standardizeAssetUrlString:(NSString *)UrlString forRenderContext:(nonnull id<HPRenderContext>)renderContext {
    if ([HippyBridge isHippyLocalFileURLString:UrlString]) {
        return [self absoluteStringFromHippyLocalFileURLString:UrlString];
    }
    return UrlString;
}

- (Class<HPImageProviderProtocol>)imageProviderClassForRenderContext:(id<HPRenderContext>)renderContext {
    if (self.frameworkProxy != self && [self.frameworkProxy respondsToSelector:@selector(imageProviderClassForRenderContext:)]) {
        return [self.frameworkProxy imageProviderClassForRenderContext:renderContext];
    }
    return [HPDefaultImageProvider class];
}

- (std::shared_ptr<VFSUriLoader>)URILoader { 
    return [self uriLoader];
}

- (void)immediatelyCallTimer:(NSNumber *)timer {
    [_javaScriptExecutor executeAsyncBlockOnJavaScriptQueue:^{
        [self actuallyInvokeAndProcessModule:@"JSTimersExecution" method:@"callTimers" arguments:@[@[timer]]];
    }];
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

+ (NSString *)defaultHippyLocalFileScheme {
    // hpfile://
    return @"hpfile://";
}

+ (BOOL)isHippyLocalFileURLString:(NSString *)string {
    return [string hasPrefix:[HippyBridge defaultHippyLocalFileScheme]];
}

- (NSString *)absoluteStringFromHippyLocalFileURLString:(NSString *)string {
    if ([HippyBridge isHippyLocalFileURLString:string]) {
        NSString *filePrefix = [HippyBridge defaultHippyLocalFileScheme];
        NSString *relativeString = string;
        if ([string hasPrefix:filePrefix]) {
            NSRange range = NSMakeRange(0, [filePrefix length]);
            relativeString = [string stringByReplacingOccurrencesOfString:filePrefix withString:@"" options:0 range:range];
        }
        NSURL *localFileURL = [NSURL URLWithString:relativeString relativeToURL:self.bundleURL];
        if ([localFileURL isFileURL]) {
            return [localFileURL path];
        }
    }
    return nil;
}

- (void)setContextName:(NSString *)contextName {
    if (![_contextName isEqualToString:contextName]) {
        _contextName = [contextName copy];
        [self.javaScriptExecutor setContextName:contextName];
    }
}

@end

void HippyBridgeFatal(NSError *error, HippyBridge *bridge) {
    HPFatal(error, bridge?@{@"bridge": bridge}:nil);
}

void HippyBridgeHandleException(NSException *exception, HippyBridge *bridge) {
    HPHandleException(exception, bridge?@{@"bridge": bridge}:nil);
}
