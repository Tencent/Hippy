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

#import "HippyAssert.h"
#import "HippyNextBaseListView.h"
#import "HippyNextBaseListViewCell.h"
#import "HippyNextBaseListViewDataSource.h"
#import "HippyNextCollectionViewFlowLayout.h"
#import "HippyFooterRefresh.h"
#import "HippyHeaderRefresh.h"
#import "HippyUIManager.h"
#import "HippyShadowView.h"
#import "UIView+DirectionalLayout.h"
#import "UIView+Hippy.h"
#import "UIView+Render.h"
#import "HippyShadowListView.h"

static NSString *const kCellIdentifier = @"HippyListCellIdentifier";
static NSString *const kSupplementaryIdentifier = @"HippySupplementaryIdentifier";
static NSString *const kListViewItem = @"ListViewItem";

@interface HippyNextBaseListView () <HippyRefreshDelegate> {
    BOOL _isInitialListReady;
    NSArray<UICollectionViewCell *> *_previousVisibleCells;
}

@end

@implementation HippyNextBaseListView

#pragma mark - Life Cycle

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        _isInitialListReady = NO;
        self.preloadItemNumber = 1;
    }
    return self;
}

- (void)dealloc {
    [_headerRefreshView unsetFromScrollView];
    [_footerRefreshView unsetFromScrollView];
}

#pragma mark - Setter & Getter

- (NSString *)compoentItemName {
    return kListViewItem;
}

- (Class)listItemClass {
    return [HippyNextBaseListViewCell class];
}

- (__kindof UICollectionViewLayout *)collectionViewLayout {
    BOOL layoutDirectionRTL = [self isLayoutSubviewsRTL];
    [[HippyCollectionViewFlowLayoutRTLStack sharedInstance] pushRTLConfig:layoutDirectionRTL];
    HippyNextCollectionViewFlowLayout *layout = [[HippyNextCollectionViewFlowLayout alloc] init];
    layout.minimumLineSpacing = .0f;
    layout.minimumInteritemSpacing = .0f;
    layout.sectionHeadersPinToVisibleBounds = YES;
    layout.scrollDirection = _horizontal ? UICollectionViewScrollDirectionHorizontal : UICollectionViewScrollDirectionVertical;
    return layout;
}

- (void)applyLayoutDirectionFromParent:(hippy::Direction)direction {
    [super applyLayoutDirectionFromParent:direction];
    [self.collectionView removeFromSuperview];
    [self initCollectionView];
}

- (void)registerCells {
    Class cls = [self listItemClass];
    HippyAssert([cls isSubclassOfClass:[HippyNextBaseListViewCell class]],
                @"list item class must be subclass of NativeRenderBaseListViewCell");
    [self.collectionView registerClass:cls forCellWithReuseIdentifier:kCellIdentifier];
}

- (void)registerSupplementaryViews {
    [self.collectionView registerClass:[UICollectionReusableView class]
            forSupplementaryViewOfKind:UICollectionElementKindSectionHeader
                   withReuseIdentifier:kSupplementaryIdentifier];
}

- (void)setInitialListReady:(HippyDirectEventBlock)initialListReady {
    _initialListReady = initialListReady;
    _isInitialListReady = NO;
}

- (void)setBounces:(BOOL)bounces {
    [self.collectionView setBounces:bounces];
}

- (BOOL)bounces {
    return [self.collectionView bounces];
}

- (void)setShowScrollIndicator:(BOOL)show {
    if (self.horizontal) {
        [self.collectionView setShowsHorizontalScrollIndicator:show];
    } else {
        [self.collectionView setShowsVerticalScrollIndicator:show];
    }
}

- (BOOL)showScrollIndicator {
    if (self.horizontal) {
        return [self.collectionView showsHorizontalScrollIndicator];
    } else {
        return [self.collectionView showsVerticalScrollIndicator];
    }
}

- (void)setScrollEnabled:(BOOL)value {
    [self.collectionView setScrollEnabled:value];
}


#pragma mark - Data Load

// BaseListview's super is WaterfallView
// here we use super's hippyBridgeDidFinishTransaction imp to trigger reload,
// and override reloadData to handle special logic
- (void)reloadData {
    NSArray<HippyShadowView *> *datasource = [self.hippyShadowView.subcomponents copy];
    self->_dataSource = [[HippyNextBaseListViewDataSource alloc] initWithDataSource:datasource
                                                                       itemViewName:[self compoentItemName]
                                                                  containBannerView:NO];
    [self.collectionView reloadData];
    
    if (self.initialContentOffset) {
        CGFloat initialContentOffset = self.initialContentOffset;
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.collectionView setContentOffset:CGPointMake(0, initialContentOffset) animated:NO];
        });
        self.initialContentOffset = 0;
    }
    if (!_isInitialListReady) {
        _isInitialListReady = YES;
        if (self.initialListReady) {
            self.initialListReady(@{});
        }
    }
}

- (void)insertHippySubview:(UIView *)subview atIndex:(NSUInteger)atIndex {
    if ([subview isKindOfClass:[HippyHeaderRefresh class]]) {
        if (_headerRefreshView) {
            [_headerRefreshView unsetFromScrollView];
        }
        _headerRefreshView = (HippyHeaderRefresh *)subview;
        [_headerRefreshView setScrollView:self.collectionView];
        _headerRefreshView.delegate = self;
    } else if ([subview isKindOfClass:[HippyFooterRefresh class]]) {
        if (_footerRefreshView) {
            [_footerRefreshView unsetFromScrollView];
        }
        _footerRefreshView = (HippyFooterRefresh *)subview;
        [_footerRefreshView setScrollView:self.collectionView];
        _footerRefreshView.delegate = self;
    }
}

#pragma mark - Delegate & Datasource

- (BOOL)collectionView:(UICollectionView *)collectionView canEditItemAtIndexPath:(NSIndexPath *)indexPath {
    return self.editable;
}

- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    NSInteger count = [self.dataSource numberOfSection];
    return count;
}

- (CGFloat)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout
 heightForHeaderInSection:(NSInteger)section {
    HippyShadowView *header = [self.dataSource headerForSection:section];
    if (header) {
        return CGRectGetHeight(header.frame);
    } else {
        return 0.00001;
    }
}

- (CGSize)collectionView:(UICollectionView *)collectionView
                  layout:(UICollectionViewLayout*)collectionViewLayout
referenceSizeForHeaderInSection:(NSInteger)section {
    HippyShadowView *headerObjectView = [self.dataSource headerForSection:section];
    if ([headerObjectView isKindOfClass:[HippyShadowView class]]) {
        return headerObjectView.frame.size;
    }
    return CGSizeZero;
}

- (UICollectionReusableView *)collectionView:(UICollectionView *)collectionView
           viewForSupplementaryElementOfKind:(NSString *)kind
                                 atIndexPath:(NSIndexPath *)indexPath {
    NSInteger section = [indexPath section];
    UICollectionReusableView *view = [collectionView dequeueReusableSupplementaryViewOfKind:kind
                                                                        withReuseIdentifier:kSupplementaryIdentifier
                                                                               forIndexPath:indexPath];
    HippyShadowView *headerRenderObject = [self.dataSource headerForSection:section];
    if (headerRenderObject && [headerRenderObject isKindOfClass:[HippyShadowView class]]) {
        UIView *headerView = [self.uiManager createViewForShadowListItem:headerRenderObject];
        CGRect frame = headerView.frame;
        frame.origin = CGPointZero;
        headerView.frame = frame;
        
        [view addSubview:headerView];
    }
    return view;
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    NSInteger numberOfItemsInSection = [self.dataSource numberOfCellForSection:section];
    return numberOfItemsInSection;
}

- (void)collectionView:(UICollectionView *)collectionView
       willDisplayCell:(UICollectionViewCell *)cell forItemAtIndexPath:(NSIndexPath *)indexPath {
    NSInteger index = [self.dataSource flatIndexForIndexPath:indexPath];
    if (self.onRowWillDisplay) {
        self.onRowWillDisplay(@{
            @"index": @(index),
            @"frame": @ {
                @"x": @(CGRectGetMinX(cell.frame)),
                @"y": @(CGRectGetMinY(cell.frame)),
                @"width": @(CGRectGetWidth(cell.frame)),
                @"height": @(CGRectGetHeight(cell.frame))
            }
        });
    }
    if (self.onEndReached) {
        NSInteger lastSectionIndex = [self numberOfSectionsInCollectionView:collectionView] - 1;
        NSInteger lastRowIndexInSection = [self collectionView:collectionView numberOfItemsInSection:lastSectionIndex] - self.preloadItemNumber;
        if (lastRowIndexInSection < 0) {
            lastRowIndexInSection = 0;
        }
        BOOL isLastIndex = [indexPath section] == lastSectionIndex && [indexPath row] == lastRowIndexInSection;
        if (isLastIndex) {
            self.onEndReached(@{});
        }
    }
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    HippyNextBaseListViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:kCellIdentifier forIndexPath:indexPath];
    HippyShadowView *shadowView = [self.dataSource cellForIndexPath:indexPath];
    
    UIView *cellView = nil;
    UIView *cachedVisibleCellView = [_cachedWeakCellViews objectForKey:shadowView.hippyTag];
    if (cachedVisibleCellView &&
        [shadowView isKindOfClass:HippyShadowWaterfallItem.class] &&
        !((HippyShadowWaterfallItem *)shadowView).layoutDirty) {
        cellView = cachedVisibleCellView;
        HippyLogTrace(@"🟢 use cached visible cellView at %@ for %@", indexPath, shadowView.hippyTag);
    } else {
        cellView = [self.uiManager createViewForShadowListItem:shadowView];
        [_cachedWeakCellViews setObject:cellView forKey:shadowView.hippyTag];
        HippyLogTrace(@"🟡 create cellView at %@ for %@", indexPath, shadowView.hippyTag);
    }
    
    HippyAssert([cellView conformsToProtocol:@protocol(ViewAppearStateProtocol)],
        @"subviews of NativeRenderBaseListViewCell must conform to protocol ViewAppearStateProtocol");
    cell.cellView = cellView;
    cellView.parent = self;
    return cell;
}

- (void)tableViewDidLayoutSubviews:(HippyNextListTableView *)tableView {
    [super tableViewDidLayoutSubviews:tableView];
    NSArray<UICollectionViewCell *> *visibleCells = [self.collectionView visibleCells];
    for (HippyNextBaseListViewCell *cell in visibleCells) {
        CGRect cellRectInTableView = [self.collectionView convertRect:[cell bounds] fromView:cell];
        CGRect intersection = CGRectIntersection(cellRectInTableView, [self.collectionView bounds]);
        if (CGRectEqualToRect(cellRectInTableView, intersection)) {
            [cell setCellShowState:CellFullShowState];
        } else if (!CGRectIsNull(intersection)) {
            [cell setCellShowState:CellHalfShowState];
        }
    }
    if (_previousVisibleCells && ![_previousVisibleCells isEqualToArray:visibleCells]) {
        NSMutableArray<UICollectionViewCell *> *diff = [_previousVisibleCells mutableCopy];
        [diff removeObjectsInArray:visibleCells];
        for (HippyNextBaseListViewCell *cell in diff) {
            [cell setCellShowState:CellNotShowState];
        }
    }
    _previousVisibleCells = visibleCells;
}


#pragma mark - UIScrollViewDelegate

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    // override, should call super
    [super scrollViewWillBeginDragging:scrollView];
    
    if (self.onScrollBeginDrag) {
        self.onScrollBeginDrag([self scrollEventDataWithState:ScrollStateDraging]);
    }
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView
                     withVelocity:(CGPoint)velocity
              targetContentOffset:(inout CGPoint *)targetContentOffset {
    // override, should call super
    [super scrollViewWillEndDragging:scrollView
                        withVelocity:velocity
                 targetContentOffset:targetContentOffset];
    
    if (self.onScrollEndDrag) {
        self.onScrollEndDrag([self scrollEventDataWithState:ScrollStateDraging]);
    }
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
    // override, should call super
    [super scrollViewDidEndDragging:scrollView willDecelerate:decelerate];
}

- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView {
    // override, should call super
    [super scrollViewWillBeginDecelerating:scrollView];
    
    if (self.onMomentumScrollBegin) {
        self.onMomentumScrollBegin([self scrollEventDataWithState:ScrollStateScrolling]);
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    // override, should call super
    [super scrollViewDidEndDecelerating:scrollView];

    if (self.onMomentumScrollEnd) {
        self.onMomentumScrollEnd([self scrollEventDataWithState:ScrollStateStop]);
    }
}

- (NSDictionary *)scrollEventDataWithState:(NativeRenderScrollState)state {
    return @{ @"contentOffset": @{ @"x": @(self.collectionView.contentOffset.x),
                                   @"y": @(self.collectionView.contentOffset.y)}
    };
}


#pragma mark - UICollectionViewLayout Delegate

- (NSInteger)collectionView:(UICollectionView *)collectionView
                     layout:(UICollectionViewLayout *)collectionViewLayout columnCountForSection:(NSInteger)section {
    return 1;
}

- (UIEdgeInsets)collectionView:(UICollectionView *)collectionView
                        layout:(UICollectionViewLayout *)collectionViewLayout insetForSectionAtIndex:(NSInteger)section {
    return UIEdgeInsetsZero;
}

- (CGFloat)collectionView:(UICollectionView *)collectionView
                                      layout:(UICollectionViewLayout *)collectionViewLayout
    minimumInteritemSpacingForSectionAtIndex:(NSInteger)section {
    return .0f;
}

- (CGFloat)collectionView:(UICollectionView *)collectionView
                                   layout:(UICollectionViewLayout *)collectionViewLayout
    minimumColumnSpacingForSectionAtIndex:(NSInteger)section {
    return .0f;
}

- (void)setHorizontal:(BOOL)horizontal {
    if (_horizontal != horizontal) {
        BOOL previousShowScrollIndicator = self.showScrollIndicator;
        _horizontal = horizontal;
        UICollectionViewFlowLayout *layout = (UICollectionViewFlowLayout *)self.collectionView.collectionViewLayout;
        layout.scrollDirection = horizontal ? UICollectionViewScrollDirectionHorizontal : UICollectionViewScrollDirectionVertical;
        [self.collectionView.collectionViewLayout invalidateLayout];
        if (horizontal) {
            [self.collectionView setAlwaysBounceHorizontal:YES];
            [self.collectionView setAlwaysBounceVertical:NO];
        } else {
            [self.collectionView setAlwaysBounceVertical:YES];
            [self.collectionView setAlwaysBounceHorizontal:NO];
        }
        if (self.showScrollIndicator != previousShowScrollIndicator) {
            [self setShowScrollIndicator:previousShowScrollIndicator];
        }
    }
}

#pragma mark - HippyScrollableProtocol

// override
- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated {
    // Ensure at least one scroll event will fire
    _allowNextScrollNoMatterWhat = YES;
    
    NSIndexPath *indexPath = [self.dataSource indexPathForFlatIndex:index];
    if (indexPath != nil) {
        UICollectionViewScrollPosition position = self.horizontal ? UICollectionViewScrollPositionLeft : UICollectionViewScrollPositionTop;
        [self.collectionView scrollToItemAtIndexPath:indexPath
                                    atScrollPosition:position
                                            animated:animated];
    }
}

@end
