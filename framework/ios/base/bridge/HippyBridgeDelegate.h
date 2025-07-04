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
 * Ask delegate URL for web inspector (devtools)
 *
 * To use remote debugging, must implement this method.
 */
- (NSURL *)inspectorSourceURLForBridge:(HippyBridge *)bridge;

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

/// Whether hippy use rootView's size as "window" size in Dimensions info.
///
/// Default value is YES.
/// In historical versions, the window recorded in the hippy dimensions information
/// refers to the key window on the native side,
/// and returning NO will maintain consistency with the behavior of historical versions.
- (BOOL)shouldUseRootViewSizeAsWindowSizeInDimensions;

/// Set default window size in Dimensions API before RootView is mounted.
///
/// Note: This API is valid only when `shouldUseRootViewSizeAsWindowSizeInDimensions` is YES.
/// This might be useful in some special scenarios, such as starting in split-screen mode on an iPad.
- (CGSize)defaultWindowSizeInDimensionsBeforeRootViewMount;

/// Font size multiplier for hippy
/// 
/// This value is used to calculate the font size of the text in the hippy page.
/// The default value is 1.0.
/// If you want to change the font size of the text in the hippy page,
/// you can implement this method and return a different value.
/// The value is multiplied by the default font size to get the actual font size.
- (CGFloat)fontSizeMultiplierForHippy:(HippyBridge *)bridge;

@end
