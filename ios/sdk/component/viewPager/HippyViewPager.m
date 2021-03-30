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
#import "float.h"
#import "HippyViewPagerItem.h"

@interface HippyViewPager ()
@property (nonatomic, strong) NSMutableArray<UIView *> *viewPagerItems;
@property (nonatomic, assign) BOOL isScrolling;
@property (nonatomic, assign) BOOL loadOnce;
@property (nonatomic, assign) NSInteger pageOfBeginDragging;

@property (nonatomic, assign) CGRect previousFrame;
@property (nonatomic, assign) CGSize previousSize;
@property (nonatomic, copy) NSHashTable<id<UIScrollViewDelegate>> *scrollViewListener;
@property (nonatomic, assign) NSUInteger lastPageIndex;
@property (nonatomic, assign) CGFloat targetContentOffsetX;
@property (nonatomic, assign) BOOL didFirstTimeLayout;
@property (nonatomic, assign) BOOL invokeOnPageSelected;
@property (nonatomic, assign) BOOL needsLayoutItems;

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
        self.showsHorizontalScrollIndicator = NO;
        self.showsVerticalScrollIndicator = NO;
        self.previousFrame = CGRectZero;
        self.scrollViewListener = [NSHashTable weakObjectsHashTable];
        self.lastPageIndex = NSUIntegerMax;
        self.targetContentOffsetX = CGFLOAT_MAX;
        if (@available(iOS 11.0, *)) {
            self.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
        }
    }
    return self;
}

#pragma mark hippy native methods

- (void)insertHippySubview:(UIView *)view atIndex:(NSInteger)atIndex {
    if (atIndex > self.viewPagerItems.count) {
        HippyLogWarn(@"Error In HippyViewPager: addSubview —— out of bound of array");
        return;
    }
    if (atIndex < [self.viewPagerItems count]) {
        UIView *viewAtIndex = [self.viewPagerItems objectAtIndex:atIndex];
        view.frame = viewAtIndex.frame;
    }
    [super insertHippySubview:view atIndex:(NSInteger)atIndex];
    [self.viewPagerItems insertObject:view atIndex:atIndex];
    
    if ([view isKindOfClass:[HippyViewPagerItem class]]) {
        HippyViewPagerItem *item = (HippyViewPagerItem *)view;
        __weak HippyViewPager *weakPager = self;
        item.frameSetBlock = ^CGRect(CGRect frame) {
            NSInteger index = atIndex;
            if (weakPager) {
                HippyViewPager *strongPager = weakPager;
                CGRect finalFrame = [strongPager frameForItemAtIndex:index];
                return finalFrame;
            }
            return frame;
        };
    }
    
    self.needsLayoutItems = YES;
    if (_itemsChangedBlock) {
        _itemsChangedBlock([self.viewPagerItems count]);
    }
}

- (CGRect)frameForItemAtIndex:(NSInteger)index {
    CGSize viewPagerSize = self.bounds.size;
    CGFloat originX = viewPagerSize.width * index;
    return CGRectMake(originX, 0, viewPagerSize.width, viewPagerSize.height);
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
    self.invokeOnPageSelected = YES;
    self.needsLayoutItems = YES;
    [self setNeedsLayout];
}

- (void)didUpdateHippySubviews {
    [super didUpdateHippySubviews];
    self.invokeOnPageSelected = NO;
    self.needsLayoutItems = YES;
    [self setNeedsLayout];
}

- (void)invalidate {
    [_scrollViewListener removeAllObjects];
}

#pragma mark hippy js call methods
- (void)setPage:(NSInteger)pageNumber animated:(BOOL)animated {
    if (pageNumber >= self.viewPagerItems.count || pageNumber < 0) {
        HippyLogWarn(@"Error In ViewPager setPage: pageNumber invalid");
        return;
    }

    UIView *theItem = self.viewPagerItems[pageNumber];
    self.targetContentOffsetX = CGRectGetMinX(theItem.frame);
    [self setContentOffset:theItem.frame.origin animated:animated];
    if (self.onPageSelected) {
        self.onPageSelected(@{ @"position": @(pageNumber) });
        _lastPageIndex = pageNumber;
    }
    if (self.onPageScrollStateChanged) {
        self.onPageScrollStateChanged(@{ @"pageScrollState": @"idle" });
    }
}

#pragma mark scrollview delegate methods
- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    if (self.onPageScrollStateChanged) {
        NSString *state = scrollView.isDragging ? @"dragging" : @"settling";
        self.onPageScrollStateChanged(@{ @"pageScrollState": state });
    }
    NSInteger beforePage = self.pageOfBeginDragging;
    CGFloat commonPagerWidth = [self commonPagerWidth];
    CGFloat beforeOffsetX = beforePage * commonPagerWidth;
    CGFloat nowContentOffsetX = self.contentOffset.x;
    CGFloat betweenOffset = nowContentOffsetX - beforeOffsetX;
    CGFloat offsetRate = betweenOffset / commonPagerWidth;
    if (offsetRate != 0) {
        NSInteger nowPage = 0;
        if (CGFLOAT_MAX == self.targetContentOffsetX) {
            nowPage = offsetRate < 0 ? beforePage - 1 : beforePage + 1;  //-1 for left slide，1 for right;
            if (nowPage == -1) {
                nowPage = 0;
            }
            if (nowPage == self.viewPagerItems.count) {
                nowPage = self.viewPagerItems.count - 1;
            }
        } else {
            nowPage = [self targetPageIndexFromTargetContentOffsetX:self.targetContentOffsetX];
        }
        if (self.onPageScroll) {
            self.onPageScroll(@{
                @"position": @(nowPage),
                @"offset": @(offsetRate),
            });
        }
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
    self.targetContentOffsetX = CGFLOAT_MAX;
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollViewListener) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillBeginDragging:)]) {
            [scrollViewListener scrollViewWillBeginDragging:scrollView];
        }
    }
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    self.targetContentOffsetX = targetContentOffset->x;
    NSUInteger page = [self targetPageIndexFromTargetContentOffsetX:self.targetContentOffsetX];
    if (self.onPageSelected) {
        self.onPageSelected(@{ @"position": @(page) });
    }
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollViewListener) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewWillEndDragging:withVelocity:targetContentOffset:)]) {
            [scrollViewListener scrollViewWillEndDragging:scrollView withVelocity:velocity targetContentOffset:targetContentOffset];
        }
    }
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
    if (self.onPageScrollStateChanged) {
        self.onPageScrollStateChanged(@{ @"pageScrollState": @"idle" });
    }
    self.isScrolling = NO;
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
}

- (void)scrollViewDidScrollToTop:(UIScrollView *)scrollView {
    for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollViewListener) {
        if ([scrollViewListener respondsToSelector:@selector(scrollViewDidScrollToTop:)]) {
            [scrollViewListener scrollViewDidScrollToTop:scrollView];
        }
    }
}

#pragma mark scrollview listener methods
- (void)addScrollListener:(id<UIScrollViewDelegate>)scrollListener {
    [_scrollViewListener addObject:scrollListener];
}

- (void)removeScrollListener:(id<UIScrollViewDelegate>)scrollListener {
    [_scrollViewListener removeObject:scrollListener];
}

#pragma mark other methods
- (NSUInteger)targetPageIndexFromTargetContentOffsetX:(CGFloat)targetContentOffsetX {
    NSInteger thePage = -1;
    if (fabs(targetContentOffsetX) < FLT_EPSILON) {
        thePage = 0;
    } else {
        for (int i = 0; i < self.viewPagerItems.count; i++) {
            UIView *pageItem = self.viewPagerItems[i];
            CGPoint point = [self middlePointOfView:pageItem];
            if (point.x > targetContentOffsetX) {
                thePage = i;
                break;
            }
        }
    }
    if (thePage == -1) {
        thePage = 0;
    } else if (thePage >= self.viewPagerItems.count) {
        thePage = self.viewPagerItems.count - 1;
    }
    if (_lastPageIndex != thePage) {
        _lastPageIndex = thePage;
        return thePage;
    } else {
        return _lastPageIndex;
    }
}

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
        self.invokeOnPageSelected = YES;
        self.needsLayoutItems = YES;
        [self setNeedsLayout];
    }
}

- (void)layoutSubviews {
    [super layoutSubviews];
    if (!self.needsLayoutItems) {
        return;
    }
    if (!self.viewPagerItems.count)
        return;
    for (int i = 1; i < self.viewPagerItems.count; ++i) {
        UIView *lastViewPagerItem = self.viewPagerItems[i - 1];
        UIView *theViewPagerItemItem = self.viewPagerItems[i];
        CGPoint lastViewPagerItemRightPoint = [self rightPointOfView:lastViewPagerItem];
        CGRect theFrame = CGRectMake(lastViewPagerItemRightPoint.x, lastViewPagerItemRightPoint.y, theViewPagerItemItem.frame.size.width,
            theViewPagerItemItem.frame.size.height);
        theViewPagerItemItem.frame = theFrame;
    }

    if (self.initialPage >= self.viewPagerItems.count) {
        HippyLogWarn(@"Error In HippyViewPager: layoutSubviews");
        self.contentSize = CGSizeZero;
        return;
    }

    //如果是第一次加载，那么走initialPage的逻辑
    if (!_didFirstTimeLayout) {
        UIView *theItem = self.viewPagerItems[self.initialPage];
        self.contentOffset = theItem.frame.origin;
        _didFirstTimeLayout = YES;
    }
    if (self.contentOffset.x > self.contentSize.width && 0 != self.contentSize.width) {
        self.contentOffset = CGPointMake(0, self.contentSize.width);
    }

    UIView *lastViewPagerItem = self.viewPagerItems.lastObject;
    if (!lastViewPagerItem) {
        HippyLogWarn(@"Error In HippyViewPager: addSubview");
        self.contentSize = CGSizeZero;
        return;
    }

    self.contentSize = CGSizeMake(lastViewPagerItem.frame.origin.x + lastViewPagerItem.frame.size.width,
        lastViewPagerItem.frame.origin.y + lastViewPagerItem.frame.size.height);
    if (self.onPageSelected && NO == CGSizeEqualToSize(CGSizeZero, self.contentSize) && _invokeOnPageSelected) {
        NSUInteger currentPageIndex = self.contentOffset.x / CGRectGetWidth(self.bounds);
        if (currentPageIndex != _lastPageIndex) {
            _lastPageIndex = currentPageIndex;
            self.onPageSelected(@{ @"position": @(currentPageIndex) });
        }
    }
    [self setPage:_lastPageIndex animated:YES];
    self.needsLayoutItems = NO;
}

- (NSUInteger)nowPage {
    CGFloat nowX = self.contentOffset.x;
    NSInteger thePage = -1;
    if (fabs(nowX) < FLT_EPSILON) {
        return 0;
    }
    for (int i = 0; i < self.viewPagerItems.count; i++) {
        UIView *pageItem = self.viewPagerItems[i];
        CGPoint point = [self middlePointOfView:pageItem];
        if (point.x > nowX) {
            thePage = i;
            break;
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
    CGFloat x = view.frame.origin.x + view.frame.size.width * 0.5;
    CGFloat y = view.frame.origin.y;
    return CGPointMake(x, y);
}

//自动翻页
- (void)autoPageDown {
    //滚动流程中不允许轮播
    if (self.isScrolling) {
        return;
    }
    NSInteger nextPage = self.nowPage + 1;
    if (nextPage < self.viewPagerItems.count) {
        [self setPage:nextPage animated:YES];
    }
}

@end
