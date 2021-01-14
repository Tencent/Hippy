//
//  HippyWaterfallView.h
//  HippyDemo
//
//  Created by Ricardo on 2021/1/19.
//  Copyright © 2021 tencent. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "HippyVirtualNode.h"
#import "HippyView.h"
#import "HippyBaseListViewProtocol.h"
#import "HippyScrollableProtocol.h"

NS_ASSUME_NONNULL_BEGIN

@interface HippyWaterfallView : HippyView <HippyBaseListViewProtocol, HippyScrollableProtocol>

@property (nonatomic, assign) UIEdgeInsets contentInset;
@property (nonatomic, assign) NSInteger numberOfColumns;
@property (nonatomic, assign) CGFloat columnSpacing;
@property (nonatomic, assign) CGFloat interItemSpacing;
@property (nonatomic, assign) NSInteger preloadItemNumber;
@property (nonatomic, strong) NSArray<UIColor *> *refreshColors;
@property (nonatomic, assign) BOOL initialized;
@property (nonatomic, strong) NSArray<UIColor *> *backgroundColors;
@property (nonatomic, assign) BOOL containBannerView;
@property (nonatomic, assign) BOOL containPullHeader;
@property (nonatomic, assign) BOOL containPullFooter;
@property (nonatomic, assign) CFTimeInterval scrollEventThrottle; //单位毫秒
@property (nonatomic, copy) HippyDirectEventBlock onScroll;

- (instancetype)initWithBridge:(HippyBridge *)bridge;

- (void)endReachedCompleted:(NSInteger)status text:(NSString *)text;
- (void)refreshCompleted:(NSInteger)status text:(NSString *)text;
- (void)callExposureReport;
- (void)startRefreshFromJSWithType:(NSUInteger)type;
- (void)startRefreshFromJS;
- (void)startLoadMore;
- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated;

@end

NS_ASSUME_NONNULL_END
