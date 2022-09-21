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
#include "driver/napi/v8/js_native_api_v8.h"
#import "HippyDefines.h"

NS_ASSUME_NONNULL_BEGIN

@interface NSObject (V8Value)

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context;

@end

@interface NSArray (V8Value)

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context;

@end

@interface NSDictionary (V8Value)

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context;

@end

@interface NSData (V8Value)

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context;

@end

@interface NSString (V8Value)

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context;
- (v8::Local<v8::String>)toV8StringInIsolate:(v8::Isolate *)isolate;

@end

@interface NSNumber (V8Value)

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context;

@end

@interface NSNull (V8Value)

- (v8::Local<v8::Value>)toV8ValueInIsolate:(v8::Isolate *)isolate context:(v8::Local<v8::Context>)context;

@end

HIPPY_EXTERN id ObjectFromV8Value(v8::Local<v8::Value> value, v8::Isolate *isolate, v8::Local<v8::Context> context);

HIPPY_EXTERN NSString *TryToFetchStringFromV8Value(v8::Local<v8::Value> value, v8::Isolate *isolate);

NS_ASSUME_NONNULL_END
