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

#import "HippyModalHostViewController.h"
#import "HippyUtils.h"

@interface HippyModalHostViewController () {
    CGRect _lastViewFrame;
    UIStatusBarStyle _preferredStatusBarStyle;
}

@end

@implementation HippyModalHostViewController

- (instancetype)init {
    self = [super init];
    if (self) {
        if (@available(iOS 13.0, *)) {
            _preferredStatusBarStyle = [[[HippyKeyWindow() windowScene] statusBarManager] statusBarStyle];
        }
        else {
            _preferredStatusBarStyle = [[UIApplication sharedApplication] statusBarStyle];
        }
    }
    return self;
}

- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];

    if (self.boundsDidChangeBlock && !CGRectEqualToRect(_lastViewFrame, self.view.frame)) {
        self.boundsDidChangeBlock(self.view.bounds);
        _lastViewFrame = self.view.frame;
    }
}

- (UIStatusBarStyle)preferredStatusBarStyle {
    return _preferredStatusBarStyle;
}

- (void)setPreferredStatusBarStyle:(UIStatusBarStyle)style {
    if (_preferredStatusBarStyle != style) {
        _preferredStatusBarStyle = style;
        [self setNeedsStatusBarAppearanceUpdate];
    }
}

- (void)setHideStatusBar:(NSNumber *)hideStatusBar {
    if ([_hideStatusBar isEqualToNumber:hideStatusBar]) {
        _hideStatusBar = hideStatusBar;
        [self setNeedsStatusBarAppearanceUpdate];
    }
}

- (BOOL)prefersStatusBarHidden {
    if (_hideStatusBar) {
        return [_hideStatusBar boolValue];
    }
    BOOL hidden = [HippyKeyWindow().rootViewController prefersStatusBarHidden];
    return hidden;
}

#if HIPPY_DEBUG
- (UIInterfaceOrientationMask)supportedInterfaceOrientations {
    UIWindow *keyWindow = HippyKeyWindow();
    UIInterfaceOrientationMask appSupportedOrientationsMask = [[UIApplication sharedApplication] supportedInterfaceOrientationsForWindow:keyWindow];
    if (!(_supportedInterfaceOrientations & appSupportedOrientationsMask)) {
        return UIInterfaceOrientationMaskAll;
    }

    return _supportedInterfaceOrientations;
}
#endif  // HIPPY_DEBUG

@end
