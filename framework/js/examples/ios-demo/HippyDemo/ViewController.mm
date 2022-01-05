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
#import "HippyBundleURLProvider.h"

#include "dom/dom_manager.h"
#include "NativeRenderManager.h"
#include "dom/dom_node.h"
#include "dom/dom_value.h"

@interface ViewController ()<HippyBridgeDelegate> {
    std::shared_ptr<hippy::DomManager> _domManager;
    std::shared_ptr<NativeRenderManager> _nativeRenderManager;
}

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.

    HippySetLogFunction(^(HippyLogLevel level, HippyLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
        NSLog(@"hippy says:%@ in file %@ at line %@", message, fileName, lineNumber);
    });
    [self runCommonDemo];
//    [self runDemoWithoutRuntime];
}

- (void)runCommonDemo {
    BOOL isSimulator = NO;
    #if TARGET_IPHONE_SIMULATOR
        isSimulator = YES;
    #endif
//release macro below if use debug mode
//#define HIPPYDEBUG
    
#ifdef HIPPYDEBUG
    NSDictionary *launchOptions = @{@"EnableTurbo": @YES, @"DebugMode": @(YES)};
    NSString *localhost = [HippyBundleURLProvider sharedInstance].localhost ?: @"localhost:38989";
    NSString *bundleStr = [NSString stringWithFormat:@"http://%@%@", localhost, [HippyBundleURLProvider sharedInstance].debugPathUrl];
    NSURL *bundleUrl = [NSURL URLWithString:bundleStr];
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                      bundleURL:bundleUrl
                                                 moduleProvider:nil
                                                  launchOptions:launchOptions
                                                    executorKey:@"Demo"];
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge moduleName:@"Demo" initialProperties:@{@"isSimulator": @(isSimulator)} shareOptions:@{@"DebugMode": @(YES)} delegate:nil];
#else
    NSString *commonBundlePath = [[NSBundle mainBundle] pathForResource:@"vendor.ios" ofType:@"js" inDirectory:@"res"];
    NSString *businessBundlePath = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res"];
    NSDictionary *launchOptions = @{@"EnableTurbo": @YES};
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                      bundleURL:[NSURL fileURLWithPath:commonBundlePath]
                                                 moduleProvider:nil
                                                  launchOptions:launchOptions
                                                    executorKey:@"Demo"];
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge businessURL:[NSURL fileURLWithPath:businessBundlePath] moduleName:@"Demo" initialProperties:  @{@"isSimulator": @(isSimulator)} launchOptions:nil shareOptions:nil debugMode:NO delegate:nil];
#endif
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    rootView.frame = self.view.bounds;
    [self.view addSubview:rootView];
}

- (void)runDemoWithoutRuntime {
    //step1: create HippyBridge and HippyRootView
    HippyBridge *bridge = [[HippyBridge alloc] initWithmoduleProviderWithoutRuntime:nil];
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridgeButNoRuntime:bridge];
    rootView.backgroundColor = [UIColor whiteColor];
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    rootView.frame = self.view.bounds;
    [self.view addSubview:rootView];
    
    //step2: get HippyUIManager, then set DomManager for it.
    //and set RenderManager for DomNanager
    HippyUIManager *uiManager = [bridge moduleForName:@"UIManager"];
    int32_t rootTag = [rootView.hippyTag intValue];
    _domManager = std::make_shared<hippy::DomManager>(rootTag);
    [uiManager setDomManager:_domManager];
    _domManager->SetRootSize(CGRectGetWidth(rootView.bounds), CGRectGetHeight(rootView.bounds));
    _nativeRenderManager = std::make_shared<NativeRenderManager>(uiManager);
    _domManager->SetRenderManager(_nativeRenderManager);

    //step3:create your nodes data into dommanager
    auto nodesData = [self mockNodesData];
    _domManager->CreateDomNodes(std::move(nodesData));
    _domManager->BeginBatch();
    _domManager->EndBatch();
}

- (std::vector<std::shared_ptr<hippy::DomNode>>) mockNodesData {
    //mock nodes
    std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>> style_map1;
    std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>> dom_ext_map1;
    std::shared_ptr<hippy::DomNode> parentDomNode = std::make_shared<hippy::DomNode>(1, 10, 0, "View", "View", std::move(style_map1), std::move(dom_ext_map1), _domManager);
    parentDomNode->AddStyle("left", std::make_shared<tdf::base::DomValue>(0));
    parentDomNode->AddStyle("top", std::make_shared<tdf::base::DomValue>(0));
    parentDomNode->AddStyle("width", std::make_shared<tdf::base::DomValue>(300));
    parentDomNode->AddStyle("height", std::make_shared<tdf::base::DomValue>(300));
    parentDomNode->AddExtStyle("backgroundColor", std::make_shared<tdf::base::DomValue>((uint32_t)4284874905));

    std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>> style_map2;
    std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>> dom_ext_map2;
    std::shared_ptr<hippy::DomNode> domNode1 = std::make_shared<hippy::DomNode>(2, 1, 0, "View", "View", std::move(style_map2), std::move(dom_ext_map2), _domManager);
    domNode1->AddStyle("left", std::make_shared<tdf::base::DomValue>(0));
    domNode1->AddStyle("top", std::make_shared<tdf::base::DomValue>(0));
    domNode1->AddStyle("width", std::make_shared<tdf::base::DomValue>(200));
    domNode1->AddStyle("height", std::make_shared<tdf::base::DomValue>(200));
    domNode1->AddExtStyle("backgroundColor", std::make_shared<tdf::base::DomValue>((uint32_t)4294953984));

    std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>> style_map3;
    std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>> dom_ext_map3;
    std::shared_ptr<hippy::DomNode> domNode2 = std::make_shared<hippy::DomNode>(3, 1, 1, "View", "View", std::move(style_map3), std::move(dom_ext_map3), _domManager);
    domNode2->AddStyle("left", std::make_shared<tdf::base::DomValue>(0));
    domNode2->AddStyle("top", std::make_shared<tdf::base::DomValue>(0));
    domNode2->AddStyle("width", std::make_shared<tdf::base::DomValue>(100));
    domNode2->AddStyle("height", std::make_shared<tdf::base::DomValue>(100));
    domNode2->AddExtStyle("backgroundColor", std::make_shared<tdf::base::DomValue>((uint32_t)4291624806));

    return {parentDomNode, domNode1, domNode2};
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

@end
