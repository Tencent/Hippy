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

#import "HippyAssert.h"
#import "HippyBridge.h"
#import "HippyBundleDownloadOperation.h"
#import "HippyBundleExecutionOperation.h"
#import "HippyBundleOperationQueue.h"
#import "HippyDeviceBaseInfo.h"
#import "HippyDisplayLink.h"
#import "HippyInstanceLoadBlock.h"
#import "HippyJSEnginesMapper.h"
#import "HippyJSExecutor.h"
#import "HippyKeyCommands.h"
#import "HippyModuleData.h"
#import "HippyModuleMethod.h"
#import "HippyOCTurboModule.h"
#import "HippyPerformanceLogger.h"
#import "HippyTurboModuleManager.h"
#import "HippyRedBox.h"
#import "HippyTurboModule.h"
#import "NativeRenderConvert.h"
#import "NativeRenderDefaultImageProvider.h"
#import "NativeRenderDomNodeUtils.h"
#import "NativeRenderImageDataLoader.h"
#import "NativeRenderImageProviderProtocol.h"
#import "NativeRenderI18nUtils.h"
#import "NativeRenderLog.h"
#import "NativeRenderUtils.h"

#include <sys/utsname.h>
#include "dom/scene.h"
#include "driver/scope.h"

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
    NSSet<Class<NativeRenderImageProviderProtocol>> *_imageProviders;
    id<HippyMethodInterceptorProtocol> _methodInterceptor;
    HippyModulesSetup *_moduleSetup;
    __weak NSOperation *_lastOperation;
    BOOL _wasBatchActive;
    NSDictionary *_dimDic;
    HippyDisplayLink *_displayLink;
    HippyBridgeModuleProviderBlock _moduleProvider;
    NSString *_engineKey;
    BOOL _valid;
    HippyBundleOperationQueue *_bundlesQueue;
    NSMutableArray<NSURL *> *_bundleURLs;
    NSMutableArray<HippyInstanceLoadBlock *> *_instanceBlocks;
    NSMutableArray<dispatch_block_t> *_nativeSetupBlocks;
    NSURL *_sandboxDirectory;
    std::shared_ptr<hippy::vfs::UriLoader> _uriLoader;
}

@property(readwrite, assign) NSUInteger currentIndexOfBundleExecuted;
@property(readwrite, assign) NSUInteger loadingCount;

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


HIPPY_NOT_IMPLEMENTED(-(instancetype)init)

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
        _invalidateReason = NativeRenderInvalidateReasonDealloc;
        _valid = YES;
        _bundlesQueue = [[HippyBundleOperationQueue alloc] init];
        _nativeSetupBlocks = [NSMutableArray arrayWithCapacity:8];
        _instanceBlocks = [NSMutableArray arrayWithCapacity:4];
        [self setUp];
        NativeRenderExecuteOnMainQueue(^{
            [self bindKeys];
            self->_dimDic = hippyExportedDimensions();
        });
        NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ Init %p", NSStringFromClass([self class]), self);
    }
    return self;
}

- (void)dealloc {
    /**
     * This runs only on the main thread, but crashes the subclass
     * HippyAssertMainQueue();
     */
    NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ dealloc %p", NSStringFromClass([self class]), self);
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    self.invalidateReason = NativeRenderInvalidateReasonDealloc;
    [self invalidate];
}

- (void)bindKeys {
#if TARGET_IPHONE_SIMULATOR
    HippyAssertMainQueue();
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

- (NSSet<Class<NativeRenderImageProviderProtocol>> *)imageProviders {
    if (!_imageProviders) {
        NSMutableSet *set = [NSMutableSet setWithCapacity:8];
        for (Class moduleClass in self.moduleClasses) {
            if ([moduleClass conformsToProtocol:@protocol(NativeRenderImageProviderProtocol)]) {
                [set addObject:moduleClass];
            }
        }
        _imageProviders = [NSSet setWithSet:set];
    }
    return _imageProviders;
}

- (id<NativeRenderFrameworkProxy>)frameworkProxy {
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
    NSArray<NSURL *> *bundleURLs = [_bundleURLs copy];
    NSArray<dispatch_block_t> *setupBlocks = [_nativeSetupBlocks copy];
    NSURL *dir = [self sandboxDirectory];
    NSString *contextName = _contextName;
    __weak HippyBridge *weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        HippyBridge *strongSelf = weakSelf;
        if (!strongSelf) {
            return;
        }
        strongSelf.invalidateReason = NativeRenderInvalidateReasonReload;
        [strongSelf invalidate];
        [strongSelf setUp];
        for (dispatch_block_t block in setupBlocks) {
            block();
        }
        [strongSelf beginLoadingBundles:bundleURLs completion:^{
            
        }];
        if (dir) {
            [strongSelf.javaScriptExecutor setSandboxDirectory:[dir absoluteString]];
        }
        if (contextName) {
            [strongSelf.javaScriptExecutor setContextName:contextName];
        }
    });
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
    @try {
        _moduleSetup = [[HippyModulesSetup alloc] initWithBridge:self extraProviderModulesBlock:_moduleProvider];
        _javaScriptExecutor = [[HippyJSExecutor alloc] initWithEngineKey:_engineKey bridge:self];
        [_javaScriptExecutor setUriLoader:_uriLoader];
        _displayLink = [[HippyDisplayLink alloc] init];
        __weak HippyBridge *weakSelf = self;
        dispatch_async(HippyBridgeQueue(), ^{
            [self initWithModulesCompletion:^{
                HippyBridge *strongSelf = weakSelf;
                if (strongSelf) {
                    [strongSelf->_javaScriptExecutor notifyModulesSetupComplete];
                }
            }];
        });
    } @catch (NSException *exception) {
        HippyHandleException(exception, self);
    }
    if (nil == self.renderContext.frameworkProxy) {
        self.renderContext.frameworkProxy = self;
    }
}

- (void)loadBundleURLs:(NSArray<NSURL *> *)bundleURLs completion:(dispatch_block_t)completion {
    if (!bundleURLs) {
        if (completion) {
            completion();
        }
        return;
    }
    [_bundleURLs addObjectsFromArray:bundleURLs];
    dispatch_async(HippyBridgeQueue(), ^{
        [self beginLoadingBundles:bundleURLs completion:completion];
    });
}



- (void)initWithModulesCompletion:(dispatch_block_t)completion {
    [_moduleSetup setupModulesCompletion:completion];
}

- (void)beginLoadingBundles:(NSArray<NSURL *> *)bundleURLs completion:(dispatch_block_t)completion {
    dispatch_group_t group = dispatch_group_create();
    self.loadingCount++;
    for (NSURL *bundleURL in bundleURLs) {
        __weak HippyBridge *weakSelf = self;
        __block NSString *script = nil;
        dispatch_group_enter(group);
        HippyBundleDownloadOperation *fetchOp = [[HippyBundleDownloadOperation alloc] initWithBridge:self bundleURL:bundleURL];
        fetchOp.onLoad = ^(NSError *error, NSData *source, int64_t sourceLength) {
            if (error) {
                HippyFatal(error, weakSelf);
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
                    HippyFatal(error, weakSelf);
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
        if (completion) {
            completion();
        }
    };
    dispatch_group_notify(group, HippyBridgeQueue(), completionBlock);
}

- (void)loadInstanceForRootView:(NSNumber *)rootTag withProperties:(NSDictionary *)props {
    HippyAssert([_bundleURLs count], @"At least one bundle should be settled before load instance");
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
    NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],Running application %@ (%@)", moduleName, props);
    NSDictionary *param = @{@"name": moduleName,
                            @"id": rootTag,
                            @"params": props ?: @{},
                            @"version": HippySDKVersion};
    footstone::value::HippyValue value = OCTypeToDomValue(param);
    std::shared_ptr<footstone::value::HippyValue> domValue = std::make_shared<footstone::value::HippyValue>(value);
    self.javaScriptExecutor.pScope->LoadInstance(domValue);
}

- (void)setUriLoader:(std::shared_ptr<hippy::vfs::UriLoader>)uriLoader {
    if (_uriLoader != uriLoader) {
        _uriLoader = uriLoader;
    }
}

- (std::shared_ptr<hippy::vfs::UriLoader>)uriLoader {
    return _uriLoader;
}

- (void)executeJSCode:(NSString *)script
            sourceURL:(NSURL *)sourceURL
         onCompletion:(HippyJavaScriptCallback)completion {
    if (![self isValid] || !script || !sourceURL) {
        completion(nil, NativeRenderErrorWithMessageAndModuleName(@"bridge is not valid", _moduleName));
        return;
    }
    HippyAssert(self.javaScriptExecutor, @"js executor must not be null");
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
    HippyAssertMainQueue();
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

    if ([error userInfo][HippyJSStackTraceKey]) {
        [self.redBox showErrorMessage:[error localizedDescription] withStack:[error userInfo][HippyJSStackTraceKey]];
    }
    if (shouldInvalidate) {
        NSError *retError = NativeRenderErrorFromErrorAndModuleName(error, self.moduleName);
        HippyFatal(retError, self);
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
        NSError *retError = NativeRenderErrorFromErrorAndModuleName(error, self.moduleName);
        HippyFatal(retError, self);
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
    NSArray *requestsArray = [NativeRenderConvert NSArray:buffer];

    if (HIPPY_DEBUG && requestsArray.count <= HippyBridgeFieldParams) {
        NativeRenderLogError(@"Buffer should contain at least %tu sub-arrays. Only found %tu", HippyBridgeFieldParams + 1, requestsArray.count);
        return;
    }

    NSArray<NSNumber *> *moduleIDs = [NativeRenderConvert NSNumberArray:requestsArray[HippyBridgeFieldRequestModuleIDs]];
    NSArray<NSNumber *> *methodIDs = [NativeRenderConvert NSNumberArray:requestsArray[HippyBridgeFieldMethodIDs]];
    NSArray<NSArray *> *paramsArrays = [NativeRenderConvert NSArrayArray:requestsArray[HippyBridgeFieldParams]];

    int64_t callID = -1;

    if (requestsArray.count > 3) {
        callID = [requestsArray[HippyBridgeFieldCallID] longLongValue];
    }

    if (HIPPY_DEBUG && (moduleIDs.count != methodIDs.count || moduleIDs.count != paramsArrays.count)) {
        NativeRenderLogError(@"Invalid data message - all must be length: %lu", (unsigned long)moduleIDs.count);
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
            NativeRenderLogError(@"moduleID %lu exceed range of moduleDataByID %lu, bridge is valid %ld", moduleID, [moduleDataByID count], (long)isValid);
        }
        return nil;
    }
    HippyModuleData *moduleData = moduleDataByID[moduleID];
    if (HIPPY_DEBUG && !moduleData) {
        if (isValid) {
            NativeRenderLogError(@"No module found for id '%lu'", (unsigned long)moduleID);
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
            NativeRenderLogError(@"methodID %lu exceed range of moduleData.methods %lu, bridge is valid %ld", moduleID, [methods count], (long)isValid);
        }
        return nil;
    }
    id<HippyBridgeMethod> method = methods[methodID];
    if (HIPPY_DEBUG && !method) {
        if (isValid) {
            NativeRenderLogError(@"Unknown methodID: %lu for module: %lu (%@)", (unsigned long)methodID, (unsigned long)moduleID, moduleData.name);
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
        NSError *error = NativeRenderErrorWithMessageAndModuleName(message, self.moduleName);
        HippyFatal(error, self);
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
        NSError *error = NativeRenderErrorWithMessageAndModuleName(message, self.moduleName);
        HippyFatal(error, self);
        return nil;
    }
}

- (void)setMethodInterceptor:(id<HippyMethodInterceptorProtocol>)methodInterceptor {
    _methodInterceptor = methodInterceptor;
}

- (id<HippyMethodInterceptorProtocol>)methodInterceptor {
    return _methodInterceptor;
}

- (void)setupRootTag:(NSNumber *)tag rootSize:(CGSize)size
          frameworkProxy:(id<NativeRenderFrameworkProxy>) proxy
                rootView:(UIView *)view screenScale:(CGFloat)scale {
    __weak HippyBridge *weakSelf = self;
    dispatch_block_t block = ^(void){
        HippyBridge *strongSelf = weakSelf;
        if (!strongSelf) {
            return;
        }
        uint32_t rootTag = [tag unsignedIntValue];
        strongSelf->_rootNode = std::make_shared<hippy::RootNode>(rootTag);
        strongSelf->_rootNode->GetAnimationManager()->SetRootNode(strongSelf->_rootNode);
      
        auto engineResource = [[HippyJSEnginesMapper defaultInstance] createJSEngineResourceForKey:strongSelf->_engineKey];
        auto domManager = engineResource->GetDomManager();
        strongSelf->_javaScriptExecutor.pScope->SetDomManager(domManager);
      #ifdef ENABLE_INSPECTOR
        auto devtools_data_source = strongSelf->_javaScriptExecutor.pScope->GetDevtoolsDataSource();
        if (devtools_data_source) {
            hippy::DomManager::Insert(domManager);
            strongSelf->_javaScriptExecutor.pScope->GetDevtoolsDataSource()->Bind(0, domManager->GetId(), 0); // runtime_id for iOS is useless, set 0
            devtools_data_source->SetRootNode(strongSelf->_rootNode);
        }
      #endif
        strongSelf->_javaScriptExecutor.pScope->SetRootNode(strongSelf->_rootNode);
        strongSelf->_rootNode->SetDomManager(domManager);
        strongSelf->_rootNode->GetLayoutNode()->SetScaleFactor(scale);
        std::weak_ptr<hippy::DomManager> weakDomManager = domManager;
        std::weak_ptr<hippy::RootNode> weakRootNode = strongSelf->_rootNode;
        std::function<void()> func = [weakDomManager, weakRootNode, size](){
            auto rootNode = weakRootNode.lock();
            if (!rootNode) {
                return;
            }
            rootNode->SetRootSize(size.width, size.height);
        };
        domManager->PostTask(hippy::Scene({func}));

        strongSelf->_renderManager = std::make_shared<NativeRenderManager>();
        strongSelf->_renderManager->SetFrameworkProxy(proxy);
        strongSelf->_renderManager->RegisterRootView(view, strongSelf->_rootNode);
        strongSelf->_renderManager->SetDomManager(domManager);
        domManager->SetRenderManager(strongSelf->_renderManager);
        strongSelf->_renderContext = strongSelf->_renderManager->GetRenderContext();
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
    NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ invalide %p", NSStringFromClass([self class]), self);
    if (![self isValid]) {
        return;
    }
    HippyAssertMainThread();
    _valid = NO;
    self.loadingCount = 0;
    NSArray<HippyInstanceLoadBlock *> *blocks = [_instanceBlocks copy];
    for (NSUInteger i = 0; i < [blocks count]; i++) {
        HippyInstanceLoadBlock *blockInstance = blocks[i];
        blockInstance.loaded = NO;
    }

    [[self.renderContext rootViews] enumerateObjectsUsingBlock:^(__kindof UIView * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
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
                [(id<NativeRenderInvalidating>)instance invalidate];
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
    if (_dimDic) {
        [deviceInfo setValue:_dimDic forKey:@"Dimensions"];
    }
    NSString *countryCode = [[NativeRenderI18nUtils sharedInstance] currentCountryCode];
    NSString *lanCode = [[NativeRenderI18nUtils sharedInstance] currentAppLanguageCode];
    NSWritingDirection direction = [[NativeRenderI18nUtils sharedInstance] writingDirectionForCurrentAppLanguage];
    NSDictionary *local = @{@"country": countryCode?:@"unknown", @"language": lanCode?:@"unknown", @"direction": @(direction)};
    [deviceInfo setValue:local forKey:@"Localization"];
    return [NSDictionary dictionaryWithDictionary:deviceInfo];
}

- (NSString *)moduleConfig {
    NSMutableArray<NSArray *> *config = [NSMutableArray new];
    for (HippyModuleData *moduleData in [_moduleSetup moduleDataByID]) {
        NSArray *moduleDataConfig = [moduleData config];
        [config addObject:NativeRenderNullIfNil(moduleDataConfig)];
    }
    id jsonArray = @{
        @"remoteModuleConfig": config,
    };
    return NativeRenderJSONStringify(jsonArray, NULL);
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
        self.turboModuleManager = [[HippyTurboModuleManager alloc] initWithBridge:self delegate:nil];
    }

    // getTurboModule
    HippyOCTurboModule *turboModule = [self.turboModuleManager turboModuleWithName:name];
    return turboModule;
}

#pragma mark NativeRenderFrameworkProxy Delegate Implementation
- (NSString *)standardizeAssetUrlString:(NSString *)UrlString forRenderContext:(nonnull id<NativeRenderContext>)renderContext {
    if ([HippyBridge isHippyLocalFileURLString:UrlString]) {
        return [self absoluteStringFromHippyLocalFileURLString:UrlString];
    }
    return UrlString;
}

- (id<NativeRenderImageDataLoaderProtocol>)imageDataLoaderForRenderContext:(id<NativeRenderContext>)renderContext {
    if (self.frameworkProxy != self && [self.frameworkProxy respondsToSelector:@selector(imageDataLoaderForRenderContext:)]) {
        return [self.frameworkProxy imageDataLoaderForRenderContext:renderContext];
    }
    return [NativeRenderImageDataLoader new];
}

- (Class<NativeRenderImageProviderProtocol>)imageProviderClassForRenderContext:(id<NativeRenderContext>)renderContext {
    if (self.frameworkProxy != self && [self.frameworkProxy respondsToSelector:@selector(imageProviderClassForRenderContext:)]) {
        return [self.frameworkProxy imageProviderClassForRenderContext:renderContext];
    }
    return [NativeRenderDefaultImageProvider class];
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
