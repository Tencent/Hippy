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

#import "HippyComponentMap.h"
#import "HippyLog.h"
#include "dom/root_node.h"

using RootNode = hippy::RootNode;

@interface HippyComponentMap () {
    NSMapTable<NSNumber *, id<HippyComponent>> *_rootComponentsMap;
    NSMutableDictionary<NSNumber *, id> *_componentsMap;
    std::unordered_map<int32_t, std::weak_ptr<RootNode>> _rootNodesMap;
    
    NSMutableDictionary<NSNumber *, NSNumber *> *_enableWeakComponentsTempCache;
    NSMutableDictionary<NSNumber *, NSMutableDictionary *> *_cacheDictionaryForWeakComponentsMap;
}

@end

@implementation HippyComponentMap

- (instancetype)initWithComponentsReferencedType:(HippyComponentReferenceType)type {
    self = [super init];
    if (self) {
        _isStrongHoldAllComponents = (HippyComponentReferenceTypeStrong == type);
        _rootComponentsMap = [NSMapTable strongToWeakObjectsMapTable];
        _componentsMap = [NSMutableDictionary dictionary];
        _rootNodesMap.reserve(8);
        _enableWeakComponentsTempCache = [NSMutableDictionary dictionary];
        _cacheDictionaryForWeakComponentsMap = [NSMutableDictionary dictionary];
    }
    return self;
}

- (BOOL)threadCheck {
    return _requireInMainThread ? [NSThread isMainThread] : YES;
}

- (void)addRootComponent:(id<HippyComponent>)component
                rootNode:(std::weak_ptr<hippy::RootNode>)rootNode
                  forTag:(NSNumber *)tag {
    NSAssert(component && tag, @"component &&tag must not be null in method %@", NSStringFromSelector(_cmd));
    NSAssert([self threadCheck], @"%@ method needs run in main thread", NSStringFromSelector(_cmd));
    if (component && tag && ![_componentsMap objectForKey:tag]) {
        id dic = nil;
        if (_isStrongHoldAllComponents) {
            dic = [NSMutableDictionary dictionary];
        } else {
            dic = [NSMapTable strongToWeakObjectsMapTable];
        }
        [dic setObject:component forKey:tag];
        [_componentsMap setObject:dic forKey:tag];
        [_rootComponentsMap setObject:component forKey:tag];
        _rootNodesMap[[tag intValue]] = rootNode;
    }
}

- (void)removeRootComponentWithTag:(NSNumber *)tag {
    NSAssert(tag, @"tag must not be null in method %@", NSStringFromSelector(_cmd));
    [_componentsMap removeObjectForKey:tag];
    [_rootComponentsMap removeObjectForKey:tag];
    _rootNodesMap.erase([tag intValue]);
}

- (BOOL)containRootComponentWithTag:(NSNumber *)tag {
    NSAssert(tag, @"tag must not be null in method %@", NSStringFromSelector(_cmd));
    NSAssert([self threadCheck], @"%@ method needs run in main thread", NSStringFromSelector(_cmd));
    id rootComponent = [self rootComponentForTag:tag];
    return nil != rootComponent;
}

- (NSArray<id<HippyComponent>> *)rootComponents {
    return [[_rootComponentsMap objectEnumerator] allObjects];
}

- (__kindof id<HippyComponent>)rootComponentForTag:(NSNumber *)tag {
    NSAssert(tag, @"tag must not be null in method %@", NSStringFromSelector(_cmd));
    NSAssert([self threadCheck], @"%@ method needs run in main thread", NSStringFromSelector(_cmd));
    return [_rootComponentsMap objectForKey:tag];
}

- (std::weak_ptr<hippy::RootNode>)rootNodeForTag:(NSNumber *)tag {
    return _rootNodesMap[[tag intValue]];
}

- (void)addComponent:(__kindof id<HippyComponent>)component forRootTag:(NSNumber *)tag {
    NSAssert(tag, @"component and tag must not be null in method %@", NSStringFromSelector(_cmd));
    NSAssert([component hippyTag], @"component's tag must not be null in %@", NSStringFromSelector(_cmd));
    NSAssert([self threadCheck], @"%@ method needs run in main thread", NSStringFromSelector(_cmd));
    if (component && tag) {
        id map = [_componentsMap objectForKey:tag];
        [map setObject:component forKey:[component hippyTag]];
        if (!_isStrongHoldAllComponents && _cacheDictionaryForWeakComponentsMap[tag]) {
            // see `generateTempCacheBeforeAcquireAllStoredWeakComponents`
            [_cacheDictionaryForWeakComponentsMap[tag] setObject:component forKey:[component hippyTag]];
        }
    }
}

- (void)removeComponent:(__kindof id<HippyComponent>)component forRootTag:(NSNumber *)tag {
    NSAssert(tag, @"component and tag must not be null in method %@", NSStringFromSelector(_cmd));
    NSAssert([component hippyTag], @"component's tag must not be null in %@", NSStringFromSelector(_cmd));
    NSAssert([self threadCheck], @"%@ method needs run in main thread", NSStringFromSelector(_cmd));
    if (component && tag) {
        id map = [_componentsMap objectForKey:tag];
        [map removeObjectForKey:[component hippyTag]];
        if (!_isStrongHoldAllComponents && _cacheDictionaryForWeakComponentsMap[tag]) {
            // see `generateTempCacheBeforeAcquireAllStoredWeakComponents`
            [_cacheDictionaryForWeakComponentsMap[tag] removeObjectForKey:[component hippyTag]];
        }
    }
}

- (NSDictionary<NSNumber * ,__kindof id<HippyComponent>> *)componentsForRootTag:(NSNumber *)tag {
    NSAssert(tag, @"tag must not be null in method %@", NSStringFromSelector(_cmd));
    NSAssert([self threadCheck], @"%@ method needs run in main thread", NSStringFromSelector(_cmd));
    if (tag) {
        id map = [_componentsMap objectForKey:tag];
        if (_isStrongHoldAllComponents) {
            return map;
        } else {
            // Note: Performance optimization:
            // Calling dictionaryRepresentation methods is time-consuming,
            // and in particular, outside may call this in the loop,
            // so we optimize this with a temporary cache.
            // Remember:
            // 1. The cache is automatically removed when a new component is inserted.
            // 2. The cache must exist only temporarily, otherwise it will affect the lifecycle of the component.
            if (_enableWeakComponentsTempCache[tag]) {
                if (!_cacheDictionaryForWeakComponentsMap[tag]) {
                    _cacheDictionaryForWeakComponentsMap[tag] = ((NSMapTable *)map).dictionaryRepresentation.mutableCopy;
                }
                return _cacheDictionaryForWeakComponentsMap[tag];
            } else {
                return ((NSMapTable *)map).dictionaryRepresentation;
            }
        }
    }
    return nil;
}

- (__kindof id<HippyComponent>)componentForTag:(NSNumber *)componentTag
                                     onRootTag:(NSNumber *)tag {
    NSAssert([self threadCheck], @"%@ method needs run in main thread", NSStringFromSelector(_cmd));
    if (componentTag && tag) {
        id map = [_componentsMap objectForKey:tag];
        return [map objectForKey:componentTag];
    } else {
        HippyLogWarn(@"componentTag && tag must not be null");
    }
    return nil;
}

- (NSString *)description {
    NSMutableString *description = [NSMutableString stringWithCapacity:256];
    [description appendFormat:@"<HippyComponentMap %p contains ", self];
    NSArray<id<HippyComponent>> *rootComponentsArray = [self rootComponents];
    [description appendFormat:@"%ld root component(s): ", [rootComponentsArray count]];
    long index = 1;
    for (id<HippyComponent> object in rootComponentsArray) {
        NSMutableString *objectDescription = [NSMutableString stringWithCapacity:64];
        NSNumber *componentTag = [object hippyTag];
        NSUInteger count = [[self componentsForRootTag:componentTag] count];
        [objectDescription appendFormat:@"%ld-<Root Component %p-%@ contains %ld subcomponents>;", index++, object, componentTag, count];
        [description appendString:objectDescription];
    }
    [description appendString:@">"];
    return [description copy];
}


#pragma mark -

- (void)generateTempCacheBeforeAcquireAllStoredWeakComponentsForRootTag:(NSNumber *)rootTag {
    NSAssert([self threadCheck], @"%@ method needs run in main thread", NSStringFromSelector(_cmd));
    _enableWeakComponentsTempCache[rootTag] = @YES;
}

- (void)clearTempCacheAfterAcquireAllStoredWeakComponentsForRootTag:(NSNumber *)rootTag {
    NSAssert([self threadCheck], @"%@ method needs run in main thread", NSStringFromSelector(_cmd));
    [_enableWeakComponentsTempCache removeObjectForKey:rootTag];
    static BOOL pendingClear = NO;
    if (pendingClear) {
        return;
    }
    pendingClear = YES;
    dispatch_async(dispatch_get_main_queue(), ^{
        [self->_cacheDictionaryForWeakComponentsMap removeObjectForKey:rootTag];
        pendingClear = NO;
    });
}

@end
