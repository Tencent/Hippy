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

#import "HippyUIManager.h"

#import <AVFoundation/AVFoundation.h>
#import "HippyAnimationType.h"
#import "HippyComponent.h"
#import "HippyComponentData.h"
#import "HippyConvert.h"
#import "HippyRootShadowView.h"
#import "HippyShadowView.h"
#import "HippyUtils.h"
#import "HippyView.h"
#import "HippyViewManager.h"
#import "UIView+Hippy.h"
#import "UIView+Private.h"
#import "HippyMemoryOpt.h"
#import "HippyDeviceBaseInfo.h"
#import "OCTypeToDomArgument.h"
#import "UIView+HippyEvent.h"
#import "objc/runtime.h"
#import "UIView+Render.h"
#import "RenderErrorHandler.h"
#import "RenderVsyncManager.h"
#include <mutex>
#import "HippyComponentMap.h"
#import "dom/root_node.h"

using DomValue = tdf::base::DomValue;
using DomArgument = hippy::dom::DomArgument;
using DomManager = hippy::DomManager;
using DomNode = hippy::DomNode;
using LayoutResult = hippy::LayoutResult;
using DomValueType = tdf::base::DomValue::Type;
using DomValueNumberType = tdf::base::DomValue::NumberType;
using LayoutResult = hippy::LayoutResult;
using RenderInfo = hippy::DomNode::RenderInfo;
using CallFunctionCallback = hippy::CallFunctionCallback;
using DomEvent = hippy::DomEvent;
using RootNode = hippy::RootNode;

using HPViewBinding = std::unordered_map<int32_t, std::tuple<std::vector<int32_t>, std::vector<int32_t>>>;

constexpr char kVSyncKey[] = "frameupdate";

@interface HippyViewsRelation : NSObject {
    HPViewBinding _viewRelation;

}

- (void)addViewTag:(int32_t)viewTag forSuperViewTag:(int32_t)superviewTag atIndex:(int32_t)index;

- (void)enumerateViewsRelation:(void (^)(NSNumber *, NSArray<NSNumber *> *, NSArray<NSNumber *> *))block;

- (void)removeAllObjects;

@end

@implementation HippyViewsRelation

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

static void HippyTraverseViewNodes(id<HippyComponent> view, void (^block)(id<HippyComponent>)) {
    if (view.hippyTag) {
        block(view);
        for (id<HippyComponent> subview in view.hippySubviews) {
            HippyTraverseViewNodes(subview, block);
        }
    }
}

#define AssertMainQueue() NSAssert(HippyIsMainQueue(), @"This function must be called on the main thread")

const char *HippyUIManagerQueueName = "com.tencent.hippy.ShadowQueue";
NSString *const HippyUIManagerDidRegisterRootViewNotification = @"HippyUIManagerDidRegisterRootViewNotification";
NSString *const HippyUIManagerRootViewKey = @"HippyUIManagerRootViewKey";
NSString *const HippyUIManagerKey = @"HippyUIManagerKey";
NSString *const HippyUIManagerDidEndBatchNotification = @"HippyUIManagerDidEndBatchNotification";

@interface HippyUIManager() {
    NSMutableArray<HippyRenderUIBlock> *_pendingUIBlocks;

    HippyComponentMap *_shadowViewRegistry;
    HippyComponentMap *_viewRegistry;

    // Keyed by viewName
    NSMutableDictionary<NSString *, HippyComponentData *> *_componentDataByName;

    NSMutableSet<id<HippyComponent>> *_componentTransactionListeners;

    std::weak_ptr<DomManager> _domManager;
    std::mutex _shadowQueueLock;
    NSMutableDictionary<NSString *, id> *_viewManagers;
    NSDictionary<NSString *, Class> *_extraComponent;
}

@end

@implementation HippyUIManager

@synthesize frameworkProxy = _frameworkProxy;
@synthesize domManager = _domManager;

#pragma mark Life cycle

- (instancetype)init {
    self = [super init];
    if (self) {
        NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
        [center addObserver:self selector:@selector(didReceiveMemoryWarning) name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
        [center addObserver:self selector:@selector(appDidEnterBackground) name:UIApplicationDidEnterBackgroundNotification object:nil];
        [center addObserver:self selector:@selector(appWillEnterForeground) name:UIApplicationWillEnterForegroundNotification object:nil];
        [self initContext];
    }
    return self;
}

- (void)dealloc {
}

- (void)initContext {
    _shadowViewRegistry = [[HippyComponentMap alloc] init];
    _viewRegistry = [[HippyComponentMap alloc] init];
    _pendingUIBlocks = [NSMutableArray new];
    _componentTransactionListeners = [NSMutableSet new];
    _componentDataByName = [NSMutableDictionary dictionaryWithCapacity:64];
}

- (void)didReceiveMemoryWarning {
}

- (void)appDidEnterBackground {
}
- (void)appWillEnterForeground {
}

- (void)invalidate {
    _pendingUIBlocks = nil;
    __weak __typeof(self) weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        HippyUIManager *strongSelf = weakSelf;
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

- (void)domNodeForHippyTag:(int32_t)hippyTag
                onRootNode:(std::weak_ptr<RootNode>)rootNode
                resultNode:(void (^)(std::shared_ptr<DomNode>))resultBlock {
    if (resultBlock) {
        auto domManager = _domManager.lock();
        if (domManager) {
            std::vector<std::function<void()>> ops_ = {[hippyTag, rootNode, domManager, resultBlock](){
                @autoreleasepool {
                    auto node = domManager->GetNode(rootNode, hippyTag);
                    resultBlock(node);
                }
            }};
            domManager->PostTask(hippy::dom::Scene(std::move(ops_)));
        }
    }
}

- (HippyComponentMap *)shadowViewRegistry {
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

- (__kindof UIView *)viewFromRenderViewTag:(NSNumber *)hippyTag
                                 onRootTag:(NSNumber *)rootTag {
    return [self viewForHippyTag:hippyTag onRootTag:rootTag];
}

- (UIView *)viewForHippyTag:(NSNumber *)hippyTag
                  onRootTag:(NSNumber *)rootTag {
    AssertMainQueue();
    return [_viewRegistry componentForTag:hippyTag onRootTag:rootTag];
}

- (HippyShadowView *)shadowViewForHippyTag:(NSNumber *)hippyTag
                                 onRootTag:(NSNumber *)rootTag {
    return [_shadowViewRegistry componentForTag:hippyTag onRootTag:rootTag];
}

- (std::mutex &)shadowQueueLock {
    return _shadowQueueLock;
}

dispatch_queue_t HippyGetUIManagerQueue(void) {
    static dispatch_queue_t shadowQueue;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        if ([NSOperation instancesRespondToSelector:@selector(qualityOfService)]) {
            dispatch_queue_attr_t attr = dispatch_queue_attr_make_with_qos_class(DISPATCH_QUEUE_SERIAL, QOS_CLASS_USER_INTERACTIVE, 0);
            shadowQueue = dispatch_queue_create(HippyUIManagerQueueName, attr);
        } else {
            shadowQueue = dispatch_queue_create(HippyUIManagerQueueName, DISPATCH_QUEUE_SERIAL);
            dispatch_set_target_queue(shadowQueue, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0));
        }
    });
    return shadowQueue;
}

- (dispatch_queue_t)methodQueue {
    return HippyGetUIManagerQueue();
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

    NSNumber *hippyTag = rootView.hippyTag;
    NSAssert(HippyIsHippyRootView(hippyTag), @"View %@ with tag #%@ is not a root view", rootView, hippyTag);

#if HIPPY_DEBUG
    NSAssert(![_viewRegistry containRootComponentWithTag:hippyTag], @"RootView Tag already exists. Added %@ twice", hippyTag);
#endif
    // Register view
    [_viewRegistry addRootComponent:rootView rootNode:rootNode forTag:hippyTag];

    CGRect frame = rootView.frame;

    UIColor *backgroundColor = [rootView backgroundColor];
    // Register shadow view
    __weak HippyUIManager *weakSelf = self;
    __weak id vr = _viewRegistry;
    dispatch_async(HippyGetUIManagerQueue(), ^{
        if (!vr && !weakSelf) {
            return;
        }
        __strong HippyUIManager *strongSelf = weakSelf;
        std::lock_guard<std::mutex> lock([self shadowQueueLock]);
        HippyRootShadowView *shadowView = [HippyRootShadowView new];
        shadowView.hippyTag = hippyTag;
        shadowView.frame = frame;
        shadowView.backgroundColor = backgroundColor;
        shadowView.viewName = NSStringFromClass([rootView class]);
        [strongSelf->_shadowViewRegistry addRootComponent:shadowView rootNode:rootNode forTag:hippyTag];
    });

    [[NSNotificationCenter defaultCenter] postNotificationName:HippyUIManagerDidRegisterRootViewNotification object:self
                                                      userInfo:@{ HippyUIManagerRootViewKey: rootView, HippyUIManagerKey: self}];
}


- (void)setFrame:(CGRect)frame forRootView:(UIView *)view {
    AssertMainQueue();
    NSNumber *hippyTag = view.hippyTag;
    auto domManager = _domManager.lock();
    if (!domManager) {
        return;
    }
    __weak id weakSelf = self;
    std::vector<std::function<void()>> ops_ = {[hippyTag, weakSelf, frame]() {
        if (!weakSelf) {
            return;
        }
        HippyUIManager *strongSelf = weakSelf;
        HippyShadowView *shadowView = [strongSelf->_shadowViewRegistry rootComponentForTag:hippyTag];
        if (shadowView == nil) {
            return;
        }
        if (!CGRectEqualToRect(frame, shadowView.frame)) {
            shadowView.frame = frame;
            std::weak_ptr<RootNode> rootNode = [strongSelf->_shadowViewRegistry rootNodeForTag:hippyTag];
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
         fromRegistry:(HippyComponentMap *)componentMap {
    NSMutableDictionary<NSNumber *, __kindof id<HippyComponent>> *registry = [componentMap componentsForRootTag:rootTag];
    for (id<HippyComponent> child in children) {
        HippyTraverseViewNodes(registry[child.hippyTag], ^(id<HippyComponent> subview) {
            NSAssert(![subview isHippyRootView], @"Root views should not be unregistered");
            if ([subview conformsToProtocol:@protocol(HippyInvalidating)]) {
                [(id<HippyInvalidating>)subview invalidate];
            }
            [registry removeObjectForKey:subview.hippyTag];
            if (registry == (NSMutableDictionary<NSNumber *, id<HippyComponent>> *)self->_viewRegistry) {
                [self->_componentTransactionListeners removeObject:subview];
            }
        });
    }
}

- (void)purgeViewsFromHippyTags:(NSArray<NSNumber *> *)hippyTags onRootTag:(NSNumber *)rootTag {
    for (NSNumber *hippyTag in hippyTags) {
        UIView *view = [self viewForHippyTag:hippyTag onRootTag:rootTag];
        HippyComponentMap *componentMap = _viewRegistry;
        HippyTraverseViewNodes(view, ^(id<HippyComponent> subview) {
            NSAssert(![subview isHippyRootView], @"Root views should not be unregistered");
            [componentMap removeComponent:subview forRootTag:rootTag];
        });
    }
}

- (void)purgeChildren:(NSArray<id<HippyComponent>> *)children fromRegistry:(NSMutableDictionary<NSNumber *, id<HippyComponent>> *)registry {
    for (id<HippyComponent> child in children) {
        HippyTraverseViewNodes(registry[child.hippyTag], ^(id<HippyComponent> subview) {
            NSAssert(![subview isHippyRootView], @"Root views should not be unregistered");
            if ([subview conformsToProtocol:@protocol(HippyInvalidating)]) {
                //TODO HippyInvalidating belong to hippy, remove it
                [(id<HippyInvalidating>)subview invalidate];
            }
            [registry removeObjectForKey:subview.hippyTag];
            if (registry == (NSMutableDictionary<NSNumber *, id<HippyComponent>> *)self->_viewRegistry) {
                [self->_componentTransactionListeners removeObject:subview];
            }
        });
    }
}

- (void)removeChildren:(NSArray<id<HippyComponent>> *)children fromContainer:(id<HippyComponent>)container {
    for (id<HippyComponent> removedChild in children) {
        [container removeHippySubview:removedChild];
    }
}

- (UIView *)createViewRecursivelyFromHippyTag:(NSNumber *)hippyTag 
                                    onRootTag:(NSNumber *)rootTag {
    HippyShadowView *shadowView = [_shadowViewRegistry componentForTag:hippyTag onRootTag:rootTag];
    return [self createViewRecursivelyFromShadowView:shadowView];
}

- (UIView *)createViewFromShadowView:(HippyShadowView *)shadowView {
    AssertMainQueue();
    HippyComponentData *componentData = [self componentDataForViewName:shadowView.viewName];
    UIView *view = [self createViewByComponentData:componentData hippyTag:shadowView.hippyTag rootTag:shadowView.rootTag properties:shadowView.props viewName:shadowView.viewName];
    view.renderContext = self;
    [view hippySetFrame:shadowView.frame];
    const std::vector<std::string> &eventNames = [shadowView allEventNames];
    for (auto &event : eventNames) {
        [self addEventNameInMainThread:event forDomNodeId:[shadowView.hippyTag intValue] onRootNode:shadowView.rootNode];
    }
    return view;
}

- (UIView *)createViewRecursivelyFromShadowView:(HippyShadowView *)shadowView {
    AssertMainQueue();
    std::lock_guard<std::mutex> lock([self shadowQueueLock]);
    [shadowView dirtyDescendantPropagation];
    return [self createViewRecursiveFromShadowViewWithNOLock:shadowView];
}

- (UIView *)createViewRecursiveFromShadowViewWithNOLock:(HippyShadowView *)shadowView {
    UIView *view = [self createViewFromShadowView:shadowView];
    NSUInteger index = 0;
    for (HippyShadowView *subShadowView in shadowView.hippySubviews) {
        UIView *subview = [self createViewRecursiveFromShadowViewWithNOLock:subShadowView];
        [view insertHippySubview:subview atIndex:index];
        index++;
    }
    view.hippyShadowView = shadowView;
    view.renderContext = self;
    [view clearSortedSubviews];
    [view didUpdateHippySubviews];
    NSMutableSet<HippyApplierBlock> *applierBlocks = [NSMutableSet setWithCapacity:1];
    [shadowView collectUpdatedProperties:applierBlocks parentProperties:@{}];
    if (applierBlocks.count) {
        NSDictionary<NSNumber *, UIView *> *viewRegistry =
            [_viewRegistry componentsForRootTag:shadowView.rootTag];
        for (HippyApplierBlock block in applierBlocks) {
            block(viewRegistry);
        }
    }
    return view;
}

- (NSDictionary *)createShadowViewFromNode:(const std::shared_ptr<hippy::DomNode> &)domNode
                                onRootNode:(std::weak_ptr<RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode || !domNode) {
        return @{};
    }
    int32_t root_id = strongRootNode->GetId();
    NSNumber *rootTag = @(root_id);
    NSNumber *hippyTag = @(domNode->GetId());
    NSString *viewName = [NSString stringWithUTF8String:domNode->GetViewName().c_str()];
    NSString *tagName = [NSString stringWithUTF8String:domNode->GetTagName().c_str()];
    NSMutableDictionary *props = [stylesFromDomNode(domNode) mutableCopy];
    HippyComponentData *componentData = [self componentDataForViewName:viewName];
    HippyShadowView *shadowView = [componentData createShadowViewWithTag:hippyTag];
    shadowView.rootNode = rootNode;
    NSAssert(componentData && shadowView, @"componentData and shadowView must not be nil");
    [props setValue: rootTag forKey: @"rootTag"];
    // Register shadow view
    if (shadowView) {
        shadowView.hippyTag = hippyTag;
        shadowView.rootTag = rootTag;
        shadowView.viewName = viewName;
        shadowView.tagName = tagName;
        shadowView.props = props;
        shadowView.domManager = _domManager;
        shadowView.nodeLayoutResult = domNode->GetLayoutResult();
        shadowView.frame = CGRectMakeFromLayoutResult(domNode->GetLayoutResult());
        [componentData setProps:props forShadowView:shadowView];
        [_shadowViewRegistry addComponent:shadowView forRootTag:rootTag];
    }
    return props;
}

- (UIView *)createViewByComponentData:(HippyComponentData *)componentData
                             hippyTag:(NSNumber *)hippyTag
                              rootTag:(NSNumber *)rootTag
                           properties:(NSDictionary *)props
                             viewName:(NSString *)viewName {
    UIView *view = [self viewForHippyTag:hippyTag onRootTag:rootTag];
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
        view = [componentData createViewWithTag:hippyTag initProps:props];
    }
    if (view) {
        view.viewName = viewName;
        view.rootTag = rootTag;
        view.renderContext = self;
        [componentData setProps:props forView:view];  // Must be done before bgColor to prevent wrong default

        if ([view respondsToSelector:@selector(hippyComponentDidFinishTransaction)]) {
            [self->_componentTransactionListeners addObject:view];
        }
        [_viewRegistry addComponent:view forRootTag:rootTag];
    }
    return view;
}

- (void)updateView:(nonnull NSNumber *)hippyTag
         onRootTag:(NSNumber *)rootTag
             props:(NSDictionary *)props {
    HippyShadowView *shadowView = [_shadowViewRegistry componentForTag:hippyTag onRootTag:rootTag];
    if (!shadowView) {
        return;
    }
    HippyComponentData *componentData = [self componentDataForViewName:shadowView.viewName];
    NSDictionary *newProps = props;
    NSDictionary *virtualProps = props;
    if (shadowView) {
        newProps = [shadowView mergeProps: props];
        virtualProps = shadowView.props;
        [componentData setProps:newProps forShadowView:shadowView];
        [shadowView dirtyPropagation];
    }
    [self addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[hippyTag];
        [componentData setProps:newProps forView:view];
    }];
}

#pragma mark Render Context Implementation
#define Init(Component) NSClassFromString(@#Component)
- (__kindof HippyViewManager *)renderViewManagerForViewName:(NSString *)viewName {
    if (!_viewManagers) {
        _viewManagers = [@{@"View": Init(HippyViewManager),
                          @"WaterfallItem": Init(HippyWaterfallItemViewManager),
                          @"WaterfallView": Init(HippyWaterfallViewManager),
                          @"PullFooterView": Init(HippyFooterRefreshManager),
                          @"PullHeaderView": Init(HippyHeaderRefreshManager),
                          @"ScrollView": Init(HippyScrollViewManager),
                          @"RefreshWrapperItemView": Init(HippyRefreshWrapperItemViewManager),
                          @"RefreshWrapper": Init(HippyRefreshWrapperViewManager),
                          @"ViewPager": Init(HippyViewPagerManager),
                          @"ViewPagerItem": Init(HippyViewPagerItemManager),
                          @"TextInput": Init(HippyTextViewManager),
                          @"WebView": Init(HippySimpleWebViewManager),
                          @"Image": Init(HippyImageViewManager),
                          @"ListViewItem": Init(HippyBaseListItemViewManager),
                          @"ListView": Init(HippyBaseListViewManager),
                          @"SmartViewPager": Init(HippySmartViewPagerViewManager),
                          @"Navigator": Init(HippyNavigatorViewManager),
                          @"Text": Init(HippyTextManager),
                          @"Modal": Init(HippyModalHostViewManager)
                 } mutableCopy];
        if (_extraComponent) {
            [_viewManagers addEntriesFromDictionary:_extraComponent];
            _extraComponent = nil;
        }
    }
    id object = [_viewManagers objectForKey:viewName];
    if (object_isClass(object)) {
        HippyViewManager *viewManager = [object new];
        viewManager.renderContext = self;
        NSAssert([viewManager isKindOfClass:[HippyViewManager class]], @"It must be a HippyViewManager instance");
        [_viewManagers setObject:viewManager forKey:viewName];
        object = viewManager;
    }
    return object;
}

#pragma mark Schedule Block

- (void)addUIBlock:(HippyRenderUIBlock)block {
    if (!block || !_viewRegistry) {
        return;
    }

    [_pendingUIBlocks addObject:block];
}

- (void)executeBlockOnRenderQueue:(dispatch_block_t)block {
    [self executeBlockOnUIManagerQueue:block];
}

- (void)executeBlockOnUIManagerQueue:(dispatch_block_t)block {
    dispatch_async(HippyGetUIManagerQueue(), ^{
        if (block) {
            block();
        }
    });
}

- (void)amendPendingUIBlocksWithStylePropagationUpdateForShadowView:(HippyShadowView *)topView {
    NSMutableSet<HippyApplierBlock> *applierBlocks = [NSMutableSet setWithCapacity:1];

    [topView collectUpdatedProperties:applierBlocks parentProperties:@{}];
    if (applierBlocks.count) {
        [self addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
            for (HippyApplierBlock block in applierBlocks) {
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
    NSArray<HippyRenderUIBlock> *previousPendingUIBlocks = _pendingUIBlocks;
    _pendingUIBlocks = [NSMutableArray new];
    __weak HippyUIManager *weakManager = self;
    if (previousPendingUIBlocks.count) {
        // Execute the previously queued UI blocks
        dispatch_async(dispatch_get_main_queue(), ^{
            if (weakManager) {
                HippyUIManager *strongSelf = weakManager;
                NSDictionary<NSNumber *, UIView *> *viewReg =
                    [strongSelf->_viewRegistry componentsForRootTag:@(rootTag)];
                @try {
                    for (HippyRenderUIBlock block in previousPendingUIBlocks) {
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
 * When HippyUIManager received command to create view by node, HippyUIManager must get all new created view ordered by index, set frames,
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
    std::lock_guard<std::mutex> lock([self shadowQueueLock]);
    HippyViewsRelation *manager = [[HippyViewsRelation alloc] init];
    NSMutableDictionary *dicProps = [NSMutableDictionary dictionaryWithCapacity:nodes.size()];
    for (const std::shared_ptr<DomNode> &node : nodes) {
        const auto& render_info = node->GetRenderInfo();
        [manager addViewTag:render_info.id forSuperViewTag:render_info.pid atIndex:render_info.index];
        NSDictionary *nodeProps = [self createShadowViewFromNode:node onRootNode:rootNode];
        [dicProps setObject:nodeProps forKey:@(node->GetId())];
    }
    [manager enumerateViewsHierarchy:^(int32_t tag, const std::vector<int32_t> &subviewTags, const std::vector<int32_t> &subviewIndices) {
        NSAssert(subviewTags.size() == subviewIndices.size(), @"subviewTags count must be equal to subviewIndices count");
        HippyShadowView *superShadowView = [self->_shadowViewRegistry componentForTag:@(tag) onRootTag:rootNodeTag];
        for (NSUInteger index = 0; index < subviewTags.size(); index++) {
            HippyShadowView *subShadowView = [self->_shadowViewRegistry componentForTag:@(subviewTags[index]) onRootTag:rootNodeTag];
            [superShadowView insertHippySubview:subShadowView atIndex:subviewIndices[index]];
        }
    }];
    for (const std::shared_ptr<DomNode> &node : nodes) {
        NSNumber *hippyTag = @(node->GetId());
        HippyShadowView *shadowView = [_shadowViewRegistry componentForTag:hippyTag onRootTag:rootNodeTag];
        if (HippyCreationTypeInstantly == [shadowView creationType] && !_uiCreationLazilyEnabled) {
            NSString *viewName = [NSString stringWithUTF8String:node->GetViewName().c_str()];
            NSDictionary *props = [dicProps objectForKey:@(node->GetId())];
            HippyComponentData *componentData = [self componentDataForViewName:viewName];
            [self addUIBlock:^(id<HippyRenderContext> renderContext, __unused NSDictionary<NSNumber *,UIView *> *viewRegistry) {
                HippyUIManager *uiManager = (HippyUIManager *)renderContext;
                UIView *view = [uiManager createViewByComponentData:componentData hippyTag:hippyTag rootTag:rootNodeTag properties:props viewName:viewName];
                view.hippyShadowView = shadowView;
                view.renderContext = renderContext;
            }];
        }
    }
    [manager enumerateViewsHierarchy:^(int32_t tag, const std::vector<int32_t> &subviewTags, const std::vector<int32_t> &subviewIndices) {
        auto subViewTags_ = subviewTags;
        auto subViewIndices_ = subviewIndices;
        HippyShadowView *shadowView = [self->_shadowViewRegistry componentForTag:@(tag) onRootTag:rootNodeTag];
        if (HippyCreationTypeInstantly == [shadowView creationType] && !self->_uiCreationLazilyEnabled) {
            [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                UIView *superView = viewRegistry[@(tag)];
                for (NSUInteger index = 0; index < subViewTags_.size(); index++) {
                    UIView *subview = viewRegistry[@(subViewTags_[index])];
                    [superView insertHippySubview:subview atIndex:subViewIndices_[index]];
                }
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
    std::lock_guard<std::mutex> lock([self shadowQueueLock]);
    NSNumber *rootTag = @(strongRootNode->GetId());
    for (const auto &node : nodes) {
        NSNumber *hippyTag = @(node->GetRenderInfo().id);
        NSDictionary *styleProps = unorderedMapDomValueToDictionary(node->GetStyleMap());
        NSDictionary *extProps = unorderedMapDomValueToDictionary(node->GetExtStyle());
        NSMutableDictionary *props = [NSMutableDictionary dictionaryWithDictionary:styleProps];
        [props addEntriesFromDictionary:extProps];
        [self updateView:hippyTag onRootTag:rootTag props:props];
    }
}

- (void)deleteRenderNodesIds:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes
                  onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    std::lock_guard<std::mutex> lock([self shadowQueueLock]);
    NSNumber *rootTag = @(strongRootNode->GetId());
    for (auto dom_node : nodes) {
        int32_t tag = dom_node->GetRenderInfo().id;
        HippyShadowView *shadowView = [_shadowViewRegistry componentForTag:@(tag) onRootTag:rootTag];
        if (shadowView) {
            [shadowView removeFromHippySuperview];
            [self purgeChildren:@[shadowView] onRootTag:rootTag fromRegistry:_shadowViewRegistry];
        }
        __weak auto weakSelf = self;
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = viewRegistry[@(tag)];
            if (view) {
                [view removeFromHippySuperview];
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
    std::lock_guard<std::mutex> lock([self shadowQueueLock]);
    NSNumber *rootTag = @(strongRootNode->GetId());
    for (auto &layoutInfoTuple : layoutInfos) {
        int32_t tag = std::get<0>(layoutInfoTuple);
        NSNumber *hippyTag = @(tag);
        hippy::LayoutResult layoutResult = std::get<1>(layoutInfoTuple);
        CGRect frame = CGRectMakeFromLayoutResult(layoutResult);
        HippyShadowView *shadowView = [_shadowViewRegistry componentForTag:hippyTag onRootTag:rootTag];
        if (shadowView) {
            shadowView.frame = frame;
            [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                UIView *view = viewRegistry[hippyTag];
                /* do not use frame directly, because shadow view's frame possibly changed manually in
                 * [HippyShadowView collectShadowViewsHaveNewLayoutResults]
                 * This is a Wrong example:
                 * [view hippySetFrame:frame]
                 */
                [view hippySetFrame:shadowView.frame];
            }];
        }
    }
}

- (void)batchOnRootNode:(std::weak_ptr<RootNode>)rootNode {
    [self layoutAndMountOnRootNode:rootNode];
    [[NSNotificationCenter defaultCenter] postNotificationName:HippyUIManagerDidEndBatchNotification
                                                        object:self];
}

- (id)dispatchFunction:(const std::string &)functionName
              viewName:(const std::string &)viewName
               viewTag:(int32_t)hippyTag
            onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode
                params:(const DomValue &)params
              callback:(CallFunctionCallback)cb {
    NSString *name = [NSString stringWithUTF8String:functionName.c_str()];
    DomValueType type = params.GetType();
    NSMutableArray *finalParams = [NSMutableArray arrayWithCapacity:8];
    [finalParams addObject:@(hippyTag)];
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
        RenderFatal(error);
        return nil;
    }
}

- (void)registerExtraComponent:(NSDictionary<NSString *, Class> *)extraComponent {
    _extraComponent = extraComponent;
}

#pragma mark -
#pragma mark Event Handler

- (void)addEventName:(const std::string &)name
        forDomNodeId:(int32_t)node_id
          onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    HippyShadowView *shadowView = [self shadowViewForHippyTag:@(node_id) onRootTag:@(root_id)];
    [shadowView addEventName:name];
    if (name == hippy::kClickEvent) {
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            [uiManager addClickEventListenerForView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kLongClickEvent) {
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            [uiManager addLongClickEventListenerForView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kTouchStartEvent || name == hippy::kTouchMoveEvent
               || name == hippy::kTouchEndEvent || name == hippy::kTouchCancelEvent) {
        std::string name_ = name;
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            [uiManager addTouchEventListenerForType:name_ forView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kShowEvent || name == hippy::kDismissEvent) {
        std::string name_ = name;
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            [uiManager addShowEventListenerForType:name_ forView:node_id onRootNode:rootNode];
        }];
    } else if (name == hippy::kPressIn || name == hippy::kPressOut) {
        std::string name_ = name;
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            [uiManager addPressEventListenerForType:name_ forView:node_id onRootNode:rootNode];
        }];
    } else if (name == kVSyncKey) {
        std::string name_ = name;
        auto weakDomManager = self.domManager;
        [self domNodeForHippyTag:node_id onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
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
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            [uiManager addRenderEvent:name_ forDomNode:node_id onRootNode:rootNode];
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
        [self addRenderEvent:name forDomNode:node_id onRootNode:rootNode];
    }
}

- (void)addClickEventListenerForView:(int32_t)hippyTag onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    UIView *view = [self viewForHippyTag:@(hippyTag) onRootTag:@(root_id)];
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:hippy::kClickEvent];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:hippy::kClickEvent];
        __weak id weakSelf = self;
        [view addViewEvent:HippyViewEventTypeClick eventListener:^(CGPoint) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForHippyTag:hippyTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        auto event = std::make_shared<hippy::DomEvent>(hippy::kClickEvent, node,
                                                                       canBePreventedInCapturing, canBePreventedInBubbling,
                                                                       static_cast<std::shared_ptr<DomValue>>(nullptr));
                        node->HandleEvent(event);
                    }
                }];
            }
        }];
    }
    else {
    }
}

- (void)addLongClickEventListenerForView:(int32_t)hippyTag onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    UIView *view = [self viewForHippyTag:@(hippyTag) onRootTag:@(root_id)];
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:hippy::kLongClickEvent];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:hippy::kLongClickEvent];
        __weak id weakSelf = self;
        [view addViewEvent:HippyViewEventTypeLongClick eventListener:^(CGPoint) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForHippyTag:hippyTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        auto event = std::make_shared<hippy::DomEvent>(hippy::kLongClickEvent, node,
                                                                       canBePreventedInCapturing, canBePreventedInBubbling,
                                                                       static_cast<std::shared_ptr<DomValue>>(nullptr));
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
                             forView:(int32_t)hippyTag
                          onRootNode:(std::weak_ptr<RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    AssertMainQueue();
    UIView *view = [self viewForHippyTag:@(hippyTag) onRootTag:@(root_id)];
    HippyViewEventType eventType = hippy::kPressIn == type ? HippyViewEventType::HippyViewEventTypePressIn : HippyViewEventType::HippyViewEventTypePressOut;
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:type];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:type];
        std::string block_type = type;
        __weak id weakSelf = self;
        [view addViewEvent:eventType eventListener:^(CGPoint) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForHippyTag:hippyTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        auto event = std::make_shared<hippy::DomEvent>(block_type, node,
                                                                       canBePreventedInCapturing, canBePreventedInBubbling,
                                                                       static_cast<std::shared_ptr<DomValue>>(nullptr));
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
                             forView:(int32_t)hippyTag
                          onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    UIView *view = [self viewForHippyTag:@(hippyTag) onRootTag:@(root_id)];
    if (view) {
        // todo 默认值应该有个值代表未知
        HippyViewEventType event_type = HippyViewEventType::HippyViewEventTypeTouchStart;
        if (type == hippy::kTouchStartEvent) {
            event_type = HippyViewEventType::HippyViewEventTypeTouchStart;
        } else if (type == hippy::kTouchMoveEvent) {
            event_type = HippyViewEventType::HippyViewEventTypeTouchMove;
        } else if (type == hippy::kTouchEndEvent) {
            event_type = HippyViewEventType::HippyViewEventTypeTouchEnd;
        } else if (type == hippy::kTouchCancelEvent) {
            event_type = HippyViewEventType::HippyViewEventTypeTouchCancel;
        }
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:type];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:type];
        const std::string type_ = type;
        __weak id weakSelf = self;
        [view addViewEvent:event_type eventListener:^(CGPoint point) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForHippyTag:hippyTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        tdf::base::DomValue::DomValueObjectType domValue;
                        domValue["page_x"] = tdf::base::DomValue(point.x);
                        domValue["page_y"] = tdf::base::DomValue(point.y);
                        std::shared_ptr<tdf::base::DomValue> value = std::make_shared<tdf::base::DomValue>(domValue);
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
                            forView:(int32_t)hippyTag
                         onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    UIView *view = [self viewForHippyTag:@(hippyTag) onRootTag:@(root_id)];
    if (view) {
        HippyViewEventType event_type = hippy::kShowEvent == type ? HippyViewEventTypeShow : HippyViewEventTypeDismiss;
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:type];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:type];
        __weak id weakSelf = self;
        [view addViewEvent:event_type eventListener:^(CGPoint point) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForHippyTag:hippyTag onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
                    if (node) {
                        std::shared_ptr<DomValue> domValue = std::make_shared<DomValue>(true);
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
    int32_t hippyTag = node_id;
    if (eventName == hippy::kClickEvent ||
        eventName ==hippy::kLongClickEvent ||
        eventName == hippy::kTouchStartEvent || eventName == hippy::kTouchMoveEvent ||
        eventName == hippy::kTouchEndEvent || eventName == hippy::kTouchCancelEvent ||
        eventName == hippy::kShowEvent || eventName == hippy::kDismissEvent ||
        eventName == hippy::kPressIn || eventName == hippy::kPressOut) {
        std::string name_ = eventName;
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            UIView *view = [uiManager viewForHippyTag:@(hippyTag) onRootTag:@(root_id)];
            [view removeViewEvent:viewEventTypeFromName(name_)];
        }];
    } else if (eventName == kVSyncKey) {
       std::string name_ = eventName;
       [self domNodeForHippyTag:node_id onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
           if (node) {
               NSString *vsyncKey = [NSString stringWithFormat:@"%p%d", self, node_id];
               [[RenderVsyncManager sharedInstance] unregisterVsyncObserverForKey:vsyncKey];
           }
       }];
   } else {
        std::string name_ = eventName;
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = [viewRegistry objectForKey:@(hippyTag)];
            [view removeStatusChangeEvent:name_];
        }];
    }
}

- (void)addRenderEvent:(const std::string &)name
            forDomNode:(int32_t)node_id
            onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    UIView *view = [self viewForHippyTag:@(node_id) onRootTag:@(root_id)];
    if (view) {
        std::string name_ = name;
        NSDictionary *componentDataByName = [_componentDataByName copy];
        NSString *viewName = view.viewName;
        HippyComponentData *component = componentDataByName[viewName];
        NSDictionary<NSString *, NSString *> *eventMap = [component eventNameMap];
        NSString *mapToEventName = [eventMap objectForKey:[NSString stringWithUTF8String:name_.c_str()]];
        if (mapToEventName) {
            BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:name_];
            BOOL canBePreventedInBubbling = [view canBePreventInBubbling:name_];
            __weak id weakSelf = self;
            [view addStatusChangeEvent:[mapToEventName UTF8String] eventCallback:^(NSDictionary *body) {
                id strongSelf = weakSelf;
                if (strongSelf) {
                    [strongSelf domNodeForHippyTag:node_id onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> domNode) {
                        if (domNode) {
                            DomValue value = [body toDomValue];
                            std::shared_ptr<DomValue> domValue = std::make_shared<DomValue>(std::move(value));
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

- (void)removeRenderEvent:(const std::string &)name
             forDomNodeId:(int32_t)node_id
               onRootNode:(std::weak_ptr<RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    std::string name_ = name;
    [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyUIManager *uiManager = (HippyUIManager *)renderContext;
        UIView *view = [uiManager viewForHippyTag:@(node_id) onRootTag:@(root_id)];
        [view removeStatusChangeEvent:name_];
    }];
}

#pragma mark -
#pragma mark Other

/**
 * Sets up animations, computes layout, creates UI mounting blocks for computed layout,
 * runs these blocks and all other already existing blocks.
 */
- (void)layoutAndMountOnRootNode:(std::weak_ptr<RootNode>)rootNode {
    std::lock_guard<std::mutex> lock([self shadowQueueLock]);
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    HippyShadowView *rootView = [_shadowViewRegistry rootComponentForTag:@(root_id)];
    // Gather blocks to be executed now that all view hierarchy manipulations have
    // been completed (note that these may still take place before layout has finished)
    NSDictionary *shadowViewMap = [_shadowViewRegistry componentsForRootTag:@(root_id)];
    for (HippyComponentData *componentData in _componentDataByName.allValues) {
        HippyRenderUIBlock uiBlock = [componentData uiBlockToAmendWithShadowViewRegistry:shadowViewMap];
        [self addUIBlock:uiBlock];
    }
    [rootView amendLayoutBeforeMount];
    [self amendPendingUIBlocksWithStylePropagationUpdateForShadowView:rootView];

    [self addUIBlock:^(id<HippyRenderContext> renderContext, __unused NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        HippyUIManager *uiManager = (HippyUIManager *)renderContext;
        for (id<HippyComponent> node in uiManager->_componentTransactionListeners) {
            [node hippyComponentDidFinishTransaction];
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

@end

