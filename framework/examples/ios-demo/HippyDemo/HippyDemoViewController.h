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
#import "HippyPageCache.h"
#import "DemoBaseViewController.h"

NS_ASSUME_NONNULL_BEGIN

@class HippyPageCache;

@interface HippyDemoViewController : DemoBaseViewController

@property (nonatomic, assign, readonly) DriverType driverType;
@property (nonatomic, assign, readonly) RenderType renderType;
@property (nonatomic, assign, readonly) BOOL useHermesEngine;
@property (nonatomic, strong, readonly, nullable) NSURL *debugURL;
@property (nonatomic, assign, readonly, getter=isDebugMode) BOOL debugMode;

- (instancetype)initWithDriverType:(DriverType)driverType
                        renderType:(RenderType)renderType
                   useHermesEngine:(BOOL)usingHermes
                          debugURL:(NSURL *)debugURL
                       isDebugMode:(BOOL)isDebugMode;

- (instancetype)initWithPageCache:(HippyPageCache *)pageCache;

@end

NS_ASSUME_NONNULL_END
