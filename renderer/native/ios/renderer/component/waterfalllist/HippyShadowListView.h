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
#import "HippyShadowWaterfallItem.h"

NS_ASSUME_NONNULL_BEGIN

@interface WaterfallItemChangeContext : NSObject<NSCopying>

- (NSHashTable<__kindof HippyShadowView *> *)addedItems;
- (NSHashTable<__kindof HippyShadowView *> *)frameChangedItems;
- (NSSet<__kindof HippyShadowView *> *)deletedItems;
- (NSHashTable<__kindof HippyShadowView *> *)movedItems;

/// Clear all items recorded.
- (void)clear;

/// Whether has changed item.
- (BOOL)hasChanges;

/// Get all chaned items.
- (NSSet<HippyShadowView *> *)allChangedItems;

@end

@interface HippyShadowListView : HippyShadowView <HippyShadowWaterfallItemFrameChangedProtocol>

///// Whether current ShadowList is dirty.
//@property (nonatomic, assign) BOOL isDirty;

@property(nonatomic, readonly, strong)WaterfallItemChangeContext *itemChangeContext;

@end

NS_ASSUME_NONNULL_END
