//
//  HPAnimationModule.h
//  HippyNative
//
//  Created by pennyli on 2017/12/25.
//  Copyright © 2017年 pennyli. All rights reserved.
//


#import <Foundation/Foundation.h>
#import "HippyInvalidating.h"

@interface HippyExtAnimationIdCount : NSObject
- (void) addCountForAnimationId:(NSNumber *)animationID;
- (BOOL) subtractionCountForAnimationId:(NSNumber *)animationID;
- (NSUInteger) countForAnimationId:(NSNumber *)animationID;
@end

@interface HippyExtAnimationModule : NSObject<HippyBridgeModule, HippyInvalidating>

//- (NSDictionary *)bindAnimaiton:(NSDictionary *)params;
- (NSDictionary *)bindAnimaiton:(NSDictionary *)params viewTag:(NSNumber *)viewTag rootTag:(NSNumber *)rootTag;
- (void)connectAnimationToView:(UIView *)view;
@end
