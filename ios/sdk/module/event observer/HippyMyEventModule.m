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
