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

#import "HippyNextAnimation.h"
#import "HippyAssert.h"
#import "UIView+Hippy.h"
#import "HippyShadowView.h"
#import "HippyShadowText.h"
#import "HPOPCGUtils.h"
#import "HPTransformationMatrix.h"
#import <objc/runtime.h>


// shadow view supported animations
// Note: All non-special value attributes in ShadowView support animation,
// and only a few common ones are specially optimized here.
static NSString *const HippyAnimationPropWidth = @"width";
static NSString *const HippyAnimationPropHeight = @"height";
static NSString *const HippyAnimationPropTop = @"top";
static NSString *const HippyAnimationPropBottom = @"bottom";
static NSString *const HippyAnimationPropLeft = @"left";
static NSString *const HippyAnimationPropRight = @"right";

// view supported animations
static NSString *const HippyAnimationPropOpacity = @"opacity";
static NSString *const HippyAnimationPropBackgroundColor = @"backgroundColor";
static NSString *const HippyAnimationPropBorderColor = @"borderColor";
static NSString *const HippyAnimationPropBorderWidth = @"borderWidth";
static NSString *const HippyAnimationPropCornerRadius = @"cornerRadius";

// transform animations
static NSString *const HippyAnimationPropRotate = @"rotate";
static NSString *const HippyAnimationPropRotateZ = @"rotateZ";
static NSString *const HippyAnimationPropRotateX = @"rotateX";
static NSString *const HippyAnimationPropRotateY = @"rotateY";
static NSString *const HippyAnimationPropScale = @"scale";
static NSString *const HippyAnimationPropScaleX = @"scaleX";
static NSString *const HippyAnimationPropScaleY = @"scaleY";
static NSString *const HippyAnimationPropTranslateX = @"translateX";
static NSString *const HippyAnimationPropTranslateY = @"translateY";
static NSString *const HippyAnimationPropTranslateZ = @"translateZ";
static NSString *const HippyAnimationPropTranslateXY = @"translateXY";
static NSString *const HippyAnimationPropSkewX = @"skewX";
static NSString *const HippyAnimationPropSkewY = @"skewY";
static NSString *const HippyAnimationPropPerspective = @"perspective";

// animation config
static NSString *const HippyAnimationConfigKeyDuration = @"duration";
static NSString *const HippyAnimationConfigKeyDelay = @"delay";
static NSString *const HippyAnimationConfigKeyFromValue = @"startValue";
static NSString *const HippyAnimationConfigKeyToValue = @"toValue";
static NSString *const HippyAnimationConfigKeyRepeatCount = @"repeatCount";
static NSString *const HippyAnimationConfigKeyValueType = @"valueType";
static NSString *const HippyAnimationConfigKeyValueTypeDeg = @"deg";
static NSString *const HippyAnimationConfigKeyValueTypeRad = @"rad";
static NSString *const HippyAnimationConfigKeyTimingFunction = @"timingFunction";


#pragma mark -

using namespace HPWebCore;

#define DECOMPOSE_TRANSFORM(L) \
    TransformationMatrix _m(L.transform); \
    TransformationMatrix::DecomposedType _d; \
    _m.decompose(_d);

#define RECOMPOSE_TRANSFORM(L) \
    _m.recompose(_d); \
    L.transform = _m.transform3d();

NS_INLINE void ensureNonZeroValue(CGFloat &f) {
    if (f == 0) {
        f = 1e-6;
    }
}

inline double deg2rad(double d)  { return d * M_PI / 180.0; }
inline double rad2deg(double r)  { return r * 180.0 / M_PI; }



@interface HippyShadowView (HippyNextAnimation)

/// Prop dictionary created during animation,
/// used to update the UI at the end of the animation frame.
@property (nonatomic, strong) NSDictionary *animPropDict;

@end



@interface HippyNextAnimation ()

@end

@implementation HippyNextAnimation

+ (instancetype)animationFromConfigParams:(NSDictionary *)params {
    // create animation from params
    HippyNextAnimation *anim = [HippyNextAnimation animation];
    anim.duration = [params[HippyAnimationConfigKeyDuration] doubleValue] / 1000.0;
    anim.delayTime = [params[HippyAnimationConfigKeyDelay] doubleValue] / 1000.0;
    anim.originFromValue = params[HippyAnimationConfigKeyFromValue];
    anim.originToValue = params[HippyAnimationConfigKeyToValue];
    NSInteger repeatCount = [params[HippyAnimationConfigKeyRepeatCount] integerValue];
    anim.repeatCount = repeatCount == -1 ? INT_MAX : MAX(1, repeatCount);
    anim.repeatForever = repeatCount == -1;
    anim.timingFunction = [self makeTimingFunctionFromConfig:params[HippyAnimationConfigKeyTimingFunction]];
    
    NSString *valueTypeStr = params[HippyAnimationConfigKeyValueType];
    if ([valueTypeStr isEqualToString:HippyAnimationConfigKeyValueTypeDeg]) {
        anim.valueType = HippyNextAnimationValueTypeDeg;
    } else if ([valueTypeStr isEqualToString:HippyAnimationConfigKeyValueTypeRad]) {
        anim.valueType = HippyNextAnimationValueTypeRad;
    } else {
        anim.valueType = HippyNextAnimationValueTypeUndefined;
    }
    return anim;
}

- (void)updateAnimation:(NSDictionary *)updatedConfig {
    if (id durationObj = updatedConfig[HippyAnimationConfigKeyDuration]) {
        self.duration = [durationObj doubleValue] / 1000.0;
    }
    if (id delayObj = updatedConfig[HippyAnimationConfigKeyDelay]) {
        self.delayTime = [delayObj doubleValue] / 1000.0;
    }
    if (id startValue = updatedConfig[HippyAnimationConfigKeyFromValue]) {
        self.originFromValue = startValue;
    }
    if (id endValue = updatedConfig[HippyAnimationConfigKeyToValue]) {
        self.originToValue = endValue;
    }
    if (id repeatCountObj = updatedConfig[HippyAnimationConfigKeyRepeatCount]) {
        NSInteger repeatCount = [repeatCountObj integerValue];
        self.repeatCount = repeatCount == -1 ? INT_MAX : MAX(1, repeatCount);
        self.repeatForever = repeatCount == -1;
    }
    
    NSString *valueTypeStr = updatedConfig[HippyAnimationConfigKeyValueType];
    if (valueTypeStr) {
        if ([valueTypeStr isEqualToString:HippyAnimationConfigKeyValueTypeDeg]) {
            self.valueType = HippyNextAnimationValueTypeDeg;
        } else if ([valueTypeStr isEqualToString:HippyAnimationConfigKeyValueTypeRad]) {
            self.valueType = HippyNextAnimationValueTypeRad;
        } else {
            self.valueType = HippyNextAnimationValueTypeUndefined;
        }
    }
    
    if (id timingObj = updatedConfig[HippyAnimationConfigKeyTimingFunction]) {
        self.timingFunction = [HippyNextAnimation makeTimingFunctionFromConfig:timingObj];
    }
}

- (void)dealloc {
    NSLog(@"%@ dealloc", self.description);
}

#pragma mark - Accessors

- (id)getPretreatedFromValueForAnimType:(NSString *)type {
    if (needTranslateToRadValue(type) && HippyNextAnimationValueTypeRad != self.valueType) {
        return @(deg2rad([_originFromValue doubleValue]));
    }
    return _originFromValue;
}

- (id)getPretreatedToValueForAnimType:(NSString *)type {
    if (needTranslateToRadValue(type) && HippyNextAnimationValueTypeRad != self.valueType) {
        return @(deg2rad([_originToValue doubleValue]));
    }
    return _originToValue;
}


#pragma mark - Public Methods

static BOOL isTransformAnimationProp(NSString *prop) {
    static NSArray *transformConfigProps;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        transformConfigProps = @[
            HippyAnimationPropRotate,
            HippyAnimationPropRotateZ,
            HippyAnimationPropRotateX,
            HippyAnimationPropRotateY,
            HippyAnimationPropScale,
            HippyAnimationPropScaleX,
            HippyAnimationPropScaleY,
            HippyAnimationPropTranslateX,
            HippyAnimationPropTranslateY,
            HippyAnimationPropTranslateZ,
            HippyAnimationPropTranslateXY,
            HippyAnimationPropSkewX,
            HippyAnimationPropSkewY,
            HippyAnimationPropPerspective,
        ];
    });
    return [transformConfigProps containsObject:prop];
}

/// Is animation prop belong to shadow view
/// - Parameter prop: layout prop
+ (BOOL)isShadowViewAnimationProp:(NSString *)prop treatTransformAsShadowAnimation:(BOOL)isShadow {
    static NSArray *viewAnimProps;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        viewAnimProps = @[
            HippyAnimationPropOpacity,
            HippyAnimationPropBackgroundColor,
            HippyAnimationPropBorderColor,
            HippyAnimationPropBorderWidth,
            HippyAnimationPropCornerRadius,
        ];
    });
    return !([viewAnimProps containsObject:prop] || (!isShadow && isTransformAnimationProp(prop)));
}

- (BOOL)prepareForTarget:(id)target withType:(NSString *)type {
    if ([target isKindOfClass:HippyShadowView.class]) {
        return [self prepareForShadowView:target withType:type];
    } else {
        return [self prepareForView:target withType:type];
    }
    return YES;
}

#define HIPPY_SHADOW_ANIM_PROPERTY(prop) \
[HPOPAnimatableProperty propertyWithName:[NSString stringWithFormat:@"hippy.shadow.anim.%s", #prop] \
                            initializer:^(HPOPMutableAnimatableProperty *p) { \
    p.readBlock = ^(HippyShadowView *obj, CGFloat values[]) { \
        values[0] = obj.prop; \
    }; \
    p.writeBlock = ^(HippyShadowView *obj, const CGFloat values[], const CGFloat previousValues[]) { \
        obj.prop = values[0]; \
    }; \
    p.threshold = 1.0; \
}]

- (BOOL)prepareForShadowView:(HippyShadowView *)shadowView withType:(NSString *)type {
    HPOPAnimatableProperty *property = nil;
    
    if ([type isEqualToString:HippyAnimationPropWidth]) {
        property = HIPPY_SHADOW_ANIM_PROPERTY(width);
    } else if ([type isEqualToString:HippyAnimationPropHeight]) {
        property = HIPPY_SHADOW_ANIM_PROPERTY(height);
    } else if ([type isEqualToString:HippyAnimationPropTop]) {
        property = HIPPY_SHADOW_ANIM_PROPERTY(top);
    } else if ([type isEqualToString:HippyAnimationPropBottom]) {
        property = HIPPY_SHADOW_ANIM_PROPERTY(bottom);
    } else if ([type isEqualToString:HippyAnimationPropLeft]) {
        property = HIPPY_SHADOW_ANIM_PROPERTY(left);
    } else if ([type isEqualToString:HippyAnimationPropRight]) {
        property = HIPPY_SHADOW_ANIM_PROPERTY(right);
    } if ([type isEqualToString:@"color"]) {
        property = [HPOPAnimatableProperty propertyWithName:[NSString stringWithFormat:@"hippy.shadow.anim.%s", "color"]
                                              initializer:^(HPOPMutableAnimatableProperty *p) {
            p.readBlock = ^(HippyShadowView *obj, CGFloat values[]) {
                HippyShadowText *shadowText = (HippyShadowText *)obj;
                POPCGColorGetRGBAComponents(shadowText.color.CGColor, values);
            };
            p.writeBlock = ^(HippyShadowView *obj, const CGFloat values[], const CGFloat previousValues[]) {
                if ([obj isKindOfClass:HippyShadowText.class]) {
                    CGColorRef color = POPCGColorRGBACreate(values);
                    HippyShadowText *shadowText = (HippyShadowText *)obj;
                    shadowText.color = [UIColor colorWithCGColor:color];
                    CGColorRelease(color);
                }
            };
            p.threshold = 0.01;
        }];
    } else {
        property = [HPOPAnimatableProperty propertyWithName:@"com.hippy.shadowCommon"
                                                               initializer:^(HPOPMutableAnimatableProperty *prop) {
            prop.writeBlock = ^(HippyShadowView *obj, const CGFloat values[], const CGFloat previousValues[]) {
                if (isTransformAnimationProp(type)) {
                    obj.animPropDict = @{ @"transform" : @[ @{type : @(values[0])} ] };
                } else {
                    obj.animPropDict = @{ type : @(values[0]) };
                }
            };
        }];
    }
    
    if (!property) {
        HippyAssert(NO, @"[%@] unsupported animaton prop", type);
        return NO;
    }
    
    // 1. first get pre-treated values
    id pretreatedFromValue = [self getPretreatedFromValueForAnimType:type];
    id pretreadedToValue = [self getPretreatedToValueForAnimType:type];
    
    // 2. adapt value type with pop
    if ([type.lowercaseString hasSuffix:@"color"]) {
        UIColor *fromColor = [HippyConvert UIColor:pretreatedFromValue];
        UIColor *toColor = [HippyConvert UIColor:pretreadedToValue];
        self.fromValue = fromColor;
        self.toValue = toColor;
    } else {
        self.fromValue = pretreatedFromValue;
        self.toValue = pretreadedToValue;
    }
    
    self.property = property;
    self.customRunningQueue = HippyGetUIManagerQueue();
    self.targetObject = shadowView;
    
    __weak __typeof(self)weakSelf = self;
    self.animationDidApplyBlock = ^(HPOPAnimation *animation){
        __strong __typeof(weakSelf)strongSelf = weakSelf;
        NSDictionary *updatedDict = [strongSelf.targetObject animPropDict];
        [strongSelf.controlDelegate requestUpdateUILayout:strongSelf withNextFrameProp:updatedDict];
    };
    
    return YES;
}

- (BOOL)prepareForView:(UIView *)view withType:(NSString *)type {
    HPOPAnimatableProperty *property = [HippyNextAnimation getAnimatablePropertyFromType:type];
    if (!property) {
        HippyAssert(NO, @"[%@] unsupported animaton prop", type);
        return NO;
    }
    self.property = property;
    
    
    // 1. first get pre-treated values
    id pretreatedFromValue = [self getPretreatedFromValueForAnimType:type];
    id pretreadedToValue = [self getPretreatedToValueForAnimType:type];
    
    // 2. adapt value type with pop
    if ([type isEqualToString:HippyAnimationPropScale] ||
        [type isEqualToString:kHPOPLayerTranslationXY]) {
        self.fromValue = [NSValue valueWithCGPoint:CGPointMake([pretreatedFromValue doubleValue],
                                                               [pretreatedFromValue doubleValue])];
        self.toValue = [NSValue valueWithCGPoint:CGPointMake([pretreadedToValue doubleValue],
                                                             [pretreadedToValue doubleValue])];
    } else if ([type.lowercaseString hasSuffix:@"color"]) {
        UIColor *fromColor = [HippyConvert UIColor:pretreatedFromValue];
        UIColor *toColor = [HippyConvert UIColor:pretreadedToValue];
        self.fromValue = fromColor;
        self.toValue = toColor;
    } else {
        self.fromValue = pretreatedFromValue;
        self.toValue = pretreadedToValue;
    }
    
    self.customRunningQueue = nil;
    self.targetObject = view.layer;
    return YES;
}

- (void)startAnimation {
    self.beginTime = CACurrentMediaTime() + self.delayTime;
    [self.targetObject hpop_addAnimation:self forKey:self.animationId.stringValue];
}


#pragma mark - Utils

+ (CAMediaTimingFunction *)makeTimingFunctionFromConfig:(NSString *)timing {
    CAMediaTimingFunction *timingFunction;
    if (timing) {
        if ([timing isEqualToString:@"ease-in"]) {
            timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseIn];
        } else if ([timing isEqualToString:@"ease-out"]) {
            timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseOut];
        } else if ([timing isEqualToString:@"ease-in-out"]) {
            timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
        } else if ([timing isEqualToString:@"linear"]) {
            timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionLinear];
        } else {
            CAMediaTimingFunction *func = [self makeCustomBezierFunction:timing];
            if (func) {
                timingFunction = func;
            } else {
                timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionDefault];
            }
        }
    }
    return timingFunction;
}

+ (nullable CAMediaTimingFunction *)makeCustomBezierFunction:(NSString *)timingFunction {
    NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"^cubic-bezier\\(([^,]*),([^,]*),([^,]*),([^,]*)\\)$"
                                                                           options:NSRegularExpressionCaseInsensitive error:nil];
    if (!regex) return nil;
    NSString *trimmedTimingFunction = [timingFunction stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    NSRange searchedRange = NSMakeRange(0, [trimmedTimingFunction length]);
    NSArray<NSTextCheckingResult *> *matches = [regex matchesInString:trimmedTimingFunction options:0 range:searchedRange];
    if (matches.count <= 0) return nil;
    NSTextCheckingResult *match = matches[0];
    float (^getValue)(NSUInteger) = ^(NSUInteger index) {
        NSRange range = [match rangeAtIndex: index];
        NSString *numberString = [trimmedTimingFunction substringWithRange:range];
        return [numberString floatValue];
    };
    return [CAMediaTimingFunction functionWithControlPoints:getValue(1) :getValue(2) :getValue(3) :getValue(4)];
}


#pragma mark -

NS_INLINE BOOL needTranslateToRadValue(NSString *animType) {
    return [animType hasPrefix:@"rotate"] || [animType hasPrefix:@"skew"];
}

+ (NSDictionary *)animationKeyMap {
    static NSDictionary *animationMap = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        if (animationMap == nil) {
            animationMap = @{
                kHPOPLayerBackgroundColor : @[HippyAnimationPropBackgroundColor],
                kHPOPLayerCornerRadius : @[HippyAnimationPropCornerRadius],
                kHPOPLayerBorderWidth : @[HippyAnimationPropBorderWidth],
                kHPOPLayerBorderColor : @[HippyAnimationPropBorderColor],
                kHPOPLayerOpacity : @[HippyAnimationPropOpacity],
                kHPOPLayerRotation : @[HippyAnimationPropRotate, HippyAnimationPropRotateZ],
                kHPOPLayerRotationX : @[HippyAnimationPropRotateX],
                // POP's RotateY has bug: see, see: https://github.com/facebookarchive/pop/issues/155
                // rotate value cannot over 90 degree, so we use shadow animation to replace it.
                kHPOPLayerRotationY : @[HippyAnimationPropRotateY],
                kHPOPLayerScaleXY : @[HippyAnimationPropScale],
                kHPOPLayerScaleX : @[HippyAnimationPropScaleX],
                kHPOPLayerScaleY : @[HippyAnimationPropScaleY],
                kHPOPLayerTranslationX : @[HippyAnimationPropTranslateX],
                kHPOPLayerTranslationY : @[HippyAnimationPropTranslateY],
                kHPOPLayerTranslationZ : @[HippyAnimationPropTranslateZ],
                kHPOPLayerTranslationXY : @[HippyAnimationPropTranslateXY],
            };
        }
    });
    return animationMap;
}

+ (HPOPAnimatableProperty *)getAnimatablePropertyFromType:(NSString *)type {
    NSString *propertyName = nil;
    NSDictionary *animationKeyMap = [self animationKeyMap];
    for (NSString *key in animationKeyMap) {
        NSArray *maps = animationKeyMap[key];
        if ([maps containsObject:type]) {
            propertyName = key;
            break;
        }
    }
    
    if (propertyName) {
        return [HPOPAnimatableProperty propertyWithName:propertyName];
    } else {
        if ([type isEqualToString:HippyAnimationPropSkewX]) {
            HPOPAnimatableProperty *p = [HPOPAnimatableProperty propertyWithName:@"com.hippy.skewX"
                                                                   initializer:^(HPOPMutableAnimatableProperty *prop) {
                prop.writeBlock = ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
                    CGFloat f = values[0];
                    ensureNonZeroValue(f);
                    TransformationMatrix m(obj.transform);
                    m.setM21(tan(f));
                    obj.transform = m.transform3d();
                };
                prop.threshold = 0.01; // keep same to kHPOPThresholdRotation;
            }];
            return p;
        } else if ([type isEqualToString:HippyAnimationPropSkewY]) {
            HPOPAnimatableProperty *p = [HPOPAnimatableProperty propertyWithName:@"com.hippy.skewY"
                                                                   initializer:^(HPOPMutableAnimatableProperty *prop) {
                prop.writeBlock = ^(CALayer *obj, const CGFloat values[], const CGFloat previousValues[]) {
                    CGFloat f = values[0];
                    ensureNonZeroValue(f);
                    TransformationMatrix m(obj.transform);
                    m.setM12(tan(f));
                    obj.transform = m.transform3d();
                };
                prop.threshold = 0.01; // keep same to kHPOPThresholdRotation;
            }];
            return p;
        }
    }
    return nil;
}


@end


#pragma mark -

@implementation HippyShadowView (HippyNextAnimation)

- (NSDictionary *)animPropDict {
    return objc_getAssociatedObject(self, @selector(animPropDict));
}

- (void)setAnimPropDict:(NSDictionary *)animPropDict {
    objc_setAssociatedObject(self, @selector(animPropDict), animPropDict, OBJC_ASSOCIATION_RETAIN);
}

@end
