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

#import "HippyAssert.h"
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
#import "HippyUIManager+Private.h"
#import "HippyRootShadowView.h"
#import "HippyShadowView.h"
#import "HippyShadowView+Internal.h"
#import "HippyRenderUtils.h"
#import "HippyView.h"
#import "HippyViewManager.h"
#import "HippyVsyncManager.h"
#import "UIView+DomEvent.h"
#import "UIView+Hippy.h"
#import "HippyBridgeModule.h"
#import "HippyModulesSetup.h"
#import "HippyBridge+ModuleManage.h"
#import "NativeRenderManager.h"
#import "HippyShadowListView.h"
#import "HippyModuleData.h"
#import "HippyModuleMethod.h"
#import "HippyBridge+Private.h"
#import "HippyJSExecutor.h"
#import "HippyShadowText.h"
#import "HippyShadowTextView.h"
#import "HippyDeviceBaseInfo.h"
#import "HippyEventDispatcher.h"
#import "dom/root_node.h"
#import <objc/runtime.h>
#import <os/lock.h>
#import <unordered_map>


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


using HPViewBinding = std::map<int32_t, std::tuple<std::vector<int32_t>, std::vector<int32_t>>>;

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
    if (view.hippyTag != nil) {
        block(view);
        for (id<HippyComponent> subview in view.hippySubviews) {
            NativeRenderTraverseViewNodes(subview, block);
        }
    }
}


@interface UIView (HippyUIManagerPrivate)

/// Bind UIView with HippyUIManager
/// This is a convenient method for UIView to get HippyUIManager instance.
/// - Parameter uiManager: HippyUIManager instance
- (void)setUiManager:(HippyUIManager *)uiManager;

@end

#pragma mark -

#define AssertMainQueue() NSAssert(HippyIsMainQueue(), @"This function must be called on the main thread")

NSString *const HippyUIManagerDidRegisterRootViewNotification = @"HippyUIManagerDidRegisterRootViewNotification";
NSString *const HippyUIManagerDidRemoveRootViewNotification = @"HippyUIManagerDidRemoveRootViewNotification";
NSString *const HippyUIManagerRootViewKey = @"HippyUIManagerRootViewKey";
NSString *const HippyUIManagerRootViewTagKey = @"HippyUIManagerRootViewTagKey";
NSString *const HippyUIManagerDidEndBatchNotification = @"HippyUIManagerDidEndBatchNotification";
NSString *const HippyFontChangeTriggerNotification = @"HippyFontChangeTriggerNotification";

@interface HippyUIManager() {
    // lock for weak bridge access
    os_unfair_lock _bridgeLock;
    // HippyBridge's weak reference
    __weak HippyBridge *_bridge;
    
    // View Registry
    HippyComponentMap *_viewRegistry;
    // ShadowView Registry
    HippyComponentMap *_shadowViewRegistry;

    // lock for componentDataByName
    os_unfair_lock _componentDataLock;
    // Keyed by viewName
    NSMutableDictionary<NSString *, HippyComponentData *> *_componentDataByName;

    // Listeners such as ScrollView/ListView etc. witch will listen to start layout event
    // The implementation here needs to be improved to provide a registration mechanism.
    NSHashTable<id<HippyComponent>> *_componentTransactionListeners;
    
    // Lock for render operations
    std::mutex _renderQueueLock;
    // UIBlocks waiting for executing
    NSMutableArray<HippyViewManagerUIBlock> *_pendingUIBlocks;
}

/// All managed ViewManagers
@property (atomic, strong) NSMutableDictionary<NSString *, id> *viewManagers;
/// All extra components
@property (atomic, strong) NSArray<Class> *extraComponents;
/// Cache of all ViewManager classes
@property (nonatomic, strong) NSArray<Class> *viewManagerClasses;

@end


@implementation HippyUIManager

@synthesize domManager = _domManager;
@synthesize globalFontSizeMultiplier = _globalFontSizeMultiplier;

#pragma mark Life cycle

- (instancetype)initWithBridge:(HippyBridge *)bridge {
    self = [super init];
    if (self) {
        _bridge = bridge;
        [self setupContext];
        [self setupViewManagerClassesCacheWithBridge:bridge];
    }
    return self;
}

- (void)setupContext {
    _shadowViewRegistry = [[HippyComponentMap alloc] initWithComponentsReferencedType:HippyComponentReferenceTypeStrong];
    _viewRegistry = [[HippyComponentMap alloc] initWithComponentsReferencedType:HippyComponentReferenceTypeWeak];
    _viewRegistry.requireInMainThread = YES;
    _pendingUIBlocks = [NSMutableArray new];
    _componentTransactionListeners = [NSHashTable weakObjectsHashTable];
    _componentDataByName = [NSMutableDictionary dictionary];
    _bridgeLock = OS_UNFAIR_LOCK_INIT;
    _componentDataLock = OS_UNFAIR_LOCK_INIT;
    HippyScreenScale();
    HippyScreenSize();
    [self updateGlobalFontSizeMultiplier];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(onFontChangedFromNative:)
                                                 name:HippyFontChangeTriggerNotification
                                               object:nil];
}

- (void)setupViewManagerClassesCacheWithBridge:(HippyBridge *)bridge {
    NSMutableArray<Class> *viewManagerClasses = [NSMutableArray array];
    for (Class aClass in bridge.moduleClasses) {
        if ([aClass isSubclassOfClass:HippyViewManager.class]) {
            [viewManagerClasses addObject:aClass];
        }
    }
    _viewManagerClasses = viewManagerClasses;
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

- (void)dealloc {
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle], HippyUIManager(%p) dealloc", self);
}

#pragma mark Setter & Getter

- (HippyBridge *)bridge {
    os_unfair_lock_lock(&_bridgeLock);
    HippyBridge *bridge = _bridge;
    os_unfair_lock_unlock(&_bridgeLock);
    return bridge;
}

- (void)setBridge:(HippyBridge *)bridge {
    // Called when HippyBridge dealloc
    // Avoid multi-threading accessing the weak bridge by setting it to nil.
    os_unfair_lock_lock(&_bridgeLock);
    _bridge = bridge;
    os_unfair_lock_unlock(&_bridgeLock);
}

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
                auto node = domManager->GetNode(rootNode, componentTag);
                resultBlock(node);
            }};
            domManager->PostTask(hippy::dom::Scene(std::move(ops_)));
        }
    }
}

- (UIView *)rootContentViewForTag:(NSNumber *)rootTag {
    AssertMainQueue();
    return [_viewRegistry rootComponentForTag:rootTag];
}

- (UIView *)viewForHippyTag:(NSNumber *)hippyTag onRootTag:(NSNumber *)rootTag {
    AssertMainQueue();
    return [_viewRegistry componentForTag:hippyTag onRootTag:rootTag];
}

- (HippyShadowView *)shadowViewForHippyTag:(NSNumber *)hippyTag
                                          onRootTag:(NSNumber *)rootTag {
    return [_shadowViewRegistry componentForTag:hippyTag onRootTag:rootTag];
}

- (std::mutex &)renderQueueLock {
    return _renderQueueLock;
}


#pragma mark - View Manager

- (HippyComponentData *)componentDataForViewName:(NSString *)viewName {
    if (!viewName) {
        return nil;
    }
    os_unfair_lock_lock(&_componentDataLock);
    HippyComponentData *componentData = _componentDataByName[viewName];
    if (!componentData) {
        HippyViewManager *viewManager = [self viewManagerForViewName:viewName];
        HippyAssert(viewManager, @"No view manager found for %@", viewName);
        if (viewManager) {
            componentData = [[HippyComponentData alloc] initWithViewManager:viewManager viewName:viewName];
            _componentDataByName[viewName] = componentData;
        }
    }
    os_unfair_lock_unlock(&_componentDataLock);
    return componentData;
}

- (void)registerRootView:(UIView *)rootView asRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();

    NSNumber *hippyTag = rootView.hippyTag;
    HippyAssert(HippyIsHippyRootView(hippyTag), @"View %@ with tag #%@ is not a root view", rootView, hippyTag);
    if ([_viewRegistry containRootComponentWithTag:hippyTag]) {
        HippyLogWarn(@"RootView Tag %@ already exists. Start Replace!", hippyTag);
        [self unregisterRootViewFromTag:hippyTag];
    }
    
    // Register view
    [_viewRegistry addRootComponent:rootView rootNode:rootNode forTag:hippyTag];
    rootView.uiManager = self;
    [rootView addObserver:self forKeyPath:@"frame"
                  options:(NSKeyValueObservingOptionOld | NSKeyValueObservingOptionNew)
                  context:NULL];
    CGRect frame = rootView.frame;

    // Register shadow view
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    HippyRootShadowView *shadowView = [[HippyRootShadowView alloc] init];
    shadowView.hippyTag = hippyTag;
    shadowView.frame = frame;
    shadowView.backgroundColor = [rootView backgroundColor];
    shadowView.viewName = NSStringFromClass([rootView class]);;
    shadowView.rootNode = rootNode;
    shadowView.domNode = rootNode;
    [self->_shadowViewRegistry addRootComponent:shadowView rootNode:rootNode forTag:hippyTag];
    
    
    NSDictionary *dimensions = hippyExportedDimensions(self.bridge, @(frame.size));
    [self.bridge.eventDispatcher dispatchDimensionsUpdateEvent:dimensions];
    
    NSDictionary *userInfo = @{ HippyUIManagerRootViewKey: rootView, HippyUIManagerRootViewTagKey: hippyTag };
    [[NSNotificationCenter defaultCenter] postNotificationName:HippyUIManagerDidRegisterRootViewNotification
                                                        object:self
                                                      userInfo:userInfo];
}

- (void)unregisterRootViewFromTag:(NSNumber *)rootTag {
    AssertMainQueue();
    UIView *rootView = [_viewRegistry rootComponentForTag:rootTag];
    NSDictionary *userInfo;
    if (rootView) {
        [rootView removeObserver:self forKeyPath:@"frame"];
        userInfo = @{ HippyUIManagerRootViewKey: rootView, 
                      HippyUIManagerRootViewTagKey: rootTag };
    } else {
        userInfo = @{ HippyUIManagerRootViewTagKey: rootTag };
    }
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    [_viewRegistry removeRootComponentWithTag:rootTag];
    [_shadowViewRegistry removeRootComponentWithTag:rootTag];
    [[NSNotificationCenter defaultCenter] postNotificationName:HippyUIManagerDidRemoveRootViewNotification
                                                        object:self
                                                      userInfo:userInfo];
}

- (void)observeValueForKeyPath:(NSString *)keyPath 
                      ofObject:(id)object
                        change:(NSDictionary<NSKeyValueChangeKey,id> *)change
                       context:(void *)context {
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
                static const char *hippyOnSizeChangedKey = "onSizeChanged";
                auto value = std::make_shared<footstone::HippyValue>([params toHippyValue]);
                auto event = std::make_shared<DomEvent>(hippyOnSizeChangedKey, rootNode, NO, NO, value);
                __weak HippyUIManager *weakSelf = self;
                std::function<void()> func = [weakSelf, rootNode, event, rootTag](){
                    rootNode->HandleEvent(event);
                    HippyUIManager *strongSelf = weakSelf;
                    if (strongSelf) {
                        [strongSelf domEventDidHandle:hippyOnSizeChangedKey forNode:[rootTag intValue] onRoot:[rootTag intValue]];
                    }
                };
                domManager->PostTask(hippy::Scene({func}));
                
                HippyBridge *bridge = self.bridge;
                NSDictionary *dimensions = hippyExportedDimensions(self.bridge, @(curFrame.size));
                [bridge.eventDispatcher dispatchDimensionsUpdateEvent:dimensions];
                [bridge.eventDispatcher dispatchNativeEvent:@(hippyOnSizeChangedKey) withParams:params];
            }
        }
    }
}

- (void)setFrame:(CGRect)frame forView:(UIView *)view {
    NSNumber* hippyTag = view.hippyTag;
    NSNumber* rootTag = view.rootTag;
    
    auto domManager = _domManager.lock();
    if (!domManager) {
        return;
    }
    
    __weak __typeof(self)weakSelf = self;
    std::vector<std::function<void()>> ops_ = {[hippyTag, rootTag, weakSelf, frame]() {
        __strong __typeof(weakSelf)strongSelf = weakSelf;
        if (!strongSelf) {
            return;
        }
        HippyShadowView *shadowView = [strongSelf->_shadowViewRegistry componentForTag:hippyTag onRootTag:rootTag];
        if (!shadowView) {
            return;
        }
        
        if (!HippyCGRectRoundInPixelNearlyEqual(frame, shadowView.frame)) {
            [shadowView setLayoutFrame:frame];
            std::weak_ptr<RootNode> rootNode = [strongSelf->_shadowViewRegistry rootNodeForTag:rootTag];
            [strongSelf batchOnRootNode:rootNode];
        }
    }};
    domManager->PostTask(hippy::dom::Scene(std::move(ops_)));
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
        HippyUIManager *strongSelf = weakSelf;
        if (!strongSelf) {
            return;
        }
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
         fromRegistry:(HippyComponentMap *)registryMap {
    NSDictionary *currentRegistry = [registryMap componentsForRootTag:rootTag];
    for (id<HippyComponent> child in children) {
        NativeRenderTraverseViewNodes(currentRegistry[child.hippyTag], ^(id<HippyComponent> subview) {
            NSAssert(![subview isHippyRootView], @"Root views should not be unregistered");
            if ([subview respondsToSelector:@selector(invalidate)]) {
                [subview performSelector:@selector(invalidate)];
            }
            [registryMap removeComponent:subview forRootTag:rootTag];
        });
    }
}

- (void)removeChildren:(NSArray<id<HippyComponent>> *)children fromContainer:(id<HippyComponent>)container {
    for (id<HippyComponent> removedChild in children) {
        [container removeHippySubview:removedChild];
    }
}


#pragma mark - View Releted

- (UIView *)createViewFromShadowView:(HippyShadowView *)shadowView {
    AssertMainQueue();
    HippyAssert(shadowView.viewName, @"view name is needed for creating a view");
    HippyComponentData *componentData = [self componentDataForViewName:shadowView.viewName];
    
    // create view from componentData
    UIView *view = nil;
    {
        NSNumber *hippyTag = shadowView.hippyTag;
        NSNumber *rootTag = shadowView.rootTag;
        NSString *viewName = shadowView.viewName;
        NSDictionary *props = shadowView.props;
        
        // 1. first, check if already has one in view cache and whether it can be reused, otherwise create one.
        view = [self viewForHippyTag:hippyTag onRootTag:rootTag];
        BOOL canBeRetrievedFromCache = YES;
        if (view && [view respondsToSelector:@selector(canBeRetrievedFromViewCache)]) {
            canBeRetrievedFromCache = [view canBeRetrievedFromViewCache];
        }
        /**
         * subviews & hippySubviews should be removed from the view which we get from cache(viewRegistry).
         * otherwise hippySubviews will be inserted multiple times.
         */
        if (view && canBeRetrievedFromCache) {
            [view resetHippySubviews];
        } else {
            view = [componentData createViewWithTag:hippyTag initProps:props];
        }
        
        if (view) {
            // 2. then, set necessary properties for this view.
            view.viewName = viewName;
            view.rootTag = rootTag;
            view.hippyShadowView = shadowView;
            view.uiManager = self;
            @try {
                [componentData setProps:props forView:view];  // Must be done before bgColor to prevent wrong default
            } @catch (NSException *exception) {
                HippyAssert(NO, @"%@", exception.description);
                HippyLogError(@"Exception (%@) while setting props for view (%@ of %@), %@",
                              exception.description, view.class, view.hippyTag, props);
            }
            
        }
    }
    return view;
}

- (UIView *)createViewForShadowListItem:(HippyShadowView *)shadowView {
    AssertMainQueue();
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    // There was a timing problem here:
    // If a batch of subviews of the cell has already been `created` before
    // update to CreationTypeInstantly, then this batch of views will not be created
    // until the next `cellForItemAtIndexPath` call.
    // we currently resolve this issue by setting the CreationType synchronously.
    // TODO: CreationType's further optimization is needed in the future
    [shadowView synchronousRecusivelySetCreationTypeToInstant];
    UIView *listItemView = [self createViewRecursiveFromRenderObjectWithNOLock:shadowView];
    
    [self.viewRegistry generateTempCacheBeforeAcquireAllStoredWeakComponentsForRootTag:shadowView.rootTag];
    NSMutableSet<NativeRenderApplierBlock> *applierBlocks = [NSMutableSet set];
    [shadowView amendLayoutBeforeMount:applierBlocks];
    if (applierBlocks.count) {
        for (NativeRenderApplierBlock block in applierBlocks) {
            // Note: viewRegistry may be modified in the block, and it may be stored internally as NSMapTable
            // so to ensure that it is up-to-date, it can only be retrieved each time.
            NSDictionary<NSNumber *, UIView *> *viewRegistry = [self.viewRegistry componentsForRootTag:shadowView.rootTag];
            @try {
                block(viewRegistry, nil);
            } @catch (NSException *exception) {
                HippyLogError(@"Exception while executing blocks when create list! %@", shadowView);
            }
        }
    }
    [self.viewRegistry clearTempCacheAfterAcquireAllStoredWeakComponentsForRootTag:shadowView.rootTag];
    
    return listItemView;
}

- (UIView *)createViewRecursiveFromRenderObjectWithNOLock:(HippyShadowView *)shadowView {
    UIView *view = [self createViewFromShadowView:shadowView];
    if (view) {
        // First of all, mark shadowView as dirty recursively,
        // so that we can collect ui blocks to amend correctly.
        [shadowView dirtyPropagation:NativeRenderUpdateLifecycleAllDirtied];
        
        // Special handling of lazy list, which is a cellView
        // because lazy loading list needs to be re-layout
        if ([shadowView isKindOfClass:HippyShadowListView.class]) {
            auto domManager = _domManager.lock();
            if (domManager) {
                __weak HippyUIManager *weakSelf = self;
                NSNumber *rootTag = shadowView.rootTag;
                std::function<void()> func = [weakSelf, rootTag](){
                    __strong HippyUIManager *strongSelf = weakSelf;
                    if (strongSelf) {
                        [strongSelf setNeedsLayoutForRootNodeTag:rootTag];
                    }
                };
                domManager->PostTask(hippy::Scene({func}));
            }
        }
        
        // after creation, add view to _viewRegistry and _componentTransactionListeners.
        if ([view respondsToSelector:@selector(hippyBridgeDidFinishTransaction)]) {
            [self->_componentTransactionListeners addObject:view];
        }
        [self.viewRegistry addComponent:view forRootTag:shadowView.rootTag];
        
        // TODO: hippy3 events binding handling, performance needs to be improved here.
        const std::vector<std::string> &eventNames = [shadowView allEventNames];
        for (auto &event : eventNames) {
            [self addEventNameInMainThread:event
                                   forView:view
                                onRootNode:shadowView.rootNode];
        }
        
        NSUInteger index = 0;
        for (HippyShadowView *subRenderObject in shadowView.hippySubviews) {
            UIView *subview = [self createViewRecursiveFromRenderObjectWithNOLock:subRenderObject];
            [view insertHippySubview:subview atIndex:index];
            index++;
        }
        
        // finally, update frame
        [view hippySetFrame:shadowView.frame];
        
        [view clearSortedSubviews];
        [view didUpdateHippySubviews];
    }
    return view;
}


#pragma mark - ShadowView Related

- (HippyShadowView *)createShadowViewFromNode:(const std::shared_ptr<hippy::DomNode> &)domNode
                                   onRootNode:(std::weak_ptr<RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode || !domNode) {
        return nil;
    }
    int32_t rootId = strongRootNode->GetId();
    NSNumber *rootTag = @(rootId);
    NSNumber *componentTag = @(domNode->GetId());
    NSString *viewName = [NSString stringWithUTF8String:domNode->GetViewName().c_str()];
    NSString *tagName = [NSString stringWithUTF8String:domNode->GetTagName().c_str()];
    NSMutableDictionary *props = [HippyStylesFromDomNode(domNode) mutableCopy];
    HippyComponentData *componentData = [self componentDataForViewName:viewName];
    HippyShadowView *shadowView = [componentData createShadowViewWithTag:componentTag];
    shadowView.rootNode = rootNode;
    HippyAssert(componentData && shadowView, @"componentData and shadowView must not be nil");
    [props setValue:rootTag forKey:@"rootTag"];
    // Register shadow view
    if (shadowView) {
        shadowView.hippyTag = componentTag;
        shadowView.rootTag = rootTag;
        shadowView.viewName = viewName;
        shadowView.tagName = tagName;
        shadowView.props = props;
        shadowView.domNode = domNode;
        shadowView.rootNode = rootNode;
        shadowView.domManager = _domManager;
        shadowView.nodeLayoutResult = domNode->GetLayoutResult();
        shadowView.frame = CGRectMakeFromLayoutResult(domNode->GetLayoutResult());
        [componentData setProps:props forShadowView:shadowView];
    }
    return shadowView;
}

- (void)updateView:(nonnull NSNumber *)componentTag
         onRootTag:(NSNumber *)rootTag
             props:(NSDictionary *)props {
    HippyShadowView *renderObject = [_shadowViewRegistry componentForTag:componentTag onRootTag:rootTag];
    if (!renderObject) {
        return;
    }
    HippyComponentData *componentData = [self componentDataForViewName:renderObject.viewName];
    NSDictionary *newProps = [renderObject mergeProps:props];
    [componentData setProps:newProps forShadowView:renderObject];
    [renderObject dirtyPropagation:NativeRenderUpdateLifecyclePropsDirtied];
    [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[componentTag];
        [componentData setProps:newProps forView:view];
    }];
}

- (__kindof HippyViewManager *)viewManagerForViewName:(NSString *)viewName {
    if (!self.viewManagers) {
        NSMutableDictionary *viewManagers = [NSMutableDictionary dictionary];
        // First, read all extra components.
        if (self.extraComponents) {
            for (Class cls in self.extraComponents) {
                HippyAssert([cls respondsToSelector:@selector(moduleName)],
                            @"%@ must respond to selector moduleName", NSStringFromClass(cls));
                NSString *viewName = [cls performSelector:@selector(moduleName)];
                HippyAssert(![viewManagers objectForKey:viewName],
                         @"duplicated component %@ for class %@ and %@", viewName,
                         NSStringFromClass(cls),
                         NSStringFromClass([viewManagers objectForKey:viewName]));
                [viewManagers setObject:cls forKey:viewName];
            }
        }

        // Second, read the default view manager classes.
        NSArray<Class> *classes = self.viewManagerClasses;
        NSMutableDictionary *defaultViewManagerClasses = [NSMutableDictionary dictionaryWithCapacity:[classes count]];
        for (Class cls in classes) {
            HippyAssert([cls respondsToSelector:@selector(moduleName)],
                        @"%@ must respond to selector moduleName", NSStringFromClass(cls));
            NSString *viewName = [cls performSelector:@selector(moduleName)];
            if ([viewManagers objectForKey:viewName]) {
                continue;
            }
            [defaultViewManagerClasses setObject:cls forKey:viewName];
        }

        [viewManagers addEntriesFromDictionary:defaultViewManagerClasses];
        self.viewManagers = viewManagers;
    }

    // Get and instantiate the class
    id object = [self.viewManagers objectForKey:viewName];
    if (object_isClass(object)) {
        HippyViewManager *viewManager = [object new];
        HippyBridge *strongBridge = self.bridge;
        viewManager.bridge = strongBridge;
        HippyAssert([viewManager isKindOfClass:[HippyViewManager class]], @"Must be a HippyViewManager instance");
        [self.viewManagers setObject:viewManager forKey:viewName];
        object = viewManager;
    }
    return object;
}

- (NSArray<__kindof UIView *> *)rootViews {
    return (NSArray<__kindof UIView *> *)[_viewRegistry rootComponents];
}

#pragma mark Schedule Block

- (void)addUIBlock:(HippyViewManagerUIBlock)block {
    HippyAssertNotMainQueue();
    if (!block || !_viewRegistry) {
        return;
    }

    [_pendingUIBlocks addObject:block];
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
                [strongSelf.viewRegistry generateTempCacheBeforeAcquireAllStoredWeakComponentsForRootTag:@(rootTag)];
                for (HippyViewManagerUIBlock block in previousPendingUIBlocks) {
                    @try {
                        // Note: viewRegistry may be modified in the block, and it may be stored internally as NSMapTable
                        // so to ensure that it is up-to-date, it can only be retrieved each time.
                        NSDictionary* viewReg = [strongSelf.viewRegistry componentsForRootTag:@(rootTag)];
                        if (block) block(strongSelf, viewReg);
                    } @catch (NSException *exception) {
                        HippyLogError(@"Exception thrown while executing UI block: %@", exception);
                    }
                }
                [strongSelf.viewRegistry clearTempCacheAfterAcquireAllStoredWeakComponentsForRootTag:@(rootTag)];
                TDF_PERF_LOG("flushUIBlocksOnRootNode done, block count:%d(random id:%u)", previousPendingUIBlocks.count, rand);
            }
        });
    }
    TDF_PERF_LOG("flushUIBlocksOnRootNode End(random id:%u)",rand);
}


#pragma mark - NativeRenderManager implementation

/**
 * When HippyUIManager received command to create view by node, it gets all new created view ordered by index, set frames,
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
    for (const std::shared_ptr<DomNode> &node : nodes) {
        const auto& render_info = node->GetRenderInfo();
        [manager addViewTag:render_info.id forSuperViewTag:render_info.pid atIndex:render_info.index];
        HippyShadowView *shadowView = [self createShadowViewFromNode:node onRootNode:rootNode];
        [_shadowViewRegistry addComponent:shadowView forRootTag:shadowView.rootTag];
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
    __block NSMutableArray *tempCreatedViews = [NSMutableArray arrayWithCapacity:nodes.size()]; // Used to temporarily hold views objects.
    for (const std::shared_ptr<DomNode> &node : nodes) {
        NSNumber *componentTag = @(node->GetId());
        HippyShadowView *shadowView = [_shadowViewRegistry componentForTag:componentTag onRootTag:rootNodeTag];
        if (HippyCreationTypeInstantly == [shadowView creationType] && !_uiCreationLazilyEnabled) {
            __weak __typeof(self)weakSelf = self;
            [self addUIBlock:^(HippyUIManager *uiManager, __unused NSDictionary<NSNumber *,UIView *> *viewRegistry) {
                __strong __typeof(weakSelf)strongSelf = weakSelf;
                if (!strongSelf) {
                    return;
                }
                std::lock_guard<std::mutex> lock([strongSelf renderQueueLock]);
                UIView *view = [uiManager createViewFromShadowView:shadowView];
                [view hippySetFrame:shadowView.frame];
                
                if (uiManager && view) {
                    // after creation, add view to _viewRegistry, and _componentTransactionListeners.
                    if ([view respondsToSelector:@selector(hippyBridgeDidFinishTransaction)]) {
                        [uiManager->_componentTransactionListeners addObject:view];
                    }
                    [tempCreatedViews addObject:view];
                    
                    // Note: Special logic, to be optimized
                    // The `onAttachedToWindow` event must be mounted in advance,
                    // because it will be called in `didUpdateHippySubviews` method.
                    // Other events are not mounted here.
                    static constexpr char onAttchedToWindowEventKey[] = "attachedtowindow";
                    const std::vector<std::string>& eventNames = [shadowView allEventNames];
                    auto it = std::find(eventNames.begin(), eventNames.end(), onAttchedToWindowEventKey);
                    if (it != eventNames.end()) {
                        [uiManager addEventNameInMainThread:onAttchedToWindowEventKey
                                                    forView:view
                                                 onRootNode:shadowView.rootNode];
                    }
                }
            }];
        }
    }
    [self addUIBlock:^(HippyUIManager *uiManager, __unused NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        for (UIView *view in tempCreatedViews) {
            [uiManager.viewRegistry addComponent:view forRootTag:rootNodeTag];
        }
    }];
    [manager enumerateViewsHierarchy:^(int32_t tag, const std::vector<int32_t> &subviewTags, const std::vector<int32_t> &subviewIndices) {
        auto subViewTags_ = subviewTags;
        auto subViewIndices_ = subviewIndices;
        HippyShadowView *renderObject = [self->_shadowViewRegistry componentForTag:@(tag) onRootTag:rootNodeTag];
        if (HippyCreationTypeInstantly == [renderObject creationType] && !self->_uiCreationLazilyEnabled) {
            [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
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
    [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyLogInfo(@"Created views: %lu, full registry: %lu", (unsigned long)tempCreatedViews.count, viewRegistry.count);
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
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    NSNumber *rootTag = @(strongRootNode->GetId());
    NSDictionary *currentRegistry = [_shadowViewRegistry componentsForRootTag:rootTag];
    
    for (auto dom_node : nodes) {
        int32_t tag = dom_node->GetRenderInfo().id;
        HippyShadowView *renderObject = [currentRegistry objectForKey:@(tag)];
        [renderObject dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
        if (renderObject) {
            [renderObject removeFromHippySuperview];
            [self purgeChildren:@[renderObject] onRootTag:rootTag fromRegistry:_shadowViewRegistry];
        }
    }
    __weak HippyUIManager *weakSelf = self;
    auto strongNodes = std::move(nodes);
    [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyUIManager *strongSelf = weakSelf;
        if (!strongSelf) {
            return;
        }
        NSMutableArray<UIView *> *parentViews = [NSMutableArray arrayWithCapacity:strongNodes.size()];
        NSMutableArray<UIView *> *views = [NSMutableArray arrayWithCapacity:strongNodes.size()];
        for (auto domNode : strongNodes) {
            UIView *view = [viewRegistry objectForKey:@(domNode->GetId())];
            if (!view) {
                continue;
            }
            UIView *parentView = (UIView *)[view parent];
            if (!parentView) {
                continue;
            }
            [parentViews addObject:parentView];
            [view removeFromHippySuperview];
            [views addObject:view];
        }
        [strongSelf purgeChildren:views onRootTag:rootTag fromRegistry:strongSelf.viewRegistry];
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
    std::lock_guard<std::mutex> lock([self renderQueueLock]);
    HippyShadowView *fromShadowView = [_shadowViewRegistry componentForTag:@(fromContainer) onRootTag:@(rootTag)];
    HippyShadowView *toShadowView = [_shadowViewRegistry componentForTag:@(toContainer) onRootTag:@(rootTag)];
    for (int32_t hippyTag : ids) {
        HippyShadowView *view = [_shadowViewRegistry componentForTag:@(hippyTag) onRootTag:@(rootTag)];
        if (!view) {
            HippyLogWarn(@"Invalid Move, No ShadowView! (%d of %d)", hippyTag, rootTag);
            continue;
        }
        HippyAssert(fromShadowView == [view parent], @"ShadowView(%d)'s parent should be %d", hippyTag, fromContainer);
        [view removeFromHippySuperview];
        [toShadowView insertHippySubview:view atIndex:index];
    }
    [fromShadowView dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
    [toShadowView dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
    [fromShadowView didUpdateHippySubviews];
    [toShadowView didUpdateHippySubviews];
    auto strongTags = std::move(ids);
    [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        UIView *fromView = [viewRegistry objectForKey:@(fromContainer)];
        UIView *toView = [viewRegistry objectForKey:@(toContainer)];
        for (int32_t tag : strongTags) {
            UIView *view = [viewRegistry objectForKey:@(tag)];
            if (!view) {
                continue;
            }
            HippyAssert(fromView == [view parent], @"parent of object view with tag %d is not object view with tag %d", tag, fromContainer);
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
        HippyAssert(!parentObjectView || parentObjectView == [objectView parent], @"parent not same!");
        if (!parentObjectView) {
            parentObjectView = (HippyShadowView *)[objectView parent];
        }
        [parentObjectView moveHippySubview:objectView toIndex:index];
    }
    [parentObjectView didUpdateHippySubviews];
    auto strongNodes = std::move(nodes);
    [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        UIView *superView = nil;
        for (auto node : strongNodes) {
            int32_t index = node->GetRenderInfo().index;
            int32_t componentTag = node->GetId();
            UIView *view = [viewRegistry objectForKey:@(componentTag)];
            if (!view) {
                continue;
            }
            HippyAssert(!superView || superView == [view parent], @"try to move views on different parent views");
            if (!superView) {
                superView = (UIView *)[view parent];
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
        HippyShadowView *shadowView = [_shadowViewRegistry componentForTag:componentTag onRootTag:rootTag];
        if (shadowView) {
            [shadowView dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
            shadowView.frame = frame;
            shadowView.nodeLayoutResult = layoutResult;
            [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                UIView *view = viewRegistry[componentTag];
                /* do not use frame directly, because shadow view's frame possibly changed manually in
                 * [HippyShadowView collectRenderObjectHaveNewLayoutResults]
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
    auto strongRootNode = rootNode.lock();
    if (strongRootNode) {
        uint32_t rootNodeId = strongRootNode->GetId();
        NSDictionary *userInfo = @{ HippyUIManagerRootViewTagKey: @(rootNodeId) };
        [[NSNotificationCenter defaultCenter] postNotificationName:HippyUIManagerDidEndBatchNotification
                                                            object:self
                                                          userInfo:userInfo];
    }
}

- (void)dispatchFunction:(const std::string &)functionName
                viewName:(const std::string &)viewName
                 viewTag:(int32_t)componentTag
              onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode
                  params:(const HippyValue &)params
                callback:(CallFunctionCallback)cb {
    NSString *name = [NSString stringWithUTF8String:functionName.c_str()];
    DomValueType type = params.GetType();
    NSMutableArray *finalParams = [NSMutableArray array];
    [finalParams addObject:@(componentTag)];
    if (DomValueType::kArray == type) {
        NSArray * paramsArray = DomValueToOCType(&params);
        NSAssert([paramsArray isKindOfClass:[NSArray class]], @"dispatch function method params type error");
        if ([paramsArray isKindOfClass:[NSArray class]]) {
            for (id param in paramsArray) {
                [finalParams addObject:param];
            }
        }
    } else if (DomValueType::kNull == type) {
        // no op
    } else {
        NSAssert(NO, @"Unsupported params type");
    }
    
    if (cb) {
        HippyPromiseResolveBlock senderBlock = ^(id senderParams) {
            std::shared_ptr<DomArgument> domArgument = std::make_shared<DomArgument>([senderParams toDomArgument]);
            cb(domArgument);
        };
        [finalParams addObject:senderBlock];
    }
    
    NSString *nativeModuleName = [NSString stringWithUTF8String:viewName.c_str()];
    HippyComponentData *componentData = [self componentDataForViewName:nativeModuleName];
    HippyModuleData *moduleData = [self.bridge moduleDataForName:nativeModuleName];
    id<HippyBridgeMethod> method = moduleData.methodsByName[name];
    if (method) {
        @try {
            [method invokeWithBridge:self.bridge module:componentData.manager arguments:finalParams];
        } @catch (NSException *exception) {
            NSString *errMsg = [NSString stringWithFormat:@"Exception '%@' was thrown while invoking %@ on component %@ with params %@",
                                exception, name, nativeModuleName, finalParams];
            HippyFatal(HippyErrorWithMessage(errMsg));
        }
    } else {
        NSString *errMsg = [NSString stringWithFormat:@"No corresponding method(%@ of %@) was found!", name, nativeModuleName];
        HippyFatal(HippyErrorWithMessage(errMsg));
    }
    return;
}

- (void)registerExtraComponent:(NSArray<Class> *)extraComponents {
    self.extraComponents = extraComponents;
}


#pragma mark - Event Handler

- (void)addEventName:(const std::string &)name
        forDomNodeId:(int32_t)node_id
          onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    HippyShadowView *renderObject = [self shadowViewForHippyTag:@(node_id) onRootTag:@(root_id)];
    [renderObject addEventName:name];
    if (name == hippy::kClickEvent) {
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = viewRegistry[@(node_id)];
            [uiManager addClickEventListenerForView:view onRootNode:rootNode];
        }];
    } else if (name == hippy::kLongClickEvent) {
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = viewRegistry[@(node_id)];
            [uiManager addLongClickEventListenerForView:view onRootNode:rootNode];
        }];
    } else if (name == hippy::kTouchStartEvent || name == hippy::kTouchMoveEvent
               || name == hippy::kTouchEndEvent || name == hippy::kTouchCancelEvent) {
        std::string name_ = name;
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = viewRegistry[@(node_id)];
            [uiManager addTouchEventListenerForType:name_ forView:view onRootNode:rootNode];
        }];
    } else if (name == hippy::kPressIn || name == hippy::kPressOut) {
        std::string name_ = name;
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = viewRegistry[@(node_id)];
            [uiManager addPressEventListenerForType:name_ forView:view onRootNode:rootNode];
        }];
    } else if (name == kVSyncKey) {
        std::string name_ = name;
        __weak __typeof(self)weakSelf = self;
        [self domNodeForComponentTag:node_id onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
            if (node) {
                //for kVSyncKey event, node is rootnode
                __strong __typeof(weakSelf)strongSelf = weakSelf;
                NSString *vsyncKey = [NSString stringWithFormat:@"%p-%d", strongSelf, node_id];
                auto event = std::make_shared<hippy::DomEvent>(name_, node);
                std::weak_ptr<DomNode> weakNode = node;
                [[HippyVsyncManager sharedInstance] registerVsyncObserver:^{
                    __strong __typeof(weakSelf)strongSelf = weakSelf;
                    HippyBridge *bridge = strongSelf.bridge;
                    [bridge.javaScriptExecutor executeAsyncBlockOnJavaScriptQueue:^{
                        auto strongNode = weakNode.lock();
                        if (strongNode) {
                            strongNode->HandleEvent(event);
                        }
                    }];
                } forKey:vsyncKey];
            }
        }];
    } else {
        std::string name_ = name;
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = viewRegistry[@(node_id)];
            [uiManager addPropertyEvent:name_ forView:view onRootNode:rootNode];
        }];
    }
}

/// Called when creating view from shadowView
- (void)addEventNameInMainThread:(const std::string &)name
                         forView:(UIView *)view
                    onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    if (name == hippy::kClickEvent) {
        [self addClickEventListenerForView:view onRootNode:rootNode];
    } else if (name == hippy::kLongClickEvent) {
        [self addLongClickEventListenerForView:view onRootNode:rootNode];
    } else if (name == hippy::kTouchStartEvent || name == hippy::kTouchMoveEvent
               || name == hippy::kTouchEndEvent || name == hippy::kTouchCancelEvent) {
        [self addTouchEventListenerForType:name forView:view onRootNode:rootNode];
    } else if (name == hippy::kPressIn || name == hippy::kPressOut) {
        [self addPressEventListenerForType:name forView:view onRootNode:rootNode];
    } else {
        [self addPropertyEvent:name forView:view onRootNode:rootNode];
    }
}

- (void)addClickEventListenerForView:(UIView *)view onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    int32_t componentTag = view.hippyTag.intValue;
    if (view) {
        __weak id weakSelf = self;
        OnTouchEventHandler eventListener = ^(CGPoint point,
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
        };
        [view setOnClick:eventListener];
    }
}

- (void)addLongClickEventListenerForView:(UIView *)view onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    int32_t componentTag = view.hippyTag.intValue;
    if (view) {
        __weak id weakSelf = self;
        OnTouchEventHandler eventListener = ^(CGPoint point,
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
        };
        [view setOnLongClick:eventListener];
    }
}

- (void)addPressEventListenerForType:(const std::string &)type
                             forView:(UIView *)view
                          onRootNode:(std::weak_ptr<RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    AssertMainQueue();
    int32_t componentTag = view.hippyTag.intValue;
    if (view) {
        std::string block_type = type;
        __weak id weakSelf = self;
        OnTouchEventHandler eventListener = ^(CGPoint point,
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
        };
        if (hippy::kPressIn == type) {
            [view setOnPressIn:eventListener];
        } else if (hippy::kPressOut == type) {
            [view setOnPressOut:eventListener];
        }
    }
}

- (void)addTouchEventListenerForType:(const std::string &)type
                             forView:(UIView *)view
                          onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    int32_t componentTag = view.hippyTag.intValue;
    if (view) {
        const std::string type_ = type;
        __weak id weakSelf = self;
        OnTouchEventHandler eventListener = ^(CGPoint point,
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
        };
        if (type == hippy::kTouchStartEvent) {
            [view setOnTouchDown:eventListener];
        } else if (type == hippy::kTouchMoveEvent) {
            [view setOnTouchMove:eventListener];
        } else if (type == hippy::kTouchEndEvent) {
            [view setOnTouchEnd:eventListener];
        } else if (type == hippy::kTouchCancelEvent) {
            [view setOnTouchCancel:eventListener];
        }
    }
}

- (void)removeEventName:(const std::string &)eventName
           forDomNodeId:(int32_t)node_id
             onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    
    int32_t componentTag = node_id;
    if (eventName == kVSyncKey) {
       std::string name_ = eventName;
       [self domNodeForComponentTag:node_id onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> node) {
           if (node) {
               //for kVSyncKey event, node is rootnode
               NSString *vsyncKey = [NSString stringWithFormat:@"%p-%d", self, node_id];
               [[HippyVsyncManager sharedInstance] unregisterVsyncObserverForKey:vsyncKey];
           }
       }];
   } else {
        std::string name_ = eventName;
        [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = [viewRegistry objectForKey:@(componentTag)];
            [view removePropertyEvent:name_.c_str()];
        }];
    }
}

- (void)removeVSyncEventOnRootNode:(std::weak_ptr<hippy::RootNode>)rootNode {
    NSString *vsyncKey = [NSString stringWithFormat:@"%p-%d", self, static_cast<int>(rootNode.lock()->GetId())];
    [[HippyVsyncManager sharedInstance] unregisterVsyncObserverForKey:vsyncKey];
}

- (void)addPropertyEvent:(const std::string &)name
                 forView:(UIView *)view
              onRootNode:(std::weak_ptr<RootNode>)rootNode {
    AssertMainQueue();
    auto strongRootNode = rootNode.lock();
    if (!strongRootNode) {
        return;
    }
    int32_t root_id = strongRootNode->GetId();
    int32_t node_id = view.hippyTag.intValue;
    if (view) {
        NSString *viewName = view.viewName;
        HippyComponentData *component = [self componentDataForViewName:viewName];
        NSDictionary<NSString *, NSString *> *eventMap = [component eventNameMap];
        NSString *mapToEventName = [eventMap objectForKey:[NSString stringWithUTF8String:name.c_str()]];
        if (mapToEventName) {
            BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:name.c_str()];
            BOOL canBePreventedInBubbling = [view canBePreventInBubbling:name.c_str()];
            __weak id weakSelf = self;
            std::string name_ = name;
            [view addPropertyEvent:[mapToEventName UTF8String] eventCallback:^(NSDictionary *body) {
                id strongSelf = weakSelf;
                if (strongSelf) {
                    [strongSelf domNodeForComponentTag:node_id onRootNode:rootNode resultNode:^(std::shared_ptr<DomNode> domNode) {
                        if (domNode && name_.length() > 0) {
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
                block(viewRegistry, nil);
            }
        }];
    }
    [self addUIBlock:^(HippyUIManager *uiManager, __unused NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        NSArray *transactionListeners = [uiManager->_componentTransactionListeners allObjects];
        for (id<HippyComponent> node in transactionListeners) {
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

- (void)domEventDidHandle:(const std::string &)eventName forNode:(int32_t)tag onRoot:(int32_t)rootTag {
    // no op
}


#pragma mark - Font Refresh

- (NSNumber *)globalFontSizeMultiplier {
    @synchronized (self) {
        return _globalFontSizeMultiplier;
    }
}

- (void)updateGlobalFontSizeMultiplier {
    if ([self.bridge.delegate respondsToSelector:@selector(fontSizeMultiplierForHippy:)]) {
        CGFloat scale = [self.bridge.delegate fontSizeMultiplierForHippy:self.bridge];
        if (scale >= 0.0) {
            @synchronized (self) {
                if (_globalFontSizeMultiplier || (!_globalFontSizeMultiplier && scale != 1.0)) {
                    _globalFontSizeMultiplier = @(scale);
                }
            }
        } else {
            HippyLogError(@"Illegal Global FontSizeMultiplier:%f, current:%@", scale, self.globalFontSizeMultiplier);
        }
    }
}

- (void)onFontChangedFromNative:(NSNotification *)notification {
    NSNumber *targetRootTag = notification.object;
    if ((targetRootTag != nil) && ![self.viewRegistry containRootComponentWithTag:targetRootTag]) {
        // do compare if notification has target RootView.
        return;
    }
    
    // update fontSize multiplier
    [self updateGlobalFontSizeMultiplier];
    
    __weak __typeof(self)weakSelf = self;
    [self.bridge.javaScriptExecutor executeAsyncBlockOnJavaScriptQueue:^{
        __strong __typeof(weakSelf)strongSelf = weakSelf;
        if (!strongSelf) {
            return;
        }

        NSArray<NSNumber *> *allRootTags;
        if (targetRootTag != nil) {
            allRootTags = [NSArray arrayWithObject:targetRootTag];
        } else {
            // UIManager may have more than one Root
            allRootTags = strongSelf->_shadowViewRegistry.allRootTags;
        }
        
        CGFloat fontSizeMultiplier = [strongSelf.globalFontSizeMultiplier doubleValue];
        for (NSNumber *rootTag in allRootTags) {
            NSArray<HippyShadowView *> *shadowViews = [strongSelf->_shadowViewRegistry componentsForRootTag:rootTag].allValues;
            Class shadowTextClass = [HippyShadowText class];
            Class shadowTextViewClass = [HippyShadowTextView class];
            for (HippyShadowView *shadowView in shadowViews) {
                if ([shadowView isKindOfClass:shadowTextClass] ||
                    [shadowView isKindOfClass:shadowTextViewClass]) {
                    if (fontSizeMultiplier > 0.0) {
                        ((HippyShadowText *)shadowView).fontSizeMultiplier = fontSizeMultiplier;
                    }
                    [shadowView dirtyText:NO];
                    [shadowView dirtyPropagation:NativeRenderUpdateLifecycleLayoutDirtied];
                }
            }
            // do layout and refresh UI
            auto domManager = self.domManager.lock();
            if (domManager) {
                auto rootNode = [strongSelf->_shadowViewRegistry rootNodeForTag:rootTag];
                domManager->DoLayout(rootNode);
                domManager->EndBatch(rootNode);
            }
        }
    }];
}

@end


@implementation HippyBridge (HippyUIManager)

- (HippyUIManager *)uiManager {
    return objc_getAssociatedObject(self, @selector(uiManager));
}

- (void)setUiManager:(HippyUIManager *)uiManager {
    objc_setAssociatedObject(self, @selector(uiManager), uiManager, OBJC_ASSOCIATION_RETAIN);
}

- (id<HippyCustomTouchHandlerProtocol>)customTouchHandler {
    return objc_getAssociatedObject(self, @selector(customTouchHandler));
}

- (void)setCustomTouchHandler:(id<HippyCustomTouchHandlerProtocol>)customTouchHandler {
    objc_setAssociatedObject(self, @selector(customTouchHandler), customTouchHandler, OBJC_ASSOCIATION_RETAIN);
}

@end

