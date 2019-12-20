//
//  HippyBundleURLProvider.h
//  QQKSong
//
//  Created by Yu Abigale on 2018/11/11.
//  Copyright © 2018 Tencent. All rights reserved.
//

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
