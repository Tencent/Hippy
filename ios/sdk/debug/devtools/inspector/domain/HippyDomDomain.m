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

#import "HippyDomDomain.h"
#import "HippyDevCommand.h"
#import "HippyBridge.h"
#import "HippyDomModel.h"
NSString *const HippyDomDomainName = @"DOM";

@interface HippyDomDomain () {
    HippyDomModel *_domModel;
}

@end

@implementation HippyDomDomain

- (instancetype)initWithInspector:(HippyInspector *)inspector {
    self = [super initWithInspector:inspector];
    if (self) {
        _domModel = [[HippyDomModel alloc] init];
    }
    return self;
}

- (NSString *)domainName {
    return HippyDomDomainName;
}

- (BOOL)handleRequestDevCommand:(HippyDevCommand *)command bridge:(HippyBridge *)bridge{
    if ([command.method isEqualToString:@"getDocument"]) {
        NSDictionary *dic = [_domModel getDocumentWithBridge:bridge];
        NSDictionary *result = @{@"id": command.cmdID, @"result": dic};
        NSData *retData = [NSJSONSerialization dataWithJSONObject:result options:0 error:nil];
        command.resultString = [[NSString alloc] initWithData:retData encoding:NSUTF8StringEncoding];
    }
    return NO;
}

@end
