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

#import <UIKit/UIKit.h>
#import "NativeRenderComponentProtocol.h"

@interface UIView (MountEvent)

@property (nonatomic, copy) NativeRenderDirectEventBlock onAppear;
@property (nonatomic, copy) NativeRenderDirectEventBlock onDisappear;
@property (nonatomic, copy) NativeRenderDirectEventBlock onWillAppear;
@property (nonatomic, copy) NativeRenderDirectEventBlock onWillDisappear;
@property (nonatomic, copy) NativeRenderDirectEventBlock onDidMount;
@property (nonatomic, copy) NativeRenderDirectEventBlock onDidUnmount;
@property (nonatomic, copy) NativeRenderDirectEventBlock onAttachedToWindow;
@property (nonatomic, copy) NativeRenderDirectEventBlock onDetachedFromWindow;

- (void)viewAppearEvent;
- (void)viewDisappearEvent;
- (void)viewWillAppearEvent;
- (void)viewWillDisappearEvent;
- (void)viewDidMountEvent;
- (void)viewDidUnmoundEvent;

- (void)sendAttachedToWindowEvent;
- (void)sendDetachedFromWindowEvent;

@end
