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

#import "HippyModalHostView.h"

#import "HippyAssert.h"
#import "HippyBridge.h"
#import "HippyModalHostViewController.h"
#import "HippyTouchHandler.h"
#import "HippyUIManager.h"
#import "UIView+Hippy.h"
#import "HippyModalHostViewInteractor.h"
#import <UIKit/UIKit.h>

@implementation HippyModalHostView {
    __weak HippyBridge *_bridge;
    BOOL _isPresented;
    HippyModalHostViewController *_modalViewController;
    UIView *_hippySubview;
    UIStatusBarStyle originStyle;
    UIInterfaceOrientation _lastKnownOrientation;
}

HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithFrame : (CGRect)frame)
HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithCoder : coder)

- (instancetype)initWithBridge:(HippyBridge *)bridge {
    if ((self = [super initWithFrame:CGRectZero])) {
        _bridge = bridge;
        _modalViewController = [HippyModalHostViewController new];
        UIView *containerView = [UIView new];
        containerView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
        _modalViewController.view = containerView;
        _touchHandler = [[HippyTouchHandler alloc] initWithRootView:containerView bridge:bridge];
        _isPresented = NO;

        __weak typeof(self) weakSelf = self;
        _modalViewController.boundsDidChangeBlock = ^(CGRect newBounds) {
            [weakSelf notifyForBoundsChange:newBounds];
        };
    }

    return self;
}

- (void)notifyForBoundsChange:(CGRect)newBounds {
    if (_hippySubview && _isPresented) {
        [_bridge.uiManager setFrame:newBounds forView:_hippySubview];
        [self notifyForOrientationChange];
    }
}

- (void)notifyForOrientationChange {
    if (!_onOrientationChange) {
        return;
    }

    UIInterfaceOrientation currentOrientation = [[UIApplication sharedApplication] statusBarOrientation];
    if (currentOrientation == _lastKnownOrientation) {
        return;
    }
    _lastKnownOrientation = currentOrientation;

    BOOL isPortrait = currentOrientation == UIInterfaceOrientationPortrait || currentOrientation == UIInterfaceOrientationPortraitUpsideDown;
    NSDictionary *eventPayload = @{
        @"orientation": isPortrait ? @"portrait" : @"landscape",
    };
    _onOrientationChange(eventPayload);
}

- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    HippyAssert(_hippySubview == nil, @"Modal view can only have one subview");
    [super insertHippySubview:subview atIndex:atIndex];
    [subview addGestureRecognizer:_touchHandler];
    subview.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;

    [_modalViewController.view insertSubview:subview atIndex:0];
    [subview sendAttachedToWindowEvent];
    _hippySubview = subview;
}

- (void)removeHippySubview:(UIView *)subview {
    HippyAssert(subview == _hippySubview, @"Cannot remove view other than modal view");
    [super removeHippySubview:subview];
    [subview removeGestureRecognizer:_touchHandler];
    _hippySubview = nil;
}

- (void)didUpdateHippySubviews {
    // Do nothing, as subview (singular) is managed by `insertHippySubview:atIndex:`
}

- (void)dismissModalViewController {
    if (_isPresented) {
        [_delegate dismissModalHostView:self withViewController:_modalViewController animated:[self hasAnimationType]];
        [[UIApplication sharedApplication] setStatusBarStyle:originStyle];
        _isPresented = NO;
    }
}

- (void)didMoveToWindow {
    [super didMoveToWindow];

    if (!_isPresented && self.window) {
        HippyAssert(self.hippyViewController, @"Can't present modal view controller without a presenting view controller");
        _modalViewController.supportedInterfaceOrientations = [self supportedOrientationsMask];
        if ([self.animationType isEqualToString:@"fade"]) {
            _modalViewController.modalTransitionStyle = UIModalTransitionStyleCrossDissolve;
        } else if ([self.animationType isEqualToString:@"slide"]) {
            _modalViewController.modalTransitionStyle = UIModalTransitionStyleCoverVertical;
        } else if ([self.animationType isEqualToString:@"slide_fade"]) {
            _modalViewController.modalPresentationStyle = UIModalPresentationCustom;
            _modalViewController.transitioningDelegate = _delegate;
        }
        [_delegate presentModalHostView:self withViewController:_modalViewController animated:[self hasAnimationType]];
        _isPresented = YES;
        originStyle = [UIApplication sharedApplication].statusBarStyle;
        UIStatusBarStyle theStyle = self.darkStatusBarText ? UIStatusBarStyleDefault : UIStatusBarStyleLightContent;
        [[UIApplication sharedApplication] setStatusBarStyle:theStyle];
    }
}

- (void)didMoveToSuperview {
    [super didMoveToSuperview];

    if (_isPresented && !self.superview) {
        [self dismissModalViewController];
    }
}

- (void)invalidate {
    dispatch_async(dispatch_get_main_queue(), ^{
        [self dismissModalViewController];
    });
}

- (BOOL)isTransparent {
    return _modalViewController.modalPresentationStyle == UIModalPresentationOverFullScreen;
}

- (BOOL)hasAnimationType {
    return ![self.animationType isEqualToString:@"none"];
}

- (void)setTransparent:(BOOL)transparent {
    _modalViewController.modalPresentationStyle = transparent ? UIModalPresentationOverFullScreen : UIModalPresentationFullScreen;
}

- (UIInterfaceOrientationMask)supportedOrientationsMask {
    if (_supportedOrientations.count == 0) {
        if ([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPad) {
            return UIInterfaceOrientationMaskAll;
        } else {
            return UIInterfaceOrientationMaskAllButUpsideDown;
        }
    }

    UIInterfaceOrientationMask supportedOrientations = 0;
    for (NSString *orientation in _supportedOrientations) {
        if ([orientation isEqualToString:@"portrait"]) {
            supportedOrientations |= UIInterfaceOrientationMaskPortrait;
        } else if ([orientation isEqualToString:@"portrait-upside-down"]) {
            supportedOrientations |= UIInterfaceOrientationMaskPortraitUpsideDown;
        } else if ([orientation isEqualToString:@"landscape"]) {
            supportedOrientations |= UIInterfaceOrientationMaskLandscape;
        } else if ([orientation isEqualToString:@"landscape-left"]) {
            supportedOrientations |= UIInterfaceOrientationMaskLandscapeLeft;
        } else if ([orientation isEqualToString:@"landscape-right"]) {
            supportedOrientations |= UIInterfaceOrientationMaskLandscapeRight;
        }
    }
    return supportedOrientations;
}

@end
