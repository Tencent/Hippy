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
#import "NativeRenderBaseListView.h"
#import "NativeRenderBaseListViewCell.h"
#import "NativeRenderBaseListViewDataSource.h"
#import "NativeRenderCollectionViewFlowLayout.h"
#import "NativeRenderFooterRefresh.h"
#import "NativeRenderHeaderRefresh.h"
#import "HippyUIManager.h"
#import "HippyShadowView.h"
#import "UIView+DirectionalLayout.h"
#import "UIView+Hippy.h"
#import "UIView+Render.h"

static NSString *const kCellIdentifier = @"HippyListCellIdentifier";
static NSString *const kSupplementaryIdentifier = @"SupplementaryIdentifier";
static NSString *const kListViewItem = @"ListViewItem";

@interface NativeRenderBaseListView () <NativeRenderRefreshDelegate> {
    BOOL _isInitialListReady;
    NSArray<UICollectionViewCell *> *_previousVisibleCells;
}

@end

@implementation NativeRenderBaseListView

#pragma mark - Life Cycle

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        _isInitialListReady = NO;
        self.preloadItemNumber = 1;
        self.dataSource.itemViewName = [self compoentItemName];
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
    return [NativeRenderBaseListViewCell class];
}

- (__kindof UICollectionViewLayout *)collectionViewLayout {
    BOOL layoutDirectionRTL = [self isLayoutSubviewsRTL];
    [[NativeRenderCollectionViewFlowLayoutRTLStack sharedInstance] pushRTLConfig:layoutDirectionRTL];
    NativeRenderCollectionViewFlowLayout *layout = [[NativeRenderCollectionViewFlowLayout alloc] init];
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
    HippyAssert([cls isSubclassOfClass:[NativeRenderBaseListViewCell class]],
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
    [self.collectionView setShowsVerticalScrollIndicator:show];
}

- (BOOL)showScrollIndicator {
    return [self.collectionView showsVerticalScrollIndicator];
}

- (void)setScrollEnabled:(BOOL)value {
    [self.collectionView setScrollEnabled:value];
}


#pragma mark Data Load
 
- (void)reloadData {
    [self refreshItemNodes];
    [_dataSource applyDiff:_previousDataSource
             changedConext:self.changeContext
          forWaterfallView:self.collectionView
                completion:^(BOOL success) {
        if (success) {
            self->_previousDataSource = [self->_dataSource copy];
        }
        else {
            self->_previousDataSource = nil;
        }
    }];
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

- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    if ([subview isKindOfClass:[NativeRenderHeaderRefresh class]]) {
        if (_headerRefreshView) {
            [_headerRefreshView unsetFromScrollView];
        }
        _headerRefreshView = (NativeRenderHeaderRefresh *)subview;
        [_headerRefreshView setScrollView:self.collectionView];
        _headerRefreshView.delegate = self;
        [_weakItemMap setObject:subview forKey:[subview hippyTag]];
    } else if ([subview isKindOfClass:[NativeRenderFooterRefresh class]]) {
        if (_footerRefreshView) {
            [_footerRefreshView unsetFromScrollView];
        }
        _footerRefreshView = (NativeRenderFooterRefresh *)subview;
        [_footerRefreshView setScrollView:self.collectionView];
        _footerRefreshView.delegate = self;
        [_weakItemMap setObject:subview forKey:[subview hippyTag]];
    }
}

- (void)didUpdateHippySubviews {
    self.dirtyContent = YES;
}

- (void)hippyBridgeDidFinishTransaction {
    if (self.dirtyContent) {
        [self reloadData];
        self.dirtyContent = NO;
    }
}

- (void)refreshItemNodes {
    NSArray<HippyShadowView *> *datasource = [self popDataSource];
    self->_dataSource = [[NativeRenderBaseListViewDataSource alloc] initWithDataSource:datasource
                                                                          itemViewName:[self compoentItemName]
                                                                     containBannerView:NO];
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
        UIView *headerView = [self.renderImpl viewForHippyTag:headerRenderObject.hippyTag onRootTag:headerRenderObject.rootTag];
        if (!headerView) {
            headerView = [self.renderImpl createViewRecursivelyFromRenderObject:headerRenderObject];
        }
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
    HippyShadowView *cellRenderObjectView = [self.dataSource cellForIndexPath:indexPath];
    NSInteger index = [self.dataSource flatIndexForIndexPath:indexPath];
    if (self.onRowWillDisplay) {
        self.onRowWillDisplay(@{
            @"index": @(index),
            @"frame": @ {
                @"x": @(CGRectGetMinX(cellRenderObjectView.frame)),
                @"y": @(CGRectGetMinY(cellRenderObjectView.frame)),
                @"width": @(CGRectGetWidth(cellRenderObjectView.frame)),
                @"height": @(CGRectGetHeight(cellRenderObjectView.frame))
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

- (void)collectionView:(UICollectionView *)collectionView
  didEndDisplayingCell:(UICollectionViewCell *)cell
    forItemAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell isKindOfClass:[NativeRenderBaseListViewCell class]]) {
        NativeRenderBaseListViewCell *hpCell = (NativeRenderBaseListViewCell *)cell;
        if (hpCell.cellView) {
            [_cachedItems setObject:[hpCell.cellView hippyTag] forKey:indexPath];
        }
    }
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    UICollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:kCellIdentifier forIndexPath:indexPath];
    
    // Create and Add real Hippy cell content
    [self addCellViewToCollectionViewCell:cell atIndexPath:indexPath];
    return cell;
}

- (void)addCellViewToCollectionViewCell:(UICollectionViewCell *)cell atIndexPath:(NSIndexPath *)indexPath {
    HippyAssert(self.renderImpl, @"no rendercontext detected");
    if (!self.renderImpl) {
        return;
    }
    HippyShadowView *cellRenderObject = [self.dataSource cellForIndexPath:indexPath];
    [cellRenderObject recusivelySetCreationTypeToInstant];
    
    NativeRenderBaseListViewCell *hpCell = (NativeRenderBaseListViewCell *)cell;
    UIView *cellView = [self.renderImpl createViewRecursivelyFromRenderObject:cellRenderObject];
    if (cellView) {
        [_cachedItems removeObjectForKey:indexPath];
    }
    HippyAssert([cellView conformsToProtocol:@protocol(ViewAppearStateProtocol)],
        @"subviews of NativeRenderBaseListViewCell must conform to protocol ViewAppearStateProtocol");
    hpCell.cellView = cellView;
    cellView.parentComponent = self;
    [_weakItemMap setObject:cellView forKey:[cellView hippyTag]];
}

- (void)tableViewDidLayoutSubviews:(NativeRenderListTableView *)tableView {
    NSArray<UICollectionViewCell *> *visibleCells = [self.collectionView visibleCells];
    for (NativeRenderBaseListViewCell *cell in visibleCells) {
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
        for (NativeRenderBaseListViewCell *cell in diff) {
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
