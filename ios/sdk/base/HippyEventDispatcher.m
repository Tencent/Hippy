/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyEventDispatcher.h"

#import "HippyAssert.h"
//#import "HippyBridge.h"
//#import "HippyBridge+Private.h"
#import "HippyUtils.h"

const NSInteger HippyTextUpdateLagWarningThreshold = 3;

NSString *HippyNormalizeInputEventName(NSString *eventName)
{
    if ([eventName hasPrefix:@"on"]) {
        eventName = [eventName stringByReplacingCharactersInRange:(NSRange){0, 2} withString:@"top"];
    } else if (![eventName hasPrefix:@"top"]) {
        eventName = [[@"top" stringByAppendingString:[eventName substringToIndex:1].uppercaseString]
                     stringByAppendingString:[eventName substringFromIndex:1]];
    }
    return eventName;
}

@implementation HippyEventDispatcher

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE()

- (void)dispatchEvent:(NSString *)moduleName methodName:(NSString *)methodName args:(NSDictionary *)params
{
    NSString *action = @"callJsModule";
    NSMutableArray *events = [NSMutableArray array];
    [events addObject: action];
    
    NSMutableDictionary *body = [NSMutableDictionary new];
    [body setObject: moduleName forKey: @"moduleName"];
    [body setObject: methodName forKey: @"methodName"];
    
    if ([moduleName isEqualToString: @"EventDispatcher"] && params) {
        NSNumber *tag = params[@"id"];
        NSString *eventName = params[@"eventName"] ? : @"";
        NSDictionary *extra = params[@"extra"] ? : @{};
        if ([methodName isEqualToString: @"receiveNativeEvent"]) {
            NSMutableArray *detail = [NSMutableArray new];
            [detail addObject: eventName];
            [detail addObject: extra];
            [body setValue: detail forKey: @"params"];
        } else if ([methodName isEqualToString: @"receiveUIComponentEvent"]) {
            NSMutableArray *detail = [NSMutableArray new];
            if (tag) {
                [detail addObject: tag];
            }
            [detail addObject: eventName];
            [detail addObject: extra];
            [body setValue: detail forKey: @"params"];
        } else if ([methodName isEqualToString: @"receiveNativeGesture"]) {
            [body setValue: params forKey: @"params"];
        }
    } else {
        [body setValue: params forKey: @"params"];
    }
    
    [events addObject: body];
    
    [_bridge enqueueJSCall: moduleName method: methodName args: events completion: NULL];
}

- (dispatch_queue_t)methodQueue
{
    return HippyJSThread;
}

@end

@implementation HippyBridge (HippyEventDispatcher)

- (HippyEventDispatcher *)eventDispatcher
{
    return [self moduleForClass:[HippyEventDispatcher class]];
}

@end
