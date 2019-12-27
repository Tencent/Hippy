//
//  TestModule.m
//  React
//
//  Created by mengyanluo on 2018/6/20.
//  Copyright © 2018年 Facebook. All rights reserved.
//

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

@end
