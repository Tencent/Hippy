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
#import "NativeRenderModalHostViewManager.h"
#import "NativeRenderView.h"

@class NativeRenderModalHostViewController;

@protocol NativeRenderModalHostViewInteractor;

@interface NativeRenderModalHostView : UIView

@property (nonatomic, copy) NSString *animationType;
@property (nonatomic, copy) NSString *primaryKey;
@property (nonatomic, assign, getter=isTransparent) BOOL transparent;
@property (nonatomic, assign) BOOL darkStatusBarText;

@property (nonatomic, copy) NativeRenderDirectEventBlock onShow;
@property (nonatomic, copy) NativeRenderDirectEventBlock onRequestClose;

@property (nonatomic, weak) id<NativeRenderModalHostViewInteractor, UIViewControllerTransitioningDelegate> delegate;

@property (nonatomic, strong) NSArray<NSString *> *supportedOrientations;
@property (nonatomic, copy) NativeRenderDirectEventBlock onOrientationChange;
@property (nonatomic, strong) NSNumber *hideStatusBar;
@property (nonatomic, readonly) BOOL isPresented;
@property (nonatomic, strong) NativeRenderModalHostViewController *modalViewController;

- (void)notifyForBoundsChange:(CGRect)newBounds;

@end
