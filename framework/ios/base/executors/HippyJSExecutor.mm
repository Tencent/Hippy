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

#import "FootstoneUtils.h"
#import "HippyAssert.h"
#import "HippyBundleURLProvider.h"
#import "HippyDefines.h"
#import "HippyDevInfo.h"
#import "HippyJSExecutor.h"
#import "HippyJSEnginesMapper.h"
#import "HippyOCTurboModule+Inner.h"
#import "HippyPerformanceLogger.h"
#import "HippyTurboModuleManager.h"
#import "HippyUriLoader.h"
#import "NativeRenderLog.h"
#import "NativeRenderUtils.h"
#import "NSObject+ToJSCtxValue.h"

#include "driver/engine.h"
#include "driver/napi/js_native_api.h"
#include "driver/scope.h"
#include "footstone/string_view.h"

#ifdef JS_USE_JSC
#include "driver/napi/jsc/js_native_api_jsc.h"
#endif //JS_USE_JSC

NSString *const HippyJSCThreadName = @"com.tencent.hippy.JavaScript";

using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;
using SharedCtxPtr = std::shared_ptr<hippy::napi::Ctx>;
using WeakCtxPtr = std::weak_ptr<hippy::napi::Ctx>;
using SharedCtxValuePtr = std::shared_ptr<hippy::napi::CtxValue>;
using WeakCtxValuePtr = std::weak_ptr<hippy::napi::CtxValue>;

@interface HippyJSExecutor () {
    // Set at setUp time:
    HippyPerformanceLogger *_performanceLogger;
    std::unique_ptr<hippy::napi::ObjcTurboEnv> _turboRuntime;
    dispatch_semaphore_t _moduleSemaphore;
    std::shared_ptr<HippyUriLoader> _defaultUriLoader;
    std::weak_ptr<hippy::vfs::UriLoader> _uriLoader;
}

@end

@implementation HippyJSExecutor

- (void)setBridge:(HippyBridge *)bridge {
    _bridge = bridge;
    _performanceLogger = [bridge performanceLogger];
}

- (instancetype)initWithEngineKey:(NSString *)engineKey bridge:(HippyBridge *)bridge {
    if (self = [super init]) {
        _valid = YES;
        // maybe bug in JavaScriptCore：
        // JSContextRef held by JSContextGroupRef cannot be deallocated,
        // unless JSContextGroupRef is deallocated
        self.enginekey = engineKey;
        self.bridge = bridge;

        auto engine = [[HippyJSEnginesMapper defaultInstance] createJSEngineResourceForKey:self.enginekey];
        std::unique_ptr<hippy::Engine::RegisterMap> map = [self registerMap];
        const char *pName = [engineKey UTF8String] ?: "";
        std::shared_ptr<hippy::Scope> scope = engine->GetEngine()->CreateScope(pName, std::move(map));
        self.pScope = scope;
        _moduleSemaphore = dispatch_semaphore_create(0);
        [self initURILoader];
        NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor Init %p, engineKey:%@", self, engineKey);
#ifdef ENABLE_INSPECTOR
        if (bridge.debugMode) {
            NSString *wsURL = [self completeWSURLWithBridge:bridge];
            auto workerManager = std::make_shared<footstone::WorkerManager>(1);
            auto devtools_data_source = std::make_shared<hippy::devtools::DevtoolsDataSource>([wsURL UTF8String], workerManager);
            devtools_data_source->SetRuntimeDebugMode(bridge.debugMode);
            self.pScope->SetDevtoolsDataSource(devtools_data_source);
        }
#endif
    }

    return self;
}

- (void)initURILoader {
    if (!_defaultUriLoader) {
        _defaultUriLoader = std::make_shared<HippyUriLoader>();
        self.pScope->SetUriLoader(_defaultUriLoader);
    }
}

- (void)setUriLoader:(std::weak_ptr<hippy::vfs::UriLoader>)uriLoader {
    auto loader = uriLoader.lock();
    if (loader) {
        auto exsitedLoader = _uriLoader.lock();
        if (exsitedLoader) {
            if (loader != exsitedLoader) {
                _uriLoader = uriLoader;
                self.pScope->SetUriLoader(uriLoader);
            }
        }
        else {
            _uriLoader = uriLoader;
            self.pScope->SetUriLoader(uriLoader);
        }
        _defaultUriLoader = nil;
    }
    else {
        _uriLoader = uriLoader;
        [self initURILoader];
    }
}

- (std::weak_ptr<hippy::vfs::UriLoader>)uriLoader {
    auto uriLoader = _uriLoader.lock();
    return uriLoader?_uriLoader:_defaultUriLoader;
}

- (std::unique_ptr<hippy::Engine::RegisterMap>)registerMap {
    __weak HippyJSExecutor *weakSelf = self;
    __weak id<HippyBridgeDelegate> weakBridgeDelegate = self.bridge.delegate;
    hippy::base::RegisterFunction taskEndCB = [weakSelf](void *) {
        @autoreleasepool {
            HippyJSExecutor *strongSelf = weakSelf;
            if (strongSelf) {
              [strongSelf->_bridge handleBuffer:nil batchEnded:YES];
            }
        }
    };
    hippy::base::RegisterFunction ctxCreateCB = [weakSelf, weakBridgeDelegate](void *p) {
        @autoreleasepool {
            HippyJSExecutor *strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            id<HippyBridgeDelegate> strongBridgeDelegate = weakBridgeDelegate;
            hippy::ScopeWrapper *wrapper = reinterpret_cast<hippy::ScopeWrapper *>(p);
            std::shared_ptr<hippy::Scope> scope = wrapper->scope_.lock();
            if (scope) {
                dispatch_semaphore_wait(strongSelf->_moduleSemaphore, DISPATCH_TIME_FOREVER);
                std::shared_ptr<hippy::napi::JSCCtx> context = std::static_pointer_cast<hippy::napi::JSCCtx>(scope->GetContext());
                context->RegisterGlobalInJs();
                context->RegisterClasses(scope);
                NSMutableDictionary *deviceInfo = [NSMutableDictionary dictionaryWithDictionary:[strongSelf.bridge deviceInfo]];
                if ([strongBridgeDelegate respondsToSelector:@selector(objectsBeforeExecuteCode)]) {
                    NSDictionary *customObjects = [strongBridgeDelegate objectsBeforeExecuteCode];
                    if (customObjects) {
                        [deviceInfo addEntriesFromDictionary:customObjects];
                    }
                }
                
                NSString *deviceName = [[UIDevice currentDevice] name];
                NSString *clientId = NativeRenderMD5Hash([NSString stringWithFormat:@"%@%p", deviceName, strongSelf]);
                NSDictionary *debugInfo = @{@"Debug" : @{@"debugClientId" : clientId}};
                [deviceInfo addEntriesFromDictionary:debugInfo];
                
                NSError *JSONSerializationError = nil;
                NSData *data = [NSJSONSerialization dataWithJSONObject:deviceInfo options:0 error:&JSONSerializationError];
                if (JSONSerializationError) {
                    NSString *errorString =
                        [NSString stringWithFormat:@"device parse error:%@, deviceInfo:%@", [JSONSerializationError localizedFailureReason], deviceInfo];
                    NSError *error = NativeRenderErrorWithMessageAndModuleName(errorString, strongSelf.bridge.moduleName);
                    HippyFatal(error, strongSelf.bridge);
                }
                NSString *string = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
                context->SetGlobalJsonVar("__HIPPYNATIVEGLOBAL__", NSStringToU8StringView(string));
                NSString *moduleConfig = [strongSelf.bridge moduleConfig];
                context->SetGlobalJsonVar("__hpBatchedBridgeConfig", NSStringToU8StringView(moduleConfig));
                hippy::napi::Ctx::NativeFunction nativeRequireModuleConfigFunc = [weakSelf](void *data) {
                    @autoreleasepool {
                        HippyJSExecutor *strongSelf = weakSelf;
                        if (!strongSelf.valid || !data) {
                            return strongSelf.pScope->GetContext()->CreateNull();
                        }
                        auto tuple_ptr = static_cast<hippy::napi::CBCtxValueTuple *>(data);
                        NSCAssert(1 == tuple_ptr->count_, @"nativeRequireModuleConfig should only contain 1 element");
                        auto ctxValue = tuple_ptr->arguments_[0];
                        const auto &context = strongSelf.pScope->GetContext();
                        if (context->IsString(ctxValue)) {
                            string_view string;
                            if (context->GetValueString(ctxValue, &string)) {
                                NSString *moduleName = StringViewToNSString(string);
                                NSArray *result = [strongSelf->_bridge configForModuleName:moduleName];
                                auto ret = [NativeRenderNullIfNil(result) convertToCtxValue:context];
                                return ret;
                            }
                        }
                        return strongSelf.pScope->GetContext()->CreateNull();
                    }
                };
                context->RegisterNativeBinding("nativeRequireModuleConfig", nativeRequireModuleConfigFunc, nullptr);

                hippy::napi::Ctx::NativeFunction nativeFlushQueueImmediateFunc = [weakSelf](void *data) {
                    @autoreleasepool {
                        HippyJSExecutor *strongSelf = weakSelf;
                        if (!strongSelf.valid || !data) {
                            return strongSelf.pScope->GetContext()->CreateNull();
                        }
                        auto tuple_ptr = static_cast<hippy::napi::CBCtxValueTuple *>(data);
                        NSCAssert(1 == tuple_ptr->count_, @"nativeRequireModuleConfig should only contain 1 element");
                        auto ctxValue = tuple_ptr->arguments_[0];
                        const auto &context = strongSelf.pScope->GetContext();
                        if (context->IsArray(ctxValue)) {
                            id object = ObjectFromJSValue(context, ctxValue);
                            [strongSelf->_bridge handleBuffer:object batchEnded:YES];
                        }

                        return strongSelf.pScope->GetContext()->CreateNull();
                    }
                };
                context->RegisterNativeBinding("nativeFlushQueueImmediate", nativeFlushQueueImmediateFunc, nullptr);

                strongSelf->_turboRuntime = std::make_unique<hippy::napi::ObjcTurboEnv>(scope->GetContext());
                hippy::napi::Ctx::NativeFunction getTurboModuleFunc = [weakSelf](void *data) {
                    @autoreleasepool {
                        HippyJSExecutor *strongSelf = weakSelf;
                        if (!strongSelf.valid || !data) {
                            return strongSelf.pScope->GetContext()->CreateNull();
                        }
                        auto tuple_ptr = static_cast<hippy::napi::CBCtxValueTuple *>(data);
                        NSCAssert(1 == tuple_ptr->count_, @"nativeRequireModuleConfig should only contain 1 element");
                        auto nameValue = tuple_ptr->arguments_[0];
                        const auto &context = strongSelf.pScope->GetContext();
                        if (context->IsString(nameValue)) {
                            NSString *name = ObjectFromJSValue(context, nameValue);
                            auto value = [strongSelf JSTurboObjectWithName:name];
                            return value;
                        }
                        return strongSelf.pScope->GetContext()->CreateNull();
                    }
                };
                context->RegisterNativeBinding("getTurboModule", getTurboModuleFunc, nullptr);

            }

        }
    };

    hippy::base::RegisterFunction scopeInitializedCB = [weakSelf](void *p) {
        @autoreleasepool {
            HippyJSExecutor *strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            hippy::ScopeWrapper *wrapper = reinterpret_cast<hippy::ScopeWrapper *>(p);
            std::shared_ptr<hippy::Scope> scope = wrapper->scope_.lock();
        }
    };
    std::unique_ptr<hippy::Engine::RegisterMap> ptr = std::make_unique<hippy::Engine::RegisterMap>();
    ptr->insert(std::make_pair(hippy::base::kAsyncTaskEndKey, taskEndCB));
    ptr->insert(std::make_pair(hippy::base::kContextCreatedCBKey, ctxCreateCB));
    ptr->insert(std::make_pair(hippy::base::KScopeInitializedCBKey, scopeInitializedCB));
    return ptr;
}

- (void)notifyModulesSetupComplete {
    dispatch_semaphore_signal(_moduleSemaphore);
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
            strongSelf.pScope->GetContext()->SetGlobalStrVar("__HIPPYCURDIR__", NSStringToU8StringView(directory));
        }];
    }
}    

- (SharedCtxValuePtr)JSTurboObjectWithName:(NSString *)name {
    //create HostObject by name
    HippyOCTurboModule *turboModule = [self->_bridge turboModuleWithName:name];
    if (!turboModule) {
        return self.pScope->GetContext()->CreateNull();
    }

    // create jsProxy
    std::shared_ptr<hippy::napi::HippyTurboModule> ho = [turboModule getTurboModule];
    //should be function!!!!!
    SharedCtxValuePtr obj = self->_turboRuntime->CreateObject(ho);
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
        bool reload = self.bridge.invalidateReason == NativeRenderInvalidateReasonReload ? true : false;
        devtools_data_source->Destroy(reload);
    }
#endif
    NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor invalide %p", self);
    _valid = NO;
#ifdef JS_USE_JSC
    auto scope = self.pScope;
    if (scope) {
        auto jsc_context = std::static_pointer_cast<hippy::napi::JSCCtx>(scope->GetContext());
        jsc_context->SetName("HippyJSContext(delete)");
    }
#endif //JS_USE_JSC
    self.pScope->WillExit();
    _turboRuntime = nullptr;
    NSString *enginekey = [self enginekey];
    if (!enginekey) {
        return;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor remove engine %@", enginekey);
        [[HippyJSEnginesMapper defaultInstance] removeEngineResourceForKey:enginekey];
    });
}

- (NSString *)enginekey {
    return _enginekey ?: [NSString stringWithFormat:@"%p", self];
}

// clang-format off
- (void)setContextName:(NSString *)contextName {
#ifdef JS_USE_JSC
    WeakCtxPtr weak_ctx = self.pScope->GetContext();
    [self executeBlockOnJavaScriptQueue:^{
        SharedCtxPtr context = weak_ctx.lock();
        if (!context) {
            return;
        }
        auto tryCatch = hippy::napi::CreateTryCatchScope(true, context);
        auto jsc_context = std::static_pointer_cast<hippy::napi::JSCCtx>(self.pScope->GetContext());
        jsc_context->SetName([contextName UTF8String]);
        if (tryCatch->HasCaught()) {
            NativeRenderLogWarn(@"set context throw exception");
        }
    }];
#endif //JS_USE_JSC
}
// clang-format on

- (void)dealloc {
    NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor dealloc %p", self);
    [self invalidate];
}

- (void)updateGlobalObjectBeforeExcuteSecondary{
    if(![self.bridge.delegate respondsToSelector:@selector(objectsBeforeExecuteSecondaryCode)]){
        return;
    }
    NSDictionary *secondaryGlobal = [self.bridge.delegate objectsBeforeExecuteSecondaryCode];
    if(0 == secondaryGlobal.count){
        return;
    }
    __weak HippyJSExecutor *weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        HippyJSExecutor *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.isValid || nullptr == strongSelf.pScope) {
            return;
        }
        auto tryCatch = hippy::napi::CreateTryCatchScope(true, strongSelf.pScope->GetContext());
        [strongSelf addInfoToGlobalObject:[secondaryGlobal copy]];
        if (tryCatch->HasCaught()) {
            string_view errorMsg = tryCatch->GetExceptionMsg();
            NativeRenderLogError(@"update global object failed:%@", StringViewToNSString(errorMsg));
        }
    }];
}

-(void)addInfoToGlobalObject:(NSDictionary*)addInfoDict{
    string_view str("__HIPPYNATIVEGLOBAL__");
    const SharedCtxPtr &napi_context = self.pScope->GetContext();
    SharedCtxValuePtr hippyNativeGlobalObj = napi_context->GetGlobalObjVar(str);
    HippyAssert(hippyNativeGlobalObj, @"__HIPPYNATIVEGLOBAL__ must not be null");
    if (hippyNativeGlobalObj) {
        for (NSString *key in addInfoDict) {
            id value = addInfoDict[key];
            string_view key_string = NSStringToU8StringView(key);
            SharedCtxValuePtr ctx_value = [value convertToCtxValue:napi_context];
            napi_context->SetProperty(hippyNativeGlobalObj, key_string, ctx_value, hippy::napi::PropertyAttribute::None);
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
                SharedCtxPtr context = strongSelf.pScope->GetContext();
                SharedCtxValuePtr batchedbridge_value = context->GetGlobalObjVar("__hpBatchedBridge");
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
                            auto tryCatch = hippy::napi::CreateTryCatchScope(true, context);
                            resultValue = context->CallFunction(method_value, arguments.count, function_params);
                            if (tryCatch->HasCaught()) {
                                exception = tryCatch->GetExceptionMsg();
                            }
                        } else {
                            executeError
                                = NativeRenderErrorWithMessageAndModuleName([NSString stringWithFormat:@"%@ is not a function", method], moduleName);
                        }
                    } else {
                        executeError = NativeRenderErrorWithMessageAndModuleName(
                            [NSString stringWithFormat:@"property/function %@ not found in __hpBatchedBridge", method], moduleName);
                    }
                } else {
                    executeError = NativeRenderErrorWithMessageAndModuleName(@"__hpBatchedBridge not found", moduleName);
                }
                if (!StringViewUtils::IsEmpty(exception) || executeError) {
                    if (!StringViewUtils::IsEmpty(exception)) {
                        NSString *string = StringViewToNSString(exception);
                        executeError = NativeRenderErrorWithMessageAndModuleName(string, moduleName);
                    }
                } else if (resultValue) {
                    objcValue = ObjectFromJSValue(context, resultValue);
                }
                onComplete(objcValue, executeError);
            } @catch (NSException *exception) {
                NSString *moduleName = strongSelf.bridge.moduleName?:@"unknown";
                NSMutableDictionary *userInfo = [exception.userInfo mutableCopy]?:[NSMutableDictionary dictionary];
                [userInfo setObject:moduleName forKey:HippyFatalModuleName];
                [userInfo setObject:arguments?:[NSArray array] forKey:@"arguments"];
                NSException *reportException = [NSException exceptionWithName:exception.name reason:exception.reason userInfo:userInfo];
                HippyHandleException(reportException, self.bridge);
            }
        }
    }];
}

- (void)executeApplicationScript:(NSString *)script sourceURL:(NSURL *)sourceURL onComplete:(HippyJavaScriptCallback)onComplete {
    HippyAssertParam(script);
    HippyAssertParam(sourceURL);
    // HippyProfileBeginFlowEvent();
    [self executeBlockOnJavaScriptQueue:^{
        // HippyProfileEndFlowEvent();
        if (!self.isValid) {
            onComplete(nil, NativeRenderErrorWithMessageAndModuleName(@"jsexecutor is not invalid", self.bridge.moduleName));
            return;
        }
        NSError *error = nil;
        id result = executeApplicationScript(script, sourceURL, self->_performanceLogger, self.pScope->GetContext(), &error);
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

static NSError *executeApplicationScript(NSString *script, NSURL *sourceURL, HippyPerformanceLogger *performanceLogger, SharedCtxPtr context, NSError **error) {
    @autoreleasepool {
        [performanceLogger markStartForTag:HippyPLScriptExecution];
        string_view view([script UTF8String]);
        string_view fileName = NSStringToU8StringView([sourceURL absoluteString]);
        string_view errorMsg;
        NSLock *lock = jslock();
        BOOL lockSuccess = [lock lockBeforeDate:[NSDate dateWithTimeIntervalSinceNow:1]];
        auto tryCatch = hippy::napi::CreateTryCatchScope(true, context);
        SharedCtxValuePtr result = context->RunScript(view, fileName);
        if (tryCatch->HasCaught()) {
            errorMsg = std::move(tryCatch->GetExceptionMsg());
        }
        if (lockSuccess) {
            [lock unlock];
        }
        [performanceLogger markStopForTag:HippyPLScriptExecution];
        *error = !StringViewUtils::IsEmpty(errorMsg) ? [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@{
            NSLocalizedDescriptionKey: StringViewToNSString(errorMsg)}] : nil;
        id objcResult = ObjectFromJSValue(context, result);
        return objcResult;
    }
}

- (void)executeBlockOnJavaScriptQueue:(dispatch_block_t)block {
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
        HippyAssert(NativeRenderJSONParse(script, NULL) != nil, @"%@ wasn't valid JSON!", script);
    }

    __weak HippyJSExecutor *weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        HippyJSExecutor *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.isValid) {
            return;
        }
        string_view json_view = NSStringToU8StringView(script);
        string_view name_view = NSStringToU8StringView(objectName);
        auto context = strongSelf.pScope->GetContext();
        auto tryCatch = hippy::napi::CreateTryCatchScope(true, context);
        context->SetGlobalJsonVar(name_view, json_view);
        if (tryCatch->HasCaught()) {
            string_view errorMsg = tryCatch->GetExceptionMsg();
            NSError *error = [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@{
                NSLocalizedDescriptionKey: StringViewToNSString(errorMsg)}];
            onComplete(@(NO), error);
        }
        else {
            onComplete(@(YES), nil);
        }
    }];
}

- (NSString *)completeWSURLWithBridge:(HippyBridge *)bridge {
    if (![bridge.delegate respondsToSelector:@selector(shouldStartInspector:)]) {
        return @"";
    }
    if (![bridge.delegate shouldStartInspector:bridge]) {
        return @"";
    }
    HippyDevInfo *devInfo = [[HippyDevInfo alloc] init];
    if ([bridge.delegate respondsToSelector:@selector(inspectorSourceURLForBridge:)]) {
        NSURL *url = [bridge.delegate inspectorSourceURLForBridge:bridge];
        devInfo.scheme = [url scheme];
        devInfo.ipAddress = [url host];
        devInfo.port = [NSString stringWithFormat:@"%@", [url port]];
        devInfo.versionId = [HippyBundleURLProvider parseVersionId:[url path]];
        [devInfo parseWsURLWithURLQuery:[url query]];
    } else {
        HippyBundleURLProvider *bundleURLProvider = [HippyBundleURLProvider sharedInstance];
        devInfo.scheme = bundleURLProvider.scheme;
        devInfo.ipAddress = bundleURLProvider.localhostIP;
        devInfo.port = bundleURLProvider.localhostPort;
        devInfo.versionId = bundleURLProvider.versionId;
        devInfo.wsURL = bundleURLProvider.wsURL;
    }
    NSString *deviceName = [[UIDevice currentDevice] name];
    NSString *clientId = NativeRenderMD5Hash([NSString stringWithFormat:@"%@%p", deviceName, bridge]);
    return [devInfo assembleFullWSURLWithClientId:clientId];
}

@end
