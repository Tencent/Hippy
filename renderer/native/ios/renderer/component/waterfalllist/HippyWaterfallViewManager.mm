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

#import "HippyWaterfallViewManager.h"
#import "HippyWaterfallView.h"

@implementation HippyWaterfallViewManager

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(contentInset, UIEdgeInsets)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(numberOfColumns, NSInteger)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(preloadItemNumber, NSInteger)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(columnSpacing, CGFloat)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(interItemSpacing, CGFloat)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onInitialListReady, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onEndReached, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onFooterAppeared, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onRefresh, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onExposureReport, HippyDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(containBannerView, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(containPullHeader, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(containPullFooter, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(scrollEventThrottle, double)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onScroll, HippyDirectEventBlock)

- (UIView *)view {
    return [[HippyWaterfallView alloc] init];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(refreshCompleted:(nonnull NSNumber *)reactTag
                               status:(nonnull NSNumber *)status
                               text:(nonnull NSString *)text
                               duration:(nonnull NSNumber *)duration
                               imageUrl:(nonnull NSString *)imageUrl) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            //HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view refreshCompleted:status.integerValue text:text];
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(startRefresh:(nonnull NSNumber *)reactTag) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            //HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view startRefreshFromJS];
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(startRefreshWithType:(nonnull NSNumber *)reactTag
                               type:(NSNumber *)type) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            //HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view startRefreshFromJSWithType:[type unsignedIntegerValue]];
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(callExposureReport:(nonnull NSNumber *)reactTag) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            //HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view callExposureReport];
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(scrollToIndex:(nonnull NSNumber *)reactTag
                               xIndex:(nonnull NSNumber *)xIndex
                               yIndex:(nonnull NSNumber *)yIndex
                               animation:(nonnull NSNumber *)animation) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            //HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view scrollToIndex:xIndex.integerValue animated:[animation boolValue]];
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(scrollToContentOffset:(nonnull NSNumber *)reactTag
                               x:(nonnull NSNumber *)x
                               y:(nonnull NSNumber *)y
                               animation:(nonnull NSNumber *)animation) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            //HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view scrollToOffset:CGPointMake([x floatValue], [y floatValue]) animated:[animation boolValue]];
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(startLoadMore:(nonnull NSNumber *)reactTag) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            //HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view startLoadMore];
    }];
}

@end
