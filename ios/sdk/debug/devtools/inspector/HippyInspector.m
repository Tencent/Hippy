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

#import "HippyInspector.h"
#import "HippyDomDomain.h"
#import "HippyCSSDomain.h"
#import "HippyDevCommand.h"
#import "HippyDevManager.h"
#import "HippyLog.h"
#import "HippyPageDomain.h"

NSString *const HippyInspectorRspDataKeyMethod = @"method";
NSString *const HippyInspectorRspDataKeyParams = @"params";

@interface HippyInspector ()

@property (nonatomic, strong) NSMutableDictionary<NSString *, HippyInspectorDomain *> *domainMap;

@end

@implementation HippyInspector

+ (instancetype)sharedInstance {
    static HippyInspector *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[HippyInspector alloc] init];
    });
    return instance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _domainMap = [NSMutableDictionary dictionary];
        [self initializeDomain];
    }
    return self;
}

#pragma mark private method
- (void)initializeDomain {
    HippyDomDomain *domDomain = [[HippyDomDomain alloc] initWithInspector:self];
    HippyCSSDomain *cssDomain = [[HippyCSSDomain alloc] initWithInspector:self];
    HippyPageDomain *pageDomain = [[HippyPageDomain alloc] initWithInspector:self];
    self.domainMap[domDomain.domainName] = domDomain;
    self.domainMap[cssDomain.domainName] = cssDomain;
    self.domainMap[pageDomain.domainName] = pageDomain;
}

- (HippyInspectorDomain *)inspectorDomainFromMessage:(NSString *)message command:(out HippyDevCommand *__autoreleasing *)command{
    HippyDevCommand *cmd = [[HippyDevCommand alloc] initWithRAWString:message];
    HippyInspectorDomain *domain = self.domainMap[cmd.domain];
    if (command) {
        *command = cmd;
    }
    return domain;
}

- (void)sendDataToFrontendWithMethod:(NSString *)method params:(NSDictionary *)params {
    NSDictionary *resultDic = @{
        HippyInspectorRspDataKeyMethod : method,
        HippyInspectorRspDataKeyParams : params == nil ? @{} : params
    };
    NSError *parseError;
    NSData *retData = [NSJSONSerialization dataWithJSONObject:resultDic options:0 error:&parseError];
    if (parseError) {
        HippyLogError(@"Inspector, parse json data error");
    }
    NSString *resultString = [[NSString alloc] initWithData:retData encoding:NSUTF8StringEncoding];
    if (self.devManager) {
        [self.devManager sendDataToFrontendWithData:resultString];
    }
}

@end
