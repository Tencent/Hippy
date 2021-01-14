//
//  HippyWaterfallViewManager.m
//  HippyDemo
//
//  Created by Ricardo on 2021/1/19.
//  Copyright © 2021 tencent. All rights reserved.
//

#import "HippyWaterfallViewManager.h"
#import "HippyWaterfallView.h"

@implementation HippyWaterfallViewManager

HIPPY_EXPORT_MODULE(WaterfallView)

HIPPY_EXPORT_VIEW_PROPERTY(contentInset, UIEdgeInsets)
HIPPY_EXPORT_VIEW_PROPERTY(numberOfColumns, NSInteger)
HIPPY_EXPORT_VIEW_PROPERTY(preloadItemNumber, NSInteger)
HIPPY_EXPORT_VIEW_PROPERTY(columnSpacing, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(interItemSpacing, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(initialListReady, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onEndReached, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onFooterAppeared, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onRefresh, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onExposureReport, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(containBannerView, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(containPullHeader, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(containPullFooter, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(scrollEventThrottle, double)
HIPPY_EXPORT_VIEW_PROPERTY(onScroll, HippyDirectEventBlock)

- (UIView *)replacedView {
    NSNumber *tag = self.props[@"rootTag"];
    NSDictionary *info = self.bridge.shareOptions[tag];
    if (info[@"CreateHippyViewWithPropsBlock"] && [info[@"class"] containsObject:@"HippyWaterfallView"]) {
        CreateHippyViewWithPropsBlock block = info[@"CreateHippyViewWithPropsBlock"];
        return block(self.bridge, @"HippyWaterfallView", [self.props copy]);
    }
    return nil;
}

- (UIView *)view {
    UIView *replaceView = [self replacedView];
    if (replaceView) {
        NSAssert([replaceView isKindOfClass:[HippyWaterfallView class]], @"HippyWaterfallViewManager CreateHippyViewWithPropsBlock get illege view");
        return replaceView;
    } else
        return [[HippyWaterfallView alloc] initWithBridge:self.bridge];
}

- (HippyVirtualNode *)node:(NSNumber *)tag name:(NSString *)name props:(NSDictionary *)props {
    return [HippyVirtualList createNode:tag viewName:name props:props];
}

HIPPY_EXPORT_METHOD(endReachedCompleted : (nonnull NSNumber *)reactTag status : (nonnull NSNumber *)status text : (nonnull NSString *)text) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view endReachedCompleted:status.integerValue text:text];
    }];
}

HIPPY_EXPORT_METHOD(refreshCompleted
                    : (nonnull NSNumber *)reactTag status
                    : (nonnull NSNumber *)status text
                    : (nonnull NSString *)text duration
                    : (nonnull NSNumber *)duration imageUrl
                    : (nonnull NSString *)imageUrl) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view refreshCompleted:status.integerValue text:text];
    }];
}

HIPPY_EXPORT_METHOD(startRefresh : (nonnull NSNumber *)reactTag) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view startRefreshFromJS];
    }];
}

HIPPY_EXPORT_METHOD(startRefreshWithType : (nonnull NSNumber *)reactTag type : (NSUInteger)type) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view startRefreshFromJSWithType:type];
    }];
}

HIPPY_EXPORT_METHOD(callExposureReport : (nonnull NSNumber *)reactTag) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view callExposureReport];
    }];
}

HIPPY_EXPORT_METHOD(scrollToIndex
                    : (nonnull NSNumber *)reactTag xIndex
                    : (nonnull NSNumber *)xIndex yIndex
                    : (nonnull NSNumber *)yIndex animation
                    : (nonnull NSNumber *)animation) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view scrollToIndex:xIndex.integerValue animated:[animation boolValue]];
    }];
}

HIPPY_EXPORT_METHOD(scrollToContentOffset
                    : (nonnull NSNumber *)reactTag x
                    : (nonnull NSNumber *)x y
                    : (nonnull NSNumber *)y animation
                    : (nonnull NSNumber *)animation) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view scrollToOffset:CGPointMake([x floatValue], [y floatValue]) animated:[animation boolValue]];
    }];
}

HIPPY_EXPORT_METHOD(startLoadMore : (nonnull NSNumber *)reactTag) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyWaterfallView *view = (HippyWaterfallView *)viewRegistry[reactTag];
        if (view == nil)
            return;
        if (![view isKindOfClass:[HippyWaterfallView class]]) {
            HippyLogError(@"Invalid view returned from registry, expecting QBRNWaterfallView, got: %@", view);
        }
        [view startLoadMore];
    }];
}

@end
