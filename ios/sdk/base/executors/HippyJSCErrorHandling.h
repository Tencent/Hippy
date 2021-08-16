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

#import "HippyDefines.h"

typedef struct HippyJSCWrapper HippyJSCWrapper;

/**
 Translates a given exception into an NSError.

 @param exception The JavaScript exception object to translate into an NSError. This must be
 a JavaScript Error object, otherwise no stack trace information will be available.

 @return The translated NSError object

 - The JS exception's name property is incorporated in the NSError's localized description
 - The JS exception's message property is the NSError's failure reason
 - The JS exception's unsymbolicated stack trace is available via the NSError userInfo's HippyJSExceptionUnsymbolicatedStackTraceKey
 */
HIPPY_EXTERN NSError *HippyNSErrorFromJSError(JSValue *exception);

/**
 Translates a given exception into an NSError.

 @see HippyNSErrorFromJSError for details
 */
HIPPY_EXTERN NSError *HippyNSErrorFromJSErrorRef(JSValueRef exception, JSGlobalContextRef ctx);
