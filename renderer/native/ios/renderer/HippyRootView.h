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

#import <UIKit/UIKit.h>
#import "HippyRootViewDelegate.h"

@class HippyBridge;

/**
 * This enum is used to define size flexibility type of the root view.
 * If a dimension is flexible, the view will recalculate that dimension
 * so the content fits. Recalculations are performed when the root's frame,
 * size flexibility mode or content size changes. After a recalculation,
 * rootViewDidChangeIntrinsicSize method of the HippyRootViewDelegate will be called.
 */
typedef NS_ENUM(NSInteger, HippyRootViewSizeFlexibility) {
    HippyRootViewSizeFlexibilityNone = 0,
    HippyRootViewSizeFlexibilityWidth,
    HippyRootViewSizeFlexibilityHeight,
    HippyRootViewSizeFlexibilityWidthAndHeight,
};


/// This notification is sent when the first subviews are added to the root view
/// after the application has loaded. This is used to hide the `loadingView`, and
/// is a good indicator that the application is ready to use.
extern NSString *const HippyContentDidAppearNotification;

/// Business bundle loading completion notification
/// This notification is for compatibility with hippy2 and is not recommended for further use
extern NSString *const HippySecondaryBundleDidLoadNotification;



/// Native view used to host Hippy-managed views within the app.
/// Can be used just like any ordinary UIView.
/// You can have multiple HippyRootViews on screen at once,
/// all controlled by the same JavaScript application.
@interface HippyRootView : UIView

/// The delegate of hippyRootView.
@property (nonatomic, weak) id<HippyRootViewDelegate> delegate;

/// The name of the JavaScript module to execute within the
/// specified scriptURL (required). Setting this will not have
/// any immediate effect, but it must be done prior to loading the script.
@property (nonatomic, copy, readonly) NSString *moduleName;

/// The bridge used by the root view. Bridges can be shared between multiple
/// root views, so you can use this property to initialize another HippyRootView.
@property (nonatomic, strong, readonly) HippyBridge *bridge;

/// The properties to apply to the view. Use this property to update
/// application properties and rerender the view. Initialized with
/// initialProperties argument of the initializer.
/// Set this property only on the main thread.
@property (nonatomic, copy, readwrite) NSDictionary *appProperties;

/// The backing view controller of the root view.
@property (nonatomic, weak) UIViewController *hippyViewController;


/// Create HippyRootView instance
///
/// @param bridge the hippyBridge instance
/// @param moduleName module name
/// @param initialProperties application properties, see appProperties property.
/// @param delegate HippyRootViewDelegate
- (instancetype)initWithBridge:(HippyBridge *)bridge
                    moduleName:(NSString *)moduleName
             initialProperties:(NSDictionary *)initialProperties
                      delegate:(id<HippyRootViewDelegate>)delegate;

/// Create HippyRootView instance
/// & Load the business BundleURL
/// & Run application
///
/// @param bridge the hippyBridge instance
/// @param businessURL the bundleURL to load
/// @param moduleName module name
/// @param initialProperties application properties, see appProperties property.
/// @param delegate HippyRootViewDelegate
- (instancetype)initWithBridge:(HippyBridge *)bridge
                   businessURL:(NSURL *)businessURL
                    moduleName:(NSString *)moduleName
             initialProperties:(NSDictionary *)initialProperties
                      delegate:(id<HippyRootViewDelegate>)delegate;


/// Run Hippy!
/// This is the Hippy program entry.
///
/// Note: If init with businessURL, not need to call this method again.
- (void)runHippyApplication;


#pragma mark -

/// This method should be called when the host controller's view's size is changed
///  (i.e. for the root view controller when its window rotates or is resized).
///
///  Note that `useViewWillTransitionMethodToMonitorOrientation` flag must be set when init bridge,
///  otherwise calling this function takes no effect.
///
/// - Parameter size: the new size
- (void)onHostControllerTransitionedToSize:(CGSize)size;


@end
