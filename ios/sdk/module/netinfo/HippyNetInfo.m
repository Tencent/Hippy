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

#import "HippyNetInfo.h"

#import "HippyAssert.h"
#import "HippyBridge.h"
#import "HippyEventDispatcher.h"
#import "netinet/in.h"

static NSString *const HippyReachabilityStateUnknown = @"UNKNOWN";
static NSString *const HippyReachabilityStateNone = @"NONE";
static NSString *const HippyReachabilityStateWifi = @"WIFI";
static NSString *const HippyReachabilityStateCell = @"CELL";

@implementation HippyNetInfo
{
    SCNetworkReachabilityRef _reachability;
    NSString *_networkType;
    NSString *_host;
}

HIPPY_EXPORT_MODULE()

static NSString *hippyReachabilityTypeFromFlags(SCNetworkReachabilityFlags flags) {
    NSString *networkType = HippyReachabilityStateUnknown;
    if ((flags & kSCNetworkReachabilityFlagsReachable) == 0 ||
        (flags & kSCNetworkReachabilityFlagsConnectionRequired) != 0) {
        networkType = HippyReachabilityStateNone;
    }
    else if ((flags & kSCNetworkReachabilityFlagsIsWWAN) != 0) {
        networkType = HippyReachabilityStateCell;
    }
    else {
        networkType = HippyReachabilityStateWifi;
    }
    return networkType;
}

static NSString *currentReachabilityType(SCNetworkReachabilityRef reachabilityRef) {
    SCNetworkReachabilityFlags flags;
    BOOL success = SCNetworkReachabilityGetFlags(reachabilityRef, &flags);
    if (success) {
        NSString *type = hippyReachabilityTypeFromFlags(flags);
        return type?:HippyReachabilityStateUnknown;
    }
    else {
        return HippyReachabilityStateUnknown;
    }
}

static SCNetworkReachabilityRef createReachabilityRefWithZeroAddress() {
    struct sockaddr_in zeroAddress;
    bzero(&zeroAddress, sizeof(zeroAddress));
    zeroAddress.sin_len = sizeof(zeroAddress);
    zeroAddress.sin_family = AF_INET;
    SCNetworkReachabilityRef reachability = SCNetworkReachabilityCreateWithAddress(kCFAllocatorDefault, (struct sockaddr *)&zeroAddress);
    return reachability;
}

static void HippyReachabilityCallback(__unused SCNetworkReachabilityRef target, SCNetworkReachabilityFlags flags, void *info) {
    HippyNetInfo *self = (__bridge id)info;
    NSString *networkType = hippyReachabilityTypeFromFlags(flags);
    if (![networkType isEqualToString:self->_networkType]) {
        self->_networkType = networkType;
        [self sendEvent:@"networkStatusDidChange" params:@{@"network_info": networkType}];
    }
}

#pragma mark - Lifecycle

- (instancetype)initWithHost:(NSString *)host {
    HippyAssertParam(host);
    HippyAssert(![host hasPrefix:@"http"], @"Host value should just contain the domain, not the URL scheme.");
    
    if ((self = [self init])) {
        _host = [host copy];
    }
    return self;
}

- (void) addEventObserverForName:(NSString *)eventName {
    if ([eventName isEqualToString:@"networkStatusDidChange"]) {
        if (!_reachability) {
            _reachability = createReachabilityRefWithZeroAddress();
            SCNetworkReachabilityContext context = { 0, ( __bridge void *)self, NULL, NULL, NULL };
            SCNetworkReachabilitySetCallback(_reachability, HippyReachabilityCallback, &context);
            SCNetworkReachabilityScheduleWithRunLoop(_reachability, CFRunLoopGetMain(), kCFRunLoopCommonModes);
        }
        _networkType = currentReachabilityType(_reachability);
        [self sendEvent:@"networkStatusDidChange" params:@{@"network_info": _networkType}];
    }
}

- (void) removeEventObserverForName:(NSString *)eventName {
    if ([eventName isEqualToString:@"networkStatusDidChange"]) {
        [self releaseReachability];
    }
}

- (void)invalidate
{
    [self releaseReachability];
}

- (void)releaseReachability
{
    if (_reachability) {
        SCNetworkReachabilityUnscheduleFromRunLoop(_reachability, CFRunLoopGetMain(), kCFRunLoopCommonModes);
        CFRelease(_reachability);
        _reachability = NULL;
    }
}

- (void)dealloc
{
    [self releaseReachability];
}
#pragma mark - Public API

// clang-format off
HIPPY_EXPORT_METHOD(getCurrentConnectivity:(HippyPromiseResolveBlock)resolve
                  reject:(__unused HippyPromiseRejectBlock)reject) {
// clang-format on
    if (!resolve) {
        return;
    }
    //return network type if it was set and not unknown type
    if (_networkType) {
        resolve(@{@"network_info": _networkType});
    }
    //else try to get network type
    else {
        SCNetworkReachabilityRef reachability = NULL;
        if (_reachability) {
            reachability = CFRetain(_reachability);
        }
        else {
            reachability = createReachabilityRefWithZeroAddress();
        }
        NSString *type = currentReachabilityType(reachability);
        resolve(@{@"network_info": type});
        CFRelease(reachability);
    }
}

@end
