/*
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */


#import "VoltronJSCExecutor.h"

#import <QuartzCore/QuartzCore.h>
#import <cinttypes>
#import <memory>
#import <pthread.h>
#import <string>
#import <unordered_map>

#if TARGET_OS_IPHONE
#import <UIKit/UIKit.h>
#elif TARGET_OS_MAC
#import <Cocoa/Cocoa.h>
#endif


#import "VoltronDefines.h"

#import "utils/VoltronLog.h"
#import "utils/VoltronPerformanceLogger.h"
#import "utils/VoltronUtils.h"
#import "utils/NSObject+CtxValue.h"

#import "VoltronJSCWrapper.h"

#import "VoltronJSEnginesMapper.h"

#include "footstone/string_view_utils.h"
#include "driver/napi/jsc/jsc_ctx.h"
#include "driver/napi/js_ctx.h"
#include "driver/napi/js_ctx_value.h"
#include "driver/napi/js_try_catch.h"
#include "driver/napi/callback_info.h"
#include "driver/vm/jsc/jsc_vm.h"
#include "footstone/task.h"
#include "driver/scope.h"
#include "driver/engine.h"
#ifdef ENABLE_INSPECTOR
#include "devtools/devtools_data_source.h"
#endif

NSString *const HippyJSCThreadName = @"com.tencent.Voltron.JavaScript";
NSString *const HippyJavaScriptContextCreatedNotification = @"VoltronJavaScriptContextCreatedNotification";
NSString *const HippyJavaScriptContextCreatedNotificationBridgeKey = @"VoltronJavaScriptContextCreatedNotificationBridgeKey";
constexpr char kGlobalKey[] = "global";
constexpr char kHippyKey[] = "Hippy";

struct __attribute__((packed)) ModuleData {
    uint32_t offset;
    uint32_t size;
};

using file_ptr = std::unique_ptr<FILE, decltype(&fclose)>;
using memory_ptr = std::unique_ptr<void, decltype(&free)>;
using string_view = footstone::stringview::string_view;
using StringViewUtils = footstone::StringViewUtils;
using SharedCtxPtr = std::shared_ptr<hippy::napi::Ctx>;
using WeakCtxPtr = std::weak_ptr<hippy::napi::Ctx>;
using SharedCtxValuePtr = std::shared_ptr<hippy::napi::CtxValue>;
using WeakCtxValuePtr = std::weak_ptr<hippy::napi::CtxValue>;


struct RandomAccessBundleData {
    file_ptr bundle;
    size_t baseOffset;
    size_t numTableEntries;
    std::unique_ptr<ModuleData[]> table;
    RandomAccessBundleData()
        : bundle(nullptr, fclose) { }
};


@implementation VoltronJSCExecutor {
  // Set at setUp time:
  VoltronPerformanceLogger *_performanceLogger;
  JSContext *_JSContext;
  // Set as needed:
  RandomAccessBundleData _randomAccessBundle;
  VoltronJSCWrapper *_jscWrapper;
  NSString *_globalConfig;
  VoltronFrameworkInitCallback _completion;
  BOOL debugMode;
  NSNumber* devtoolsId;
}

@synthesize valid = _valid;
@synthesize executorkey = _executorkey;
@synthesize pScope = _pScope;
@synthesize JSGlobalContextRef = _JSGlobalContextRef;

- (instancetype)initWithExecurotKey:(NSString *)execurotkey
                       globalConfig:(NSString *)globalConfig
                         devtoolsId:(NSNumber *)devtoolsId
                          debugMode:(BOOL)debugMode
                         completion:(VoltronFrameworkInitCallback)completion{
    if (self = [super init]) {
        _valid = YES;
        self->_globalConfig = globalConfig;
        self->_completion = completion;
        self.executorkey = execurotkey;
        self->debugMode = debugMode;
        self->devtoolsId = devtoolsId;
        [self setup];

        VoltronLogInfo(@"[Hippy_OC_Log][Life_Circle],VoltronJSCExecutor Init %p, execurotkey:%@", self, execurotkey);
    }

    return self;
}

static string_view NSStringToU8(NSString* str) {
  std::string u8 = [str UTF8String];
  return string_view(reinterpret_cast<const string_view::char8_t_*>(u8.c_str()), u8.length());
}

static id StringJSONToObject(NSString *string) {
    @autoreleasepool {
        NSData *data = [string dataUsingEncoding:NSUTF8StringEncoding];
        id obj = [NSJSONSerialization JSONObjectWithData:data options:(0) error:nil];
        return obj;
    }
}

NSString *StringViewToNSString(const string_view &view) {
    string_view::Encoding encode = view.encoding();
    NSString *result = nil;
    switch (encode) {
        case string_view::Encoding::Latin1:
            result = [NSString stringWithUTF8String:view.latin1_value().c_str()];
            break;
        case string_view::Encoding::Utf8:
        {
            result = [[NSString alloc] initWithBytes:view.utf8_value().c_str()
                                              length:view.utf8_value().length()
                                            encoding:NSUTF8StringEncoding];
            break;
        }
        case string_view::Encoding::Utf16:
        {
            const string_view::u16string &u16String = view.utf16_value();
            result = [NSString stringWithCharacters:(const unichar *)u16String.c_str() length:u16String.length()];
        }
            break;
        case string_view::Encoding::Utf32:
        {
            string_view convertedString = footstone::stringview::StringViewUtils::ConvertEncoding(view, string_view::Encoding::Utf16);
            const string_view::u16string &u16String = convertedString.utf16_value();
            result = [NSString stringWithCharacters:(const unichar *)u16String.c_str() length:u16String.length()];
        }
            break;
        default:
            FOOTSTONE_UNREACHABLE();
            break;
    }
    return result;
}


- (void)setup {
    std::shared_ptr<hippy::Engine> engine = [[VoltronJSEnginesMapper defaultInstance] createJSEngineForKey:self.executorkey];

    const char *pName = [_executorkey UTF8String] ?: "";
    std::shared_ptr<hippy::Scope> scope = engine->CreateScope(pName);
    __weak VoltronJSCExecutor *weakSelf = self;
    __weak NSString *weakGlobalConfig = self->_globalConfig;
    engine->GetJsTaskRunner()->PostTask([weakSelf, weakGlobalConfig](){
        @autoreleasepool {
            VoltronJSCExecutor *strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }

            NSString *strongGlobalConfig = weakGlobalConfig;
            std::shared_ptr<hippy::Scope> scope = strongSelf->_pScope;
            scope->CreateContext();

            std::shared_ptr<hippy::napi::JSCCtx> context = std::static_pointer_cast<hippy::driver::napi::JSCCtx>(scope->GetContext());
            JSContext *jsContext = [JSContext contextWithJSGlobalContextRef:context->GetCtxRef()];
            #if defined(__IPHONE_16_4) && __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_16_4
                if (@available(iOS 16.4, *)) {
                    jsContext.inspectable = true;
                }
            #endif
            auto global_object = context->GetGlobalObject();
            auto user_global_object_key = context->CreateString(kGlobalKey);
            context->SetProperty(global_object, user_global_object_key, global_object);
            auto hippy_key = context->CreateString(kHippyKey);
            context->SetProperty(global_object, hippy_key, context->CreateObject());

            if (!strongSelf->_jscWrapper) {
                [strongSelf->_performanceLogger markStartForTag:VoltronPLJSCWrapperOpenLibrary];
                strongSelf->_jscWrapper = VoltronJSCWrapperCreate(strongSelf->_useCustomJSCLibrary);
                [strongSelf->_performanceLogger markStopForTag:VoltronPLJSCWrapperOpenLibrary];
                installBasicSynchronousHooksOnContext(jsContext);
            }

            auto engine = scope->GetEngine().lock();
            auto native_global_key = context->CreateString("__HIPPYNATIVEGLOBAL__");
            auto global_config_object = engine->GetVM()->ParseJson(context, NSStringToU8(strongGlobalConfig));
            auto flag = context->SetProperty(global_object, native_global_key, global_config_object);
            auto bridge_config_key = context->CreateString("__fbBatchedBridgeConfig");
            auto bridge_config_value = context->CreateObject();
            context->SetProperty(global_object, bridge_config_key, bridge_config_value);
            jsContext[@"hippyCallNatives"] = ^(id module, id method, NSString *callbackId, NSArray *args) {
                VoltronJSCExecutor *strongSelf = weakSelf;
                if (!strongSelf.valid) {
                    return ;
                }
                [strongSelf.provider callNativeModule:module method:method params:args callId:callbackId];
                return ;
            };


      #if HIPPY_DEV
            // Inject handler used by HMR
            jsContext[@"nativeInjectHMRUpdate"] = ^(NSString *sourceCode, NSString *sourceCodeURL) {
            VoltronJSCExecutor *strongSelf = weakSelf;
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
            scope->SyncInitialize();
            strongSelf->_completion(TRUE);
        }
    });
    self.pScope = scope;
#if ENABLE_INSPECTOR
    // create devtools
    if (self->debugMode) {
        auto devtools_id = [self->devtoolsId intValue];
        auto devtools_data_source = hippy::devtools::DevtoolsDataSource::Find(devtools_id);
        self.pScope->SetDevtoolsDataSource(devtools_data_source);
    }
#endif
}

- (JSContext *)JSContext {
    if (nil == _JSContext) {
        JSGlobalContextRef contextRef = [self JSGlobalContextRef];
        if (contextRef) {
            _JSContext = [JSContext contextWithJSGlobalContextRef:contextRef];
            NSDictionary *userInfo = nil;
            if (_JSContext) {
                [[NSNotificationCenter defaultCenter] postNotificationName:HippyJavaScriptContextCreatedNotification object:nil userInfo:userInfo];
            }
        }
    }
    return _JSContext;
}

- (JSGlobalContextRef)JSGlobalContextRef {
    if (nil == _JSGlobalContextRef) {
        std::shared_ptr<hippy::Scope> scope = self.pScope;
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

static NSData *loadPossiblyBundledApplicationScript(NSData *script, __unused NSURL *sourceURL, __unused VoltronPerformanceLogger *performanceLogger,
    __unused BOOL &isRAMBundle, __unused RandomAccessBundleData &randomAccessBundle, __unused NSError **error) {
    // JSStringCreateWithUTF8CString expects a null terminated C string.
    // RAM Bundling already provides a null terminated one.
    NSMutableData *nullTerminatedScript = [NSMutableData dataWithCapacity:script.length + 1];
    [nullTerminatedScript appendData:script];
    [nullTerminatedScript appendBytes:"" length:1];
    script = nullTerminatedScript;
    return script;
}

static void registerNativeRequire(JSContext *context, VoltronJSCExecutor *executor) {
    __weak VoltronJSCExecutor *weakExecutor = executor;
    context[@"nativeRequire"] = ^(NSNumber *moduleID) {
        [weakExecutor _nativeRequire:moduleID];
    };
}

- (void)_nativeRequire:(NSNumber *)moduleID {
    if (!moduleID) {
        return;
    }

    [_performanceLogger addValue:1 forTag:VoltronPLRAMNativeRequiresCount];
    [_performanceLogger appendStartForTag:VoltronPLRAMNativeRequires];
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
    [_performanceLogger appendStopForTag:VoltronPLRAMNativeRequires];
}

- (void)executeApplicationScript:(NSData *)script sourceURL:(NSURL *)sourceURL onComplete:(VoltronJavaScriptCompleteBlock)onComplete {
    NSAssert(script != nil, @"scrip == nil");
    NSAssert(sourceURL != nil, @"sourceURL == nil");

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

static void executeRandomAccessModule(VoltronJSCExecutor *executor, uint32_t moduleID, size_t offset, size_t size) {
    auto data = std::make_unique<char[]>(size);
    if (!readRandomAccessModule(executor->_randomAccessBundle, offset, size, data.get())) {
        //HippyFatal(VoltronErrorWithMessage(@"Error loading RAM module"));
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
        NSError *error = VoltronNSErrorFromJSErrorRef(jsError, ctx);
        dispatch_async(dispatch_get_main_queue(), ^{
            //HippyFatal(error);
            [executor invalidate];
        });
    }
}

static bool readRandomAccessModule(const RandomAccessBundleData &bundleData, size_t offset, size_t size, char *data) {
    return fseek(bundleData.bundle.get(), offset + bundleData.baseOffset, SEEK_SET) == 0 && fread(data, 1, size, bundleData.bundle.get()) == size;
}

static NSLock *jslock() {
    static dispatch_once_t onceToken;
    static NSLock *lock = nil;
    dispatch_once(&onceToken, ^{
        lock = [[NSLock alloc] init];
    });
    return lock;
}

static NSError *executeApplicationScript(NSData *script, NSURL *sourceURL, VoltronPerformanceLogger *performanceLogger, JSGlobalContextRef ctx) {
    [performanceLogger markStartForTag:VoltronPLScriptExecution];
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
    [performanceLogger markStopForTag:VoltronPLScriptExecution];

  NSError *error = jsError ? VoltronNSErrorFromJSErrorRef(jsError, ctx) : nil;
    // HIPPY_PROFILE_END_EVENT(0, @"js_call")
    return error;
}


- (void)setUp {
}
/** Installs synchronous hooks that don't require a weak reference back to the VoltronJSCExecutor. */
static void installBasicSynchronousHooksOnContext(JSContext *context) {
    context[@"nativeLoggingHook"] = ^(NSString *message, NSNumber *logLevel) {
        VoltronLogLevel level = VoltronLogLevelInfo;
        if (logLevel) {
            level = MAX(level, (VoltronLogLevel)logLevel.integerValue);
        }

        _VoltronLogJavaScriptInternal(level, message);
    };
    context[@"nativePerformanceNow"] = ^{
        return @(CACurrentMediaTime() * 1000);
    };
}

- (void)invalidate {
    if (!self.isValid) {
        return;
    }
#ifdef ENABLE_INSPECTOR
    auto devtools_data_source = self.pScope->GetDevtoolsDataSource();
        if (devtools_data_source) {
            // todo 调试模式下这里需要支持reload
//            bool reload = self.bridge.invalidateReason == NativeRenderInvalidateReasonReload ? true : false;
//            devtools_data_source->Destroy(reload);
            devtools_data_source->Destroy(false);
        }
#endif
    VoltronLogInfo(@"[Hippy_OC_Log][Life_Circle],VoltronJSCExecutor invalide %p", self);
    _valid = NO;
    self.pScope->WillExit();
    self.pScope = nullptr;
    _JSContext.name = @"HippyJSContext(delete)";
    _JSContext = nil;
    _JSGlobalContextRef = NULL;
    NSString *key = [self executorkey];
    dispatch_async(dispatch_get_main_queue(), ^{
      VoltronLogInfo(@"[Hippy_OC_Log][Life_Circle],VoltronJSCExecutor remove engine %@", key);
        [[VoltronJSEnginesMapper defaultInstance] removeEngineForKey:key];
    });
}

- (NSString *)contextName {
    return [[self JSContext] name];
}

- (NSString *)executorkey {
    return _executorkey ?: [NSString stringWithFormat:@"%p", self];
}

- (void)dealloc {
    VoltronLogInfo(@"[Hippy_OC_Log][Life_Circle],VoltronJSCExecutor dealloc %p", self);
    [self invalidate];
    _randomAccessBundle.bundle.reset();
    _randomAccessBundle.table.reset();

    if (_jscWrapper) {
        VoltronJSCWrapperRelease(_jscWrapper);
        _jscWrapper = NULL;
    }
}

- (void)secondBundleLoadCompleted:(BOOL)success {
//    std::shared_ptr<hippy::driver::napi::JSCCtx> context = std::static_pointer_cast<hippy::driver::napi::JSCCtx>(self.pScope->GetContext());
//    NSString *workFolder = [self.bridge workFolder2];
//    HippyAssert(workFolder, @"work folder path should not be null");
//    if (workFolder) {
//        context->SetGlobalStrVar("__HIPPYCURDIR__", NSStringToU8(workFolder));
//    }
//    else {
//        context->SetGlobalStrVar("__HIPPYCURDIR__", NSStringToU8(@""));
//    }
}

- (void)updateGlobalObjectBeforeExcuteSecondary{
//    if(![self.bridge.delegate respondsToSelector:@selector(objectsBeforeExecuteSecondaryCode)]){
//        return;
//    }
//    NSDictionary *secondaryGlobal = [self.bridge.delegate objectsBeforeExecuteSecondaryCode];
//    if(0 == secondaryGlobal.count){
//        return;
//    }
//    __weak VoltronJSCExecutor *weakSelf = self;
//    [self executeBlockOnJavaScriptQueue:^{
//        VoltronJSCExecutor *strongSelf = weakSelf;
//        if (!strongSelf || !strongSelf.isValid || nullptr == strongSelf.pScope) {
//            return;
//        }
//        [strongSelf addInfoToGlobalObject:[secondaryGlobal copy]];
//    }];
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

- (void)flushedQueue:(VoltronJavaScriptCallback)onComplete {
    // TODO: Make this function handle first class instead of dynamically dispatching it. #9317773
    [self _executeJSCall:@"flushedQueue" arguments:@[] unwrapResult:YES callback:onComplete];
}

- (void)_callFunctionOnModule:(NSString *)module
                       method:(NSString *)method
                    arguments:(NSArray *)args
                  returnValue:(BOOL)returnValue
                 unwrapResult:(BOOL)unwrapResult
                     callback:(VoltronJavaScriptCallback)onComplete {
    // TODO: Make this function handle first class instead of dynamically dispatching it. #9317773
    NSString *bridgeMethod = returnValue ? @"callFunctionReturnFlushedQueue" : @"callFunctionReturnResultAndFlushedQueue";
    [self _executeJSCall:bridgeMethod arguments:@[module, method, args] unwrapResult:unwrapResult callback:onComplete];
}

- (void)callFunctionOnModule:(NSString *)module method:(NSString *)method arguments:(NSArray *)args callback:(VoltronJavaScriptCallback)onComplete {
    [self _callFunctionOnModule:module method:method arguments:args returnValue:YES unwrapResult:YES callback:onComplete];
}

- (void)callFunctionOnModule:(NSString *)module
                      method:(NSString *)method
                   arguments:(NSArray *)args
             jsValueCallback:(VoltronJavaScriptCallback)onComplete {
    [self _callFunctionOnModule:module method:method arguments:args returnValue:NO unwrapResult:NO callback:onComplete];
}

- (void)callFunctionOnAction:(NSString *)action arguments:(NSDictionary *)args callback:(VoltronJavaScriptCallback)onComplete
{
    [self _executeJSAction:action arguments:@[action?:@"", args?:@{}] unwrapResult:NO callback:onComplete];
}

- (void)invokeCallbackID:(NSNumber *)cbID arguments:(NSArray *)args callback:(VoltronJavaScriptCallback)onComplete {
    // TODO: Make this function handle first class instead of dynamically dispatching it. #9317773
    [self _executeJSCall:@"invokeCallbackAndReturnFlushedQueue" arguments:@[cbID, args] unwrapResult:YES callback:onComplete];
}

- (SharedCtxValuePtr)convertToCtxValue:(const SharedCtxPtr &)context; {
    @autoreleasepool {
        NSAssert(NO, @"%@ must implemente convertToCtxValue method", NSStringFromClass([self class]));
        std::unordered_map<SharedCtxValuePtr, SharedCtxValuePtr> valueMap;
        return context->CreateObject(valueMap);
    }
}

- (void)_executeJSCall:(NSString *)method
             arguments:(NSArray *)arguments
          unwrapResult:(BOOL)unwrapResult
              callback:(VoltronJavaScriptCallback)onComplete {
  NSAssert(onComplete != nil, @"onComplete block should not be nil");
  __weak VoltronJSCExecutor *weakSelf = self;
  [self executeBlockOnJavaScriptQueue:^{
      @autoreleasepool {
          VoltronJSCExecutor *strongSelf = weakSelf;
          if (!strongSelf || !strongSelf.isValid) {
              return;
          }

#ifndef VOLTRON_DEBUG
          @try {
#endif
              VoltronJSCWrapper *jscWrapper = strongSelf->_jscWrapper;
              NSError *executeError = nil;
              id objcValue = nil;
              auto context = strongSelf.pScope->GetContext();
              auto global_object = context->GetGlobalObject();
              auto bridge_key = context->CreateString("__fbBatchedBridge");
              auto batchedbridge_value = context->GetProperty(global_object, bridge_key);
              SharedCtxValuePtr resultValue = nullptr;
              string_view exception;
              if (batchedbridge_value) {
                  string_view methodName = NSStringToU8(method);
                  SharedCtxValuePtr method_value = context->GetProperty(batchedbridge_value, methodName);
                  if (method_value) {
                      if (context->IsFunction(method_value)) {
                          SharedCtxValuePtr function_params[arguments.count];
                          for (NSUInteger i = 0; i < arguments.count; i++) {
                              id obj = arguments[i];
                              function_params[i] = [obj convertToCtxValue:context];
                          }
                          auto tryCatch = hippy::CreateTryCatchScope(true, context);
                          resultValue = context->CallFunction(method_value, global_object, arguments.count, function_params);
                          if (tryCatch->HasCaught()) {
                              exception = tryCatch->GetExceptionMessage();
                          }
                      } else {
                          executeError = VoltronErrorWithMessage([NSString stringWithFormat:@"%@ is not a function", method]);
                      }
                  } else {
                      executeError = VoltronErrorWithMessage([NSString stringWithFormat:@"property/function %@ not found in __hpBatchedBridge", method]);
                  }
              } else {
                  executeError = VoltronErrorWithMessage(@"__hpBatchedBridge not found");
              }
              if (!StringViewUtils::IsEmpty(exception) || executeError) {
                  if (!StringViewUtils::IsEmpty(exception)) {
                      NSString *string = StringViewToNSString(exception);
                      executeError = VoltronErrorWithMessage(string);
                  }
              } else if (resultValue) {
                  objcValue = ObjectFromCtxValue(context, resultValue);
              }
              onComplete(objcValue, executeError);
#ifndef VOLTRON_DEBUG
          } @catch (NSException *exception) {
              MttVoltronException(exception);
          }
#endif
      }
  }];
}

- (void)_executeJSAction:(NSString *)action
             arguments:(NSArray *)arguments
          unwrapResult:(BOOL)unwrapResult
              callback:(VoltronJavaScriptCallback)onComplete
{
    NSAssert(onComplete != nil, @"onComplete block should not be nil");
    __weak VoltronJSCExecutor *weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        @autoreleasepool {
            VoltronJSCExecutor *strongSelf = weakSelf;
            if (!strongSelf || !strongSelf.isValid) {
                return;
            }

            //Voltron_PROFILE_BEGIN_EVENT(0, @"executeJSCall", (@{@"method": method, @"args": arguments}));

#ifndef VOLTRON_DEBUG
            @try {
#endif
                VoltronJSCWrapper *jscWrapper = strongSelf->_jscWrapper;
                auto context = strongSelf.pScope->GetContext();
                auto global_object = context->GetGlobalObject();

                NSError *executeError = nil;
                id objcValue = nil;

                auto bridge_key = context->CreateString("hippyBridge");
                auto batchedbridge_value = context->GetProperty(global_object, bridge_key);

                SharedCtxValuePtr resultValue = nullptr;
                string_view exception;
                bool isFn = context->IsFunction(batchedbridge_value);
                if (batchedbridge_value && isFn) {
                    SharedCtxValuePtr function_params[arguments.count];
                    for (NSUInteger i = 0; i < arguments.count; i++) {
                        id obj = arguments[i];
                        function_params[i] = [obj convertToCtxValue:context];
                    }
                    auto tryCatch = hippy::CreateTryCatchScope(true, context);
                    resultValue = context->CallFunction(batchedbridge_value, global_object, arguments.count, function_params);
                    if (tryCatch->HasCaught()) {
                        exception = tryCatch->GetExceptionMessage();
                    }
                } else {
                    executeError = VoltronErrorWithMessage(@"Unable to execute JS call: hippyBridge is undefined");
                }
                if (!StringViewUtils::IsEmpty(exception) || executeError) {
                    if (!StringViewUtils::IsEmpty(exception)) {
                        NSString *string = StringViewToNSString(exception);
                        executeError = VoltronErrorWithMessage(string);
                    }
                } else if (resultValue) {
                    objcValue = ObjectFromCtxValue(context, resultValue);
                }
                onComplete(objcValue, executeError);
#ifndef VOLTRON_DEBUG
            } @catch (NSException *exception) {
                MttVoltronException(exception);
            }
#endif
        }
    }];
}

- (void)executeBlockOnJavaScriptQueue:(dispatch_block_t)block {
    hippy::Engine *engine = [[VoltronJSEnginesMapper defaultInstance] JSEngineForKey:self.executorkey].get();
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
    hippy::Engine *engine = [[VoltronJSEnginesMapper defaultInstance] JSEngineForKey:self.executorkey].get();
    if (engine) {
        engine->GetJsTaskRunner()->PostTask(block);
    }
}

- (void)injectJSONText:(NSString *)script asGlobalObjectNamed:(NSString *)objectName callback:(VoltronJavaScriptCompleteBlock)onComplete {
    NSAssert(nil != script, @"param 'script' can't be nil");
    if (nil == script) {
        if (onComplete) {
            NSString *errorMessage = [NSString stringWithFormat:@"param 'script' is nil"];
            NSError *error = [NSError errorWithDomain:VoltronErrorDomain code:2 userInfo:@{ NSLocalizedDescriptionKey: errorMessage }];
            onComplete(error);
        }
        return;
    }

    __weak VoltronJSCExecutor *weakSelf = self;
    // HippyProfileBeginFlowEvent();
    [self executeBlockOnJavaScriptQueue:^{
        // HippyProfileEndFlowEvent();

        VoltronJSCExecutor *strongSelf = weakSelf;
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
            error = [NSError errorWithDomain:VoltronErrorDomain code:2 userInfo:@ { NSLocalizedDescriptionKey: errorMessage }];
            VoltronLogError(@"%@", errorMessage);
        } else {
            JSObjectRef globalObject = JSContextGetGlobalObject(ctx);
            JSStringRef JSName = JSStringCreateWithCFString((__bridge CFStringRef)objectName);
            JSValueRef jsError = NULL;
            JSObjectSetProperty(ctx, globalObject, JSName, valueToInject, kJSPropertyAttributeNone, &jsError);
            JSStringRelease(JSName);

            if (jsError) {
                error = VoltronNSErrorFromJSErrorRef(jsError, ctx);
            }
        }
        // HIPPY_PROFILE_END_EVENT(0, @"js_call,json_call");

        if (onComplete) {
            onComplete(error);
        }
    }];
}

@end
