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

#import "SettingsViewController.h"
#import "IconUtils.h"
#import "UIViewController+Title.h"

static NSString *const kCellIndentifier = @"kCellIndentifier";

@interface SettingsViewController ()<UITableViewDelegate, UITableViewDataSource>

@end

@implementation SettingsViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    [self setNavigationAreaBackground:[UIColor whiteColor]];
    [self setContentAreaBackgroundColor:[UIColor colorWithRed:0xF6 / 255.f green:0xF8 / 255.f blue:0xFB / 255.f alpha:1]];
    [self setNavigationItemTitle:@"Settings"];
    [self attachConstructingView];
}

- (void)attachConstructingView {
    static CGSize size = {248, 212};
    CGSize containerSize = self.view.bounds.size;
    UIImageView *imageView = [[UIImageView alloc] initWithFrame:CGRectMake((containerSize.width - size.width) / 2.f, 150, size.width, size.height)];
    imageView.image = [UIImage imageFromIconName:@"constructing"];
    [self.contentAreaView addSubview:imageView];
    
    UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(0, 0, 0, 0)];
    label.text = @"页面建设中...";
    label.textColor = [UIColor colorWithRed:0x7b / 255.f green:0x88 / 255.f blue:0x9c / 255.f alpha:1];
    label.font = [UIFont fontWithName:@"PingFang SC" size:16];
    [label sizeToFit];
    CGSize labelSize = label.frame.size;
    label.frame = CGRectMake((containerSize.width - labelSize.width) / 2.f, 333, labelSize.width, labelSize.height);
    [self.contentAreaView addSubview:label];
}

- (void)attachTableView {
    UITableView *tableView = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStyleGrouped];
    tableView.delegate = self;
    tableView.dataSource = self;
    [self.view addSubview:tableView];
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return 2;
}

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
    return @"General";
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:kCellIndentifier];
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleValue1 reuseIdentifier:kCellIndentifier];
    }
//    cell.textLabel.text = @
    return cell;
}

@end
