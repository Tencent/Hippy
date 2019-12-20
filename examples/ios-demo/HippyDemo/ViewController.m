//
//  ViewController.m
//  HippyDemo
//
//  Created by ozonelmy on 2019/12/17.
//  Copyright © 2019 tencent. All rights reserved.
//

#import "ViewController.h"
#import "HippyRootView.h"

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    NSString *commonBundlePath = [[NSBundle mainBundle] pathForResource:@"vendor.ios" ofType:@"js" inDirectory:@"res"];
    NSString *businessBundlePath = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res"];
    HippyBridge *bridge = [[HippyBridge alloc] initWithBundleURL:[NSURL fileURLWithPath:commonBundlePath] moduleProvider:nil launchOptions:nil];
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge businessURL:[NSURL fileURLWithPath:businessBundlePath] moduleName:@"Demo" initialProperties:nil launchOptions:nil shareOptions:nil debugMode:NO delegate:nil];
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    rootView.frame = self.view.bounds;
    [self.view addSubview:rootView];
}


@end
