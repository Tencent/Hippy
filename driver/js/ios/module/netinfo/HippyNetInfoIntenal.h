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

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

extern NSString *const HippyNetworkTypeUnknown;
extern NSString *const HippyNetworkTypeNone;
extern NSString *const HippyNetworkTypeWifi;
extern NSString *const HippyNetworkTypeCell;

extern  NSString *const HippNetworkCellTypeUnknown;
extern  NSString *const HippNetworkCellTypeNone;
extern  NSString *const HippyNetworkCellType2G;
extern  NSString *const HippyNetworkCellType3G;
extern  NSString *const HippyNetworkCellType4G;
extern  NSString *const HippyNetworkCellType5G;

@interface HippyNetworkTypeObject : NSObject

/**
 * indicate network type
 * value:HippyNetworkTypeUnknown,HippyNetworkTypeNone,HippyNetworkTypeWifi,HippyNetworkTypeCell
 */
@property(nonatomic, readonly) NSString *networkType;

/**
 * indicate cell type
 */
@property(nonatomic, readonly) NSString *cellType;

- (instancetype)initWithNetworkType:(NSString *)networkType cellType:(NSString *)cellType;

- (BOOL)isEqual:(id)object;

- (BOOL)isEqualToNetowrkTypeObject:(HippyNetworkTypeObject *)object;

@end

@protocol HippyNetworkTypeChangedDelegate <NSObject>

- (void)hippyNetworkTypeChanged:(HippyNetworkTypeObject *)networkType;

@end

@interface HippyNetInfoIntenal : NSObject

+ (instancetype)sharedInstance;

- (HippyNetworkTypeObject *)currentNetworkType;

/**
 * set an observer for network changed event.
 * return current network info immediately
 */
- (HippyNetworkTypeObject *)addNetworkTypeChangeObserver:(id<HippyNetworkTypeChangedDelegate>)observer;

- (void)removeNetworkTypeChangeObserver:(id<HippyNetworkTypeChangedDelegate>)observer;

@end

NS_ASSUME_NONNULL_END
