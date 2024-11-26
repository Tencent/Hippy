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

NS_ASSUME_NONNULL_BEGIN

/// Module Management Category of HippyBridge
@interface HippyBridge (ModuleManage)

/// Get all native module info.
- (NSDictionary *)nativeModuleConfig;

/// Get config info for given module name.
/// - Parameter moduleName: name of module
- (NSArray *)configForModuleName:(NSString *)moduleName;

/// Whether is module setup complete.
- (BOOL)isModuleSetupComplete;

/// Retrieve a bridge module instance by name. Note that modules are lazily instantiated,
/// so calling these methods for the first time with a given
/// module name/class may cause the class to be sychronously instantiated,
/// potentially blocking both the calling thread and main thread for a short time.
/// - Parameter moduleName: name of module
- (nullable id)moduleForName:(NSString *)moduleName;

/// Retrieve a bridge module instance by class.
/// see `moduleForName` for more.
/// - Parameter moduleClass: class of module
- (nullable id)moduleForClass:(Class)moduleClass;

/// Get ModuleData by name.
/// - Parameter moduleName: JS name of module
- (nullable HippyModuleData *)moduleDataForName:(NSString *)moduleName;

/**
 * Convenience method for retrieving all modules conforming to a given protocol.
 * Modules will be sychronously instantiated if they haven't already been,
 * potentially blocking both the calling thread and main thread for a short time.
 */
- (NSArray *)modulesConformingToProtocol:(Protocol *)protocol;

/**
 * Test if a module has been initialized. Use this prior to calling
 * `moduleForClass:` or `moduleForName:` if you do not want to cause the module
 * to be instantiated if it hasn't been already.
 */
- (BOOL)moduleIsInitialized:(Class)moduleClass;

/// Get turbo module by name.
/// - Parameter name: name of turbo module
- (id)turboModuleWithName:(NSString *)name;


@end

NS_ASSUME_NONNULL_END
