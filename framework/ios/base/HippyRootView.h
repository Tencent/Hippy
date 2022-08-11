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

#import "HippyBridge.h"

@protocol HippyRootViewDelegate;

/**
 * This notification is sent when the first subviews are added to the root view
 * after the application has loaded. This is used to hide the `loadingView`, and
 * is a good indicator that the application is ready to use.
 */
extern NSString *const HippyContentDidAppearNotification;

/**
 * Native view used to host Hippy-managed views within the app. Can be used just
 * like any ordinary UIView. You can have multiple HippyRootViews on screen at
 * once, all controlled by the same JavaScript application.
 */
@interface HippyRootView : UIView

- (instancetype)initWithBridge:(HippyBridge *)bridge
                    moduleName:(NSString *)moduleName
             initialProperties:(NSDictionary *)initialProperties
                      delegate:(id<HippyRootViewDelegate>)delegate;

- (instancetype)initWithBundleURL:(NSURL *)bundleURL
                       moduleName:(NSString *)moduleName
                initialProperties:(NSDictionary *)initialProperties
                    launchOptions:(NSDictionary *)launchOptions
                        debugMode:(BOOL)mode
                         delegate:(id<HippyRootViewDelegate>)delegate;

/**
 * - Convenience initializer -
 * A bridge will be created internally.
 * This initializer is intended to be used when the app has a single HippyRootView,
 * otherwise create an `HippyBridge` and pass it in via `initWithBridge:moduleName:`
 * to all the instances.
 */

- (instancetype)initWithBridge:(HippyBridge *)bridge
                   businessURL:(NSURL *)businessURL
                    moduleName:(NSString *)moduleName
             initialProperties:(NSDictionary *)initialProperties
                 launchOptions:(NSDictionary *)launchOptions
                      delegate:(id<HippyRootViewDelegate>)delegate;

- (instancetype)initWithBridgeButNoRuntime:(HippyBridge *)bridge;

/**
 * The name of the JavaScript module to execute within the
 * specified scriptURL (required). Setting this will not have
 * any immediate effect, but it must be done prior to loading
 * the script.
 */
@property (nonatomic, copy, readonly) NSString *moduleName;

/**
 * The bridge used by the root view. Bridges can be shared between multiple
 * root views, so you can use this property to initialize another HippyRootView.
 */
@property (nonatomic, strong, readonly) HippyBridge *bridge;

/**
 * The properties to apply to the view. Use this property to update
 * application properties and rerender the view. Initialized with
 * initialProperties argument of the initializer.
 *
 * Set this property only on the main thread.
 */
@property (nonatomic, copy, readwrite) NSDictionary *appProperties;

/**
 * The size of the root view's content. This is set right before the
 * rootViewDidChangeIntrinsicSize method of HippyRootViewDelegate is called.
 */
@property (readonly, nonatomic, assign) CGSize intrinsicSize;

/**
 * The delegate that handles intrinsic size updates.
 */
@property (nonatomic, weak) id<HippyRootViewDelegate> delegate;

/**
 * The backing view controller of the root view.
 */
@property (nonatomic, weak) UIViewController *hippyViewController;

/**
 * The Hippy-managed contents view of the root view.
 */
@property (nonatomic, strong, readonly) UIView *contentView;

/**
 * A view to display while the JavaScript is loading, so users aren't presented
 * with a blank screen. By default this is nil, but you can override it with
 * (for example) a UIActivityIndicatorView or a placeholder image.
 */
@property (nonatomic, strong) UIView *loadingView;

// custom event
- (void)contentDidAppear:(int64_t)cost;

- (void)secondaryBundleDidLoadSourceCode:(NSError *)error;

- (void)secondayBundleDidFinishLoad:(NSError *)error;

/**
 * Timings for hiding the loading view after the content has loaded. Both of
 * these values default to 0.25 seconds.
 */
@property (nonatomic, assign) NSTimeInterval loadingViewFadeDelay;
@property (nonatomic, assign) NSTimeInterval loadingViewFadeDuration;
@property (nonatomic, assign) Class customTouchHandler;

// MttRN:
- (void)bundleFinishedLoading:(HippyBridge *)bridge;
- (void)runApplication:(HippyBridge *)bridge;
@end
