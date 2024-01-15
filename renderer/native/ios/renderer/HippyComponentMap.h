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

#import "HippyComponent.h"

#include <memory>

namespace hippy {
inline namespace dom {
class RootNode;
}
}

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSUInteger, HippyComponentReferenceType) {
    HippyComponentReferenceTypeStrong,
    HippyComponentReferenceTypeWeak,
};

@interface HippyComponentMap : NSObject

/// Whether all recorded elements are strongly referenced,
///
/// Attention, Attention, Attention:
/// All UI views are weakly referenced!
/// All Shadowviews are strongly referenced!
@property (nonatomic, assign, readonly) BOOL isStrongHoldAllComponents;

/// Whether access is required from the main thread
@property(nonatomic, assign) BOOL requireInMainThread;

/// Init Method
- (instancetype)initWithComponentsReferencedType:(HippyComponentReferenceType)type;
- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;

#pragma mark - Root Component

- (void)addRootComponent:(id<HippyComponent>)component
                rootNode:(std::weak_ptr<hippy::RootNode>)rootNode
                  forTag:(NSNumber *)tag;

- (void)removeRootComponentWithTag:(NSNumber *)tag;

- (BOOL)containRootComponentWithTag:(NSNumber *)tag;

- (NSArray<id<HippyComponent>> *)rootComponents;

- (__kindof id<HippyComponent>)rootComponentForTag:(NSNumber *)tag;

- (std::weak_ptr<hippy::RootNode>)rootNodeForTag:(NSNumber *)tag;


#pragma mark -

/// Add a component to ComponentMap
- (void)addComponent:(__kindof id<HippyComponent>)component forRootTag:(NSNumber *)tag;

/// Remove one component from ComponentMap
- (void)removeComponent:(__kindof id<HippyComponent>)component forRootTag:(NSNumber *)tag;

- (NSDictionary<NSNumber *, __kindof id<HippyComponent>> *)componentsForRootTag:(NSNumber *)tag;

- (__kindof id<HippyComponent>)componentForTag:(NSNumber *)componentTag onRootTag:(NSNumber *)tag;


#pragma mark - Performance optimization

/// Generate a dictionary cache for all the weak components.
///
/// Calling componentsForRootTag methods is time-consuming,
/// and in particular, outside may call this in the loop,
/// so we optimize this with a temporary cache.
///
/// The cache must be actively cleared after acquiring components
/// - Parameter rootTag: Root component's tag
- (void)generateTempCacheBeforeAcquireAllStoredWeakComponentsForRootTag:(NSNumber *)rootTag;

/// Clear the temp dictionary cache for weak components.
/// - Parameter rootTag: Root component's tag
- (void)clearTempCacheAfterAcquireAllStoredWeakComponentsForRootTag:(NSNumber *)rootTag;

@end

NS_ASSUME_NONNULL_END
