//
//  VoltronJSCExecutor.h
//  RenderCore
//
//  Created by skindhu-xp on 2021/8/29.
//

#import <JavaScriptCore/JavaScriptCore.h>
#import "VoltronJavaScriptExecutor.h"
#import "VoltronDefines.h"


typedef void (^VoltronJavaScriptValueCallback)(JSValue *result, NSError *error);

@protocol VoltronJSCExecutorProvider <NSObject>

- (id)callNativeModule:(NSString *)module
                method:(NSString *)methodID
                params:(NSArray *)params
                callId:(NSString *)callId;

@end

/**
 * Default name for the JS thread
 */
VOLTRON_EXTERN NSString *const VoltronJSCThreadName;

/**
 * This notification fires on the JS thread immediately after a `JSContext`
 * is fully initialized, but before the JS bundle has been loaded. The object
 * of this notification is the `JSContext`. Native modules should listen for
 * notification only if they need to install custom functionality into the
 * context. Note that this notification won't fire when debugging in Chrome.
 */
VOLTRON_EXTERN NSString *const VoltronJavaScriptContextCreatedNotification;

/**
 * A Key to referenct to a HippyBridge class in HippyJavaScriptContextCreatedNotification.
 */
VOLTRON_EXTERN NSString *const VoltronJavaScriptContextCreatedNotificationBridgeKey;

/**
 * A key to a reference to a JSContext class, held in the the current thread's
 *  dictionary. The reference would point to the JSContext class in the JS VM
 *  used in Hippy (or ComponenetScript). It is recommended not to access it
 *  through the thread's dictionary, but rather to use the `FBJSCurrentContext()`
 *  accessor, which will return the current JSContext in the currently used VM.
 */
VOLTRON_EXTERN NSString *const VoltronFBJSContextClassKey;

/**
 * A key to a reference to a JSValue class, held in the the current thread's
 *  dictionary. The reference would point to the JSValue class in the JS VM
 *  used in Hippy (or ComponenetScript). It is recommended not to access it
 *  through the thread's dictionary, but rather to use the `FBJSValue()` accessor.
 */
VOLTRON_EXTERN NSString *const VoltronFBJSValueClassKey;

/**
 * Uses a JavaScriptCore context as the execution engine.
 */

@interface VoltronJSCExecutor : NSObject <VoltronJavaScriptExecutor>

/**
 * Returns whether executor uses custom JSC library.
 * This value is used to initialize HippyJSCWrapper.
 * @default is NO.
 */
@property (nonatomic, readonly, assign) BOOL useCustomJSCLibrary;

@property (nonatomic, weak) id<VoltronJSCExecutorProvider> provider;

/**
 * Specify a name for the JSContext used, which will be visible in debugging tools
 * @default is "HippyJSContext"
 */
@property (nonatomic, copy) NSString *contextName;

/**
 * Invokes the given module/method directly. The completion block will be called with the
 * JSValue returned by the JS context.
 *
 * Currently this does not flush the JS-to-native message queue.
 */
- (void)callFunctionOnModule:(NSString *)module
                      method:(NSString *)method
                   arguments:(NSArray *)args
             jsValueCallback:(VoltronJavaScriptCallback)onComplete;

- (void)callFunctionOnAction:(NSString *)action
                   arguments:(NSDictionary *)args
                    callback:(VoltronJavaScriptCallback)onComplete;
  
@end

