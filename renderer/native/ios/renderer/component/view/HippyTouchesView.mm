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

#import "HippyTouchesView.h"
#import "objc/runtime.h"
#import "UIView+Hippy.h"
#import "UIView+MountEvent.h"

@interface HippyTouchesView () {
    NSMutableDictionary<NSNumber *, OnTouchEventHandler> *_touchesEvents;
    UITapGestureRecognizer *_tapGestureRecognizer;
    UILongPressGestureRecognizer *_longGestureRecognizer;
    NSTimer *_pressInTimer;
    BOOL _pressInEventEnabled;
}

@end

@implementation HippyTouchesView

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

#pragma mark HippyTouchesProtol Implementation
- (void)addViewEvent:(HippyViewEventType)touchEvent eventListener:(OnTouchEventHandler)listener {
    switch (touchEvent) {
        case HippyViewEventTypeTouchStart:
        case HippyViewEventTypeTouchMove:
        case HippyViewEventTypeTouchEnd:
        case HippyViewEventTypeTouchCancel:
            [self setTouchEventListener:listener forEvent:touchEvent];
            break;
        case HippyViewEventTypeClick:
            [self addClickEventListener:listener];
            break;
        case HippyViewEventTypeLongClick:
            [self addLongClickEventListener:listener];
            break;
        case HippyViewEventTypePressIn:
            [self addPressInEventListener:listener];
            break;
        case HippyViewEventTypePressOut:
            [self addPressOutEventListener:listener];
            break;
        default:
            break;
    }
}

- (OnTouchEventHandler)eventListenerForEventType:(HippyViewEventType)eventType {
    return [_touchesEvents objectForKey:@(eventType)];
}

- (void)removeViewEvent:(HippyViewEventType)touchEvent {
    [_touchesEvents removeObjectForKey:@(touchEvent)];
    if (HippyViewEventTypeClick == touchEvent) {
        if (_tapGestureRecognizer) {
            [self removeGestureRecognizer:_tapGestureRecognizer];
        }
    }
    else if (HippyViewEventTypeLongClick == touchEvent) {
        if (_longGestureRecognizer) {
            [self removeGestureRecognizer:_longGestureRecognizer];
        }
    }
    else if (HippyViewEventTypePressIn == touchEvent) {
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
- (void)setTouchEventListener:(OnTouchEventHandler)eventListener forEvent:(HippyViewEventType)event {
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
    [[self touchesEvents] setObject:eventListener forKey:@(HippyViewEventTypeClick)];
}

- (void)addLongClickEventListener:(OnTouchEventHandler)eventListener {
    if (_longGestureRecognizer) {
        [self removeGestureRecognizer:_longGestureRecognizer];
    }
    _longGestureRecognizer = [[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(handleLongClickEvent)];
    _longGestureRecognizer.cancelsTouchesInView = NO;
    [self addGestureRecognizer:_longGestureRecognizer];
    [[self touchesEvents] setObject:eventListener forKey:@(HippyViewEventTypeLongClick)];
}

- (void)addPressInEventListener:(OnTouchEventHandler)eventListener {
    if (_pressInTimer) {
        [_pressInTimer invalidate];
    }
    _pressInEventEnabled = YES;
    [[self touchesEvents] setObject:eventListener forKey:@(HippyViewEventTypePressIn)];
}

- (void)addPressOutEventListener:(OnTouchEventHandler)eventListener {
    [[self touchesEvents] setObject:eventListener forKey:@(HippyViewEventTypePressOut)];
}

#pragma mark Touches Event Handler
- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    if (_pressInEventEnabled) {
        _pressInTimer = [NSTimer scheduledTimerWithTimeInterval:.1f target:self selector:@selector(handlePressInEvent) userInfo:nil repeats:NO];
    }
    OnTouchEventHandler listener = [self eventListenerForEventType:HippyViewEventTypeTouchStart];
    if (listener) {
        UITouch *touch = [touches anyObject];
        CGPoint point = [touch locationInView:[self hippyRootView]];
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
    OnTouchEventHandler listener = [self eventListenerForEventType:HippyViewEventTypeTouchEnd];
    if (listener) {
        UITouch *touch = [touches anyObject];
        CGPoint point = [touch locationInView:[self hippyRootView]];
        listener(point);
    }
    else {
        [super touchesEnded:touches withEvent:event];
    }
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    OnTouchEventHandler listener = [self eventListenerForEventType:HippyViewEventTypeTouchMove];
    if (listener) {
        UITouch *touch = [touches anyObject];
        CGPoint point = [touch locationInView:[self hippyRootView]];
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
    OnTouchEventHandler listener = [self eventListenerForEventType:HippyViewEventTypeTouchCancel];
    if (listener) {
        UITouch *touch = [touches anyObject];
        CGPoint point = [touch locationInView:[self hippyRootView]];
        listener(point);
    }
    else {
        [super touchesCancelled:touches withEvent:event];
    }
}

- (void)handleClickEvent {
    OnTouchEventHandler listener = [self eventListenerForEventType:HippyViewEventTypeClick];
    if (listener) {
        CGPoint point = [_tapGestureRecognizer locationInView:[self hippyRootView]];
        listener(point);
    }
}

- (void)handleLongClickEvent {
    OnTouchEventHandler listener = [self eventListenerForEventType:HippyViewEventTypeLongClick];
    if (listener) {
        if (_longGestureRecognizer.state == UIGestureRecognizerStateBegan) {
            CGPoint point = [_longGestureRecognizer locationInView:[self hippyRootView]];
            listener(point);
        }
    }
}

- (void)handlePressInEvent {
    [_pressInTimer invalidate];
    _pressInTimer = nil;
    OnTouchEventHandler listener = [self eventListenerForEventType:HippyViewEventTypePressIn];
    if (listener) {
        listener(CGPointZero);
    }
}

- (void)handlePressOutEvent {
    OnTouchEventHandler listener = [self eventListenerForEventType:HippyViewEventTypePressOut];
    if (listener) {
        listener(CGPointZero);
    }
}

@end
