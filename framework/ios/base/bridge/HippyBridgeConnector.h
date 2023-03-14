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

#import "HippyModulesSetup.h"

NS_ASSUME_NONNULL_BEGIN

typedef void(^_Nullable HippyBridgeBundleLoadCompletion)(NSURL *_Nullable, NSError *_Nullable);

@interface HippyBridgeConnectorReloadData : NSObject

@property(nonatomic, strong) UIView *rootView;
@property(nonatomic, strong) NSDictionary *props;
@property(nonatomic, strong) NSArray<NSURL *> *URLs;
@property(nonatomic, strong, nullable) HippyBridgeBundleLoadCompletion completion;

@end

@protocol HippyBridgeDelegate, HPImageProviderProtocol, HippyMethodInterceptorProtocol;
@class HippyBridge, HippyBridgeConnector;

@protocol HippyBridgeConnectorDelegate <NSObject>

@optional

- (BOOL)shouldStartInspector:(HippyBridgeConnector *)connector;

- (NSData *)cachedCodeForConnector:(HippyBridgeConnector *)connector
                            script:(NSString *)script
                         sourceURL:(NSURL *)sourceURL;

- (void)cachedCodeCreated:(NSData *)cachedCode
             ForConnector:(HippyBridgeConnector *)connector
                   script:(NSString *)script
                sourceURL:(NSURL *)sourceURL;

- (void)removeRootView:(NSNumber *)rootTag connector:(HippyBridgeConnector *)connector;

- (HippyBridgeConnectorReloadData *)reload:(HippyBridgeConnector *)connector;

@end

/**
 * Convenient class for adative 2.0 interface
 */
@interface HippyBridgeConnector : NSObject

@property(nonatomic, readonly) HippyBridge *bridge;
//Properties that must be set
@property(nonatomic, copy) NSString *moduleName;
@property(nonatomic, copy) NSString *contextName;
@property(nonatomic, strong) NSURL *sandboxDirectory;

//Optional properties
@property(nonatomic, weak) id<HippyMethodInterceptorProtocol> methodInterceptor;
@property(nonatomic, readonly, weak) id<HippyBridgeConnectorDelegate> delegate;

//Methods that must be called
- (instancetype)initWithDelegate:(id<HippyBridgeConnectorDelegate> _Nullable)delegate
                  moduleProvider:(HippyBridgeModuleProviderBlock _Nullable)block
                 extraComponents:(NSArray<Class> * _Nullable)extraComponents
                   launchOptions:(NSDictionary * _Nullable)launchOptions
                       engineKey:(NSString *)engineKey;

- (void)loadBundleURLs:(NSArray<NSURL *> *)bundleURLs
            completion:(HippyBridgeBundleLoadCompletion)completion;

- (void)setRootView:(UIView *)rootView;

- (void)loadInstanceForRootViewTag:(NSNumber *)tag props:(NSDictionary *)props;

- (void)unloadRootViewByTag:(NSNumber *)tag;

- (void)addExtraComponents:(NSArray<Class> *)components;

//Optianl properties set
- (void)addImageProviderClass:(Class<HPImageProviderProtocol>)cls;

@end

NS_ASSUME_NONNULL_END
