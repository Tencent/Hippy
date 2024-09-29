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

#import "HippyBridgeModule.h"
#import "HippyDefines.h"
#import "HippyDefines.h"
#import "HippyInvalidating.h"

@class HippyBridge;

/**
 * Block that when js script execution completion
 */
typedef void (^HippyJavaScriptCallback)(id result, NSError *error);
typedef void (^HippyContextCreatedBlock)(void);

/**
 * Uses a JavaScriptCore context as the execution engine.
 */
@interface HippyJSExecutor : NSObject<HippyInvalidating>

/// HippyBridge instance
@property (nonatomic, weak) HippyBridge *bridge;

/// Whether the executor has been invalidated
@property (nonatomic, readonly, getter=isValid) BOOL valid;

/// EngineKey
@property (nonatomic, copy) NSString *enginekey;

/// context created block
@property (nonatomic, copy) HippyContextCreatedBlock contextCreatedBlock;

/// Init method
/// - Parameters:
///   - engineKey: NSString
///   - bridge: HippyBridge instance
- (instancetype)initWithEngineKey:(NSString *)engineKey bridge:(HippyBridge *)bridge;

/// Used to set up the executor after bridge has been fully initialized.
- (void)setup;

/// Set sandbox directory for Hippy
/// - Parameter directory: NSString
- (void)setSandboxDirectory:(NSString *)directory;

/// Set context name
/// - Parameter contextName: NSString
- (void)setContextName:(NSString *)contextName;

/// Set whether js engine is inspectable
/// - Parameter inspectable: BOOL
- (void)setInspecable:(BOOL)inspectable;

// TODO: 疑似已废弃
/**
 * Executes BatchedBridge.flushedQueue on JS thread and calls the given callback
 * with JSValue, containing the next queue, and JSContext.
 */
- (void)flushedQueue:(HippyJavaScriptCallback)onComplete;

/**
 * Executes BatchedBridge.callFunctionReturnFlushedQueue with the module name,
 * method name and optional additional arguments on the JS thread and calls the
 * given callback with JSValue, containing the next queue, and JSContext.
 */
- (void)callFunctionOnModule:(NSString *)moduleName
                      method:(NSString *)method
                   arguments:(NSArray *)args
                    callback:(HippyJavaScriptCallback)onComplete;

/**
 * Executes BatchedBridge.invokeCallbackAndReturnFlushedQueue with the cbID,
 * and optional additional arguments on the JS thread and calls the
 * given callback with JSValue, containing the next queue, and JSContext.
 */
- (void)invokeCallbackID:(NSNumber *)cbID arguments:(NSArray *)args callback:(HippyJavaScriptCallback)onComplete;

/**
 * Runs an application script, and notifies of the script load being complete via `onComplete`.
 */
- (void)executeApplicationScript:(NSData *)script sourceURL:(NSURL *)sourceURL onComplete:(HippyJavaScriptCallback)onComplete;

/**
 * Enqueue a block to run in the executors JS thread. Fallback to `dispatch_async`
 * on the main queue if the executor doesn't own a thread.
 */
- (void)executeBlockOnJavaScriptQueue:(dispatch_block_t)block;

/**
 * Special case for Timers + ContextExecutor - instead of the default
 *   if jsthread then call else dispatch call on jsthread
 * ensure the call is made async on the jsthread
 */
- (void)executeAsyncBlockOnJavaScriptQueue:(dispatch_block_t)block;

/// Updated hippy global info
/// - Parameter dict: updated info
- (void)updateNativeInfoToHippyGlobalObject:(NSDictionary *)dict;

/// Inject object to JS global using `objectName` as key sync.
/// Must be called in the JS thread.
- (void)injectObjectSync:(NSObject *)value asGlobalObjectNamed:(NSString *)objectName callback:(HippyJavaScriptCallback)onComplete;

/// Inject object to JS global using `objectName` as key async.
- (void)injectObjectAsync:(NSString *)value asGlobalObjectNamed:(NSString *)objectName callback:(HippyJavaScriptCallback)onComplete;

@end
