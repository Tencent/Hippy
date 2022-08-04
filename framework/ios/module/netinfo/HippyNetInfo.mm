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
#import "HippyNetInfoIntenal.h"

@interface HippyNetInfo ()<HippyNetworkTypeChangedDelegate> {
}

@end

@implementation HippyNetInfo

static NSDictionary *callbackParamFromCellType(HippyNetworkTypeObject *object) {
    if (!object) {
        return @{};
    }
    NSString *networkType = object.networkType?:HippyNetworkTypeUnknown;
    NSString *cellType = object.cellType?:HippNetworkCellTypeUnknown;
    return @{@"network_info": networkType, @"network_type":cellType};
}

HIPPY_EXPORT_MODULE()

- (void)addEventObserverForName:(NSString *)eventName {
    if ([eventName isEqualToString:@"networkStatusDidChange"]) {
        HippyNetworkTypeObject *networkType = [[HippyNetInfoIntenal sharedInstance] addNetworkTypeChangeObserver:self];
        NSDictionary *params = callbackParamFromCellType(networkType);
        [self sendEvent:@"networkStatusDidChange" params:params];

    }
}

- (void)removeEventObserverForName:(NSString *)eventName {
    if ([eventName isEqualToString:@"networkStatusDidChange"]) {
        [[HippyNetInfoIntenal sharedInstance] removeNetworkTypeChangeObserver:self];
    }
}

- (void)invalidate {
}

- (void)hippyNetworkTypeChanged:(HippyNetworkTypeObject *)networkType {
    NSDictionary *params = callbackParamFromCellType(networkType);
    [self sendEvent:@"networkStatusDidChange" params:params];
}

#pragma mark - Public API

// clang-format off
HIPPY_EXPORT_METHOD(getCurrentConnectivity:(HippyPromiseResolveBlock)resolve
                  reject:(__unused HippyPromiseRejectBlock)reject) {
    if (!resolve) {
        return;
    }
    HippyNetworkTypeObject *obj = [[HippyNetInfoIntenal sharedInstance] currentNetworkType];
    NSDictionary *dic = callbackParamFromCellType(obj);
    resolve(dic);
}
// clang-format on

@end
