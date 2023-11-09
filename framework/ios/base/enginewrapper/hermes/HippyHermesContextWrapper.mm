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

#import "HippyAssert.h"
#import "HippyLog.h"
#import "HippyHermesContextWrapper.h"
#import "NSObject+CtxValue.h"
#import "NSObject+HermesValue.h"

#include <memory.h>

#include "jsi/jsi.h"
#include "driver/napi/hermes/hermes_ctx_value.h"
#include "driver/napi/hermes/hermes_ctx.h"

// static NSString *v8StringToNSString(v8::Isolate *isolate, v8::Local<v8::String> v8String) {
//     @autoreleasepool {
//         if (v8String.IsEmpty() || !isolate) {
//             return nil;
//         }
//         int len = v8String->Length();
//         if (v8String->IsOneByte()) {
//             void *buffer = malloc(len);
//             v8String->WriteOneByte(isolate, reinterpret_cast<uint8_t *>(buffer));
//             NSString *result = [[NSString alloc] initWithBytesNoCopy:buffer length:len encoding:NSUTF8StringEncoding freeWhenDone:YES];
//             return result;
//         }
//         else {
//             void *buffer = malloc(len * 2);
//             v8String->Write(isolate, reinterpret_cast<uint16_t *>(buffer));
//             NSString *result = [[NSString alloc] initWithBytesNoCopy:buffer length:len * 2 encoding:NSUTF16LittleEndianStringEncoding freeWhenDone:YES];
//             return result;
//         }
//     }
// }

@interface HippyHermesContextWrapper () {
    std::weak_ptr<hippy::napi::HermesCtx> _hermesContext;
    NSMutableDictionary *_blockDic;
    NSString *_exception;
    // NSData *_cachedCodeData;
}

@end

@implementation HippyHermesContextWrapper

@synthesize excpetionHandler = _excpetionHandler;

// static void HandleUncaughtJsError(v8::Local<v8::Message> message, v8::Local<v8::Value> data) {
//     @autoreleasepool {
//         if (!data->IsExternal() || data->IsNullOrUndefined()) {
//             return;
//         }
//         v8::Local<v8::External> external = data.As<v8::External>();
//         HippyV8ContextWrapper *wrapper = (__bridge HippyV8ContextWrapper *)external->Value();
//         ExceptionHandler excpetionHandler = wrapper.excpetionHandler;
//         if (!excpetionHandler) {
//             return;
//         }
//         v8::Local<v8::StackTrace> stack = message->GetStackTrace();
//         v8::Isolate *isolate = message->GetIsolate();
//         NSString *errorMessage = v8StringToNSString(isolate, message->Get());
//         int frameCount = stack->GetFrameCount();
//         NSMutableArray<HPDriverStackFrame *> *stacks = [NSMutableArray arrayWithCapacity:frameCount];
//         for (int i = 0; i < frameCount; i++) {
//             v8::Local<v8::StackFrame> frame = stack->GetFrame(isolate, i);
//             v8::Local<v8::String> functionName = frame->GetFunctionName();
//             NSString *funcName = v8StringToNSString(isolate, functionName);
//             if (!funcName) {
//                 funcName = @"unknown function name";
//             }
//             v8::Local<v8::String> scrName = frame->GetScriptNameOrSourceURL();
//             NSString *scriptName = v8StringToNSString(isolate, scrName);
//             HPDriverStackFrame *stackFrame = [[HPDriverStackFrame alloc] initWithMethodName:funcName
//                                                                                        file:scriptName
//                                                                                  lineNumber:frame->GetLineNumber()
//                                                                                      column:frame->GetColumn()];
//             [stacks addObject:stackFrame];
//         }
//         excpetionHandler(wrapper, errorMessage, [stacks copy]);
//     }
// }

- (instancetype)initWithContext:(std::weak_ptr<hippy::napi::Ctx>)context {
    self = [super init];
    if (self) {
        @autoreleasepool {
            _hermesContext = std::static_pointer_cast<hippy::napi::HermesCtx>(context.lock());
             _blockDic = [NSMutableDictionary dictionaryWithCapacity:8];
            // auto ctx = _v8Context.lock();
            // if (ctx) {
            //     v8::Isolate *isolate = ctx->isolate_;
            //     v8::HandleScope handleScope(isolate);
            //     v8::Local<v8::Context> localContext = ctx->context_persistent_.Get(isolate);
            //     v8::Context::Scope contextScope(localContext);

            //     void *data = (__bridge void *)self;
            //     v8::Local<v8::External> external = v8::External::New(isolate, data);
            //     isolate->AddMessageListener(HandleUncaughtJsError, external);
            //     isolate->SetCaptureStackTraceForUncaughtExceptions(YES);
            // }
        }
    }
    return self;
}

- (std::weak_ptr<hippy::napi::Ctx>)underlyingContext {
    return _hermesContext;
}

- (NSString *)exception {
    return _exception;
}

- (BOOL)createGlobalObject:(NSString *)name withValue:(NSString *)value {
    if (!name || !value) {
        _exception = @"name or value nil for createGlobalObject:withvalue:";
        return NO;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        _exception = @"context null for createGlobalObject:withvalue:";
        return NO;
    }

    auto& runtime = context->GetRuntime();
    auto hermes_name = [name toHermesValueInRuntime:*runtime];
    auto hermes_value = [value toHermesValueInRuntime:*runtime];
    auto global_object = runtime->global();
    global_object.setProperty(*runtime, hermes_name.asString(*runtime), std::move(hermes_value));
    return TRUE;
}

- (BOOL)createGlobalObject:(NSString *)name withJsonValue:(NSString *)value {
    if (!name || !value) {
        _exception = @"name or value nil for createGlobalObject:withJsonValue:";
        return NO;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        _exception = @"context null for createGlobalObject:withJsonValue:";
        return NO;
    }

    auto& runtime = context->GetRuntime();
    auto hermes_name = [name toHermesValueInRuntime:*runtime];
    const char *p = [value UTF8String]?:"";
    size_t length = [value lengthOfBytesUsingEncoding:NSUTF8StringEncoding];
    auto hermes_value = facebook::jsi::Value::createFromJsonUtf8(*runtime,
                                                                 reinterpret_cast<uint8_t*>(const_cast<char*>(p)), length);
    auto global_object = runtime->global();
    global_object.setProperty(*runtime, hermes_name.asString(*runtime), std::move(hermes_value));
    return TRUE;
}

- (BOOL)createGlobalObject:(NSString *)name withDictionary:(NSDictionary *)value {
    if (!name || !value) {
        _exception = @"name or value nil for createGlobalObject:withDictionary:";
        return NO;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        _exception = @"context null for createGlobalObject:withDictionary:";
        return NO;
    }

    auto& runtime = context->GetRuntime();
    auto hermes_name = [name toHermesValueInRuntime:*runtime];
    auto hermes_value = [value toHermesValueInRuntime:*runtime];
    auto global_object = runtime->global();
    global_object.setProperty(*runtime, hermes_name.asString(*runtime), std::move(hermes_value));
    return TRUE;
}

- (id)globalObjectForName:(NSString *)name {
    if (!name) {
        _exception = @"name nil for globalObjectForName:";
        return nullptr;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        _exception = @"context null for globalObjectForName:";
        return nullptr;
    }
    auto& runtime = context->GetRuntime();
    auto hermes_name = [name toHermesValueInRuntime:*runtime];
    auto global_object = runtime->global();
    auto property = global_object.getProperty(*runtime, hermes_name.asString(*runtime));
    return ObjectFromHermesValue(*runtime, property);
}

- (std::shared_ptr<hippy::napi::CtxValue>)globalJSValueForName:(NSString *)name {
    if (!name) {
        _exception = @"name nil for globalJSValueForName:";
        return nullptr;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        _exception = @"context null for globalJSValueForName:";
        return nullptr;
    }
    
    auto& runtime = context->GetRuntime();
    auto jsi_name = [name toHermesValueInRuntime:*runtime];
    auto value = std::make_shared<hippy::driver::napi::HermesCtxValue>(*runtime, jsi_name);
    auto ctx_value = context->GetProperty(context->GetGlobalObject(), value);
    return ctx_value;
}

- (BOOL)setProperties:(NSDictionary *)properties toGlobalObject:(NSString *)objectName {
    if (!objectName) {
        _exception = @"properties or objectName nil for setProperties:toGlobalObject:";
        return NO;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        _exception = @"context null for setProperties:toGlobalObject:";
        return NO;
    }
    auto& runtime = context->GetRuntime();
    auto jsi_name = [objectName toHermesValueInRuntime:*runtime];
    auto global = runtime->global().getProperty(*runtime, jsi_name.asString(*runtime));
    if (!global.isObject()) {
        return NO;
    }
    
    for (NSString *key in properties) {
        id object = [properties objectForKey:key];
        auto jsi_key = [key toHermesValueInRuntime:*runtime];
        auto jsi_value = [object toHermesValueInRuntime:*runtime];
        global.asObject(*runtime).setProperty(*runtime, jsi_key.asString(*runtime), std::move(jsi_value));
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
    auto context = _hermesContext.lock();
    if (!context) {
        _exception = @"propertyName or value or object nil for setProperty:forJSValue::toJSObject";
        return NO;
    }
    
    auto& runtime = context->GetRuntime();
    auto jsi_name = [propertyName toHermesValueInRuntime:*runtime];
    if (jsi_name.isString()) {
        return NO;
    }
    auto v = std::static_pointer_cast<hippy::napi::HermesCtxValue>(value);
    facebook::jsi::Value target_value = v->GetValue(runtime);
    auto o = std::static_pointer_cast<hippy::napi::HermesCtxValue>(object);
    facebook::jsi::Value target_object = o->GetValue(runtime);
    target_object.asObject(*runtime).setProperty(*runtime, jsi_name.asString(*runtime), std::move(target_value));

    return YES;
}

- (std::shared_ptr<hippy::napi::CtxValue>)property:(NSString *)propertyName
                                       forJSObject:(std::shared_ptr<hippy::napi::CtxValue>)object {
    if (!propertyName || !object) {
        _exception = @"property or object nil for property:forJSObject:";
        return nullptr;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        return nullptr;
    }

    auto& runtime = context->GetRuntime();
    auto o = std::static_pointer_cast<hippy::napi::HermesCtxValue>(object);
    auto target_object = o->GetValue(runtime);
    auto jsi_name = [propertyName toHermesValueInRuntime:*runtime];
    auto property = target_object.asObject(*runtime).getProperty(*runtime, jsi_name.asString(*runtime));
    return std::make_shared<hippy::napi::HermesCtxValue>(*runtime, property);
}

- (void)registerFunction:(NSString *)funcName implementation:(FunctionImplementationBlock)implementation {
    if (!funcName || !implementation) {
        _exception = @"funcName or implementation nil for registerFunction:implementation:";
        return;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        _exception = @"context null for funcName:implementation:";
        return;
    }
    
    auto& runtime = context->GetRuntime();
    auto func_name = [funcName toHermesValueInRuntime:*runtime];
    auto prop_name_id = facebook::jsi::PropNameID::forString(*runtime, func_name.asString(*runtime));

    id blockCallback = [implementation copy];
    [_blockDic setObject:blockCallback forKey:funcName];
    void *callback_data = (__bridge void *)blockCallback;

    auto func = facebook::jsi::Function::createFromHostFunction(*runtime, prop_name_id, 1,
          [callback_data](facebook::jsi::Runtime& runtime, const facebook::jsi::Value& this_value, const facebook::jsi::Value* args, size_t count) -> facebook::jsi::Value {
            FunctionImplementationBlock block = (__bridge FunctionImplementationBlock)callback_data;
            if (!block) {
                return facebook::jsi::Value::undefined();
            }
            NSMutableArray *argumentsArray = [NSMutableArray arrayWithCapacity:count];
            for (size_t i = 0; i < count; i++) {
                auto v = facebook::jsi::Value(runtime, args[i]);
                id object = ObjectFromHermesValue(runtime, v);
                [argumentsArray addObject:object];
            }
            id result = block([argumentsArray copy]);
            if (!result) {
                return facebook::jsi::Value::undefined();
            }
            auto result_value = [result toHermesValueInRuntime:runtime];
            return result_value;
          });
    runtime->global().setProperty(*runtime, func_name.asString(*runtime), func);
}

- (id)callFunction:(NSString *)funcName arguments:(NSArray *)arguments {
    if (!funcName) {
        _exception = @"funcName null for callFunction:arguments:";
        return nil;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        _exception = [NSString stringWithFormat:@"context null for function %@ invoke", funcName];
        return nil;
    }

    auto& runtime = context->GetRuntime();
    auto bridge_object = runtime->global().getProperty(*runtime, "__hpBatchedBridge");
    if (!bridge_object.isObject()) {
        _exception = @"cannot find __hpBatchedBridge";
        return nil;
    }
    auto jsi_name = [funcName toHermesValueInRuntime:*runtime];
    auto func_value = bridge_object.asObject(*runtime).getProperty(*runtime, jsi_name.asString(*runtime));
    if (!func_value.isObject()) {
        _exception = [NSString stringWithFormat:@"cannot find function %@ in __hpBatchedBridge object", funcName];
        return nil;
    }
    if (!func_value.asObject(*runtime).isFunction(*runtime)) {
        _exception = [NSString stringWithFormat:@"property %@ in __hpBatchedBridge object is not a function", funcName];
        return nil;
    }

    size_t count = [arguments count];
    facebook::jsi::Value args[count];
    for (size_t i = 0; i < count; i++) {
        id obj = arguments[i];
        args[i] = [obj toHermesValueInRuntime:*runtime];
    }
    auto ret = func_value.asObject(*runtime).asFunction(*runtime).callWithThis(*runtime, runtime->global(), args, count);
    return ObjectFromHermesValue(*runtime, ret);
}

- (id)runScript:(NSString *)script
      sourceURL:(NSURL *)sourceURL
  useCachedCode:(BOOL)useCachedCode
 cachedCodeData:(inout NSData *_Nullable *_Nullable)data {
    if (!script) {
        _exception = @"script must not be null for runScript:sourceURL:";
        return nil;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        _exception = @"context null for runScript:sourceURL:";
        return nil;
    }

    NSString *source = sourceURL?[sourceURL absoluteString]:@"";
    const char *utf_script_stirng = [script UTF8String];
    auto script_string = std::string(utf_script_stirng);
    const char *file_name_script_stirng = [source UTF8String];
    auto file_name_stirng = std::string(file_name_script_stirng);
    
    auto& runtime = context->GetRuntime();
    auto run_script = hippy::driver::string_view::new_from_utf8(script_string.data(), script_string.size());
    auto file_name = hippy::driver::string_view::new_from_utf8(file_name_stirng.data(), file_name_stirng.size());
    auto run_script_ret = context->RunScript(run_script, file_name);
    auto ctx_value = std::static_pointer_cast<hippy::napi::HermesCtxValue>(run_script_ret);
    facebook::jsi::Value value = ctx_value->GetValue(runtime);
    id result = ObjectFromHermesValue(*runtime, value);
    return result;
}

- (std::shared_ptr<hippy::napi::CtxValue>)createNumber:(NSNumber *)number {
    auto context = _hermesContext.lock();
    if (!context) {
        return nullptr;
    }
    return context->CreateNumber([number doubleValue]);
}

- (std::shared_ptr<hippy::napi::CtxValue>)createBool:(NSNumber *)number {
    auto context = _hermesContext.lock();
    if (!context) {
        return nullptr;
    }
    return context->CreateNumber([number boolValue]);
}

- (std::shared_ptr<hippy::napi::CtxValue>)createString:(NSString *)string {
    if (!string) {
        return nullptr;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        return nullptr;
    }
    auto& runtime = context->GetRuntime();
    auto jsi_string = [string toHermesValueInRuntime:*runtime];
    return std::make_shared<hippy::napi::HermesCtxValue>(*runtime, jsi_string.asString(*runtime));
}

- (std::shared_ptr<hippy::napi::CtxValue>)createUndefined {
    auto context = _hermesContext.lock();
    if (!context) {
        return nullptr;
    }
    return context->CreateUndefined();
}

- (std::shared_ptr<hippy::napi::CtxValue>)createNull {
    auto context = _hermesContext.lock();
    if (!context) {
        return nullptr;
    }
    return context->CreateNull();
}

- (std::shared_ptr<hippy::napi::CtxValue>)createObject:(NSDictionary *)dictionary {
    if (!dictionary) {
        return nullptr;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        return nullptr;
    }
    auto& runtime = context->GetRuntime();
    auto dic = [dictionary toHermesValueInRuntime:*runtime];
    return std::make_shared<hippy::napi::HermesCtxValue>(*runtime, dic.asObject(*runtime));
}

- (std::shared_ptr<hippy::napi::CtxValue>)createObjectFromJsonString:(NSString *)JsonString {
    if (!JsonString) {
        return nullptr;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        return nullptr;
    }

    auto& runtime = context->GetRuntime();
    const char *p = [JsonString UTF8String]?:"";
    size_t length = [JsonString lengthOfBytesUsingEncoding:NSUTF8StringEncoding];
    auto value = facebook::jsi::Value::createFromJsonUtf8(*runtime, reinterpret_cast<uint8_t*>(const_cast<char*>(p)), length);
    
    if (value.isString()) {
      return std::make_shared<hippy::napi::HermesCtxValue>(*runtime, value.asString(*runtime));
    } else if (value.isSymbol()) {
        return std::make_shared<hippy::napi::HermesCtxValue>(*runtime, value.asSymbol(*runtime));
    } else if (value.isObject()) {
        return std::make_shared<hippy::napi::HermesCtxValue>(*runtime, value.asObject(*runtime));
    } else if (value.isBigInt()) {
        return std::make_shared<hippy::napi::HermesCtxValue>(*runtime, value.asBigInt(*runtime));
    } else {
        return std::make_shared<hippy::napi::HermesCtxValue>(*runtime, value);
    }
}

- (std::shared_ptr<hippy::napi::CtxValue>)createArray:(NSArray *)array {
    if (!array) {
        return nullptr;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        return nullptr;
    }
    auto& runtime = context->GetRuntime();
    facebook::jsi::Value value = [array toHermesValueInRuntime:*runtime];
    return std::make_shared<hippy::napi::HermesCtxValue>(*runtime, value.asObject(*runtime));
}

- (std::shared_ptr<hippy::napi::CtxValue>)createError:(NSString *)description {
    if (!description) {
        return nullptr;
    }
    auto context = _hermesContext.lock();
    if (!context) {
        return nullptr;
    }
    auto& runtime = context->GetRuntime();
//    v8::Isolate *isolate = context->isolate_;
//    v8::HandleScope handleScope(isolate);
//    v8::Local<v8::Context> localContext = context->context_persistent_.Get(isolate);
//    v8::Context::Scope contextScope(localContext);
//    v8::Local<v8::String> message = [description toV8ValueInIsolate:isolate context:localContext].As<v8::String>();
//    v8::Local<v8::Value> error = v8::Exception::Error(message);
//    return std::make_shared<hippy::napi::V8CtxValue>(isolate, error);
    return nil;
}

- (void)setContextName:(NSString *)name {}

@end

id<HippyContextWrapper> CreateContextWrapper(std::shared_ptr<hippy::napi::Ctx> context) {
    return [[HippyHermesContextWrapper alloc] initWithContext:context];
}
