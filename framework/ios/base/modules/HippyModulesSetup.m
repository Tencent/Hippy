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

#import "HippyAssert.h"
#import "HippyBridge.h"
#import "HippyModuleData.h"
#import "HippyModulesSetup.h"
#import "HippyTurboModule.h"
#import "HippyLog.h"
#import "HippyUtils.h"
#import <objc/runtime.h>


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

    HippyAssert([moduleClass conformsToProtocol:@protocol(HippyBridgeModule)],
                @"%@ does not conform to the HippyBridgeModule protocol", moduleClass);

    // Register module (including viewManagers)
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

@interface HippyModulesSetup () {
    HippyBridgeModuleProviderBlock _providerBlock;
    __weak HippyBridge *_bridge;
    NSDictionary<NSString *, HippyModuleData *> *_moduleDataByName;
    NSArray<HippyModuleData *> *_moduleDataByID;
    NSArray<Class> *_moduleClassesByID;
}

@property(readwrite, assign) BOOL isModuleSetupComplete;

@end

@implementation HippyModulesSetup

- (instancetype)initWithBridge:(HippyBridge *)bridge 
     extraProviderModulesBlock:(HippyBridgeModuleProviderBlock)moduleProvider {
    self = [super init];
    if (self) {
        _bridge = bridge;
        _providerBlock = [moduleProvider copy];
    }
    return self;
}

- (void)invalidate {
    // do nothing
}

- (HippyBridgeModuleProviderBlock)moduleProvider {
    return [_providerBlock copy];
}

- (void)setupModulesWithCompletionBlock:(dispatch_block_t)completion {
    HippyLogInfo(@"Begin Modules Setup");
    NSArray<id<HippyBridgeModule>> *extraModules = _providerBlock ? _providerBlock() : @[];
#if HIPPY_DEBUG
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        HippyVerifyAllModulesExported(extraModules);
    });
#endif //HIPPY_DEBUG
    NSMutableArray<Class> *moduleClasses = [NSMutableArray new];
    NSMutableArray<HippyModuleData *> *moduleDataArr = [NSMutableArray new];
    NSMutableDictionary<NSString *, HippyModuleData *> *moduleDataByName = [NSMutableDictionary new];

    for (id<HippyBridgeModule> extraModule in extraModules) {
        Class moduleClass = [extraModule class];
        NSString *moduleName = HippyBridgeModuleNameForClass(moduleClass);
        if (HIPPY_DEBUG) {
            // Check for name collisions between preregistered modules
            HippyModuleData *moduleData = moduleDataByName[moduleName];
            if (moduleData) {
                HippyLogWarn(@"Attempted to register HippyBridgeModule class %@ for the "
                               "name '%@', but name was already registered by class %@",
                    moduleClass, moduleName, moduleData.moduleClass);
                continue;
            }
        }
        // Instantiate moduleData container
        HippyModuleData *moduleData = [[HippyModuleData alloc] initWithModuleInstance:extraModule bridge:_bridge];
        moduleDataByName[moduleName] = moduleData;
        [moduleClasses addObject:moduleClass];
        [moduleDataArr addObject:moduleData];
    }
    for (Class moduleClass in HippyGetModuleClasses()) {
        NSString *moduleName = HippyBridgeModuleNameForClass(moduleClass);

        // Check for module name collisions
        HippyModuleData *moduleData = moduleDataByName[moduleName];
        if (moduleData) {
            if (moduleData.hasInstance) {
                // Existing module was preregistered, so it takes precedence
                continue;
            } else if ([moduleClass new] == nil) {
                // The new module returned nil from init, so use the old module
                continue;
            } else if ([moduleData.moduleClass new] != nil) {
                // Both modules were non-nil, so it's unclear which should take precedence
                HippyLogWarn(@"Attempted to register HippyBridgeModule class %@ for the "
                               "name '%@', but name was already registered by class %@",
                    moduleClass, moduleName, moduleData.moduleClass);
            }
        }

        // Instantiate moduleData (TODO: can we defer this until config generation?)
        moduleData = [[HippyModuleData alloc] initWithModuleClass:moduleClass bridge:_bridge];
        moduleDataByName[moduleName] = moduleData;
        [moduleClasses addObject:moduleClass];
        [moduleDataArr addObject:moduleData];
    }
    // Store modules
    _moduleDataByID = [moduleDataArr copy];
    _moduleDataByName = [moduleDataByName copy];
    _moduleClassesByID = [moduleClasses copy];
    [self prepareModules];
    self.isModuleSetupComplete = YES;
    HippyLogInfo(@"End Modules Setup");
    if (completion) {
        completion();
    }
}

- (void)prepareModules {
    HippyBridge *bridge = _bridge;
    if (![bridge isValid]) {
        return;
    }
    for (HippyModuleData *moduleData in _moduleDataByID) {
        if (moduleData.requiresMainQueueSetup || moduleData.hasConstantsToExport) {
            // Modules that need to be set up on the main thread cannot be initialized
            // lazily when required without doing a dispatch_sync to the main thread,
            // which can result in deadlock. To avoid this, we initialize all of these
            // modules on the main thread in parallel with loading the JS code, so
            // they will already be available before they are ever required.
            dispatch_block_t block = ^{
                (void)[moduleData instance];
                [moduleData gatherConstants];
            };
            if (HippyIsMainQueue()) {
                block();
            } else {
                dispatch_async(dispatch_get_main_queue(), block);
            }
        }
        else {
            
        }
    }
}

- (NSDictionary<NSString *, HippyModuleData *> *)moduleDataByName {
    return [_moduleDataByName copy];
}

- (NSArray<HippyModuleData *> *)moduleDataByID {
    return [_moduleDataByID copy];
}

- (NSArray<Class> *)moduleClasses {
    return [_moduleClassesByID copy];
}

- (id)moduleForName:(NSString *)moduleName {
    HippyAssert(moduleName, @"module name must not be null for [HippyModulesSetup moduleForName:]");
    id module = _moduleDataByName[moduleName].instance;
    return module;
}

- (id)moduleForClass:(Class)cls {
    HippyAssert(cls, @"class must not be null for [HippyModulesSetup moduleForClass:]");
    return [self moduleForName:HippyBridgeModuleNameForClass(cls)];
}

- (BOOL)isModuleInitialized:(Class)moduleClass {
    HippyModuleData *module = _moduleDataByName[HippyBridgeModuleNameForClass(moduleClass)];
    return module.hasInstance;
}

@end
