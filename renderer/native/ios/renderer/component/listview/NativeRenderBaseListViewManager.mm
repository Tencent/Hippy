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

#import "NativeRenderBaseListViewManager.h"
#import "NativeRenderBaseListView.h"
#import "NativeRenderObjectWaterfall.h"
#import "NativeRenderImpl.h"

@implementation NativeRenderBaseListViewManager

NATIVE_RENDER_EXPORT_VIEW(ListView)

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(scrollEventThrottle, double)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(initialListReady, NativeRenderDirectEventBlock);
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onScrollBeginDrag, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onScroll, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onScrollEndDrag, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onMomentumScrollBegin, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onMomentumScrollEnd, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onRowWillDisplay, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onEndReached, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onDelete, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(preloadItemNumber, NSUInteger)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(bounces, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(initialContentOffset, CGFloat)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(editable, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(showScrollIndicator, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(horizontal, BOOL)

- (UIView *)view {
    return [[NativeRenderBaseListView alloc] init];
}

- (NativeRenderObjectView *)nativeRenderObjectView {
    return [[NativeRenderObjectWaterfall alloc] init];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(scrollToIndex:(nonnull NSNumber *)componentTag
									xIndex:(__unused NSNumber *)xIndex
									yIndex:(NSNumber *)yIndex
									animation:(nonnull NSNumber *)animation) {
	[self.renderImpl addUIBlock:
	 ^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
		 NativeRenderBaseListView *view = (NativeRenderBaseListView *)viewRegistry[componentTag];
		 if (view == nil) return ;
		 if (![view isKindOfClass:[NativeRenderBaseListView class]]) {
			 HPLogError(@"Invalid view returned from registry, expecting NativeRenderBaseListView, got: %@", view);
		 }
		 [view scrollToIndex: yIndex.integerValue animated: [animation boolValue]];
	 }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(scrollToContentOffset:(nonnull NSNumber *)componentTag
                               x:(nonnull NSNumber *)x
                               y:(nonnull NSNumber *)y
                               animation:(nonnull NSNumber *)animation) {
	[self.renderImpl addUIBlock:
	 ^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
		 NativeRenderBaseListView *view = (NativeRenderBaseListView *)viewRegistry[componentTag];
		 if (view == nil) return ;
		 if (![view isKindOfClass:[NativeRenderBaseListView class]]) {
			 HPLogError(@"Invalid view returned from registry, expecting NativeRenderBaseListView, got: %@", view);
		 }
		 [view scrollToContentOffset:CGPointMake([x floatValue], [y floatValue]) animated: [animation boolValue]];
	 }];
}

@end
