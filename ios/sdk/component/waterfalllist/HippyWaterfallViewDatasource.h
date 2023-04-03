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

NS_ASSUME_NONNULL_BEGIN

@class HippyVirtualCell, HippyVirtualNode, UICollectionView;

@interface HippyWaterfallViewDatasource : NSObject

- (instancetype)initWithCellNodes:(NSArray<HippyVirtualCell *> *)cellNodes bannerNode:(HippyVirtualNode *)bannerNode;

- (HippyVirtualNode *)bannerViewNode;

- (NSArray<HippyVirtualCell *> *)itemNodes;

- (NSUInteger)numberOfSections;

- (NSUInteger)numberOfItemInSection:(NSUInteger)section;

- (__kindof HippyVirtualNode *)cellAtIndexPath:(NSIndexPath *)indexPath;

@end

@interface HippyWaterfallViewDatasource (ApplyDiff)

- (void)applyDiff:(HippyWaterfallViewDatasource *)another forWaterfallView:(UICollectionView *)view;

@end

NS_ASSUME_NONNULL_END
