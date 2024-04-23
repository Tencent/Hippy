/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.
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

#import <Foundation/Foundation.h>
#import "HippyBridge.h"
#import "HippyOCTurboModule.h"
#import <memory>

namespace hippy {
inline namespace driver {
inline namespace napi {
class CtxValue;
}
};
};

/**
 * The HippyTurboModuleManager is the module responsible for manager the tuoboModules.
 */
@interface HippyTurboModuleManager : NSObject

- (instancetype)initWithBridge:(HippyBridge *)bridge;

- (HippyOCTurboModule *)turboModuleWithName:(NSString *)name;

+ (BOOL)isTurboModule:(NSString *)name;

- (void)bindJSObject:(const std::shared_ptr<hippy::napi::CtxValue> &)object toModuleName:(NSString *)moduleName;
- (NSString *)turboModuleNameForJSObject:(const std::shared_ptr<hippy::napi::CtxValue> &)object;

@end

/**
 * This category makes the current HippyTurboModuleManager instance available via the
 * HippyBridge, which is useful for *** or *** that
 * need to access the HippyTurboModuleManager.
 */
@interface HippyBridge (HippyTurboModuleManager)

@property (nonatomic, readwrite) HippyTurboModuleManager *turboModuleManager;

@end
