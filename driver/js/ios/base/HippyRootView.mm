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

#import "HippyRootView.h"
#import "HippyRootViewDelegate.h"

#import <objc/runtime.h>

#import "HippyAssert.h"
#import "HippyBridge.h"
#import "HippyBridge+Private.h"
#import "HippyEventDispatcher.h"
#import "HippyKeyCommands.h"
#import "NativeRenderLog.h"
#import "HippyPerformanceLogger.h"
#import "NativeRenderImpl.h"
#import "NativeRenderUtils.h"
#import "NativeRenderView.h"
#import "UIView+NativeRender.h"
#import "HippyBundleURLProvider.h"
#include "scope.h"
#include "footstone/hippy_value.h"
#include "NativeRenderDomNodeUtils.h"

NSString *const HippyContentDidAppearNotification = @"HippyContentDidAppearNotification";

NSNumber *AllocRootViewTag() {
    static NSString * const token = @"allocateRootTag";
    @synchronized (token) {
        static NSUInteger rootTag = 0;
        return @(rootTag += 10);
    }
}

@interface HippyRootContentView : NativeRenderView <NativeRenderInvalidating>

@property (nonatomic, readonly) BOOL contentHasAppeared;
@property (nonatomic, assign) int64_t startTimpStamp;

- (instancetype)initWithFrame:(CGRect)frame
                       bridge:(HippyBridge *)bridge
                     hippyTag:(NSNumber *)hippyTag NS_DESIGNATED_INITIALIZER;

- (void)removeAllSubviews;

@end

@interface HippyRootView () {
    HippyBridge *_bridge;
    NSString *_moduleName;
    HippyRootContentView *_contentView;
}

@property (readwrite, nonatomic, assign) CGSize intrinsicSize;

@end

@implementation HippyRootView

- (instancetype)initWithBridge:(HippyBridge *)bridge
                    moduleName:(NSString *)moduleName
             initialProperties:(NSDictionary *)initialProperties
                      delegate:(id<HippyRootViewDelegate>)delegate {
    NativeRenderAssertMainQueue();
    HippyAssert(bridge, @"A bridge instance is required to create an HippyRootView");
    HippyAssert(moduleName, @"A moduleName is required to create an HippyRootView");

    if ((self = [super initWithFrame:CGRectZero])) {
        self.backgroundColor = [UIColor clearColor];

        _bridge = bridge;
        if (nil == _bridge.moduleName) {
            _bridge.moduleName = moduleName;
        }
        _moduleName = moduleName;
        _appProperties = [initialProperties copy];
        _loadingViewFadeDelay = 0.25;
        _loadingViewFadeDuration = 0.25;
        _delegate = delegate;
        _contentView = [[HippyRootContentView alloc] initWithFrame:self.bounds bridge:bridge hippyTag:self.componentTag];
        _contentView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        self.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(bridgeDidReload) name:HippyJavaScriptWillStartLoadingNotification
                                                   object:_bridge];

        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(javaScriptDidLoad:) name:HippyJavaScriptDidLoadNotification
                                                   object:_bridge];

        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(javaScriptDidFailToLoad:)
                                                     name:HippyJavaScriptDidFailToLoadNotification
                                                   object:nil];

        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(_contentDidAppear:) name:HippyContentDidAppearNotification
                                                   object:self];

        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(_secondaryBundleDidLoadSourceCode:)
                                                     name:HippySecondaryBundleDidLoadSourceCodeNotification
                                                   object:nil];

        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(_secondayBundleDidFinishLoad:)
                                                     name:HippySecondaryBundleDidLoadNotification
                                                   object:nil];

        [self showLoadingView];
        [_bridge.performanceLogger markStartForTag:HippyPLTTI];
        NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyRootView Init %p", self);
    }

    return self;
}

- (instancetype)initWithBundleURL:(NSURL *)bundleURL
                       moduleName:(NSString *)moduleName
                initialProperties:(NSDictionary *)initialProperties
                    launchOptions:(NSDictionary *)launchOptions
                        debugMode:(BOOL)mode
                         delegate:(id<HippyRootViewDelegate>)delegate

{
    NSMutableDictionary *extendsLaunchOptions = [NSMutableDictionary new];
    [extendsLaunchOptions addEntriesFromDictionary:launchOptions];
    [extendsLaunchOptions setObject:@(mode) forKey:@"DebugMode"];
    HippyBridge *bridge = [[HippyBridge alloc] initWithBundleURL:bundleURL moduleProvider:nil launchOptions:extendsLaunchOptions
                                                     executorKey:moduleName];
    return [self initWithBridge:bridge moduleName:moduleName initialProperties:initialProperties delegate:delegate];
}

- (instancetype)initWithBridge:(HippyBridge *)bridge
                   businessURL:(NSURL *)businessURL
                    moduleName:(NSString *)moduleName
             initialProperties:(NSDictionary *)initialProperties
                 launchOptions:(NSDictionary *)launchOptions
                      delegate:(id<HippyRootViewDelegate>)delegate {
    bridge.batchedBridge.useCommonBridge = YES;
    if (self = [self initWithBridge:bridge moduleName:moduleName initialProperties:initialProperties delegate:delegate]) {
        if (!bridge.isLoading && !bridge.isValid) {
            if (delegate && [delegate respondsToSelector:@selector(rootView:didLoadFinish:)]) {
                [delegate rootView:self didLoadFinish:NO];
            }
        } else {
            __weak __typeof__(self) weakSelf = self;
            [bridge loadSecondary:businessURL loadBundleCompletion:nil enqueueScriptCompletion:nil completion:^(BOOL success) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    if (success) {
                        [weakSelf bundleFinishedLoading:bridge.batchedBridge];
                    }

                    if ([delegate respondsToSelector:@selector(rootView:didLoadFinish:)]) {
                        [delegate rootView:weakSelf didLoadFinish:success];
                    }
                });
            }];
        }
    }
    return self;
}

- (instancetype)initWithBridgeButNoRuntime:(HippyBridge *)bridge {
    self = [super init];
    if (self) {
        self.bridge = bridge;
        bridge.batchedBridge.useCommonBridge = YES;
        [self bundleFinishedLoading:bridge.batchedBridge];
    }
    return self;
}

//HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithFrame : (CGRect)frame)
HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithCoder : (NSCoder *)aDecoder)

- (void)setBackgroundColor:(UIColor *)backgroundColor {
    super.backgroundColor = backgroundColor;
    _contentView.backgroundColor = backgroundColor;
}

- (void)setBridge:(HippyBridge *)bridge {
    _bridge = bridge;
}

- (UIViewController *)nativeRenderViewController {
    return _hippyViewController ?: [super nativeRenderViewController];
}

- (BOOL)canBecomeFirstResponder {
    return YES;
}

- (void)setLoadingView:(UIView *)loadingView {
    _loadingView = loadingView;
    if (!_contentView.contentHasAppeared) {
        [self showLoadingView];
    }
}

- (void)showLoadingView {
    if (_loadingView && !_contentView.contentHasAppeared) {
        _loadingView.hidden = NO;
        [self addSubview:_loadingView];
    }
}

- (void)_contentDidAppear:(NSNotification *)n {
    if (_loadingView.superview == self && _contentView.contentHasAppeared) {
        if (_loadingViewFadeDuration > 0) {
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(_loadingViewFadeDelay * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
                [UIView transitionWithView:self duration:self->_loadingViewFadeDuration options:UIViewAnimationOptionTransitionCrossDissolve
                    animations:^{
                        self->_loadingView.hidden = YES;
                    }
                    completion:^(__unused BOOL finished) {
                        [self->_loadingView removeFromSuperview];
                    }];
            });
        } else {
            _loadingView.hidden = YES;
            [_loadingView removeFromSuperview];
        }
    }
    [self contentDidAppear:[n.userInfo[@"cost"] longLongValue]];
}

- (NSNumber *)componentTag {
    NativeRenderAssertMainQueue();
    if (!super.componentTag) {
        self.componentTag = AllocRootViewTag();
    }
    return super.componentTag;
}

- (void)bridgeDidReload {
    NativeRenderAssertMainQueue();
    // Clear the hippyTag so it can be re-assigned
    self.componentTag = nil;
}

- (void)javaScriptDidLoad:(NSNotification *)notification {
    NativeRenderAssertMainQueue();

    // Use the (batched) bridge that's sent in the notification payload, so the
    // HippyRootContentView is scoped to the right bridge
    HippyBridge *bridge = notification.userInfo[@"bridge"];
    if (!bridge.useCommonBridge && _bridge.batchedBridge == bridge) {
        [self bundleFinishedLoading:bridge];
    }
}

- (void)javaScriptDidFailToLoad:(NSNotification *)notification {
    HippyBridge *bridge = notification.userInfo[@"bridge"];
    NSError *error = notification.userInfo[@"error"];
    if (bridge == self.bridge && error) {
        NSError *retError = NativeRenderErrorFromErrorAndModuleName(error, self.bridge.moduleName);
        HippyFatal(retError);
    }
}

- (void)_secondaryBundleDidLoadSourceCode:(NSNotification *)notification {
    NSError *error = notification.userInfo[@"error"];
    if (nil == error) {
        return;
    }
    HippyBridge *notiBridge = notification.userInfo[@"bridge"];
    if (self.bridge == notiBridge) {
        [self secondaryBundleDidLoadSourceCode:error];
    }
}

- (void)_secondayBundleDidFinishLoad:(NSNotification *)notification {
    NSError *error = notification.userInfo[@"error"];
    HippyBridge *notiBridge = notification.userInfo[@"bridge"];
    if (self.bridge == notiBridge) {
        [self secondayBundleDidFinishLoad:error];
    }
}

- (void)contentDidAppear:(__unused int64_t)cost {
}

- (void)secondaryBundleDidLoadSourceCode:(NSError *)error {
    if (error) {
        NSError *retError = NativeRenderErrorFromErrorAndModuleName(error, self.bridge.moduleName);
        HippyFatal(retError);
    }
}

- (void)secondayBundleDidFinishLoad:(NSError *)error {
    if (error) {
        NSError *retError = NativeRenderErrorFromErrorAndModuleName(error, self.bridge.moduleName);
        HippyFatal(retError);
    }
}

- (void)bundleFinishedLoading:(HippyBridge *)bridge {
    if (!bridge.valid) {
        return;
    }

    [_contentView removeAllSubviews];

    [self runApplication:bridge];

    _contentView.backgroundColor = self.backgroundColor;
    [self insertSubview:_contentView atIndex:0];
}

- (void)runApplication:(HippyBridge *)bridge {
    NSAssert(_contentView, @"content view must exist");
    if (_contentView == nil) {
        return;
    }
    NSString *moduleName = _moduleName ?: @"";
    NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],Running application %@ (%@)", moduleName, _appProperties);
    NSDictionary *param = @{@"name": moduleName,
                            @"id": _contentView.componentTag,
                            @"params": _appProperties ?: @{},
                            @"version": HippySDKVersion};
    footstone::value::HippyValue value = OCTypeToDomValue(param);
    std::shared_ptr<footstone::value::HippyValue> domValue = std::make_shared<footstone::value::HippyValue>(value);
    bridge.javaScriptExecutor.pScope->LoadInstance(domValue);
}

- (void)layoutSubviews {
    [super layoutSubviews];
    _contentView.frame = self.bounds;
    _loadingView.center = (CGPoint) { CGRectGetMidX(self.bounds), CGRectGetMidY(self.bounds) };
}

- (void)setAppProperties:(NSDictionary *)appProperties {
    NativeRenderAssertMainQueue();

    if ([_appProperties isEqualToDictionary:appProperties]) {
        return;
    }

    _appProperties = [appProperties copy];

    if (_contentView && _bridge.valid && !_bridge.loading) {
        [self runApplication:_bridge];
    }
}

- (void)setIntrinsicSize:(CGSize)intrinsicSize {
    BOOL oldSizeHasAZeroDimension = _intrinsicSize.height == 0 || _intrinsicSize.width == 0;
    BOOL newSizeHasAZeroDimension = intrinsicSize.height == 0 || intrinsicSize.width == 0;
    BOOL bothSizesHaveAZeroDimension = oldSizeHasAZeroDimension && newSizeHasAZeroDimension;

    BOOL sizesAreEqual = CGSizeEqualToSize(_intrinsicSize, intrinsicSize);

    _intrinsicSize = intrinsicSize;

    // Don't notify the delegate if the content remains invisible or its size has not changed
    if (bothSizesHaveAZeroDimension || sizesAreEqual) {
        return;
    }
    if ([_delegate respondsToSelector:@selector(rootViewDidChangeIntrinsicSize:)]) {
        [_delegate rootViewDidChangeIntrinsicSize:self];
    }
}

- (void)contentViewInvalidated {
    [_contentView removeAllSubviews];
    [self showLoadingView];
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [_contentView invalidate];
    if ([_delegate respondsToSelector:@selector(rootViewWillBePurged:)]) {
        [_delegate rootViewWillBePurged:self];
    }
    NativeRenderLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyRootView dealloc %p", self);
}

@end

@implementation HippyRootContentView {
    __weak HippyBridge *_bridge;
    UIColor *_backgroundColor;
}

- (instancetype)initWithFrame:(CGRect)frame
                       bridge:(HippyBridge *)bridge
                     hippyTag:(NSNumber *)hippyTag {
    if ((self = [super initWithFrame:frame])) {
        _bridge = bridge;
        self.componentTag = hippyTag;
        self.layer.backgroundColor = NULL;
        _startTimpStamp = CACurrentMediaTime() * 1000;
    }
    return self;
}

HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithFrame : (CGRect)frame)
HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithCoder : (nonnull NSCoder *)aDecoder)

- (void)insertNativeRenderSubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    [super insertNativeRenderSubview:subview atIndex:atIndex];
    [_bridge.performanceLogger markStopForTag:HippyPLTTI];

    dispatch_async(dispatch_get_main_queue(), ^{
        if (!self->_contentHasAppeared) {
            self->_contentHasAppeared = YES;
            int64_t cost = [self->_bridge.performanceLogger durationForTag:HippyPLTTI];
            [[NSNotificationCenter defaultCenter] postNotificationName:HippyContentDidAppearNotification object:self.superview userInfo:@{
                @"cost": @(cost)
            }];
        }
    });
}

- (void)setFrame:(CGRect)frame {
    super.frame = frame;
    if (self.componentTag && _bridge.isValid) {
        [_bridge.renderContext setFrame:frame forRootView:self];
    }
}

- (void)removeAllSubviews {
    [self resetNativeRenderSubviews];
}

- (void)setBackgroundColor:(UIColor *)backgroundColor {
    _backgroundColor = backgroundColor;
}

- (UIColor *)backgroundColor {
    return _backgroundColor;
}

- (void)didAddSubview:(UIView *)subview {
    [super didAddSubview:subview];
}

- (void)invalidate {
    if (self.userInteractionEnabled) {
        self.userInteractionEnabled = NO;
        [(HippyRootView *)self.superview contentViewInvalidated];
        NSDictionary *param = @{@"id": self.hippyTag};
        footstone::value::HippyValue value = OCTypeToDomValue(param);
        std::shared_ptr<footstone::value::HippyValue> domValue = std::make_shared<footstone::value::HippyValue>(value);
        _bridge.batchedBridge.javaScriptExecutor.pScope->UnloadInstance(domValue);
    }
}

@end
