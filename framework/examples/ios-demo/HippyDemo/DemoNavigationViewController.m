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

#import "DemoNavigationViewController.h"

#import "objc/runtime.h"

@implementation DemoNavigationViewController

static BOOL IsClassOverrideMethod(Class cls, SEL sel) {
    IMP selfIMP = class_getMethodImplementation(cls, sel);
    IMP superIMP = class_getMethodImplementation(class_getSuperclass(cls), sel);
    if (selfIMP != superIMP) {
        return YES;
    }
    return NO;
}

- (BOOL)shouldAutorotate {
    UIViewController *lastVC = [self.viewControllers lastObject];
    if (IsClassOverrideMethod([lastVC class], _cmd)) {
        return [lastVC shouldAutorotate];
    }
    else {
        return NO;
    }
}

- (UIInterfaceOrientationMask)supportedInterfaceOrientations {
    UIViewController *lastVC = [self.viewControllers lastObject];
    if (IsClassOverrideMethod([lastVC class], _cmd)) {
        return [lastVC supportedInterfaceOrientations];
    }
    else {
        return UIInterfaceOrientationMaskPortrait;
    }
}

- (UIInterfaceOrientation)preferredInterfaceOrientationForPresentation {
    UIViewController *lastVC = [self.viewControllers lastObject];
    if (IsClassOverrideMethod([lastVC class], _cmd)) {
        return [lastVC preferredInterfaceOrientationForPresentation];
    }
    else {
        return UIInterfaceOrientationPortrait;
    }
}

- (UIStatusBarStyle)preferredStatusBarStyle {
    return UIStatusBarStyleDefault;
}

@end
