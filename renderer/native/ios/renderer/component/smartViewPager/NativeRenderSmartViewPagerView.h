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

#import <UIKit/UIKit.h>
#import "HippyComponent.h"
#import "HippyNextListTableView.h"
#import "HippyWaterfallView.h"

NS_ASSUME_NONNULL_BEGIN

@class HippyNextBaseListViewCell;

@interface NativeRenderSmartViewPagerView : HippyWaterfallView <HippyNextListTableViewLayoutProtocol>

/**
 * Hippy events
 */
@property(nonatomic, copy) HippyDirectEventBlock initialListReady;
@property(nonatomic, copy) HippyDirectEventBlock onScrollBeginDrag;
@property(nonatomic, copy) HippyDirectEventBlock onScrollEndDrag;
@property(nonatomic, strong) HippyDirectEventBlock onPageSelected;
@property(nonatomic, strong) HippyDirectEventBlock onPageScrollStateChanged;

/**
 *  Indicate view pager view scroll circule, default is NO
 */
@property(nonatomic, assign) BOOL circular;

/**
 *  view pager view scroll auto, default is NO
 */
@property(nonatomic, assign) BOOL autoplay;

/**
 *  view pager view scroll auto play time, default is 3 second
 */
@property(nonatomic, assign) CGFloat autoplayTimeInterval;

/**
 *  view pager view item space, default is 0
 */
@property(nonatomic, assign) CGFloat pageGap;

/**
 *  view pager previous item show width, default is 0
 */
@property(nonatomic, assign) CGFloat previousMargin;

/**
 *  view pager next item show width, default is 0
 */
@property(nonatomic, assign) CGFloat nextMargin;

/**
 *  first item show, default is 0
 */
@property(nonatomic, assign) NSInteger initialPage;

- (void)setPage:(NSInteger)page animated:(BOOL)animated;

- (NSInteger)getCurrentPage;

/**
 * Reload data
 */
- (void)reloadData;

@end

NS_ASSUME_NONNULL_END
