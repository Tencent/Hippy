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

#import "HippyLog.h"
#import "HippyModalHostView.h"

@implementation HippyModalHostViewController
{
  CGRect _lastViewFrame;
#if !TARGET_OS_TV
  UIStatusBarStyle _preferredStatusBarStyle;
//  BOOL _preferredStatusBarHidden;
#endif
}

- (instancetype)init
{
  if (!(self = [super init])) {
    return nil;
  }

#if !TARGET_OS_TV
  _preferredStatusBarStyle = [[UIApplication sharedApplication] statusBarStyle];
//  _preferredStatusBarHidden = [[UIApplication sharedApplication] isStatusBarHidden];
#endif

  return self;
}

- (void)viewDidLayoutSubviews
{
  [super viewDidLayoutSubviews];

  if (self.boundsDidChangeBlock && !CGRectEqualToRect(_lastViewFrame, self.view.frame)) {
    self.boundsDidChangeBlock(self.view.bounds);
    _lastViewFrame = self.view.frame;
  }
}

#if !TARGET_OS_TV
- (UIStatusBarStyle)preferredStatusBarStyle
{
  return _preferredStatusBarStyle;
}

- (BOOL)prefersStatusBarHidden
{
  if (_hideStatusBar) {
    return [_hideStatusBar boolValue];
  }
  BOOL hidden = [[UIApplication sharedApplication].keyWindow.rootViewController prefersStatusBarHidden];
  return hidden;
}

#if HIPPY_DEV
- (UIInterfaceOrientationMask)supportedInterfaceOrientations
{
  UIInterfaceOrientationMask appSupportedOrientationsMask = [[UIApplication sharedApplication] supportedInterfaceOrientationsForWindow:[[UIApplication sharedApplication] keyWindow]];
  if (!(_supportedInterfaceOrientations & appSupportedOrientationsMask)) {
    HippyLogError(@"Modal was presented with 0x%x orientations mask but the application only supports 0x%x."
                @"Add more interface orientations to your app's Info.plist to fix this."
                @"NOTE: This will crash in non-dev mode.",
                (unsigned)_supportedInterfaceOrientations,
                (unsigned)appSupportedOrientationsMask);
    return UIInterfaceOrientationMaskAll;
  }

  return _supportedInterfaceOrientations;
}
#endif // HIPPY_DEV
#endif // !TARGET_OS_TV


@end
