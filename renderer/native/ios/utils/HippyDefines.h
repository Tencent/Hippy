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

#if __OBJC__
#import <Foundation/Foundation.h>
#endif

/**
 * Make global functions usable in C++
 */
#if defined(__cplusplus)
#define HIPPY_EXTERN extern "C" __attribute__((visibility("default")))
#else
#define HIPPY_EXTERN extern __attribute__((visibility("default")))
#endif

/**
 * The HIPPY_DEBUG macro can be used to exclude error checking and logging code
 * from release builds to improve performance and reduce binary size.
 */
#ifndef HIPPY_DEBUG
#ifdef DEBUG
#define HIPPY_DEBUG 1
#else
#define HIPPY_DEBUG 0
#endif
#endif

/**
 * The HIPPY_DEV macro can be used to enable or disable development tools
 * such as the debug executors, dev menu, red box, etc.
 */
#ifndef HIPPY_DEV
#ifdef DEBUG
#define HIPPY_DEV 1
#else
#define HIPPY_DEV 0
#endif
#endif

#if HIPPY_DEV
#define HIPPY_IF_DEV(...) __VA_ARGS__
#else
#define HIPPY_IF_DEV(...)
#endif

#ifndef HIPPY_PROFILE
#define HIPPY_PROFILE HIPPY_DEV
#endif

/**
 * By default, only raise an NSAssertion in debug mode
 * (custom assert functions will still be called).
 */
#ifndef HIPPY_NSASSERT
#define HIPPY_NSASSERT HIPPY_DEBUG
#endif

/**
 * Concat two literals. Supports macro expansions,
 * e.g. HIPPY_CONCAT(foo, __FILE__).
 */
#define HIPPY_CONCAT2(A, B) A##B
#define HIPPY_CONCAT(A, B) HIPPY_CONCAT2(A, B)

/**
 * Throw an assertion for unimplemented methods.
 */
#define HIPPY_NOT_IMPLEMENTED(method)                                                                                                   \
    _Pragma("clang diagnostic push") _Pragma("clang diagnostic ignored \"-Wmissing-method-return-type\"")                               \
        _Pragma("clang diagnostic ignored \"-Wunused-parameter\"") HIPPY_EXTERN NSException *_HippyNotImplementedException(SEL, Class); \
    method NS_UNAVAILABLE {                                                                                                             \
        @throw _HippyNotImplementedException(_cmd, [self class]);                                                                       \
    }                                                                                                                                   \
    _Pragma("clang diagnostic pop")

/**
 * The type of a block that is capable of sending a response to a bridged
 * operation. Use this for returning callback methods to JS.
 */
typedef void (^HippyResponseSenderBlock)(NSArray *response);

typedef void (^RenderUIResponseSenderBlock)(id response);

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
