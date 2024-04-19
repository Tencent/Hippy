/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * HP available.
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

#ifndef __HIPPY_DEFINES__
#define __HIPPY_DEFINES__

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
#endif  //#ifdef DEBUG
#endif  //#ifndef HIPPY_DEBUG

/**
 * The HIPPY_DEV macro can be used to enable or disable development tools
 * such as the debug executors, dev menu, red box, etc.
 */
#ifndef HIPPY_DEV
#ifdef DEBUG
#define HIPPY_DEV 1
#else
#define HIPPY_DEV 0
#endif //#ifdef DEBUG
#endif //#ifndef HIPPY_DEV

/**
 * Concat two literals. Supports macro expansions,
 * e.g. HIPPY_CONCAT(foo, __FILE__).
 */
#define HIPPY_CONCAT2(A, B) A##B
#define HIPPY_CONCAT(A, B) HIPPY_CONCAT2(A, B)

/**
 * Convert number macro to string
 */
#define HIPPY_STR(x) HIPPY_STR_EXPAND(x)
#define HIPPY_STR_EXPAND(x) #x

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


#pragma mark - Clang Warnings

// warning list ref:https://clang.llvm.org/docs/DiagnosticsReference.html
#define HIPPY_CLANG_WARN_CONCAT(warning_name) HIPPY_STR_EXPAND(clang diagnostic ignored warning_name)
#define HIPPY_IGNORE_WARNING_BEGIN(warningName) _Pragma("clang diagnostic push") _Pragma(HIPPY_CLANG_WARN_CONCAT(#warningName))
#define HIPPY_IGNORE_WARNING_END _Pragma("clang diagnostic pop")


#pragma mark -

#define HIPPY_VERSION_3_0      300


#endif /* __HIPPY_DEFINES__ */
