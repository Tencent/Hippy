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

#import "ViewController.h"
#import "HippyRootView.h"

@interface ViewController ()<HippyBridgeDelegate>

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.

    BOOL isSimulator = NO;
    #if TARGET_IPHONE_SIMULATOR
        isSimulator = YES;
    #endif

    NSString *commonBundlePath = [[NSBundle mainBundle] pathForResource:@"vendor.ios" ofType:@"js" inDirectory:@"res"];
    NSString *businessBundlePath = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res"];
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self bundleURL:[NSURL fileURLWithPath:commonBundlePath] moduleProvider:nil launchOptions:nil];
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge businessURL:[NSURL fileURLWithPath:businessBundlePath] moduleName:@"Demo" initialProperties:  @{@"isSimulator": @(isSimulator)} launchOptions:nil shareOptions:nil debugMode:NO delegate:nil];
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    rootView.frame = self.view.bounds;
    [self.view addSubview:rootView];
}

- (NSDictionary *)objectsBeforeExecuteCode {
    NSDictionary *dic1 = @{@"name": @"zs", @"gender": @"male"};
    NSDictionary *dic2 = @{@"name": @"ls", @"gender": @"male"};
    NSDictionary *dic3 = @{@"name": @"ww", @"gender": @"female"};
        
    NSData *data1 = [NSJSONSerialization dataWithJSONObject:dic1 options:0 error:nil];
    NSData *data2 = [NSJSONSerialization dataWithJSONObject:dic2 options:0 error:nil];
    NSData *data3 = [NSJSONSerialization dataWithJSONObject:dic3 options:0 error:nil];
    
    NSString *string1 = [[NSString alloc] initWithData:data1 encoding:NSUTF8StringEncoding];
    NSString *string2 = [[NSString alloc] initWithData:data2 encoding:NSUTF8StringEncoding];
    NSString *string3 = [[NSString alloc] initWithData:data3 encoding:NSUTF8StringEncoding];
    
    NSDictionary *ret = @{@"info1": string1, @"info2": string2, @"info3": string3};
    return ret;
}

@end
