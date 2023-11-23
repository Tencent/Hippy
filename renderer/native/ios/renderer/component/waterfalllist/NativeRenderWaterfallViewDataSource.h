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
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@class HippyShadowView, WaterfallItemChangeContext;

@interface NativeRenderWaterfallViewDataSource : NSObject<NSCopying>

- (instancetype)initWithDataSource:(NSArray<__kindof HippyShadowView *> *)dataSource
                      itemViewName:(NSString *)itemViewName
                 containBannerView:(BOOL)containBannerView;

@property(nonatomic, readonly) BOOL containBannerView;
@property(nonatomic, readonly) HippyShadowView *bannerView;
@property(nonatomic, copy) NSArray<NSArray<HippyShadowView *> *> *cellRenderObjectViews;
@property(nonatomic, copy) NSString *itemViewName;

- (void)setDataSource:(NSArray<__kindof HippyShadowView *> *)dataSource containBannerView:(BOOL)containBannerView;
- (HippyShadowView *)cellForIndexPath:(NSIndexPath *)indexPath;
- (HippyShadowView *)headerForSection:(NSInteger)section;
- (NSInteger)numberOfSection;
- (NSInteger)numberOfCellForSection:(NSInteger)section;
- (NSIndexPath *)indexPathOfCell:(HippyShadowView *)cell;
- (NSIndexPath *)indexPathForFlatIndex:(NSInteger)index;
- (NSInteger)flatIndexForIndexPath:(NSIndexPath *)indexPath;

- (void)applyDiff:(NativeRenderWaterfallViewDataSource *)another
    changedConext:(WaterfallItemChangeContext *)context
 forWaterfallView:(UICollectionView *)view
       completion:(void(^)(BOOL success))completion;

@end

NS_ASSUME_NONNULL_END
