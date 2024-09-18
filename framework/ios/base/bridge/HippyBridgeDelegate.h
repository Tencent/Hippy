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
#import "HippyInvalidating.h"


/// An Interceptor protocol for gesture events.
@protocol HippyTouchEventInterceptorProtocol <NSObject>

@optional

/// A centralized handler for event sending,
/// which hippy calls before sending events to the JS side.
///
/// This method is convenient for external data reporting of hippy gesture events
/// - Parameters:
///   - eventName: name of event
///   - point: point in hippyRootView
///   - view: target view
- (void)willSendGestureEvent:(NSString *)eventName withPagePoint:(CGPoint)point toView:(UIView *)view;

@end


/// Delegate of HippyBridge
@protocol HippyBridgeDelegate <NSObject, HippyTouchEventInterceptorProtocol>

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
- (void)invalidateForReason:(HippyInvalidateReason)reason bridge:(HippyBridge *)bridge;


#pragma mark - UI/Layout Related

/// When return YES,
/// it indicates that you want to use the `viewWillTransitionToSize` method in UIViewController
/// instead of the deprecated UIApplicationDidChangeStatusBarOrientationNotification.
///
/// Note that you must call `onHostControllerTransitionedToSize` of HippyRootView when size changed.
- (BOOL)shouldUseViewWillTransitionMethodToMonitorOrientation;

/// The default status bar height when hippy cannot obtained dynamically.
///
/// Note: In general, the page layout should not depend on `StatusBar` height,
/// Its height is dynamically changed and should be obtained dynamically.
/// This value is only used as a default value if hippy cannot be obtained.
///
/// Only for compatibility with old code, strongly discouraged.
/// return values less than 0 will be treated as 0.
- (CGFloat)defaultStatusBarHeightNoMatterHiddenOrNot;


@end
