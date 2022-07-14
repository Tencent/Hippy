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

@protocol HippyBridgeArgument;

/**
 * Interceptor for methods.
 * This protocol is used for custom interception when module method calls are made
 */
@protocol HippyMethodInterceptorProtocol <NSObject>

@optional

/**
 * This method is used by the interceptor implementation to determine whether the Module method can be called
 *
 * @param moduleName module name
 * @param methodName method name
 * @param arguments arguments instances
 * @param argumentsValue arguments value
 * @param containCallback indicate whether method contains callbacks or promises
 *
 * @return can corresponding method be invoked
 */
- (BOOL)shouldInvokeWithModuleName:(NSString *)moduleName
                        methodName:(NSString *)methodName
                         arguments:(NSArray<id<HippyBridgeArgument>> *)arguments
                   argumentsValues:(NSArray *)argumentsValue
                   containCallback:(BOOL)containCallback;

/**
 * This method is used to determine whether the corresponding callback can be executed
 *
 * @param moduleName module name
 * @param methodName method name
 * @cbId callback id used for JS
 * @arguments callback arguments
 *
 * @return can corresponding callback be invoked
 */
- (BOOL)shouldCallbackBeInvokedWithModuleName:(NSString *)moduleName
                                   methodName:(NSString *)methodName
                                   callbackId:(NSNumber *)cbId
                                    arguments:(id)arguments;

@end

NS_ASSUME_NONNULL_END
