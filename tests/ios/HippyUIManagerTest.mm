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
#import <hippy/HippyUIManager.h>
#import <hippy/HippyComponentData.h>


@interface HippyUIManager (UnitTest)

/// Get componentData for given view Name
/// - Parameter viewName: string
- (HippyComponentData *)componentDataForViewName:(NSString *)viewName;

@end


@interface HippyUIManagerTest : XCTestCase

@end

@implementation HippyUIManagerTest

- (void)setUp {
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
}

- (void)testGetComponentDataForViewName {
    HippyUIManager *manager = [[HippyUIManager alloc] init];
    [manager registerExtraComponent:@[ HippyViewManager.class ]];
    
    XCTAssertNil([manager componentDataForViewName:nil]);
    NSString *testViewName = @"View";
    HippyComponentData *componentData = [manager componentDataForViewName:testViewName];
    XCTAssertNotNil(componentData);
    XCTAssertEqual(componentData.name, testViewName);
    XCTAssertThrows([manager componentDataForViewName:@"NonExistView"]);
}

- (void)testPerformanceExample {
    // This is an example of a performance test case.
    [self measureBlock:^{
        // Put the code you want to measure the time of here.
    }];
}

@end
