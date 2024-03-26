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
#import "HippyWaterfallViewCell.h"
#import "HippyRootView.h"
#import "HippyShadowListView.h"


static NSString *kCellIdentifier = @"HippyWaterfallCellIdentifier";
static NSString *kWaterfallItemName = @"WaterfallItem";

@interface HippyWaterfallView () <HippyInvalidating, HippyRefreshDelegate> {
    NSHashTable<id<UIScrollViewDelegate>> *_scrollListeners;
    BOOL _isInitialListReady;
    UIColor *_backgroundColor;
    BOOL _manualScroll;
}

@property (nonatomic, strong) HippyCollectionViewWaterfallLayout *layout;

@property (nonatomic, assign) NSInteger initialListSize;
@property (nonatomic, assign) BOOL containBannerView;

@property (nonatomic, weak) HippyRootView *rootView;
@property (nonatomic, strong) UIView *loadingView;

@end

@implementation HippyWaterfallView {
    CFTimeInterval _lastOnScrollEventTimeInterval;
    NSMutableArray *_visibleCellViewsBeforeReload;
}

@synthesize contentSize;

- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        self.backgroundColor = [UIColor clearColor];
        _scrollListeners = [NSHashTable weakObjectsHashTable];
        _scrollEventThrottle = 100.f;
        _cachedWeakCellViews = [NSMapTable strongToWeakObjectsMapTable];
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
    HippyNextListTableView *collectionView = [[HippyNextListTableView alloc] initWithFrame:self.bounds collectionViewLayout:_layout];
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

- (void)setContainBannerView:(BOOL)containBannerView {
    _containBannerView = containBannerView;
}

#pragma mark Setter & Getter

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


#pragma mark - Data Reload

- (void)hippyBridgeDidFinishTransaction {
    HippyShadowListView *listNode = self.hippyShadowView;
    if (!_dataSource || (listNode && listNode.itemChangeContext.hasChanges)) {
        HippyLogTrace(@"🔥 %@ Reload %@", self.hippyTag, [[listNode itemChangeContext] description]);
        [self cacheVisibleCellViewsForReuse];
        [self reloadData];
        [listNode.itemChangeContext clear];
    }
}

- (void)reloadData {
    NSArray<HippyShadowView *> *datasource = [self.hippyShadowView.subcomponents copy];
    _dataSource = [[HippyWaterfallViewDataSource alloc] initWithDataSource:datasource
                                                                     itemViewName:[self compoentItemName]
                                                                containBannerView:_containBannerView];
    
    [self.collectionView reloadData];
    
    if (!_isInitialListReady) {
        _isInitialListReady = YES;
        if (self.onInitialListReady) {
            self.onInitialListReady(@{});
        }
    }
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
    }
}

- (void)didUpdateHippySubviews {
    // Do nothing, as subviews is managed by `insertHippySubview:atIndex:` or lazy-created
}

#pragma mark - UICollectionViewDataSource
- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    return [_dataSource numberOfSection];
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return [_dataSource numberOfCellForSection:section];
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    HippyWaterfallViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:kCellIdentifier forIndexPath:indexPath];
    HippyShadowView *shadowView = [_dataSource cellForIndexPath:indexPath];
    
    UIView *cellView = nil;
    UIView *cachedCellView = [_cachedWeakCellViews objectForKey:shadowView.hippyTag];
    if (cachedCellView &&
        [shadowView isKindOfClass:HippyShadowWaterfallItem.class] &&
        !((HippyShadowWaterfallItem *)shadowView).layoutDirty) {
        cellView = cachedCellView;
    } else {
        cellView = [self.uiManager createViewForShadowListItem:shadowView];
        [_cachedWeakCellViews setObject:cellView forKey:shadowView.hippyTag];
    }
    
    cell.cellView = cellView;
    cellView.parent = self;
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

- (void)tableViewDidLayoutSubviews:(HippyNextListTableView *)tableView {
    [self clearVisibleCellViewsCacheBeforeReload];
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


#pragma mark - Memory optimization

- (void)didReceiveMemoryWarning {
    [self cleanUpCachedItems];
}

- (void)cleanUpCachedItems {
    // nop
}

- (void)cacheVisibleCellViewsForReuse {
    // Before reload, cache the current visible cellViews temporarily,
    // because cells can potentially be reused.
    // And remove them when the reload is complete in `tableViewDidLayoutSubviews` method.
    NSArray<UICollectionViewCell *> *visibleCells = [self.collectionView visibleCells];
    NSMutableArray *visibleCellViews = [NSMutableArray arrayWithCapacity:visibleCells.count];
    for (UICollectionViewCell *cell in visibleCells) {
        if ([cell isKindOfClass:HippyWaterfallViewCell.class]) {
            [visibleCellViews addObject:((HippyWaterfallViewCell *)cell).cellView];
        }
    }
    _visibleCellViewsBeforeReload = visibleCellViews;
}

- (void)clearVisibleCellViewsCacheBeforeReload {
    _visibleCellViewsBeforeReload = nil;
}

@end
