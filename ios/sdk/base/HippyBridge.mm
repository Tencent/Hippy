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

#import "HippyBridge.h"
#import "HippyBridge+Private.h"

#import <objc/runtime.h>

#import "HippyConvert.h"
#import "HippyEventDispatcher.h"
#import "HippyKeyCommands.h"
#import "HippyLog.h"
#import "HippyModuleData.h"
#import "HippyPerformanceLogger.h"
#import "HippyUtils.h"
#import "HippyUIManager.h"
#import "HippyExtAnimationModule.h"
NSString *const HippyReloadNotification = @"HippyReloadNotification";
NSString *const HippyJavaScriptWillStartLoadingNotification = @"HippyJavaScriptWillStartLoadingNotification";
NSString *const HippyJavaScriptDidLoadNotification = @"HippyJavaScriptDidLoadNotification";
NSString *const HippyJavaScriptDidFailToLoadNotification = @"HippyJavaScriptDidFailToLoadNotification";
NSString *const HippyDidInitializeModuleNotification = @"HippyDidInitializeModuleNotification";
NSString *const HippyBusinessDidLoadNotification = @"HippyBusinessDidLoadNotification";
NSString *const _HippySDKVersion = @"2.0.2";

static NSMutableArray<Class> *HippyModuleClasses;
NSArray<Class> *HippyGetModuleClasses(void)
{
    return HippyModuleClasses;
}

/**
 * Register the given class as a bridge module. All modules must be registered
 * prior to the first bridge initialization.
 */

HIPPY_EXTERN void HippyRegisterModule(Class);
void HippyRegisterModule(Class moduleClass)
{
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        HippyModuleClasses = [NSMutableArray new];
    });

    HippyAssert([moduleClass conformsToProtocol:@protocol(HippyBridgeModule)],
              @"%@ does not conform to the HippyBridgeModule protocol",
              moduleClass);

    // Register module
    [HippyModuleClasses addObject:moduleClass];
}

/**
 * This function returns the module name for a given class.
 */
NSString *HippyBridgeModuleNameForClass(Class cls)
{
#if HIPPY_DEBUG
    HippyAssert([cls conformsToProtocol:@protocol(HippyBridgeModule)],
              @"Bridge module `%@` does not conform to HippyBridgeModule", cls);
#endif

    NSString *name = [cls moduleName];
    if (name.length == 0) {
        name = NSStringFromClass(cls);
    }
    if ([name hasPrefix:@"Hippy"] || [name hasPrefix:@"hippy"]) {
        name = [name substringFromIndex:5];
    }

    return name;
}

#if HIPPY_DEBUG
void HippyVerifyAllModulesExported(NSArray *extraModules)
{
    // Check for unexported modules
    unsigned int classCount;
    Class *classes = objc_copyClassList(&classCount);

    NSMutableSet *moduleClasses = [NSMutableSet new];
    [moduleClasses addObjectsFromArray:HippyGetModuleClasses()];
    [moduleClasses addObjectsFromArray:[extraModules valueForKeyPath:@"class"]];

    for (unsigned int i = 0; i < classCount; i++) {
        Class cls = classes[i];
        Class superclass = cls;
        while (superclass) {
            if (class_conformsToProtocol(superclass, @protocol(HippyBridgeModule))) {
                if ([moduleClasses containsObject:cls]) {
                    break;
                }

                // Verify it's not a super-class of one of our moduleClasses
                BOOL isModuleSuperClass = NO;
                for (Class moduleClass in moduleClasses) {
                    if ([moduleClass isSubclassOfClass:cls]) {
                        isModuleSuperClass = YES;
                        break;
                    }
                }
                if (isModuleSuperClass) {
                    break;
                }

                HippyLogWarn(@"Class %@ was not exported. Did you forget to use HIPPY_EXPORT_MODULE()?", cls);
                break;
            }
            superclass = class_getSuperclass(superclass);
        }
    }

    free(classes);
}
#endif

@implementation HippyBridge
{
    NSURL *_delegateBundleURL;
    id <HippyImageViewCustomLoader> _imageLoader;
    id <HippyCustomTouchHandlerProtocol> _customTouchHandler;
    BOOL _isInitImageLoader;
}

dispatch_queue_t HippyJSThread;

+ (void)initialize
{
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{

        // Set up JS thread
        HippyJSThread = (id)kCFNull;
    });
}

static HippyBridge *HippyCurrentBridgeInstance = nil;

/**
 * The last current active bridge instance. This is set automatically whenever
 * the bridge is accessed. It can be useful for static functions or singletons
 * that need to access the bridge for purposes such as logging, but should not
 * be relied upon to return any particular instance, due to race conditions.
 */
+ (instancetype)currentBridge
{
    return HippyCurrentBridgeInstance;
}

+ (void)setCurrentBridge:(HippyBridge *)currentBridge
{
    HippyCurrentBridgeInstance = currentBridge;
}

- (instancetype)initWithDelegate:(id<HippyBridgeDelegate>)delegate
                   launchOptions:(NSDictionary *)launchOptions
{

    return [self initWithDelegate:delegate
                        bundleURL:nil
                   moduleProvider:nil
                    launchOptions:launchOptions];
}

- (instancetype)initWithBundleURL:(NSURL *)bundleURL
                   moduleProvider:(HippyBridgeModuleProviderBlock)block
                    launchOptions:(NSDictionary *)launchOptions
{
    return [self initWithDelegate:nil
                        bundleURL:bundleURL
                   moduleProvider:block
                    launchOptions:launchOptions];
}

- (instancetype)initWithDelegate:(id<HippyBridgeDelegate>)delegate
                       bundleURL:(NSURL *)bundleURL
                  moduleProvider:(HippyBridgeModuleProviderBlock)block
                   launchOptions:(NSDictionary *)launchOptions
{
    if (self = [super init]) {
        _delegate = delegate;
        _bundleURL = bundleURL;
        _moduleProvider = block;
        _debugMode = [launchOptions[@"DebugMode"] boolValue];
        _shareOptions = [NSMutableDictionary new];
        _appVerson = @"";
        [self setUp];

        HippyExecuteOnMainQueue(^{ [self bindKeys]; });
    }
    return self;
}

HIPPY_NOT_IMPLEMENTED(- (instancetype)init)

- (void)dealloc
{
    /**
     * This runs only on the main thread, but crashes the subclass
     * HippyAssertMainQueue();
     */
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [self invalidate];
}

- (void)bindKeys
{
    HippyAssertMainQueue();

#if TARGET_IPHONE_SIMULATOR
    HippyKeyCommands *commands = [HippyKeyCommands sharedInstance];

    // reload in current mode
    __weak typeof(self) weakSelf = self;
    [commands registerKeyCommandWithInput:@"r"
                            modifierFlags:UIKeyModifierCommand
                                   action:^(__unused UIKeyCommand *command) {
                                       // 暂时屏蔽掉RN的调试
                                       [weakSelf requestReload];
                                   }];
#endif
}

- (NSArray<Class> *)moduleClasses
{
    return self.batchedBridge.moduleClasses;
}

- (id)moduleForName:(NSString *)moduleName
{
    if ([self isKindOfClass: [HippyBatchedBridge class]]) {
        return [self moduleForName:moduleName];
    } else
        return [self.batchedBridge moduleForName:moduleName];

}

- (id)moduleForClass:(Class)moduleClass
{
    return [self moduleForName:HippyBridgeModuleNameForClass(moduleClass)];
}

- (HippyExtAnimationModule *) animationModule {
    return [self moduleForName:@"AnimationModule"];
}

- (id <HippyImageViewCustomLoader>)imageLoader
{
    if (!_isInitImageLoader) {
        _imageLoader = [[self modulesConformingToProtocol: @protocol(HippyImageViewCustomLoader)] lastObject];

        if (_imageLoader) {
            _isInitImageLoader = YES;
        }
    }
    return _imageLoader;
}

- (id <HippyCustomTouchHandlerProtocol>)customTouchHandler
{
    if (!_customTouchHandler) {
        _customTouchHandler = [[self modulesConformingToProtocol:@protocol(HippyCustomTouchHandlerProtocol)] lastObject];
    }
    return _customTouchHandler;
}

- (NSArray *)modulesConformingToProtocol:(Protocol *)protocol
{
    NSMutableArray *modules = [NSMutableArray new];
    for (Class moduleClass in self.moduleClasses) {
        if ([moduleClass conformsToProtocol:protocol]) {
            id module = [self moduleForClass:moduleClass];
            if (module) {
                [modules addObject:module];
            }
        }
    }
    return [modules copy];
}

- (BOOL)moduleIsInitialized:(Class)moduleClass
{
    return [self.batchedBridge moduleIsInitialized:moduleClass];
}

- (void)whitelistedModulesDidChange
{
    [self.batchedBridge whitelistedModulesDidChange];
}

- (void)reload
{
    /**
     * Any thread
     */
    dispatch_async(dispatch_get_main_queue(), ^{
        [self invalidate];
        [self setUp];
    });
}

- (void)requestReload
{
    if (self.batchedBridge.debugMode) {
        [[NSNotificationCenter defaultCenter] postNotificationName:HippyReloadNotification object:self];
        [self reload];
    }
}

- (void)setUp
{
    _performanceLogger = [HippyPerformanceLogger new];
    [_performanceLogger markStartForTag:HippyPLBridgeStartup];
    //  [_performanceLogger markStartForTag:HippyPLTTI];

    // Only update bundleURL from delegate if delegate bundleURL has changed
    NSURL *previousDelegateURL = _delegateBundleURL;
    _delegateBundleURL = [self.delegate sourceURLForBridge:self];
    if (_delegateBundleURL && ![_delegateBundleURL isEqual:previousDelegateURL]) {
        _bundleURL = _delegateBundleURL;
    }

    // Sanitize the bundle URL
    _bundleURL = [HippyConvert NSURL:_bundleURL.absoluteString];
#ifndef HIPPY_DEBUG
    @try {
#endif
        [self createBatchedBridge];
        [self.batchedBridge start];
#ifndef HIPPY_DEBUG
    } @catch (NSException *exception) {
        MttHippyException(exception);
    }
#endif
}

- (void)createBatchedBridge
{
    self.batchedBridge = [[HippyBatchedBridge alloc] initWithParentBridge:self];
}

- (BOOL)isLoading
{
    return self.batchedBridge.loading;
}

- (BOOL)isValid
{
    return self.batchedBridge.valid;
}

- (BOOL) isErrorOccured {
    return self.batchedBridge.errorOccured;
}

- (BOOL)isBatchActive
{
    return [_batchedBridge isBatchActive];
}

- (void)invalidate
{
    HippyBridge *batchedBridge = self.batchedBridge;
    self.batchedBridge = nil;

    if (batchedBridge) {
        HippyExecuteOnMainQueue(^{
            [batchedBridge invalidate];
        });
    }
}

- (void)enqueueJSCall:(NSString *)moduleDotMethod args:(NSArray *)args
{
    NSArray<NSString *> *ids = [moduleDotMethod componentsSeparatedByString:@"."];
    NSString *module = ids[0];
    NSString *method = ids[1];
    [self enqueueJSCall:module method:method args:args completion:NULL];
}

- (void)enqueueJSCall:(NSString *)module method:(NSString *)method args:(NSArray *)args completion:(dispatch_block_t)completion
{
    [self.batchedBridge enqueueJSCall:module method:method args:args completion:completion];
}

- (void)enqueueCallback:(NSNumber *)cbID args:(NSArray *)args
{
    [self.batchedBridge enqueueCallback:cbID args:args];
}

- (JSValue *)callFunctionOnModule:(NSString *)module
                           method:(NSString *)method
                        arguments:(NSArray *)arguments
                            error:(NSError **)error
{
    return [self.batchedBridge callFunctionOnModule:module method:method arguments:arguments error:error];
}


@end
