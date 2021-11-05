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

#import "HippyPageDomain.h"
#import "HippyDevCommand.h"
#import "HippyLog.h"
#import "HippyPageModel.h"
#import "HippyUIManager.h"

NSString *const HippyPageDomainName = @"Page";
// Method
NSString *const HippyPageMethodStartScreencast = @"startScreencast";
NSString *const HippyPageMethodStopScreencast = @"stopScreencast";
NSString *const HippyPageMethodScreencastFrameAck = @"screencastFrameAck";
NSString *const HippyPageMethodScreencastFrame = @"screencastFrame";

double const HippyPageScreenFrameAckDelayTime = 1.5f;

@interface HippyPageDomain () {
    HippyPageModel *_pageModel;
}

@end

@implementation HippyPageDomain

- (instancetype)initWithInspector:(HippyInspector *)inspector {
    self = [super initWithInspector:inspector];
    if (self) {
        _pageModel = [[HippyPageModel alloc] init];
    }
    return self;
}

- (NSString *)domainName {
    return HippyPageDomainName;
}

#pragma mark - Method Handle
- (BOOL)handleRequestDevCommand:(HippyDevCommand *)command bridge:(HippyBridge *)bridge {
    [super handleRequestDevCommand:command bridge:bridge];
    
    if ([command.method isEqualToString:HippyPageMethodStartScreencast]) {
        return [self handleStartScreencast:command bridge:bridge];
    }
    if ([command.method isEqualToString:HippyPageMethodStopScreencast]) {
        return [self handleStopScreencast:command bridge:bridge];
    }
    if ([command.method isEqualToString:HippyPageMethodScreencastFrameAck]) {
        return [self handleScreenFrameAck:command bridge:bridge];
    }
    
    return NO;
}

- (BOOL)handleStartScreencast:(HippyDevCommand *)command bridge:(HippyBridge *)bridge {
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"PageDomain, start screencast error, manager is nil");
        return NO;
    }
    NSDictionary *resultJSON = [_pageModel startScreenCastWithUIManager:manager
                                                                 params:command.params];
    if (self.inspector && resultJSON.count > 0) {
        NSString *methodName = [NSString stringWithFormat:@"%@.%@", HippyPageDomainName, HippyPageMethodScreencastFrame];
        [self.inspector sendDataToFrontendWithMethod:methodName
                                              params:resultJSON];
    }
    return YES;
}

- (BOOL)handleStopScreencast:(HippyDevCommand *)command bridge:(HippyBridge *)bridge {
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"PageDomain, stop screencast error, manager is nil");
        return NO;
    }
    [_pageModel stopScreenCastWithUIManager:manager];
    return YES;
}

- (BOOL)handleScreenFrameAck:(HippyDevCommand *)command bridge:(HippyBridge *)bridge {
    HippyUIManager *manager = bridge.uiManager;
    if (!manager) {
        HippyLogWarn(@"PageDomain, getDocument error, manager is nil");
        return NO;
    }
    dispatch_time_t delayTime = dispatch_time(DISPATCH_TIME_NOW,
                                               (int64_t)(HippyPageScreenFrameAckDelayTime * NSEC_PER_SEC));
    dispatch_after(delayTime, dispatch_get_main_queue(), ^{
        NSDictionary *resultJSON = [self->_pageModel screencastFrameAckWithUIManager:manager params:command.params];
        if (self.inspector && resultJSON.count > 0) {
            NSString *methodName = [NSString stringWithFormat:@"%@.%@", HippyPageDomainName, HippyPageMethodScreencastFrame];
            [self.inspector sendDataToFrontendWithMethod:methodName
                                                  params:resultJSON];
        }
    });
    return YES;
}

@end
