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


#include <unordered_map>
#import "HippyTurboModuleManager.h"
#import "HippyModuleData.h"
#import "HippyBridge+Private.h"
#import "HippyAssert.h"

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

@interface HippyTurboBindInfo : NSObject

@property (nonatomic, copy) NSString *moduleName;
@property (nonatomic, strong) JSManagedValue *managedJsObject;

@end

@implementation HippyTurboBindInfo

@end

@interface HippyTurboModuleManager () {
    dispatch_queue_t _cacheQueue;
    dispatch_queue_t _bindingQueue;
}

@property(nonatomic, weak, readwrite) HippyBridge *bridge;
@property(nonatomic, weak, readwrite) id<HippyTurboModuleDelegate> delegate;
@property(nonatomic, assign, readwrite) BOOL invalidating;

@property(nonatomic, strong, readwrite) NSMutableDictionary<NSString *, __kindof HippyOCTurboModule *> *turboModuleCache;
@property(nonatomic, strong, readwrite) NSMutableDictionary<NSNumber *, HippyTurboBindInfo *> *bindingInfos;
@property(nonatomic, assign, readwrite) NSInteger moduleStorageCount;

@end

@implementation HippyTurboModuleManager

- (void)dealloc {
    [_turboModuleCache removeAllObjects];
}

- (instancetype)initWithBridge:(HippyBridge *)bridge delegate:(id<HippyTurboModuleDelegate>) delegate {
    self = [self init];
    if (self) {
        _bridge = bridge;
        _delegate = delegate;
        _turboModuleCache = @{}.mutableCopy;
        _bindingInfos = @{}.mutableCopy;
        _cacheQueue = dispatch_queue_create("com.tencent.hippy.turboCache", DISPATCH_QUEUE_SERIAL);
        _bindingQueue = dispatch_queue_create("com.tencent.hippy.turboBinding", DISPATCH_QUEUE_SERIAL);
    }
    return self;
}

#pragma mark -

- (void)invalidate {
    // clear cache
    dispatch_sync(_cacheQueue, ^{
        [self.turboModuleCache removeAllObjects];
    });
}

#pragma mark -

+ (BOOL)isTurboModule:(NSString *)name {
    return !![HippyTurboModuleMap objectForKey:name];
}

- (__kindof HippyOCTurboModule *)turboModuleWithName:(NSString *)name {
    
    if (!name || name.length == 0) {
        return nil;
    }
    
    __kindof HippyOCTurboModule __block * module;
    dispatch_sync(_cacheQueue, ^{
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
    });
    return module;
}

- (void)bindJSObject:(JSValue *)jsObj toModuleName:(NSString *)moduleName {
    HippyTurboBindInfo *info = [[HippyTurboBindInfo alloc] init];
    info.moduleName = moduleName;
    info.managedJsObject = [[JSManagedValue alloc] initWithValue:jsObj];
    dispatch_sync(_bindingQueue, ^{
        [self.bindingInfos setObject:info forKey:@(self.moduleStorageCount++)];
    });
}

- (NSString *)turboModuleNameForJSObject:(JSValue *)jsObj {
    HippyTurboBindInfo __block * bindInfo = nil;
    dispatch_sync(_bindingQueue, ^{
        [self.bindingInfos enumerateKeysAndObjectsUsingBlock:^(NSNumber * _Nonnull key, HippyTurboBindInfo * _Nonnull obj, BOOL * _Nonnull stop) {
            if (obj.managedJsObject.value == jsObj) {
                bindInfo = obj;
                *stop = YES;
            }
        }];
    });
    if (bindInfo) {
        return bindInfo.moduleName;
    }
    return nil;
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
