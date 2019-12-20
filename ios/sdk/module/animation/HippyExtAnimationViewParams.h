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

@interface HippyExtAnimationViewParams : NSObject
@property (nonatomic, strong) NSDictionary *originParams;
@property (nonatomic, readonly) NSDictionary *updateParams;
@property (nonatomic, readonly) NSNumber *hippyTag;
@property (nonatomic, readonly) NSNumber *rootTag;

//大概是AnimationGroup需要用到的？单个动画应该只有一个animationId
@property (nonatomic, readonly) NSDictionary <NSString *, NSNumber *> *animationIdWithPropDictionary;

- (void)parse;

//赋值给originParams
- (instancetype)initWithParams:(NSDictionary *)params viewTag:(NSNumber *)viewTag rootTag:(NSNumber *)rootTag;

- (void)setValue:(id)value forProp:(NSString *)prop;
- (id)valueForProp:(NSString *)prop;

@end
