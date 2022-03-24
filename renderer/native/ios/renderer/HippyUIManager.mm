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
#import "HippyShadowView.h"
#import "HippyUtils.h"
#import "HippyView.h"
#import "HippyViewManager.h"
#import "UIView+Hippy.h"
#import "HippyExtAnimationViewParams.h"
#import "HippyExtAnimationModule.h"
#import "UIView+Private.h"
#import "HippyMemoryOpt.h"
#import "HippyDeviceBaseInfo.h"
#import "OCTypeToDomArgument.h"
#import "UIView+HippyEvent.h"
#import "objc/runtime.h"
#import "UIView+Render.h"
#include <mutex>

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

const char *HippyUIManagerQueueName = "com.tencent.hippy.ShadowQueue";
NSString *const HippyUIManagerWillUpdateViewsDueToContentSizeMultiplierChangeNotification
    = @"HippyUIManagerWillUpdateViewsDueToContentSizeMultiplierChangeNotification";
NSString *const HippyUIManagerDidRegisterRootViewNotification = @"HippyUIManagerDidRegisterRootViewNotification";
NSString *const HippyUIManagerRootViewKey = @"HippyUIManagerRootViewKey";
NSString *const HippyUIManagerKey = @"HippyUIManagerKey";
NSString *const HippyUIManagerDidEndBatchNotification = @"HippyUIManagerDidEndBatchNotification";

@interface HippyUIManager() {
    NSNumber *_rootViewTag;
    NSMutableArray<HippyRenderUIBlock> *_pendingUIBlocks;
    NSMutableArray<NSNumber *> *_listTags;
    NSMutableSet<UIView *> *_viewsToBeDeleted;  // Main thread only

    NSMutableDictionary<NSNumber *, HippyShadowView *> *_shadowViewRegistry;  // Hippy thread only
    NSMutableDictionary<NSNumber *, UIView *> *_viewRegistry;                 // Main thread only

    // Keyed by viewName
    NSMutableDictionary<NSString *, HippyComponentData *> *_componentDataByName;

    NSMutableSet<id<HippyComponent>> *_componentTransactionListeners;

    NSMutableArray<HippyViewUpdateCompletedBlock> *_completeBlocks;

    NSMutableSet<NSNumber *> *_listAnimatedViewTags;
    std::weak_ptr<DomManager> _domManager;
    std::mutex _shadowQueueLock;
    NSMutableDictionary<NSString *, id> *_viewManagers;
}

@end

@implementation HippyUIManager

HIPPY_EXPORT_MODULE()

@synthesize bridge = _bridge;
@synthesize frameworkProxy = _frameworkProxy;

#pragma mark Life cycle

- (instancetype)init {
    self = [super init];
    if (self) {
        _listAnimatedViewTags = [NSMutableSet set];
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
    _shadowViewRegistry = [NSMutableDictionary new];
    _viewRegistry = [NSMutableDictionary new];
    _listTags = [NSMutableArray new];
    // Internal resources
    _pendingUIBlocks = [NSMutableArray new];
    _componentTransactionListeners = [NSMutableSet new];
    _viewsToBeDeleted = [NSMutableSet new];
    _componentDataByName = [NSMutableDictionary dictionaryWithCapacity:64];
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

- (void)invalidate {
    //TODO needs Framework call invalide manually
    /**
     * Called on the JS Thread since all modules are invalidated on the JS thread
     */
    _pendingUIBlocks = nil;
    [_completeBlocks removeAllObjects];
    __weak __typeof(self) weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        HippyUIManager *strongSelf = weakSelf;
        if (strongSelf) {
            strongSelf->_shadowViewRegistry = nil;
            [(id<HippyInvalidating>)strongSelf->_viewRegistry[strongSelf->_rootViewTag] invalidate];
            [strongSelf->_viewRegistry removeObjectForKey:strongSelf->_rootViewTag];

            for (NSNumber *hippyTag in [strongSelf->_viewRegistry allKeys]) {
                id<HippyComponent> subview = strongSelf->_viewRegistry[hippyTag];
                if ([subview conformsToProtocol:@protocol(HippyInvalidating)]) {
                    [(id<HippyInvalidating>)subview invalidate];
                }
            }

            strongSelf->_rootViewTag = nil;
            strongSelf->_viewRegistry = nil;
            strongSelf->_componentTransactionListeners = nil;
            strongSelf->_listTags = nil;
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

- (void)domNodeForHippyTag:(int32_t)hippyTag resultNode:(void (^)(std::shared_ptr<DomNode>))resultBlock {
    if (resultBlock) {
        auto domManager = _domManager.lock();
        if (domManager) {
            auto func = [hippyTag, domManager, resultBlock](){
                @autoreleasepool {
                    auto node = domManager->GetNode(hippyTag);
                    resultBlock(node);
                }
            };
            domManager->PostTask(func);
        }
    }
}

- (NSMutableArray *)completeBlocks {
    if (nil == _completeBlocks) {
        _completeBlocks = [NSMutableArray array];
    }
    return _completeBlocks;
}

- (NSMutableDictionary<NSNumber *, HippyShadowView *> *)shadowViewRegistry {
    if (!_shadowViewRegistry) {
        _shadowViewRegistry = [NSMutableDictionary new];
    }
    return _shadowViewRegistry;
}

- (NSDictionary<NSNumber *, __kindof UIView *> *)viewRegistry {
    if (!_viewRegistry) {
        _viewRegistry = [NSMutableDictionary new];
    }
    return [_viewRegistry copy];
}

- (void)setBridge:(HippyBridge *)bridge {
    //TODO delete all bridge code
    _bridge = bridge;
}

- (__kindof UIView *)viewFromRenderViewTag:(NSNumber *)hippyTag {
    return [self viewForHippyTag:hippyTag];
}

- (UIView *)viewForHippyTag:(NSNumber *)hippyTag {
    HippyAssertMainQueue();
    return _viewRegistry[hippyTag];
}

- (HippyShadowView *)shadowViewForHippyTag:(NSNumber *)hippyTag {
    return _shadowViewRegistry[hippyTag];
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
    HippyAssert(viewName, @"No view name input");
    if (viewName) {
        HippyComponentData *componentData = _componentDataByName[viewName];
        if (!componentData) {
            HippyViewManager *viewManager = [self renderViewManagerForViewName:viewName];
            HippyAssert(viewManager, @"No view manager found for %@", viewName);
            if (viewManager) {
                componentData = [[HippyComponentData alloc] initWithViewManager:viewManager viewName:viewName];
                _componentDataByName[viewName] = componentData;
            }
        }
        return componentData;
    }
    return nil;
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
        std::lock_guard<std::mutex> lock([self shadowQueueLock]);
        HippyRootShadowView *shadowView = [HippyRootShadowView new];
        shadowView.hippyTag = hippyTag;
        shadowView.frame = frame;
        shadowView.backgroundColor = backgroundColor;
        shadowView.viewName = NSStringFromClass([rootView class]);
        shadowView.sizeFlexibility = sizeFlexibility;
        self->_shadowViewRegistry[shadowView.hippyTag] = shadowView;
        self->_rootViewTag = hippyTag;
    });

    [[NSNotificationCenter defaultCenter] postNotificationName:HippyUIManagerDidRegisterRootViewNotification object:self
                                                      userInfo:@{ HippyUIManagerRootViewKey: rootView, HippyUIManagerKey: self}];
}


- (void)setFrame:(CGRect)frame forView:(UIView *)view {
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
        std::lock_guard<std::mutex> lock([self shadowQueueLock]);
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
            [self setNeedsLayout];
        }
    });
}

- (void)setBackgroundColor:(UIColor *)color forView:(UIView *)view {
    HippyAssertMainQueue();
    NSNumber *hippyTag = view.hippyTag;
    if (!self->_viewRegistry) {
        return;
    }
    dispatch_async(HippyGetUIManagerQueue(), ^{
        std::lock_guard<std::mutex> lock([self shadowQueueLock]);
        HippyShadowView *shadowView = self->_shadowViewRegistry[hippyTag];
        HippyAssert(shadowView != nil, @"Could not locate root view with tag #%@", hippyTag);
        shadowView.backgroundColor = color;
        [self amendPendingUIBlocksWithStylePropagationUpdateForShadowView:shadowView];
        [self flushUIBlocks];
    });
}

/**
 * Unregisters views from registries
 */
- (void)purgeChildren:(NSArray<id<HippyComponent>> *)children fromRegistry:(NSMutableDictionary<NSNumber *, id<HippyComponent>> *)registry {
    for (id<HippyComponent> child in children) {
        HippyTraverseViewNodes(registry[child.hippyTag], ^(id<HippyComponent> subview) {
            HippyAssert(![subview isHippyRootView], @"Root views should not be unregistered");
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

- (void)removeChildren:(NSArray<id<HippyComponent>> *)children fromContainer:(id<HippyComponent>)container {
    for (id<HippyComponent> removedChild in children) {
        [container removeHippySubview:removedChild];
    }
}

- (UIView *)createViewRecursivelyFromHippyTag:(NSNumber *)hippyTag {
    return [self createViewRecursivelyFromShadowView:_shadowViewRegistry[hippyTag]];
}

- (UIView *)createViewFromShadowView:(HippyShadowView *)shadowView {
    HippyAssertMainQueue();
    HippyComponentData *componentData = [self componentDataForViewName:shadowView.viewName];
    UIView *view = [self createViewByComponentData:componentData hippyTag:shadowView.hippyTag rootTag:_rootViewTag properties:shadowView.props viewName:shadowView.viewName];
    view.renderContext = self;
    [view hippySetFrame:shadowView.frame];
    const std::vector<std::string> &eventNames = [shadowView allEventNames];
    for (auto &event : eventNames) {
        [self addEventNameInMainThread:event forDomNodeId:[shadowView.hippyTag intValue]];
    }
    [shadowView clearEventNames];
    return view;
}

- (UIView *)createViewRecursivelyFromShadowView:(HippyShadowView *)shadowView {
    HippyAssertMainQueue();
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
        [view insertSubview:subview atIndex:index];
        index++;
    }
    view.hippyShadowView = shadowView;
    view.renderContext = self;
    [view didUpdateHippySubviews];
    NSMutableSet<HippyApplierBlock> *applierBlocks = [NSMutableSet setWithCapacity:1];
    [shadowView collectUpdatedProperties:applierBlocks parentProperties:@{}];
    if (applierBlocks.count) {
        for (HippyApplierBlock block in applierBlocks) {
            block(_viewRegistry);
        }
    }
    return view;
}

- (NSDictionary *)createShadowViewFromNode:(const std::shared_ptr<hippy::DomNode> &)domNode{
    if (domNode) {
        NSNumber *hippyTag = @(domNode->GetId());
        NSString *viewName = [NSString stringWithUTF8String:domNode->GetViewName().c_str()];
        NSString *tagName = [NSString stringWithUTF8String:domNode->GetTagName().c_str()];
        NSDictionary *props = stylesFromDomNode(domNode);
        HippyComponentData *componentData = [self componentDataForViewName:viewName];
        HippyShadowView *shadowView = [componentData createShadowViewWithTag:hippyTag];
        if (componentData == nil) {
            HippyLogError(@"No component found for view with name \"%@\"", viewName);
        }
        id isAnimated = props[@"useAnimation"];
        if (isAnimated && [isAnimated isKindOfClass: [NSNumber class]]) {
            HippyExtAnimationModule *animationModule = self.bridge.animationModule;
            props = [animationModule bindAnimaiton:props viewTag: hippyTag rootTag: _rootViewTag];
            shadowView.animated = [(NSNumber *)isAnimated boolValue];
        } else {
            shadowView.animated = NO;
        }

        NSMutableDictionary *newProps = [NSMutableDictionary dictionaryWithDictionary: props];
        [newProps setValue: _rootViewTag forKey: @"rootTag"];

        // Register shadow view
        if (shadowView) {
            shadowView.hippyTag = hippyTag;
            shadowView.rootTag = _rootViewTag;
            shadowView.viewName = viewName;
            shadowView.tagName = tagName;
            shadowView.props = newProps;
            shadowView.domManager = _domManager;
            shadowView.nodeLayoutResult = domNode->GetLayoutResult();
            shadowView.frame = CGRectMakeFromLayoutResult(domNode->GetLayoutResult());
            [componentData setProps:newProps forShadowView:shadowView];
            _shadowViewRegistry[hippyTag] = shadowView;
        }
        return newProps;
    }
    return @{};
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
        view.renderContext = self;
        [componentData setProps:props forView:view];  // Must be done before bgColor to prevent wrong default

        if ([view respondsToSelector:@selector(hippyComponentDidFinishTransaction)]) {
            [self->_componentTransactionListeners addObject:view];
        }
        self->_viewRegistry[hippyTag] = view;
    }
    return view;
}

- (void)updateViewsFromParams:(NSArray<HippyExtAnimationViewParams *> *)params completion:(HippyViewUpdateCompletedBlock)block {
    for (HippyExtAnimationViewParams *param in params) {
        [self updateView:param.hippyTag viewName:nil props:param.updateParams];
        if (block) {
            [[self completeBlocks] addObject:block];
        }
    }
    [self layoutAndMount];
}

- (void)updateViewWithHippyTag:(NSNumber *)hippyTag props:(NSDictionary *)pros {
    [self updateView:hippyTag viewName:nil props:pros];
    [self layoutAndMount];
}

- (void)updateView:(nonnull NSNumber *)hippyTag viewName:(NSString *)viewName props:(NSDictionary *)props {
    HippyShadowView *shadowView = _shadowViewRegistry[hippyTag];
    HippyComponentData *componentData = [self componentDataForViewName:shadowView.viewName ? : viewName];
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
    [self addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[hippyTag];
        [componentData setProps:newProps forView:view];
    }];
}

- (NSNumber *)rootHippyTag {
    return _rootViewTag;
}

- (void)measure:(nonnull NSNumber *)hippyTag callback:(HippyResponseSenderBlock)callback {
    [self addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
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

- (void)measureInWindow:(nonnull NSNumber *)hippyTag callback:(HippyResponseSenderBlock)callback {
    [self addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
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

- (void)measureInAppWindow:(nonnull NSNumber *)hippyTag callback:(HippyResponseSenderBlock)callback {
    [self addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
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

#pragma mark Render Context Implementation
#define Init(Component) NSClassFromString(@#Component)
- (__kindof HippyViewManager *)renderViewManagerForViewName:(NSString *)viewName {
    //TODO 需要接口接收自定义ViewManager:MyView
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
    }
    id object = [_viewManagers objectForKey:viewName];
    if (object_isClass(object)) {
        HippyViewManager *viewManager = [object new];
        viewManager.renderContext = self;
        HippyAssert([viewManager isKindOfClass:[HippyViewManager class]], @"It must be a HippyViewManager instance");
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
    NSArray<HippyRenderUIBlock> *previousPendingUIBlocks = _pendingUIBlocks;
    _pendingUIBlocks = [NSMutableArray new];
    __weak HippyUIManager *weakManager = self;
    if (previousPendingUIBlocks.count) {
        // Execute the previously queued UI blocks
        dispatch_async(dispatch_get_main_queue(), ^{
            if (weakManager) {
                id<HippyRenderContext> renderContext = weakManager;
                @try {
                    for (HippyRenderUIBlock block in previousPendingUIBlocks) {
                        HippyUIManager *uiManager = (HippyUIManager *)renderContext;
                        block(uiManager, uiManager->_viewRegistry);
                    }
                } @catch (NSException *exception) {
                    HippyLogError(@"Exception thrown while executing UI block: %@", exception);
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
- (void)createRenderNodes:(std::vector<std::shared_ptr<DomNode>> &&)nodes {
    std::lock_guard<std::mutex> lock([self shadowQueueLock]);
    HippyViewsRelation *manager = [[HippyViewsRelation alloc] init];
    NSMutableDictionary *dicProps = [NSMutableDictionary dictionaryWithCapacity:nodes.size()];
    for (const std::shared_ptr<DomNode> &node : nodes) {
        const auto& render_info = node->GetRenderInfo();
        [manager addViewTag:render_info.id forSuperViewTag:render_info.pid atIndex:render_info.index];
        [dicProps setObject:[self createShadowViewFromNode:node] forKey:@(node->GetId())];
    }
    [manager enumerateViewsHierarchy:^(int32_t tag, const std::vector<int32_t> &subviewTags, const std::vector<int32_t> &subviewIndices) {
        HippyAssert(subviewTags.size() == subviewIndices.size(), @"subviewTags count must be equal to subviewIndices count");
        HippyShadowView *superShadowView = self->_shadowViewRegistry[@(tag)];
        for (NSUInteger index = 0; index < subviewTags.size(); index++) {
            HippyShadowView *subShadowView = self->_shadowViewRegistry[@(subviewTags[index])];
            [superShadowView insertHippySubview:subShadowView atIndex:subviewIndices[index]];
        }
    }];
    for (const std::shared_ptr<DomNode> &node : nodes) {
        NSNumber *hippyTag = @(node->GetId());
        HippyShadowView *shadowView = _shadowViewRegistry[hippyTag];
        if (HippyCreationTypeInstantly == [shadowView creationType] && !_uiCreationLazilyEnabled) {
            NSString *viewName = [NSString stringWithUTF8String:node->GetViewName().c_str()];
            NSDictionary *props = [dicProps objectForKey:@(node->GetId())];
            HippyComponentData *componentData = [self componentDataForViewName:viewName];
            NSNumber *rootViewTag = _rootViewTag;
            [self addUIBlock:^(id<HippyRenderContext> renderContext, __unused NSDictionary<NSNumber *,UIView *> *viewRegistry) {
                HippyUIManager *uiManager = (HippyUIManager *)renderContext;
                UIView *view = [uiManager createViewByComponentData:componentData hippyTag:hippyTag rootTag:rootViewTag properties:props viewName:viewName];
                view.hippyShadowView = shadowView;
                view.renderContext = renderContext;
            }];
        }
    }
    [manager enumerateViewsHierarchy:^(int32_t tag, const std::vector<int32_t> &subviewTags, const std::vector<int32_t> &subviewIndices) {
        auto subViewTags_ = subviewTags;
        auto subViewIndices_ = subviewIndices;
        HippyShadowView *shadowView = self->_shadowViewRegistry[@(tag)];
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

- (void)updateRenderNodes:(std::vector<std::shared_ptr<DomNode>>&&)nodes {
    std::lock_guard<std::mutex> lock([self shadowQueueLock]);
    for (const auto &node : nodes) {
        NSNumber *hippyTag = @(node->GetRenderInfo().id);
        NSString *viewName = [NSString stringWithUTF8String:node->GetViewName().c_str()];
        NSDictionary *styleProps = unorderedMapDomValueToDictionary(node->GetStyleMap());
        NSDictionary *extProps = unorderedMapDomValueToDictionary(node->GetExtStyle());
        NSMutableDictionary *props = [NSMutableDictionary dictionaryWithDictionary:styleProps];
        [props addEntriesFromDictionary:extProps];
        [self updateView:hippyTag viewName:viewName props:props];
    }
}

- (void)deleteRenderNodesIds:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes {
    std::lock_guard<std::mutex> lock([self shadowQueueLock]);
    for (auto dom_node : nodes) {
        int32_t tag = dom_node->GetId();
        HippyShadowView *shadowView = _shadowViewRegistry[@(tag)];
        if (shadowView) {
            [shadowView removeFromHippySuperview];
            [self purgeChildren:@[shadowView] fromRegistry:(NSMutableDictionary<NSNumber *, id<HippyComponent>> *)_shadowViewRegistry];
        }
        __weak auto weakSelf = self;
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = viewRegistry[@(tag)];
            if (view) {
                [view removeFromHippySuperview];
                if (weakSelf) {
                    auto strongSelf = weakSelf;
                    [strongSelf purgeChildren:@[view] fromRegistry:(NSMutableDictionary<NSNumber *, id<HippyComponent>> *)(strongSelf->_viewRegistry)];
                }
            }
        }];
    }
}

- (void)renderMoveViews:(const std::vector<int32_t> &&)ids
          fromContainer:(int32_t)fromContainer toContainer:(int32_t)toContainer {
    HippyAssert(NO, @"no implementation for this method");
}

- (void)updateNodesLayout:(const std::vector<std::tuple<int32_t, hippy::LayoutResult, bool,
                           std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>>>> &)layoutInfos {
    std::lock_guard<std::mutex> lock([self shadowQueueLock]);
    for (auto &layoutInfoTuple : layoutInfos) {
        int32_t tag = std::get<0>(layoutInfoTuple);
        NSNumber *hippyTag = @(tag);
        hippy::LayoutResult layoutResult = std::get<1>(layoutInfoTuple);
        bool isAnimated = std::get<2>(layoutInfoTuple);
        auto &props = std::get<3>(layoutInfoTuple);
        CGRect frame = CGRectMakeFromLayoutResult(layoutResult);
        HippyShadowView *shadowView = _shadowViewRegistry[hippyTag];
        if (shadowView) {
            if (isAnimated) {
                //TODO 动画需要剥离bridge
                HippyExtAnimationModule *animationModule = self.bridge.animationModule;
                NSDictionary *styleProps = unorderedMapDomValueToDictionary(props);
                styleProps = [animationModule bindAnimaiton:styleProps viewTag:hippyTag rootTag:shadowView.rootTag];
                shadowView.animated = isAnimated;
                if ([styleProps objectForKey:@"height"]) {
                    frame.size.height = [styleProps[@"height"] floatValue];
                }
                if ([styleProps objectForKey:@"width"]) {
                    frame.size.width = [styleProps[@"width"] floatValue];
                }

            } else {
                shadowView.animated = NO;
            }
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

-(void)batch {
    [self layoutAndMount];
    [[NSNotificationCenter defaultCenter] postNotificationName:HippyUIManagerDidEndBatchNotification
                                                        object:self];
}

- (id)dispatchFunction:(const std::string &)functionName viewName:(const std::string &)viewName viewTag:(int32_t)hippyTag
                  params:(const DomValue &)params callback:(CallFunctionCallback)cb {
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

    HippyViewManager *viewManager = [self renderViewManagerForViewName:nativeModuleName];
    HippyComponentData *componentData = [self componentDataForViewName:nativeModuleName];
    id<HippyBridgeMethod> method = componentData.methodsByName[name];
    if (!method) {
        return nil;
    }
    @try {
        return [method invokeWithBridge:nil module:viewManager arguments:finalParams];
    } @catch (NSException *exception) {
        if ([exception.name hasPrefix:HippyFatalExceptionName]) {
            @throw exception;
        }

        NSString *message = [NSString stringWithFormat:@"Exception '%@' was thrown while invoking %@ on component target %@ with params %@", exception, method.JSMethodName, nativeModuleName, finalParams];
        NSError *error = HippyErrorWithMessage(message);
        HippyFatal(error);
        return nil;
    }
}

#pragma mark -
#pragma mark Event Handler

- (void)addEventName:(const std::string &)name forDomNodeId:(int32_t)node_id {
    if (name == hippy::kClickEvent) {
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            [uiManager addClickEventListenerForView:node_id];
        }];
    } else if (name == hippy::kLongClickEvent) {
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            [uiManager addLongClickEventListenerForView:node_id];
        }];
    } else if (name == hippy::kTouchStartEvent || name == hippy::kTouchMoveEvent
               || name == hippy::kTouchEndEvent || name == hippy::kTouchCancelEvent) {
        std::string name_ = name;
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            [uiManager addTouchEventListenerForType:name_ forView:node_id];
        }];
    } else if (name == hippy::kShowEvent || name == hippy::kDismissEvent) {
        std::string name_ = name;
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            [uiManager addShowEventListenerForType:name_ forView:node_id];
        }];
    } else if (name == hippy::kPressIn || name == hippy::kPressOut) {
        std::string name_ = name;
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            [uiManager addPressEventListenerForType:name_ forView:node_id];
        }];
    }
    else {
        std::string name_ = name;
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            [uiManager addRenderEvent:name_ forDomNode:node_id];
        }];
    }
}

- (void)addEventNameInMainThread:(const std::string &)name forDomNodeId:(int32_t)node_id {
    HippyAssertMainQueue();
    if (name == hippy::kClickEvent) {
        [self addClickEventListenerForView:node_id];
    } else if (name == hippy::kLongClickEvent) {
        [self addLongClickEventListenerForView:node_id];
    } else if (name == hippy::kTouchStartEvent || name == hippy::kTouchMoveEvent
               || name == hippy::kTouchEndEvent || name == hippy::kTouchCancelEvent) {
        [self addTouchEventListenerForType:name forView:node_id];
    } else if (name == hippy::kShowEvent || name == hippy::kDismissEvent) {
        [self addShowEventListenerForType:name forView:node_id];
    } else if (name == hippy::kPressIn || name == hippy::kPressOut) {
        [self addPressEventListenerForType:name forView:node_id];
    } else {
        [self addRenderEvent:name forDomNode:node_id];
    }
}

- (void)addClickEventListenerForView:(int32_t)hippyTag {
    HippyAssertMainThread();
    UIView *view = [self viewForHippyTag:@(hippyTag)];
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:hippy::kClickEvent];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:hippy::kClickEvent];
        [view addViewEvent:HippyViewEventTypeClick eventListener:^(CGPoint) {
            [self domNodeForHippyTag:hippyTag resultNode:^(std::shared_ptr<DomNode> node) {
                if (node) {
                    node->HandleEvent(std::make_shared<hippy::DomEvent>(hippy::kClickEvent, node,
                                                                        canBePreventedInCapturing, canBePreventedInBubbling,
                                                                        static_cast<std::shared_ptr<DomValue>>(nullptr)));
                }
            }];
        }];
    }
    else {
        HippyShadowView *shadowView = _shadowViewRegistry[@(hippyTag)];
        [shadowView addEventName:hippy::kClickEvent];
    }
}

- (void)addLongClickEventListenerForView:(int32_t)hippyTag {
    HippyAssertMainThread();
    UIView *view = [self viewForHippyTag:@(hippyTag)];
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:hippy::kLongClickEvent];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:hippy::kLongClickEvent];
        [view addViewEvent:HippyViewEventTypeLongClick eventListener:^(CGPoint) {
            [self domNodeForHippyTag:hippyTag resultNode:^(std::shared_ptr<DomNode> node) {
                if (node) {
                    node->HandleEvent(std::make_shared<hippy::DomEvent>(hippy::kLongClickEvent, node,
                                                                        canBePreventedInCapturing, canBePreventedInBubbling,
                                                                        static_cast<std::shared_ptr<DomValue>>(nullptr)));
                }
            }];
        }];
    }
    else {
        HippyShadowView *shadowView = _shadowViewRegistry[@(hippyTag)];
        [shadowView addEventName:hippy::kLongClickEvent];
    }
}

- (void)addPressEventListenerForType:(const std::string &)type forView:(int32_t)hippyTag {
    HippyAssertMainThread();
    UIView *view = [self viewForHippyTag:@(hippyTag)];
    HippyViewEventType eventType = hippy::kPressIn == type ? HippyViewEventType::HippyViewEventTypePressIn : HippyViewEventType::HippyViewEventTypePressOut;
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:type];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:type];
        std::string block_type = type;
        [view addViewEvent:eventType eventListener:^(CGPoint) {
            [self domNodeForHippyTag:hippyTag resultNode:^(std::shared_ptr<DomNode> node) {
                if (node) {
                    node->HandleEvent(std::make_shared<hippy::DomEvent>(block_type, node,
                                                                        canBePreventedInCapturing, canBePreventedInBubbling,
                                                                        static_cast<std::shared_ptr<DomValue>>(nullptr)));
                }
            }];
        }];
    }
    else {
        HippyShadowView *shadowView = _shadowViewRegistry[@(hippyTag)];
        [shadowView addEventName:type];
    }
}

- (void)addTouchEventListenerForType:(const std::string &)type
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
            [self domNodeForHippyTag:hippyTag resultNode:^(std::shared_ptr<DomNode> node) {
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
        }];
    }
    else {
        HippyShadowView *shadowView = _shadowViewRegistry[@(hippyTag)];
        [shadowView addEventName:type];
    }
}

- (void)addShowEventListenerForType:(const std::string &)type forView:(int32_t)hippyTag {
    HippyAssertMainThread();
    UIView *view = [self viewForHippyTag:@(hippyTag)];
    if (view) {
        HippyViewEventType event_type = hippy::kShowEvent == type ? HippyViewEventTypeShow : HippyViewEventTypeDismiss;
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:type];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:type];
        [view addViewEvent:event_type eventListener:^(CGPoint point) {
            [self domNodeForHippyTag:hippyTag resultNode:^(std::shared_ptr<DomNode> node) {
                if (node) {
                    std::shared_ptr<DomValue> domValue = std::make_shared<DomValue>(true);
                    node->HandleEvent(std::make_shared<DomEvent>(type, node, canBePreventedInCapturing,
                                                                 canBePreventedInBubbling, domValue));
                }
            }];
        }];
    }
    else {
        HippyShadowView *shadowView = _shadowViewRegistry[@(hippyTag)];
        [shadowView addEventName:type];
    }
}

- (void)removeEventName:(const std::string &)eventName forDomNodeId:(int32_t)node_id {
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
            UIView *view = [uiManager viewForHippyTag:@(hippyTag)];
            [view removeViewEvent:viewEventTypeFromName(name_)];
        }];
    }
    else {
        std::string name_ = eventName;
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            UIView *view = [uiManager viewForHippyTag:@(hippyTag)];
            [view removeStatusChangeEvent:name_];
        }];
    }
}

- (void)addRenderEvent:(const std::string &)name forDomNode:(int32_t)node_id {
    HippyAssertMainQueue();
    std::string name_ = std::move(name);
    NSDictionary *componentDataByName = [_componentDataByName copy];
    UIView *view = [self viewForHippyTag:@(node_id)];
    if (view) {
        NSString *viewName = view.viewName;
        HippyComponentData *component = componentDataByName[viewName];
        NSDictionary<NSString *, NSString *> *eventMap = [component eventNameMap];
        NSString *mapToEventName = [eventMap objectForKey:[NSString stringWithUTF8String:name_.c_str()]];
        if (mapToEventName) {
            BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:name_];
            BOOL canBePreventedInBubbling = [view canBePreventInBubbling:name_];
            [view addStatusChangeEvent:[mapToEventName UTF8String] eventCallback:^(NSDictionary *body) {
                [self domNodeForHippyTag:node_id resultNode:^(std::shared_ptr<DomNode> domNode) {
                    if (domNode) {
                        DomValue value = [body toDomValue];
                        std::shared_ptr<DomValue> domValue = std::make_shared<DomValue>(std::move(value));
                        domNode->HandleEvent(std::make_shared<DomEvent>(name_, domNode, canBePreventedInCapturing,
                                                                     canBePreventedInBubbling, domValue));
                    }
                }];
            }];
        }
    }
    else {
        HippyShadowView *shadowView = _shadowViewRegistry[@(node_id)];
        [shadowView addEventName:name];
    }
}

- (void)removeRenderEvent:(const std::string &)name forDomNodeId:(int32_t)node_id {
    int32_t hippyTag = node_id;
    std::string name_ = name;
    [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyUIManager *uiManager = (HippyUIManager *)renderContext;
        UIView *view = [uiManager viewForHippyTag:@(hippyTag)];
        [view removeStatusChangeEvent:name_];
    }];
}

#pragma mark -
#pragma mark Other

/**
 * Sets up animations, computes layout, creates UI mounting blocks for computed layout,
 * runs these blocks and all other already existing blocks.
 */
- (void)layoutAndMount {
    std::lock_guard<std::mutex> lock([self shadowQueueLock]);
    HippyRootShadowView *rootView = (HippyRootShadowView *)_shadowViewRegistry[_rootViewTag];
    // Gather blocks to be executed now that all view hierarchy manipulations have
    // been completed (note that these may still take place before layout has finished)
    for (HippyComponentData *componentData in _componentDataByName.allValues) {
        HippyRenderUIBlock uiBlock = [componentData uiBlockToAmendWithShadowViewRegistry:_shadowViewRegistry];
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
    [self flushUIBlocks];
    [self flushUpdateCompletedBlocks];
}

- (void)setNeedsLayout {
    // If there is an active batch layout will happen when batch finished, so we will wait for that.
    // Otherwise we immidiately trigger layout.
    [self layoutAndMount];
}

- (NSDictionary<NSString *, id> *)constantsToExport {
    return @{};
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
