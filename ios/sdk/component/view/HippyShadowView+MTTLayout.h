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

#ifndef HippyShadowView_MTTLayout_h
#define HippyShadowView_MTTLayout_h
#ifdef __cplusplus

#import "HippyShadowView.h"
#include "MTTNode.h"
#include "MTTFlex.h"
#include "MTTLayout.h"

@interface HippyShadowView ()

/// ref to MTTNode
@property (nonatomic, assign, readonly) MTTNodeRef nodeRef;


/// Apply the CSS layout.
/// This method also calls `applyLayoutToChildren:` internally.
/// The functionality is split into two methods,
/// so subclasses can override `applyLayoutToChildren:`
/// while using default implementation of `applyLayoutNode:`.
- (void)applyLayoutNode:(MTTNodeRef)node
      viewsWithNewFrame:(NSMutableSet<HippyShadowView *> *)viewsWithNewFrame
       absolutePosition:(CGPoint)absolutePosition NS_REQUIRES_SUPER;


/// Enumerate the child nodes and tell them to apply layout.
- (void)applyLayoutToChildren:(MTTNodeRef)node
            viewsWithNewFrame:(NSMutableSet<HippyShadowView *> *)viewsWithNewFrame
             absolutePosition:(CGPoint)absolutePosition;

@end


#endif /* __cplusplus */
#endif /* HippyShadowView_MTTLayout_h */
