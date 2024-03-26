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
#import "NativeRenderTouchesView.h"

typedef NS_ENUM(NSUInteger, HippyRefreshStatus) {
    HippyRefreshStatusIdle,
    HippyRefreshStatusPulling,
    HippyRefreshStatusStartLoading,
    HippyRefreshStatusFinishLoading,
};

@class HippyRefresh;
@protocol HippyRefreshDelegate <NSObject>

@optional
- (void)refreshView:(HippyRefresh *)refreshView statusChanged:(HippyRefreshStatus)status;

@end

@interface HippyRefresh : NativeRenderTouchesView {
@protected
    __weak UIScrollView *_scrollView;
    HippyRefreshStatus _status;
    __weak id<HippyRefreshDelegate> _delegate;
}

@property (nonatomic, weak) UIScrollView *scrollView;
@property (nonatomic, readonly) HippyRefreshStatus status;
@property (nonatomic, weak) id<HippyRefreshDelegate> delegate;

- (void)unsetFromScrollView;

- (void)scrollViewDidEndDragging;
- (void)scrollViewDidScroll;

- (void)refresh;
- (void)refreshFinish;
- (void)refreshFinishWithOption:(NSDictionary *)options;

@end
