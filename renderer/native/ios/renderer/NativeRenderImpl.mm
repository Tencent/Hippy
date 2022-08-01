/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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

#import "NativeRenderImpl.h"

#import <AVFoundation/AVFoundation.h>
#import "NativeRenderAnimationType.h"
#import "NativeRenderComponentProtocol.h"
#import "NativeRenderComponentData.h"
#import "NativeRenderConvert.h"
#import "NativeRenderObjectRootView.h"
#import "NativeRenderObjectView.h"
#import "NativeRenderUtils.h"
#import "NativeRenderView.h"
#import "NativeRenderViewManager.h"
#import "UIView+NativeRender.h"
#import "OCTypeToDomArgument.h"
#import "UIView+DomEvent.h"
#import "objc/runtime.h"
#import "UIView+Render.h"
#import "NativeRenderErrorHandler.h"
#import "RenderVsyncManager.h"
#include <mutex>
#import "NativeRenderComponentMap.h"
#import "dom/root_node.h"

using HippyValue = footstone::value::HippyValue;
using DomArgument = hippy::dom::DomArgument;
using DomManager = hippy::DomManager;
using DomNode = hippy::DomNode;
using LayoutResult = hippy::LayoutResult;
using DomValueType = footstone::value::HippyValue::Type;
using DomValueNumberType = footstone::value::HippyValue::NumberType;
using LayoutResult = hippy::LayoutResult;
using RenderInfo = hippy::DomNode::RenderInfo;
using CallFunctionCallback = hippy::CallFunctionCallback;
using DomEvent = hippy::DomEvent;
using RootNode = hippy::RootNode;

using HPViewBinding = std::unordered_map<int32_t, std::tuple<std::vector<int32_t>, std::vector<int32_t>>>;

constexpr char kVSyncKey[] = "frameupdate";

@interface NativeRenderViewsRelation : NSObject {
    HPViewBinding _viewRelation;

}

- (void)addViewTag:(int32_t)viewTag forSuperViewTag:(int32_t)superviewTag atIndex:(int32_t)index;

- (void)enumerateViewsRelation:(void (^)(NSNumber *, NSArray<NSNumber *> *, NSArray<NSNumber *> *))block;

- (void)removeAllObjects;

@end

@implementation NativeRenderViewsRelation

- (void)addViewTag:(int32_t)viewTag forSuperViewTag:(int32_t)superviewTag atIndex:(int32_t)index {
    if (superviewTag) {
        auto &viewTuple = _viewRelation[superviewTag];
        auto &subviewTagTuple = std::get<0>(viewTuple);
        auto &subviewIndexTuple = std::get<1>(viewTuple);
        subviewTagTuple.push_back(viewTag);
        subviewIndexTuple.push_back(index);
    }
}

- (void)enumerateViewsRelation:(void (^)(NSNumber *, NSArray<NSNumber *> *, NSArray<NSNumber *> *))block {
    //using HPViewBinding = std::unordered_map<int32_t, std::tuple<std::vector<int32_t>, std::vector<int32_t>>>;
    for (const auto &element : _viewRelation) {
        NSNumber *superviewTag = @(element.first);
        const auto &subviewTuple = element.second;
        const auto &subviewTags = std::get<0>(subviewTuple);
        NSMutableArray<NSNumber *> *subviewTagsArray = [NSMutableArray arrayWithCapacity:subviewTags.size()];
        for (const auto &subviewTag : subviewTags) {
            [subviewTagsArray addObject:@(subviewTag)];
        }
        const auto &subviewIndex = std::get<1>(subviewTuple);
        NSMutableArray<NSNumber *> *subviewIndexArray = [NSMutableArray arrayWithCapacity:subviewIndex.size()];
        for (const auto &subviewIndex : subviewIndex) {
            [subviewIndexArray addObject:@(subviewIndex)];
        }
        block(superviewTag, [subviewTagsArray copy], [subviewIndexArray copy]);
    }
}

- (void)enumerateViewsHierarchy:(void (^)(int32_t , const std::vector<int32_t> &, const std::vector<int32_t> &))block {
    for (const auto &element : _viewRelation) {
        int32_t tag = element.first;
        const auto &subviewTuple = element.second;
        const auto &subviewTags = std::get<0>(subviewTuple);
        const auto &subviewIndex = std::get<1>(subviewTuple);
        block(tag, subviewTags, subviewIndex);
    }
}

- (void)removeAllObjects {
    _viewRelation.clear();
}

@end

static void NativeRenderTraverseViewNodes(id<NativeRenderComponentProtocol> view, void (^block)(id<NativeRenderComponentProtocol>)) {
    if (view.componentTag) {
        block(view);
        for (id<NativeRenderComponentProtocol> subview in view.nativeRenderSubviews) {
            NativeRenderTraverseViewNodes(subview, block);
        }
    }
}

#define AssertMainQueue() NSAssert(NativeRenderIsMainQueue(), @"This function must be called on the main thread")

NSString *const NativeRenderUIManagerDidRegisterRootViewNotification = @"NativeRenderUIManagerDidRegisterRootViewNotification";
NSString *const NativeRenderUIManagerRootViewTagKey = @"NativeRenderUIManagerRootViewKey";
NSString *const NativeRenderUIManagerKey = @"NativeRenderUIManagerKey";
NSString *const NativeRenderUIManagerDidEndBatchNotification = @"NativeRenderUIManagerDidEndBatchNotification";

@interface NativeRenderImpl() {
    NSMutableArray<NativeRenderRenderUIBlock> *_pendingUIBlocks;

    NativeRenderComponentMap *_renderObjectRegistry;
    NativeRenderComponentMap *_viewRegistry;

    // Keyed by viewName
    NSMutableDictionary<NSString *, NativeRenderComponentData *> *_componentDataByName;

    NSMutableSet<id<NativeRenderComponentProtocol>> *_componentTransactionListeners;

    std::weak_ptr<DomManager> _domManager;
    std::mutex _renderQueueLock;
    NSMutableDictionary<NSString *, id> *_viewManagers;
    NSDictionary<NSString *, Class> *_extraComponent;
}

@end

@implementation NativeRenderImpl

@synthesize frameworkProxy = _frameworkProxy;
@synthesize domManager = _domManager;

#pragma mark Life cycle

- (instancetype)init {
    self = [super init];
    if (self) {
        [self initContext];
    }
    return self;
}

- (void)dealloc {
}

- (void)initContext {
    _renderObjectRegistry = [[NativeRenderComponentMap alloc] init];
    _viewRegistry = [[NativeRenderComponentMap alloc] init];
    _viewRegistry.requireInMainThread = YES;
    _pendingUIBlocks = [NSMutableArray new];
    _componentTransactionListeners = [NSMutableSet new];
    _componentDataByName = [NSMutableDictionary dictionaryWithCapacity:64];
}

- (void)invalidate {
    _pendingUIBlocks = nil;
    __weak __typeof(self) weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        NativeRenderImpl *strongSelf = weakSelf;
        if (strongSelf) {
            strongSelf->_viewRegistry = nil;
            strongSelf->_componentTransactionListeners = nil;
            [[NSNotificationCenter defaultCenter] removeObserver:strongSelf];
        }
    });
}

#pragma mark Setter & Getter

- (void)setDomManager:(std::weak_ptr<DomManager>)domManager {
    _domManager = domManager;
}

- (std::weak_ptr<DomManager>)domManager {
    return _domManager;
}

- (void)domNodeForComponentTag:(int32_t)componentTag
                onRootNode:(std::weak_ptr<RootNode>)rootNode
                resultNode:(void (^)(std::shared_ptr<DomNode>))resultBlock {
    if (resultBlock) {
        auto domManager = _domManager.lock();
        if (domManager) {
            std::vector<std::function<void()>> ops_ = {[componentTag, rootNode, domManager, resultBlock](){
                @autoreleasepool {
                    auto node = domManager->GetNode(rootNode, componentTag);
                    resultBlock(node);
                }
            }};
            domManager->PostTask(hippy::dom::Scene(std::move(ops_)));
        }
    }
}

- (NativeRenderComponentMap *)renderObjectRegistry {
     if (!_renderObjectRegistry) {
        _renderObjectRegistry = [[NativeRenderComponentMap alloc] init];
     }
     return _renderObjectRegistry;
 }

- (NativeRenderComponentMap *)viewRegistry {
     if (!_viewRegistry) {
        _viewRegistry = [[NativeRenderComponentMap alloc] init];
     }
    return _viewRegistry;
 }

- (__kindof UIView *)viewFromRenderViewTag:(NSNumber *)componentTag
                                 onRootTag:(NSNumber *)rootTag {
    return [self viewForComponentTag:componentTag onRootTag:rootTag];
}

- (UIView *)viewForComponentTag:(NSNumber *)componentTag
                  onRootTag:(NSNumber *)rootTag {
    AssertMainQueue();
    return [_viewRegistry componentForTag:componentTag onRootTag:rootTag];
}

- (NativeRenderObjectView *)renderObjectForcomponentTag:(NSNumber *)componentTag
                                          onRootTag:(NSNumber *)rootTag {
    return [_renderObjectRegistry componentForTag:componentTag onRootTag:rootTag];
}

- (std::mutex &)renderQueueLock {
    return _renderQueueLock;
}

#pragma mark -
#pragma mark View Manager
- (NativeRenderComponentData *)componentDataForViewName:(NSString *)viewName {
    if (viewName) {
        NativeRenderComponentData *componentData = _componentDataByName[viewName];
        if (!componentData) {
            NativeRenderViewManager *viewManager = [self renderViewManagerForViewName:viewName];
            NSAssert(viewManager, @"No view manager found for %@", viewName);
            if (viewManager) {
                componentData = [[NativeRenderComponentData alloc] initWithViewManager:viewManager viewName:viewName];
                _componentDataByName[viewName] = componentData;
            }
        }
        return componentData;
    }
    return nil;
}

- (void)registerRootView:(UIView *)rootView asRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();

    NSNumber *componentTag = rootView.componentTag;
    NSAssert(NativeRenderIsRootView(componentTag), @"View %@ with tag #%@ is not a root view", rootView, componentTag);

#if NATIVE_RENDER_DEBUG
    NSAssert(![_viewRegistry containRootComponentWithTag:componentTag], @"RootView Tag already exists. Added %@ twice", componentTag);
#endif
    // Register view
    [_viewRegistry addRootComponent:rootView rootNode:rootNode forTag:componentTag];

    CGRect frame = rootView.frame;

    UIColor *backgroundColor = [rootView backgroundColor];
    NSString *rootViewClassName = NSStringFromClass([rootView class]);
    // Register shadow view
    __weak NativeRenderImpl *weakSelf = self;
    std::function<void()> registerRootViewFunction = [weakSelf, componentTag, frame, backgroundColor, rootViewClassName, rootNode](){
        @autoreleasepool {
            NativeRenderImpl *strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            std::lock_guard<std::mutex> lock([strongSelf renderQueueLock]);
            NativeRenderObjectRootView *renderObject = [[NativeRenderObjectRootView alloc] init];
            renderObject.componentTag = componentTag;
            renderObject.frame = frame;
            renderObject.backgroundColor = backgroundColor;
            renderObject.viewName = rootViewClassName;
            [strongSelf->_renderObjectRegistry addRootComponent:renderObject rootNode:rootNode forTag:componentTag];
            NSDictionary *userInfo = @{ NativeRenderUIManagerRootViewTagKey: componentTag,
                                        NativeRenderUIManagerKey: strongSelf};
            [[NSNotificationCenter defaultCenter] postNotificationName:NativeRenderUIManagerDidRegisterRootViewNotification
                                                                object:nil
                                                              userInfo:userInfo];
        }
    };
    auto domManager = self.domManager.lock();
    if (domManager) {
        domManager->PostTask(hippy::Scene({registerRootViewFunction}));
    }
    else {
        registerRootViewFunction();
    }
}


- (void)setFrame:(CGRect)frame forRootView:(UIView *)view {
    AssertMainQueue();
    NSNumber *componentTag = view.componentTag;
    auto domManager = _domManager.lock();
    if (!domManager) {
        return;
    }
    __weak id weakSelf = self;
    std::vector<std::function<void()>> ops_ = {[componentTag, weakSelf, frame]() {
        if (!weakSelf) {
            return;
        }
        NativeRenderImpl *strongSelf = weakSelf;
        NativeRenderObjectView *renderObject = [strongSelf->_renderObjectRegistry rootComponentForTag:componentTag];
        if (renderObject == nil) {
            return;
        }
        if (!CGRectEqualToRect(frame, renderObject.frame)) {
            renderObject.frame = frame;
            std::weak_ptr<RootNode> rootNode = [strongSelf->_renderObjectRegistry rootNodeForTag:componentTag];
            [strongSelf batchOnRootNode:rootNode];
        }
    }};
    domManager->PostTask(hippy::dom::Scene(std::move(ops_)));
}

/**
 * Unregisters views from registries
 */
- (void)purgeChildren:(NSArray<id<NativeRenderComponentProtocol>> *)children
            onRootTag:(NSNumber *)rootTag
         fromRegistry:(NativeRenderComponentMap *)componentMap {
    NSMutableDictionary<NSNumber *, __kindof id<NativeRenderComponentProtocol>> *registry = [componentMap componentsForRootTag:rootTag];
    for (id<NativeRenderComponentProtocol> child in children) {
        NativeRenderTraverseViewNodes(registry[child.componentTag], ^(id<NativeRenderComponentProtocol> subview) {
            NSAssert(![subview isNativeRenderRootView], @"Root views should not be unregistered");
            if ([subview conformsToProtocol:@protocol(NativeRenderInvalidating)]) {
                [(id<NativeRenderInvalidating>)subview invalidate];
            }
            [registry removeObjectForKey:subview.componentTag];
            if (registry == (NSMutableDictionary<NSNumber *, id<NativeRenderComponentProtocol>> *)self->_viewRegistry) {
                [self->_componentTransactionListeners removeObject:subview];
            }
        });
    }
}

- (void)purgeViewsFromComponentTags:(NSArray<NSNumber *> *)componentTags onRootTag:(NSNumber *)rootTag {
    for (NSNumber *componentTag in componentTags) {
        UIView *view = [self viewForComponentTag:componentTag onRootTag:rootTag];
        NativeRenderComponentMap *componentMap = _viewRegistry;
        NativeRenderTraverseViewNodes(view, ^(id<NativeRenderComponentProtocol> subview) {
            NSAssert(![subview isNativeRenderRootView], @"Root views should not be unregistered");
            [componentMap removeComponent:subview forRootTag:rootTag];
        });
    }
}

- (void)purgeChildren:(NSArray<id<NativeRenderComponentProtocol>> *)children fromRegistry:(NSMutableDictionary<NSNumber *, id<NativeRenderComponentProtocol>> *)registry {
    for (id<NativeRenderComponentProtocol> child in children) {
        NativeRenderTraverseViewNodes(registry[child.componentTag], ^(id<NativeRenderComponentProtocol> subview) {
            NSAssert(![subview isNativeRenderRootView], @"Root views should not be unregistered");
            if ([subview conformsToProtocol:@protocol(NativeRenderInvalidating)]) {
                //TODO NativeRenderInvalidating belong to hippy, remove it
                [(id<NativeRenderInvalidating>)subview invalidate];
            }
            [registry removeObjectForKey:subview.componentTag];
            if (registry == (NSMutableDictionary<NSNumber *, id<NativeRenderComponentProtocol>> *)self->_viewRegistry) {
                [self->_componentTransactionListeners removeObject:subview];
            }
        });
    }
}

- (void)removeChildren:(NSArray<id<NativeRenderComponentProtocol>> *)children fromContainer:(id<NativeRenderComponentProtocol>)container {
    for (id<NativeRenderComponentProtocol> removedChild in children) {
        [container removeNativeRenderSubview:removedChild];
    }
}

- (UIView *)createViewRecursivelyFromcomponentTag:(NSNumber *)componentTag
                                    onRootTag:(NSNumber *)rootTag {
    NativeRenderObjectView *renderObject = [_renderObjectRegistry componentForTag:componentTag onRootTag:rootTag];
    return [self createViewRecursivelyFromRenderObject:renderObject];
}

- (UIView *)createViewFromRenderObject:(NativeRenderObjectView *)renderObject {
    AssertMainQueue();
    NativeRenderComponentData *componentData = [self componentDataForViewName:renderObject.viewName];
    UIView *view = [self createViewByComponentData:componentData
                                          componentTag:renderObject.componentTag
                                           rootTag:renderObject.rootTag
                                        properties:renderObject.props
                                          viewName:renderObject.viewName];
    view.renderContext = self;
    [view nativeRenderSetFrame:renderObject.frame];
    const std::vector<std::string> &eventNames = [renderObject allEventNames];
    for (auto &event : eventNames) {
        [self addEventNameInMainThread:event
                          forDomNodeId:[renderObject.componentTag intValue]
                            onRootNode:renderObject.rootNode];
    }
    return view;
}

- (UIView *)createViewRecursivelyFromRenderObject:(NativeRenderObjectView *)renderObject {
    AssertMainQueue();
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    [renderObject dirtyDescendantPropagation];
    return [self createViewRecursiveFromRenderObjectWithNOLock:renderObject];
}

- (UIView *)createViewRecursiveFromRenderObjectWithNOLock:(NativeRenderObjectView *)renderObject {
    UIView *view = [self createViewFromRenderObject:renderObject];
    NSUInteger index = 0;
    for (NativeRenderObjectView *subRenderObject in renderObject.nativeRenderSubviews) {
        UIView *subview = [self createViewRecursiveFromRenderObjectWithNOLock:subRenderObject];
        [view insertNativeRenderSubview:subview atIndex:index];
        index++;
    }
    view.nativeRenderObjectView = renderObject;
    view.renderContext = self;
    [view clearSortedSubviews];
    [view didUpdateNativeRenderSubviews];
    NSMutableSet<NativeRenderApplierBlock> *applierBlocks = [NSMutableSet setWithCapacity:1];
    [renderObject collectUpdatedProperties:applierBlocks parentProperties:@{}];
    if (applierBlocks.count) {
        NSDictionary<NSNumber *, UIView *> *viewRegistry =
            [_viewRegistry componentsForRootTag:renderObject.rootTag];
        for (NativeRenderApplierBlock block in applierBlocks) {
            block(viewRegistry);
        }
    }
    return view;
}

- (NSDictionary *)createRenderObjectFromNode:(const std::shared_ptr<hippy::DomNode> &)domNode
                                  onRootNode:(std::weak_ptr<RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode || !domNode) {
        return @{};
    }
    int32_t root_id = strongRootNode->GetId();
    NSNumber *rootTag = @(root_id);
    NSNumber *componentTag = @(domNode->GetId());
    NSString *viewName = [NSString stringWithUTF8String:domNode->GetViewName().c_str()];
    NSString *tagName = [NSString stringWithUTF8String:domNode->GetTagName().c_str()];
    NSMutableDictionary *props = [stylesFromDomNode(domNode) mutableCopy];
    NativeRenderComponentData *componentData = [self componentDataForViewName:viewName];
    NativeRenderObjectView *renderObject = [componentData createRenderObjectViewWithTag:componentTag];
    renderObject.rootNode = rootNode;
    NSAssert(componentData && renderObject, @"componentData and renderObject must not be nil");
    [props setValue: rootTag forKey: @"rootTag"];
    // Register shadow view
    if (renderObject) {
        renderObject.componentTag = componentTag;
        renderObject.rootTag = rootTag;
        renderObject.viewName = viewName;
        renderObject.tagName = tagName;
        renderObject.props = props;
        renderObject.domManager = _domManager;
        renderObject.nodeLayoutResult = domNode->GetLayoutResult();
        renderObject.frame = CGRectMakeFromLayoutResult(domNode->GetLayoutResult());
        [componentData setProps:props forRenderObjectView:renderObject];
        [_renderObjectRegistry addComponent:renderObject forRootTag:rootTag];
    }
    return props;
}

- (UIView *)createViewByComponentData:(NativeRenderComponentData *)componentData
                             componentTag:(NSNumber *)componentTag
                              rootTag:(NSNumber *)rootTag
                           properties:(NSDictionary *)props
                             viewName:(NSString *)viewName {
    UIView *view = [self viewForComponentTag:componentTag onRootTag:rootTag];
    BOOL canBeRetrievedFromCache = YES;
    if (view && [view respondsToSelector:@selector(canBeRetrievedFromViewCache)]) {
        canBeRetrievedFromCache = [view canBeRetrievedFromViewCache];
    }

    /**
     * subviews & hippySubviews should be removed from the view which we get from cache(_viewRegistry).
     * otherwise hippySubviews will be inserted multiple times.
     */
    if (view && canBeRetrievedFromCache) {
        [view resetNativeRenderSubviews];
    }
    else {
        view = [componentData createViewWithTag:componentTag initProps:props];
    }
    if (view) {
        view.viewName = viewName;
        view.rootTag = rootTag;
        view.renderContext = self;
        [componentData setProps:props forView:view];  // Must be done before bgColor to prevent wrong default

        if ([view respondsToSelector:@selector(nativeRenderComponentDidFinishTransaction)]) {
            [self->_componentTransactionListeners addObject:view];
        }
        [_viewRegistry addComponent:view forRootTag:rootTag];
    }
    return view;
}

- (void)updateView:(nonnull NSNumber *)componentTag
         onRootTag:(NSNumber *)rootTag
             props:(NSDictionary *)props {
    NativeRenderObjectView *renderObject = [_renderObjectRegistry componentForTag:componentTag onRootTag:rootTag];
    if (!renderObject) {
        return;
    }
    NativeRenderComponentData *componentData = [self componentDataForViewName:renderObject.viewName];
    NSDictionary *newProps = props;
    NSDictionary *virtualProps = props;
    if (renderObject) {
        newProps = [renderObject mergeProps:props];
        virtualProps = renderObject.props;
        [componentData setProps:newProps forRenderObjectView:renderObject];
        [renderObject dirtyPropagation];
    }
    [self addUIBlock:^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[componentTag];
        [componentData setProps:newProps forView:view];
    }];
}

#pragma mark Render Context Implementation
#define Init(Component) NSClassFromString(@#Component)
- (__kindof NativeRenderViewManager *)renderViewManagerForViewName:(NSString *)viewName {
    if (!_viewManagers) {
        _viewManagers = [@{@"View": Init(NativeRenderViewManager),
                          @"WaterfallItem": Init(NativeRenderWaterfallItemViewManager),
                          @"WaterfallView": Init(NativeRenderWaterfallViewManager),
                          @"PullFooterView": Init(NativeRenderFooterRefreshManager),
                          @"PullHeaderView": Init(NativeRenderHeaderRefreshManager),
                          @"ScrollView": Init(NativeRenderScrollViewManager),
                          @"RefreshWrapperItemView": Init(NativeRenderRefreshWrapperItemViewManager),
                          @"RefreshWrapper": Init(NativeRenderRefreshWrapperViewManager),
                          @"ViewPager": Init(NativeRenderViewPagerManager),
                          @"ViewPagerItem": Init(NativeRenderViewPagerItemManager),
                          @"TextInput": Init(NativeRenderTextViewManager),
                          @"WebView": Init(NativeRenderSimpleWebViewManager),
                          @"Image": Init(NativeRenderImageViewManager),
                          @"ListViewItem": Init(NativeRenderBaseListItemViewManager),
                          @"ListView": Init(NativeRenderBaseListViewManager),
                          @"SmartViewPager": Init(NativeRenderSmartViewPagerViewManager),
                          @"Navigator": Init(NativeRenderNavigatorViewManager),
                          @"Text": Init(NativeRenderTextManager),
                          @"Modal": Init(NativeRenderModalHostViewManager)
                 } mutableCopy];
        if (_extraComponent) {
            [_viewManagers addEntriesFromDictionary:_extraComponent];
            _extraComponent = nil;
        }
    }
    id object = [_viewManagers objectForKey:viewName];
    if (object_isClass(object)) {
        NativeRenderViewManager *viewManager = [object new];
        viewManager.renderContext = self;
        NSAssert([viewManager isKindOfClass:[NativeRenderViewManager class]], @"It must be a NativeRenderViewManager instance");
        [_viewManagers setObject:viewManager forKey:viewName];
        object = viewManager;
    }
    return object;
}

#pragma mark Schedule Block

- (void)addUIBlock:(NativeRenderRenderUIBlock)block {
    if (!block || !_viewRegistry) {
        return;
    }

    [_pendingUIBlocks addObject:block];
}

- (void)amendPendingUIBlocksWithStylePropagationUpdateForRenderObject:(NativeRenderObjectView *)topView {
    NSMutableSet<NativeRenderApplierBlock> *applierBlocks = [NSMutableSet setWithCapacity:1];

    [topView collectUpdatedProperties:applierBlocks parentProperties:@{}];
    if (applierBlocks.count) {
        [self addUIBlock:^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
            for (NativeRenderApplierBlock block in applierBlocks) {
                block(viewRegistry);
            }
        }];
    }
}

- (void)flushUIBlocksOnRootNode:(std::weak_ptr<RootNode>)rootNode {
    // First copy the previous blocks into a temporary variable, then reset the
    // pending blocks to a new array. This guards against mutation while
    // processing the pending blocks in another thread.
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t rootTag = strongRootNode->GetId();
    NSArray<NativeRenderRenderUIBlock> *previousPendingUIBlocks = _pendingUIBlocks;
    _pendingUIBlocks = [NSMutableArray new];
    __weak NativeRenderImpl *weakManager = self;
    if (previousPendingUIBlocks.count) {
        // Execute the previously queued UI blocks
        dispatch_async(dispatch_get_main_queue(), ^{
            if (weakManager) {
                NativeRenderImpl *strongSelf = weakManager;
                NSDictionary<NSNumber *, UIView *> *viewReg =
                    [strongSelf->_viewRegistry componentsForRootTag:@(rootTag)];
                @try {
                    for (NativeRenderRenderUIBlock block in previousPendingUIBlocks) {
                        block(strongSelf, viewReg);
                    }
                } @catch (NSException *exception) {
                }
            }
        });
    }
}

#pragma mark -
#pragma mark View Render Manager

/**
 * When NativeRenderUIManager received command to create view by node, NativeRenderUIManager must get all new created view ordered by index, set frames,
 * then insert them into superview one by one.
 * Step:
 * 1.create shadow views;
 * 2.set shadow views hierarchy
 * 3.create views--some views arent created instantly, but created lazily, determined by hierarchy of shadow views
 * 4.set views hierarchy
 */
- (void)createRenderNodes:(std::vector<std::shared_ptr<DomNode>> &&)nodes
                onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    NSNumber *rootNodeTag = @(strongRootNode->GetId());
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    NativeRenderViewsRelation *manager = [[NativeRenderViewsRelation alloc] init];
    NSMutableDictionary *dicProps = [NSMutableDictionary dictionaryWithCapacity:nodes.size()];
    for (const std::shared_ptr<DomNode> &node : nodes) {
        const auto& render_info = node->GetRenderInfo();
        [manager addViewTag:render_info.id forSuperViewTag:render_info.pid atIndex:render_info.index];
        NSDictionary *nodeProps = [self createRenderObjectFromNode:node onRootNode:rootNode];
        [dicProps setObject:nodeProps forKey:@(node->GetId())];
    }
    [manager enumerateViewsHierarchy:^(int32_t tag, const std::vector<int32_t> &subviewTags, const std::vector<int32_t> &subviewIndices) {
        NSAssert(subviewTags.size() == subviewIndices.size(), @"subviewTags count must be equal to subviewIndices count");
        NativeRenderObjectView *superRenderObject = [self->_renderObjectRegistry componentForTag:@(tag) onRootTag:rootNodeTag];
        for (NSUInteger index = 0; index < subviewTags.size(); index++) {
            NativeRenderObjectView *subRenderObject = [self->_renderObjectRegistry componentForTag:@(subviewTags[index]) onRootTag:rootNodeTag];
            [superRenderObject insertNativeRenderSubview:subRenderObject atIndex:subviewIndices[index]];
        }
    }];
    for (const std::shared_ptr<DomNode> &node : nodes) {
        NSNumber *componentTag = @(node->GetId());
        NativeRenderObjectView *renderObject = [_renderObjectRegistry componentForTag:componentTag onRootTag:rootNodeTag];
        if (NativeRenderCreationTypeInstantly == [renderObject creationType] && !_uiCreationLazilyEnabled) {
            NSString *viewName = [NSString stringWithUTF8String:node->GetViewName().c_str()];
            NSDictionary *props = [dicProps objectForKey:@(node->GetId())];
            NativeRenderComponentData *componentData = [self componentDataForViewName:viewName];
            [self addUIBlock:^(id<NativeRenderContext> renderContext, __unused NSDictionary<NSNumber *,UIView *> *viewRegistry) {
                NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
                UIView *view = [uiManager createViewByComponentData:componentData componentTag:componentTag rootTag:rootNodeTag properties:props viewName:viewName];
                view.nativeRenderObjectView = renderObject;
                view.renderContext = renderContext;
            }];
        }
    }
    [manager enumerateViewsHierarchy:^(int32_t tag, const std::vector<int32_t> &subviewTags, const std::vector<int32_t> &subviewIndices) {
        auto subViewTags_ = subviewTags;
        auto subViewIndices_ = subviewIndices;
        NativeRenderObjectView *renderObject = [self->_renderObjectRegistry componentForTag:@(tag) onRootTag:rootNodeTag];
        if (NativeRenderCreationTypeInstantly == [renderObject creationType] && !self->_uiCreationLazilyEnabled) {
            [self addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                UIView *superView = viewRegistry[@(tag)];
                for (NSUInteger index = 0; index < subViewTags_.size(); index++) {
                    UIView *subview = viewRegistry[@(subViewTags_[index])];
                    [superView insertNativeRenderSubview:subview atIndex:subViewIndices_[index]];
                }
                [superView didUpdateNativeRenderSubviews];
            }];
        }
    }];
}

- (void)updateRenderNodes:(std::vector<std::shared_ptr<DomNode>>&&)nodes
               onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    NSNumber *rootTag = @(strongRootNode->GetId());
    for (const auto &node : nodes) {
        NSNumber *componentTag = @(node->GetRenderInfo().id);
        NSDictionary *styleProps = unorderedMapDomValueToDictionary(node->GetStyleMap());
        NSDictionary *extProps = unorderedMapDomValueToDictionary(node->GetExtStyle());
        NSMutableDictionary *props = [NSMutableDictionary dictionaryWithDictionary:styleProps];
        [props addEntriesFromDictionary:extProps];
        [self updateView:componentTag onRootTag:rootTag props:props];
    }
}

- (void)deleteRenderNodesIds:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes
                  onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    NSNumber *rootTag = @(strongRootNode->GetId());
    for (auto dom_node : nodes) {
        int32_t tag = dom_node->GetRenderInfo().id;
        NativeRenderObjectView *renderObject = [_renderObjectRegistry componentForTag:@(tag) onRootTag:rootTag];
        if (renderObject) {
            [renderObject removeFromNativeRenderSuperview];
            [self purgeChildren:@[renderObject] onRootTag:rootTag fromRegistry:_renderObjectRegistry];
        }
        __weak auto weakSelf = self;
        [self addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = viewRegistry[@(tag)];
            if (view) {
                [view removeFromNativeRenderSuperview];
                if (weakSelf) {
                    auto strongSelf = weakSelf;
                    [strongSelf purgeChildren:@[view] onRootTag:rootTag fromRegistry:strongSelf->_viewRegistry];
                }
            }
        }];
    }
}

- (void)renderMoveViews:(const std::vector<int32_t> &&)ids
          fromContainer:(int32_t)fromContainer
            toContainer:(int32_t)toContainer
             onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    NSAssert(NO, @"no implementation for this method");
}

- (void)updateNodesLayout:(const std::vector<std::tuple<int32_t, hippy::LayoutResult>> &)layoutInfos
               onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    NSNumber *rootTag = @(strongRootNode->GetId());
    for (auto &layoutInfoTuple : layoutInfos) {
        int32_t tag = std::get<0>(layoutInfoTuple);
        NSNumber *componentTag = @(tag);
        hippy::LayoutResult layoutResult = std::get<1>(layoutInfoTuple);
        CGRect frame = CGRectMakeFromLayoutResult(layoutResult);
        NativeRenderObjectView *renderObject = [_renderObjectRegistry componentForTag:componentTag onRootTag:rootTag];
        if (renderObject) {
            renderObject.frame = frame;
            [self addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                UIView *view = viewRegistry[componentTag];
                /* do not use frame directly, because shadow view's frame possibly changed manually in
                 * [NativeRenderObjectView collectRenderObjectHaveNewLayoutResults]
                 * This is a Wrong example:
                 * [view hippySetFrame:frame]
                 */
                [view nativeRenderSetFrame:renderObject.frame];
            }];
        }
    }
}

- (void)batchOnRootNode:(std::weak_ptr<RootNode>)rootNode {
    [self layoutAndMountOnRootNode:rootNode];
    auto strongRootNode = rootNode.lock();
    if (strongRootNode) {
        uint32_t rootNodeId = strongRootNode->GetId();
        NSDictionary *userInfo = @{NativeRenderUIManagerRootViewTagKey: @(rootNodeId)};
        [[NSNotificationCenter defaultCenter] postNotificationName:NativeRenderUIManagerDidEndBatchNotification
                                                            object:nil
                                                          userInfo:userInfo];
    }
}

- (id)dispatchFunction:(const std::string &)functionName
              viewName:(const std::string &)viewName
               viewTag:(int32_t)componentTag
            onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode
                params:(const HippyValue &)params
              callback:(CallFunctionCallback)cb {
    NSString *name = [NSString stringWithUTF8String:functionName.c_str()];
    DomValueType type = params.GetType();
    NSMutableArray *finalParams = [NSMutableArray arrayWithCapacity:8];
    [finalParams addObject:@(componentTag)];
    if (DomValueType::kArray == type) {
        NSArray * paramsArray = domValueToOCType(&params);
        NSAssert([paramsArray isKindOfClass:[NSArray class]], @"dispatch function method params type error");
        if ([paramsArray isKindOfClass:[NSArray class]]) {
            for (id param in paramsArray) {
                [finalParams addObject:param];
            }
        }
    }
    else if (DomValueType::kNull == type) {

    }
    else {
        //TODO
        NSAssert(NO, @"目前hippy底层会封装DomValue为Array类型。可能第三方接入者不一定会将其封装为Array");
        [finalParams addObject:[NSNull null]];
    }
    if (cb) {
        RenderUIResponseSenderBlock senderBlock = ^(id senderParams) {
            std::shared_ptr<DomArgument> domArgument = std::make_shared<DomArgument>([senderParams toDomArgument]);
            cb(domArgument);
        };
        [finalParams addObject:senderBlock];
    }
    NSString *nativeModuleName = [NSString stringWithUTF8String:viewName.c_str()];

    NativeRenderViewManager *viewManager = [self renderViewManagerForViewName:nativeModuleName];
    NativeRenderComponentData *componentData = [self componentDataForViewName:nativeModuleName];
    NSValue *selectorPointer = [componentData.methodsByName objectForKey:name];
    SEL selector = (SEL)[selectorPointer pointerValue];
    if (!selector) {
        return nil;
    }
    @try {
        NSMethodSignature *methodSignature = [viewManager methodSignatureForSelector:selector];
        NSAssert(methodSignature, @"method signature creation failure");
        NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:methodSignature];
        [invocation setSelector:selector];
        for (NSInteger i = 0; i < [finalParams count]; i++) {
            id object = finalParams[i];
            [invocation setArgument:&object atIndex:i+2];
        }
        [invocation invokeWithTarget:viewManager];
        void *returnValue = nil;
        if (strcmp(invocation.methodSignature.methodReturnType, "@") == 0) {
            [invocation getReturnValue:&returnValue];
            return (__bridge id)returnValue;
        }
        return nil;
    } @catch (NSException *exception) {
        NSString *message = [NSString stringWithFormat:@"Exception '%@' was thrown while invoking %@ on component target %@ with params %@", exception, name, nativeModuleName, finalParams];
        NSError *error = NativeRenderErrorWithMessage(message);
        NativeRenderFatal(error);
        return nil;
    }
}

- (void)registerExtraComponent:(NSDictionary<NSString *, Class> *)extraComponent {
    _extraComponent = extraComponent;
}

#pragma mark -
#pragma mark Event Handler

- (void)addEventName:(const std::string &)name forDomNodeId:(int32_t)node_id
          onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    NativeRenderObjectView *renderObject = [self renderObjectForcomponentTag:@(node_id) onRootTag:@(root_id)];
    [renderObject addEventName:name];
    if (name == hippy::kClickEvent) {
        [self addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
            [uiManager addClickEventListenerForView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kLongClickEvent) {
        [self addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
            [uiManager addLongClickEventListenerForView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kTouchStartEvent || name == hippy::kTouchMoveEvent
               || name == hippy::kTouchEndEvent || name == hippy::kTouchCancelEvent) {
        std::string name_ = name;
        [self addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
            [uiManager addTouchEventListenerForType:name_ forView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kShowEvent || name == hippy::kDismissEvent) {
        std::string name_ = name;
        [self addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
            [uiManager addShowEventListenerForType:name_ forView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kPressIn || name == hippy::kPressOut) {
        std::string name_ = name;
        [self addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
            [uiManager addPressEventListenerForType:name_ forView:node_id onRootNode:rootNode];
        }];
    } else if (name == kVSyncKey) {
        std::string name_ = name;
        auto weakDomManager = self.domManager;
        [self domNodeForComponentTag:node_id onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
            if (node) {
                NSString *vsyncKey = [NSString stringWithFormat:@"%p%d", self, node_id];
                auto event = std::make_shared<hippy::DomEvent>(name_, node);
                [[RenderVsyncManager sharedInstance] registerVsyncObserver:^{
                    auto domManager = weakDomManager.lock();
                    if (domManager) {
                        std::function<void()> func = [node, event](){
                            node->HandleEvent(event);
                        };
                        domManager->PostTask(hippy::Scene({func}));
                    }
                } rate:60 forKey:vsyncKey];
            }
        }];
    }
    else {
        std::string name_ = name;
        [self addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
            [uiManager addPropertyEvent:name_ forDomNode:node_id onRootNode:rootNode];
        }];
    }
}

- (void)addEventNameInMainThread:(const std::string &)name
                    forDomNodeId:(int32_t)node_id
                    onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    if (name == hippy::kClickEvent) {
        [self addClickEventListenerForView:node_id onRootNode:rootNode];
    } else if (name == hippy::kLongClickEvent) {
        [self addLongClickEventListenerForView:node_id onRootNode:rootNode];
    } else if (name == hippy::kTouchStartEvent || name == hippy::kTouchMoveEvent
               || name == hippy::kTouchEndEvent || name == hippy::kTouchCancelEvent) {
        [self addTouchEventListenerForType:name forView:node_id onRootNode:rootNode];
    } else if (name == hippy::kShowEvent || name == hippy::kDismissEvent) {
        [self addShowEventListenerForType:name forView:node_id onRootNode:rootNode];
    } else if (name == hippy::kPressIn || name == hippy::kPressOut) {
        [self addPressEventListenerForType:name forView:node_id onRootNode:rootNode];
    } else {
        [self addPropertyEvent:name forDomNode:node_id onRootNode:rootNode];
    }
}

- (void)addClickEventListenerForView:(int32_t)componentTag onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    UIView *view = [self viewForComponentTag:@(componentTag) onRootTag:@(root_id)];
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:hippy::kClickEvent];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:hippy::kClickEvent];
        __weak id weakSelf = self;
        [view addViewEvent:NativeRenderViewEventTypeClick eventListener:^(CGPoint) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForComponentTag:componentTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        auto event = std::make_shared<hippy::DomEvent>(hippy::kClickEvent, node,
                                                                       canBePreventedInCapturing, canBePreventedInBubbling,
                                                                       static_cast<std::shared_ptr<HippyValue>>(nullptr));
                        node->HandleEvent(event);
                    }
                }];
            }
        }];
    }
    else {
    }
}

- (void)addLongClickEventListenerForView:(int32_t)componentTag onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    UIView *view = [self viewForComponentTag:@(componentTag) onRootTag:@(root_id)];
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:hippy::kLongClickEvent];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:hippy::kLongClickEvent];
        __weak id weakSelf = self;
        [view addViewEvent:NativeRenderViewEventTypeLongClick eventListener:^(CGPoint) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForComponentTag:componentTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        auto event = std::make_shared<hippy::DomEvent>(hippy::kLongClickEvent, node,
                                                                       canBePreventedInCapturing, canBePreventedInBubbling,
                                                                       static_cast<std::shared_ptr<HippyValue>>(nullptr));
                        node->HandleEvent(event);
                    }
                }];
            }
        }];
    }
    else {
    }
}

- (void)addPressEventListenerForType:(const std::string &)type
                             forView:(int32_t)componentTag
                          onRootNode:(std::weak_ptr<RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    AssertMainQueue();
    UIView *view = [self viewForComponentTag:@(componentTag) onRootTag:@(root_id)];
    NativeRenderViewEventType eventType = hippy::kPressIn == type ? NativeRenderViewEventType::NativeRenderViewEventTypePressIn : NativeRenderViewEventType::NativeRenderViewEventTypePressOut;
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:type];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:type];
        std::string block_type = type;
        __weak id weakSelf = self;
        [view addViewEvent:eventType eventListener:^(CGPoint) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForComponentTag:componentTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        auto event = std::make_shared<hippy::DomEvent>(block_type, node,
                                                                       canBePreventedInCapturing, canBePreventedInBubbling,
                                                                       static_cast<std::shared_ptr<HippyValue>>(nullptr));
                        node->HandleEvent(event);
                    }
                }];
            }
        }];
    }
    else {
    }
}

- (void)addTouchEventListenerForType:(const std::string &)type
                             forView:(int32_t)componentTag
                          onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    UIView *view = [self viewForComponentTag:@(componentTag) onRootTag:@(root_id)];
    if (view) {
        // todo 默认值应该有个值代表未知
        NativeRenderViewEventType event_type = NativeRenderViewEventType::NativeRenderViewEventTypeTouchStart;
        if (type == hippy::kTouchStartEvent) {
            event_type = NativeRenderViewEventType::NativeRenderViewEventTypeTouchStart;
        } else if (type == hippy::kTouchMoveEvent) {
            event_type = NativeRenderViewEventType::NativeRenderViewEventTypeTouchMove;
        } else if (type == hippy::kTouchEndEvent) {
            event_type = NativeRenderViewEventType::NativeRenderViewEventTypeTouchEnd;
        } else if (type == hippy::kTouchCancelEvent) {
            event_type = NativeRenderViewEventType::NativeRenderViewEventTypeTouchCancel;
        }
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:type];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:type];
        const std::string type_ = type;
        __weak id weakSelf = self;
        [view addViewEvent:event_type eventListener:^(CGPoint point) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForComponentTag:componentTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        footstone::value::HippyValue::HippyValueObjectType domValue;
                        domValue["page_x"] = footstone::value::HippyValue(point.x);
                        domValue["page_y"] = footstone::value::HippyValue(point.y);
                        std::shared_ptr<footstone::value::HippyValue> value = std::make_shared<footstone::value::HippyValue>(domValue);
                        if (node) {
                            auto event = std::make_shared<DomEvent>(type_, node, canBePreventedInCapturing,
                                                                    canBePreventedInBubbling,value);
                           node->HandleEvent(event);
                        }
                    }
                }];
            }
        }];
    }
    else {
    }
}

- (void)addShowEventListenerForType:(const std::string &)type
                            forView:(int32_t)componentTag
                         onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    UIView *view = [self viewForComponentTag:@(componentTag) onRootTag:@(root_id)];
    if (view) {
        NativeRenderViewEventType event_type = hippy::kShowEvent == type ? NativeRenderViewEventTypeShow : NativeRenderViewEventTypeDismiss;
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:type];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:type];
        __weak id weakSelf = self;
        [view addViewEvent:event_type eventListener:^(CGPoint point) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForComponentTag:componentTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        std::shared_ptr<HippyValue> domValue = std::make_shared<HippyValue>(true);
                        auto event = std::make_shared<DomEvent>(type, node, canBePreventedInCapturing,
                                                                canBePreventedInBubbling, domValue);
                        node->HandleEvent(event);
                    }
                }];
            }
        }];
    }
    else {
    }
}

- (void)removeEventName:(const std::string &)eventName
           forDomNodeId:(int32_t)node_id
             onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    int32_t componentTag = node_id;
    if (eventName == hippy::kClickEvent ||
        eventName ==hippy::kLongClickEvent ||
        eventName == hippy::kTouchStartEvent || eventName == hippy::kTouchMoveEvent ||
        eventName == hippy::kTouchEndEvent || eventName == hippy::kTouchCancelEvent ||
        eventName == hippy::kShowEvent || eventName == hippy::kDismissEvent ||
        eventName == hippy::kPressIn || eventName == hippy::kPressOut) {
        std::string name_ = eventName;
        [self addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
            UIView *view = [uiManager viewForComponentTag:@(componentTag) onRootTag:@(root_id)];
            [view removeViewEvent:viewEventTypeFromName(name_)];
        }];
    } else if (eventName == kVSyncKey) {
       std::string name_ = eventName;
       [self domNodeForComponentTag:node_id onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
           if (node) {
               NSString *vsyncKey = [NSString stringWithFormat:@"%p%d", self, node_id];
               [[RenderVsyncManager sharedInstance] unregisterVsyncObserverForKey:vsyncKey];
           }
       }];
   } else {
        std::string name_ = eventName;
        [self addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = [viewRegistry objectForKey:@(componentTag)];
            [view removePropertyEvent:name_];
        }];
    }
}

- (void)addPropertyEvent:(const std::string &)name forDomNode:(int32_t)node_id
              onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    UIView *view = [self viewForComponentTag:@(node_id) onRootTag:@(root_id)];
    if (view) {
        std::string name_ = name;
        NSDictionary *componentDataByName = [_componentDataByName copy];
        NSString *viewName = view.viewName;
        NativeRenderComponentData *component = componentDataByName[viewName];
        NSDictionary<NSString *, NSString *> *eventMap = [component eventNameMap];
        NSString *mapToEventName = [eventMap objectForKey:[NSString stringWithUTF8String:name_.c_str()]];
        if (mapToEventName) {
            BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:name_];
            BOOL canBePreventedInBubbling = [view canBePreventInBubbling:name_];
            __weak id weakSelf = self;
            [view addPropertyEvent:[mapToEventName UTF8String] eventCallback:^(NSDictionary *body) {
                id strongSelf = weakSelf;
                if (strongSelf) {
                    [strongSelf domNodeForComponentTag:node_id onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> domNode) {
                        if (domNode) {
                            HippyValue value = [body toDomValue];
                            std::shared_ptr<HippyValue> domValue = std::make_shared<HippyValue>(std::move(value));
                            auto event = std::make_shared<DomEvent>(name_, domNode, canBePreventedInCapturing,
                                                                    canBePreventedInBubbling, domValue);
                            domNode->HandleEvent(event);
                        }
                    }];
                }
            }];
        }
    }
    else {
    }
}

#pragma mark -
#pragma mark Other

/**
 * Sets up animations, computes layout, creates UI mounting blocks for computed layout,
 * runs these blocks and all other already existing blocks.
 */
- (void)layoutAndMountOnRootNode:(std::weak_ptr<RootNode>)rootNode {
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    NativeRenderObjectView *rootView = [_renderObjectRegistry rootComponentForTag:@(root_id)];
    // Gather blocks to be executed now that all view hierarchy manipulations have
    // been completed (note that these may still take place before layout has finished)
    NSDictionary *renderObjectsMap = [_renderObjectRegistry componentsForRootTag:@(root_id)];
    for (NativeRenderComponentData *componentData in _componentDataByName.allValues) {
        NativeRenderRenderUIBlock uiBlock = [componentData uiBlockToAmendWithRenderObjectViewRegistry:renderObjectsMap];
        [self addUIBlock:uiBlock];
    }
    [rootView amendLayoutBeforeMount];
    [self amendPendingUIBlocksWithStylePropagationUpdateForRenderObject:rootView];

    [self addUIBlock:^(id<NativeRenderContext> renderContext, __unused NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
        for (id<NativeRenderComponentProtocol> node in uiManager->_componentTransactionListeners) {
            [node nativeRenderComponentDidFinishTransaction];
        }
    }];
    [self flushUIBlocksOnRootNode:rootNode];
}

- (void)setNeedsLayoutForRootNodeTag:(NSNumber *)tag {
    // If there is an active batch layout will happen when batch finished, so we will wait for that.
    // Otherwise we immidiately trigger layout.
    auto rootNode = [_renderObjectRegistry rootNodeForTag:tag];
    [self layoutAndMountOnRootNode:rootNode];
}

- (NSDictionary *)mergeProps:(NSDictionary *)newProps oldProps:(NSDictionary *)oldProps {
    NSMutableDictionary *tmpProps = [NSMutableDictionary dictionaryWithDictionary:newProps];
    [oldProps enumerateKeysAndObjectsUsingBlock:^(NSString *_Nonnull key, __unused id _Nonnull obj, __unused BOOL *stop) {
        if (tmpProps[key] == nil) {
            tmpProps[key] = (id)kCFNull;
        }
    }];
    return tmpProps;
}

@end

