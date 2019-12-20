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

static NSString *const HippyReachabilityStateUnknown = @"UNKNOWN";
static NSString *const HippyReachabilityStateNone = @"NONE";
static NSString *const HippyReachabilityStateWifi = @"WIFI";
static NSString *const HippyReachabilityStateCell = @"CELL";

@implementation HippyNetInfo
{
  SCNetworkReachabilityRef _reachability;
  NSString *_status;
  NSString *_host;
}

HIPPY_EXPORT_MODULE()

static void HippyReachabilityCallback(__unused SCNetworkReachabilityRef target, SCNetworkReachabilityFlags flags, void *info)
{
  HippyNetInfo *self = (__bridge id)info;
  NSString *status = HippyReachabilityStateUnknown;
  if ((flags & kSCNetworkReachabilityFlagsReachable) == 0 ||
      (flags & kSCNetworkReachabilityFlagsConnectionRequired) != 0) {
    status = HippyReachabilityStateNone;
  }

#if TARGET_OS_IPHONE

  else if ((flags & kSCNetworkReachabilityFlagsIsWWAN) != 0) {
    status = HippyReachabilityStateCell;
  }

#endif

  else {
    status = HippyReachabilityStateWifi;
  }

  if (![status isEqualToString:self->_status]) {
    self->_status = status;
    [self sendEvent:@"networkStatusDidChange" params:@{@"network_info": status}];
  }
}

#pragma mark - Lifecycle

- (instancetype)initWithHost:(NSString *)host
{
  HippyAssertParam(host);
  HippyAssert(![host hasPrefix:@"http"], @"Host value should just contain the domain, not the URL scheme.");

  if ((self = [self init])) {
    _host = [host copy];
  }
  return self;
}

- (void) addEventObserverForName:(NSString *)eventName {
  if ([eventName isEqualToString:@"networkStatusDidChange"]) {
    _status = HippyReachabilityStateUnknown;
    _reachability = SCNetworkReachabilityCreateWithName(kCFAllocatorDefault, _host.UTF8String ?: "apple.com");
    SCNetworkReachabilityContext context = { 0, ( __bridge void *)self, NULL, NULL, NULL };
    SCNetworkReachabilitySetCallback(_reachability, HippyReachabilityCallback, &context);
    SCNetworkReachabilityScheduleWithRunLoop(_reachability, CFRunLoopGetMain(), kCFRunLoopCommonModes);
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

HIPPY_EXPORT_METHOD(getCurrentConnectivity:(HippyPromiseResolveBlock)resolve
                  reject:(__unused HippyPromiseRejectBlock)reject)
{
  resolve(@{@"network_info": _status ?: HippyReachabilityStateUnknown});
}

@end
