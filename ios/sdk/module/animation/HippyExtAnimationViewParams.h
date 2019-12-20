//
//  HPAnimationViewParams.h
//  HippyNative
//
//  Created by pennyli on 2017/12/27.
//  Copyright © 2017年 pennyli. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface HippyExtAnimationViewParams : NSObject
@property (nonatomic, strong) NSDictionary *originParams;
@property (nonatomic, readonly) NSDictionary *updateParams;
@property (nonatomic, readonly) NSNumber *hippyTag;
@property (nonatomic, readonly) NSNumber *rootTag;

//大概是AnimationGroup需要用到的？单个动画应该只有一个animationId
@property (nonatomic, readonly) NSDictionary <NSString *, NSNumber *> *animationIdWithPropDictionary;

- (void)parse;

//赋值给originParams
- (instancetype)initWithParams:(NSDictionary *)params viewTag:(NSNumber *)viewTag rootTag:(NSNumber *)rootTag;

- (void)setValue:(id)value forProp:(NSString *)prop;
- (id)valueForProp:(NSString *)prop;

@end
