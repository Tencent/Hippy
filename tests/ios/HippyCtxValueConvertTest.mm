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
#include "driver/engine.h"
#include "driver/vm/js_vm.h"
#include "driver/napi/js_ctx.h"


@interface HippyCtxValueConvertTest : XCTestCase

/// hippy vm for test
@property (nonatomic, assign) std::shared_ptr<hippy::VM> vm;
/// context for test
@property (nonatomic, assign) std::shared_ptr<hippy::Ctx> context;

@end

@implementation HippyCtxValueConvertTest

- (void)setUp {
    _vm = hippy::CreateVM(std::make_shared<hippy::VM::VMInitParam>());
    _context = _vm->CreateContext();
}

- (void)tearDown {
    // nop
}

- (void)testCtxStringToNSString {
    std::shared_ptr<hippy::CtxValue> ctxStr = _context->CreateString(u"shouldIgnoreLatestLogin");
    id ocObj = ObjectFromCtxValue(_context, ctxStr);
    XCTAssert([ocObj isEqualToString:@"shouldIgnoreLatestLogin"]);
}

- (void)testCtxObjectToNSDictionary {
    const char *testKey = "MyVeryVeryLongStringKeyForUnitTest";
    std::shared_ptr<hippy::CtxValue> ctxStr = _context->CreateString(u"myTestVeryLongStringValue");
    std::unordered_map<footstone::string_view, std::shared_ptr<hippy::CtxValue>> map = { {testKey , ctxStr} };
    std::shared_ptr<hippy::CtxValue> ctxValue = _context->CreateObject(map);
    id ocObj = ObjectFromCtxValue(_context, ctxValue);
    XCTAssert([ocObj isKindOfClass:NSDictionary.class]);
    XCTAssertTrue([[((NSDictionary *)ocObj) objectForKey:@(testKey)] isEqualToString:@"myTestVeryLongStringValue"]);
}

// NSString
- (void)testNSStringToCtxValue {
    NSString *testOCString = @"Hello Hippy";
    CtxValuePtr ctxValue = [testOCString convertToCtxValue:_context];
    XCTAssert(_context->IsString(ctxValue));
    XCTAssert([ObjectFromCtxValue(_context, ctxValue) isEqualToString:testOCString]);
}

// NSNumber
- (void)testNSNumberToCtxValue {
    NSNumber *testOCNumber = @42;
    CtxValuePtr ctxValue = [testOCNumber convertToCtxValue:_context];
    XCTAssert(_context->IsNumber(ctxValue));
    XCTAssertTrue([ObjectFromCtxValue(_context, ctxValue) isEqualToNumber:testOCNumber]);
}

// NSArray
- (void)testNSArrayToCtxValue {
    NSArray *testOCArray = @[@"Hello", @42, @YES];
    CtxValuePtr ctxValue = [testOCArray convertToCtxValue:_context];
    XCTAssert(_context->IsArray(ctxValue));
    XCTAssert([ObjectFromCtxValue(_context, ctxValue) isEqualToArray:testOCArray]);
}

// NSDictionary
- (void)testNSDictionaryToCtxValue {
    NSDictionary *testOCDict = @{@"key1": @"value1", @"key2": @42};
    CtxValuePtr ctxValue = [testOCDict convertToCtxValue:_context];
    XCTAssert(_context->IsObject(ctxValue));
    XCTAssert([ObjectFromCtxValue(_context, ctxValue) isEqualToDictionary:testOCDict]);
}

// NSData
- (void)testNSDataToCtxValue {
    NSData *testOCData = [@"Hello Hippy" dataUsingEncoding:NSUTF8StringEncoding];
    CtxValuePtr ctxValue = [testOCData convertToCtxValue:_context];
    XCTAssert(_context->IsByteBuffer(ctxValue));
    XCTAssert([ObjectFromCtxValue(_context, ctxValue) isEqualToData:testOCData]);
}

// NSNull
- (void)testNSNullToCtxValue {
    NSNull *testOCNull = [NSNull null];
    CtxValuePtr ctxValue = [testOCNull convertToCtxValue:_context];
    XCTAssert(_context->IsNull(ctxValue));
    XCTAssert([ObjectFromCtxValue(_context, ctxValue) isKindOfClass:[NSNull class]]);
}

// NSError
- (void)testNSErrorToCtxValue {
    NSError *testOCError = [NSError errorWithDomain:@"com.example" code:42 userInfo:nil];
    CtxValuePtr ctxValue = [testOCError convertToCtxValue:_context];
    XCTAssert(_context->IsString(ctxValue)); // NSErrors are converted as string
    NSString *resultDesc = ObjectFromCtxValue(_context, ctxValue);
    XCTAssert([resultDesc isKindOfClass:[NSString class]]);
    XCTAssertEqualObjects(resultDesc, testOCError.description);
}

// NSURL
- (void)testNSURLToCtxValue {
    NSURL *testOCURL = [NSURL URLWithString:@"https://www.example.com"];
    CtxValuePtr ctxValue = [testOCURL convertToCtxValue:_context];
    XCTAssert(_context->IsString(ctxValue)); // Assuming URLs are converted to strings
    XCTAssert([ObjectFromCtxValue(_context, ctxValue) isEqualToString:[testOCURL absoluteString]]);
}

@end
