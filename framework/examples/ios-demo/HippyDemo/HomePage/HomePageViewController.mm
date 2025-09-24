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

#import "HomePageViewController.h"
#import "HippyBridge.h"
#import "IconUtils.h"
#import "SettingsViewController.h"
#import "PageManagerViewController.h"
#import "UIViewController+Title.h"

@interface HomePageViewController () <UITabBarDelegate>

@property (weak, nonatomic) IBOutlet UITabBar *tabbar;
/// the New Page tabbar item
@property (weak, nonatomic) IBOutlet UITabBarItem *pageItem;
/// the setting tabbar item
@property (weak, nonatomic) IBOutlet UITabBarItem *settingItem;

- (IBAction)toNewPage;
- (IBAction)toSetting;

@end

@implementation HomePageViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    CAGradientLayer *layer = [CAGradientLayer layer];
    layer.colors = @[(id)[UIColor colorWithRed:0xf0 / 255.f green:0xf6 / 255.f blue:0xff / 255.f alpha:1].CGColor,
                    (id)[UIColor whiteColor].CGColor];
    layer.frame = self.view.bounds;
    [self.view.layer insertSublayer:layer atIndex:0];
    
    [self setNavigationItemTitle:@"DEMO"];
    
    self.imageView.image = [UIImage imageFromIconName:@"first_page_logo"];
    
    self.verLabel.text = [NSString stringWithFormat:@"Ver:%@", _HippySDKVersion];
    
    self.tabbar.delegate = self;
    [self.tabbar setSelectedItem:self.pageItem];    
}

- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];
    CGRect frame = self.view.bounds;
    CALayer *layer = [[[self.view layer] sublayers] firstObject];
    layer.frame = frame;
}

- (void)dismissTipsView {
    [self.tipsImageView removeFromSuperview];
}

- (IBAction)toNewPage {
    [self dismissTipsView];
    [self.navigationController pushViewController:[[PageManagerViewController alloc] init] animated:YES];
}

- (IBAction)toSetting {
    [self dismissTipsView];
    [self.navigationController pushViewController:[[SettingsViewController alloc] init] animated:YES];
}

#pragma - UITabBarDelegate

- (void)tabBar:(UITabBar *)tabBar didSelectItem:(UITabBarItem *)item {
    if (item == self.pageItem) {
        [self toNewPage];
    } else if (item == self.settingItem) {
        [self toSetting];
    }
}

@end
