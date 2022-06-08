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

#import "HippyDefines.h"

@class HippyBridge;
@protocol HippyBridgeMethod;

/**
 * The type of a block that is capable of sending a response to a bridged
 * operation. Use this for returning callback methods to JS.
 */
typedef void (^HippyResponseSenderBlock)(NSArray *response);

/**
 * The type of a block that is capable of sending an error response to a
 * bridged operation. Use this for returning error information to JS.
 */
typedef void (^HippyResponseErrorBlock)(NSError *error);

/**
 * Block that bridge modules use to resolve the JS promise waiting for a result.
 * Nil results are supported and are converted to JS's undefined value.
 */
typedef void (^HippyPromiseResolveBlock)(id result);

/**
 * Block that bridge modules use to reject the JS promise waiting for a result.
 * The error may be nil but it is preferable to pass an NSError object for more
 * precise error messages.
 */
typedef void (^HippyPromiseRejectBlock)(NSString *code, NSString *message, NSError *error);

/**
 * This constant can be returned from +methodQueue to force module
 * methods to be called on the JavaScript thread. This can have serious
 * implications for performance, so only use this if you're sure it's what
 * you need.
 *
 * NOTE: HippyJSThread is not a real libdispatch queue
 */
extern dispatch_queue_t HippyJSThread;

/**
 * Provides the interface needed to register a bridge module.
 */
@protocol HippyBridgeModule <NSObject>

/**
 * Place this macro in your class implementation to automatically register
 * your module with the bridge when it loads. The optional js_name argument
 * will be used as the JS module name. If omitted, the JS module name will
 * match the Objective-C class name.
 */
#define HIPPY_EXPORT_MODULE(js_name)              \
    HIPPY_EXTERN void HippyRegisterModule(Class); \
    +(NSString *)moduleName {                     \
        return @ #js_name;                        \
    }                                             \
    +(void)load {                                 \
        HippyRegisterModule(self);                \
    }

// Implemented by HIPPY_EXPORT_MODULE
+ (NSString *)moduleName;

@optional

/**
 * A reference to the HippyBridge. Useful for modules that require access
 * to bridge features, such as sending events or making JS calls. This
 * will be set automatically by the bridge when it initializes the module.
 * To implement this in your module, just add `@synthesize bridge = _bridge;`
 */
@property (nonatomic, weak, readonly) HippyBridge *bridge;

/**
 * The queue that will be used to call all exported methods. If omitted, this
 * will call on a default background queue, which is avoids blocking the main
 * thread.
 *
 * If the methods in your module need to interact with UIKit methods, they will
 * probably need to call those on the main thread, as most of UIKit is main-
 * thread-only. You can tell Hippy Native to call your module methods on the
 * main thread by returning a reference to the main queue, like this:
 *
 * - (dispatch_queue_t)methodQueue
 * {
 *   return dispatch_get_main_queue();
 * }
 *
 * If you don't want to specify the queue yourself, but you need to use it
 * inside your class (e.g. if you have internal methods that need to dispatch
 * onto that queue), you can just add `@synthesize methodQueue = _methodQueue;`
 * and the bridge will populate the methodQueue property for you automatically
 * when it initializes the module.
 */
@property (nonatomic, strong, readonly) dispatch_queue_t methodQueue;

/**
 * Wrap the parameter line of your method implementation with this macro to
 * expose it to JS. By default the exposed method will match the first part of
 * the Objective-C method selector name (up to the first colon). Use
 * HIPPY_REMAP_METHOD to specify the JS name of the method.
 *
 * For example, in ModuleName.m:
 *
 * - (void)doSomething:(NSString *)aString withA:(NSInteger)a andB:(NSInteger)b
 * { ... }
 *
 * becomes
 *
 * HIPPY_EXPORT_METHOD(doSomething:(NSString *)aString
 *                   withA:(NSInteger)a
 *                   andB:(NSInteger)b)
 * { ... }
 *
 * and is exposed to JavaScript as `NativeModules.ModuleName.doSomething`.
 *
 * ## Promises
 *
 * Bridge modules can also define methods that are exported to JavaScript as
 * methods that return a Promise, and are compatible with JS async functions.
 *
 * Declare the last two parameters of your native method to be a resolver block
 * and a rejecter block. The resolver block must precede the rejecter block.
 *
 * For example:
 *
 * HIPPY_EXPORT_METHOD(doSomethingAsync:(NSString *)aString
 *                           resolver:(HippyPromiseResolveBlock)resolve
 *                           rejecter:(HippyPromiseRejectBlock)reject
 * { ... }
 *
 * Calling `NativeModules.ModuleName.doSomethingAsync(aString)` from
 * JavaScript will return a promise that is resolved or rejected when your
 * native method implementation calls the respective block.
 *
 */
#define HIPPY_EXPORT_METHOD(method) HIPPY_REMAP_METHOD(, method)

/**
 * Similar to HIPPY_EXPORT_METHOD but lets you set the JS name of the exported
 * method. Example usage:
 *
 * HIPPY_REMAP_METHOD(executeQueryWithParameters,
 *   executeQuery:(NSString *)query parameters:(NSDictionary *)parameters)
 * { ... }
 */
#define HIPPY_REMAP_METHOD(js_name, method)    \
    HIPPY_EXTERN_REMAP_METHOD(js_name, method) \
    -(void)method

/**
 * Use this macro in a private Objective-C implementation file to automatically
 * register an external module with the bridge when it loads. This allows you to
 * register Swift or private Objective-C classes with the bridge.
 *
 * For example if one wanted to export a Swift class to the bridge:
 *
 * MyModule.swift:
 *
 *   @objc(MyModule) class MyModule: NSObject {
 *
 *     @objc func doSomething(string: String! withFoo a: Int, bar b: Int) { ... }
 *
 *   }
 *
 * MyModuleExport.m:
 *
 *   #import "HippyBridgeModule.h"
 *
 *   @interface HIPPY_EXTERN_MODULE(MyModule, NSObject)
 *
 *   HIPPY_EXTERN_METHOD(doSomething:(NSString *)string withFoo:(NSInteger)a bar:(NSInteger)b)
 *
 *   @end
 *
 * This will now expose MyModule and the method to JavaScript via
 * `NativeModules.MyModule.doSomething`
 */
#define HIPPY_EXTERN_MODULE(objc_name, objc_supername) HIPPY_EXTERN_REMAP_MODULE(, objc_name, objc_supername)

/**
 * Like HIPPY_EXTERN_MODULE, but allows setting a custom JavaScript name.
 */
#define HIPPY_EXTERN_REMAP_MODULE(js_name, objc_name, objc_supername) \
    objc_name:                                                        \
    objc_supername @                                                  \
    end @interface objc_name(HippyExternModule)<HippyBridgeModule>    \
    @end                                                              \
    @implementation objc_name (HippyExternModule)                     \
    HIPPY_EXPORT_MODULE(js_name)

/**
 * Use this macro in accordance with HIPPY_EXTERN_MODULE to export methods
 * of an external module.
 */
#define HIPPY_EXTERN_METHOD(method) HIPPY_EXTERN_REMAP_METHOD(, method)

/**
 * Like HIPPY_EXTERN_REMAP_METHOD, but allows setting a custom JavaScript name.
 */
#define HIPPY_EXTERN_REMAP_METHOD(js_name, method)                                                                       \
    +(NSArray<NSString *> *)Hippy_CONCAT(__hippy_export__, Hippy_CONCAT(js_name, Hippy_CONCAT(__LINE__, __COUNTER__))) { \
        return @[@ #js_name, @ #method];                                                                                 \
    }

/**
 * Injects methods into JS.  Entries in this array are used in addition to any
 * methods defined using the macros above.  This method is called only once,
 * before registration.
 */
- (NSArray<id<HippyBridgeMethod>> *)methodsToExport;

/**
 * Injects constants into JS. These constants are made accessible via
 * NativeModules.ModuleName.X.  It is only called once for the lifetime of the
 * bridge, so it is not suitable for returning dynamic values, but may be used
 * for long-lived values such as session keys, that are regenerated only as
 * part of a reload of the entire Hippy application.
 */
- (NSDictionary<NSString *, id> *)constantsToExport;

/**
 * Notifies the module that a batch of JS method invocations has just completed.
 */
- (void)batchDidComplete;

/**
 * Notifies the module that the active batch of JS method invocations has been
 * partially flushed.
 *
 * This occurs before -batchDidComplete, and more frequently.
 */
- (void)partialBatchDidFlush;

@end
