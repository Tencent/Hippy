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
#import "HippyLog.h"

@interface ViewController ()<HippyBridgeDelegate>

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.

    HippySetLogFunction(^(HippyLogLevel level, HippyLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
        NSLog(@"hippy says:%@ in file %@ at line %@", message, fileName, lineNumber);
    });

    
    BOOL isSimulator = NO;
    #if TARGET_IPHONE_SIMULATOR
        isSimulator = YES;
    #endif

    NSString *commonBundlePath = [[NSBundle mainBundle] pathForResource:@"vendor.ios" ofType:@"js" inDirectory:@"res"];
    NSString *businessBundlePath = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res"];
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self bundleURL:[NSURL fileURLWithPath:commonBundlePath] moduleProvider:nil launchOptions:nil executorKey:@"Demo"];
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge businessURL:[NSURL fileURLWithPath:businessBundlePath] moduleName:@"Demo" initialProperties:  @{@"isSimulator": @(isSimulator)} launchOptions:nil shareOptions:nil debugMode:NO delegate:nil];
    
    
//    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self bundleURL:[NSURL URLWithString:@"http://localhost:38989/index.bundle?platform=ios&dev=true&minify=false"] moduleProvider:nil launchOptions:nil executorKey:@"Demo"];
//    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge moduleName:@"Demo" initialProperties:nil shareOptions:nil delegate:nil];;

    
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    rootView.frame = self.view.bounds;
    [self.view addSubview:rootView];
    
}

- (NSDictionary *)objectsBeforeExecuteCode {
    NSDictionary *dic1 = @{@"name": @"zs", @"gender": @"male"};
    NSDictionary *dic2 = @{@"name": @"ls", @"gender": @"male"};
    NSDictionary *dic3 = @{@"name": @"ww", @"gender": @"female"};
            
    NSDictionary *ret = @{@"info1": dic1, @"info2": dic2, @"info3": dic3};
    return ret;
}

- (NSDictionary *)objectsBeforeExecuteSecondaryCode {
    return @{@"secKey":@"value",
             @"secNum":@(12),
             @"secDic": @{@"key1":@"value", @"number": @(2)},
             @"thrAry":@[@"value1", @"value2", @(3), @[@"vv1", @"vv2"], @{@"k1": @"v1", @"k2": @"v2"}]
    };
}

- (BOOL)dynamicLoad:(HippyBridge *)bridge URI:(NSString *)uri completion:(void (^)(NSString *))completion {
//    NSURL *url = [NSURL URLWithString:uri];
//    NSURLRequest *req = [NSURLRequest requestWithURL:url];
//    [[NSURLSession sharedSession] dataTaskWithRequest:req completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
//        if (error) {
//            NSLog(@"dynamic load error: %@", [error description]);
//        }
//        else {
//            NSString *result = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
//            completion(result);
//        }
//    }];;
    //简单处理，直接返回。
//    completion(@"var a = 1");
    return false;
}

@end
