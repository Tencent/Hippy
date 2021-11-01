//
//  VoltronJSCExecutor.m
//  RenderCore
//
//  Created by skindhu-xp on 2021/8/29.
//

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

//#import "HippyAssert.h"
//#import "HippyBridge+Private.h"
#import "VoltronDefines.h"
//#import "HippyDevMenu.h"
//#import "HippyJavaScriptLoader.h"
#import "VoltronLog.h"
#import "VoltronPerformanceLogger.h"
#import "VoltronUtils.h"
//#import "HippyRedBox.h"
#import "VoltronJSCWrapper.h"
//#import "HippyJSCErrorHandling.h"
#import "VoltronJSEnginesMapper.h"
//#import "HippyBridge+LocalFileSource.h"
//#include "ios_loader.h"
//#import "HippyBridge+Private.h"
#include "core/base/string_view_utils.h"
#include "core/napi/jsc/js_native_api_jsc.h"
#include "core/task/javascript_task.h"
#include "core/napi/js_native_api.h"
#include "core/scope.h"
#include "core/task/javascript_task_runner.h"
#include "core/engine.h"

NSString *const HippyJSCThreadName = @"com.tencent.Voltron.JavaScript";
NSString *const HippyJavaScriptContextCreatedNotification = @"VoltronJavaScriptContextCreatedNotification";
NSString *const HippyJavaScriptContextCreatedNotificationBridgeKey = @"VoltronJavaScriptContextCreatedNotificationBridgeKey";

VOLTRON_EXTERN NSString *const HippyFBJSContextClassKey = @"_VoltronFBJSContextClassKey";
VOLTRON_EXTERN NSString *const HippyFBJSValueClassKey = @"_VoltronFBJSValueClassKey";

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


@implementation VoltronJSCExecutor {
  // Set at setUp time:
  VoltronPerformanceLogger *_performanceLogger;
  JSContext *_JSContext;
  // Set as needed:
  RandomAccessBundleData _randomAccessBundle;
  JSValueRef _batchedBridgeRef;
  VoltronJSCWrapper *_jscWrapper;
  NSString *_globalConfig;
  VoltronFrameworkInitCallback _completion;
}

@synthesize valid = _valid;
@synthesize executorkey = _executorkey;
@synthesize pScope = _pScope;
@synthesize JSGlobalContextRef = _JSGlobalContextRef;

- (instancetype)initWithExecurotKey:(NSString *)execurotkey globalConfig:(NSString *)globalConfig completion:(VoltronFrameworkInitCallback)completion{
    if (self = [super init]) {
        _valid = YES;
        // maybe bug in JavaScriptCore：
        // JSContextRef held by JSContextGroupRef cannot be deallocated,
        // unless JSContextGroupRef is deallocated
        self.executorkey = execurotkey;
        std::shared_ptr<Engine> engine = [[VoltronJSEnginesMapper defaultInstance] createJSEngineForKey:self.executorkey];
        self->_globalConfig = globalConfig;
        self->_completion = completion;
        std::unique_ptr<Engine::RegisterMap> map = [self registerMap];
        const char *pName = [execurotkey UTF8String] ?: "";
        std::shared_ptr<Scope> scope = engine->CreateScope(pName, std::move(map));
        self.pScope = scope;
        VoltronLogInfo(@"[Hippy_OC_Log][Life_Circle],VoltronJSCExecutor Init %p, execurotkey:%@", self, execurotkey);
    }

    return self;
}

static unicode_string_view NSStringToU8(NSString* str) {
  std::string u8 = [str UTF8String];
  return unicode_string_view(reinterpret_cast<const unicode_string_view::char8_t_*>(u8.c_str()), u8.length());
}

- (std::unique_ptr<Engine::RegisterMap>)registerMap {
    __weak VoltronJSCExecutor *weakSelf = self;
    __weak NSString *weakGlobalConfig = self->_globalConfig;
    hippy::base::RegisterFunction taskEndCB = [weakSelf](void *) {
        VoltronJSCExecutor *strongSelf = weakSelf;
        if (strongSelf) {
          handleJsExcepiton(strongSelf->_pScope);
        }
    };
  
    hippy::base::RegisterFunction ctxCreateCB = [weakSelf, weakGlobalConfig](void *p) {
      VoltronJSCExecutor *strongSelf = weakSelf;
      if (!strongSelf) {
          return;
      }
      
      NSString *strongGlobalConfig = weakGlobalConfig;
      ScopeWrapper *wrapper = reinterpret_cast<ScopeWrapper *>(p);
      std::shared_ptr<Scope> scope = wrapper->scope_.lock();
      if (scope) {
        std::shared_ptr<hippy::napi::JSCCtx> context = std::static_pointer_cast<hippy::napi::JSCCtx>(scope->GetContext());
        JSContext *jsContext = [JSContext contextWithJSGlobalContextRef:context->GetCtxRef()];
        context->RegisterGlobalInJs();
        
        if (!strongSelf->_jscWrapper) {
          [strongSelf->_performanceLogger markStartForTag:VoltronPLJSCWrapperOpenLibrary];
          strongSelf->_jscWrapper = VoltronJSCWrapperCreate(strongSelf->_useCustomJSCLibrary);
          [strongSelf->_performanceLogger markStopForTag:VoltronPLJSCWrapperOpenLibrary];
          installBasicSynchronousHooksOnContext(jsContext);
        }
        
        context->SetGlobalJsonVar("__HIPPYNATIVEGLOBAL__", NSStringToU8(strongGlobalConfig));
        context->SetGlobalJsonVar("__fbBatchedBridgeConfig", NSStringToU8(@""));
        
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
      }
    };
  
    hippy::base::RegisterFunction scopeInitializedCB = [weakSelf](void *p) {
      VoltronJSCExecutor *strongSelf = weakSelf;
      if (!strongSelf) {
          return;
      }
      ScopeWrapper *wrapper = reinterpret_cast<ScopeWrapper *>(p);
      std::shared_ptr<Scope> scope = wrapper->scope_.lock();
      if(handleJsExcepiton(scope)) {
        strongSelf->_completion(TRUE);
      } else {
        strongSelf->_completion(FALSE);
      };
    };
    std::unique_ptr<Engine::RegisterMap> ptr = std::make_unique<Engine::RegisterMap>();
    ptr->insert(std::make_pair("ASYNC_TASK_END", taskEndCB));
    ptr->insert(std::make_pair(hippy::base::kContextCreatedCBKey, ctxCreateCB));
    ptr->insert(std::make_pair(hippy::base::KScopeInitializedCBKey, scopeInitializedCB));
    return ptr;
}

static BOOL handleJsExcepiton(std::shared_ptr<Scope> scope) {
  if (!scope) {
    return FALSE;
  }
  std::shared_ptr<hippy::napi::JSCCtx> context = std::static_pointer_cast<hippy::napi::JSCCtx>(scope->GetContext());
  std::shared_ptr<hippy::napi::JSCCtxValue> exception = std::static_pointer_cast<hippy::napi::JSCCtxValue>(context->GetException());
  if (exception) {
    if (!context->IsExceptionHandled()) {
      context->ThrowExceptionToJS(exception);
    }
    std::u16string exceptionStr = StringViewUtils::Convert(context->GetExceptionMsg(exception), unicode_string_view::Encoding::Utf16).utf16_value();
    NSString *err = [NSString stringWithCharacters:(const unichar *)exceptionStr.c_str() length:(exceptionStr.length())];
    NSError *error = VoltronErrorWithMessage(err);
    
    // NSError *error = RCTErrorWithMessageAndModule(err, strongSelf.bridge.moduleName);
    //VoltronFatal(error);
    context->SetException(nullptr);
    context->SetExceptionHandled(true);
    return FALSE;
  }
  return TRUE;
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
    // HIPPY_PROFILE_END_EVENT(0, @"js_call");
    return error;
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
//    std::shared_ptr<hippy::napi::JSCCtx> context = std::static_pointer_cast<hippy::napi::JSCCtx>(self.pScope->GetContext());
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
          
          //Voltron_PROFILE_BEGIN_EVENT(0, @"executeJSCall", (@{@"method": method, @"args": arguments}));
          
#ifndef VOLTRON_DEBUG
          @try {
#endif
              VoltronJSCWrapper *jscWrapper = strongSelf->_jscWrapper;
              JSContext *context = [self JSContext];
              JSGlobalContextRef contextJSRef = context.JSGlobalContextRef;
              
              // get the BatchedBridge object
              JSValueRef errorJSRef = NULL;
              JSValueRef batchedBridgeRef = strongSelf->_batchedBridgeRef;
              if (!batchedBridgeRef) {
                  JSStringRef moduleNameJSStringRef = jscWrapper->JSStringCreateWithUTF8CString("__fbBatchedBridge");
                  JSObjectRef globalObjectJSRef = jscWrapper->JSContextGetGlobalObject(contextJSRef);
                  batchedBridgeRef = jscWrapper->JSObjectGetProperty(contextJSRef, globalObjectJSRef, moduleNameJSStringRef, &errorJSRef);
                  jscWrapper->JSStringRelease(moduleNameJSStringRef);
                  strongSelf->_batchedBridgeRef = batchedBridgeRef;
              }
              
              NSError *error;
              JSValueRef resultJSRef = NULL;
              if (batchedBridgeRef != NULL && errorJSRef == NULL && !jscWrapper->JSValueIsUndefined(contextJSRef, batchedBridgeRef)) {
                  // get method
                  JSStringRef methodNameJSStringRef = jscWrapper->JSStringCreateWithCFString((__bridge CFStringRef)method);
                  JSValueRef methodJSRef = jscWrapper->JSObjectGetProperty(contextJSRef, (JSObjectRef)batchedBridgeRef, methodNameJSStringRef, &errorJSRef);
                  jscWrapper->JSStringRelease(methodNameJSStringRef);
                  
                  if (methodJSRef != NULL && errorJSRef == NULL && !jscWrapper->JSValueIsUndefined(contextJSRef, methodJSRef)) {
                      JSValueRef jsArgs[arguments.count];
                      for (NSUInteger i = 0; i < arguments.count; i++) {
                          jsArgs[i] = [jscWrapper->JSValue valueWithObject:arguments[i] inContext:context].JSValueRef;
                      }
                      resultJSRef = jscWrapper->JSObjectCallAsFunction(contextJSRef, (JSObjectRef)methodJSRef, (JSObjectRef)batchedBridgeRef, arguments.count, jsArgs, &errorJSRef);
                  } else {
                      if (!errorJSRef && jscWrapper->JSValueIsUndefined(contextJSRef, methodJSRef)) {
                          error = VoltronErrorWithMessage([NSString stringWithFormat:@"Unable to execute JS call: method %@ is undefined", method]);
                      }
                  }
              } else {
                  if (!errorJSRef && jscWrapper->JSValueIsUndefined(contextJSRef, batchedBridgeRef)) {
                      error = VoltronErrorWithMessage(@"Unable to execute JS call: __fbBatchedBridge is undefined");
                  }
              }
              
              id objcValue;
              if (errorJSRef || error) {
                  if (!error) {
                      error = VoltronNSErrorFromJSError([jscWrapper->JSValue valueWithJSValueRef:errorJSRef inContext:context]);
                  }
              } else {
                  // We often return `null` from JS when there is nothing for native side. [JSValue toValue]
                  // returns [NSNull null] in this case, which we don't want.
                  if (!jscWrapper->JSValueIsNull(contextJSRef, resultJSRef)) {
                      JSValue *result = [jscWrapper->JSValue valueWithJSValueRef:resultJSRef inContext:context];
                      objcValue = unwrapResult ? [result toObject] : result;
                  }
              }
#ifndef VOLTRON_DEBUG
          } @catch (NSException *exception) {
              MttVoltronException(exception);
          }
#endif
          
          //Voltron_PROFILE_END_EVENT(0, @"js_call");
          
          onComplete(objcValue, error);
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
                JSContext *context = [self JSContext];
                JSGlobalContextRef contextJSRef = context.JSGlobalContextRef;
                
                // get the BatchedBridge object
                JSValueRef errorJSRef = NULL;
                JSValueRef batchedBridgeRef = strongSelf->_batchedBridgeRef;
                if (!batchedBridgeRef) {
                    JSStringRef moduleNameJSStringRef = jscWrapper->JSStringCreateWithUTF8CString("hippyBridge");
                    JSObjectRef globalObjectJSRef = jscWrapper->JSContextGetGlobalObject(contextJSRef);
                    batchedBridgeRef = jscWrapper->JSObjectGetProperty(contextJSRef, globalObjectJSRef, moduleNameJSStringRef, &errorJSRef);
                    jscWrapper->JSStringRelease(moduleNameJSStringRef);
                    strongSelf->_batchedBridgeRef = batchedBridgeRef;
                }
                
                NSError *error;
                JSValueRef resultJSRef = NULL;
                if (batchedBridgeRef != NULL && errorJSRef == NULL && !jscWrapper->JSValueIsUndefined(contextJSRef, batchedBridgeRef)) {
                    JSValueRef jsArgs[arguments.count];
                    for (NSUInteger i = 0; i < arguments.count; i++) {
                        jsArgs[i] = [jscWrapper->JSValue valueWithObject:arguments[i] inContext:context].JSValueRef;
                    }
                    resultJSRef = jscWrapper->JSObjectCallAsFunction(contextJSRef, (JSObjectRef)batchedBridgeRef, NULL, arguments.count, jsArgs, &errorJSRef);
                } else {
                    if (!errorJSRef && jscWrapper->JSValueIsUndefined(contextJSRef, batchedBridgeRef)) {
                        error = VoltronErrorWithMessage(@"Unable to execute JS call: hippyBridge is undefined");
                    }
                }
                
                id objcValue;
                if (errorJSRef || error) {
                    if (!error) {
                        error = VoltronNSErrorFromJSError([jscWrapper->JSValue valueWithJSValueRef:errorJSRef inContext:context]);
                    }
                } else {
                    // We often return `null` from JS when there is nothing for native side. [JSValue toValue]
                    // returns [NSNull null] in this case, which we don't want.
                    if (!jscWrapper->JSValueIsNull(contextJSRef, resultJSRef)) {
                        JSValue *result = [jscWrapper->JSValue valueWithJSValueRef:resultJSRef inContext:context];
                        objcValue = unwrapResult ? [result toObject] : result;
                    }
                }
#ifndef VOLTRON_DEBUG
            } @catch (NSException *exception) {
                MttVoltronException(exception);
            }
#endif
            
            //Voltron_PROFILE_END_EVENT(0, @"js_call");
            
            onComplete(objcValue, error);
        }
    }];
}

- (void)executeBlockOnJavaScriptQueue:(dispatch_block_t)block {
    Engine *engine = [[VoltronJSEnginesMapper defaultInstance] JSEngineForKey:self.executorkey].get();
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
    Engine *engine = [[VoltronJSEnginesMapper defaultInstance] JSEngineForKey:self.executorkey].get();
    if (engine) {
        std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
        task->callback = block;
        engine->GetJSRunner()->PostTask(task);
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
