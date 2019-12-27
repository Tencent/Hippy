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

#define MTT_FORWARD_SCROLL_EVENT(call) \
for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollViewListener) { \
if ([scrollViewListener respondsToSelector:_cmd]) { \
[scrollViewListener call]; \
} \
}

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

@end

@implementation HippyViewPager
#pragma mark life cycle
- (instancetype)initWithFrame:(CGRect)frame
{
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
    }
    return self;
}

#pragma mark hippy native methods

- (void)insertHippySubview:(UIView *)view atIndex:(NSInteger)atIndex
{
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

- (void)removeHippySubview:(UIView *)subview {
    [super removeHippySubview:subview];
    [self.viewPagerItems removeObject:subview];
    if (_itemsChangedBlock) {
        _itemsChangedBlock([self.viewPagerItems count]);
    }
}

- (void)hippySetFrame:(CGRect)frame {
    [super hippySetFrame:frame];
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
    if (pageNumber >= self.viewPagerItems.count || pageNumber < 0) {
        HippyLogWarn(@"Error In ViewPager setPage: pageNumber invalid");
        return;
    }
    
    UIView *theItem = self.viewPagerItems[pageNumber];
    [self setContentOffset:theItem.frame.origin animated:animated];
    if (self.onPageSelected && _lastPageIndex != pageNumber) {
        self.onPageSelected(@{
                              @"position": @(pageNumber)
                              });
        _lastPageIndex = pageNumber;
    }
    if (self.onPageScrollStateChanged) {
        self.onPageScrollStateChanged(@{
                                        @"pageScrollState": @"idle"
                                        });
    }
}

#pragma mark scrollview delegate methods
- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    if (self.onPageScrollStateChanged) {
        NSString *state = scrollView.isDragging ? @"dragging" : @"settling";
        self.onPageScrollStateChanged(@{
                                        @"pageScrollState": state
                                        });
    }
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
    
    if (self.onPageScroll) {
        self.onPageScroll(@{
                            @"position": @(nowPage),//备注：xq说这里的position是拖动时即将停下的pager的index（非手指拽的那个）
                            @"offset": @(offsetRate),//备注：xq说这里是比例，取值-1到1;
                            });
    }
    MTT_FORWARD_SCROLL_EVENT(scrollViewDidScroll:scrollView);
}

//用户拖拽的开始，也是整个滚动流程的开始
- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    self.pageOfBeginDragging = self.nowPage;
    self.isScrolling = YES;
    MTT_FORWARD_SCROLL_EVENT(scrollViewWillBeginDragging:scrollView);
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    CGFloat nowContentOffsetX = (*targetContentOffset).x;
    NSInteger thePage = -1;
    if (fabs(nowContentOffsetX)<FLT_EPSILON) {
        thePage = 0;
    }else{
        for (int i = 0;i < self.viewPagerItems.count;i++) {
            if ([self rightPointOfView:self.viewPagerItems[i]].x > nowContentOffsetX) {
                thePage = i;
                break;
            }
        }
    }
    if (thePage == -1) {
        thePage = 0;
    }else if (thePage >= self.viewPagerItems.count) {
        thePage = self.viewPagerItems.count -1;
    }
    if (self.onPageSelected && _lastPageIndex != thePage) {
        self.onPageSelected(@{
                              @"position": @(thePage)
                              });
        _lastPageIndex = thePage;
    }
    MTT_FORWARD_SCROLL_EVENT(scrollViewWillEndDragging:scrollView withVelocity:velocity targetContentOffset:targetContentOffset);
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
    MTT_FORWARD_SCROLL_EVENT(scrollViewDidEndDragging:scrollView willDecelerate:decelerate);
}

- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView {
    MTT_FORWARD_SCROLL_EVENT(scrollViewWillBeginDecelerating:scrollView);
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    if (self.onPageScrollStateChanged) {
        self.onPageScrollStateChanged(@{
                                        @"pageScrollState": @"idle"
                                        });
    }
    self.isScrolling = NO;
    self.cachedPosition = INT_MAX;
    self.pageOfBeginDragging = 0;
    MTT_FORWARD_SCROLL_EVENT(scrollViewDidEndDecelerating:scrollView);
}

- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView {
    MTT_FORWARD_SCROLL_EVENT(scrollViewDidEndScrollingAnimation:scrollView);
}

- (void)scrollViewDidScrollToTop:(UIScrollView *)scrollView {
    MTT_FORWARD_SCROLL_EVENT(scrollViewDidScrollToTop:scrollView);
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

- (void) setContentOffset:(CGPoint)contentOffset {
    _targetOffset = contentOffset;
    [super setContentOffset:contentOffset];
}

- (void) setContentOffset:(CGPoint)contentOffset animated:(BOOL)animated {
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

- (void)refreshViewPager:(BOOL)needResetToInitialPage invokeOnPageSelectd:(BOOL)invokeOnPageSelectd{
    if (!self.viewPagerItems.count) return;
    for (int i = 1; i < self.viewPagerItems.count; ++i) {
        UIView *lastViewPagerItem = self.viewPagerItems[i - 1];
        UIView *theViewPagerItemItem = self.viewPagerItems[i];
        CGPoint lastViewPagerItemRightPoint = [self rightPointOfView:lastViewPagerItem];
        CGRect theFrame = CGRectMake(
                lastViewPagerItemRightPoint.x,
                lastViewPagerItemRightPoint.y,
                theViewPagerItemItem.frame.size.width,
                theViewPagerItemItem.frame.size.height
        );
        theViewPagerItemItem.frame = theFrame;
    }
    
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
    if (self.contentOffset.x > self.contentSize.width
        && 0 != self.contentSize.width
        )
    {
        self.contentOffset = CGPointMake(0, self.contentSize.width);
    }

    UIView *lastViewPagerItem = self.viewPagerItems.lastObject;
    if (!lastViewPagerItem) {
        HippyLogWarn(@"Error In HippyViewPager: addSubview");
        self.contentSize = CGSizeZero;
        return;
    }
    
    self.contentSize = CGSizeMake(
            lastViewPagerItem.frame.origin.x + lastViewPagerItem.frame.size.width,
            lastViewPagerItem.frame.origin.y + lastViewPagerItem.frame.size.height);

    if (self.onPageSelected && NO == CGSizeEqualToSize(CGSizeZero, self.contentSize) && invokeOnPageSelectd) {
        NSUInteger currentPageIndex = self.contentOffset.x / CGRectGetWidth(self.bounds);
        if (currentPageIndex != _lastPageIndex) {
            _lastPageIndex = currentPageIndex;
            self.onPageSelected(@{@"position": @(currentPageIndex)});
        }
    }
}

- (NSUInteger)nowPage {
    CGFloat nowX = self.contentOffset.x;
    NSInteger thePage = -1;
    if (fabs(nowX)<FLT_EPSILON) {
        return 0;
    }
    for (int i = 0;i < self.viewPagerItems.count;i++) {
        if ([self rightPointOfView:self.viewPagerItems[i]].x > nowX) {
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
