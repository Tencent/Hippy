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

@class HippyBridge;

#import "HPInvalidating.h"

@protocol HippyBridgeDelegate <NSObject>

@optional

/**
 * Ask delegate should bridge start a web inspector
 *
 * @return should start debug inspector for bridge
 */
- (BOOL)shouldStartInspector:(HippyBridge *)bridge;

/**
 * Get code cache, not working for Javascriptcore engine
 *
 * @param bridge HippyBridge requires code cache
 * @param script js script for code cache
 * @param sourceURL source url for code cache
 * @return code cache data
 */
- (NSData *)cachedCodeForBridge:(HippyBridge *)bridge script:(NSString *)script sourceURL:(NSURL *)sourceURL;

/**
 * Invoke when code cache created, not working for Javascriptcore engine
 *
 * @param cachedCode code cache
 * @param bridge HippyBridge requires code cache
 * @param script js script for code cache
 * @param sourceURL source url for code cache
 */
- (void)cachedCodeCreated:(NSData *)cachedCode ForBridge:(HippyBridge *)bridge script:(NSString *)script sourceURL:(NSURL *)sourceURL;

//invalidate methods
/**
 * Invoke when HippyBridge requests reloading
 *
 * @param bridge HippyBridge that requests reloading
 */
- (void)reload:(HippyBridge *)bridge;

/**
 * Tell delegate to remove root node
 *
 * @param rootTag root tag for root node
 * @discussion RootNode instance held by caller, so when root view dealloc, we should tell caller to remove root node
 */
- (void)removeRootView:(NSNumber *)rootTag bridge:(HippyBridge *)bridge;

/**
 * Tell delegate to invalidate
 *
 * @param reason reson for HippyBridge invalidation, typically reload, or dealloc
 * @param bridge HippyBridge to be invalidated
 */
- (void)invalidateForReason:(HPInvalidateReason)reason bridge:(HippyBridge *)bridge;

@end
