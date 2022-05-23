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

#import "HippyDevInfo.h"
#import "HippyUtils.h"
#import <UIKit/UIDevice.h>

NSString *const HippyDevWebSocketSchemeWs = @"ws";
NSString *const HippyDevWebSocketSchemeWss = @"wss";
NSString *const HippyDevWebSocketInfoDebugURL = @"debugUrl=";

@implementation HippyDevInfo

- (void)setScheme:(NSString *)scheme {
    _scheme = HippyDevWebSocketSchemeWs;
    if ([scheme hasPrefix:@"https"]) {
        _scheme = HippyDevWebSocketSchemeWss;
    }
}

- (void)parseWsURLWithURLQuery:(NSString *)query {
    if (query.length <= 0) {
        return;
    }
    NSArray<NSString *> *queryItems = [query componentsSeparatedByString:@"&"];
    if (queryItems.count <= 0) {
        return;
    }
    NSString *debugWsURL = @"";
    for (NSString *item in queryItems) {
        if ([item hasPrefix:HippyDevWebSocketInfoDebugURL]) {
            debugWsURL = [item stringByRemovingPercentEncoding];
            break;
        }
        
    }
    if (debugWsURL.length <= 0) {
        return;
    }
    NSRange range = [debugWsURL rangeOfString:HippyDevWebSocketInfoDebugURL];
    if (range.location + range.length > debugWsURL.length) {
        return;
    }
    _wsURL = [debugWsURL substringFromIndex:range.location + range.length];
}

+ (NSString *)debugClientIdWithBridge:(HippyBridge *)bridge {
    if (!bridge) {
        return @"";
    }
    NSString *deviceName = [[UIDevice currentDevice] name];
    return HippyMD5Hash([NSString stringWithFormat:@"%@%p", deviceName, bridge]);
}

@end
