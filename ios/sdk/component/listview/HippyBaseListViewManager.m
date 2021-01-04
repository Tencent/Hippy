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
HIPPY_EXPORT_VIEW_PROPERTY(onDelete, HippyDirectEventBlock)
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
