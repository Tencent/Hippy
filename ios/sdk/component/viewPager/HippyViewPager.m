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
@property (nonatomic, assign) CGRect originFrame;   // 记录原始尺寸

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
        self.pageSize = 0.f;
        self.middlePageOffset = 0.f;
        self.originFrame = frame;
        // 需要支持左右内容溢出显示效果
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
    // 循环模式下，滚动过程中，禁止用户交互
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

- (void)setPage:(NSInteger)pageNumber animated:(BOOL)animated {
    // 滚动过程中，不处理，避免抖动
    if (self.isScrolling) {
        return;
    }
    
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
 @brief 非循环模式下，获取需要切换的页面和进度
 @discussion 原有逻辑，仅抽取成为新函数，自动播放模式下存在一些问题
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
 @brief 循环模式下，获取需要切换的页面和进度
 @discussion 自动播放模式下存在一些问题
 */
- (void)p_getNowPageWhenScrollViewDidScrollForLoop:(NSInteger *)curPage offsetRate:(CGFloat *)curOffsetRate {
    if (self.lastPageIndex == NSUIntegerMax) {
        *curPage = self.initialPage;
        *curOffsetRate = 0.f;
        return;
    }
    
    CGFloat beforeOffsetX = CGRectGetMinX([self.viewPagerItems objectAtIndex:self.lastPageIndex].frame);
    CGFloat nowContentOffsetX = self.contentOffset.x;
    CGFloat betweenOffset = nowContentOffsetX - beforeOffsetX;
    CGFloat offsetRate = betweenOffset / [self commonPagerWidth];
    NSInteger nowPage = INT_MAX;
    if (self.cachedPosition == INT_MAX) {//未储值
        if (self.isDragging) {
            // 由用户拖拽触发
            nowPage = offsetRate < 0 ? [self p_getLoopPreIndex:self.lastPageIndex] : [self p_getLoopNextIndex:self.lastPageIndex];
        } else {
            // 由代码setContentOffset触发
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
                            @"position": @(nowPage),//备注：xq说这里的position是拖动时即将停下的pager的index（非手指拽的那个）
                            @"offset": @(offsetRate),//备注：xq说这里是比例，取值-1到1;
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
 @brief 获取停止拖拽后当前的pageIndex
 */
- (NSInteger)p_getEndDraggingPageIndex:(inout CGPoint *)targetContentOffset {
    CGFloat nowContentOffsetX = (*targetContentOffset).x;
    NSInteger thePage = -1;
    if (fabs(nowContentOffsetX)<FLT_EPSILON) {
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
 @brief 循环滚动模式下，获取停止拖拽后当前的pageIndex
 @discussion 循环模式使用三个page宽度实现循环滚动
 */
- (NSInteger)p_getEndDraggingPageIndexForLoop:(inout CGPoint *)targetContentOffset {
    //loop循环
    CGFloat nowContentOffsetX = (*targetContentOffset).x;
    NSInteger thePage = self.lastPageIndex;

    if (nowContentOffsetX > self.frame.size.width * 1.5) {
        //右滑超过半屏
        thePage = [self p_getLoopNextIndex:self.lastPageIndex];
    } else if (nowContentOffsetX < self.frame.size.width * 0.5){
        //左滑超过半屏
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
 @brief 更新viewPagerItems的frame
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
 @brief 更新pager的真实frame
 */
- (void)p_updatePagerRealFrame {
    CGFloat width;
    if (fabs(self.pageSize) < FLT_EPSILON) {
        width = CGRectGetWidth(self.originFrame);
    } else {
        width = CGRectGetWidth(self.originFrame) * self.pageSize;
    }
    self.frame = CGRectMake(self.middlePageOffset,
                            CGRectGetMinY(self.originFrame),
                            width,
                            CGRectGetHeight(self.originFrame));
}

- (void)refreshViewPager:(BOOL)needResetToInitialPage invokeOnPageSelectd:(BOOL)invokeOnPageSelectd {
    if (!self.viewPagerItems.count) {
        return;
    }
    
    // 更新自身这是的frame
    [self p_updatePagerRealFrame];
    
    // 更新viewPagerItems的frame
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
        // 循环滚动模式下，滑动使用3个page的宽度来实现滚动
        self.contentSize = CGSizeMake(self.frame.size.width * 3,
                                      lastViewPagerItem.frame.origin.y + lastViewPagerItem.frame.size.height);
    } else {
        self.contentSize = CGSizeMake(lastViewPagerItem.frame.origin.x + lastViewPagerItem.frame.size.width,
                                      lastViewPagerItem.frame.origin.y + lastViewPagerItem.frame.size.height);
    }

    if (self.onPageSelected && NO == CGSizeEqualToSize(CGSizeZero, self.contentSize) && invokeOnPageSelectd) {
        NSUInteger currentPageIndex;
        if ([self p_shouldLoop]) {
            // 循环滚动模式下，使用lastPageIndex自己维护
            if (needResetToInitialPage) {
                currentPageIndex = self.initialPage;
            } else {
                currentPageIndex = (self.lastPageIndex >= self.viewPagerItems.count) ? 0 : self.lastPageIndex;
            }
        } else {
            // 非循环模式下，通过真实偏移量计算当前索引
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
        NSInteger nextPage = (self.nowPage + 1) % self.viewPagerItems.count;
        [self setPage:nextPage animated:YES];
    } else {
        NSInteger nextPage = self.nowPage + 1;
        if (nextPage < self.viewPagerItems.count) {
            [self setPage:nextPage animated:YES];
        }
    }
}

#pragma mark - Loop

/*!
 @brief 在循环滚动设置下，将页面滚动到设置位置
 */
- (void)p_setPageForLoop:(NSInteger)pageNumber animated:(BOOL)animated {
    if (![self p_shouldLoop]) {
        return;
    }
    
    // 页面相同，无需调整
    if (self.lastPageIndex == pageNumber) {
        return;
    }
    
    if (animated) {
        // 自己模拟做动画，需要手动设置isScrolling
        self.isScrolling = YES;
        [UIView animateWithDuration:.3f
                         animations:^{
            if (pageNumber == [self p_getLoopNextIndex:self.lastPageIndex]) {
                // 滚动到下一个page
                [self setContentOffset:CGPointMake(self.frame.size.width * 2, self.contentOffset.y) animated:NO];
            } else if (pageNumber == [self p_getLoopPreIndex:self.lastPageIndex]) {
                // 滚动到上一个page
                [self setContentOffset:CGPointMake(0, self.contentOffset.y) animated:NO];
            }
        } completion:^(BOOL finished) {
            // 自己模拟的动画，不会触发scrollView的回调，需要自己将状态重置
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
 @brief 循环滚动时检查调整contentOffset
 @discussion 当切换到新的page时，检查和调整contentOffset，用于实现循环滚动。
 使用三个pageSize的宽度来实现循环滚动；每次滚动停止后，都重新设置一下当前的contentOffset，
 使其停留在中间位置，然后将左中右三个具体内容设置到对应位置上；其他不在当前范围的内容，
 设置一个较大的偏移量，使其离开屏幕。
 @param pageNumber 将要显示的内容在数据中的位置
 */
- (void)p_resetContentOffsetForLoop:(NSUInteger)pageNumber {
    if (![self p_shouldLoop]) {
        return;
    }
    
    //循环保持第二个
    self.contentOffset = CGPointMake(CGRectGetWidth(self.frame), 0);
    
    // totalCount已经被p_shouldLoop保护，个数一定为大于等于3
    NSUInteger totalCount = self.viewPagerItems.count;
    NSUInteger current = (pageNumber >= totalCount) ? 0 : pageNumber;
    NSUInteger pre = (totalCount + current - 1) % totalCount;
    NSUInteger next = (current + 1) % totalCount;
    // 设置prePre和nextNext，能够有效地避免设置了middlePageOffset，滚动停止检查左右的时候，旁边会留白的情况。
    // 不用担心prePre和nextNext与前面的这三个值重复，在后面的遍历中，会优先处理前面三个值的情况。就不会走到后面的逻辑了
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
}

/*!
 @brief 循环模式下，上一个索引位置
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
 @brief 循环模式下，下一个索引位置
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
 @brief 是否支持循环滚动
*/
- (BOOL)p_shouldLoop {
    // 需要属性loop设置为true，并且viewPagerItems的个数大于等于3的时候才允许循环滚动。因为需要支持左右滑动，故内容个数不能小于三
    return self.loop && self.viewPagerItems.count >= 3;
}

@end
