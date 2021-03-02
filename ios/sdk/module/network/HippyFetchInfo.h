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

#import <UIKit/UIKit.h>
#import "HippyBridgeModule.h"
NS_ASSUME_NONNULL_BEGIN

@interface HippyFetchInfo : NSObject
@property (nonatomic, readonly, assign) BOOL report302Status;
@property (nonatomic, readonly, strong) HippyPromiseResolveBlock resolveBlock;
@property (nonatomic, readonly, strong) HippyPromiseRejectBlock rejectBlock;
@property (nonatomic, readonly, strong) NSMutableData *fetchData;

- (instancetype)initWithResolveBlock:(HippyPromiseResolveBlock)resolveBlock
                         rejectBlock:(HippyPromiseRejectBlock)rejectBlock
                     report302Status:(BOOL)report302Status;

@end

NS_ASSUME_NONNULL_END
