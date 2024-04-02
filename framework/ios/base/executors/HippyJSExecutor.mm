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

#import <UIKit/UIDevice.h>
#import "VFSUriHandler.h"
#import "HippyAssert.h"
#import "HippyBundleURLProvider.h"
#import "HippyContextWrapper.h"
#import "HippyDefines.h"
#import "HippyDevInfo.h"
#import "HippyDevMenu.h"
#import "HippyJSEnginesMapper.h"
#import "HippyJSExecutor.h"
#import "HippyOCTurboModule+Inner.h"
#import "HippyRedBox.h"
#import "HippyUtils.h"
#import "HippyTurboModuleManager.h"
#import "HippyLog.h"
#import "HippyUtils.h"
#import "HippyFootstoneUtils.h"
#import "NSObject+CtxValue.h"
#import "TypeConverter.h"

#include <cinttypes>
#include <memory>
#include <pthread.h>
#include <string>
#include <unordered_map>

#include "driver/engine.h"
#include "driver/napi/js_ctx.h"
#include "driver/napi/js_ctx_value.h"
#include "driver/napi/js_try_catch.h"
#include "driver/napi/callback_info.h"
#include "driver/vm/jsc/jsc_vm.h"
#include "driver/scope.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"
#include "footstone/task_runner.h"
#include "footstone/task.h"
#include "vfs/handler/uri_handler.h"

#ifdef ENABLE_INSPECTOR
#include "devtools/devtools_data_source.h"
#endif

NSString *const HippyJSCThreadName = @"com.tencent.hippy.JavaScript";

constexpr char kGlobalKey[] = "global";
constexpr char kHippyKey[] = "Hippy";

using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;
using SharedCtxPtr = std::shared_ptr<hippy::napi::Ctx>;
using WeakCtxPtr = std::weak_ptr<hippy::napi::Ctx>;
using SharedCtxValuePtr = std::shared_ptr<hippy::napi::CtxValue>;
using WeakCtxValuePtr = std::weak_ptr<hippy::napi::CtxValue>;

@interface HippyJSExecutor () {
    // Set at setUp time:
    id<HippyContextWrapper> _contextWrapper;
    NSMutableArray<dispatch_block_t> *_pendingCalls;
    __weak HippyBridge *_bridge;
#ifdef JS_JSC
    BOOL _isInspectable;
#endif //JS_JSC
}

@property(readwrite, assign) BOOL ready;

@end

@implementation HippyJSExecutor

- (void)setBridge:(HippyBridge *)bridge {
    _bridge = bridge;
}

- (HippyBridge *)bridge {
    return _bridge;
}

- (void)setup {
    auto engine = [[HippyJSEnginesMapper defaultInstance] createJSEngineResourceForKey:self.enginekey];
    const char *pName = [self.enginekey UTF8String] ?: "";
    footstone::TimePoint startPoint = footstone::TimePoint::SystemNow();
    auto scope = engine->GetEngine()->CreateScope(pName);
    dispatch_semaphore_t scopeSemaphore = dispatch_semaphore_create(0);
    __weak HippyJSExecutor *weakSelf = self;
    engine->GetEngine()->GetJsTaskRunner()->PostTask([weakSelf, scopeSemaphore, startPoint](){
        @autoreleasepool {
            HippyJSExecutor *strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            HippyBridge *bridge = strongSelf.bridge;
            if (!bridge) {
                return;
            }
            dispatch_semaphore_wait(scopeSemaphore, DISPATCH_TIME_FOREVER);
            auto scope = strongSelf->_pScope;
            scope->CreateContext();
            auto context = scope->GetContext();
            auto global_object = context->GetGlobalObject();
            auto user_global_object_key = context->CreateString(kGlobalKey);
            context->SetProperty(global_object, user_global_object_key, global_object);
            auto hippy_key = context->CreateString(kHippyKey);
            context->SetProperty(global_object, hippy_key, context->CreateObject());
            id<HippyContextWrapper> contextWrapper = CreateContextWrapper(context);
            contextWrapper.excpetionHandler = ^(id<HippyContextWrapper>  _Nonnull wrapper, NSString * _Nonnull message, NSArray<HippyJSStackFrame *> * _Nonnull stackFrames) {
                HippyJSExecutor *strongSelf = weakSelf;
                if (!strongSelf) {
                    return;
                }
                HippyBridge *bridge = strongSelf.bridge;
                if (!bridge) {
                    return;
                }
                NSDictionary *userInfo = @{
                    HippyFatalModuleName: bridge.moduleName?:@"unknown",
                    NSLocalizedDescriptionKey:message?:@"unknown",
                    HippyJSStackTraceKey:stackFrames
                };
                NSError *error = [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:userInfo];
                HippyBridgeFatal(error, bridge);
            };
            strongSelf->_contextWrapper = contextWrapper;
            NSMutableDictionary *deviceInfo = [NSMutableDictionary dictionaryWithDictionary:[bridge deviceInfo]];
            NSString *deviceName = [[UIDevice currentDevice] name];
            NSString *clientId = HippyMD5Hash([NSString stringWithFormat:@"%@%p", deviceName, strongSelf]);
            NSDictionary *debugInfo = @{@"Debug" : @{@"debugClientId" : clientId}};
            [deviceInfo addEntriesFromDictionary:debugInfo];

            NSError *JSONSerializationError = nil;
            NSData *data = [NSJSONSerialization dataWithJSONObject:deviceInfo options:0 error:&JSONSerializationError];
            if (JSONSerializationError) {
                NSString *errorString =
                    [NSString stringWithFormat:@"device parse error:%@, deviceInfo:%@", [JSONSerializationError localizedFailureReason], deviceInfo];
                NSError *error = HippyErrorWithMessageAndModuleName(errorString, bridge.moduleName);
                HippyBridgeFatal(error, bridge);
            }
            NSString *string = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            [contextWrapper createGlobalObject:@"__HIPPYNATIVEGLOBAL__" withJsonValue:string];
            [contextWrapper registerFunction:@"nativeRequireModuleConfig" implementation:^id _Nullable(NSArray * _Nonnull arguments) {
                NSString *moduleName = [arguments firstObject];
                if (moduleName) {
                    HippyJSExecutor *strongSelf = weakSelf;
                    if (!strongSelf.valid) {
                        return nil;
                    }
                    HippyBridge *bridge = strongSelf.bridge;
                    if (!bridge) {
                        return nil;
                    }
                    NSArray *result = [bridge configForModuleName:moduleName];
                    return HippyNullIfNil(result);
                }
                return nil;
            }];
            [contextWrapper registerFunction:@"nativeFlushQueueImmediate" implementation:^id _Nullable(NSArray * _Nonnull arguments) {
                NSArray<NSArray *> *calls = [arguments firstObject];
                HippyJSExecutor *strongSelf = weakSelf;
                if (!strongSelf.valid || !calls) {
                    return nil;
                }
                HippyBridge *bridge = strongSelf.bridge;
                if (!bridge) {
                    return nil;
                }
                [bridge handleBuffer:calls batchEnded:NO];
                return nil;
            }];
            auto turbo_wrapper = std::make_unique<hippy::FunctionWrapper>([](hippy::CallbackInfo& info, void* data) {
                @autoreleasepool {
                    //todo
                    HippyJSExecutor *strongSelf = (__bridge HippyJSExecutor*)data;
                    if (!strongSelf) {
                        return;
                    }
                    const auto &context = strongSelf.pScope->GetContext();
                    if (context->IsString(info[0])) {
                        NSString *name = ObjectFromCtxValue(context, info[0]);
                        auto value = [strongSelf JSTurboObjectWithName:name];
                        info.GetReturnValue()->Set(value);
                    }
                }
            }, (__bridge void*)weakSelf);
            auto turbo_function = context->CreateFunction(turbo_wrapper);
            scope->SaveFunctionWrapper(std::move(turbo_wrapper));
            context->SetProperty(global_object, context->CreateString("getTurboModule"), turbo_function);
            if (strongSelf.contextCreatedBlock) {
                strongSelf.contextCreatedBlock(strongSelf->_contextWrapper);
            }
            scope->SyncInitialize();
            strongSelf.ready = YES;
            NSArray<dispatch_block_t> *pendingCalls = [strongSelf->_pendingCalls copy];
            [pendingCalls enumerateObjectsUsingBlock:^(dispatch_block_t  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
                [strongSelf executeBlockOnJavaScriptQueue:obj];
            }];
            [strongSelf->_pendingCalls removeAllObjects];
            auto entry = scope->GetPerformance()->PerformanceNavigation(hippy::kPerfNavigationHippyInit);
            entry->SetHippyJsEngineInitStart(startPoint);
            entry->SetHippyJsEngineInitEnd(footstone::TimePoint::SystemNow());
        }
    });
    self.pScope = scope;
    dispatch_semaphore_signal(scopeSemaphore);
#ifdef ENABLE_INSPECTOR
    HippyBridge *bridge = self.bridge;
    if (bridge && bridge.debugMode) {
        NSString *wsURL = [self completeWSURLWithBridge:bridge];
        auto workerManager = std::make_shared<footstone::WorkerManager>(1);
        auto devtools_data_source = std::make_shared<hippy::devtools::DevtoolsDataSource>([wsURL UTF8String], workerManager);
        self.pScope->SetDevtoolsDataSource(devtools_data_source);
    }
#endif
}

- (instancetype)initWithEngineKey:(NSString *)engineKey bridge:(HippyBridge *)bridge {
    NSParameterAssert(engineKey.length > 0);
    if (self = [super init]) {
        _valid = YES;
        self.enginekey = engineKey;
        self.bridge = bridge;

        self.ready = NO;
        _pendingCalls = [NSMutableArray arrayWithCapacity:4];
        HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor Init %p, engineKey:%@", self, engineKey);
    }

    return self;
}

- (void)setUriLoader:(std::weak_ptr<hippy::vfs::UriLoader>)uriLoader {
    if (self.pScope->GetUriLoader().lock() != uriLoader.lock()) {
        self.pScope->SetUriLoader(uriLoader);
    }
}

- (void)setSandboxDirectory:(NSString *)directory {
    if (directory) {
        __weak HippyJSExecutor *weakSelf = self;
        [self executeBlockOnJavaScriptQueue:^{
            @autoreleasepool {
                HippyJSExecutor *strongSelf = weakSelf;
                if (!strongSelf) {
                    return;
                }
                HippyAssert(strongSelf.pScope, @"scope must not be null");
                HippyAssert(strongSelf.pScope->GetContext(), @"context must not be null");
                auto context = strongSelf.pScope->GetContext();
                auto global_object = context->GetGlobalObject();
                auto key = context->CreateString("__HIPPYCURDIR__");
                auto value = context->CreateString(NSStringToU8StringView(directory));
                context->SetProperty(global_object, key, value);
            }
        }];
    }
}

- (SharedCtxValuePtr)JSTurboObjectWithName:(NSString *)name {
    // create HostObject by name
    HippyOCTurboModule *turboModule = [self->_bridge turboModuleWithName:name];
    auto scope = self->_pScope;
    auto context = scope->GetContext();
    if (!turboModule) {
        return context->CreateNull();
    }

    // create jsProxy
    std::string turbo_name([name UTF8String]);
    if (scope->HasTurboInstance(turbo_name)) {
        return scope->GetTurboInstance(turbo_name);
    }
    
    CFTypeRef retainedTurboModule = CFBridgingRetain(turboModule);
    auto wrapper = std::make_unique<hippy::FunctionWrapper>([](hippy::CallbackInfo& info, void* data) {
        auto name = info[0];
        if (!name) {
            CFRelease(data);
            return;
        }
        HippyOCTurboModule *turbo = (__bridge HippyOCTurboModule*)data;
        auto turbo_wrapper = std::make_unique<TurboWrapper>(turbo, info[0]);
        auto func_wrapper = std::make_unique<hippy::FunctionWrapper>([](hippy::CallbackInfo& info, void* data) {
            std::vector<std::shared_ptr<hippy::CtxValue>> argv;
            for (size_t i = 0; i < info.Length(); ++i) {
                argv.push_back(info[i]);
            }
            auto scope_wrapper = reinterpret_cast<hippy::ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
            auto scope = scope_wrapper->scope.lock();
            FOOTSTONE_CHECK(scope);
            auto turbo_wrapper = reinterpret_cast<TurboWrapper*>(data);
            HippyOCTurboModule *turbo = turbo_wrapper->module;
            auto name = turbo_wrapper->name;
            auto result = [turbo invokeOCMethod:scope->GetContext() this_val:name args:argv.data() count:argv.size()];
            info.GetReturnValue()->Set(result);
        }, turbo_wrapper.get());
        [turbo saveTurboWrapper:name turbo:std::move(turbo_wrapper)];
        auto scope_wrapper = reinterpret_cast<hippy::ScopeWrapper*>(std::any_cast<void*>(info.GetSlot()));
        auto scope = scope_wrapper->scope.lock();
        FOOTSTONE_CHECK(scope);
        auto func = scope->GetContext()->CreateFunction(func_wrapper);
        scope->SaveFunctionWrapper(std::move(func_wrapper));
        info.GetReturnValue()->Set(func);
        CFRelease(data);
    }, (void *)retainedTurboModule);
    
    auto obj = scope->GetContext()->DefineProxy(wrapper);
    scope->SaveFunctionWrapper(std::move(wrapper));
    scope->SetTurboInstance(turbo_name, obj);
    return obj;
}

- (void)setUp {
}

- (void)invalidate {
    if (!self.isValid) {
        return;
    }
#ifdef ENABLE_INSPECTOR
    auto devtools_data_source = self.pScope->GetDevtoolsDataSource();
    if (devtools_data_source) {
        bool reload = self.bridge.invalidateReason == HippyInvalidateReasonReload ? true : false;
        devtools_data_source->Destroy(reload);
    }
#endif
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor invalide %p", self);
    _valid = NO;
#ifdef JS_JSC
    auto scope = self.pScope;
    if (scope) {
        auto jsc_context = std::static_pointer_cast<hippy::napi::JSCCtx>(scope->GetContext());
        static CFStringRef delName = CFSTR("HippyJSContext(delete)");
        jsc_context->SetName(delName);
    }
#endif //JS_JSC
    self.pScope->WillExit();
    self.pScope = nullptr;
    NSString *enginekey = self.enginekey;
    if (!enginekey) {
        return;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        [[HippyJSEnginesMapper defaultInstance] removeEngineResourceForKey:enginekey];
    });
}

- (void)setContextName:(NSString *)contextName {
#ifdef JS_JSC
    if (!contextName) {
        return;
    }
    __weak __typeof(self)weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        @autoreleasepool {
            __strong __typeof(weakSelf)strongSelf = weakSelf;
            if (!strongSelf.pScope) {
                return;
            }
            SharedCtxPtr context = strongSelf.pScope->GetContext();
            if (!context) {
                return;
            }
            auto tryCatch = hippy::napi::CreateTryCatchScope(true, context);
            auto jsc_context = std::static_pointer_cast<hippy::napi::JSCCtx>(context);
            NSString *finalName = [NSString stringWithFormat:@"HippyContext: %@", contextName];
            jsc_context->SetName((__bridge CFStringRef)finalName);
            if (tryCatch->HasCaught()) {
                HippyLogWarn(@"set context throw exception");
            }
        }
    }];
#endif //JS_JSC
}

- (void)setInspecable:(BOOL)inspectable {
#ifdef JS_JSC
    _isInspectable = inspectable;
#if defined(__IPHONE_16_4) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_16_4
    if (@available(iOS 16.4, *)) {
        WeakCtxPtr weak_ctx = self.pScope->GetContext();
        [self executeBlockOnJavaScriptQueue:^{
            @autoreleasepool {
                SharedCtxPtr context = weak_ctx.lock();
                if (!context) {
                    return;
                }
                auto jsc_context = std::static_pointer_cast<hippy::napi::JSCCtx>(context);
                JSGlobalContextRef contextRef = jsc_context->context_;
                JSGlobalContextSetInspectable(contextRef, inspectable);
            }
        }];
    }
#endif //defined(__IPHONE_16_4) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_16_4
#endif //JS_JSC
}

- (void)dealloc {
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor dealloc %p", self);
    [self invalidate];
}

- (void)updateNativeInfoToHippyGlobalObject:(NSDictionary *)updatedInfoDict {
    if (updatedInfoDict.count <= 0){
        return;
    }
    __weak __typeof(self)weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        __strong __typeof(weakSelf)strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.isValid || nullptr == strongSelf.pScope) {
            return;
        }
        [strongSelf addInfoToGlobalObject:updatedInfoDict.copy];
    }];
}

-(void)addInfoToGlobalObject:(NSDictionary*)addInfoDict{
    string_view str("__HIPPYNATIVEGLOBAL__");
    auto context = self.pScope->GetContext();
    auto global_object = context->GetGlobalObject();
    auto hippy_native_object_key = context->CreateString(str);
    auto hippy_native_object_value = context->GetProperty(global_object, hippy_native_object_key);
    HippyAssert(hippy_native_object_value, @"__HIPPYNATIVEGLOBAL__ must not be null");
    if (!context->IsNullOrUndefined(hippy_native_object_value)) {
        for (NSString *key in addInfoDict) {
            id value = addInfoDict[key];
            string_view key_string = NSStringToU8StringView(key);
            auto ctx_value = [value convertToCtxValue:context];
            context->SetProperty(hippy_native_object_value, context->CreateString(key_string), ctx_value, hippy::napi::PropertyAttribute::None);
        }
    }
}

- (void)flushedQueue:(HippyJavaScriptCallback)onComplete {
    [self _executeJSCall:@"flushedQueue" arguments:@[] callback:onComplete];
}

- (void)_callFunctionOnModule:(NSString *)module
                       method:(NSString *)method
                    arguments:(NSArray *)args
                     callback:(HippyJavaScriptCallback)onComplete {
    static NSString *bridgeMethod = @"callFunctionReturnFlushedQueue";
    [self _executeJSCall:bridgeMethod arguments:@[module, method, args] callback:onComplete];
}

- (void)callFunctionOnModule:(NSString *)module method:(NSString *)method arguments:(NSArray *)args callback:(HippyJavaScriptCallback)onComplete {
    [self _callFunctionOnModule:module method:method arguments:args callback:onComplete];
}

- (void)invokeCallbackID:(NSNumber *)cbID arguments:(NSArray *)args callback:(HippyJavaScriptCallback)onComplete {
    [self _executeJSCall:@"invokeCallbackAndReturnFlushedQueue" arguments:@[cbID, args] callback:onComplete];
}

- (void)_executeJSCall:(NSString *)method
             arguments:(NSArray *)arguments
              callback:(HippyJavaScriptCallback)onComplete {
    HippyAssert(onComplete != nil, @"onComplete block should not be nil");
    __weak HippyJSExecutor *weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        @autoreleasepool {
            HippyJSExecutor *strongSelf = weakSelf;
            if (!strongSelf || !strongSelf.isValid || nullptr == strongSelf.pScope) {
                return;
            }
            @try {
                HippyBridge *bridge = [strongSelf bridge];
                NSString *moduleName = [bridge moduleName];
                NSError *executeError = nil;
                id objcValue = nil;
                auto context = strongSelf.pScope->GetContext();
                auto global_object = context->GetGlobalObject();
                auto bridge_key = context->CreateString("__hpBatchedBridge");
                auto batchedbridge_value = context->GetProperty(global_object, bridge_key);
                SharedCtxValuePtr resultValue = nullptr;
                string_view exception;
                if (batchedbridge_value) {
                    string_view methodName = NSStringToU8StringView(method);
                    SharedCtxValuePtr method_value = context->GetProperty(batchedbridge_value, methodName);
                    if (method_value) {
                        if (context->IsFunction(method_value)) {
                            SharedCtxValuePtr function_params[arguments.count];
                            for (NSUInteger i = 0; i < arguments.count; i++) {
                                id obj = arguments[i];
                                function_params[i] = [obj convertToCtxValue:context];
                            }
                            auto tryCatch = hippy::CreateTryCatchScope(true, context);
                            resultValue = context->CallFunction(method_value, context->GetGlobalObject(), arguments.count, function_params);
                            if (tryCatch->HasCaught()) {
                                exception = tryCatch->GetExceptionMessage();
                            }
                        } else {
                            executeError
                                = HippyErrorWithMessageAndModuleName([NSString stringWithFormat:@"%@ is not a function", method], moduleName);
                        }
                    } else {
                        executeError = HippyErrorWithMessageAndModuleName(
                            [NSString stringWithFormat:@"property/function %@ not found in __hpBatchedBridge", method], moduleName);
                    }
                } else {
                    executeError = HippyErrorWithMessageAndModuleName(@"__hpBatchedBridge not found", moduleName);
                }
                if (!StringViewUtils::IsEmpty(exception) || executeError) {
                    if (!StringViewUtils::IsEmpty(exception)) {
                        NSString *string = StringViewToNSString(exception);
                        executeError = HippyErrorWithMessageAndModuleName(string, moduleName);
                    }
                } else if (resultValue) {
                    objcValue = ObjectFromCtxValue(context, resultValue);
                }
                onComplete(objcValue, executeError);
            } @catch (NSException *exception) {
                NSString *moduleName = strongSelf.bridge.moduleName?:@"unknown";
                NSMutableDictionary *userInfo = [exception.userInfo mutableCopy]?:[NSMutableDictionary dictionary];
                [userInfo setObject:moduleName forKey:HippyFatalModuleName];
                [userInfo setObject:arguments?:[NSArray array] forKey:@"arguments"];
                NSException *reportException = [NSException exceptionWithName:exception.name reason:exception.reason userInfo:userInfo];
                HippyBridgeHandleException(reportException, self.bridge);
            }
        }
    }];
}

- (void)executeApplicationScript:(NSData *)script sourceURL:(NSURL *)sourceURL onComplete:(HippyJavaScriptCallback)onComplete {
    HippyAssertParam(script);
    HippyAssertParam(sourceURL);
    __weak HippyJSExecutor* weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        @autoreleasepool {
            HippyJSExecutor *strongSelf = weakSelf;
            if (!strongSelf || !strongSelf.isValid) {
                onComplete(nil, HippyErrorWithMessageAndModuleName(@"jsexecutor is not invalid", strongSelf.bridge.moduleName));
                return;
            }
            NSError *error = nil;
            auto entry = strongSelf.pScope->GetPerformance()->PerformanceNavigation(hippy::kPerfNavigationHippyInit);
            string_view url = [[sourceURL absoluteString] UTF8String]?:"";
            entry->BundleInfoOfUrl(url).execute_source_start_ = footstone::TimePoint::SystemNow();
            id result = executeApplicationScript(script, sourceURL, strongSelf.pScope->GetContext(), &error);
            entry->BundleInfoOfUrl(url).execute_source_end_ = footstone::TimePoint::SystemNow();
            if (onComplete) {
                onComplete(result, error);
            }
        }
    }];
}

static NSLock *jslock() {
    static dispatch_once_t onceToken;
    static NSLock *lock = nil;
    dispatch_once(&onceToken, ^{
        lock = [[NSLock alloc] init];
    });
    return lock;
}

static id executeApplicationScript(NSData *script, NSURL *sourceURL, SharedCtxPtr context, NSError **error) {
    const char *scriptBytes = reinterpret_cast<const char *>([script bytes]);
    string_view view = string_view::new_from_utf8(scriptBytes, [script length]);
    string_view fileName = NSStringToU16StringView([sourceURL absoluteString]);
    string_view errorMsg;
    NSLock *lock = jslock();
    BOOL lockSuccess = [lock lockBeforeDate:[NSDate dateWithTimeIntervalSinceNow:1]];
    auto tryCatch = hippy::napi::CreateTryCatchScope(true, context);
    SharedCtxValuePtr result = context->RunScript(view, fileName);
    if (tryCatch->HasCaught()) {
        errorMsg = std::move(tryCatch->GetExceptionMessage());
    }
    if (lockSuccess) {
        [lock unlock];
    }
    *error = !StringViewUtils::IsEmpty(errorMsg) ? [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@{
        NSLocalizedDescriptionKey: StringViewToNSString(errorMsg)}] : nil;
    id objcResult = ObjectFromCtxValue(context, result);
    return objcResult;
}

- (void)executeBlockOnJavaScriptQueue:(dispatch_block_t)block {
    if (!self.ready) {
        [_pendingCalls addObject:block];
        return;
    }
    auto engine = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:self.enginekey]->GetEngine();
    if (engine) {
        auto runner = engine->GetJsTaskRunner();
        if (footstone::Worker::IsTaskRunning() && runner == footstone::runner::TaskRunner::GetCurrentTaskRunner()) {
            block();
        } else {
            engine->GetJsTaskRunner()->PostTask(block);
        }
    }
}

- (void)executeAsyncBlockOnJavaScriptQueue:(dispatch_block_t)block {
    if (!self.ready) {
        [_pendingCalls addObject:block];
        return;
    }
    auto engine = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:self.enginekey]->GetEngine();
    if (engine) {
        engine->GetJsTaskRunner()->PostTask(block);
    }
}

- (void)injectJSONText:(NSString *)script asGlobalObjectNamed:(NSString *)objectName callback:(HippyJavaScriptCallback)onComplete {
    HippyAssert(nil != script, @"param 'script' can't be nil");
    if (nil == script) {
        if (onComplete) {
            NSString *errorMessage = [NSString stringWithFormat:@"param 'script' is nil"];
            NSError *error = [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@{ NSLocalizedDescriptionKey: errorMessage }];
            onComplete(@(NO), error);
        }
        return;
    }
    if (HIPPY_DEBUG) {
        HippyAssert(HippyJSONParse(script, NULL) != nil, @"%@ wasn't valid JSON!", script);
    }

    __weak HippyJSExecutor *weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        @autoreleasepool {
            HippyJSExecutor *strongSelf = weakSelf;
            if (!strongSelf || !strongSelf.isValid) {
                return;
            }
            string_view json_view = NSStringToU8StringView(script);
            string_view name_view = NSStringToU8StringView(objectName);
            auto context = strongSelf.pScope->GetContext();
            auto tryCatch = hippy::napi::CreateTryCatchScope(true, context);
            auto global_object = context->GetGlobalObject();
            auto name_key = context->CreateString(name_view);
            auto engine = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:strongSelf.enginekey];
            auto json_value = engine->GetEngine()->GetVM()->ParseJson(context, json_view);
            context->SetProperty(global_object, name_key, json_value);
            if (tryCatch->HasCaught()) {
                string_view errorMsg = tryCatch->GetExceptionMessage();
                NSError *error = [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@{
                    NSLocalizedDescriptionKey: StringViewToNSString(errorMsg)}];
                onComplete(@(NO), error);
            }
            else {
                onComplete(@(YES), nil);
            }
        }
    }];
}

- (NSString *)completeWSURLWithBridge:(HippyBridge *)bridge {
    if (![bridge.delegate respondsToSelector:@selector(shouldStartInspector:)] ||
        ![bridge.delegate shouldStartInspector:bridge]) {
        return @"";
    }
    HippyDevInfo *devInfo = [[HippyDevInfo alloc] init];
    if (bridge.debugURL) {
        NSURL *debugURL = bridge.debugURL;
        devInfo.scheme = [debugURL scheme];
        devInfo.ipAddress = [debugURL host];
        devInfo.port = [NSString stringWithFormat:@"%@", [debugURL port]];
        devInfo.versionId = [HippyBundleURLProvider parseVersionId:[debugURL path]];
        [devInfo parseWsURLWithURLQuery:[debugURL query]];
    } else {
        HippyBundleURLProvider *bundleURLProvider = [HippyBundleURLProvider sharedInstance];
        devInfo.scheme = bundleURLProvider.scheme;
        devInfo.ipAddress = bundleURLProvider.localhostIP;
        devInfo.port = bundleURLProvider.localhostPort;
        devInfo.versionId = bundleURLProvider.versionId;
        devInfo.wsURL = bundleURLProvider.wsURL;
    }
    NSString *deviceName = [[UIDevice currentDevice] name];
    NSString *clientId = HippyMD5Hash([NSString stringWithFormat:@"%@%p", deviceName, bridge]);

    return [devInfo assembleFullWSURLWithClientId:clientId contextName:bridge.contextName];
}

@end
