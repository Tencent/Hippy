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

#import "NativeRenderImageView+NativeRenderTouchesImplementation.h"
#import "UIView+DomEvent.h"
#import "UIView+NativeRender.h"
#import "UIEvent+TouchResponder.h"
#import "objc/runtime.h"

@implementation NativeRenderImageView (NativeRenderTouchesImplementation)

#pragma mark Setter & Getter
- (NSMutableDictionary<NSNumber *, OnTouchEventHandler> *)touchesEvents {
    NSMutableDictionary<NSNumber *, OnTouchEventHandler> *events = objc_getAssociatedObject(self, @selector(touchesEvents));
    if (!events) {
        events = [NSMutableDictionary dictionaryWithCapacity:4];
        objc_setAssociatedObject(self, @selector(touchesEvents), events, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    return events;
}

- (UITapGestureRecognizer *)tapGestureRecognizer {
    UITapGestureRecognizer *tap = objc_getAssociatedObject(self, @selector(tapGestureRecognizer));
    if (!tap) {
        tap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleClickEvent)];
        tap.cancelsTouchesInView = NO;
        tap.delaysTouchesEnded = NO;
        objc_setAssociatedObject(self, @selector(tapGestureRecognizer), tap, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    return tap;
}

- (void)removeTapGestureRecognizerIfExists {
    UITapGestureRecognizer *tap = objc_getAssociatedObject(self, @selector(tapGestureRecognizer));
    if (tap) {
        objc_setAssociatedObject(self, @selector(tapGestureRecognizer), nil, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
        [self removeGestureRecognizer:tap];
    }
}

- (void)removeLongGestureRecognizerIfExists {
    UILongPressGestureRecognizer *longPress = objc_getAssociatedObject(self, @selector(longGestureRecognizer));
    if (longPress) {
        objc_setAssociatedObject(self, @selector(longGestureRecognizer), nil, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
        [self removeGestureRecognizer:longPress];
    }
}

- (UILongPressGestureRecognizer *)longGestureRecognizer {
    UILongPressGestureRecognizer *longPress = objc_getAssociatedObject(self, @selector(longGestureRecognizer));
    if (!longPress) {
        longPress = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(handleLongClickEvent)];
        longPress.cancelsTouchesInView = NO;
        objc_setAssociatedObject(self, @selector(longGestureRecognizer), longPress, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    return longPress;
}

- (void)setPressInEventEnabled:(BOOL)enabled {
    objc_setAssociatedObject(self, @selector(pressInEventEnabled), @(enabled), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (BOOL)pressInEventEnabled {
    NSNumber *enabled = objc_getAssociatedObject(self, @selector(pressInEventEnabled));
    return [enabled boolValue];
}

- (NSTimer *)enablePressInTimer {
    NSTimer *pressInTimer = [NSTimer scheduledTimerWithTimeInterval:.1f target:self selector:@selector(handlePressInEvent) userInfo:nil repeats:NO];
    objc_setAssociatedObject(self, @selector(enablePressInTimer), pressInTimer, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    return pressInTimer;
}

- (void)disablePressInTimer {
    NSTimer *timer = objc_getAssociatedObject(self, @selector(enablePressInTimer));
    [timer invalidate];
    objc_setAssociatedObject(self, @selector(enablePressInTimer), nil, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

#pragma mark NativeRenderTouchesProtol Implementation
- (void)addViewEvent:(NativeRenderViewEventType)touchEvent eventListener:(OnTouchEventHandler)listener {
    self.userInteractionEnabled = YES;
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
    return [[self touchesEvents] objectForKey:@(eventType)];
}

- (void)removeViewEvent:(NativeRenderViewEventType)touchEvent {
    [[self touchesEvents] removeObjectForKey:@(touchEvent)];
    if (NativeRenderViewEventTypeClick == touchEvent) {
        [self removeTapGestureRecognizerIfExists];
    }
    else if (NativeRenderViewEventTypeLongClick == touchEvent) {
        [self removeLongGestureRecognizerIfExists];
    }
    else if (NativeRenderViewEventTypePressIn == touchEvent) {
        if ([self pressInEventEnabled]) {
            [self disablePressInTimer];
            [self setPressInEventEnabled:NO];
        }
    }
}

#pragma mark Touch Event Listener Add Methods
- (void)setTouchEventListener:(OnTouchEventHandler)eventListener forEvent:(NativeRenderViewEventType)event {
    if (eventListener) {
        [[self touchesEvents] setObject:eventListener forKey:@(event)];
    }
}

- (void)addClickEventListener:(OnTouchEventHandler)eventListener {
    [self removeTapGestureRecognizerIfExists];
    UITapGestureRecognizer *tap = [self tapGestureRecognizer];
    [self addGestureRecognizer:tap];
    [[self touchesEvents] setObject:eventListener forKey:@(NativeRenderViewEventTypeClick)];
}

- (void)addLongClickEventListener:(OnTouchEventHandler)eventListener {
    [self removeLongGestureRecognizerIfExists];
    UILongPressGestureRecognizer *longPress = [self longGestureRecognizer];
    [self addGestureRecognizer:longPress];
    [[self touchesEvents] setObject:eventListener forKey:@(NativeRenderViewEventTypeLongClick)];
}

- (void)addPressInEventListener:(OnTouchEventHandler)eventListener {
    [self disablePressInTimer];
    [self setPressInEventEnabled:YES];
    [[self touchesEvents] setObject:eventListener forKey:@(NativeRenderViewEventTypePressIn)];
}

- (void)addPressOutEventListener:(OnTouchEventHandler)eventListener {
    [[self touchesEvents] setObject:eventListener forKey:@(NativeRenderViewEventTypePressOut)];
}

#pragma mark Touches Event Handler
- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    if ([self pressInEventEnabled]) {
        [self enablePressInTimer];
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
    if ([self pressInEventEnabled]) {
        [self disablePressInTimer];
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
    if ([self pressInEventEnabled]) {
        [self disablePressInTimer];
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
        UITapGestureRecognizer *tap = objc_getAssociatedObject(self, @selector(tapGestureRecognizer));
        CGPoint point = [tap locationInView:[self NativeRenderRootView]];
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
        UILongPressGestureRecognizer *longPress = objc_getAssociatedObject(self, @selector(longGestureRecognizer));
        if (longPress.state == UIGestureRecognizerStateBegan) {
            CGPoint point = [longPress locationInView:[self NativeRenderRootView]];
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
    [self disablePressInTimer];
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
    [self removeViewEvent:NativeRenderViewEventTypeTouchStart];
    [self removeViewEvent:NativeRenderViewEventTypeTouchEnd];
    [self removeViewEvent:NativeRenderViewEventTypeTouchMove];
    [self removeViewEvent:NativeRenderViewEventTypeTouchCancel];
    [self removeViewEvent:NativeRenderViewEventTypePressIn];
    [self removeViewEvent:NativeRenderViewEventTypePressOut];
    [self removeViewEvent:NativeRenderViewEventTypeClick];
    [self removeViewEvent:NativeRenderViewEventTypeLongClick];
}

@end
