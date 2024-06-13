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

#import "HippyTouchHandler.h"
#import "UIView+Hippy.h"
#import "HippyScrollProtocol.h"
#import "HippyUIManager.h"

#include "dom/dom_listener.h"

typedef void (^ViewBlock)(UIView *view, BOOL *stop);

@interface UIView (HippyViewExtensions)
- (void)hippyLoopViewHierarchy:(ViewBlock)block;
- (void)hippyLoopSuperViewHierarchy:(ViewBlock)block;
- (UIView *)nextResponseViewAtPoint:(CGPoint)point;
@end

@implementation UIView (HippyViewExtensions)

- (void)hippyLoopViewHierarchy:(ViewBlock)block {
    BOOL stop = NO;
    if (block) {
        block(self, &stop);
    }
    if (!stop) {
        for (UIView *subview in self.subviews) {
            [subview hippyLoopViewHierarchy:block];
        }
    }
}

- (void)hippyLoopSuperViewHierarchy:(ViewBlock)block {
    BOOL stop = NO;
    if (block) {
        block(self, &stop);
    }
    if (!stop) {
        [self.superview hippyLoopSuperViewHierarchy:block];
    }
}

static bool isPointInsideView(UIView *view, CGPoint point) {
    // use presentationLayer to adapt the view with animation
    CALayer *presentationLayer = view.layer.presentationLayer;
    if (presentationLayer) {
        CGPoint layerPoint = [presentationLayer convertPoint:point fromLayer:view.layer];
        return [presentationLayer containsPoint:layerPoint];
    }
    return false;
}

- (UIView *)nextResponseViewAtPoint:(CGPoint)point {
    UIView *superView = [self superview];
    if (superView && self.hippyTag) {
        NSArray<UIView *> *subviews = [superView subviews];
        NSUInteger index = [subviews indexOfObject:self];
        if (0 != index) {
            for (NSInteger i = index - 1; i >= 0; i--) {
                UIView *siblingView = subviews[i];
                CGPoint pointInsiblingView = [self convertPoint:point toView:siblingView];
                BOOL pointInside = isPointInsideView(siblingView, pointInsiblingView);
                if (pointInside) {
                    UIView *hitTestView = [siblingView hitTest:pointInsiblingView withEvent:nil];
                    return hitTestView ? hitTestView : siblingView;
                }
            }
        }
    }
    return superView;
}

@end


@interface HippyTouchHandler ()

/**
 * Indicate if event can be prevented in capturing process
 * @param name event name in std::string type
 * @return YES if event can be prevented in capturing process
 */
- (BOOL)canBePreventedByInCapturing:(const char *)name;

/**
 * Indicate if event can be prevented in bubbling process
 * @param name event name in std::string type
 * @return YES if event can be prevented in bubbling process
 */
- (BOOL)canBePreventInBubbling:(const char *)name;

/**
 * Indicate if event can capture
 * @param name event name
 * @return YES if event can capture
 */
- (BOOL)canCapture:(const char *)name;

/**
 * Indicate if event can bubble
 * @param name event name
 * @return YES if event can bubble
 */
- (BOOL)canBubble:(const char *)name;

@end


@implementation HippyTouchHandler {
    NSMutableArray<UITouch *> *_moveTouches;
    NSMutableArray<NSDictionary *> *_moveViews;

    __weak UIView *_onPressInView;
    __weak UIView *_onClickView;
    __weak UIView *_onLongClickView;

    NSTimer *_toucheBeginTimer;
    NSTimer *_touchLongTimer;
    BOOL _bPressIn;
    BOOL _bLongClick;

    __weak UIView *_rootView;
    NSMutableArray<UIView *> *_touchBeganViews;

    CGPoint _startPoint;
    HippyBridge *_bridge;
    
    NSHashTable<UIView *> *_onInterceptTouchEventView;
    NSHashTable<UIView *> *_onInterceptPullUpEventView;
}

- (instancetype)initWithRootView:(UIView *)view bridge:(HippyBridge *)bridge {
    if (self = [super initWithTarget:nil action:NULL]) {
        _moveTouches = [NSMutableArray new];
        _moveViews = [NSMutableArray new];
        _startPoint = CGPointZero;
        _rootView = view;
        _touchBeganViews = [NSMutableArray new];
        self.delegate = self;
        self.cancelsTouchesInView = NO;
        _onInterceptTouchEventView = [NSHashTable weakObjectsHashTable];
        _onInterceptPullUpEventView = [NSHashTable weakObjectsHashTable];
        
        _bridge = bridge;
    }
    return self;
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    [super touchesBegan:touches withEvent:event];
    if ([_bridge.customTouchHandler respondsToSelector:@selector(customTouchesBegan:withEvent:)]) {
        BOOL shouldRecursive = [_bridge.customTouchHandler customTouchesBegan:touches withEvent:event];
        if (!shouldRecursive) {
            return;
        }
    }

    UITouch *touch = [touches anyObject];
    _startPoint = [touch locationInView:touch.view];
    {
        UIView *touchView = [touch view];
        CGPoint locationPoint = [touch locationInView:touchView];
        touchView = touchView?:[self.view.window hitTest:locationPoint withEvent:event];
        if (touchView) {
            [_touchBeganViews addObject:touchView];
        }
        NSDictionary *result = [self responseViewForAction:@[@"onPressIn", @"onTouchDown", @"onClick", @"onLongClick"] inView:touchView
                                                   atPoint:locationPoint];

        UIView *view = result[@"onTouchDown"][@"view"];
        UIView *clickView = result[@"onClick"][@"view"];
        if (view) {
            NSInteger index = [result[@"onTouchDown"][@"index"] integerValue];
            NSInteger clickIndex = NSNotFound;
            if (clickView) {
                clickIndex = [result[@"onClick"][@"index"] integerValue];
            }

            if (clickView == nil || (index <= clickIndex && clickIndex != NSNotFound)) {
                CGPoint point = [touch locationInView:view];
                point = [view convertPoint:point toView:_rootView];
                if (view.onTouchDown) {
                    if ([self checkViewBelongToTouchHandler:view]) {
                        const char *name = hippy::kTouchStartEvent;
                        [self willSendGestureEvent:@(name) withPagePoint:point toView:view];
                        view.onTouchDown(point,
                                         [self canCapture:name],
                                         [self canBubble:name],
                                         [self canBePreventedByInCapturing:name],
                                         [self canBePreventInBubbling:name]);
                    }
                }
            }
        }

        if (result[@"onPressIn"][@"view"]) {
            _onPressInView = result[@"onPressIn"][@"view"];
            [self clearTimer];
            _toucheBeginTimer = [NSTimer timerWithTimeInterval:0.1 target:self selector:@selector(scheduleTimer:) userInfo:nil repeats:NO];
            [[NSRunLoop mainRunLoop] addTimer:_toucheBeginTimer forMode:NSDefaultRunLoopMode];
        }

        _onClickView = clickView;

        if (result[@"onLongClick"][@"view"]) {
            _onLongClickView = result[@"onLongClick"][@"view"];
            [self clearLongClickTimer];
            _touchLongTimer = [NSTimer timerWithTimeInterval:.6f target:self selector:@selector(longClickTimer:) userInfo:nil repeats:NO];
            [[NSRunLoop mainRunLoop] addTimer:_touchLongTimer forMode:NSDefaultRunLoopMode];
        }
    }

    if (self.state == UIGestureRecognizerStatePossible) {
        self.state = UIGestureRecognizerStateBegan;
    } else if (self.state == UIGestureRecognizerStateBegan) {
        self.state = UIGestureRecognizerStateChanged;
    }
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    [super touchesEnded:touches withEvent:event];
    if ([_bridge.customTouchHandler respondsToSelector:@selector(customTouchesEnded:withEvent:)]) {
        BOOL shouldRecursive = [_bridge.customTouchHandler customTouchesEnded:touches withEvent:event];
        if (!shouldRecursive) {
            return;
        }
    }

    UITouch *touch = [touches anyObject];
    for (UIView *beganView in _touchBeganViews) {
        // The touch processing logic here does not apply to multi-fingered scenarios,
        // and needs to be further improved in the future.
        UIView *touchView = beganView;
        CGPoint locationPoint = [touch locationInView:touchView];
        touchView = touchView?:[self.view.window hitTest:locationPoint withEvent:event];
        NSDictionary *result = [self responseViewForAction:@[@"onTouchEnd", @"onPressOut", @"onClick"] inView:touchView
                                                   atPoint:locationPoint];

        UIView *view = result[@"onTouchEnd"][@"view"];
        UIView *clickView = result[@"onClick"][@"view"];
        if (view) {
            NSInteger index = [result[@"onTouchEnd"][@"index"] integerValue];
            NSInteger clickIndex = NSNotFound;
            if (clickView) {
                clickIndex = [result[@"onClick"][@"index"] integerValue];
            }

            if (clickView == nil || (index <= clickIndex && clickIndex != NSNotFound)) {
                CGPoint point = [touch locationInView:view];
                point = [view convertPoint:point toView:_rootView];
                if (view.onTouchEnd) {
                    if ([self checkViewBelongToTouchHandler:view]) {
                        const char *name = hippy::kTouchEndEvent;
                        [self willSendGestureEvent:@(name) withPagePoint:point toView:view];
                        view.onTouchEnd(point,
                                        [self canCapture:name],
                                        [self canBubble:name],
                                        [self canBePreventedByInCapturing:name],
                                        [self canBePreventInBubbling:name]);
                    }
                }
            }
        } else {
            if (_moveViews.count > 0 && _moveViews[0] && _moveViews[0][@"onTouchMove"]) {
                NSDictionary *bundle = _moveViews[0][@"onTouchMove"];
                if (bundle && bundle[@"view"]) {
                    UIView *theView = bundle[@"view"];
                    CGPoint point = [touch locationInView:theView];
                    point = [theView convertPoint:point toView:_rootView];
                    if (theView.onTouchEnd) {
                        if ([self checkViewBelongToTouchHandler:theView]) {
                            const char *name = hippy::kTouchEndEvent;
                            [self willSendGestureEvent:@(name) withPagePoint:point toView:theView];
                            theView.onTouchEnd(point,
                                               [self canCapture:name],
                                               [self canBubble:name],
                                               [self canBePreventedByInCapturing:name],
                                               [self canBePreventInBubbling:name]);
                        }
                    }
                }
            }
        }

        if (result[@"onPressOut"][@"view"]) {
            UIView *pressOutView = result[@"onPressOut"][@"view"];
            if (pressOutView == _onPressInView && pressOutView.onPressOut) {
                if ([self checkViewBelongToTouchHandler:pressOutView]) {
                    const char *name = hippy::kPressOut;
                    [self willSendGestureEvent:@(name) withPagePoint:CGPointZero toView:pressOutView];
                    pressOutView.onPressOut(CGPointZero,
                                            [self canCapture:name],
                                            [self canBubble:name],
                                            [self canBePreventedByInCapturing:name],
                                            [self canBePreventInBubbling:name]);
                    _onPressInView = nil;
                    _bPressIn = NO;
                }
            }
        }

        if (clickView && clickView == _onClickView) {
            if (!_bLongClick && clickView.onClick) {
                if ([self checkViewBelongToTouchHandler:clickView]) {
                    const char *name = hippy::kClickEvent;
                    [self willSendGestureEvent:@(name) withPagePoint:CGPointZero toView:clickView];
                    clickView.onClick(CGPointZero,
                                      [self canCapture:name],
                                      [self canBubble:name],
                                      [self canBePreventedByInCapturing:name],
                                      [self canBePreventInBubbling:name]);
                }
            }
            [self clearTimer];
            [self clearLongClickTimer];
            _bPressIn = NO;
        }
    }

    self.state = UIGestureRecognizerStateEnded;
    [_moveViews removeAllObjects];
    [_moveTouches removeAllObjects];
    [_touchBeganViews removeAllObjects];
    [_onInterceptTouchEventView removeAllObjects];
    [_onInterceptPullUpEventView removeAllObjects];
}

- (void)touchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    [super touchesCancelled:touches withEvent:event];
    if ([_bridge.customTouchHandler respondsToSelector:@selector(customTouchesCancelled:withEvent:)]) {
        BOOL shouldRecursive = [_bridge.customTouchHandler customTouchesCancelled:touches withEvent:event];
        if (!shouldRecursive) {
            return;
        }
    }

    [_moveViews removeAllObjects];
    [_moveTouches removeAllObjects];
    
    UITouch *touch = [touches anyObject];
    for (UIView *beganView in _touchBeganViews) {
        // The touch processing logic here does not apply to multi-fingered scenarios,
        // and needs to be further improved in the future.
        UIView *touchView = beganView;
        CGPoint locationPoint = [touch locationInView:touchView];
        touchView = touchView?:[self.view.window hitTest:locationPoint withEvent:event];
        NSDictionary *result = [self responseViewForAction:@[@"onTouchCancel", @"onPressOut", @"onClick"] inView:touchView
                                                   atPoint:locationPoint];
        UIView *clickView = result[@"onClick"][@"view"];
        UIView *view = result[@"onTouchCancel"][@"view"];
        if (view) {
            NSInteger index = [result[@"onTouchCancel"][@"index"] integerValue];
            NSInteger clickIndex = NSNotFound;
            if (clickView) {
                clickIndex = [result[@"onClick"][@"index"] integerValue];
            }

            if (clickView == nil || (index <= clickIndex && clickIndex != NSNotFound)) {
                CGPoint point = [touch locationInView:view];
                point = [view convertPoint:point toView:_rootView];
                if (view.onTouchCancel) {
                    if ([self checkViewBelongToTouchHandler:view]) {
                        const char *name = hippy::kTouchCancelEvent;
                        [self willSendGestureEvent:@(name) withPagePoint:point toView:view];
                        view.onTouchCancel(point,
                                           [self canCapture:name],
                                           [self canBubble:name],
                                           [self canBePreventedByInCapturing:name],
                                           [self canBePreventInBubbling:name]);
                    }
                }
            }
        }

        if (result[@"onPressOut"][@"view"]) {
            UIView *pressOutView = result[@"onPressOut"][@"view"];
            if (pressOutView == _onPressInView && pressOutView.onPressOut) {
                if ([self checkViewBelongToTouchHandler:pressOutView]) {
                    const char *name = hippy::kPressOut;
                    [self willSendGestureEvent:@(name) withPagePoint:CGPointZero toView:pressOutView];
                    pressOutView.onPressOut(CGPointZero,
                                            [self canCapture:name],
                                            [self canBubble:name],
                                            [self canBePreventedByInCapturing:name],
                                            [self canBePreventInBubbling:name]);
                }
            }
        }
    }
    self.state = UIGestureRecognizerStateCancelled;
    self.enabled = NO;
    self.enabled = YES;
    [_touchBeganViews removeAllObjects];
    [_onInterceptTouchEventView removeAllObjects];
    [_onInterceptPullUpEventView removeAllObjects];
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    [super touchesMoved:touches withEvent:event];
    if ([_bridge.customTouchHandler respondsToSelector:@selector(customTouchesMoved:withEvent:)]) {
        BOOL shouldRecursive = [_bridge.customTouchHandler customTouchesMoved:touches withEvent:event];
        if (!shouldRecursive) {
            return;
        }
    }

    UITouch *touch = [touches anyObject];
    CGPoint point = [touch locationInView:touch.view];

    float dis = hypotf(_startPoint.x - point.x, _startPoint.y - point.y);
    if (dis < 1.f) {
        return;
    }
    [self clearTimer];
    _onClickView = nil;

    {
        NSInteger index = [_moveTouches indexOfObject:touch];
        NSDictionary *result = nil;
        if (index != NSNotFound) {
            result = _moveViews[index];
        } else {
            // The touch processing logic here does not apply to multi-fingered scenarios,
            // and needs to be further improved in the future.
            // To keep things simple and to be compatible with the historical logic,
            // we only use the first view clicked as a touchView
            UIView *touchView = [touch view] ?: _touchBeganViews.firstObject;
            CGPoint locationPoint = [touch locationInView:touchView];
            touchView = touchView?:[self.view.window hitTest:locationPoint withEvent:event];
            NSDictionary *result = [self responseViewForAction:@[@"onTouchMove", @"onPressOut", @"onClick"] inView:touchView
                                                       atPoint:locationPoint];
            [_moveTouches addObject:touch];
            [_moveViews addObject:result];
        }

        if (_bPressIn) {
            if (result[@"onLongClick"][@"view"]) {
                _bLongClick = NO;
                [self clearLongClickTimer];
            }
        }

        UIView *clickView = result[@"onClick"][@"view"];
        UIView *view = result[@"onTouchMove"][@"view"];
        if (view) {
            NSInteger index = [result[@"onTouchMove"][@"index"] integerValue];
            NSInteger clickIndex = NSNotFound;
            if (clickView) {
                clickIndex = [result[@"onClick"][@"index"] integerValue];
            }

            if (clickView == nil || (index <= clickIndex && clickIndex != NSNotFound)) {
                if (view.onTouchMove) {
                    CGPoint point = [touch locationInView:view];
                    point = [view convertPoint:point toView:_rootView];
                    if ([self checkViewBelongToTouchHandler:view]) {
                        const char *name = hippy::kTouchMoveEvent;
                        [self willSendGestureEvent:@(name) withPagePoint:point toView:view];
                        view.onTouchMove(point,
                                         [self canCapture:name],
                                         [self canBubble:name],
                                         [self canBePreventedByInCapturing:name],
                                         [self canBePreventInBubbling:name]);
                    }
                }
            }
        }
    }
    self.state = UIGestureRecognizerStateChanged;
}

- (BOOL)checkViewBelongToTouchHandler:(UIView *)view {
    NSNumber *reactTag = [view hippyTag];
    UIView *checkView = [_bridge.uiManager viewForHippyTag:reactTag onRootTag:view.rootTag];
    if (!checkView) {
        NSNumber *viewRootTag = [view rootTag];
        NSNumber *rootViewTag = [_rootView hippyTag];
        if (rootViewTag) {
            return [viewRootTag isEqualToNumber:rootViewTag];
        }
    }
    return checkView == view;
}

- (void)clearTimer {
    if (_toucheBeginTimer) {
        [_toucheBeginTimer invalidate];
        _toucheBeginTimer = nil;
    }
}

- (void)clearLongClickTimer {
    if (_touchLongTimer) {
        [_touchLongTimer invalidate];
        _touchLongTimer = nil;
    }
}

- (void)scheduleTimer:(__unused NSTimer *)timer {
    if (!_bPressIn) {
        if (_onPressInView && _onPressInView.onPressIn) {
            if ([self checkViewBelongToTouchHandler:_onPressInView]) {
                const char *name = hippy::kPressIn;
                [self willSendGestureEvent:@(name) withPagePoint:CGPointZero toView:_onPressInView];
                _onPressInView.onPressIn(CGPointZero,
                                         [self canCapture:name],
                                         [self canBubble:name],
                                         [self canBePreventedByInCapturing:name],
                                         [self canBePreventInBubbling:name]);
            }
        }
        _bPressIn = YES;
    }
}

- (void)longClickTimer:(__unused NSTimer *)timer {
    if (!_bLongClick) {
        _bLongClick = YES;
        if (_onLongClickView && _onLongClickView.onLongClick) {
            if ([self checkViewBelongToTouchHandler:_onLongClickView]) {
                const char *name = hippy::kLongClickEvent;
                [self willSendGestureEvent:@(name) withPagePoint:CGPointZero toView:_onLongClickView];
                _onLongClickView.onLongClick(CGPointZero,
                                             [self canCapture:name],
                                             [self canBubble:name],
                                             [self canBePreventedByInCapturing:name],
                                             [self canBePreventInBubbling:name]);
            }
        }
    }
}

- (UIView *)rootView:(UIView *)view {
    while (view.superview.hippyTag) {
        view = view.superview;
    }
    return view;
}

- (NSDictionary<NSString *, UIView *> *)responseViewForAction:(NSArray *)actions inView:(UIView *)targetView atPoint:(CGPoint)point {
    NSDictionary *result = [self nextResponseViewForAction:actions inView:targetView atPoint:point];
    NSNumber *innerTag = [targetView hippyTagAtPoint:point];
    if (innerTag && ![targetView.hippyTag isEqual:innerTag]) {
        UIView *innerView = [_bridge.uiManager viewForHippyTag:innerTag onRootTag:targetView.rootTag];
        NSDictionary *innerResult = [self nextResponseViewForAction:actions inView:innerView atPoint:point];
        NSMutableDictionary *mergedResult = [result mutableCopy];
        [mergedResult addEntriesFromDictionary:innerResult];
        return mergedResult;
    }
    return result;
}

- (NSDictionary<NSString *, UIView *> *)nextResponseViewForAction:(NSArray *)actions inView:(UIView *)targetView atPoint:(CGPoint)point {
    NSMutableDictionary *result = [NSMutableDictionary new];
    NSMutableArray *findActions = [NSMutableArray arrayWithArray:actions];
    UIView *view = (UIView *)targetView;
    NSInteger index = 0;
    while (view) {
        BOOL onInterceptTouchEvent = view.onInterceptTouchEvent;
        BOOL onInterceptPullUpEvent = view.onInterceptPullUpEvent;
        if (onInterceptTouchEvent) {
            findActions = [NSMutableArray arrayWithArray:actions];
            [result removeAllObjects];
            [_onInterceptTouchEventView addObject:view];
        }
        
        if (onInterceptPullUpEvent) {
            if (point.y < _startPoint.y) {
                findActions = [NSMutableArray arrayWithArray:actions];
                [result removeAllObjects];
                [_onInterceptPullUpEventView addObject:view];
            }
        }
        BOOL touchInterceptEvent = onInterceptTouchEvent || onInterceptPullUpEvent;

        if ((touchInterceptEvent && findActions.count == 0) || [view isKindOfClass:NSClassFromString(@"HippyRootContentView")]) {
            break;
        } else {
            if ([findActions containsObject:@"onPressIn"] && view.onPressIn) {
                if (!result[@"onClick"]) {
                    [result setValue:@{ @"view": view, @"index": @(index) } forKey:@"onPressIn"];
                }
                [findActions removeObject:@"onPressIn"];
            }

            if ([findActions containsObject:@"onPressOut"] && view.onPressOut) {
                [result setValue:@{ @"view": view, @"index": @(index) } forKey:@"onPressOut"];
                [findActions removeObject:@"onPressOut"];
            }

            if ([findActions containsObject:@"onClick"] && view.onClick) {
                [result setValue:@{ @"view": view, @"index": @(index) } forKey:@"onClick"];
                [findActions removeObject:@"onClick"];
            }

            if ([findActions containsObject:@"onLongClick"] && view.onLongClick) {
                [result setValue:@{ @"view": view, @"index": @(index) } forKey:@"onLongClick"];
                [findActions removeObject:@"onLongClick"];
            }

            if ([findActions containsObject:@"onTouchDown"] && view.onTouchDown) {
                [result setValue:@{ @"view": view, @"index": @(index) } forKey:@"onTouchDown"];
                [findActions removeObject:@"onTouchDown"];
            }

            if ([findActions containsObject:@"onTouchMove"] && view.onTouchMove) {
                [result setValue:@{ @"view": view, @"index": @(index) } forKey:@"onTouchMove"];
                [findActions removeObject:@"onTouchMove"];
            }
            if ([findActions containsObject:@"onTouchCancel"] && view.onTouchCancel) {
                [result setValue:@{ @"view": view, @"index": @(index) } forKey:@"onTouchCancel"];
                [findActions removeObject:@"onTouchCancel"];
            }

            if ([findActions containsObject:@"onTouchEnd"] && view.onTouchEnd) {
                [result setValue:@{ @"view": view, @"index": @(index) } forKey:@"onTouchEnd"];
                [findActions removeObject:@"onTouchEnd"];
            }

            if (touchInterceptEvent)
                break;
            view = [view nextResponseViewAtPoint:point];
            index++;
        }
    }
    return result;
}

- (BOOL)gestureRecognizer:(__unused UIGestureRecognizer *)gestureRecognizer shouldReceiveTouch:(UITouch *)touch {
    UIView *touchView = [touch view];
    while (touchView && ![touchView hippyTag]) {
        NSArray<UIGestureRecognizer *> *touchGestureRegs = [touchView gestureRecognizers];
        for (UIGestureRecognizer *touchGes in touchGestureRegs) {
            if (![self canPreventGestureRecognizer:touchGes]) {
                return NO;
            }
        }
        touchView = [touchView superview];
    }
    if ([self isYYTextView:touch.view]) {
        return NO;
    }

    if ([touch.view isKindOfClass:[UIButton class]]) {
        return NO;
    }

    __block BOOL ret = YES;

    [touch.view hippyLoopSuperViewHierarchy:^(UIView *view, BOOL *stop) {
        if ([view conformsToProtocol:@protocol(HippyScrollProtocol)]) {
            if ([(id<HippyScrollProtocol>)view isManualScrolling]) {
                ret = NO;
                *stop = YES;
            }
        }
    }];

    return ret;
}

- (BOOL)isYYTextView:(UIView *)view {
    Class yyTextViewClass = NSClassFromString(@"YYTextView");
    Class yyTextSelectionView = NSClassFromString(@"YYTextSelectionView");
    Class yyTextContainerView = NSClassFromString(@"YYTextContainerView");

    if ([view isKindOfClass:yyTextViewClass] || [view isKindOfClass:yyTextSelectionView] || [view isKindOfClass:yyTextContainerView]) {
        return YES;
    }

    return NO;
}

- (void)cancelTouch {
    if (_onPressInView) {
        _bPressIn = NO;
        if (_onPressInView.onPressOut) {
            if ([self checkViewBelongToTouchHandler:_onPressInView]) {
                const char *name = hippy::kPressOut;
                [self willSendGestureEvent:@(name) withPagePoint:CGPointZero toView:_onPressInView];
                _onPressInView.onPressOut(CGPointZero,
                                          [self canCapture:name],
                                          [self canBubble:name],
                                          [self canBePreventedByInCapturing:name],
                                          [self canBePreventInBubbling:name]);
            }
        }
    }
    _bLongClick = NO;
    [self clearTimer];
    [self clearLongClickTimer];
    self.enabled = NO;
    self.enabled = YES;
}

- (void)reset {
    if ([_bridge.customTouchHandler respondsToSelector:@selector(customReset)]) {
        BOOL shouldRecursive = [_bridge.customTouchHandler customReset];
        if (!shouldRecursive) {
            return;
        }
    }

    if (_onPressInView) {
        _bPressIn = NO;
        if (_onPressInView.onPressOut) {
            if ([self checkViewBelongToTouchHandler:_onPressInView]) {
                const char *name = hippy::kPressOut;
                [self willSendGestureEvent:@(name) withPagePoint:CGPointZero toView:_onPressInView];
                _onPressInView.onPressOut(CGPointZero,
                                          [self canCapture:name],
                                          [self canBubble:name],
                                          [self canBePreventedByInCapturing:name],
                                          [self canBePreventInBubbling:name]);
            }
        }
    }
    
    // Final cleanup to prevent abnormal situations where the touch began/end/cancel mismatch
    if (_touchBeganViews.count != 0) {
        [_touchBeganViews removeAllObjects];
        [_moveViews removeAllObjects];
        [_moveTouches removeAllObjects];
    }
    
    [self clearTimer];
    _bLongClick = NO;
    [self clearLongClickTimer];
    [super reset];
}

- (BOOL)canPreventGestureRecognizer:(__unused UIGestureRecognizer *)preventedGestureRecognizer {
    UIView *gestureView = [preventedGestureRecognizer view];
    for (UIView *view in _onInterceptTouchEventView) {
        if ([gestureView isDescendantOfView:view] && gestureView != view && ![gestureView hippyTag]) {
            return YES;
        }
    }
    for (UIView *view in _onInterceptPullUpEventView) {
        if ([gestureView isDescendantOfView:view] && gestureView != view && ![gestureView hippyTag]) {
            return YES;
        }
    }
    if ([preventedGestureRecognizer isKindOfClass:[self class]]) {
        UIView *currentHandlerView = [self view];
        BOOL canPreventGestureRecognizer = [currentHandlerView isDescendantOfView:gestureView];
        return canPreventGestureRecognizer;
    }
    return NO;
}

- (BOOL)canBePreventedByGestureRecognizer:(UIGestureRecognizer *)preventingGestureRecognizer {
    // We fail in favour of other external gesture recognizers.
    // iOS will ask `delegate`'s opinion about this gesture recognizer little bit later.
    if (![preventingGestureRecognizer.view isDescendantOfView:_rootView]) {
        return NO;
    }
    else if ([preventingGestureRecognizer isKindOfClass:[self class]]) {
        UIView *currentHandlerView = [self view];
        UIView *gestureView = [preventingGestureRecognizer view];
        BOOL canPreventGestureRecognizer = [currentHandlerView isDescendantOfView:gestureView];
        return !canPreventGestureRecognizer;
    }
    else {
        return ![preventingGestureRecognizer.view isDescendantOfView:self.view];
    }
}

- (BOOL)gestureRecognizer:(__unused UIGestureRecognizer *)gestureRecognizer
    shouldRequireFailureOfGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer {
    // Same condition for `failure of` as for `be prevented by`.

    return [self canBePreventedByGestureRecognizer:otherGestureRecognizer];
}


#pragma mark - Event Helper Methods

static BOOL IsGestureEvent(const char *name) {
    if (!name) {
        return NO;
    }
    if (0 == strcmp(name, hippy::kClickEvent) ||
        0 == strcmp(name, hippy::kLongClickEvent) ||
        0 == strcmp(name, hippy::kPressIn) ||
        0 == strcmp(name, hippy::kPressOut) ||
        0 == strcmp(name, hippy::kTouchStartEvent) ||
        0 == strcmp(name, hippy::kTouchEndEvent) ||
        0 == strcmp(name, hippy::kTouchMoveEvent) ||
        0 == strcmp(name, hippy::kTouchCancelEvent)) {
        return YES;
    }
    return NO;
}

- (BOOL)canCapture:(const char *)name {
    if (!name) {
        return YES;
    }
    return IsGestureEvent(name);
}

- (BOOL)canBubble:(const char *)name {
    if (!name) {
        return YES;
    }
    return IsGestureEvent(name);
}

- (BOOL)canBePreventedByInCapturing:(const char *)name {
    return NO;
}

- (BOOL)canBePreventInBubbling:(const char *)name {
    return NO;
}


#pragma mark - HippyTouchEventInterceptorProtocol

- (void)willSendGestureEvent:(NSString *)eventName withPagePoint:(CGPoint)point toView:(UIView *)view {
    if ([_bridge.delegate respondsToSelector:@selector(willSendGestureEvent:withPagePoint:toView:)]) {
        [_bridge.delegate willSendGestureEvent:eventName withPagePoint:point toView:view];
    }
}


@end

