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
#import "HippyAssert.h"
#import "HippyView.h"
#import "UIView+Hippy.h"
#import "NativeRenderDefines.h"
#import "HippyInvalidating.h"
#import "HippyBridge.h"
#import "HippyUIManager.h"
#import "HippyDeviceBaseInfo.h"
#import "HippyTouchHandler.h"
#include <objc/runtime.h>

// Sent when the first subviews are added to the root view
NSString *const HippyContentDidAppearNotification = @"HippyContentDidAppearNotification";

// In hippy2 there are two concepts: common package and business package;
// After the success of the business package loading will send a `SecondaryBundleDidLoad` notification;
// For compatibility, hippy3 retains this notice and its actual meaning.
NSString *const HippySecondaryBundleDidLoadNotification = @"HippySecondaryBundleDidLoadNotification";

NSNumber *AllocRootViewTag(void) {
    static NSString * const token = @"allocateRootTag";
    @synchronized (token) {
        static NSUInteger rootTag = 0;
        return @(rootTag += 10);
    }
}


@interface HippyRootContentView : HippyView <HippyInvalidating>

@property (nonatomic, readonly) BOOL contentHasAppeared;
@property (nonatomic, strong) HippyTouchHandler *touchHandler;
@property (nonatomic, assign) int64_t startTimpStamp;

- (instancetype)initWithFrame:(CGRect)frame
                       bridge:(HippyBridge *)bridge
                     hippyTag:(NSNumber *)hippyTag
               sizeFlexiblity:(HippyRootViewSizeFlexibility)sizeFlexibility NS_DESIGNATED_INITIALIZER;

@end


@interface HippyRootView () {
    BOOL _contentHasAppeared;
}

@property (nonatomic, strong) HippyRootContentView *contentView;
@property (nonatomic, strong) NSDictionary *shareOptions;

@end


@implementation HippyRootView

HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithFrame : (CGRect)frame)
HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithCoder : (NSCoder *)aDecoder)

- (instancetype)initWithBridge:(HippyBridge *)bridge
                    moduleName:(NSString *)moduleName
             initialProperties:(NSDictionary *)initialProperties
                      delegate:(id<HippyRootViewDelegate>)delegate {
    //HippyAssertMainQueue();
    HippyAssert(bridge, @"A bridge instance is required to create an HippyRootView");
    HippyAssert(moduleName, @"A moduleName is required to create an HippyRootView");
    
    if ((self = [super initWithFrame:CGRectZero])) {
        self.backgroundColor = [UIColor clearColor];
        
        _bridge = bridge;
        if (!_bridge.moduleName) {
            _bridge.moduleName = moduleName;
        }
        _moduleName = moduleName;
        _appProperties = [initialProperties copy];
        _delegate = delegate;
        self.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        
        //        [[NSNotificationCenter defaultCenter] addObserver:self
        //                                                 selector:@selector(javaScriptDidLoad:)
        //                                                     name:HippyJavaScriptDidLoadNotification
        //                                                   object:_bridge];
        
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(javaScriptDidFailToLoad:)
                                                     name:HippyJavaScriptDidFailToLoadNotification
                                                   object:nil];
        
        // [_bridge.performanceLogger markStartForTag:HippyPLTTI];
        HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyRootView Init %p", self);
    }
    return self;
}

- (instancetype)initWithBridge:(HippyBridge *)bridge
                   businessURL:(NSURL *)businessURL
                    moduleName:(NSString *)moduleName
             initialProperties:(NSDictionary *)initialProperties
                      delegate:(id<HippyRootViewDelegate>)delegate {
    NSParameterAssert(businessURL);
    
    if (self = [self initWithBridge:bridge
                         moduleName:moduleName
                  initialProperties:initialProperties
                           delegate:delegate]) {
        if (!bridge.isValid) {
            if (delegate && [delegate respondsToSelector:@selector(rootView:didLoadFinish:)]) {
                [delegate rootView:self didLoadFinish:NO];
            }
        } else {
            __weak __typeof(self)weakSelf = self;
            [bridge loadBundleURL:businessURL completion:^(NSURL * _Nullable url, NSError * _Nullable error) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    __strong __typeof(weakSelf)strongSelf = weakSelf;
                    // 抛出业务包(BusinessBundle aka SecondaryBundle)加载完成通知, for hippy2兼容
                    NSMutableDictionary *userInfo = [[NSMutableDictionary alloc] initWithDictionary:@{ @"url": url,
                                                                                                       @"bridge": strongSelf.bridge }];
                    if (error) [userInfo setObject:error forKey:@"error"];
                    [[NSNotificationCenter defaultCenter] postNotificationName:HippySecondaryBundleDidLoadNotification
                                                                        object:strongSelf.bridge userInfo:userInfo];
                    
                    if ([delegate respondsToSelector:@selector(rootView:didLoadFinish:)]) {
                        [delegate rootView:strongSelf didLoadFinish:(error == nil)];
                    }
                });
                if (!error) {
                    [weakSelf runHippyApplication];
                }
            }];
        }
    }
    return self;
}

- (void)dealloc {
    [_contentView invalidate];
    if ([_delegate respondsToSelector:@selector(rootViewWillBePurged:)]) {
        [_delegate rootViewWillBePurged:self];
    }
    [_bridge unloadInstanceForRootView:self.hippyTag];
    HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],HippyRootView dealloc %p", self);
}

- (void)contentViewInvalidated {
    [_contentView removeFromSuperview];
    _contentView = nil;
}


- (void)runHippyApplication {
    // [_bridge.performanceLogger markStartForTag:HippyPLRunApplication];
    
    __weak __typeof(self)weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        __strong __typeof(weakSelf)strongSelf = weakSelf;
        
        [strongSelf.contentView removeFromSuperview];
        // todo: ContentRootView sizeFlexibility feature
        HippyRootContentView *contentView = [[HippyRootContentView alloc] initWithFrame:strongSelf.bounds
                                                                                 bridge:strongSelf.bridge
                                                                               hippyTag:strongSelf.hippyTag
                                                                         sizeFlexiblity:HippyRootViewSizeFlexibilityWidthAndHeight];
        
        // 注册RootView
        [strongSelf.bridge setRootView:contentView];
        [strongSelf.bridge loadInstanceForRootView:strongSelf.hippyTag withProperties:strongSelf.appProperties];
        strongSelf.contentView = contentView;
        [strongSelf insertSubview:contentView atIndex:0];
        HippyLogInfo(@"[Hippy_OC_Log][Life_Circle],Running application %@ (%@)", strongSelf.moduleName, strongSelf.appProperties);
    });
}

- (UIViewController *)hippyViewController {
    return _hippyViewController ?: [super hippyViewController];
}

- (BOOL)canBecomeFirstResponder {
    return YES;
}

- (void)cancelTouches {
    [[_contentView touchHandler] cancelTouch];
}

- (NSNumber *)hippyTag {
    HippyAssertMainQueue();
    if (!super.hippyTag) {
        self.hippyTag = AllocRootViewTag();
    }
    return super.hippyTag;
}

- (void)bridgeDidReload {
    HippyAssertMainQueue();
    // Clear the hippyTag so it can be re-assigned
    self.hippyTag = nil;
}


#pragma mark - Notification Handlers

- (void)javaScriptDidFailToLoad:(NSNotification *)notification {
    HippyBridge *bridge = notification.userInfo[@"bridge"];
    NSError *error = notification.userInfo[@"error"];
    if (bridge == self.bridge && error) {
        NSError *retError = HippyErrorFromErrorAndModuleName(error, self.bridge.moduleName);
        HippyFatal(retError);
    }
}

#pragma mark -

- (void)layoutSubviews {
    [super layoutSubviews];
    _contentView.frame = self.bounds;
}

- (void)setAppProperties:(NSDictionary *)appProperties {
    HippyAssertMainQueue();
    
    if ([_appProperties isEqualToDictionary:appProperties]) {
        return;
    }
    
    _appProperties = [appProperties copy];
    
    if (_bridge.valid) {
        [self runHippyApplication];
    }
}


#pragma mark - App UI State Related

- (void)traitCollectionDidChange:(UITraitCollection *)previousTraitCollection {
    [super traitCollectionDidChange:previousTraitCollection];
    if (@available(iOS 12.0, *)) {
        // on dark mode change
        UIUserInterfaceStyle currentStyle = self.traitCollection.userInterfaceStyle;
        if (currentStyle != previousTraitCollection.userInterfaceStyle) {
            BOOL isNightMode = (UIUserInterfaceStyleDark == currentStyle);
            if (self.bridge.isOSNightMode != isNightMode) {
                [self.bridge setOSNightMode:isNightMode withRootViewTag:self.hippyTag];
            }
        }
    }
}

static NSString *const HippyHostControllerSizeKeyNewSize = @"NewSize";
- (void)onHostControllerTransitionedToSize:(CGSize)size {
    [NSNotificationCenter.defaultCenter postNotificationName:HippyDimensionsShouldUpdateNotification
                                                      object:self
                                                    userInfo:@{HippyHostControllerSizeKeyNewSize : @(size)}];
}

@end



#pragma mark - HippyRootContentView

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
        
        // 添加Hippy自定义手势识别器，用于管理手势事件，并将其发送至js端。
        _touchHandler = [[HippyTouchHandler alloc] initWithRootView:self bridge:bridge];
        [self addGestureRecognizer:_touchHandler];
        
        self.layer.backgroundColor = NULL;
        _startTimpStamp = CACurrentMediaTime() * 1000;
    }
    return self;
}

HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithFrame : (CGRect)frame)
HIPPY_NOT_IMPLEMENTED(-(instancetype)initWithCoder : (nonnull NSCoder *)aDecoder)


- (void)setFrame:(CGRect)frame {
    CGRect originFrame = self.frame;
    if (!CGRectEqualToRect(originFrame, frame)) {
        super.frame = frame;
        if (self.hippyTag && _bridge.isValid) {
            // TODO: check
            // hippy2 使用[_bridge.uiManager setFrame:frame fromOriginFrame:originFrame forView:self];
            // 进行frame更新时的UI重布局及刷新，有待检查hippy3此处架构合理性
            [_bridge resetRootSize:frame.size];
        }
    }
}

- (void)hippySetFrame:(CGRect)frame {
    // Override hippySetFrame，
    // to prevent an endless loop when synchronizing shadowView's frame to view.
    // HippyRootContentView's frame is the source of truth,
    // So we do nothing here.
}

#pragma mark - HippyComponent Method

- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex {
    [super insertHippySubview:subview atIndex:atIndex];
    // [_bridge.performanceLogger markStopForTag:HippyPLTTI];
    
    __weak __typeof(self)weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        __strong __typeof(weakSelf)strongSelf = weakSelf;
        if (strongSelf && !strongSelf->_contentHasAppeared) {
            strongSelf->_contentHasAppeared = YES;
            // int64_t cost = [strongSelf.bridge.performanceLogger durationForTag:HippyPLTTI];
            [[NSNotificationCenter defaultCenter] postNotificationName:HippyContentDidAppearNotification
                                                                object:self userInfo:@{
                // @"cost": @(cost)
            }];
        }
    });
}

- (void)invalidate {
    if (self.userInteractionEnabled) {
        self.userInteractionEnabled = NO;
        [(HippyRootView *)self.superview contentViewInvalidated];
    }
}


@end
