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

#import "HippyConvert+NativeRender.h"
#import "HippyUtils.h"

@implementation HippyConvert (Transform)

static const NSUInteger kMatrixArrayLength = 4 * 4;

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

+ (CGFloat)convertDegToRadians:(CGFloat)deg {
    return deg * M_PI / 180;
}

+ (CATransform3D)CATransform3DFromMatrix:(id)json {
    CATransform3D transform = CATransform3DIdentity;
    if (!json) {
        return transform;
    }
    if (![json isKindOfClass:[NSArray class]]) {
        HippyLogError(@"[%@], a CATransform3D. Expected array for transform matrix.", json);
        return transform;
    }
    if ([json count] != kMatrixArrayLength) {
        HippyLogError(@"[%@], a CATransform3D. Expected 4x4 matrix array.", json);
        return transform;
    }
    for (NSUInteger i = 0; i < kMatrixArrayLength; i++) {
        ((CGFloat *)&transform)[i] = [HippyConvert CGFloat:json[i]];
    }
    return transform;
}

+ (CATransform3D)CATransform3D:(id)json {
    CATransform3D transform = CATransform3DIdentity;
    transform.m34 = -1.0 / 500.0;
    if (!json) {
        return transform;
    }
    if (![json isKindOfClass:[NSArray class]]) {
        HippyLogError(@"[%@],a CATransform3D. Did you pass something other than an array?", json);
        return transform;
    }
    // legacy matrix support
    if ([(NSArray *)json count] == kMatrixArrayLength && [json[0] isKindOfClass:[NSNumber class]]) {
        HippyLogWarn(
            @"[HippyConvert CATransform3D:] has deprecated a matrix as input. Pass an array of configs (which can contain a matrix key) instead.");
        return [self CATransform3DFromMatrix:json];
    }

    CGFloat zeroScaleThreshold = FLT_EPSILON;

    for (NSDictionary *transformConfig in (NSArray<NSDictionary *> *)json) {
        if (transformConfig.count != 1) {
            HippyLogError(@"[%@], a CATransform3D. You must specify exactly one property per transform object.", json);
            return transform;
        }
        NSString *property = transformConfig.allKeys[0];
        id value = HippyNilIfNull(transformConfig[property]);
        if ([property isEqualToString:@"matrix"]) {
            transform = [self CATransform3DFromMatrix:value];

        } else if ([property isEqualToString:@"perspective"]) {
            transform.m34 = -1 / [value floatValue];

        } else if ([property isEqualToString:@"rotateX"]) {
            CGFloat rotate = [self convertToRadians:value];
            transform = CATransform3DRotate(transform, rotate, 1, 0, 0);

        } else if ([property isEqualToString:@"rotateY"]) {
            CGFloat rotate = [self convertToRadians:value];
            transform = CATransform3DRotate(transform, rotate, 0, 1, 0);

        } else if ([property isEqualToString:@"rotate"] || [property isEqualToString:@"rotateZ"]) {
            CGFloat rotate = [self convertToRadians:value];
            transform = CATransform3DRotate(transform, rotate, 0, 0, 1);

        } else if ([property isEqualToString:@"scale"]) {
            CGFloat scale = [value floatValue];
            scale = ABS(scale) < zeroScaleThreshold ? zeroScaleThreshold : scale;
            transform.m34 = 0.f;
            transform = CATransform3DScale(transform, scale, scale, scale);
        } else if ([property isEqualToString:@"scaleX"]) {
            CGFloat scale = [value floatValue];
            scale = ABS(scale) < zeroScaleThreshold ? zeroScaleThreshold : scale;
            transform.m34 = 0.f;
            transform = CATransform3DScale(transform, scale, 1, 1);

        } else if ([property isEqualToString:@"scaleY"]) {
            CGFloat scale = [value floatValue];
            scale = ABS(scale) < zeroScaleThreshold ? zeroScaleThreshold : scale;
            transform.m34 = 0.f;
            transform = CATransform3DScale(transform, 1, scale, 1);

        } else if ([property isEqualToString:@"translate"]) {
            NSArray *array = (NSArray<NSNumber *> *)value;
            CGFloat translateX = [HippyNilIfNull(array[0]) floatValue];
            CGFloat translateY = [HippyNilIfNull(array[1]) floatValue];
            CGFloat translateZ = array.count > 2 ? [HippyNilIfNull(array[2]) floatValue] : 0;
            transform = CATransform3DTranslate(transform, translateX, translateY, translateZ);

        } else if ([property isEqualToString:@"translateX"]) {
            CGFloat translate = [value floatValue];
            transform = CATransform3DTranslate(transform, translate, 0, 0);

        } else if ([property isEqualToString:@"translateY"]) {
            CGFloat translate = [value floatValue];
            transform = CATransform3DTranslate(transform, 0, translate, 0);

        } else if ([property isEqualToString:@"translateZ"]) {
            CGFloat translate = [value floatValue];
            transform = CATransform3DTranslate(transform, 0, 0, translate);

        } else if ([property isEqualToString:@"skewX"]) {
            CGFloat skew = [self convertToRadians:value];
            transform.m21 = tanf(skew);

        } else if ([property isEqualToString:@"skewY"]) {
            CGFloat skew = [self convertToRadians:value];
            transform.m12 = tanf(skew);

        } else {
            HippyLogError(@"Unsupported transform type for a CATransform3D: %@.", property);
        }
    }
    return transform;
}

@end

@implementation HippyConvert (HippyAnimationType)

HIPPY_ENUM_CONVERTER(HippyAnimationType, (@{
    @"spring": @(HippyAnimationTypeSpring),
    @"linear": @(HippyAnimationTypeLinear),
    @"easeIn": @(HippyAnimationTypeEaseIn),
    @"easeOut": @(HippyAnimationTypeEaseOut),
    @"easeInEaseOut": @(HippyAnimationTypeEaseInEaseOut),
    @"keyboard": @(HippyAnimationTypeKeyboard),
}),
HippyAnimationTypeEaseInEaseOut, integerValue)

@end

@implementation HippyConvert (HippyPointerEvents)

HIPPY_ENUM_CONVERTER(HippyPointerEvents, (@{
    @"none": @(HippyPointerEventsNone),
    @"box-only": @(HippyPointerEventsBoxOnly),
    @"box-none": @(HippyPointerEventsBoxNone),
    @"auto": @(HippyPointerEventsUnspecified)
}),
HippyPointerEventsUnspecified, integerValue)

@end

@implementation HippyConvert (HippyBorderStyle)

HIPPY_ENUM_CONVERTER(HippyBorderStyle, (@{
    @"solid": @(HippyBorderStyleSolid),
    @"dotted": @(HippyBorderStyleDotted),
    @"dashed": @(HippyBorderStyleDashed),
    @"none": @(HippyBorderStyleNone),
}),
HippyBorderStyleSolid, integerValue)

@end

@implementation HippyConvert (HippyTextEnumDefines)

HIPPY_ENUM_CONVERTER(HippyTextDecorationLineType, (@{
    @"none": @(HippyTextDecorationLineTypeNone),
    @"underline": @(HippyTextDecorationLineTypeUnderline),
    @"line-through": @(HippyTextDecorationLineTypeStrikethrough),
    @"underline line-through": @(HippyTextDecorationLineTypeUnderlineStrikethrough),
}),
HippyTextDecorationLineTypeNone, integerValue)

HIPPY_ENUM_CONVERTER(HippyTextVerticalAlignType, (@{
    @"middle": @(HippyTextVerticalAlignMiddle),
    @"top": @(HippyTextVerticalAlignTop),
    @"bottom": @(HippyTextVerticalAlignBottom),
    @"baseline": @(HippyTextVerticalAlignBaseline),
}), HippyTextVerticalAlignUndefined, integerValue)

@end

@implementation HippyConvert (HippyPaintType)

HIPPY_ENUM_CONVERTER(HippyPaintType, (@{
    @"fcp": @(HippyPaintTypeFCP),
}), HippyPaintTypeUndefined, integerValue)

@end
