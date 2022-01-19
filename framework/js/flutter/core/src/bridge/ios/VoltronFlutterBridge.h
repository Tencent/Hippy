/*
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#import <Foundation/Foundation.h>
#import "bridge/bridge_runtime.h"
#import "VoltronJSCExecutor.h"

NS_ASSUME_NONNULL_BEGIN

typedef void (^VoltronFlutterCallback)(id _Nullable result, NSError * _Nullable error);

@interface VoltronFlutterBridge : NSObject

@property (nonatomic, strong) VoltronJSCExecutor *jscExecutor;

@property (nonatomic, assign) std::shared_ptr<voltron::PlatformRuntime> platformRuntime;

- (void)initJSFramework:(NSString *)globalConfig completion:(void (^)(BOOL) _Nullable)completion;

- (void)executeScript:(NSData *)script url:(NSURL *)url completion:(void (^)(NSError * _Nullable) _Nullable)completion;

- (void)callFunctionOnAction:(NSString *)action
                   arguments:(NSDictionary *)args
                    callback:(VoltronFlutterCallback _Nullable)onComplete;

@end

NS_ASSUME_NONNULL_END
