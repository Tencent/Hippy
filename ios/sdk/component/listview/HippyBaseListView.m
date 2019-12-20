//
//  HippyBaseListView.m
//  QBCommonRNLib
//
//  Created by pennyli on 2018/4/16.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import "HippyBaseListView.h"
#import "HippyBridge.h"
#import "HippyRootView.h"
#import "UIView+React.h"
#import "HippyScrollProtocol.h"

#define CELL_TAG 10101

@implementation HippyBaseListViewCell

- (instancetype)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier
{
	if (self = [super initWithStyle: style reuseIdentifier: reuseIdentifier]) {
		self.backgroundColor = [UIColor clearColor];
	}
	return self;
}

- (UIView *)cellView
{
	return [self.contentView viewWithTag: CELL_TAG];
}

- (void)setCellView:(UIView *)cellView
{
	UIView *selfCellView = [self cellView];
	if (selfCellView != cellView) {
		[selfCellView removeFromSuperview];
		cellView.tag = CELL_TAG;
		[self.contentView addSubview: cellView];
	}
}
@end

@interface HippyBaseListView() <HippyScrollProtocol>


@end

@implementation HippyBaseListView {
	__weak HippyBridge *_bridge;
	__weak HippyRootView *_rootView;
	NSHashTable * _scrollListeners;
	BOOL _isInitialListReady;
	NSUInteger _preNumberOfRows;
	NSTimeInterval _lastScrollDispatchTime;
    BOOL _hasFillListViewFrame;//缓存是否至少填满ListView Frame。只判断一次。onEndReach的必要条件之一
    CGFloat _nowHeight;//当前cell累加到达的总高度（0、1、2、3...），配合_hasReachEnd使用
}

@synthesize node = _node;

- (instancetype)initWithBridge:(HippyBridge *)bridge
{
	if (self = [super initWithFrame: CGRectZero])
	{
		_bridge = bridge;
		_scrollListeners = [NSHashTable weakObjectsHashTable];
		_dataSource = [HippyBaseListViewDataSource new];
		_isInitialListReady = NO;
		_preNumberOfRows = 0;
        _preloadItemNumber = 1;
        _hasFillListViewFrame = NO;
		[self initTableView];
	}
	
	return self;
}

- (void)invalidate
{
	[_scrollListeners removeAllObjects];
}

- (Class)listViewCellClass
{
	return [HippyBaseListViewCell class];
}

- (void)initTableView
{
	if (_tableView == nil) {
		_tableView = [[UITableView alloc] initWithFrame:CGRectZero style: UITableViewStylePlain];
		_tableView.dataSource = self;
		_tableView.delegate = self;
        _tableView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
		_tableView.backgroundColor = [UIColor clearColor];
		_tableView.allowsSelection = NO;
		_tableView.estimatedRowHeight = 0;
		_tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
		if (@available(iOS 11.0, *))
		{
			_tableView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
		}
        
		[self addSubview:_tableView];
	}
}

- (void) setPreloadItemNumber:(NSUInteger)preloadItemNumber {
    _preloadItemNumber = MAX(1, preloadItemNumber);
}

- (BOOL)flush
{
    NSNumber *number = self.node.props[@"numberOfRows"];
    if ([number isEqual:[NSNull null]]) {
        return NO;
    }
	NSUInteger numberOfRows = [number integerValue];
    if (self.node.subNodes.count == numberOfRows) {
        if (numberOfRows == 0 && _preNumberOfRows == numberOfRows) return NO;
        [self reloadData];
        _preNumberOfRows = numberOfRows;
        return YES;
    }
    return NO;
}

- (void)reloadData
{
	[_dataSource setDataSource:(NSArray <HippyVirtualCell *> *)self.node.subNodes];
	[_tableView reloadData];
    
    if (self.initialContentOffset) {
        [_tableView setContentOffset:CGPointMake(0, self.initialContentOffset) animated:NO];
        self.initialContentOffset = 0;
    }
    
    
	if (!_isInitialListReady) {
		_isInitialListReady = YES;
		if (self.initialListReady) {
			self.initialListReady(@{});
		}
	}
}

- (void) hippySetFrame:(CGRect)frame {
  [super hippySetFrame:frame];
  _tableView.frame = self.bounds;
}

- (void)insertHippySubview:(__unused UIView *)subview atIndex:(__unused NSInteger)atIndex
{
	
}

#pragma mark -Scrollable

- (void)setScrollEnabled:(BOOL)value
{
    [_tableView setScrollEnabled:value];
}

- (void)scrollToOffset:(__unused CGPoint)offset
{
	
}

- (void)scrollToOffset:(__unused CGPoint)offset animated:(__unused BOOL)animated
{
	
}

- (void)zoomToRect:(__unused CGRect)rect animated:(__unused BOOL)animated
{
	
}

- (void)addScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener
{
	[_scrollListeners addObject: scrollListener];
}

- (void)removeScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener
{
	[_scrollListeners removeObject: scrollListener];
}

- (UIScrollView *)realScrollView
{
	return self.tableView;
}

- (CGSize)contentSize
{
	return self.tableView.contentSize;
}

- (NSHashTable *)scrollListeners
{
	return _scrollListeners;
}

- (void)scrollToContentOffset:(CGPoint)offset animated:(BOOL)animated
{
	[self.tableView setContentOffset: offset animated: animated];
}

- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated
{
	NSIndexPath *indexPath = [self.dataSource indexPathForFlatIndex: index];
	if (indexPath != nil) {
		[self.tableView scrollToRowAtIndexPath: indexPath atScrollPosition: UITableViewScrollPositionTop animated: animated];
	}
}

#pragma mark - Delegate & Datasource

- (NSInteger)numberOfSectionsInTableView:(__unused UITableView *)tableView
{
	return [_dataSource numberOfSection];
}

- (CGFloat)tableView:(__unused UITableView *)tableView heightForHeaderInSection:(NSInteger)section
{
	HippyVirtualCell *header = [_dataSource headerForSection: section];
	if (header) {
		return CGRectGetHeight(header.frame);
	} else
		return 0.00001;
}

- (UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section
{
	HippyVirtualCell *header = [_dataSource headerForSection: section];
	if (header) {
		NSString *type = header.itemViewType;
		UIView *headerView =[tableView dequeueReusableHeaderFooterViewWithIdentifier: type];
		headerView = [_bridge.uiManager createViewFromNode: header];
		return headerView;
	} else {
		return nil;
	}
}

- (CGFloat)tableView:(__unused UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath;
{
	HippyVirtualCell *cell = [_dataSource cellForIndexPath: indexPath];
	return ceil(CGRectGetHeight(cell.frame));
}

- (NSInteger)tableView:(__unused UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
	return [_dataSource numberOfCellForSection: section];
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath
{
    
	HippyVirtualCell *node = [_dataSource cellForIndexPath: indexPath];
	NSInteger index = [self.node.subNodes indexOfObject: node];
	if (self.onRowWillDisplay) {
		self.onRowWillDisplay(@{@"index": @(index), @"frame": @{@"x":@(CGRectGetMinX(cell.frame)), @"y": @(CGRectGetMinY(cell.frame)), @"width": @(CGRectGetWidth(cell.frame)), @"height": @(CGRectGetHeight(cell.frame))}});
	}
    
    if (self.onEndReached) {
        NSInteger lastSectionIndex = [self numberOfSectionsInTableView:tableView] - 1;
        NSInteger lastRowIndexInSection = [self tableView:tableView numberOfRowsInSection:lastSectionIndex] - _preloadItemNumber;
        if (lastRowIndexInSection < 0) {
            lastRowIndexInSection = 0;
        }
        
        if (!_hasFillListViewFrame) {
            _nowHeight += cell.frame.size.height;
            if (_nowHeight > tableView.frame.size.height) {//只判断一次
                _hasFillListViewFrame = YES;
                _nowHeight = 0;
            }
        }
        BOOL isLastIndex = [indexPath section] == lastSectionIndex && [indexPath row] == lastRowIndexInSection;
        
        if (isLastIndex && _hasFillListViewFrame) {
            self.onEndReached(@{});
        }
    }
}


- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
	HippyVirtualCell *newNode = [_dataSource cellForIndexPath: indexPath];
	NSString *identifier = newNode.itemViewType;
	HippyBaseListViewCell *cell = (HippyBaseListViewCell *)[tableView dequeueReusableCellWithIdentifier: identifier];
	while (cell && !([[(HippyVirtualCell *)cell.node itemViewType] isEqualToString: newNode.itemViewType])) {
        // 此处cell还在tableView上，将导致泄漏
        [cell removeFromSuperview];
		cell =(HippyBaseListViewCell *)[tableView dequeueReusableCellWithIdentifier: identifier];
		if (cell == nil) {
			HippyLogInfo(@"cannot find right cell:%@", @(indexPath.row));
		}
	}
	if (cell.node.cell != cell) {
        // 此处cell还在tableView上，将导致泄漏
        [cell removeFromSuperview];
		cell = nil;
	}
	
	if (cell == nil) {
		cell = [[[self listViewCellClass] alloc] initWithStyle: UITableViewCellStyleDefault reuseIdentifier: identifier];
		cell.tableView = tableView;
		cell.cellView = [_bridge.uiManager createViewFromNode:newNode];
	} else {
		UIView *cellView = [_bridge.uiManager updateNode: cell.node withNode: newNode];
		if (cellView == nil) {
			cell.cellView = [_bridge.uiManager createViewFromNode: newNode];
		} else {
			cell.cellView = cellView;
		}
	}
	cell.node.cell = nil;
	
	newNode.cell = cell;
	cell.node = newNode;
	return cell;
}

#pragma mark - Scroll

#define MTT_FORWARD_SCROLL_EVENT(call) \
for (NSObject<UIScrollViewDelegate> *scrollViewListener in _scrollListeners) { \
if ([scrollViewListener respondsToSelector:_cmd]) { \
[scrollViewListener call]; \
} \
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView
{
	NSTimeInterval now = CACurrentMediaTime();
	if ((self.scrollEventThrottle > 0 && self.scrollEventThrottle < (now - _lastScrollDispatchTime))) {
		if (self.onScroll) {
			self.onScroll([self scrollBodyData]);
		}
		_lastScrollDispatchTime = now;
	}
	
	MTT_FORWARD_SCROLL_EVENT(scrollViewDidScroll: scrollView);
}

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView
{
	if (self.onScrollBeginDrag) {
		self.onScrollBeginDrag([self scrollBodyData]);
	}
  _manualScroll = YES;
	[self cancelTouch];
	MTT_FORWARD_SCROLL_EVENT(scrollViewWillBeginDragging: scrollView);
}

- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView
{
	if (self.onMomentumScrollBegin) {
		self.onMomentumScrollBegin([self scrollBodyData]);
	}
	MTT_FORWARD_SCROLL_EVENT(scrollViewWillBeginDecelerating: scrollView);
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate
{
	if (!decelerate) {
		_manualScroll = NO;
	}
	MTT_FORWARD_SCROLL_EVENT(scrollViewDidEndDragging: scrollView willDecelerate: decelerate);
}

- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset
{
  if (velocity.y == 0 && velocity.x == 0)
  {
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
      self->_manualScroll = NO;
    });
  }
	
	if (self.onScrollEndDrag) {
		self.onScrollEndDrag([self scrollBodyData]);
	}
	
	MTT_FORWARD_SCROLL_EVENT(scrollViewWillEndDragging: scrollView withVelocity: velocity targetContentOffset: targetContentOffset);
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView
{
	dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.1 * NSEC_PER_SEC)), dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
		self->_manualScroll = NO;
	});
	
	if (self.onMomentumScrollEnd) {
		self.onMomentumScrollEnd([self scrollBodyData]);
	}
	
	MTT_FORWARD_SCROLL_EVENT(scrollViewDidEndDecelerating:scrollView);
}

- (void)scrollViewWillBeginZooming:(UIScrollView *)scrollView withView:(UIView *)view
{
	MTT_FORWARD_SCROLL_EVENT(scrollViewWillBeginZooming: scrollView withView: view);
}

- (void)scrollViewDidZoom:(UIScrollView *)scrollView
{
	MTT_FORWARD_SCROLL_EVENT(scrollViewDidZoom:scrollView);
}

- (void)scrollViewDidEndZooming:(UIScrollView *)scrollView withView:(UIView *)view atScale:(CGFloat)scale
{
	MTT_FORWARD_SCROLL_EVENT(scrollViewDidEndZooming: scrollView withView: view atScale: scale);
}

- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView
{
	MTT_FORWARD_SCROLL_EVENT(scrollViewDidEndScrollingAnimation: scrollView);
}

- (NSDictionary *)scrollBodyData
{
	return @{@"contentOffset": @{@"x": @(_tableView.contentOffset.x), @"y": @(_tableView.contentOffset.y)}};
}

#pragma mark touch conflict
- (HippyRootView *)rootView
{
	if (_rootView) {
		return _rootView;
	}
	
	UIView *view = [self superview];
	
	while (view && ![view isKindOfClass: [HippyRootView class]]) {
		view = [view superview];
	}
	
	if ([view isKindOfClass: [HippyRootView class]]) {
		_rootView = (HippyRootView *)view;
		return _rootView;
	} else
		return nil;
}

- (void)cancelTouch
{
	HippyRootView *view = [self rootView];
	if (view) {
		[view cancelTouches];
	}
}

- (void)didMoveToSuperview
{
	_rootView = nil;
}

- (BOOL)isManualScrolling
{
  return _manualScroll;
}

- (void)setBounces:(BOOL)bounces {
    [_tableView setBounces:bounces];
}

- (BOOL)bounces {
    return [_tableView bounces];
}

- (void)setShowScrollIndicator:(BOOL)show {
    [_tableView setShowsVerticalScrollIndicator:show];
}

- (BOOL)showScrollIndicator {
    return [_tableView showsVerticalScrollIndicator];
}

@end
