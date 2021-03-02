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

const NSInteger HippyTextUpdateLagWarningThreshold = 3;

NSString *HippyNormalizeInputEventName(NSString *eventName) {
    if ([eventName hasPrefix:@"on"]) {
        eventName = [eventName stringByReplacingCharactersInRange:(NSRange) { 0, 2 } withString:@"top"];
    } else if (![eventName hasPrefix:@"top"]) {
        eventName = [[@"top" stringByAppendingString:[eventName substringToIndex:1].uppercaseString]
            stringByAppendingString:[eventName substringFromIndex:1]];
    }
    return eventName;
}

@implementation HippyEventDispatcher

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE()

- (void)dispatchEvent:(NSString *)moduleName methodName:(NSString *)methodName args:(NSDictionary *)params {
    NSString *action = @"callJsModule";
    NSMutableArray *events = [NSMutableArray array];
    [events addObject:action];

    NSMutableDictionary *body = [NSMutableDictionary new];
    [body setObject:moduleName forKey:@"moduleName"];
    [body setObject:methodName forKey:@"methodName"];

    if ([moduleName isEqualToString:@"EventDispatcher"] && params) {
        NSNumber *tag = params[@"id"];
        NSString *eventName = params[@"eventName"] ?: @"";
        NSDictionary *extra = params[@"extra"] ?: @{};
        if ([methodName isEqualToString:@"receiveNativeEvent"]) {
            NSMutableArray *detail = [NSMutableArray new];
            [detail addObject:eventName];
            [detail addObject:extra];
            [body setValue:detail forKey:@"params"];
        } else if ([methodName isEqualToString:@"receiveUIComponentEvent"]) {
            NSMutableArray *detail = [NSMutableArray new];
            if (tag) {
                [detail addObject:tag];
            }
            [detail addObject:eventName];
            [detail addObject:extra];
            [body setValue:detail forKey:@"params"];
        } else if ([methodName isEqualToString:@"receiveNativeGesture"]) {
            [body setValue:params forKey:@"params"];
        }
    } else {
        [body setValue:params forKey:@"params"];
    }

    [events addObject:body];

    [_bridge enqueueJSCall:moduleName method:methodName args:events completion:NULL];
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
