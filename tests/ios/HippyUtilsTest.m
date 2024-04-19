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
#import <hippy/HippyUtils.h>

@interface HippyUtilsTest : XCTestCase

@end

@implementation HippyUtilsTest

- (void)setUp {
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
}

- (void)testSDKVersionExists {
    NSString *ver = [HippyUtils sdkVersion];
    XCTAssertNotNil(ver);
}

- (void)testHippyURLWithString {
    HIPPY_IGNORE_WARNING_BEGIN(-Wnonnull)
    XCTAssertNil(HippyURLWithString(nil, nil));
    HIPPY_IGNORE_WARNING_END
    XCTAssert([[HippyURLWithString(@"", nil) absoluteString] length] == 0);
    
    NSArray *testPaths = @[
        @"http://hippyjs.org",
        @"https://hippyjs.org",
        @"file:///testAbsulotePath/subPath",
        @"hpfile://./testHippyRelativePath/subPath",
        @"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAA",
        // Some exceptions, such as Spaces or newlines
        @"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAA\n\n  ",
    ];
    for (NSString *path in testPaths) {
        NSURL *url = HippyURLWithString(path, nil);
        XCTAssertNotNil(url);
        NSURLComponents *components = [NSURLComponents componentsWithURL:url resolvingAgainstBaseURL:NO];
        XCTAssertNotNil(components.scheme);
        XCTAssertNotNil(components.path);
    }
    testPaths = @[
        @"测试中文",
    ];
    for (NSString *path in testPaths) {
        NSURL *url = HippyURLWithString(path, nil);
        XCTAssertNotNil(url);
        NSURLComponents *components = [NSURLComponents componentsWithURL:url resolvingAgainstBaseURL:NO];
        XCTAssertNil(components.scheme);
        XCTAssertNotNil(components.path);
    }
    
    NSString *baseUrl = @"https://hippyjs.org/#/";
    testPaths = @[
        @"hello/hippy",
    ];
    for (NSString *path in testPaths) {
        NSURL *url = HippyURLWithString(path, baseUrl);
        XCTAssert([url.absoluteString isEqualToString:@"https://hippyjs.org/hello/hippy"]);
    }
    
}


@end
