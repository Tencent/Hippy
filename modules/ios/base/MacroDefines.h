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

#if __OBJC__
#import <Foundation/Foundation.h>
#endif

/**
 * Make global functions usable in C++
 */
#if defined(__cplusplus)
#define HP_EXTERN extern "C" __attribute__((visibility("default")))
#else
#define HP_EXTERN extern __attribute__((visibility("default")))
#endif

/**
 * The HP_DEBUG macro can be used to exclude error checking and logging code
 * from release builds to improve performance and reduce binary size.
 */
#ifndef HP_DEBUG
#ifdef DEBUG
#define HP_DEBUG 1
#else
#define HP_DEBUG 0
#endif  //#ifdef DEBUG
#endif  //#ifndef HP_DEBUG

/**
 * The HP_DEV macro can be used to enable or disable development tools
 * such as the debug executors, dev menu, red box, etc.
 */
#ifndef HP_DEV
#ifdef DEBUG
#define HP_DEV 1
#else
#define HP_DEV 0
#endif //#ifdef DEBUG
#endif //#ifndef HP_DEV

#ifndef HP_NSASSERT
#define HP_NSASSERT HP_DEBUG
#endif //#ifndef HIPPY_NSASSERT

/**
 * Concat two literals. Supports macro expansions,
 * e.g. HP_CONCAT(foo, __FILE__).
 */
#define HP_CONCAT2(A, B) A##B
#define HP_CONCAT(A, B) HP_CONCAT2(A, B)
