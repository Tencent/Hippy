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
#import <hippy/NSObject+CtxValue.h>
#import <hippy/HippyJSEnginesMapper.h>
#import "driver/engine.h"
#import "driver/scope.h"

@interface HippyOC2CtxValueTest : XCTestCase

@end

@implementation HippyOC2CtxValueTest

- (void)setUp {
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
}

- (void)testOCObject2CtxValue {
#ifdef JS_JSC
    [self runOCObject2CtxValueTestInEngine:hippy::VM::kJSEngineJSC];
#endif /* JS_JSC */
#ifdef JS_HERMES
    [self runOCObject2CtxValueTestInEngine:hippy::VM::kJSEngineHermes];
#endif /* JS_HERMES */
}

- (void)runOCObject2CtxValueTestInEngine:(const std::string &)engineType {
    auto engine = [[HippyJSEnginesMapper defaultInstance] createJSEngineResourceForKey:@"testKey"
                                                                            engineType:engineType];
    auto scope = engine->GetEngine()->CreateScope("testKey");
    
    XCTestExpectation *expectation = [self expectationWithDescription:@"ToCtxValue"];
    engine->GetEngine()->GetJsTaskRunner()->PostTask([scope, expectation](){
        scope->CreateContext();
        auto context = scope->GetContext();
        
        NSMutableDictionary *testDic = [NSMutableDictionary dictionary];
        NSMutableDictionary *nestedDic = [NSMutableDictionary dictionary];
        nestedDic[@"testZeroData"] = [NSData data];
        nestedDic[@"testNumber"] = @200;
        nestedDic[@"testBool"] = @YES;
        nestedDic[@"testNull"] = [NSNull null];
        nestedDic[@"testString"] = @"";
        nestedDic[@"testString1"] = @"0";
        nestedDic[@"testArray"] = @[];
        nestedDic[@"testError"] = [NSError errorWithDomain:NSCocoaErrorDomain code:0 userInfo:nil];
        nestedDic[@"testDictionary"] = @{};
        nestedDic[@"testURL"] = [NSURL URLWithString:@""];
        std::shared_ptr<hippy::CtxValue> ctxValue = [nestedDic convertToCtxValue:context];
        XCTAssert(ctxValue != nullptr);
        
        testDic[@"testDic"] = nestedDic;
        ctxValue = [testDic convertToCtxValue:context];
        XCTAssert(ctxValue != nullptr);
        
        ctxValue = [@[testDic, testDic, testDic] convertToCtxValue:context];
        XCTAssert(ctxValue != nullptr);
        
        NSArray *testDicArr = ObjectFromCtxValue(context, ctxValue);
        XCTAssert(testDicArr.count == 3);
        XCTAssert([testDicArr.firstObject[@"testDic"][@"testNumber"] intValue] == 200);
        XCTAssert([testDicArr.firstObject[@"testDic"][@"testBool"] boolValue] == YES);
        XCTAssert([testDicArr.firstObject[@"testDic"][@"testString1"] isEqualToString:@"0"]);
        
        NSMutableArray *testArr = [NSMutableArray array];
        [testArr addObject:[NSData data]];
        [testArr addObject:[NSDate date]];
        [testArr addObject:[NSHashTable weakObjectsHashTable]];
        [testArr addObject:[NSHTTPURLResponse new]];
        XCTAssert([testArr convertToCtxValue:context] != nullptr);
        
        [expectation fulfill];
    });
    
    [self waitForExpectationsWithTimeout:10 handler:^(NSError *error) {
        NSLog(@"%@", error);
    }];
}


@end
