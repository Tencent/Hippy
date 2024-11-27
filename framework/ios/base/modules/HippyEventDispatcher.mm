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

#import "HippyEventDispatcher.h"
#import "HippyAssert.h"
#import "HippyUtils.h"
#import "HippyBridge+ModuleManage.h"

static NSString *const kHippyCallJSModuleKey = @"callJsModule";
static NSString *const kHippyEventDispatcherModuleNameKey = @"moduleName";
static NSString *const kHippyEventDispatcherMethodNameKey = @"methodName";
static NSString *const kHippyEventDispatcherParamsKey = @"params";

static NSString *const kHippyEventDispatcherModule = @"EventDispatcher";
static NSString *const kHippyReceiveNativeEventMethod = @"receiveNativeEvent";
static NSString *const kHippyReceiveUIEventMethod = @"receiveUIComponentEvent";
static NSString *const kHippyReceiveGestureEventMethod = @"receiveNativeGesture";
static NSString *const kHippyEventNameKey = @"eventName";
static NSString *const kHippyEventParamsKey = @"extra";
static NSString *const kHippyEventIdKey = @"id";


@implementation HippyEventDispatcher

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE()

- (void)dispatchEvent:(NSString *)moduleName methodName:(NSString *)methodName args:(NSDictionary *)params {
    NSMutableArray *events = [NSMutableArray array];
    [events addObject:kHippyCallJSModuleKey];

    NSMutableDictionary *body = [NSMutableDictionary new];
    [body setObject:moduleName forKey:kHippyEventDispatcherModuleNameKey];
    [body setObject:methodName forKey:kHippyEventDispatcherMethodNameKey];

    if ([moduleName isEqualToString:kHippyEventDispatcherModule] && params) {
        NSString *eventName = params[kHippyEventNameKey] ?: @"";
        NSDictionary *extra = params[kHippyEventParamsKey] ?: @{};
        if ([methodName isEqualToString:kHippyReceiveNativeEventMethod]) {
            NSMutableArray *detail = [NSMutableArray new];
            [detail addObject:eventName];
            [detail addObject:extra];
            [body setValue:detail forKey:kHippyEventDispatcherParamsKey];
        } else if ([methodName isEqualToString:kHippyReceiveUIEventMethod]) {
            NSNumber *tag = params[kHippyEventIdKey];
            NSMutableArray *detail = [NSMutableArray new];
            if (tag) {
                [detail addObject:tag];
            }
            [detail addObject:eventName];
            [detail addObject:extra];
            [body setValue:detail forKey:kHippyEventDispatcherParamsKey];
        } else if ([methodName isEqualToString:kHippyReceiveGestureEventMethod]) {
            [body setValue:params forKey:kHippyEventDispatcherParamsKey];
        }
    } else {
        [body setValue:params forKey:kHippyEventDispatcherParamsKey];
    }

    [events addObject:body];

    [_bridge enqueueJSCall:moduleName method:methodName args:events completion:NULL];
}

- (void)dispatchNativeEvent:(NSString *)eventName withParams:(NSDictionary *)params {
    NSMutableDictionary *body = [NSMutableDictionary new];
    body[kHippyEventDispatcherModuleNameKey] = kHippyEventDispatcherModule;
    body[kHippyEventDispatcherMethodNameKey] = kHippyReceiveNativeEventMethod;
    body[kHippyEventDispatcherParamsKey] = @[ (eventName ?: @""), (params ?: @{}) ];
    
    NSMutableArray *events = [NSMutableArray array];
    [events addObject:kHippyCallJSModuleKey];
    [events addObject:body];
    
    [_bridge enqueueJSCall:kHippyEventDispatcherModule
                    method:kHippyReceiveNativeEventMethod
                      args:events
                completion:nil];
}

- (dispatch_queue_t)methodQueue {
    return HippyJSThread;
}

@end

@implementation HippyBridge (HippyEventDispatcher)

- (HippyEventDispatcher *)eventDispatcher {
    return [self moduleForClass:[HippyEventDispatcher class]];
}

@end
