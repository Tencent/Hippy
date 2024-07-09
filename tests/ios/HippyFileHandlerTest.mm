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
#import <hippy/HippyFileHandler.h>

@interface HippyFileHandlerTest : XCTestCase

/// Test sandboxDirectory for file handler
@property (nonatomic, strong) NSURL *sandboxDirectory;

@end

@implementation HippyFileHandlerTest

- (void)setUp {
    self.sandboxDirectory = [NSURL fileURLWithPath:@"/path/to/sandbox"];
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
}

- (void)testAbsoluteURLFromHippyFileURL_AppBundlePath {
    NSURL *fileUrl = [NSURL URLWithString:@"hpfile://appbundle/testfile.txt"];
    NSURL *expectedURL = [[NSBundle mainBundle] URLForResource:@"testfile" withExtension:@"txt"];
    NSURL *resultURL = HippyFileHandler::AbsoluteURLFromHippyFileURL(fileUrl,self.sandboxDirectory);
    XCTAssertEqualObjects(resultURL, expectedURL, @"The URLs should be equal for app bundle paths.");
}

- (void)testAbsoluteURLFromHippyFileURL_ContainerPath {
    NSURL *fileUrl = [NSURL URLWithString:@"hpfile://container/Documents/testfile.txt"];
    NSString *containerPath = [NSHomeDirectory() stringByAppendingPathComponent:@"Documents/testfile.txt"];
    NSURL *expectedURL = [NSURL fileURLWithPath:containerPath];
    NSURL *resultURL = HippyFileHandler::AbsoluteURLFromHippyFileURL(fileUrl,self.sandboxDirectory);
    XCTAssertEqualObjects(resultURL, expectedURL, @"The URLs should be equal for container paths.");
}

- (void)testAbsoluteURLFromHippyFileURL_SandboxRelativePath {
    NSURL *fileUrl = [NSURL URLWithString:@"hpfile://./testfile.txt"];
    NSURL *expectedURL = [NSURL fileURLWithPath:@"testfile.txt" relativeToURL:self.sandboxDirectory];
    NSURL *resultURL = HippyFileHandler::AbsoluteURLFromHippyFileURL(fileUrl,self.sandboxDirectory);
    XCTAssertEqualObjects(resultURL, expectedURL, @"The URLs should be equal for sandbox relative paths.");
}

- (void)testAbsoluteURLFromHippyFileURL_InvalidPrefix {
    NSURL *fileUrl = [NSURL URLWithString:@"invalid://testfile.txt"];
    NSURL *expectedURL = fileUrl;
    NSURL *resultURL = HippyFileHandler::AbsoluteURLFromHippyFileURL(fileUrl,self.sandboxDirectory);
    XCTAssertEqualObjects(resultURL, expectedURL, @"The URLs should be equal for invalid prefixes.");
}

@end
