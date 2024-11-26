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
#import <hippy/HippyBridge+BundleLoad.h>
#import <hippy/HippyJSExecutor.h>
#import "HippyBridge+Private.h"
#import <OCMock/OCMock.h>


@interface HippyBridge (UnitTestForBundleLoad)

/// Execute JS Bundle
- (void)executeJSCode:(NSData *)script
            sourceURL:(NSURL *)sourceURL
         onCompletion:(HippyJavaScriptCallback)completion;

@end

@interface HippyBridgeTest : XCTestCase

/// bridge instance
@property (nonatomic, strong) HippyBridge *bridge;

@end

@implementation HippyBridgeTest

- (void)setUp {
    // Put setup code here. This method is called before the invocation of each test method in the class.
    self.bridge = [[HippyBridge alloc] initWithDelegate:nil moduleProvider:nil launchOptions:nil executorKey:nil];
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    self.bridge = nil;
}

- (void)testLoadBundleURL {
    HippyBridge *bridge = self.bridge;
    NSString *testNoSchemePath = @"/Users/ray/testNoSchemePath";
    NSURL *testUrl = [NSURL URLWithString:testNoSchemePath];
    XCTAssert(testUrl.scheme == nil);
    [bridge loadBundleURL:testUrl
               bundleType:HippyBridgeBundleTypeVendor
               completion:^(NSURL * _Nullable bundleURL, NSError * _Nullable error) {}];
    NSURL *loadedUrl = bridge.bundleURLs.lastObject;
    XCTAssert(loadedUrl.scheme != nil);
    XCTAssertTrue(loadedUrl.isFileURL);
    
    testUrl = [NSURL URLWithString:@"http://hippyjs_no_exist.org"];
    XCTAssert([testUrl.scheme isEqualToString:@"http"]);
    [bridge loadBundleURL:testUrl
               bundleType:HippyBridgeBundleTypeVendor
               completion:^(NSURL * _Nullable bundleURL, NSError * _Nullable error) {}];
    loadedUrl = bridge.bundleURLs.lastObject;
    XCTAssert([loadedUrl.scheme isEqualToString:@"http"]);
    XCTAssertFalse(loadedUrl.isFileURL);
}

- (void)testPrepareBundleQueue {
    HippyBridge *bridge = self.bridge;
    XCTAssertNotNil(bridge.bundleQueue);
    XCTAssert(bridge.bundleQueue.qualityOfService == NSQualityOfServiceUserInitiated);
}

- (void)testIsLoading {
    HippyBridge *bridge = self.bridge;
    id mockBridge = OCMPartialMock(bridge);
    // loading count greater than 0
    OCMStub([mockBridge loadingCount]).andReturn(1);
    XCTAssertTrue([mockBridge isLoading]);
    // loading count is 0
    HippyBridge *bridge2 = [[HippyBridge alloc] initWithDelegate:nil moduleProvider:nil launchOptions:nil executorKey:nil];
    id mockBridge2 = OCMPartialMock(bridge2);
    OCMStub([mockBridge2 loadingCount]).andReturn(0);
    XCTAssertFalse([mockBridge2 isLoading]);
}

- (void)testExecuteJSCodeCallsCompletionWithErrorWhenScriptIsNil {
    // Create an expectation to wait for the async callback
    XCTestExpectation *expectation = [self expectationWithDescription:@"Completion handler called"];
    
    // Define the completion callback
    HippyJavaScriptCallback completion = ^(id result, NSError *error) {
        XCTAssertNotNil(error, @"Error should not be nil when script is nil");
        XCTAssertNotNil(error.localizedDescription);
        [expectation fulfill];
    };
    
    
    // Call executeJSCode with nil script
    HippyBridge *bridge = self.bridge;
    [bridge executeJSCode:nil sourceURL:nil onCompletion:completion];
    
    // Wait for the async callback
    [self waitForExpectationsWithTimeout:1.0 handler:nil];
}


- (void)testExecuteJSCodeCallsJavaScriptExecutor {
    // Create an instance of HippyBridge and mock the JavaScript executor
    HippyBridge *bridge = self.bridge;
    id mockBridge = OCMPartialMock(bridge);
    id mockJavaScriptExecutor = OCMClassMock([HippyJSExecutor class]);
    OCMStub([mockBridge javaScriptExecutor]).andReturn(mockJavaScriptExecutor);
    
    // Stub isValid to return YES
    OCMStub([mockBridge isValid]).andReturn(YES);
    
    // Expect the executeApplicationScript method to be called
    OCMExpect([mockJavaScriptExecutor executeApplicationScript:[OCMArg any] 
                                                     sourceURL:[OCMArg any]
                                                    onComplete:[OCMArg any]]);
    
    // Call executeJSCode with valid script and sourceURL
    NSData *scriptData = [@"console.log('Hello, World!');" dataUsingEncoding:NSUTF8StringEncoding];
    NSURL *sourceURL = [NSURL URLWithString:@"http://example.com/script.js"];
    [mockBridge executeJSCode:scriptData sourceURL:sourceURL onCompletion:nil];
    
    // Verify that executeApplicationScript was called
    OCMVerifyAll(mockJavaScriptExecutor);
}


@end
