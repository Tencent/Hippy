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

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#import "HippyComponent.h"

/**
 * A Callback block to indicate view pager's item count changed
 * @param count number of view pager's items
 */
typedef void (^ViewPagerItemsCountChanged)(NSUInteger count);

@interface HippyViewPager : UIScrollView <UIScrollViewDelegate>
@property (nonatomic, strong) HippyDirectEventBlock onPageSelected;
@property (nonatomic, strong) HippyDirectEventBlock onPageScroll;
@property (nonatomic, strong) HippyDirectEventBlock onPageScrollStateChanged;

@property (nonatomic, assign) NSInteger initialPage;
@property (nonatomic, assign) CGPoint targetOffset;
@property (nonatomic, assign, readonly) NSUInteger pageCount;
@property (nonatomic, copy) ViewPagerItemsCountChanged itemsChangedBlock;

- (void)setPage:(NSInteger)pageNumber animated:(BOOL)animated;
- (void)addScrollListener:(id<UIScrollViewDelegate>)scrollListener;
- (void)removeScrollListener:(id<UIScrollViewDelegate>)scrollListener;

@end
