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

#import "HippyViewsRelation.h"
#include <unordered_map>
#include <algorithm>
#include <tuple>

/// Maps superview tag -> (subview tags, subview indices)
using HPViewBinding = std::unordered_map<int32_t, std::tuple<std::vector<int32_t>, std::vector<int32_t>>>;

@implementation HippyViewsRelation {
    HPViewBinding _viewRelation;
}

/// Sorts parallel vectors by indices in ascending order while maintaining tag-to-index correspondence.
/// Includes fast paths for already-sorted data and edge cases.
static inline void HP_SortByIndexAscending(const std::vector<int32_t> &inTags,
                                           const std::vector<int32_t> &inIndices,
                                           std::vector<int32_t> &outTags,
                                           std::vector<int32_t> &outIndices) {
    if (inTags.size() != inIndices.size() || inTags.empty()) {
        outTags = inTags;
        outIndices = inIndices;
        return;
    }
    
    if (std::is_sorted(inIndices.begin(), inIndices.end())) {
        outTags = inTags;
        outIndices = inIndices;
        return;
    }
    
    // Build and sort index permutation
    std::vector<size_t> order;
    order.reserve(inIndices.size());
    for (size_t i = 0; i < inIndices.size(); ++i) {
        order.push_back(i);
    }
    std::sort(order.begin(), order.end(), [&](size_t a, size_t b) {
        return inIndices[a] < inIndices[b];
    });
    
    // Apply permutation
    outTags.clear();
    outIndices.clear();
    outTags.reserve(inTags.size());
    outIndices.reserve(inIndices.size());
    for (size_t idx : order) {
        outTags.push_back(inTags[idx]);
        outIndices.push_back(inIndices[idx]);
    }
}

- (void)addViewTag:(int32_t)viewTag forSuperViewTag:(int32_t)superviewTag atIndex:(int32_t)index {
    // Only reject negative superview tags, as they have no valid use case
    if (superviewTag < 0) {
        return;
    }
    
    auto &viewTuple = _viewRelation[superviewTag];
    auto &subviewTags = std::get<0>(viewTuple);
    auto &subviewIndices = std::get<1>(viewTuple);
    subviewTags.push_back(viewTag);
    subviewIndices.push_back(index);
}

- (void)enumerateViewsHierarchy:(void (^)(int32_t, const std::vector<int32_t> &, const std::vector<int32_t> &))block {
    if (!block) { return; }
    
    for (const auto &element : _viewRelation) {
        int32_t tag = element.first;
        const auto &subviewTuple = element.second;
        const auto &subviewTags = std::get<0>(subviewTuple);
        const auto &subviewIndices = std::get<1>(subviewTuple);
        
        // Sort by index to ensure correct insertion order
        std::vector<int32_t> sortedTags;
        std::vector<int32_t> sortedIndices;
        HP_SortByIndexAscending(subviewTags, subviewIndices, sortedTags, sortedIndices);
        
        block(tag, sortedTags, sortedIndices);
    }
}

- (BOOL)isEmpty {
    return _viewRelation.empty();
}

- (void)removeAllObjects {
    _viewRelation.clear();
}

@end

