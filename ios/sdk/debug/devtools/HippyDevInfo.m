//
//  HippyDevInfo.m
//  HippyDemo
//
//  Created by  nolantang on 2022/1/12.
//  Copyright © 2022 tencent. All rights reserved.
//

#import "HippyDevInfo.h"

NSString *const HippyDevWebSocketSchemeWs = @"ws";
NSString *const HippyDevWebSocketSchemeWss = @"wss";
NSString *const HippyDevWebSocketInfoDebugURL = @"debugURL=";

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

@end
