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

#import <Foundation/Foundation.h>

#import "HippyBridgeModule.h"
#import "MacroDefines.h"
#import "HippyInvalidating.h"

NS_ASSUME_NONNULL_BEGIN

HP_EXTERN NSArray<Class> *HippyGetModuleClasses(void);

#if HP_DEBUG
HP_EXTERN void HippyVerifyAllModulesExported(NSArray *extraModules);
#endif

/**
 * This block can be used to instantiate modules that require additional
 * init parameters, or additional configuration prior to being used.
 * The bridge will call this block to instatiate the modules, and will
 * be responsible for invalidating/releasing them when the bridge is destroyed.
 * For this reason, the block should always return new module instances, and
 * module instances should not be shared between bridges.
 */
typedef NSArray<id<HippyBridgeModule>> *_Nullable(^HippyBridgeModuleProviderBlock)(void);

@class HippyBridge, HippyModuleData, HippyModuleData;

@interface HippyModulesSetup : NSObject<HippyInvalidating>

@property(nonatomic, copy, readonly) HippyBridgeModuleProviderBlock moduleProvider;

@property(nonatomic, copy, readonly) NSArray<Class> *moduleClasses;

@property(readonly, assign) BOOL moduleSetupComplete;

- (instancetype)initWithBridge:(HippyBridge *)bridge extraProviderModulesBlock:(HippyBridgeModuleProviderBlock)moduleProvider;

- (void)setupModulesCompletion:(dispatch_block_t)completion;

- (NSDictionary<NSString *, HippyModuleData *> *)moduleDataByName;

- (NSArray<HippyModuleData *> *)moduleDataByID;

- (id)moduleForName:(NSString *)moduleName;

- (id)moduleForClass:(Class)cls;

- (BOOL)moduleIsInitialized:(Class)moduleClass;

- (void)invalidate;

@end

NS_ASSUME_NONNULL_END
