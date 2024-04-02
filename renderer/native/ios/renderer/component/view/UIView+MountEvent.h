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
#import "HippyComponent.h"
#import "HippyConvert+NativeRender.h"

/// FCP Notification
HIPPY_EXTERN const NSNotificationName HippyFirstContentfulPaintEndNotification;


@interface UIView (MountEvent)

/// Paint Type of `View` node
/// Used to calculate rendering time, etc
/// e.g. fcp...
@property (nonatomic, assign) HippyPaintType paintType;

@property (nonatomic, copy) HippyDirectEventBlock onAppear;
@property (nonatomic, copy) HippyDirectEventBlock onDisappear;
@property (nonatomic, copy) HippyDirectEventBlock onWillAppear;
@property (nonatomic, copy) HippyDirectEventBlock onWillDisappear;
@property (nonatomic, copy) HippyDirectEventBlock onDidMount;
@property (nonatomic, copy) HippyDirectEventBlock onDidUnmount;
@property (nonatomic, copy) HippyDirectEventBlock onAttachedToWindow;
@property (nonatomic, copy) HippyDirectEventBlock onDetachedFromWindow;

- (void)viewAppearEvent;
- (void)viewDisappearEvent;
- (void)viewWillAppearEvent;
- (void)viewWillDisappearEvent;
- (void)viewDidMountEvent;
- (void)viewDidUnmoundEvent;

- (void)sendAttachedToWindowEvent;
- (void)sendDetachedFromWindowEvent;

@end
