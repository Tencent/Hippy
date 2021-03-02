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

@class HippyBridge;
@protocol HippyBridgeModule;

@protocol HippyBridgeDelegate <NSObject>

@optional

/**
 * The location of the JavaScript source file. When running from the packager
 * this should be an absolute URL, e.g. `http://localhost:8081/index.ios.bundle`.
 * When running from a locally bundled JS file, this should be a `file://` url
 * pointing to a path inside the app resources, e.g. `file://.../main.jsbundle`.
 */
- (NSURL *)sourceURLForBridge:(HippyBridge *)bridge;

/**
 * Called and inject Object before Hippy execute JS source code
 * Keys will be mounted at JS Global Object.
 * Values will be mounted at Keys.
 * Values must be JSON Strings.
 */
- (NSDictionary *)objectsBeforeExecuteCode;

/**
 * The bridge will attempt to load the JS source code from the location specified
 * by the `sourceURLForBridge:` method, if loading fails, you can implement this
 * method to specify fallbackSourceURL.
 * NOTE: We don't plan to support this API permanently (this method will be
 * removed after we track down why a valid sourceURL fails to load sometimes).
 */
- (NSURL *)fallbackSourceURLForBridge:(HippyBridge *)bridge;

/**
 * The bridge initializes any registered HippyBridgeModules automatically, however
 * if you wish to instantiate your own module instances, you can return them
 * from this method.
 *
 * Note: You should always return a new instance for each call, rather than
 * returning the same instance each time the bridge is reloaded. Module instances
 * should not be shared between bridges, and this may cause unexpected behavior.
 *
 * It is also possible to override standard modules with your own implementations
 * by returning a class with the same `moduleName` from this method, but this is
 * not recommended in most cases - if the module methods and behavior do not
 * match exactly, it may lead to bugs or crashes.
 */
- (NSArray<id<HippyBridgeModule>> *)extraModulesForBridge:(HippyBridge *)bridge;

/**
 * Customize how bridge native modules are initialized.
 *
 * By default all modules are created lazily except those that have constants to export
 * or require main thread initialization. If you want to limit the set of native
 * modules that this should be considered for, implement this method.
 *
 * Return nil to whitelist all modules found. Modules passed in extraModulesForBridge:
 * are automatically whitelisted.
 *
 * @experimental
 */
- (NSArray<Class> *)whitelistedModulesForBridge:(HippyBridge *)bridge;

/**
 * When loading initial JavaScript, do so synchronously when the bridge is created iff
 * this returns true.  Otherwise, the JS will be fetched on a network thread, and
 * executed on the JS thread.  Currently used only by C++ bridge.
 *
 * @experimental
 */
- (BOOL)shouldBridgeLoadJavaScriptSynchronously:(HippyBridge *)bridge;

/**
 * When initializing native modules that require main thread initialization, the bridge
 * will default to dispatch module creation blocks asynchrously. If we're blockingly
 * waiting on the main thread to finish bridge creation on the main thread, this will
 * deadlock. Override this method to initialize modules synchronously instead.
 *
 * @experimental
 */
- (BOOL)shouldBridgeInitializeNativeModulesSynchronously:(HippyBridge *)bridge;

/**
 * The bridge will automatically attempt to load the JS source code from the
 * location specified by the `sourceURLForBridge:` method, however, if you want
 * to handle loading the JS yourself, you can do so by implementing this method.
 */
- (void)loadSourceForBridge:(HippyBridge *)bridge onProgress:(HippySourceLoadProgressBlock)onProgress onComplete:(HippySourceLoadBlock)loadCallback;

/**
 * Similar to loadSourceForBridge:onProgress:onComplete: but without progress
 * reporting.
 */
- (void)loadSourceForBridge:(HippyBridge *)bridge withBlock:(HippySourceLoadBlock)loadCallback;

@end
