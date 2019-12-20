/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
