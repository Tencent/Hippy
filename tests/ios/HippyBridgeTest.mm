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

@interface HippyBridgeTest : XCTestCase

@end

@implementation HippyBridgeTest

- (void)setUp {
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
}

- (void)testLoadBundleURL {
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:nil moduleProvider:nil launchOptions:nil executorKey:nil];
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


@end
