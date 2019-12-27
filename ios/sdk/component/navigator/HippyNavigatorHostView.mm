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

#import "HippyNavigatorHostView.h"
#import "HippyNavigationControllerAnimator.h"
#import "HippyRootView.h"
#import "HippyBridge.h"
#import "HippyBridge+Private.h"
#import "UIView+Hippy.h"
#import "HippyNavigatorItemViewController.h"
#import "HippyNavigatorRootViewController.h"
#import "HippyAssert.h"

@interface HippyNavigatorHostView() {
    NSDictionary *_initProps;
    NSString *_appName;
    HippyBridge *_bridge;
    HippyNavigatorRootViewController *_navigatorRootViewController;
    BOOL _isPresented;
}
@property (nonatomic, assign) HippyNavigatorDirection nowDirection;
@end

@implementation HippyNavigatorHostView
- (instancetype) initWithBridge:(HippyBridge *)bridge props:(nonnull NSDictionary *)props{
    self = [super init];
    if (self) {
        _initProps = props[@"initialRoute"][@"initProps"];
        _appName = props[@"initialRoute"][@"routeName"];
        _bridge = bridge;
        _isPresented = NO;
        _nowDirection = HippyNavigatorDirectionTypeRight;
    }
    return self;
}

- (void) didMoveToWindow {
    [self presentRootView];
}

- (HippyRootView *)createRootViewForModuleName:(NSString *)moduleName initProperties:(NSDictionary *)props {
    HippyBridge *tempBridge = _bridge;
    if ([tempBridge isKindOfClass:[HippyBatchedBridge class]]) {
        tempBridge = [(HippyBatchedBridge *)tempBridge parentBridge];
    }
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:tempBridge moduleName:moduleName initialProperties:props shareOptions:@{} delegate:nil];
    rootView.backgroundColor = [UIColor whiteColor];
    [rootView bundleFinishedLoading:tempBridge];
    return rootView;
}

- (void) presentRootView {
    if (!_isPresented && self.window) {
        _isPresented = YES;
        HippyRootView *rootView = [self createRootViewForModuleName:_appName initProperties:_initProps];
        HippyNavigatorItemViewController *itemViewController = [[HippyNavigatorItemViewController alloc] initWithView:rootView];
        UIViewController *presentingViewController = [self hippyViewController];
        HippyAssert(presentingViewController, @"no presenting view controller for navigator module");
        _navigatorRootViewController = [[HippyNavigatorRootViewController alloc] initWithRootViewController:itemViewController];
        _navigatorRootViewController.navigationBar.hidden = YES;
        _navigatorRootViewController.modalTransitionStyle = UIModalTransitionStyleCrossDissolve;
        _navigatorRootViewController.delegate = self;
        [presentingViewController presentViewController:_navigatorRootViewController animated:YES completion:^{
            
        }];
    }
}

- (void) insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    [super insertHippySubview:subview atIndex:0];
}

- (void) push:(NSDictionary *)params {
    BOOL animated = [params[@"animated"] boolValue];
    NSString *appName = params[@"routeName"];
    NSDictionary *initProps = params[@"initProps"];
    NSString *direction = params[@"fromDirection"];
    self.nowDirection = [self findDirection:direction];
    
    HippyRootView *rootView = [self createRootViewForModuleName:appName initProperties:initProps];
    HippyNavigatorItemViewController *itemViewController = [[HippyNavigatorItemViewController alloc] initWithView:rootView];
    [_navigatorRootViewController pushViewController:itemViewController animated:animated];
    
}

- (void) pop:(NSDictionary *)params {
    BOOL animated = [params[@"animated"] boolValue];
    NSString *direction = params[@"toDirection"];
    self.nowDirection = [self findDirection:direction];
    
    [_navigatorRootViewController popViewControllerAnimated:animated];
}

- (HippyNavigatorDirection)findDirection:(NSString *)directionString {
    //默认方向
    if (!directionString || [directionString isEqualToString:@""]) {
        return HippyNavigatorDirectionTypeRight;
    }
    HippyNavigatorDirection result = HippyNavigatorDirectionTypeRight;
    if ([directionString isEqualToString:@"left"]) {
        result = HippyNavigatorDirectionTypeLeft;
    } else if ([directionString isEqualToString:@"bottom"]) {
        result = HippyNavigatorDirectionTypeBottom;
    } else if ([directionString isEqualToString:@"top"]) {
        result = HippyNavigatorDirectionTypeTop;
    } else if ([directionString isEqualToString:@"right"]) {
        result = HippyNavigatorDirectionTypeRight;
    }
    return result;
}

- (void) invalidate {
    if (_isPresented) {
        [_navigatorRootViewController dismissViewControllerAnimated:YES completion:NULL];
        _isPresented = NO;
    }
}


- (id<UIViewControllerAnimatedTransitioning>)navigationController:(UINavigationController *)navigationController animationControllerForOperation:(UINavigationControllerOperation)operation fromViewController:(UIViewController *)fromVC toViewController:(UIViewController *)toVC
{
    if (self.nowDirection == HippyNavigatorDirectionTypeRight) {
        //用系统默认的
        return nil;
    }
    return [HippyNavigationControllerAnimator animatorWithAction:operation diretion:self.nowDirection];
}


- (void) dealloc {
    
}
@end
