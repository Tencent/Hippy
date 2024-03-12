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

#import <UIKit/UIKit.h>

#import "HippyCollectionViewWaterfallLayout.h"
#import "HippyComponent.h"
#import "HippyScrollableProtocol.h"
#import "HippyScrollProtocol.h"
#import "NativeRenderTouchesView.h"
#import "HippyNextListTableView.h"

NS_ASSUME_NONNULL_BEGIN

@class HippyWaterfallViewDataSource, HippyHeaderRefresh, HippyFooterRefresh, WaterfallItemChangeContext, HippyShadowView;

typedef NS_ENUM(NSInteger, NativeRenderScrollState) {
    ScrollStateStop,
    ScrollStateDraging,
    ScrollStateScrolling
};

/**
 * HippyWaterfallView is a waterfall component, internal implementation is UICollectionView
 */
@interface HippyWaterfallView : NativeRenderTouchesView <UICollectionViewDataSource, UICollectionViewDelegate,
                                        HippyCollectionViewDelegateWaterfallLayout, HippyScrollableProtocol,
                                        HippyNextListTableViewLayoutProtocol, HippyScrollProtocol> {
@protected
    HippyWaterfallViewDataSource *_dataSource;
    
    NSMapTable<NSNumber *, UIView *> *_cachedWeakCellViews;

    HippyHeaderRefresh *_headerRefreshView;
    HippyFooterRefresh *_footerRefreshView;
    
    BOOL _allowNextScrollNoMatterWhat;
}

/**
 * Content inset for HippyWaterfallView
 */
@property(nonatomic, assign) UIEdgeInsets contentInset;

/**
 * Number of columns for HippyWaterfallView
 */
@property(nonatomic, assign) NSInteger numberOfColumns;

/**
 * Column spacing for HippyWaterfallView
 */
@property(nonatomic, assign) CGFloat columnSpacing;

/**
 * Item spacing for HippyWaterfallView
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
@property(nonatomic, strong) HippyNextListTableView *collectionView;

/**
 * Get data source for HippyWaterfallView
 */
@property(nonatomic, readonly)HippyWaterfallViewDataSource *dataSource;

/**
 * Indicate whether components is scrolling manully
 */
@property(nonatomic, assign) BOOL manualScroll;

/**
 * Hippy Events
 */
@property (nonatomic, copy) HippyDirectEventBlock onScroll;
@property (nonatomic, copy) HippyDirectEventBlock onInitialListReady;
@property (nonatomic, copy) HippyDirectEventBlock onEndReached;
@property (nonatomic, copy) HippyDirectEventBlock onFooterAppeared;
@property (nonatomic, copy) HippyDirectEventBlock onRefresh;
@property (nonatomic, copy) HippyDirectEventBlock onExposureReport;

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
 * Called when HippyWaterfallView register its cell class
 * Override it if custom cell is needed
 */
- (void)registerCells;

/**
 * Called when HippyWaterfallView register its supplementary views
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
