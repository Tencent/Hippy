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

#import <Foundation/Foundation.h>
#import "HippyBridgeModule.h"

// ****此类必须继承才能使用****
// 注册监听事件类，JS测可以调用接口监听终端事件响应，通过sendEvent将事件发送给JS


@interface HippyEventObserverModule : NSObject <HippyBridgeModule>

- (void)addEventObserverForName:(NSString *)eventName;
- (void)removeEventObserverForName:(NSString *)eventName;

- (void)sendEvent:(NSString *)eventName params:(NSDictionary *)params;

@end
