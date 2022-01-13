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

@implementation HippyDevInfo

- (void)setScheme:(NSString *)scheme {
    _scheme = HippyDevWebSocketSchemeWs;
    if ([scheme hasPrefix:@"https"]) {
        _scheme = HippyDevWebSocketSchemeWss;
    }
}

@end
