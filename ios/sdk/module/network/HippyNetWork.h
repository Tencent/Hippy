//
//  HPNetWork.h
//  Hippy
//
//  Created by pennyli on 2018/1/9.
//  Copyright © 2018年 pennyli. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "HippyBridgeModule.h"

@interface HippyNetWork : NSObject <HippyBridgeModule, NSURLSessionDataDelegate>
//子类覆盖实现，返回NSURLProtocol代理
- (NSArray<Class> *) protocolClasses;
//如果已经存在对应的value值，那这个方法将追加value而不是覆盖
- (NSDictionary<NSString *, NSString *> *)extraHeaders;
@end
