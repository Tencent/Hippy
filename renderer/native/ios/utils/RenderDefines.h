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

#ifndef RenderDefines_h_h
#define RenderDefines_h_h

#if __OBJC__
#import <Foundation/Foundation.h>
#endif //#if __OBJC__

#if defined(__cplusplus)
#define RENDER_EXTERN extern "C" __attribute__((visibility("default")))
#else
#define RENDER_EXTERN extern __attribute__((visibility("default")))
#endif //#if defined(__cplusplus)

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

#endif /* RenderDefines_h_h */
