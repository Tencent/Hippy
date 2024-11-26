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

#import "HippyBridge+ModuleManage.h"
#import "HippyBridge+Private.h"
#import "HippyModuleData.h"
#import "HippyOCTurboModule.h"
#import "HippyTurboModuleManager.h"
#import "HippyUtils.h"


// Key of module config info for js side
static NSString *const kHippyRemoteModuleConfigKey = @"remoteModuleConfig";


@implementation HippyBridge (ModuleManage)

#pragma mark - Module Management

- (NSArray<Class> *)moduleClasses {
    return self.moduleSetup.moduleClasses;
}

- (id)moduleForName:(NSString *)moduleName {
    return [self.moduleSetup moduleForName:moduleName];
}

- (id)moduleForClass:(Class)moduleClass {
    return [self.moduleSetup moduleForClass:moduleClass];
}

- (HippyModuleData *)moduleDataForName:(NSString *)moduleName {
    if (moduleName) {
        return self.moduleSetup.moduleDataByName[moduleName];
    }
    return nil;
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
    return [self.moduleSetup isModuleInitialized:moduleClass];
}

- (BOOL)isModuleSetupComplete {
    return self.moduleSetup.isModuleSetupComplete;
}

- (NSDictionary *)nativeModuleConfig {
    NSMutableArray<NSArray *> *config = [NSMutableArray new];
    for (HippyModuleData *moduleData in [self.moduleSetup moduleDataByID]) {
        NSArray *moduleDataConfig = [moduleData config];
        [config addObject:HippyNullIfNil(moduleDataConfig)];
    }
    return @{ kHippyRemoteModuleConfigKey : config };
}

- (NSArray *)configForModuleName:(NSString *)moduleName {
    HippyModuleData *moduleData = [self.moduleSetup moduleDataByName][moduleName];
    return moduleData.config;
}

- (HippyOCTurboModule *)turboModuleWithName:(NSString *)name {
    if (!self.enableTurbo || name.length <= 0) {
        return nil;
    }
    
    if (!self.turboModuleManager) {
        self.turboModuleManager = [[HippyTurboModuleManager alloc] initWithBridge:self];
    }
    return [self.turboModuleManager turboModuleWithName:name];
}

@end
