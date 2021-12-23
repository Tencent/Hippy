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
#import "HippyBridgeModule.h"
#import "HippyInvalidating.h"
#import "HippyViewManager.h"
#import "HippyRootView.h"
#include <memory>
#include <unordered_map>
#import "HippyDomNodeUtils.h"
#include "dom/dom_value.h"
#include "dom/dom_listener.h"
#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#import "HippyDomNodeUtils.h"

@class HippyVirtualNode;
@class HippyExtAnimationViewParams;

typedef void (^HippyViewUpdateCompletedBlock)(HippyUIManager *uiManager);

/**
 * UIManager queue
 */
HIPPY_EXTERN dispatch_queue_t HippyGetUIManagerQueue(void);

/**
 * Default name for the UIManager queue
 */
HIPPY_EXTERN const char *HippyUIManagerQueueName;

/**
 * Posted right before re-render happens. This is a chance for views to invalidate their state so
 * next render cycle will pick up updated views and layout appropriately.
 */
HIPPY_EXTERN NSString *const HippyUIManagerWillUpdateViewsDueToContentSizeMultiplierChangeNotification;

/**
 * Posted whenever a new root view is registered with HippyUIManager. The userInfo property
 * will contain a HippyUIManagerRootViewKey with the registered root view.
 */
HIPPY_EXTERN NSString *const HippyUIManagerDidRegisterRootViewNotification;

/**
 * Posted whenever a root view is removed from the HippyUIManager. The userInfo property
 * will contain a HippyUIManagerRootViewKey with the removed root view.
 */
HIPPY_EXTERN NSString *const HippyUIManagerDidRemoveRootViewNotification;

/**
 * Key for the root view property in the above notifications
 */
HIPPY_EXTERN NSString *const HippyUIManagerRootViewKey;

/**
 * Posted whenever endBatch is called
 */
HIPPY_EXTERN NSString *const HippyUIManagerDidEndBatchNotification;

@protocol HippyScrollableProtocol;

/**
 * The HippyUIManager is the module responsible for updating the view hierarchy.
 */

@interface HippyUIManager : NSObject <HippyBridgeModule, HippyInvalidating>


/**
 * Register a root view with the HippyUIManager.
 */
- (void)registerRootView:(UIView *)rootView withSizeFlexibility:(HippyRootViewSizeFlexibility)sizeFlexibility;

/**
 * Gets the view associated with a hippyTag.
 */
- (UIView *)viewForHippyTag:(NSNumber *)hippyTag;

/**
 * Gets the node associated with a hippyTag.
 */
- (HippyVirtualNode *)nodeForHippyTag:(NSNumber *)hippyTag;

/**
 * Update the frame of a view. This might be in response to a screen rotation
 * or some other layout event outside of the Hippy-managed view hierarchy.
 */
- (void)setFrame:(CGRect)frame forView:(UIView *)view;

/**
 * Set the natural size of a view, which is used when no explicit size is set.
 * Use UIViewNoIntrinsicMetric to ignore a dimension.
 */
- (void)setIntrinsicContentSize:(CGSize)size forView:(UIView *)view;

/**
 * Update the background color of a view. The source of truth for
 * backgroundColor is the shadow view, so if to update backgroundColor from
 * native code you will need to call this method.
 */
- (void)setBackgroundColor:(UIColor *)color forView:(UIView *)view;

/**
 * Schedule a block to be executed on the UI thread. Useful if you need to execute
 * view logic after all currently queued view updates have completed.
 */
- (void)addUIBlock:(HippyViewManagerUIBlock)block;

- (void)executeBlockOnUIManagerQueue:(dispatch_block_t)block;

/**
 * Given a hippyTag from a component, find its root view, if possible.
 * Otherwise, this will give back nil.
 *
 * @param hippyTag the component tag
 * @param completion the completion block that will hand over the rootView, if any.
 *
 */
- (void)rootViewForHippyTag:(NSNumber *)hippyTag withCompletion:(void (^)(UIView *view))completion;

/**
 * Get root view hippyTag
 */
- (NSNumber *)rootHippyTag;

/**
 * The view that is currently first responder, according to the JS context.
 */
+ (UIView *)JSResponder;

/**
 * Normally, UI changes are not applied until the complete batch of method
 * invocations from JavaScript to native has completed.
 *
 * Setting this to YES will flush UI changes sooner, which could potentially
 * result in inconsistent UI updates.
 *
 * The default is NO (recommended).
 */
@property (atomic, assign) BOOL unsafeFlushUIChangesBeforeBatchEnds;

/**
 * In some cases we might want to trigger layout from native side.
 * Hippy won't be aware of this, so we need to make sure it happens.
 */
- (void)setNeedsLayout;

- (UIView *)createViewFromNode:(HippyVirtualNode *)node;
- (UIView *)updateNode:(HippyVirtualNode *)oldNode withNode:(HippyVirtualNode *)node;

- (void)removeNativeNode:(HippyVirtualNode *)node;
- (void)removeNativeNodeView:(UIView *)nodeView;
- (void)updateViewsFromParams:(NSArray<HippyExtAnimationViewParams *> *)params completion:(HippyViewUpdateCompletedBlock)block;
- (void)updateViewWithHippyTag:(NSNumber *)hippyTag props:(NSDictionary *)pros;

- (void)setDomManager:(std::shared_ptr<hippy::DomManager>)domManager;

- (std::shared_ptr<hippy::DomManager>)domManager;

- (void)renderCreateView:(int32_t)hippyTag
                viewName:(const std::string &)name
                 rootTag:(int32_t)rootTag
                 tagName:(const std::string &)tagName
                   frame:(CGRect)frame
                   props:(const std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>> &)styleMap;
- (void)createRenderNodes:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes;
- (void)renderUpdateView:(int32_t)hippyTag
                viewName:(const std::string &)name
                   props:(const std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>> &)styleMap;
- (void)updateRenderNodes:(std::vector<std::shared_ptr<hippy::DomNode>>&&)nodes;
- (void)renderDeleteViewFromContainer:(int32_t)hippyTag
                           forIndices:(const std::vector<int32_t> &)indices;

- (void)renderMoveViews:(const std::vector<int32_t> &)ids fromContainer:(int32_t)fromContainer toContainer:(int32_t)toContainer;

- (void)renderNodesUpdateLayout:(const std::vector<std::shared_ptr<hippy::DomNode>> &)nodes;

- (void)batch;

- (void)dispatchFunction:(const std::string &)functionName
                viewName:(const std::string &)viewName
                 viewTag:(int32_t)hippyTag
                  params:(const tdf::base::DomValue &)params
                callback:(hippy::CallFunctionCallback)cb;

- (void)addEventName:(const std::string &)name forDomNode:(std::weak_ptr<hippy::DomNode>)weak_node;

- (void)removeEventName:(const std::string &)eventName forDomNode:(std::weak_ptr<hippy::DomNode>)weak_node;

@end

/**
 * This category makes the current HippyUIManager instance available via the
 * HippyBridge, which is useful for HippyBridgeModules or HippyViewManagers that
 * need to access the HippyUIManager.
 */
@interface HippyBridge (HippyUIManager)

@property (nonatomic, readonly) HippyUIManager *uiManager;

@end
