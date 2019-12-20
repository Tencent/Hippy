/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
#include "js-native-api-jsc.h"
#include "javascript-task.h"
#include "js-native-api.h"
#include "environment.h"
#include "javascript-task-runner.h"
#include "engine.h"

NSString *const HippyJSCThreadName = @"com.tencent.hippy.JavaScript";
NSString *const HippyJavaScriptContextCreatedNotification = @"HippyJavaScriptContextCreatedNotification";
HIPPY_EXTERN NSString *const HippyFBJSContextClassKey = @"_HippyFBJSContextClassKey";
HIPPY_EXTERN NSString *const HippyFBJSValueClassKey = @"_HippyFBJSValueClassKey";

struct __attribute__((packed)) ModuleData {
    uint32_t offset;
    uint32_t size;
};

using file_ptr = std::unique_ptr<FILE, decltype(&fclose)>;
using memory_ptr = std::unique_ptr<void, decltype(&free)>;

struct RandomAccessBundleData {
    file_ptr bundle;
    size_t baseOffset;
    size_t numTableEntries;
    std::unique_ptr<ModuleData[]> table;
    RandomAccessBundleData(): bundle(nullptr, fclose) {}
};

struct HippyJSContextData {
    BOOL useCustomJSCLibrary;
    std::weak_ptr<Engine> weak_engine_;
    JSContext *context;
    HippyJSCWrapper *jscWrapper;
};

@interface HippyJSContextProvider ()
/** May only be called once, or deadlock will result. */
- (HippyJSContextData)data;
@end

@interface HippyJavaScriptContext : NSObject <HippyInvalidating>

@property (nonatomic, strong, readonly) JSContext *context;

- (instancetype)initWithJSContext:(JSContext *)context
                         onThread:(std::weak_ptr<Engine>)weak_engine NS_DESIGNATED_INITIALIZER;
@end

@implementation HippyJavaScriptContext
{
    HippyJavaScriptContext *_selfReference;
    std::weak_ptr<Engine> weak_engine_;
}

- (instancetype)initWithJSContext:(JSContext *)context
                         onThread:(std::weak_ptr<Engine>)weak_engine
{
    if ((self = [super init])) {
        _context = context;
        weak_engine_ = weak_engine;
        
        /**
         * Explicitly introduce a retain cycle here - The HippyJSCExecutor might
         * be deallocated while there's still work enqueued in the JS thread, so
         * we wouldn't be able kill the JSContext. Instead we create this retain
         * cycle, and enqueue the -invalidate message in this object, it then
         * releases the JSContext, breaks the cycle and stops the runloop.
         */
    }
    return self;
}

HIPPY_NOT_IMPLEMENTED(-(instancetype)init)

- (BOOL)isValid
{
    return _context != nil;
}

- (void)invalidate
{
    if (self.isValid) {
        _context.name = @"HippyJSContext(delete)";
        _context = nil;
        _selfReference = nil;
    }
}

@end

@implementation HippyJSCExecutor
{
    // Set at init time:
    BOOL _useCustomJSCLibrary;
    
    // Set at setUp time:
    HippyPerformanceLogger *_performanceLogger;
    HippyJSCWrapper *_jscWrapper;
    HippyJavaScriptContext *_context;
    
    // Set as needed:
    RandomAccessBundleData _randomAccessBundle;
    JSValueRef _batchedBridgeRef;
}

@synthesize valid = _valid;
@synthesize bridge = _bridge;
@synthesize pEngine = _pEngine;
@synthesize pEnv = _pEnv;
@synthesize napi_ctx = _napi_ctx;
@synthesize JSGlobalContextRef = _JSGlobalContextRef;
@synthesize businessName = _businessName;
HIPPY_EXPORT_MODULE()
- (void) setBusinessName:(NSString *)businessName {
    _businessName = businessName;
    if (nil == [self contextName] && businessName) {
        [self setContextName:[NSString stringWithFormat:@"HippyJSContext(%@)", businessName]];
    }
}

- (void)setBridge:(HippyBridge *)bridge
{
    _bridge = bridge;
    _performanceLogger = [bridge performanceLogger];
}

- (instancetype)init
{
    return [self initWithUseCustomJSCLibrary:NO];
}

- (instancetype)initWithUseCustomJSCLibrary:(BOOL)useCustomJSCLibrary
{
    //HIPPY_PROFILE_BEGIN_EVENT(0, @"-[HippyJSCExecutor init]", nil);
    
    if (self = [super init]) {
        _useCustomJSCLibrary = useCustomJSCLibrary;
        _valid = YES;
        
        self->_pEngine = EngineImpl::instance()->CreateEngine();
        
        std::unique_ptr<Engine::RegisterMap> map = [self registerMap];
        
        self->_pEnv = self->_pEngine.lock()->CreateEnvironment("", std::move(map));
    }
    
    //HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"");
    return self;
}

- (std::unique_ptr<Engine::RegisterMap>) registerMap {
    __weak typeof(self) weakSelf = self;
    hippy::base::RegisterFunction function = [weakSelf](void *){
        typeof(self) strongSelf = weakSelf;
        [strongSelf->_bridge handleBuffer:nil batchEnded:YES];
    };
    std::unique_ptr<Engine::RegisterMap> ptr(new Engine::RegisterMap());
    ptr->insert(std::make_pair("ASYNC_TASK_END", function));
    return ptr;
}


+ (instancetype)initializedExecutorWithContextProvider:(HippyJSContextProvider *)JSContextProvider
                                     applicationScript:(NSData *)applicationScript
                                             sourceURL:(NSURL *)sourceURL
                                             JSContext:(JSContext **)JSContext
                                                 error:(NSError **)error
{
    const HippyJSContextData data = JSContextProvider.data;
    if (JSContext) {
        *JSContext = data.context;
    }
    HippyJSCExecutor *executor = [[HippyJSCExecutor alloc] initWithJSContextData:data];
    if (applicationScript && ![executor _synchronouslyExecuteApplicationScript:applicationScript sourceURL:sourceURL JSContext:data.context error:error]) {
        return nil; // error has been set by _synchronouslyExecuteApplicationScript:
    }
    return executor;
}

- (instancetype)initWithJSContextData:(const HippyJSContextData &)data
{
    if (self = [super init]) {
        _useCustomJSCLibrary = data.useCustomJSCLibrary;
        _valid = YES;
        self->_pEngine = data.weak_engine_;
        _jscWrapper = data.jscWrapper;
        _context = [[HippyJavaScriptContext alloc] initWithJSContext:data.context onThread:self->_pEngine];
        if (_businessName) {
            [self setContextName:[NSString stringWithFormat:@"HippyJSContext(%@)", _businessName]];
        }
    }
    return self;
}

- (BOOL)_synchronouslyExecuteApplicationScript:(NSData *)script
                                     sourceURL:(NSURL *)sourceURL
                                     JSContext:(JSContext *)context
                                         error:(NSError **)error
{
    BOOL isRAMBundle = NO;
    script = loadPossiblyBundledApplicationScript(script, sourceURL, _performanceLogger, isRAMBundle, _randomAccessBundle, error);
    if (!script) {
        return NO;
    }
    if (isRAMBundle) {
        registerNativeRequire(context, self);
    }
    NSError *returnedError = executeApplicationScript(script, sourceURL, _jscWrapper, _performanceLogger, _context.context.JSGlobalContextRef);
    if (returnedError) {
        if (error) {
            *error = returnedError;
        }
        return NO;
    } else {
        return YES;
    }
}

- (HippyJavaScriptContext *)context
{
    if (!self.isValid) {
        return nil;
    }
    HippyAssert(_context != nil, @"Fetching context while valid, but before it is created");
    return _context;
}

- (void)setUp
{
    [self executeBlockOnJavaScriptQueue:^{
        if (!self.valid) {
            return;
        }
        
        JSContext *context = nil;
        if (self->_jscWrapper) {
            HippyAssert(self->_context != nil, @"If wrapper was pre-initialized, context should be too");
            context = self->_context.context;
        } else {
            [self->_performanceLogger markStartForTag:HippyPLJSCWrapperOpenLibrary];
            self->_jscWrapper = HippyJSCWrapperCreate(self->_useCustomJSCLibrary);
            [self->_performanceLogger markStopForTag:HippyPLJSCWrapperOpenLibrary];
            
            HippyAssert(self->_context == nil, @"Didn't expect to set up twice");
            
            self->_napi_ctx = self->_pEnv.lock()->getContext();
            JSContext* js_context = [JSContext contextWithJSGlobalContextRef:self->_napi_ctx->context_];
            context = js_context;
            self->_JSGlobalContextRef = context.JSGlobalContextRef;
            self->_context = [[HippyJavaScriptContext alloc] initWithJSContext:context onThread:self->_pEngine];
            if (self.businessName) {
                [self setContextName:[NSString stringWithFormat:@"HippyJSContext(%@)", self.businessName]];
            }
            [[NSNotificationCenter defaultCenter] postNotificationName:HippyJavaScriptContextCreatedNotification
                                                                object:context];
            
            installBasicSynchronousHooksOnContext(context);
        }
        
        NSMutableDictionary *threadDictionary = [[NSThread currentThread] threadDictionary];
        if (!threadDictionary[HippyFBJSContextClassKey] || !threadDictionary[HippyFBJSValueClassKey]) {
            threadDictionary[HippyFBJSContextClassKey] = self->_jscWrapper->JSContext;
            threadDictionary[HippyFBJSValueClassKey] = self->_jscWrapper->JSValue;
        }
        
        __weak HippyJSCExecutor *weakSelf = self;
        
        context[@"nativeRequireModuleConfig"] = ^NSArray *(NSString *moduleName) {
            HippyJSCExecutor *strongSelf = weakSelf;
            if (!strongSelf.valid) {
                return nil;
            }
            
            //HIPPY_PROFILE_BEGIN_EVENT(HippyProfileTagAlways, @"nativeRequireModuleConfig", @{ @"moduleName": moduleName });
            NSArray *result = [strongSelf->_bridge configForModuleName:moduleName];
            //HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"js_call,config");
            return HippyNullIfNil(result);
        };
        
        context[@"nativeFlushQueueImmediate"] = ^(NSArray<NSArray *> *calls){
            HippyJSCExecutor *strongSelf = weakSelf;
            if (!strongSelf.valid || !calls) {
                return;
            }
            
            //HIPPY_PROFILE_BEGIN_EVENT(HippyProfileTagAlways, @"nativeFlushQueueImmediate", nil);
            [strongSelf->_bridge handleBuffer:calls batchEnded:NO];
            //HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"js_call");
        };
        
        context[@"nativeCallSyncHook"] = ^id(NSUInteger module, NSUInteger method, NSArray *args) {
            HippyJSCExecutor *strongSelf = weakSelf;
            if (!strongSelf.valid) {
                return nil;
            }
            
            //HIPPY_PROFILE_BEGIN_EVENT(HippyProfileTagAlways, @"nativeCallSyncHook", nil);
            id result = [strongSelf->_bridge callNativeModule:module method:method params:args];
            //HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"js_call,config");
            return result;
        };
        
#if HIPPY_DEV
        // Inject handler used by HMR
        context[@"nativeInjectHMRUpdate"] = ^(NSString *sourceCode, NSString *sourceCodeURL) {
            HippyJSCExecutor *strongSelf = weakSelf;
            if (!strongSelf.valid) {
                return;
            }
            
            HippyJSCWrapper *jscWrapper = strongSelf->_jscWrapper;
            JSStringRef execJSString = jscWrapper->JSStringCreateWithUTF8CString(sourceCode.UTF8String);
            JSStringRef jsURL = jscWrapper->JSStringCreateWithUTF8CString(sourceCodeURL.UTF8String);
            jscWrapper->JSEvaluateScript(strongSelf->_context.context.JSGlobalContextRef, execJSString, NULL, jsURL, 0, NULL);
            jscWrapper->JSStringRelease(jsURL);
            jscWrapper->JSStringRelease(execJSString);
        };
#endif
    }];
}

/** Installs synchronous hooks that don't require a weak reference back to the HippyJSCExecutor. */
static void installBasicSynchronousHooksOnContext(JSContext *context)
{
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

- (void)invalidate
{
    if (!self.isValid) {
        return;
    }
    
    _valid = NO;
}

- (NSString *)contextName
{
    return [_context.context name];
}

HIPPY_EXPORT_METHOD(setContextName:(nonnull NSString *)contextName)
{
    [_context.context setName:contextName];
}

- (void)dealloc
{
    [self invalidate];
    
    [_context invalidate];
    _context = nil;
    
    _randomAccessBundle.bundle.reset();
    _randomAccessBundle.table.reset();
    
    if (_jscWrapper) {
        HippyJSCWrapperRelease(_jscWrapper);
        _jscWrapper = NULL;
    }
    
    std::shared_ptr<Engine> engine = self->_pEngine.lock();
    if (engine) {
        engine->RemoveEnvironment(self->_pEnv);
        
        dispatch_async(dispatch_get_main_queue(), ^{
            engine->UnRefEnvironment();
            if (engine->GetEnvironmentCount() == 0) {
                EngineImpl::instance()->RemoveEngine(engine);
            }
        });
    }
}

- (void)flushedQueue:(HippyJavaScriptCallback)onComplete
{
    // TODO: Make this function handle first class instead of dynamically dispatching it. #9317773
    [self _executeJSCall:@"flushedQueue" arguments:@[] unwrapResult:YES callback:onComplete];
}

- (void)_callFunctionOnModule:(NSString *)module
                       method:(NSString *)method
                    arguments:(NSArray *)args
                  returnValue:(BOOL)returnValue
                 unwrapResult:(BOOL)unwrapResult
                     callback:(HippyJavaScriptCallback)onComplete
{
    // TODO: Make this function handle first class instead of dynamically dispatching it. #9317773
    NSString *bridgeMethod = returnValue ? @"callFunctionReturnFlushedQueue" : @"callFunctionReturnResultAndFlushedQueue";
    [self _executeJSCall:bridgeMethod arguments:@[module, method, args] unwrapResult:unwrapResult callback:onComplete];
}

- (void)callFunctionOnModule:(NSString *)module method:(NSString *)method arguments:(NSArray *)args callback:(HippyJavaScriptCallback)onComplete
{
    [self _callFunctionOnModule:module method:method arguments:args returnValue:YES unwrapResult:YES callback:onComplete];
}

- (void)callFunctionOnModule:(NSString *)module method:(NSString *)method arguments:(NSArray *)args jsValueCallback:(HippyJavaScriptValueCallback)onComplete
{
    [self _callFunctionOnModule:module method:method arguments:args returnValue:NO unwrapResult:NO callback:onComplete];
}

- (void)invokeCallbackID:(NSNumber *)cbID
               arguments:(NSArray *)args
                callback:(HippyJavaScriptCallback)onComplete
{
    // TODO: Make this function handle first class instead of dynamically dispatching it. #9317773
    [self _executeJSCall:@"invokeCallbackAndReturnFlushedQueue" arguments:@[cbID, args] unwrapResult:YES callback:onComplete];
}

- (void)_executeJSCall:(NSString *)method
             arguments:(NSArray *)arguments
          unwrapResult:(BOOL)unwrapResult
              callback:(HippyJavaScriptCallback)onComplete
{
    HippyAssert(onComplete != nil, @"onComplete block should not be nil");
    __weak HippyJSCExecutor *weakSelf = self;
    [self executeBlockOnJavaScriptQueue:^{
        @autoreleasepool {
            HippyJSCExecutor *strongSelf = weakSelf;
            if (!strongSelf || !strongSelf.isValid) {
                return;
            }
            
            //HIPPY_PROFILE_BEGIN_EVENT(0, @"executeJSCall", (@{@"method": method, @"args": arguments}));
            
#ifndef HIPPY_DEBUG
            @try {
#endif
                HippyJSCWrapper *jscWrapper = strongSelf->_jscWrapper;
                JSContext *context = strongSelf->_context.context;
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
                            error = HippyErrorWithMessage([NSString stringWithFormat:@"Unable to execute JS call: method %@ is undefined", method]);
                        }
                    }
                } else {
                    if (!errorJSRef && jscWrapper->JSValueIsUndefined(contextJSRef, batchedBridgeRef)) {
                        error = HippyErrorWithMessage(@"Unable to execute JS call: __fbBatchedBridge is undefined");
                    }
                }
                
                id objcValue;
                if (errorJSRef || error) {
                    if (!error) {
                        error = HippyNSErrorFromJSError([jscWrapper->JSValue valueWithJSValueRef:errorJSRef inContext:context]);
                    }
                } else {
                    // We often return `null` from JS when there is nothing for native side. [JSValue toValue]
                    // returns [NSNull null] in this case, which we don't want.
                    if (!jscWrapper->JSValueIsNull(contextJSRef, resultJSRef)) {
                        JSValue *result = [jscWrapper->JSValue valueWithJSValueRef:resultJSRef inContext:context];
                        objcValue = unwrapResult ? [result toObject] : result;
                    }
                }
#ifndef HIPPY_DEBUG
            } @catch (NSException *exception) {
                MttHippyException(exception);
            }
#endif
            
            //HIPPY_PROFILE_END_EVENT(0, @"js_call");
            
            onComplete(objcValue, error);
        }
    }];
}

- (void)executeApplicationScript:(NSData *)script
                       sourceURL:(NSURL *)sourceURL
                      onComplete:(HippyJavaScriptCompleteBlock)onComplete
{
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
    
    //HippyProfileBeginFlowEvent();
    [self executeBlockOnJavaScriptQueue:^{
        //HippyProfileEndFlowEvent();
        if (!self.isValid) {
            return;
        }
        
        if (isRAMBundle) {
            registerNativeRequire(self.context.context, self);
        }
        
        NSError *error = executeApplicationScript(script, sourceURL, self->_jscWrapper, self->_performanceLogger,
                                                  self->_context.context.JSGlobalContextRef);
        if (onComplete) {
            onComplete(error);
        }
    }];
}

static NSData *loadPossiblyBundledApplicationScript(NSData *script, __unused NSURL *sourceURL,
                                                    __unused HippyPerformanceLogger *performanceLogger,
                                                    __unused BOOL &isRAMBundle, __unused RandomAccessBundleData &randomAccessBundle,
                                                    __unused NSError **error)
{
    // JSStringCreateWithUTF8CString expects a null terminated C string.
    // RAM Bundling already provides a null terminated one.
    NSMutableData *nullTerminatedScript = [NSMutableData dataWithCapacity:script.length + 1];
    [nullTerminatedScript appendData:script];
    [nullTerminatedScript appendBytes:"" length:1];
    script = nullTerminatedScript;
    return script;
}

static void registerNativeRequire(JSContext *context, HippyJSCExecutor *executor)
{
    __weak HippyJSCExecutor *weakExecutor = executor;
    context[@"nativeRequire"] = ^(NSNumber *moduleID) { [weakExecutor _nativeRequire:moduleID]; };
}

static NSError *executeApplicationScript(NSData *script, NSURL *sourceURL, HippyJSCWrapper *jscWrapper,
                                         HippyPerformanceLogger *performanceLogger, JSGlobalContextRef ctx)
{
    [performanceLogger markStartForTag:HippyPLScriptExecution];
    JSValueRef jsError = NULL;
    JSStringRef execJSString = jscWrapper->JSStringCreateWithUTF8CString((const char *)script.bytes);
    JSStringRef bundleURL = jscWrapper->JSStringCreateWithUTF8CString(sourceURL.absoluteString.UTF8String);
    jscWrapper->JSEvaluateScript(ctx, execJSString, NULL, bundleURL, 0, &jsError);
    jscWrapper->JSStringRelease(bundleURL);
    jscWrapper->JSStringRelease(execJSString);
    [performanceLogger markStopForTag:HippyPLScriptExecution];
    
    NSError *error = jsError ? HippyNSErrorFromJSErrorRef(jsError, ctx, jscWrapper) : nil;
    //HIPPY_PROFILE_END_EVENT(0, @"js_call");
    return error;
}

- (void)executeBlockOnJavaScriptQueue:(dispatch_block_t)block
{
    Engine* engine = self->_pEngine.lock().get();
    if (engine) {
        if (engine->jsRunner()->is_js_thread() == false) {
            std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
            task->callback = block;
            engine->jsRunner()->postTask(task);
        } else {
            block();
        }
    }
}

- (void)executeAsyncBlockOnJavaScriptQueue:(dispatch_block_t)block
{
    Engine* engine = self->_pEngine.lock().get();
    if (engine) {
        std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
        task->callback = block;
        engine->jsRunner()->postTask(task);
    }
}

- (void)injectJSONText:(NSString *)script
   asGlobalObjectNamed:(NSString *)objectName
              callback:(HippyJavaScriptCompleteBlock)onComplete
{
    NSAssert(nil != script, @"param 'script' can't be nil");
    if (nil == script) {
        if (onComplete) {
            NSString *errorMessage = [NSString stringWithFormat:@"param 'script' is nil"];
            NSError *error = [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@{NSLocalizedDescriptionKey: errorMessage}];
            onComplete(error);
        }
        return;
    }
    if (HIPPY_DEBUG) {
        HippyAssert(HippyJSONParse(script, NULL) != nil, @"%@ wasn't valid JSON!", script);
    }
    
    __weak HippyJSCExecutor *weakSelf = self;
    //HippyProfileBeginFlowEvent();
    [self executeBlockOnJavaScriptQueue:^{
        //HippyProfileEndFlowEvent();
        
        HippyJSCExecutor *strongSelf = weakSelf;
        if (!strongSelf || !strongSelf.isValid) {
            return;
        }
        
        //HIPPY_PROFILE_BEGIN_EVENT(0, @"injectJSONText", @{@"objectName": objectName});
        HippyJSCWrapper *jscWrapper = strongSelf->_jscWrapper;
        JSStringRef execJSString = jscWrapper->JSStringCreateWithCFString((__bridge CFStringRef)script);
        JSGlobalContextRef ctx = strongSelf->_context.context.JSGlobalContextRef;
        JSValueRef valueToInject = jscWrapper->JSValueMakeFromJSONString(ctx, execJSString);
        jscWrapper->JSStringRelease(execJSString);
        
        NSError *error;
        if (!valueToInject) {
            NSString *errorMessage = [NSString stringWithFormat:@"Can't make JSON value from script '%@'", script];
            error = [NSError errorWithDomain:HippyErrorDomain code:2 userInfo:@{NSLocalizedDescriptionKey: errorMessage}];
            HippyLogError(@"%@", errorMessage);
        } else {
            JSObjectRef globalObject = jscWrapper->JSContextGetGlobalObject(ctx);
            JSStringRef JSName = jscWrapper->JSStringCreateWithCFString((__bridge CFStringRef)objectName);
            JSValueRef jsError = NULL;
            jscWrapper->JSObjectSetProperty(ctx, globalObject, JSName, valueToInject, kJSPropertyAttributeNone, &jsError);
            jscWrapper->JSStringRelease(JSName);
            
            if (jsError) {
                error = HippyNSErrorFromJSErrorRef(jsError, ctx, jscWrapper);
            }
        }
        //HIPPY_PROFILE_END_EVENT(0, @"js_call,json_call");
        
        if (onComplete) {
            onComplete(error);
        }
    }];
}

static bool readRandomAccessModule(const RandomAccessBundleData &bundleData, size_t offset, size_t size, char *data)
{
    return fseek(bundleData.bundle.get(), offset + bundleData.baseOffset, SEEK_SET) == 0 &&
    fread(data, 1, size, bundleData.bundle.get()) == size;
}

static void executeRandomAccessModule(HippyJSCExecutor *executor, uint32_t moduleID, size_t offset, size_t size)
{
    auto data = std::make_unique<char[]>(size);
    if (!readRandomAccessModule(executor->_randomAccessBundle, offset, size, data.get())) {
        HippyFatal(HippyErrorWithMessage(@"Error loading RAM module"));
        return;
    }
    
    char url[14]; // 10 = maximum decimal digits in a 32bit unsigned int + ".js" + null byte
    sprintf(url, "%" PRIu32 ".js", moduleID);
    
    HippyJSCWrapper *jscWrapper = executor->_jscWrapper;
    JSStringRef code = jscWrapper->JSStringCreateWithUTF8CString(data.get());
    JSValueRef jsError = NULL;
    JSStringRef sourceURL = jscWrapper->JSStringCreateWithUTF8CString(url);
    JSGlobalContextRef ctx = executor->_context.context.JSGlobalContextRef;
    JSValueRef result = jscWrapper->JSEvaluateScript(ctx, code, NULL, sourceURL, 0, &jsError);
    
    jscWrapper->JSStringRelease(code);
    jscWrapper->JSStringRelease(sourceURL);
    
    if (!result) {
        NSError *error = HippyNSErrorFromJSErrorRef(jsError, ctx, jscWrapper);
        dispatch_async(dispatch_get_main_queue(), ^{
            HippyFatal(error);
            [executor invalidate];
        });
    }
}

- (void)_nativeRequire:(NSNumber *)moduleID
{
    if (!moduleID) {
        return;
    }
    
    [_performanceLogger addValue:1 forTag:HippyPLRAMNativeRequiresCount];
    [_performanceLogger appendStartForTag:HippyPLRAMNativeRequires];
    //HIPPY_PROFILE_BEGIN_EVENT(HippyProfileTagAlways, ([@"nativeRequire_" stringByAppendingFormat:@"%@", moduleID]), nil);
    
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
    
    //HIPPY_PROFILE_END_EVENT(HippyProfileTagAlways, @"js_call");
    [_performanceLogger appendStopForTag:HippyPLRAMNativeRequires];
}

@end

@implementation HippyJSContextProvider
{
    dispatch_semaphore_t _semaphore;
    
    std::weak_ptr<Engine> weak_engine_;
    
    JSContext *_context;
    HippyJSCWrapper *_jscWrapper;
}

- (instancetype)initWithUseCustomJSCLibrary:(BOOL)useCustomJSCLibrary
{
    if (self = [super init]) {
        _semaphore = dispatch_semaphore_create(0);
        _useCustomJSCLibrary = useCustomJSCLibrary;
    }
    return self;
}

- (void)_createContext
{
    _jscWrapper = HippyJSCWrapperCreate(_useCustomJSCLibrary);
    _context = [_jscWrapper->JSContext new];
    installBasicSynchronousHooksOnContext(_context);
    dispatch_semaphore_signal(_semaphore);
}

- (HippyJSContextData)data
{
    // Be sure this method is only called once, otherwise it will hang here forever:
    dispatch_semaphore_wait(_semaphore, DISPATCH_TIME_FOREVER);
    return {
        .useCustomJSCLibrary = _useCustomJSCLibrary,
        //        .javaScriptThread = _javaScriptThread,
        .weak_engine_ = weak_engine_,
        .context = _context,
        .jscWrapper = _jscWrapper,
    };
}

@end
