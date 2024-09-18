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
#import <UIKit/UIKit.h>
#import <hippy/HippyRenderUtils.h>


@interface HippyRenderUtilsTest : XCTestCase

@end

@implementation HippyRenderUtilsTest

// defined in HippyRenderUtils
extern CGFloat gHippyScreenScaleValue;

- (void)setUp {
    // assume that the screen scale is 2.0.
    gHippyScreenScaleValue = 3.0;
}

- (void)tearDown {
    // nop
}

- (void)testHippyCGSizeCompare {
    CGSize size1 = CGSizeMake(10.5, 20.5);
    CGSize size2 = CGSizeMake(10.5, 20.5);
    XCTAssertTrue(HippyCGSizeNearlyEqual(size1, size2));
    BOOL result = HippyCGSizeRoundInPixelNearlyEqual(size1, size2);
    XCTAssertTrue(result, @"Sizes should be nearly equal");
    
    // assume that the screen scale is 2.0.
    gHippyScreenScaleValue = 2.0;
    CGSize size3 = CGSizeMake(10.0, 20.5);
    CGSize size4 = CGSizeMake(10.0, 21.0);
    XCTAssertFalse(HippyCGSizeNearlyEqual(size3, size4));
    result = HippyCGSizeRoundInPixelNearlyEqual(size3, size4);
    XCTAssertFalse(result, @"Sizes should not be nearly equal");
    
    // assume that the screen scale is 3.0.
    gHippyScreenScaleValue = 3.0;
    size3 = CGSizeMake(10.333, 20.5);
    size4 = CGSizeMake(10.666, 20.5);
    XCTAssertFalse(HippyCGSizeNearlyEqual(size3, size4));
    result = HippyCGSizeRoundInPixelNearlyEqual(size3, size4);
    XCTAssertFalse(result, @"Sizes should not be nearly equal");
    
    CGSize size5 = CGSizeMake(1.3333356, 1.3333356);
    CGSize size6 = CGSizeMake(1.3333289, 1.3333289);
    XCTAssertFalse(CGSizeEqualToSize(size5, size6));
    XCTAssertFalse(HippyCGSizeNearlyEqual(size5, size6));
    result = HippyCGSizeRoundInPixelNearlyEqual(size5, size6);
    XCTAssertTrue(result, @"Sizes should be nearly equal in edge case");
}

- (void)testHippyCGPointCompare {
    CGPoint point1 = CGPointMake(10.5, 20.5);
    CGPoint point2 = CGPointMake(10.5, 20.5);
    XCTAssertTrue(HippyCGPointNearlyEqual(point1, point2));
    BOOL result = HippyCGPointRoundInPixelNearlyEqual(point1, point2);
    XCTAssertTrue(result, @"Points should be nearly equal");
    
    CGPoint point3 = CGPointMake(10.3, 20.5);
    CGPoint point4 = CGPointMake(10.6, 20.5);
    XCTAssertFalse(HippyCGPointNearlyEqual(point3, point4));
    result = HippyCGPointRoundInPixelNearlyEqual(point3, point4);
    XCTAssertFalse(result, @"Points should not be nearly equal");
    
    CGPoint point5 = CGPointMake(1.3333356, 1.3333356);
    CGPoint point6 = CGPointMake(1.3333289, 1.3333289);
    XCTAssertFalse(CGPointEqualToPoint(point5, point6));
    XCTAssertFalse(HippyCGPointNearlyEqual(point5, point6));
    result = HippyCGPointRoundInPixelNearlyEqual(point5, point6);
    XCTAssertTrue(result, @"Points should be nearly equal in edge case");
}

- (void)testHippyCGRectCompare {
    CGRect rect1 = CGRectMake(10.5, 20.5, 30.5, 40.5);
    CGRect rect2 = CGRectMake(10.5, 20.5, 30.5, 40.5);
    XCTAssertTrue(HippyCGRectNearlyEqual(rect1, rect2));
    BOOL result = HippyCGRectRoundInPixelNearlyEqual(rect1, rect2);
    XCTAssertTrue(result, @"Rects should be nearly equal");
    
    CGRect rect3 = CGRectMake(10.3, 20.5, 30.5, 40.5);
    CGRect rect4 = CGRectMake(10.6, 20.5, 30.5, 40.5);
    XCTAssertFalse(HippyCGRectNearlyEqual(rect3, rect4));
    result = HippyCGRectRoundInPixelNearlyEqual(rect3, rect4);
    XCTAssertFalse(result, @"Rects should not be nearly equal");
    
    CGRect rect5 = CGRectMake(1.3333356, 1.3333356, 1.3333356, 1.3333356);
    CGRect rect6 = CGRectMake(1.3333289, 1.3333289, 1.3333289, 1.3333289);
    XCTAssertFalse(CGRectEqualToRect(rect5, rect6));
    XCTAssertFalse(HippyCGRectNearlyEqual(rect5, rect6));
    result = HippyCGRectRoundInPixelNearlyEqual(rect5, rect6);
    XCTAssertTrue(result, @"Rects should be nearly equal in edge case");
}

- (void)testHippyRoundPixelValue {
    CGFloat value1 = 1.3333356;
    CGFloat expected1 = round(value1 * HippyScreenScale()) / HippyScreenScale();
    CGFloat result1 = HippyRoundPixelValue(value1);
    XCTAssertEqual(result1, expected1, @"Rounded pixel value should be equal");
    
    CGFloat value2 = 1.3333289;
    CGFloat expected2 = round(value2 * HippyScreenScale()) / HippyScreenScale();
    CGFloat result2 = HippyRoundPixelValue(value2);
    XCTAssertEqual(result2, expected2, @"Rounded pixel value should be equal");
}

- (void)testHippyCeilPixelValue {
    CGFloat value1 = 1.3333356;
    CGFloat expected1 = ceil(value1 * HippyScreenScale()) / HippyScreenScale();
    CGFloat result1 = HippyCeilPixelValue(value1);
    XCTAssertEqual(result1, expected1, @"Ceil pixel value should be equal");
    
    CGFloat value2 = 1.3333289;
    CGFloat expected2 = ceil(value2 * HippyScreenScale()) / HippyScreenScale();
    CGFloat result2 = HippyCeilPixelValue(value2);
    XCTAssertEqual(result2, expected2, @"Ceil pixel value should be equal");
}

- (void)testHippyFloorPixelValue {
    CGFloat value1 = 1.3333356;
    CGFloat expected1 = floor(value1 * HippyScreenScale()) / HippyScreenScale();
    CGFloat result1 = HippyFloorPixelValue(value1);
    XCTAssertEqual(result1, expected1, @"Floor pixel value should be equal");
    
    CGFloat value2 = 1.3333289;
    CGFloat expected2 = floor(value2 * HippyScreenScale()) / HippyScreenScale();
    CGFloat result2 = HippyFloorPixelValue(value2);
    XCTAssertEqual(result2, expected2, @"Floor pixel value should be equal");
}

- (void)testHippySizeCeilInPixels {
    CGSize size1 = CGSizeMake(1.3333356, 1.3333356);
    CGFloat scale = HippyScreenScale();
    CGSize expected1 = (CGSize){
        ceil(size1.width * scale),
        ceil(size1.height * scale),
    };
    CGSize result1 = HippySizeCeilInPixels(size1, scale);
    XCTAssertTrue(CGSizeEqualToSize(result1, expected1), @"Ceil size in pixels should be equal");
    
    CGSize size2 = CGSizeMake(1.3333289, 1.3333289);
    CGSize expected2 = (CGSize){
        ceil(size2.width * scale),
        ceil(size2.height * scale),
    };
    CGSize result2 = HippySizeCeilInPixels(size2, scale);
    XCTAssertTrue(CGSizeEqualToSize(result2, expected2), @"Ceil size in pixels should be equal");
}


@end
