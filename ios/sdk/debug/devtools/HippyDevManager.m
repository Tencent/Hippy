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

#import "HippyDevManager.h"
#import "HippyDevWebSocketClient.h"
#import "HippyInspector.h"
#import "HippyInspectorDomain.h"
#import "HippyDevCommand.h"
#import "HippyBridge.h"
#import "HippyUIManager.h"
#import "HippyInspector.h"
#import "HippyBridge+Private.h"

NSString *const HippyRuntimeDomainName = @"TDFRuntime";
NSString *const HippyRuntimeMethodUpdateContextInfo = @"updateContextInfo";
NSString *const HippyRendererType = @"Native";


@interface HippyDevManager ()<HippyDevClientProtocol> {
    HippyDevWebSocketClient *_devWSClient;
    HippyInspector *_inspector;
}

@end

@implementation HippyDevManager

#pragma mark Life Cycles
- (instancetype)initWithBridge:(HippyBridge *)bridge devInfo:(HippyDevInfo *)devInfo contextName:(NSString *)contextName {
    self = [super init];
    if (self) {
        _bridge = bridge;
        NSString *clientId = [HippyDevInfo debugClientIdWithBridge:_bridge];
        _devWSClient = [[HippyDevWebSocketClient alloc] initWithDevInfo:devInfo
                                                            contextName:contextName
                                                               clientId:clientId];
        _devWSClient.delegate = self;
        _inspector = [[HippyInspector alloc] initWithDevManager:self];
        self.contextName = contextName;
    }
    return self;
}

- (void)devClientDidConnect:(HippyDevWebSocketClient *)devClient {
    [self updateContextInfoWithName:self.contextName];
}

- (void)updateContextInfoWithName:(NSString *)contextName {
    NSString *methodName = [NSString stringWithFormat:@"%@.%@", HippyRuntimeDomainName, HippyRuntimeMethodUpdateContextInfo];
    NSString *bundleId = [[NSBundle mainBundle] bundleIdentifier];
    NSString *hostVersion = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
    
    // Get ViewManagers' number
    NSArray<Class>* allModules = HippyGetModuleClasses();
    int viewManagerCount = 0;
    for (Class module in allModules) {
        if ([module isSubclassOfClass:HippyViewManager.class]) {
            viewManagerCount ++;
        }
    }

    NSDictionary *params = @{
        @"contextName": contextName ? : @"",
        @"bundleId": bundleId ? : @"Unknown",
        @"hostVersion": hostVersion ? : @"",
        @"sdkVersion": _HippySDKVersion,
        @"rendererType": HippyRendererType,
        @"viewCount": @(viewManagerCount),
        @"moduleCount": @([allModules count] - viewManagerCount),
    };
    
    [_inspector sendDataToFrontendWithMethod:methodName params:params];
}

- (void)sendDataToFrontendWithData:(NSString *)dataString {
    if (DevWebSocketState_OPEN == _devWSClient.state) {
        [_devWSClient sendData:dataString];
    }
}

- (void)closeWebSocket:(HippyDevCloseType)type {
    if (!_devWSClient) {
        return;
    }
    NSInteger code = type;
    NSString *reason = @"socket was closed because the page was closed";
    if (type == HippyDevCloseTypeReload) {
        reason = @"socket was closed because the page was reload";
    }
    [_devWSClient closeWithCode:code reason:reason];
}

#pragma mark WS Delegate
- (void)devClient:(HippyDevWebSocketClient *)devClient didReceiveMessage:(NSString *)message {
    HippyDevCommand *command = nil;
    HippyInspectorDomain *domain = [_inspector inspectorDomainFromMessage:message command:&command];
    [domain handleRequestDevCommand:command bridge:_bridge completion:^(NSDictionary *rspObject) {
        rspObject = properResultForEmprtyObject(command.cmdID, rspObject);
        NSData *data = [NSJSONSerialization dataWithJSONObject:rspObject options:0 error:nil];
        [devClient sendData:data];
    }];
}

- (void)dealloc {
    if (_devWSClient && DevWebSocketState_CLOSED != [_devWSClient state]) {
        [_devWSClient closeWithCode:HippyDevCloseTypeClosePage reason:@"socket was closed because dev manager dealloc"];
    }
}

@end
