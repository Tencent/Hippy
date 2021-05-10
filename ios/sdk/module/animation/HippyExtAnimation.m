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

#import "HippyExtAnimation.h"
#import "HippyExtAnimation+Group.h"
#import "HippyExtAnimation+Value.h"
#import "HippyAssert.h"
#import "UIView+HippyAnimationProtocol.h"

@implementation HippyExtAnimation

+ (NSDictionary *)animationKeyMap {
    static NSDictionary *animationMap = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        if (animationMap == nil) {
            animationMap = @{
                @"position.x": @[@"left", @"right"],
                @"position.y": @[@"top", @"bottom"],
                @"bounds.size.width": @[@"width"],
                @"bounds.size.height": @[@"height"],
                @"opacity": @[@"opacity"],
                @"transform.rotation.z": @[@"rotate", @"rotateZ"],
                @"transform.rotation.x": @[@"rotateX"],
                @"transform.rotation.y": @[@"rotateY"],
                @"transform.scale": @[@"scale"],
                @"transform.scale.x": @[@"scaleX"],
                @"transform.scale.y": @[@"scaleY"],
                @"transform.translation.x": @[@"translateX"],
                @"transform.translation.y": @[@"translateY"]
            };
        }
    });
    return animationMap;
}

+ (CGFloat)convertToRadians:(id)json {
    if ([json isKindOfClass:[NSString class]]) {
        NSString *stringValue = (NSString *)json;
        if ([stringValue hasSuffix:@"deg"]) {
            CGFloat degrees = [[stringValue substringToIndex:stringValue.length - 3] floatValue];
            return degrees * M_PI / 180;
        }
        if ([stringValue hasSuffix:@"rad"]) {
            return [[stringValue substringToIndex:stringValue.length - 3] floatValue];
        }
    }
    return [json floatValue];
}

- (instancetype)initWithMode:(NSString *)mode animationId:(NSNumber *)animationID config:(NSDictionary *)config {
    if (self = [super init]) {
        _state = HippyExtAnimationInitState;
        _animationId = animationID;
        _duration = [config[@"duration"] doubleValue] / 1000;
        _delay = [config[@"delay"] doubleValue] / 1000;
        _startValue = [config[@"startValue"] doubleValue];
        _endValue = [config[@"toValue"] doubleValue];
        _repeatCount = [config[@"repeatCount"] integerValue];
        _repeatCount = _repeatCount == -1 ? MAXFLOAT : MAX(1, _repeatCount);

        NSString *valueTypeStr = config[@"valueType"];
        // value type
        _valueType = HippyExtAnimationValueTypeNone;
        if ([valueTypeStr isEqualToString:@"deg"]) {
            _valueType = HippyExtAnimationValueTypeDeg;
        } else if ([valueTypeStr isEqualToString:@"rad"]) {
            _valueType = HippyExtAnimationValueTypeRad;
        }

        NSString *directionTypeStr = config[@"direction"];
        _directionType = HippyExtAnimationDirectionCenter;
        if ([directionTypeStr isEqualToString:@"left"]) {
            _directionType = HippyExtAnimationDirectionLeft;
        } else if ([directionTypeStr isEqualToString:@"right"]) {
            _directionType = HippyExtAnimationDirectionRight;
        } else if ([directionTypeStr isEqualToString:@"bottom"]) {
            _directionType = HippyExtAnimationDirectionBottom;
        } else if ([directionTypeStr isEqualToString:@"top"]) {
            _directionType = HippyExtAnimationDirectionTop;
        }

        // timing function
        NSString *timingFunction = config[@"timingFunction"];
        if ([timingFunction isEqualToString:@"easeIn"]) {
            _timingFunction = kCAMediaTimingFunctionEaseIn;
        } else if ([timingFunction isEqualToString:@"easeOut"]) {
            _timingFunction = kCAMediaTimingFunctionEaseOut;
        } else if ([timingFunction isEqualToString:@"easeInOut"]) {
            _timingFunction = kCAMediaTimingFunctionEaseInEaseOut;
        } else if ([timingFunction isEqualToString:@"linear"]) {
            _timingFunction = kCAMediaTimingFunctionLinear;
        } else {
            _timingFunction = kCAMediaTimingFunctionEaseIn;
        }
    }
    return self;
}

- (void)updateAnimation:(NSDictionary *)config {
    _duration = config[@"duration"] ? [config[@"duration"] doubleValue] / 1000 : _duration;
    _delay = config[@"delay"] ? [config[@"delay"] doubleValue] / 1000 : _delay;
    _startValue = config[@"startValue"] ? [config[@"startValue"] doubleValue] : _startValue;
    _endValue = config[@"toValue"] ? [config[@"toValue"] doubleValue] : _endValue;
    _repeatCount = config[@"repeatCount"] ? [config[@"repeatCount"] integerValue] : _repeatCount;
    _repeatCount = _repeatCount == -1 ? MAXFLOAT : MAX(1, _repeatCount);

    NSString *valueTypeStr = config[@"valueType"];
    // value type
    if (valueTypeStr) {
        _valueType = HippyExtAnimationValueTypeNone;
        if ([valueTypeStr isEqualToString:@"deg"]) {
            _valueType = HippyExtAnimationValueTypeDeg;
        } else if ([valueTypeStr isEqualToString:@"rad"]) {
            _valueType = HippyExtAnimationValueTypeRad;
        }
    }

    if (config[@"direction"]) {
        NSString *directionTypeStr = config[@"direction"];
        _directionType = HippyExtAnimationDirectionCenter;
        if ([directionTypeStr isEqualToString:@"left"]) {
            _directionType = HippyExtAnimationDirectionLeft;
        } else if ([directionTypeStr isEqualToString:@"right"]) {
            _directionType = HippyExtAnimationDirectionRight;
        } else if ([directionTypeStr isEqualToString:@"bottom"]) {
            _directionType = HippyExtAnimationDirectionBottom;
        } else if ([directionTypeStr isEqualToString:@"top"]) {
            _directionType = HippyExtAnimationDirectionTop;
        }
    }

    // timing function
    if (config[@"timingFunction"]) {
        NSString *timingFunction = config[@"timingFunction"];
        if ([timingFunction isEqualToString:@"easeIn"]) {
            _timingFunction = kCAMediaTimingFunctionEaseIn;
        } else if ([timingFunction isEqualToString:@"easeOut"]) {
            _timingFunction = kCAMediaTimingFunctionEaseOut;
        } else if ([timingFunction isEqualToString:@"easeInOut"]) {
            _timingFunction = kCAMediaTimingFunctionEaseInEaseOut;
        } else if ([timingFunction isEqualToString:@"linear"]) {
            _timingFunction = kCAMediaTimingFunctionLinear;
        } else {
            _timingFunction = kCAMediaTimingFunctionDefault;
        }
    }
}

- (CAAnimation *)animationOfView:(UIView *)view forProp:(NSString *)prop {
    CAAnimation *ani = [view animation:self keyPath:prop];
    if (ani) {
        return ani;
    }
    NSString *animationKey = nil;
    NSDictionary *animationKeyMap = [[self class] animationKeyMap];
    for (NSString *key in animationKeyMap) {
        NSArray *maps = animationKeyMap[key];
        if ([maps containsObject:prop]) {
            animationKey = key;
            break;
        }
    }

    if (animationKey == nil) {
        HippyAssert(animationKey != nil, @"[%@] illge animaton prop", prop);
        return nil;
    }

    CABasicAnimation *animation = [CABasicAnimation animationWithKeyPath:animationKey];

    if ([animationKey hasPrefix:@"transform"]) {
        if (_valueType == HippyExtAnimationValueTypeDeg) {
            self.fromValue = @(_startValue * M_PI / 180);
            self.toValue = @(_endValue * M_PI / 180);
        } else {
            self.fromValue = @(_startValue);
            self.toValue = @(_endValue);
        }
    } else if ([animationKey isEqualToString:@"position.x"] || [animationKey isEqualToString:@"position.y"]) {
        [self calcValueWithCenter:view.center forProp:prop];
    } else if ([animationKey isEqualToString:@"bounds.size.width"]) {
        CGPoint position = view.layer.position;
        if (_directionType == HippyExtAnimationDirectionLeft) {
            view.layer.anchorPoint = CGPointMake(0, .5);
            view.layer.position = CGPointMake(position.x - CGRectGetWidth(view.frame) / 2, position.y);
        } else if (_directionType == HippyExtAnimationDirectionRight) {
            view.layer.anchorPoint = CGPointMake(1, .5);
            view.layer.position = CGPointMake(position.x + CGRectGetWidth(view.frame) / 2, position.y);
        } else {
            view.layer.anchorPoint = CGPointMake(.5, .5);
        }
        self.fromValue = @(_startValue);
        self.toValue = @(_endValue);
    } else if ([animationKey isEqualToString:@"bounds.size.height"]) {
        CGPoint position = view.layer.position;
        if (_directionType == HippyExtAnimationDirectionTop) {
            view.layer.position = CGPointMake(position.x, position.y - CGRectGetHeight(view.frame) / 2);
            view.layer.anchorPoint = CGPointMake(0.5, 0);
        } else if (_directionType == HippyExtAnimationDirectionBottom) {
            view.layer.position = CGPointMake(position.x, position.y + CGRectGetHeight(view.frame) / 2);
            view.layer.anchorPoint = CGPointMake(.5, 1);
        } else
            view.layer.anchorPoint = CGPointMake(0.5, 0.5);

        self.fromValue = @(_startValue);
        self.toValue = @(_endValue);
    } else {
        self.fromValue = @(_startValue);
        self.toValue = @(_endValue);
    }

    if (self.fromValue && self.toValue) {
        animation.fromValue = self.fromValue;
        animation.toValue = self.toValue;
    } else if (self.byValue) {
        animation.byValue = self.byValue;
    }
    animation.duration = _duration;
    if (fabs(_delay) > CGFLOAT_MIN) {
        animation.beginTime = CACurrentMediaTime() + _delay;
    }
    animation.timingFunction = [CAMediaTimingFunction functionWithName:_timingFunction];
    animation.repeatCount = _repeatCount;
    animation.removedOnCompletion = NO;
    animation.fillMode = kCAFillModeForwards;

    return animation;
}

@end
