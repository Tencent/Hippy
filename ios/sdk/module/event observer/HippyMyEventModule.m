//
//  HippyMyEventModule.m
//  Hippy
//
//  Created by 万致远 on 2019/5/27.
//  Copyright © 2019 Tencent. All rights reserved.
//

#import "HippyMyEventModule.h"

@implementation HippyMyEventModule
HIPPY_EXPORT_MODULE(MyEvent)

//普通事件
HIPPY_EXPORT_METHOD(btnClicked)
{
    [super sendEvent:@"NORMAL_EVENT" params:@{@"foo": @"bar"}];
}

//普通事件的进阶使用
- (void)addEventObserverForName:(NSString *)eventName {
    [super addEventObserverForName:eventName];
    if ([eventName isEqualToString:@"COUNT_DOWN"]) {
        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            [super sendEvent:@"COUNT_DOWN" params:@{@"foo": @"bar"}];
        });
    } else if ([eventName isEqualToString:@"NORMAL_EVENT_1"]) {
        
    } else {
        //other events...
    }
}

- (void)removeEventObserverForName:(NSString *)eventName {
    [super removeEventObserverForName:eventName];
    
}


@end
