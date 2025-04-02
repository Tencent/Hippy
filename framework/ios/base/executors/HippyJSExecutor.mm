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

#import "HippyJSExecutor.h"
#import "HippyJSExecutor+Internal.h"
#import "VFSUriHandler.h"
#import "HippyAssert.h"
#import "HippyBundleURLProvider.h"
#import "HippyDefines.h"
#import "HippyDevInfo.h"
#import "HippyDevMenu.h"
#import "HippyJSEnginesMapper.h"
#import "HippyOCTurboModule+Inner.h"
#import "HippyRedBox.h"
#import "HippyUtils.h"
#import "HippyTurboModuleManager.h"
#import "HippyLog.h"
#import "HippyUtils.h"
#import "HippyFootstoneUtils.h"
#import "NSObject+CtxValue.h"
#import "TypeConverter.h"
#import "HippyBridge+Private.h"
#import "HippyBridge+ModuleManage.h"

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
#include "driver/vm/js_vm.h"
#include "driver/scope.h"
#include "driver/js_driver_utils.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"
#include "footstone/task_runner.h"
#include "footstone/task.h"
#include "vfs/handler/uri_handler.h"

#ifdef ENABLE_INSPECTOR
#include "devtools/devtools_data_source.h"
#endif

#ifdef JS_JSC
#include "driver/napi/jsc/jsc_ctx.h"
#include "driver/napi/jsc/jsc_ctx_value.h"
#endif

#ifdef JS_HERMES
#include "driver/napi/hermes/hermes_ctx.h"
#include "driver/napi/hermes/hermes_ctx_value.h"
#endif


using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;
using SharedCtxPtr = std::shared_ptr<hippy::napi::Ctx>;
using WeakCtxPtr = std::weak_ptr<hippy::napi::Ctx>;
using SharedCtxValuePtr = std::shared_ptr<hippy::napi::CtxValue>;
using WeakCtxValuePtr = std::weak_ptr<hippy::napi::CtxValue>;


constexpr char kGlobalKey[] = "global";
constexpr char kHippyKey[] = "Hippy";
constexpr char kHippyNativeGlobalKey[] = "__HIPPYNATIVEGLOBAL__";
constexpr char kHippyRequireModuleConfigFuncKey[] = "nativeRequireModuleConfig";
constexpr char kHippyFlushQueueImmediateFuncKey[] = "nativeFlushQueueImmediate";
constexpr char kHippyGetTurboModule[] = "getTurboModule";


@interface HippyJSExecutor () {
    // The hippy scope
    std::shared_ptr<hippy::Scope> _pScope;
    
    // Whether js engine is inspectable, currently for jsc
    BOOL _isInspectable;
}

/// Whether JSExecutor has done setup.
@property (nonatomic, assign) BOOL ready;
/// Pending blocks to be executed on JS queue.
@property (nonatomic, strong) NSMutableArray<dispatch_block_t> *pendingCalls;;

@end


@implementation HippyJSExecutor

@synthesize pScope = _pScope;

- (void)setup {
    HippyBridge *bridge = self.bridge;
    const std::string engineType = bridge.usingHermesEngine ? hippy::VM::kJSEngineHermes : hippy::VM::kJSEngineJSC;
    auto engine = [[HippyJSEnginesMapper defaultInstance] createJSEngineResourceForKey:self.enginekey
                                                                            engineType:engineType
                                                                               isDebug:bridge.debugMode];
    const char *pName = [self.enginekey UTF8String] ?: "";
    auto scope = engine->GetEngine()->CreateScope(pName);
    
    __weak __typeof(self)weakSelf = self;
    if (!bridge.usingHermesEngine) {
        hippy::base::RegisterFunction taskEndCB = [weakSelf](void *) {
                __strong __typeof(weakSelf)strongSelf = weakSelf;
                if (strongSelf) {
                    handleJsExcepiton(strongSelf.pScope);
            }
        };
        scope->RegisterExtraCallback(hippy::kAsyncTaskEndKey, taskEndCB);
    }
    
    dispatch_semaphore_t scopeSemaphore = dispatch_semaphore_create(0);
    footstone::TimePoint startPoint = footstone::TimePoint::SystemNow();
    engine->GetEngine()->GetJsTaskRunner()->PostTask([weakSelf, scopeSemaphore, startPoint](){
        __strong __typeof(weakSelf)strongSelf = weakSelf;
        HippyBridge *bridge = strongSelf.bridge;
        if (!bridge) {
            return;
        }
        
        dispatch_semaphore_wait(scopeSemaphore, DISPATCH_TIME_FOREVER);
        auto scope = strongSelf.pScope;
        scope->CreateContext();
        auto context = scope->GetContext();
        auto global_object = context->GetGlobalObject();
            
#if defined(ENABLE_INSPECTOR) && defined(JS_HERMES)
        // setup debugger agent for hermes
        setupDebuggerAgent(bridge, context, weakSelf);
#endif /* defined(ENABLE_INSPECTOR) && defined(JS_HERMES) */
        
        
        // add `global` property to global object
        auto user_global_object_key = context->CreateString(kGlobalKey);
        context->SetProperty(global_object, user_global_object_key, global_object);
        
        // add `Hippy` property to global object
        auto hippy_key = context->CreateString(kHippyKey);
        context->SetProperty(global_object, hippy_key, context->CreateObject());
        
        // inject device info to `__HIPPYNATIVEGLOBAL__`
        [strongSelf injectDeviceInfoAsHippyNativeGlobal:bridge context:context globalObject:global_object];
        
        // register `nativeRequireModuleConfig` function
        [strongSelf registerRequiredModuleConfigFuncToJS:context globalObject:global_object scope:scope];
        
        // register `nativeFlushQueueImmediate` function
        [strongSelf registerFlushQueueImmediateFuncToJS:context globalObject:global_object scope:scope];
        
        // register `getTurboModule` function
        [strongSelf registerGetTurboModuleFuncToJS:context globalObject:global_object scope:scope];
        
        // call finish block
        if (strongSelf.contextCreatedBlock) {
            strongSelf.contextCreatedBlock();
        }
        scope->SyncInitialize();
        
        // performance record
        footstone::TimePoint endTime = footstone::TimePoint::SystemNow();
        auto entry = scope->GetPerformance()->PerformanceNavigation(hippy::kPerfNavigationHippyInit);
        if (entry) {
            entry->SetHippyJsEngineInitStart(startPoint);
            entry->SetHippyJsEngineInitEnd(endTime);
            entry->SetHippyNativeInitStart(strongSelf.bridge.startTime);
            entry->SetHippyNativeInitEnd(endTime);
        }
        
        // the last, execute pending blocks
        NSArray<dispatch_block_t> *pendingCalls;
        @synchronized (strongSelf) {
            strongSelf.ready = YES;
            pendingCalls = [strongSelf.pendingCalls copy];
            [strongSelf.pendingCalls removeAllObjects];
        }
        [pendingCalls enumerateObjectsUsingBlock:^(dispatch_block_t  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
            [strongSelf executeBlockOnJavaScriptQueue:obj];
        }];
    });
    _pScope = scope;
    dispatch_semaphore_signal(scopeSemaphore);
    
#ifdef ENABLE_INSPECTOR
    [self executeAsyncBlockOnJavaScriptQueue:^{
        __strong __typeof(weakSelf)strongSelf = weakSelf;
        HippyBridge *bridge = strongSelf.bridge;
        if (!bridge) {
            return;
        }
        if (bridge && bridge.debugMode) {
            NSString *wsURL = [strongSelf completeWSURLWithBridge:bridge];
            auto scope = strongSelf->_pScope;
            if (wsURL.length > 0 && scope) {
                auto engine = scope->GetEngine().lock();
                if (!engine) {
                    return;
                }
                auto workerManager = std::make_shared<footstone::WorkerManager>(1);
            	auto devtools_data_source = std::make_shared<hippy::devtools::DevtoolsDataSource>();
		        devtools_data_source->CreateDevtoolsService([wsURL UTF8String], workerManager);
                if (bridge.usingHermesEngine) {
                    // InitDevTools will bind devtools_data_source to scope
                    hippy::JsDriverUtils::InitDevTools(scope, engine->GetVM(), devtools_data_source);
                } else {
                    scope->SetDevtoolsDataSource(devtools_data_source);
                }
            }
        }
    }];
#endif
}

- (instancetype)initWithEngineKey:(NSString *)engineKey bridge:(HippyBridge *)bridge {
    NSParameterAssert(engineKey.length > 0);
    if (self = [super init]) {
        _valid = YES;
        _ready = NO;
        _enginekey = engineKey;
        _bridge = bridge;
        _pendingCalls = [NSMutableArray array];
        HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor Init %p, engineKey:%@", self, engineKey);
    }
    return self;
}

- (void)dealloc {
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor dealloc %p", self);
    [self invalidate];
}

- (void)invalidate {
    if (!self.isValid) {
        return;
    }
    _valid = NO;
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor invalide %p", self);
    
    HippyBridge *bridge = self.bridge;
#ifdef ENABLE_INSPECTOR
    auto devtools_data_source = self.pScope->GetDevtoolsDataSource();
    if (devtools_data_source) {
        bool reload = bridge.invalidateReason == HippyInvalidateReasonReload ? true : false;
        devtools_data_source->Destroy(reload);
    }
#endif /* ENABLE_INSPECTOR */

#ifdef JS_JSC
    if (self.pScope && bridge && !bridge.usingHermesEngine) {
        auto jsc_context = std::static_pointer_cast<hippy::napi::JSCCtx>(self.pScope->GetContext());
        static CFStringRef delName = CFSTR("HippyJSContext(delete)");
        jsc_context->SetName(delName);
    }
#endif /* JS_JSC */

    self.pScope->WillExit();
    _pScope = nullptr;
    NSString *enginekey = self.enginekey;
    if (!enginekey) {
        return;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        auto engineRsc = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:enginekey];
        [[HippyJSEnginesMapper defaultInstance] removeEngineResourceForKey:enginekey];
        dispatch_async(dispatch_get_main_queue(), ^{
            // Make a tiny delay to ensure the engine resource is released on the main thread
            HippyLogInfo(@"Remove EngineRsc, UseCount:%ld", engineRsc.use_count());
        });
    });
}


#pragma mark - Subprocedures of Setup

#if defined(ENABLE_INSPECTOR) && defined(JS_HERMES)
static void setupDebuggerAgent(HippyBridge *bridge, const std::shared_ptr<hippy::Ctx> &context, HippyJSExecutor *const __weak weakSelf) {
    if (bridge.debugMode && bridge.usingHermesEngine) {
        // Create cdp agent for hermes
        auto hermesCtx = std::static_pointer_cast<hippy::HermesCtx>(context);
        hermesCtx->SetupDebugAgent([weakSelf](facebook::hermes::debugger::RuntimeTask fn) {
            __strong __typeof(weakSelf)strongSelf = weakSelf;
            auto scope = strongSelf.pScope;
            if (scope && scope->GetTaskRunner() && scope->GetContext()) {
                auto hermes_ctx = std::static_pointer_cast<hippy::HermesCtx>(scope->GetContext());
                scope->GetTaskRunner()->PostTask(^{
                    fn(*hermes_ctx->GetRuntime());
                });
            }
        }, [weakSelf](const std::string &message) {
            // Process CDP response or event and send message back to the Chrome debugger
            // HippyLogTrace(@"To Debugger: %s\n", message.c_str());
            __strong __typeof(weakSelf)strongSelf = weakSelf;
            auto scope = strongSelf.pScope;
            if (scope) {
                auto devtoolsDataSource = scope->GetDevtoolsDataSource();
                if (devtoolsDataSource) {
                    devtoolsDataSource->GetNotificationCenter()->vm_response_notification->ResponseToFrontend(message);
                };
            }
        });
    }
}
#endif /* defined(ENABLE_INSPECTOR) && defined(JS_HERMES) */

- (void)injectDeviceInfoAsHippyNativeGlobal:(HippyBridge *)bridge 
                                    context:(const std::shared_ptr<hippy::Ctx> &)context
                               globalObject:(const std::shared_ptr<hippy::CtxValue> &)globalObject {
    NSMutableDictionary *deviceInfo = [NSMutableDictionary dictionaryWithDictionary:[bridge deviceInfo]];
    NSDictionary *debugInfo = @{@"Debug" : @{@"debugClientId" : [self getClientID]}};
    [deviceInfo addEntriesFromDictionary:debugInfo];
    
    auto key = context->CreateString(kHippyNativeGlobalKey);
    auto value = [deviceInfo convertToCtxValue:context];
    if (key && value) {
        context->SetProperty(globalObject, key, value);
    }
}

- (void)registerRequiredModuleConfigFuncToJS:(const std::shared_ptr<hippy::Ctx> &)context
                                globalObject:(const std::shared_ptr<hippy::CtxValue> &)globalObject
                                       scope:(const std::shared_ptr<hippy::Scope> &)scope {
    __weak __typeof(self)weakSelf = self;
    auto requireModuleConfigFunWrapper = std::make_unique<hippy::FunctionWrapper>([](hippy::CallbackInfo& info, void* data) {
        @autoreleasepool {
            HippyJSExecutor *strongSelf = (__bridge HippyJSExecutor*)data;
            HippyBridge *bridge = strongSelf.bridge;
            if (!strongSelf.valid || !bridge || !strongSelf.pScope) {
                return;
            }
            
            const auto &context = strongSelf.pScope->GetContext();
            if (context->IsString(info[0])) {
                NSString *moduleName = ObjectFromCtxValue(context, info[0]);
                if (moduleName) {
                    NSArray *result = [bridge configForModuleName:moduleName];
                    info.GetReturnValue()->Set([HippyNullIfNil(result) convertToCtxValue:context]);
                }
            }
        }
    }, (__bridge void*)weakSelf);
    auto requireModuleConfigFunction = context->CreateFunction(requireModuleConfigFunWrapper);
    scope->SaveFunctionWrapper(std::move(requireModuleConfigFunWrapper));
    context->SetProperty(globalObject, context->CreateString(kHippyRequireModuleConfigFuncKey), requireModuleConfigFunction);
}

- (void)registerFlushQueueImmediateFuncToJS:(const std::shared_ptr<hippy::Ctx> &)context
                               globalObject:(const std::shared_ptr<hippy::CtxValue> &)globalObject
                                      scope:(const std::shared_ptr<hippy::Scope> &)scope {
    __weak __typeof(self)weakSelf = self;
    auto nativeFlushQueueFunWrapper = std::make_unique<hippy::FunctionWrapper>([](hippy::CallbackInfo& info, void* data) {
        @autoreleasepool {
            HippyJSExecutor *strongSelf = (__bridge HippyJSExecutor*)data;
            HippyBridge *bridge = strongSelf.bridge;
            if (!strongSelf.valid || !bridge || !strongSelf.pScope) {
                return;
            }
            
            const auto &context = strongSelf.pScope->GetContext();
            if (context->IsArray(info[0])) {
                NSArray *calls = ObjectFromCtxValue(context, info[0]);
                [bridge handleBuffer:calls batchEnded:NO];
            }
        }
    }, (__bridge void*)weakSelf);
    auto nativeFlushQueueFunction = context->CreateFunction(nativeFlushQueueFunWrapper);
    scope->SaveFunctionWrapper(std::move(nativeFlushQueueFunWrapper));
    context->SetProperty(globalObject, context->CreateString(kHippyFlushQueueImmediateFuncKey), nativeFlushQueueFunction);
}

- (void)registerGetTurboModuleFuncToJS:(const std::shared_ptr<hippy::Ctx> &)context
                          globalObject:(const std::shared_ptr<hippy::CtxValue> &)globalObject
                                 scope:(const std::shared_ptr<hippy::Scope> &)scope {
    __weak __typeof(self)weakSelf = self;
    auto turbo_wrapper = std::make_unique<hippy::FunctionWrapper>([](hippy::CallbackInfo& info, void* data) {
        @autoreleasepool {
            HippyJSExecutor *strongSelf = (__bridge HippyJSExecutor*)data;
            if (!strongSelf || !strongSelf.pScope) {
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
    context->SetProperty(globalObject, context->CreateString(kHippyGetTurboModule), turbo_function);
}


#pragma mark -

- (NSString *)getClientID {
    NSString *deviceName = [[UIDevice currentDevice] name];
    NSString *clientId = HippyMD5Hash([NSString stringWithFormat:@"%@%p", deviceName, self]);
    return clientId;
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
        }];
    }
}

- (SharedCtxValuePtr)JSTurboObjectWithName:(NSString *)name {
    // create HostObject by name
    HippyBridge *bridge = self.bridge;
    HippyOCTurboModule *turboModule = [bridge turboModuleWithName:name];
    auto scope = self.pScope;
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
        std::any slot_any = info.GetSlot();
        auto any_pointer = std::any_cast<void*>(&slot_any);
        auto scope_wrapper = reinterpret_cast<hippy::ScopeWrapper*>(static_cast<void *>(*any_pointer));
            auto scope = scope_wrapper->scope.lock();
            FOOTSTONE_CHECK(scope);
            auto turbo_wrapper = reinterpret_cast<TurboWrapper*>(data);
            HippyOCTurboModule *turbo = turbo_wrapper->module;
            auto name = turbo_wrapper->name;
            auto result = [turbo invokeOCMethod:scope->GetContext() this_val:name args:argv.data() count:argv.size()];
            info.GetReturnValue()->Set(result);
        }, turbo_wrapper.get());
        [turbo saveTurboWrapper:name turbo:std::move(turbo_wrapper)];
      std::any slot_any = info.GetSlot();
      auto any_pointer = std::any_cast<void*>(&slot_any);
      auto scope_wrapper = reinterpret_cast<hippy::ScopeWrapper*>(static_cast<void *>(*any_pointer));
        auto scope = scope_wrapper->scope.lock();
        FOOTSTONE_CHECK(scope);
        auto func = scope->GetContext()->CreateFunction(func_wrapper);
        scope->SaveFunctionWrapper(std::move(func_wrapper));
        info.GetReturnValue()->Set(func);
        CFRelease(data);
    }, (void *)retainedTurboModule);
    
#ifdef JS_HERMES
    // Save function wrapper
    if (bridge.usingHermesEngine) {
        auto proxy = scope->GetContext()->DefineProxy(nullptr);
        auto handler = scope->GetContext()->DefineProxyHandler(wrapper);
        auto proxy_ctx = std::static_pointer_cast<hippy::driver::napi::HermesCtxValue>(proxy);
        auto handler_ctx = std::static_pointer_cast<hippy::driver::napi::HermesCtxValue>(handler);
        auto& runtime = std::static_pointer_cast<hippy::driver::napi::HermesCtx>(scope->GetContext())->GetRuntime();
        auto constructor = proxy_ctx->GetValue(runtime).asObject(*runtime).asFunction(*runtime);
        auto instance = constructor.callAsConstructor(*runtime, { handler_ctx->GetValue(runtime) });
        auto obj = std::make_shared<hippy::driver::napi::HermesCtxValue>(*runtime, instance);
        scope->SaveFunctionWrapper(std::move(wrapper));
        scope->SetTurboInstance(turbo_name, obj);
        return obj;
    } else {
      auto obj = scope->GetContext()->DefineProxy(wrapper);
      scope->SaveFunctionWrapper(std::move(wrapper));
      scope->SetTurboInstance(turbo_name, obj);
      return obj;
    }
#else
  auto obj = scope->GetContext()->DefineProxy(wrapper);
  scope->SaveFunctionWrapper(std::move(wrapper));
  scope->SetTurboInstance(turbo_name, obj);
  return obj;
#endif /* JS_HERMES */
}

- (void)setContextName:(NSString *)contextName {
#ifdef JS_JSC
#ifdef JS_HERMES
    // TODO: setContextName not support Hermes now
    if (self.bridge.usingHermesEngine) {
        return;
    }
#endif /* JS_HERMES */
    if (!contextName) {
        return;
    }
    __weak __typeof(self)weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        __strong __typeof(weakSelf)strongSelf = weakSelf;
        if (!strongSelf.pScope) {
            return;
        }
        SharedCtxPtr context = strongSelf.pScope->GetContext();
        if (!context) {
            return;
        }
        auto tryCatch = hippy::TryCatch::CreateTryCatchScope(true, context);
        auto jsc_context = std::static_pointer_cast<hippy::napi::JSCCtx>(context);
        NSString *finalName = [NSString stringWithFormat:@"HippyContext: %@", contextName];
        jsc_context->SetName((__bridge CFStringRef)finalName);
        if (tryCatch->HasCaught()) {
            HippyLogWarn(@"set context throw exception");
        }
    }];
#endif //JS_JSC
}

- (void)setInspecable:(BOOL)inspectable {
#ifdef JS_HERMES
    // judge js engine type
    if (self.bridge.usingHermesEngine) {
        return;
    }
#endif /* JS_HERMES */
    
#ifdef JS_JSC
    _isInspectable = inspectable;
#if defined(__IPHONE_16_4) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_16_4
    if (@available(iOS 16.4, *)) {
        WeakCtxPtr weak_ctx = self.pScope->GetContext();
        [self executeBlockOnJavaScriptQueue:^{
            SharedCtxPtr context = weak_ctx.lock();
            if (!context) {
                return;
            }
            auto jsc_context = std::static_pointer_cast<hippy::napi::JSCCtx>(context);
            JSGlobalContextRef contextRef = jsc_context->context_;
            JSGlobalContextSetInspectable(contextRef, inspectable);
        }];
    }
#endif //defined(__IPHONE_16_4) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_16_4
#endif //JS_JSC
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

- (void)addInfoToGlobalObject:(NSDictionary*)addInfoDict{
    string_view str(kHippyNativeGlobalKey);
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
                        std::vector<SharedCtxValuePtr> function_params(arguments.count);
                        for (NSUInteger i = 0; i < arguments.count; i++) {
                            id obj = arguments[i];
                            function_params[i] = [obj convertToCtxValue:context];
                        }
                        auto tryCatch = hippy::TryCatch::CreateTryCatchScope(true, context);
                        resultValue = context->CallFunction(method_value, context->GetGlobalObject(), arguments.count, function_params.data());
                        if (tryCatch->HasCaught()) {
                            exception = tryCatch->GetExceptionMessage();
                        }
                    } else {
                        NSString *errMsg = [NSString stringWithFormat:@"%@ is not a function", method];
                        executeError = HippyErrorWithMessageAndModuleName(errMsg, moduleName);
                    }
                } else {
                    NSString *errMsg = [NSString stringWithFormat:@"property/function %@ not found in __hpBatchedBridge", method];
                    executeError = HippyErrorWithMessageAndModuleName(errMsg, moduleName);
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
            HippyHandleException(reportException);
        }
    }];
}

- (void)executeApplicationScript:(NSData *)script sourceURL:(NSURL *)sourceURL onComplete:(HippyJavaScriptCallback)onComplete {
    HippyAssertParam(script);
    HippyAssertParam(sourceURL);
    __weak HippyJSExecutor* weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        HippyJSExecutor *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.isValid) {
            onComplete(nil, HippyErrorWithMessageAndModuleName(@"jsexecutor is not invalid", strongSelf.bridge.moduleName));
            return;
        }
        NSError *error = nil;
        auto entry = strongSelf.pScope->GetPerformance()->PerformanceNavigation(hippy::kPerfNavigationHippyInit);
        string_view url = [[sourceURL absoluteString] UTF8String]?:"";
        entry->BundleInfoOfUrl(url).execute_source_start_ = footstone::TimePoint::SystemNow();
        id result = executeApplicationScript(script,
                                             sourceURL,
                                             strongSelf.pScope->GetContext(),
                                             &error);
        entry->BundleInfoOfUrl(url).execute_source_end_ = footstone::TimePoint::SystemNow();
        if (onComplete) {
            onComplete(result, error);
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

static NSError *executeApplicationScript(NSData *script, 
                                         NSURL *sourceURL,
                                         SharedCtxPtr context,
                                         __strong NSError **error) {
    const char *scriptBytes = reinterpret_cast<const char *>([script bytes]);
    string_view view = string_view::new_from_utf8(scriptBytes, [script length]);
    string_view fileName = NSStringToU16StringView([sourceURL absoluteString]);
    string_view errorMsg;
    NSLock *lock = jslock();
    BOOL lockSuccess = [lock lockBeforeDate:[NSDate dateWithTimeIntervalSinceNow:1]];
    
    auto tryCatch = hippy::TryCatch::CreateTryCatchScope(true, context);
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
    @synchronized (self) {
        if (!self.ready) {
            [self.pendingCalls addObject:block];
            return;
        }
    }
    auto engineRsc = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:self.enginekey];
    if (!engineRsc) {
        return;
    }
    auto engine = engineRsc->GetEngine();
    if (engine) {
        dispatch_block_t autoreleaseBlock = ^(void){
            if (block) {
                @autoreleasepool {
                    block();
                }
            }
        };
        auto runner = engine->GetJsTaskRunner();
        if (footstone::Worker::IsTaskRunning() && runner == footstone::runner::TaskRunner::GetCurrentTaskRunner()) {
            autoreleaseBlock();
        } else if (runner) {
            runner->PostTask(autoreleaseBlock);
        }
    }
}

- (void)executeAsyncBlockOnJavaScriptQueue:(dispatch_block_t)block {
    @synchronized (self) {
        if (!self.ready) {
            [self.pendingCalls addObject:block];
            return;
        }
    }
    auto engineRsc = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:self.enginekey];
    if (!engineRsc) {
        return;
    }
    auto engine = engineRsc->GetEngine();
    if (engine) {
        auto runner = engine->GetJsTaskRunner();
        if (runner) {
            dispatch_block_t autoreleaseBlock = ^(void){
                if (block) {
                    @autoreleasepool {
                        block();
                    }
                }
            };
            runner->PostTask(autoreleaseBlock);
        }
    }
}

- (void)injectObjectSync:(NSObject *)value asGlobalObjectNamed:(NSString *)objectName callback:(HippyJavaScriptCallback)onComplete {
    if (!objectName || !value) {
        if (onComplete) {
            NSError *error = HippyErrorWithMessage(@"Inject param invalid");
            onComplete(@(NO), error);
        }
        return;
    }
    if (!self.isValid || !self.pScope) {
        return;
    }
    auto context = self.pScope->GetContext();
    auto tryCatch = hippy::TryCatch::CreateTryCatchScope(true, context);
    auto globalObject = context->GetGlobalObject();
    auto nameKey = context->CreateString(objectName.UTF8String);
    auto ctxValue = [value convertToCtxValue:context];
    if (nameKey && ctxValue) {
        context->SetProperty(globalObject, nameKey, [value convertToCtxValue:context]);
    } else {
        HippyLogError(@"Convert Error while inject:%@ for:%@", value, objectName);
    }
    if (tryCatch && tryCatch->HasCaught()) {
        NSString *errorMsg = StringViewToNSString(tryCatch->GetExceptionMessage());
        NSError *error = HippyErrorWithMessage(errorMsg);
        if (onComplete) {
            onComplete(@(NO), error);
        } else {
            HippyLogError(@"Error(%@) while inject:%@ for:%@", errorMsg, value, objectName);
        }
    } else if (onComplete) {
        onComplete(@(YES), nil);
    }
}

- (void)injectObjectAsync:(NSObject *)value asGlobalObjectNamed:(NSString *)objectName callback:(HippyJavaScriptCallback)onComplete {
    __weak __typeof(self)weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        __strong __typeof(weakSelf)strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.isValid) {
            return;
        }
        [strongSelf injectObjectSync:value asGlobalObjectNamed:objectName callback:onComplete];
    }];
}

- (NSString *)completeWSURLWithBridge:(HippyBridge *)bridge {
    if ([bridge.delegate respondsToSelector:@selector(shouldStartInspector:)] &&
        [bridge.delegate shouldStartInspector:bridge] == NO) {
        return @"";
    }
    HippyDevInfo *devInfo = [[HippyDevInfo alloc] init];
    if ([bridge.delegate respondsToSelector:@selector(inspectorSourceURLForBridge:)]) {
        NSURL *debugURL = [bridge.delegate inspectorSourceURLForBridge:bridge];
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
    return [devInfo assembleFullWSURLWithClientId:[self getClientID] contextName:bridge.contextName isHermesEngine:bridge.usingHermesEngine];
}


#pragma mark - Exception Handle

static void handleJsExcepiton(std::shared_ptr<hippy::Scope> scope) {
    if (!scope) {
        return;
    }
#ifdef JS_JSC
    std::shared_ptr<hippy::napi::JSCCtx> context = std::static_pointer_cast<hippy::napi::JSCCtx>(scope->GetContext());
    std::shared_ptr<hippy::napi::JSCCtxValue> exception = std::static_pointer_cast<hippy::napi::JSCCtxValue>(context->GetException());
    if (exception) {
        // if native does not handled, rethrow to js
        if (!context->IsExceptionHandled()) {
            constexpr char kHippyExceptionEventName[] = "uncaughtException";
            hippy::vm::VM::HandleException(context, kHippyExceptionEventName, exception);
        }
        string_view exceptionStrView = context->GetExceptionMessage(exception);
        auto errU8Str = StringViewUtils::ConvertEncoding(exceptionStrView, string_view::Encoding::Utf8).utf8_value();
        std::string errStr = StringViewUtils::ToStdString(errU8Str);
        NSError *error = HippyErrorWithMessage([NSString stringWithUTF8String:errStr.c_str()]);
        HippyFatal(error);
        context->SetException(nullptr);
        context->SetExceptionHandled(true);
    }
#endif /* JS_JSC */
}


@end
