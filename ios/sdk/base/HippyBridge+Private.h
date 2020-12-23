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
#import "HippyJavaScriptExecutor.h"

@class HippyModuleData;
@protocol HippyJavaScriptExecutor;

HIPPY_EXTERN NSArray<Class> *HippyGetModuleClasses(void);

#if HIPPY_DEBUG
HIPPY_EXTERN void HippyVerifyAllModulesExported(NSArray *extraModules);
#endif

@interface HippyBridge ()

// Used for the profiler flow events between JS and native
@property (nonatomic, assign) int64_t flowID;
@property (nonatomic, assign) CFMutableDictionaryRef flowIDMap;
@property (nonatomic, strong) NSLock *flowIDMapLock;
@property (nonatomic, copy) NSString *executorKey;

+ (instancetype)currentBridge;
+ (void)setCurrentBridge:(HippyBridge *)bridge;

/**
 * Bridge setup code - creates an instance of HippyBachedBridge. Exposed for
 * test only
 */
- (void)setUp;

/**
 * This method is used to invoke a callback that was registered in the
 * JavaScript application context. Safe to call from any thread.
 */
- (void)enqueueCallback:(NSNumber *)cbID args:(NSArray *)args;

/**
 * This property is mostly used on the main thread, but may be touched from
 * a background thread if the HippyBridge happens to deallocate on a background
 * thread. Therefore, we want all writes to it to be seen atomically.
 */
@property (atomic, strong) HippyBridge *batchedBridge;

/**
 * The block that creates the modules' instances to be added to the bridge.
 * Exposed for the HippyBatchedBridge
 */
@property (nonatomic, copy, readonly) HippyBridgeModuleProviderBlock moduleProvider;

/**
 * Used by HippyDevMenu to override the `hot` param of the current bundleURL.
 */
@property (nonatomic, strong, readwrite) NSURL *bundleURL;

@end

@interface HippyBridge (HippyBatchedBridge)

/**
 * Access the underlying JavaScript executor. You can use this in unit tests to detect
 * when the executor has been invalidated, or when you want to schedule calls on the
 * JS VM outside of Hippy Native. Use with care!
 */
@property (nonatomic, weak, readonly) id<HippyJavaScriptExecutor> javaScriptExecutor;

/**
 * Used by HippyModuleData
 */
@property (nonatomic, assign, readonly) BOOL moduleSetupComplete;

/**
 * Called on the child bridge to run the executor and start loading.
 */
- (void)start;

/**
 * Used by HippyModuleData to register the module for frame updates after it is
 * lazily initialized.
 */
- (void)registerModuleForFrameUpdates:(id<HippyBridgeModule>)module
                       withModuleData:(HippyModuleData *)moduleData;

/**
 * Dispatch work to a module's queue - this is also suports the fake HippyJSThread
 * queue. Exposed for the HippyProfiler
 */
- (void)dispatchBlock:(dispatch_block_t)block queue:(dispatch_queue_t)queue;

/**
 * Get the module data for a given module name. Used by UIManager to implement
 * the `dispatchViewManagerCommand` method.
 */
- (HippyModuleData *)moduleDataForName:(NSString *)moduleName;

/**
 * Exposed for the HippyJSCExecutor for sending native methods called from
 * JavaScript in the middle of a batch.
 */
- (void)handleBuffer:(NSArray<NSArray *> *)buffer batchEnded:(BOOL)hasEnded;
- (void)processResponse:(id)json error:(NSError *)error;
- (NSDictionary *)deviceInfo;
- (NSString *)moduleConfig;
/**
 * Synchronously call a specific native module's method and return the result
 */
- (id)callNativeModule:(NSUInteger)moduleID
                method:(NSUInteger)methodID
                params:(NSArray *)params;

/**
 * Exposed for the HippyJSCExecutor for lazily loading native modules
 */
- (NSArray *)configForModuleName:(NSString *)moduleName;

/**
 * Hook exposed for HippyLog to send logs to JavaScript when not running in JSC
 */
- (void)logMessage:(NSString *)message level:(NSString *)level;

/**
 * Allow super fast, one time, timers to skip the queue and be directly executed
 */
- (void)_immediatelyCallTimer:(NSNumber *)timer;

@end

@interface HippyBatchedBridge : HippyBridge <HippyInvalidating>

@property (nonatomic, weak, readonly) HippyBridge *parentBridge;
@property (nonatomic, weak, readonly) id<HippyJavaScriptExecutor> javaScriptExecutor;
@property (nonatomic, assign, readonly) BOOL moduleSetupComplete;

@property (nonatomic, strong) dispatch_semaphore_t semaphore;

- (instancetype)initWithParentBridge:(HippyBridge *)bridge NS_DESIGNATED_INITIALIZER;
- (void)start;
- (void)enqueueApplicationScript:(NSData *)script
                             url:(NSURL *)url
                      onComplete:(HippyJavaScriptCompleteBlock)onComplete;

@end
