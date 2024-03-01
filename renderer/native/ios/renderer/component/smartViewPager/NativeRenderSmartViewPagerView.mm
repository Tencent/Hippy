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

#import "HippyNextBaseListViewCell.h"
#import "HippyNextBaseListViewDataSource.h"
#import "HippyFooterRefresh.h"
#import "HippyHeaderRefresh.h"
#import "HippyUIManager.h"
#import "HippyShadowView.h"
#import "NativeRenderSmartViewPagerView.h"
#import "HippyScrollProtocol.h"
#import "UIView+MountEvent.h"
#import "UIView+Render.h"
#import "UIView+Hippy.h"

#include <objc/runtime.h>

static NSInteger kInfiniteLoopBegin = 2;
static NSString *const kCellIdentifier = @"cellIdentifier";
static NSString *const kSupplementaryIdentifier = @"SupplementaryIdentifier";
static NSString *const kListViewItem = @"ListViewItem";

@interface NativeRenderSmartViewPagerView () <HippyRefreshDelegate> {
    __weak UIView *_rootView;
    BOOL _isInitialListReady;
    NSTimeInterval _lastScrollDispatchTime;
    NSArray<UICollectionViewCell *> *_previousVisibleCells;
    BOOL _manualScroll;
    NSTimer *_timer;
    CGFloat _itemWidth;
    NSInteger _currentPage;
    UICollectionViewFlowLayout *_viewPagerLayout;
    NSArray<NSNumber *> *_itemIndexArray;
}

- (void)setPreviousMargin:(CGFloat)previousMargin nextMargin:(CGFloat)nextMargin pageGap:(CGFloat)pageGap;

@end

@implementation NativeRenderSmartViewPagerView

#pragma mark Life Cycle
- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        _isInitialListReady = NO;
        _dataSource = [[HippyNextBaseListViewDataSource alloc] initWithDataSource:nil 
                                                                     itemViewName:[self compoentItemName]
                                                                containBannerView:NO];
        [self initialization];
        self.collectionView.alwaysBounceVertical = NO;
        self.collectionView.alwaysBounceHorizontal = YES;
        self.collectionView.showsHorizontalScrollIndicator = NO;
        self.collectionView.pagingEnabled = NO;
        self.collectionView.decelerationRate = UIScrollViewDecelerationRateFast;
    }

    return self;
}

- (void)initialization
{
    _circular = NO;
    _autoplay = NO;
    _itemWidth = self.hippyShadowView.frame.size.width;
    _previousMargin = 0.0f;
    _nextMargin = 0.0f;
    _pageGap = 0;
    _initialPage = 0;
    _autoplayTimeInterval = 3000;
}

- (NSInteger)adjustAutoPlayCurrentPage:(NSInteger)currentPage {
    NSInteger adjustCurrentPage = currentPage;
    if (_circular) {
        if (currentPage >= _itemIndexArray.count - kInfiniteLoopBegin) {
            adjustCurrentPage = _itemIndexArray.count - kInfiniteLoopBegin;
        }
    } else {
        if (currentPage >= _itemIndexArray.count) {
            adjustCurrentPage = 0;
        }
    }
    return adjustCurrentPage;
}

- (void)setPage:(NSInteger)page animated:(BOOL)animated {
    _currentPage = [self adjustInitialPage:page];
    CGFloat contentOffsetX = [self adjustScrollContentOffsetX:_currentPage];
    [self.collectionView setContentOffset:CGPointMake(contentOffsetX, 0) animated:animated];
    if (self.onPageScrollStateChanged) {
        self.onPageScrollStateChanged(@{ @"pageScrollState": @"idle" });
    }
}

- (NSInteger)getCurrentPage {
    NSInteger position = _currentPage;
    if (_circular) {
        position = _currentPage - kInfiniteLoopBegin;
    }
    return position;
}

- (NSInteger)adjustWillEndDraggingCurrentPage:(NSInteger)currentPage {
    NSInteger adjustCurrentPage = currentPage;
    if (_circular) {
        if (currentPage < 1) {
            adjustCurrentPage = 1;
        } else if (currentPage >= _itemIndexArray.count - kInfiniteLoopBegin) {
            adjustCurrentPage = _itemIndexArray.count - kInfiniteLoopBegin;
        }
    } else {
        if (currentPage <= 0) {
            adjustCurrentPage = 0;
        } else if (currentPage >= _itemIndexArray.count - 1) {
            adjustCurrentPage = _itemIndexArray.count - 1;
        }
    }
    return adjustCurrentPage;
}

- (CGFloat)adjustScrollContentOffsetX:(NSInteger)currentPage {
    CGFloat contentOffsetX = 0.0f;
    if (currentPage <= 0) {
        contentOffsetX = - _pageGap - _previousMargin;
    } else {
        contentOffsetX = (_itemWidth * currentPage)+ (currentPage - 1) * _pageGap - _previousMargin;
    }
    return contentOffsetX;
}

- (void)adjustDidEndDeceleratingCurrentPage{
    BOOL isAdjust = NO;
    if (_circular) {
        if (_currentPage == 1) {
            _currentPage = _itemIndexArray.count - kInfiniteLoopBegin - 1;
            isAdjust = YES;
        } else if (_currentPage == _itemIndexArray.count - kInfiniteLoopBegin) {
            _currentPage = kInfiniteLoopBegin;
            isAdjust = YES;
        }
    }
    if (isAdjust) {
        [self.collectionView setContentOffset:CGPointMake([self adjustScrollContentOffsetX:_currentPage], 0) animated:NO];
    }

    if (self.onPageSelected) {
        self.onPageSelected(@{ @"position": @([self getCurrentPage]) });
    }
}

- (void)setAutoplayTimeInterval:(CGFloat)autoplayTimeInterval {
    if (autoplayTimeInterval > 1000 && _autoplayTimeInterval != autoplayTimeInterval) {
        _autoplayTimeInterval = autoplayTimeInterval;
    }
}

- (void)setInitialPage:(NSInteger)initialPage {
    if (initialPage >= 0 && _initialPage != initialPage) {
        _initialPage = initialPage;
    }
}

- (void)showNext {
    if (self.collectionView.isDragging) {
        return;
    }
    ++_currentPage;
    _currentPage = [self adjustAutoPlayCurrentPage:_currentPage];
    CGFloat contentoffsetX = [self adjustScrollContentOffsetX:_currentPage];
    [self.collectionView setContentOffset:CGPointMake(contentoffsetX, 0) animated:YES];
}

- (NSInteger)adjustInitialPage:(NSInteger)initialPage {
    NSInteger defaultPage = 0;
    if (_circular) {
        initialPage = initialPage + kInfiniteLoopBegin;
        if (initialPage >= kInfiniteLoopBegin && initialPage <= _itemIndexArray.count - kInfiniteLoopBegin) {
            defaultPage = initialPage;
        } else {
            defaultPage = kInfiniteLoopBegin;
        }
    } else {
        if (initialPage >= 0 && initialPage < _itemIndexArray.count) {
            defaultPage = initialPage;
        }
    }
    return defaultPage;
}

- (void)setPreviousMargin:(CGFloat)previousMargin nextMargin:(CGFloat)nextMargin pageGap:(CGFloat)pageGap {
    _previousMargin = previousMargin;
    _nextMargin = nextMargin;
    _pageGap = pageGap;
    _itemWidth = self.hippyShadowView.frame.size.width - (previousMargin + nextMargin + pageGap * 2);
    _viewPagerLayout.itemSize = CGSizeMake(_itemWidth, self.hippyShadowView.frame.size.height);
    _viewPagerLayout.minimumLineSpacing = pageGap;
    _viewPagerLayout.minimumInteritemSpacing = pageGap;
    _currentPage = [self adjustInitialPage:_initialPage];
    self.collectionView.contentOffset = CGPointMake([self adjustScrollContentOffsetX:_currentPage], 0);
    if (!_circular) {
        self.collectionView.contentInset = UIEdgeInsetsMake(0, pageGap + previousMargin, 0, pageGap + nextMargin);
    }
    if (_autoplay && _autoplayTimeInterval > 0 && _timer == nil) {
        __weak __typeof(self) weakSelf = self;
        _timer = [NSTimer scheduledTimerWithTimeInterval:_autoplayTimeInterval / 1000.0 repeats:YES block:^(NSTimer * _Nonnull timer) {
            __typeof(self) strongSelf = weakSelf;
            [strongSelf showNext];
        }];
    }
}

- (void)dealloc {
    [_timer invalidate];
    _timer = nil;
}

#pragma mark Setter & Getter
- (NSString *)compoentItemName {
    return kListViewItem;
}

- (Class)listItemClass {
    return [HippyNextBaseListViewCell class];
}

- (__kindof UICollectionViewLayout *)collectionViewLayout {
    UICollectionViewFlowLayout *layout = [[UICollectionViewFlowLayout alloc] init];
    layout.minimumLineSpacing = .0f;
    layout.itemSize = CGSizeMake(self.hippyShadowView.frame.size.width, self.hippyShadowView.frame.size.height);
    layout.scrollDirection = UICollectionViewScrollDirectionHorizontal;
    _viewPagerLayout = layout;
    return layout;
}

- (void)registerCells {
    Class cls = [self listItemClass];
    NSAssert([cls isSubclassOfClass:[HippyNextBaseListViewCell class]], @"list item class must be a subclass of NativeRenderBaseListViewCell");
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

- (void)hippySetFrame:(CGRect)frame {
    [super hippySetFrame:frame];
    self.collectionView.frame = self.bounds;
}

- (void)setInitialListReady:(HippyDirectEventBlock)initialListReady {
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
}

- (void)didUpdateHippySubviews {
    [self refreshItemNodes];
    [self reloadData];
}

- (NSArray *)refreshItemIndexArrayWithOldArrayLength:(NSInteger)length {
    NSMutableArray *tempMutableArray = @[].mutableCopy;
    for (NSInteger i = 0; i < length; i++) {
        [tempMutableArray addObject:@(i)];
    }
    if (_circular && length >= 2) {
        for (NSInteger i = 0; i < kInfiniteLoopBegin; i++) {
            [tempMutableArray addObject:@(i)];
        }
        for (NSInteger i = 0; i < kInfiniteLoopBegin; i++) {
            [tempMutableArray insertObject:@(length - i - 1) atIndex:0];
        }
    } else {
        _circular = NO;
        _currentPage = 0;
    }
    return tempMutableArray;
}

- (void)refreshItemNodes {
    [self.dataSource setDataSource:self.hippyShadowView.subcomponents containBannerView:NO];
    _itemIndexArray = [self refreshItemIndexArrayWithOldArrayLength:self.hippyShadowView.subcomponents.count];
    [self setPreviousMargin:_previousMargin nextMargin:_nextMargin pageGap:_pageGap];
}

#pragma mark -Scrollable

- (UIScrollView *)realScrollView {
    return self.collectionView;
}

- (CGSize)contentSize {
    return self.collectionView.contentSize;
}

#pragma mark - Delegate & Datasource

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return _itemIndexArray.count;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    NSInteger cellIndex = _itemIndexArray[indexPath.row].integerValue;
    NSIndexPath *adjustIndexPath = [NSIndexPath indexPathForRow:cellIndex inSection:indexPath.section];
    HippyNextBaseListViewCell *cell = (HippyNextBaseListViewCell *)[collectionView dequeueReusableCellWithReuseIdentifier:kCellIdentifier forIndexPath:adjustIndexPath];
    return cell;
}

- (CGSize)collectionView:(UICollectionView *)collectionView
                  layout:(UICollectionViewLayout *)collectionViewLayout
    sizeForItemAtIndexPath:(NSIndexPath *)indexPath {
    NSInteger cellIndex = _itemIndexArray[indexPath.row].integerValue;
    NSIndexPath *adjustIndexPath = [NSIndexPath indexPathForRow:cellIndex inSection:indexPath.section];
    HippyShadowView *renderObject = [_dataSource cellForIndexPath:adjustIndexPath];
    return renderObject.frame.size;
}

- (void)collectionView:(UICollectionView *)collectionView
       willDisplayCell:(UICollectionViewCell *)cell
    forItemAtIndexPath:(NSIndexPath *)indexPath {
    NSInteger cellIndex = _itemIndexArray[indexPath.row].integerValue;
    NSIndexPath *adjustIndexPath = [NSIndexPath indexPathForRow:cellIndex inSection:indexPath.section];
    HippyWaterfallViewCell *hpCell = (HippyWaterfallViewCell *)cell;
    HippyShadowView *renderObject = [_dataSource cellForIndexPath:adjustIndexPath];
    UIView *cellView = [self.uiManager createViewForShadowListItem:renderObject];
    hpCell.cellView = cellView;
    cellView.parent = self;
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

#pragma mark - Scroll

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    NSTimeInterval now = CACurrentMediaTime();
    if ((self.scrollEventThrottle > 0 && self.scrollEventThrottle < (now - _lastScrollDispatchTime))) {
        if (self.onScroll) {
            self.onScroll([self scrollBodyData]);
        }
        _lastScrollDispatchTime = now;
    }
    
    if (self.onPageScrollStateChanged) {
        NSString *state = scrollView.isDragging ? @"dragging" : @"settling";
        self.onPageScrollStateChanged(@{ @"pageScrollState": state });
    }

    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidScroll:)]) {
            [scrollViewListener scrollViewDidScroll:scrollView];
        }
    }
}

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    if (self.onScrollBeginDrag) {
        self.onScrollBeginDrag([self scrollBodyData]);
    }
    _manualScroll = YES;
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginDragging:)]) {
            [scrollViewListener scrollViewWillBeginDragging:scrollView];
        }
    }
}

- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView {
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
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    if (velocity.x > 0) {
        ++_currentPage;
    } else {
        --_currentPage;
    }
    _currentPage = [self adjustWillEndDraggingCurrentPage:_currentPage];
    CGFloat contentoffsetX = [self adjustScrollContentOffsetX:_currentPage];
    targetContentOffset->x = contentoffsetX;
    targetContentOffset->y = 0;
    
    if (velocity.y == 0 && velocity.x == 0) {
        dispatch_after(
            dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                self->_manualScroll = NO;
            });
    }

    if (self.onScrollEndDrag) {
        self.onScrollEndDrag([self scrollBodyData]);
    }

    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillEndDragging:withVelocity:targetContentOffset:)]) {
            [scrollViewListener scrollViewWillEndDragging:scrollView withVelocity:velocity targetContentOffset:targetContentOffset];
        }
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    if (self.onPageScrollStateChanged) {
        self.onPageScrollStateChanged(@{ @"pageScrollState": @"idle" });
    }
    
    [self adjustDidEndDeceleratingCurrentPage];
    
    if (_autoplay) {
        _timer.fireDate = [NSDate dateWithTimeIntervalSinceNow:_autoplayTimeInterval / 1000];
    }
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        self->_manualScroll = NO;
    });

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
    [self adjustDidEndDeceleratingCurrentPage];
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndScrollingAnimation:)]) {
            [scrollViewListener scrollViewDidEndScrollingAnimation:scrollView];
        }
    }
}

- (NSDictionary *)scrollBodyData {
    return @{ @"contentOffset": @ { @"x": @(self.collectionView.contentOffset.x), @"y": @(self.collectionView.contentOffset.y) } };
}

- (void)didMoveToSuperview {
    _rootView = nil;
}

#pragma mark UICollectionViewLayout Delegate

- (NSInteger)collectionView:(UICollectionView *)collectionView
                     layout:(UICollectionViewLayout *)collectionViewLayout columnCountForSection:(NSInteger)section {
    return 1;
}

@end
