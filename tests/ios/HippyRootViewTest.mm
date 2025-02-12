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
#import <hippy/HippyView.h>
#import <hippy/HippyRootView.h>
#import <hippy/HippyUIManager.h>
#import <hippy/UIView+Hippy.h>
#import <hippy/UIView+Render.h>
#import "HippyComponentMap.h"
#import "HippyUIManager+Private.h"
#import "HippyJSEnginesMapper.h"
#import "dom/root_node.h"
#import <OCMock/OCMock.h>


@interface UIView (HippyUIManagerUnitTest)

/// Bind UIView with HippyUIManager, for UnitTest
/// - Parameter uiManager: HippyUIManager instance
- (void)setUiManager:(HippyUIManager *)uiManager;

@end


@interface HippyRootContentView : HippyView

/// Init method
- (instancetype)initWithFrame:(CGRect)frame
                       bridge:(HippyBridge *)bridge
                     hippyTag:(NSNumber *)hippyTag
               sizeFlexiblity:(HippyRootViewSizeFlexibility)sizeFlexibility;

#pragma mark - Snapshot

/// Retrieves the current snapshot data.
- (nullable NSData *)retrieveCurrentSnapshotData;

/// Restores the snapshot data with the provided NSData object.
/// - Parameter data: NSData object
- (BOOL)restoreSnapshotData:(nullable NSData *)data;

@end


@interface HippyRootView (UnitTest)

/// ContentView for HippyRootView
@property (nonatomic, strong) HippyRootContentView *contentView;

@end

/// Root tag for test
static NSNumber *const kHippyTestRootTag = @10;


@interface HippyRootViewTest : XCTestCase

/// Mock rootView
@property (nonatomic, strong) HippyRootView *mockRootView;
/// Mock HippyRootContentView
@property (nonatomic, strong) HippyRootContentView *mockContentView;
/// UIManager instance
@property (nonatomic, strong) HippyUIManager *uiManager;

@end

@implementation HippyRootViewTest

- (void)setUp {
    [super setUp];
    HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:nil moduleProvider:nil launchOptions:nil executorKey:nil];
    HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge moduleName:@"Test" initialProperties:nil delegate:nil];
    self.mockRootView = OCMPartialMock(rootView);
    
    // Create ContentView's mock instance
    HippyRootContentView *contentView = [[HippyRootContentView alloc] initWithFrame:CGRectZero
                                                                             bridge:bridge
                                                                           hippyTag:kHippyTestRootTag
                                                                     sizeFlexiblity:HippyRootViewSizeFlexibilityNone];
    self.mockContentView = OCMPartialMock(contentView);
    OCMStub([self.mockRootView contentView]).andReturn(self.mockContentView);
    
    // Create UIManager's instance
    HippyUIManager *uiManager = [[HippyUIManager alloc] initWithBridge:bridge];
    ((HippyRootContentView *)self.mockContentView).uiManager = uiManager;
    self.uiManager = uiManager;
}

- (void)tearDown {
    [(id)self.mockContentView stopMocking];
    [(id)self.mockRootView stopMocking];
    [super tearDown];
}

- (void)testRetrieveCurrentSnapshotData_WhenRootNotNil {
    // Set rootTag
    OCMStub([self.mockContentView hippyTag]).andReturn(kHippyTestRootTag);
    auto rootNode = std::make_shared<hippy::dom::RootNode>(kHippyTestRootTag.unsignedIntValue);
    [self.mockContentView.uiManager.viewRegistry addRootComponent:self.mockRootView rootNode:rootNode forTag:kHippyTestRootTag];
    // Retrive snapshot
    NSData *result = [self.mockRootView retrieveCurrentSnapshotData];
    OCMVerify([self.mockContentView retrieveCurrentSnapshotData]);
    XCTAssertNotNil(result);
}

- (void)testRetrieveCurrentSnapshotData_WhenRootIsNil {
    // Set test invalid rootTag @0
    OCMStub([self.mockContentView hippyTag]).andReturn(@0);
    auto rootNode = std::make_shared<hippy::dom::RootNode>(kHippyTestRootTag.unsignedIntValue);
    [self.mockContentView.uiManager.viewRegistry addRootComponent:self.mockRootView rootNode:rootNode forTag:kHippyTestRootTag];
    // Retrive snapshot
    NSData *result = [self.mockRootView retrieveCurrentSnapshotData];
    OCMVerify([self.mockContentView retrieveCurrentSnapshotData]);
    XCTAssertNil(result);
}

- (void)testRestoreSnapshotData_WhenDataIsNil_ReturnsNO {
    NSData *data = nil;
    BOOL result = [self.mockRootView restoreSnapshotData:data];
    OCMVerify([self.mockContentView restoreSnapshotData:[OCMArg any]]);
    XCTAssertFalse(result);
}

- (void)testRestoreSnapshotData_WhenUIManagerIsNil_ReturnsNO {    
    self.mockContentView.uiManager = nil;
    NSData *data = [NSData dataWithBytes:"mocked data" length:strlen("mocked data")];
    BOOL result = [self.mockRootView restoreSnapshotData:data];
    OCMVerify([self.mockContentView restoreSnapshotData:[OCMArg any]]);
    XCTAssertFalse(result);
}

- (void)testRestoreSnapshotData_WhenRootNodeIsNil_ReturnsNO {
    // Set invalid rootTag
    OCMStub([self.mockContentView hippyTag]).andReturn(@0);
    auto rootNode = std::make_shared<hippy::dom::RootNode>(kHippyTestRootTag.unsignedIntValue);
    [self.mockContentView.uiManager.viewRegistry addRootComponent:self.mockRootView rootNode:rootNode forTag:kHippyTestRootTag];
    
    // Set dom_manager
    auto engineResource = [[HippyJSEnginesMapper defaultInstance] createJSEngineResourceForKey:@"testKey"];
    auto domManager = engineResource->GetDomManager();
    [self.mockContentView.uiManager setDomManager:domManager];
    
    // Restore snapshot
    NSData *data = [NSData dataWithBytes:"mocked data" length:strlen("mocked data")];
    BOOL result = [self.mockRootView restoreSnapshotData:data];
    OCMVerify([self.mockContentView restoreSnapshotData:[OCMArg any]]);
    XCTAssertFalse(result);
}

- (void)testRestoreSnapshotData_WhenValidData_ReturnsYES {
    // Set rootTag
    OCMStub([self.mockContentView hippyTag]).andReturn(kHippyTestRootTag);
    auto rootNode = std::make_shared<hippy::dom::RootNode>(kHippyTestRootTag.unsignedIntValue);
    [self.mockContentView.uiManager.viewRegistry addRootComponent:self.mockRootView rootNode:rootNode forTag:kHippyTestRootTag];
    
    // Retrive snapshot
    NSData *snapshotData = [self.mockRootView retrieveCurrentSnapshotData];
    OCMVerify([self.mockContentView retrieveCurrentSnapshotData]);
    
    // Set dom_manager
    auto engineResource = [[HippyJSEnginesMapper defaultInstance] createJSEngineResourceForKey:@"testKey"];
    auto domManager = engineResource->GetDomManager();
    [self.mockContentView.uiManager setDomManager:domManager];
    
    // Restore snapshot
    BOOL result = [self.mockRootView restoreSnapshotData:snapshotData];
    OCMVerify([self.mockContentView restoreSnapshotData:[OCMArg any]]);
    XCTAssertTrue(result);
}


@end
