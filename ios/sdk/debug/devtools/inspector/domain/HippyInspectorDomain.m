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

#import "HippyInspectorDomain.h"
#import "HippyBridge.h"
#import "HippyDevCommand.h"
#import "HippyLog.h"

NSString *const HippyInspectorDomainName = @"InspectorDomain";
NSString *const HippyDomainMethodNameEnable = @"enable";
NSString *const HippyDomainMethodNameDisable = @"disable";

NSString *const HippyDomainRspKeyId = @"id";
NSString *const HippyDomainRspKeyResult = @"result";

HIPPY_EXTERN NSDictionary *properResultForEmprtyObject(NSNumber *index, NSDictionary *object) {
    return index ? [object count] ? object : @{HippyDomainRspKeyId: index, HippyDomainRspKeyResult: @{}} : object;
}

@implementation HippyInspectorDomain

- (instancetype)initWithInspector:(HippyInspector *)inspector {
    self = [super init];
    if (self) {
        _inspector = inspector;
    }
    return self;
}

- (BOOL)handleRequestDevCommand:(HippyDevCommand *)command
                         bridge:(HippyBridge *)bridge
                     completion:(void (^)(NSDictionary *rspObject))completion {
    if ([command.method isEqualToString:HippyDomainMethodNameEnable] ||
        [command.method isEqualToString:HippyDomainMethodNameDisable]) {
        if (completion) {
            completion(@{HippyDomainRspKeyId : command.cmdID,
                         HippyDomainRspKeyResult: @{}});
        }
        return YES;
    }
    return NO;
}

- (BOOL)handleRspDataWithCmd:(HippyDevCommand *)command
                    dataJSON:(NSDictionary *)dataJSON
                  completion:(void (^)(NSDictionary *))completion {
    if (!dataJSON) {
        HippyLogWarn(@"InspectorDomain, dataJSON is nil");
        return NO;
    }
    NSDictionary *result = @{HippyDomainRspKeyId : command.cmdID,
                             HippyDomainRspKeyResult: dataJSON};
    completion(result);
    return YES;
}

- (NSString *)domainName {
    return HippyInspectorDomainName;
}

@end
