//
//  HPEventObserverModule.h
//  HippyNative
//
//  Created by pennyli on 2017/12/19.
//  Copyright © 2017年 pennyli. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "HippyBridgeModule.h"

// ****此类必须继承才能使用****
// 注册监听事件类，JS测可以调用接口监听终端事件响应，通过sendEvent将事件发送给JS


@interface HippyEventObserverModule : NSObject <HippyBridgeModule>

- (void)addEventObserverForName:(NSString *)eventName;
- (void)removeEventObserverForName:(NSString *)eventName;

- (void)sendEvent:(NSString *)eventName params:(NSDictionary *)params;

@end
