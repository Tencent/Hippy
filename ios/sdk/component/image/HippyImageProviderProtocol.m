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

#import "HippyImageProviderProtocol.h"
#import "objc/runtime.h"
#import "HippyBridge.h"

Class<HippyImageProviderProtocol> imageProviderClassFromBridge(NSData *data, HippyBridge *bridge) {
    NSSet<Class<HippyImageProviderProtocol>> *classes = [bridge imageProviders];
    NSPredicate *predicate = [NSPredicate predicateWithBlock:^BOOL(id  _Nullable evaluatedObject, NSDictionary<NSString *,id> * _Nullable bindings) {
        if ([evaluatedObject conformsToProtocol:@protocol(HippyImageProviderProtocol)]) {
            Class<HippyImageProviderProtocol> class = (Class<HippyImageProviderProtocol>)evaluatedObject;
            return [class canHandleData:data];
        }
        else {
            return NO;
        }
    }];
    NSSet<Class<HippyImageProviderProtocol>> *sub = [classes filteredSetUsingPredicate:predicate];
    Class<HippyImageProviderProtocol> candidate = nil;
    for (Class<HippyImageProviderProtocol> class in sub) {
        if (nil == candidate) {
            candidate = class;
        }
        else {
            NSUInteger candidatePriority = [candidate priorityForData:data];
            NSUInteger classPriority = [class priorityForData:data];
            if (classPriority > candidatePriority) {
                candidate = class;
            }
        }
    }
    return candidate;
}
