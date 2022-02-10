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

#import "HippyBaseListView.h"
#import "HippyBridge.h"
#import "UIView+Hippy.h"
#import "HippyScrollProtocol.h"
#import "HippyHeaderRefresh.h"
#import "HippyFooterRefresh.h"
#import "UIView+AppearEvent.h"
#import "HippyBaseListViewCell.h"
#import "HippyBaseListViewDataSource.h"
#import "UIView+RootViewRegister.h"

#define kCellZIndexConst 10000.f

@interface HippyBaseListView () <HippyScrollProtocol, HippyRefreshDelegate> {
    __weak HippyBridge *_bridge;
    __weak UIView *_rootView;
    NSHashTable *_scrollListeners;
    BOOL _isInitialListReady;
    NSUInteger _preNumberOfRows;
    NSTimeInterval _lastScrollDispatchTime;
    HippyHeaderRefresh *_headerRefreshView;
    HippyFooterRefresh *_footerRefreshView;
    NSArray<HippyBaseListViewCell *> *_previousVisibleCells;
    HippyBaseListViewDataSource *_dataSource;
}

@end

@implementation HippyBaseListView

- (instancetype)initWithBridge:(HippyBridge *)bridge {
    if (self = [super initWithFrame:CGRectZero]) {
        _bridge = bridge;
        _scrollListeners = [NSHashTable weakObjectsHashTable];
        _isInitialListReady = NO;
        _preNumberOfRows = 0;
        _preloadItemNumber = 1;
        _dataSource = [[HippyBaseListViewDataSource alloc] init];
        [_dataSource setItemViewsName:[self listViewCellName]];
        [self initTableView];
    }

    return self;
}

- (void)invalidate {
    [_scrollListeners removeAllObjects];
}

- (NSString *)listViewCellName {
    return @"ListViewItem";
}

- (Class)listViewCellClass {
    return [HippyBaseListViewCell class];
}

- (void)initTableView {
    if (_tableView == nil) {
        _tableView = [[HippyListTableView alloc] initWithFrame:CGRectZero style:UITableViewStylePlain];
        _tableView.dataSource = self;
        _tableView.delegate = self;
        _tableView.layoutDelegate = self;
        _tableView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        _tableView.backgroundColor = [UIColor clearColor];
        _tableView.allowsSelection = NO;
        _tableView.estimatedRowHeight = 0;
        _tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
#ifdef __IPHONE_15_0
        if (@available(iOS 15.0, *)) {
            [_tableView setSectionHeaderTopPadding:0.0f];
        }
#endif
        if (@available(iOS 11.0, *)) {
            _tableView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
            _tableView.insetsContentViewsToSafeArea = NO;
        }

        [self addSubview:_tableView];
    }
}

- (void)setPreloadItemNumber:(NSUInteger)preloadItemNumber {
    _preloadItemNumber = MAX(1, preloadItemNumber);
}

- (BOOL)flush {
    [self refreshItemNodes];
    return YES;
}

- (void)reloadData {
    [_tableView reloadData];
    if (self.initialContentOffset) {
        [_tableView setContentOffset:CGPointMake(0, self.initialContentOffset) animated:NO];
        self.initialContentOffset = 0;
    }
    if (!_isInitialListReady) {
        _isInitialListReady = YES;
        if (self.initialListReady) {
            self.initialListReady(@{});
        }
    }
}

- (void)setFrame:(CGRect)frame {
    [super setFrame:frame];
}

- (void)hippySetFrame:(CGRect)frame {
    [super hippySetFrame:frame];
    _tableView.frame = self.bounds;
}

- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    if ([subview isKindOfClass:[HippyHeaderRefresh class]]) {
        if (_headerRefreshView) {
            [_headerRefreshView unsetFromScrollView];
        }
        _headerRefreshView = (HippyHeaderRefresh *)subview;
        [_headerRefreshView setScrollView:self.tableView];
        _headerRefreshView.delegate = self;
    } else if ([subview isKindOfClass:[HippyFooterRefresh class]]) {
        if (_footerRefreshView) {
            [_footerRefreshView unsetFromScrollView];
        }
        _footerRefreshView = (HippyFooterRefresh *)subview;
        [_footerRefreshView setScrollView:self.tableView];
        _footerRefreshView.delegate = self;
    }
}

- (void)didUpdateHippySubviews {
    [super didUpdateHippySubviews];
    [self refreshItemNodes];
    [self reloadData];
}

- (void)refreshItemNodes {
    [_dataSource setDataSource:self.hippyShadowView.hippySubviews];
}

#pragma mark -Scrollable

- (void)setScrollEnabled:(BOOL)value {
    [_tableView setScrollEnabled:value];
}

- (void)scrollToOffset:(__unused CGPoint)offset {
}

- (void)scrollToOffset:(__unused CGPoint)offset animated:(__unused BOOL)animated {
}

- (void)zoomToRect:(__unused CGRect)rect animated:(__unused BOOL)animated {
}

- (void)addScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener {
    [_scrollListeners addObject:scrollListener];
}

- (void)removeScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener {
    [_scrollListeners removeObject:scrollListener];
}

- (UIScrollView *)realScrollView {
    return self.tableView;
}

- (CGSize)contentSize {
    return self.tableView.contentSize;
}

- (NSHashTable *)scrollListeners {
    return _scrollListeners;
}

- (void)scrollToContentOffset:(CGPoint)offset animated:(BOOL)animated {
    [self.tableView setContentOffset:offset animated:animated];
}

- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated {
    NSIndexPath *indexPath = [_dataSource indexPathForFlatIndex:index];
    if (indexPath != nil) {
        [self.tableView scrollToRowAtIndexPath:indexPath atScrollPosition:UITableViewScrollPositionTop animated:animated];
    }
}

#pragma mark - Delegate & Datasource

- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath {
    return self.editable;
}

- (NSString *)tableView:(UITableView *)tableView titleForDeleteConfirmationButtonForRowAtIndexPath:(NSIndexPath *)indexPath {
    NSString *delText = self.hippyShadowView.props[@"delText"];
    return delText;
}

- (BOOL)tableView: (UITableView *)tableView shouldIndentWhileEditingRowAtIndexPath:(NSIndexPath *)indexPath {		
	return NO;
}

- (void)tableView:(UITableView *)tableView commitEditingStyle:(UITableViewCellEditingStyle)editingStyle forRowAtIndexPath:(NSIndexPath *)indexPath {
    if (UITableViewCellEditingStyleDelete == editingStyle) {
        if (self.onDelete) {
            NSInteger index = [_dataSource flatIndexForIndexPath:indexPath];
            self.onDelete(@{@"index": @(index)});
        }
    }
}

- (NSInteger)numberOfSectionsInTableView:(__unused UITableView *)tableView {
    return [_dataSource numberOfSection];
}

- (CGFloat)tableView:(__unused UITableView *)tableView heightForHeaderInSection:(NSInteger)section {
    HippyShadowView *header = [_dataSource headerForSection:section];
    if (header) {
        return CGRectGetHeight(header.frame);
    } else
        return 0.00001;
}

- (UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section {
    //TODO create view with reusable view
    HippyShadowView *header = [_dataSource headerForSection:section];
    return [_bridge.uiManager viewForHippyTag:header.hippyTag];
}

- (CGFloat)tableView:(__unused UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    HippyShadowView *itemView = [_dataSource cellForIndexPath:indexPath];
    return itemView.frame.size.height;
}

- (NSInteger)tableView:(__unused UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return [_dataSource numberOfCellForSection:section];
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    HippyShadowView *cellShadowView = [_dataSource cellForIndexPath:indexPath];
    NSInteger index = [_dataSource flatIndexForIndexPath:indexPath];
    if (self.onRowWillDisplay) {
        self.onRowWillDisplay(@{
            @"index": @(index),
            @"frame": @ {
                @"x": @(CGRectGetMinX(cellShadowView.frame)),
                @"y": @(CGRectGetMinY(cellShadowView.frame)),
                @"width": @(CGRectGetWidth(cellShadowView.frame)),
                @"height": @(CGRectGetHeight(cellShadowView.frame))
            }
        });
    }

    if (self.onEndReached) {
        NSInteger lastSectionIndex = [self numberOfSectionsInTableView:tableView] - 1;
        NSInteger lastRowIndexInSection = [self tableView:tableView numberOfRowsInSection:lastSectionIndex] - _preloadItemNumber;
        if (lastRowIndexInSection < 0) {
            lastRowIndexInSection = 0;
        }

        BOOL isLastIndex = [indexPath section] == lastSectionIndex && [indexPath row] == lastRowIndexInSection;

        if (isLastIndex) {
            self.onEndReached(@{});
        }
    }
}

- (void)tableView:(UITableView *)tableView didEndDisplayingCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    HippyShadowView *cellShadowView = [_dataSource cellForIndexPath:indexPath];
    //FIXME use identifier
    HippyBaseListViewCell *cell = (HippyBaseListViewCell *)[tableView dequeueReusableCellWithIdentifier:@"identifier"];
    if (nil == cell) {
        Class cls = [self listViewCellClass];
        NSAssert([cls isSubclassOfClass:[HippyBaseListViewCell class]], @"listViewCellClass must return a subclass of HippyShadowView");
        cell = [[cls alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"identifier"];
        cell.tableView = tableView;
    }
    //FIXME use cache for cell view creation
    UIView *cellView = [_bridge.uiManager viewForHippyTag:cellShadowView.hippyTag];
    if (!cellView) {
        id shadowView = [_bridge.uiManager shadowViewForHippyTag:cellShadowView.hippyTag];
        cellView = [_bridge.uiManager createViewRecursivelyFromShadowView:shadowView];
    }
    cell.layer.zPosition = [self zPositionOfCell:cell forRowAtIndexPath:indexPath];
    HippyAssert([cellView conformsToProtocol:@protocol(ViewAppearStateProtocol)],
        @"subviews of HippyBaseListViewCell must conform to protocol ViewAppearStateProtocol");
    cell.cellView = (UIView<ViewAppearStateProtocol> *)cellView;
//    cell.node = indexNode;
//    cell.node.cell = cell;
    return cell;
}

- (void)tableViewDidLayoutSubviews:(HippyListTableView *)tableView {
    NSArray<HippyBaseListViewCell *> *visibleCells = [self.tableView visibleCells];
    for (HippyBaseListViewCell *cell in visibleCells) {
        CGRect cellRectInTableView = [self.tableView convertRect:[cell bounds] fromView:cell];
        CGRect intersection = CGRectIntersection(cellRectInTableView, [self.tableView bounds]);
        if (CGRectEqualToRect(cellRectInTableView, intersection)) {
            [cell setCellShowState:CellFullShowState];
        } else if (!CGRectIsNull(intersection)) {
            [cell setCellShowState:CellHalfShowState];
        }
    }
    if (_previousVisibleCells && ![_previousVisibleCells isEqualToArray:visibleCells]) {
        NSMutableArray<HippyBaseListViewCell *> *diff = [_previousVisibleCells mutableCopy];
        [diff removeObjectsInArray:visibleCells];
        for (HippyBaseListViewCell *cell in diff) {
            [cell setCellShowState:CellNotShowState];
        }
    }
    _previousVisibleCells = visibleCells;
}

- (CGFloat)zPositionOfCell:(HippyBaseListViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    return [indexPath section] * kCellZIndexConst + [indexPath row];
}

- (CGFloat)zPositionOfSectionView:(UIView *)sectionView forSection:(NSInteger)section {
    CGFloat zPositionForFirstCellInSection = section * kCellZIndexConst;
    NSInteger numberOfRowsInSection = [self.tableView numberOfRowsInSection:section];
    //make sure section view's zPosition is higher than last cell's in section {section}
    return zPositionForFirstCellInSection + numberOfRowsInSection;
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

    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidScroll:)]) {
            [scrollViewListener scrollViewDidScroll:scrollView];
        }
    }

    [_headerRefreshView scrollViewDidScroll];
    [_footerRefreshView scrollViewDidScroll];
}

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    if (self.onScrollBeginDrag) {
        self.onScrollBeginDrag([self scrollBodyData]);
    }
    _manualScroll = YES;
    [self cancelTouch];
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginDragging:)]) {
            [scrollViewListener scrollViewWillBeginDragging:scrollView];
        }
    }
}

- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView {
    if (self.onMomentumScrollBegin) {
        self.onMomentumScrollBegin([self scrollBodyData]);
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginDecelerating:)]) {
            [scrollViewListener scrollViewWillBeginDecelerating:scrollView];
        }
    }
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
    if (!decelerate) {
        _manualScroll = NO;
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
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
        self.onScrollEndDrag([self scrollBodyData]);
    }

    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
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
        self.onMomentumScrollEnd([self scrollBodyData]);
    }

    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndDecelerating:)]) {
            [scrollViewListener scrollViewDidEndDecelerating:scrollView];
        }
    }
}

- (void)scrollViewWillBeginZooming:(UIScrollView *)scrollView withView:(UIView *)view {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginZooming:withView:)]) {
            [scrollViewListener scrollViewWillBeginZooming:scrollView withView:view];
        }
    }
}

- (void)scrollViewDidZoom:(UIScrollView *)scrollView {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidZoom:)]) {
            [scrollViewListener scrollViewDidZoom:scrollView];
        }
    }
}

- (void)scrollViewDidEndZooming:(UIScrollView *)scrollView withView:(UIView *)view atScale:(CGFloat)scale {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndZooming:withView:atScale:)]) {
            [scrollViewListener scrollViewDidEndZooming:scrollView withView:view atScale:scale];
        }
    }
}

- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndScrollingAnimation:)]) {
            [scrollViewListener scrollViewDidEndScrollingAnimation:scrollView];
        }
    }
}

- (NSDictionary *)scrollBodyData {
    return @{ @"contentOffset": @ { @"x": @(_tableView.contentOffset.x), @"y": @(_tableView.contentOffset.y) } };
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

- (void)cancelTouch {
    UIView *view = [self rootView];
    if (view) {
        [view cancelTouches];
    }
}

- (void)didMoveToSuperview {
    _rootView = nil;
}

- (BOOL)isManualScrolling {
    return _manualScroll;
}

- (void)setBounces:(BOOL)bounces {
    [_tableView setBounces:bounces];
}

- (BOOL)bounces {
    return [_tableView bounces];
}

- (void)setShowScrollIndicator:(BOOL)show {
    [_tableView setShowsVerticalScrollIndicator:show];
}

- (BOOL)showScrollIndicator {
    return [_tableView showsVerticalScrollIndicator];
}

- (void)dealloc {
    [_headerRefreshView unsetFromScrollView];
    [_footerRefreshView unsetFromScrollView];
}

#pragma mark HippyRefresh Delegate
- (void)refreshView:(HippyRefresh *)refreshView statusChanged:(HippyRefreshStatus)status {
}
@end
