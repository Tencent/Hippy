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

/**
 Copyright (c) 2014-present, Facebook, Inc.
 All rights reserved.
 
 This source code is licensed under the BSD-style license found in the
 LICENSE file in the root directory of this source tree. An additional grant
 of patent rights can be found in the PATENTS file in the same directory.
 */

#ifndef HPOP_POPDefines_h
#define HPOP_POPDefines_h

#import <Availability.h>

#ifdef __cplusplus
# define POP_EXTERN_C_BEGIN extern "C" {
# define POP_EXTERN_C_END   }
#else
# define POP_EXTERN_C_BEGIN
# define POP_EXTERN_C_END
#endif

#define POP_ARRAY_COUNT(x) sizeof(x) / sizeof(x[0])

#if defined (__cplusplus) && defined (__GNUC__)
# define POP_NOTHROW __attribute__ ((nothrow))
#else
# define POP_NOTHROW
#endif

#if defined(POP_USE_SCENEKIT)
# if TARGET_OS_MAC || TARGET_OS_IPHONE
#  define SCENEKIT_SDK_AVAILABLE 1
# endif
#endif


#define HPOP_CODE_TRIM  0 // 0 means trim unused code to reduce size

#endif
