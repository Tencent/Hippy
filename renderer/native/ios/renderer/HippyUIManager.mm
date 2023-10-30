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

#import "HippyAsserts.h"
#import "HippyDomUtils.h"
#import "HippyFootstoneUtils.h"
#import "HippyOCToDomArgument.h"
#import "HippyOCToHippyValue.h"
#import "HippyImageProviderProtocol.h"
#import "HippyUtils.h"
#import "HippyComponent.h"
#import "HippyComponentData.h"
#import "HippyComponentMap.h"
#import "HippyUIManager.h"
#import "NativeRenderObjectRootView.h"
#import "HippyShadowView.h"
#import "NativeRenderUtils.h"
#import "HippyView.h"
#import "HippyViewManager.h"
#import "RenderVsyncManager.h"
#import "UIView+DomEvent.h"
#import "UIView+Hippy.h"
#import "UIView+Render.h"
#import "NSObject+Render.h"
#import "HippyBridgeModule.h"
#import "HippyModulesSetup.h"
#import "NativeRenderManager.h"
#include "dom/root_node.h"
#include "objc/runtime.h"

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

static NSMutableArray<Class> *HippyViewManagerClasses = nil;
NSArray<Class> *HippyGetViewManagerClasses(void) {
    if (!HippyViewManagerClasses) {
        NSArray<Class> *classes = HippyGetModuleClasses();
        NSMutableArray<Class> *viewManagerClasses = [NSMutableArray array];
        for (id aClass in classes) {
            if ([aClass isSubclassOfClass:HippyViewManager.class]) {
                [viewManagerClasses addObject:aClass];
            }
        }
        HippyViewManagerClasses = viewManagerClasses;
    }
    return HippyViewManagerClasses;
}

static NSString *GetViewNameFromViewManagerClass(Class cls) {
    HippyAssert([cls respondsToSelector:@selector(moduleName)],
                @"%@ must respond to selector moduleName", NSStringFromClass(cls));
    NSString *viewName = [cls performSelector:@selector(moduleName)];
    return viewName;
}

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

static void NativeRenderTraverseViewNodes(id<HippyComponent> view, void (^block)(id<HippyComponent>)) {
    if (view.hippyTag) {
        block(view);
        for (id<HippyComponent> subview in view.subcomponents) {
            NativeRenderTraverseViewNodes(subview, block);
        }
    }
}

#define AssertMainQueue() NSAssert(HippyIsMainQueue(), @"This function must be called on the main thread")

NSString *const NativeRenderUIManagerDidRegisterRootViewNotification = @"NativeRenderUIManagerDidRegisterRootViewNotification";
NSString *const NativeRenderUIManagerRootViewTagKey = @"NativeRenderUIManagerRootViewKey";
NSString *const NativeRenderUIManagerKey = @"NativeRenderUIManagerKey";
NSString *const NativeRenderUIManagerDidEndBatchNotification = @"NativeRenderUIManagerDidEndBatchNotification";

@interface HippyUIManager() {
    NSMutableArray<HippyViewManagerUIBlock> *_pendingUIBlocks;

    HippyComponentMap *_viewRegistry;
    HippyComponentMap *_shadowViewRegistry;

    // Keyed by viewName
    NSMutableDictionary<NSString *, HippyComponentData *> *_componentDataByName;

    // Listeners such as ScrollView/ListView etc. witch will listen to start layout event
    // The implementation here needs to be improved to provide a registration mechanism.
    NSHashTable<id<HippyComponent>> *_componentTransactionListeners;

    std::weak_ptr<DomManager> _domManager;
    std::mutex _renderQueueLock;
    NSMutableDictionary<NSString *, id> *_viewManagers;
    NSArray<Class> *_extraComponents;
    
    NSMutableArray<Class<HippyImageProviderProtocol>> *_imageProviders;
    
    std::function<void(int32_t, NSDictionary *)> _rootViewSizeChangedCb;
}

@end

@implementation HippyUIManager

@synthesize domManager = _domManager;

#pragma mark Life cycle

- (instancetype)initWithRenderManager:(std::weak_ptr<hippy::RenderManager>)renderManager {
    self = [super init];
    if (self) {
        _renderManager = renderManager;
        [self initContext];
    }
    return self;
}

- (void)dealloc {
}

- (void)initContext {
    _shadowViewRegistry = [[HippyComponentMap alloc] init];
    _viewRegistry = [[HippyComponentMap alloc] init];
    _viewRegistry.requireInMainThread = YES;
    _pendingUIBlocks = [NSMutableArray new];
    _componentTransactionListeners = [NSHashTable weakObjectsHashTable];
    _componentDataByName = [NSMutableDictionary dictionaryWithCapacity:64];
    NativeRenderScreenScale();
    NativeRenderScreenSize();
}

- (void)invalidate {
    __weak __typeof(self) weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        HippyUIManager *strongSelf = weakSelf;
        if (strongSelf) {
            strongSelf->_viewRegistry = nil;
            [strongSelf->_componentTransactionListeners removeAllObjects];
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

- (HippyComponentMap *)renderObjectRegistry {
     if (!_shadowViewRegistry) {
        _shadowViewRegistry = [[HippyComponentMap alloc] init];
     }
     return _shadowViewRegistry;
 }

- (HippyComponentMap *)viewRegistry {
     if (!_viewRegistry) {
        _viewRegistry = [[HippyComponentMap alloc] init];
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

- (HippyShadowView *)renderObjectForcomponentTag:(NSNumber *)componentTag
                                          onRootTag:(NSNumber *)rootTag {
    return [_shadowViewRegistry componentForTag:componentTag onRootTag:rootTag];
}

- (std::weak_ptr<hippy::RenderManager>)renderManager {
    return _renderManager;
}

- (std::mutex &)renderQueueLock {
    return _renderQueueLock;
}

#pragma mark -
#pragma mark View Manager
- (HippyComponentData *)componentDataForViewName:(NSString *)viewName {
    if (viewName) {
        HippyComponentData *componentData = _componentDataByName[viewName];
        if (!componentData) {
            HippyViewManager *viewManager = [self renderViewManagerForViewName:viewName];
            NSAssert(viewManager, @"No view manager found for %@", viewName);
            if (viewManager) {
                componentData = [[HippyComponentData alloc] initWithViewManager:viewManager viewName:viewName];
                _componentDataByName[viewName] = componentData;
            }
        }
        return componentData;
    }
    return nil;
}

- (void)registerRootView:(UIView *)rootView asRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();

    NSNumber *componentTag = rootView.hippyTag;
    NSAssert(HippyIsHippyRootView(componentTag), @"View %@ with tag #%@ is not a root view", rootView, componentTag);

#if HIPPY_DEBUG
    NSAssert(![_viewRegistry containRootComponentWithTag:componentTag], @"RootView Tag already exists. Added %@ twice", componentTag);
#endif
    // Register view
    [_viewRegistry addRootComponent:rootView rootNode:rootNode forTag:componentTag];
    
    [rootView addObserver:self forKeyPath:@"frame" options:(NSKeyValueObservingOptionOld | NSKeyValueObservingOptionNew) context:NULL];
    rootView.renderManager = [self renderManager];
    CGRect frame = rootView.frame;

    UIColor *backgroundColor = [rootView backgroundColor];
    NSString *rootViewClassName = NSStringFromClass([rootView class]);
    // Register shadow view
    __weak HippyUIManager *weakSelf = self;
    std::function<void()> registerRootViewFunction = [weakSelf, componentTag, frame, backgroundColor, rootViewClassName, rootNode](){
        @autoreleasepool {
            HippyUIManager *strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            std::lock_guard<std::mutex> lock([strongSelf renderQueueLock]);
            NativeRenderObjectRootView *renderObject = [[NativeRenderObjectRootView alloc] init];
            renderObject.hippyTag = componentTag;
            renderObject.frame = frame;
            renderObject.backgroundColor = backgroundColor;
            renderObject.viewName = rootViewClassName;
            renderObject.rootNode = rootNode;
            renderObject.domNode = rootNode;
            [strongSelf->_shadowViewRegistry addRootComponent:renderObject rootNode:rootNode forTag:componentTag];
            NSDictionary *userInfo = @{ NativeRenderUIManagerRootViewTagKey: componentTag,
                                        NativeRenderUIManagerKey: strongSelf};
            [[NSNotificationCenter defaultCenter] postNotificationName:NativeRenderUIManagerDidRegisterRootViewNotification
                                                                object:nil
                                                              userInfo:userInfo];
        }
    };
    registerRootViewFunction();
}

- (void)unregisterRootViewFromTag:(NSNumber *)rootTag {
    AssertMainQueue();
    UIView *rootView = [_viewRegistry rootComponentForTag:rootTag];
    if (rootView) {
        [rootView removeObserver:self forKeyPath:@"frame"];
    }
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    [_viewRegistry removeRootComponentWithTag:rootTag];
    [_shadowViewRegistry removeRootComponentWithTag:rootTag];
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSKeyValueChangeKey,id> *)change context:(void *)context {
    if ([keyPath isEqualToString:@"frame"] && [object isKindOfClass:[UIView class]]) {
        CGRect curFrame = [change[NSKeyValueChangeNewKey] CGRectValue];
        CGRect oriFrame = [change[NSKeyValueChangeOldKey] CGRectValue];
        if (!CGRectEqualToRect(curFrame, oriFrame)) {
            UIView *rootView = (UIView *)object;
            NSNumber *rootTag = [rootView hippyTag];
            auto rootNode = [_viewRegistry rootNodeForTag:rootTag].lock();
            auto domManager = _domManager.lock();
            if (rootNode && domManager) {
                NSDictionary *params = @{@"oldWidth": @(CGRectGetWidth(oriFrame)), @"oldHeight": @(CGRectGetHeight(oriFrame)),
                                         @"width": @(CGRectGetWidth(curFrame)), @"height": @(CGRectGetHeight(curFrame)),
                                         @"rootViewId": rootTag
                };
                auto value = std::make_shared<footstone::HippyValue>([params toHippyValue]);
                auto event = std::make_shared<DomEvent>("onSizeChanged", rootNode, NO, NO, value);
                __weak HippyUIManager *weakSelf = self;
                std::function<void()> func = [weakSelf, rootNode, event, rootTag](){
                    rootNode->HandleEvent(event);
                    HippyUIManager *strongSelf = weakSelf;
                    if (strongSelf) {
                        [strongSelf domEventDidHandle:"onSizeChanged" forNode:[rootTag intValue] onRoot:[rootTag intValue]];
                    }
                };
                domManager->PostTask(hippy::Scene({func}));
                if (_rootViewSizeChangedCb) {
                    _rootViewSizeChangedCb([rootTag intValue], params);
                }
            }
        }
    }
}

- (void)setFrame:(CGRect)frame forRootView:(UIView *)view {
    AssertMainQueue();
    NSNumber *componentTag = view.hippyTag;
    auto domManager = _domManager.lock();
    if (!domManager) {
        return;
    }
    __weak id weakSelf = self;
    std::vector<std::function<void()>> ops_ = {[componentTag, weakSelf, frame]() {
        if (!weakSelf) {
            return;
        }
        HippyUIManager *strongSelf = weakSelf;
        HippyShadowView *renderObject = [strongSelf->_shadowViewRegistry rootComponentForTag:componentTag];
        if (renderObject == nil) {
            return;
        }
        if (!CGRectEqualToRect(frame, renderObject.frame)) {
            renderObject.frame = frame;
            std::weak_ptr<RootNode> rootNode = [strongSelf->_shadowViewRegistry rootNodeForTag:componentTag];
            [strongSelf batchOnRootNode:rootNode];
        }
    }};
    domManager->PostTask(hippy::dom::Scene(std::move(ops_)));
}

/**
 * Unregisters views from registries
 */
- (void)purgeChildren:(NSArray<id<HippyComponent>> *)children
            onRootTag:(NSNumber *)rootTag
         fromRegistry:(NSMutableDictionary<NSNumber *, __kindof id<HippyComponent>> *)registry {
    for (id<HippyComponent> child in children) {
        NativeRenderTraverseViewNodes(registry[child.hippyTag], ^(id<HippyComponent> subview) {
            NSAssert(![subview isHippyRootView], @"Root views should not be unregistered");
            if ([subview respondsToSelector:@selector(invalidate)]) {
                [subview performSelector:@selector(invalidate)];
            }
            [registry removeObjectForKey:subview.hippyTag];
        });
    }
}

- (void)purgeViewsFromComponentTags:(NSArray<NSNumber *> *)componentTags onRootTag:(NSNumber *)rootTag {
    for (NSNumber *componentTag in componentTags) {
        UIView *view = [self viewForComponentTag:componentTag onRootTag:rootTag];
        HippyComponentMap *componentMap = _viewRegistry;
        NativeRenderTraverseViewNodes(view, ^(id<HippyComponent> subview) {
            NSAssert(![subview isHippyRootView], @"Root views should not be unregistered");
            [componentMap removeComponent:subview forRootTag:rootTag];
        });
    }
}

- (void)removeChildren:(NSArray<id<HippyComponent>> *)children fromContainer:(id<HippyComponent>)container {
    for (id<HippyComponent> removedChild in children) {
        [container removeHippySubview:removedChild];
    }
}

- (UIView *)createViewRecursivelyFromcomponentTag:(NSNumber *)componentTag
                                    onRootTag:(NSNumber *)rootTag {
    HippyShadowView *renderObject = [_shadowViewRegistry componentForTag:componentTag onRootTag:rootTag];
    return [self createViewRecursivelyFromRenderObject:renderObject];
}

- (UIView *)createViewFromRenderObject:(HippyShadowView *)renderObject {
    AssertMainQueue();
    HippyAssert(renderObject.viewName, @"view name is needed for creating a view");
    HippyComponentData *componentData = [self componentDataForViewName:renderObject.viewName];
    UIView *view = [self createViewByComponentData:componentData
                                      componentTag:renderObject.hippyTag
                                           rootTag:renderObject.rootTag
                                        properties:renderObject.props
                                          viewName:renderObject.viewName];
    view.renderManager = [self renderManager];
    [view hippySetFrame:renderObject.frame];
    const std::vector<std::string> &eventNames = [renderObject allEventNames];
    for (auto &event : eventNames) {
        [self addEventNameInMainThread:event
                          forDomNodeId:[renderObject.hippyTag intValue]
                            onRootNode:renderObject.rootNode];
    }
    return view;
}

- (UIView *)createViewRecursivelyFromRenderObject:(HippyShadowView *)renderObject {
    AssertMainQueue();
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    return [self createViewRecursiveFromRenderObjectWithNOLock:renderObject];
}

- (UIView *)createViewRecursiveFromRenderObjectWithNOLock:(HippyShadowView *)renderObject {
    UIView *view = [self createViewFromRenderObject:renderObject];
    NSUInteger index = 0;
    for (HippyShadowView *subRenderObject in renderObject.subcomponents) {
        UIView *subview = [self createViewRecursiveFromRenderObjectWithNOLock:subRenderObject];
        [view insertHippySubview:subview atIndex:index];
        index++;
    }
    view.hippyShadowView = renderObject;
    view.renderManager = [self renderManager];
    [view clearSortedSubviews];
    [view didUpdateHippySubviews];
    NSMutableSet<NativeRenderApplierBlock> *applierBlocks = [NSMutableSet setWithCapacity:256];
    [renderObject amendLayoutBeforeMount:applierBlocks];
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
    NSMutableDictionary *props = [StylesFromDomNode(domNode) mutableCopy];
    HippyComponentData *componentData = [self componentDataForViewName:viewName];
    HippyShadowView *renderObject = [componentData createRenderObjectViewWithTag:componentTag];
    renderObject.rootNode = rootNode;
    NSAssert(componentData && renderObject, @"componentData and renderObject must not be nil");
    [props setValue: rootTag forKey: @"rootTag"];
    // Register shadow view
    if (renderObject) {
        renderObject.hippyTag = componentTag;
        renderObject.rootTag = rootTag;
        renderObject.viewName = viewName;
        renderObject.tagName = tagName;
        renderObject.props = props;
        renderObject.domNode = domNode;
        renderObject.rootNode = rootNode;
        renderObject.domManager = _domManager;
        renderObject.nodeLayoutResult = domNode->GetLayoutResult();
        renderObject.frame = CGRectMakeFromLayoutResult(domNode->GetLayoutResult());
        [componentData setProps:props forShadowView:renderObject];
        [_shadowViewRegistry addComponent:renderObject forRootTag:rootTag];
    }
    return props;
}

- (UIView *)createViewByComponentData:(HippyComponentData *)componentData
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
        [view resetHippySubviews];
    }
    else {
        view = [componentData createViewWithTag:componentTag initProps:props];
    }
    if (view) {
        view.viewName = viewName;
        view.rootTag = rootTag;
        view.renderManager = [self renderManager];
        [componentData setProps:props forView:view];  // Must be done before bgColor to prevent wrong default

        if ([view respondsToSelector:@selector(hippyBridgeDidFinishTransaction)]) {
            [self->_componentTransactionListeners addObject:view];
        }
        [_viewRegistry addComponent:view forRootTag:rootTag];
    }
    return view;
}

- (void)updateView:(nonnull NSNumber *)componentTag
         onRootTag:(NSNumber *)rootTag
             props:(NSDictionary *)props {
    HippyShadowView *renderObject = [_shadowViewRegistry componentForTag:componentTag onRootTag:rootTag];
    if (!renderObject) {
        return;
    }
    HippyComponentData *componentData = [self componentDataForViewName:renderObject.viewName];
    NSDictionary *newProps = props;
    NSDictionary *virtualProps = props;
    newProps = [renderObject mergeProps:props];
    virtualProps = renderObject.props;
    [componentData setProps:newProps forShadowView:renderObject];
    [renderObject dirtyPropagation:NativeRenderUpdateLifecyclePropsDirtied];
    [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[componentTag];
        [componentData setProps:newProps forView:view];
    }];
}

#pragma mark Render Context Implementation

- (__kindof HippyViewManager *)renderViewManagerForViewName:(NSString *)viewName {
    if (!_viewManagers) {
        _viewManagers = [NSMutableDictionary dictionaryWithCapacity:64];
        if (_extraComponents) {
            for (Class cls in _extraComponents) {
                NSString *viewName = GetViewNameFromViewManagerClass(cls);
                HippyAssert(![_viewManagers objectForKey:viewName],
                         @"duplicated component %@ for class %@ and %@", viewName,
                         NSStringFromClass(cls),
                         NSStringFromClass([_viewManagers objectForKey:viewName]));
                [_viewManagers setObject:cls forKey:viewName];
            }
        }
        NSArray<Class> *classes = HippyGetViewManagerClasses();
        NSMutableDictionary *defaultViewManagerClasses = [NSMutableDictionary dictionaryWithCapacity:[classes count]];
        for (Class cls in classes) {
            NSString *viewName = GetViewNameFromViewManagerClass(cls);
            if ([_viewManagers objectForKey:viewName]) {
                continue;
            }
            [defaultViewManagerClasses setObject:cls forKey:viewName];
        }
        [_viewManagers addEntriesFromDictionary:defaultViewManagerClasses];
    }
    id object = [_viewManagers objectForKey:viewName];
    if (object_isClass(object)) {
        HippyViewManager *viewManager = [object new];
        viewManager.bridge = self.bridge;
        NSAssert([viewManager isKindOfClass:[HippyViewManager class]], @"It must be a HippyViewManager instance");
        [_viewManagers setObject:viewManager forKey:viewName];
        object = viewManager;
    }
    return object;
}

- (NSArray<__kindof UIView *> *)rootViews {
    return (NSArray<__kindof UIView *> *)[_viewRegistry rootComponents];
}

#pragma mark Schedule Block

- (void)addUIBlock:(HippyViewManagerUIBlock)block {
    if (!block || !_viewRegistry) {
        return;
    }

    [_pendingUIBlocks addObject:block];
}

- (void)amendPendingUIBlocksWithStylePropagationUpdateForRenderObject:(HippyShadowView *)topView {
    NSMutableSet<NativeRenderApplierBlock> *applierBlocks = [NSMutableSet setWithCapacity:256];

    [topView collectUpdatedProperties:applierBlocks parentProperties:@{}];
    if (applierBlocks.count) {
        [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
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
    
    TDF_PERF_DO_STMT_AND_LOG(unsigned int rand = arc4random(); , "flushUIBlocksOnRootNode(random id:%u", rand);
    
    int32_t rootTag = strongRootNode->GetId();
    NSArray<HippyViewManagerUIBlock> *previousPendingUIBlocks = _pendingUIBlocks;
    _pendingUIBlocks = [NSMutableArray new];
    __weak __typeof(self)weakSelf = self;
    if (previousPendingUIBlocks.count) {
        // Execute the previously queued UI blocks
        dispatch_async(dispatch_get_main_queue(), ^{
            __strong __typeof(weakSelf)strongSelf = weakSelf;
            if (strongSelf) {
                TDF_PERF_LOG("flushUIBlocksOnRootNode on main thread(random id:%u)",rand);
                NSDictionary<NSNumber *, UIView *> *viewReg = [strongSelf.viewRegistry componentsForRootTag:@(rootTag)];
                @try {
                    for (HippyViewManagerUIBlock block in previousPendingUIBlocks) {
                        block(strongSelf, viewReg);
                    }
                } @catch (NSException *exception) {
                    HippyLogError(@"Exception thrown while executing UI block: %@", exception);
                }
                TDF_PERF_LOG("flushUIBlocksOnRootNode on main thread done, block count:%d(random id:%u)", previousPendingUIBlocks.count, rand);
            }
        });
    }
    TDF_PERF_LOG("flushUIBlocksOnRootNode End(random id:%u)",rand);
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
#if HIPPY_DEBUG
    auto &nodeMap = _domNodesMap[strongRootNode->GetId()];
    for (auto node : nodes) {
        nodeMap[node->GetId()] = node;
    }
#endif
    NSNumber *rootNodeTag = @(strongRootNode->GetId());
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    NativeRenderViewsRelation *manager = [[NativeRenderViewsRelation alloc] init];
//    NSMutableDictionary *dicProps = [NSMutableDictionary dictionaryWithCapacity:nodes.size()];
    for (const std::shared_ptr<DomNode> &node : nodes) {
        const auto& render_info = node->GetRenderInfo();
        [manager addViewTag:render_info.id forSuperViewTag:render_info.pid atIndex:render_info.index];
        NSDictionary *nodeProps = [self createRenderObjectFromNode:node onRootNode:rootNode];
//        [dicProps setObject:nodeProps forKey:@(node->GetId())];
    }
    [manager enumerateViewsHierarchy:^(int32_t tag, const std::vector<int32_t> &subviewTags, const std::vector<int32_t> &subviewIndices) {
        NSAssert(subviewTags.size() == subviewIndices.size(), @"subviewTags count must be equal to subviewIndices count");
        HippyShadowView *superRenderObject = [self->_shadowViewRegistry componentForTag:@(tag) onRootTag:rootNodeTag];
        for (NSUInteger index = 0; index < subviewTags.size(); index++) {
            HippyShadowView *subRenderObject = [self->_shadowViewRegistry componentForTag:@(subviewTags[index]) onRootTag:rootNodeTag];
            [superRenderObject insertHippySubview:subRenderObject atIndex:subviewIndices[index]];
        }
        [superRenderObject didUpdateHippySubviews];
    }];
    for (const std::shared_ptr<DomNode> &node : nodes) {
        NSNumber *componentTag = @(node->GetId());
        HippyShadowView *renderObject = [_shadowViewRegistry componentForTag:componentTag onRootTag:rootNodeTag];
        if (NativeRenderCreationTypeInstantly == [renderObject creationType] && !_uiCreationLazilyEnabled) {
            [self addUIBlock:^(HippyUIManager *uiManager, __unused NSDictionary<NSNumber *,UIView *> *viewRegistry) {
                UIView *view = [uiManager createViewFromRenderObject:renderObject];
                view.hippyShadowView = renderObject;
                view.renderManager = [uiManager renderManager];
            }];
        }
    }
    [manager enumerateViewsHierarchy:^(int32_t tag, const std::vector<int32_t> &subviewTags, const std::vector<int32_t> &subviewIndices) {
        auto subViewTags_ = subviewTags;
        auto subViewIndices_ = subviewIndices;
        HippyShadowView *renderObject = [self->_shadowViewRegistry componentForTag:@(tag) onRootTag:rootNodeTag];
        if (NativeRenderCreationTypeInstantly == [renderObject creationType] && !self->_uiCreationLazilyEnabled) {
            [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                UIView *superView = viewRegistry[@(tag)];
                for (NSUInteger index = 0; index < subViewTags_.size(); index++) {
                    UIView *subview = viewRegistry[@(subViewTags_[index])];
                    if (subview) {
                        [superView insertHippySubview:subview atIndex:subViewIndices_[index]];
                    }
                }
                [superView clearSortedSubviews];
                [superView didUpdateHippySubviews];
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
#if HIPPY_DEBUG
    auto &nodeMap = _domNodesMap[strongRootNode->GetId()];
    for (auto node : nodes) {
        nodeMap[node->GetId()] = node;
    }
#endif
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    NSNumber *rootTag = @(strongRootNode->GetId());
    for (const auto &node : nodes) {
        const auto &diffStyle = node->GetDiffStyle();
        const auto &deleteProps = node->GetDeleteProps();
        auto diffCount = diffStyle ? diffStyle->size() : 0;
        auto deleteCount = deleteProps ? deleteProps->size() : 0;
        //TODO(mengyanluo): it is better to use diff and delete properties to update view
        if (0 == diffCount && 0 == deleteCount) {
            continue;
        }
        NSNumber *componentTag = @(node->GetRenderInfo().id);
        NSDictionary *styleProps = UnorderedMapDomValueToDictionary(node->GetStyleMap());
        NSDictionary *extProps = UnorderedMapDomValueToDictionary(node->GetExtStyle());
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
#if HIPPY_DEBUG
    auto &nodeMap = _domNodesMap[strongRootNode->GetId()];
    for (auto node : nodes) {
        nodeMap[node->GetId()] = nullptr;
    }
#endif
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    NSNumber *rootTag = @(strongRootNode->GetId());
    NSMutableDictionary *currentRegistry = [_shadowViewRegistry componentsForRootTag:rootTag];
    
    for (auto dom_node : nodes) {
        int32_t tag = dom_node->GetRenderInfo().id;
        HippyShadowView *renderObject = [currentRegistry objectForKey:@(tag)];
        [renderObject dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
        if (renderObject) {
            [renderObject removeFromHippySuperview];
            [self purgeChildren:@[renderObject] onRootTag:rootTag fromRegistry:currentRegistry];
        }
    }
    __weak HippyUIManager *weakSelf = self;
    auto strongNodes = std::move(nodes);
    [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyUIManager *strongSelf = weakSelf;
        if (!strongSelf) {
            return;
        }
        NSMutableArray<UIView *> *parentViews = [NSMutableArray arrayWithCapacity:8];
        NSMutableArray<UIView *> *views = [NSMutableArray arrayWithCapacity:8];
        for (auto domNode : strongNodes) {
            UIView *view = [viewRegistry objectForKey:@(domNode->GetId())];
            if (!view) {
                continue;
            }
            UIView *parentView = [view parentComponent];
            if (!parentView) {
                continue;
            }
            [parentViews addObject:parentView];
            [view removeFromHippySuperview];
            [views addObject:view];
        }
        NSMutableDictionary *currentViewRegistry = [strongSelf->_viewRegistry componentsForRootTag:rootTag];
        [strongSelf purgeChildren:views onRootTag:rootTag fromRegistry:currentViewRegistry];
        for (UIView *view in parentViews) {
            [view clearSortedSubviews];
            [view didUpdateHippySubviews];
        }
    }];
}

- (void)renderMoveViews:(const std::vector<int32_t> &&)ids
          fromContainer:(int32_t)fromContainer
            toContainer:(int32_t)toContainer
                  index:(int32_t)index
             onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t rootTag = strongRootNode->GetId();
    
    HippyShadowView *fromObjectView = [_shadowViewRegistry componentForTag:@(fromContainer)
                                                                          onRootTag:@(rootTag)];
    HippyShadowView *toObjectView = [_shadowViewRegistry componentForTag:@(toContainer)
                                                                        onRootTag:@(rootTag)];
    for (int32_t componentTag : ids) {
        HippyShadowView *view = [_shadowViewRegistry componentForTag:@(componentTag) onRootTag:@(rootTag)];
        HippyAssert(fromObjectView == [view parentComponent], @"parent of object view with tag %d is not object view with tag %d", componentTag, fromContainer);
        [view removeFromHippySuperview];
        [toObjectView insertHippySubview:view atIndex:index];
    }
    [fromObjectView dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
    [toObjectView dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
    [fromObjectView didUpdateHippySubviews];
    [toObjectView didUpdateHippySubviews];
    auto strongTags = std::move(ids);
    [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        UIView *fromView = [viewRegistry objectForKey:@(fromContainer)];
        UIView *toView = [viewRegistry objectForKey:@(toContainer)];
        for (int32_t tag : strongTags) {
            UIView *view = [viewRegistry objectForKey:@(tag)];
            if (!view) {
                continue;
            }
            HippyAssert(fromView == [view parentComponent], @"parent of object view with tag %d is not object view with tag %d", tag, fromContainer);
            [view removeFromHippySuperview];
            [toView insertHippySubview:view atIndex:index];
        }
        [fromView clearSortedSubviews];
        [fromView didUpdateHippySubviews];
        [toView clearSortedSubviews];
        [toView didUpdateHippySubviews];
    }];
}

- (void)renderMoveNodes:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes
             onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t rootTag = strongRootNode->GetId();
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    HippyShadowView *parentObjectView = nil;
    for (auto &node : nodes) {
        int32_t index = node->GetRenderInfo().index;
        int32_t componentTag = node->GetId();
        HippyShadowView *objectView = [_shadowViewRegistry componentForTag:@(componentTag) onRootTag:@(rootTag)];
        [objectView dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
        HippyAssert(!parentObjectView || parentObjectView == [objectView parentComponent], @"try to move object view on different parent object view");
        if (!parentObjectView) {
            parentObjectView = [objectView parentComponent];
        }
        [parentObjectView moveHippySubview:objectView toIndex:index];
    }
    [parentObjectView didUpdateHippySubviews];
    auto strongNodes = std::move(nodes);
    [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        UIView *superView = nil;
        for (auto node : strongNodes) {
            int32_t index = node->GetIndex();
            int32_t componentTag = node->GetId();
            UIView *view = [viewRegistry objectForKey:@(componentTag)];
            if (!view) {
                continue;
            }
            HippyAssert(!superView || superView == [view parentComponent], @"try to move views on different parent views");
            if (!superView) {
                superView = [view parentComponent];
            }
            [superView moveHippySubview:view toIndex:index];
        }
        [superView clearSortedSubviews];
        [superView didUpdateHippySubviews];
    }];
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
        HippyShadowView *renderObject = [_shadowViewRegistry componentForTag:componentTag onRootTag:rootTag];
        if (renderObject) {
            [renderObject dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
            renderObject.frame = frame;
            renderObject.nodeLayoutResult = layoutResult;
            [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                UIView *view = viewRegistry[componentTag];
                /* do not use frame directly, because shadow view's frame possibly changed manually in
                 * [HippyShadowView collectRenderObjectHaveNewLayoutResults]
                 * This is a Wrong example:
                 * [view hippySetFrame:frame]
                 */
                [view hippySetFrame:renderObject.frame];
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
        NSArray * paramsArray = DomValueToOCType(&params);
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
        HippyPromiseResolveBlock senderBlock = ^(id senderParams) {
            std::shared_ptr<DomArgument> domArgument = std::make_shared<DomArgument>([senderParams toDomArgument]);
            cb(domArgument);
        };
        [finalParams addObject:senderBlock];
    }
    NSString *nativeModuleName = [NSString stringWithUTF8String:viewName.c_str()];

    HippyViewManager *viewManager = [self renderViewManagerForViewName:nativeModuleName];
    HippyComponentData *componentData = [self componentDataForViewName:nativeModuleName];
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
        NSError *error = HippyErrorWithMessage(message);
        HippyFatal(error);
        return nil;
    }
}

- (void)registerExtraComponent:(NSArray<Class> *)extraComponents {
    _extraComponents = extraComponents;
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
    HippyShadowView *renderObject = [self renderObjectForcomponentTag:@(node_id) onRootTag:@(root_id)];
    [renderObject addEventName:name];
    if (name == hippy::kClickEvent) {
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            [uiManager addClickEventListenerForView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kLongClickEvent) {
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            [uiManager addLongClickEventListenerForView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kTouchStartEvent || name == hippy::kTouchMoveEvent
               || name == hippy::kTouchEndEvent || name == hippy::kTouchCancelEvent) {
        std::string name_ = name;
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            [uiManager addTouchEventListenerForType:name_ forView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kShowEvent || name == hippy::kDismissEvent) {
        std::string name_ = name;
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            [uiManager addShowEventListenerForType:name_ forView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kPressIn || name == hippy::kPressOut) {
        std::string name_ = name;
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            [uiManager addPressEventListenerForType:name_ forView:node_id onRootNode:rootNode];
        }];
    } else if (name == kVSyncKey) {
        std::string name_ = name;
        auto weakDomManager = self.domManager;
        [self domNodeForComponentTag:node_id onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
            if (node) {
                //for kVSyncKey event, node is rootnode
                NSString *vsyncKey = [NSString stringWithFormat:@"%p-%d", self, node_id];
                auto event = std::make_shared<hippy::DomEvent>(name_, node);
                std::weak_ptr<DomNode> weakNode = node;
                [[RenderVsyncManager sharedInstance] registerVsyncObserver:^{
                    auto domManager = weakDomManager.lock();
                    if (domManager) {
                        std::function<void()> func = [weakNode, event](){
                            auto strongNode = weakNode.lock();
                            if (strongNode) {
                                strongNode->HandleEvent(event);
                            }
                        };
                        domManager->PostTask(hippy::Scene({func}));
                    }
                } forKey:vsyncKey];
            }
        }];
    }
    else {
        std::string name_ = name;
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
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
        __weak id weakSelf = self;
        [view addViewEvent:NativeRenderViewEventTypeClick eventListener:^(CGPoint point,
                                                                          BOOL canCapture,
                                                                          BOOL canBubble,
                                                                          BOOL canBePreventedInCapture,
                                                                          BOOL canBePreventedInBubbling) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForComponentTag:componentTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        auto event = std::make_shared<hippy::DomEvent>(hippy::kClickEvent, node,
                                                                       canCapture, canBubble,
                                                                       static_cast<std::shared_ptr<HippyValue>>(nullptr));
                        node->HandleEvent(event);
                        [strongSelf domEventDidHandle:hippy::kClickEvent forNode:componentTag onRoot:root_id];
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
        __weak id weakSelf = self;
        [view addViewEvent:NativeRenderViewEventTypeLongClick eventListener:^(CGPoint point,
                                                                              BOOL canCapture,
                                                                              BOOL canBubble,
                                                                              BOOL canBePreventedInCapture,
                                                                              BOOL canBePreventedInBubbling) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForComponentTag:componentTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        auto event = std::make_shared<hippy::DomEvent>(hippy::kLongClickEvent, node,
                                                                       canCapture, canBubble,
                                                                       static_cast<std::shared_ptr<HippyValue>>(nullptr));
                        node->HandleEvent(event);
                        [strongSelf domEventDidHandle:hippy::kLongClickEvent forNode:componentTag onRoot:root_id];
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
        std::string block_type = type;
        __weak id weakSelf = self;
        [view addViewEvent:eventType eventListener:^(CGPoint point,
                                                     BOOL canCapture,
                                                     BOOL canBubble,
                                                     BOOL canBePreventedInCapture,
                                                     BOOL canBePreventedInBubbling) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForComponentTag:componentTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        auto event = std::make_shared<hippy::DomEvent>(block_type, node,
                                                                       canCapture, canBubble,
                                                                       static_cast<std::shared_ptr<HippyValue>>(nullptr));
                        node->HandleEvent(event);
                        [strongSelf domEventDidHandle:block_type forNode:componentTag onRoot:root_id];
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
        const std::string type_ = type;
        __weak id weakSelf = self;
        [view addViewEvent:event_type eventListener:^(CGPoint point,
                                                      BOOL canCapture,
                                                      BOOL canBubble,
                                                      BOOL canBePreventedInCapture,
                                                      BOOL canBePreventedInBubbling) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForComponentTag:componentTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        footstone::value::HippyValue::HippyValueObjectType domValue;
                        domValue["page_x"] = footstone::value::HippyValue(point.x);
                        domValue["page_y"] = footstone::value::HippyValue(point.y);
                        std::shared_ptr<footstone::value::HippyValue> value = std::make_shared<footstone::value::HippyValue>(domValue);
                        auto event = std::make_shared<DomEvent>(type_, node, canCapture,
                                                                canBubble,value);
                        node->HandleEvent(event);
                        [strongSelf domEventDidHandle:type_ forNode:componentTag onRoot:root_id];
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
        __weak id weakSelf = self;
        std::string type_ = type;
        [view addViewEvent:event_type eventListener:^(CGPoint point,
                                                      BOOL canCapture,
                                                      BOOL canBubble,
                                                      BOOL canBePreventedInCapture,
                                                      BOOL canBePreventedInBubbling) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForComponentTag:componentTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        std::shared_ptr<HippyValue> domValue = std::make_shared<HippyValue>(true);
                        auto event = std::make_shared<DomEvent>(type_, node, canCapture, canBubble, domValue);
                        node->HandleEvent(event);
                        [strongSelf domEventDidHandle:type_ forNode:componentTag onRoot:root_id];
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
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = [uiManager viewForComponentTag:@(componentTag) onRootTag:@(root_id)];
            [view removeViewEvent:viewEventTypeFromName(name_.c_str())];
        }];
    } else if (eventName == kVSyncKey) {
       std::string name_ = eventName;
       [self domNodeForComponentTag:node_id onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
           if (node) {
               //for kVSyncKey event, node is rootnode
               NSString *vsyncKey = [NSString stringWithFormat:@"%p-%d", self, node_id];
               [[RenderVsyncManager sharedInstance] unregisterVsyncObserverForKey:vsyncKey];
           }
       }];
   } else {
        std::string name_ = eventName;
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = [viewRegistry objectForKey:@(componentTag)];
            [view removePropertyEvent:name_.c_str()];
        }];
    }
}

- (void)removeVSyncEventOnRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    NSString *vsyncKey = [NSString stringWithFormat:@"%p-%d", self, static_cast<int>(rootNode.lock()->GetId())];
    [[RenderVsyncManager sharedInstance] unregisterVsyncObserverForKey:vsyncKey];
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
        HippyComponentData *component = componentDataByName[viewName];
        NSDictionary<NSString *, NSString *> *eventMap = [component eventNameMap];
        NSString *mapToEventName = [eventMap objectForKey:[NSString stringWithUTF8String:name_.c_str()]];
        if (mapToEventName) {
            BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:name_.c_str()];
            BOOL canBePreventedInBubbling = [view canBePreventInBubbling:name_.c_str()];
            __weak id weakSelf = self;
            [view addPropertyEvent:[mapToEventName UTF8String] eventCallback:^(NSDictionary *body) {
                id strongSelf = weakSelf;
                if (strongSelf) {
                    [strongSelf domNodeForComponentTag:node_id onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> domNode) {
                        if (domNode) {
                            HippyValue value = [body toHippyValue];
                            std::shared_ptr<HippyValue> domValue = std::make_shared<HippyValue>(std::move(value));
                            auto event = std::make_shared<DomEvent>(name_, domNode, canBePreventedInCapturing,
                                                                    canBePreventedInBubbling, domValue);
                            domNode->HandleEvent(event);
                            [strongSelf domEventDidHandle:name_ forNode:node_id onRoot:root_id];
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
    HippyShadowView *rootView = [_shadowViewRegistry rootComponentForTag:@(root_id)];
    NSMutableSet<NativeRenderApplierBlock> *uiBlocks = [NSMutableSet setWithCapacity:128];
    [rootView amendLayoutBeforeMount:uiBlocks];
    if (uiBlocks.count) {
        [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
            for (NativeRenderApplierBlock block in uiBlocks) {
                block(viewRegistry);
            }
        }];
    }
    [self addUIBlock:^(HippyUIManager *uiManager, __unused NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        NSSet<id<HippyComponent>> *nodes = [uiManager->_componentTransactionListeners copy];
        for (id<HippyComponent> node in nodes) {
            [node hippyBridgeDidFinishTransaction];
        }
    }];
    [self flushUIBlocksOnRootNode:rootNode];
}

- (void)setNeedsLayoutForRootNodeTag:(NSNumber *)tag {
    // If there is an active batch layout will happen when batch finished, so we will wait for that.
    // Otherwise we immidiately trigger layout.
    auto rootNode = [_shadowViewRegistry rootNodeForTag:tag];
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

- (void)setRootViewSizeChangedEvent:(std::function<void(int32_t rootTag, NSDictionary *)>)cb {
    _rootViewSizeChangedCb = cb;
}

- (void)domEventDidHandle:(const std::string &)eventName forNode:(int32_t)tag onRoot:(int32_t)rootTag {
    
}

#pragma mark Debug Methods
#if HIPPY_DEBUG
- (std::shared_ptr<hippy::DomNode>)domNodeForTag:(int32_t)dom_tag onRootNode:(int32_t)root_tag {
    auto find = _domNodesMap.find(root_tag);
    if (_domNodesMap.end() == find) {
        return nullptr;
    }
    auto map = find->second;
    auto domFind = map.find(dom_tag);
    if (map.end() == domFind) {
        return nullptr;
    }
    return domFind->second;
}
- (std::vector<std::shared_ptr<hippy::DomNode>>)childrenForNodeTag:(int32_t)tag onRootNode:(int32_t)root_tag {
    auto node = [self domNodeForTag:tag onRootNode:root_tag];
    return node ? node->GetChildren() : std::vector<std::shared_ptr<hippy::DomNode>>{};
}
#endif

@end


@implementation HippyBridge (HippyUIManager)

- (HippyUIManager *)uiManager {
    auto renderManager = [self renderManager];
    if (renderManager) {
        auto nativeRenderManager = std::static_pointer_cast<NativeRenderManager>(renderManager);
        return nativeRenderManager->GetHippyUIManager();
    }
    return nil;
}

@end


