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
#define NATIVE_RENDER_EXTERN extern "C" __attribute__((visibility("default")))
#else   //#if defined(__cplusplus)
#define NATIVE_RENDER_EXTERN extern __attribute__((visibility("default")))
#endif  //#if defined(__cplusplus)

/**
 * The NATIVE_RENDER_DEBUG macro can be used to exclude error checking and logging code
 * from release builds to improve performance and reduce binary size.
 */
#ifndef NATIVE_RENDER_DEBUG
#ifdef DEBUG
#define NATIVE_RENDER_DEBUG 1
#else   //#ifdef DEBUG
#define NATIVE_RENDER_DEBUG 0
#endif  //#ifdef DEBUG
#endif  //#ifndef NATIVE_RENDER_DEBUG

/**
 * Concat two literals. Supports macro expansions,
 * e.g. NATIVE_RENDER_CONCAT(foo, __FILE__).
 */
#define NATIVE_RENDER_CONCAT2(A, B) A##B
#define NATIVE_RENDER_CONCAT(A, B) NATIVE_RENDER_CONCAT2(A, B)
