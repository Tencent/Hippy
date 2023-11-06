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
#import "HippyInvalidating.h"
#import "NativeRenderDefines.h"
#import "HippyBridgeModule.h"
#import "HippyCustomTouchHandlerProtocol.h"

@class NativeRenderAnimationViewParams;
@class HippyShadowView;
@class HippyUIManager;
@class HippyViewManager;
@class NativeRenderReusePool;
@class HippyComponentMap;
@protocol HippyImageProviderProtocol;


/// The HippyUIManager responsible for updating the view hierarchy.
@interface HippyUIManager : NSObject <HippyInvalidating>

+ (instancetype)new NS_UNAVAILABLE;
- (instancetype)init NS_UNAVAILABLE;

#ifdef __cplusplus
/// Init method
/// - Parameter renderManager: the hippy::RenderManager
- (instancetype)initWithRenderManager:(std::weak_ptr<hippy::RenderManager>)renderManager NS_DESIGNATED_INITIALIZER;

@property (nonatomic, assign) std::weak_ptr<VFSUriLoader> VFSUriLoader;
@property (nonatomic, assign) std::weak_ptr<hippy::RenderManager> renderManager;
@property (nonatomic, readonly) std::weak_ptr<hippy::DomManager> domManager;
#endif

@property (nonatomic, weak) HippyBridge *bridge;
@property (nonatomic, readonly) HippyComponentMap *viewRegistry;
@property (nonatomic, assign) BOOL uiCreationLazilyEnabled;


/// Gets the view associated with a hippyTag.
/// - Parameters:
///   - hippyTag: NSNumber
///   - rootTag: NSNumber
- (UIView *)viewForHippyTag:(NSNumber *)hippyTag onRootTag:(NSNumber *)rootTag;

/// Get the shadow view associated with a hippyTag
/// - Parameters:
///   - hippyTag: NSNumber
///   - rootTag: NSNumber
- (HippyShadowView *)shadowViewForHippyTag:(NSNumber *)hippyTag onRootTag:(NSNumber *)rootTag;

/// Update the frame of a view. This might be in response to a screen rotation
/// or some other layout event outside of the Hippy-managed view hierarchy.
/// - Parameters:
///   - frame: new frame
///   - view: target view
- (void)setFrame:(CGRect)frame forRootView:(UIView *)view;

/// Schedule a block to be executed on the UI thread. Useful if you need to execute
/// view logic after all currently queued view updates have completed.
/// - Parameter block: block to be executed on main thread
- (void)addUIBlock:(HippyViewManagerUIBlock)block;

/// In some cases we might want to trigger layout from native side.
/// Hippy won't be aware of this, so we need to make sure it happens.
/// - Parameter tag: root tag
- (void)setNeedsLayoutForRootNodeTag:(NSNumber *)tag;

/// Get all rootView
- (NSArray<__kindof UIView *> *)rootViews;

/// Purge view from superView
- (void)purgeViewsFromComponentTags:(NSArray<NSNumber *> *)componentTag onRootTag:(NSNumber *)rootTag;

/// Update view with props
- (void)updateView:(NSNumber *)componentTag onRootTag:(NSNumber *)rootTag props:(NSDictionary *)pros;

/// Get viewManager Name
/// @param viewName NSString
- (__kindof HippyViewManager *)renderViewManagerForViewName:(NSString *)viewName;

/**
 * Manully create views recursively from renderObject
 *
 * @param renderObject HippyShadowView corresponding to UIView
 * @return view created by HippyShadowView
 */
- (UIView *)createViewRecursivelyFromRenderObject:(HippyShadowView *)renderObject;

/// Register extra components
/// @param extraComponents extra components classes
- (void)registerExtraComponent:(NSArray<Class> *)extraComponents;

/// Clear all resources
- (void)invalidate;

@end


#pragma mark - HippyBridge (HippyUIManager)

/**
 * This category makes the current HippyUIManager instance available via the
 * HippyBridge, which is useful for HippyBridgeModules or HippyViewManagers that
 * need to access the HippyUIManager.
 */
@interface HippyBridge (HippyUIManager)

/// The current HippyUIManager instance
@property (nonatomic, readonly) HippyUIManager *uiManager;

/// A custom touch handler for gesture special processing
/// You can use it when you need to modify Hippy's default gesture handling logic
@property (nonatomic, strong, readonly) id<HippyCustomTouchHandlerProtocol> customTouchHandler;

@end
