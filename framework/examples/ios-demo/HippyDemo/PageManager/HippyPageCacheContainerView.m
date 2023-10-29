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


#import "HippyPageCacheContainerView.h"
#import "HippyPageCacheView.h"
#import "HippyPageCache.h"
#import "HippyAssert.h"

@interface HippyPageCacheContainerView ()<HippyPageCacheManagerObserverProtocol> {
    __weak UIView *_lastPageCacheView; //never removed from superview
    HippyPageCacheManager *_cacheManager;
}

@end

@implementation HippyPageCacheContainerView

- (instancetype)initWithPageCacheManager:(HippyPageCacheManager *)pageCacheManager
                                   frame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        _cacheManager = pageCacheManager;
        [pageCacheManager addObserver:self];
        [self attachPageCacheViews];
    }
    return self;
}

- (void)attachPageCacheViews {
    NSArray<HippyPageCache *> *pageCache = [_cacheManager pageCaches];
    for (NSUInteger index = 0; index < [pageCache count] + 1; index++) {
        HippyPageCacheView *cacheView = nil;
        if (index == [pageCache count]) {
            cacheView = [self createPageCacheViewWithFrame:CGRectZero snapshot:nil];
            _lastPageCacheView = cacheView;
        }
        else {
            HippyPageCache *cache = pageCache[index];
            cacheView = [self createPageCacheViewWithFrame:CGRectZero snapshot:cache.snapshot];
        }
        [self addSubview:cacheView];
    }
}

- (HippyPageCacheView *)createPageCacheViewWithFrame:(CGRect)frame snapshot:(UIImage *)snapshot {
    HippyPageCacheView *cacheView = [[HippyPageCacheView alloc] initWithFrame:frame];
    cacheView.backgroundColor = [UIColor whiteColor];
    cacheView.layer.shadowColor = [UIColor colorWithRed:210.f / 255.f green:218.f / 255.f blue:230.f / 255.f alpha:0.88f].CGColor;
    cacheView.layer.shadowOffset = CGSizeMake(5.f, 5.f);
    cacheView.layer.shadowOpacity = .5f;
    __weak HippyPageCacheContainerView *weakSelf = self;
    [cacheView setAddAction:^(HippyPageCacheView * _Nonnull cacheView) {
        HippyPageCacheContainerView *strongSelf = weakSelf;
        if (strongSelf) {
            [strongSelf doCreationAction];
        }
    }];
    [cacheView setDeleteAction:^(HippyPageCacheView * _Nonnull cacheView) {
        HippyPageCacheContainerView *strongSelf = weakSelf;
        if (strongSelf) {
            [strongSelf doDeleteAction:cacheView];
        }
    }];
    [cacheView setClickAction:^(HippyPageCacheView * _Nonnull cacheView) {
        HippyPageCacheContainerView *strongSelf = weakSelf;
        if (strongSelf) {
            [strongSelf doClickAction:cacheView];
        }
    }];
    if (snapshot) {
        [cacheView setSnapshot:snapshot];
    }
    return cacheView;
}

- (void)layoutSubviews {
    static CGFloat margin = 10.f;
    static dispatch_once_t onceToken;
    static CGFloat scale = 3.f;
    dispatch_once(&onceToken, ^{
        scale = [UIScreen mainScreen].scale;
    });
    CGFloat widthPerView = (CGRectGetWidth(self.frame) - margin * 4) / 2;
    CGFloat heightPerView = widthPerView * CGRectGetHeight(self.frame) / CGRectGetWidth(self.frame);
    NSArray<HippyPageCache *> *pageCache = [_cacheManager pageCaches];
    for (NSUInteger index = 0; index < [pageCache count] + 1; index++) {
        CGFloat originX = (index % 2 == 0) ? margin : margin + widthPerView + margin;
        CGFloat originY = margin + (index / 2) * heightPerView + (index / 2) * margin;
        CGRect frame = CGRectMake(originX, originY, widthPerView, heightPerView);
        [[self pageCacheViews] objectAtIndex:index].frame = frame;
    }
    
    CGFloat totalHeightNeeded = CGRectGetMaxY([[self pageCacheViews] lastObject].frame);
    totalHeightNeeded = totalHeightNeeded < CGRectGetHeight(self.frame) ? CGRectGetHeight(self.frame) : totalHeightNeeded;
    self.contentSize = CGSizeMake(CGRectGetWidth(self.frame), totalHeightNeeded);
}

- (void)addPageCache:(HippyPageCache *)pageCache {
    HippyPageCacheView *pageCacheView = [self createPageCacheViewWithFrame:CGRectZero snapshot:pageCache.snapshot];
    [self insertSubview:pageCacheView belowSubview:_lastPageCacheView];
}

- (void)deletePageCache:(HippyPageCache *)pageCache {
    NSArray<HippyPageCache *> *pageCaches = [_cacheManager pageCaches];
    NSUInteger index = [pageCaches indexOfObject:pageCache];
    if (NSNotFound != index) {
        UIView *subview = [[self pageCacheViews] objectAtIndex:index];
        [subview removeFromSuperview];
        [self setNeedsLayout];
    }
}

- (NSArray<HippyPageCacheView *> *)pageCacheViews {
    static dispatch_once_t onceToken;
    static NSPredicate *predicate = NULL;
    dispatch_once(&onceToken, ^{
        predicate = [NSPredicate predicateWithBlock:^BOOL(id  _Nullable evaluatedObject, NSDictionary<NSString *,id> * _Nullable bindings) {
            if ([evaluatedObject isKindOfClass:[HippyPageCacheView class]]) {
                return YES;
            }
            return NO;
        }];
    });
    return [[self subviews] filteredArrayUsingPredicate:predicate];
}

- (void)pageCacheManager:(HippyPageCacheManager *)pageCacheManager
         didAddPageCache:(HippyPageCache *)pageCache {
    [self addPageCache:pageCache];
}

- (void)pageCacheManager:(HippyPageCacheManager *)pageCacheManager
      didUpdatePageCache:(HippyPageCache *)pageCache
                 atIndex:(NSUInteger)index {
    HippyPageCacheView *cacheView = [[self pageCacheViews] objectAtIndex:index];
    [cacheView setSnapshot:pageCache.snapshot];
}

- (void)pageCacheManager:(HippyPageCacheManager *)pageCacheManager
     willRemovePageCache:(HippyPageCache *)pageCache
                 atIndex:(NSUInteger)index {
    [self deletePageCache:pageCache];
}

- (void)doCreationAction {
    if (self.addAction) {
        self.addAction();
    }
}

- (void)doDeleteAction:(HippyPageCacheView *)pageCacheView {
    if (self.deleteAction) {
        NSUInteger index = [[self pageCacheViews] indexOfObject:pageCacheView];
        HippyPageCache *cache = [[_cacheManager pageCaches] objectAtIndex:index];
        self.deleteAction(cache);
    }
}

- (void)doClickAction:(HippyPageCacheView *)pageCacheView {
    if (self.clickAction) {
        NSUInteger index = [[self pageCacheViews] indexOfObject:pageCacheView];
        HippyPageCache *cache = [[_cacheManager pageCaches] objectAtIndex:index];
        self.clickAction(cache);
    }
}

@end
