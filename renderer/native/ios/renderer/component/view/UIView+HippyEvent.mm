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

#import "UIView+HippyEvent.h"
#import <objc/runtime.h>
#import "dom/dom_listener.h"
#import "UIView+AppearEvent.h"

@implementation UIView(HippyEvent)

- (void)addStatusChangeEvent:(const std::string &)name eventCallback:(HippyDirectEventBlock)callback {
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
            [self didAddStatusChangeEvent:name eventCallback:callback];
        }
    } @catch (NSException *exception) {
        
    }
}

- (void)didAddStatusChangeEvent:(const std::string &)name eventCallback:(HippyDirectEventBlock)callback {
    if (name == "onDidMount") {
        [self viewDidMountEvent];
    }
}

- (void)removeStatusChangeEvent:(const std::string &)name {
    //try to contrustor origin setter
    char n = std::toupper(name.at(0));
    NSString *setterName = [NSString stringWithFormat:@"set%c%s:", n, name.substr(1, name.length() - 1).c_str()];
    SEL selector = NSSelectorFromString(setterName);
    @try {
        if ([self respondsToSelector:selector]) {
            HippyDirectEventBlock cb = NULL;
            NSMethodSignature *methodSign = [self methodSignatureForSelector:selector];
            NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:methodSign];
            [invocation setTarget:self];
            [invocation setSelector:selector];
            [invocation setArgument:&cb atIndex:2];
            [invocation invoke];
            [self didRemoveStatusChangeEvent:name];
        }
    } @catch (NSException *exception) {
        
    }
}

- (void)didRemoveStatusChangeEvent:(const std::string &)name {
    if (name == "onDidUnmount") {
        [self viewDidUnmoundEvent];
    }
}

#pragma mark HippyTouchesProtocol Methods
- (void)addViewEvent:(HippyViewEventType)touchEvent eventListener:(OnTouchEventHandler)listener {}

- (OnTouchEventHandler)eventListenerForEventType:(HippyViewEventType)eventType {
    return NULL;
}

- (void)removeViewEvent:(HippyViewEventType)touchEvent {
}

- (BOOL)canBePreventedByInCapturing:(const std::string &)name {
    return NO;
}

- (BOOL)canBePreventInBubbling:(const std::string &)name {
    return NO;
}

@end
