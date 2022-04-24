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

#import <JavaScriptCore/JavaScriptCore.h>
#import "HippyDefines.h"
#import "HippyBridgeModule.h"
#import "HippyInvalidating.h"
#import <memory>

typedef void (^HippyJavaScriptValueCallback)(JSValue *result, NSError *error);

typedef void (^HippyJavaScriptCompleteBlock)(NSError *error);
typedef void (^HippyJavaScriptCallback)(id result, NSError *error);

class Scope;
@class HippyBridge;
/**
 * Default name for the JS thread
 */
HIPPY_EXTERN NSString *const HippyJSCThreadName;

/**
 * This notification fires on the JS thread immediately after a `JSContext`
 * is fully initialized, but before the JS bundle has been loaded. The object
 * of this notification is the `JSContext`. Native modules should listen for
 * notification only if they need to install custom functionality into the
 * context. Note that this notification won't fire when debugging in Chrome.
 */
HIPPY_EXTERN NSString *const HippyJavaScriptContextCreatedNotification;

/**
 * A Key to referenct to a HippyBridge class in HippyJavaScriptContextCreatedNotification.
 */
HIPPY_EXTERN NSString *const HippyJavaScriptContextCreatedNotificationBridgeKey;

/**
 * Uses a JavaScriptCore context as the execution engine.
 */
@interface HippyJSCExecutor : NSObject<HippyBridgeModule, HippyInvalidating>

@property (nonatomic, strong) HippyBridge *bridge;
/**
 * Whether the executor has been invalidated
 */
@property (nonatomic, readonly, getter=isValid) BOOL valid;

@property (nonatomic, copy) NSString *executorkey;
/*
 *hippy-core js engine
 */
@property (atomic, assign) std::shared_ptr<Scope> pScope;
@property (readonly) JSGlobalContextRef JSGlobalContextRef;

/**
 * Specify a name for the JSContext used, which will be visible in debugging tools
 * @default is "HippyJSContext"
 */
@property (nonatomic, copy) NSString *contextName;

- (instancetype)initWithExecurotKey:(NSString *)execurotkey bridge:(HippyBridge *)bridge;

/**
 * Used to set up the executor after the bridge has been fully initialized.
 * Do any expensive setup in this method instead of `-init`.
 */
- (void)setUp;

/**
 * Invokes the given module/method directly. The completion block will be called with the
 * JSValue returned by the JS context.
 *
 * Currently this does not flush the JS-to-native message queue.
 */
- (void)callFunctionOnModule:(NSString *)module
                      method:(NSString *)method
                   arguments:(NSArray *)args
             jsValueCallback:(HippyJavaScriptValueCallback)onComplete;

- (JSValueRef)JSTurboObjectWithName:(NSString *)name;

/**
 * Executes BatchedBridge.flushedQueue on JS thread and calls the given callback
 * with JSValue, containing the next queue, and JSContext.
 */
- (void)flushedQueue:(HippyJavaScriptCallback)onComplete;

/**
 * called when second bundle load
 */
- (void)secondBundleLoadCompleted:(BOOL)success;

/**
 * called before excute secondary js bundle
 */
- (void)updateGlobalObjectBeforeExcuteSecondary;

/**
 * Executes BatchedBridge.callFunctionReturnFlushedQueue with the module name,
 * method name and optional additional arguments on the JS thread and calls the
 * given callback with JSValue, containing the next queue, and JSContext.
 */
- (void)callFunctionOnModule:(NSString *)module method:(NSString *)method arguments:(NSArray *)args callback:(HippyJavaScriptCallback)onComplete;

/**
 * Executes BatchedBridge.invokeCallbackAndReturnFlushedQueue with the cbID,
 * and optional additional arguments on the JS thread and calls the
 * given callback with JSValue, containing the next queue, and JSContext.
 */
- (void)invokeCallbackID:(NSNumber *)cbID arguments:(NSArray *)args callback:(HippyJavaScriptCallback)onComplete;

/**
 * Runs an application script, and notifies of the script load being complete via `onComplete`.
 */
- (void)executeApplicationScript:(NSData *)script sourceURL:(NSURL *)sourceURL onComplete:(HippyJavaScriptCompleteBlock)onComplete;

- (void)injectJSONText:(NSString *)script asGlobalObjectNamed:(NSString *)objectName callback:(HippyJavaScriptCompleteBlock)onComplete;

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

@end
