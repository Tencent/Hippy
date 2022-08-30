/*
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#import <objc/message.h>
#import <objc/runtime.h>
#import "VoltronUtils.h"
#import "VoltronLog.h"

NSString *const VoltronErrorDomain = @"VoltronErrorDomain";
NSString *const VoltronJSStackTraceKey = @"VoltronJSStackTraceKey";

static id __nullable _VoltronJSONParse(NSString *__nullable jsonString, BOOL mutable, NSError **error) {
    static SEL JSONKitSelector = NULL;
    static SEL JSONKitMutableSelector = NULL;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        SEL selector = NSSelectorFromString(@"objectFromJSONStringWithParseOptions:error:");
        if ([NSString instancesRespondToSelector:selector]) {
            JSONKitSelector = selector;
            JSONKitMutableSelector = NSSelectorFromString(@"mutableObjectFromJSONStringWithParseOptions:error:");
        }
    });

    if (jsonString) {
        // Use JSONKit if available and string is not a fragment
        if (JSONKitSelector) {
            NSInteger length = jsonString.length;
            for (NSInteger i = 0; i < length; i++) {
                unichar c = [jsonString characterAtIndex:i];
                if (strchr("{[", c)) {
                    static const int options = (1 << 2);  // loose unicode
                    SEL selector = mutable ? JSONKitMutableSelector : JSONKitSelector;
                    return ((id(*)(id, SEL, int, NSError **))objc_msgSend)(jsonString, selector, options, error);
                }
                if (!strchr(" \r\n\t", c)) {
                    break;
                }
            }
        }

        // Use Foundation JSON method
        NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
        if (!jsonData) {
            jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding allowLossyConversion:YES];
            if (jsonData) {
                VoltronLogWarn(@"HippyJSONParse received the following string, which could "
                              "not be losslessly converted to UTF8 data: '%@'",
                    jsonString);
            } else {
                NSString *errorMessage = @"HippyJSONParse received invalid UTF8 data";
                if (error) {
                    *error = VoltronErrorWithMessage(errorMessage);
                } else {
                    VoltronLogError(@"%@", errorMessage);
                }
                return nil;
            }
        }
        NSJSONReadingOptions options = NSJSONReadingAllowFragments;
        if (mutable) {
            options |= NSJSONReadingMutableContainers;
        }
        return [NSJSONSerialization JSONObjectWithData:jsonData options:options error:error];
    }
    return nil;
}

void VoltronExecuteOnMainQueue(dispatch_block_t block)
{
    if (VoltronIsMainQueue()) {
        block();
    } else {
        dispatch_async(dispatch_get_main_queue(), block);
    }
}

BOOL VoltronIsMainQueue()
{
    static void *mainQueueKey = &mainQueueKey;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        dispatch_queue_set_specific(dispatch_get_main_queue(),
                                    mainQueueKey, mainQueueKey, NULL);
    });
    return dispatch_get_specific(mainQueueKey) == mainQueueKey;
}

NSError *VoltronErrorWithMessage(NSString *message)
{
    NSDictionary<NSString *, id> *errorInfo = @{NSLocalizedDescriptionKey: message};
    return [[NSError alloc] initWithDomain:VoltronErrorDomain code:0 userInfo:errorInfo];
}

NSError *VoltronNSErrorFromJSError(JSValue *exception)
{
  NSMutableDictionary *userInfo = [NSMutableDictionary dictionary];
  userInfo[NSLocalizedDescriptionKey] = [NSString stringWithFormat:@"Unhandled JS Exception: %@", [exception[@"name"] toString] ?: @"Unknown"];
  NSString *const exceptionMessage = [exception[@"message"] toString];
  if ([exceptionMessage length]) {
    userInfo[NSLocalizedFailureReasonErrorKey] = exceptionMessage;
  }
  NSString *const stack = [exception[@"stack"] toString];
  if ([stack length]) {
    userInfo[VoltronJSStackTraceKey] = stack;
  }
  return [NSError errorWithDomain:VoltronErrorDomain code:1 userInfo:userInfo];
}

NSError *VoltronNSErrorFromJSErrorRef(JSValueRef exceptionRef, JSGlobalContextRef ctx)
{
    JSContext *context = [JSContext contextWithJSGlobalContextRef:ctx];
    JSValue *exception = [JSValue valueWithJSValueRef:exceptionRef inContext:context];
    return VoltronNSErrorFromJSError(exception);
}

NSException *_HippyNotImplementedException(SEL, Class);
NSException *_HippyNotImplementedException(SEL cmd, Class cls)
{
    NSString *msg = [NSString stringWithFormat:@"%s is not implemented "
                     "for the class %@", sel_getName(cmd), cls];
    return [NSException exceptionWithName:@"HippyNotDesignatedInitializerException"
                                   reason:msg userInfo:nil];
}

id __nullable VoltronJSONParse(NSString *__nullable jsonString, NSError **error) {
    return _VoltronJSONParse(jsonString, NO, error);
}

id __nullable VoltronJSONParseMutable(NSString *__nullable jsonString, NSError **error) {
    return _VoltronJSONParse(jsonString, YES, error);
}

@implementation VoltronUtils

@end
