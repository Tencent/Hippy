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
#import <hippy/HippyFontLoaderModule.h>
#import <hippy/HippyBridge.h>

@interface HippyFontLoaderTest : XCTestCase

@property (nonatomic, strong) HippyFontLoaderModule *fontLoader;

@end

@implementation HippyFontLoaderTest

- (void)setUp {
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
}

- (void)testHippyFontLoaderModule {
    NSString* invalidURL = @"https://example.url";
    // set arbitrary valid font file url
    NSBundle *testBundle = [NSBundle bundleForClass:[self class]];
    NSString* filePath = [testBundle pathForResource:@"TestFonts.bundle/TTTGB-Medium" ofType:@"otf"];
    NSString* validURL = [@"file://" stringByAppendingString:filePath];
    NSString* fontFamily = @"TTTGB Medium";
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:nil moduleProvider:nil launchOptions:nil executorKey:nil];
    HippyFontLoaderModule *fontLoader = [[HippyFontLoaderModule alloc] init];
    [fontLoader setValue:bridge forKey:@"bridge"];
    
    // test fetch from invalidURL
    XCTestExpectation *invalidURLExpectation = [self expectationWithDescription:@"Fetch data from invalid url expectation"];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)),
                   [HippyFontLoaderModule getFontSerialQueue], ^{
        [fontLoader load:fontFamily from:invalidURL resolver:^(id result) {
            [invalidURLExpectation fulfill];
        } rejecter:^(NSString *code, NSString *message, NSError *error) {
            // test whether the url is loading
            XCTAssertTrue([HippyFontLoaderModule isUrlLoading:invalidURL]);
            XCTAssertEqual(message, @"font request error");
            [invalidURLExpectation fulfill];
        }];
    });
    [self waitForExpectationsWithTimeout:5 handler:nil];
    
    // test fetch from validURL
    XCTestExpectation *validURLExpectation = [self expectationWithDescription:@"Fetch data from valid url expectation"];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)),
                   [HippyFontLoaderModule getFontSerialQueue], ^{
        [fontLoader load:fontFamily from:validURL resolver:^(id result) {
            // test whether the url is loading
            XCTAssertTrue([HippyFontLoaderModule isUrlLoading:validURL]);
            [validURLExpectation fulfill];
        } rejecter:^(NSString *code, NSString *message, NSError *error) {
            XCTAssert(true, @"fetch valid url failed");
            [validURLExpectation fulfill];
        }];
    });
    [self waitForExpectationsWithTimeout:5 handler:nil];
    
    __block NSString *fontPath;
    // test get font path using undownloaded font
    XCTestExpectation *undownloadedExpectation = [self expectationWithDescription:@"get undownloaded font path expectation"];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)),
                   [HippyFontLoaderModule getFontSerialQueue], ^{
        fontPath = [HippyFontLoaderModule getFontPath:invalidURL];
        XCTAssertNil(fontPath);
        [undownloadedExpectation fulfill];
    });
    [self waitForExpectationsWithTimeout:5 handler:nil];
    
    // test get font path using downloaded font
    XCTestExpectation *downloadedExpectation = [self expectationWithDescription:@"get downloaded font path expectation"];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)),
                   [HippyFontLoaderModule getFontSerialQueue], ^{
        fontPath = [HippyFontLoaderModule getFontPath:validURL];
        XCTAssertNotNil(fontPath);
        [downloadedExpectation fulfill];
    });
    [self waitForExpectationsWithTimeout:5 handler:nil];
    
    // test whether font registered successfully in load method
    BOOL needRegister = [HippyFontLoaderModule registerFontIfNeeded:fontFamily];
    XCTAssertFalse(needRegister);
    
    // delete font directory
    [[NSFileManager defaultManager] removeItemAtPath:[fontPath stringByDeletingLastPathComponent] error:nil];
}

@end
