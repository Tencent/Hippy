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

#import "HippyJSCExecutor.h"

#import <cinttypes>
#import <memory>
#import <pthread.h>
#import <string>
#import <unordered_map>

#import <UIKit/UIDevice.h>

#import "HippyAssert.h"
#import "HippyBridge+Private.h"
#import "HippyDefines.h"
#import "HippyDevMenu.h"
#import "HippyJavaScriptLoader.h"
#import "NativeRenderLog.h"
#import "HippyPerformanceLogger.h"
#import "NativeRenderUtils.h"
#import "HippyRedBox.h"
#import "HippyJSCErrorHandling.h"
#import "HippyJSEnginesMapper.h"
#import "HippyBridge+LocalFileSource.h"
#include "ios_loader.h"
#import "HippyBridge+Private.h"
#include "footstone/string_view_utils.h"
#include "footstone/task_runner.h"
#include "core/napi/jsc/js_native_api_jsc.h"
#include "footstone/task.h"
#include "core/napi/js_native_api.h"
#include "core/scope.h"
#include "core/engine.h"
#import "HippyOCTurboModule+Inner.h"
#import "HippyTurboModuleManager.h"
#import "HippyDevInfo.h"
#import "HippyBundleURLProvider.h"
#import "NSObject+ToJSCtxValue.h"

NSString *const HippyJSCThreadName = @"com.tencent.hippy.JavaScript";
NSString *const HippyJavaScriptContextCreatedNotification = @"HippyJavaScriptContextCreatedNotification";
NSString *const HippyJavaScriptContextCreatedNotificationBridgeKey = @"HippyJavaScriptContextCreatedNotificationBridgeKey";

using unicode_string_view = footstone::stringview::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;

static bool defaultDynamicLoadAction(const unicode_string_view& uri, std::function<void(u8string)> cb) {
    std::u16string u16Uri = StringViewUtils::Convert(uri, unicode_string_view::Encoding::Utf16).utf16_value();
    NativeRenderLogInfo(@"[Hippy_OC_Log][Dynamic_Load], to default dynamic load action:%S", (const unichar*)u16Uri.c_str());
    NSString *URIString = [NSString stringWithCharacters:(const unichar*)u16Uri.c_str() length:(u16Uri.length())];
    NSURL *url = NativeRenderURLWithString(URIString, NULL);
    if ([url isFileURL]) {
        NSString *result = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:nil];
        u8string content(reinterpret_cast<const unicode_string_view::char8_t_*>([result UTF8String]?[result UTF8String]:""));
        cb(std::move(content));;
    }
    else {
        NSURLRequest *req = [NSURLRequest requestWithURL:url];
        [[[NSURLSession sharedSession] dataTaskWithRequest:req completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
            if (error) {
                NativeRenderLogInfo(@"[Hippy_OC_Log][Dynamic_Load], error:%@", [error description]);
            }
            else {
                NSString *result = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
                u8string content(reinterpret_cast<const unicode_string_view::char8_t_*>([result UTF8String]?:""));
                cb(std::move(content));
            }
        }] resume];
    }
    return true;
}

static bool loadFunc(const unicode_string_view& uri, std::function<void(u8string)> cb, CFTypeRef userData) {
    std::u16string u16Uri = StringViewUtils::Convert(uri, unicode_string_view::Encoding::Utf16).utf16_value();
    NativeRenderLogInfo(@"[Hippy_OC_Log][Dynamic_Load], start load function:%S", (const unichar*)u16Uri.c_str());
    HippyBridge *strongBridge = (__bridge HippyBridge *)userData;
    if ([strongBridge.delegate respondsToSelector:@selector(dynamicLoad:URI:completion:)]) {
        NSString *URIString = [NSString stringWithCharacters:(const unichar *)u16Uri.c_str() length:u16Uri.length()];
        BOOL delegateCallRet = [strongBridge.delegate dynamicLoad:strongBridge URI:URIString completion:^(NSString *result) {
            u8string content(reinterpret_cast<const unicode_string_view::char8_t_*>([result UTF8String]?:""));
            cb(std::move(content));
        }];
        return delegateCallRet?:defaultDynamicLoadAction(uri, cb);
    }
    else {
        return defaultDynamicLoadAction(uri, cb);
    }
}

@interface HippyJSCExecutor () {
    // Set at setUp time:
    HippyPerformanceLogger *_performanceLogger;
    JSContext *_JSContext;
    JSValueRef _batchedBridgeRef;
    std::unique_ptr<hippy::napi::ObjcTurboEnv> _turboRuntime;
    JSGlobalContextRef _JSGlobalContextRef;
}

@end

@implementation HippyJSCExecutor

HIPPY_EXPORT_MODULE()

- (void)setBridge:(HippyBridge *)bridge {
    _bridge = bridge;
    _performanceLogger = [bridge performanceLogger];
}

- (instancetype)initWithExecurotKey:(NSString *)execurotkey bridge:(HippyBridge *)bridge {
    if (self = [super init]) {
        _valid = YES;
        // maybe bug in JavaScriptCore：
        // JSContextRef held by JSContextGroupRef cannot be deallocated,
        // unless JSContextGroupRef is deallocated
        self.executorkey = execurotkey;
        self.bridge = bridge;
        
        auto workerManager = std::make_shared<footstone::WorkerManager>(1);
        [self.bridge setUpDomWorkerManager: workerManager];
        
        auto engine = [[HippyJSEnginesMapper defaultInstance] createJSEngineResourceForKey:self.executorkey];
        std::unique_ptr<Engine::RegisterMap> map = [self registerMap];
        const char *pName = [execurotkey UTF8String] ?: "";
        std::shared_ptr<Scope> scope = engine->GetEngine()->CreateScope(pName, std::move(map));
        self.pScope = scope;
        [self initURILoader];
        NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor Init %p, execurotkey:%@", self, execurotkey);
#ifdef ENABLE_INSPECTOR
        if (bridge.debugMode) {
            NSString *wsURL = [self completeWSURLWithBridge:bridge];
            auto devtools_data_source = std::make_shared<hippy::devtools::DevtoolsDataSource>([wsURL UTF8String], self.bridge.domWorkerManager);
            devtools_data_source->SetRuntimeDebugMode(bridge.debugMode);
            self.pScope->SetDevtoolsDataSource(devtools_data_source);
        }
#endif
    }

    return self;
}

- (void)initURILoader {
    std::shared_ptr<IOSLoader> loader = std::make_shared<IOSLoader>(loadFunc, (__bridge void *)_bridge);
    self.pScope->SetUriLoader(loader);
}

static unicode_string_view NSStringToU8(NSString* str) {
  std::string u8 = [str UTF8String];
  return unicode_string_view(reinterpret_cast<const unicode_string_view::char8_t_*>(u8.c_str()), u8.length());
}

- (std::unique_ptr<Engine::RegisterMap>)registerMap {
    __weak HippyJSCExecutor *weakSelf = self;
    __weak id<HippyBridgeDelegate> weakBridgeDelegate = self.bridge.delegate;
    hippy::base::RegisterFunction taskEndCB = [weakSelf](void *) {
        @autoreleasepool {
            HippyJSCExecutor *strongSelf = weakSelf;
            if (strongSelf) {
              handleJsExcepiton(strongSelf->_pScope);
              [strongSelf->_bridge handleBuffer:nil batchEnded:YES];
            }
        }
    };
    hippy::base::RegisterFunction ctxCreateCB = [weakSelf, weakBridgeDelegate](void *p) {
        @autoreleasepool {
            HippyJSCExecutor *strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            id<HippyBridgeDelegate> strongBridgeDelegate = weakBridgeDelegate;
            ScopeWrapper *wrapper = reinterpret_cast<ScopeWrapper *>(p);
            std::shared_ptr<Scope> scope = wrapper->scope_.lock();
            if (scope) {
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
                if ([strongSelf.bridge isKindOfClass:[HippyBatchedBridge class]]) {
                    HippyBridge *clientBridge = [(HippyBatchedBridge *)strongSelf.bridge parentBridge];
                    NSString *deviceName = [[UIDevice currentDevice] name];
                    NSString *clientId = NativeRenderMD5Hash([NSString stringWithFormat:@"%@%p", deviceName, clientBridge]);
                    NSDictionary *debugInfo = @{@"Debug" : @{@"debugClientId" : clientId}};
                    [deviceInfo addEntriesFromDictionary:debugInfo];
                }
                NSError *JSONSerializationError = nil;
                NSData *data = [NSJSONSerialization dataWithJSONObject:deviceInfo options:0 error:&JSONSerializationError];
                if (JSONSerializationError) {
                    NSString *errorString =
                        [NSString stringWithFormat:@"device parse error:%@, deviceInfo:%@", [JSONSerializationError localizedFailureReason], deviceInfo];
                    NSError *error = NativeRenderErrorWithMessageAndModuleName(errorString, strongSelf.bridge.moduleName);
                    HippyFatal(error);
                }
                NSString *string = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
                context->SetGlobalJsonVar("__HIPPYNATIVEGLOBAL__", NSStringToU8(string));
                context->SetGlobalJsonVar("__fbBatchedBridgeConfig", NSStringToU8([strongSelf.bridge moduleConfig]));
                NSString *workFolder = [strongSelf.bridge sandboxDirectory];
                if (workFolder) {
                    context->SetGlobalStrVar("__HIPPYCURDIR__", NSStringToU8(workFolder));
                }
                else {
                    context->SetGlobalStrVar("__HIPPYCURDIR__", NSStringToU8(@""));
                }
                hippy::napi::Ctx::NativeFunction nativeRequireModuleConfigFunc = [weakSelf](void *data) {
                    @autoreleasepool {
                        HippyJSCExecutor *strongSelf = weakSelf;
                        if (!strongSelf.valid || !data) {
                            return strongSelf.pScope->GetContext()->CreateNull();
                        }
                        auto pTuple = static_cast<hippy::napi::CBDataTuple *>(data);
                        NSCAssert(1 == pTuple->count_, @"nativeRequireModuleConfig should only contain 1 element");
                        auto ctxValue = pTuple->arguments_[0];
                        const auto &context = strongSelf.pScope->GetContext();
                        if (context->IsString(ctxValue)) {
                            unicode_string_view string;
                            if (context->GetValueString(ctxValue, &string)) {
                                unicode_string_view::u16string &u16String =string.utf16_value();
                                NSString *moduleName =
                                    [NSString stringWithCharacters:(const unichar *)u16String.c_str() length:u16String.length()];
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
                        HippyJSCExecutor *strongSelf = weakSelf;
                        if (!strongSelf.valid || !data) {
                            return strongSelf.pScope->GetContext()->CreateNull();
                        }
                        auto pTuple = static_cast<hippy::napi::CBDataTuple *>(data);
                        NSCAssert(1 == pTuple->count_, @"nativeRequireModuleConfig should only contain 1 element");
                        auto ctxValue = pTuple->arguments_[0];
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
                        HippyJSCExecutor *strongSelf = weakSelf;
                        if (!strongSelf.valid || !data) {
                            return strongSelf.pScope->GetContext()->CreateNull();
                        }
                        auto pTuple = static_cast<hippy::napi::CBDataTuple *>(data);
                        NSCAssert(1 == pTuple->count_, @"nativeRequireModuleConfig should only contain 1 element");
                        auto nameValue = pTuple->arguments_[0];
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
            HippyJSCExecutor *strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            ScopeWrapper *wrapper = reinterpret_cast<ScopeWrapper *>(p);
            std::shared_ptr<Scope> scope = wrapper->scope_.lock();
            handleJsExcepiton(scope);
        }
    };
    std::unique_ptr<Engine::RegisterMap> ptr = std::make_unique<Engine::RegisterMap>();
    ptr->insert(std::make_pair("ASYNC_TASK_END", taskEndCB));
    ptr->insert(std::make_pair(hippy::base::kContextCreatedCBKey, ctxCreateCB));
    ptr->insert(std::make_pair(hippy::base::KScopeInitializedCBKey, scopeInitializedCB));
    return ptr;
}

- (std::shared_ptr<hippy::napi::CtxValue>)JSTurboObjectWithName:(NSString *)name {
    //create HostObject by name
    HippyOCTurboModule *turboModule = [self->_bridge turboModuleWithName:name];
    if (!turboModule) {
        return self.pScope->GetContext()->CreateNull();
    }

    // create jsProxy
    std::shared_ptr<hippy::napi::HippyTurboModule> ho = [turboModule getTurboModule];
    //should be function!!!!!
    std::shared_ptr<hippy::napi::CtxValue> obj = self->_turboRuntime->CreateObject(ho);
    return obj;
}

- (JSContext *)JSContext {
    if (nil == _JSContext) {
        JSGlobalContextRef contextRef = [self JSGlobalContextRef];
        if (contextRef) {
            _JSContext = [JSContext contextWithJSGlobalContextRef:contextRef];
            HippyBridge *bridge = self.bridge;
            if ([bridge isKindOfClass:[HippyBatchedBridge class]]) {
                bridge = [(HippyBatchedBridge *)bridge parentBridge];
            }
            NSDictionary *userInfo = nil;
            if (bridge) {
                userInfo = @{ HippyJavaScriptContextCreatedNotificationBridgeKey: bridge };
            }
            if (_JSContext) {
                [[NSNotificationCenter defaultCenter] postNotificationName:HippyJavaScriptContextCreatedNotification object:nil userInfo:userInfo];
            }
        }
    }
    return _JSContext;
}

- (JSGlobalContextRef)JSGlobalContextRef {
    if (nil == _JSGlobalContextRef) {
        std::shared_ptr<Scope> scope = self.pScope;
        if (scope) {
            std::shared_ptr<hippy::napi::Ctx> napiCtx = scope->GetContext();
            std::shared_ptr<hippy::napi::JSCCtx> jscContext = std::static_pointer_cast<hippy::napi::JSCCtx>(napiCtx);
            _JSGlobalContextRef = jscContext->GetCtxRef();
        }
    }
    return _JSGlobalContextRef;
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
    self.pScope->WillExit();
    self.pScope = nullptr;
    _JSContext.name = @"HippyJSContext(delete)";
    _JSContext = nil;
    _JSGlobalContextRef = NULL;
    dispatch_async(dispatch_get_main_queue(), ^{
        NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor remove engine %@", [self executorkey]);
        [[HippyJSEnginesMapper defaultInstance] removeEngineResourceForKey:[self executorkey]];
    });
}

- (NSString *)contextName {
    return [[self JSContext] name];
}

- (NSString *)executorkey {
    return _executorkey ?: [NSString stringWithFormat:@"%p", self];
}

// clang-format off
HIPPY_EXPORT_METHOD(setContextName:(NSString *)contextName) {
    [self executeBlockOnJavaScriptQueue:^{
        [[self JSContext] setName:contextName];
    }];
}
// clang-format on

- (void)dealloc {
    NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor dealloc %p", self);
    [self invalidate];
}

- (void)secondBundleLoadCompleted:(BOOL)success {
    std::shared_ptr<Scope> scope = self.pScope;
    if (!scope) {
        return;
    }
    std::shared_ptr<hippy::napi::JSCCtx> context = std::static_pointer_cast<hippy::napi::JSCCtx>(scope->GetContext());
    HippyAssert(context != nullptr, @"secondBundleLoadCompleted get null context");
    if (nullptr == context) {
        return;
    }
    NSString *workFolder = [self.bridge sandboxDirectory];
    HippyAssert(workFolder, @"work folder path should not be null");
    if (workFolder) {
        context->SetGlobalStrVar("__HIPPYCURDIR__", NSStringToU8(workFolder));
    }
    else {
        context->SetGlobalStrVar("__HIPPYCURDIR__", NSStringToU8(@""));
    }
}

- (void)updateGlobalObjectBeforeExcuteSecondary{
    if(![self.bridge.delegate respondsToSelector:@selector(objectsBeforeExecuteSecondaryCode)]){
        return;
    }
    NSDictionary *secondaryGlobal = [self.bridge.delegate objectsBeforeExecuteSecondaryCode];
    if(0 == secondaryGlobal.count){
        return;
    }
    __weak HippyJSCExecutor *weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        HippyJSCExecutor *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.isValid || nullptr == strongSelf.pScope) {
            return;
        }
        [strongSelf addInfoToGlobalObject:[secondaryGlobal copy]];
    }];
}

-(void)addInfoToGlobalObject:(NSDictionary*)addInfoDict{
    unicode_string_view string_view("__HIPPYNATIVEGLOBAL__");
    const std::shared_ptr<hippy::napi::Ctx> &napi_context = self.pScope->GetContext();
    std::shared_ptr<hippy::napi::CtxValue> hippyNativeGlobalObj = napi_context->GetGlobalObjVar(string_view);
    HippyAssert(hippyNativeGlobalObj, @"__HIPPYNATIVEGLOBAL__ must not be null");
    if (hippyNativeGlobalObj) {
        for (NSString *key in addInfoDict) {
            id value = addInfoDict[key];
            footstone::unicode_string_view key_string([key UTF8String]);
            std::shared_ptr<hippy::napi::CtxValue> ctx_value = [value convertToCtxValue:napi_context];
            napi_context->SetProperty(hippyNativeGlobalObj, key_string, ctx_value, hippy::napi::PropertyAttribute::None);
        }
    }
}

- (void)flushedQueue:(HippyJavaScriptCallback)onComplete {
    [self _executeJSCall:@"flushedQueue" arguments:@[] unwrapResult:YES callback:onComplete];
}

- (void)_callFunctionOnModule:(NSString *)module
                       method:(NSString *)method
                    arguments:(NSArray *)args
                  returnValue:(BOOL)returnValue
                 unwrapResult:(BOOL)unwrapResult
                     callback:(HippyJavaScriptCallback)onComplete {
    // TODO: Make this function handle first class instead of dynamically dispatching it. #9317773
    NSString *bridgeMethod = returnValue ? @"callFunctionReturnFlushedQueue" : @"callFunctionReturnResultAndFlushedQueue";
    [self _executeJSCall:bridgeMethod arguments:@[module, method, args] unwrapResult:unwrapResult callback:onComplete];
}

- (void)callFunctionOnModule:(NSString *)module method:(NSString *)method arguments:(NSArray *)args callback:(HippyJavaScriptCallback)onComplete {
    [self _callFunctionOnModule:module method:method arguments:args returnValue:YES unwrapResult:YES callback:onComplete];
}

- (void)callFunctionOnModule:(NSString *)module
                      method:(NSString *)method
                   arguments:(NSArray *)args
             jsValueCallback:(HippyJavaScriptValueCallback)onComplete {
    [self _callFunctionOnModule:module method:method arguments:args returnValue:NO unwrapResult:NO callback:onComplete];
}

- (void)invokeCallbackID:(NSNumber *)cbID arguments:(NSArray *)args callback:(HippyJavaScriptCallback)onComplete {
    [self _executeJSCall:@"invokeCallbackAndReturnFlushedQueue" arguments:@[cbID, args] unwrapResult:YES callback:onComplete];
}

- (void)_executeJSCall:(NSString *)method
             arguments:(NSArray *)arguments
          unwrapResult:(BOOL)unwrapResult
              callback:(HippyJavaScriptCallback)onComplete {
    HippyAssert(onComplete != nil, @"onComplete block should not be nil");
    __weak HippyJSCExecutor *weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        @autoreleasepool {
            HippyJSCExecutor *strongSelf = weakSelf;
            if (!strongSelf || !strongSelf.isValid || nullptr == strongSelf.pScope) {
                return;
            }
            @try {
                HippyBridge *bridge = [strongSelf bridge];
                NSString *moduleName = [bridge moduleName];
                NSError *executeError = nil;
                id objcValue = nil;
                std::shared_ptr<hippy::napi::Ctx> jscContext = self.pScope->GetContext();
                std::shared_ptr<hippy::napi::CtxValue> batchedbridge_value = jscContext->GetGlobalObjVar("__fbBatchedBridge");
                std::shared_ptr<hippy::napi::JSCCtxValue> jsc_resultValue = nullptr;
                std::u16string exception;
                JSContext *jsContext = [strongSelf JSContext];
                JSGlobalContextRef globalContextRef = [strongSelf JSGlobalContextRef];
                if (!jsContext || !globalContextRef) {
                    onComplete([NSNull null], nil);
                    return;
                }
                if (batchedbridge_value) {
                    std::shared_ptr<hippy::napi::CtxValue> method_value = jscContext->GetProperty(batchedbridge_value, [method UTF8String]);
                    if (method_value) {
                        if (jscContext->IsFunction(method_value)) {
                            std::shared_ptr<hippy::napi::CtxValue> function_params[arguments.count];
                            for (NSUInteger i = 0; i < arguments.count; i++) {
                                function_params[i] = [arguments[i] convertToCtxValue:jscContext];
                            }
                            hippy::napi::JSCTryCatch tryCatch(true, jscContext);
                            std::shared_ptr<hippy::napi::CtxValue> resultValue
                                = jscContext->CallFunction(method_value, arguments.count, function_params);
                            if (tryCatch.HasCaught()) {
                              exception = StringViewUtils::Convert(tryCatch.GetExceptionMsg(), unicode_string_view::Encoding::Utf16).utf16_value();
                            }
                            jsc_resultValue = std::static_pointer_cast<hippy::napi::JSCCtxValue>(resultValue);
                        } else {
                            executeError
                                = NativeRenderErrorWithMessageAndModuleName([NSString stringWithFormat:@"%@ is not a function", method], moduleName);
                        }
                    } else {
                        executeError = NativeRenderErrorWithMessageAndModuleName(
                            [NSString stringWithFormat:@"property/function %@ not found in __fbBatchedBridge", method], moduleName);
                    }
                } else {
                    executeError = NativeRenderErrorWithMessageAndModuleName(@"__fbBatchedBridge not found", moduleName);
                }
                if (!exception.empty() || executeError) {
                    if (!exception.empty()) {
                        NSString *string = [NSString stringWithCharacters: reinterpret_cast<const unichar*>(exception.c_str()) length:exception.length()];
                        executeError = NativeRenderErrorWithMessageAndModuleName(string, moduleName);
                    }
                } else if (jsc_resultValue) {
                    JSValueRef resutlRef = jsc_resultValue->value_;
                    JSValue *objc_value = [JSValue valueWithJSValueRef:resutlRef inContext:[strongSelf JSContext]];
                    objcValue = unwrapResult ? [objc_value toObject] : objc_value;
                }
                onComplete(objcValue, executeError);
            } @catch (NSException *exception) {
                NSString *moduleName = strongSelf.bridge.moduleName?:@"unknown";
                NSMutableDictionary *userInfo = [exception.userInfo mutableCopy]?:[NSMutableDictionary dictionary];
                [userInfo setObject:moduleName forKey:HippyFatalModuleName];
                [userInfo setObject:arguments?:[NSArray array] forKey:@"arguments"];
                NSException *reportException = [NSException exceptionWithName:exception.name reason:exception.reason userInfo:userInfo];
                MttHippyException(reportException);
            }
        }
    }];
}

- (void)executeApplicationScript:(NSData *)script sourceURL:(NSURL *)sourceURL onComplete:(HippyJavaScriptCompleteBlock)onComplete {
    HippyAssertParam(script);
    HippyAssertParam(sourceURL);
    {
        NSError *error;
        script = loadPossiblyBundledApplicationScript(script, sourceURL, _performanceLogger, &error);
        if (script == nil) {
            if (onComplete) {
                onComplete(error);
            }
            return;
        }
    }

    // HippyProfileBeginFlowEvent();
    [self executeBlockOnJavaScriptQueue:^{
        // HippyProfileEndFlowEvent();
        if (!self.isValid) {
            return;
        }
        NSError *error = executeApplicationScript(script, sourceURL, self->_performanceLogger, [self JSGlobalContextRef]);
        if (onComplete) {
            onComplete(error);
        }
    }];
}

static void handleJsExcepiton(std::shared_ptr<Scope> scope) {
  if (!scope) {
    return;
  }
  std::shared_ptr<hippy::napi::JSCCtx> context = std::static_pointer_cast<hippy::napi::JSCCtx>(scope->GetContext());
  std::shared_ptr<hippy::napi::JSCCtxValue> exception = std::static_pointer_cast<hippy::napi::JSCCtxValue>(context->GetException());
  if (exception) {
    if (!context->IsExceptionHandled()) {
      context->HandleUncaughtException(exception);
    }
    std::u16string exceptionStr = StringViewUtils::Convert(context->GetExceptionMsg(exception), unicode_string_view::Encoding::Utf16).utf16_value();
    NSString *err = [NSString stringWithCharacters:(const unichar *)exceptionStr.c_str() length:(exceptionStr.length())];
    NSError *error = NativeRenderErrorWithMessage(err);
    // NSError *error = RCTErrorWithMessageAndModule(err, strongSelf.bridge.moduleName);
    HippyFatal(error);
    context->SetException(nullptr);
    context->SetExceptionHandled(true);
  }
}

static NSData *loadPossiblyBundledApplicationScript(NSData *script, __unused NSURL *sourceURL, __unused HippyPerformanceLogger *performanceLogger, __unused NSError **error) {
    // JSStringCreateWithUTF8CString expects a null terminated C string.
    // RAM Bundling already provides a null terminated one.
    @autoreleasepool {
        NSMutableData *nullTerminatedScript = [NSMutableData dataWithCapacity:script.length + 1];
        [nullTerminatedScript appendData:script];
        [nullTerminatedScript appendBytes:"" length:1];
        script = nullTerminatedScript;
        return script;
    }
}

static NSLock *jslock() {
    static dispatch_once_t onceToken;
    static NSLock *lock = nil;
    dispatch_once(&onceToken, ^{
        lock = [[NSLock alloc] init];
    });
    return lock;
}

static NSError *executeApplicationScript(NSData *script, NSURL *sourceURL, HippyPerformanceLogger *performanceLogger, JSGlobalContextRef ctx) {
    @autoreleasepool {
        [performanceLogger markStartForTag:HippyPLScriptExecution];
        JSValueRef jsError = NULL;
        JSStringRef execJSString = JSStringCreateWithUTF8CString((const char *)script.bytes);
        JSStringRef bundleURL = JSStringCreateWithUTF8CString(sourceURL.absoluteString.UTF8String);

        NSLock *lock = jslock();
        BOOL lockSuccess = [lock lockBeforeDate:[NSDate dateWithTimeIntervalSinceNow:1]];
        JSEvaluateScript(ctx, execJSString, NULL, bundleURL, 0, &jsError);
        JSStringRelease(bundleURL);
        JSStringRelease(execJSString);
        if (lockSuccess) {
            [lock unlock];
        }
        [performanceLogger markStopForTag:HippyPLScriptExecution];

        NSError *error = jsError ? HippyNSErrorFromJSErrorRef(jsError, ctx) : nil;
        // HIPPY_PROFILE_END_EVENT(0, @"js_call");
        return error;
    }
}

- (void)executeBlockOnJavaScriptQueue:(dispatch_block_t)block {
    auto engine = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:self.executorkey]->GetEngine();
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
    auto engine = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:self.executorkey]->GetEngine();
    if (engine) {
        engine->GetJsTaskRunner()->PostTask(block);
    }
}

- (void)injectJSONText:(NSString *)script asGlobalObjectNamed:(NSString *)objectName callback:(HippyJavaScriptCompleteBlock)onComplete {
    HippyAssert(nil != script, @"param 'script' can't be nil");
    if (nil == script) {
        if (onComplete) {
            NSString *errorMessage = [NSString stringWithFormat:@"param 'script' is nil"];
            NSError *error = [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@{ NSLocalizedDescriptionKey: errorMessage }];
            onComplete(error);
        }
        return;
    }
    if (HIPPY_DEBUG) {
        HippyAssert(NativeRenderJSONParse(script, NULL) != nil, @"%@ wasn't valid JSON!", script);
    }

    __weak HippyJSCExecutor *weakSelf = self;
    // HippyProfileBeginFlowEvent();
    [self executeBlockOnJavaScriptQueue:^{
        // HippyProfileEndFlowEvent();
        HippyJSCExecutor *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.isValid) {
            return;
        }

        // HIPPY_PROFILE_BEGIN_EVENT(0, @"injectJSONText", @{@"objectName": objectName});
        JSStringRef execJSString = JSStringCreateWithCFString((__bridge CFStringRef)script);
        JSGlobalContextRef ctx = [strongSelf JSGlobalContextRef];
        JSValueRef valueToInject = JSValueMakeFromJSONString(ctx, execJSString);
        JSStringRelease(execJSString);

        NSError *error;
        if (!valueToInject) {
            NSString *errorMessage = [NSString stringWithFormat:@"Can't make JSON value from script '%@'", script];
            error = [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@ { NSLocalizedDescriptionKey: errorMessage }];
            NativeRenderLogError(@"%@", errorMessage);
        } else {
            JSObjectRef globalObject = JSContextGetGlobalObject(ctx);
            JSStringRef JSName = JSStringCreateWithCFString((__bridge CFStringRef)objectName);
            JSValueRef jsError = NULL;
            JSObjectSetProperty(ctx, globalObject, JSName, valueToInject, kJSPropertyAttributeNone, &jsError);
            JSStringRelease(JSName);

            if (jsError) {
                error = HippyNSErrorFromJSErrorRef(jsError, ctx);
            }
        }
        // HIPPY_PROFILE_END_EVENT(0, @"js_call,json_call");

        if (onComplete) {
            onComplete(error);
        }
    }];
}

- (NSString *)completeWSURLWithBridge:(HippyBridge *)bridge {
    if (![bridge.delegate respondsToSelector:@selector(shouldStartInspector:)]) {
        return @"";
    }
    if (![bridge isKindOfClass:[HippyBatchedBridge class]] ||
        ![bridge.delegate shouldStartInspector:[(HippyBatchedBridge *)bridge parentBridge]]) {
        return @"";
    }
    HippyDevInfo *devInfo = [[HippyDevInfo alloc] init];
    if ([bridge.delegate respondsToSelector:@selector(inspectorSourceURLForBridge:)]) {
        NSURL *url = [bridge.delegate inspectorSourceURLForBridge:[(HippyBatchedBridge *)bridge parentBridge]];
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
    NSString *clientId = NativeRenderMD5Hash([NSString stringWithFormat:@"%@%p", deviceName, [(HippyBatchedBridge *)bridge parentBridge]]);
    return [devInfo assembleFullWSURLWithClientId:clientId];
}

@end
