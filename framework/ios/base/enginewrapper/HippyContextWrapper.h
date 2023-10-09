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

#include <memory>

#include "driver/napi/js_ctx.h"
#include "driver/napi/js_ctx_value.h"

NS_ASSUME_NONNULL_BEGIN

namespace hippy {
inline namespace driver {
inline namespace napi {
class Ctx;
class CtxValue;
}
}
}

@class HippyJSStackFrame;

typedef id __nullable (^FunctionImplementationBlock)(NSArray *arguments);

@protocol HippyContextWrapper <NSObject>

typedef void (^ExceptionHandler)(id<HippyContextWrapper>wrapper, NSString *message, NSArray<HippyJSStackFrame *> *stackFrames);

@required

@property(nonatomic, readonly)std::weak_ptr<hippy::napi::Ctx> underlyingContext;
@property(nonatomic, copy)ExceptionHandler excpetionHandler;

@property(nonatomic, readonly)NSString *exception;

- (instancetype)initWithContext:(std::weak_ptr<hippy::napi::Ctx>)context;

- (BOOL)createGlobalObject:(NSString *)name withValue:(NSString *)value;
- (BOOL)createGlobalObject:(NSString *)name withJsonValue:(NSString *)value;
- (BOOL)createGlobalObject:(NSString *)name withDictionary:(NSDictionary *)value;

- (id)globalObjectForName:(NSString *)name;
- (std::shared_ptr<hippy::napi::CtxValue>)globalJSValueForName:(NSString *)name;
- (BOOL)setProperties:(NSDictionary *)properties toGlobalObject:(NSString *)objectName;
- (BOOL)setProperty:(NSString *)propertyName
         forJSValue:(std::shared_ptr<hippy::napi::CtxValue>)value
         toJSObject:(std::shared_ptr<hippy::napi::CtxValue>)object;
- (std::shared_ptr<hippy::napi::CtxValue>)property:(NSString *)propertyName
                                       forJSObject:(std::shared_ptr<hippy::napi::CtxValue>)object;

- (void)registerFunction:(NSString *)funcName implementation:(FunctionImplementationBlock)implementation;
- (id)callFunction:(NSString *)funcName arguments:(NSArray *)arguments;

- (id)runScript:(NSString *)script sourceURL:(NSURL *)sourceURL useCachedCode:(BOOL)useCachedCode cachedCodeData:(inout NSData *_Nullable *_Nullable)data;

- (std::shared_ptr<hippy::napi::CtxValue>)createNumber:(NSNumber *)number;
- (std::shared_ptr<hippy::napi::CtxValue>)createBool:(NSNumber *)number;
- (std::shared_ptr<hippy::napi::CtxValue>)createString:(NSString *)string;
- (std::shared_ptr<hippy::napi::CtxValue>)createUndefined;
- (std::shared_ptr<hippy::napi::CtxValue>)createNull;
- (std::shared_ptr<hippy::napi::CtxValue>)createObject:(NSDictionary *)dictionary;
- (std::shared_ptr<hippy::napi::CtxValue>)createObjectFromJsonString:(NSString *)JsonString;
- (std::shared_ptr<hippy::napi::CtxValue>)createArray:(NSArray *)array;
- (std::shared_ptr<hippy::napi::CtxValue>)createException:(NSString *)description;

- (void)setContextName:(NSString *)name;

@end

id<HippyContextWrapper> CreateContextWrapper(std::shared_ptr<hippy::napi::Ctx>);

NS_ASSUME_NONNULL_END
