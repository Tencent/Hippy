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

@class HippyShadowView;

/// The DataSource of Waterfall and ListView component
@interface HippyWaterfallViewDataSource : NSObject<NSCopying> {
@protected
    NSArray<NSArray<HippyShadowView *> *> *_shadowCellViews;
    
}

/// Init Method.
/// - Parameters:
///   - dataSource: shadowView array
///   - itemViewName: view name
///   - containBannerView: bool value
- (instancetype)initWithDataSource:(nullable NSArray<__kindof HippyShadowView *> *)dataSource
                      itemViewName:(NSString *)itemViewName
                 containBannerView:(BOOL)containBannerView NS_DESIGNATED_INITIALIZER;

/// Use initWithDataSource instead
+ (instancetype)new NS_UNAVAILABLE;
/// Use initWithDataSource instead
- (instancetype)init NS_UNAVAILABLE;

/// Whether contain bannerView, currently used by the waterfall component.
@property(nonatomic, readonly) BOOL containBannerView;
/// The BannerView, currently waterfall component has.
@property(nonatomic, readonly) HippyShadowView *bannerView;
/// The shadowViews of Cells
@property(nonatomic, readonly) NSArray<NSArray<HippyShadowView *> *> *shadowCellViews;
/// The view name of cell item
@property(nonatomic, readonly) NSString *itemViewName;

/// Update datasource
/// - Parameters:
///   - dataSource: shadowView array
///   - containBannerView: BOOL
- (void)setDataSource:(NSArray<__kindof HippyShadowView *> *)dataSource
    containBannerView:(BOOL)containBannerView;

- (HippyShadowView *)cellForIndexPath:(NSIndexPath *)indexPath;
- (HippyShadowView *)headerForSection:(NSInteger)section;
- (NSInteger)numberOfSection;
- (NSInteger)numberOfCellForSection:(NSInteger)section;
- (NSIndexPath *)indexPathOfCell:(HippyShadowView *)cell;
- (NSIndexPath *)indexPathForFlatIndex:(NSInteger)index;
- (NSInteger)flatIndexForIndexPath:(NSIndexPath *)indexPath;


@end

NS_ASSUME_NONNULL_END
