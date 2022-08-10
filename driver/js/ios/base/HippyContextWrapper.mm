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

#import "HippyContextWrapper.h"
#import "HippyAssert.h"
#ifdef JS_USE_JSC
#import <JavaScriptCore/JavaScriptCore.h>
#import "NSObject+JSValue.h"
#include "core/napi/jsc/js_native_api_jsc.h"
#else
#import "NSObject+CtxValue.h"
#include "footstone/unicode_string_view.h"
#endif //JS_USE_JSC

#ifndef JS_USE_JSC
using unicode_string_view = footstone::stringview::unicode_string_view;
static unicode_string_view NSStringToU8StringView(NSString* str) {
  std::string u8 = [str UTF8String];
  return unicode_string_view(reinterpret_cast<const unicode_string_view::char8_t_*>(u8.c_str()), u8.length());
}
#endif

static NSDictionary *StringJSONToMap(NSString *string) {
    NSData *data = [string dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *map = [NSJSONSerialization JSONObjectWithData:data options:(0) error:nil];
    HippyAssert([map isKindOfClass:[NSDictionary class]], @"map must be NSDictionary");
    return map;
}

@interface HippyContextWrapper () {
#ifdef JS_USE_JSC
    JSContext *_OCContext;
#else
    std::shared_ptr<hippy::napi::Ctx> _ctx;
#endif //JS_USE_JSC
    NSMutableDictionary *_callbackDic;
}

@property(nonatomic, assign) std::weak_ptr<Scope> scope;

@end

@implementation HippyContextWrapper

+ (instancetype)wrapperFromScope:(std::shared_ptr<Scope>)scope {
    HippyContextWrapper *wrapper = [[[self class] alloc] init];
    wrapper.scope = scope;
    return wrapper;
}

#ifdef JS_USE_JSC
#endif //JS_USE_JSC

- (instancetype)init {
    self = [super init];
    if (self) {
        _callbackDic = [NSMutableDictionary dictionaryWithCapacity:8];
    }
    return self;
}

#ifdef JS_USE_JSC
- (JSContext *)OCContext {
    if (_OCContext) {
        return _OCContext;
    }
    auto scope = _scope.lock();
    if (!scope) {
        return nil;
    }
    auto jsc_context = std::static_pointer_cast<hippy::napi::JSCCtx>(scope->GetContext());
    _OCContext = [JSContext contextWithJSGlobalContextRef:jsc_context->context_];
    return _OCContext;
}
#else
- (std::shared_ptr<hippy::napi::Ctx>)CPPContext {
    if (!_ctx) {
        auto scope = _scope.lock();
        if (scope) {
            _ctx = scope->GetContext();
        }
    }
    return _ctx;
}
#endif //JS_USE_JSC


#pragma mark Public Methods
- (void)setContextName:(NSString *)name {
#ifdef JS_USE_JSC
    [[self OCContext] setName:name];
#endif //JS_USE_JSC
}

- (void)registerValue:(id)value asGlobalVar:(NSString *)globalVariable {
#ifdef JS_USE_JSC
    JSContext *context = [self OCContext];
    if (context) {
        context[globalVariable] = [value toJSValueInContext:context];
    }
#else
    auto scope = _scope.lock();
    if (scope) {
        scope->GetContext()->SetGlobalStrVar([globalVariable UTF8String], NSStringToU8StringView(value));
    }
#endif
}

- (void)registerValueMap:(NSDictionary *)values asGlobalVar:(NSString *)globalVariable {
#ifdef JS_USE_JSC
    JSContext *context = [self OCContext];
    if (context) {
        context[globalVariable] = [values toJSValueInContext:context];
    }
#else
    auto scope = _scope.lock();
    if (!scope) {
        return;
    }
    auto context = scope->GetContext();
    unicode_string_view name([globalVariable UTF8String]);
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:values options:0 error:nil];
    NSString *json = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    unicode_string_view jsonString([json UTF8String]);
    context->SetGlobalJsonVar(name, jsonString);
#endif
}

- (void)registerValueJSON:(NSString *)value asGlobalVar:(NSString *)globalVariable {
#ifdef JS_USE_JSC
    NSDictionary *map = StringJSONToMap(value);
    [self registerValueMap:map asGlobalVar:globalVariable];
#else
    auto scope = _scope.lock();
    if (!scope) {
        return;
    }
    auto context = scope->GetContext();
    unicode_string_view name([globalVariable UTF8String]);
    unicode_string_view jsonString([value UTF8String]);
    context->SetGlobalJsonVar(name, jsonString);
#endif //JS_USE_JSC

}

#ifdef JS_USE_JSC
- (void)addValueMap:(NSDictionary *)values toGlabalVar:(NSString *)variable {
    JSContext *context = [self OCContext];
    if (context) {
        context[variable] = [values toJSValueInContext:context];
    }
}
#endif //JS_USE_JSC

- (void)registerFunction:(NSString *)funcName implementation:(FunctionImplementationBlock)implementation {
    if (!funcName || !implementation) {
        return;
    }
    FunctionImplementationBlock block = [implementation copy];
#ifdef JS_USE_JSC
    JSContext *context = [self OCContext];
    JSGlobalContextRef contextRef = [context JSGlobalContextRef];
    auto native_func_callback = [](JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t cnt, const JSValueRef arguments[], JSValueRef* exception) -> JSValueRef {
        @autoreleasepool {
            void *privateData = JSObjectGetPrivate(function);
            FunctionImplementationBlock block = (__bridge FunctionImplementationBlock)privateData;
            NSMutableArray *argAry = [NSMutableArray arrayWithCapacity:cnt];
            for (size_t index = 0; index < cnt; index++) {
                JSValueRef valueRef = arguments[index];
                id obj = ObjectFromJSValueRef((JSGlobalContextRef)ctx, valueRef);
                [argAry addObject:obj];
            }
            id ret = block([argAry copy]);
            if (ret) {
                JSContext *context = [JSContext contextWithJSGlobalContextRef:(JSGlobalContextRef)ctx];
                JSValue *retValue = [ret toJSValueInContext:context];
                return retValue.JSValueRef;
            }
            return JSValueMakeUndefined(ctx);
        }
    };
    [_callbackDic setObject:block forKey:funcName];
    JSClassDefinition cls_def = kJSClassDefinitionEmpty;
    cls_def.callAsFunction = native_func_callback;
    JSClassRef cls_ref = JSClassCreate(&cls_def);
    JSObjectRef func_object = JSObjectMake(contextRef, cls_ref, (__bridge void *)block);
    JSClassRelease(cls_ref);
    JSStringRef JSFunctionName = JSStringCreateWithUTF8CString([funcName UTF8String]);
    JSObjectSetProperty(contextRef, JSContextGetGlobalObject(contextRef), JSFunctionName, func_object, kJSPropertyAttributeNone, NULL);
    JSStringRelease(JSFunctionName);
#else
    auto ctx = [self CPPContext];
    if (ctx) {
        hippy::napi::Ctx::NativeFunction nativeFunc = [ctx, block](void *data) {
            @autoreleasepool {
                auto tuple_ptr = static_cast<hippy::napi::CBCtxValueTuple *>(data);
                size_t count = tuple_ptr->count_;
                NSMutableArray *array = [NSMutableArray arrayWithCapacity:count];
                const std::shared_ptr<hippy::napi::CtxValue> *ctxValues = tuple_ptr->arguments_;
                for (size_t i = 0; i < count; i++) {
                    const std::shared_ptr<hippy::napi::CtxValue> &ctxValue = ctxValues[i];
                    id object = ObjectFromCtxValue(ctx, ctxValue);
                    [array addObject:object];
                }
                id ret = block([array copy]);
                if (ret) {
                    return [ret convertToCtxValue:ctx];
                }
                return ctx->CreateUndefined();
            }
        };
        ctx->RegisterNativeBinding([funcName UTF8String], nativeFunc, nullptr);
    }
#endif
}

@end
