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

#import <Foundation/Foundation.h>
#import "VoltronDefines.h"
#import <JavaScriptCore/JavaScriptCore.h>
#import "VoltronJSCWrapper.h"

/**
 * The default error domain to be used for Hippy errors.
 */
VOLTRON_EXTERN NSString *const VoltronErrorDomain;
VOLTRON_EXTERN NSString *const VoltronJSStackTraceKey;

VOLTRON_EXTERN id __nullable VoltronJSONParse(NSString *__nullable jsonString, NSError **error);
VOLTRON_EXTERN id __nullable VoltronJSONParseMutable(NSString *__nullable jsonString, NSError **error);

VOLTRON_EXTERN void VoltronExecuteOnMainQueue(dispatch_block_t block);
VOLTRON_EXTERN BOOL VoltronIsMainQueue(void);

VOLTRON_EXTERN NSError *VoltronErrorWithMessage(NSString *message);
VOLTRON_EXTERN NSError *VoltronNSErrorFromJSError(JSValue *exception);
VOLTRON_EXTERN NSError *VoltronNSErrorFromJSErrorRef(JSValueRef exception, JSGlobalContextRef ctx);

// Convert nil values to NSNull, and vice-versa
#define VoltronNullIfNil(value) (value ?: (id)kCFNull)
#define VoltronNilIfNull(value) (value == (id)kCFNull ? nil : value)

NS_ASSUME_NONNULL_BEGIN

@interface VoltronUtils : NSObject

@end

NS_ASSUME_NONNULL_END
