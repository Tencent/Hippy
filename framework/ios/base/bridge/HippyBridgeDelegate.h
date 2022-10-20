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

#import "HippyJavaScriptLoader.h"
#import "NativeRenderComponentProtocol.h"

@class HippyBridge;
@protocol HippyBridgeModule;

@protocol HippyBridgeDelegate <NSObject>

@optional

- (void)componentWillBePurged:(id<NativeRenderComponentProtocol>)component;

- (void)bridge:(HippyBridge *)bridge willLoadBundle:(NSURL *)bundle;

- (void)bridge:(HippyBridge *)bridge endLoadingBundle:(NSURL *)bundle;

/**
 * The bridge will automatically attempt to load the JS source code from the
 * location specified by the `sourceURLForBridge:` method, however, if you want
 * to handle loading the JS yourself, you can do so by implementing this method.
 */
- (void)downloadBundleForURL:(NSURL *)bundleURL bridge:(HippyBridge *)bridge
              onProgress:(HippySourceLoadProgressBlock)onProgress onComplete:(HippySourceLoadBlock)loadCallback;

/**
 * Similar to loadSourceForBridge:onProgress:onComplete: but without progress
 * reporting.
 */
- (void)downloadBundleForURL:(NSURL *)bundleURL bridge:(HippyBridge *)bridge withBlock:(HippySourceLoadBlock)loadCallback;

- (BOOL)dynamicLoad:(HippyBridge *)bridge URI:(NSString *)uri completion:(void (^)(NSString *))completion;

- (BOOL)scriptWillBeExecuted:(NSString *)script sourceURL:(NSURL *)sourceURL;

//chrome dev tools inspector delegate

/**
 * ask delegate should bridge start a web inspector
 */
- (BOOL)shouldStartInspector:(HippyBridge *)bridge;

/**
 * ask delegate URL for web inspector
 */
- (NSURL *)inspectorSourceURLForBridge:(HippyBridge *)bridge;

/**
 * Cache code delegate
 */
- (NSData *)cachedCodeForBridge:(HippyBridge *)bridge script:(NSString *)script sourceURL:(NSURL *)sourceURL;

- (void)cachedCodeCreated:(NSData *)cachedCode ForBridge:(HippyBridge *)bridge script:(NSString *)script sourceURL:(NSURL *)sourceURL;

@end
