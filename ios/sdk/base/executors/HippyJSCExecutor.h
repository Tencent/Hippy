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

#import "HippyJavaScriptExecutor.h"

typedef void (^HippyJavaScriptValueCallback)(JSValue *result, NSError *error);

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
 * A key to a reference to a JSContext class, held in the the current thread's
 *  dictionary. The reference would point to the JSContext class in the JS VM
 *  used in Hippy (or ComponenetScript). It is recommended not to access it
 *  through the thread's dictionary, but rather to use the `FBJSCurrentContext()`
 *  accessor, which will return the current JSContext in the currently used VM.
 */
HIPPY_EXTERN NSString *const HippyFBJSContextClassKey;

/**
 * A key to a reference to a JSValue class, held in the the current thread's
 *  dictionary. The reference would point to the JSValue class in the JS VM
 *  used in Hippy (or ComponenetScript). It is recommended not to access it
 *  through the thread's dictionary, but rather to use the `FBJSValue()` accessor.
 */
HIPPY_EXTERN NSString *const HippyFBJSValueClassKey;

/**
 * @experimental
 * May be used to pre-create the JSContext to make HippyJSCExecutor creation less costly.
 * Avoid using this; it's experimental and is not likely to be supported long-term.
 */
@interface HippyJSContextProvider : NSObject

- (instancetype)initWithUseCustomJSCLibrary:(BOOL)useCustomJSCLibrary;

/**
 * Marks whether the provider uses the custom implementation of JSC and not the system one.
 */
@property (nonatomic, readonly, assign) BOOL useCustomJSCLibrary;

@end

/**
 * Uses a JavaScriptCore context as the execution engine.
 */
@interface HippyJSCExecutor : NSObject <HippyJavaScriptExecutor>

/**
 * Returns whether executor uses custom JSC library.
 * This value is used to initialize HippyJSCWrapper.
 * @default is NO.
 */
@property (nonatomic, readonly, assign) BOOL useCustomJSCLibrary;

/**
 * Specify a name for the JSContext used, which will be visible in debugging tools
 * @default is "HippyJSContext"
 */
@property (nonatomic, copy) NSString *contextName;

/**
 * Inits a new executor instance with given flag that's used
 * to initialize HippyJSCWrapper.
 */
- (instancetype)initWithUseCustomJSCLibrary:(BOOL)useCustomJSCLibrary;

/**
 * @experimental
 * Pass a HippyJSContextProvider object to use an NSThread/JSContext pair that have already been created.
 * The returned executor has already executed the supplied application script synchronously.
 * The underlying JSContext will be returned in the JSContext pointer if it is non-NULL and there was no error.
 * If an error occurs, this method will return nil and specify the error in the error pointer if it is non-NULL.
 */
+ (instancetype)initializedExecutorWithContextProvider:(HippyJSContextProvider *)JSContextProvider
                                     applicationScript:(NSData *)applicationScript
                                             sourceURL:(NSURL *)sourceURL
                                             JSContext:(JSContext **)JSContext
                                                 error:(NSError **)error;

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

@end
