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
#import "HippyBaseListViewProtocol.h"
#import "HippyBaseListViewDataSource.h"
#import "HippyListTableView.h"

@interface HippyBaseListView : UIView <HippyBaseListViewProtocol, HippyScrollableProtocol, UITableViewDelegate, UITableViewDataSource,
                                   HippyInvalidating, HippyListTableViewLayoutProtocol>

@property (nonatomic, copy) HippyDirectEventBlock initialListReady;
@property (nonatomic, copy) HippyDirectEventBlock onScrollBeginDrag;
@property (nonatomic, copy) HippyDirectEventBlock onScroll;
@property (nonatomic, copy) HippyDirectEventBlock onScrollEndDrag;
@property (nonatomic, copy) HippyDirectEventBlock onMomentumScrollBegin;
@property (nonatomic, copy) HippyDirectEventBlock onMomentumScrollEnd;
@property (nonatomic, copy) HippyDirectEventBlock onRowWillDisplay;
@property (nonatomic, copy) HippyDirectEventBlock onEndReached;
@property (nonatomic, copy) HippyDirectEventBlock onDelete;
@property (nonatomic, assign) NSUInteger preloadItemNumber;
@property (nonatomic, assign) CGFloat initialContentOffset;
@property (nonatomic, assign) BOOL manualScroll;
@property (nonatomic, assign) BOOL bounces;
@property (nonatomic, assign) BOOL showScrollIndicator;

@property (nonatomic, strong) HippyListTableView *tableView;
@property (nonatomic, strong, readonly) HippyBaseListViewDataSource *dataSource;
@property (nonatomic, assign) NSTimeInterval scrollEventThrottle;

- (void)reloadData;
- (Class)listViewCellClass;
- (instancetype)initWithBridge:(HippyBridge *)bridge;
- (void)scrollToContentOffset:(CGPoint)point animated:(BOOL)animated;
- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated;

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath NS_REQUIRES_SUPER;
- (void)tableView:(UITableView *)tableView didEndDisplayingCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath NS_REQUIRES_SUPER;

@end
