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
#import "HippyAssert.h"
#import "HippyBridge.h"
#import "HippyBridge+Private.h"
#import "HippyComponent.h"
#import "HippyComponentData.h"
#import "HippyConvert.h"
#import "HippyDefines.h"
#import "HippyEventDispatcher.h"
#import "HippyLog.h"
#import "HippyModuleData.h"
#import "HippyModuleMethod.h"
#import "HippyRootShadowView.h"
#import "HippyScrollableProtocol.h"
#import "HippyShadowView.h"
#import "HippyUtils.h"
#import "HippyView.h"
#import "HippyViewManager.h"
#import "UIView+Hippy.h"
#import "HippyExtAnimationViewParams.h"
#import "HippyExtAnimationModule.h"
#import "UIView+Private.h"
#import "HippyBaseListViewProtocol.h"
#import "HippyMemoryOpt.h"
#import "HippyDeviceBaseInfo.h"
#import "OCTypeToDomArgument.h"

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

static dispatch_queue_t renderQueue() {
    static dispatch_once_t onceToken;
    static dispatch_queue_t renderQueue = nil;
    dispatch_once(&onceToken, ^{
        renderQueue = dispatch_queue_create("com.tencent.hippy.renderQueue", DISPATCH_QUEUE_SERIAL);
    });
    return renderQueue;
}

using HPViewBinding = std::unordered_map<int32_t, std::tuple<std::vector<int32_t>, std::vector<int32_t>>>;
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

- (void)removeAllObjects {
    _viewRelation.clear();
}

@end

@protocol HippyBaseListViewProtocol;

static void HippyTraverseViewNodes(id<HippyComponent> view, void (^block)(id<HippyComponent>)) {
    if (view.hippyTag) {
        block(view);

        for (id<HippyComponent> subview in view.hippySubviews) {
            HippyTraverseViewNodes(subview, block);
        }
    }
}

const char *HippyUIManagerQueueName = "com.tencent.hippy.ShadowQueue";
NSString *const HippyUIManagerWillUpdateViewsDueToContentSizeMultiplierChangeNotification
    = @"HippyUIManagerWillUpdateViewsDueToContentSizeMultiplierChangeNotification";
NSString *const HippyUIManagerDidRegisterRootViewNotification = @"HippyUIManagerDidRegisterRootViewNotification";
NSString *const HippyUIManagerDidRemoveRootViewNotification = @"HippyUIManagerDidRemoveRootViewNotification";
NSString *const HippyUIManagerRootViewKey = @"HippyUIManagerRootViewKey";
NSString *const HippyUIManagerDidEndBatchNotification = @"HippyUIManagerDidEndBatchNotification";

@interface HippyUIManager() {
    NSMutableSet<NSNumber *> *_rootViewTags;
    NSMutableArray<HippyViewManagerUIBlock> *_pendingUIBlocks;
    NSMutableArray<NSNumber *> *_listTags;
    NSMutableSet<UIView *> *_viewsToBeDeleted;  // Main thread only

    NSMutableDictionary<NSNumber *, HippyShadowView *> *_shadowViewRegistry;  // Hippy thread only
    NSMutableDictionary<NSNumber *, UIView *> *_viewRegistry;                 // Main thread only

    // Keyed by viewName
    NSDictionary *_componentDataByName;

    NSMutableSet<id<HippyComponent>> *_bridgeTransactionListeners;

    NSMutableArray<HippyViewUpdateCompletedBlock> *_completeBlocks;

    NSMutableSet<NSNumber *> *_listAnimatedViewTags;
    std::weak_ptr<DomManager> _domManager;
}

//store container views tags with their subview tags for every time views created or updated
@property(nonatomic, readonly)NSMutableDictionary<NSNumber *, NSArray<NSNumber *> *> *pendingViewToSetChildrn;

@end

@implementation HippyUIManager

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE()

- (instancetype)init {
    self = [super init];
    if (self) {
        _listAnimatedViewTags = [NSMutableSet set];
        NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
        _pendingViewToSetChildrn = [NSMutableDictionary dictionary];
        [center addObserver:self selector:@selector(didReceiveMemoryWarning) name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
        [center addObserver:self selector:@selector(appDidEnterBackground) name:UIApplicationDidEnterBackgroundNotification object:nil];
        [center addObserver:self selector:@selector(appWillEnterForeground) name:UIApplicationWillEnterForegroundNotification object:nil];
    }
    return self;
}

- (void)dealloc {
}

- (void)didReceiveMemoryWarning {
    for (UIView *view in [self->_viewRegistry allValues]) {
        if ([view conformsToProtocol:@protocol(HippyMemoryOpt)]) {
            [(id<HippyMemoryOpt>)view didReceiveMemoryWarning];
        }
    }
}
- (void)appDidEnterBackground {
    for (UIView *view in [self->_viewRegistry allValues]) {
        if ([view conformsToProtocol:@protocol(HippyMemoryOpt)]) {
            [(id<HippyMemoryOpt>)view appDidEnterBackground];
        }
    }
}
- (void)appWillEnterForeground {
    for (UIView *view in [self->_viewRegistry allValues]) {
        if ([view conformsToProtocol:@protocol(HippyMemoryOpt)]) {
            [(id<HippyMemoryOpt>)view appWillEnterForeground];
        }
    }
}

- (void)didReceiveNewContentSizeMultiplier {
    dispatch_async(HippyGetUIManagerQueue(), ^{
        [[NSNotificationCenter defaultCenter] postNotificationName:HippyUIManagerWillUpdateViewsDueToContentSizeMultiplierChangeNotification
                                                            object:self];
        [self setNeedsLayout];
    });
}

- (NSMutableArray *)completeBlocks {
    if (nil == _completeBlocks) {
        _completeBlocks = [NSMutableArray array];
    }
    return _completeBlocks;
}

- (void)invalidate {
    /**
     * Called on the JS Thread since all modules are invalidated on the JS thread
     */

    // This only accessed from the shadow queue
    _pendingUIBlocks = nil;
    _shadowViewRegistry = nil;

    dispatch_async(dispatch_get_main_queue(), ^{
        for (NSNumber *rootViewTag in self->_rootViewTags) {
            [(id<HippyInvalidating>)self->_viewRegistry[rootViewTag] invalidate];
            [self->_viewRegistry removeObjectForKey:rootViewTag];
        }

        for (NSNumber *hippyTag in [self->_viewRegistry allKeys]) {
            id<HippyComponent> subview = self->_viewRegistry[hippyTag];
            if ([subview conformsToProtocol:@protocol(HippyInvalidating)]) {
                [(id<HippyInvalidating>)subview invalidate];
            }
        }

        self->_rootViewTags = nil;
        self->_viewRegistry = nil;
        self->_bridgeTransactionListeners = nil;
        self->_bridge = nil;
        self->_listTags = nil;

        [[NSNotificationCenter defaultCenter] removeObserver:self];
    });
    [_completeBlocks removeAllObjects];
}

- (NSMutableDictionary<NSNumber *, HippyShadowView *> *)shadowViewRegistry {
    // NOTE: this method only exists so that it can be accessed by unit tests
    if (!_shadowViewRegistry) {
        _shadowViewRegistry = [NSMutableDictionary new];
    }
    return _shadowViewRegistry;
}

- (NSMutableDictionary<NSNumber *, UIView *> *)viewRegistry {
    // NOTE: this method only exists so that it can be accessed by unit tests
    if (!_viewRegistry) {
        _viewRegistry = [NSMutableDictionary new];
    }
    return _viewRegistry;
}

- (void)setBridge:(HippyBridge *)bridge {
    HippyAssert(_bridge == nil, @"Should not re-use same UIIManager instance");

    _bridge = bridge;

    _shadowViewRegistry = [NSMutableDictionary new];
    _viewRegistry = [NSMutableDictionary new];

    _listTags = [NSMutableArray new];

    // Internal resources
    _pendingUIBlocks = [NSMutableArray new];
    _rootViewTags = [NSMutableSet new];

    _bridgeTransactionListeners = [NSMutableSet new];

    _viewsToBeDeleted = [NSMutableSet new];

    // Get view managers from bridge
    NSMutableDictionary *componentDataByName = [NSMutableDictionary new];
    for (Class moduleClass in _bridge.moduleClasses) {
        if ([moduleClass isSubclassOfClass:[HippyViewManager class]]) {
            HippyComponentData *componentData = [[HippyComponentData alloc] initWithManagerClass:moduleClass bridge:_bridge];
            componentDataByName[componentData.name] = componentData;
        }
    }

    _componentDataByName = [componentDataByName copy];
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

- (void)registerRootView:(UIView *)rootView withSizeFlexibility:(HippyRootViewSizeFlexibility)sizeFlexibility {
    HippyAssertMainQueue();

    NSNumber *hippyTag = rootView.hippyTag;
    HippyAssert(HippyIsHippyRootView(hippyTag), @"View %@ with tag #%@ is not a root view", rootView, hippyTag);

#if HIPPY_DEBUG
    UIView *existingView = _viewRegistry[hippyTag];
    HippyAssert(existingView == nil || existingView == rootView, @"Expect all root views to have unique tag. Added %@ twice", hippyTag);
#endif
    // Register view
    _viewRegistry[hippyTag] = rootView;

    CGRect frame = rootView.frame;
    
    UIColor *backgroundColor = [rootView backgroundColor];
    // Register shadow view
    dispatch_async(HippyGetUIManagerQueue(), ^{
        if (!self->_viewRegistry) {
            return;
        }

        HippyRootShadowView *shadowView = [HippyRootShadowView new];
        shadowView.hippyTag = hippyTag;
        shadowView.frame = frame;
        shadowView.backgroundColor = backgroundColor;
        shadowView.viewName = NSStringFromClass([rootView class]);
        shadowView.sizeFlexibility = sizeFlexibility;
        self->_shadowViewRegistry[shadowView.hippyTag] = shadowView;
        [self->_rootViewTags addObject:hippyTag];
    });

    [[NSNotificationCenter defaultCenter] postNotificationName:HippyUIManagerDidRegisterRootViewNotification object:self
                                                      userInfo:@{ HippyUIManagerRootViewKey: rootView }];
}

- (UIView *)viewForHippyTag:(NSNumber *)hippyTag {
    HippyAssertMainQueue();
    return _viewRegistry[hippyTag];
}

- (HippyShadowView *)shadowViewForHippyTag:(NSNumber *)hippyTag {
    return _shadowViewRegistry[hippyTag];
}

- (void)setFrame:(CGRect)frame forView:(UIView *)view
{
    HippyAssertMainQueue();

    // The following variable has no meaning if the view is not a hippy root view
    HippyRootViewSizeFlexibility sizeFlexibility = HippyRootViewSizeFlexibilityNone;
    BOOL isRootView = NO;
    if (HippyIsHippyRootView(view.hippyTag)) {
        HippyRootView *rootView = (HippyRootView *)[view superview];
        if (rootView != nil) {
            sizeFlexibility = rootView.sizeFlexibility;
            isRootView = YES;
        }
    }

    NSNumber *hippyTag = view.hippyTag;
    dispatch_async(HippyGetUIManagerQueue(), ^{
        HippyShadowView *shadowView = self->_shadowViewRegistry[hippyTag];
        if (shadowView == nil) {
            if (isRootView) {
            }
            return;
        }

        BOOL needsLayout = NO;
        if (!CGRectEqualToRect(frame, shadowView.frame)) {
            shadowView.frame = frame;
            needsLayout = YES;
        }

        // Trigger re-layout when size flexibility changes, as the root view might grow or
        // shrink in the flexible dimensions.
        if (HippyIsHippyRootView(hippyTag)) {
            HippyRootShadowView *rootShadowView = (HippyRootShadowView *)shadowView;
            if (rootShadowView.sizeFlexibility != sizeFlexibility) {
                rootShadowView.sizeFlexibility = sizeFlexibility;
                needsLayout = YES;
            }
        }

        if (needsLayout) {
            [self setNeedsLayout:hippyTag];
        }
    });
}

- (void)setBackgroundColor:(UIColor *)color forView:(UIView *)view {
    HippyAssertMainQueue();
    NSNumber *hippyTag = view.hippyTag;
    dispatch_async(HippyGetUIManagerQueue(), ^{
        if (!self->_viewRegistry) {
            return;
        }
        HippyShadowView *shadowView = self->_shadowViewRegistry[hippyTag];
        HippyAssert(shadowView != nil, @"Could not locate root view with tag #%@", hippyTag);
        shadowView.backgroundColor = color;
        [self _amendPendingUIBlocksWithStylePropagationUpdateForShadowView:shadowView];
        [self flushUIBlocks];
    });
}

/**
 * Unregisters views from registries
 */
- (void)_purgeChildren:(NSArray<id<HippyComponent>> *)children fromRegistry:(NSMutableDictionary<NSNumber *, id<HippyComponent>> *)registry {
    for (id<HippyComponent> child in children) {
        HippyTraverseViewNodes(registry[child.hippyTag], ^(id<HippyComponent> subview) {
            HippyAssert(![subview isHippyRootView], @"Root views should not be unregistered");
            if ([subview conformsToProtocol:@protocol(HippyInvalidating)]) {
                [(id<HippyInvalidating>)subview invalidate];
            }
            [registry removeObjectForKey:subview.hippyTag];

            if (registry == (NSMutableDictionary<NSNumber *, id<HippyComponent>> *)self->_viewRegistry) {
                [self->_bridgeTransactionListeners removeObject:subview];
            }
        });
    }
}

- (void)addUIBlock:(HippyViewManagerUIBlock)block {
    if (!block || !_viewRegistry) {
        return;
    }

    [_pendingUIBlocks addObject:block];
}

- (void)executeBlockOnUIManagerQueue:(dispatch_block_t)block {
    dispatch_async(HippyGetUIManagerQueue(), ^{
        if (block) {
            block();
        }
    });
}

- (HippyViewManagerUIBlock)uiBlockWithLayoutUpdateForRootView:(HippyRootShadowView *)rootShadowView {
//    HippyAssert(!HippyIsMainQueue(), @"Should be called on shadow queue");

    // This is nuanced. In the JS thread, we create a new update buffer
    // `frameTags`/`frames` that is created/mutated in the JS thread. We access
    // these structures in the UI-thread block. `NSMutableArray` is not thread
    // safe so we rely on the fact that we never mutate it after it's passed to
    // the main thread.
    NSSet<HippyShadowView *> *viewsWithNewFrames = [rootShadowView collectShadowViewsHaveNewLayoutResultsForRootShadowView];

    if (!viewsWithNewFrames.count) {
        // no frame change results in no UI update block
        return nil;
    }
    return ^(HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        for (HippyShadowView *shadowView in viewsWithNewFrames) {
            NSNumber *hippyTag = shadowView.hippyTag;
            UIView *view = viewRegistry[hippyTag];
            [view hippySetFrame:shadowView.frame];
            [view clearSortedSubviews];
            [view didUpdateHippySubviews];
        }
    };
}

- (void)_amendPendingUIBlocksWithStylePropagationUpdateForShadowView:(HippyShadowView *)topView {
    NSMutableSet<HippyApplierBlock> *applierBlocks = [NSMutableSet setWithCapacity:1];

    [topView collectUpdatedProperties:applierBlocks parentProperties:@{}];
    if (applierBlocks.count) {
        [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
            for (HippyApplierBlock block in applierBlocks) {
                block(viewRegistry);
            }
        }];
    }
}

/**
 * A method to be called from JS, which takes a container ID and then releases
 * all subviews for that container upon receipt.
 */
// clang-format off
HIPPY_EXPORT_METHOD(removeSubviewsFromContainerWithID:(nonnull NSNumber *)containerID) {
    id<HippyComponent> container = _shadowViewRegistry[containerID];
    HippyAssert(container != nil, @"container view (for ID %@) not found", containerID);
    
    NSUInteger subviewsCount = [container hippySubviews].count;
    NSMutableArray<NSNumber *> *indices = [[NSMutableArray alloc] initWithCapacity:subviewsCount];
    for (NSUInteger childIndex = 0; childIndex < subviewsCount; childIndex++) {
        [indices addObject:@(childIndex)];
    }
    
    [self manageChildren:containerID
         moveFromIndices:nil
           moveToIndices:nil
       addChildHippyTags:nil
            addAtIndices:nil
         removeAtIndices:indices];
}
// clang-format on

/**
 * Disassociates children from container. Doesn't remove from registries.
 * TODO: use [NSArray getObjects:buffer] to reuse same fast buffer each time.
 *
 * @returns Array of removed items.
 */
- (NSArray<id<HippyComponent>> *)_childrenToRemoveFromContainer:(id<HippyComponent>)container atIndices:(NSArray<NSNumber *> *)atIndices {
    // If there are no indices to move or the container has no subviews don't bother
    // We support parents with nil subviews so long as they're all nil so this allows for this behavior
    if (atIndices.count == 0 || [container hippySubviews].count == 0) {
        return nil;
    }
    // Construction of removed children must be done "up front", before indices are disturbed by removals.
    NSMutableArray<id<HippyComponent>> *removedChildren = [NSMutableArray arrayWithCapacity:atIndices.count];
    HippyAssert(container != nil, @"container view (for ID %@) not found", container);
    for (NSNumber *indexNumber in atIndices) {
        NSUInteger index = indexNumber.unsignedIntegerValue;
        if (index < [container hippySubviews].count) {
            [removedChildren addObject:[container hippySubviews][index]];
        }
    }

    return removedChildren;
}

- (void)_removeChildren:(NSArray<id<HippyComponent>> *)children fromContainer:(id<HippyComponent>)container {
    for (id<HippyComponent> removedChild in children) {
        [container removeHippySubview:removedChild];
    }
}

// clang-format off
HIPPY_EXPORT_METHOD(removeRootView:(nonnull NSNumber *)rootHippyTag) {
    HippyShadowView *rootShadowView = _shadowViewRegistry[rootHippyTag];
    HippyAssert(rootShadowView.superview == nil, @"root view cannot have superview (ID %@)", rootHippyTag);
    [self _purgeChildren:(NSArray<id<HippyComponent>> *)rootShadowView.hippySubviews
            fromRegistry:(NSMutableDictionary<NSNumber *, id<HippyComponent>> *)_shadowViewRegistry];
    [_shadowViewRegistry removeObjectForKey:rootHippyTag];
    [_rootViewTags removeObject:rootHippyTag];
        
    [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        HippyAssertMainQueue();
        UIView *rootView = viewRegistry[rootHippyTag];
        if (rootView) {
            [uiManager _purgeChildren:(NSArray<id<HippyComponent>> *)rootView.hippySubviews
                         fromRegistry:(NSMutableDictionary<NSNumber *, id<HippyComponent>> *)viewRegistry];
            [(NSMutableDictionary *)viewRegistry removeObjectForKey:rootHippyTag];
            [[NSNotificationCenter defaultCenter] postNotificationName:HippyUIManagerDidRemoveRootViewNotification
                                                                object:uiManager
                                                              userInfo:@{HippyUIManagerRootViewKey: rootView}];
        }
    }];
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(replaceExistingNonRootView:(nonnull NSNumber *)hippyTag
                  withView:(nonnull NSNumber *)newHippyTag) {
    HippyShadowView *shadowView = _shadowViewRegistry[hippyTag];
    HippyAssert(shadowView != nil, @"shadowView (for ID %@) not found", hippyTag);
    
    HippyShadowView *superShadowView = shadowView.superview;
    HippyAssert(superShadowView != nil, @"shadowView super (of ID %@) not found", hippyTag);
    
    NSUInteger indexOfView = [superShadowView.hippySubviews indexOfObject:shadowView];
    HippyAssert(indexOfView != NSNotFound, @"View's superview doesn't claim it as subview (id %@)", hippyTag);
    NSArray<NSNumber *> *removeAtIndices = @[@(indexOfView)];
    NSArray<NSNumber *> *addTags = @[newHippyTag];
    [self manageChildren:superShadowView.hippyTag
         moveFromIndices:nil
           moveToIndices:nil
       addChildHippyTags:addTags
            addAtIndices:removeAtIndices
         removeAtIndices:removeAtIndices];
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(setChildren:(nonnull NSNumber *)containerTag
                  hippyTags:(NSArray<NSNumber *> *)hippyTags) {
    HippySetChildren(containerTag, hippyTags,
                   (NSDictionary<NSNumber *, id<HippyComponent>> *)_shadowViewRegistry);
    [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        HippySetChildren(containerTag, hippyTags,
                       (NSDictionary<NSNumber *, id<HippyComponent>> *)viewRegistry);
    }];
}
// clang-format on

static void HippySetChildren(NSNumber *containerTag, NSArray<NSNumber *> *hippyTags, NSDictionary<NSNumber *, id<HippyComponent>> *registry) {
    id<HippyComponent> container = registry[containerTag];
    for (NSNumber *hippyTag in hippyTags) {
        id<HippyComponent> view = registry[hippyTag];
        if (view) {
            [container insertHippySubview:view atIndex:container.hippySubviews.count];
        }
    }
}

- (void)setChildrenForPendingView {
    NSMutableDictionary<NSNumber *, NSArray<NSNumber *> *> *viewsToSetChildren = [self pendingViewToSetChildrn];
    [viewsToSetChildren enumerateKeysAndObjectsUsingBlock:^(NSNumber * _Nonnull key, NSArray<NSNumber *> * _Nonnull obj, BOOL * _Nonnull stop) {
        HippySetChildren(key, obj, _viewRegistry);
        UIView *view = [self viewForHippyTag:key];
        [view setHippySubviewsUpdated:YES];
    }];
    UIView *rootView = [self viewForHippyTag:[self rootHippyTag]];
    [self recursivelyUpdateSubviewsFromView:rootView];
    [viewsToSetChildren removeAllObjects];
}

- (void)recursivelyUpdateSubviewsFromView:(UIView *)view {
    if ([view isHippySubviewsUpdated]) {
        [view didUpdateHippySubviews];
        view.hippySubviewsUpdated = NO;
    }
    for (UIView *subview in view.hippySubviews) {
        [self recursivelyUpdateSubviewsFromView:subview];
    }
}

// clang-format off
HIPPY_EXPORT_METHOD(startBatch) {
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(endBatch) {
    if (_pendingUIBlocks.count) {
        [self batchDidComplete];
        [[NSNotificationCenter defaultCenter] postNotificationName:HippyUIManagerDidEndBatchNotification
                                                            object:self];
    }
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(manageChildren:(nonnull NSNumber *)containerTag
                  moveFromIndices:(NSArray<NSNumber *> *)moveFromIndices
                  moveToIndices:(NSArray<NSNumber *> *)moveToIndices
                  addChildHippyTags:(NSArray<NSNumber *> *)addChildHippyTags
                  addAtIndices:(NSArray<NSNumber *> *)addAtIndices
                  removeAtIndices:(NSArray<NSNumber *> *)removeAtIndices) {
    [self _manageChildren:containerTag
          moveFromIndices:moveFromIndices
            moveToIndices:moveToIndices
        addChildHippyTags:addChildHippyTags
             addAtIndices:addAtIndices
          removeAtIndices:removeAtIndices
                 registry:(NSMutableDictionary<NSNumber *, id<HippyComponent>> *)_shadowViewRegistry];
    [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        [uiManager _manageChildren:containerTag
                   moveFromIndices:moveFromIndices
                     moveToIndices:moveToIndices
                 addChildHippyTags:addChildHippyTags
                      addAtIndices:addAtIndices
                   removeAtIndices:removeAtIndices
                          registry:(NSMutableDictionary<NSNumber *, id<HippyComponent>> *)viewRegistry];
    }];
}
// clang-format on

- (void)_manageChildren:(NSNumber *)containerTag
        moveFromIndices:(NSArray<NSNumber *> *)moveFromIndices
          moveToIndices:(NSArray<NSNumber *> *)moveToIndices
      addChildHippyTags:(NSArray<NSNumber *> *)addChildHippyTags
           addAtIndices:(NSArray<NSNumber *> *)addAtIndices
        removeAtIndices:(NSArray<NSNumber *> *)removeAtIndices
               registry:(NSMutableDictionary<NSNumber *, id<HippyComponent>> *)registry {
    id<HippyComponent> container = registry[containerTag];
    HippyAssert(moveFromIndices.count == moveToIndices.count, @"moveFromIndices had size %tu, moveToIndices had size %tu", moveFromIndices.count,
        moveToIndices.count);
    HippyAssert(addChildHippyTags.count == addAtIndices.count, @"there should be at least one Hippy child to add");

    // Removes (both permanent and temporary moves) are using "before" indices
    NSArray<id<HippyComponent>> *permanentlyRemovedChildren = [self _childrenToRemoveFromContainer:container atIndices:removeAtIndices];
    NSArray<id<HippyComponent>> *temporarilyRemovedChildren = [self _childrenToRemoveFromContainer:container atIndices:moveFromIndices];
    BOOL isUIViewRegistry = registry == (NSMutableDictionary<NSNumber *, id<HippyComponent>> *)_viewRegistry;
    [self _removeChildren:permanentlyRemovedChildren fromContainer:container];

    [self _removeChildren:temporarilyRemovedChildren fromContainer:container];
    [self _purgeChildren:permanentlyRemovedChildren fromRegistry:registry];

    // Figure out what to insert - merge temporary inserts and adds
    NSMutableDictionary *destinationsToChildrenToAdd = [NSMutableDictionary dictionary];
    for (NSInteger index = 0, length = temporarilyRemovedChildren.count; index < length; index++) {
        destinationsToChildrenToAdd[moveToIndices[index]] = temporarilyRemovedChildren[index];
    }
    for (NSInteger index = 0, length = addAtIndices.count; index < length; index++) {
        id<HippyComponent> view = registry[addChildHippyTags[index]];
        if (view) {
            destinationsToChildrenToAdd[addAtIndices[index]] = view;
        }
    }

    NSArray<NSNumber *> *sortedIndices = [destinationsToChildrenToAdd.allKeys sortedArrayUsingSelector:@selector(compare:)];
    for (NSNumber *hippyIndex in sortedIndices) {
        NSInteger insertAtIndex = hippyIndex.integerValue;

        // When performing a delete animation, views are not removed immediately
        // from their container so we need to offset the insertion index if a view
        // that will be removed appears earlier than the view we are inserting.
        if (isUIViewRegistry && _viewsToBeDeleted.count > 0) {
            for (NSInteger index = 0; index < insertAtIndex; index++) {
                UIView *subview = ((UIView *)container).hippySubviews[index];
                if ([_viewsToBeDeleted containsObject:subview]) {
                    insertAtIndex++;
                }
            }
        }
        [container insertHippySubview:destinationsToChildrenToAdd[hippyIndex] atIndex:insertAtIndex];
    }
}

- (void)createShadowViewFromDomNode:(const std::shared_ptr<DomNode> &)domNode inRootTag:(NSNumber *)rootTag {
    NSString *viewName = [NSString stringWithUTF8String:domNode->GetViewName().c_str()];
    NSNumber *hippyTag = @(domNode->GetId());
    HippyComponentData *componentData = _componentDataByName[viewName];
    HippyShadowView *shadowView = [componentData createShadowViewWithTag:hippyTag];
    if (shadowView) {
        NSDictionary *props = unorderedMapDomValueToDictionary(domNode->GetExtStyle());
        id isAnimated = props[@"useAnimation"];
        if (isAnimated && [isAnimated isKindOfClass: [NSNumber class]]) {
            HippyExtAnimationModule *animationModule = self.bridge.animationModule;
            props = [animationModule bindAnimaiton:props viewTag: hippyTag rootTag: rootTag];
            shadowView.animated = [(NSNumber *)isAnimated boolValue];;
        } else {
            shadowView.animated = NO;
        }
        
        NSMutableDictionary *newProps = [NSMutableDictionary dictionaryWithDictionary: props];
        [newProps setValue: rootTag forKey: @"rootTag"];
        shadowView.rootTag = rootTag;
        shadowView.bridge = self.bridge;
        shadowView.viewName = viewName;
        shadowView.props = newProps;
        shadowView.domNode = domNode;
        shadowView.frame = CGRectMakeFromLayoutResult(domNode->GetLayoutResult());
        [componentData setProps:newProps forShadowView:shadowView];
        _shadowViewRegistry[hippyTag] = shadowView;
    }
}

- (void)createUIViewFromNode:(const std::shared_ptr<DomNode> &)domNode inRootTag:(NSNumber *)rootTag {
}

- (void)createView:(nonnull NSNumber *)hippyTag viewName:(NSString *)viewName
           rootTag:(nonnull NSNumber *)rootTag tagName:(NSString *)tagName
             props:(NSDictionary *)props domNode:(const std::shared_ptr<hippy::DomNode> &)domNode {
    HippyComponentData *componentData = _componentDataByName[viewName];
    HippyShadowView *shadowView = [componentData createShadowViewWithTag:hippyTag];
    if (componentData == nil) {
        HippyLogError(@"No component found for view with name \"%@\"", viewName);
    }
    id isAnimated = props[@"useAnimation"];
    if (isAnimated && [isAnimated isKindOfClass: [NSNumber class]]) {
        HippyExtAnimationModule *animationModule = self.bridge.animationModule;
        props = [animationModule bindAnimaiton:props viewTag: hippyTag rootTag: rootTag];
        shadowView.animated = [(NSNumber *)isAnimated boolValue];
    } else {
        shadowView.animated = NO;
    }
    
    NSMutableDictionary *newProps = [NSMutableDictionary dictionaryWithDictionary: props];
    [newProps setValue: rootTag forKey: @"rootTag"];
    
    // Register shadow view
    if (shadowView) {
        shadowView.hippyTag = hippyTag;
        shadowView.rootTag = rootTag;
        shadowView.bridge = self.bridge;
        shadowView.viewName = viewName;
        shadowView.props = newProps;
        shadowView.domNode = domNode;
        shadowView.frame = CGRectMakeFromLayoutResult(domNode->GetLayoutResult());
        [componentData setProps:newProps forShadowView:shadowView];
        _shadowViewRegistry[hippyTag] = shadowView;
    }
    std::shared_ptr<hippy::DomNode> node_ = std::move(domNode);
    [self addUIBlock:^(HippyUIManager *uiManager, __unused NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        UIView *view = [uiManager createViewByComponentData:componentData hippyTag:hippyTag rootTag:rootTag properties:newProps viewName:viewName];
        view.hippyShadowView = shadowView;
        view.domNode = node_;
    }];
}

- (UIView *)createViewByComponentData:(HippyComponentData *)componentData
                             hippyTag:(NSNumber *)hippyTag
                              rootTag:(NSNumber *)rootTag
                           properties:(NSDictionary *)props
                             viewName:(NSString *)viewName {
    UIView *view = [self viewForHippyTag:hippyTag];
    
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
        [componentData setProps:props forView:view];  // Must be done before bgColor to prevent wrong default

        if ([view respondsToSelector:@selector(hippyBridgeDidFinishTransaction)]) {
            [self->_bridgeTransactionListeners addObject:view];
        }
        self->_viewRegistry[hippyTag] = view;
    }
    return view;
}

- (void)updateViewsFromParams:(NSArray<HippyExtAnimationViewParams *> *)params completion:(HippyViewUpdateCompletedBlock)block {
    NSMutableSet *rootTags = [NSMutableSet set];
    for (HippyExtAnimationViewParams *param in params) {
        // rdm上报param.rootTag有nil的可能
        if (param.rootTag) {
            [rootTags addObject:param.rootTag];
        } else {
            HippyAssert(NO, @"param.rootTag不应该为nil，保留现场，找mengyanluo");
        }
        [self updateView:param.hippyTag viewName:nil props:param.updateParams];
        if (block) {
            [[self completeBlocks] addObject:block];
        }
    }

    for (NSNumber *rootTag in rootTags) {
        [self _layoutAndMount:rootTag];
    }
}

- (void)updateViewWithHippyTag:(NSNumber *)hippyTag props:(NSDictionary *)pros {
    [self updateView:hippyTag viewName:nil props:pros];
    [self batchDidComplete];
}

// clang-format off
HIPPY_EXPORT_METHOD(updateView:(nonnull NSNumber *)hippyTag
                  viewName:(NSString *)viewName // not always reliable, use shadowView.viewName if available
                  props:(NSDictionary *)props) {
    HippyShadowView *shadowView = _shadowViewRegistry[hippyTag];
    HippyComponentData *componentData = _componentDataByName[shadowView.viewName ?: viewName];
    
    id isAnimated = props[@"useAnimation"];
    if (isAnimated && [isAnimated isKindOfClass: [NSNumber class]]) {
        HippyExtAnimationModule *animationModule = self.bridge.animationModule;
        props = [animationModule bindAnimaiton:props viewTag:hippyTag rootTag: shadowView.rootTag];
        shadowView.animated = [(NSNumber *)isAnimated boolValue];;
    } else {
        shadowView.animated = NO;
    }
        
    NSDictionary *newProps = props;
    NSDictionary *virtualProps = props;
    if (shadowView) {
        newProps = [shadowView mergeProps: props];
        virtualProps = shadowView.props;
        [componentData setProps:newProps forShadowView:shadowView];
        [shadowView dirtyPropagation];
    }
    [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[hippyTag];
        [componentData setProps:newProps forView:view];
    }];
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(dispatchViewManagerCommand:(nonnull NSNumber *)hippyTag
                  commandID:(NSInteger)commandID
                  commandArgs:(NSArray<id> *)commandArgs) {
    HippyShadowView *shadowView = _shadowViewRegistry[hippyTag];
    HippyComponentData *componentData = _componentDataByName[shadowView.viewName];
    Class managerClass = componentData.managerClass;
    HippyModuleData *moduleData = [_bridge moduleDataForName:HippyBridgeModuleNameForClass(managerClass)];
    id<HippyBridgeMethod> method = moduleData.methods[commandID];
    
    NSArray *args = [@[hippyTag] arrayByAddingObjectsFromArray:commandArgs];
    [method invokeWithBridge:_bridge module:componentData.manager arguments:args];
}
// clang-format on

- (void)partialBatchDidFlush {
    if (self.unsafeFlushUIChangesBeforeBatchEnds) {
        [self flushUIBlocks];
    }
}

- (void)batchDidComplete {
    [self _layoutAndMount];
}

- (void)displayLinkTrigged:(CADisplayLink *)displayLink {
    dispatch_async(HippyGetUIManagerQueue(), ^{
        [self batchDidComplete];
        displayLink.paused = YES;
    });
}

/**
 * Sets up animations, computes layout, creates UI mounting blocks for computed layout,
 * runs these blocks and all other already existing blocks.
 */
- (void)_layoutAndMount {
    // Perform layout
    for (NSNumber *hippyTag in _rootViewTags) {
        HippyRootShadowView *rootView = (HippyRootShadowView *)_shadowViewRegistry[hippyTag];
        //collect shadow views which layout changed, and add application of frame-set to UIBlock
        [self addUIBlock:[self uiBlockWithLayoutUpdateForRootView:rootView]];
        [self _amendPendingUIBlocksWithStylePropagationUpdateForShadowView:rootView];
    }
    [self flushUIBlocks];
}

- (void)_layoutAndMount:(NSNumber *)hippyTag {
    HippyRootShadowView *rootView = (HippyRootShadowView *)_shadowViewRegistry[hippyTag];
    if (![rootView isKindOfClass:[HippyRootShadowView class]]) {
        if (![_bridge isBatchActive]) {
            [self _layoutAndMount];
        }
        return;
    }

    // Gather blocks to be executed now that all view hierarchy manipulations have
    // been completed (note that these may still take place before layout has finished)
    for (HippyComponentData *componentData in _componentDataByName.allValues) {
        HippyViewManagerUIBlock uiBlock = [componentData uiBlockToAmendWithShadowViewRegistry:_shadowViewRegistry];
        [self addUIBlock:uiBlock];
    }

    // Perform layout
    [self addUIBlock:[self uiBlockWithLayoutUpdateForRootView:rootView]];
    [self _amendPendingUIBlocksWithStylePropagationUpdateForShadowView:rootView];

    [self addUIBlock:^(HippyUIManager *uiManager, __unused NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        /**
         * TODO(tadeu): Remove it once and for all
         */
        for (id<HippyComponent> node in uiManager->_bridgeTransactionListeners) {
            [node hippyBridgeDidFinishTransaction];
        }
    }];
    [self flushUIBlocks];
    [self flushUpdateCompletedBlocks];
}

- (void)flushUpdateCompletedBlocks {
    if ([_completeBlocks count]) {
        NSArray<HippyViewUpdateCompletedBlock> *tmpBlocks = [NSArray arrayWithArray:_completeBlocks];
        __weak HippyUIManager *weakSelf = self;
        dispatch_async(dispatch_get_main_queue(), ^{
            HippyUIManager *sSelf = weakSelf;
            [tmpBlocks enumerateObjectsUsingBlock:^(HippyViewUpdateCompletedBlock _Nonnull obj, __unused NSUInteger idx, __unused BOOL *stop) {
                obj(sSelf);
            }];
        });
        [_completeBlocks removeAllObjects];
    }
}

- (void)flushUIBlocks {

    // First copy the previous blocks into a temporary variable, then reset the
    // pending blocks to a new array. This guards against mutation while
    // processing the pending blocks in another thread.
    NSArray<HippyViewManagerUIBlock> *previousPendingUIBlocks = _pendingUIBlocks;
    _pendingUIBlocks = [NSMutableArray new];
    __weak HippyUIManager *weakManager = self;
    if (previousPendingUIBlocks.count) {
        // Execute the previously queued UI blocks
        dispatch_async(dispatch_get_main_queue(), ^{
            if (weakManager) {
                HippyUIManager *uiManager = weakManager;
                @try {
                    for (HippyViewManagerUIBlock block in previousPendingUIBlocks) {
                        block(uiManager, uiManager->_viewRegistry);
                    }                    
                } @catch (NSException *exception) {
                    HippyLogError(@"Exception thrown while executing UI block: %@", exception);
                }
            }
        });
    }
}

- (void)setNeedsLayout {
    // If there is an active batch layout will happen when batch finished, so we will wait for that.
    // Otherwise we immidiately trigger layout.
    if (![_bridge isBatchActive]) {
        [self _layoutAndMount];
    }
}

- (void)setNeedsLayout:(NSNumber *)hippyTag {
    // If there is an active batch layout will happen when batch finished, so we will wait for that.
    // Otherwise we immidiately trigger layout.
    if (![_bridge isBatchActive]) {
        [self _layoutAndMount];
    }
}

// clang-format off
HIPPY_EXPORT_METHOD(measure:(nonnull NSNumber *)hippyTag
                  callback:(HippyResponseSenderBlock)callback) {
    [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[hippyTag];
        if (!view) {
            // this view was probably collapsed out
            HippyLogWarn(@"measure cannot find view with tag #%@", hippyTag);
            callback(@[]);
            return;
        }
        
        // If in a <Modal>, rootView will be the root of the modal container.
        UIView *rootView = viewRegistry[view.rootTag];
        if (!rootView) {
            HippyLogWarn(@"measure cannot find view's root view with tag #%@", hippyTag);
            callback(@[]);
            return;
        }
        
        // By convention, all coordinates, whether they be touch coordinates, or
        // measurement coordinates are with respect to the root view.
        CGRect frame = view.frame;
        CGPoint pagePoint = [view.superview convertPoint:frame.origin toView:rootView];
        
        callback(@[
                   @(frame.origin.x),
                   @(frame.origin.y),
                   @(frame.size.width),
                   @(frame.size.height),
                   @(pagePoint.x),
                   @(pagePoint.y)
                   ]);
    }];
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(measureInWindow:(nonnull NSNumber *)hippyTag
                  callback:(HippyResponseSenderBlock)callback) {
    [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[hippyTag];
        if (!view) {
            // this view was probably collapsed out
            HippyLogWarn(@"measure cannot find view with tag #%@", hippyTag);
            callback(@[]);
            return;
        }
        UIView *rootView = viewRegistry[view.rootTag];
        if (!rootView) {
            HippyLogWarn(@"measure cannot find view's root view with tag #%@", hippyTag);
            callback(@[]);
            return;
        }
        
        CGRect windowFrame = [rootView convertRect:view.frame fromView:view.superview];
        callback(@[@{@"width":@(CGRectGetWidth(windowFrame)),
                     @"height": @(CGRectGetHeight(windowFrame)),
                     @"x":@(windowFrame.origin.x),
                     @"y":@(windowFrame.origin.y)}]);
    }];
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(measureInAppWindow:(nonnull NSNumber *)hippyTag
                callback:(HippyResponseSenderBlock)callback) {
    [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[hippyTag];
        if (!view) {
            // this view was probably collapsed out
            HippyLogWarn(@"measure cannot find view with tag #%@", hippyTag);
            callback(@[]);
            return;
        }
                
        CGRect windowFrame = [view.window convertRect:view.frame fromView:view.superview];
        callback(@[@{@"width":@(CGRectGetWidth(windowFrame)),
                     @"height": @(CGRectGetHeight(windowFrame)),
                     @"x":@(windowFrame.origin.x),
                     @"y":@(windowFrame.origin.y)}]);
    }];
}
// clang-format on

- (NSDictionary<NSString *, id> *)constantsToExport {
    //TODO HippyUIManager not longer needs to be exported to frontend, so just return empty object
    return @{};
}

- (void)rootViewForHippyTag:(NSNumber *)hippyTag withCompletion:(void (^)(UIView *view))completion {
    HippyAssertMainQueue();
    HippyAssert(completion != nil, @"Attempted to resolve rootView for tag %@ without a completion block", hippyTag);

    if (hippyTag == nil) {
        completion(nil);
        return;
    }

    dispatch_async(HippyGetUIManagerQueue(), ^{
        NSNumber *rootTag = [self _rootTagForHippyTag:hippyTag];
        dispatch_async(dispatch_get_main_queue(), ^{
            UIView *rootView = nil;
            if (rootTag != nil) {
                rootView = [self viewForHippyTag:rootTag];
            }
            completion(rootView);
        });
    });
}

- (NSNumber *)rootHippyTag {
    return _rootViewTags.count > 0 ? _rootViewTags.allObjects.firstObject : @(0);
}

- (NSNumber *)_rootTagForHippyTag:(NSNumber *)hippyTag {
    HippyAssert(!HippyIsMainQueue(), @"Should be called on shadow queue");

    if (hippyTag == nil) {
        return nil;
    }

    if (HippyIsHippyRootView(hippyTag)) {
        return hippyTag;
    }

    NSNumber *rootTag = nil;
    HippyShadowView *shadowView = _shadowViewRegistry[hippyTag];
    while (shadowView) {
        HippyShadowView *parent = [shadowView hippySuperview];
        if (!parent && HippyIsHippyRootView(shadowView.hippyTag)) {
            rootTag = shadowView.hippyTag;
            break;
        }
        shadowView = parent;
    }

    return rootTag;
}

static UIView *_jsResponder;

+ (UIView *)JSResponder {
    return _jsResponder;
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

- (void)setDomManager:(std::weak_ptr<DomManager>)domManager {
    _domManager = domManager;
}

- (std::shared_ptr<DomNode>)domNodeFromHippyTag:(int32_t)hippyTag {
    auto domManager = _domManager.lock();
    if (domManager) {
        auto domNode = domManager->GetNode(hippyTag);
        return domNode;
    }
    return nullptr;
}

/**
 * When HippyUIManager received command to create view by node, HippyUIManager must get all new created view ordered by index, set frames,
 * then insert them into superview one by one.
 *
 */
- (void)createRenderNodes:(std::vector<std::shared_ptr<DomNode>> &&)nodes {
    HippyViewsRelation *manager = [[HippyViewsRelation alloc] init];
    for (const std::shared_ptr<DomNode> &node : nodes) {
        NSNumber *hippyTag = @(node->GetId());
        NSString *viewName = [NSString stringWithUTF8String:node->GetViewName().c_str()];
        NSString *tagName = [NSString stringWithUTF8String:node->GetTagName().c_str()];
        NSDictionary *styleProps = unorderedMapDomValueToDictionary(node->GetStyleMap());
        NSDictionary *extProps = unorderedMapDomValueToDictionary(node->GetExtStyle());
        NSMutableDictionary *props = [NSMutableDictionary dictionaryWithDictionary:styleProps];
        [props addEntriesFromDictionary:extProps];
        NSNumber *rootTag = [_rootViewTags anyObject];
        [manager addViewTag:node->GetId() forSuperViewTag:node->GetPid() atIndex:node->GetIndex()];
        [self createView:hippyTag viewName:viewName rootTag:rootTag tagName:tagName props:props domNode:node];
    }
    [manager enumerateViewsRelation:^(NSNumber *superviewTags, NSArray<NSNumber *> *subviewTags, NSArray<NSNumber *> *subviewIndices) {
        [self manageChildren:superviewTags moveFromIndices:nil moveToIndices:nil addChildHippyTags:subviewTags addAtIndices:subviewIndices removeAtIndices:nil];
    }];
}

- (void)updateRenderNodes:(std::vector<std::shared_ptr<DomNode>>&&)nodes {
    for (const auto &node : nodes) {
        NSNumber *hippyTag = @(node->GetId());
        NSString *viewName = [NSString stringWithUTF8String:node->GetViewName().c_str()];
        NSDictionary *styleProps = unorderedMapDomValueToDictionary(node->GetStyleMap());
        NSDictionary *extProps = unorderedMapDomValueToDictionary(node->GetExtStyle());
        NSMutableDictionary *props = [NSMutableDictionary dictionaryWithDictionary:styleProps];
        [props addEntriesFromDictionary:extProps];
        [self updateView:hippyTag viewName:viewName props:props];
    }
}

- (void)renderUpdateView:(int32_t)hippyTag
                viewName:(const std::string &)name
                   props:(const std::unordered_map<std::string, std::shared_ptr<DomValue>> &)styleMap {
    
}

- (void)renderDeleteNodes:(const std::vector<std::shared_ptr<DomNode>> &)nodes {
    NSMutableDictionary<NSNumber *, NSMutableArray<NSNumber *> *> *nodesToDelete = [NSMutableDictionary dictionaryWithCapacity:16];
    for (const auto &node : nodes) {
        int32_t tag = node->GetId();
        int32_t parentTag = node->GetPid();
        HippyShadowView *shadowView = _shadowViewRegistry[@(tag)];
        HippyShadowView *parentShadowView = _shadowViewRegistry[@(parentTag)];
        NSArray<HippyShadowView *> *subShadowViews = [parentShadowView hippySubviews];
        NSUInteger index = [subShadowViews indexOfObject:shadowView];
        NSMutableArray<NSNumber *> *indecies = nodesToDelete[@(parentTag)];
        if (nil == indecies) {
            indecies = [NSMutableArray arrayWithCapacity:16];
            [nodesToDelete setObject:indecies forKey:@(parentTag)];
        }
        [indecies addObject:@(index)];
    }
    [nodesToDelete enumerateKeysAndObjectsUsingBlock:^(NSNumber * _Nonnull key, NSMutableArray<NSNumber *> * _Nonnull obj, BOOL * _Nonnull stop) {
        [self manageChildren:key moveFromIndices:nil moveToIndices:nil addChildHippyTags:nil addAtIndices:nil removeAtIndices:obj];
    }];
}

- (void)renderMoveViews:(const std::vector<int32_t> &)ids fromContainer:(int32_t)fromContainer toContainer:(int32_t)toContainer {
    //这个方法疑点很多，比如移动之后被移动的node属性是否变化，否则位置可能会与原住民重叠。或者移动之后索引值如何变化。
    //TODO
    HippyAssert(NO, @"no implementation for this method");
}

- (void)renderNodesUpdateLayout:(const std::vector<std::shared_ptr<DomNode>> &)nodes {
    for (const auto &node : nodes) {
        NSNumber *hippyTag = @(node->GetId());
        NSString *viewName = [NSString stringWithUTF8String:node->GetViewName().c_str()];
        NSDictionary *styleProps = unorderedMapDomValueToDictionary(node->GetStyleMap());
        NSDictionary *extProps = unorderedMapDomValueToDictionary(node->GetExtStyle());
        NSMutableDictionary *combinedProps = [NSMutableDictionary dictionaryWithDictionary:styleProps];
        [combinedProps addEntriesFromDictionary:extProps];
        NSDictionary *props = [combinedProps copy];
        CGRect frame = CGRectMakeFromDomNode(node);
        HippyShadowView *shadowView = _shadowViewRegistry[hippyTag];
        HippyComponentData *componentData = _componentDataByName[shadowView.viewName ?: viewName];
        id isAnimated = props[@"useAnimation"];
        if (isAnimated && [isAnimated isKindOfClass: [NSNumber class]]) {
            HippyExtAnimationModule *animationModule = self.bridge.animationModule;
            props = [animationModule bindAnimaiton:props viewTag:hippyTag rootTag: shadowView.rootTag];
            shadowView.animated = [(NSNumber *)isAnimated boolValue];
            //TODO 2.0中，如果props中包含有height或者width，那[componentData setProps:newProps forShadowView:shadowView]逻辑
            //会为shadowview.node布局节点设置高或者宽
            //3.0中由于shadowview没有布局节点，且frame已经计算，只能手动覆写从layoutnode中获取的宽高
            if ([props objectForKey:@"height"]) {
                frame.size.height = [props[@"height"] floatValue];
            }
            if ([props objectForKey:@"width"]) {
                frame.size.width = [props[@"width"] floatValue];
            }
            
        } else {
            shadowView.animated = NO;
        }
            
        NSDictionary *newProps = props;
        NSDictionary *virtualProps = props;
        if (shadowView) {
            newProps = [shadowView mergeProps: props];
            virtualProps = shadowView.props;
            shadowView.frame = frame;
            [componentData setProps:newProps forShadowView:shadowView];
        }
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = viewRegistry[hippyTag];
            [componentData setProps:newProps forView:view];
        }];
    }
}

-(void)batch {
    [self batchDidComplete];
}

- (void)dispatchFunction:(const std::string &)functionName
                viewName:(const std::string &)viewName
                 viewTag:(int32_t)hippyTag
                  params:(const DomValue &)params
                callback:(CallFunctionCallback)cb {
    NSString *name = [NSString stringWithUTF8String:functionName.c_str()];
    DomValueType type = params.GetType();
    NSMutableArray *finalParams = [NSMutableArray arrayWithCapacity:8];
    [finalParams addObject:@(hippyTag)];
    if (DomValueType::kArray == type) {
        NSArray * paramsArray = domValueToOCType(&params);
        HippyAssert([paramsArray isKindOfClass:[NSArray class]], @"dispatch function method params type error");
        if ([paramsArray isKindOfClass:[NSArray class]]) {
            for (id param in paramsArray) {
                [finalParams addObject:param];
            }
        }
    }
    else {
        [finalParams addObject:[NSNull null]];
    }
    if (cb) {
        HippyResponseSenderBlock senderBlock = ^(NSArray *senderParams) {
            std::shared_ptr<DomArgument> domArgument = std::make_shared<DomArgument>([senderParams toDomArgument]);
            cb(domArgument);
        };
        [finalParams addObject:senderBlock];
    }
    NSString *nativeModuleName = [NSString stringWithUTF8String:viewName.c_str()];
    [self.bridge callNativeModuleName:nativeModuleName methodName:name params:finalParams];
}

- (void)addEventName:(const std::string &)name forDomNode:(std::weak_ptr<hippy::DomNode>)weak_node {
    std::shared_ptr<DomNode> node = weak_node.lock();
    if (node) {
        if (name == hippy::kClickEvent) {
            [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                [uiManager addClickEventListenerForView:node->GetId()];
            }];
        } else if (name == hippy::kLongClickEvent) {
            [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                [uiManager addLongClickEventListenerForView:node->GetId()];
            }];
        } else if (name == hippy::kTouchStartEvent || name == hippy::kTouchMoveEvent
                   || name == hippy::kTouchEndEvent || name == hippy::kTouchCancelEvent) {
            std::string name_ = name;
            [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                [uiManager addTouchEventListenerForType:std::move(name_) forView:node->GetId()];
            }];
        } else if (name == hippy::kShowEvent || name == hippy::kDismissEvent) {
            std::string name_ = name;
            [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                [uiManager addShowEventListenerForType:std::move(name_) forView:node->GetId()];
            }];
        } else if (name == hippy::kPressIn || name == hippy::kPressOut) {
            std::string name_ = name;
            [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                [uiManager addPressEventListenerForType:std::move(name_) forView:node->GetId()];
            }];
        }
        else {
            std::string name_ = name;
            [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                [uiManager addRenderEvent:name_ forDomNode:node];
            }];
        }
    }
}

- (void) addClickEventListenerForView:(int32_t)hippyTag {
    HippyAssertMainThread();
    UIView *view = [self viewForHippyTag:@(hippyTag)];
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:hippy::kClickEvent];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:hippy::kClickEvent];
        [view addViewEvent:HippyViewEventTypeClick eventListener:^(CGPoint) {
            auto node = [self domNodeFromHippyTag:hippyTag];
            if (node) {
                node->HandleEvent(std::make_shared<hippy::DomEvent>(hippy::kClickEvent, node,
                                                                    canBePreventedInCapturing, canBePreventedInBubbling,
                                                                    static_cast<std::shared_ptr<DomValue>>(nullptr)));
            }
        }];
    }
}

- (void) addLongClickEventListenerForView:(int32_t)hippyTag {
    HippyAssertMainThread();
    UIView *view = [self viewForHippyTag:@(hippyTag)];
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:hippy::kLongClickEvent];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:hippy::kLongClickEvent];
        [view addViewEvent:HippyViewEventTypeLongClick eventListener:^(CGPoint) {
            auto node = [self domNodeFromHippyTag:hippyTag];
            if (node) {
                node->HandleEvent(std::make_shared<hippy::DomEvent>(hippy::kLongClickEvent, node,
                                                                    canBePreventedInCapturing, canBePreventedInBubbling,
                                                                    static_cast<std::shared_ptr<DomValue>>(nullptr)));
            }
        }];
    }
}

- (void) addPressEventListenerForType:(std::string)type
                              forView:(int32_t)hippyTag {
    HippyAssertMainThread();
    UIView *view = [self viewForHippyTag:@(hippyTag)];
    HippyViewEventType eventType = hippy::kPressIn == type ? HippyViewEventType::HippyViewEventTypePressIn : HippyViewEventType::HippyViewEventTypePressOut;
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:type];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:type];
        [view addViewEvent:eventType eventListener:^(CGPoint) {
            auto node = [self domNodeFromHippyTag:hippyTag];
            if (node) {
                node->HandleEvent(std::make_shared<hippy::DomEvent>(type, node,
                                                                    canBePreventedInCapturing, canBePreventedInBubbling,
                                                                    static_cast<std::shared_ptr<DomValue>>(nullptr)));
            }
        }];
    }
}

- (void) addTouchEventListenerForType:(std::string)type
                              forView:(int32_t)hippyTag {
    HippyAssertMainThread();
    UIView *view = [self viewForHippyTag:@(hippyTag)];
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
        [view addViewEvent:event_type eventListener:^(CGPoint point) {
            auto node = [self domNodeFromHippyTag:hippyTag];
            if (node) {
                tdf::base::DomValue::DomValueObjectType domValue;
                domValue["page_x"] = tdf::base::DomValue(point.x);
                domValue["page_y"] = tdf::base::DomValue(point.y);
                std::shared_ptr<tdf::base::DomValue> value = std::make_shared<tdf::base::DomValue>(domValue);
                if (node) {
                   node->HandleEvent(std::make_shared<DomEvent>(type, node, canBePreventedInCapturing,
                                                                canBePreventedInBubbling,value));
                }
            }
        }];
    }
}

- (void)addShowEventListenerForType:(std::string)type
                            forView:(int32_t)hippyTag {
    HippyAssertMainThread();
    UIView *view = [self viewForHippyTag:@(hippyTag)];
    if (view) {
        HippyViewEventType event_type = hippy::kShowEvent == type ? HippyViewEventTypeShow : HippyViewEventTypeDismiss;
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:type];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:type];
        [view addViewEvent:event_type eventListener:^(CGPoint point) {
            auto node = [self domNodeFromHippyTag:hippyTag];
            if (node) {
                std::shared_ptr<DomValue> domValue = std::make_shared<DomValue>(true);
                node->HandleEvent(std::make_shared<DomEvent>(type, node, canBePreventedInCapturing,
                                                             canBePreventedInBubbling, domValue));
            }
        }];
    }
}

- (void)removeEventName:(const std::string &)eventName forDomNode:(std::weak_ptr<DomNode>)weak_node {
    std::shared_ptr<DomNode> domNode = weak_node.lock();
    if (domNode) {
        int32_t hippyTag = domNode->GetId();
        if (eventName == hippy::kClickEvent ||
            eventName ==hippy::kLongClickEvent ||
            eventName == hippy::kTouchStartEvent || eventName == hippy::kTouchMoveEvent ||
            eventName == hippy::kTouchEndEvent || eventName == hippy::kTouchCancelEvent ||
            eventName == hippy::kShowEvent || eventName == hippy::kDismissEvent ||
            eventName == hippy::kPressIn || eventName == hippy::kPressOut) {
            [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                UIView *view = [uiManager viewForHippyTag:@(hippyTag)];
                [view removeViewEvent:viewEventTypeFromName(eventName)];
            }];
        }
        else {
            std::string name_ = eventName;
            [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
                [uiManager removeRenderEvent:name_ forDomNode:domNode];
            }];
        }
    }
}

- (void)addRenderEvent:(const std::string &)name forDomNode:(std::weak_ptr<hippy::DomNode>)weak_node {
    auto node = weak_node.lock();
    if (node) {
        int32_t hippyTag = node->GetId();
        NSString *viewName = [NSString stringWithUTF8String:node->GetViewName().c_str()];
        std::string name_ = std::move(name);
        NSDictionary *componentDataByName = [_componentDataByName copy];
        UIView *view = [self viewForHippyTag:@(hippyTag)];
        HippyComponentData *component = componentDataByName[viewName];
        NSDictionary<NSString *, NSString *> *eventMap = [component eventNameMap];
        NSString *mapToEventName = [eventMap objectForKey:[NSString stringWithUTF8String:name_.c_str()]];
        if (mapToEventName) {
            BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:name_];
            BOOL canBePreventedInBubbling = [view canBePreventInBubbling:name_];
            __weak __typeof(self) weakManager = self;
            [view addRenderEvent:[mapToEventName UTF8String] eventCallback:^(NSDictionary *body) {
                __typeof(self) strongManager = weakManager;
                if (strongManager) {
                    auto domNode = [strongManager domNodeFromHippyTag:hippyTag];
                    if (domNode) {
                        DomValue value = [body toDomValue];
                        std::shared_ptr<DomValue> domValue = std::make_shared<DomValue>(std::move(value));
                        node->HandleEvent(std::make_shared<DomEvent>(name_, node, canBePreventedInCapturing,
                                                                     canBePreventedInBubbling, domValue));
                    }
                }
            }];
        }
    }
}

- (void)removeRenderEvent:(const std::string &)name forDomNode:(std::weak_ptr<hippy::DomNode>)weak_node {
    auto node = weak_node.lock();
    if (node) {
        int32_t hippyTag = node->GetId();
        std::string name_ = std::move(name);
        [self addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = [uiManager viewForHippyTag:@(hippyTag)];
            [view removeRenderEvent:name_];
        }];
    }
}

@end

@implementation HippyBridge (HippyUIManager)

- (HippyUIManager *)uiManager {
    return [self moduleForClass:[HippyUIManager class]];
}

@end
