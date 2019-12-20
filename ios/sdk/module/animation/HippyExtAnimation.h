//
//  HippyExtAnimation.h
//  HippyNative
//
//  Created by pennyli on 2017/12/26.
//  Copyright © 2017年 pennyli. All rights reserved.
//
//这个文件从HPAnimation改名而来
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <QuartzCore/QuartzCore.h>
@class HippyExtAnimation;

typedef NS_ENUM(NSInteger, HippyExtAnimationValueType) {
    HippyExtAnimationValueTypeNone,
    HippyExtAnimationValueTypeRad,
    HippyExtAnimationValueTypeDeg
};

typedef NS_ENUM(NSInteger, HippyExtAnimationDirection) {
    HippyExtAnimationDirectionCenter,
    HippyExtAnimationDirectionLeft,
    HippyExtAnimationDirectionTop,
    HippyExtAnimationDirectionBottom,
    HippyExtAnimationDirectionRight
};
typedef NS_ENUM(NSInteger, HippyExtAnimationState) {
	HippyExtAnimationInitState,
	HippyExtAnimationReadyState,
	HippyExtAnimationStartedState,
	HippyExtAnimationFinishState
};

@interface HippyExtAnimation : NSObject <CAAnimationDelegate>

@property (nonatomic, assign) double startValue;
@property (nonatomic, assign) double endValue;
@property (nonatomic, assign, readonly) NSTimeInterval delay;
@property (nonatomic, assign, readonly) float repeatCount;
@property (nonatomic, strong, readonly) NSNumber *animationId;
@property (nonatomic, assign) NSTimeInterval duration;
@property (nonatomic, strong, readonly) NSString *timingFunction;
@property (nonatomic, assign, readonly) HippyExtAnimationValueType valueType;
@property (nonatomic, assign, readonly) HippyExtAnimationDirection directionType;
@property (nonatomic, copy) NSNumber *parentAnimationId;
@property (nonatomic, assign) HippyExtAnimationState state;


- (void)updateAnimation:(NSDictionary *)config;

- (CAAnimation *)animationOfView:(UIView *)view forProp:(NSString *)prop;

- (instancetype)initWithMode:(NSString *)mode animationId:(NSNumber *)animationID config:(NSDictionary *)config;

@end
