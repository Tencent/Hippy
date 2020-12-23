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

#import "HippyInvalidating.h"
#import "HippyModalHostViewManager.h"
#import "HippyView.h"

@class HippyBridge;
@class HippyModalHostViewController;

@protocol HippyModalHostViewInteractor;

@interface HippyModalHostView : UIView <HippyInvalidating>

@property (nonatomic, copy) NSString *animationType;
@property (nonatomic, copy) NSString *primaryKey;
@property (nonatomic, assign, getter=isTransparent) BOOL transparent;
@property (nonatomic, assign) BOOL darkStatusBarText;

@property (nonatomic, copy) HippyDirectEventBlock onShow;
@property (nonatomic, copy) HippyDirectEventBlock onRequestClose;

@property (nonatomic, weak) id<HippyModalHostViewInteractor, UIViewControllerTransitioningDelegate> delegate;

@property (nonatomic, strong) NSArray<NSString *> *supportedOrientations;
@property (nonatomic, copy) HippyDirectEventBlock onOrientationChange;
@property (nonatomic, strong) NSNumber *hideStatusBar;
- (instancetype)initWithBridge:(HippyBridge *)bridge NS_DESIGNATED_INITIALIZER;

@end

@protocol HippyModalHostViewInteractor <NSObject>

- (void)presentModalHostView:(HippyModalHostView *)modalHostView withViewController:(HippyModalHostViewController *)viewController animated:(BOOL)animated;
- (void)dismissModalHostView:(HippyModalHostView *)modalHostView withViewController:(HippyModalHostViewController *)viewController animated:(BOOL)animated;

@end
