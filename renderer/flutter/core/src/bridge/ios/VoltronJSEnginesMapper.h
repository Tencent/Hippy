//
//  VoltronJSEnginesMapper.h
//  RenderCore
//
//  Created by skindhu-xp on 2021/8/29.
//

#import <Foundation/Foundation.h>
#import "core/engine.h"

@interface VoltronJSEnginesMapper : NSObject

+ (instancetype)defaultInstance;

- (std::shared_ptr<Engine>)JSEngineForKey:(NSString *)key;

- (std::shared_ptr<Engine>)createJSEngineForKey:(NSString *)key;

- (void)removeEngineForKey:(NSString *)key;

@end
