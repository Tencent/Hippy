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


#import "HippyTurboModuleManager.h"
#import "HippyJSExecutor+Internal.h"
#import "HippyModuleData.h"
#import "HippyAssert.h"

#include <unordered_map>

#include "driver/scope.h"
#include "objc/runtime.h"

static NSMutableDictionary<NSString *, Class> *HippyTurboModuleMap;

HIPPY_EXTERN void HippyRegisterTurboModule(NSString *, Class);
void HippyRegisterTurboModule(NSString *moduleName, Class moduleClass) {
    if (!moduleClass || !moduleName || moduleName.length == 0) {
        HippyAssert(NO, @"moduleName or moduleClass is nil or empty!");
        return;
    }
    
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        HippyTurboModuleMap = [NSMutableDictionary dictionary];
    });

    HippyAssert([moduleClass conformsToProtocol:@protocol(HippyTurboModule)],
                @"%@ does not conform to the HippyTurboModule protocol", moduleClass);

    if ([HippyTurboModuleMap objectForKey:moduleName]) {
        HippyAssert(NO, @"dumplicate regist the moduleName(%@) for %@ and %@",
                    moduleName,
                    NSStringFromClass(moduleClass),
                    NSStringFromClass([HippyTurboModuleMap objectForKey:moduleName]));
    }
    
    // Register module
    [HippyTurboModuleMap setObject:moduleClass forKey:moduleName];
}

@interface HippyTurboModuleManager () {
    std::unordered_map<std::string, std::shared_ptr<hippy::napi::CtxValue>> _objectMap;
}

@property(nonatomic, weak, readonly) HippyBridge *bridge;

@property(nonatomic, strong, readonly) NSMutableDictionary<NSString *, __kindof HippyOCTurboModule *> *turboModuleCache;

@end

@implementation HippyTurboModuleManager

- (void)dealloc {
    [_turboModuleCache removeAllObjects];
}

- (instancetype)initWithBridge:(HippyBridge *)bridge {
    self = [self init];
    if (self) {
        _bridge = bridge;
        _turboModuleCache = @{}.mutableCopy;
    }
    return self;
}

#pragma mark -

- (void)invalidate {
    // clear cache
    [self.turboModuleCache removeAllObjects];
}

#pragma mark -

+ (BOOL)isTurboModule:(NSString *)name {
    return !![HippyTurboModuleMap objectForKey:name];
}

- (__kindof HippyOCTurboModule *)turboModuleWithName:(NSString *)name {
    if (!name || name.length == 0) {
        return nil;
    }
    HippyOCTurboModule *module = nil;
    if ([self.turboModuleCache.allKeys containsObject:name]) {
        module = [self.turboModuleCache objectForKey:name];
    } else {
        Class moduleCls = [HippyTurboModuleMap objectForKey:name] ? : [HippyOCTurboModule class];
        if ([moduleCls conformsToProtocol:@protocol(HippyTurboModuleImpProtocol)]) {
            module = [[moduleCls alloc] initWithName:name bridge:_bridge];
            [self.turboModuleCache setObject:module forKey:name];
        } else {
            HippyAssert(NO, @"moduleClass of %@ is not conformsToProtocol(HippyTurboModuleImpProtocol)!", name);
        }
    }
    return module;
}

- (void)bindJSObject:(const std::shared_ptr<hippy::napi::CtxValue> &)object toModuleName:(NSString *)moduleName {
    std::string key([moduleName UTF8String]);
    _objectMap[key] = object;
}

- (NSString *)turboModuleNameForJSObject:(const std::shared_ptr<hippy::napi::CtxValue> &)object {
    NSString *name = nil;
    for (const auto &map : self->_objectMap) {
        bool isEqual = self.bridge.javaScriptExecutor.pScope->GetContext()->Equals(map.second, object);
        if (isEqual) {
            name = [NSString stringWithUTF8String:map.first.c_str()];
            break;
        }
    }
    return name;
}


@end


@implementation HippyBridge (HippyTurboModuleManager)

- (HippyTurboModuleManager *)turboModuleManager {
    return objc_getAssociatedObject(self, @selector(turboModuleManager));
}

- (void)setTurboModuleManager:(HippyTurboModuleManager *)turboModuleManager {
    objc_setAssociatedObject(self, @selector(turboModuleManager), turboModuleManager, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

@end
