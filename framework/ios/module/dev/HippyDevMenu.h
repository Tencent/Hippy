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

@class HippyDevMenuItem;

/**
 * Developer menu, useful for exposing extra functionality when debugging.
 */
@interface HippyDevMenu : NSObject

/**
 * Is the menu enabled. The menu is enabled by default if HIPPY_DEV=1, but
 * you may wish to disable it so that you can provide your own shake handler.
 */
@property (nonatomic, assign) BOOL shakeToShow;

/**
 * Enables performance profiling.
 */
@property (nonatomic, assign) BOOL profilingEnabled;

/**
 * Enables automatic polling for JS code changes. Only applicable when
 * running the app from a server.
 */
@property (nonatomic, assign) BOOL liveReloadEnabled;

/**
 * Enables hot loading. Currently not supported in open source.
 */
@property (nonatomic, assign) BOOL hotLoadingEnabled;

/**
 * Shows the FPS monitor for the JS and Main threads.
 */
@property (nonatomic, assign) BOOL showFPS;

/**
 * Manually show the dev menu (can be called from JS).
 */
- (void)show;

/**
 * Manually reload the application. Equivalent to calling [bridge reload]
 * directly, but can be called from JS.
 */
- (void)reload;

/**
 * Add custom item to the development menu. The handler will be called
 * when user selects the item.
 */
- (void)addItem:(HippyDevMenuItem *)item;

@end

/**
 * Developer menu item, used to expose additional functionality via the menu.
 */
@interface HippyDevMenuItem : NSObject

/**
 * This creates an item with a simple push-button interface, used to trigger an
 * action.
 */
+ (instancetype)buttonItemWithTitle:(NSString *)title handler:(void (^)(void))handler;

/**
 * This creates an item with a toggle behavior. The key is used to store the
 * state of the toggle. For toggle items, the handler will be called immediately
 * after the item is added if the item was already selected when the module was
 * last loaded.
 */
+ (instancetype)toggleItemWithKey:(NSString *)key
                            title:(NSString *)title
                    selectedTitle:(NSString *)selectedTitle
                          handler:(void (^)(BOOL selected))handler;
@end

/**
 * This category makes the developer menu instance available via the
 * HippyBridge, which is useful for any class that needs to access the menu.
 */
@interface HippyBridge (HippyDevMenu)

@property (nonatomic, readonly) HippyDevMenu *devMenu;

@end
