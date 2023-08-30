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

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#import "HippyModulesSetup.h"

NS_ASSUME_NONNULL_BEGIN

typedef void(^_Nullable HippyBridgeBundleLoadCompletion)(NSURL *_Nullable, NSError *_Nullable);

@protocol HippyBridgeDelegate, HPImageProviderProtocol, HippyMethodInterceptorProtocol;

/**
 * Convenient class for adative 2.0 interface
 */
@interface HippyConvenientBridge : NSObject

@property(nonatomic, readonly) HippyBridge *bridge;
//Properties that must be set
@property(nonatomic, copy) NSString *moduleName;
@property(nonatomic, copy) NSString *contextName;
@property(nonatomic, strong) NSURL *sandboxDirectory;

//Optional properties
@property(nonatomic, weak) id<HippyMethodInterceptorProtocol> methodInterceptor;
@property(nonatomic, readonly, weak) id<HippyBridgeDelegate> delegate;

//Methods that must be called
- (instancetype)initWithDelegate:(id<HippyBridgeDelegate> _Nullable)delegate
                  moduleProvider:(HippyBridgeModuleProviderBlock _Nullable)block
                 extraComponents:(NSArray<Class> * _Nullable)extraComponents
                   launchOptions:(NSDictionary * _Nullable)launchOptions
                       engineKey:(NSString *_Nullable)engineKey;

- (void)loadBundleURL:(NSURL *)bundleURL completion:(HippyBridgeBundleLoadCompletion)completion;

//Load debug url specified by [HippyBundleURLProvider sharedInstance]
//and `_debugMode` variable in HippyBridge will be set to YES
- (void)loadDebugBundleCompletion:(HippyBridgeBundleLoadCompletion)completion;

- (void)setRootView:(UIView *)rootView;

- (void)resetRootSize:(CGSize)size;

- (void)loadInstanceForRootViewTag:(NSNumber *)tag props:(NSDictionary *)props;

- (void)unloadRootViewByTag:(NSNumber *)tag;

- (void)addExtraComponents:(NSArray<Class> *)components;

- (void)setInspectable:(BOOL)inspectable;

//Optianl properties set
- (void)addImageProviderClass:(Class<HPImageProviderProtocol>)cls;

#pragma mark event
- (void)sendEvent:(NSString *)eventName params:(NSDictionary *_Nullable)params;

#pragma mark snap shot
- (NSData *)snapShotData;

- (void)setSnapShotData:(NSData *)data;

@end

NS_ASSUME_NONNULL_END
