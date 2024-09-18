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
#import <hippy/UIView+Hippy.h>
#import <hippy/UIView+Render.h>
#import <hippy/HippyUIManager.h>

@interface UIView (HippyUIManagerUnitTest)

/// Bind UIView with HippyUIManager
/// This is a convenient method for UIView to get HippyUIManager instance.
/// - Parameter uiManager: HippyUIManager instance
- (void)setUiManager:(HippyUIManager *)uiManager;

@end

@interface HippyUIViewCategoryTest : XCTestCase

@end

@implementation HippyUIViewCategoryTest

- (void)setUp {
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
}

- (void)testGetHippyRootView {
    UIView *testView = [UIView new];
    XCTAssertNil([testView hippyRootView]);
    
    testView.hippyTag = @(10);
    id testSuperView = [UIView new];
    [testSuperView addSubview:testView];
    XCTAssert([testView hippyRootView] == testSuperView);
    testView.hippyTag = @(11);
    XCTAssert([testView hippyRootView] == nil);
}

- (void)testGetHippyUIManager {
    UIView *testView = [UIView new];
    XCTAssertNil([testView uiManager]);
    HippyBridge *bridge = [[HippyBridge alloc] init];
    HippyUIManager *uiManager = [[HippyUIManager alloc] initWithBridge:bridge];
    XCTAssertNoThrow(testView.uiManager = uiManager);
    XCTAssertTrue(testView.uiManager == uiManager);
}


@end
