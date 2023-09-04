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

#import "UIView+DomEvent.h"
#import <objc/runtime.h>
#import "UIView+MountEvent.h"
#import "UIView+NativeRender.h"
#import "UIEvent+TouchResponder.h"

#include "dom/dom_listener.h"

@implementation UIView(DomEvent)

+ (void)load {
    if (self == [UIView self]) {
        Method originMethod = class_getInstanceMethod([UIView class], @selector(hitTest:withEvent:));
        Method exchangeMethod = class_getInstanceMethod([UIView class], @selector(hippy_domEvent_hitTest:withEvent:));
        method_exchangeImplementations(originMethod, exchangeMethod);
    }
}

- (UIView *)hippy_domEvent_hitTest:(CGPoint)point withEvent:(UIEvent *)event {
    [event removeAllResponders];
    return [self hippy_domEvent_hitTest:point withEvent:event];
}

- (void)setOnInterceptTouchEvent:(BOOL)onInterceptTouchEvent {
    objc_setAssociatedObject(self, @selector(onInterceptTouchEvent), @(onInterceptTouchEvent), OBJC_ASSOCIATION_RETAIN);
}

- (BOOL)onInterceptTouchEvent {
    return [objc_getAssociatedObject(self, @selector(onInterceptTouchEvent)) boolValue];
}

- (NSMutableSet<NSString *> *)_propertyEventsName {
    NSMutableSet<NSString *> *names = objc_getAssociatedObject(self, @selector(_propertyEventsName));
    if (!names) {
        names = [NSMutableSet setWithCapacity:8];
        objc_setAssociatedObject(self, @selector(_propertyEventsName), names, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    return names;
}

- (NSSet<NSString *> *)propertyEventsName {
    return [[self _propertyEventsName] copy];
}

static SEL SelectorFromCName(const char *name) {
    if (!name || strlen(name) < 1) {
        return nil;
    }
    //try to contrustor origin setter
    char n = toupper(name[0]);
    const char *subName = name + 1;
    NSString *setterName = nil;
    if (subName) {
        setterName = [NSString stringWithFormat:@"set%c%s:", n, subName];
    }
    else {
        setterName = [NSString stringWithFormat:@"set%c:", n];
    }
    SEL selector = NSSelectorFromString(setterName);
    return selector;
}

- (void)addPropertyEvent:(const char *)name eventCallback:(NativeRenderDirectEventBlock)callback {
    @try {
        SEL selector = SelectorFromCName(name);
        if ([self respondsToSelector:selector]) {
            void *cb = (__bridge void *)callback;
            NSMethodSignature *methodSign = [self methodSignatureForSelector:selector];
            NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:methodSign];
            [invocation setTarget:self];
            [invocation setSelector:selector];
            [invocation setArgument:&cb atIndex:2];
            [invocation invoke];
            [self didAddPropertyEvent:name eventCallback:callback];
        }
    } @catch (NSException *exception) {
        
    }
}

- (void)didAddPropertyEvent:(const char *)name eventCallback:(NativeRenderDirectEventBlock)callback {
    if (!name) {
        return;
    }
    [[self _propertyEventsName] addObject:@(name)];
    //TODO(mengyanluo): update properties will cause event to be removed/added, needs frontend to fix first
//    if (0 == strcmp(name, "onDidMount") ) {
//        if ([self superview]) {
//            [self viewDidMountEvent];
//        }
//    }
//    else if (0 == strcmp(name, "onAttachedToWindow")) {
//        if ([self window]) {
//            [self sendAttachedToWindowEvent];
//        }
//    }
}

- (void)removePropertyEvent:(const char *)name {
    //try to contrustor origin setter
    SEL selector = SelectorFromCName(name);
    @try {
        if ([self respondsToSelector:selector]) {
            NativeRenderDirectEventBlock cb = NULL;
            NSMethodSignature *methodSign = [self methodSignatureForSelector:selector];
            NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:methodSign];
            [invocation setTarget:self];
            [invocation setSelector:selector];
            [invocation setArgument:&cb atIndex:2];
            [invocation invoke];
            [self didRemovePropertyEvent:name];
        }
    } @catch (NSException *exception) {
        
    }
}

- (void)didRemovePropertyEvent:(const char *)name {
    [[self _propertyEventsName] removeObject:@(name)];
}

- (void)removeAllPropertyEvents {
    NSSet<NSString *> *set = [self propertyEventsName];
    for (NSString *name in set) {
        [self removePropertyEvent:[name UTF8String]];
    }
}

#pragma mark NativeRenderTouchesProtocol Methods
- (void)addViewEvent:(NativeRenderViewEventType)touchEvent eventListener:(OnTouchEventHandler)listener {}

- (OnTouchEventHandler)eventListenerForEventType:(NativeRenderViewEventType)eventType {
    return NULL;
}

- (void)removeViewEvent:(NativeRenderViewEventType)touchEvent {
}

- (BOOL)canBePreventedByInCapturing:(const char *)name {
    return NO;
}

- (BOOL)canBePreventInBubbling:(const char *)name {
    return NO;
}

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

- (void)resetAllEvents {}

@end
