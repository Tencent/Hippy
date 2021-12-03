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
#import "HippyRootViewInternal.h"

#import <objc/runtime.h>

#import "HippyAssert.h"
#import "HippyBridge.h"
#import "HippyBridge+Private.h"
#import "HippyEventDispatcher.h"
#import "HippyKeyCommands.h"
#import "HippyLog.h"
#import "HippyPerformanceLogger.h"
#import "HippyTouchHandler.h"
#import "HippyUIManager.h"
#import "HippyUtils.h"
#import "HippyView.h"
#import "UIView+Hippy.h"
#import "HippyBridge+Mtt.h"
#import "HippyBundleURLProvider.h"
#import "core/scope.h"

NSString *const HippyContentDidAppearNotification = @"HippyContentDidAppearNotification";

@interface HippyUIManager (HippyRootView)

- (NSNumber *)allocateRootTag;

@end

@interface HippyRootContentView : HippyView <HippyInvalidating>

@property (nonatomic, readonly) BOOL contentHasAppeared;
@property (nonatomic, strong) HippyTouchHandler *touchHandler;
@property (nonatomic, assign) int64_t startTimpStamp;

- (instancetype)initWithFrame:(CGRect)frame
                       bridge:(HippyBridge *)bridge
                     hippyTag:(NSNumber *)hippyTag
               sizeFlexiblity:(HippyRootViewSizeFlexibility)sizeFlexibility NS_DESIGNATED_INITIALIZER;

@end

@interface HippyRootView ()
// MttRN: 增加一个属性用于属性传递
@property (nonatomic, strong) NSDictionary *shareOptions;

@end

@implementation HippyRootView {
    HippyBridge *_bridge;
    NSString *_moduleName;
    HippyRootContentView *_contentView;
}

- (instancetype)initWithBridge:(HippyBridge *)bridge
                    moduleName:(NSString *)moduleName
             initialProperties:(NSDictionary *)initialProperties
                  shareOptions:(NSDictionary *)shareOptions
                      delegate:(id<HippyRootViewDelegate>)delegate {
    HippyAssertMainQueue();
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
        _sizeFlexibility = HippyRootViewSizeFlexibilityNone;
        _shareOptions = shareOptions;
        _delegate = delegate;
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
        HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyRootView Init %p", self);
    }

    return self;
}

- (instancetype)initWithBundleURL:(NSURL *)bundleURL
                       moduleName:(NSString *)moduleName
                initialProperties:(NSDictionary *)initialProperties
                    launchOptions:(NSDictionary *)launchOptions
                     shareOptions:(NSDictionary *)shareOptions
                        debugMode:(BOOL)mode
                         delegate:(id<HippyRootViewDelegate>)delegate

{
    NSMutableDictionary *extendsLaunchOptions = [NSMutableDictionary new];
    [extendsLaunchOptions addEntriesFromDictionary:launchOptions];
    [extendsLaunchOptions setObject:@(mode) forKey:@"DebugMode"];
    HippyBridge *bridge = [[HippyBridge alloc] initWithBundleURL:bundleURL moduleProvider:nil launchOptions:extendsLaunchOptions
                                                     executorKey:moduleName];
    return [self initWithBridge:bridge moduleName:moduleName initialProperties:initialProperties shareOptions:shareOptions delegate:delegate];
}

- (instancetype)initWithBridge:(HippyBridge *)bridge
                   businessURL:(NSURL *)businessURL
                    moduleName:(NSString *)moduleName
             initialProperties:(NSDictionary *)initialProperties
                 launchOptions:(NSDictionary *)launchOptions
                  shareOptions:(NSDictionary *)shareOptions
                     debugMode:(BOOL)mode
                      delegate:(id<HippyRootViewDelegate>)delegate {
    if (mode) {
        NSString *localhost = [HippyBundleURLProvider sharedInstance].localhost ?: @"localhost:38989";
        NSString *bundleStr = [NSString stringWithFormat:@"http://%@%@", localhost, [HippyBundleURLProvider sharedInstance].debugPathUrl];
        NSURL *bundleUrl = [NSURL URLWithString:bundleStr];

        if (self = [self initWithBundleURL:bundleUrl moduleName:moduleName initialProperties:initialProperties launchOptions:launchOptions
                              shareOptions:shareOptions
                                 debugMode:mode
                                  delegate:delegate]) {
        }
        return self;
    } else {
        bridge.batchedBridge.useCommonBridge = YES;
        if (self = [self initWithBridge:bridge moduleName:moduleName initialProperties:initialProperties shareOptions:shareOptions
                               delegate:delegate]) {
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
}

HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithFrame : (CGRect)frame)
HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithCoder : (NSCoder *)aDecoder)

- (void)setBackgroundColor:(UIColor *)backgroundColor {
    super.backgroundColor = backgroundColor;
    _contentView.backgroundColor = backgroundColor;
}

- (UIViewController *)hippyViewController {
    return _hippyViewController ?: [super hippyViewController];
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

- (NSNumber *)hippyTag {
    HippyAssertMainQueue();
    if (!super.hippyTag) {
        /**
         * Every root view that is created must have a unique hippy tag.
         * Numbering of these tags goes from 1, 11, 21, 31, etc
         *
         * NOTE: Since the bridge persists, the RootViews might be reused, so the
         * hippy tag must be re-assigned every time a new UIManager is created.
         */
        self.hippyTag = [_bridge.uiManager allocateRootTag];
    }
    return super.hippyTag;
}

- (void)bridgeDidReload {
    HippyAssertMainQueue();
    // Clear the hippyTag so it can be re-assigned
    self.hippyTag = nil;
}

- (void)javaScriptDidLoad:(NSNotification *)notification {
    HippyAssertMainQueue();

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
        NSError *retError = HippyErrorFromErrorAndModuleName(error, self.bridge.moduleName);
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
        NSError *retError = HippyErrorFromErrorAndModuleName(error, self.bridge.moduleName);
        HippyFatal(retError);
    }
}

- (void)secondayBundleDidFinishLoad:(NSError *)error {
    if (error) {
        NSError *retError = HippyErrorFromErrorAndModuleName(error, self.bridge.moduleName);
        HippyFatal(retError);
    }
}

- (void)bundleFinishedLoading:(HippyBridge *)bridge {
    if (!bridge.valid) {
        return;
    }

    [_contentView removeFromSuperview];
    _contentView = [[HippyRootContentView alloc] initWithFrame:self.bounds bridge:bridge hippyTag:self.hippyTag sizeFlexiblity:_sizeFlexibility];

    if (self.shareOptions) {
        [bridge.shareOptions setObject:self.shareOptions ?: @{} forKey:self.hippyTag];
    }
    
    [self runApplication:bridge];

    _contentView.backgroundColor = self.backgroundColor;
    [self insertSubview:_contentView atIndex:0];

    if (_sizeFlexibility == HippyRootViewSizeFlexibilityNone) {
        self.intrinsicSize = self.bounds.size;
    }
}

- (void)runApplication:(HippyBridge *)bridge {
    if (_contentView == nil) {
        assert(0);  // 这里不正常了，走到这里联系下 pennyli
        return;
    }
    NSString *moduleName = _moduleName ?: @"";
    NSDictionary *appParameters =
        @{ @"rootTag": _contentView.hippyTag, @"initialProps": _appProperties ?: @ {}, @"commonSDKVersion": _HippySDKVersion };

    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],Running application %@ (%@)", moduleName, appParameters);
    [bridge enqueueJSCall:@"AppRegistry" method:@"runApplication" args:@[moduleName, appParameters] completion:NULL];
}

- (void)setSizeFlexibility:(HippyRootViewSizeFlexibility)sizeFlexibility {
    _sizeFlexibility = sizeFlexibility;
    [self setNeedsLayout];
}

- (void)layoutSubviews {
    [super layoutSubviews];
    _contentView.frame = self.bounds;
    _loadingView.center = (CGPoint) { CGRectGetMidX(self.bounds), CGRectGetMidY(self.bounds) };
}

- (void)setAppProperties:(NSDictionary *)appProperties {
    HippyAssertMainQueue();

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
    [_contentView removeFromSuperview];
    _contentView = nil;
    [self showLoadingView];
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
    [_contentView invalidate];
    if ([_delegate respondsToSelector:@selector(rootViewWillBePurged:)]) {
        [_delegate rootViewWillBePurged:self];
    }
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyRootView dealloc %p", self);
}

- (void)cancelTouches {
    [[_contentView touchHandler] cancelTouch];
}

@end

@implementation HippyUIManager (HippyRootView)

- (NSNumber *)allocateRootTag
{
    static NSString * const token = @"allocateRootTag";
    @synchronized (token) {
        static NSUInteger rootTag = 0;
        return @(rootTag += 10);
    }
}

@end

@implementation HippyRootContentView {
    __weak HippyBridge *_bridge;
    UIColor *_backgroundColor;
}

- (instancetype)initWithFrame:(CGRect)frame
                       bridge:(HippyBridge *)bridge
                     hippyTag:(NSNumber *)hippyTag
               sizeFlexiblity:(HippyRootViewSizeFlexibility)sizeFlexibility {
    if ((self = [super initWithFrame:frame])) {
        _bridge = bridge;
        self.hippyTag = hippyTag;

        _touchHandler = [[HippyTouchHandler alloc] initWithRootView:self bridge:bridge];
        [self addGestureRecognizer:_touchHandler];
        [_bridge.uiManager registerRootView:self withSizeFlexibility:sizeFlexibility];
        self.layer.backgroundColor = NULL;
        _startTimpStamp = CACurrentMediaTime() * 1000;
    }
    return self;
}

HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithFrame : (CGRect)frame)
HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithCoder : (nonnull NSCoder *)aDecoder)

- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    [super insertHippySubview:subview atIndex:atIndex];
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
    if (self.hippyTag && _bridge.isValid) {
        [_bridge.uiManager setFrame:frame forView:self];
    }
}

- (void)setBackgroundColor:(UIColor *)backgroundColor {
    _backgroundColor = backgroundColor;
    if (self.hippyTag && _bridge.isValid) {
        [_bridge.uiManager setBackgroundColor:backgroundColor forView:self];
    }
}

- (UIColor *)backgroundColor {
    return _backgroundColor;
}

- (void)invalidate {
    if (self.userInteractionEnabled) {
        self.userInteractionEnabled = NO;
        [(HippyRootView *)self.superview contentViewInvalidated];
        [_bridge enqueueJSCall:@"AppRegistry" method:@"unmountApplicationComponentAtRootTag" args:@[self.hippyTag] completion:NULL];
    }
}

@end
