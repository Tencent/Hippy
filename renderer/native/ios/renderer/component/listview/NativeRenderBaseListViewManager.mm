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

#import "NativeRenderBaseListViewManager.h"
#import "NativeRenderBaseListView.h"
#import "NativeRenderObjectWaterfall.h"
#import "HippyUIManager.h"

@implementation NativeRenderBaseListViewManager

HIPPY_EXPORT_MODULE(ListView)

HIPPY_EXPORT_VIEW_PROPERTY(scrollEventThrottle, double)
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
HIPPY_EXPORT_VIEW_PROPERTY(editable, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(showScrollIndicator, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(horizontal, BOOL)

- (UIView *)view {
    return [[NativeRenderBaseListView alloc] init];
}

- (HippyShadowView *)hippyShadowView {
    return [[NativeRenderObjectWaterfall alloc] init];
}

HIPPY_EXPORT_METHOD(scrollToIndex:(nonnull NSNumber *)componentTag
                    xIndex:(__unused NSNumber *)xIndex
					yIndex:(NSNumber *)yIndex
					animation:(nonnull NSNumber *)animation) {
	[self.bridge.uiManager addUIBlock:
	 ^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
		 NativeRenderBaseListView *view = (NativeRenderBaseListView *)viewRegistry[componentTag];
		 if (view == nil) return ;
		 if (![view isKindOfClass:[NativeRenderBaseListView class]]) {
			 HippyLogError(@"Invalid view returned from registry, expecting NativeRenderBaseListView, got: %@", view);
		 }
		 [view scrollToIndex: yIndex.integerValue animated: [animation boolValue]];
	 }];
}

HIPPY_EXPORT_METHOD(scrollToContentOffset:(nonnull NSNumber *)componentTag
                    x:(nonnull NSNumber *)x
                    y:(nonnull NSNumber *)y
                    animation:(nonnull NSNumber *)animation) {
	[self.bridge.uiManager addUIBlock:
	 ^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
		 NativeRenderBaseListView *view = (NativeRenderBaseListView *)viewRegistry[componentTag];
		 if (view == nil) return ;
		 if (![view isKindOfClass:[NativeRenderBaseListView class]]) {
			 HippyLogError(@"Invalid view returned from registry, expecting NativeRenderBaseListView, got: %@", view);
		 }
		 [view scrollToContentOffset:CGPointMake([x floatValue], [y floatValue]) animated: [animation boolValue]];
	 }];
}

@end
