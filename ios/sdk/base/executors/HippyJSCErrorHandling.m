/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#include "HippyJSCErrorHandling.h"

#import "HippyAssert.h"
#import "HippyJSStackFrame.h"
#import "HippyJSCWrapper.h"

NSError *HippyNSErrorFromJSError(JSValue *exception)
{
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

NSError *HippyNSErrorFromJSErrorRef(JSValueRef exceptionRef, JSGlobalContextRef ctx, HippyJSCWrapper *jscWrapper)
{
  JSContext *context = [jscWrapper->JSContext contextWithJSGlobalContextRef:ctx];
  JSValue *exception = [jscWrapper->JSValue valueWithJSValueRef:exceptionRef inContext:context];
  return HippyNSErrorFromJSError(exception);
}
