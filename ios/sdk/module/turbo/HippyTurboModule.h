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

#ifndef HippyTurboModule_h
#define HippyTurboModule_h

#import "HippyBridgeModule.h"

@class HippyBridge;

@protocol HippyTurboModuleImpProtocol <NSObject>

- (instancetype)initWithName:(NSString *)name bridge:(HippyBridge *)bridge;

@end

@protocol HippyTurboModule <NSObject>

// Implemented by HIPPY_EXPORT_TURBO_MODULE
+ (NSString *)turoboModuleName;

#define HIPPY_EXPORT_TURBO_MODULE(js_name)                          \
    HIPPY_EXTERN void HippyRegisterTurboModule(NSString *, Class);  \
    +(NSString *)turoboModuleName {                                 \
        return @ #js_name;                                          \
    }                                                               \
    +(void)load {                                                   \
        HippyRegisterTurboModule(@ #js_name, self);                 \
    }

#define HIPPY_EXPORT_TURBO_METHOD(method) HIPPY_REMAP_TURBO_METHOD(, method)

#define HIPPY_REMAP_TURBO_METHOD(js_name, method)   \
    HIPPY_EXTERN_REMAP_TURBO_METHOD(, method)       \
    -(id)method

#define HIPPY_EXTERN_REMAP_TURBO_METHOD(js_name, method)                                                \
    +(NSArray<NSString *> *)Hippy_CONCAT(__hippy_export_turbo__,                                        \
                                         Hippy_CONCAT(js_name, Hippy_CONCAT(__LINE__, __COUNTER__))) {  \
        return @[@ #js_name, @ #method];                                                                \
    }

@end

#endif /* HippyTurboModule_h */
