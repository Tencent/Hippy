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

#import "TestModule.h"
#import "HippyRootView.h"
#import "AppDelegate.h"

@implementation TestModule

HIPPY_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue
{
	return dispatch_get_main_queue();
}

HIPPY_EXPORT_METHOD(debug:(nonnull NSNumber *)instanceId)
{
	AppDelegate *delegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];
	UIViewController *nav = delegate.window.rootViewController;
	UIViewController *vc = [[UIViewController alloc] init];
	BOOL isSimulator = NO;
#if TARGET_IPHONE_SIMULATOR
	isSimulator = YES;
#endif
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:nil businessURL:nil moduleName:@"Demo" initialProperties:@{@"isSimulator": @(isSimulator)} launchOptions:nil shareOptions:nil debugMode:YES delegate:nil];
	rootView.backgroundColor = [UIColor whiteColor];
	rootView.frame = vc.view.bounds;
	[vc.view addSubview:rootView];
    vc.modalPresentationStyle = UIModalPresentationFullScreen;
    [nav presentViewController:vc animated:YES completion:NULL];
}
HIPPY_EXPORT_METHOD(log:(NSString *)log)
{
    NSLog(@"%@",log);
}
HIPPY_EXPORT_METHOD(helloNative:(NSDictionary *)hippyMap)
{
    NSLog(@"%@",hippyMap);
}
HIPPY_EXPORT_METHOD(helloNativeWithPromise:(NSDictionary *)hippyMap resolver:(__unused HippyPromiseResolveBlock)resolve rejecter:(__unused HippyPromiseRejectBlock)reject)
{
    NSDictionary *dict = @{
    @"code":@"1",
    @"result":@"hello i am from native"
    };
    resolve(dict);
}
@end
