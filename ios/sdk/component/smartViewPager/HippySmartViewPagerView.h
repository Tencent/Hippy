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
#import "HippyScrollView.h"
#import "HippyBridge.h"
#import "HippyUIManager.h"
#import "HippyListTableView.h"
#import "HippyTouchesView.h"
#import "HippyWaterfallView.h"

NS_ASSUME_NONNULL_BEGIN

@class HippyBaseListViewCell;

@interface HippySmartViewPagerView : HippyWaterfallView <HippyListTableViewLayoutProtocol>

/**
 * Hippy events
 */
@property(nonatomic, copy) HippyDirectEventBlock initialListReady;
@property(nonatomic, copy) HippyDirectEventBlock onScrollBeginDrag;
@property(nonatomic, copy) HippyDirectEventBlock onScrollEndDrag;
@property(nonatomic, strong) HippyDirectEventBlock onPageSelected;
@property(nonatomic, strong) HippyDirectEventBlock onPageScrollStateChanged;

/**
 * Indication initial content offset when HippyBaseListView finish loading data
 *
 * @discuss This variable will be set to 0 after HippyBaseListView finish loading data
 */
@property(nonatomic, assign) CGFloat initialContentOffset;

/**
 * Indicate whether bounces past edge of content and back again
 */
@property(nonatomic, assign) BOOL bounces;

/**
 * Indicate whether compoents can show scroll indicator when tracking
 */
@property(nonatomic, assign) BOOL showScrollIndicator;

/**
 * Indicate whether item is editable
 */
@property(nonatomic, assign) BOOL editable;

/**
 * Indicate list view scrolls horizontally, defualt is YES
 */
@property(nonatomic, assign) BOOL horizontal;

/**
 *  无限循环
 */
@property(nonatomic, assign) BOOL circular;

@property(nonatomic, assign) BOOL autoplay;

@property(nonatomic, assign) CGFloat autoplayTimeInterval;

@property(nonatomic, assign) CGFloat pageGap;

@property(nonatomic, assign) CGFloat previousMargin;

@property(nonatomic, assign) CGFloat nextMargin;

@property(nonatomic, assign) NSInteger initialPage;

- (void)setPreviousMargin:(CGFloat)previousMargin nextMargin:(CGFloat)nextMargin pageGap:(CGFloat)pageGap;

- (void)setPage:(NSInteger)page animated:(BOOL)animated;

- (NSInteger)getCurrentPage;

/**
 * Reload data
 */
- (void)reloadData;

@end

NS_ASSUME_NONNULL_END
