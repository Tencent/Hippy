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

@interface HippyBundleURLProvider : NSObject

@property (nonatomic, copy, readonly) NSString *localhostIP;   // 本地 IP
@property (nonatomic, copy, readonly) NSString *localhostPort; // 本地端口号
@property (nonatomic, copy, readonly) NSString *debugPathUrl; // hippy包路径

/**
 单例
 
 @return instancetype
 */
+ (instancetype)sharedInstance;

/**
 设置本地 IP 和 端口号
 
 @param localhostIP 本地 IP
 @param localhostPort 本地端口号
 只有在你需要真机调试的情况下才需要设置这个ip地址与端口。默认使用localhost:8082
 */
- (void)setLocalhostIP:(NSString *)localhostIP localhostPort:(NSString *)localhostPort;

/**
 设置hippy包路径 debugPathUrl
 
 @param debugPathUrl 路径名称
 */
- (void)setDebugPathUrl:(NSString *)debugPathUrl;

/**
 获取本地 localhost
 
 @return localhost
 */
- (NSString *)localhost;

/**
 获取hippy包路径 debugPathUrl
 
 @return debugPathUrl
 */
- (NSString *)debugPathUrl;

@end
