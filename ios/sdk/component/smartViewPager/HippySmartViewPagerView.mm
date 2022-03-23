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

#import "HippySmartViewPagerView.h"
#import "HippyBridge.h"
#import "UIView+Hippy.h"
#import "HippyScrollProtocol.h"
#import "HippyHeaderRefresh.h"
#import "HippyFooterRefresh.h"
#import "UIView+AppearEvent.h"
#import "HippyBaseListViewCell.h"
#import "HippyBaseListViewDataSource.h"
#import "UIView+RootViewRegister.h"
#import "UIView+Render.h"
#import "objc/runtime.h"

#define kInfiniteLoopBegin 2

static NSString *const kCellIdentifier = @"cellIdentifier";
static NSString *const kSupplementaryIdentifier = @"SupplementaryIdentifier";
static NSString *const kListViewItem = @"ListViewItem";

@interface HippySmartViewPagerView () <HippyRefreshDelegate> {
    __weak UIView *_rootView;
    BOOL _isInitialListReady;
    NSTimeInterval _lastScrollDispatchTime;
    NSArray<UICollectionViewCell *> *_previousVisibleCells;
    BOOL _manualScroll;
    NSTimer *_timer;
    CGFloat _itemWidth;
    NSInteger _currentPage;
    UICollectionViewFlowLayout *_viewPagerLayout;
    BOOL _adjustChildren;
}

@end

@implementation HippySmartViewPagerView

#pragma mark Life Cycle
- (instancetype)initWithFrame:(CGRect)frame {
    if (self = [super initWithFrame:frame]) {
        _isInitialListReady = NO;
        _dataSource = [[HippyBaseListViewDataSource alloc] init];
        self.dataSource.itemViewName = [self compoentItemName];
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
    _adjustChildren = NO;
    _itemWidth = self.hippyShadowView.frame.size.width;
    _pageGap = 0;
    _initialPage = 0;
    _autoplayTimeInterval = 3;
}

- (NSInteger)adjustAutoPlayCurrentPage:(NSInteger)currentPage {
    NSInteger adjustCurrentPage = currentPage;
    NSArray *children = self.hippyShadowView.hippySubviews;
    if (_circular) {
        if (currentPage >= children.count - kInfiniteLoopBegin) {
            adjustCurrentPage = children.count - kInfiniteLoopBegin;
        }
    } else {
        if (currentPage >= children.count) {
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
    NSArray *children = self.hippyShadowView.hippySubviews;
    if (_circular) {
        if (currentPage < 1) {
            adjustCurrentPage = 1;
        } else if (currentPage >= children.count - kInfiniteLoopBegin) {
            adjustCurrentPage = children.count - kInfiniteLoopBegin;
        }
    } else {
        if (currentPage <= 0) {
            adjustCurrentPage = 0;
        } else if (currentPage >= children.count - 1) {
            adjustCurrentPage = children.count - 1;
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
        NSArray *children = self.hippyShadowView.hippySubviews;
        if (_currentPage == 1) {
            _currentPage = children.count - kInfiniteLoopBegin - 1;
            isAdjust = YES;
        } else if (_currentPage == children.count - kInfiniteLoopBegin) {
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
    if (autoplayTimeInterval > 0 && _autoplayTimeInterval != autoplayTimeInterval) {
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
    NSArray *children = self.hippyShadowView.hippySubviews;
    NSInteger defaultPage = 0;
    if (_circular) {
        initialPage = initialPage + kInfiniteLoopBegin;
        if (initialPage >= 2 && initialPage <= children.count - 2) {
            defaultPage = initialPage;
        } else {
            defaultPage = kInfiniteLoopBegin;
        }
    } else {
        if (initialPage >= 0 && initialPage < children.count) {
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
    _currentPage = [self adjustInitialPage:_initialPage];
    self.collectionView.contentOffset = CGPointMake([self adjustScrollContentOffsetX:_currentPage], 0);
    if (!_circular) {
        self.collectionView.contentInset = UIEdgeInsetsMake(0, pageGap + previousMargin, 0, pageGap + nextMargin);
    }
    if (_autoplay && _autoplayTimeInterval > 0 && _timer == nil) {
        __weak __typeof(self) weakSelf = self;
        _timer = [NSTimer scheduledTimerWithTimeInterval:_autoplayTimeInterval repeats:YES block:^(NSTimer * _Nonnull timer) {
            __typeof(self) strongSelf = weakSelf;
            [strongSelf showNext];
        }];
    }
}

- (void)dealloc {
    [_timer invalidate];
    _timer = nil;
}

- (void)invalidate {
    [super invalidate];
}

#pragma mark Setter & Getter
- (NSString *)compoentItemName {
    return kListViewItem;
}

- (Class)listItemClass {
    return [HippyBaseListViewCell class];
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
    HippyAssert([cls isSubclassOfClass:[HippyBaseListViewCell class]], @"list item class must be a subclass of HippyBaseListViewCell");
    [self.collectionView registerClass:cls forCellWithReuseIdentifier:kCellIdentifier];
}

- (void)registerSupplementaryViews {
    [self.collectionView registerClass:[UICollectionReusableView class]
            forSupplementaryViewOfKind:UICollectionElementKindSectionHeader
                   withReuseIdentifier:kSupplementaryIdentifier];
}

- (void)setFrame:(CGRect)frame {
    [super setFrame:frame];
    [self setPreviousMargin:_previousMargin nextMargin:_nextMargin pageGap:_pageGap];
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

- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex {

}

- (void)didUpdateHippySubviews {
    [self refreshItemNodes];
    [self reloadData];
}

- (void)refreshItemNodes {
    if (_circular && !_adjustChildren) {
        _adjustChildren = YES;
        if (self.hippyShadowView.hippySubviews.count <=2) {
            _circular = NO;
            _currentPage = 0;
        } else {
            NSArray *originalSubViews = [NSArray arrayWithArray:self.hippyShadowView.hippySubviews];
            [self.hippyShadowView insertHippySubview:originalSubViews.firstObject atIndex:self.hippyShadowView.hippySubviews.count];
            [self.hippyShadowView insertHippySubview:originalSubViews[1] atIndex:self.hippyShadowView.hippySubviews.count];
            [self.hippyShadowView insertHippySubview:originalSubViews.lastObject atIndex:0];
            [self.hippyShadowView insertHippySubview:originalSubViews[originalSubViews.count - 2] atIndex:0];
        }
    }
    [self.dataSource setDataSource:self.hippyShadowView.hippySubviews containBannerView:NO];
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
    NSInteger number = [self.dataSource numberOfCellForSection:section];
    return number;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    HippyShadowView *cellShadowView = [self.dataSource cellForIndexPath:indexPath];
    HippyBaseListViewCell *cell = (HippyBaseListViewCell *)[collectionView dequeueReusableCellWithReuseIdentifier:kCellIdentifier forIndexPath:indexPath];
    UIView *cellView = [self.renderContext viewFromRenderViewTag:cellShadowView.hippyTag];
    if (!cellView) {
        cellView = [self.renderContext createViewRecursivelyFromShadowView:cellShadowView];
    }
    HippyAssert([cellView conformsToProtocol:@protocol(ViewAppearStateProtocol)],
        @"subviews of HippyBaseListViewCell must conform to protocol ViewAppearStateProtocol");
    cell.cellView = (UIView<ViewAppearStateProtocol> *)cellView;
    return cell;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView itemViewForItemAtIndexPath:(NSIndexPath *)indexPath {
    HippyCollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:kCellIdentifier forIndexPath:indexPath];
    return cell;
}

- (void)tableViewDidLayoutSubviews:(HippyListTableView *)tableView {
    NSArray<UICollectionViewCell *> *visibleCells = [self.collectionView visibleCells];
    for (HippyBaseListViewCell *cell in visibleCells) {
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
        for (HippyBaseListViewCell *cell in diff) {
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

// 手动拖拽结束
- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    if (self.onPageScrollStateChanged) {
        self.onPageScrollStateChanged(@{ @"pageScrollState": @"idle" });
    }
    
    [self adjustDidEndDeceleratingCurrentPage];
    
    if (_autoplay) {
        _timer.fireDate = [NSDate dateWithTimeIntervalSinceNow:_autoplayTimeInterval];
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

// 自动轮播结束
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

#pragma mark HippyRefresh Delegate
- (void)refreshView:(HippyRefresh *)refreshView statusChanged:(HippyRefreshStatus)status {
}
@end
