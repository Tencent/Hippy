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
@property (nonatomic, assign) BOOL initialized;
@property (nonatomic, strong) UIColor *backgroundColor;
@property (nonatomic, assign) BOOL containBannerView;
@property (nonatomic, assign) BOOL containPullHeader;
@property (nonatomic, assign) BOOL containPullFooter;
@property (nonatomic, assign) CFTimeInterval scrollEventThrottle; //单位毫秒
@property (nonatomic, copy) HippyDirectEventBlock onScroll;
@property (nonatomic, assign, readonly) std::vector<std::shared_ptr<hippy::DomNode>> itemDomNodes;
@property (nonatomic, assign, readonly) std::shared_ptr<hippy::DomNode> bannerViewNode;


- (instancetype)initWithBridge:(HippyBridge *)bridge;

- (void)refreshCompleted:(NSInteger)status text:(NSString *)text;
- (void)callExposureReport;
- (void)startRefreshFromJSWithType:(NSUInteger)type;
- (void)startRefreshFromJS;
- (void)startLoadMore;
- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated;

@end

NS_ASSUME_NONNULL_END
