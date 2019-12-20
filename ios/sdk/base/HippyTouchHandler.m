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
#import "UIView+React.h"
#import "HippyScrollProtocol.h"
#import "HippyUIManager.h"
#import "HippyText.h"

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

//多根手指触碰时，touches可能count>1
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
                view.onTouchDown(@{@"page_x": @(point.x), @"page_y": @(point.y)});
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
                    view.onTouchEnd(@{@"page_x": @(point.x), @"page_y": @(point.y)});
                }
            }
        } else {
            //by rainywan
            //在复杂情境（videoFeeds进度条）下，拖拽进度条touchMoved时，回传的touch对象的绑定view容易丢失（被edgeGesture、panScrollViewGesture等手势干扰）
            //因此加这个备用方案，从moveViews取这个move的缓存
            //暂时只发现touchEnd有这个问题。touchMove也是类似的方案
            //但这要求view拥有onTouchMove属性
            if (_moveViews.count > 0 && _moveViews[0] && _moveViews[0][@"onTouchMove"]) {
                NSDictionary *bundle = _moveViews[0][@"onTouchMove"];
                if (bundle && bundle[@"view"]) {
                    UIView *theView = bundle[@"view"];
                    CGPoint point = [touch locationInView: theView];
                    point = [theView convertPoint: point toView: _rootView];
                    if (theView.onTouchEnd) {
                        theView.onTouchEnd(@{@"page_x": @(point.x), @"page_y": @(point.y)});
                    }
                }
            }
        }
        
        if (result[@"onPressOut"][@"view"]) {
            UIView *pressOutView = result[@"onPressOut"][@"view"];
            if (pressOutView == _onPressInView) {
                pressOutView.onPressOut(@{});
                _onPressInView = nil;
                _bPressIn = NO;

            }
        }
        
        if (clickView && clickView == _onClickView) {
            if (!_bLongClick) {
                clickView.onClick(@{});
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
                view.onTouchCancel(@{@"page_x": @(point.x), @"page_y": @(point.y)});
            }
        }
        
        if (result[@"onPressOut"][@"view"]) {
            UIView *pressOutView = result[@"onPressOut"][@"view"];
            if (pressOutView == _onPressInView) {
                pressOutView.onPressOut(@{});
            }
        }
    }
    self.state = UIGestureRecognizerStateCancelled;
    //按压屏幕边缘滑动触发3d touch之后，feeds可能会进入touchesCancelled方法，但是没有调用reset方法。或者不进入touchesCancelled而直接调用reset
    //下面两种情况都出现过
    //1. touchesBegan->touchesMoved->touchesCancelled(无reset)
    //2. touchesBegan->touchesMoved->reset(直接reset，无touchesCancelled)
    //需要手动禁用再启用手势，否则feeds页面无法滑动
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
            //            UIView *view = touch.view;
            //            if (nil == view) {
            //                CGPoint point = [touch locationInView:[UIApplication sharedApplication].keyWindow];
            //                view = [[[UIApplication sharedApplication] keyWindow] hitTest:point withEvent:event];
            //            }
            //            NSAssert(view, @"如果执行了这个assert，那把上面这句话打开吧");
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
                //view.onTouchMove在视频浮层中会被前端删除，导致崩溃，这里先做个判断
                //点击视频的option按钮，在页面滑动即可重现
                if (view.onTouchMove) {
                    CGPoint point = [touch locationInView: view];
                    point = [view convertPoint: point toView: _rootView];
                    view.onTouchMove(@{@"page_x": @(point.x), @"page_y": @(point.y)});
                }
            }
        }
    }
    self.state = UIGestureRecognizerStateChanged;
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
        if (_onPressInView) {
            _onPressInView.onPressIn(@{});
        }
        _bPressIn = YES;
    }
    
    //    self.state = UIGestureRecognizerStateEnded;
}

- (void) longClickTimer:(__unused NSTimer *)timer {
    if (!_bLongClick) {
        _bLongClick = YES;
        if (_onLongClickView) {
            _onLongClickView.onLongClick(@{});
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
    NSDictionary *result = [self responseViewForAction:actions inView:targetView];
    NSNumber *innerTag = [targetView hippyTagAtPoint:point];
    if (innerTag && ![targetView.hippyTag isEqual:innerTag]) {
        UIView *innerView = [_bridge.uiManager viewForHippyTag:innerTag];
        NSDictionary *innerResult = [self responseViewForAction:actions inView:innerView];
        NSMutableDictionary *mergedResult = [result mutableCopy];
        [mergedResult addEntriesFromDictionary:innerResult];
        return mergedResult;
    }
    return result;
}

- (NSDictionary <NSString *, UIView *> *)responseViewForAction:(NSArray *)actions
                                                        inView:(UIView *)targetView
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
            
            view = (UIView *)view.superview;
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
            _onPressInView.onPressOut(@{});
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
    
    //2. touchesBegan->touchesMoved->reset(直接reset，无touchesCancelled)
    //这种情况下，3d touch会导致cell一直处于选中状态
    if (_onPressInView) {
        _bPressIn = NO;
        if (_onPressInView.onPressOut) {
            _onPressInView.onPressOut(@{});
        }
    }
    //touchBegan之后如果手势rest会导致后面的touchEnded,touchMoved不被调用
    //导致首页feeds页面中某个cell一直处于被点击状态
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

