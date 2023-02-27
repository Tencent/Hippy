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

#import "DemoConfigs.h"
#import "HippyBundleURLProvider.h"
#import "HippyDemoLoader.h"
#import "HippyJSEnginesMapper.h"
#import "HippyJSExecutor.h"
#import "HippyRedBox.h"
#import "HPAsserts.h"
#import "HPDefaultImageProvider.h"
#import "HPLog.h"
#import "TypeConverter.h"
#import "NativeRenderImpl.h"
#import "NativeRenderManager.h"
#import "NativeRenderRootView.h"
#import "UIView+NativeRender.h"
#import "ViewController.h"
#import "HPOCToHippyValue.h"
#import "HippyFileHandler.h"

#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#include "driver/scope.h"
#include "footstone/hippy_value.h"

static NSString *const engineKey = @"Demo";

@interface ViewController ()<HippyBridgeDelegate, HippyMethodInterceptorProtocol> {
    std::shared_ptr<hippy::DomManager> _domManager;
    std::shared_ptr<NativeRenderManager> _nativeRenderManager;
    std::shared_ptr<hippy::RootNode> _rootNode;
    HippyBridge *_bridge;
    
    std::shared_ptr<HippyDemoHandler> _demoHandler;
    std::shared_ptr<HippyDemoLoader> _demoLoader;
}

@end

@implementation ViewController

//release macro below for debug mode
//#define HIPPYDEBUG

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    HPSetLogFunction(^(HPLogLevel level, NSString *fileName, NSNumber *lineNumber,
                       NSString *message, NSArray<NSDictionary *> *stack, NSDictionary *userInfo) {
        if (HPLogLevelError <= level && userInfo) {
            dispatch_async(dispatch_get_main_queue(), ^{
                HippyBridge *strongBridge = [userInfo objectForKey:@"bridge"];
                if (strongBridge) {
                    [strongBridge.redBox showErrorMessage:message withStack:stack];
                }
            });
        }
        NSLog(@"hippy says:%@ in file %@ at line %@", message, fileName, lineNumber);
    });
    [self runCommonDemo];
    // [self runDemoWithoutRuntime];
}

- (void)runCommonDemo {
    BOOL isSimulator = NO;
    #if TARGET_IPHONE_SIMULATOR
        isSimulator = YES;
    #endif
    //JS Contexts holding the same engine key will share VM
    NativeRenderRootView *rootView = [[NativeRenderRootView alloc] initWithFrame:self.view.bounds];
    NSDictionary *launchOptions = nil;
    NSArray<NSURL *> *bundleURLs = nil;
    NSURL *sandboxDirectory = nil;
#ifdef HIPPYDEBUG
    NSString *bundleStr = [HippyBundleURLProvider sharedInstance].bundleURLString;
    NSURL *bundleUrl = [NSURL URLWithString:bundleStr];
    launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO), @"DebugMode": @(YES), @"DebugURL": bundleUrl};
    bundleURLs = @[bundleUrl];
    sandboxDirectory = [bundleUrl URLByDeletingLastPathComponent];
    launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO), @"DebugMode": @(YES), @"DebugURL": bundleUrl};
#else
    NSString *commonBundlePath = [[NSBundle mainBundle] pathForResource:@"vendor.ios" ofType:@"js" inDirectory:@"res"];
    NSString *businessBundlePath = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res"];
    launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO)};
    bundleURLs = @[[NSURL fileURLWithPath:commonBundlePath], [NSURL fileURLWithPath:businessBundlePath]];
    sandboxDirectory = [[NSURL fileURLWithPath:businessBundlePath] URLByDeletingLastPathComponent];
#endif
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                 moduleProvider:nil
                                                  launchOptions:launchOptions
                                                    engineKey:engineKey];
    _bridge = bridge;
    
    [self setupBridge:bridge rootView:rootView bundleURLs:bundleURLs props:@{@"isSimulator": @(isSimulator)}];
    //set custom vfs loader
    bridge.sandboxDirectory = sandboxDirectory;
    bridge.contextName = @"Demo";
    bridge.moduleName = @"Demo";
    bridge.methodInterceptor = self;
    [bridge addImageProviderClass:[HPDefaultImageProvider class]];
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    [self.view addSubview:rootView];
    
}

- (void)setupBridge:(HippyBridge *)bridge rootView:(UIView *)rootView bundleURLs:(NSArray<NSURL *> *)bundleURLs props:(NSDictionary *)props {
    //Get DomManager from HippyJSEnginesMapper with Engine key
    auto engineResource = [[HippyJSEnginesMapper defaultInstance] createJSEngineResourceForKey:engineKey];
    auto domManager = engineResource->GetDomManager();
    NSNumber *rootTag = [rootView componentTag];
    //Create a RootNode instance with a root tag
    auto rootNode = std::make_shared<hippy::RootNode>([rootTag unsignedIntValue]);
    //Set RootNode for AnimationManager in RootNode
    rootNode->GetAnimationManager()->SetRootNode(rootNode);
    //Set DomManager for RootNode
    rootNode->SetDomManager(domManager);
    //Set screen scale factor and size for Layout system in RooNode
    rootNode->GetLayoutNode()->SetScaleFactor([UIScreen mainScreen].scale);
    rootNode->SetRootSize(rootView.frame.size.width, rootView.frame.size.height);
    
    //Create NativeRenderManager
    _nativeRenderManager = std::make_shared<NativeRenderManager>();
    //set dom manager
    _nativeRenderManager->SetDomManager(domManager);
    //set image provider for native render manager
    _nativeRenderManager->AddImageProviderClass([HPDefaultImageProvider class]);
    //set vfs for bridge & native render manager
    [self registerVFSLoader];
    //set rendermanager for dommanager
    domManager->SetRenderManager(_nativeRenderManager);
    //bind rootview and root node
    _nativeRenderManager->RegisterRootView(rootView, rootNode);

    __weak HippyBridge *weakBridge = bridge;
    auto cb = [weakBridge](int32_t tag, NSDictionary *params){
        HippyBridge *strongBridge = weakBridge;
        if (strongBridge) {
            [strongBridge rootViewSizeChangedEvent:@(tag) params:params];
        }
    };
    _nativeRenderManager->SetRootViewSizeChangedEvent(cb);
    
    //setup necessary params for bridge
    [bridge setupDomManager:domManager rootNode:rootNode];
    [bridge loadBundleURLs:bundleURLs completion:^(NSURL * _Nullable url, NSError * _Nullable error) {
        NSLog(@"url %@ completion", url);
    }];
    [bridge loadInstanceForRootView:rootTag withProperties:props];
    
    _rootNode = rootNode;
}

- (void)registerVFSLoader {
    _demoHandler = std::make_shared<HippyDemoHandler>();
    _demoLoader = std::make_shared<HippyDemoLoader>();
    _demoLoader->PushDefaultHandler(_demoHandler);
    _demoLoader->AddConvenientDefaultHandler(_demoHandler);
    
    auto fileHandler = std::make_shared<HippyFileHandler>(_bridge);
    _demoLoader->RegisterConvenientUriHandler(@"hpfile", fileHandler);
    
    [_bridge setVFSUriLoader:_demoLoader];
    
    _nativeRenderManager->SetVFSUriLoader(_demoLoader);
}

/**
 * Remove hippy root view example
 */
- (void)removeRootView {
    //1.remove root view from UI hierarchy
    [[[self.view subviews] firstObject] removeFromSuperview];
    //2.unregister root node from render context by id.
    _nativeRenderManager->UnregisterRootView(_rootNode->GetId());
    //3.set elements holding by user to nil
    _rootNode = nil;
}

- (void)reload:(HippyBridge *)bridge {
    [self removeRootView];
    NativeRenderRootView *rootView = [[NativeRenderRootView alloc] initWithFrame:self.view.bounds];
    NSArray<NSURL *> *bundleURLs = nil;
#ifdef HIPPYDEBUG
    NSString *bundleStr = [HippyBundleURLProvider sharedInstance].bundleURLString;
    NSURL *bundleUrl = [NSURL URLWithString:bundleStr];
    bundleURLs = @[bundleUrl];
#else
    NSString *commonBundlePath = [[NSBundle mainBundle] pathForResource:@"vendor.ios" ofType:@"js" inDirectory:@"res"];
    NSString *businessBundlePath = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res"];
    bundleURLs = @[[NSURL fileURLWithPath:commonBundlePath], [NSURL fileURLWithPath:businessBundlePath]];
#endif
    BOOL isSimulator = NO;
#if TARGET_IPHONE_SIMULATOR
    isSimulator = YES;
#endif

    [self setupBridge:bridge rootView:rootView bundleURLs:bundleURLs props:@{@"isSimulator": @(isSimulator)}];
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    [self.view addSubview:rootView];
}

- (void)invalidateForReason:(HPInvalidateReason)reason bridge:(HippyBridge *)bridge {
    [_nativeRenderManager->rootViews() enumerateObjectsUsingBlock:^(UIView * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if ([obj respondsToSelector:@selector(invalidate)]) {
            [obj performSelector:@selector(invalidate)];
        }
        [bridge unloadInstanceForRootView:[obj componentTag]];
    }];
}

- (void)removeRootNode:(NSNumber *)rootTag bridge:(HippyBridge *)bridge {
    _nativeRenderManager->UnregisterRootView([rootTag intValue]);
}

#define StatusBarOffset 20
#define btnHeight 100

- (void)runDemoWithoutRuntime {
    UIButton *saveButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    saveButton.frame = CGRectMake(0, StatusBarOffset, self.view.frame.size.width / 2, btnHeight);
    [saveButton addTarget:self action:@selector(saveBtnClick) forControlEvents:UIControlEventTouchUpInside];
    [saveButton setTitle:@"save nodes" forState:UIControlStateNormal];
    [self.view addSubview:saveButton];

    UIButton *loadButton = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    loadButton.frame = CGRectMake(self.view.frame.size.width / 2, StatusBarOffset, self.view.frame.size.width / 2, btnHeight);
    [loadButton addTarget:self action:@selector(loadBtnClick) forControlEvents:UIControlEventTouchUpInside];
    [loadButton setTitle:@"load nodes" forState:UIControlStateNormal];
    [self.view addSubview:loadButton];
}

std::string mock;

- (void)saveBtnClick {
//    std::weak_ptr<hippy::DomManager> weak_dom_manager = _bridge.domManager;
//    std::weak_ptr<hippy::RootNode> weak_root_node = _bridge.rootNode;
//    std::function<void()> func = [weak_dom_manager , weak_root_node](){
//        auto dom_manager = weak_dom_manager.lock();
//        if (!dom_manager) {
//            return;
//        }
//        auto root_node = weak_root_node.lock();
//        if (!root_node) {
//            return;
//        }
//        mock = dom_manager->GetSnapShot(root_node);
//    };
//    _bridge.domManager->PostTask(hippy::Scene({func}));

}

- (void)loadBtnClick {
    NSString *businessBundlePath = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res"];
    businessBundlePath = [businessBundlePath stringByDeletingLastPathComponent];

    //1.set up root view
    UIView *view = [[UIView alloc] initWithFrame:CGRectMake(0, btnHeight + StatusBarOffset, self.view.bounds.size.width, self.view.bounds.size.height - btnHeight - StatusBarOffset)];

    view.backgroundColor = [UIColor whiteColor];
    view.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;

    //2.set root tag for root view. root tag is of the essence
    int32_t rootTag = 20;
    view.componentTag = @(rootTag);
    [self.view addSubview:view];

    //3.set native render manager's frameworkProxy to bridge
    [self initRenderContextWithRootView:view];

    //4.mock data
    auto nodes_data = mock; // [self mockNodesData];

    //5.create dom nodes with datas

    _rootNode->SetRootSize((float)view.bounds.size.width, (float)view.bounds.size.height);
    std::weak_ptr<hippy::DomManager> weak_dom_manager = _domManager;
    std::weak_ptr<hippy::RootNode> weak_root_node = _rootNode;
    std::function<void()> func = [weak_dom_manager, weak_root_node, nodes_data](){
        auto dom_manager = weak_dom_manager.lock();
        if (!dom_manager) {
            return;
        }
        auto root_node = weak_root_node.lock();
        if (!root_node) {
            return;
        }
        dom_manager->SetSnapShot(root_node, nodes_data);
    };
    _domManager->PostTask(hippy::Scene({func}));
}

- (void)initRenderContextWithRootView:(UIView *)rootView {
    int componentTag = [[rootView componentTag] intValue];
    HPAssert(0 != componentTag && 0 == componentTag % 10, @"Root view's tag must not be 0 and must be a multiple of 10");
    if (rootView && componentTag) {
        _rootNode = std::make_shared<hippy::RootNode>(componentTag);
        _rootNode->GetAnimationManager()->SetRootNode(_rootNode);
        _domManager = std::make_shared<hippy::DomManager>();
        _rootNode->SetDomManager(_domManager);
        auto width = CGRectGetWidth(rootView.bounds);
        auto height = CGRectGetHeight(rootView.bounds);
        std::weak_ptr<hippy::DomManager> weakDomManager = _domManager;
        std::weak_ptr<hippy::RootNode> weakRootNode = _rootNode;
        std::function<void()> func = [weakRootNode, rootView, width, height](){
            auto rootNode = weakRootNode.lock();
            if (rootNode) {
                rootNode->SetRootSize(width, height);
            }
        };
        _domManager->PostTask(hippy::Scene({func}));

        _nativeRenderManager = std::make_shared<NativeRenderManager>();
        _nativeRenderManager->RegisterRootView(rootView, _rootNode);
        _nativeRenderManager->SetDomManager(_domManager);

        _domManager->SetRenderManager(_nativeRenderManager);
    }
}

static std::unordered_map<std::string, std::shared_ptr<footstone::HippyValue>> dictionaryToUnorderedMapDomValue(NSDictionary *dictionary) {
    std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>> style;
    for (NSString *key in dictionary) {
        id value = dictionary[key];
        std::string style_key = [key UTF8String];
        footstone::value::HippyValue dom_value = [value toHippyValue];
        style[style_key] = std::make_shared<footstone::value::HippyValue>(std::move(dom_value));
    }
    return style;
}

- (std::vector<std::shared_ptr<hippy::DomNode>>) mockNodesData {
    std::vector<std::shared_ptr<hippy::DomNode>> dom_node_vector;
    using StyleMap = std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>;
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
                    if (footstone::value::HippyValue::Type::kObject == style_props->GetType()) {
                        auto style_object = style_props->ToObjectChecked();
                        for (auto iter = style_object.begin(); iter != style_object.end(); iter++) {
                            const std::string &iter_key = iter->first;
                            auto &iter_value = iter->second;
                            style_map[iter_key] = std::make_shared<footstone::value::HippyValue>(std::move(iter_value));
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
        std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>> style;
        std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>> dom_ext;
        std::shared_ptr<hippy::DomNode> dom_node = std::make_shared<hippy::DomNode>(tag, pid, 0, name, name, style, dom_ext, _rootNode);
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

- (BOOL)shouldStartInspector:(HippyBridge *)bridge {
    return bridge.debugMode;
}

- (BOOL)shouldInvokeWithModuleName:(NSString *)moduleName methodName:(NSString *)methodName arguments:(NSArray<id<HippyBridgeArgument>> *)arguments argumentsValues:(NSArray *)argumentsValue containCallback:(BOOL)containCallback {
    HPAssert(moduleName, @"module name must not be null");
    HPAssert(methodName, @"method name must not be null");
    return YES;
}

- (BOOL)shouldCallbackBeInvokedWithModuleName:(NSString *)moduleName methodName:(NSString *)methodName callbackId:(NSNumber *)cbId arguments:(id)arguments {
    HPAssert(moduleName, @"module name must not be null");
    HPAssert(methodName, @"method name must not be null");
    return YES;
}

- (std::shared_ptr<VFSUriLoader>)URILoader {
    return [_bridge VFSUriLoader].lock();
}

@end
