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
#include <memory>


/**
 * Block that when js script execution completion
 */
typedef void (^HippyJavaScriptCallback)(id result, NSError *error);


namespace hippy {
inline namespace driver {

inline namespace napi {
class CtxValue;
}

class Scope;

}

inline namespace vfs {
class UriLoader;
}

}

@class HippyBridge;
@protocol HippyContextWrapper;

typedef void (^HippyContextCreatedBlock)(id<HippyContextWrapper>);

/**
 * Default name for the JS thread
 */
HIPPY_EXTERN NSString *const HippyJSCThreadName;

/**
 * Uses a JavaScriptCore context as the execution engine.
 */
@interface HippyJSExecutor : NSObject<HippyInvalidating>

@property (nonatomic, strong) HippyBridge *bridge;

/**
 * Whether the executor has been invalidated
 */
@property (nonatomic, readonly, getter=isValid) BOOL valid;

@property (nonatomic, copy) NSString *enginekey;
/*
 *hippy-core js engine
 */
@property (atomic, assign) std::shared_ptr<hippy::Scope> pScope;

@property(nonatomic, copy) HippyContextCreatedBlock contextCreatedBlock;

- (instancetype)initWithEngineKey:(NSString *)engineKey bridge:(HippyBridge *)bridge;

/**
 * Used to set up the executor after the bridge has been fully initialized.
 * Do any expensive setup in this method instead of `-init`.
 */
- (void)setup;

- (void)setSandboxDirectory:(NSString *)directory;

- (void)setContextName:(NSString *)contextName;

- (void)setInspecable:(BOOL)inspectable;

- (void)setUriLoader:(std::weak_ptr<hippy::vfs::UriLoader>)uriLoader;

- (std::shared_ptr<hippy::napi::CtxValue>)JSTurboObjectWithName:(NSString *)name;

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
- (void)executeApplicationScript:(NSData *)script sourceURL:(NSURL *)sourceURL onComplete:(HippyJavaScriptCallback)onComplete;

- (void)injectJSONText:(NSString *)script asGlobalObjectNamed:(NSString *)objectName callback:(HippyJavaScriptCallback)onComplete;

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

@end
