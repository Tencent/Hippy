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
#import "driver/napi/js_native_api_types.h"
#import "HippyDefines.h"

NS_ASSUME_NONNULL_BEGIN

using CtxValuePtr = std::shared_ptr<hippy::napi::CtxValue>;
using CtxPtr = std::shared_ptr<hippy::napi::Ctx>;

@interface NSObject (CtxValue)

- (CtxValuePtr)convertToCtxValue:(const CtxPtr &)context;

@end

@interface NSString (CtxValue)

@end

@interface NSNumber (CtxValue)

@end

@interface NSArray (CtxValue)

@end

@interface NSDictionary (CtxValue)

@end

@interface NSData (CtxValue)

@end

@interface NSNull (CtxValue)

@end

HIPPY_EXTERN id ObjectFromCtxValue(CtxPtr context, CtxValuePtr value);

NS_ASSUME_NONNULL_END
