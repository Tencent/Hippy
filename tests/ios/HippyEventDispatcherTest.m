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

#import <XCTest/XCTest.h>
#import <hippy/HippyBridge.h>
#import <hippy/HippyEventDispatcher.h>
#import <OCMock/OCMock.h>

@interface HippyEventDispatcherTest : XCTestCase

@end

@implementation HippyEventDispatcherTest

- (void)setUp {
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
}

- (void)testBridgeEventDispatcherModule {
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:nil moduleProvider:nil launchOptions:nil executorKey:nil];
    HippyBridge *mockBridge = OCMPartialMock(bridge);
    HippyEventDispatcher *dispatcher = mockBridge.eventDispatcher;
    XCTAssertNotNil(dispatcher);
    
    NSString *testEvent = @"testEvent";
    NSDictionary *testParams = @{ @"testKey" : @YES };
    static NSString *const kHippyEventDispatcherModule = @"EventDispatcher";
    static NSString *const kHippyReceiveNativeEventMethod = @"receiveNativeEvent";
    [dispatcher dispatchNativeEvent:testEvent withParams:testParams];
    OCMVerify([mockBridge enqueueJSCall:kHippyEventDispatcherModule
                                 method:kHippyReceiveNativeEventMethod
                                   args:OCMArg.any completion:nil]);
    
    [dispatcher dispatchEvent:kHippyEventDispatcherModule 
                   methodName:kHippyReceiveNativeEventMethod
                         args:testParams];
    OCMVerify([mockBridge enqueueJSCall:kHippyEventDispatcherModule
                                 method:kHippyReceiveNativeEventMethod
                                   args:OCMArg.any completion:nil]);
}


@end
