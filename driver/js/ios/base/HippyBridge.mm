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
#import "HippyRedBox.h"
#import "HippyTurboModule.h"
#import "HippyBridge+LocalFileSource.h"
#import "HippyBridge+Private.h"
#import "HippyImageDataLoader.h"
#import "HippyDefaultImageProvider.h"
#import "HippyAssert.h"
#import "scene.h"
#import "scope.h"

NSString *const HippyReloadNotification = @"HippyReloadNotification";
NSString *const HippyJavaScriptWillStartLoadingNotification = @"HippyJavaScriptWillStartLoadingNotification";
NSString *const HippyJavaScriptDidLoadNotification = @"HippyJavaScriptDidLoadNotification";
NSString *const HippyJavaScriptDidFailToLoadNotification = @"HippyJavaScriptDidFailToLoadNotification";
NSString *const HippyDidInitializeModuleNotification = @"HippyDidInitializeModuleNotification";
NSString *const HippyBusinessDidLoadNotification = @"HippyBusinessDidLoadNotification";
NSString *const HippySDKVersion = @"2.2.0";

static NSMutableArray<Class> *HippyModuleClasses;
NSArray<Class> *HippyGetModuleClasses(void) {
    return HippyModuleClasses;
}

/**
 * Register the given class as a bridge module. All modules must be registered
 * prior to the first bridge initialization.
 */

HIPPY_EXTERN void HippyRegisterModule(Class);
void HippyRegisterModule(Class moduleClass) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        HippyModuleClasses = [NSMutableArray new];
    });

    HippyAssert([moduleClass conformsToProtocol:@protocol(HippyBridgeModule)], @"%@ does not conform to the HippyBridgeModule protocol", moduleClass);

    // Register module
    [HippyModuleClasses addObject:moduleClass];
}

/**
 * This function returns the module name for a given class.
 */
NSString *HippyBridgeModuleNameForClass(Class cls) {
#if HIPPY_DEBUG
    HippyAssert([cls conformsToProtocol:@protocol(HippyBridgeModule)] || [cls conformsToProtocol:@protocol(HippyTurboModule)],
                @"Bridge module `%@` does not conform to HippyBridgeModule or HippyTurboModule", cls);
#endif
    NSString *name = nil;
    // The two protocols(HippyBridgeModule and HippyTurboModule)  should be mutually exclusive.
    if ([cls conformsToProtocol:@protocol(HippyBridgeModule)]) {
        name = [cls moduleName];
    } else if ([cls conformsToProtocol:@protocol(HippyTurboModule)]) {
        name = [cls turoboModuleName];
    }
    if (name.length == 0) {
        name = NSStringFromClass(cls);
    }
    if ([name hasPrefix:@"Hippy"] || [name hasPrefix:@"hippy"]) {
        // an exception,QB uses it
        if ([name isEqualToString:@"HippyIFrame"]) {
        } else {
            name = [name substringFromIndex:5];
        }
    }

    return name;
}

#if HIPPY_DEBUG
void HippyVerifyAllModulesExported(NSArray *extraModules) {
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

@interface HippyBridge() {
    NSURL *_delegateBundleURL;
    NSSet<Class<HippyImageProviderProtocol>> *_imageProviders;
    BOOL _isInitImageLoader;
    dispatch_block_t _nativeSetUpBlock;
    id<HippyMethodInterceptorProtocol> _methodInterceptor;
}
@end

@implementation HippyBridge

dispatch_queue_t HippyJSThread;

+ (void)initialize {
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
+ (instancetype)currentBridge {
    return HippyCurrentBridgeInstance;
}

+ (void)setCurrentBridge:(HippyBridge *)currentBridge {
    HippyCurrentBridgeInstance = currentBridge;
}

- (instancetype)initWithDelegate:(id<HippyBridgeDelegate>)delegate launchOptions:(NSDictionary *)launchOptions {
    return [self initWithDelegate:delegate bundleURL:nil moduleProvider:nil launchOptions:launchOptions executorKey:nil];
}

- (instancetype)initWithBundleURL:(NSURL *)bundleURL
                   moduleProvider:(HippyBridgeModuleProviderBlock)block
                    launchOptions:(NSDictionary *)launchOptions
                      executorKey:(NSString *)executorKey;
{ return [self initWithDelegate:nil bundleURL:bundleURL moduleProvider:block launchOptions:launchOptions executorKey:executorKey]; }

- (instancetype)initWithDelegate:(id<HippyBridgeDelegate>)delegate
                       bundleURL:(NSURL *)bundleURL
                  moduleProvider:(HippyBridgeModuleProviderBlock)block
                   launchOptions:(NSDictionary *)launchOptions
                     executorKey:(NSString *)executorKey {
    if (self = [super init]) {
        _delegate = delegate;
        _bundleURL = bundleURL;
        _moduleProvider = block;
        _debugMode = [launchOptions[@"DebugMode"] boolValue];
        _enableTurbo = !!launchOptions[@"EnableTurbo"] ? [launchOptions[@"EnableTurbo"] boolValue] : YES;
        _appVerson = @"";
        _executorKey = executorKey;
        _invalidateReason = HippyInvalidateReasonDealloc;
        [self setUp];
        HippyExecuteOnMainQueue(^{
            [self bindKeys];
        });
        HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ Init %p", NSStringFromClass([self class]), self);
    }
    return self;
}

- (instancetype)initWithmoduleProviderWithoutRuntime:(HippyBridgeModuleProviderBlock)block {
    self = [super init];
    if (self) {
        _moduleProvider = block;
        [self setUp];
    }
    HippyExecuteOnMainQueue(^{
        [self bindKeys];
    });
    return self;
}

HIPPY_NOT_IMPLEMENTED(-(instancetype)init)

- (void)dealloc {
    /**
     * This runs only on the main thread, but crashes the subclass
     * HippyAssertMainQueue();
     */
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ dealloc %p", NSStringFromClass([self class]), self);
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    self.invalidateReason = HippyInvalidateReasonDealloc;
    self.batchedBridge.invalidateReason = HippyInvalidateReasonDealloc;
    [self invalidate];
}

- (void)bindKeys {
    HippyAssertMainQueue();

#if TARGET_IPHONE_SIMULATOR
    HippyKeyCommands *commands = [HippyKeyCommands sharedInstance];

    // reload in current mode
    __weak __typeof(self) weakSelf = self;
    [commands registerKeyCommandWithInput:@"r" modifierFlags:UIKeyModifierCommand action:^(__unused UIKeyCommand *command) {
        // 暂时屏蔽掉RN的调试
        [weakSelf requestReload];
    }];
#endif
}

- (NSArray<Class> *)moduleClasses {
    return self.batchedBridge.moduleClasses;
}

- (id)moduleForName:(NSString *)moduleName {
    if ([self isKindOfClass:[HippyBatchedBridge class]]) {
        return [self moduleForName:moduleName];
    } else
        return [self.batchedBridge moduleForName:moduleName];
}

- (id)moduleForClass:(Class)moduleClass {
    return [self moduleForName:HippyBridgeModuleNameForClass(moduleClass)];
}

- (NSSet<Class<HippyImageProviderProtocol>> *)imageProviders {
    if (!_imageProviders) {
        NSMutableSet *set = [NSMutableSet setWithCapacity:8];
        for (Class moduleClass in self.moduleClasses) {
            if ([moduleClass conformsToProtocol:@protocol(HippyImageProviderProtocol)]) {
                [set addObject:moduleClass];
            }
        }
        _imageProviders = [NSSet setWithSet:set];
    }
    return _imageProviders;
}

- (id<HippyFrameworkProxy>)frameworkProxy {
    return _frameworkProxy ?: self;
}

- (NSArray *)modulesConformingToProtocol:(Protocol *)protocol {
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

- (BOOL)moduleIsInitialized:(Class)moduleClass {
    return [self.batchedBridge moduleIsInitialized:moduleClass];
}

- (void)whitelistedModulesDidChange {
    [self.batchedBridge whitelistedModulesDidChange];
}

- (void)reload {
    /**
     * Any thread
     */
    dispatch_async(dispatch_get_main_queue(), ^{
        self.invalidateReason = HippyInvalidateReasonReload;
        self.batchedBridge.invalidateReason = HippyInvalidateReasonReload;
        [self invalidate];
        [self setUp];
    });
}

- (void)requestReload {
    if (self.batchedBridge.debugMode) {
        [[NSNotificationCenter defaultCenter] postNotificationName:HippyReloadNotification object:self];
        [self reload];
    }
}

- (void)setUp {
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ setUp %p", NSStringFromClass([self class]), self);
    _performanceLogger = [HippyPerformanceLogger new];
    [_performanceLogger markStartForTag:HippyPLBridgeStartup];
    //  [_performanceLogger markStartForTag:HippyPLTTI];

    // Only update bundleURL from delegate if delegate bundleURL has changed
    NSURL *previousDelegateURL = _delegateBundleURL;
    if ([self.delegate respondsToSelector:@selector(sourceURLForBridge:)]) {
        _delegateBundleURL = [self.delegate sourceURLForBridge:self];
    }
    if (_delegateBundleURL && ![_delegateBundleURL isEqual:previousDelegateURL]) {
        _bundleURL = _delegateBundleURL;
    }

    // Sanitize the bundle URL
    _bundleURL = [HippyConvert NSURL:_bundleURL.absoluteString];
    @try {
        [self createBatchedBridge];
        [self.batchedBridge start];
    } @catch (NSException *exception) {
        MttHippyException(exception);
    }
    if (_nativeSetUpBlock) {
        _nativeSetUpBlock();
    }
    if (nil == self.renderContext.frameworkProxy) {
        self.renderContext.frameworkProxy = self;
    }
}

- (void)setMethodInterceptor:(id<HippyMethodInterceptorProtocol>)methodInterceptor {
    if ([self isKindOfClass:[HippyBatchedBridge class]]) {
        HippyBatchedBridge *batchedBrige = (HippyBatchedBridge *)self;
        batchedBrige.parentBridge.methodInterceptor = methodInterceptor;
    } else {
        _methodInterceptor = methodInterceptor;
    }
}

- (id<HippyMethodInterceptorProtocol>)methodInterceptor {
    if ([self isKindOfClass:[HippyBatchedBridge class]]) {
        HippyBatchedBridge *batchedBrige = (HippyBatchedBridge *)self;
        return batchedBrige.parentBridge.methodInterceptor;
    } else {
        return _methodInterceptor;
    }
}

//TODO这个方法是否需要
- (void)setUpDomManager:(std::weak_ptr<hippy::DomManager>)domManager {
    [self.batchedBridge setUpDomManager:domManager];
}

- (void)setUpWorkerManager:(std::shared_ptr<footstone::WorkerManager>)workerManager {
    _workerManager = workerManager;
}

- (void)setUpWithRootTag:(NSNumber *)tag rootSize:(CGSize)size
          frameworkProxy:(id<HippyFrameworkProxy>) proxy rootView:(UIView *)view screenScale:(CGFloat)scale {
    __weak HippyBridge *weakBridge = self;
    __weak id<HippyFrameworkProxy> weakProxy = proxy;
    __weak UIView *weakView = view;
    _nativeSetUpBlock = ^(){
        HippyBridge *strongSelf = weakBridge;
        if (strongSelf) {
            uint32_t rootTag = [tag unsignedIntValue];
            strongSelf->_rootNode = std::make_shared<hippy::RootNode>(rootTag);
            strongSelf->_rootNode->SetDelegateTaskRunner(strongSelf.batchedBridge.javaScriptExecutor.pScope->GetTaskRunner());
            strongSelf->_rootNode->GetAnimationManager()->SetRootNode(strongSelf->_rootNode);
            strongSelf->_batchedBridge.javaScriptExecutor.pScope->SetRootNode(strongSelf->_rootNode);
            strongSelf->_domManager = std::make_shared<hippy::DomManager>();
            strongSelf->_domManager->SetTaskRunner(strongSelf->_batchedBridge.workerManager->CreateTaskRunner("hippy_dom"));
            strongSelf->_domManager->Init();
            strongSelf->_rootNode->SetDomManager(strongSelf->_domManager);
            strongSelf->_rootNode->GetLayoutNode()->SetScaleFactor(scale);
            std::weak_ptr<hippy::DomManager> weakDomManager = strongSelf->_domManager;
            std::weak_ptr<hippy::RootNode> weakRootNode = strongSelf->_rootNode;
            std::function<void()> func = [weakDomManager, weakRootNode, size](){
                auto rootNode = weakRootNode.lock();
                if (!rootNode) {
                    return;
                }
                rootNode->SetRootSize(size.width, size.height);
            };
            strongSelf->_domManager->PostTask(hippy::Scene({func}));

            strongSelf->_renderManager = std::make_shared<NativeRenderManager>();
            strongSelf->_renderManager->SetFrameworkProxy(weakProxy);
            strongSelf->_renderManager->RegisterRootView(weakView, strongSelf->_rootNode);
            strongSelf->_renderManager->SetDomManager(strongSelf->_domManager);

            strongSelf->_domManager->SetRenderManager(strongSelf->_renderManager);

            [strongSelf setUpDomManager:strongSelf->_domManager];

            strongSelf.renderContext = strongSelf->_renderManager->GetRenderContext();
            
#ifdef ENABLE_INSPECTOR
            auto devtools_data_source = strongSelf->_batchedBridge.javaScriptExecutor.pScope->GetDevtoolsDataSource();
            if (devtools_data_source) {
                devtools_data_source->SetRootNode(strongSelf->_rootNode);
            }
#endif
        }
    };
    if (self.batchedBridge) {
        _nativeSetUpBlock();
    }
}

- (void)createBatchedBridge {
    self.batchedBridge = [[HippyBatchedBridge alloc] initWithParentBridge:self];
}

- (BOOL)isLoading {
    return self.batchedBridge.loading;
}

- (BOOL)isValid {
    return self.batchedBridge.valid;
}

- (BOOL)isErrorOccured {
    return self.batchedBridge.errorOccured;
}

- (BOOL)isBatchActive {
    return [_batchedBridge isBatchActive];
}

- (void)invalidate {
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],%@ invalide %p", NSStringFromClass([self class]), self);
    HippyBridge *batchedBridge = self.batchedBridge;
    self.batchedBridge = nil;
    _domManager = nullptr;
    _renderManager = nullptr;
    if (batchedBridge) {
        HippyExecuteOnMainQueue(^{
            [batchedBridge invalidate];
        });
    }
}

- (void)enqueueJSCall:(NSString *)moduleDotMethod args:(NSArray *)args {
    NSArray<NSString *> *ids = [moduleDotMethod componentsSeparatedByString:@"."];
    NSString *module = ids[0];
    NSString *method = ids[1];
    [self enqueueJSCall:module method:method args:args completion:NULL];
}

- (void)enqueueJSCall:(NSString *)module method:(NSString *)method args:(NSArray *)args completion:(dispatch_block_t)completion {
    [self.batchedBridge enqueueJSCall:module method:method args:args completion:completion];
}

- (void)enqueueCallback:(NSNumber *)cbID args:(NSArray *)args {
    [self.batchedBridge enqueueCallback:cbID args:args];
}

- (JSValue *)callFunctionOnModule:(NSString *)module method:(NSString *)method arguments:(NSArray *)arguments error:(NSError **)error {
    return [self.batchedBridge callFunctionOnModule:module method:method arguments:arguments error:error];
}

- (void)setRedBoxShowEnabled:(BOOL)enabled {
#if HIPPY_DEBUG
    HippyRedBox *redBox = [self redBox];
    redBox.showEnabled = enabled;
#endif  // HIPPY_DEBUG
}

#pragma mark HippyFrameworkProxy Delegate Implementation
- (NSString *)standardizeAssetUrlString:(NSString *)UrlString forRenderContext:(nonnull id<HippyRenderContext>)renderContext {
    if ([HippyBridge isHippyLocalFileURLString:UrlString]) {
        return [self absoluteStringFromHippyLocalFileURLString:UrlString];
    }
    return UrlString;
}

- (id<HippyImageDataLoaderProtocol>)imageDataLoaderForRenderContext:(id<HippyRenderContext>)renderContext {
    if (self.frameworkProxy != self && [self.frameworkProxy respondsToSelector:@selector(imageDataLoaderForRenderContext:)]) {
        return [self.frameworkProxy imageDataLoaderForRenderContext:renderContext];
    }
    return [HippyImageDataLoader new];
}

- (Class<HippyImageProviderProtocol>)imageProviderClassForRenderContext:(id<HippyRenderContext>)renderContext {
    if (self.frameworkProxy != self && [self.frameworkProxy respondsToSelector:@selector(imageProviderClassForRenderContext:)]) {
        return [self.frameworkProxy imageProviderClassForRenderContext:renderContext];
    }
    return [HippyDefaultImageProvider class];
}

@end

NSString *const HippySecondaryBundleDidStartLoadNotification = @"HippySecondaryBundleDidStartLoadNotification";
NSString *const HippySecondaryBundleDidLoadSourceCodeNotification = @"HippySecondaryBundleDidLoadSourceCodeNotification";
NSString *const HippySecondaryBundleDidLoadNotification = @"HippySecondaryBundleDidLoadNotification";

@interface SecondaryBundle : NSObject

@property (nonatomic, strong) NSURL *url;
@property (nonatomic, copy) SecondaryBundleLoadingCompletion loadBundleCompletion;
@property (nonatomic, copy) SecondaryBundleLoadingCompletion enqueueScriptCompletion;
@property (nonatomic, copy) SecondaryBundleCompletion completion;

@end

@implementation SecondaryBundle

@end

static const void *HippyBridgeIsSecondaryBundleLoadingKey = &HippyBridgeIsSecondaryBundleLoadingKey;
static const void *HippyBridgePendingLoadBundlesKey = &HippyBridgePendingLoadBundlesKey;
static const void *HippyBridgeLoadedBundlesKey = &HippyBridgeLoadedBundlesKey;

@implementation HippyBridge (Mtt)

- (NSMutableArray *)pendingLoadBundles {
    id value = objc_getAssociatedObject(self, HippyBridgePendingLoadBundlesKey);
    return value;
}

- (void)setPendingLoadBundles:(NSMutableArray *)pendingLoadBundles {
    objc_setAssociatedObject(self, HippyBridgePendingLoadBundlesKey, pendingLoadBundles, OBJC_ASSOCIATION_RETAIN);
}

- (NSMutableDictionary *)loadedBundleURLs {
    id value = objc_getAssociatedObject(self, HippyBridgeLoadedBundlesKey);
    return value;
}

- (void)setLoadedBundleURLs:(NSMutableDictionary *)loadedBundleURLs {
    objc_setAssociatedObject(self, HippyBridgeLoadedBundlesKey, loadedBundleURLs, OBJC_ASSOCIATION_RETAIN);
}

- (BOOL)isSecondaryBundleLoading {
    return [(NSNumber *)objc_getAssociatedObject(self, &HippyBridgeIsSecondaryBundleLoadingKey) boolValue];
}

- (void)setIsSecondaryBundleLoading:(BOOL)isSecondaryBundleLoading {
    objc_setAssociatedObject(self, &HippyBridgeIsSecondaryBundleLoadingKey, @(isSecondaryBundleLoading), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (void)loadSecondary:(NSURL *)secondaryBundleURL
       loadBundleCompletion:(SecondaryBundleLoadingCompletion)loadBundleCompletion
    enqueueScriptCompletion:(SecondaryBundleLoadingCompletion)enqueueScriptCompletion
                 completion:(SecondaryBundleCompletion)completion {
    if (secondaryBundleURL.absoluteString.length == 0) {
        return;
    }
    __weak HippyBatchedBridge *batchedBridge = (HippyBatchedBridge *)[self batchedBridge];
    NSString *secondaryBundleURLString = [secondaryBundleURL path];
    batchedBridge.sandboxDirectory = [secondaryBundleURLString stringByDeletingLastPathComponent];
    BOOL loaded;
    @synchronized(self) {
        loaded = [self.loadedBundleURLs objectForKey:secondaryBundleURLString] != nil;
    }
    // 已经加载，直接返回
    if (loaded) {
        if (completion) {
            if ([self.batchedBridge.javaScriptExecutor respondsToSelector:@selector(secondBundleLoadCompleted:)]) {
                [self.batchedBridge.javaScriptExecutor secondBundleLoadCompleted:YES];
            }
            completion(YES);
        }

        [self loadNextBundle];

        return;
    }

    // 正在加载中，丢进队列
    if (batchedBridge.isSecondaryBundleLoading) {
        SecondaryBundle *bundle = [[SecondaryBundle alloc] init];
        bundle.url = secondaryBundleURL;
        bundle.loadBundleCompletion = loadBundleCompletion;
        bundle.enqueueScriptCompletion = enqueueScriptCompletion;
        bundle.completion = completion;

        if (!self.pendingLoadBundles) {
            self.pendingLoadBundles = [[NSMutableArray alloc] init];
        }

        @synchronized(self) {
            [self.pendingLoadBundles addObject:bundle];
        }
    } else {
        [self.performanceLogger markStartForTag:HippySecondaryStartup];

        batchedBridge.isSecondaryBundleLoading = YES;

        [[NSNotificationCenter defaultCenter] postNotificationName:HippySecondaryBundleDidStartLoadNotification object:self
                                                          userInfo:@{ @"url": secondaryBundleURLString }];

        dispatch_queue_t bridgeQueue = dispatch_queue_create("mtt.bussiness.HippyBridgeQueue", DISPATCH_QUEUE_CONCURRENT);
        dispatch_group_t initModulesAndLoadSource = dispatch_group_create();
        dispatch_group_enter(initModulesAndLoadSource);
        __block NSData *sourceCode = nil;
        [self.performanceLogger markStartForTag:HippySecondaryLoadSource];
        [HippyJavaScriptLoader loadBundleAtURL:secondaryBundleURL onProgress:nil
                                    onComplete:^(NSError *error, NSData *source, __unused int64_t sourceLength) {
                                        if (!error) {
                                            sourceCode = source;
                                        } else {
                                            batchedBridge.isSecondaryBundleLoading = NO;
                                        }

                                        NSMutableDictionary *userInfo =
                                            [[NSMutableDictionary alloc] initWithDictionary:@ { @"url": secondaryBundleURLString, @"bridge": self }];
                                        if (error) {
                                            [userInfo setObject:error forKey:@"error"];
                                        }

                                        [[NSNotificationCenter defaultCenter] postNotificationName:HippySecondaryBundleDidLoadSourceCodeNotification
                                                                                            object:self
                                                                                          userInfo:userInfo];

                                        if (loadBundleCompletion) {
                                            loadBundleCompletion(error);
                                        }

                                        [self.performanceLogger markStopForTag:HippySecondaryLoadSource];
                                        dispatch_group_leave(initModulesAndLoadSource);
                                    }];

        dispatch_group_notify(initModulesAndLoadSource, bridgeQueue, ^{
            HippyBatchedBridge *strongBridge = batchedBridge;
            if (sourceCode) {
                // 公共包正在加载，等待
                dispatch_semaphore_wait(strongBridge.semaphore, DISPATCH_TIME_FOREVER);

                dispatch_semaphore_signal(strongBridge.semaphore);

                HippyAssert(!strongBridge.isLoading, @"error, common bundle loaded unfinished");

                if ([self.batchedBridge.javaScriptExecutor respondsToSelector:@selector(updateGlobalObjectBeforeExcuteSecondary)]) {
                    [self.batchedBridge.javaScriptExecutor updateGlobalObjectBeforeExcuteSecondary];
                }
                [self.performanceLogger markStartForTag:HippySecondaryExecuteSource];
                [strongBridge enqueueApplicationScript:sourceCode url:secondaryBundleURL onComplete:^(NSError *error) {
                    if (enqueueScriptCompletion) {
                        enqueueScriptCompletion(error);
                    }

                    NSMutableDictionary *userInfo = [[NSMutableDictionary alloc] initWithDictionary:@ { @"url": secondaryBundleURLString, @"bridge": self }];
                    if (error) {
                        [userInfo setObject:error forKey:@"error"];
                    }

                    [[NSNotificationCenter defaultCenter] postNotificationName:HippySecondaryBundleDidLoadNotification object:self userInfo:userInfo];

                    if (!error) {
                        if (!self.loadedBundleURLs) {
                            self.loadedBundleURLs = [[NSMutableDictionary alloc] init];
                        }

                        // 加载成功，保存Url，下次无需加载
                        @synchronized(self) {
                            [self.loadedBundleURLs setObject:@(YES) forKey:secondaryBundleURLString];
                        }
                    }

                    batchedBridge.isSecondaryBundleLoading = NO;

                    [self.performanceLogger markStopForTag:HippySecondaryExecuteSource];
                    [self.performanceLogger markStopForTag:HippySecondaryStartup];

                    if (completion) {
                        if ([self.batchedBridge.javaScriptExecutor respondsToSelector:@selector(secondBundleLoadCompleted:)]) {
                            [self.batchedBridge.javaScriptExecutor secondBundleLoadCompleted:!error];
                        }
                        completion(!error);
                    }

                    [self loadNextBundle];
                }];
            } else {
                if (completion) {
                    if ([self.batchedBridge.javaScriptExecutor respondsToSelector:@selector(secondBundleLoadCompleted:)]) {
                        [self.batchedBridge.javaScriptExecutor secondBundleLoadCompleted:NO];
                    }
                    completion(NO);
                }

                [self loadNextBundle];
            }
        });
    }
}

- (void)loadNextBundle {
    @synchronized(self) {
        if (self.pendingLoadBundles.count != 0) {
            SecondaryBundle *bundle = self.pendingLoadBundles[0];
            [self.pendingLoadBundles removeObject:bundle];
            [self loadSecondary:bundle.url loadBundleCompletion:bundle.loadBundleCompletion enqueueScriptCompletion:bundle.enqueueScriptCompletion
                             completion:bundle.completion];
        }
    }
}

@end
