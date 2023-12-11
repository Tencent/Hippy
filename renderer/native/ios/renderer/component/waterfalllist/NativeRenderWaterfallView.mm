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

#import "NativeRenderWaterfallView.h"
#import "NativeRenderHeaderRefresh.h"
#import "NativeRenderFooterRefresh.h"
#import "NativeRenderWaterfallItemView.h"
#import "UIView+Hippy.h"
#import "HippyRefresh.h"
#import "NativeRenderWaterfallViewDataSource.h"
#import "HippyShadowView.h"
#import "HippyUIManager.h"
#import "UIView+Render.h"
#import "NativeRenderListTableView.h"
#import "NativeRenderWaterfallViewCell.h"
#import "HippyRootView.h"


static NSString *kCellIdentifier = @"HippyWaterfallCellIdentifier";
static NSString *kWaterfallItemName = @"WaterfallItem";
static const NSTimeInterval delayForPurgeView = 1.f;

@interface NativeRenderWaterfallView () <HippyInvalidating, NativeRenderRefreshDelegate, HippyListTableViewLayoutProtocol> {
    NSHashTable<id<UIScrollViewDelegate>> *_scrollListeners;
    BOOL _isInitialListReady;
    UIColor *_backgroundColor;
    BOOL _manualScroll;
    NSMutableArray<NSArray<HippyShadowView *> *> *_dataSourcePool;
    dispatch_semaphore_t _dataSourceSem;
}

@property (nonatomic, strong) NativeRenderCollectionViewWaterfallLayout *layout;

@property (nonatomic, assign) NSInteger initialListSize;
@property (nonatomic, assign) BOOL containBannerView;

@property (nonatomic, weak) HippyRootView *rootView;
@property (nonatomic, strong) UIView *loadingView;

@end

@implementation NativeRenderWaterfallView {
    CFTimeInterval _lastOnScrollEventTimeInterval;
}

@synthesize contentSize;

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        self.backgroundColor = [UIColor clearColor];
        _scrollListeners = [NSHashTable weakObjectsHashTable];
        _scrollEventThrottle = 100.f;
        _weakItemMap = [NSMapTable strongToWeakObjectsMapTable];
        _cachedItems = [NSMutableDictionary dictionary];
        _dataSourcePool = [NSMutableArray array];
        _dataSourceSem = dispatch_semaphore_create(1);
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
    NativeRenderListTableView *collectionView = [[NativeRenderListTableView alloc] initWithFrame:self.bounds collectionViewLayout:_layout];
    collectionView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    collectionView.dataSource = self;
    collectionView.delegate = self;
    collectionView.layoutDelegate = self;
    collectionView.alwaysBounceVertical = YES;
    collectionView.backgroundColor = [UIColor clearColor];
    _collectionView = collectionView;
    [self registerCells];
    [self registerSupplementaryViews];
    [self addSubview:_collectionView];
}

- (void)dealloc {
    [NSObject cancelPreviousPerformRequestsWithTarget:self];
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)registerCells {
    Class cls = [self listItemClass];
    [_collectionView registerClass:cls forCellWithReuseIdentifier:kCellIdentifier];
}

- (void)registerSupplementaryViews {
    
}

- (__kindof UICollectionViewLayout *)collectionViewLayout {
    return [[NativeRenderCollectionViewWaterfallLayout alloc] init];
}

- (Class)listItemClass {
    return [NativeRenderWaterfallViewCell class];
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
    [NSObject cancelPreviousPerformRequestsWithTarget:self];
    [[NSNotificationCenter defaultCenter] removeObserver:self];
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
    self.dirtyContent = YES;
}

- (void)hippyBridgeDidFinishTransaction {
    if (self.dirtyContent) {
        [self reloadData];
        self.dirtyContent = NO;
    }
}

- (void)setContainBannerView:(BOOL)containBannerView {
    _containBannerView = containBannerView;
}

- (void)refreshItemNodes {
    NSArray<HippyShadowView *> *datasource = [self popDataSource];
    _dataSource = [[NativeRenderWaterfallViewDataSource alloc] initWithDataSource:datasource
                                                                     itemViewName:[self compoentItemName]
                                                                    containBannerView:_containBannerView];
}

#pragma mark Setter & Getter

- (NSUInteger)maxCachedItemCount {
    return NSUIntegerMax;
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
    NSUInteger visibleItemsCount = [[self.collectionView visibleCells] count];
    NSUInteger maxCachedItemCount = [self maxCachedItemCount] == NSUIntegerMax ? visibleItemsCount * 3 : [self maxCachedItemCount];
    NSUInteger cachedCount = [_cachedItems count];
    NSInteger cachedCountToRemove = cachedCount > maxCachedItemCount ? cachedCount - maxCachedItemCount : 0;
    if (0 != cachedCountToRemove) {
        NSArray<NSIndexPath *> *visibleIndexPaths = [_collectionView indexPathsForVisibleItems];
        NSArray<NSIndexPath *> *sortedCachedItemKey = [[_cachedItems allKeys] sortedArrayUsingComparator:^NSComparisonResult(id  _Nonnull obj1, id  _Nonnull obj2) {
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
    [self.renderImpl purgeViewsFromComponentTags:objects onRootTag:self.rootTag];
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
    if (!_isInitialListReady) {
        _isInitialListReady = YES;
        if (self.onInitialListReady) {
            self.onInitialListReady(@{});
        }
    }
}

- (void)pushDataSource:(NSArray<HippyShadowView *> *)dataSource {
    dispatch_semaphore_wait(_dataSourceSem, DISPATCH_TIME_FOREVER);
    [_dataSourcePool addObject:dataSource];
    dispatch_semaphore_signal(_dataSourceSem);
}

- (NSArray<HippyShadowView *> *)popDataSource {
    dispatch_semaphore_wait(_dataSourceSem, DISPATCH_TIME_FOREVER);
    NSArray<HippyShadowView *> *datasource = [_dataSourcePool lastObject];
    [_dataSourcePool removeLastObject];
    dispatch_semaphore_signal(_dataSourceSem);
    return datasource;
}

- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    if ([subview isKindOfClass:[NativeRenderHeaderRefresh class]]) {
        if (_headerRefreshView) {
            [_headerRefreshView removeFromSuperview];
        }
        _headerRefreshView = (NativeRenderHeaderRefresh *)subview;
        [_headerRefreshView setScrollView:self.collectionView];
        _headerRefreshView.delegate = self;
        _headerRefreshView.frame = subview.hippyShadowView.frame;
        [_weakItemMap setObject:subview forKey:[subview hippyTag]];
    } else if ([subview isKindOfClass:[NativeRenderFooterRefresh class]]) {
        if (_footerRefreshView) {
            [_footerRefreshView removeFromSuperview];
        }
        _footerRefreshView = (NativeRenderFooterRefresh *)subview;
        [_footerRefreshView setScrollView:self.collectionView];
        _footerRefreshView.delegate = self;
        _footerRefreshView.frame = subview.hippyShadowView.frame;
        UIEdgeInsets insets = self.collectionView.contentInset;
        self.collectionView.contentInset = UIEdgeInsetsMake(insets.top, insets.left, _footerRefreshView.frame.size.height, insets.right);
        [_weakItemMap setObject:subview forKey:[subview hippyTag]];
    }
}

- (NSArray<UIView *> *)subcomponents {
    return [[_weakItemMap dictionaryRepresentation] allValues];
}

- (void)removeFromHippySuperview {
    [super removeFromHippySuperview];
    [NSObject cancelPreviousPerformRequestsWithTarget:self selector:@selector(purgeFurthestIndexPathsFromScreen) object:nil];
    [self purgeFurthestIndexPathsFromScreen];
}

- (void)didMoveToWindow {
    if (!self.window) {
        [NSObject cancelPreviousPerformRequestsWithTarget:self selector:@selector(purgeFurthestIndexPathsFromScreen) object:nil];
        [self purgeFurthestIndexPathsFromScreen];
    }
}

#pragma mark - UICollectionViewDataSource
- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    return [_dataSource numberOfSection];
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return [_dataSource numberOfCellForSection:section];
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    NativeRenderWaterfallViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:kCellIdentifier forIndexPath:indexPath];
    [self addCellViewToCollectionViewCell:cell atIndexPath:indexPath];
    return cell;
}

- (void)collectionView:(UICollectionView *)collectionView
       willDisplayCell:(UICollectionViewCell *)cell
    forItemAtIndexPath:(NSIndexPath *)indexPath {
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

- (void)collectionView:(UICollectionView *)collectionView
  didEndDisplayingCell:(UICollectionViewCell *)cell
    forItemAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell isKindOfClass:[NativeRenderWaterfallViewCell class]]) {
        NativeRenderWaterfallViewCell *hpCell = (NativeRenderWaterfallViewCell *)cell;
        if (hpCell.cellView) {
            [_cachedItems setObject:[hpCell.cellView hippyTag] forKey:indexPath];
        }
    }
}

- (void)addCellViewToCollectionViewCell:(UICollectionViewCell *)cell atIndexPath:(NSIndexPath *)indexPath {
    NativeRenderWaterfallViewCell *hpCell = (NativeRenderWaterfallViewCell *)cell;
    HippyShadowView *renderObjectView = [_dataSource cellForIndexPath:indexPath];
    [renderObjectView recusivelySetCreationTypeToInstant];
    UIView *cellView = [self.renderImpl createViewRecursivelyFromRenderObject:renderObjectView];
    if (cellView) {
        [_cachedItems removeObjectForKey:indexPath];
    }
    hpCell.cellView = cellView;
    cellView.parentComponent = self;
    [_weakItemMap setObject:cellView forKey:[cellView hippyTag]];
}

#pragma mark - NativeRenderCollectionViewDelegateWaterfallLayout

- (CGSize)collectionView:(UICollectionView *)collectionView
                  layout:(UICollectionViewLayout *)collectionViewLayout
  sizeForItemAtIndexPath:(NSIndexPath *)indexPath {
    HippyShadowView *shadowView = [_dataSource cellForIndexPath:indexPath];
    CGSize itemSize = shadowView.frame.size;
    if (itemSize.width < .0 || itemSize.height < .0) {
        HippyLogError(@"Negative item size for %@ at %@ of %@", shadowView, indexPath, self);
        return CGSizeZero;
    }
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
        CFTimeInterval now = CACurrentMediaTime();
        CFTimeInterval ti = (now - _lastOnScrollEventTimeInterval) * 1000.0;
        if (ti > _scrollEventThrottle || _allowNextScrollNoMatterWhat) {
            NSDictionary *eventData = [self scrollEventDataWithState:ScrollStateScrolling];
            _lastOnScrollEventTimeInterval = now;
            _onScroll(eventData);
            _allowNextScrollNoMatterWhat = NO;
        }
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidScroll:)]) {
            [scrollViewListener scrollViewDidScroll:scrollView];
        }
    }
    [NSObject cancelPreviousPerformRequestsWithTarget:self selector:@selector(purgeFurthestIndexPathsFromScreen) object:nil];
    [self performSelector:@selector(purgeFurthestIndexPathsFromScreen) withObject:nil afterDelay:delayForPurgeView];
    [_headerRefreshView scrollViewDidScroll];
    [_footerRefreshView scrollViewDidScroll];
}

- (NSDictionary *)scrollEventDataWithState:(NativeRenderScrollState)state {
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


- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    _allowNextScrollNoMatterWhat = YES; // Ensure next scroll event is recorded, regardless of throttle
    _manualScroll = YES;
    [self cancelTouch];
    
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginDragging:)]) {
            [scrollViewListener scrollViewWillBeginDragging:scrollView];
        }
    }
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView
                     withVelocity:(CGPoint)velocity
              targetContentOffset:(inout CGPoint *)targetContentOffset {
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
    
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillEndDragging:withVelocity:targetContentOffset:)]) {
            [scrollViewListener scrollViewWillEndDragging:scrollView withVelocity:velocity targetContentOffset:targetContentOffset];
        }
    }
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
    if (!decelerate) {
        _manualScroll = NO;
        if (self.onExposureReport) {
            NativeRenderScrollState state = scrollView.decelerating ? ScrollStateScrolling : ScrollStateStop;
            NSDictionary *exposureInfo = [self scrollEventDataWithState:state];
            self.onExposureReport(exposureInfo);
        }
        // Fire a final scroll event
        _allowNextScrollNoMatterWhat = YES;
        [self scrollViewDidScroll:scrollView];
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndDragging:willDecelerate:)]) {
            [scrollViewListener scrollViewDidEndDragging:scrollView willDecelerate:decelerate];
        }
    }
    
    [_headerRefreshView scrollViewDidEndDragging];
    [_footerRefreshView scrollViewDidEndDragging];
}

- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginDecelerating:)]) {
            [scrollViewListener scrollViewWillBeginDecelerating:scrollView];
        }
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    // Fire a final scroll event
    _allowNextScrollNoMatterWhat = YES;
    [self scrollViewDidScroll:scrollView];
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        self->_manualScroll = NO;
    });
    
    if (self.onExposureReport) {
        NSDictionary *exposureInfo = [self scrollEventDataWithState:ScrollStateStop];
        self.onExposureReport(exposureInfo);
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndDecelerating:)]) {
            [scrollViewListener scrollViewDidEndDecelerating:scrollView];
        }
    }
}

- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView {
    // Fire a final scroll event
    _allowNextScrollNoMatterWhat = YES;
    [self scrollViewDidScroll:scrollView];
    
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndScrollingAnimation:)]) {
            [scrollViewListener scrollViewDidEndScrollingAnimation:scrollView];
        }
    }
}

- (nullable UIView *)viewForZoomingInScrollView:(UIScrollView *)scrollView;
{ return nil; }

- (void)scrollViewWillBeginZooming:(UIScrollView *)scrollView withView:(nullable UIView *)view {
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

- (void)scrollViewDidEndZooming:(UIScrollView *)scrollView withView:(nullable UIView *)view atScale:(CGFloat)scale {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in [self scrollListeners]) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndZooming:withView:atScale:)]) {
            [scrollViewListener scrollViewDidEndZooming:scrollView withView:view atScale:scale];
        }
    }
}

- (BOOL)scrollViewShouldScrollToTop:(UIScrollView *)scrollViewxt {
    return YES;
}

- (void)scrollViewDidScrollToTop:(UIScrollView *)scrollView {
}

- (void)tableViewDidLayoutSubviews:(NativeRenderListTableView *)tableView {
    
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
    NativeRenderScrollState state = isScrolling ? ScrollStateScrolling : ScrollStateStop;
    NSDictionary *result = [self scrollEventDataWithState:state];
    if (self.onExposureReport) {
        self.onExposureReport(result);
    }
}


#pragma mark - HippyScrollableProtocol

- (void)scrollToOffset:(CGPoint)offset animated:(BOOL)animated {
    // Ensure at least one scroll event will fire
    _allowNextScrollNoMatterWhat = YES;
    
    [self.collectionView setContentOffset:offset animated:animated];
}

- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated {
    // Ensure at least one scroll event will fire
    _allowNextScrollNoMatterWhat = YES;
    
    NSIndexPath *indexPath = [self.dataSource indexPathForFlatIndex:index];
    if (indexPath != nil) {
        [self.collectionView scrollToItemAtIndexPath:indexPath
                                    atScrollPosition:UICollectionViewScrollPositionTop
                                            animated:animated];
    }
}


#pragma mark - Touch conflict

- (HippyRootView *)rootView {
    if (_rootView) {
        return _rootView;
    }
    
    UIView *view = [self superview];
    while (view && ![view isKindOfClass:[HippyRootView class]]) {
        view = [view superview];
    }
    
    if ([view isKindOfClass:[HippyRootView class]]) {
        _rootView = (HippyRootView *)view;
        return _rootView;
    } else {
        return nil;
    }
}

- (void)cancelTouch {
    HippyRootView *view = [self rootView];
    if (view) {
        [view cancelTouches];
    }
}

- (void)didMoveToSuperview {
    [super didMoveToSuperview];
    _rootView = nil;
}


#pragma mark -

- (void)didReceiveMemoryWarning {
    [self cleanUpCachedItems];
}

- (void)cleanUpCachedItems {
    //purge view
    NSArray<NSNumber *> *objects = [_cachedItems allValues];
    [self.renderImpl purgeViewsFromComponentTags:objects onRootTag:self.rootTag];
    //purge cache
    [_cachedItems removeAllObjects];
}

@end
