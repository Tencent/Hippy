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
#import "HippyText.h"
#import "UIView+Private.h"

typedef void(^ViewBlock)(UIView* view, BOOL* stop);

@interface UIView (ViewExtensions)
-(void) RNLoopViewHierarchy:(ViewBlock) block;
-(void) RNLoopSuperViewHierarchy:(ViewBlock) block;
@end

@implementation UIView (ViewExtensions)
-(void) RNLoopViewHierarchy:(ViewBlock) block {
    BOOL stop = NO;
    if (block) {
        block(self, &stop);
    }
    if (!stop) {
        for (UIView* subview in self.subviews) {
            [subview RNLoopViewHierarchy:block];
        }
    }
}
-(void) RNLoopSuperViewHierarchy:(ViewBlock) block {
    BOOL stop = NO;
    if (block) {
        block(self, &stop);
    }
    if (!stop) {
        [self.superview RNLoopSuperViewHierarchy:block];
    }
}
@end


@implementation HippyTouchHandler {
    NSMutableArray <UITouch *> *_moveTouches;
    NSMutableArray <NSDictionary *> *_moveViews;
    
    __weak UIView *_onPressInView;
    __weak UIView *_onClickView;
    __weak UIView *_onLongClickView;
    
    NSTimer * _toucheBeginTimer;
    NSTimer *_touchLongTimer;
    BOOL _bPressIn;
    BOOL _bLongClick;
    
    __weak UIView *_rootView;

    CGPoint _startPoint;
    HippyBridge *_bridge;
    
}

- (instancetype)initWithRootView:(UIView *)view
{
    if (self = [super initWithTarget: nil action: NULL]) {
        _moveTouches = [NSMutableArray new];
        _moveViews = [NSMutableArray new];
        _startPoint = CGPointZero;
        _rootView = view;
        self.delegate = self;
        self.cancelsTouchesInView = NO;
    }
    return self;
}

- (instancetype)initWithRootView:(UIView *)view bridge:(HippyBridge *)bridge
{
    if (self = [self initWithRootView: view]) {
        _bridge = bridge;
    }
    return self;
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event;
{
    [super touchesBegan:touches withEvent:event];
    if ([ _bridge.customTouchHandler respondsToSelector:@selector(customTouchesBegan:withEvent:)]) {
        BOOL shouldRecursive = [_bridge.customTouchHandler customTouchesBegan:touches withEvent:event];
        if(!shouldRecursive) {
            return;
        }
    }
    
    UITouch *touch = [touches anyObject];
    _startPoint = [touch locationInView: touch.view];
    for (UITouch *touch in touches) {
        NSDictionary *result = [self responseViewForAction: @[@"onPressIn", @"onTouchDown", @"onClick", @"onLongClick"] inView: touch.view atPoint:[touch locationInView:touch.view]];
        
        UIView *view = result[@"onTouchDown"][@"view"];
        UIView *clickView = result[@"onClick"][@"view"];
        if (view) {
            NSInteger index = [result[@"onTouchDown"][@"index"] integerValue];
            NSInteger clickIndex = NSNotFound;
            if (clickView) {
                clickIndex = [result[@"onClick"][@"index"] integerValue];
            }
            
            if (clickView == nil || (index <= clickIndex && clickIndex != NSNotFound)) {
                CGPoint point = [touch locationInView: view];
                point = [view convertPoint: point toView: _rootView];
                if (view.onTouchDown) {
                    if ([self checkViewBelongToTouchHandler:view]) {
                        view.onTouchDown(@{@"page_x": @(point.x), @"page_y": @(point.y)});
                    }
                }
            }
        }
        
        if (result[@"onPressIn"][@"view"]) {
            _onPressInView = result[@"onPressIn"][@"view"];
            [self clearTimer];
            _toucheBeginTimer = [NSTimer timerWithTimeInterval: 0.1 target: self selector: @selector(scheduleTimer:) userInfo: nil repeats: NO];
            [[NSRunLoop mainRunLoop] addTimer: _toucheBeginTimer forMode: NSDefaultRunLoopMode];
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

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    [super touchesEnded:touches withEvent:event];
    if ([ _bridge.customTouchHandler respondsToSelector:@selector(customTouchesEnded:withEvent:)]) {
        BOOL shouldRecursive = [_bridge.customTouchHandler customTouchesEnded:touches withEvent:event];
        if(!shouldRecursive) {
            return;
        }
    }
    
    
    for (UITouch *touch in touches) {
        NSDictionary *result = [self responseViewForAction:@[@"onTouchEnd", @"onPressOut", @"onClick"] inView: touch.view atPoint:[touch locationInView:touch.view]];
        
        UIView *view = result[@"onTouchEnd"][@"view"];
        UIView *clickView = result[@"onClick"][@"view"];
        if (view) {
            NSInteger index = [result[@"onTouchEnd"][@"index"] integerValue];
            NSInteger clickIndex = NSNotFound;
            if (clickView) {
                clickIndex = [result[@"onClick"][@"index"] integerValue];
            }
            
            if (clickView == nil || (index <= clickIndex && clickIndex != NSNotFound)) {
                CGPoint point = [touch locationInView: view];
                point = [view convertPoint: point toView: _rootView];
                if (view.onTouchEnd) {
                    if ([self checkViewBelongToTouchHandler:view]) {
                        view.onTouchEnd(@{@"page_x": @(point.x), @"page_y": @(point.y)});
                    }
                }
            }
        } else {
            if (_moveViews.count > 0 && _moveViews[0] && _moveViews[0][@"onTouchMove"]) {
                NSDictionary *bundle = _moveViews[0][@"onTouchMove"];
                if (bundle && bundle[@"view"]) {
                    UIView *theView = bundle[@"view"];
                    CGPoint point = [touch locationInView: theView];
                    point = [theView convertPoint: point toView: _rootView];
                    if (theView.onTouchEnd) {
                        if ([self checkViewBelongToTouchHandler:theView]) {
                            theView.onTouchEnd(@{@"page_x": @(point.x), @"page_y": @(point.y)});
                        }
                    }
                }
            }
        }
        
        if (result[@"onPressOut"][@"view"]) {
            UIView *pressOutView = result[@"onPressOut"][@"view"];
            if (pressOutView == _onPressInView && pressOutView.onPressOut) {
                if ([self checkViewBelongToTouchHandler:pressOutView]) {
                    pressOutView.onPressOut(@{});
                    _onPressInView = nil;
                    _bPressIn = NO;
                }
            }
        }
        
        if (clickView && clickView == _onClickView) {
            if (!_bLongClick && clickView.onClick) {
                if ([self checkViewBelongToTouchHandler:clickView]) {
                    clickView.onClick(@{});
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
}

- (void)touchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    [super touchesCancelled:touches withEvent:event];
    if ([ _bridge.customTouchHandler respondsToSelector:@selector(customTouchesCancelled:withEvent:)]) {
        BOOL shouldRecursive = [_bridge.customTouchHandler customTouchesCancelled:touches withEvent:event];
        if(!shouldRecursive) {
            return;
        }
    }
    
    [_moveViews removeAllObjects];
    [_moveTouches removeAllObjects];
    
    for (UITouch *touch in touches) {
        NSDictionary *result = [self responseViewForAction:@[@"onTouchCancel", @"onPressOut", @"onClick"] inView: touch.view atPoint:[touch locationInView:touch.view]];
        UIView *clickView = result[@"onClick"][@"view"];
        UIView *view = result[@"onTouchCancel"][@"view"];
        if (view) {
            NSInteger index = [result[@"onTouchCancel"][@"index"] integerValue];
            NSInteger clickIndex = NSNotFound;
            if (clickView) {
                clickIndex = [result[@"onClick"][@"index"] integerValue];
            }
            
            if (clickView == nil || (index <= clickIndex && clickIndex != NSNotFound)) {
                CGPoint point = [touch locationInView: view];
                point = [view convertPoint: point toView: _rootView];
                if (view.onTouchCancel) {
                    if ([self checkViewBelongToTouchHandler:view]) {
                        view.onTouchCancel(@{@"page_x": @(point.x), @"page_y": @(point.y)});
                    }
                }
            }
        }
        
        if (result[@"onPressOut"][@"view"]) {
            UIView *pressOutView = result[@"onPressOut"][@"view"];
            if (pressOutView == _onPressInView && pressOutView.onPressOut) {
                if ([self checkViewBelongToTouchHandler:pressOutView]) {
                    pressOutView.onPressOut(@{});
                }
            }
        }
    }
    self.state = UIGestureRecognizerStateCancelled;
    self.enabled = NO;
    self.enabled = YES;
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    [super touchesMoved:touches withEvent:event];
    if ([ _bridge.customTouchHandler respondsToSelector:@selector(customTouchesMoved:withEvent:)]) {
        BOOL shouldRecursive = [_bridge.customTouchHandler customTouchesMoved:touches withEvent:event];
        if(!shouldRecursive) {
            return;
        }
    }
    
    UITouch *touch = [touches anyObject];
    CGPoint point = [touch locationInView: touch.view];
    
    float dis = hypotf(_startPoint.x - point.x, _startPoint.y - point.y);
    if (dis < 1.f) {
        return;
    }
    [self clearTimer];
    _onClickView = nil;
    
    for (UITouch *touch in touches) {
        
        NSInteger index = [_moveTouches indexOfObject: touch];
        NSDictionary *result = nil;
        if (index != NSNotFound) {
            result = _moveViews[index];
        } else {
            NSDictionary *result = [self responseViewForAction:@[@"onTouchMove", @"onPressOut", @"onClick"] inView: touch.view atPoint:[touch locationInView:touch.view]];
            [_moveTouches addObject: touch];
            [_moveViews addObject: result];
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
                    CGPoint point = [touch locationInView: view];
                    point = [view convertPoint: point toView: _rootView];
                    if ([self checkViewBelongToTouchHandler:view]) {
                        view.onTouchMove(@{@"page_x": @(point.x), @"page_y": @(point.y)});
                    }
                }
            }
        }
    }
    self.state = UIGestureRecognizerStateChanged;
}

- (BOOL)checkViewBelongToTouchHandler:(UIView *)view {
    NSNumber *reactTag = [view hippyTag];
    UIView *checkView = [_bridge.uiManager viewForHippyTag:reactTag];
    return checkView == view;
}

- (void)clearTimer
{
    if (_toucheBeginTimer) {
        [_toucheBeginTimer invalidate];
        _toucheBeginTimer = nil;
    }
}

- (void) clearLongClickTimer {
    if (_touchLongTimer) {
        [_touchLongTimer invalidate];
        _touchLongTimer = nil;
    }
}

- (void)scheduleTimer:(__unused NSTimer *)timer
{
    if (!_bPressIn) {
        if (_onPressInView && _onPressInView.onPressIn) {
            if ([self checkViewBelongToTouchHandler:_onPressInView]) {
                _onPressInView.onPressIn(@{});
            }
        }
        _bPressIn = YES;
    }
    
    //    self.state = UIGestureRecognizerStateEnded;
}

- (void) longClickTimer:(__unused NSTimer *)timer {
    if (!_bLongClick) {
        _bLongClick = YES;
        if (_onLongClickView && _onLongClickView.onLongClick) {
            if ([self checkViewBelongToTouchHandler:_onLongClickView]) {
                _onLongClickView.onLongClick(@{});
            }
        }
    }
}

- (UIView *)rootView:(UIView *)view
{
    while (view.superview.hippyTag) {
        view = view.superview;
    }
    return view;
}

- (NSDictionary <NSString *, UIView *> *)responseViewForAction:(NSArray *)actions
                                                        inView:(UIView *)targetView
                                                       atPoint:(CGPoint)point
{
    NSDictionary *result = [self nextResponseViewForAction:actions inView:targetView atPoint:point];
    NSNumber *innerTag = [targetView hippyTagAtPoint:point];
    if (innerTag && ![targetView.hippyTag isEqual:innerTag]) {
        UIView *innerView = [_bridge.uiManager viewForHippyTag:innerTag];
        NSDictionary *innerResult = [self nextResponseViewForAction:actions inView:innerView atPoint:point];
        NSMutableDictionary *mergedResult = [result mutableCopy];
        [mergedResult addEntriesFromDictionary:innerResult];
        return mergedResult;
    }
    return result;
}

- (NSDictionary <NSString *, UIView *> *)nextResponseViewForAction:(NSArray *)actions
                                                            inView:(UIView *)targetView
                                                           atPoint:(CGPoint)point
{
    NSMutableDictionary *result = [NSMutableDictionary new];
    NSMutableArray *findActions = [NSMutableArray arrayWithArray: actions];
    BOOL onInterceptTouchEvent = NO;
    UIView *view = (UIView *)targetView;
    NSInteger index = 0;
    while (view) {
        
        onInterceptTouchEvent = view.onInterceptTouchEvent;
        
        if (onInterceptTouchEvent) {
            findActions = [NSMutableArray arrayWithArray: actions];
            [result removeAllObjects];
        }
        
        if ((onInterceptTouchEvent && findActions.count == 0) || [view isKindOfClass: NSClassFromString(@"HippyRootContentView")]) {
            break ;
        } else {
            if ([findActions containsObject: @"onPressIn"] && view.onPressIn) {
                if (!result[@"onClick"]) {
                    [result setValue: @{@"view": view, @"index": @(index)} forKey: @"onPressIn"];
                }
                [findActions removeObject: @"onPressIn"];
            }
            
            if ([findActions containsObject: @"onPressOut"] && view.onPressOut) {
                [result setValue: @{@"view": view, @"index": @(index)} forKey: @"onPressOut"];
                [findActions removeObject: @"onPressOut"];
            }
            
            if ([findActions containsObject: @"onClick"] && view.onClick) {
                //UIView可以实现这个协议决定是否由本Hander来分发touches事件，实现自定义UIView组件独占touches的处理
                if (![view interceptTouchEvent]) {
                    [result setValue: @{@"view": view, @"index": @(index)} forKey: @"onClick"];
                }
                [findActions removeObject: @"onClick"];
            }
            
            if ([findActions containsObject:@"onLongClick"] && view.onLongClick) {
                [result setValue:@{@"view": view, @"index": @(index)} forKey:@"onLongClick"];
                [findActions removeObject:@"onLongClick"];
            }
            
            if ([findActions containsObject: @"onTouchDown"] && view.onTouchDown) {
                [result setValue: @{@"view": view, @"index": @(index)} forKey: @"onTouchDown"];
                [findActions removeObject: @"onTouchDown"];
            }
            
            if ([findActions containsObject: @"onTouchMove"] && view.onTouchMove) {
                [result setValue: @{@"view": view, @"index": @(index)} forKey: @"onTouchMove"];
                [findActions removeObject: @"onTouchMove"];
            }
            if ([findActions containsObject: @"onTouchCancel"] && view.onTouchCancel) {
                [result setValue: @{@"view": view, @"index": @(index)} forKey: @"onTouchCancel"];
                [findActions removeObject: @"onTouchCancel"];
            }
            
            if ([findActions containsObject: @"onTouchEnd"] && view.onTouchEnd) {
                [result setValue: @{@"view": view, @"index": @(index)} forKey: @"onTouchEnd"];
                [findActions removeObject: @"onTouchEnd"];
            }
            
            if (onInterceptTouchEvent) break;
            view = [view nextResponseViewAtPoint:point];
            index++;
        }
    }
    return result;
}

- (BOOL)gestureRecognizer:(__unused UIGestureRecognizer *)gestureRecognizer shouldReceiveTouch:(UITouch *)touch
{
    if ([self isYYTextView:touch.view]) {
        return NO;
    }
    
    if ([touch.view isKindOfClass: [UIButton class]])
    {
        return NO;
    }
    
    __block BOOL ret = YES;
    
    [touch.view RNLoopSuperViewHierarchy:^(UIView *view, BOOL *stop) {
        
        if ([view conformsToProtocol:@protocol(HippyScrollProtocol)])
        {
            if ([(id<HippyScrollProtocol>)view isManualScrolling])
            {
                ret = NO;
                *stop = YES;
            }
        }
    }];
    
    return ret;
}

- (BOOL)isYYTextView:(UIView*)view{
    Class yyTextViewClass = NSClassFromString(@"YYTextView");
    Class yyTextSelectionView = NSClassFromString(@"YYTextSelectionView");
    Class yyTextContainerView = NSClassFromString(@"YYTextContainerView");
    
    if ([view isKindOfClass:yyTextViewClass] ||
        [view isKindOfClass:yyTextSelectionView] ||
        [view isKindOfClass:yyTextContainerView]) {
        return YES;
    }
    
    return NO;
}

- (void)cancelTouch
{
    if (_onPressInView) {
        _bPressIn = NO;
        if (_onPressInView.onPressOut) {
            if ([self checkViewBelongToTouchHandler:_onPressInView]) {
                _onPressInView.onPressOut(@{});
            }
        }
    }
    _bLongClick = NO;
    [self clearTimer];
    [self clearLongClickTimer];
    self.enabled = NO;
    self.enabled = YES;
}

- (void)reset
{
    if ([ _bridge.customTouchHandler respondsToSelector:@selector(customReset)]) {
        BOOL shouldRecursive = [_bridge.customTouchHandler customReset];
        if(!shouldRecursive) {
            return;
        }
    }
    
    if (_onPressInView) {
        _bPressIn = NO;
        if (_onPressInView.onPressOut) {
            if ([self checkViewBelongToTouchHandler:_onPressInView]) {
                _onPressInView.onPressOut(@{});
            }
        }
    }
    [self clearTimer];
    _bLongClick = NO;
    [self clearLongClickTimer];
    [super reset];
}

- (BOOL)canPreventGestureRecognizer:(__unused UIGestureRecognizer *)preventedGestureRecognizer
{
    return NO;
}

- (BOOL)canBePreventedByGestureRecognizer:(UIGestureRecognizer *)preventingGestureRecognizer
{
    // We fail in favour of other external gesture recognizers.
    // iOS will ask `delegate`'s opinion about this gesture recognizer little bit later.
    if (![preventingGestureRecognizer.view isDescendantOfView:_rootView]) {
        return NO;
    } else {
        return ![preventingGestureRecognizer.view isDescendantOfView:self.view];
    }
}

- (BOOL)gestureRecognizer:(__unused UIGestureRecognizer *)gestureRecognizer shouldRequireFailureOfGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer
{
    // Same condition for `failure of` as for `be prevented by`.
    
    return [self canBePreventedByGestureRecognizer:otherGestureRecognizer];
}

@end

