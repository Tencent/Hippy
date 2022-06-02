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
#import "HippyBridge+LocalFileSource.h"
#import "HippyLogging.h"
#import "HippyBundleURLProvider.h"
#import "UIView+Hippy.h"
#include "dom/dom_manager.h"
#include "NativeRenderManager.h"
#include "dom/dom_node.h"
#include "dom/dom_value.h"
#import "DemoConfigs.h"
#import "HippyBridge+Private.h"
#import "HippyFrameworkProxy.h"
#import "HippyDomNodeUtils.h"
#import "HippyImageDataLoader.h"
#import "HippyDefaultImageProvider.h"
#import "HippyRedBox.h"
#import "HippyAssert.h"
#import "MyViewManager.h"

@interface ViewController ()<HippyBridgeDelegate, HippyFrameworkProxy, HippyMethodInterceptorProtocol> {
    std::shared_ptr<hippy::DomManager> _domManager;
    std::shared_ptr<NativeRenderManager> _nativeRenderManager;
    HippyBridge *_bridge;
}

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    HippySetLogMessageFunction(^(HippyLogLevel level, HippyLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
        NSLog(@"hippy says:%@ in file %@ at line %@", message, fileName, lineNumber);
    });
    [self runCommonDemo];
}

- (void)runCommonDemo {
    BOOL isSimulator = NO;
    #if TARGET_IPHONE_SIMULATOR
        isSimulator = YES;
    #endif
//release macro below if use debug mode
//#define HIPPYDEBUG

#ifdef HIPPYDEBUG
    NSDictionary *launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO), @"DebugMode": @(YES)};
    NSString *bundleStr = [HippyBundleURLProvider sharedInstance].bundleURLString;
    NSURL *bundleUrl = [NSURL URLWithString:bundleStr];
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                      bundleURL:bundleUrl
                                                 moduleProvider:nil
                                                  launchOptions:launchOptions
                                                    executorKey:@"Demo"];
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge moduleName:@"Demo" initialProperties:@{@"isSimulator": @(isSimulator)} delegate:nil];
#else
    NSString *commonBundlePath = [[NSBundle mainBundle] pathForResource:@"vendor.ios" ofType:@"js" inDirectory:@"res"];
    NSString *businessBundlePath = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res"];
    NSDictionary *launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO)};
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                      bundleURL:[NSURL fileURLWithPath:commonBundlePath]
                                                 moduleProvider:nil
                                                  launchOptions:launchOptions
                                                    executorKey:@"Demo"];
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge businessURL:[NSURL fileURLWithPath:businessBundlePath]
                                                         moduleName:@"Demo" initialProperties:  @{@"isSimulator": @(isSimulator)}
                                                      launchOptions:nil delegate:nil];
#endif
    HippySetErrorLogShowAction(^(NSString *message, NSArray<NSDictionary *> *stacks) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [[HippyBridge currentBridge].redBox showErrorMessage:message withStack:stacks];
        });
    });
    bridge.methodInterceptor = self;

    rootView.frame = self.view.bounds;
    
    [bridge setUpWithRootTag:rootView.hippyTag rootSize:rootView.bounds.size frameworkProxy:bridge rootView:rootView.contentView screenScale:[UIScreen mainScreen].scale];
    
    //4.set frameworkProxy for bridge.If bridge cannot handle frameworkProxy protocol, it will forward to {self}
    bridge.frameworkProxy = self;
    bridge.renderManager->RegisterExtraComponent(@{@"MyView": [MyViewManager class]});

    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
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

- (BOOL)shouldStartInspector:(HippyBridge *)bridge {
    return bridge.debugMode;
}

- (NSURL *)inspectorSourceURLForBridge:(HippyBridge *)bridge {
    return bridge.bundleURL;
}

#pragma mark HippyFrameworkProxy Delegate Implementation
- (NSString *)standardizeAssetUrlString:(NSString *)UrlString forRenderContext:(nonnull id<HippyRenderContext>)renderContext {
    //这里将对应的URL转换为标准URL
    //比如将相对地址根据沙盒路径为转换绝对地址
    return UrlString;
}

- (id<HippyImageDataLoaderProtocol>)imageDataLoaderForRenderContext:(id<HippyRenderContext>)renderContext {
    //设置自定义的图片加载实例，负责图片加载。默认使用HippyImageDataLoader
    return [HippyImageDataLoader new];
}

- (Class<HippyImageProviderProtocol>)imageProviderClassForRenderContext:(id<HippyRenderContext>)renderContext {
    //设置HippyImageProviderProtocol类。
    //HippyImageProviderProtocol负责将NSData转换为UIImage，用于处理ios系统无法处理的图片格式数据
    //默认使用HippyDefaultImageProvider
    return [HippyDefaultImageProvider class];
}

- (BOOL)shouldInvokeWithModuleName:(NSString *)moduleName methodName:(NSString *)methodName arguments:(NSArray<id<HippyBridgeArgument>> *)arguments argumentsValues:(NSArray *)argumentsValue containCallback:(BOOL)containCallback {
    HippyAssert(moduleName, @"module name must not be null");
    HippyAssert(methodName, @"method name must not be null");
    return YES;
}

- (BOOL)shouldCallbackBeInvokedWithModuleName:(NSString *)moduleName methodName:(NSString *)methodName callbackId:(NSNumber *)cbId arguments:(id)arguments {
    HippyAssert(moduleName, @"module name must not be null");
    HippyAssert(methodName, @"method name must not be null");
    return YES;
}

@end
