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

#import "NativeRenderBaseListView.h"
#import "UIView+NativeRender.h"
#import "NativeRenderObjectView.h"
#import "NativeRenderHeaderRefresh.h"
#import "NativeRenderFooterRefresh.h"
#import "NativeRenderBaseListViewCell.h"
#import "NativeRenderBaseListViewDataSource.h"
#import "NativeRenderCollectionViewFlowLayout.h"
#import "NativeRenderContext.h"
#import "UIView+DirectionalLayout.h"

static NSString *const kCellIdentifier = @"cellIdentifier";
static NSString *const kSupplementaryIdentifier = @"SupplementaryIdentifier";
static NSString *const kListViewItem = @"ListViewItem";

@interface NativeRenderBaseListView () <NativeRenderRefreshDelegate> {
    __weak UIView *_rootView;
    BOOL _isInitialListReady;
    NSArray<UICollectionViewCell *> *_previousVisibleCells;
    BOOL _manualScroll;
}

@end

@implementation NativeRenderBaseListView

#pragma mark Life Cycle
- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        _isInitialListReady = NO;
        self.preloadItemNumber = 1;
        _dataSource = [[NativeRenderBaseListViewDataSource alloc] init];
        self.dataSource.itemViewName = [self compoentItemName];
    }

    return self;
}


- (void)dealloc {
    [_headerRefreshView unsetFromScrollView];
    [_footerRefreshView unsetFromScrollView];
}

#pragma mark Setter & Getter
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

- (void)applyLayoutDirectionFromParent:(HPDirection)direction {
    [super applyLayoutDirectionFromParent:direction];
    [self.collectionView removeFromSuperview];
    [self initCollectionView];
}

- (void)registerCells {
    Class cls = [self listItemClass];
    NSAssert([cls isSubclassOfClass:[NativeRenderBaseListViewCell class]], @"list item class must be a subclass of NativeRenderBaseListViewCell");
    [self.collectionView registerClass:cls forCellWithReuseIdentifier:kCellIdentifier];
}

- (void)registerSupplementaryViews {
    [self.collectionView registerClass:[UICollectionReusableView class]
            forSupplementaryViewOfKind:UICollectionElementKindSectionHeader
                   withReuseIdentifier:kSupplementaryIdentifier];
}

- (void)setFrame:(CGRect)frame {
    [super setFrame:frame];
}

- (void)nativeRenderSetFrame:(CGRect)frame {
    [super nativeRenderSetFrame:frame];
    self.collectionView.frame = self.bounds;
}

- (void)setInitialListReady:(NativeRenderDirectEventBlock)initialListReady {
    _initialListReady = initialListReady;
    _isInitialListReady = NO;
}

#pragma mark Data Load
 
- (BOOL)flush {
    [self refreshItemNodes];
    return YES;
}

- (void)reloadData {
    [self.collectionView reloadData];
    if (self.initialContentOffset) {
        [self.collectionView setContentOffset:CGPointMake(0, self.initialContentOffset) animated:NO];
        self.initialContentOffset = 0;
    }
    if (!_isInitialListReady) {
        _isInitialListReady = YES;
        if (self.initialListReady) {
            self.initialListReady(@{});
        }
    }
}

- (void)insertNativeRenderSubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    if ([subview isKindOfClass:[NativeRenderHeaderRefresh class]]) {
        if (_headerRefreshView) {
            [_headerRefreshView unsetFromScrollView];
        }
        _headerRefreshView = (NativeRenderHeaderRefresh *)subview;
        [_headerRefreshView setScrollView:self.collectionView];
        _headerRefreshView.delegate = self;
        [_weakItemMap setObject:subview forKey:[subview componentTag]];
    } else if ([subview isKindOfClass:[NativeRenderFooterRefresh class]]) {
        if (_footerRefreshView) {
            [_footerRefreshView unsetFromScrollView];
        }
        _footerRefreshView = (NativeRenderFooterRefresh *)subview;
        [_footerRefreshView setScrollView:self.collectionView];
        _footerRefreshView.delegate = self;
        [_weakItemMap setObject:subview forKey:[subview componentTag]];
    }
}

- (void)didUpdateNativeRenderSubviews {
    [self refreshItemNodes];
    [self reloadData];
}

- (void)refreshItemNodes {
    [self.dataSource setDataSource:self.nativeRenderObjectView.nativeRenderSubviews containBannerView:NO];
}

#pragma mark -Scrollable

- (void)setScrollEnabled:(BOOL)value {
    [self.collectionView setScrollEnabled:value];
}

- (void)scrollToOffset:(__unused CGPoint)offset {
}

- (void)scrollToOffset:(__unused CGPoint)offset animated:(__unused BOOL)animated {
}

- (void)zoomToRect:(__unused CGRect)rect animated:(__unused BOOL)animated {
}

- (UIScrollView *)realScrollView {
    return self.collectionView;
}

- (CGSize)contentSize {
    return self.collectionView.contentSize;
}

- (void)scrollToContentOffset:(CGPoint)offset animated:(BOOL)animated {
    [self.collectionView setContentOffset:offset animated:animated];
}

- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated {
    NSIndexPath *indexPath = [self.dataSource indexPathForFlatIndex:index];
    if (indexPath != nil) {
        [self.collectionView scrollToItemAtIndexPath:indexPath
                                    atScrollPosition:UITableViewScrollPositionTop animated:animated];
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
    NativeRenderObjectView *header = [self.dataSource headerForSection:section];
    if (header) {
        return CGRectGetHeight(header.frame);
    } else {
        return 0.00001;
    }
}

- (CGSize)collectionView:(UICollectionView *)collectionView
                  layout:(UICollectionViewLayout*)collectionViewLayout
referenceSizeForHeaderInSection:(NSInteger)section {
    NativeRenderObjectView *headerObjectView = [self.dataSource headerForSection:section];
    if ([headerObjectView isKindOfClass:[NativeRenderObjectView class]]) {
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
    NativeRenderObjectView *headerRenderObject = [self.dataSource headerForSection:section];
    if (headerRenderObject && [headerRenderObject isKindOfClass:[NativeRenderObjectView class]]) {
        UIView *headerView = [self.renderContext viewFromRenderViewTag:headerRenderObject.componentTag onRootTag:headerRenderObject.rootTag];
        if (!headerView) {
            headerView = [self.renderContext createViewRecursivelyFromRenderObject:headerRenderObject];
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
    NativeRenderObjectView *cellRenderObjectView = [self.dataSource cellForIndexPath:indexPath];
    [cellRenderObjectView recusivelySetCreationTypeToInstant];
    [self itemViewForCollectionViewCell:cell indexPath:indexPath];
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

- (void)collectionView:(UICollectionView *)collectionView didEndDisplayingCell:(UICollectionViewCell *)cell forItemAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell isKindOfClass:[NativeRenderBaseListViewCell class]]) {
        NativeRenderBaseListViewCell *hpCell = (NativeRenderBaseListViewCell *)cell;
        [_cachedItems setObject:[hpCell.cellView componentTag] forKey:indexPath];
        hpCell.cellView = nil;
    }
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    return [collectionView dequeueReusableCellWithReuseIdentifier:kCellIdentifier forIndexPath:indexPath];
}

- (void)itemViewForCollectionViewCell:(UICollectionViewCell *)cell indexPath:(NSIndexPath *)indexPath {
    NativeRenderObjectView *cellRenderObject = [self.dataSource cellForIndexPath:indexPath];
    NativeRenderBaseListViewCell *hpCell = (NativeRenderBaseListViewCell *)cell;
    UIView *cellView = [self.renderContext viewFromRenderViewTag:cellRenderObject.componentTag  onRootTag:cellRenderObject.rootTag];
    if (cellView) {
        [_cachedItems removeObjectForKey:indexPath];
    }
    else {
        cellView = [self.renderContext createViewRecursivelyFromRenderObject:cellRenderObject];
    }
    NSAssert([cellView conformsToProtocol:@protocol(ViewAppearStateProtocol)],
        @"subviews of NativeRenderBaseListViewCell must conform to protocol ViewAppearStateProtocol");
    //TODO NativeRenderBaseListViewCell.shadow and NativeRenderShadowView.cell can remove
    hpCell.cellView = cellView;
    [_weakItemMap setObject:cellView forKey:[cellView componentTag]];
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

#pragma mark - Scroll

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    if (self.onScrollBeginDrag) {
        self.onScrollBeginDrag([self scrollEventDataWithState:ScrollStateDraging]);
    }
    _manualScroll = YES;
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginDragging:)]) {
            [scrollViewListener scrollViewWillBeginDragging:scrollView];
        }
    }
}

- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView {
    if (self.onMomentumScrollBegin) {
        self.onMomentumScrollBegin([self scrollEventDataWithState:ScrollStateScrolling]);
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginDecelerating:)]) {
            [scrollViewListener scrollViewWillBeginDecelerating:scrollView];
        }
    }
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
    if (!decelerate) {
        _manualScroll = NO;
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndDragging:willDecelerate:)]) {
            [scrollViewListener scrollViewDidEndDragging:scrollView willDecelerate:decelerate];
        }
    }
    [_headerRefreshView scrollViewDidEndDragging];
    [_footerRefreshView scrollViewDidEndDragging];
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    if (velocity.y == 0 && velocity.x == 0) {
        dispatch_after(
            dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                self->_manualScroll = NO;
            });
    }

    if (self.onScrollEndDrag) {
        self.onScrollEndDrag([self scrollEventDataWithState:ScrollStateDraging]);
    }

    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillEndDragging:withVelocity:targetContentOffset:)]) {
            [scrollViewListener scrollViewWillEndDragging:scrollView withVelocity:velocity targetContentOffset:targetContentOffset];
        }
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        self->_manualScroll = NO;
    });

    if (self.onMomentumScrollEnd) {
        self.onMomentumScrollEnd([self scrollEventDataWithState:ScrollStateStop]);
    }

    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndDecelerating:)]) {
            [scrollViewListener scrollViewDidEndDecelerating:scrollView];
        }
    }
}

- (void)scrollViewWillBeginZooming:(UIScrollView *)scrollView withView:(UIView *)view {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginZooming:withView:)]) {
            [scrollViewListener scrollViewWillBeginZooming:scrollView withView:view];
        }
    }
}

- (void)scrollViewDidZoom:(UIScrollView *)scrollView {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidZoom:)]) {
            [scrollViewListener scrollViewDidZoom:scrollView];
        }
    }
}

- (void)scrollViewDidEndZooming:(UIScrollView *)scrollView withView:(UIView *)view atScale:(CGFloat)scale {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndZooming:withView:atScale:)]) {
            [scrollViewListener scrollViewDidEndZooming:scrollView withView:view atScale:scale];
        }
    }
}

- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndScrollingAnimation:)]) {
            [scrollViewListener scrollViewDidEndScrollingAnimation:scrollView];
        }
    }
}

- (NSDictionary *)scrollEventDataWithState:(NativeRenderScrollState)state {
    return @{ @"contentOffset": @ { @"x": @(self.collectionView.contentOffset.x), @"y": @(self.collectionView.contentOffset.y) } };
}

- (void)didMoveToSuperview {
    _rootView = nil;
}

- (BOOL)isManualScrolling {
    return _manualScroll;
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

#pragma mark UICollectionViewLayout Delegate

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
    }
}

#pragma mark NativeRenderRefresh Delegate
- (void)refreshView:(NativeRenderRefresh *)refreshView statusChanged:(NativeRenderRefreshStatus)status {
}
@end
