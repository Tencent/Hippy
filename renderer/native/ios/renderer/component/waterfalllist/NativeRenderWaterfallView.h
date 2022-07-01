/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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

#import <UIKit/UIKit.h>
#import "NativeRenderView.h"
#import "NativeRenderScrollableProtocol.h"
#import "NativeRenderTouchesView.h"
#import "NativeRenderCollectionViewWaterfallLayout.h"
#import "NativeRenderScrollProtocol.h"

NS_ASSUME_NONNULL_BEGIN

@class NativeRenderWaterfallViewDataSource, NativeRenderHeaderRefresh, NativeRenderFooterRefresh;

typedef NS_ENUM(NSInteger, NativeRenderScrollState) {
    ScrollStateStop,
    ScrollStateDraging,
    ScrollStateScrolling
};

/**
 * NativeRenderWaterfallView is a waterfall component, internal implementation is UICollectionView
 */
@interface NativeRenderWaterfallView : NativeRenderTouchesView <UICollectionViewDataSource, UICollectionViewDelegate,
                                        NativeRenderCollectionViewDelegateWaterfallLayout, NativeRenderScrollableProtocol, NativeRenderScrollProtocol> {
    NativeRenderWaterfallViewDataSource *_dataSource;
@protected
    NSMapTable<NSNumber *, UIView *> *_weakItemMap;
    NSMutableDictionary<NSIndexPath *, NSNumber *> *_cachedItems;
    double _lastOnScrollEventTimeInterval;
    NativeRenderHeaderRefresh *_headerRefreshView;
    NativeRenderFooterRefresh *_footerRefreshView;
}

/**
 * Content inset for NativeRenderWaterfallView
 */
@property(nonatomic, assign) UIEdgeInsets contentInset;

/**
 * Number of columns for NativeRenderWaterfallView
 */
@property(nonatomic, assign) NSInteger numberOfColumns;

/**
 * Column spacing for NativeRenderWaterfallView
 */
@property(nonatomic, assign) CGFloat columnSpacing;

/**
 * Item spacing for NativeRenderWaterfallView
 */
@property(nonatomic, assign) CGFloat interItemSpacing;

/**
 * Indicate index from last to load more data
 */
@property(nonatomic, assign) NSInteger preloadItemNumber;

/**
 * Set background color
 */
@property(nonatomic, strong) UIColor *backgroundColor;

/**
 * Indicate interval between onScroll event report
 */
@property(nonatomic, assign) double scrollEventThrottle;

/**
 * Indicate internal collectionview
 */
@property(nonatomic, strong) __kindof UICollectionView *collectionView;

/**
 * Get data source for NativeRenderWaterfallView
 */
@property(nonatomic, readonly)NativeRenderWaterfallViewDataSource *dataSource;

/**
 * Indicate whether components is scrolling manully
 */
@property(nonatomic, assign) BOOL manualScroll;

/**
 * NativeRender Events
 */
@property (nonatomic, copy) NativeRenderDirectEventBlock onScroll;
@property (nonatomic, copy) NativeRenderDirectEventBlock onInitialListReady;
@property (nonatomic, copy) NativeRenderDirectEventBlock onEndReached;
@property (nonatomic, copy) NativeRenderDirectEventBlock onFooterAppeared;
@property (nonatomic, copy) NativeRenderDirectEventBlock onRefresh;
@property (nonatomic, copy) NativeRenderDirectEventBlock onExposureReport;

- (NSUInteger)maxCachedItemCount;

- (NSArray<NSIndexPath *> *)findFurthestIndexPathsFromScreen;

/**
 * Initial collection view
 */
- (void)initCollectionView;

/**
 * Indicate class for item
 *
 * @return Class for item
 */
- (Class)listItemClass;

/**
 * Indicate component name for item
 *
 * @return name for item
 *
 * @discuss Name exported to frontend, not class name
 */
- (NSString *)compoentItemName;

/**
 * Indicate layout instance for NativeRenderWatefallView
 */
- (__kindof UICollectionViewLayout *)collectionViewLayout;

/**
 * Called when NativeRenderWaterfallView register its cell class
 * Override it if custom cell is needed
 */
- (void)registerCells;

/**
 * Called when NativeRenderWaterfallView register its supplementary views
 * Override it if custome supplementary view is needed
 */
- (void)registerSupplementaryViews;

/**
 * Reload data
 */
- (void)reloadData;

/**
 * Reserved, not implemented
 */
- (void)refreshCompleted:(NSInteger)status text:(NSString *)text;

/**
 * Invoke onExposureReport event immediately
 */
- (void)callExposureReport;

/**
 * Reserved, not implemented
 */
- (void)startRefreshFromJSWithType:(NSUInteger)type;

/**
 * Reserved, not implemented
 */
- (void)startRefreshFromJS;

/**
 * Invoke onEndReached event immmediately
 */
- (void)startLoadMore;

/**
 * Scroll to specific item at index
 *
 * @param index Index of item
 * @param animated Indicate whether to show animation effects
 */
- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated;

/**
 * Size for item at index path
 *
 * @param collectionView Internal collection view for NativeRenderCollectionView
 * @param collectionViewLayout Layout configuration for NativeRenderCollectionView
 * @param indexPath Index path of item
 *
 * @return Size for item at index path
 */
- (CGSize)collectionView:(UICollectionView *)collectionView
                  layout:(UICollectionViewLayout *)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath;

/**
 * Column count for section
 *
 * @param collectionView Internal collection view for NativeRenderCollectionView
 * @param collectionViewLayout Layout configuration for NativeRenderCollectionView
 * @param section index of section to get column count
 *
 * @return Column count for section
 */
- (NSInteger)collectionView:(UICollectionView *)collectionView
                     layout:(UICollectionViewLayout *)collectionViewLayout columnCountForSection:(NSInteger)section;

/**
 * Edge insets for section
 *
 * @param collectionView Internal collection view for NativeRenderCollectionView
 * @param collectionViewLayout Layout configuration for NativeRenderCollectionView
 * @param section index of section to get edge insets
 *
 * @return Edge insets for section
 */
- (UIEdgeInsets)collectionView:(UICollectionView *)collectionView
                        layout:(UICollectionViewLayout *)collectionViewLayout insetForSectionAtIndex:(NSInteger)section;

@end

NS_ASSUME_NONNULL_END
