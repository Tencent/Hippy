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
#import "HippyJSEnginesMapper.h"
#import "HippyBridge+LocalFileSource.h"
#include "ios_loader.h"
#import "HippyBridge+Private.h"
#include "footstone/string_view_utils.h"
#include "footstone/task_runner.h"
#include "footstone/task.h"
#include "core/napi/js_native_api.h"
#include "core/scope.h"
#include "core/engine.h"
#import "HippyOCTurboModule+Inner.h"
#import "HippyTurboModuleManager.h"
#import "HippyDevInfo.h"
#import "HippyBundleURLProvider.h"
#import "NSObject+CtxValue.h"
#import "HippyContextWrapper.h"
#ifdef JS_USE_JSC
#import "NSObject+JSValue.h"
#import "core/napi/jsc/js_native_api_jsc.h"
#endif //JS_USE_JSC

NSString *const HippyJSCThreadName = @"com.tencent.hippy.JavaScript";

using unicode_string_view = footstone::stringview::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;
using SharedCtxPtr = std::shared_ptr<hippy::napi::Ctx>;
using WeakCtxPtr = std::weak_ptr<hippy::napi::Ctx>;
using SharedCtxValuePtr = std::shared_ptr<hippy::napi::CtxValue>;
using WeakCtxValuePtr = std::weak_ptr<hippy::napi::CtxValue>;

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

static id StringJSONToObject(NSString *string) {
    NSData *data = [string dataUsingEncoding:NSUTF8StringEncoding];
    id obj = [NSJSONSerialization JSONObjectWithData:data options:(0) error:nil];
    return obj;
}

@interface HippyJSExecutor () {
    // Set at setUp time:
    HippyPerformanceLogger *_performanceLogger;
    std::unique_ptr<hippy::napi::ObjcTurboEnv> _turboRuntime;
    HippyContextWrapper *_contextWrapper;
}

@end

@implementation HippyJSExecutor

HIPPY_EXPORT_MODULE(JSCExecutor)

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
        _contextWrapper = [HippyContextWrapper wrapperFromScope:scope];
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

static unicode_string_view NSStringToU8StringView(NSString* str) {
  std::string u8 = [str UTF8String];
  return unicode_string_view(reinterpret_cast<const unicode_string_view::char8_t_*>(u8.c_str()), u8.length());
}

static NSString *UnicodeStringViewToNSString(const unicode_string_view &string_view) {
    unicode_string_view::Encoding encode = string_view.encoding();
    NSString *result = nil;
    switch (encode) {
        case unicode_string_view::Encoding::Latin1:
            result = [NSString stringWithUTF8String:string_view.latin1_value().c_str()];
            break;
        case unicode_string_view::Encoding::Utf8:
        {
            result = [[NSString alloc] initWithBytes:string_view.utf8_value().c_str()
                                              length:string_view.utf8_value().length()
                                            encoding:NSUTF8StringEncoding];
            break;
        }
        case unicode_string_view::Encoding::Utf16:
        {
            const unicode_string_view::u16string &u16String =string_view.utf16_value();
            result = [NSString stringWithCharacters:(const unichar *)u16String.c_str() length:u16String.length()];
        }
            break;
        case unicode_string_view::Encoding::Utf32:
        {
            unicode_string_view convertedString = StringViewUtils::Convert(string_view, unicode_string_view::Encoding::Utf16);
            const unicode_string_view::u16string &u16String =convertedString.utf16_value();
            result = [NSString stringWithCharacters:(const unichar *)u16String.c_str() length:u16String.length()];
        }
            break;
        default:
            break;
    }
    return result;
}

- (std::unique_ptr<Engine::RegisterMap>)registerMap {
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
            ScopeWrapper *wrapper = reinterpret_cast<ScopeWrapper *>(p);
            std::shared_ptr<Scope> scope = wrapper->scope_.lock();
            if (scope) {
                auto context = scope->GetContext();
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
                NSString *workFolder = [strongSelf.bridge sandboxDirectory]?:@"";
                HippyContextWrapper *contextWrapper = strongSelf->_contextWrapper;
                [contextWrapper registerValueJSON:string asGlobalVar:@"__HIPPYNATIVEGLOBAL__"];
                [contextWrapper registerValueJSON:[strongSelf.bridge moduleConfig] asGlobalVar:@"__fbBatchedBridgeConfig"];
                [contextWrapper registerValue:workFolder asGlobalVar:@"__HIPPYCURDIR__"];
                [contextWrapper registerFunction:@"nativeRequireModuleConfig" implementation:^id _Nullable(NSArray * _Nonnull arguments) {
                    NSString *moduleName = [arguments firstObject];
                    if (moduleName) {
                        HippyJSExecutor *strongSelf = weakSelf;
                        if (!strongSelf.valid) {
                            return nil;
                        }

                        NSArray *result = [strongSelf->_bridge configForModuleName:moduleName];
                        return NativeRenderNullIfNil(result);
                    }
                    return nil;
                }];
                [contextWrapper registerFunction:@"nativeFlushQueueImmediate" implementation:^id _Nullable(NSArray * _Nonnull arguments) {
                    NSArray<NSArray *> *calls = [arguments firstObject];
                    HippyJSExecutor *strongSelf = weakSelf;
                    if (!strongSelf.valid || !calls) {
                        return nil;
                    }
                    [strongSelf->_bridge handleBuffer:calls batchEnded:NO];
                    return nil;
                }];
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
                            NSString *name = ObjectFromCtxValue(context, nameValue);
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
            ScopeWrapper *wrapper = reinterpret_cast<ScopeWrapper *>(p);
            std::shared_ptr<Scope> scope = wrapper->scope_.lock();
        }
    };
    std::unique_ptr<Engine::RegisterMap> ptr = std::make_unique<Engine::RegisterMap>();
    ptr->insert(std::make_pair("ASYNC_TASK_END", taskEndCB));
    ptr->insert(std::make_pair(hippy::base::kContextCreatedCBKey, ctxCreateCB));
    ptr->insert(std::make_pair(hippy::base::KScopeInitializedCBKey, scopeInitializedCB));
    return ptr;
}

#ifdef JS_USE_JSC
- (JSContext *)jsc_context {
    if (!_jsc_context) {
        auto scope = self.pScope;
        if (scope) {
            auto jsc_context = std::static_pointer_cast<hippy::napi::JSCCtx>(scope->GetContext());
            return [JSContext contextWithJSGlobalContextRef:jsc_context->context_];
        }
    }
    return _jsc_context;
}
#endif //JS_USE_JSC

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
    [_contextWrapper setContextName:@"HippyJSContext(delete)"];
    self.pScope->WillExit();
    NSString *executorKey = [self executorkey];
    if (!executorKey) {
        return;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor remove engine %@", executorKey);
        [[HippyJSEnginesMapper defaultInstance] removeEngineResourceForKey:executorKey];
    });
}

- (NSString *)executorkey {
    return _executorkey ?: [NSString stringWithFormat:@"%p", self];
}

// clang-format off
HIPPY_EXPORT_METHOD(setContextName:(NSString *)contextName) {
    __weak HippyContextWrapper *weakWrapper = _contextWrapper;
    [self executeBlockOnJavaScriptQueue:^{
        HippyContextWrapper *strongWrapper = weakWrapper;
        if (strongWrapper) {
            [strongWrapper setContextName:@"HippyJSContext(delete)"];
        }
    }];
}
// clang-format on

- (void)dealloc {
    NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor dealloc %p", self);
    [self invalidate];
}

- (void)secondBundleLoadCompleted:(BOOL)success {
    NSString *workFolder = [self.bridge sandboxDirectory]?:@"";
    [_contextWrapper registerValue:workFolder asGlobalVar:@"__HIPPYCURDIR__"];
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
            unicode_string_view errorMsg = tryCatch->GetExceptionMsg();
            NativeRenderLogError(@"update global object failed:%@", UnicodeStringViewToNSString(errorMsg));
        }
    }];
}

-(void)addInfoToGlobalObject:(NSDictionary*)addInfoDict{
    [_contextWrapper addValueMap:addInfoDict toGlabalVar:@"__HIPPYNATIVEGLOBAL__"];
}

- (void)flushedQueue:(HippyJavaScriptCallback)onComplete {
    [self _executeJSCall:@"flushedQueue" arguments:@[] callback:onComplete];
}

- (void)_callFunctionOnModule:(NSString *)module
                       method:(NSString *)method
                    arguments:(NSArray *)args
                  returnValue:(BOOL)returnValue
                 unwrapResult:(BOOL)unwrapResult
                     callback:(HippyJavaScriptCallback)onComplete {
    // TODO: Make this function handle first class instead of dynamically dispatching it. #9317773
    NSString *bridgeMethod = returnValue ? @"callFunctionReturnFlushedQueue" : @"callFunctionReturnResultAndFlushedQueue";
    [self _executeJSCall:bridgeMethod arguments:@[module, method, args] callback:onComplete];
}

- (void)callFunctionOnModule:(NSString *)module method:(NSString *)method arguments:(NSArray *)args callback:(HippyJavaScriptCallback)onComplete {
    [self _callFunctionOnModule:module method:method arguments:args returnValue:YES unwrapResult:YES callback:onComplete];
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
#ifdef JS_USE_JSC
                JSContext *context = [strongSelf jsc_context];
                JSValue *batchedbridgeValue = context[@"__fbBatchedBridge"];
                if (batchedbridgeValue) {
                    JSValue *methodValue = batchedbridgeValue[method];
                    if (methodValue && JSValueIsObject(context.JSGlobalContextRef, methodValue.JSValueRef)) {
                        JSObjectRef objectRef = JSValueToObject(context.JSGlobalContextRef, methodValue.JSValueRef, NULL);
                        if (objectRef && JSObjectIsFunction(context.JSGlobalContextRef, objectRef)) {
                            JSValue *arrayValue = [arguments toJSValueInContext:context];
                            [methodValue invokeMethod:method withArguments:[arrayValue toArray]];
                        }
                        else {
                            NSString *msg = [NSString stringWithFormat:@"%@ is not a method", method];
                            executeError = NativeRenderErrorWithMessageAndModuleName(msg, moduleName);
                        }
                    }
                    else {
                        NSString *msg = [NSString stringWithFormat:@"%@ is not a method", method];
                        executeError = NativeRenderErrorWithMessageAndModuleName(msg, moduleName);
                    }
                }
                else {
                    executeError = NativeRenderErrorWithMessageAndModuleName(@"__fbBatchedBridge not found", moduleName);
                }
#else
                SharedCtxPtr context = strongSelf.pScope->GetContext();
                SharedCtxValuePtr batchedbridge_value = context->GetGlobalObjVar("__fbBatchedBridge");
                SharedCtxValuePtr resultValue = nullptr;
                unicode_string_view exception;
                if (batchedbridge_value) {
                    unicode_string_view methodName = NSStringToU8StringView(method);
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
                            [NSString stringWithFormat:@"property/function %@ not found in __fbBatchedBridge", method], moduleName);
                    }
                } else {
                    executeError = NativeRenderErrorWithMessageAndModuleName(@"__fbBatchedBridge not found", moduleName);
                }
                if (!StringViewUtils::IsEmpty(exception) || executeError) {
                    if (!StringViewUtils::IsEmpty(exception)) {
                        NSString *string = UnicodeStringViewToNSString(exception);
                        executeError = NativeRenderErrorWithMessageAndModuleName(string, moduleName);
                    }
                } else if (resultValue) {
//                    objcValue = ObjectFromJSValue(context, resultValue);
                }
#endif
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
        NSError *error = executeApplicationScript(script, sourceURL, self->_performanceLogger, self.pScope->GetContext());
        if (onComplete) {
            onComplete(error);
        }
    }];
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

static NSError *executeApplicationScript(NSData *script, NSURL *sourceURL, HippyPerformanceLogger *performanceLogger, SharedCtxPtr context) {
    @autoreleasepool {
        [performanceLogger markStartForTag:HippyPLScriptExecution];
        const unicode_string_view::char8_t_ *string = static_cast<const unicode_string_view::char8_t_ *>([script bytes]);
        unicode_string_view string_view(string, [script length]);
        unicode_string_view fileName = NSStringToU8StringView([sourceURL absoluteString]);
        unicode_string_view errorMsg;
        NSLock *lock = jslock();
        BOOL lockSuccess = [lock lockBeforeDate:[NSDate dateWithTimeIntervalSinceNow:1]];
        {
            auto tryCatch = hippy::napi::CreateTryCatchScope(true, context);
            SharedCtxValuePtr result = context->RunScript(string_view, fileName);
            if (tryCatch->HasCaught()) {
                errorMsg = std::move(tryCatch->GetExceptionMsg());
            }
        }
        if (lockSuccess) {
            [lock unlock];
        }
        [performanceLogger markStopForTag:HippyPLScriptExecution];
        NSError *error = !StringViewUtils::IsEmpty(errorMsg) ? [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@{
            NSLocalizedDescriptionKey: UnicodeStringViewToNSString(errorMsg)}]
        : nil;
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

    __weak HippyJSExecutor *weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        HippyJSExecutor *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.isValid) {
            return;
        }
        unicode_string_view json_view = NSStringToU8StringView(script);
        unicode_string_view name_view = NSStringToU8StringView(objectName);
        auto context = strongSelf.pScope->GetContext();
        auto tryCatch = hippy::napi::CreateTryCatchScope(true, context);
        context->SetGlobalJsonVar(name_view, json_view);
        if (tryCatch->HasCaught()) {
            unicode_string_view errorMsg = tryCatch->GetExceptionMsg();
            NSError *error = [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@{
                NSLocalizedDescriptionKey: UnicodeStringViewToNSString(errorMsg)}];
            onComplete(error);
        }
        else {
            onComplete(nil);
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
