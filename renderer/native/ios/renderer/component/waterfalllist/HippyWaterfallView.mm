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

#import "HippyWaterfallView.h"
#import "HippyHeaderRefresh.h"
#import "HippyFooterRefresh.h"
#import "HippyWaterfallItemView.h"
#import "UIView+Hippy.h"
#import "HippyRefresh.h"
#import "HippyWaterfallViewDataSource.h"
#import "HippyShadowView.h"
#import "HippyUIManager.h"
#import "UIView+Render.h"
#import "HippyListTableView.h"
#import "HippyWaterfallViewCell.h"

static NSString *kCellIdentifier = @"cellIdentifier";

static NSString *kWaterfallItemName = @"WaterfallItem";

@interface HippyWaterfallView () <HippyInvalidating, HippyRefreshDelegate, HippyListTableViewLayoutProtocol> {
    NSHashTable<id<UIScrollViewDelegate>> *_scrollListeners;
    BOOL _isInitialListReady;
    UIColor *_backgroundColor;
    BOOL _manualScroll;
}

@property (nonatomic, strong) HippyCollectionViewWaterfallLayout *layout;

@property (nonatomic, assign) NSInteger initialListSize;
@property (nonatomic, assign) BOOL containBannerView;

@property (nonatomic, weak) UIView *rootView;
@property (nonatomic, strong) UIView *loadingView;

@end

@implementation HippyWaterfallView

@synthesize contentSize;

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        self.backgroundColor = [UIColor clearColor];
        _scrollListeners = [NSHashTable weakObjectsHashTable];
        _scrollEventThrottle = 100.f;
        _dataSource = [[HippyWaterfallViewDataSource alloc] init];
        self.dataSource.itemViewName = [self compoentItemName];
        _weakItemMap = [NSMapTable strongToWeakObjectsMapTable];
        _cachedItems = [NSMutableDictionary dictionaryWithCapacity:[self maxCachedItemCount]];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(didReceiveMemoryWarning) name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
        [self initCollectionView];
        if (@available(iOS 11.0, *)) {
            self.collectionView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
        }
    }
    return self;
}

- (void)initCollectionView {
    _layout = [self collectionViewLayout];
    HippyListTableView *collectionView = [[HippyListTableView alloc] initWithFrame:self.bounds collectionViewLayout:_layout];
    collectionView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    collectionView.dataSource = self;
    collectionView.delegate = self;
    collectionView.layoutDelegate = self;
    collectionView.backgroundColor = [UIColor clearColor];
    _collectionView = collectionView;
    [self registerCells];
    [self registerSupplementaryViews];
    [self addSubview:_collectionView];
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)registerCells {
    Class cls = [self listItemClass];
    [_collectionView registerClass:cls forCellWithReuseIdentifier:kCellIdentifier];
}
- (void)registerSupplementaryViews {
    
}

- (__kindof UICollectionViewLayout *)collectionViewLayout {
    return [[HippyCollectionViewWaterfallLayout alloc] init];
}

- (Class)listItemClass {
    return [HippyWaterfallViewCell class];
}

- (NSString *)compoentItemName {
    return kWaterfallItemName;
}

- (void)setScrollEventThrottle:(double)scrollEventThrottle {
    _scrollEventThrottle = scrollEventThrottle;
}

- (void)removeHippySubview:(UIView *)subview {
}

- (void)hippySetFrame:(CGRect)frame {
    [super hippySetFrame:frame];
    _collectionView.frame = self.bounds;
}

- (void)setBackgroundColor:(UIColor *)backgroundColor {
    _backgroundColor = backgroundColor;
    _collectionView.backgroundColor = backgroundColor;
}

- (void)invalidate {
    [_scrollListeners removeAllObjects];
}

- (void)addScrollListener:(id<UIScrollViewDelegate>)scrollListener {
    [_scrollListeners addObject:scrollListener];
}

- (void)removeScrollListener:(id<UIScrollViewDelegate>)scrollListener {
    [_scrollListeners removeObject:scrollListener];
}

- (UIScrollView *)realScrollView {
    return _collectionView;
}

- (CGSize)contentSize {
    return _collectionView.contentSize;
}

- (NSHashTable<id<UIScrollViewDelegate>> *)scrollListeners {
    return _scrollListeners;
}

- (void)zoomToRect:(CGRect)rect animated:(BOOL)animated {
}

- (void)didUpdateHippySubviews {
    [self refreshItemNodes];
    [self flush];
}

- (void)setContainBannerView:(BOOL)containBannerView {
    _containBannerView = containBannerView;
}

- (void)refreshItemNodes {
    [_dataSource setDataSource:self.hippyShadowView.hippySubviews containBannerView:_containBannerView];
}

#pragma mark Setter & Getter

- (NSUInteger)maxCachedItemCount {
    return 20;
}

- (NSUInteger)differenceFromIndexPath:(NSIndexPath *)indexPath1 againstAnother:(NSIndexPath *)indexPath2 {
    NSAssert([NSThread mainThread], @"must be in main thread");
    long diffCount = 0;
    for (NSUInteger index = MIN([indexPath1 section], [indexPath2 section]); index < MAX([indexPath1 section], [indexPath2 section]); index++) {
        diffCount += [_collectionView numberOfItemsInSection:index];
    }
    diffCount = diffCount + [indexPath1 row] - [indexPath2 row];
    return abs(diffCount);
}

- (NSInteger)differenceFromIndexPath:(NSIndexPath *)indexPath againstVisibleIndexPaths:(NSArray<NSIndexPath *> *)visibleIndexPaths {
    NSIndexPath *firstIndexPath = [visibleIndexPaths firstObject];
    NSIndexPath *lastIndexPath = [visibleIndexPaths lastObject];
    NSUInteger diffFirst = [self differenceFromIndexPath:indexPath againstAnother:firstIndexPath];
    NSUInteger diffLast = [self differenceFromIndexPath:indexPath againstAnother:lastIndexPath];
    return MIN(diffFirst, diffLast);
}

- (NSArray<NSIndexPath *> *)findFurthestIndexPathsFromScreen {
    NSUInteger cachedCount = [_cachedItems count];
    NSInteger cachedCountToRemove = cachedCount > [self maxCachedItemCount] ? cachedCount - [self maxCachedItemCount] : 0;
    if (0 != cachedCountToRemove) {
        NSArray<NSIndexPath *> *visibleIndexPaths = [_collectionView indexPathsForVisibleItems];
        NSArray<NSIndexPath *> *sortedCachedItemKey = [[_cachedItems allKeys] sortedArrayWithOptions:(NSSortConcurrent) usingComparator:^NSComparisonResult(id  _Nonnull obj1, id  _Nonnull obj2) {
            NSIndexPath *ip1 = obj1;
            NSIndexPath *ip2 = obj2;
            NSUInteger ip1Diff = [self differenceFromIndexPath:ip1 againstVisibleIndexPaths:visibleIndexPaths];
            NSUInteger ip2Diff = [self differenceFromIndexPath:ip2 againstVisibleIndexPaths:visibleIndexPaths];
            if (ip1Diff > ip2Diff) {
                return NSOrderedAscending;
            }
            else if (ip1Diff < ip2Diff) {
                return NSOrderedDescending;
            }
            else {
                return NSOrderedSame;
            }
        }];
        NSArray<NSIndexPath *> *result = [sortedCachedItemKey subarrayWithRange:NSMakeRange(0, cachedCountToRemove)];
        return result;
    }
    return nil;
}

- (void)purgeFurthestIndexPathsFromScreen {
    NSArray<NSIndexPath *> *furthestIndexPaths = [self findFurthestIndexPathsFromScreen];
    //purge view
    NSArray<NSNumber *> *objects = [_cachedItems objectsForKeys:furthestIndexPaths notFoundMarker:@(-1)];
    [self.renderContext purgeViewsFromHippyTags:objects];
    //purge cache
    [_cachedItems removeObjectsForKeys:furthestIndexPaths];
}

- (void)setContentInset:(UIEdgeInsets)contentInset {
    _contentInset = contentInset;

    _layout.sectionInset = _contentInset;
}

- (void)setNumberOfColumns:(NSInteger)numberOfColumns {
    _numberOfColumns = numberOfColumns;
    _layout.columnCount = _numberOfColumns;
}

- (void)setColumnSpacing:(CGFloat)columnSpacing {
    _columnSpacing = columnSpacing;
    _layout.minimumColumnSpacing = _columnSpacing;
}

- (void)setInterItemSpacing:(CGFloat)interItemSpacing {
    _interItemSpacing = interItemSpacing;
    _layout.minimumInteritemSpacing = _interItemSpacing;
}

- (void)setOnInitialListReady:(HippyDirectEventBlock)onInitialListReady {
    _onInitialListReady = onInitialListReady;
    _isInitialListReady = NO;
}

- (BOOL)isManualScrolling {
    return _manualScroll;
}

- (void)reloadData {
    [self.collectionView reloadData];
}

- (BOOL)flush {
    [self.collectionView reloadData];
    if (!_isInitialListReady) {
        _isInitialListReady = YES;
        if (self.onInitialListReady) {
            self.onInitialListReady(@{});
        }
    }
    return YES;
}

- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    if ([subview isKindOfClass:[HippyHeaderRefresh class]]) {
        if (_headerRefreshView) {
            [_headerRefreshView removeFromSuperview];
        }
        _headerRefreshView = (HippyHeaderRefresh *)subview;
        [_headerRefreshView setScrollView:self.collectionView];
        _headerRefreshView.delegate = self;
        _headerRefreshView.frame = subview.hippyShadowView.frame;
        [_weakItemMap setObject:subview forKey:[subview hippyTag]];
    } else if ([subview isKindOfClass:[HippyFooterRefresh class]]) {
        if (_footerRefreshView) {
            [_footerRefreshView removeFromSuperview];
        }
        _footerRefreshView = (HippyFooterRefresh *)subview;
        [_footerRefreshView setScrollView:self.collectionView];
        _footerRefreshView.delegate = self;
        _footerRefreshView.frame = subview.hippyShadowView.frame;
        UIEdgeInsets insets = self.collectionView.contentInset;
        self.collectionView.contentInset = UIEdgeInsetsMake(insets.top, insets.left, _footerRefreshView.frame.size.height, insets.right);
        [_weakItemMap setObject:subview forKey:[subview hippyTag]];
    }
}

- (NSArray<UIView *> *)hippySubviews {
    return [[_weakItemMap dictionaryRepresentation] allValues];
}

#pragma mark - UICollectionViewDataSource
- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    return [_dataSource numberOfSection];
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return [_dataSource numberOfCellForSection:section];
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    return [self collectionView:collectionView itemViewForItemAtIndexPath:indexPath];
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView itemViewForItemAtIndexPath:(NSIndexPath *)indexPath {
    HippyWaterfallViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:kCellIdentifier forIndexPath:indexPath];
    return cell;
}

- (void)collectionView:(UICollectionView *)collectionView
       willDisplayCell:(UICollectionViewCell *)cell
    forItemAtIndexPath:(NSIndexPath *)indexPath {
    [self itemViewForCollectionViewCell:cell indexPath:indexPath];
    if (0 == [indexPath section] && _containBannerView) {
        return;
    }
    NSInteger section = _containBannerView ? 1 : 0;
    NSInteger count = [_dataSource numberOfCellForSection:section];
    NSInteger leftCnt = count - indexPath.item - 1;
    if (leftCnt == _preloadItemNumber) {
        [self startLoadMoreData];
    }
    if (indexPath.item == count - 1) {
        [self startLoadMoreData];
        if (self.onFooterAppeared) {
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                self.onFooterAppeared(@ {});
            });
        }
    }
}

- (void)collectionView:(UICollectionView *)collectionView didEndDisplayingCell:(UICollectionViewCell *)cell forItemAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell isKindOfClass:[HippyWaterfallViewCell class]]) {
        HippyWaterfallViewCell *hpCell = (HippyWaterfallViewCell *)cell;
        if (hpCell.cellView) {
            [_cachedItems setObject:[hpCell.cellView hippyTag] forKey:indexPath];
            hpCell.cellView = nil;
        }
    }
}

- (void)itemViewForCollectionViewCell:(UICollectionViewCell *)cell indexPath:(NSIndexPath *)indexPath {
    HippyWaterfallViewCell *hpCell = (HippyWaterfallViewCell *)cell;
    HippyShadowView *shadowView = [_dataSource cellForIndexPath:indexPath];
    [shadowView recusivelySetCreationTypeToInstant];
    UIView *cellView = [self.renderContext viewFromRenderViewTag:shadowView.hippyTag];
    if (cellView) {
        [_cachedItems removeObjectForKey:indexPath];
    }
    else {
        cellView = [self.renderContext createViewRecursivelyFromShadowView:shadowView];
    }
    hpCell.cellView = cellView;
    hpCell.shadowView = shadowView;
    hpCell.shadowView.cell = hpCell;
    [_weakItemMap setObject:cellView forKey:[cellView hippyTag]];
}

#pragma mark - HippyCollectionViewDelegateWaterfallLayout
- (CGSize)collectionView:(UICollectionView *)collectionView
                  layout:(UICollectionViewLayout *)collectionViewLayout
    sizeForItemAtIndexPath:(NSIndexPath *)indexPath {
    HippyShadowView *shadowView = [_dataSource cellForIndexPath:indexPath];
    return shadowView.frame.size;
}

- (NSInteger)collectionView:(UICollectionView *)collectionView
                     layout:(UICollectionViewLayout *)collectionViewLayout
      columnCountForSection:(NSInteger)section {
    if (_containBannerView && 0 == section) {
        return 1;
    }
    return _numberOfColumns;
}

- (UIEdgeInsets)collectionView:(UICollectionView *)collectionView
                        layout:(UICollectionViewLayout *)collectionViewLayout
        insetForSectionAtIndex:(NSInteger)section {
    if (0 == section && _containBannerView) {
        return UIEdgeInsetsZero;
    }
    return _contentInset;
}

- (void)startLoadMore {
    [self startLoadMoreData];
}

- (void)startLoadMoreData {
    [self loadMoreData];
}

- (void)loadMoreData {
    if (self.onEndReached) {
        self.onEndReached(@{});
    }
}

- (BOOL)manualScroll {
    return _manualScroll;
}

#pragma mark - UIScrollView Delegate

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    if (_onScroll) {
        double ti = CACurrentMediaTime();
        double timeDiff = (ti - _lastOnScrollEventTimeInterval) * 1000.f;
        if (timeDiff > _scrollEventThrottle) {
            NSDictionary *eventData = [self scrollEventDataWithState:ScrollStateScrolling];
            _lastOnScrollEventTimeInterval = ti;
            _onScroll(eventData);
        }
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidScroll:)]) {
            [scrollViewListener scrollViewDidScroll:scrollView];
        }
    }
    //TODO cancel timer when component is removed from hippy view
    [NSObject cancelPreviousPerformRequestsWithTarget:self selector:@selector(purgeFurthestIndexPathsFromScreen) object:nil];
    static const NSTimeInterval delayForPurgeView = 3.0f;
    [self performSelector:@selector(purgeFurthestIndexPathsFromScreen) withObject:nil afterDelay:delayForPurgeView];
    [_headerRefreshView scrollViewDidScroll];
    [_footerRefreshView scrollViewDidScroll];
}

- (NSDictionary *)scrollEventDataWithState:(HippyScrollState)state {
    NSArray<NSIndexPath *> *visibleItems = [self indexPathsForVisibleItems];
    if ([visibleItems count] > 0) {
        CGPoint offset = self.collectionView.contentOffset;
        CGFloat startEdgePos = offset.y;
        CGFloat endEdgePos = offset.y + CGRectGetHeight(self.collectionView.frame);
        NSInteger firstVisibleRowIndex = [[visibleItems firstObject] row];
        NSInteger lastVisibleRowIndex = [[visibleItems lastObject] row];

        if (_containBannerView) {
            if ([visibleItems firstObject].section == 0) {
                if ([visibleItems lastObject].section != 0) {
                    lastVisibleRowIndex = lastVisibleRowIndex + 1;
                }
            } else {
                firstVisibleRowIndex = firstVisibleRowIndex + 1;
                lastVisibleRowIndex = lastVisibleRowIndex + 1;
            }
        }

        NSMutableArray *visibleRowsFrames = [NSMutableArray arrayWithCapacity:[visibleItems count]];
        for (NSIndexPath *indexPath in visibleItems) {
            UICollectionViewCell *node = [self.collectionView cellForItemAtIndexPath:indexPath];
            [visibleRowsFrames addObject:@{
                @"x" : @(node.frame.origin.x),
                @"y" : @(node.frame.origin.y),
                @"width" : @(CGRectGetWidth(node.frame)),
                @"height" : @(CGRectGetHeight(node.frame))
            }];
        }
        NSDictionary *dic = @{
            @"startEdgePos" : @(startEdgePos),
            @"endEdgePos" : @(endEdgePos),
            @"firstVisibleRowIndex" : @(firstVisibleRowIndex),
            @"lastVisibleRowIndex" : @(lastVisibleRowIndex),
            @"scrollState" : @(state),
            @"visibleRowFrames" : visibleRowsFrames
        };
        return dic;
    }
    return [NSDictionary dictionary];
}

- (NSArray<NSIndexPath *> *)indexPathsForVisibleItems {
    NSArray<NSIndexPath *> *visibleItems = [self.collectionView indexPathsForVisibleItems];
    NSArray<NSIndexPath *> *sortedItems = [visibleItems sortedArrayUsingComparator:^NSComparisonResult(id _Nonnull obj1, id _Nonnull obj2) {
        NSIndexPath *ip1 = (NSIndexPath *)obj1;
        NSIndexPath *ip2 = (NSIndexPath *)obj2;
        return [ip1 compare:ip2];
    }];
    return sortedItems;
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
    if (!decelerate) {
        _manualScroll = NO;
        if (self.onExposureReport) {
            HippyScrollState state = scrollView.decelerating ? ScrollStateScrolling : ScrollStateStop;
            NSDictionary *exposureInfo = [self scrollEventDataWithState:state];
            self.onExposureReport(exposureInfo);
        }
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndDragging:willDecelerate:)]) {
            [scrollViewListener scrollViewDidEndDragging:scrollView willDecelerate:decelerate];
        }
    }

    [_headerRefreshView scrollViewDidEndDragging];
    [_footerRefreshView scrollViewDidEndDragging];
}

- (void)scrollViewDidZoom:(UIScrollView *)scrollView {

}

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    _manualScroll = YES;
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView
                     withVelocity:(CGPoint)velocity
              targetContentOffset:(inout CGPoint *)targetContentOffset NS_AVAILABLE_IOS(5_0) {
    if (velocity.y == 0 && velocity.x == 0) {
        dispatch_after(
            dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
                self->_manualScroll = NO;
            });
    }
    if (velocity.y > 0) {
        if (self.onExposureReport) {
            NSDictionary *exposureInfo = [self scrollEventDataWithState:ScrollStateScrolling];
            self.onExposureReport(exposureInfo);
        }
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView;
{
    if (self.onExposureReport) {
        NSDictionary *exposureInfo = [self scrollEventDataWithState:ScrollStateStop];
        self.onExposureReport(exposureInfo);
    }
}

- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView {
}

- (nullable UIView *)viewForZoomingInScrollView:(UIScrollView *)scrollView;
{ return nil; }

- (void)scrollViewWillBeginZooming:(UIScrollView *)scrollView withView:(nullable UIView *)view NS_AVAILABLE_IOS(3_2) {
}

- (void)scrollViewDidEndZooming:(UIScrollView *)scrollView withView:(nullable UIView *)view atScale:(CGFloat)scale {
}

- (BOOL)scrollViewShouldScrollToTop:(UIScrollView *)scrollViewxt {
    return YES;
}

- (void)scrollViewDidScrollToTop:(UIScrollView *)scrollView {
}

- (void)tableViewDidLayoutSubviews:(HippyListTableView *)tableView {
    
}

- (void)refreshCompleted:(NSInteger)status text:(NSString *)text {
}

- (void)startRefreshFromJS {
}

- (void)startRefreshFromJSWithType:(NSUInteger)type {
    if (type == 1) {
        [self startRefreshFromJS];
    }
}

- (void)callExposureReport {
    BOOL isDragging = self.collectionView.isDragging;
    BOOL isDecelerating = self.collectionView.isDecelerating;
    BOOL isScrolling = isDragging || isDecelerating;
    HippyScrollState state = isScrolling ? ScrollStateScrolling : ScrollStateStop;
    NSDictionary *result = [self scrollEventDataWithState:state];
    if (self.onExposureReport) {
        self.onExposureReport(result);
    }
}

- (void)scrollToOffset:(CGPoint)point animated:(BOOL)animated {
    [self.collectionView setContentOffset:point animated:animated];
}

- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated {
    NSInteger section = _containBannerView ? 1 : 0;
    [self.collectionView scrollToItemAtIndexPath:[NSIndexPath indexPathForRow:index inSection:section]
                                atScrollPosition:UICollectionViewScrollPositionTop
                                        animated:animated];
}

#pragma mark touch conflict
- (UIView *)rootView {
    if (_rootView) {
        return _rootView;
    }
    UIView *view = [self superview];
    while (view) {
        if (0 == [[view hippyTag] intValue] % 10) {
            _rootView = view;
            return view;
        }
        else {
            view = [view superview];
        }
    }
    return view;
}

- (void)didMoveToSuperview {
    [super didMoveToSuperview];
    _rootView = nil;
}

- (void)didReceiveMemoryWarning {
    [self cleanUpCachedItems];
}

- (void)cleanUpCachedItems {
    //purge view
    NSArray<NSNumber *> *objects = [_cachedItems allValues];
    [self.renderContext purgeViewsFromHippyTags:objects];
    //purge cache
    [_cachedItems removeAllObjects];
}

@end
