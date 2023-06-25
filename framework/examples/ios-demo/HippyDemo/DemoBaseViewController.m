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

#import "DemoBaseViewController.h"

@interface DemoBaseViewController () {
    UIView *_navigationAreaView;
    UIView *_contentAreaView;
}

@end

@implementation DemoBaseViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    [self drawSubviews];
}

- (void)drawSubviews {
    CGFloat originY = 0.f;
    UIView *navigationBar = self.navigationController.navigationBar;
    CGRect rect = [navigationBar convertRect:navigationBar.bounds toView:self.view];
    if (!CGRectIsEmpty(rect) && !CGRectIsNull(rect)) {
        originY = CGRectGetMaxY(rect);
        _navigationAreaView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, CGRectGetWidth(self.view.bounds), originY)];
        _navigationAreaView.backgroundColor = [UIColor clearColor];
        [self.view addSubview:_navigationAreaView];
        
        _contentAreaView = [[UIView alloc] initWithFrame:CGRectMake(0, originY, CGRectGetWidth(self.view.bounds), CGRectGetHeight(self.view.bounds) - originY)];
        _contentAreaView.backgroundColor = [UIColor clearColor];
        [self.view addSubview:_contentAreaView];
    }
    else {
        _contentAreaView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, CGRectGetWidth(self.view.bounds), CGRectGetHeight(rect) - originY)];
        _contentAreaView.backgroundColor = [UIColor clearColor];
        [self.view addSubview:_contentAreaView];
    }
}

-(void)viewDidLayoutSubviews {
    CGFloat originY = 0.f;
    UIView *navigationBar = self.navigationController.navigationBar;
    CGRect rect = [navigationBar convertRect:navigationBar.bounds toView:self.view];
    if (!CGRectIsEmpty(rect) && !CGRectIsNull(rect)) {
        originY = CGRectGetMaxY(rect);
        _navigationAreaView.frame = CGRectMake(0, 0, CGRectGetWidth(self.view.bounds), originY);
        
        _contentAreaView.frame = CGRectMake(0, originY, CGRectGetWidth(self.view.bounds), CGRectGetHeight(self.view.bounds) - originY);
    }
    else {
        _contentAreaView.frame = CGRectMake(0, 0, CGRectGetWidth(self.view.bounds), CGRectGetHeight(rect) - originY);
    }
}

- (void)setNavigationAreaBackground:(UIColor *)color {
    _navigationAreaView.backgroundColor = color;
}

- (void)setContentAreaBackgroundColor:(UIColor *)color {
    _contentAreaView.backgroundColor = color;
}

- (UIView *)navigationAreaView {
    return _navigationAreaView;
}

- (UIView *)contentAreaView {
    return _contentAreaView;
}

@end
