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

#import "PageCreationViewController.h"
#import "PageCreationCell.h"
#import "DebugCell.h"
#import "IconUtils.h"
#import "HippyDemoViewController.h"
#import "HippyBundleURLProvider.h"
#import "UIViewController+Title.h"

static NSString *const kNormalCell = @"normalCell";
static NSString *const kDebugCell = @"debugCell";

static NSString *const kDriverTypeReact = @"JS React";
static NSString *const kDriverTypeVue2 = @"JS Vue2";
static NSString *const kDriverTypeVue3 = @"JS Vue3";

static NSString *const kRenderTypeNative = @"Native";

static NSString *const kCancel = @"取消";

@interface PageCreationViewController ()<UITableViewDelegate, UITableViewDataSource> {
    DriverType _currentDriver;
    NSString *_renderer;
    UITableView *_tableView;
    BOOL _debugMode;
    UIButton *_creationButton;
}

@end

@implementation PageCreationViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    [self setNavigationItemTitle:@"Page Managerment"];
    _currentDriver = DriverTypeReact;
    _renderer = kRenderTypeNative;
    [self setNavigationAreaBackground:[UIColor whiteColor]];
    CGFloat ratio = 229.f / 255.f;
    [self setContentAreaBackgroundColor:[UIColor colorWithRed:ratio green:ratio blue:ratio alpha:1]];
    
    UITableView *tableView = [[UITableView alloc] initWithFrame:UIEdgeInsetsInsetRect(self.contentAreaView.bounds, UIEdgeInsetsMake(0, 10, 0, 10)) style:UITableViewStyleGrouped];
    tableView.delegate = self;
    tableView.dataSource = self;
    tableView.scrollEnabled = NO;
    tableView.backgroundColor = [UIColor clearColor];
    [tableView registerNib:[UINib nibWithNibName:@"PageCreationCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:kNormalCell];
    [tableView registerNib:[UINib nibWithNibName:@"DebugCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:kDebugCell];
    [self.contentAreaView addSubview:tableView];
    _tableView = tableView;
    
    UIButton *creationButton = [UIButton buttonWithType:UIButtonTypeCustom];
    creationButton.frame = CGRectMake(0, 0, 179, 44);
    [creationButton addTarget:self action:@selector(createDemoAction) forControlEvents:UIControlEventTouchUpInside];
    creationButton.hidden = YES;
    //#0A6CFF
    [creationButton setBackgroundColor:[UIColor colorWithRed:0x0A / 255.f green:0x6C / 255.f blue:0xFF / 255.f alpha:1]];
    [creationButton setTitle:@"Create" forState:UIControlStateNormal];
    creationButton.layer.cornerRadius = 20.f;
    [self.view addSubview:creationButton];
    _creationButton = creationButton;
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 3;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return 1;
}

- (NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
    if (0 == section) {
        return @"General";
    }
    return @" ";
}

- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section {
    if (0 == section) {
        return 44;
    }
    return 10;
}

- (NSString *)tableView:(UITableView *)tableView titleForFooterInSection:(NSInteger)section {
    return @" ";
}

- (CGFloat)tableView:(UITableView *)tableView heightForFooterInSection:(NSInteger)section {
    return .1f;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    if (2 == [indexPath section]) {
        return _debugMode ? 116.f : 58.f;
    }
    return 58.f;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    
    if (0 == [indexPath section]) {
        PageCreationCell *cell =
            (PageCreationCell *)[tableView dequeueReusableCellWithIdentifier:kNormalCell
                                                                forIndexPath:indexPath];
        cell.summaryImageView.image = [UIImage imageFromIconName:@"driver_icon"];
        cell.typeLabel.text = @"Driver";
        cell.subTypeLabel.text = @[kDriverTypeReact, kDriverTypeVue2, kDriverTypeVue3][_currentDriver];
        return cell;
    }
    else if (1 == [indexPath section]) {
        PageCreationCell *cell =
            (PageCreationCell *)[tableView dequeueReusableCellWithIdentifier:kNormalCell
                                                                forIndexPath:indexPath];
        cell.summaryImageView.image = [UIImage imageFromIconName:@"driver_icon"];
        cell.typeLabel.text = @"Renderer";
        cell.subTypeLabel.text = _renderer;
        return cell;
    }
    else if (2 == [indexPath section]) {
        DebugCell *cell = (DebugCell *)[tableView dequeueReusableCellWithIdentifier:kDebugCell forIndexPath:indexPath];
        if (!cell.switchAction) {
            __weak UITableView *weakTableView = tableView;
            __weak DebugCell *weakCell = cell;
            __weak PageCreationViewController *weakVC = self;
            [cell setSwitchAction:^(BOOL flag) {
                UITableView *strongTableView = weakTableView;
                DebugCell *strongCell = weakCell;
                PageCreationViewController *strongVC = weakVC;
                if (strongTableView && strongCell && strongVC) {
                    strongCell.debugMode = flag;
                    strongVC->_debugMode = flag;
                    [strongTableView reloadData];
                }
            }];
        }
        return cell;
    }
    else {
        NSAssert(NO, @"no cell returned");
        return nil;
    }
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    if (2 == [indexPath section]) {
        CGRect frame = [cell convertRect:cell.bounds toView:self.view];
        _creationButton.frame = CGRectMake((CGRectGetWidth(self.view.bounds) - CGRectGetWidth(_creationButton.frame)) / 2.f,
                                           CGRectGetMaxY(frame) + 10.f,
                                           CGRectGetWidth(_creationButton.frame),
                                           CGRectGetHeight(_creationButton.frame));
        _creationButton.hidden = NO;
        
        if (_debugMode) {
            NSString *bundleStr = [HippyBundleURLProvider sharedInstance].bundleURLString;
            DebugCell *dCell = (DebugCell *)cell;
            [dCell setDefaultDebugURLString:bundleStr];
        }
    }
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    switch ([indexPath section]) {
        case 0:
            [self showDriverSelectMenu];
            break;
        case 1:
            [self showRenderSelectMenu];
            break;
        default:
            break;
    }
}

- (void)showDriverSelectMenu {
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:nil
                                                                   message:nil
                                                            preferredStyle:UIAlertControllerStyleActionSheet];
    __weak PageCreationViewController *weakVC = self;
    [alert addAction:[UIAlertAction actionWithTitle:kDriverTypeReact style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        PageCreationViewController *strongVC = weakVC;
        if (strongVC) {
            strongVC->_currentDriver = DriverTypeReact;
            [strongVC->_tableView reloadSections:[NSIndexSet indexSetWithIndex:0] withRowAnimation:UITableViewRowAnimationAutomatic];
        }
    }]];
    [alert addAction:[UIAlertAction actionWithTitle:kDriverTypeVue2 style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        PageCreationViewController *strongVC = weakVC;
        if (strongVC) {
            strongVC->_currentDriver = DriverTypeVue2;
            [strongVC->_tableView reloadSections:[NSIndexSet indexSetWithIndex:0] withRowAnimation:UITableViewRowAnimationNone];
        }
    }]];
    [alert addAction:[UIAlertAction actionWithTitle:kDriverTypeVue3 style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        PageCreationViewController *strongVC = weakVC;
        if (strongVC) {
            strongVC->_currentDriver = DriverTypeVue3;
            [strongVC->_tableView reloadSections:[NSIndexSet indexSetWithIndex:0] withRowAnimation:UITableViewRowAnimationNone];
        }
    }]];
    [alert addAction:[UIAlertAction actionWithTitle:kCancel style:UIAlertActionStyleCancel handler:nil]];
    [self presentViewController:alert animated:YES completion:NULL];
}

- (void)showRenderSelectMenu {
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:nil message:nil preferredStyle:UIAlertControllerStyleActionSheet];
    UIAlertAction *nativeAction = [UIAlertAction actionWithTitle:@"Native"
                                                           style:UIAlertActionStyleDefault
                                                         handler:^(UIAlertAction * _Nonnull action) {
        
    }];
    UIAlertAction *tdfAction = [UIAlertAction actionWithTitle:@"TDF"
                                                        style:UIAlertActionStyleDefault
                                                      handler:^(UIAlertAction * _Nonnull action) {
        
    }];
    [tdfAction setValue:[UIColor grayColor] forKey:@"titleTextColor"];
    tdfAction.enabled = NO;
    
    UIAlertAction *voltronAction = [UIAlertAction actionWithTitle:@"Voltron"
                                                            style:UIAlertActionStyleDefault
                                                          handler:^(UIAlertAction * _Nonnull action) {
        
    }];
    [voltronAction setValue:[UIColor grayColor] forKey:@"titleTextColor"];
    voltronAction.enabled = NO;
    
    [alert addAction:[UIAlertAction actionWithTitle:kCancel style:UIAlertActionStyleCancel handler:^(UIAlertAction * _Nonnull action) {
    }]];

    [alert addAction:nativeAction];
    [alert addAction:tdfAction];
    [alert addAction:voltronAction];
    [self presentViewController:alert animated:YES completion:NULL];
}

- (void)createDemoAction {
    DriverType driverType = _currentDriver;
    RenderType renderType = RenderTypeNative;
    NSURL *debugURL = nil;
    if (_debugMode) {
        DebugCell *cell2 = [_tableView cellForRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:2]];
        NSString *debugString = [cell2 debugURLString];
        debugURL = [NSURL URLWithString:debugString];
    }
    HippyDemoViewController *vc = [[HippyDemoViewController alloc] initWithDriverType:driverType 
                                                                           renderType:renderType
                                                                             debugURL:debugURL
                                                                          isDebugMode:_debugMode];
    NSMutableArray<__kindof UIViewController *> *viewControllers = [[self.navigationController viewControllers] mutableCopy];
    [viewControllers removeLastObject];
    [viewControllers addObject:vc];
    [self.navigationController setViewControllers:viewControllers animated:YES];
}

@end
