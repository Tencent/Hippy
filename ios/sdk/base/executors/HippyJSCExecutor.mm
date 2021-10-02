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
#import "HippyLog.h"
#import "HippyPerformanceLogger.h"
#import "HippyUtils.h"
#import "HippyRedBox.h"
#import "HippyJSCWrapper.h"
#import "HippyJSCErrorHandling.h"
#import "HippyJSEnginesMapper.h"
#import "HippyBridge+LocalFileSource.h"
#include "ios_loader.h"
#import "HippyBridge+Private.h"
#include "core/base/string_view_utils.h"
#include "core/napi/jsc/js_native_api_jsc.h"
#include "core/task/javascript_task.h"
#include "core/napi/js_native_api.h"
#include "core/scope.h"
#include "core/task/javascript_task_runner.h"
#include "core/engine.h"
#import "HippyOCTurboModule+Inner.h"
#import "HippyTurboModuleManager.h"

NSString *const HippyJSCThreadName = @"com.tencent.hippy.JavaScript";
NSString *const HippyJavaScriptContextCreatedNotification = @"HippyJavaScriptContextCreatedNotification";
NSString *const HippyJavaScriptContextCreatedNotificationBridgeKey = @"HippyJavaScriptContextCreatedNotificationBridgeKey";

HIPPY_EXTERN NSString *const HippyFBJSContextClassKey = @"_HippyFBJSContextClassKey";
HIPPY_EXTERN NSString *const HippyFBJSValueClassKey = @"_HippyFBJSValueClassKey";

struct __attribute__((packed)) ModuleData {
    uint32_t offset;
    uint32_t size;
};

using file_ptr = std::unique_ptr<FILE, decltype(&fclose)>;
using memory_ptr = std::unique_ptr<void, decltype(&free)>;
using unicode_string_view = tdf::base::unicode_string_view;
using StringViewUtils = hippy::base::StringViewUtils;


struct RandomAccessBundleData {
    file_ptr bundle;
    size_t baseOffset;
    size_t numTableEntries;
    std::unique_ptr<ModuleData[]> table;
    RandomAccessBundleData()
        : bundle(nullptr, fclose) { }
};

static bool defaultDynamicLoadAction(const unicode_string_view& uri, std::function<void(u8string)> cb) {
    std::u16string u16Uri = StringViewUtils::Convert(uri, unicode_string_view::Encoding::Utf16).utf16_value();
    HippyLogInfo(@"[Hippy_OC_Log][Dynamic_Load], to default dynamic load action:%S", (const unichar*)u16Uri.c_str());
    NSString *URIString = [NSString stringWithCharacters:(const unichar*)u16Uri.c_str() length:(u16Uri.length())];
    NSURL *url = HippyURLWithString(URIString, NULL);
    if ([url isFileURL]) {
        NSString *result = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:nil];
        u8string content(reinterpret_cast<const unicode_string_view::char8_t_*>([result UTF8String]?:""));
        cb(std::move(content));;
    }
    else {
        NSURLRequest *req = [NSURLRequest requestWithURL:url];
        [[[NSURLSession sharedSession] dataTaskWithRequest:req completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
            if (error) {
                HippyLogInfo(@"[Hippy_OC_Log][Dynamic_Load], error:%@", [error description]);
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
    HippyLogInfo(@"[Hippy_OC_Log][Dynamic_Load], start load function:%S", (const unichar*)u16Uri.c_str());
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

@implementation HippyJSCExecutor {
    // Set at setUp time:
    HippyPerformanceLogger *_performanceLogger;
    JSContext *_JSContext;
    // Set as needed:
    RandomAccessBundleData _randomAccessBundle;
    JSValueRef _batchedBridgeRef;
    
    std::unique_ptr<hippy::napi::ObjcTurboEnv> _turboRuntime;
}

@synthesize valid = _valid;
@synthesize executorkey = _executorkey;
@synthesize bridge = _bridge;
@synthesize pScope = _pScope;
@synthesize JSGlobalContextRef = _JSGlobalContextRef;

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
        std::shared_ptr<Engine> engine = [[HippyJSEnginesMapper defaultInstance] createJSEngineForKey:self.executorkey];
        std::unique_ptr<Engine::RegisterMap> map = [self registerMap];
        const char *pName = [execurotkey UTF8String] ?: "";
        std::shared_ptr<Scope> scope = engine->CreateScope(pName, std::move(map));
        self.pScope = scope;
        [self initURILoader];
        HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor Init %p, execurotkey:%@", self, execurotkey);
    }

    return self;
}

- (void)initURILoader {
    std::shared_ptr<IOSLoader> loader = std::make_shared<IOSLoader>(loadFunc, (__bridge void *)_bridge);
    self.pScope->SetUriLoader(loader);
}

static std::u16string NSStringToU16(NSString* str) {
  if (!str) {
    return u"";
  }
  unsigned long len = str.length;
  std::u16string ret;
  ret.resize(len);
  unichar *p = reinterpret_cast<unichar*>(const_cast<char16_t*>(&ret[0]));
  [str getCharacters:p range:NSRange{0, len}];
  return ret;
}

static unicode_string_view NSStringToU8(NSString* str) {
  std::string u8 = [str UTF8String];
  return unicode_string_view(reinterpret_cast<const unicode_string_view::char8_t_*>(u8.c_str()), u8.length());
}

- (std::unique_ptr<Engine::RegisterMap>)registerMap {
    __weak HippyJSCExecutor *weakSelf = self;
    __weak id<HippyBridgeDelegate> weakBridgeDelegate = self.bridge.delegate;
    hippy::base::RegisterFunction taskEndCB = [weakSelf](void *) {
        HippyJSCExecutor *strongSelf = weakSelf;
        if (strongSelf) {
          handleJsExcepiton(strongSelf->_pScope);
          [strongSelf->_bridge handleBuffer:nil batchEnded:YES];
        }
    };
    hippy::base::RegisterFunction ctxCreateCB = [weakSelf, weakBridgeDelegate](void *p) {
        HippyJSCExecutor *strongSelf = weakSelf;
        if (!strongSelf) {
            return;
        }
        id<HippyBridgeDelegate> strongBridgeDelegate = weakBridgeDelegate;
        ScopeWrapper *wrapper = reinterpret_cast<ScopeWrapper *>(p);
        std::shared_ptr<Scope> scope = wrapper->scope_.lock();
        if (scope) {
            std::shared_ptr<hippy::napi::JSCCtx> context = std::static_pointer_cast<hippy::napi::JSCCtx>(scope->GetContext());
            JSContext *jsContext = [JSContext contextWithJSGlobalContextRef:context->GetCtxRef()];
            context->RegisterGlobalInJs();
            NSMutableDictionary *deviceInfo = [NSMutableDictionary dictionaryWithDictionary:[strongSelf.bridge deviceInfo]];
            if ([strongBridgeDelegate respondsToSelector:@selector(objectsBeforeExecuteCode)]) {
                NSDictionary *customObjects = [strongBridgeDelegate objectsBeforeExecuteCode];
                if (customObjects) {
                    [deviceInfo addEntriesFromDictionary:customObjects];
                }
            }
            NSError *JSONSerializationError = nil;
            NSData *data = [NSJSONSerialization dataWithJSONObject:deviceInfo options:0 error:&JSONSerializationError];
            if (JSONSerializationError) {
                NSString *errorString =
                    [NSString stringWithFormat:@"device parse error:%@, deviceInfo:%@", [JSONSerializationError localizedFailureReason], deviceInfo];
                NSError *error = HippyErrorWithMessageAndModuleName(errorString, strongSelf.bridge.moduleName);
                HippyFatal(error);
            }
            NSString *string = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
            context->SetGlobalJsonVar("__HIPPYNATIVEGLOBAL__", NSStringToU8(string));
            context->SetGlobalJsonVar("__fbBatchedBridgeConfig", NSStringToU8([strongSelf.bridge moduleConfig]));
            NSString *workFolder = [strongSelf.bridge workFolder2];
            HippyAssert(workFolder, @"work folder path should not be null");
            if (workFolder) {
                context->SetGlobalStrVar("__HIPPYCURDIR__", NSStringToU8(workFolder));
            }
            else {
                context->SetGlobalStrVar("__HIPPYCURDIR__", NSStringToU8(@""));
            }
            installBasicSynchronousHooksOnContext(jsContext);
            jsContext[@"nativeRequireModuleConfig"] = ^NSArray *(NSString *moduleName) {
                HippyJSCExecutor *strongSelf = weakSelf;
                if (!strongSelf.valid) {
                    return nil;
                }

                NSArray *result = [strongSelf->_bridge configForModuleName:moduleName];
                return HippyNullIfNil(result);
            };

            jsContext[@"nativeFlushQueueImmediate"] = ^(NSArray<NSArray *> *calls) {
                HippyJSCExecutor *strongSelf = weakSelf;
                if (!strongSelf.valid || !calls) {
                    return;
                }
                [strongSelf->_bridge handleBuffer:calls batchEnded:NO];
            };

            jsContext[@"nativeCallSyncHook"] = ^id(NSUInteger module, NSUInteger method, NSArray *args) {
                HippyJSCExecutor *strongSelf = weakSelf;
                if (!strongSelf.valid) {
                    return nil;
                }

                id result = [strongSelf->_bridge callNativeModule:module method:method params:args];
                return result;
            };

#if HIPPY_DEV
            // Inject handler used by HMR
            jsContext[@"nativeInjectHMRUpdate"] = ^(NSString *sourceCode, NSString *sourceCodeURL) {
                HippyJSCExecutor *strongSelf = weakSelf;
                if (!strongSelf.valid) {
                    return;
                }

                JSStringRef execJSString = JSStringCreateWithUTF8CString(sourceCode.UTF8String);
                JSStringRef jsURL = JSStringCreateWithUTF8CString(sourceCodeURL.UTF8String);
                JSEvaluateScript([strongSelf JSGlobalContextRef], execJSString, NULL, jsURL, 0, NULL);
                JSStringRelease(jsURL);
                JSStringRelease(execJSString);
            };
#endif
            
            strongSelf->_turboRuntime = std::make_unique<hippy::napi::ObjcTurboEnv>(scope->GetContext());
            jsContext[@"getTurboModule"] = ^id (NSString *name, NSString *args) {
                HippyJSCExecutor *strongSelf = weakSelf;
                if (!strongSelf.valid) {
                    return nil;
                }
                JSValueRef value_ = [strongSelf JSTurboObjectWithName:name];
                JSValue *objc_value = [JSValue valueWithJSValueRef:value_ inContext:[strongSelf JSContext]];
                return objc_value;
            };
        }
    };
  
    hippy::base::RegisterFunction scopeInitializedCB = [weakSelf](void *p) {
      HippyJSCExecutor *strongSelf = weakSelf;
      if (!strongSelf) {
          return;
      }
      ScopeWrapper *wrapper = reinterpret_cast<ScopeWrapper *>(p);
      std::shared_ptr<Scope> scope = wrapper->scope_.lock();
      handleJsExcepiton(scope);
    };
    std::unique_ptr<Engine::RegisterMap> ptr = std::make_unique<Engine::RegisterMap>();
    ptr->insert(std::make_pair("ASYNC_TASK_END", taskEndCB));
    ptr->insert(std::make_pair(hippy::base::kContextCreatedCBKey, ctxCreateCB));
    ptr->insert(std::make_pair(hippy::base::KScopeInitializedCBKey, scopeInitializedCB));
    return ptr;
}

- (JSValueRef)JSTurboObjectWithName:(NSString *)name {
    //create HostObject by name
    HippyOCTurboModule *turboModule = [self->_bridge turboModuleWithName:name];
    if (!turboModule) {
        JSGlobalContextRef ctx = [self JSGlobalContextRef];
        return JSValueMakeNull(ctx);
    }

    // create jsProxy
    std::shared_ptr<hippy::napi::HippyTurboModule> ho = [turboModule getTurboModule];
    //should be function!!!!!
    std::shared_ptr<hippy::napi::CtxValue> obj = self->_turboRuntime->CreateObject(ho);
    std::shared_ptr<hippy::napi::JSCCtxValue> jscObj = std::dynamic_pointer_cast<hippy::napi::JSCCtxValue>(obj);
    return jscObj->value_;
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

- (BOOL)_synchronouslyExecuteApplicationScript:(NSData *)script sourceURL:(NSURL *)sourceURL JSContext:(JSContext *)context error:(NSError **)error {
    BOOL isRAMBundle = NO;
    script = loadPossiblyBundledApplicationScript(script, sourceURL, _performanceLogger, isRAMBundle, _randomAccessBundle, error);
    if (!script) {
        return NO;
    }
    if (isRAMBundle) {
        registerNativeRequire(context, self);
    }
    NSError *returnedError = executeApplicationScript(script, sourceURL, _performanceLogger, [self JSGlobalContextRef]);
    if (returnedError) {
        if (error) {
            *error = returnedError;
        }
        return NO;
    } else {
        return YES;
    }
}

- (void)setUp {
    [self executeBlockOnJavaScriptQueue:^{
        if (!self.valid) {
            return;
        }
        NSMutableDictionary *threadDictionary = [[NSThread currentThread] threadDictionary];
        if (!threadDictionary[HippyFBJSContextClassKey] || !threadDictionary[HippyFBJSValueClassKey]) {
            threadDictionary[HippyFBJSContextClassKey] = [JSContext class];
            threadDictionary[HippyFBJSValueClassKey] = [JSValue class];
        }
    }];
}

/** Installs synchronous hooks that don't require a weak reference back to the HippyJSCExecutor. */
static void installBasicSynchronousHooksOnContext(JSContext *context) {
    context[@"nativeLoggingHook"] = ^(NSString *message, NSNumber *logLevel) {
        HippyLogLevel level = HippyLogLevelInfo;
        if (logLevel) {
            level = MAX(level, (HippyLogLevel)logLevel.integerValue);
        }

        _HippyLogJavaScriptInternal(level, message);
    };
    context[@"nativePerformanceNow"] = ^{
        return @(CACurrentMediaTime() * 1000);
    };
}

- (void)invalidate {
    if (!self.isValid) {
        return;
    }
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor invalide %p", self);
    _valid = NO;
    self.pScope->WillExit();
    self.pScope = nullptr;
    _JSContext.name = @"HippyJSContext(delete)";
    _JSContext = nil;
    _JSGlobalContextRef = NULL;
    dispatch_async(dispatch_get_main_queue(), ^{
        HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor remove engine %@", [self executorkey]);
        [[HippyJSEnginesMapper defaultInstance] removeEngineForKey:[self executorkey]];
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
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyJSCExecutor dealloc %p", self);
    [self invalidate];
    _randomAccessBundle.bundle.reset();
    _randomAccessBundle.table.reset();
}

- (void)secondBundleLoadCompleted:(BOOL)success {
    std::shared_ptr<hippy::napi::JSCCtx> context = std::static_pointer_cast<hippy::napi::JSCCtx>(self.pScope->GetContext());
    HippyAssert(context != nullptr, @"secondBundleLoadCompleted get null context");
    if (nullptr == context) {
        return;
    }
    NSString *workFolder = [self.bridge workFolder2];
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
    JSContext *context = [self JSContext];
    if (context) {
        JSValue *value = context[@"__HIPPYNATIVEGLOBAL__"];
        if (value) {
            for (NSString *key in addInfoDict) {
                value[key] = addInfoDict[key];
            }
        }
    }
}

- (void)flushedQueue:(HippyJavaScriptCallback)onComplete {
    // TODO: Make this function handle first class instead of dynamically dispatching it. #9317773
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
    // TODO: Make this function handle first class instead of dynamically dispatching it. #9317773
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
                                JSValueRef value = [JSValue valueWithObject:arguments[i] inContext:jsContext].JSValueRef;
                                function_params[i] = std::make_shared<hippy::napi::JSCCtxValue>(globalContextRef, value);
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
                                = HippyErrorWithMessageAndModuleName([NSString stringWithFormat:@"%@ is not a function", method], moduleName);
                        }
                    } else {
                        executeError = HippyErrorWithMessageAndModuleName(
                            [NSString stringWithFormat:@"property/function %@ not found in __fbBatchedBridge", method], moduleName);
                    }
                } else {
                    executeError = HippyErrorWithMessageAndModuleName(@"__fbBatchedBridge not found", moduleName);
                }
                if (!exception.empty() || executeError) {
                    if (!exception.empty()) {
                        NSString *string = [NSString stringWithCharacters: reinterpret_cast<const unichar*>(exception.c_str()) length:exception.length()];
                        executeError = HippyErrorWithMessageAndModuleName(string, moduleName);
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

    BOOL isRAMBundle = NO;
    {
        NSError *error;
        script = loadPossiblyBundledApplicationScript(script, sourceURL, _performanceLogger, isRAMBundle, _randomAccessBundle, &error);
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

        if (isRAMBundle) {
            registerNativeRequire([self JSContext], self);
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
      context->ThrowExceptionToJS(exception);
    }
    std::u16string exceptionStr = StringViewUtils::Convert(context->GetExceptionMsg(exception), unicode_string_view::Encoding::Utf16).utf16_value();
    NSString *err = [NSString stringWithCharacters:(const unichar *)exceptionStr.c_str() length:(exceptionStr.length())];
    NSError *error = HippyErrorWithMessage(err);
    // NSError *error = RCTErrorWithMessageAndModule(err, strongSelf.bridge.moduleName);
    HippyFatal(error);
    context->SetException(nullptr);
    context->SetExceptionHandled(true);
  }
}

static NSData *loadPossiblyBundledApplicationScript(NSData *script, __unused NSURL *sourceURL, __unused HippyPerformanceLogger *performanceLogger,
    __unused BOOL &isRAMBundle, __unused RandomAccessBundleData &randomAccessBundle, __unused NSError **error) {
    // JSStringCreateWithUTF8CString expects a null terminated C string.
    // RAM Bundling already provides a null terminated one.
    NSMutableData *nullTerminatedScript = [NSMutableData dataWithCapacity:script.length + 1];
    [nullTerminatedScript appendData:script];
    [nullTerminatedScript appendBytes:"" length:1];
    script = nullTerminatedScript;
    return script;
}

static void registerNativeRequire(JSContext *context, HippyJSCExecutor *executor) {
    __weak HippyJSCExecutor *weakExecutor = executor;
    context[@"nativeRequire"] = ^(NSNumber *moduleID) {
        [weakExecutor _nativeRequire:moduleID];
    };
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

- (void)executeBlockOnJavaScriptQueue:(dispatch_block_t)block {
    Engine *engine = [[HippyJSEnginesMapper defaultInstance] JSEngineForKey:self.executorkey].get();
    if (engine) {
        if (engine->GetJSRunner()->IsJsThread() == false) {
            std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
            task->callback = block;
            engine->GetJSRunner()->PostTask(task);
        } else {
            block();
        }
    }
}

- (void)executeAsyncBlockOnJavaScriptQueue:(dispatch_block_t)block {
    Engine *engine = [[HippyJSEnginesMapper defaultInstance] JSEngineForKey:self.executorkey].get();
    if (engine) {
        std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
        task->callback = block;
        engine->GetJSRunner()->PostTask(task);
    }
}

- (void)injectJSONText:(NSString *)script asGlobalObjectNamed:(NSString *)objectName callback:(HippyJavaScriptCompleteBlock)onComplete {
    NSAssert(nil != script, @"param 'script' can't be nil");
    if (nil == script) {
        if (onComplete) {
            NSString *errorMessage = [NSString stringWithFormat:@"param 'script' is nil"];
            NSError *error = [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@{ NSLocalizedDescriptionKey: errorMessage }];
            onComplete(error);
        }
        return;
    }
    if (HIPPY_DEBUG) {
        HippyAssert(HippyJSONParse(script, NULL) != nil, @"%@ wasn't valid JSON!", script);
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
            HippyLogError(@"%@", errorMessage);
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

static bool readRandomAccessModule(const RandomAccessBundleData &bundleData, size_t offset, size_t size, char *data) {
    return fseek(bundleData.bundle.get(), offset + bundleData.baseOffset, SEEK_SET) == 0 && fread(data, 1, size, bundleData.bundle.get()) == size;
}

static void executeRandomAccessModule(HippyJSCExecutor *executor, uint32_t moduleID, size_t offset, size_t size) {
    auto data = std::make_unique<char[]>(size);
    if (!readRandomAccessModule(executor->_randomAccessBundle, offset, size, data.get())) {
        HippyFatal(HippyErrorWithMessage(@"Error loading RAM module"));
        return;
    }

    char url[14];  // 10 = maximum decimal digits in a 32bit unsigned int + ".js" + null byte
    sprintf(url, "%" PRIu32 ".js", moduleID);

    JSStringRef code = JSStringCreateWithUTF8CString(data.get());
    JSValueRef jsError = NULL;
    JSStringRef sourceURL = JSStringCreateWithUTF8CString(url);
    JSGlobalContextRef ctx = [executor JSGlobalContextRef];
    JSValueRef result = JSEvaluateScript(ctx, code, NULL, sourceURL, 0, &jsError);

    JSStringRelease(code);
    JSStringRelease(sourceURL);

    if (!result) {
        NSError *error = HippyNSErrorFromJSErrorRef(jsError, ctx);
        dispatch_async(dispatch_get_main_queue(), ^{
            HippyFatal(error);
            [executor invalidate];
        });
    }
}

- (void)_nativeRequire:(NSNumber *)moduleID {
    if (!moduleID) {
        return;
    }

    [_performanceLogger addValue:1 forTag:HippyPLRAMNativeRequiresCount];
    [_performanceLogger appendStartForTag:HippyPLRAMNativeRequires];
    // HIPPY_PROFILE_BEGIN_EVENT(HippyProfileTagAlways, ([@"nativeRequire_" stringByAppendingFormat:@"%@", moduleID]), nil);

    const uint32_t ID = [moduleID unsignedIntValue];

    if (ID < _randomAccessBundle.numTableEntries) {
        ModuleData *moduleData = &_randomAccessBundle.table[ID];
        const uint32_t size = NSSwapLittleIntToHost(moduleData->size);

        // sparse entry in the table -- module does not exist or is contained in the startup section
        if (size == 0) {
            return;
        }

        executeRandomAccessModule(self, ID, NSSwapLittleIntToHost(moduleData->offset), size);
    }

    // HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"js_call");
    [_performanceLogger appendStopForTag:HippyPLRAMNativeRequires];
}

@end
