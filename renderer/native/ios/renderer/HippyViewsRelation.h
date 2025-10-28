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
#include <vector>

NS_ASSUME_NONNULL_BEGIN

/// Helper class for managing view hierarchy relationships during batch view creation.
/// Provides enumeration with subviews sorted by insertion indices.
///
/// @note This is an internal class and should not be exposed in public headers.
@interface HippyViewsRelation : NSObject

/// Adds a view tag to its superview at the specified index.
/// Only negative superview tags are rejected. Tags of 0 and negative indices are allowed.
- (void)addViewTag:(int32_t)viewTag forSuperViewTag:(int32_t)superviewTag atIndex:(int32_t)index;

/// Enumerates all view hierarchies with subviews sorted by their indices in ascending order.
/// The internal storage is not modified; sorting is performed on temporary copies.
- (void)enumerateViewsHierarchy:(void (^)(int32_t, const std::vector<int32_t> &, const std::vector<int32_t> &))block;

/// Returns YES if no relationships are stored.
- (BOOL)isEmpty;

/// Removes all stored relationships.
- (void)removeAllObjects;

@end

NS_ASSUME_NONNULL_END

