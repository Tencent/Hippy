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

#import "HippyModuleData.h"
#import "HippyBridge.h"
#import "HippyModuleMethod.h"
#import "HippyAssert.h"
#import "HippyLog.h"
#import "HippyUtils.h"

#import <objc/runtime.h>


@implementation HippyModuleData {
    NSDictionary<NSString *, id> *_constantsToExport;
    NSString *_queueName;
    __weak HippyBridge *_bridge;
    dispatch_semaphore_t _instanceSem;
    BOOL _setupComplete;
}

@synthesize methods = _methods;
@synthesize instance = _instance;
@synthesize methodQueue = _methodQueue;
@synthesize methodsByName = _methodsByName;

- (void)setUp {
    _implementsBatchDidComplete = [_moduleClass instancesRespondToSelector:@selector(batchDidComplete)];
    _implementsPartialBatchDidFlush = [_moduleClass instancesRespondToSelector:@selector(partialBatchDidFlush)];

    static IMP objectInitMethod;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        objectInitMethod = [NSObject instanceMethodForSelector:@selector(init)];
    });

    // If a module overrides `init` then we must assume that it expects to be
    // initialized on the main thread, because it may need to access UIKit.
    _requiresMainQueueSetup = !_instance && [_moduleClass instanceMethodForSelector:@selector(init)] != objectInitMethod;

    // If a module overrides `constantsToExport` then we must assume that it
    // must be called on the main thread, because it may need to access UIKit.
    _hasConstantsToExport = HippyClassOverridesInstanceMethod(_moduleClass, @selector(constantsToExport));
    
    _instanceSem = dispatch_semaphore_create(1);
}

- (instancetype)initWithModuleClass:(Class)moduleClass bridge:(HippyBridge *)bridge {
    if ((self = [super init])) {
        _bridge = bridge;
        _moduleClass = moduleClass;
        [self setUp];
    }
    return self;
}

- (instancetype)initWithModuleInstance:(id<HippyBridgeModule>)instance bridge:(HippyBridge *)bridge {
    if ((self = [super init])) {
        _bridge = bridge;
        _instance = instance;
        _moduleClass = [instance class];
        [self setUp];
    }
    return self;
}

#pragma mark - private setup methods

- (void)setUpInstanceAndBridge {
    {
        dispatch_semaphore_wait(_instanceSem, DISPATCH_TIME_FOREVER);
        // hippy will send 'destroyInstance' event to JS.
        // JS may call actions after that.
        // so ModuleData needs to be valid
        if (!_setupComplete) {
            if (!_instance) {
                if (HIPPY_DEBUG && _requiresMainQueueSetup) {
                    HippyAssertMainQueue();
                }
                _instance = [_moduleClass new];
                if (!_instance) {
                    // Module init returned nil, probably because automatic instantatiation
                    // of the module is not supported, and it is supposed to be passed in to
                    // the bridge constructor. Mark setup complete to avoid doing more work.
                    _setupComplete = YES;
                    HippyLogWarn(@"The module %@ is returning nil from its constructor. You "
                                  "may need to instantiate it yourself and pass it into the "
                                  "bridge.",
                        _moduleClass);
                }
            }

            // Bridge must be set before methodQueue is set up, as methodQueue
            // initialization requires it (View Managers get their queue by calling
            // self.bridge.uiManager.methodQueue)
            [self setBridgeForInstance];
        }

        [self setUpMethodQueue];
        dispatch_semaphore_signal(_instanceSem);
    }
    // This is called outside of the lock in order to prevent deadlock issues
    // because the logic in `finishSetupForInstance` can cause
    // `moduleData.instance` to be accessed re-entrantly.
    if (_bridge.moduleSetupComplete) {
        [self finishSetupForInstance];
    } else {
        // If we're here, then the module is completely initialized,
        // except for what finishSetupForInstance does.  When the instance
        // method is called after moduleSetupComplete,
        // finishSetupForInstance will run.  If _requiresMainQueueSetup
        // is true, getting the instance will block waiting for the main
        // thread, which could take a while if the main thread is busy
        // (I've seen 50ms in testing).  So we clear that flag, since
        // nothing in finishSetupForInstance needs to be run on the main
        // thread.
        _requiresMainQueueSetup = NO;
    }
}

- (void)setBridgeForInstance {
    if ([_instance respondsToSelector:@selector(bridge)] && _instance.bridge != _bridge) {
        @try {
            [(id)_instance setValue:_bridge forKey:@"bridge"];
        } @catch (NSException *exception) {
            HippyLogError(@"%@ has no setter or ivar for its bridge, which is not "
                           "permitted. You must either @synthesize the bridge property, "
                           "or provide your own setter method.",
                self.name);
        }
    }
}

- (void)finishSetupForInstance {
    if (!_setupComplete && _instance) {
        _setupComplete = YES;
        [_bridge registerModuleForFrameUpdates:_instance withModuleData:self];
        NSDictionary *useInfo = @{@"bridge": _bridge, @"module": _instance};
        [[NSNotificationCenter defaultCenter] postNotificationName:HippyDidInitializeModuleNotification
                                                            object:nil
                                                          userInfo:useInfo];
    }
}

- (void)setUpMethodQueue {
    // hippy will send 'destroyInstance' event to JS.
    // JS may call actions after that.
    // so ModuleData needs to be valid
    if (_instance && ![self methodQueueWithoutInstance]) {
        BOOL implementsMethodQueue = [_instance respondsToSelector:@selector(methodQueue)];
        if (implementsMethodQueue) {
            self.methodQueue = _instance.methodQueue;
        }
        if (![self methodQueueWithoutInstance]) {
            // Create new queue (store queueName, as it isn't retained by dispatch_queue)
            _queueName = [NSString stringWithFormat:@"com.tencent.hippy.%@Queue", self.name];
            self.methodQueue = dispatch_queue_create(_queueName.UTF8String, DISPATCH_QUEUE_SERIAL);

            // assign it to the module
            if (implementsMethodQueue) {
                @try {
                    [(id)_instance setValue:[self methodQueueWithoutInstance] forKey:@"methodQueue"];
                } @catch (NSException *exception) {
                    HippyLogError(@"%@ is returning nil for its methodQueue, which is not "
                                   "permitted. You must either return a pre-initialized "
                                   "queue, or @synthesize the methodQueue to let the bridge "
                                   "create a queue for you.",
                        self.name);
                }
            }
        }
    }
}

#pragma mark - public getters

- (BOOL)hasInstance {
    return _instance != nil;
}

- (id<HippyBridgeModule>)instance {
    if (!_setupComplete) {
        if (_requiresMainQueueSetup) {
            // The chances of deadlock here are low, because module init very rarely
            // calls out to other threads, however we can't control when a module might
            // get accessed by client code during bridge setup, and a very low risk of
            // deadlock is better than a fairly high risk of an assertion being thrown.
            if (!HippyIsMainQueue()) {
                HippyLogWarn(@"HippyBridge required dispatch_sync to load %@. This may lead to deadlocks", _moduleClass);
            }
            HippyExecuteOnMainQueue(^{
                [self setUpInstanceAndBridge];
            });
        } else {
            [self setUpInstanceAndBridge];
        }
    }
    return _instance;
}

- (NSString *)name {
    return HippyBridgeModuleNameForClass(_moduleClass);
}

- (void)collectAllModuleMethods {
    NSMutableArray<id<HippyBridgeMethod>> *moduleMethods = [NSMutableArray new];
    NSMutableDictionary<NSString *, id<HippyBridgeMethod>> *moduleMethodsByName = [NSMutableDictionary new];
    
    if ([_moduleClass instancesRespondToSelector:@selector(methodsToExport)]) {
        NSArray<id<HippyBridgeMethod>> *exportMethods = [self.instance methodsToExport];
        [moduleMethods addObjectsFromArray:exportMethods];
        for (id<HippyBridgeMethod> method in exportMethods) {
            moduleMethodsByName[method.JSMethodName] = method;
        }
    }
    
    unsigned int methodCount;
    Class cls = _moduleClass;
    while (cls && cls != [NSObject class] && cls != [NSProxy class]) {
        Method *methods = class_copyMethodList(object_getClass(cls), &methodCount);
        
        for (unsigned int i = 0; i < methodCount; i++) {
            Method method = methods[i];
            SEL selector = method_getName(method);
            if ([NSStringFromSelector(selector) hasPrefix:@"__hippy_export__"]) {
                IMP imp = method_getImplementation(method);
                NSArray<NSString *> *entries = ((NSArray<NSString *> * (*)(id, SEL)) imp)(_moduleClass, selector);
                id<HippyBridgeMethod> moduleMethod = [[HippyModuleMethod alloc] initWithMethodSignature:entries[1] JSMethodName:entries[0]
                                                                                            moduleClass:_moduleClass];
                [moduleMethods addObject:moduleMethod];
                moduleMethodsByName[moduleMethod.JSMethodName] = moduleMethod;
            }
        }
        
        free(methods);
        cls = class_getSuperclass(cls);
    }
    _methods = moduleMethods;
    _methodsByName = moduleMethodsByName;
}

- (NSArray<id<HippyBridgeMethod>> *)methods {
    if (!_methods) {
        [self collectAllModuleMethods];
    }
    return _methods;
}

- (NSDictionary<NSString *,id<HippyBridgeMethod>> *)methodsByName {
    if (!_methodsByName) {
        [self collectAllModuleMethods];
    }
    return _methodsByName;
}


- (void)gatherConstants {
    if (_hasConstantsToExport && !_constantsToExport) {
        (void)[self instance];
        if (!HippyIsMainQueue()) {
            HippyLogWarn(@"Required dispatch_sync to load constants for %@. This may lead to deadlocks", _moduleClass);
        }
        HippyExecuteOnMainQueue(^{
            self->_constantsToExport = [self->_instance constantsToExport] ?: @ {};
        });
    }
}

- (NSArray *)config {
    [self gatherConstants];
    __block NSDictionary<NSString *, id> *constants = _constantsToExport;
    _constantsToExport = nil;  // Not needed anymore

    if (constants.count == 0 && self.methods.count == 0) {
        return (id)kCFNull;  // Nothing to export
    }
    NSMutableArray<NSString *> *methods = self.methods.count ? [NSMutableArray new] : nil;
    NSMutableArray<NSNumber *> *promiseMethods = nil;
    NSMutableArray<NSNumber *> *syncMethods = nil;

    for (id<HippyBridgeMethod> method in self.methods) {
        if (method.functionType == HippyFunctionTypePromise) {
            if (!promiseMethods) {
                promiseMethods = [NSMutableArray new];
            }
            [promiseMethods addObject:@(methods.count)];
        } else if (method.functionType == HippyFunctionTypeSync) {
            if (!syncMethods) {
                syncMethods = [NSMutableArray new];
            }
            [syncMethods addObject:@(methods.count)];
        }
        [methods addObject:method.JSMethodName];
    }

    NSArray *config = @[self.name, HippyNullIfNil(constants), HippyNullIfNil(methods), HippyNullIfNil(promiseMethods), HippyNullIfNil(syncMethods)];
    return config;
}

- (void)setMethodQueue:(dispatch_queue_t)methodQueue {
    @synchronized(self) {
        _methodQueue = methodQueue;
    }
}

- (dispatch_queue_t)methodQueue {
    [self instance];
    @synchronized(self) {
        return _methodQueue;
    }
}

- (dispatch_queue_t)methodQueueWithoutInstance {
    @synchronized(self) {
        return _methodQueue;
    }
}

- (void)invalidate {
    // hippy will send 'destroyInstance' event to JS.
    // JS may call actions after that.
    // so methodQueue needs to be valid
    //    self.methodQueue = nil;
}

- (NSString *)description {
    return [NSString stringWithFormat:@"<%@: %p; name=\"%@\">", [self class], self, self.name];
}

@end
