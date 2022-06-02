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
#import "HippyAnimationViewParams.h"
#import "HippyAnimator.h"
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
    NSNumber *_rootViewTag;
    NSMutableArray<HippyRenderUIBlock> *_pendingUIBlocks;

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
    NSDictionary<NSString *, Class> *_extraComponent;
    HippyAnimator *_animator;
}

@end

@implementation HippyUIManager

@synthesize frameworkProxy = _frameworkProxy;
@synthesize domManager = _domManager;

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
    // Internal resources
    _pendingUIBlocks = [NSMutableArray new];
    _componentTransactionListeners = [NSMutableSet new];
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
    _pendingUIBlocks = nil;
    [_completeBlocks removeAllObjects];
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

- (void)domNodeForHippyTag:(int32_t)hippyTag resultNode:(void (^)(std::shared_ptr<DomNode>))resultBlock {
    if (resultBlock) {
        auto domManager = _domManager.lock();
        if (domManager) {
            std::vector<std::function<void()>> ops_ = {[hippyTag, domManager, resultBlock](){
                @autoreleasepool {
                    auto node = domManager->GetNode(hippyTag);
                    resultBlock(node);
                }
            }};
            domManager->PostTask(hippy::dom::Scene(std::move(ops_)));
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

- (HippyAnimator *)animator {
    if (!_animator) {
        _animator = [[HippyAnimator alloc] initWithRenderContext:self];
    }
    return _animator;
}

- (__kindof UIView *)viewFromRenderViewTag:(NSNumber *)hippyTag {
    return [self viewForHippyTag:hippyTag];
}

- (UIView *)viewForHippyTag:(NSNumber *)hippyTag {
    AssertMainQueue();
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

- (void)registerRootView:(UIView *)rootView {
    AssertMainQueue();

    NSNumber *hippyTag = rootView.hippyTag;
    NSAssert(HippyIsHippyRootView(hippyTag), @"View %@ with tag #%@ is not a root view", rootView, hippyTag);

#if HIPPY_DEBUG
    UIView *existingView = _viewRegistry[hippyTag];
    NSAssert(existingView == nil || existingView == rootView, @"Expect all root views to have unique tag. Added %@ twice", hippyTag);
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
        self->_shadowViewRegistry[shadowView.hippyTag] = shadowView;
        self->_rootViewTag = hippyTag;
    });

    [[NSNotificationCenter defaultCenter] postNotificationName:HippyUIManagerDidRegisterRootViewNotification object:self
                                                      userInfo:@{ HippyUIManagerRootViewKey: rootView, HippyUIManagerKey: self}];
}


- (void)setFrame:(CGRect)frame forView:(UIView *)view {
    AssertMainQueue();
    NSNumber *hippyTag = view.hippyTag;
    auto domManager = _domManager.lock();
    if (domManager) {
        __weak id weakSelf = self;
        std::vector<std::function<void()>> ops_ = {[hippyTag, weakSelf, frame]() {
            if (weakSelf) {
                HippyUIManager *strongSelf = weakSelf;
                HippyShadowView *shadowView = strongSelf->_shadowViewRegistry[hippyTag];
                if (shadowView == nil) {
                    return;
                }
                if (!CGRectEqualToRect(frame, shadowView.frame)) {
                    shadowView.frame = frame;
                    [strongSelf setNeedsLayout];
                }
            }
        }};
        domManager->PostTask(hippy::dom::Scene(std::move(ops_)));
    }
}

/**
 * Unregisters views from registries
 */

- (void)purgeViewsFromHippyTags:(NSArray<NSNumber *> *)hippyTags {
    for (NSNumber *hippyTag in hippyTags) {
        UIView *view = [self viewForHippyTag:hippyTag];
        HippyTraverseViewNodes(view, ^(id<HippyComponent> subview) {
            NSAssert(![subview isHippyRootView], @"Root views should not be unregistered");
            [self->_viewRegistry removeObjectForKey:[subview hippyTag]];
        });
    }
}

- (void)purgeChildren:(NSArray<id<HippyComponent>> *)children fromRegistry:(NSMutableDictionary<NSNumber *, id<HippyComponent>> *)registry {
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

- (void)removeChildren:(NSArray<id<HippyComponent>> *)children fromContainer:(id<HippyComponent>)container {
    for (id<HippyComponent> removedChild in children) {
        [container removeHippySubview:removedChild];
    }
}

- (UIView *)createViewRecursivelyFromHippyTag:(NSNumber *)hippyTag {
    return [self createViewRecursivelyFromShadowView:_shadowViewRegistry[hippyTag]];
}

- (UIView *)createViewFromShadowView:(HippyShadowView *)shadowView {
    AssertMainQueue();
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
        for (HippyApplierBlock block in applierBlocks) {
            block(_viewRegistry);
        }
    }
    return view;
}

- (UIView *)updateShadowView:(HippyShadowView *)shadowView withAnotherShadowView:(HippyShadowView *)anotherShadowView {
    UIView *result = [self viewForHippyTag:anotherShadowView.hippyTag];
    if (result) {
        return result;
    }
    if (nil == shadowView) {
        return nil;
    }
    if (![shadowView.viewName isEqualToString:anotherShadowView.viewName]) {
        return nil;
    }
    NSDictionary *diffResult = [shadowView diffAnotherShadowView:anotherShadowView];
    if (nil == diffResult) {
        return nil;
    }
    NSDictionary *update = diffResult[HippyShadowViewDiffUpdate];
    NSDictionary *insert = diffResult[HippyShadowViewDiffInsertion];
    NSArray *remove = diffResult[HippyShadowViewDiffRemove];
    NSDictionary *tags = diffResult[HippyShadowViewDiffTag];
    for (NSNumber *tag in remove) {
        UIView *view = [self viewForHippyTag:tag];
        [view.superview clearSortedSubviews];
        [view.superview removeHippySubview:view];
    }
    result = [shadowView createView:^UIView *(HippyShadowView *shadowView) {
        NSNumber *hippyTag = shadowView.hippyTag;
        UIView *view = nil;
        NSNumber *originTag = update[hippyTag];
        if (originTag) {
            HippyShadowView *originShadowView = [self shadowViewForHippyTag:originTag];
            view = [self viewForHippyTag:originTag];
            if (view) {
                HippyComponentData *componentData = [self componentDataForViewName:originShadowView.viewName];
                NSDictionary *oldProps = originShadowView.props;
                NSDictionary *newProps = shadowView.props;
                newProps = [self mergeProps:newProps oldProps:oldProps];
                [componentData setProps:newProps forView:view];
                [view.layer removeAllAnimations];
            }
            else {
                view = [self createViewFromShadowView:shadowView];
            }
        }
        else if (insert[hippyTag]) {
            view = [self viewForHippyTag:hippyTag];
            if (nil == view) {
                view = [self createViewFromShadowView:shadowView];
            }
        }
        else if (tags[hippyTag]) {
            NSNumber *oldSubTag = tags[hippyTag];
            view = [self viewForHippyTag:oldSubTag];
            if (view == nil) {
                view = [self createViewFromShadowView:shadowView];
            } else {
                [view sendDetachedFromWindowEvent];
                [view.layer removeAllAnimations];
                view.hippyTag = hippyTag;
                self->_viewRegistry[hippyTag] = view;
                [view sendAttachedToWindowEvent];
            }
        }
        if (!CGRectEqualToRect(view.frame, shadowView.frame)) {
            [view hippySetFrame:shadowView.frame];
        }
        return view;
    } insertChildren:^(UIView *container, NSArray<UIView *> *children) {
        NSInteger index = 0;
        for (UIView *subview in children) {
            [container removeHippySubview:subview];
            [container insertHippySubview:subview atIndex:index];
            index++;
        }
        [container clearSortedSubviews];
        [container didUpdateHippySubviews];
    }];
    return result;
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
            //HippyLogError(@"No component found for view with name \"%@\"", viewName);
        }
        id isAnimated = props[@"useAnimation"];
        if (isAnimated && [isAnimated isKindOfClass: [NSNumber class]]) {
            HippyAnimator *animationModule = [self animator];
            props = [animationModule bindAnimaiton:props viewTag: hippyTag rootTag: _rootViewTag]?:props;
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

- (void)updateViewsFromParams:(NSArray<HippyAnimationViewParams *> *)params completion:(HippyViewUpdateCompletedBlock)block {
    for (HippyAnimationViewParams *param in params) {
        [self updateView:param.hippyTag viewName:nil props:param.updateParams];
        if (block) {
            [[self completeBlocks] addObject:block];
        }
    }
    [self layoutAndMount];
}

- (void)updateView:(NSNumber *)hippyTag props:(NSDictionary *)pros {
    [self updateView:hippyTag viewName:nil props:pros];
}

- (void)updateViewWithHippyTag:(NSNumber *)hippyTag props:(NSDictionary *)pros {
    [self updateView:hippyTag viewName:nil props:pros];
    [self layoutAndMount];
}

- (void)updateView:(nonnull NSNumber *)hippyTag viewName:(NSString *)viewName props:(NSDictionary *)props {
    HippyShadowView *shadowView = _shadowViewRegistry[hippyTag];
    if (!shadowView) {
        return;
    }
    HippyComponentData *componentData = [self componentDataForViewName:shadowView.viewName ? : viewName];
    id isAnimated = props[@"useAnimation"];
    if (isAnimated && [isAnimated isKindOfClass: [NSNumber class]]) {
        HippyAnimator *animationModule = [self animator];
        props = [animationModule bindAnimaiton:props viewTag:hippyTag rootTag: shadowView.rootTag]?:props;
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

- (void)measure:(nonnull NSNumber *)hippyTag callback:(RenderUIResponseSenderBlock)callback {
    [self addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[hippyTag];
        if (!view) {
            callback(@[]);
            return;
        }
        UIView *rootView = viewRegistry[view.rootTag];
        if (!rootView) {
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

- (void)measureInWindow:(nonnull NSNumber *)hippyTag callback:(RenderUIResponseSenderBlock)callback {
    [self addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[hippyTag];
        if (!view) {
            callback(@{});
            return;
        }
        UIView *rootView = viewRegistry[view.rootTag];
        if (!rootView) {
            callback(@{});
            return;
        }
        CGRect windowFrame = [rootView convertRect:view.frame fromView:view.superview];
        callback(@{@"width":@(CGRectGetWidth(windowFrame)),
                     @"height": @(CGRectGetHeight(windowFrame)),
                     @"x":@(windowFrame.origin.x),
                     @"y":@(windowFrame.origin.y)});
    }];
}

- (void)measureInAppWindow:(nonnull NSNumber *)hippyTag callback:(RenderUIResponseSenderBlock)callback {
    [self addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[hippyTag];
        if (!view) {
            callback(@{});
            return;
        }
        CGRect windowFrame = [view.window convertRect:view.frame fromView:view.superview];
        callback(@{@"width":@(CGRectGetWidth(windowFrame)),
                     @"height": @(CGRectGetHeight(windowFrame)),
                     @"x":@(windowFrame.origin.x),
                     @"y":@(windowFrame.origin.y)});
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
                    //HippyLogError(@"Exception thrown while executing UI block: %@", exception);
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
        NSAssert(subviewTags.size() == subviewIndices.size(), @"subviewTags count must be equal to subviewIndices count");
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
        int32_t tag = dom_node->GetRenderInfo().id;
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
    NSAssert(NO, @"no implementation for this method");
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
                HippyAnimator *animationModule = [self animator];
                NSDictionary *styleProps = unorderedMapDomValueToDictionary(props);
                styleProps = [animationModule bindAnimaiton:styleProps viewTag:hippyTag rootTag:shadowView.rootTag]?:styleProps;
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
    } else if (name == kVSyncKey) {
        std::string name_ = name;
        [self domNodeForHippyTag:node_id resultNode:^(std::shared_ptr<DomNode> node) {
            if (node) {
                NSString *vsyncKey = [NSString stringWithFormat:@"%p%d", self, node_id];
                auto event = std::make_shared<hippy::DomEvent>(name_, node);
                [[RenderVsyncManager sharedInstance] registerVsyncObserver:^{
                    node->HandleEvent(event);
                } rate:60 forKey:vsyncKey];
            }
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
    AssertMainQueue();
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
    AssertMainQueue();
    UIView *view = [self viewForHippyTag:@(hippyTag)];
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:hippy::kClickEvent];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:hippy::kClickEvent];
        __weak id weakSelf = self;
        [view addViewEvent:HippyViewEventTypeClick eventListener:^(CGPoint) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForHippyTag:hippyTag resultNode:^(std::shared_ptr<DomNode> node) {
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
        HippyShadowView *shadowView = _shadowViewRegistry[@(hippyTag)];
        [shadowView addEventName:hippy::kClickEvent];
    }
}

- (void)addLongClickEventListenerForView:(int32_t)hippyTag {
    AssertMainQueue();
    UIView *view = [self viewForHippyTag:@(hippyTag)];
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:hippy::kLongClickEvent];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:hippy::kLongClickEvent];
        __weak id weakSelf = self;
        [view addViewEvent:HippyViewEventTypeLongClick eventListener:^(CGPoint) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForHippyTag:hippyTag resultNode:^(std::shared_ptr<DomNode> node) {
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
        HippyShadowView *shadowView = _shadowViewRegistry[@(hippyTag)];
        [shadowView addEventName:hippy::kLongClickEvent];
    }
}

- (void)addPressEventListenerForType:(const std::string &)type forView:(int32_t)hippyTag {
    AssertMainQueue();
    UIView *view = [self viewForHippyTag:@(hippyTag)];
    HippyViewEventType eventType = hippy::kPressIn == type ? HippyViewEventType::HippyViewEventTypePressIn : HippyViewEventType::HippyViewEventTypePressOut;
    if (view) {
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:type];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:type];
        std::string block_type = type;
        __weak id weakSelf = self;
        [view addViewEvent:eventType eventListener:^(CGPoint) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForHippyTag:hippyTag resultNode:^(std::shared_ptr<DomNode> node) {
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
        HippyShadowView *shadowView = _shadowViewRegistry[@(hippyTag)];
        [shadowView addEventName:type];
    }
}

- (void)addTouchEventListenerForType:(const std::string &)type
                             forView:(int32_t)hippyTag {
    AssertMainQueue();
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
        const std::string type_ = type;
        __weak id weakSelf = self;
        [view addViewEvent:event_type eventListener:^(CGPoint point) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForHippyTag:hippyTag resultNode:^(std::shared_ptr<DomNode> node) {
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
        HippyShadowView *shadowView = _shadowViewRegistry[@(hippyTag)];
        [shadowView addEventName:type];
    }
}

- (void)addShowEventListenerForType:(const std::string &)type forView:(int32_t)hippyTag {
    AssertMainQueue();
    UIView *view = [self viewForHippyTag:@(hippyTag)];
    if (view) {
        HippyViewEventType event_type = hippy::kShowEvent == type ? HippyViewEventTypeShow : HippyViewEventTypeDismiss;
        BOOL canBePreventedInCapturing = [view canBePreventedByInCapturing:type];
        BOOL canBePreventedInBubbling = [view canBePreventInBubbling:type];
        __weak id weakSelf = self;
        [view addViewEvent:event_type eventListener:^(CGPoint point) {
            id strongSelf = weakSelf;
            if (strongSelf) {
                [strongSelf domNodeForHippyTag:hippyTag resultNode:^(std::shared_ptr<DomNode> node) {
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
    } else if (eventName == kVSyncKey) {
       std::string name_ = eventName;
       [self domNodeForHippyTag:node_id resultNode:^(std::shared_ptr<DomNode> node) {
           if (node) {
               NSString *vsyncKey = [NSString stringWithFormat:@"%p%d", self, node_id];
               [[RenderVsyncManager sharedInstance] unregisterVsyncObserverForKey:vsyncKey];
           }
       }];
   } else {
        std::string name_ = eventName;
        [self addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            HippyUIManager *uiManager = (HippyUIManager *)renderContext;
            UIView *view = [uiManager viewForHippyTag:@(hippyTag)];
            [view removeStatusChangeEvent:name_];
        }];
    }
}

- (void)addRenderEvent:(const std::string &)name forDomNode:(int32_t)node_id {
    AssertMainQueue();
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
            __weak id weakSelf = self;
            [view addStatusChangeEvent:[mapToEventName UTF8String] eventCallback:^(NSDictionary *body) {
                id strongSelf = weakSelf;
                if (strongSelf) {
                    [strongSelf domNodeForHippyTag:node_id resultNode:^(std::shared_ptr<DomNode> domNode) {
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

