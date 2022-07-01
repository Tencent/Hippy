/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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
#import "NativeRenderScrollView.h"
#import "NativeRenderListTableView.h"
#import "NativeRenderTouchesView.h"
#import "NativeRenderWaterfallView.h"

@class NativeRenderBaseListViewCell;

@interface NativeRenderBaseListView : NativeRenderWaterfallView <NativeRenderListTableViewLayoutProtocol>

/**
 * NativeRender events
 */
@property(nonatomic, copy) NativeRenderDirectEventBlock initialListReady;
@property(nonatomic, copy) NativeRenderDirectEventBlock onScrollBeginDrag;
@property(nonatomic, copy) NativeRenderDirectEventBlock onScrollEndDrag;
@property(nonatomic, copy) NativeRenderDirectEventBlock onMomentumScrollBegin;
@property(nonatomic, copy) NativeRenderDirectEventBlock onMomentumScrollEnd;
@property(nonatomic, copy) NativeRenderDirectEventBlock onRowWillDisplay;
@property(nonatomic, copy) NativeRenderDirectEventBlock onDelete;

/**
 * Indication initial content offset when NativeRenderBaseListView finish loading data
 *
 * @discuss This variable will be set to 0 after NativeRenderBaseListView finish loading data
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
 * Indicate list view scrolls horizontally, defualt is NO
 */
@property(nonatomic, assign) BOOL horizontal;

/**
 * Reload data
 */
- (void)reloadData;

/**
 * Scroll to offset
 *
 * @param point Offset point
 * @param animated Indicate whether scroll to point with animation effects
 */
- (void)scrollToContentOffset:(CGPoint)point animated:(BOOL)animated;

/**
 * Scroll to index of item
 *
 * @param index Index of items
 * @param animated Indicate whether scroll to point with animation effects
 */
- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated;

@end
