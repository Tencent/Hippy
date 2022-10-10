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
#import "HippyAssert.h"
#import "HippyBundleURLProvider.h"
#import "HippyContextWrapper.h"
#import "HippyDefines.h"
#import "HippyDevInfo.h"
#import "HippyDevMenu.h"
#import "HippyJavaScriptLoader.h"
#import "HippyJSEnginesMapper.h"
#import "HippyJSExecutor.h"
#import "HippyOCTurboModule+Inner.h"
#import "HippyPerformanceLogger.h"
#import "HippyRedBox.h"
#import "HippyTurboModuleManager.h"
#import "NativeRenderLog.h"
#import "NativeRenderUtils.h"
#import "NSObject+CtxValue.h"

#include <cinttypes>
#include <memory>
#include <pthread.h>
#include <string>
#include <unordered_map>

#include "driver/engine.h"
#include "driver/napi/js_native_api.h"
#include "driver/scope.h"
#include "footstone/string_view.h"
#include "footstone/string_view_utils.h"
#include "footstone/task_runner.h"
#include "footstone/task.h"
#include "ios_loader.h"

NSString *const HippyJSCThreadName = @"com.tencent.hippy.JavaScript";

using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::stringview::StringViewUtils;
using SharedCtxPtr = std::shared_ptr<hippy::napi::Ctx>;
using WeakCtxPtr = std::weak_ptr<hippy::napi::Ctx>;
using SharedCtxValuePtr = std::shared_ptr<hippy::napi::CtxValue>;
using WeakCtxValuePtr = std::weak_ptr<hippy::napi::CtxValue>;

static bool defaultDynamicLoadAction(const string_view& uri, std::function<void(u8string)> cb) {
    std::u16string u16Uri = StringViewUtils::ConvertEncoding(uri, string_view::Encoding::Utf16).utf16_value();
    NativeRenderLogInfo(@"[Hippy_OC_Log][Dynamic_Load], to default dynamic load action:%S", (const unichar*)u16Uri.c_str());
    NSString *URIString = [NSString stringWithCharacters:(const unichar*)u16Uri.c_str() length:(u16Uri.length())];
    NSURL *url = NativeRenderURLWithString(URIString, NULL);
    if ([url isFileURL]) {
        NSString *result = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:nil];
        u8string content(reinterpret_cast<const string_view::char8_t_*>([result UTF8String]?[result UTF8String]:""));
        cb(std::move(content));;
    }
    else {
        NSURLRequest *req = [NSURLRequest requestWithURL:url];
        [[[NSURLSession sharedSession] dataTaskWithRequest:req completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
            if (error) {
                NativeRenderLogInfo(@"[Hippy_OC_Log][Dynamic_Load], error:%@", [error description]);
                u8string emptyContent;
                cb(std::move(emptyContent));
            }
            else {
                NSString *result = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
                u8string content(reinterpret_cast<const string_view::char8_t_*>([result UTF8String]?:""));
                cb(std::move(content));
            }
        }] resume];
    }
    return true;
}

static bool loadFunc(const string_view& uri, std::function<void(u8string)> cb, CFTypeRef userData) {
    std::u16string u16Uri = StringViewUtils::ConvertEncoding(uri, string_view::Encoding::Utf16).utf16_value();
    NativeRenderLogInfo(@"[Hippy_OC_Log][Dynamic_Load], start load function:%S", (const unichar*)u16Uri.c_str());
    HippyBridge *strongBridge = (__bridge HippyBridge *)userData;
    if ([strongBridge.delegate respondsToSelector:@selector(dynamicLoad:URI:completion:)]) {
        NSString *URIString = [NSString stringWithCharacters:(const unichar *)u16Uri.c_str() length:u16Uri.length()];
        BOOL delegateCallRet = [strongBridge.delegate dynamicLoad:strongBridge URI:URIString completion:^(NSString *result) {
            u8string content(reinterpret_cast<const string_view::char8_t_*>([result UTF8String]?:""));
            cb(std::move(content));
        }];
        return delegateCallRet?:defaultDynamicLoadAction(uri, cb);
    }
    else {
        return defaultDynamicLoadAction(uri, cb);
    }
}

@interface HippyJSExecutor () {
    // Set at setUp time:
    HippyPerformanceLogger *_performanceLogger;
    std::unique_ptr<hippy::napi::TurboEnv> _turboRuntime;
    id<HippyContextWrapper> _contextWrapper;
    NSMutableArray<dispatch_block_t> *_pendingCalls;
    __weak HippyBridge *_bridge;
}

@property(readwrite, assign) BOOL ready;

@end

@implementation HippyJSExecutor

- (void)setBridge:(HippyBridge *)bridge {
    _bridge = bridge;
    _performanceLogger = [bridge performanceLogger];
}

- (HippyBridge *)bridge {
    return _bridge;
}

- (instancetype)initWithEngineKey:(NSString *)engineKey bridge:(HippyBridge *)bridge {
    if (self = [super init]) {
        _valid = YES;
        // maybe bug in JavaScriptCore：
        // JSContextRef held by JSContextGroupRef cannot be deallocated,
        // unless JSContextGroupRef is deallocated
        self.enginekey = engineKey;
        self.bridge = bridge;

        self.ready = NO;
        _pendingCalls = [NSMutableArray arrayWithCapacity:4];
        NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor Init %p, engineKey:%@", self, engineKey);
    }

    return self;
}

- (void)setup {
    auto engine = [[HippyJSEnginesMapper defaultInstance] createJSEngineResourceForKey:self.enginekey];
    std::unique_ptr<hippy::Engine::RegisterMap> map = [self registerMap];
    const char *pName = [self.enginekey UTF8String] ?: "";
    std::shared_ptr<hippy::Scope> scope = engine->GetEngine()->CreateScope(pName, std::move(map));
    self.pScope = scope;
    [self initURILoader];
#ifdef ENABLE_INSPECTOR
    HippyBridge *bridge = self.bridge;
    if (bridge && bridge.debugMode) {
        NSString *wsURL = [self completeWSURLWithBridge:bridge];
        auto workerManager = std::make_shared<footstone::WorkerManager>(1);
        auto devtools_data_source = std::make_shared<hippy::devtools::DevtoolsDataSource>([wsURL UTF8String], workerManager);
        devtools_data_source->SetRuntimeDebugMode(bridge.debugMode);
        self.pScope->SetDevtoolsDataSource(devtools_data_source);
    }
#endif
}

- (void)initURILoader {
    HippyBridge *bridge = _bridge;
    if (bridge) {
        std::shared_ptr<IOSLoader> loader = std::make_shared<IOSLoader>(loadFunc, (__bridge void *)bridge);
        self.pScope->SetUriLoader(loader);
    }
}

static string_view NSStringToU8StringView(NSString* str) {
  std::string u8 = [str UTF8String];
  return string_view(reinterpret_cast<const string_view::char8_t_*>(u8.c_str()), u8.length());
}

- (std::unique_ptr<hippy::Engine::RegisterMap>)registerMap {
    __weak HippyJSExecutor *weakSelf = self;
    hippy::base::RegisterFunction taskEndCB = [weakSelf](void *) {
        @autoreleasepool {
            HippyJSExecutor *strongSelf = weakSelf;
            HippyBridge *bridge = strongSelf.bridge;
            if (strongSelf && bridge) {
                [bridge handleBuffer:nil batchEnded:YES];
            }
        }
    };
    
    hippy::base::RegisterFunction ctxCreateCB = [weakSelf](void *p) {
        @autoreleasepool {
            HippyJSExecutor *strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            HippyBridge *bridge = strongSelf.bridge;
            if (!bridge) {
                return;
            }
            hippy::ScopeWrapper *wrapper = reinterpret_cast<hippy::ScopeWrapper *>(p);
            std::shared_ptr<hippy::Scope> scope = wrapper->scope_.lock();
            if (scope) {
                auto context = scope->GetContext();
                context->RegisterGlobalInJs();
                context->RegisterClasses(scope);
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
                        NSLocalizedFailureErrorKey:message?:@"unknown",
                        HippyJSStackTraceKey:stackFrames
                    };
                    NSError *error = [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:userInfo];
                    HippyFatal(error, bridge);
                };
                strongSelf->_contextWrapper = contextWrapper;
                NSMutableDictionary *deviceInfo = [NSMutableDictionary dictionaryWithDictionary:[bridge deviceInfo]];                
                NSString *deviceName = [[UIDevice currentDevice] name];
                NSString *clientId = NativeRenderMD5Hash([NSString stringWithFormat:@"%@%p", deviceName, strongSelf]);
                NSDictionary *debugInfo = @{@"Debug" : @{@"debugClientId" : clientId}};
                [deviceInfo addEntriesFromDictionary:debugInfo];
                
                NSError *JSONSerializationError = nil;
                NSData *data = [NSJSONSerialization dataWithJSONObject:deviceInfo options:0 error:&JSONSerializationError];
                if (JSONSerializationError) {
                    NSString *errorString =
                        [NSString stringWithFormat:@"device parse error:%@, deviceInfo:%@", [JSONSerializationError localizedFailureReason], deviceInfo];
                    NSError *error = NativeRenderErrorWithMessageAndModuleName(errorString, bridge.moduleName);
                    HippyFatal(error, bridge);
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
                    HippyBridge *bridge = strongSelf.bridge;
                    if (!bridge) {
                        return nil;
                    }
                    [bridge handleBuffer:calls batchEnded:NO];
                    return nil;
                }];

                strongSelf->_turboRuntime = hippy::napi::GetTurboEnvInstance(scope->GetContext());
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
            if (strongSelf.contextCreatedBlock) {
                strongSelf.contextCreatedBlock(strongSelf->_contextWrapper);
            }
        }
    };

    hippy::base::RegisterFunction scopeInitializedCB = [weakSelf](void *p) {
        @autoreleasepool {
            HippyJSExecutor *strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            strongSelf.ready = YES;
            NSArray<dispatch_block_t> *pendingCalls = [strongSelf->_pendingCalls copy];
            [pendingCalls enumerateObjectsUsingBlock:^(dispatch_block_t  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
                [strongSelf executeBlockOnJavaScriptQueue:obj];
            }];
            [strongSelf->_pendingCalls removeAllObjects];
        }
    };
    std::unique_ptr<hippy::Engine::RegisterMap> ptr = std::make_unique<hippy::Engine::RegisterMap>();
    ptr->insert(std::make_pair(hippy::base::kAsyncTaskEndKey, taskEndCB));
    ptr->insert(std::make_pair(hippy::base::kContextCreatedCBKey, ctxCreateCB));
    ptr->insert(std::make_pair(hippy::base::KScopeInitializedCBKey, scopeInitializedCB));
    return ptr;
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
    HippyBridge *bridge = self.bridge;
    HippyOCTurboModule *turboModule = [bridge turboModuleWithName:name];
    if (!turboModule) {
        return self.pScope->GetContext()->CreateNull();
    }

    // create jsProxy
    std::shared_ptr<hippy::napi::HippyTurboModule> ho = [turboModule getTurboModule];
    //should be function!!!!!
    SharedCtxValuePtr obj = self->_turboRuntime->CreateObject(ho);
    return obj;
}

- (void)invalidate {
    if (!self.isValid) {
        return;
    }
#ifdef ENABLE_INSPECTOR
    auto devtools_data_source = self.pScope->GetDevtoolsDataSource();
    HippyBridge *bridge = self.bridge;
    if (devtools_data_source && bridge) {
        bool reload = bridge.invalidateReason == NativeRenderInvalidateReasonReload ? true : false;
        devtools_data_source->Destroy(reload);
    }
#endif
    NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor invalide %p", self);
    _valid = NO;
    [_contextWrapper setContextName:@"HippyJSContext(delete)"];
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

- (void)setContextName:(NSString *)contextName {
    __weak id<HippyContextWrapper> weakWrapper = _contextWrapper;
    [self executeBlockOnJavaScriptQueue:^{
        id<HippyContextWrapper> strongWrapper = weakWrapper;
        if (strongWrapper) {
            [strongWrapper setContextName:contextName];
        }
    }];
}

- (void)dealloc {
    NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor dealloc %p", self);
    [self invalidate];
}

-(void)addInfoToGlobalObject:(NSDictionary*)addInfoDict {
    __weak HippyJSExecutor *weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        HippyJSExecutor *strongSelf = weakSelf;
        if (strongSelf) {
            [strongSelf->_contextWrapper setProperties:addInfoDict toGlobalObject:@"__HIPPYNATIVEGLOBAL__"];
        }
    }];
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
            HippyBridge *bridge = strongSelf.bridge;
            if (!bridge) {
                return;
            }
            @try {
                NSError *executeError = nil;
                id<HippyContextWrapper> contextWrapper = strongSelf->_contextWrapper;
                id objcValue = [contextWrapper callFunction:method arguments:arguments];
                if (contextWrapper.exception) {
                    executeError = NativeRenderErrorWithMessageAndModuleName(contextWrapper.exception, [bridge moduleName]);
                }
                onComplete(objcValue, executeError);
            } @catch (NSException *exception) {
                NSString *moduleName = bridge.moduleName?:@"unknown";
                NSMutableDictionary *userInfo = [exception.userInfo mutableCopy]?:[NSMutableDictionary dictionary];
                [userInfo setObject:moduleName forKey:HippyFatalModuleName];
                [userInfo setObject:arguments?:[NSArray array] forKey:@"arguments"];
                NSException *reportException = [NSException exceptionWithName:exception.name reason:exception.reason userInfo:userInfo];
                HippyHandleException(reportException, bridge);
            }
        }
    }];
}

- (void)executeApplicationScript:(NSString *)script sourceURL:(NSURL *)sourceURL onComplete:(HippyJavaScriptCallback)onComplete {
    HippyAssertParam(script);
    HippyAssertParam(sourceURL);
    __weak HippyJSExecutor *weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        HippyJSExecutor *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.isValid) {
            return;
        }
        NSError *error = nil;
        id result = [self innerExecuteApplicationScript:script sourceURL:sourceURL error:&error];
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

- (id)innerExecuteApplicationScript:(NSString *)script sourceURL:(NSURL *)sourceURL error:(NSError **)error {
    @autoreleasepool {
        [_performanceLogger markStartForTag:HippyPLScriptExecution];
        NSString *scriptString = script;
        NSLock *lock = jslock();
        NSString *errorMsg = nil;
        id result = nil;
        BOOL lockSuccess = [lock lockBeforeDate:[NSDate dateWithTimeIntervalSinceNow:1]];
        {
            NSData *cachedCode = NULL;
            HippyBridge *bridge = self.bridge;
            if ([bridge.delegate respondsToSelector:@selector(cachedCodeForBridge:script:sourceURL:)]) {
                cachedCode = [bridge.delegate cachedCodeForBridge:bridge script:script sourceURL:sourceURL];
            }
            result = [_contextWrapper runScript:scriptString sourceURL:sourceURL useCachedCode:YES cachedCodeData:&cachedCode];
            if ([bridge.delegate respondsToSelector:@selector(cachedCodeCreated:ForBridge:script:sourceURL:)]) {
                [bridge.delegate cachedCodeCreated:cachedCode ForBridge:bridge script:script sourceURL:sourceURL];
            }
            errorMsg = [_contextWrapper exception];
        }
        if (lockSuccess) {
            [lock unlock];
        }
        [_performanceLogger markStopForTag:HippyPLScriptExecution];
        if (error) {
            *error = errorMsg ? [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@{
                NSLocalizedDescriptionKey: errorMsg}] : nil;
        }
        return result;
    }
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
        HippyAssert(NativeRenderJSONParse(script, NULL) != nil, @"%@ wasn't valid JSON!", script);
    }

    __weak HippyJSExecutor *weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        HippyJSExecutor *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.isValid) {
            return;
        }
        id<HippyContextWrapper> contextWrapper = strongSelf->_contextWrapper;
        [contextWrapper createGlobalObject:objectName withJsonValue:script];
        if ([contextWrapper exception]) {
            NSError *error = [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@{
                NSLocalizedDescriptionKey: [contextWrapper exception]}];
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
