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

#include "jsi/jsi.h"
#include "hermes/hermes.h"

NS_ASSUME_NONNULL_BEGIN

@interface NSObject (HermesValue)

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime;

@end

@interface NSArray (HermesValue)

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime;

@end

@interface NSDictionary (HermesValue)

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime;

@end

@interface NSData (HermesValue)

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime;

@end

@interface NSString (HermesValue)

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime;

- (facebook::jsi::Value)toHermesStringInRuntime:(facebook::jsi::Runtime&)runtime;

@end

@interface NSNumber (HermesValue)

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime;

@end

@interface NSNull (HermesValue)

- (facebook::jsi::Value)toHermesValueInRuntime:(facebook::jsi::Runtime&)runtime;

@end

HIPPY_EXTERN id ObjectFromHermesValue(facebook::jsi::Runtime& runtime, facebook::jsi::Value& value);

// HIPPY_EXTERN NSString *TryToFetchStringFromV8Value(std::shared_ptr<ctx::HermesCtxValue> value, HermesRuntime *isolate);

NS_ASSUME_NONNULL_END
