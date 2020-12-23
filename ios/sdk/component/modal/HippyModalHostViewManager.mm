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

#import "HippyModalHostViewManager.h"
#import "HippyModalCustomAnimationTransition.h"
#import "HippyModalCustomPresentationController.h"
#import "HippyBridge.h"
#import "HippyModalHostView.h"
#import "HippyModalHostViewController.h"
#import "HippyTouchHandler.h"
#import "HippyShadowView.h"
#import "HippyUtils.h"

@interface HippyModalHostShadowView : HippyShadowView

@end

@implementation HippyModalHostShadowView

- (void)insertHippySubview:(id<HippyComponent>)subview atIndex:(NSInteger)atIndex
{
  [super insertHippySubview:subview atIndex:atIndex];
  if ([subview isKindOfClass:[HippyShadowView class]]) {
    CGRect frame = {.origin = CGPointZero, .size = HippyScreenSize()};
    [(HippyShadowView *)subview setFrame:frame];
  }
}

@end

@interface HippyModalHostViewManager () <HippyModalHostViewInteractor, UIViewControllerTransitioningDelegate>

@end

@implementation HippyModalHostViewManager
{
  NSHashTable *_hostViews;
}

HIPPY_EXPORT_MODULE(Modal)

- (UIView *)view
{
  HippyModalHostView *view = [[HippyModalHostView alloc] initWithBridge:self.bridge];
  view.delegate = self;
  if (!_hostViews) {
    _hostViews = [NSHashTable weakObjectsHashTable];
  }
  [_hostViews addObject:view];
  return view;
}

- (void)presentModalHostView:(HippyModalHostView *)modalHostView withViewController:(HippyModalHostViewController *)viewController animated:(BOOL)animated
{
  dispatch_block_t completionBlock = ^{
    if (modalHostView.onShow) {
      modalHostView.onShow(nil);
    }
  };
  if (_presentationBlock) {
    _presentationBlock([modalHostView hippyViewController], viewController, animated, completionBlock);
  } else {
    if ([modalHostView.hideStatusBar boolValue]) {
      viewController.modalPresentationCapturesStatusBarAppearance = YES;
      viewController.hideStatusBar = [modalHostView hideStatusBar];
    }
    [[modalHostView hippyViewController] presentViewController:viewController animated:animated completion:completionBlock];
  }
}

- (void)dismissModalHostView:(HippyModalHostView *)modalHostView withViewController:(HippyModalHostViewController *)viewController animated:(BOOL)animated
{
	dispatch_block_t completionBlock = ^{
    NSDictionary *userInfo = nil;
    if (modalHostView.primaryKey.length != 0)
    {
      userInfo = @{@"primaryKey" : modalHostView.primaryKey};
    }
    [[NSNotificationCenter defaultCenter] postNotificationName:HippyModalHostViewDismissNotification object:self userInfo:userInfo];
		if (modalHostView.onRequestClose) {
			modalHostView.onRequestClose(nil);
		}
	};
	
  if (_dismissalBlock) {
    _dismissalBlock([modalHostView hippyViewController], viewController, animated, nil);
  } else {
    [viewController dismissViewControllerAnimated:animated completion:completionBlock];
  }
}


- (HippyShadowView *)shadowView
{
  return [HippyModalHostShadowView new];
}

- (void)invalidate
{
  for (HippyModalHostView *hostView in _hostViews) {
    [hostView invalidate];
  }
  [_hostViews removeAllObjects];
}

- (nullable UIPresentationController *)presentationControllerForPresentedViewController:(UIViewController *)presented presentingViewController:(__unused UIViewController *)presenting sourceViewController:(__unused UIViewController *)source NS_AVAILABLE_IOS(8_0)
{
	HippyModalCustomPresentationController *controller = [[HippyModalCustomPresentationController alloc] initWithPresentedViewController: presented presentingViewController: presenting];
	return controller;
}

- (nullable id <UIViewControllerAnimatedTransitioning>)animationControllerForPresentedController:(__unused UIViewController *)presented presentingController:(__unused UIViewController *)presenting sourceController:(__unused UIViewController *)source
{
	HippyModalCustomAnimationTransition *transition = [HippyModalCustomAnimationTransition new];
	transition.isPresent = YES;
	return transition;
}

- (nullable id <UIViewControllerAnimatedTransitioning>)animationControllerForDismissedController:(__unused UIViewController *)dismissed
{
	HippyModalCustomAnimationTransition *transition = [HippyModalCustomAnimationTransition new];
	transition.isPresent = NO;
	return transition;
}

HIPPY_EXPORT_VIEW_PROPERTY(animationType, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(transparent, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(darkStatusBarText, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(onShow, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onRequestClose, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(supportedOrientations, NSArray)
HIPPY_EXPORT_VIEW_PROPERTY(onOrientationChange, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(primaryKey, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(hideStatusBar, NSNumber)
@end
