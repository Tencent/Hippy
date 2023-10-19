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

#import "PageManagerViewController.h"
#import "HippyPageCache.h"
#import "PageCreationViewController.h"
#import "HippyPageCacheContainerView.h"
#import "HippyDemoViewController.h"
#import "UIViewController+Title.h"

@interface PageManagerViewController () {
    HippyPageCacheContainerView *_containerView;
}

@end

@implementation PageManagerViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    self.view.backgroundColor = [UIColor whiteColor];
    [self setNavigationItemTitle:@"Page Managerment"];
    [self drawSnapshot];
    [self setNavigationAreaBackground:[UIColor whiteColor]];
    CGFloat ratio = 229.f / 255.f;
    [self setContentAreaBackgroundColor:[UIColor colorWithRed:ratio green:ratio blue:ratio alpha:1]];
}

- (void)drawSnapshot {
    HippyPageCacheContainerView *containerView =
        [[HippyPageCacheContainerView alloc] initWithPageCacheManager:[HippyPageCacheManager defaultPageCacheManager]
                                                                frame:self.contentAreaView.bounds];
    __weak PageManagerViewController *weakSelf = self;
    [containerView setAddAction:^{
        PageManagerViewController *strongSelf = weakSelf;
        if (strongSelf) {
            [strongSelf creationAction];
        }
    }];
    [containerView setDeleteAction:^(HippyPageCache * _Nonnull pageCache) {
        PageManagerViewController *strongSelf = weakSelf;
        if (strongSelf) {
            [strongSelf deleteAction:pageCache];
        }
    }];
    [containerView setClickAction:^(HippyPageCache * _Nonnull pageCache) {
        PageManagerViewController *strongSelf = weakSelf;
        if (strongSelf) {
            [strongSelf clickAction:pageCache];
        }
    }];
    containerView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self.contentAreaView addSubview:containerView];
    _containerView = containerView;
}

- (void)creationAction {
    PageCreationViewController *vc = [[PageCreationViewController alloc] init];
    self.navigationItem.backButtonTitle = @" ";
    [self.navigationController pushViewController:vc animated:YES];
}

- (void)deleteAction:(HippyPageCache *)pageCache {
    [[HippyPageCacheManager defaultPageCacheManager] removePageCache:pageCache];
}

- (void)clickAction:(HippyPageCache *)pageCache {
    HippyDemoViewController *vc = [[HippyDemoViewController alloc] initWithPageCache:pageCache];
    self.navigationItem.backButtonTitle = @" ";
    [self.navigationController pushViewController:vc animated:YES];
}

@end
