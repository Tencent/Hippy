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
#import "HippyViewsRelation.h"

@interface HippyViewsRelationTest : XCTestCase
@end

@implementation HippyViewsRelationTest

- (void)testAddAndEnumerate_OrderIsAscendingByIndex {
    HippyViewsRelation *rel = [HippyViewsRelation new];
    [rel addViewTag:1 forSuperViewTag:100 atIndex:2];
    [rel addViewTag:2 forSuperViewTag:100 atIndex:0];
    [rel addViewTag:3 forSuperViewTag:100 atIndex:1];

    NSMutableArray<NSNumber *> *collectedTags = [NSMutableArray array];
    NSMutableArray<NSNumber *> *collectedIndices = [NSMutableArray array];
    [rel enumerateViewsHierarchy:^(int32_t tag, const std::vector<int32_t> &subTags, const std::vector<int32_t> &subIdx) {
        if (tag != 100) { return; }
        for (size_t i = 0; i < subTags.size(); ++i) {
            [collectedTags addObject:@(subTags[i])];
            [collectedIndices addObject:@(subIdx[i])];
        }
    }];

    NSArray<NSNumber *> *expectedIndices = @[ @0, @1, @2 ];
    NSArray<NSNumber *> *expectedTags = @[ @2, @3, @1 ];
    XCTAssertEqualObjects(collectedIndices, expectedIndices);
    XCTAssertEqualObjects(collectedTags, expectedTags);
}

- (void)testInvalidInputsAreIgnored {
    HippyViewsRelation *rel = [HippyViewsRelation new];
    XCTAssertTrue([rel isEmpty]);
    
    // Only negative superview tags should be rejected
    [rel addViewTag:10 forSuperViewTag:-1 atIndex:0];
    [rel addViewTag:11 forSuperViewTag:-100 atIndex:0];
    
    __block NSInteger callbackCount = 0;
    [rel enumerateViewsHierarchy:^(__unused int32_t tag, __unused const std::vector<int32_t> &subTags, __unused const std::vector<int32_t> &subIdx) {
        callbackCount++;
    }];
    XCTAssertEqual(callbackCount, 0, @"Negative superview tags should be rejected");
}

- (void)testEdgeCasesAreAllowed {
    HippyViewsRelation *rel = [HippyViewsRelation new];
    
    // viewTag = 0 should be allowed
    [rel addViewTag:0 forSuperViewTag:100 atIndex:0];
    // negative index should be allowed
    [rel addViewTag:1 forSuperViewTag:100 atIndex:-1];
    // superview tag = 0 should be allowed
    [rel addViewTag:2 forSuperViewTag:0 atIndex:0];
    
    __block NSInteger callbackCount = 0;
    __block NSInteger totalItems = 0;
    [rel enumerateViewsHierarchy:^(__unused int32_t tag, const std::vector<int32_t> &subTags, __unused const std::vector<int32_t> &subIdx) {
        callbackCount++;
        totalItems += subTags.size();
    }];
    
    XCTAssertEqual(callbackCount, 2, @"Should have 2 superviews (100 and 0)");
    XCTAssertEqual(totalItems, 3, @"Should have 3 total subviews");
}

- (void)testMultipleEnumerationsAreConsistent {
    HippyViewsRelation *rel = [HippyViewsRelation new];
    [rel addViewTag:1 forSuperViewTag:100 atIndex:2];
    [rel addViewTag:2 forSuperViewTag:100 atIndex:0];
    [rel addViewTag:3 forSuperViewTag:100 atIndex:1];
    
    NSMutableArray<NSNumber *> *firstResult = [NSMutableArray array];
    [rel enumerateViewsHierarchy:^(int32_t tag, const std::vector<int32_t> &subTags, __unused const std::vector<int32_t> &subIdx) {
        if (tag == 100) {
            for (const auto &t : subTags) {
                [firstResult addObject:@(t)];
            }
        }
    }];
    
    NSMutableArray<NSNumber *> *secondResult = [NSMutableArray array];
    [rel enumerateViewsHierarchy:^(int32_t tag, const std::vector<int32_t> &subTags, __unused const std::vector<int32_t> &subIdx) {
        if (tag == 100) {
            for (const auto &t : subTags) {
                [secondResult addObject:@(t)];
            }
        }
    }];
    
    XCTAssertEqualObjects(firstResult, secondResult, @"Multiple enumerations should return identical results");
}

- (void)testPerformance_AddManyAndEnumerate {
    const int32_t kSuper = 300;
    const int32_t kCount = 5000;
    [self measureBlock:^{
        HippyViewsRelation *rel = [HippyViewsRelation new];
        for (int32_t i = 0; i < kCount; ++i) {
            int32_t idx = (kCount - 1) - i;
            [rel addViewTag:i forSuperViewTag:kSuper atIndex:idx];
        }
        __block int32_t total = 0;
        [rel enumerateViewsHierarchy:^(__unused int32_t tag, const std::vector<int32_t> &subTags, const std::vector<int32_t> &subIdx) {
            total += (int32_t)subTags.size() + (int32_t)subIdx.size();
        }];
        XCTAssertEqual(total, kCount * 2);
    }];
}

@end

