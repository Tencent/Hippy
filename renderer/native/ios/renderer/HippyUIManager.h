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
#include <memory>
#include <unordered_map>
#include <functional>

@class NativeRenderAnimationViewParams, HippyShadowView, HippyUIManager,HippyViewManager;
@class NativeRenderReusePool, HippyComponentMap;

class VFSUriLoader;
namespace hippy {
inline namespace dom {
class RenderManager;
class DomManager;
class DomArgument;
class RootNode;
class DomNode;
struct LayoutResult;
using CallFunctionCallback = std::function<void(std::shared_ptr<DomArgument>)>;
}
}

namespace footstone {
inline namespace value {
class HippyValue;
}
}

@protocol HippyImageProviderProtocol;

/**
 * The NativeRenderUIManager is the module responsible for updating the view hierarchy.
 */
@interface HippyUIManager : NSObject <HippyInvalidating>

- (instancetype)init NS_UNAVAILABLE;

- (instancetype)initWithRenderManager:(std::weak_ptr<hippy::RenderManager>)renderManager NS_DESIGNATED_INITIALIZER;

@property(nonatomic, assign) BOOL uiCreationLazilyEnabled;

@property (nonatomic, weak) HippyBridge *bridge;
@property (nonatomic, assign) std::weak_ptr<VFSUriLoader> VFSUriLoader;
@property (nonatomic, assign) std::weak_ptr<hippy::RenderManager> renderManager;
@property (nonatomic, readonly) std::weak_ptr<hippy::DomManager> domManager;
@property (nonatomic, readonly) HippyComponentMap *viewRegistry;

/**
 * Gets the view associated with a hippyTag.
 */
- (UIView *)viewForComponentTag:(NSNumber *)componentTag
                      onRootTag:(NSNumber *)rootTag;


/**
 * Get the shadow view associated with a hippyTag
 */
- (HippyShadowView *)renderObjectForcomponentTag:(NSNumber *)componentTag
                                          onRootTag:(NSNumber *)rootTag;

/**
 * Update the frame of a view. This might be in response to a screen rotation
 * or some other layout event outside of the Hippy-managed view hierarchy.
 */
- (void)setFrame:(CGRect)frame forRootView:(UIView *)view;

/**
 * Schedule a block to be executed on the UI thread. Useful if you need to execute
 * view logic after all currently queued view updates have completed.
 */
- (void)addUIBlock:(HippyViewManagerUIBlock)block;

/**
 * In some cases we might want to trigger layout from native side.
 * Hippy won't be aware of this, so we need to make sure it happens.
 */
- (void)setNeedsLayoutForRootNodeTag:(NSNumber *)tag;

- (void)registerRootView:(UIView *)rootView asRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

- (void)unregisterRootViewFromTag:(NSNumber *)rootTag;

- (NSArray<__kindof UIView *> *)rootViews;

- (__kindof UIView *)viewFromRenderViewTag:(NSNumber *)componentTag onRootTag:(NSNumber *)rootTag;

- (void)purgeViewsFromComponentTags:(NSArray<NSNumber *> *)componentTag onRootTag:(NSNumber *)rootTag;

- (void)updateView:(NSNumber *)componentTag onRootTag:(NSNumber *)rootTag props:(NSDictionary *)pros;

- (__kindof HippyViewManager *)renderViewManagerForViewName:(NSString *)viewName;

/**
 * Manully create views recursively from hippy tag
 *
 * @param hippyTag hippy tag corresponding to UIView
 * @return view created by hippy tag
 */
- (UIView *)createViewRecursivelyFromcomponentTag:(NSNumber *)hippyTag
                                        onRootTag:(NSNumber *)rootTag;

/**
 * Manully create views recursively from renderObject
 *
 * @param renderObject HippyShadowView corresponding to UIView
 * @return view created by HippyShadowView
 */
- (UIView *)createViewRecursivelyFromRenderObject:(HippyShadowView *)renderObject;

/**
 * set dom manager for NativeRenderUIManager which holds a weak reference to domManager
 */
- (void)setDomManager:(std::weak_ptr<hippy::DomManager>)domManager;

/**
 *  create views from dom nodes
 *  @param nodes A set of nodes for creating views
 */
- (void)createRenderNodes:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes
               onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 *  update views' properties from dom nodes
 *  @param nodes A set of nodes for updating views' properties
 */
- (void)updateRenderNodes:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes
               onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 *  delete views from dom nodes
 *  @param nodes nodes to delete
 */
- (void)deleteRenderNodesIds:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes
                  onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * move views from container to another container
 *
 * @param ids A set of nodes id to move
 * @param fromContainer Source view container from which views move
 * @param toContainer Target view container to which views move
 */
- (void)renderMoveViews:(const std::vector<int32_t> &&)ids
          fromContainer:(int32_t)fromContainer
            toContainer:(int32_t)toContainer
                  index:(int32_t)index
             onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

- (void)renderMoveNodes:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes
             onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;
/**
 * update layout for view
 *
 * @param layoutInfos Vector for nodes layout infos
 */
- (void)updateNodesLayout:(const std::vector<std::tuple<int32_t, hippy::LayoutResult>> &)layoutInfos
               onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * Invoked after batched operations completed
 */
- (void)batchOnRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * call function of view
 *
 * @param functionName Function Name to be invoked
 * @param viewName Name of target view whose function invokes
 * @param hippyTag id of target view whose function invokes
 * @param params parameters of function to be invoked
 * @param cb A callback for the return value of function
 *
 * @result Function return result
 */
- (id)dispatchFunction:(const std::string &)functionName
              viewName:(const std::string &)viewName
               viewTag:(int32_t)hippyTag
            onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode
                params:(const footstone::value::HippyValue &)params
              callback:(hippy::CallFunctionCallback)cb;

- (void)registerExtraComponent:(NSArray<Class> *)extraComponents;

/**
 * register event for specific view
 *
 * @param name event name
 * @param node_id id for node for the event
 */
- (void)addEventName:(const std::string &)name
        forDomNodeId:(int32_t)node_id
          onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * unregister event for specific view
 *
 * @param name event name
 * @param node_id node id for the event
 */
- (void)removeEventName:(const std::string &)name
           forDomNodeId:(int32_t)node_id
             onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * unregister vsync event
 */
- (void)removeVSyncEventOnRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * Set root view size changed event callback
 *
 *@param cb callback
 */
- (void)setRootViewSizeChangedEvent:(std::function<void(int32_t rootTag, NSDictionary *)>)cb;

/**
 * clear all resources
 */
- (void)invalidate;

#if HIPPY_DEBUG
@property(nonatomic, assign) std::unordered_map<int32_t, std::unordered_map<int32_t, std::shared_ptr<hippy::DomNode>>> domNodesMap;
- (std::shared_ptr<hippy::DomNode>)domNodeForTag:(int32_t)dom_tag onRootNode:(int32_t)root_tag;
- (std::vector<std::shared_ptr<hippy::DomNode>>)childrenForNodeTag:(int32_t)tag onRootNode:(int32_t)root_tag;
#endif

@end


/**
 * This category makes the current HippyUIManager instance available via the
 * HippyBridge, which is useful for HippyBridgeModules or HippyViewManagers that
 * need to access the HippyUIManager.
 */
@interface HippyBridge (HippyUIManager)

/// The current HippyUIManager instance
@property (nonatomic, readonly) HippyUIManager *uiManager;

@end
