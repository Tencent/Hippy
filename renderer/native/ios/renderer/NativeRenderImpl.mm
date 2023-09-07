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

#import "HPAsserts.h"
#import "HPDomUtils.h"
#import "HPFootstoneUtils.h"
#import "HPOCToDomArgument.h"
#import "HPOCToHippyValue.h"
#import "HPImageProviderProtocol.h"
#import "HPToolUtils.h"
#import "NativeRenderComponentProtocol.h"
#import "NativeRenderComponentData.h"
#import "NativeRenderComponentMap.h"
#import "NativeRenderImpl.h"
#import "NativeRenderObjectRootView.h"
#import "NativeRenderObjectView.h"
#import "NativeRenderUtils.h"
#import "NativeRenderView.h"
#import "NativeRenderViewManager.h"
#import "RenderVsyncManager.h"
#import "UIView+DomEvent.h"
#import "UIView+NativeRender.h"
#import "UIView+Render.h"
#import "NSObject+Render.h"

#include <mutex>

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

static NSMutableArray<Class> *NativeRenderViewManagerClasses = nil;
NSArray<Class> *NativeRenderGetViewManagerClasses(void) {
    return NativeRenderViewManagerClasses;
}

HP_EXTERN void NativeRenderRegisterView(Class);
void NativeRenderRegisterView(Class moduleClass) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        NativeRenderViewManagerClasses = [NSMutableArray new];
    });
    HPAssert([moduleClass respondsToSelector:@selector(viewName)], @"%@ must respond to selector viewName", NSStringFromClass(moduleClass));
    [NativeRenderViewManagerClasses addObject:moduleClass];
}

static NSString *GetViewNameFromViewManagerClass(Class cls) {
    HPAssert([cls respondsToSelector:@selector(viewName)], @"%@ must respond to selector viewName", NSStringFromClass(cls));
    NSString *viewName = [cls performSelector:@selector(viewName)];
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

static void NativeRenderTraverseViewNodes(id<NativeRenderComponentProtocol> view, void (^block)(id<NativeRenderComponentProtocol>)) {
    if (view.componentTag) {
        block(view);
        for (id<NativeRenderComponentProtocol> subview in view.subcomponents) {
            NativeRenderTraverseViewNodes(subview, block);
        }
    }
}

#define AssertMainQueue() NSAssert(HPIsMainQueue(), @"This function must be called on the main thread")

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

    // Listeners such as ScrollView/ListView etc. witch will listen to start layout event
    // The implementation here needs to be improved to provide a registration mechanism.
    NSHashTable<id<NativeRenderComponentProtocol>> *_componentTransactionListeners;

    std::weak_ptr<DomManager> _domManager;
    std::mutex _renderQueueLock;
    NSMutableDictionary<NSString *, id> *_viewManagers;
    NSArray<Class> *_extraComponents;
    
    std::weak_ptr<VFSUriLoader> _VFSUriLoader;
    NSMutableArray<Class<HPImageProviderProtocol>> *_imageProviders;
    std::mutex _imageProviderMutex;
    
    std::function<void(int32_t, NSDictionary *)> _rootViewSizeChangedCb;
    std::weak_ptr<hippy::RenderManager> _renderManager;
}

@end

@implementation NativeRenderImpl

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
    _renderObjectRegistry = [[NativeRenderComponentMap alloc] init];
    _viewRegistry = [[NativeRenderComponentMap alloc] init];
    _viewRegistry.requireInMainThread = YES;
    _pendingUIBlocks = [NSMutableArray new];
    _componentTransactionListeners = [NSHashTable weakObjectsHashTable];
    _componentDataByName = [NSMutableDictionary dictionaryWithCapacity:64];
    NativeRenderScreenScale();
    NativeRenderScreenSize();
}

- (void)invalidate {
    _pendingUIBlocks = nil;
    __weak __typeof(self) weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        NativeRenderImpl *strongSelf = weakSelf;
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

- (std::weak_ptr<hippy::RenderManager>)renderManager {
    return _renderManager;
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

#if HP_DEBUG
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
            renderObject.rootNode = rootNode;
            renderObject.domNode = rootNode;
            [strongSelf->_renderObjectRegistry addRootComponent:renderObject rootNode:rootNode forTag:componentTag];
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
    [_renderObjectRegistry removeRootComponentWithTag:rootTag];
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSKeyValueChangeKey,id> *)change context:(void *)context {
    if ([keyPath isEqualToString:@"frame"] && [object isKindOfClass:[UIView class]]) {
        CGRect curFrame = [change[NSKeyValueChangeNewKey] CGRectValue];
        CGRect oriFrame = [change[NSKeyValueChangeOldKey] CGRectValue];
        if (!CGRectEqualToRect(curFrame, oriFrame)) {
            UIView *rootView = (UIView *)object;
            NSNumber *rootTag = [rootView componentTag];
            auto rootNode = [_viewRegistry rootNodeForTag:rootTag].lock();
            auto domManager = _domManager.lock();
            if (rootNode && domManager) {
                NSDictionary *params = @{@"oldWidth": @(CGRectGetWidth(oriFrame)), @"oldHeight": @(CGRectGetHeight(oriFrame)),
                                         @"width": @(CGRectGetWidth(curFrame)), @"height": @(CGRectGetHeight(curFrame)),
                                         @"rootViewId": rootTag
                };
                auto value = std::make_shared<footstone::HippyValue>([params toHippyValue]);
                auto event = std::make_shared<DomEvent>("onSizeChanged", rootNode, NO, NO, value);
                __weak NativeRenderImpl *weakSelf = self;
                std::function<void()> func = [weakSelf, rootNode, event, rootTag](){
                    rootNode->HandleEvent(event);
                    NativeRenderImpl *strongSelf = weakSelf;
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
         fromRegistry:(NSMutableDictionary<NSNumber *, __kindof id<NativeRenderComponentProtocol>> *)registry {
    for (id<NativeRenderComponentProtocol> child in children) {
        NativeRenderTraverseViewNodes(registry[child.componentTag], ^(id<NativeRenderComponentProtocol> subview) {
            NSAssert(![subview isNativeRenderRootView], @"Root views should not be unregistered");
            if ([subview respondsToSelector:@selector(invalidate)]) {
                [subview performSelector:@selector(invalidate)];
            }
            [registry removeObjectForKey:subview.componentTag];
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
    HPAssert(renderObject.viewName, @"view name is needed for creating a view");
    NativeRenderComponentData *componentData = [self componentDataForViewName:renderObject.viewName];
    UIView *view = [self createViewByComponentData:componentData
                                      componentTag:renderObject.componentTag
                                           rootTag:renderObject.rootTag
                                        properties:renderObject.props
                                          viewName:renderObject.viewName];
    view.renderManager = [self renderManager];
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
    return [self createViewRecursiveFromRenderObjectWithNOLock:renderObject];
}

- (UIView *)createViewRecursiveFromRenderObjectWithNOLock:(NativeRenderObjectView *)renderObject {
    UIView *view = [self createViewFromRenderObject:renderObject];
    NSUInteger index = 0;
    for (NativeRenderObjectView *subRenderObject in renderObject.subcomponents) {
        UIView *subview = [self createViewRecursiveFromRenderObjectWithNOLock:subRenderObject];
        [view insertNativeRenderSubview:subview atIndex:index];
        index++;
    }
    view.nativeRenderObjectView = renderObject;
    view.renderManager = [self renderManager];
    [view clearSortedSubviews];
    [view didUpdateNativeRenderSubviews];
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
        renderObject.domNode = domNode;
        renderObject.rootNode = rootNode;
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
        view.renderManager = [self renderManager];
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
    newProps = [renderObject mergeProps:props];
    virtualProps = renderObject.props;
    [componentData setProps:newProps forRenderObjectView:renderObject];
    [renderObject dirtyPropagation:NativeRenderUpdateLifecyclePropsDirtied];
    [self addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[componentTag];
        [componentData setProps:newProps forView:view];
    }];
}

#pragma mark Render Context Implementation
- (__kindof NativeRenderViewManager *)renderViewManagerForViewName:(NSString *)viewName {
    if (!_viewManagers) {
        _viewManagers = [NSMutableDictionary dictionaryWithCapacity:64];
        if (_extraComponents) {
            for (Class cls in _extraComponents) {
                NSString *viewName = GetViewNameFromViewManagerClass(cls);
                HPAssert(![_viewManagers objectForKey:viewName],
                         @"duplicated component %@ for class %@ and %@", viewName,
                         NSStringFromClass(cls),
                         NSStringFromClass([_viewManagers objectForKey:viewName]));
                [_viewManagers setObject:cls forKey:viewName];
            }
        }
        NSArray<Class> *classes = NativeRenderGetViewManagerClasses();
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
        NativeRenderViewManager *viewManager = [object new];
        viewManager.renderImpl = self;
        NSAssert([viewManager isKindOfClass:[NativeRenderViewManager class]], @"It must be a NativeRenderViewManager instance");
        [_viewManagers setObject:viewManager forKey:viewName];
        object = viewManager;
    }
    return object;
}

- (NSArray<__kindof UIView *> *)rootViews {
    return (NSArray<__kindof UIView *> *)[_viewRegistry rootComponents];
}

#pragma mark Schedule Block

- (void)addUIBlock:(NativeRenderRenderUIBlock)block {
    if (!block || !_viewRegistry) {
        return;
    }

    [_pendingUIBlocks addObject:block];
}

- (void)amendPendingUIBlocksWithStylePropagationUpdateForRenderObject:(NativeRenderObjectView *)topView {
    NSMutableSet<NativeRenderApplierBlock> *applierBlocks = [NSMutableSet setWithCapacity:256];

    [topView collectUpdatedProperties:applierBlocks parentProperties:@{}];
    if (applierBlocks.count) {
        [self addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
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
#if HP_DEBUG
    auto &nodeMap = _domNodesMap[strongRootNode->GetId()];
    for (auto node : nodes) {
        nodeMap[node->GetId()] = node;
    }
#endif
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
        [superRenderObject didUpdateNativeRenderSubviews];
    }];
    for (const std::shared_ptr<DomNode> &node : nodes) {
        NSNumber *componentTag = @(node->GetId());
        NativeRenderObjectView *renderObject = [_renderObjectRegistry componentForTag:componentTag onRootTag:rootNodeTag];
        if (NativeRenderCreationTypeInstantly == [renderObject creationType] && !_uiCreationLazilyEnabled) {
            [self addUIBlock:^(NativeRenderImpl *renderContext, __unused NSDictionary<NSNumber *,UIView *> *viewRegistry) {
                UIView *view = [renderContext createViewFromRenderObject:renderObject];
                view.nativeRenderObjectView = renderObject;
                view.renderManager = [renderContext renderManager];
            }];
        }
    }
    [manager enumerateViewsHierarchy:^(int32_t tag, const std::vector<int32_t> &subviewTags, const std::vector<int32_t> &subviewIndices) {
        auto subViewTags_ = subviewTags;
        auto subViewIndices_ = subviewIndices;
        NativeRenderObjectView *renderObject = [self->_renderObjectRegistry componentForTag:@(tag) onRootTag:rootNodeTag];
        if (NativeRenderCreationTypeInstantly == [renderObject creationType] && !self->_uiCreationLazilyEnabled) {
            [self addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                UIView *superView = viewRegistry[@(tag)];
                for (NSUInteger index = 0; index < subViewTags_.size(); index++) {
                    UIView *subview = viewRegistry[@(subViewTags_[index])];
                    if (subview) {
                        [superView insertNativeRenderSubview:subview atIndex:subViewIndices_[index]];
                    }
                }
                [superView clearSortedSubviews];
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
#if HP_DEBUG
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
#if HP_DEBUG
    auto &nodeMap = _domNodesMap[strongRootNode->GetId()];
    for (auto node : nodes) {
        nodeMap[node->GetId()] = nullptr;
    }
#endif
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    NSNumber *rootTag = @(strongRootNode->GetId());
    NSMutableDictionary *currentRegistry = [_renderObjectRegistry componentsForRootTag:rootTag];
    
    for (auto dom_node : nodes) {
        int32_t tag = dom_node->GetRenderInfo().id;
        NativeRenderObjectView *renderObject = [currentRegistry objectForKey:@(tag)];
        [renderObject dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
        if (renderObject) {
            [renderObject removeFromNativeRenderSuperview];
            [self purgeChildren:@[renderObject] onRootTag:rootTag fromRegistry:currentRegistry];
        }
    }
    __weak NativeRenderImpl *weakSelf = self;
    auto strongNodes = std::move(nodes);
    [self addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        NativeRenderImpl *strongSelf = weakSelf;
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
            [view removeFromNativeRenderSuperview];
            [views addObject:view];
        }
        NSMutableDictionary *currentViewRegistry = [strongSelf->_viewRegistry componentsForRootTag:rootTag];
        [strongSelf purgeChildren:views onRootTag:rootTag fromRegistry:currentViewRegistry];
        for (UIView *view in parentViews) {
            [view clearSortedSubviews];
            [view didUpdateNativeRenderSubviews];
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
    
    NativeRenderObjectView *fromObjectView = [_renderObjectRegistry componentForTag:@(fromContainer)
                                                                          onRootTag:@(rootTag)];
    NativeRenderObjectView *toObjectView = [_renderObjectRegistry componentForTag:@(toContainer)
                                                                        onRootTag:@(rootTag)];
    for (int32_t componentTag : ids) {
        NativeRenderObjectView *view = [_renderObjectRegistry componentForTag:@(componentTag) onRootTag:@(rootTag)];
        HPAssert(fromObjectView == [view parentComponent], @"parent of object view with tag %d is not object view with tag %d", componentTag, fromContainer);
        [view removeFromNativeRenderSuperview];
        [toObjectView insertNativeRenderSubview:view atIndex:index];
    }
    [fromObjectView dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
    [toObjectView dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
    [fromObjectView didUpdateNativeRenderSubviews];
    [toObjectView didUpdateNativeRenderSubviews];
    auto strongTags = std::move(ids);
    [self addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        UIView *fromView = [viewRegistry objectForKey:@(fromContainer)];
        UIView *toView = [viewRegistry objectForKey:@(toContainer)];
        for (int32_t tag : strongTags) {
            UIView *view = [viewRegistry objectForKey:@(tag)];
            if (!view) {
                continue;
            }
            HPAssert(fromView == [view parentComponent], @"parent of object view with tag %d is not object view with tag %d", tag, fromContainer);
            [view removeFromNativeRenderSuperview];
            [toView insertNativeRenderSubview:view atIndex:index];
        }
        [fromView clearSortedSubviews];
        [fromView didUpdateNativeRenderSubviews];
        [toView clearSortedSubviews];
        [toView didUpdateNativeRenderSubviews];
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
    NativeRenderObjectView *parentObjectView = nil;
    for (auto &node : nodes) {
        int32_t index = node->GetRenderInfo().index;
        int32_t componentTag = node->GetId();
        NativeRenderObjectView *objectView = [_renderObjectRegistry componentForTag:@(componentTag) onRootTag:@(rootTag)];
        [objectView dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
        HPAssert(!parentObjectView || parentObjectView == [objectView parentComponent], @"try to move object view on different parent object view");
        if (!parentObjectView) {
            parentObjectView = [objectView parentComponent];
        }
        [parentObjectView moveNativeRenderSubview:objectView toIndex:index];
    }
    [parentObjectView didUpdateNativeRenderSubviews];
    auto strongNodes = std::move(nodes);
    [self addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        UIView *superView = nil;
        for (auto node : strongNodes) {
            int32_t index = node->GetIndex();
            int32_t componentTag = node->GetId();
            UIView *view = [viewRegistry objectForKey:@(componentTag)];
            if (!view) {
                continue;
            }
            HPAssert(!superView || superView == [view parentComponent], @"try to move views on different parent views");
            if (!superView) {
                superView = [view parentComponent];
            }
            [superView moveNativeRenderSubview:view toIndex:index];
        }
        [superView clearSortedSubviews];
        [superView didUpdateNativeRenderSubviews];
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
        NativeRenderObjectView *renderObject = [_renderObjectRegistry componentForTag:componentTag onRootTag:rootTag];
        if (renderObject) {
            [renderObject dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
            renderObject.frame = frame;
            renderObject.nodeLayoutResult = layoutResult;
            [self addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
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
        NSError *error = HPErrorWithMessage(message);
        HPFatal(error, nil);
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
    NativeRenderObjectView *renderObject = [self renderObjectForcomponentTag:@(node_id) onRootTag:@(root_id)];
    [renderObject addEventName:name];
    if (name == hippy::kClickEvent) {
        [self addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
            [uiManager addClickEventListenerForView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kLongClickEvent) {
        [self addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
            [uiManager addLongClickEventListenerForView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kTouchStartEvent || name == hippy::kTouchMoveEvent
               || name == hippy::kTouchEndEvent || name == hippy::kTouchCancelEvent) {
        std::string name_ = name;
        [self addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
            [uiManager addTouchEventListenerForType:name_ forView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kShowEvent || name == hippy::kDismissEvent) {
        std::string name_ = name;
        [self addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
            [uiManager addShowEventListenerForType:name_ forView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kPressIn || name == hippy::kPressOut) {
        std::string name_ = name;
        [self addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
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
        [self addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
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
        [self addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
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
        [self addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = [viewRegistry objectForKey:@(componentTag)];
            [view removePropertyEvent:name_.c_str()];
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
    NativeRenderObjectView *rootView = [_renderObjectRegistry rootComponentForTag:@(root_id)];
    NSMutableSet<NativeRenderApplierBlock> *uiBlocks = [NSMutableSet setWithCapacity:128];
    [rootView amendLayoutBeforeMount:uiBlocks];
    if (uiBlocks.count) {
        [self addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
            for (NativeRenderApplierBlock block in uiBlocks) {
                block(viewRegistry);
            }
        }];
    }
    [self addUIBlock:^(NativeRenderImpl *renderContext, __unused NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        NativeRenderImpl *uiManager = (NativeRenderImpl *)renderContext;
        NSSet<id<NativeRenderComponentProtocol>> *nodes = [uiManager->_componentTransactionListeners copy];
        for (id<NativeRenderComponentProtocol> node in nodes) {
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

- (void)addImageProviderClass:(Class<HPImageProviderProtocol>)cls {
    HPAssertParam(cls);
    std::lock_guard<std::mutex> lock(_imageProviderMutex);
    if (!_imageProviders) {
        _imageProviders = [NSMutableArray arrayWithCapacity:8];
    }
    [_imageProviders addObject:cls];
}
- (NSArray<Class<HPImageProviderProtocol>> *)imageProviderClasses {
    std::lock_guard<std::mutex> lock(_imageProviderMutex);
    if (!_imageProviders) {
        _imageProviders = [NSMutableArray arrayWithCapacity:8];
    }
    return [_imageProviders copy];
}

- (void)setVFSUriLoader:(std::weak_ptr<VFSUriLoader>)loader {
    _VFSUriLoader = loader;
}

- (std::weak_ptr<VFSUriLoader>)VFSUriLoader {
    return _VFSUriLoader;
}

- (void)setRootViewSizeChangedEvent:(std::function<void(int32_t rootTag, NSDictionary *)>)cb {
    _rootViewSizeChangedCb = cb;
}

- (void)domEventDidHandle:(const std::string &)eventName forNode:(int32_t)tag onRoot:(int32_t)rootTag {
    
}

#pragma mark Debug Methods
#if HP_DEBUG
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

