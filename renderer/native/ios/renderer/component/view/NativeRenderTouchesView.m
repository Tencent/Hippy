/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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

#import "NativeRenderTouchesView.h"
#import "UIEvent+TouchResponder.h"
#import "UIView+DomEvent.h"
#import "UIView+MountEvent.h"
#import "UIView+NativeRender.h"
#import "objc/runtime.h"

@interface NativeRenderTouchesView () {
    NSMutableDictionary<NSNumber *, OnTouchEventHandler> *_touchesEvents;
    UITapGestureRecognizer *_tapGestureRecognizer;
    UILongPressGestureRecognizer *_longGestureRecognizer;
    NSTimer *_pressInTimer;
    BOOL _pressInEventEnabled;
}

@end

@implementation NativeRenderTouchesView

#pragma mark Life Cycles
- (instancetype)init {
    self = [super init];
    if (self) {
        [self setDefaultProperties];
    }
    return self;
}

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        [self setDefaultProperties];
    }
    return self;
}

- (instancetype)initWithCoder:(NSCoder *)coder {
    self = [super initWithCoder:coder];
    if (self) {
        [self setDefaultProperties];
    }
    return self;
}

- (void)setDefaultProperties {
    self.backgroundColor = [UIColor clearColor];
}

- (void)didMoveToSuperview {
    [super didMoveToSuperview];
    if (self.superview) {
        [self viewDidMountEvent];
    }
    else {
        [self viewDidUnmoundEvent];
    }
}

#pragma mark Setter & Getter
- (NSMutableDictionary<NSNumber *, OnTouchEventHandler> *)touchesEvents {
    if (!_touchesEvents) {
        _touchesEvents = [NSMutableDictionary dictionaryWithCapacity:4];
    }
    return _touchesEvents;
}

#pragma mark NativeRenderTouchesProtol Implementation
- (void)addViewEvent:(NativeRenderViewEventType)touchEvent eventListener:(OnTouchEventHandler)listener {
    switch (touchEvent) {
        case NativeRenderViewEventTypeTouchStart:
        case NativeRenderViewEventTypeTouchMove:
        case NativeRenderViewEventTypeTouchEnd:
        case NativeRenderViewEventTypeTouchCancel:
            [self setTouchEventListener:listener forEvent:touchEvent];
            break;
        case NativeRenderViewEventTypeClick:
            [self addClickEventListener:listener];
            break;
        case NativeRenderViewEventTypeLongClick:
            [self addLongClickEventListener:listener];
            break;
        case NativeRenderViewEventTypePressIn:
            [self addPressInEventListener:listener];
            break;
        case NativeRenderViewEventTypePressOut:
            [self addPressOutEventListener:listener];
            break;
        default:
            break;
    }
}

- (OnTouchEventHandler)eventListenerForEventType:(NativeRenderViewEventType)eventType {
    return [_touchesEvents objectForKey:@(eventType)];
}

- (void)removeViewEvent:(NativeRenderViewEventType)touchEvent {
    [_touchesEvents removeObjectForKey:@(touchEvent)];
    if (NativeRenderViewEventTypeClick == touchEvent) {
        if (_tapGestureRecognizer) {
            [self removeGestureRecognizer:_tapGestureRecognizer];
            _tapGestureRecognizer = nil;
        }
    }
    else if (NativeRenderViewEventTypeLongClick == touchEvent) {
        if (_longGestureRecognizer) {
            [self removeGestureRecognizer:_longGestureRecognizer];
            _longGestureRecognizer = nil;
        }
    }
    else if (NativeRenderViewEventTypePressIn == touchEvent) {
        if (_pressInEventEnabled) {
            [_pressInTimer invalidate];
            _pressInTimer = nil;
            _pressInEventEnabled = NO;
        }
    }
}

- (void)setPointerEvents:(NativeRenderPointerEvents)pointerEvents {
    _pointerEvents = pointerEvents;
    self.userInteractionEnabled = (pointerEvents != NativeRenderPointerEventsNone);
    if (pointerEvents == NativeRenderPointerEventsBoxNone) {
        self.accessibilityViewIsModal = NO;
    }
}

- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event {
    BOOL canReceiveTouchEvents = ([self isUserInteractionEnabled] && ![self isHidden]);
    if (!canReceiveTouchEvents) {
        return nil;
    }

    // `hitSubview` is the topmost subview which was hit. The hit point can
    // be outside the bounds of `view` (e.g., if -clipsToBounds is NO).
    UIView *hitSubview = nil;
    BOOL isPointInside = [self pointInside:point withEvent:event];
    BOOL needsHitSubview = !(_pointerEvents == NativeRenderPointerEventsNone || _pointerEvents == NativeRenderPointerEventsBoxOnly);
    if (needsHitSubview && (![self clipsToBounds] || isPointInside)) {
        // The default behaviour of UIKit is that if a view does not contain a point,
        // then no subviews will be returned from hit testing, even if they contain
        // the hit point. By doing hit testing directly on the subviews, we bypass
        // the strict containment policy (i.e., UIKit guarantees that every ancestor
        // of the hit view will return YES from -pointInside:withEvent:). See:
        //  - https://developer.apple.com/library/ios/qa/qa2013/qa1812.html
        for (UIView *subview in [self.subviews reverseObjectEnumerator]) {
            CGPoint convertedPoint = [subview convertPoint:point fromView:self];
            hitSubview = [subview hitTest:convertedPoint withEvent:event];
            if (hitSubview != nil) {
                break;
            }
        }
    }

    UIView *hitView = (isPointInside ? self : nil);

    switch (_pointerEvents) {
        case NativeRenderPointerEventsNone:
            return nil;
        case NativeRenderPointerEventsUnspecified:
            return hitSubview ?: hitView;
        case NativeRenderPointerEventsBoxOnly:
            return hitView;
        case NativeRenderPointerEventsBoxNone:
            return hitSubview;
        default:
            HPLogError(@"Invalid pointer-events specified %ld on %@", (long)_pointerEvents, self);
            return hitSubview ?: hitView;
    }
}

#pragma mark Touch Event Listener Add Methods
- (void)setTouchEventListener:(OnTouchEventHandler)eventListener forEvent:(NativeRenderViewEventType)event {
    if (eventListener) {
        [[self touchesEvents] setObject:eventListener forKey:@(event)];
    }
}

- (void)addClickEventListener:(OnTouchEventHandler)eventListener {
    if (_tapGestureRecognizer) {
        return;
    }
    _tapGestureRecognizer = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleClickEvent)];
    _tapGestureRecognizer.cancelsTouchesInView = NO;
    _tapGestureRecognizer.delaysTouchesEnded = NO;
    [self addGestureRecognizer:_tapGestureRecognizer];
    [[self touchesEvents] setObject:eventListener forKey:@(NativeRenderViewEventTypeClick)];
}

- (void)addLongClickEventListener:(OnTouchEventHandler)eventListener {
    if (_longGestureRecognizer) {
        return;
    }
    _longGestureRecognizer = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(handleLongClickEvent)];
    _longGestureRecognizer.cancelsTouchesInView = NO;
    [self addGestureRecognizer:_longGestureRecognizer];
    [[self touchesEvents] setObject:eventListener forKey:@(NativeRenderViewEventTypeLongClick)];
}

- (void)addPressInEventListener:(OnTouchEventHandler)eventListener {
    if (_pressInEventEnabled) {
        return;
    }
    if (_pressInTimer) {
        [_pressInTimer invalidate];
    }
    _pressInEventEnabled = YES;
    [[self touchesEvents] setObject:eventListener forKey:@(NativeRenderViewEventTypePressIn)];
}

- (void)addPressOutEventListener:(OnTouchEventHandler)eventListener {
    [[self touchesEvents] setObject:eventListener forKey:@(NativeRenderViewEventTypePressOut)];
}

#pragma mark Touches Event Handler
- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    if (_pressInEventEnabled) {
        _pressInTimer = [NSTimer scheduledTimerWithTimeInterval:.1f target:self selector:@selector(handlePressInEvent) userInfo:nil repeats:NO];
    }
    if ([self tryToHandleEvent:event forEventType:NativeRenderViewEventTypeTouchStart]) {
        OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypeTouchStart];
        if (listener) {
            UITouch *touch = [touches anyObject];
            UIView *rootView = [self NativeRenderRootView];
            CGPoint point = [touch locationInView:rootView];
            const char *name = viewEventNameFromType(NativeRenderViewEventTypeTouchStart);
            listener(point,
                     [self canCapture:name],
                     [self canBubble:name],
                     [self canBePreventedByInCapturing:name],
                     [self canBePreventInBubbling:name]);
        }
    }
    [super touchesBegan:touches withEvent:event];
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    if (_pressInEventEnabled) {
        [_pressInTimer invalidate];
        _pressInTimer = nil;
    }
    [self handlePressOutEvent];
    if ([self tryToHandleEvent:event forEventType:NativeRenderViewEventTypeTouchEnd]) {
        OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypeTouchEnd];
        if (listener) {
            UITouch *touch = [touches anyObject];
            UIView *rootView = [self NativeRenderRootView];
            CGPoint point = [touch locationInView:rootView];
            const char *name = viewEventNameFromType(NativeRenderViewEventTypeTouchEnd);
            listener(point,
                     [self canCapture:name],
                     [self canBubble:name],
                     [self canBePreventedByInCapturing:name],
                     [self canBePreventInBubbling:name]);
        }
    }
    [super touchesEnded:touches withEvent:event];
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    if ([self tryToHandleEvent:event forEventType:NativeRenderViewEventTypeTouchMove]) {
        OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypeTouchMove];
        if (listener) {
            [self handlePressOutEvent];
            UITouch *touch = [touches anyObject];
            UIView *rootView = [self NativeRenderRootView];
            CGPoint point = [touch locationInView:rootView];
            const char *name = viewEventNameFromType(NativeRenderViewEventTypeTouchMove);
            listener(point,
                     [self canCapture:name],
                     [self canBubble:name],
                     [self canBePreventedByInCapturing:name],
                     [self canBePreventInBubbling:name]);
        }
    }
    [super touchesMoved:touches withEvent:event];
}

- (void)touchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    if (_pressInEventEnabled) {
        [_pressInTimer invalidate];
        _pressInTimer = nil;
    }
    [self handlePressOutEvent];
    if ([self tryToHandleEvent:event forEventType:NativeRenderViewEventTypeTouchCancel]) {
        OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypeTouchCancel];
        if (listener) {
            UITouch *touch = [touches anyObject];
            UIView *rootView = [self NativeRenderRootView];
            CGPoint point = [touch locationInView:rootView];
            const char *name = viewEventNameFromType(NativeRenderViewEventTypeTouchCancel);
            listener(point,
                     [self canCapture:name],
                     [self canBubble:name],
                     [self canBePreventedByInCapturing:name],
                     [self canBePreventInBubbling:name]);
        }
    }
    [super touchesCancelled:touches withEvent:event];
}

- (BOOL)tryToHandleEvent:(UIEvent *)event forEventType:(NativeRenderViewEventType)eventType {
    id responder = [event responderForType:eventType];
    if (self == responder) {
        return YES;
    }
    if (nil == responder) {
        // assume first responder is self
        UIView *responder = nil;
        // find out is there any parent view who can handle `eventType` and `onInterceptTouchEvent` is YES
        UIView *testingView = self;
        while (testingView) {
            OnTouchEventHandler handler = [testingView eventListenerForEventType:eventType];
            if (!responder && handler) {
                responder = testingView;
            }
            BOOL onInterceptTouchEvent = testingView.onInterceptTouchEvent;
            if (handler && onInterceptTouchEvent) {
                responder = testingView;
            }
            testingView = [testingView parentComponent];
        }
        // set first responder for `eventType`
        if (responder) {
            [event setResponder:responder forType:eventType];
        }
        else {
            [event setResponder:[NSNull null] forType:eventType];
        }
        if (responder == self) {
            return YES;
        }
    }
    return NO;
}

- (void)handleClickEvent {
    OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypeClick];
    if (listener) {
        CGPoint point = [_tapGestureRecognizer locationInView:[self NativeRenderRootView]];
        const char *name = viewEventNameFromType(NativeRenderViewEventTypeClick);
        listener(point,
                 [self canCapture:name],
                 [self canBubble:name],
                 [self canBePreventedByInCapturing:name],
                 [self canBePreventInBubbling:name]);
    }
}

- (void)handleLongClickEvent {
    OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypeLongClick];
    if (listener) {
        if (_longGestureRecognizer.state == UIGestureRecognizerStateBegan) {
            CGPoint point = [_longGestureRecognizer locationInView:[self NativeRenderRootView]];
            const char *name = viewEventNameFromType(NativeRenderViewEventTypeLongClick);
            listener(point,
                     [self canCapture:name],
                     [self canBubble:name],
                     [self canBePreventedByInCapturing:name],
                     [self canBePreventInBubbling:name]);
        }
    }
}

- (void)handlePressInEvent {
    [_pressInTimer invalidate];
    _pressInTimer = nil;
    OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypePressIn];
    if (listener) {
        const char *name = viewEventNameFromType(NativeRenderViewEventTypePressIn);
        listener(CGPointZero,
                 [self canCapture:name],
                 [self canBubble:name],
                 [self canBePreventedByInCapturing:name],
                 [self canBePreventInBubbling:name]);
    }
}

- (void)handlePressOutEvent {
    OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypePressOut];
    if (listener) {
        const char *name = viewEventNameFromType(NativeRenderViewEventTypePressOut);
        listener(CGPointZero,
                 [self canCapture:name],
                 [self canBubble:name],
                 [self canBePreventedByInCapturing:name],
                 [self canBePreventInBubbling:name]);
    }
}

- (void)resetAllEvents {
    [_touchesEvents removeAllObjects];
    if (_tapGestureRecognizer) {
        [self removeGestureRecognizer:_tapGestureRecognizer];
    }
    if (_longGestureRecognizer) {
        [self removeGestureRecognizer:_longGestureRecognizer];
    }
    if (_pressInEventEnabled || _pressInTimer) {
        _pressInEventEnabled = NO;
        [_pressInTimer invalidate];
        _pressInTimer = nil;
    }
}

@end
