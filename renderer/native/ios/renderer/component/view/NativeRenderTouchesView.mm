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
#import "objc/runtime.h"
#import "UIView+NativeRender.h"
#import "UIView+MountEvent.h"

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
        }
    }
    else if (NativeRenderViewEventTypeLongClick == touchEvent) {
        if (_longGestureRecognizer) {
            [self removeGestureRecognizer:_longGestureRecognizer];
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

- (BOOL)canBePreventedByInCapturing:(const std::string &)name {
    return NO;
}

- (BOOL)canBePreventInBubbling:(const std::string &)name {
    return NO;
}

#pragma mark Touch Event Listener Add Methods
- (void)setTouchEventListener:(OnTouchEventHandler)eventListener forEvent:(NativeRenderViewEventType)event {
    if (eventListener) {
        [[self touchesEvents] setObject:eventListener forKey:@(event)];
    }
}

- (void)addClickEventListener:(OnTouchEventHandler)eventListener {
    if (_tapGestureRecognizer) {
        [self removeGestureRecognizer:_tapGestureRecognizer];
    }
    _tapGestureRecognizer = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleClickEvent)];
    _tapGestureRecognizer.cancelsTouchesInView = NO;
    _tapGestureRecognizer.delaysTouchesEnded = NO;
    [self addGestureRecognizer:_tapGestureRecognizer];
    [[self touchesEvents] setObject:eventListener forKey:@(NativeRenderViewEventTypeClick)];
}

- (void)addLongClickEventListener:(OnTouchEventHandler)eventListener {
    if (_longGestureRecognizer) {
        [self removeGestureRecognizer:_longGestureRecognizer];
    }
    _longGestureRecognizer = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(handleLongClickEvent)];
    _longGestureRecognizer.cancelsTouchesInView = NO;
    [self addGestureRecognizer:_longGestureRecognizer];
    [[self touchesEvents] setObject:eventListener forKey:@(NativeRenderViewEventTypeLongClick)];
}

- (void)addPressInEventListener:(OnTouchEventHandler)eventListener {
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
    OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypeTouchStart];
    if (listener) {
        UITouch *touch = [touches anyObject];
        CGPoint point = [touch locationInView:[self NativeRenderRootView]];
        listener(point);
    }
    else {
        [super touchesBegan:touches withEvent:event];
    }
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    if (_pressInEventEnabled) {
        [_pressInTimer invalidate];
        _pressInTimer = nil;
    }
    [self handlePressOutEvent];
    OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypeTouchEnd];
    if (listener) {
        UITouch *touch = [touches anyObject];
        CGPoint point = [touch locationInView:[self NativeRenderRootView]];
        listener(point);
    }
    else {
        [super touchesEnded:touches withEvent:event];
    }
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypeTouchMove];
    if (listener) {
        UITouch *touch = [touches anyObject];
        CGPoint point = [touch locationInView:[self NativeRenderRootView]];
        listener(point);
    }
    else {
        [super touchesMoved:touches withEvent:event];
    }

}

- (void)touchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    if (_pressInEventEnabled) {
        [_pressInTimer invalidate];
        _pressInTimer = nil;
    }
    OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypeTouchCancel];
    if (listener) {
        UITouch *touch = [touches anyObject];
        CGPoint point = [touch locationInView:[self NativeRenderRootView]];
        listener(point);
    }
    else {
        [super touchesCancelled:touches withEvent:event];
    }
}

- (void)handleClickEvent {
    OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypeClick];
    if (listener) {
        CGPoint point = [_tapGestureRecognizer locationInView:[self NativeRenderRootView]];
        listener(point);
    }
}

- (void)handleLongClickEvent {
    OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypeLongClick];
    if (listener) {
        if (_longGestureRecognizer.state == UIGestureRecognizerStateBegan) {
            CGPoint point = [_longGestureRecognizer locationInView:[self NativeRenderRootView]];
            listener(point);
        }
    }
}

- (void)handlePressInEvent {
    [_pressInTimer invalidate];
    _pressInTimer = nil;
    OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypePressIn];
    if (listener) {
        listener(CGPointZero);
    }
}

- (void)handlePressOutEvent {
    OnTouchEventHandler listener = [self eventListenerForEventType:NativeRenderViewEventTypePressOut];
    if (listener) {
        listener(CGPointZero);
    }
}

@end
