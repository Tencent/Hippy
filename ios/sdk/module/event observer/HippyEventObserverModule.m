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

#import "HippyEventObserverModule.h"
#import "HippyAssert.h"
#import "HippyEventDispatcher.h"

@implementation HippyEventObserverModule {
    NSMutableDictionary *_config;
}

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE(EventObserver)

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (instancetype)init
{
    if (self = [super init]) {
        _config = [NSMutableDictionary new];
    }
    return self;
}

HIPPY_EXPORT_METHOD(addListener:(NSString *)eventName)
{
    HippyAssertParam(eventName);
    NSNumber *value = _config[eventName];
    if (value == nil) {
        value = @(1);
        [self addEventObserverForName: eventName];
    } else {
        value = @(value.integerValue + 1);
    }
    _config[eventName] = value;
}

HIPPY_EXPORT_METHOD(removeListener:(NSString *)eventName)
{
    NSNumber *value = _config[eventName];
    if (value == nil || value.integerValue == 1) {
        [_config removeObjectForKey: eventName];
        [self removeEventObserverForName: eventName];
    } else {
        value = @(value.integerValue - 1);
        _config[eventName] = value;
    }
}

- (void)addEventObserverForName:(__unused NSString *)eventName
{
    // should override by subclass
    // do sth
}

- (void)removeEventObserverForName:(__unused NSString *)eventName
{
    // should override by subclass
    // do sth
}

- (void)dealloc
{
	[[NSNotificationCenter defaultCenter] removeObserver: self];
}

- (void)sendEvent:(NSString *)eventName params:(NSDictionary *)params
{
	HippyAssertParam(eventName);
	[self.bridge.eventDispatcher dispatchEvent:@"EventDispatcher" methodName:@"receiveNativeEvent" args:@{@"eventName": eventName, @"extra": params ? : @{}}];
}
@end
