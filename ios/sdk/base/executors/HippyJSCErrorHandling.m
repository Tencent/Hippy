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

#include "HippyJSCErrorHandling.h"

#import "HippyAssert.h"
#import "HippyJSStackFrame.h"
#import "HippyJSCWrapper.h"

NSError *HippyNSErrorFromJSError(JSValue *exception) {
    NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
    userInfo[NSLocalizedDescriptionKey] = [NSString stringWithFormat:@"Unhandled JS Exception: %@", [exception[@"name"] toString] ?: @"Unknown"];
    NSString *const exceptionMessage = [exception[@"message"] toString];
    if ([exceptionMessage length]) {
        userInfo[NSLocalizedFailureReasonErrorKey] = exceptionMessage;
    }
    NSString *const stack = [exception[@"stack"] toString];
    if ([stack length]) {
        NSArray<HippyJSStackFrame *> *const unsymbolicatedFrames = [HippyJSStackFrame stackFramesWithLines:stack];
        userInfo[HippyJSStackTraceKey] = unsymbolicatedFrames;
    }
    return [NSError errorWithDomain:HippyErrorDomain code:1 userInfo:userInfo];
}

NSError *HippyNSErrorFromJSErrorRef(JSValueRef exceptionRef, JSGlobalContextRef ctx) {
    JSContext *context = [JSContext contextWithJSGlobalContextRef:ctx];
    JSValue *exception = [JSValue valueWithJSValueRef:exceptionRef inContext:context];
    return HippyNSErrorFromJSError(exception);
}
