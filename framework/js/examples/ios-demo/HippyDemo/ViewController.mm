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
#import "HippyLog.h"
#import "HippyBundleURLProvider.h"
#import "UIView+Hippy.h"
#include "dom/dom_manager.h"
#include "NativeRenderManager.h"
#include "dom/dom_node.h"
#include "dom/dom_value.h"
#import "DemoConfigs.h"
#import "UIView+RootViewRegister.h"

@interface ViewController ()<HippyBridgeDelegate> {
    std::shared_ptr<hippy::DomManager> _domManager;
    std::shared_ptr<NativeRenderManager> _nativeRenderManager;
    HippyBridge *_bridge;
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
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    rootView.frame = self.view.bounds;
    [self.view addSubview:rootView];
}

- (void)runDemoWithoutRuntime {
    //step1: create bridge and rootview, and set sandbox directory if needed
    //you need hold bridge
    _bridge = [[HippyBridge alloc] initWithmoduleProviderWithoutRuntime:nil];
    //set sandbox directory if need
    //need import HippyBridge+LocalFileSource.h for [HippyBridge setSandboxDirectory:] method
    NSString *businessBundlePath = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res"];
    businessBundlePath = [businessBundlePath stringByDeletingLastPathComponent];
    [_bridge setSandboxDirectory:businessBundlePath];
    //you view MUST conforms to protocol HippyInvalidating and implement method invalidate
    UIView *view = [[UIView alloc] initWithFrame:self.view.bounds];
    view.backgroundColor = [UIColor whiteColor];
    view.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    
    //step2:assign a root tag for rootview
    int32_t rootTag = 10;
    view.hippyTag = @(10);
    [self.view addSubview:view];
    
    //step3: register view as root view.
    [view registerAsHippyRootView:_bridge];
    
    //step4: create dom manager, assign to uimanager
    //you need hold dom mananger
    HippyUIManager *uiManager = [_bridge moduleForName:@"UIManager"];
    _domManager = std::make_shared<hippy::DomManager>(rootTag);
    _domManager->StartTaskRunner();
    [uiManager setDomManager:_domManager];
    
    //step5: set root view size for dom_manager
    _domManager->SetRootSize(CGRectGetWidth(view.bounds), CGRectGetHeight(view.bounds));
    
    //step6: create render manager, assign uimanager for it
    //you need hold render manager
    _nativeRenderManager = std::make_shared<NativeRenderManager>(uiManager);
    
    //setp7: set render manager for dom manager
    _domManager->SetRenderManager(_nativeRenderManager);

    //step8:create your nodes data
    auto nodesData = [self mockNodesData];
    _domManager->CreateDomNodes(std::move(nodesData));
    _domManager->EndBatch();
}

- (std::vector<std::shared_ptr<hippy::DomNode>>) mockNodesData {
    std::vector<std::shared_ptr<hippy::DomNode>> dom_node_vector;
    using StyleMap = std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>;
    NSString *mockDataPath = [[NSBundle mainBundle] pathForResource:@"create_node" ofType:@"json"];
    NSData *mockData = [NSData dataWithContentsOfFile:mockDataPath];
    NSArray<NSDictionary<NSString *, id> *> *mockJson = [NSJSONSerialization JSONObjectWithData:mockData options:(NSJSONReadingOptions)0 error:nil];
    for (NSDictionary<NSString *, id> *mockNode in mockJson) {
        uint32_t tag = 0;
        uint32_t pid = 0;
        uint32_t index = 0;
        StyleMap style_map;
        StyleMap ext_map;
        std::string name;
        for (NSString *key in mockNode) {
            if ([key isEqualToString:@"id"]) {
                tag = [mockNode[@"id"] unsignedIntValue];
            }
            else if ([key isEqualToString:@"pId"]) {
                pid = [mockNode[@"pId"] unsignedIntValue];
            }
            else if ([key isEqualToString:@"index"]) {
                index = [mockNode[@"index"] unsignedIntValue];
            }
            else if ([key isEqualToString:@"props"]) {
                id props = mockNode[key];
                auto all_props = dictionaryToUnorderedMapDomValue(props);
                auto style_props = all_props["style"];
                if (style_props) {
                    if (tdf::base::DomValue::Type::kObject == style_props->GetType()) {
                        auto style_object = style_props->ToObject();
                        for (auto iter = style_object.begin(); iter != style_object.end(); iter++) {
                            const std::string &iter_key = iter->first;
                            auto &iter_value = iter->second;
                            style_map[iter_key] = std::make_shared<tdf::base::DomValue>(std::move(iter_value));
                        }
                    }
                    all_props.erase("style");
                }
                ext_map.swap(all_props);
            }
            else if ([key isEqualToString:@"name"]) {
                name.assign([mockNode[key] UTF8String]);
            }
        }
        std::shared_ptr<hippy::DomNode> dom_node = std::make_shared<hippy::DomNode>(tag, pid, index, name, name, std::move(style_map), std::move(ext_map), _domManager);
        dom_node_vector.push_back(dom_node);
    }
    return dom_node_vector;
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
