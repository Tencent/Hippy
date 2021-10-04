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
#import "HippyRootViewInternal.h"
#import "HippyScrollableProtocol.h"
#import "HippyShadowView.h"
#import "HippyUtils.h"
#import "HippyView.h"
#import "HippyViewManager.h"
#import "UIView+Hippy.h"
#import "HippyExtAnimationViewParams.h"
#import "HippyExtAnimationModule.h"
#import "UIView+Private.h"
#import "HippyVirtualNode.h"
#import "HippyBaseListViewProtocol.h"
#import "HippyMemoryOpt.h"
#import "HippyDeviceBaseInfo.h"
#import "HippyVirtualList.h"

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

@implementation HippyUIManager {
    // Root views are only mutated on the shadow queue
    NSMutableSet<NSNumber *> *_rootViewTags;
    NSMutableArray<HippyViewManagerUIBlock> *_pendingUIBlocks;
    NSMutableArray<HippyVirtualNodeManagerUIBlock> *_pendingVirtualNodeBlocks;
    NSMutableDictionary<NSNumber *, HippyVirtualNode *> *_nodeRegistry;
    NSMutableArray<NSNumber *> *_listTags;
    NSMutableSet<UIView *> *_viewsToBeDeleted;  // Main thread only

    NSMutableDictionary<NSNumber *, HippyShadowView *> *_shadowViewRegistry;  // Hippy thread only
    NSMutableDictionary<NSNumber *, UIView *> *_viewRegistry;                 // Main thread only

    // Keyed by viewName
    NSDictionary *_componentDataByName;

    NSMutableSet<id<HippyComponent>> *_bridgeTransactionListeners;

    NSMutableArray<HippyViewUpdateCompletedBlock> *_completeBlocks;

    NSMutableSet<NSNumber *> *_listAnimatedViewTags;
}

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE()

- (instancetype)init {
    self = [super init];
    if (self) {
        _listAnimatedViewTags = [NSMutableSet set];
        NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
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
    _pendingVirtualNodeBlocks = nil;
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
        self->_nodeRegistry = nil;

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

- (NSMutableDictionary<NSNumber *, HippyVirtualNode *> *)virtualNodeRegistry {
    // NOTE: this method only exists so that it can be accessed by unit tests
    if (!_nodeRegistry) {
        _nodeRegistry = [NSMutableDictionary new];
    }
    return _nodeRegistry;
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

    _nodeRegistry = [NSMutableDictionary new];
    _pendingVirtualNodeBlocks = [NSMutableArray new];
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

    HippyVirtualNode *node = [HippyVirtualNode createNode:hippyTag viewName:@"HippyRootContentView" props:@{}];
    _nodeRegistry[hippyTag] = node;

    CGRect frame = rootView.frame;

    // Register shadow view
    dispatch_async(HippyGetUIManagerQueue(), ^{
        if (!self->_viewRegistry) {
            return;
        }

        HippyRootShadowView *shadowView = [HippyRootShadowView new];
        shadowView.hippyTag = hippyTag;
        shadowView.frame = frame;
        shadowView.backgroundColor = rootView.backgroundColor;
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

- (HippyVirtualNode *)nodeForHippyTag:(NSNumber *)hippyTag
{
    HippyAssertMainQueue();
    return _nodeRegistry[hippyTag];
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
                assert(0);  // todo: 走到这个逻辑不正常，请联系pennyli
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

- (void)setIntrinsicContentSize:(CGSize)size forView:(UIView *)view {
    HippyAssertMainQueue();

    NSNumber *hippyTag = view.hippyTag;
    dispatch_async(HippyGetUIManagerQueue(), ^{
        HippyShadowView *shadowView = self->_shadowViewRegistry[hippyTag];
        HippyAssert(shadowView != nil, @"Could not locate root view with tag #%@", hippyTag);

        shadowView.intrinsicContentSize = size;

        [self setNeedsLayout];
    });
}

- (void)setBackgroundColor:(UIColor *)color forView:(UIView *)view {
    HippyAssertMainQueue();
    /*
          NSNumber *hippyTag = view.hippyTag;
          dispatch_async(HippyGetUIManagerQueue(), ^{
            if (!self->_viewRegistry) {
              return;
            }

            HippyShadowView *shadowView = self->_shadowViewRegistry[hippyTag];
            HippyAssert(shadowView != nil, @"Could not locate root view with tag #%@", hippyTag);
            shadowView.backgroundColor = color;
            [self _amendPendingUIBlocksWithStylePropagationUpdateForShadowView:shadowView];
            [self flushVirtualNodeBlocks];
            [self flushUIBlocks];
          });
     */
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

            // 如果是list virtual node节点，则在UI线程删除list上的视图节点
            if (registry == (NSMutableDictionary<NSNumber *, id<HippyComponent>> *)self->_nodeRegistry) {
                if ([self->_listTags containsObject:subview.hippyTag]) {
                    [self->_listTags removeObject:subview.hippyTag];
                    for (id<HippyComponent> node in subview.hippySubviews) {
                        [self removeNativeNode:(HippyVirtualNode *)node];
                    }
                }
            }
        });
    }
}

- (void)addUIBlock:(HippyViewManagerUIBlock)block {
    HippyAssertThread(HippyGetUIManagerQueue(), @"-[HippyUIManager addUIBlock:] should only be called from the "
                                                 "UIManager's queue (get this using `HippyGetUIManagerQueue()`)");

    if (!block || !_viewRegistry) {
        return;
    }

    [_pendingUIBlocks addObject:block];
}

- (void)addVirtulNodeBlock:(HippyVirtualNodeManagerUIBlock)block {
    HippyAssertThread(HippyGetUIManagerQueue(), @"-[HippyUIManager addVirtulNodeBlock:] should only be called from the "
                                                 "UIManager's queue (get this using `HippyGetUIManagerQueue()`)");

    if (!block || !_nodeRegistry) {
        return;
    }

    [_pendingVirtualNodeBlocks addObject:block];
}

- (void)executeBlockOnUIManagerQueue:(dispatch_block_t)block {
    dispatch_async(HippyGetUIManagerQueue(), ^{
        if (block) {
            block();
        }
    });
}

- (HippyViewManagerUIBlock)uiBlockWithLayoutUpdateForRootView:(HippyRootShadowView *)rootShadowView {
    HippyAssert(!HippyIsMainQueue(), @"Should be called on shadow queue");

    // This is nuanced. In the JS thread, we create a new update buffer
    // `frameTags`/`frames` that is created/mutated in the JS thread. We access
    // these structures in the UI-thread block. `NSMutableArray` is not thread
    // safe so we rely on the fact that we never mutate it after it's passed to
    // the main thread.
    NSSet<HippyShadowView *> *viewsWithNewFrames = [rootShadowView collectViewsWithUpdatedFrames];

    if (!viewsWithNewFrames.count) {
        // no frame change results in no UI update block
        return nil;
    }

    typedef struct {
        CGRect frame;
        BOOL isNew;
        BOOL parentIsNew;
        BOOL isHidden;
        BOOL animated;
    } HippyFrameData;

    // Construct arrays then hand off to main thread
    NSUInteger count = viewsWithNewFrames.count;
    NSMutableArray *hippyTags = [[NSMutableArray alloc] initWithCapacity:count];
    NSMutableData *framesData = [[NSMutableData alloc] initWithLength:sizeof(HippyFrameData) * count];
    {
        NSUInteger index = 0;
        HippyFrameData *frameDataArray = (HippyFrameData *)framesData.mutableBytes;
        for (HippyShadowView *shadowView in viewsWithNewFrames) {
            hippyTags[index] = shadowView.hippyTag;
            frameDataArray[index++] = (HippyFrameData) { shadowView.frame, shadowView.isNewView, shadowView.superview.isNewView, shadowView.isHidden,
                shadowView.animated };
        }
    }

    // These are blocks to be executed on each view, immediately after
    // hippySetFrame: has been called. Note that if hippySetFrame: is not called,
    // these won't be called either, so this is not a suitable place to update
    // properties that aren't related to layout.
    NSMutableDictionary<NSNumber *, HippyViewManagerUIBlock> *updateBlocks = [NSMutableDictionary new];
    for (HippyShadowView *shadowView in viewsWithNewFrames) {
        // We have to do this after we build the parentsAreNew array.
        shadowView.newView = NO;

        NSNumber *hippyTag = shadowView.hippyTag;
        HippyViewManager *manager = [_componentDataByName[shadowView.viewName] manager];
        HippyViewManagerUIBlock block = [manager uiBlockToAmendWithShadowView:shadowView];
        if (block) {
            updateBlocks[hippyTag] = block;
        }

        if (shadowView.onLayout) {
            CGRect frame = shadowView.frame;
            shadowView.onLayout(@{
                @"layout": @ {
                    @"x": @(frame.origin.x),
                    @"y": @(frame.origin.y),
                    @"width": @(frame.size.width),
                    @"height": @(frame.size.height),
                },
            });
        }

        if (HippyIsHippyRootView(hippyTag)) {
            CGSize contentSize = shadowView.frame.size;

            dispatch_async(dispatch_get_main_queue(), ^{
                UIView *view = self->_viewRegistry[hippyTag];
                HippyAssert(view != nil, @"view (for ID %@) not found", hippyTag);

                HippyRootView *rootView = (HippyRootView *)[view superview];
                rootView.intrinsicSize = contentSize;
            });
        }
    }

    [self addVirtulNodeBlock:^(__unused HippyUIManager *uiManager, NSDictionary *virtualNodeRegistry) {
        NSInteger index = 0;
        HippyFrameData *frameDataArray = (HippyFrameData *)framesData.mutableBytes;
        for (NSNumber *hippyTag in hippyTags) {
            HippyVirtualNode *node = virtualNodeRegistry[hippyTag];
            if (node) {
                HippyFrameData frameData = frameDataArray[index];
                [node hippySetFrame:frameData.frame];
            }
            index++;
        }
    }];

    // Perform layout (possibly animated)
    return ^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        const HippyFrameData *frameDataArray = (const HippyFrameData *)framesData.bytes;
        __block NSUInteger completionsCalled = 0;

        NSInteger index = 0;
        for (NSNumber *hippyTag in hippyTags) {
            HippyFrameData frameData = frameDataArray[index++];

            UIView *view = viewRegistry[hippyTag];
            CGRect frame = frameData.frame;

            BOOL isHidden = frameData.isHidden;
            void (^completion)(BOOL) = ^(__unused BOOL finished) {
                completionsCalled++;
            };

            if (view.isHidden != isHidden) {
                view.hidden = isHidden;
            }

            HippyViewManagerUIBlock updateBlock = updateBlocks[hippyTag];
            [view hippySetFrame:frame];
            if (frameData.animated) {
                if (nil == view) {
                    [self->_listAnimatedViewTags addObject:hippyTag];
                }
                [uiManager.bridge.animationModule connectAnimationToView:view];
            }
            if (updateBlock) {
                updateBlock(self, viewRegistry);
            }
            completion(YES);
        }
    };
}

- (void)_amendPendingUIBlocksWithStylePropagationUpdateForShadowView:(HippyShadowView *)topView {
    NSMutableSet<HippyApplierBlock> *applierBlocks = [NSMutableSet setWithCapacity:1];

    NSMutableSet<HippyApplierVirtualBlock> *virtualApplierBlocks = [NSMutableSet setWithCapacity:1];
    [topView collectUpdatedProperties:applierBlocks virtualApplierBlocks:virtualApplierBlocks parentProperties:@{}];
    if (applierBlocks.count) {
        [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
            for (HippyApplierBlock block in applierBlocks) {
                block(viewRegistry);
            }
        }];

        [self addVirtulNodeBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, HippyVirtualNode *> *virtualNodeRegistry) {
            for (HippyApplierVirtualBlock block in virtualApplierBlocks) {
                block(virtualNodeRegistry);
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

    // FIXME: The fatal prompt caused to feeds running in QB got redbox alert in DEBUG mode.
    //        Commented theses code temporary.
    /*
    if (HIPPY_DEBUG && removedChildren.count != atIndices.count) {
        NSString *message = [NSString stringWithFormat:@"removedChildren count (%tu) was not what we expected (%tu)",
                             removedChildren.count, atIndices.count];
        HippyFatal(HippyErrorWithMessage(message));
    }
    */

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
    
    [self addVirtulNodeBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,HippyVirtualNode *> *virtualNodeRegistry) {
        HippyAssertMainQueue();
        HippyVirtualNode *rootNode = virtualNodeRegistry[rootHippyTag];
        [uiManager _purgeChildren:(NSArray<id<HippyComponent>> *)rootNode.hippySubviews
                     fromRegistry:(NSMutableDictionary<NSNumber *, id<HippyComponent>> *)virtualNodeRegistry];
        [(NSMutableDictionary *)virtualNodeRegistry removeObjectForKey:rootHippyTag];
    }];
    
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
    
    [self addVirtulNodeBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, HippyVirtualNode *> *virtualNodeRegistry) {
        HippySetVirtualChildren(containerTag,  hippyTags, virtualNodeRegistry);
    }];
    
    [self addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        
        HippySetChildren(containerTag, hippyTags,
                       (NSDictionary<NSNumber *, id<HippyComponent>> *)viewRegistry);
    }];
}
// clang-format on

static void HippySetVirtualChildren(
    NSNumber *containerTag, NSArray<NSNumber *> *hippyTags, NSDictionary<NSNumber *, HippyVirtualNode *> *virtualNodeRegistry) {
    HippyVirtualNode *container = virtualNodeRegistry[containerTag];
    if (container) {
        for (NSNumber *hippyTag in hippyTags) {
            HippyVirtualNode *node = virtualNodeRegistry[hippyTag];
            if (node) {
                node.parent = container;
                [container insertHippySubview:node atIndex:container.subNodes.count];
            }
        }
    }
}

static void HippySetChildren(NSNumber *containerTag, NSArray<NSNumber *> *hippyTags, NSDictionary<NSNumber *, id<HippyComponent>> *registry) {
    id<HippyComponent> container = registry[containerTag];
    for (NSNumber *hippyTag in hippyTags) {
        id<HippyComponent> view = registry[hippyTag];
        if (view) {
            [container insertHippySubview:view atIndex:container.hippySubviews.count];
        }
    }
}

// clang-format off
HIPPY_EXPORT_METHOD(startBatch:(__unused NSString *)batchID) {
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(endBatch:(__unused NSString *)batchID) {
    if (_pendingUIBlocks.count) {
        [self batchDidComplete];
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
    
    [self addVirtulNodeBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,HippyVirtualNode *> *virtualNodeRegistry) {
        [uiManager _manageChildren:containerTag
                   moveFromIndices:moveFromIndices
                     moveToIndices:moveToIndices
                 addChildHippyTags:addChildHippyTags
                      addAtIndices:addAtIndices
                   removeAtIndices:removeAtIndices
                          registry:(NSMutableDictionary<NSNumber *, id<HippyComponent>> *)virtualNodeRegistry];
        
    }];
    
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

    if (!isUIViewRegistry) {
        isUIViewRegistry = ((id)registry == (id)_nodeRegistry);
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

        if (((id)registry == (id)_nodeRegistry)) {
            HippyVirtualNode *node = destinationsToChildrenToAdd[hippyIndex];
            node.parent = container;
        }

        [container insertHippySubview:destinationsToChildrenToAdd[hippyIndex] atIndex:insertAtIndex];
    }
}

// clang-format off
HIPPY_EXPORT_METHOD(createView:(nonnull NSNumber *)hippyTag
                  viewName:(NSString *)viewName
                  rootTag:(nonnull NSNumber *)rootTag
                  props:(NSDictionary *)props) {
    HippyComponentData *componentData = _componentDataByName[viewName];
    HippyShadowView *shadowView = [componentData createShadowViewWithTag:hippyTag];
    if (componentData == nil) {
        HippyLogError(@"No component found for view with name \"%@\"", viewName);
    }
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
    
    // Register shadow view
    if (shadowView) {
        shadowView.hippyTag = hippyTag;
        shadowView.rootTag = rootTag;
        shadowView.bridge = self.bridge;
        shadowView.viewName = viewName;
        shadowView.props = newProps;
        [componentData setProps:newProps forShadowView:shadowView];
        _shadowViewRegistry[hippyTag] = shadowView;
    }
    
    // Shadow view is the source of truth for background color this is a little
    // bit counter-intuitive if people try to set background color when setting up
    // the view, but it's the only way that makes sense given our threading model
    
    // Dispatch view creation directly to the main thread instead of adding to
    // UIBlocks array. This way, it doesn't get deferred until after layout.
    
    [self addUIBlock:^(HippyUIManager *uiManager, __unused NSDictionary<NSNumber *,UIView *> *viewRegistry) {
        
        HippyVirtualNode *node = uiManager->_nodeRegistry[hippyTag];
        
        if ([node createViewLazily]) {
            HippyVirtualNode *firstLazilyLoadTypeParentNode = [node firstLazilyLoadTypeParentNode];
            NSNumber *tag = [firstLazilyLoadTypeParentNode hippyTag];
            UIView *view = viewRegistry[tag];
            if (nil == view) {
                return;
            }
        }
        [uiManager createViewByComponentData:componentData hippyVirtualNode:node hippyTag:hippyTag properties:newProps viewName:viewName];
    }];
    
    [self addVirtulNodeBlock:^(HippyUIManager *uiManager, __unused NSDictionary<NSNumber *,HippyVirtualNode *> *virtualNodeRegistry) {
        HippyVirtualNode *node = [componentData createVirtualNode: hippyTag props: newProps];
        if(node) {
            node.rootTag = rootTag;
            node.bridge = [uiManager bridge];
            uiManager->_nodeRegistry[hippyTag] = node;
        }
    }];
}
// clang-format on

- (UIView *)createViewByComponentData:(HippyComponentData *)componentData
                     hippyVirtualNode:(HippyVirtualNode *)node
                             hippyTag:(NSNumber *)hippyTag
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
        view.rootTag = node.rootTag;
        [componentData setProps:props forView:view];  // Must be done before bgColor to prevent wrong default

        if ([view respondsToSelector:@selector(hippyBridgeDidFinishTransaction)]) {
            [self->_bridgeTransactionListeners addObject:view];
        }
        self->_viewRegistry[hippyTag] = view;
    }

    if ([node isKindOfClass:[HippyVirtualList class]]) {
        if ([view conformsToProtocol:@protocol(HippyBaseListViewProtocol)]) {
            id<HippyBaseListViewProtocol> listview = (id<HippyBaseListViewProtocol>)view;
            listview.node = (HippyVirtualList *)node;
            [self->_listTags addObject:hippyTag];
        }
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
    }

    
    [self addVirtulNodeBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,HippyVirtualNode *> *virtualNodeRegistry) {
        HippyVirtualNode *node = virtualNodeRegistry[hippyTag];
        node.props = virtualProps;
    }];
    
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
        [self flushVirtualNodeBlocks];
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
    // Gather blocks to be executed now that all view hierarchy manipulations have
    // been completed (note that these may still take place before layout has finished)
    for (HippyComponentData *componentData in _componentDataByName.allValues) {
        HippyViewManagerUIBlock uiBlock = [componentData uiBlockToAmendWithShadowViewRegistry:_shadowViewRegistry];
        [self addUIBlock:uiBlock];
    }

    // Perform layout
    for (NSNumber *hippyTag in _rootViewTags) {
        HippyRootShadowView *rootView = (HippyRootShadowView *)_shadowViewRegistry[hippyTag];
        [self addUIBlock:[self uiBlockWithLayoutUpdateForRootView:rootView]];
        [self _amendPendingUIBlocksWithStylePropagationUpdateForShadowView:rootView];
    }

    [self addUIBlock:^(HippyUIManager *uiManager, __unused NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        /**
         * TODO(tadeu): Remove it once and for all
         */
        for (id<HippyComponent> node in uiManager->_bridgeTransactionListeners) {
            [node hippyBridgeDidFinishTransaction];
        }
    }];

    [self flushVirtualNodeBlocks];

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

#ifdef QBNativeListENABLE
    [self flushVirtualNodeBlocks];
#endif

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
    HippyAssertThread(HippyGetUIManagerQueue(), @"flushUIBlocks can only be called from the shadow queue");

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

                    [uiManager flushListView];
                } @catch (NSException *exception) {
                    HippyLogError(@"Exception thrown while executing UI block: %@", exception);
                }
            }
        });
    }
}

- (void)flushVirtualNodeBlocks {
    HippyAssertThread(HippyGetUIManagerQueue(), @"flushUIBlocks can only be called from the shadow queue");

    // First copy the previous blocks into a temporary variable, then reset the
    // pending blocks to a new array. This guards against mutation while
    // processing the pending blocks in another thread.
    NSArray<HippyVirtualNodeManagerUIBlock> *previousPendingVirtualNodeBlocks = _pendingVirtualNodeBlocks;
    _pendingVirtualNodeBlocks = [NSMutableArray new];

    if (previousPendingVirtualNodeBlocks.count) {
        // Execute the previously queued UI blocks
        dispatch_async(dispatch_get_main_queue(), ^{
            @try {
                for (HippyVirtualNodeManagerUIBlock block in previousPendingVirtualNodeBlocks) {
                    block(self, self->_nodeRegistry);
                }
            } @catch (NSException *exception) {
                HippyLogError(@"Exception thrown while executing UI block: %@", exception);
            }
        });
    }
}

- (void)flushListView {
    if (_listTags.count != 0) {
        [_listTags enumerateObjectsUsingBlock:^(NSNumber *_Nonnull tag, __unused NSUInteger idx, __unused BOOL *stop) {
            HippyVirtualList *listNode = (HippyVirtualList *)self->_nodeRegistry[tag];
            if (listNode.isDirty) {
                id <HippyBaseListViewProtocol> listView = (id <HippyBaseListViewProtocol>)self->_viewRegistry[tag];
                if([listView flush]) {
                    listNode.isDirty = NO;
                }
            }
        }];
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
        [self _layoutAndMount:hippyTag];
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
    NSMutableDictionary<NSString *, NSDictionary *> *allJSConstants = [NSMutableDictionary new];
    NSMutableDictionary<NSString *, NSDictionary *> *directEvents = [NSMutableDictionary new];

    [_componentDataByName enumerateKeysAndObjectsUsingBlock:^(NSString *name, HippyComponentData *componentData, __unused BOOL *stop) {
        NSMutableDictionary<NSString *, id> *constantsNamespace = [NSMutableDictionary dictionaryWithDictionary:allJSConstants[name]];

        // Add manager class
        constantsNamespace[@"Manager"] = HippyBridgeModuleNameForClass(componentData.managerClass);

        // Add native props
        NSDictionary<NSString *, id> *viewConfig = [componentData viewConfig];
        constantsNamespace[@"NativeProps"] = viewConfig[@"propTypes"];

        // Add direct events
        for (NSString *eventName in viewConfig[@"directEvents"]) {
            if (!directEvents[eventName]) {
                directEvents[eventName] = @ {
                    @"registrationName": [eventName stringByReplacingCharactersInRange:(NSRange) { 0, 3 } withString:@"on"],
                };
            }
        }
        allJSConstants[name] = constantsNamespace;
    }];

    NSDictionary *dim = hippyExportedDimensions();
    [allJSConstants addEntriesFromDictionary:@{ @"customDirectEventTypes": directEvents, @"Dimensions": dim }];
    return allJSConstants;
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

- (UIView *)updateNode:(HippyVirtualNode *)oldNode withNode:(HippyVirtualNode *)node {
    UIView *result = nil;
    @try {
        UIView *cachedView = self->_viewRegistry[node.hippyTag];
        if (cachedView) {
            return cachedView;
        }

        if (oldNode == nil) {
            return nil;
        }
        
        if (![[oldNode viewName] isEqualToString:[node viewName]]) {
            return nil;
        }

        NSDictionary *diff = [oldNode diff:node];

        if (diff == nil) {
            HippyAssert(diff != nil, @"updateView two view node data struct is different");
        }

        NSDictionary *update = diff[@"update"];
        NSDictionary *insert = diff[@"insert"];
        NSArray *remove = diff[@"remove"];
        NSDictionary *tags = diff[@"tag"];

        for (NSNumber *tag in remove) {
            UIView *view = self->_viewRegistry[tag];
            [view.superview clearSortedSubviews];
            [view.superview removeHippySubview:view];
            [self removeNativeNodeView:view];
        }

        result = [node createView:^UIView *(HippyVirtualNode *subNode) {
            NSNumber *subTag = subNode.hippyTag;
            UIView *subview = nil;

            if (update[subTag]) {  // 更新props
                HippyVirtualNode *oldSubNode = self->_nodeRegistry[update[subTag]];
                subview = self->_viewRegistry[oldSubNode.hippyTag];
                if (subview == nil) {
                    NSString *viewName = subNode.viewName;
                    NSNumber *tag = subNode.hippyTag;
                    NSDictionary *props = subNode.props;
                    HippyComponentData *componentData = self->_componentDataByName[viewName];
                    subview = [self createViewByComponentData:componentData hippyVirtualNode:subNode hippyTag:tag properties:props viewName:viewName];
                } else {
                    HippyComponentData *componentData = self->_componentDataByName[oldSubNode.viewName];
                    NSDictionary *oldProps = oldSubNode.props;
                    NSDictionary *newProps = subNode.props;
                    newProps = [self mergeProps:newProps oldProps:oldProps];
                    [componentData setProps:newProps forView:subview];
                    [subview.layer removeAllAnimations];
                    [subview didUpdateWithNode:subNode];
                }
            } else if (insert[subTag]) {  // 插入
                subview = self->_viewRegistry[subTag];
                if (subview == nil) {
                    subview = [self createViewFromNode:subNode];
                }
            }

            if (tags[subTag]) {  // 更新tag
                NSNumber *oldSubTag = tags[subTag];
                subview = self->_viewRegistry[oldSubTag];
                if (subview == nil) {
                    NSString *viewName = subNode.viewName;
                    NSNumber *tag = subNode.hippyTag;
                    NSDictionary *props = subNode.props;
                    HippyComponentData *componentData = self->_componentDataByName[viewName];
                    subview = [self createViewByComponentData:componentData hippyVirtualNode:subNode hippyTag:tag properties:props viewName:viewName];
                } else {
                    [subview sendDetachedFromWindowEvent];
                    [subview.layer removeAllAnimations];
                    subview.hippyTag = subTag;
                    [self->_viewRegistry removeObjectForKey:oldSubTag];
                    self->_viewRegistry[subTag] = subview;
                    [subview sendAttachedToWindowEvent];
                }
            }

            if (!CGRectEqualToRect(subview.frame, subNode.frame)) {
                [subview hippySetFrame:subNode.frame];
            }

            return subview;
        } insertChildrens:^(UIView *container, NSArray<UIView *> *childrens) {
            NSInteger index = 0;
            for (UIView *subview in childrens) {
                [container removeHippySubview:subview];
                [container insertHippySubview:subview atIndex:index];
                index++;
            }
            [container didUpdateHippySubviews];
        }];

    } @catch (NSException *exception) {
        MttHippyException(exception);
    }
    return result;
}

- (UIView *)createViewFromNode:(HippyVirtualNode *)node {
    UIView *result = nil;
    NSMutableArray *tranctions = [NSMutableArray new];
#ifndef HIPPY_DEBUG
    @try {
#endif
        result = [node createView:^UIView *(HippyVirtualNode *subNode) {
            NSString *viewName = subNode.viewName;
            NSNumber *tag = subNode.hippyTag;
            NSDictionary *props = subNode.props;
            HippyComponentData *componentData = self->_componentDataByName[viewName];
            UIView *view = [self createViewByComponentData:componentData hippyVirtualNode:subNode hippyTag:tag properties:props viewName:viewName];
            CGRect frame = subNode.frame;
            [view hippySetFrame:frame];
            if ([view respondsToSelector:@selector(hippyBridgeDidFinishTransaction)]) {
                [tranctions addObject:view];
            }
            //            [self callCacheUIFunctionCallIfNeed: tag];
            if ([self->_listAnimatedViewTags containsObject:tag]) {
                [self.bridge.animationModule connectAnimationToView:view];
            }
            return view;
        } insertChildrens:^(UIView *container, NSArray<UIView *> *childrens) {
            NSInteger index = 0;
            for (UIView *view in childrens) {
                [container insertHippySubview:view atIndex:index++];
            }
            [container didUpdateHippySubviews];
        }];

        for (UIView *view in tranctions) {
            [view hippyBridgeDidFinishTransaction];
        }
#ifndef HIPPY_DEBUG
    } @catch (NSException *exception) {
        MttHippyException(exception);
    }
#endif
    return result;
}

- (void)removeNativeNode:(HippyVirtualNode *)node {
    [node removeView:^(NSNumber *tag) {
        [self->_listAnimatedViewTags removeObject:tag];
        [self->_viewRegistry removeObjectForKey:tag];
    }];
}

- (void)removeNativeNodeView:(UIView *)nodeView {
    [nodeView removeView:^(NSNumber *hippyTag) {
        if (hippyTag) {
            [self->_listAnimatedViewTags removeObject:hippyTag];
            [self->_viewRegistry removeObjectForKey:hippyTag];
        }
    }];
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

@implementation HippyBridge (HippyUIManager)

- (HippyUIManager *)uiManager {
    return [self moduleForClass:[HippyUIManager class]];
}

@end
