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

#import <Foundation/Foundation.h>

#import "HippyDefines.h"

NS_ASSUME_NONNULL_BEGIN

// JSON serialization/deserialization
HIPPY_EXTERN NSString *__nullable HippyJSONStringify(id __nullable jsonObject, NSError **error);
HIPPY_EXTERN id __nullable HippyJSONParse(NSString *__nullable jsonString, NSError **error);
HIPPY_EXTERN id __nullable HippyJSONParseMutable(NSString *__nullable jsonString, NSError **error);

// Sanitize a JSON object by stripping invalid types and/or NaN values
HIPPY_EXTERN id HippyJSONClean(id object);

// Get MD5 hash of a string
HIPPY_EXTERN NSString *HPMD5Hash(NSString *string);

// Creates a standardized error object to return in callbacks
HIPPY_EXTERN NSDictionary<NSString *, id> *HippyMakeError(
    NSString *message, id __nullable toStringify, NSDictionary<NSString *, id> *__nullable extraData);
HIPPY_EXTERN NSDictionary<NSString *, id> *HippyMakeAndLogError(
    NSString *message, id __nullable toStringify, NSDictionary<NSString *, id> *__nullable extraData);
HIPPY_EXTERN NSDictionary<NSString *, id> *HippyJSErrorFromNSError(NSError *error);
HIPPY_EXTERN NSDictionary<NSString *, id> *HippyJSErrorFromCodeMessageAndNSError(NSString *code, NSString *message, NSError *__nullable error);

// The default error code to use as the `code` property for callback error objects
HIPPY_EXTERN NSString *const HippyErrorUnspecified;

NS_ASSUME_NONNULL_END
