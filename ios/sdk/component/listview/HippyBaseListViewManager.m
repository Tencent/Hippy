//
//  HippyBaseListViewManager.m
//  Hippy
//
//  Created by pennyli on 2018/4/17.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "HippyBaseListViewManager.h"
#import "HippyBaseListView.h"
#import "HippyVirtualNode.h"

@implementation HippyBaseListViewManager

HIPPY_EXPORT_MODULE(ListView)

HIPPY_EXPORT_VIEW_PROPERTY(scrollEventThrottle, NSTimeInterval)
HIPPY_EXPORT_VIEW_PROPERTY(initialListReady, HippyDirectEventBlock);
HIPPY_EXPORT_VIEW_PROPERTY(onScrollBeginDrag, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onScroll, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onScrollEndDrag, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onMomentumScrollBegin, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onMomentumScrollEnd, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onRowWillDisplay, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onEndReached, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(preloadItemNumber, NSUInteger)
HIPPY_EXPORT_VIEW_PROPERTY(bounces, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(initialContentOffset, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(showScrollIndicator, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL)

- (UIView *)view
{
	return [[HippyBaseListView alloc] initWithBridge: self.bridge];
}

- (HippyVirtualNode *)node:(NSNumber *)tag name:(NSString *)name props:(NSDictionary *)props
{
	return [HippyVirtualList createNode: tag viewName: name props: props];
}

HIPPY_EXPORT_METHOD(scrollToIndex:(nonnull NSNumber *)hippyTag
									xIndex:(__unused NSNumber *)xIndex
									yIndex:(__unused NSNumber *)yIndex
									animation:(nonnull NSNumber *)animation)
{
	[self.bridge.uiManager addUIBlock:
	 ^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
		 HippyBaseListView *view = (HippyBaseListView *)viewRegistry[hippyTag];
		 if (view == nil) return ;
		 if (![view isKindOfClass:[HippyBaseListView class]]) {
			 HippyLogError(@"Invalid view returned from registry, expecting HippyBaseListView, got: %@", view);
		 }
		 [view scrollToIndex: yIndex.integerValue animated: [animation boolValue]];
	 }];
}

HIPPY_EXPORT_METHOD(scrollToContentOffset:(nonnull NSNumber *)hippyTag
									x:(nonnull NSNumber *)x
									y:(nonnull NSNumber *)y
									animation:(nonnull NSNumber *)animation)
{
	[self.bridge.uiManager addUIBlock:
	 ^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
		 HippyBaseListView *view = (HippyBaseListView *)viewRegistry[hippyTag];
		 if (view == nil) return ;
		 if (![view isKindOfClass:[HippyBaseListView class]]) {
			 HippyLogError(@"Invalid view returned from registry, expecting HippyBaseListView, got: %@", view);
		 }
		 [view scrollToContentOffset:CGPointMake([x floatValue], [y floatValue]) animated: [animation boolValue]];
	 }];
}



@end
