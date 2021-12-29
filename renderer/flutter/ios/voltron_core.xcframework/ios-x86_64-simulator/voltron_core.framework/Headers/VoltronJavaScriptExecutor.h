//
//  VoltronJavaScriptExecutor.h
//  RenderCore
//
//  Created by skindhu-xp on 2021/8/29.
//

#import <objc/runtime.h>
#import <JavaScriptCore/JavaScriptCore.h>
#import "VoltronInvalidating.h"
#include <memory>

typedef void (^VoltronJavaScriptCompleteBlock)(NSError *error);
typedef void (^VoltronJavaScriptCallback)(id result, NSError *error);
typedef void (^VoltronFrameworkInitCallback)(BOOL result);

class Scope;

@protocol VoltronJavaScriptExecutor <VoltronInvalidating>
  
- (instancetype)initWithExecurotKey:(NSString *)execurotkey globalConfig:(NSString *)globalConfig completion:(VoltronFrameworkInitCallback)completion;
/**
 * Used to set up the executor after the bridge has been fully initialized.
 * Do any expensive setup in this method instead of `-init`.
 */
- (void)setUp;

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
 * Executes BatchedBridge.flushedQueue on JS thread and calls the given callback
 * with JSValue, containing the next queue, and JSContext.
 */
- (void)flushedQueue:(VoltronJavaScriptCallback)onComplete;

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
- (void)callFunctionOnModule:(NSString *)module method:(NSString *)method arguments:(NSArray *)args callback:(VoltronJavaScriptCallback)onComplete;

/**
 * Executes BatchedBridge.invokeCallbackAndReturnFlushedQueue with the cbID,
 * and optional additional arguments on the JS thread and calls the
 * given callback with JSValue, containing the next queue, and JSContext.
 */
- (void)invokeCallbackID:(NSNumber *)cbID arguments:(NSArray *)args callback:(VoltronJavaScriptCallback)onComplete;

/**
 * Runs an application script, and notifies of the script load being complete via `onComplete`.
 */
- (void)executeApplicationScript:(NSData *)script sourceURL:(NSURL *)sourceURL onComplete:(VoltronJavaScriptCompleteBlock)onComplete;

- (void)injectJSONText:(NSString *)script asGlobalObjectNamed:(NSString *)objectName callback:(VoltronJavaScriptCompleteBlock)onComplete;

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
