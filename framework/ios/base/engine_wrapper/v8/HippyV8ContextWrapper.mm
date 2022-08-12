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

#import "HippyV8ContextWrapper.h"
#import "HippyAssert.h"
#import "HippyAssert.h"
#import "NSObject+CtxValue.h"
#import "NativeRenderLog.h"
#import "NSObject+V8Value.h"
#include <memory.h>
#include "driver/napi/v8/js_native_api_v8.h"

static id StringJSONToObject(NSString *string) {
    @autoreleasepool {
        NSData *data = [string dataUsingEncoding:NSUTF8StringEncoding];
        id obj = [NSJSONSerialization JSONObjectWithData:data options:(0) error:nil];
        return obj;
    }
}

static v8::Local<v8::Value> V8ValueFromCtxValue(const std::shared_ptr<hippy::napi::CtxValue> &value) {
    auto ctxValue = std::static_pointer_cast<hippy::napi::V8CtxValue>(value);
    v8::Local<v8::Value> v8Value = ctxValue->global_value_.Get(ctxValue->isolate_);
    return v8Value;
}

static v8::Local<v8::Object> V8ObjectFromCtxValue(const std::shared_ptr<hippy::napi::CtxValue> &value,
                                                       v8::Local<v8::Context> context) {
    auto ctxValue = std::static_pointer_cast<hippy::napi::V8CtxValue>(value);
    v8::Local<v8::Value> v8Value = ctxValue->global_value_.Get(ctxValue->isolate_);
    HippyAssert(v8Value->IsObject(), @"value is not a object");
    v8::MaybeLocal<v8::Object> maybeObject = v8Value->ToObject(context);
    HippyAssert(!maybeObject.IsEmpty(), @"maybe object is not a object");
    return maybeObject.ToLocalChecked();
}

@interface HippyV8ContextWrapper () {
    std::weak_ptr<hippy::napi::V8Ctx> _v8Context;
    v8::Isolate *_ioslate;
    NSMutableDictionary *_blockDic;
    NSString *_exception;
}

@end

@implementation HippyV8ContextWrapper

- (instancetype)initWithContext:(std::weak_ptr<hippy::napi::Ctx>)context {
    self = [super init];
    if (self) {
        @autoreleasepool {
            _v8Context = std::static_pointer_cast<hippy::napi::V8Ctx>(context.lock());
            _blockDic = [NSMutableDictionary dictionaryWithCapacity:8];
        }
    }
    return self;
}

- (std::weak_ptr<hippy::napi::Ctx>)underlyingContext {
    return _v8Context;
}

- (NSString *)exception {
    return _exception;
}

- (BOOL)createGlobalObject:(NSString *)name withValue:(NSString *)value {
    if (!name || !value) {
        _exception = @"name or value nil for createGlobalObject:withvalue:";
        return NO;
    }
    auto context = _v8Context.lock();
    if (!context) {
        _exception = @"context null for createGlobalObject:withvalue:";
        return NO;
    }
    v8::HandleScope handleScope(context->isolate_);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(context->isolate_);
    v8::Context::Scope contextScope(localContext);
    v8::Local<v8::Object> globalObject = localContext->Global();
    v8::TryCatch tryCache(context->isolate_);
    v8::Local<v8::String> v8Name = [name toV8StringInIsolate:context->isolate_];
    v8::Local<v8::String> v8Value = [value toV8StringInIsolate:context->isolate_];
    BOOL result = globalObject->Set(localContext, v8Name, v8Value).FromMaybe(false);
    if (tryCache.HasCaught()) {
        _exception = TryToFetchStringFromV8Value(tryCache.Exception(), context->isolate_);
    }
    return result;
}

- (BOOL)createGlobalObject:(NSString *)name withJsonValue:(NSString *)value {
    if (!name || !value) {
        _exception = @"name or value nil for createGlobalObject:withJsonValue:";
        return NO;
    }
    auto context = _v8Context.lock();
    if (!context) {
        _exception = @"context null for createGlobalObject:withJsonValue:";
        return NO;
    }
    v8::HandleScope handleScope(context->isolate_);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(context->isolate_);
    v8::Context::Scope contextScope(localContext);
    v8::Local<v8::Object> globalObject = localContext->Global();
    v8::TryCatch tryCache(context->isolate_);
    v8::Local<v8::String> v8Name = [name toV8StringInIsolate:context->isolate_];
    v8::MaybeLocal<v8::Value> jsonValue = v8::JSON::Parse(localContext, [value toV8StringInIsolate:context->isolate_]);
    if (jsonValue.IsEmpty()) {
        if (tryCache.HasCaught()) {
            _exception = TryToFetchStringFromV8Value(tryCache.Exception(), context->isolate_);
        }
        return NO;
    }
    BOOL ret = globalObject->Set(localContext, v8Name, jsonValue.ToLocalChecked()).FromMaybe(false);
    return ret;
}

- (BOOL)createGlobalObject:(NSString *)name withDictionary:(NSDictionary *)value {
    if (!name || !value) {
        _exception = @"name or value nil for createGlobalObject:withDictionary:";
        return NO;
    }
    auto context = _v8Context.lock();
    if (!context) {
        _exception = @"context null for createGlobalObject:withDictionary:";
        return NO;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    v8::Local<v8::Object> globalObject = localContext->Global();
    v8::TryCatch tryCache(isolate);
    v8::Local<v8::String> v8Name = [name toV8StringInIsolate:context->isolate_];
    v8::Local<v8::Value> map = [value toV8ValueInIsolate:isolate context:localContext];
    BOOL result = globalObject->Set(localContext, v8Name, map).FromMaybe(false);
    if (tryCache.HasCaught()) {
        _exception = TryToFetchStringFromV8Value(tryCache.Exception(), context->isolate_);
    }
    return result;
}

- (id)globalObjectForName:(NSString *)name {
    if (!name) {
        _exception = @"name nil for globalObjectForName:";
        return nullptr;
    }
    auto context = _v8Context.lock();
    if (!context) {
        _exception = @"context null for globalObjectForName:";
        return nullptr;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    v8::Local<v8::Object> globalObject = localContext->Global();
    v8::TryCatch tryCache(isolate);
    v8::Local<v8::String> v8Name = [name toV8StringInIsolate:context->isolate_];
    v8::MaybeLocal<v8::Value> mayBeValue = globalObject->Get(localContext, v8Name);
    if (mayBeValue.IsEmpty()) {
        if (tryCache.HasCaught()) {
            _exception = TryToFetchStringFromV8Value(tryCache.Exception(), isolate);
        }
        return nil;
    }
    v8::Local<v8::Value> value = mayBeValue.ToLocalChecked();
    return ObjectFromV8Value(value, isolate, localContext);
}

- (std::shared_ptr<hippy::napi::CtxValue>)globalJSValueForName:(NSString *)name {
    if (!name) {
        _exception = @"name nil for globalJSValueForName:";
        return nullptr;
    }
    auto context = _v8Context.lock();
    if (!context) {
        _exception = @"context null for globalJSValueForName:";
        return nullptr;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    v8::Local<v8::Object> globalObject = localContext->Global();
    v8::TryCatch tryCache(isolate);
    v8::Local<v8::String> v8Name = [name toV8StringInIsolate:context->isolate_];
    v8::MaybeLocal<v8::Value> mayBeValue = globalObject->Get(localContext, v8Name);
    if (mayBeValue.IsEmpty()) {
        if (tryCache.HasCaught()) {
            _exception = TryToFetchStringFromV8Value(tryCache.Exception(), isolate);
        }
        return nil;
    }
    v8::Local<v8::Value> value = mayBeValue.ToLocalChecked();
    auto ctxValue = std::make_shared<hippy::napi::V8CtxValue>(isolate, value);
    return ctxValue;
}

- (BOOL)setProperties:(NSDictionary *)properties toGlobalObject:(NSString *)objectName {
    if (!objectName) {
        _exception = @"properties or objectName nil for setProperties:toGlobalObject:";
        return NO;
    }
    auto context = _v8Context.lock();
    if (!context) {
        _exception = @"context null for setProperties:toGlobalObject:";
        return NO;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    v8::TryCatch tryCache(isolate);
    v8::Local<v8::String> v8Name = [objectName toV8StringInIsolate:isolate];
    v8::MaybeLocal<v8::Value> maybeTagetValue = localContext->Global()->Get(localContext, v8Name);
    if (maybeTagetValue.IsEmpty()) {
        if (tryCache.HasCaught()) {
            _exception = TryToFetchStringFromV8Value(tryCache.Exception(), isolate);
        }
        return NO;
    }
    v8::Local<v8::Value> value = maybeTagetValue.ToLocalChecked();
    if (!value->IsObject()) {
        _exception = @"value is not object";
        return NO;
    }
    v8::MaybeLocal<v8::Object> maybeObject = value->ToObject(localContext);
    if (maybeObject.IsEmpty()) {
        _exception = @"maybeObject is empty";
        return NO;
    }
    v8::Local<v8::Object> targetObject = maybeObject.ToLocalChecked();
    for (NSString *key in properties) {
        id object = [properties objectForKey:key];
        v8::TryCatch tryCache(isolate);
        v8::Local<v8::String> keyString = [key toV8StringInIsolate:isolate];
        v8::Local<v8::Value> localValue = [object toV8ValueInIsolate:isolate context:localContext];
        if (!targetObject->Set(localContext, keyString, localValue).FromMaybe(false)) {
            NativeRenderLogWarn(@"createGlobalObject withDictionary failed, key:%@, value:%@", key, object);
        }
        if (tryCache.HasCaught()) {
            _exception = TryToFetchStringFromV8Value(tryCache.Exception(), isolate);
        }
    }
    return YES;
}

- (BOOL)setProperty:(NSString *)propertyName
         forJSValue:(std::shared_ptr<hippy::napi::CtxValue>)value
         toJSObject:(std::shared_ptr<hippy::napi::CtxValue>)object {
    if (!propertyName || !value || !object) {
        _exception = @"propertyName or value or object nil for setProperty:forJSValue::toJSObject";
        return NO;
    }
    auto context = _v8Context.lock();
    if (!context) {
        _exception = @"propertyName or value or object nil for setProperty:forJSValue::toJSObject";
        return NO;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    v8::Local<v8::String> v8Name = [propertyName toV8StringInIsolate:isolate];
    v8::Local<v8::Object> targetObject = V8ObjectFromCtxValue(object, localContext);
    v8::Local<v8::Value> targetValue = V8ValueFromCtxValue(value);
    v8::TryCatch tryCache(isolate);
    BOOL ret = targetObject->Set(localContext, v8Name, targetValue).FromMaybe(false);
    if (tryCache.HasCaught()) {
        _exception = TryToFetchStringFromV8Value(tryCache.Exception(), isolate);
    }
    return ret;
}

- (std::shared_ptr<hippy::napi::CtxValue>)property:(NSString *)propertyName
                                       forJSObject:(std::shared_ptr<hippy::napi::CtxValue>)object {
    if (!propertyName || !object) {
        _exception = @"property or object nil for property:forJSObject:";
        return nullptr;
    }
    auto context = _v8Context.lock();
    if (!context) {
        return nullptr;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    v8::Local<v8::Object> targetObject = V8ObjectFromCtxValue(object, localContext);
    v8::Local<v8::String> v8Name = [propertyName toV8StringInIsolate:isolate];
    v8::MaybeLocal<v8::Value> maybeValue = targetObject->Get(localContext, v8Name);
    if (maybeValue.IsEmpty()) {
        NativeRenderLogWarn(@"get property %@ for object failed", propertyName);
        return nullptr;
    }
    v8::Local<v8::Value> value = maybeValue.ToLocalChecked();
    return std::make_shared<hippy::napi::V8CtxValue>(isolate, value);
}

static void NativeCallbackFuncWithValue(const v8::FunctionCallbackInfo<v8::Value>& info) {
    v8::Local<v8::External> data = info.Data().As<v8::External>();
    if (data.IsEmpty()) {
      info.GetReturnValue().SetUndefined();
      return;
    }
    FunctionImplementationBlock block = (__bridge FunctionImplementationBlock)data->Value();
    if (!block) {
        info.GetReturnValue().SetUndefined();
        return;
    }
    NSMutableArray *argumentsArray = [NSMutableArray arrayWithCapacity:info.Length()];
    v8::Isolate *isolate = info.GetIsolate();
    v8::Local<v8::Context> context = isolate->GetCurrentContext();
    for (int index = 0; index < info.Length(); index++) {
        v8::Local<v8::Value> infoArgu = info[index];
        id object = ObjectFromV8Value(infoArgu, info.GetIsolate(), info.GetIsolate()->GetCurrentContext());
        [argumentsArray addObject:object];
    }
    id result = block([argumentsArray copy]);
    if (!result) {
        info.GetReturnValue().SetUndefined();
    }
    v8::Local<v8::Value> resultValue = [result toV8ValueInIsolate:isolate context:context];
    info.GetReturnValue().Set(resultValue);
}

- (void)registerFunction:(NSString *)funcName implementation:(FunctionImplementationBlock)implementation {
    if (!funcName || !implementation) {
        _exception = @"funcName or implementation nil for registerFunction:implementation:";
        return;
    }
    auto context = _v8Context.lock();
    if (!context) {
        _exception = @"context null for funcName:implementation:";
        return;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    
    id blockCallback = [implementation copy];
    [_blockDic setObject:blockCallback forKey:funcName];
    void *callbackData = (__bridge void *)blockCallback;
    v8::Local<v8::External> external = v8::External::New(isolate, callbackData);
    v8::Local<v8::FunctionTemplate> funcTemplate = v8::FunctionTemplate::New(isolate, NativeCallbackFuncWithValue, external);
    funcTemplate->RemovePrototype();
    v8::Local<v8::String> v8funcName = [funcName toV8StringInIsolate:isolate];
    v8::TryCatch tryCache(isolate);
    localContext->Global()->Set(localContext, v8funcName, funcTemplate->GetFunction(localContext).ToLocalChecked()).Check();
    if (tryCache.HasCaught()) {
        _exception = TryToFetchStringFromV8Value(tryCache.Exception(), isolate);
    }
}

- (id)callFunction:(NSString *)funcName arguments:(NSArray *)arguments {
    if (!funcName) {
        _exception = @"funcName null for callFunction:arguments:";
        return nil;
    }
    auto context = _v8Context.lock();
    if (!context) {
        _exception = [NSString stringWithFormat:@"context null for function %@ invoke", funcName];
        return nil;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    v8::TryCatch tryCache(isolate);
    v8::MaybeLocal<v8::Value> maybeBatchedBridgeObject =
        localContext->Global()->Get(localContext, [@"__fbBatchedBridge" toV8StringInIsolate:isolate]);
    if (maybeBatchedBridgeObject.IsEmpty()) {
        return nil;
    }
    v8::Local<v8::Object> batchedBridgeObject = maybeBatchedBridgeObject.ToLocalChecked().As<v8::Object>();
    v8::Local<v8::String> v8Name = [funcName toV8StringInIsolate:isolate];
    v8::MaybeLocal<v8::Value> maybeFuncValue = batchedBridgeObject->Get(localContext, v8Name);
    if (maybeFuncValue.IsEmpty()) {
        if (tryCache.HasCaught()) {
            _exception = TryToFetchStringFromV8Value(tryCache.Exception(), isolate);
        }
        return nil;
    }
    v8::Local<v8::Value> funcValue = maybeFuncValue.ToLocalChecked();
    if (!funcValue->IsFunction()) {
        if (tryCache.HasCaught()) {
            _exception = TryToFetchStringFromV8Value(tryCache.Exception(), isolate);
        }
        return nil;
    }
    v8::Local<v8::Function> function = funcValue.As<v8::Function>();
    int count = (int)[arguments count];
    v8::Local<v8::Value> args[count];
    for (size_t i = 0; i < count; i++) {
        id obj = arguments[i];
        args[i] = [obj toV8ValueInIsolate:isolate context:localContext];
    }
    v8::MaybeLocal<v8::Value> maybeResult = function->Call(localContext, localContext->Global(), count, args);
    if (maybeResult.IsEmpty()) {
        if (tryCache.HasCaught()) {
            _exception = TryToFetchStringFromV8Value(tryCache.Exception(), isolate);
        }
        return nil;
    }
    v8::Local<v8::Value> result = maybeResult.ToLocalChecked();
    return ObjectFromV8Value(result, isolate, localContext);
}

- (id)runScript:(NSString *)script sourceURL:(NSURL *)sourceURL {
    if (!script) {
        _exception = @"script must not be null for runScript:sourceURL:";
        return nil;
    }
    auto context = _v8Context.lock();
    if (!context) {
        _exception = @"context null for runScript:sourceURL:";
        return nil;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    NSString *source = sourceURL?[sourceURL absoluteString]:@"";
    v8::Local<v8::String> scriptString = [script toV8StringInIsolate:isolate];
#if (V8_MAJOR_VERSION == 8 && V8_MINOR_VERSION == 9 && \
     V8_BUILD_NUMBER >= 45) || \
    (V8_MAJOR_VERSION == 8 && V8_MINOR_VERSION > 9) || (V8_MAJOR_VERSION > 8)
    v8::ScriptOrigin origin(isolate, [source toV8StringInIsolate:isolate]);
#else
    v8::ScriptOrigin origin(v8_file_name);
#endif
    v8::TryCatch scriptCatch(isolate);
    v8::MaybeLocal<v8::Script> maybeScriptResult = v8::Script::Compile(localContext, scriptString, &origin);
    if (maybeScriptResult.IsEmpty()) {
        if (scriptCatch.HasCaught()) {
            _exception = TryToFetchStringFromV8Value(scriptCatch.Exception(), isolate);
        }
        return nil;
    }
    v8::TryCatch runCatch(isolate);
    v8::MaybeLocal<v8::Value> maybeRunResult = maybeScriptResult.ToLocalChecked()->Run(localContext);
    if (maybeScriptResult.IsEmpty()) {
        if (runCatch.HasCaught()) {
            _exception = TryToFetchStringFromV8Value(runCatch.Exception(), isolate);
        }
        return nil;
    }
    v8::Local<v8::Value> runResult = maybeRunResult.ToLocalChecked();
    id objResult = ObjectFromV8Value(runResult, isolate, localContext);
    return objResult;
}

- (std::shared_ptr<hippy::napi::CtxValue>)createNumber:(NSNumber *)number {
    auto context = _v8Context.lock();
    if (!context) {
        return nullptr;
    }
    return context->CreateNumber([number doubleValue]);
}

- (std::shared_ptr<hippy::napi::CtxValue>)createBool:(NSNumber *)number {
    auto context = _v8Context.lock();
    if (!context) {
        return nullptr;
    }
    return context->CreateNumber([number boolValue]);
}

- (std::shared_ptr<hippy::napi::CtxValue>)createString:(NSString *)string {
    if (!string) {
        return nullptr;
    }
    auto context = _v8Context.lock();
    if (!context) {
        return nullptr;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    v8::Handle<v8::String> v8String = [string toV8ValueInIsolate:context->isolate_ context:localContext].As<v8::String>();
    return std::make_shared<hippy::napi::V8CtxValue>(isolate, v8String);
}

- (std::shared_ptr<hippy::napi::CtxValue>)createUndefined {
    auto context = _v8Context.lock();
    if (!context) {
        return nullptr;
    }
    return context->CreateUndefined();
}

- (std::shared_ptr<hippy::napi::CtxValue>)createNull {
    auto context = _v8Context.lock();
    if (!context) {
        return nullptr;
    }
    return context->CreateNull();
}

- (std::shared_ptr<hippy::napi::CtxValue>)createObject:(NSDictionary *)dictionary {
    if (!dictionary) {
        return nullptr;
    }
    auto context = _v8Context.lock();
    if (!context) {
        return nullptr;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    v8::Handle<v8::Value> dic = [dictionary toV8ValueInIsolate:context->isolate_ context:localContext];
    return std::make_shared<hippy::napi::V8CtxValue>(isolate, dic);
}

- (std::shared_ptr<hippy::napi::CtxValue>)createObjectFromJsonString:(NSString *)JsonString {
    if (!JsonString) {
        return nullptr;
    }
    auto context = _v8Context.lock();
    if (!context) {
        return nullptr;
    }
    id objFromJson = StringJSONToObject(JsonString);
    if (!objFromJson) {
        return nullptr;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    v8::Handle<v8::Value> value = [objFromJson toV8ValueInIsolate:context->isolate_ context:localContext];
    return std::make_shared<hippy::napi::V8CtxValue>(isolate, value);
}

- (std::shared_ptr<hippy::napi::CtxValue>)createArray:(NSArray *)array {
    if (!array) {
        return nullptr;
    }
    auto context = _v8Context.lock();
    if (!context) {
        return nullptr;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    v8::Handle<v8::Value> value = [array toV8ValueInIsolate:context->isolate_ context:localContext];
    return std::make_shared<hippy::napi::V8CtxValue>(isolate, value);
}
- (std::shared_ptr<hippy::napi::CtxValue>)createError:(NSString *)description {
    if (!description) {
        return nullptr;
    }
    auto context = _v8Context.lock();
    if (!context) {
        return nullptr;
    }
    v8::Isolate *isolate = context->isolate_;
    v8::HandleScope handleScope(isolate);
    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
    v8::Context::Scope contextScope(localContext);
    v8::Local<v8::String> message = [description toV8ValueInIsolate:isolate context:localContext].As<v8::String>();
    v8::Local<v8::Value> error = v8::Exception::Error(message);
    return std::make_shared<hippy::napi::V8CtxValue>(isolate, error);
}

- (void)setContextName:(NSString *)name {}

@end
