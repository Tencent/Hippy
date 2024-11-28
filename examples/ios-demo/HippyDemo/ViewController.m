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
#import "DemoConfigs.h"
#import <hippy/HippyBundleURLProvider.h>
#import <hippy/HippyRootView.h>
#import <hippy/HippyLog.h>
#import <hippy/HippyBridge.h>
#import <hippy/HippyAssert.h>
#import <sys/utsname.h>


//release macro below if use debug mode
//#define HIPPYDEBUG


@interface ViewController () <HippyBridgeDelegate, HippyMethodInterceptorProtocol>

/// Hippy Root View
@property (nonatomic, strong) HippyRootView *hippyRootView;

/// The debug bundle URL
@property (nonatomic, strong) NSURL *debugBundleUrl;

@end

static NSString *formatLog(NSDate *timestamp, HippyLogLevel level, NSString *fileName, NSNumber *lineNumber, NSString *message) {
    NSArray *logLevelMap = @[@"TRACE", @"INFO", @"WARN", @"ERROR", @"FATAL"];
    static NSDateFormatter *formatter;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        formatter = [NSDateFormatter new];
        formatter.dateFormat = formatter.dateFormat = @"yyyy-MM-dd HH:mm:ss.SSS";
    });

    NSString *levelStr = level < 0 || level > logLevelMap.count ? logLevelMap[1] : logLevelMap[level];

    if(fileName){
        return [[NSString alloc] initWithFormat:@"[%@][%@:%d][%@]%@",
                [formatter stringFromDate:timestamp],
                fileName.lastPathComponent,
                lineNumber.intValue,
                levelStr,
                message
        ];
    }else{
        return [[NSString alloc] initWithFormat:@"[%@]%@",
                [formatter stringFromDate:timestamp],
                message
        ];
    }
}

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    HippySetLogFunction(^(HippyLogLevel level, HippyLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
        NSString *log = formatLog([NSDate date], level, fileName, lineNumber, message);
        if([log hasSuffix:@"\n"]){
            fprintf(stderr, "%s", log.UTF8String);
        }else{
            fprintf(stderr, "%s\n", log.UTF8String);
        }
    });

    
    BOOL isSimulator = NO;
    #if TARGET_IPHONE_SIMULATOR
        isSimulator = YES;
    #endif

        
#ifdef HIPPYDEBUG
    NSDictionary *launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO), @"DebugMode": @(YES)};
    NSString *bundleStr = [HippyBundleURLProvider sharedInstance].bundleURLString;
    NSURL *bundleUrl = [NSURL URLWithString:bundleStr];
    self.debugBundleUrl = bundleUrl;
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                      bundleURL:bundleUrl
                                                 moduleProvider:nil
                                                  launchOptions:launchOptions
                                                    executorKey:@"Demo"];
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge
                                                         moduleName:@"Demo"
                                                  initialProperties:@{@"isSimulator": @(isSimulator)}
                                                       shareOptions:@{@"DebugMode": @(YES)}
                                                           delegate:nil];
#else
    
    NSString *commonBundlePath = [[NSBundle mainBundle] pathForResource:@"vendor.ios" ofType:@"js" inDirectory:@"res"];
    NSString *businessBundlePath = [[NSBundle mainBundle] pathForResource:@"index.ios" ofType:@"js" inDirectory:@"res"];
    NSDictionary *launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO)};
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                      bundleURL:[NSURL fileURLWithPath:commonBundlePath]
                                                 moduleProvider:nil
                                                  launchOptions:launchOptions
                                                    executorKey:@"Demo"];
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge
                                                        businessURL:[NSURL fileURLWithPath:businessBundlePath]
                                                         moduleName:@"Demo"
                                                  initialProperties:@{@"isSimulator": @(isSimulator)}
                                                       shareOptions:nil
                                                           delegate:nil];
#endif
    bridge.methodInterceptor = self;
    
    rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
    rootView.frame = self.view.bounds;
    [self.view addSubview:rootView];
    self.hippyRootView = rootView;
}


#pragma mark - HippyBridgeDelegate

- (CGFloat)defaultStatusBarHeightNoMatterHiddenOrNot {
    // 当hippy无法获取状态栏高度时返回的默认值
    // 说明：状态栏高度通常为动态获取，且不可作为页面布局时的依赖，然而部分页面初始化时依赖状态栏高度进行布局，
    // 为兼容部分旧代码布局，特提供此设置接口，作为默认的兜底值。
    return [ViewController defaultStatusBarHeight];
}

- (BOOL)shouldUseViewWillTransitionMethodToMonitorOrientation {
    // 是否使用viewWillTransitionToSize方法替换UIApplicationDidChangeStatusBarOrientationNotification通知，
    // 推荐设置 (该系统通知已废弃，且部分场景下存在异常)
    // 注意，设置后必须实现viewWillTransitionToSize方法，并调用onHostControllerTransitionedToSize向hippy同步事件。
    return YES;
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
    // Demo，直接返回。
    completion(@"var a = 1");
    return YES;
}

- (BOOL)shouldStartInspector:(HippyBridge *)bridge {
    return bridge.debugMode;
}

- (NSURL *)inspectorSourceURLForBridge:(HippyBridge *)bridge {
    return self.debugBundleUrl;
}


#pragma mark - HippyMethodInterceptorProtocol

- (BOOL)shouldInvokeWithModuleName:(NSString *)moduleName
                        methodName:(NSString *)methodName
                         arguments:(NSArray<id<HippyBridgeArgument>> *)arguments
                   argumentsValues:(NSArray *)argumentsValue
                   containCallback:(BOOL)containCallback {
    HippyAssert(moduleName, @"module name must not be null");
    HippyAssert(methodName, @"method name must not be null");
    return YES;
}

- (BOOL)shouldCallbackBeInvokedWithModuleName:(NSString *)moduleName
                                   methodName:(NSString *)methodName
                                   callbackId:(NSNumber *)cbId
                                    arguments:(id)arguments {
    HippyAssert(moduleName, @"module name must not be null");
    HippyAssert(methodName, @"method name must not be null");
    return YES;
}


#pragma mark - View Controller Size Change

- (void)viewWillTransitionToSize:(CGSize)size
       withTransitionCoordinator:(id<UIViewControllerTransitionCoordinator>)coordinator {
    [super viewWillTransitionToSize:size withTransitionCoordinator:coordinator];
    [coordinator animateAlongsideTransition:nil completion:^(id<UIViewControllerTransitionCoordinatorContext> context) {
        // Note that `useViewWillTransitionMethodToMonitorOrientation` flag must be set when init bridge,
        // otherwise calling this function takes no effect.
        [self.hippyRootView onHostControllerTransitionedToSize:size];
    }];
}


#pragma mark - Helper Methods

+ (CGFloat)defaultStatusBarHeight {
    // Hippy旧版本SDK内部的默认实现，由于不同设备状态栏高度不同，该方法存在缺陷
    // 注意：强烈不建议布局依赖状态栏高度，新版本Hippy SDK内部不再提供默认值
    // 如仍坚持依赖状态栏高度进行布局，为避免特殊场景下获取不到导致异常，请根据机型自行判断并提供默认值
    
    // Hippy旧版本内部实现如下：
    BOOL isAboveIPhoneX = ([[UIApplication sharedApplication] delegate].window.safeAreaInsets.bottom > 0.0);
    return isAboveIPhoneX ? 44.0 : 20.0; //注意，不同机型状态栏高度不同，此实现不正确, 仅作DEMO说明
}

@end
