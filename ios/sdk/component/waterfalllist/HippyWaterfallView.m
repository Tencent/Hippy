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
#import "HippyCollectionViewWaterfallLayout.h"
#import "HippyHeaderRefresh.h"
#import "HippyFooterRefresh.h"
#import "HippyWaterfallItemView.h"
#import "HippyVirtualList.h"

#define CELL_TAG 10089

static NSString *kCellIdentifier = @"cellIdentifier";

typedef NS_ENUM(NSInteger, HippyScrollState) { ScrollStateStop, ScrollStateDraging, ScrollStateScrolling };

@interface HippyCollectionViewCell : UICollectionViewCell
@property (nonatomic, weak) HippyVirtualNode *node;
@property (nonatomic, weak) UIView *cellView;
@end

@implementation HippyCollectionViewCell

- (UIView *)cellView {
    return [self.contentView viewWithTag:CELL_TAG];
}

- (void)setCellView:(UIView *)cellView {
    UIView *selfCellView = [self cellView];
    if (selfCellView != cellView) {
        [selfCellView removeFromSuperview];
        cellView.tag = CELL_TAG;
        [self.contentView addSubview:cellView];
    }
}

@end

@interface HippyWaterfallView () <UICollectionViewDataSource, UICollectionViewDelegate, HippyCollectionViewDelegateWaterfallLayout, HippyInvalidating, HippyRefreshDelegate> {
    NSMutableArray *_scrollListeners;
    BOOL _isInitialListReady;
    HippyHeaderRefresh *_headerRefreshView;
    HippyFooterRefresh *_footerRefreshView;
    NSMutableDictionary<NSIndexPath *, NSNumber *> *_cachedItems;
}

@property (nonatomic, strong) HippyCollectionViewWaterfallLayout *layout;
@property (nonatomic, strong) UICollectionView *collectionView;

@property (nonatomic, assign) NSInteger initialListSize;
@property (nonatomic, copy) HippyDirectEventBlock onInitialListReady;
@property (nonatomic, copy) HippyDirectEventBlock onEndReached;
@property (nonatomic, copy) HippyDirectEventBlock onFooterAppeared;
@property (nonatomic, copy) HippyDirectEventBlock onRefresh;
@property (nonatomic, copy) HippyDirectEventBlock onExposureReport;

@property (nonatomic, weak) HippyRootView *rootView;
@property (nonatomic, strong) UIView *loadingView;

@end

@implementation HippyWaterfallView {
    UIColor *_backgroundColor;
    BOOL _allowNextScrollNoMatterWhat;
    double _lastOnScrollEventTimeInterval;
}

@synthesize node = _node;
@synthesize contentSize;

- (instancetype)initWithBridge:(HippyBridge *)bridge {
    if (self = [super initWithFrame:CGRectZero]) {
        self.backgroundColor = [UIColor clearColor];
        self.bridge = bridge;
        _scrollListeners = [NSMutableArray array];
        _scrollEventThrottle = 100.f;
        _cachedItems = [NSMutableDictionary dictionaryWithCapacity:64];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(didReceiveMemoryWarning)
                                                     name:UIApplicationDidReceiveMemoryWarningNotification
                                                   object:nil];
        [self initCollectionView];
        if (@available(iOS 11.0, *)) {
            self.collectionView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
        }
    }
    return self;
}

- (void)initCollectionView {
    if (_layout == nil) {
        _layout = [[HippyCollectionViewWaterfallLayout alloc] init];
    }

    if (_collectionView == nil) {
        _collectionView = [[UICollectionView alloc] initWithFrame:self.bounds collectionViewLayout:_layout];
        _collectionView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
        _collectionView.dataSource = self;
        _collectionView.delegate = self;
        _collectionView.alwaysBounceVertical = YES;
        _collectionView.backgroundColor = [UIColor clearColor];
        [_collectionView registerClass:[HippyCollectionViewCell class] forCellWithReuseIdentifier:kCellIdentifier];
        [self addSubview:_collectionView];
    }
}

- (void)setScrollEventThrottle:(double)scrollEventThrottle {
    _scrollEventThrottle = scrollEventThrottle;
}

- (void)removeHippySubview:(UIView *)subview {
    [NSObject cancelPreviousPerformRequestsWithTarget:self
                                             selector:@selector(purgeFurthestIndexPathsFromScreen)
                                               object:nil];
    [self purgeFurthestIndexPathsFromScreen];
}

- (void)hippySetFrame:(CGRect)frame {
    [super hippySetFrame:frame];
    _collectionView.frame = self.bounds;
}

- (NSArray<HippyVirtualNode *> *)nodesWithOnlyCell {
    NSMutableArray<HippyVirtualNode *> *subNodes = self.node.subNodes;
    NSUInteger location = 0;
    NSUInteger length = [subNodes count];
    if ([subNodes count] <= 0) {
        return subNodes;
    }
    if (_containBannerView) {
        location += 1;
        length -= 1;
    }
    if (_containPullHeader) {
        location += 1;
        length -= 1;
    }
    if (_containPullFooter) {
        length -= 1;
    }
    return [subNodes subarrayWithRange:NSMakeRange(location, length)];
}

- (__kindof HippyVirtualNode *)nodesWithBannerView {
    NSMutableArray<HippyVirtualNode *> *subNodes = self.node.subNodes;
    if ([subNodes count] > 0 && _containBannerView) {
        return subNodes[0];
    }
    return nil;
}

- (void)setBackgroundColor:(UIColor *)backgroundColor {
    _backgroundColor = backgroundColor;
    _collectionView.backgroundColor = backgroundColor;
}

- (void)invalidate {
    [_scrollListeners removeAllObjects];
}

- (void)addScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener {
    [_scrollListeners addObject:scrollListener];
}

- (void)removeScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener {
    [_scrollListeners removeObject:scrollListener];
}

- (UIScrollView *)realScrollView {
    return _collectionView;
}

- (CGSize)contentSize {
    return _collectionView.contentSize;
}

- (NSArray *)scrollListeners {
    return _scrollListeners;
}

- (void)zoomToRect:(CGRect)rect animated:(BOOL)animated {
}

#pragma mark Setter

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

- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex
{
    if ([subview isKindOfClass:[HippyHeaderRefresh class]]) {
        if (_headerRefreshView) {
            [_headerRefreshView removeFromSuperview];
        }
        _headerRefreshView = (HippyHeaderRefresh *)subview;
        [_headerRefreshView setScrollView:self.collectionView];
        _headerRefreshView.delegate = self;
        _headerRefreshView.frame = [self.node.subNodes[atIndex] frame];
    } else if ([subview isKindOfClass:[HippyFooterRefresh class]]) {
        if (_footerRefreshView) {
            [_footerRefreshView removeFromSuperview];
        }
        _footerRefreshView = (HippyFooterRefresh *)subview;
        [_footerRefreshView setScrollView:self.collectionView];
        _footerRefreshView.delegate = self;
        _footerRefreshView.frame = [self.node.subNodes[atIndex] frame];
        UIEdgeInsets insets = self.collectionView.contentInset;
        self.collectionView.contentInset = UIEdgeInsetsMake(insets.top, insets.left, _footerRefreshView.frame.size.height, insets.right);
    }
}

- (__kindof HippyVirtualNode *)nodeAtIndexPath:(NSIndexPath *)indexPath {
    NSInteger section = [indexPath section];
    NSInteger row = [indexPath item];
    HippyVirtualNode *cellNode = nil;
    if (_containBannerView) {
        if (0 == section) {
            cellNode = [self nodesWithBannerView];
        } else {
            NSArray<HippyVirtualNode *> *subNodes = [self nodesWithOnlyCell];
            if ([subNodes count] > row) {
                cellNode = subNodes[row];
            }
        }
    } else {
        NSArray<HippyVirtualNode *> *subNodes = [self nodesWithOnlyCell];
        if ([subNodes count] > row) {
            cellNode = subNodes[row];
        }
    }
    return cellNode;
}

- (NSString *)reuseIdentifierForIndexPath:(NSIndexPath *)indexPath {
    HippyVirtualNode *node = [self nodeAtIndexPath:indexPath];
    if ([node isKindOfClass:[HippyVirtualCell class]]) {
        return [(HippyVirtualCell *)node itemViewType];
    }
    else {
        return kCellIdentifier;
    }
}

#pragma mark - UICollectionViewDataSource
- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
    if (_containBannerView) {
        return 2;
    }
    return 1;
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    if (_containBannerView) {
        if (0 == section) {
            return 1;
        }
    }
    NSInteger count = [[self nodesWithOnlyCell] count];
    return count;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    if (_containBannerView && 0 == [indexPath section]) {
        return [self collectionView:collectionView bannerViewForItemAtIndexPath:indexPath];
    }
    return [self collectionView:collectionView itemViewForItemAtIndexPath:indexPath];
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView bannerViewForItemAtIndexPath:(NSIndexPath *)indexPath {
    HippyCollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:kCellIdentifier forIndexPath:indexPath];
    return cell;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView itemViewForItemAtIndexPath:(NSIndexPath *)indexPath {
    HippyCollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:kCellIdentifier forIndexPath:indexPath];
    return cell;
}

- (void)collectionView:(UICollectionView *)collectionView
       willDisplayCell:(UICollectionViewCell *)cell
    forItemAtIndexPath:(NSIndexPath *)indexPath {
    [self itemViewForCollectionViewCell:cell indexPath:indexPath];
    if (0 == [indexPath section] && _containBannerView) {
        return;
    }
    NSInteger count = [self nodesWithOnlyCell].count;
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
    HippyCollectionViewCell *hpCell = (HippyCollectionViewCell *)cell;
    [_cachedItems setObject:[hpCell.cellView hippyTag] forKey:indexPath];
    [hpCell.cellView removeFromSuperview];
    HippyVirtualNode *cellNode = hpCell.node;
    NSString *reuseIdentifier = [self reuseIdentifierForIndexPath:indexPath];
    if (cellNode && reuseIdentifier) {
        hpCell.node = nil;
    }
}

- (void)itemViewForCollectionViewCell:(UICollectionViewCell *)cell indexPath:(NSIndexPath *)indexPath {
    HippyVirtualNode *cellNode = [self nodeAtIndexPath:indexPath];
    HippyCollectionViewCell *hpCell = (HippyCollectionViewCell *)cell;
    HippyWaterfallItemView *cellView = (HippyWaterfallItemView *)[self.bridge.uiManager createViewFromNode:cellNode];
    hpCell.cellView = cellView;
    hpCell.node = cellNode;
    [_cachedItems removeObjectForKey:indexPath];
}

#pragma mark - HippyCollectionViewDelegateWaterfallLayout
- (CGSize)collectionView:(UICollectionView *)collectionView
                    layout:(UICollectionViewLayout *)collectionViewLayout
    sizeForItemAtIndexPath:(NSIndexPath *)indexPath {
    NSInteger section = [indexPath section];
    NSInteger row = [indexPath item];
    if (_containBannerView) {
        if (0 == section) {
            HippyVirtualNode *node = [self nodesWithBannerView];
            return node.frame.size;
        } else {
            NSArray<HippyVirtualNode *> *subNodes = [self nodesWithOnlyCell];
            if ([subNodes count] > row) {
                HippyVirtualNode *node = subNodes[row];
                return node.frame.size;
            }
        }
    } else {
        NSArray<HippyVirtualNode *> *subNodes = [self nodesWithOnlyCell];
        if ([subNodes count] > row) {
            HippyVirtualNode *node = subNodes[row];
            return node.frame.size;
        }
    }
    return CGSizeZero;
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

#pragma mark - UIScrollView Delegate

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    if (_onScroll) {
        CFTimeInterval now = CACurrentMediaTime();
        CFTimeInterval ti = (now - _lastOnScrollEventTimeInterval) * 1000.f;
        if (ti > _scrollEventThrottle || _allowNextScrollNoMatterWhat) {
            NSDictionary *eventData = [self scrollEventDataWithState:ScrollStateScrolling];
            _lastOnScrollEventTimeInterval = now;
            _onScroll(eventData);
            _allowNextScrollNoMatterWhat = NO;
        }
    }
    [NSObject cancelPreviousPerformRequestsWithTarget:self selector:@selector(purgeFurthestIndexPathsFromScreen) object:nil];
    [self performSelector:@selector(purgeFurthestIndexPathsFromScreen) withObject:nil afterDelay:.5f];
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
        if (self.onExposureReport) {
            HippyScrollState state = scrollView.decelerating ? ScrollStateScrolling : ScrollStateStop;
            NSDictionary *exposureInfo = [self scrollEventDataWithState:state];
            self.onExposureReport(exposureInfo);
        }
        // Fire a final scroll event
        _allowNextScrollNoMatterWhat = YES;
        [self scrollViewDidScroll:scrollView];
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndDragging:willDecelerate:)]) {
            [scrollViewListener scrollViewDidEndDragging:scrollView willDecelerate:decelerate];
        }
    }

    [_headerRefreshView scrollViewDidEndDragging];
    [_footerRefreshView scrollViewDidEndDragging];
}

- (void)scrollViewDidZoom:(UIScrollView *)scrollView NS_AVAILABLE_IOS(3_2) {

}

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    _allowNextScrollNoMatterWhat = YES; // Ensure next scroll event is recorded, regardless of throttle
    
    [self cancelTouch];
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView
                     withVelocity:(CGPoint)velocity
              targetContentOffset:(inout CGPoint *)targetContentOffset {
    if (velocity.y > 0) {
        if (self.onExposureReport) {
            NSDictionary *exposureInfo = [self scrollEventDataWithState:ScrollStateScrolling];
            self.onExposureReport(exposureInfo);
        }
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    // Fire a final scroll event
    _allowNextScrollNoMatterWhat = YES;
    [self scrollViewDidScroll:scrollView];
    
    if (self.onExposureReport) {
        NSDictionary *exposureInfo = [self scrollEventDataWithState:ScrollStateStop];
        self.onExposureReport(exposureInfo);
    }
}

- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView {
    // Fire a final scroll event
    _allowNextScrollNoMatterWhat = YES;
    [self scrollViewDidScroll:scrollView];
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
    return labs(diffCount);
}

- (NSInteger)differenceFromIndexPath:(NSIndexPath *)indexPath
            againstVisibleIndexPaths:(NSArray<NSIndexPath *> *)visibleIndexPaths {
    NSIndexPath *firstIndexPath = [visibleIndexPaths firstObject];
    NSIndexPath *lastIndexPath = [visibleIndexPaths lastObject];
    NSUInteger diffFirst = [self differenceFromIndexPath:indexPath againstAnother:firstIndexPath];
    NSUInteger diffLast = [self differenceFromIndexPath:indexPath againstAnother:lastIndexPath];
    return MIN(diffFirst, diffLast);
}

- (NSArray<NSIndexPath *> *)findFurthestIndexPathsFromScreen {
    NSUInteger visibleItemsCount = [[self.collectionView visibleCells] count];
    NSUInteger maxCachedItemCount = [self maxCachedItemCount] == NSUIntegerMax ? visibleItemsCount * 2 : [self maxCachedItemCount];
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
    if (furthestIndexPaths) {
        //purge view
        NSArray<NSNumber *> *objects = [_cachedItems objectsForKeys:furthestIndexPaths notFoundMarker:@(-1)];
        [self.bridge.uiManager removeNativeViewFromTags:objects];
        //purge cache
        [_cachedItems removeObjectsForKeys:furthestIndexPaths];
    }
}


- (void)didReceiveMemoryWarning {
    [self cleanUpCachedItems];
}

- (void)cleanUpCachedItems {
    //purge view
    NSArray<NSNumber *> *objects = [_cachedItems allValues];
    [self.bridge.uiManager removeNativeViewFromTags:objects];
    [_cachedItems removeAllObjects];
}


#pragma mark -
#pragma mark JS CALL Native
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
    // Ensure at least one scroll event will fire
    _allowNextScrollNoMatterWhat = YES;
    
    [self.collectionView setContentOffset:point animated:animated];
}

- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated {
    // Ensure at least one scroll event will fire
    _allowNextScrollNoMatterWhat = YES;
    
    NSInteger section = _containBannerView ? 1 : 0;
    [self.collectionView scrollToItemAtIndexPath:[NSIndexPath indexPathForRow:index inSection:section]
                                atScrollPosition:UICollectionViewScrollPositionTop
                                        animated:animated];
}

#pragma mark touch conflict
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
    } else
        return nil;
}

- (void)cancelTouch {
    HippyRootView *view = [self rootView];
    if (view) {
        [view cancelTouches];
    }
}

- (void)didMoveToSuperview {
    _rootView = nil;
}

- (void)didMoveToWindow {
    if (!self.window) {
        [NSObject cancelPreviousPerformRequestsWithTarget:self selector:@selector(purgeFurthestIndexPathsFromScreen) object:nil];
        [self purgeFurthestIndexPathsFromScreen];
    }
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end
