/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#if __OBJC__
#  import <Foundation/Foundation.h>
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
#define Hippy_IF_DEV(...) __VA_ARGS__
#else
#define Hippy_IF_DEV(...)
#endif



#ifndef Hippy_PROFILE
#define Hippy_PROFILE HIPPY_DEV
#endif

/**
 * By default, only raise an NSAssertion in debug mode
 * (custom assert functions will still be called).
 */
#ifndef Hippy_NSASSERT
#define Hippy_NSASSERT HIPPY_DEBUG
#endif

/**
 * Concat two literals. Supports macro expansions,
 * e.g. Hippy_CONCAT(foo, __FILE__).
 */
#define Hippy_CONCAT2(A, B) A ## B
#define Hippy_CONCAT(A, B) Hippy_CONCAT2(A, B)

/**
 * Throw an assertion for unimplemented methods.
 */
#define HIPPY_NOT_IMPLEMENTED(method) \
_Pragma("clang diagnostic push") \
_Pragma("clang diagnostic ignored \"-Wmissing-method-return-type\"") \
_Pragma("clang diagnostic ignored \"-Wunused-parameter\"") \
HIPPY_EXTERN NSException *_HippyNotImplementedException(SEL, Class); \
method NS_UNAVAILABLE { @throw _HippyNotImplementedException(_cmd, [self class]); } \
_Pragma("clang diagnostic pop")
