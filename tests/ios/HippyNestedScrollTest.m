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
#import <hippy/HippyNestedScrollCoordinator.h>


@interface HippyNestedScrollCoordinator (UnitTest)

/// Whether is the given direction has specified priority
/// direction param see `HippyNestedScrollDirection`
- (BOOL)isDirection:(char)direction hasPriority:(HippyNestedScrollPriority)priority;

@end

@interface HippyNestedScrollTest : XCTestCase

@end

@implementation HippyNestedScrollTest

- (void)setUp {
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
}

- (void)testNestedScrollCoordinatorSetPriority {
    HippyNestedScrollCoordinator *coordinator = [HippyNestedScrollCoordinator new];
    XCTAssertTrue([coordinator isDirection:0 hasPriority:HippyNestedScrollPrioritySelf]);
    XCTAssertTrue([coordinator isDirection:1 hasPriority:HippyNestedScrollPrioritySelf]);
    XCTAssertTrue([coordinator isDirection:2 hasPriority:HippyNestedScrollPrioritySelf]);
    XCTAssertTrue([coordinator isDirection:3 hasPriority:HippyNestedScrollPrioritySelf]);
    XCTAssertTrue([coordinator isDirection:4 hasPriority:HippyNestedScrollPrioritySelf]);
    
    coordinator.nestedScrollPriority = HippyNestedScrollPrioritySelf;
    XCTAssertTrue([coordinator isDirection:1 hasPriority:HippyNestedScrollPrioritySelf]);
    XCTAssertTrue([coordinator isDirection:2 hasPriority:HippyNestedScrollPrioritySelf]);
    XCTAssertTrue([coordinator isDirection:3 hasPriority:HippyNestedScrollPrioritySelf]);
    XCTAssertTrue([coordinator isDirection:4 hasPriority:HippyNestedScrollPrioritySelf]);
    XCTAssertFalse([coordinator isDirection:1 hasPriority:HippyNestedScrollPriorityParent]);
    XCTAssertFalse([coordinator isDirection:2 hasPriority:HippyNestedScrollPriorityParent]);
    XCTAssertFalse([coordinator isDirection:3 hasPriority:HippyNestedScrollPriorityParent]);
    XCTAssertFalse([coordinator isDirection:4 hasPriority:HippyNestedScrollPriorityParent]);
    
    coordinator.nestedScrollRightPriority = HippyNestedScrollPriorityParent;
    coordinator.nestedScrollLeftPriority = HippyNestedScrollPrioritySelf;
    coordinator.nestedScrollBottomPriority = HippyNestedScrollPriorityNone;
    coordinator.nestedScrollTopPriority = HippyNestedScrollPriorityParent;
    XCTAssertTrue([coordinator isDirection:1 hasPriority:HippyNestedScrollPriorityParent]);
    XCTAssertTrue([coordinator isDirection:2 hasPriority:HippyNestedScrollPrioritySelf]);
    XCTAssertTrue([coordinator isDirection:3 hasPriority:HippyNestedScrollPriorityNone]);
    XCTAssertTrue([coordinator isDirection:4 hasPriority:HippyNestedScrollPriorityParent]);
}

- (void)testShouldRecognizeScrollGestureSimultaneously {
    HippyNestedScrollCoordinator *coordinator = [HippyNestedScrollCoordinator new];
    HippyScrollView *scrollView = [HippyScrollView new];
    coordinator.outerScrollView = (UIScrollView<HippyNestedScrollProtocol> *)scrollView.realScrollView;
    XCTAssertFalse([coordinator shouldRecognizeScrollGestureSimultaneouslyWithView:scrollView.realScrollView]);
    coordinator.nestedScrollPriority = HippyNestedScrollPriorityNone;
    XCTAssertFalse([coordinator shouldRecognizeScrollGestureSimultaneouslyWithView:scrollView.realScrollView]);
    coordinator.nestedScrollPriority = HippyNestedScrollPrioritySelf;
    XCTAssertTrue([coordinator shouldRecognizeScrollGestureSimultaneouslyWithView:scrollView.realScrollView]);
}

- (void)testNestedScrollDoScrollViewDidScroll {
    HippyNestedScrollCoordinator *coordinator = [HippyNestedScrollCoordinator new];
    HippyScrollView *scrollView = [HippyScrollView new];
    UIScrollView<HippyNestedScrollProtocol> *sv = (UIScrollView<HippyNestedScrollProtocol> *)scrollView.realScrollView;
    [sv setContentOffset:CGPointMake(100.0, 200.0)];
    XCTAssert(CGPointEqualToPoint(sv.lastContentOffset, CGPointZero));
    [coordinator scrollViewDidScroll:scrollView.realScrollView];
    XCTAssert(CGPointEqualToPoint(sv.lastContentOffset, CGPointMake(100.0, 200.0)));
}

@end
