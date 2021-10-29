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

@interface HippyDevManager ()<HippyDevClientProtocol> {
    HippyDevWebSocketClient *_devWSClient;
}

@end

@implementation HippyDevManager

#pragma mark Life Cycles
- (instancetype)initWithBridge:(HippyBridge *)bridge devIPAddress:(NSString *)devIPAddress devPort:(NSString *)devPort contextName:(NSString *)contextName {
    self = [super init];
    if (self) {
        _bridge = bridge;
        _devWSClient = [[HippyDevWebSocketClient alloc] initWithDevIPAddress:devIPAddress port:devPort contextName:contextName];
        _devWSClient.delegate = self;
        [HippyInspector sharedInstance].devManager = self;
    }
    return self;
}

- (void)sendDataToFrontendWithData:(NSString *)dataString {
    [_devWSClient sendData:dataString];
}

#pragma mark WS Delegate
- (void)devClient:(HippyDevWebSocketClient *)devClient didReceiveMessage:(NSString *)message {
    dispatch_sync(dispatch_get_main_queue(), ^{
        HippyInspector *inspector = [HippyInspector sharedInstance];
        HippyDevCommand *command = nil;
        HippyInspectorDomain *domain = [inspector inspectorDomainFromMessage:message command:&command];
        [domain handleRequestDevCommand:command bridge:_bridge];
        [devClient sendData:command.resultString];
    });
}

@end
