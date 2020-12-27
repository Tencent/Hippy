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

#import "HippyViewPager.h"
#import "UIView+Hippy.h"
#import "HippyLog.h"

@interface HippyViewPager()
@property (nonatomic, strong) NSMutableArray<UIView *> *viewPagerItems;
@property (nonatomic, assign) BOOL isScrolling;//视图正在滚动中
@property (nonatomic, assign) NSInteger cachedPosition;//onPageScroll的position的缓存，由于iOS的scrollview回弹机制，在一次滚动的后面容易position（即将滚动到的page的index）有噪点数据（想象在index为0时手指从左往右滑，会有一个回弹），而一次滚动其实postion是一致的，所以用缓存机制解决这个问题
@property (nonatomic, assign) BOOL loadOnce;//是否已经加载过一次
@property (nonatomic, assign) NSInteger pageOfBeginDragging;

@property (nonatomic, assign) CGRect previousFrame;
@property (nonatomic, assign) CGSize previousSize;
@property (nonatomic, copy) NSHashTable<id<UIScrollViewDelegate>> *scrollViewListener;
@property (nonatomic, assign) NSUInteger lastPageIndex;
@property (nonatomic, assign) CGRect originFrame;   // The original frame which is the front-end set.
@property (nonatomic, assign) BOOL isResettingContentOffset;

@end

@implementation HippyViewPager
#pragma mark life cycle
- (instancetype)initWithFrame:(CGRect)frame {
    if ((self = [super initWithFrame:frame])) {
        self.viewPagerItems = [NSMutableArray new];
        self.pagingEnabled = YES;
        self.contentOffset = CGPointZero;
        self.contentInset = UIEdgeInsetsZero;
        self.delegate = self;
//        self.pageOfBeginDragging = INT_MAX;
        self.cachedPosition = INT_MAX;
        self.showsHorizontalScrollIndicator = NO;
        self.showsVerticalScrollIndicator = NO;
        self.previousFrame = CGRectZero;
        self.scrollViewListener = [NSHashTable weakObjectsHashTable];
        self.lastPageIndex = NSUIntegerMax;
        self.pageSize = 1.f;
        self.middlePageOffset = CGFLOAT_MAX;
        self.originFrame = frame;
        // Need to support left and right content overflow display effect.
        self.clipsToBounds = NO;
    }
    return self;
}

#pragma mark hippy native methods

- (void)insertHippySubview:(UIView *)view atIndex:(NSInteger)atIndex {
    if (atIndex > self.viewPagerItems.count) {
        HippyLogWarn(@"Error In HippyViewPager: addSubview —— out of bound of array");
        return;
    }
    
    [super insertHippySubview:view atIndex:(  NSInteger)atIndex];
    [self.viewPagerItems insertObject:view atIndex:atIndex];
    if (_itemsChangedBlock) {
        _itemsChangedBlock([self.viewPagerItems count]);
    }

    UITapGestureRecognizer *tap = [[UITapGestureRecognizer alloc] init];
    [view addGestureRecognizer:tap];
}

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer
       shouldReceiveTouch:(UITouch *)touch {
    // In loop mode, user interaction is prohibited during scrolling.
    if ([self p_shouldLoop]) {
        return !self.isScrolling;
    }
    return YES;
}

- (void)removeHippySubview:(UIView *)subview {
    [super removeHippySubview:subview];
    [self.viewPagerItems removeObject:subview];
    if (_itemsChangedBlock) {
        _itemsChangedBlock([self.viewPagerItems count]);
    }
}

- (void)hippySetFrame:(CGRect)frame {
    [super hippySetFrame:frame];
    self.originFrame = frame;
}

- (void)didUpdateHippySubviews {
    [super didUpdateHippySubviews];
    [self refreshViewPager:NO invokeOnPageSelectd:NO];
}

- (void)invalidate {
    [_scrollViewListener removeAllObjects];
}

#pragma mark hippy js call methods

/*!
 @brief Get the validate pageNumber.
 */
- (NSInteger)p_getValidatePageNumer:(NSInteger)pageNumber {
    if (pageNumber >= 0 && pageNumber < self.viewPagerItems.count) {
        return pageNumber;
    }
    if ([self p_shouldLoop]) {
        if (pageNumber < 0) {
            return self.viewPagerItems.count - 1;
        }
        if (pageNumber >= self.viewPagerItems.count) {
            return 0;
        }
    }
    return pageNumber;
}

- (void)setPage:(NSInteger)pageNumber animated:(BOOL)animated {
    // Do not handle during the isDragging process to avoid jitter.
    if (self.isDragging) {
        return;
    }
    
    pageNumber = [self p_getValidatePageNumer:pageNumber];
    
    if (pageNumber >= self.viewPagerItems.count || pageNumber < 0) {
        HippyLogWarn(@"Error In ViewPager setPage: pageNumber invalid");
        return;
    }
    
    if ([self p_shouldLoop]) {
        [self p_setPageForLoop:pageNumber animated:animated];
    } else {
        UIView *theItem = self.viewPagerItems[pageNumber];
        [self setContentOffset:theItem.frame.origin animated:animated];
    }
    
    if (self.onPageSelected && _lastPageIndex != pageNumber) {
        self.onPageSelected(@{@"position": @(pageNumber)});
        _lastPageIndex = pageNumber;
    }
    if (self.onPageScrollStateChanged) {
        self.onPageScrollStateChanged(@{@"pageScrollState": @"idle"});
    }
}

#pragma mark scrollview delegate methods

/*!
 @brief Get the page and progress when scrolling
 */
- (void)p_getNowPageWhenScrollViewDidScroll:(NSInteger *)curPage offsetRate:(CGFloat *)curOffsetRate {
    NSInteger beforePage = self.pageOfBeginDragging;//滑动之前的pager的index
    
    CGFloat beforeOffsetX = beforePage * [self commonPagerWidth];
    CGFloat nowContentOffsetX = self.contentOffset.x;
    CGFloat betweenOffset = nowContentOffsetX - beforeOffsetX;
    CGFloat offsetRate = betweenOffset / [self commonPagerWidth];
    NSInteger nowPage = INT_MAX;
    if (self.cachedPosition == INT_MAX) {//未储值
        nowPage = offsetRate < 0 ? beforePage - 1: beforePage + 1;//左滑为-1，右滑为1
        if (nowPage == -1) {
            nowPage = 0;
        }
        if (nowPage == self.viewPagerItems.count) {
            nowPage = self.viewPagerItems.count -1;
        }
        self.cachedPosition = nowPage;
    } else {
        nowPage = self.cachedPosition;
    }
    *curPage = nowPage;
    *curOffsetRate = offsetRate;
}

/*!
 @brief In loop mode, get the page and progress when scrolling
 */
- (void)p_getNowPageWhenScrollViewDidScrollForLoop:(NSInteger *)curPage offsetRate:(CGFloat *)curOffsetRate {
    if (self.lastPageIndex == NSUIntegerMax) {
        *curPage = self.initialPage;
        *curOffsetRate = 0.f;
        return;
    }
    
    NSInteger draggingPage = self.pageOfBeginDragging;
    CGFloat beforeOffsetX = CGRectGetMinX([self.viewPagerItems objectAtIndex:draggingPage].frame);
    CGFloat nowContentOffsetX = self.contentOffset.x;
    CGFloat betweenOffset = nowContentOffsetX - beforeOffsetX;
    CGFloat offsetRate = betweenOffset / [self commonPagerWidth];
    NSInteger nowPage = INT_MAX;
    if (self.cachedPosition == INT_MAX) {
        if (self.isDragging) {
            nowPage = offsetRate < 0 ? [self p_getLoopPreIndex:draggingPage] : [self p_getLoopNextIndex:draggingPage];
        } else {
            // Trigger by the setContentOffset function.
            nowPage = self.lastPageIndex;
        }
        self.cachedPosition = nowPage;
    } else {
        nowPage = self.cachedPosition;
    }
    *curPage = nowPage;
    *curOffsetRate = offsetRate;
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    // In loop mode, do not check when is trigger by reset contentOffset.
    if ([self p_shouldLoop] && self.isResettingContentOffset) {
        return;
    }
    
    if (self.onPageScrollStateChanged) {
        NSString *state = scrollView.isDragging ? @"dragging" : @"settling";
        self.onPageScrollStateChanged(@{@"pageScrollState": state});
    }
    
    if (self.onPageScroll) {
        NSInteger nowPage = INT_MAX;
        CGFloat offsetRate = 0.f;
        if ([self p_shouldLoop]) {
            [self p_getNowPageWhenScrollViewDidScrollForLoop:&nowPage offsetRate:&offsetRate];
        } else {
            [self p_getNowPageWhenScrollViewDidScroll:&nowPage offsetRate:&offsetRate];
        }
        self.onPageScroll(@{
                            @"position": @(nowPage),
                            @"offset": @(offsetRate),
                            });
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollViewListener) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidScroll:)]) {
            [scrollViewListener scrollViewDidScroll:scrollView];
        }
    }
}

//用户拖拽的开始，也是整个滚动流程的开始
- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    self.pageOfBeginDragging = self.nowPage;
    self.isScrolling = YES;
    self.cachedPosition = INT_MAX;
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollViewListener) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginDragging:)]) {
            [scrollViewListener scrollViewWillBeginDragging:scrollView];
        }
    }
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    NSInteger thePage;
    if ([self p_shouldLoop]) {
        thePage = [self p_getEndDraggingPageIndexForLoop:targetContentOffset];
    } else {
        thePage = [self p_getEndDraggingPageIndex:targetContentOffset];
    }
    if (self.onPageSelected && _lastPageIndex != thePage) {
        self.onPageSelected(@{@"position": @(thePage)});
        _lastPageIndex = thePage;
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollViewListener) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillEndDragging:withVelocity:targetContentOffset:)]) {
            [scrollViewListener scrollViewWillEndDragging:scrollView
                                             withVelocity:velocity
                                      targetContentOffset:targetContentOffset];
        }
    }
}

/*!
 @brief Get the page index after dragging.
 */
- (NSInteger)p_getEndDraggingPageIndex:(inout CGPoint *)targetContentOffset {
    CGFloat nowContentOffsetX = (*targetContentOffset).x;
    NSInteger thePage = -1;
    if (fabs(nowContentOffsetX) < FLT_EPSILON) {
        thePage = 0;
    } else {
        for (int i = 0;i < self.viewPagerItems.count;i++) {
            UIView *pageItem = self.viewPagerItems[i];
            CGPoint point = [self middlePointOfView:pageItem];
            if (point.x > nowContentOffsetX) {
                thePage = i;
                break;
            }
        }
    }
    if (thePage == -1) {
        thePage = 0;
    } else if (thePage >= self.viewPagerItems.count) {
        thePage = self.viewPagerItems.count -1;
    }
    return thePage;
}

/*!
 @brief In loop mode, get the pageIndex after user end dragging.
 */
- (NSInteger)p_getEndDraggingPageIndexForLoop:(inout CGPoint *)targetContentOffset {
    CGFloat nowContentOffsetX = (*targetContentOffset).x;
    NSInteger thePage = self.lastPageIndex;

    if (nowContentOffsetX > self.frame.size.width * 1.5) {
        // Swipe right more than half a screen
        thePage = [self p_getLoopNextIndex:self.lastPageIndex];
    } else if (nowContentOffsetX < self.frame.size.width * 0.5) {
        // Swipe left more than half a screen
        thePage = [self p_getLoopPreIndex:self.lastPageIndex];
    }
    return thePage;
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollViewListener) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndDragging:willDecelerate:)]) {
            [scrollViewListener scrollViewDidEndDragging:scrollView willDecelerate:decelerate];
        }
    }
}

- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollViewListener) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginDecelerating:)]) {
            [scrollViewListener scrollViewWillBeginDecelerating:scrollView];
        }
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    [self p_resetContentOffsetForLoop:self.lastPageIndex];
    
    if (self.onPageScrollStateChanged) {
        self.onPageScrollStateChanged(@{@"pageScrollState": @"idle"});
    }
    self.isScrolling = NO;
    self.cachedPosition = INT_MAX;
    self.pageOfBeginDragging = 0;
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollViewListener) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndDecelerating:)]) {
            [scrollViewListener scrollViewDidEndDecelerating:scrollView];
        }
    }
}

- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollViewListener) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidEndScrollingAnimation:)]) {
            [scrollViewListener scrollViewDidEndScrollingAnimation:scrollView];
        }
    }
    self.isScrolling = NO;
    self.cachedPosition = INT_MAX;
    self.pageOfBeginDragging = 0;
    [self p_resetContentOffsetForLoop:self.lastPageIndex];
}

- (void)scrollViewDidScrollToTop:(UIScrollView *)scrollView {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollViewListener) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidScrollToTop:)]) {
            [scrollViewListener scrollViewDidScrollToTop:scrollView];
        }
    }
}

#pragma mark scrollview listener methods
- (void)addScrollListener:(id<UIScrollViewDelegate>)scrollListener
{
    [_scrollViewListener addObject: scrollListener];
}

- (void)removeScrollListener:(id<UIScrollViewDelegate>)scrollListener
{
    [_scrollViewListener removeObject: scrollListener];
}

#pragma mark other methods
- (NSUInteger)pageCount {
    return [_viewPagerItems count];
}

- (void)setContentOffset:(CGPoint)contentOffset {
    _targetOffset = contentOffset;
    [super setContentOffset:contentOffset];
}

- (void)setContentOffset:(CGPoint)contentOffset animated:(BOOL)animated {
    _targetOffset = contentOffset;
    [super setContentOffset:contentOffset animated:animated];
}

- (CGFloat)commonPagerWidth {
    if ([self.viewPagerItems count] == 0) {
        return self.frame.size.width;
    }
    return self.viewPagerItems[0].frame.size.width;
}


- (void)hippyBridgeDidFinishTransaction {
    BOOL isFrameEqual = CGRectEqualToRect(self.frame, self.previousFrame);
    BOOL isContentSizeEqual = CGSizeEqualToSize(self.contentSize, self.previousSize);
    
    if (!isContentSizeEqual || !isFrameEqual) {
        self.previousFrame = self.frame;
        self.previousSize = self.contentSize;
        [self refreshViewPager:YES invokeOnPageSelectd:YES];
    }
}

/*!
 @brief Update the viewPagerItems' frames.
 */
- (void)p_updateViewPagerItemsFrame {
    if (self.viewPagerItems.count == 0) {
        return;
    }
    
    CGFloat pageItemWidth = CGRectGetWidth(self.frame);
    CGFloat left = 0;
    UIView *firstPageItem = [self.viewPagerItems firstObject];
    CGFloat top = [self rightPointOfView:firstPageItem].y;
    
    for (int i = 0; i < self.viewPagerItems.count; ++i) {
        UIView *theViewPagerItemItem = self.viewPagerItems[i];
        CGRect theFrame = CGRectMake(left,
                                     top,
                                     pageItemWidth,
                                     theViewPagerItemItem.frame.size.height);
        theViewPagerItemItem.frame = theFrame;
        left = [self rightPointOfView:theViewPagerItemItem].x;
    }
}

/*!
 @brief Update pager's real frame.
 */
- (void)p_updatePagerRealFrame {
    CGFloat width;
    if (fabs(self.pageSize) < FLT_EPSILON) {
        width = CGRectGetWidth(self.originFrame);
    } else {
        width = CGRectGetWidth(self.originFrame) * self.pageSize;
        width = floor(width);
    }
    CGFloat left;
    if (fabs(self.middlePageOffset - CGFLOAT_MAX) < FLT_EPSILON) {
        left = (CGRectGetWidth([UIScreen mainScreen].bounds) - width) / 2;
    } else {
        left = self.middlePageOffset;
    }
    self.frame = CGRectMake(left,
                            CGRectGetMinY(self.originFrame),
                            width,
                            CGRectGetHeight(self.originFrame));
}

- (void)refreshViewPager:(BOOL)needResetToInitialPage invokeOnPageSelectd:(BOOL)invokeOnPageSelectd {
    if (!self.viewPagerItems.count) {
        return;
    }
    
    // update self frame
    [self p_updatePagerRealFrame];
    
    // update viewPagerItems' frame
    [self p_updateViewPagerItemsFrame];
    
    if (self.initialPage >= self.viewPagerItems.count) {
        HippyLogWarn(@"Error In HippyViewPager: layoutSubviews");
        self.contentSize = CGSizeZero;
        return;
    }
    
    //如果是第一次加载，那么走initialPage的逻辑
    if (needResetToInitialPage) {
        UIView *theItem = self.viewPagerItems[self.initialPage];
        self.contentOffset = theItem.frame.origin;
    }

    //如果是删除的最后一个pager，那么会有越位风险？
    if (self.contentOffset.x > self.contentSize.width && 0 != self.contentSize.width) {
        self.contentOffset = CGPointMake(0, self.contentSize.width);
    }

    UIView *lastViewPagerItem = self.viewPagerItems.lastObject;
    if (!lastViewPagerItem) {
        HippyLogWarn(@"Error In HippyViewPager: addSubview");
        self.contentSize = CGSizeZero;
        return;
    }
    
    if ([self p_shouldLoop]) {
        // In loop mode, use the three page's width to implemention the pager scolling.
        self.contentSize = CGSizeMake(self.frame.size.width * 3,
                                      lastViewPagerItem.frame.origin.y + lastViewPagerItem.frame.size.height);
    } else {
        self.contentSize = CGSizeMake(lastViewPagerItem.frame.origin.x + lastViewPagerItem.frame.size.width,
                                      lastViewPagerItem.frame.origin.y + lastViewPagerItem.frame.size.height);
    }

    if (self.onPageSelected && NO == CGSizeEqualToSize(CGSizeZero, self.contentSize) && invokeOnPageSelectd) {
        NSUInteger currentPageIndex;
        if ([self p_shouldLoop]) {
            if (needResetToInitialPage) {
                currentPageIndex = self.initialPage;
            } else {
                currentPageIndex = (self.lastPageIndex >= self.viewPagerItems.count) ? 0 : self.lastPageIndex;
            }
        } else {
            currentPageIndex = self.contentOffset.x / CGRectGetWidth(self.bounds);
        }
        if (currentPageIndex != _lastPageIndex) {
            _lastPageIndex = currentPageIndex;
            self.onPageSelected(@{@"position": @(currentPageIndex)});
        }
    }
    
    [self p_resetContentOffsetForLoop:self.lastPageIndex];
}

- (NSUInteger)nowPage {
    NSInteger thePage = -1;
    
    if ([self p_shouldLoop]) {
        if (self.lastPageIndex > self.viewPagerItems.count) {
            return 0;
        }
        return self.lastPageIndex;
    } else {
        CGFloat nowX = self.contentOffset.x;
        if (fabs(nowX)<FLT_EPSILON) {
            return 0;
        }
        for (int i = 0;i < self.viewPagerItems.count;i++) {
            UIView *pageItem = self.viewPagerItems[i];
            CGPoint point = [self middlePointOfView:pageItem];
            if (point.x > nowX) {
                thePage = i;
                break;
            }
        }
    }
    
    if (thePage < 0) {
        HippyLogWarn(@"Error In ViewPager nowPage: thePage invalid");
        return 0;
    } else {
        return (NSUInteger)thePage;
    }
}

//计算某个view的frame的右上角顶点的坐标
- (CGPoint)rightPointOfView:(UIView *)view {
    CGFloat x = view.frame.origin.x + view.frame.size.width;
    CGFloat y = view.frame.origin.y;
    return CGPointMake(x, y);
}

- (CGPoint)middlePointOfView:(UIView *)view {
    CGFloat x = view.frame.origin.x + view.frame.size.width*0.5;
    CGFloat y = view.frame.origin.y;
    return CGPointMake(x, y);
}

//自动翻页
- (void)autoPageDown {
    //滚动流程中不允许轮播
    if (self.isScrolling) {
        return;
    }
    
    if ([self p_shouldLoop]) {
        self.pageOfBeginDragging = self.nowPage;
        NSInteger nextPage = (self.nowPage + 1) % self.viewPagerItems.count;
        [self setPage:nextPage animated:YES];
    } else {
        NSInteger nextPage = self.nowPage + 1;
        if (nextPage < self.viewPagerItems.count) {
            self.pageOfBeginDragging = self.nowPage;
            [self setPage:nextPage animated:YES];
        }
    }
}

#pragma mark - Loop

/*!
 @brief In loop mode, go to the page with animation.
 */
- (void)p_setPageForLoop:(NSInteger)pageNumber animated:(BOOL)animated {
    if (![self p_shouldLoop]) {
        return;
    }
    
    if (self.lastPageIndex == pageNumber) {
        return;
    }
    
    if (animated) {
        // To simulate animation by yourself, you need to manually set isScrolling.
        self.isScrolling = YES;
        [UIView animateWithDuration:.3f
                         animations:^{
            if (pageNumber == [self p_getLoopNextIndex:self.lastPageIndex]) {
                // scroll to next page.
                [self setContentOffset:CGPointMake(self.frame.size.width * 2, self.contentOffset.y) animated:NO];
            } else if (pageNumber == [self p_getLoopPreIndex:self.lastPageIndex]) {
                // scroll to pre page.
                [self setContentOffset:CGPointMake(0, self.contentOffset.y) animated:NO];
            }
        } completion:^(BOOL finished) {
            self.isScrolling = NO;
            self.cachedPosition = INT_MAX;
            self.pageOfBeginDragging = 0;
            
            [self p_resetContentOffsetForLoop:self.lastPageIndex];
        }];
    } else {
        [self p_resetContentOffsetForLoop:pageNumber];
    }
}

/*!
 @brief In loop mode, reset pager's contentOffset and viewPagerItems' frames.
 @discussion When switching to a new page, check and adjust the contentOffset to achieve circular scrolling.
 Use three pageSize widths to achieve circular scrolling; each time the scrolling stops, reset the current contentOffset,
 Make it stay in the middle position, and then set the left, middle and right three specific contents to the corresponding positions;
 other contents that are not in the current scope, Set a larger offset to make it off the screen.
 @param pageNumber The position of the content to be displayed in the data.
 */
- (void)p_resetContentOffsetForLoop:(NSUInteger)pageNumber {
    if (![self p_shouldLoop]) {
        return;
    }
    
    // Keep in the second page.
    self.isResettingContentOffset = YES;
    self.contentOffset = CGPointMake(CGRectGetWidth(self.frame), 0);
    
    // totalCount has been protected by p_shouldLoop, the number must be greater than or equal to 3
    NSUInteger totalCount = self.viewPagerItems.count;
    NSUInteger current = (pageNumber >= totalCount) ? 0 : pageNumber;
    NSUInteger pre = (totalCount + current - 1) % totalCount;
    NSUInteger next = (current + 1) % totalCount;
    // Setting prePre and nextNext can effectively avoid setting middlePageOffset, and when scrolling stops to check left and right, the side will be blank.
    // Don't worry about prePre and nextNext being repeated with the previous three values. In the subsequent traversal, the first three values will be processed first.
    NSUInteger prePre = (totalCount + current - 2) % totalCount;
    NSUInteger nextNext = (current + 2) % totalCount;
    
    CGFloat contentWidth = CGRectGetWidth(self.frame);
    [self.viewPagerItems enumerateObjectsUsingBlock:^(UIView * _Nonnull view, NSUInteger idx, BOOL * _Nonnull stop) {
        CGFloat left = 0;
        if (idx == pre) {
            left = 0;
        } else if (idx == current) {
            left = contentWidth;
        } else if (idx == next) {
            left = contentWidth * 2;
        } else if (idx == prePre) {
            left = -CGRectGetWidth(view.frame);
        } else if (idx == nextNext) {
            left = contentWidth * 3;
        } else {
            left = contentWidth * 4;
        }
        view.frame = CGRectMake(left, view.frame.origin.y, view.frame.size.width, view.frame.size.height);
    }];
    self.isResettingContentOffset = NO;
}

/*!
 @brief In loop mode, get the pre index of current Index.
 */
- (NSInteger)p_getLoopPreIndex:(NSInteger)curIndex {
    if (![self p_shouldLoop]) {
        return 0;
    }
    if (curIndex <= 0) {
        return self.viewPagerItems.count - 1;
    }
    return curIndex - 1;
}

/*!
 @brief In loop mode, get the next index of current Index.
 */
- (NSInteger)p_getLoopNextIndex:(NSInteger)curIndex {
    if (![self p_shouldLoop]) {
        return 0;
    }
    if (curIndex >= self.viewPagerItems.count - 1) {
        return 0;
    }
    return curIndex + 1;
}

/*！
 @brief Enable loop or not
*/
- (BOOL)p_shouldLoop {
    // Because you need to support left and right sliding, the number of content cannot be less than three.
    return self.loop && self.viewPagerItems.count >= 3;
}

@end
