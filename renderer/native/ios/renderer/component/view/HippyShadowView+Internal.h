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


#import "HippyShadowView.h"
#include "dom/layout_node.h"
#include "dom/render_manager.h"
#include <memory>
#include <string>


NS_ASSUME_NONNULL_BEGIN

namespace hippy {
inline namespace dom {
class DomManager;
class DomNode;
class RootNode;
struct LayoutResult;
enum class Direction;
}
}


@interface HippyShadowView () {
    __weak HippyShadowView *_superview;
    NSMutableArray<HippyShadowView *> *_objectSubviews;
    BOOL _recomputePadding;
    BOOL _recomputeMargin;
    BOOL _recomputeBorder;
    BOOL _didUpdateSubviews;
    
    std::vector<std::string> _eventNames;
}

#pragma mark - DomNode Related

/// The hippy::DomManager instance
@property (nonatomic, assign) std::weak_ptr<hippy::DomManager> domManager;

/// The corresponding hippy::DomNode
@property (nonatomic, assign) std::weak_ptr<hippy::DomNode> domNode;

/// The corresponding hippy::RootNode instance
@property (nonatomic, assign) std::weak_ptr<hippy::RootNode> rootNode;


#pragma mark - Event Related

/// Add event to HippyShadowView
/// @param name event name
///
/// @discussion In general, events are mounted directly on UIViews.
/// But for lazy-load UIViews, we have to record it temporarily, and mount to UIView when created.
- (void)addEventName:(const std::string &)name;

/// Get all events name
- (const std::vector<std::string> &)allEventNames;

/// Clear all event names
- (void)clearEventNames;


#pragma mark - Layout Related

/// The layout result
@property (nonatomic, assign) hippy::LayoutResult nodeLayoutResult;

/// The layout direction
@property (nonatomic, assign) hippy::Direction layoutDirection;

/// The final layout direction
@property (nonatomic, assign) hippy::Direction confirmedLayoutDirection;

/// Set layout direction to subviews.
/// - Parameter confirmedLayoutDirection: hippy::Direction
- (void)applyConfirmedLayoutDirectionToSubviews:(hippy::Direction)confirmedLayoutDirection;

/// Whether layout direction is RTL.
- (BOOL)isLayoutSubviewsRTL;

@end

NS_ASSUME_NONNULL_END
