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
#import "dom/dom_listener.h"
#import "UIView+MountEvent.h"
#import "UIView+NativeRender.h"

@implementation UIView(DomEvent)

- (void)addPropertyEvent:(const std::string &)name eventCallback:(NativeRenderDirectEventBlock)callback {
    //try to contrustor origin setter
    char n = std::toupper(name.at(0));
    NSString *setterName = [NSString stringWithFormat:@"set%c%s:", n, name.substr(1, name.length() - 1).c_str()];
    SEL selector = NSSelectorFromString(setterName);
    @try {
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

- (void)didAddPropertyEvent:(const std::string &)name eventCallback:(NativeRenderDirectEventBlock)callback {
    if (name == "onDidMount" ) {
        [self viewDidMountEvent];
    }
    else if (name == "onAttachedToWindow") {
        [self sendAttachedToWindowEvent];
    }
}

- (void)removePropertyEvent:(const std::string &)name {
    //try to contrustor origin setter
    char n = std::toupper(name.at(0));
    NSString *setterName = [NSString stringWithFormat:@"set%c%s:", n, name.substr(1, name.length() - 1).c_str()];
    SEL selector = NSSelectorFromString(setterName);
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

- (void)didRemovePropertyEvent:(const std::string &)name {
}

#pragma mark NativeRenderTouchesProtocol Methods
- (void)addViewEvent:(NativeRenderViewEventType)touchEvent eventListener:(OnTouchEventHandler)listener {}

- (OnTouchEventHandler)eventListenerForEventType:(NativeRenderViewEventType)eventType {
    return NULL;
}

- (void)removeViewEvent:(NativeRenderViewEventType)touchEvent {
}

- (BOOL)canBePreventedByInCapturing:(const std::string &)name {
    return NO;
}

- (BOOL)canBePreventInBubbling:(const std::string &)name {
    return NO;
}

@end
