//
//  HippyBaseListView.h
//  QBCommonRNLib
//
//  Created by pennyli on 2018/4/16.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "HippyScrollView.h"
#import "HippyBridge.h"
#import "HippyUIManager.h"
#import "HippyBaseListViewProtocol.h"
#import "HippyBaseListViewDataSource.h"

@interface HippyBaseListViewCell : UITableViewCell

@property (nonatomic, weak) UITableView *tableView;
@property (nonatomic, assign) UIView *cellView;
@property (nonatomic, weak) HippyVirtualCell *node;

@end

@interface HippyBaseListView : UIView <HippyBaseListViewProtocol, HippyScrollableProtocol, UITableViewDelegate, UITableViewDataSource, HippyInvalidating>
@property (nonatomic, copy) HippyDirectEventBlock initialListReady;
@property (nonatomic, copy) HippyDirectEventBlock onScrollBeginDrag;
@property (nonatomic, copy) HippyDirectEventBlock onScroll;
@property (nonatomic, copy) HippyDirectEventBlock onScrollEndDrag;
@property (nonatomic, copy) HippyDirectEventBlock onMomentumScrollBegin;
@property (nonatomic, copy) HippyDirectEventBlock onMomentumScrollEnd;
@property (nonatomic, copy) HippyDirectEventBlock onRowWillDisplay;
@property (nonatomic, copy) HippyDirectEventBlock onEndReached;
@property (nonatomic, assign) NSUInteger preloadItemNumber;
@property (nonatomic, assign) CGFloat initialContentOffset;
@property (nonatomic, assign) BOOL manualScroll;
@property (nonatomic, assign) BOOL bounces;
@property (nonatomic, assign) BOOL showScrollIndicator;

@property (nonatomic, strong) UITableView *tableView;
@property (nonatomic, strong, readonly) HippyBaseListViewDataSource *dataSource;
@property (nonatomic, assign) NSTimeInterval scrollEventThrottle;
- (void)reloadData;
- (Class)listViewCellClass;
- (instancetype)initWithBridge:(HippyBridge *)bridge;
- (void)scrollToContentOffset:(CGPoint)point animated:(BOOL)animated;
- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated;
@end
