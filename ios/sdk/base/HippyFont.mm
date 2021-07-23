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

#import "HippyFont.h"
#import "HippyLog.h"

#import <CoreText/CoreText.h>

#import <mutex>

#if !defined(__IPHONE_8_2) || __IPHONE_OS_VERSION_MIN_REQUIRED < __IPHONE_8_2

// These constants are defined in iPhone SDK 8.2, but the app cannot run on
// iOS < 8.2 unless we redefine them here. If you target iOS 8.2 or above
// as a base target, the standard constants will be used instead.
// These constants can only be removed when Hippy Native drops iOS8 support.

#define UIFontWeightUltraLight -0.8
#define UIFontWeightThin -0.6
#define UIFontWeightLight -0.4
#define UIFontWeightRegular 0
#define UIFontWeightMedium 0.23
#define UIFontWeightSemibold 0.3
#define UIFontWeightBold 0.4
#define UIFontWeightHeavy 0.56
#define UIFontWeightBlack 0.62

#endif

static NSCache *fontCache;

typedef CGFloat HippyFontWeight;
static HippyFontWeight weightOfFont(UIFont *font) {
    static NSDictionary *nameToWeight;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        nameToWeight = @{
            @"normal": @(UIFontWeightRegular),
            @"bold": @(UIFontWeightBold),
            @"ultralight": @(UIFontWeightUltraLight),
            @"thin": @(UIFontWeightThin),
            @"light": @(UIFontWeightLight),
            @"regular": @(UIFontWeightRegular),
            @"medium": @(UIFontWeightMedium),
            @"semibold": @(UIFontWeightSemibold),
            @"bold": @(UIFontWeightBold),
            @"heavy": @(UIFontWeightHeavy),
            @"black": @(UIFontWeightBlack),
        };
    });

    NSDictionary *traits = [font.fontDescriptor objectForKey:UIFontDescriptorTraitsAttribute];
    HippyFontWeight weight = [traits[UIFontWeightTrait] doubleValue];
    if (weight == 0.0) {
        for (NSString *name in nameToWeight) {
            if ([font.fontName.lowercaseString hasSuffix:name]) {
                return [nameToWeight[name] doubleValue];
            }
        }
    }
    return weight;
}

static BOOL isItalicFont(UIFont *font) {
    NSDictionary *traits = [font.fontDescriptor objectForKey:UIFontDescriptorTraitsAttribute];
    UIFontDescriptorSymbolicTraits symbolicTraits = [traits[UIFontSymbolicTrait] unsignedIntValue];
    return (symbolicTraits & UIFontDescriptorTraitItalic) != 0;
}

static BOOL isCondensedFont(UIFont *font) {
    NSDictionary *traits = [font.fontDescriptor objectForKey:UIFontDescriptorTraitsAttribute];
    UIFontDescriptorSymbolicTraits symbolicTraits = [traits[UIFontSymbolicTrait] unsignedIntValue];
    return (symbolicTraits & UIFontDescriptorTraitCondensed) != 0;
}

static UIFont *cachedSystemFont(CGFloat size, HippyFontWeight weight) {
    //  static std::mutex fontCacheMutex;

    NSString *cacheKey = [NSString stringWithFormat:@"%.1f/%.2f", size, weight];
    UIFont *font = [fontCache objectForKey:cacheKey];

    if (!font) {
        // Only supported on iOS8.2 and above
        if (@available(iOS 8.2, *)) {
            font = [UIFont systemFontOfSize:size weight:weight];
        } else {
            if (weight >= UIFontWeightBold) {
                font = [UIFont boldSystemFontOfSize:size];
            } else if (weight >= UIFontWeightMedium) {
                font = [UIFont fontWithName:@"HelveticaNeue-Medium" size:size];
            } else if (weight <= UIFontWeightLight) {
                font = [UIFont fontWithName:@"HelveticaNeue-Light" size:size];
            } else {
                font = [UIFont systemFontOfSize:size];
            }
        }

        [fontCache setObject:font forKey:cacheKey];
    }

    return font;
}

@implementation HippyConvert (HippyFont)

+ (UIFont *)UIFont:(id)json {
    json = [self NSDictionary:json];
    return [HippyFont updateFont:nil withFamily:[HippyConvert NSString:json[@"fontFamily"]] size:[HippyConvert NSNumber:json[@"fontSize"]]
                          weight:[HippyConvert NSString:json[@"fontWeight"]]
                           style:[HippyConvert NSString:json[@"fontStyle"]]
                         variant:[HippyConvert NSStringArray:json[@"fontVariant"]]
                 scaleMultiplier:1];
}

HIPPY_ENUM_CONVERTER(HippyFontWeight, (@{
    @"normal": @(UIFontWeightRegular),
    @"bold": @(UIFontWeightBold),
    @"100": @(UIFontWeightUltraLight),
    @"200": @(UIFontWeightThin),
    @"300": @(UIFontWeightLight),
    @"400": @(UIFontWeightRegular),
    @"500": @(UIFontWeightMedium),
    @"600": @(UIFontWeightSemibold),
    @"700": @(UIFontWeightBold),
    @"800": @(UIFontWeightHeavy),
    @"900": @(UIFontWeightBlack),
}),
    UIFontWeightRegular, doubleValue)

typedef BOOL HippyFontStyle;
HIPPY_ENUM_CONVERTER(HippyFontStyle, (@{
    @"normal": @NO,
    @"italic": @YES,
    @"oblique": @YES,
}),
    NO, boolValue)

typedef NSDictionary HippyFontVariantDescriptor;
+ (HippyFontVariantDescriptor *)HippyFontVariantDescriptor:(id)json {
    static NSDictionary *mapping;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        mapping = @{
            @"small-caps": @ {
                UIFontFeatureTypeIdentifierKey: @(kLowerCaseType),
                UIFontFeatureSelectorIdentifierKey: @(kLowerCaseSmallCapsSelector),
            },
            @"oldstyle-nums": @ {
                UIFontFeatureTypeIdentifierKey: @(kNumberCaseType),
                UIFontFeatureSelectorIdentifierKey: @(kLowerCaseNumbersSelector),
            },
            @"lining-nums": @ {
                UIFontFeatureTypeIdentifierKey: @(kNumberCaseType),
                UIFontFeatureSelectorIdentifierKey: @(kUpperCaseNumbersSelector),
            },
            @"tabular-nums": @ {
                UIFontFeatureTypeIdentifierKey: @(kNumberSpacingType),
                UIFontFeatureSelectorIdentifierKey: @(kMonospacedNumbersSelector),
            },
            @"proportional-nums": @ {
                UIFontFeatureTypeIdentifierKey: @(kNumberSpacingType),
                UIFontFeatureSelectorIdentifierKey: @(kProportionalNumbersSelector),
            },
        };
    });
    HippyFontVariantDescriptor *value = mapping[json];
    if (HIPPY_DEBUG && !value && [json description].length > 0) {
        HippyLogError(@"Invalid HippyFontVariantDescriptor '%@'. should be one of: %@", json,
            [[mapping allKeys] sortedArrayUsingSelector:@selector(caseInsensitiveCompare:)]);
    }
    return value;
}

Hippy_ARRAY_CONVERTER(HippyFontVariantDescriptor)

    @end

@implementation HippyFont

+ (void)initialize {
    if (self == [HippyFont class]) {
        fontCache = [NSCache new];
    }
}

+ (UIFont *)updateFont:(UIFont *)font
            withFamily:(NSString *)family
                  size:(NSNumber *)size
                weight:(NSString *)weight
                 style:(NSString *)style
               variant:(NSArray<HippyFontVariantDescriptor *> *)variant
       scaleMultiplier:(CGFloat)scaleMultiplier {
    // Defaults
    static NSString *defaultFontFamily;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        defaultFontFamily = [UIFont systemFontOfSize:14].familyName;
    });
    const HippyFontWeight defaultFontWeight = UIFontWeightRegular;
    const CGFloat defaultFontSize = 14;

    // Initialize properties to defaults
    CGFloat fontSize = defaultFontSize;
    HippyFontWeight fontWeight = defaultFontWeight;
    NSString *familyName = defaultFontFamily;
    BOOL isItalic = NO;
    BOOL isCondensed = NO;

    if (font) {
        familyName = font.familyName ?: defaultFontFamily;
        fontSize = font.pointSize ?: defaultFontSize;
        fontWeight = weightOfFont(font);
        isItalic = isItalicFont(font);
        isCondensed = isCondensedFont(font);
    }

    // Get font attributes
    fontSize = [HippyConvert CGFloat:size] ?: fontSize;
    if (scaleMultiplier > 0.0 && scaleMultiplier != 1.0) {
        fontSize = round(fontSize * scaleMultiplier);
    }
    familyName = [HippyConvert NSString:family] ?: familyName;
    isItalic = style ? [HippyConvert HippyFontStyle:style] : isItalic;
    fontWeight = weight ? [HippyConvert HippyFontWeight:weight] : fontWeight;

    BOOL didFindFont = NO;

    // Handle system font as special case. This ensures that we preserve
    // the specific metrics of the standard system font as closely as possible.
    if ([familyName isEqual:defaultFontFamily] || [familyName isEqualToString:@"System"]) {
        font = cachedSystemFont(fontSize, fontWeight);
        if (font) {
            didFindFont = YES;

            if (isItalic || isCondensed) {
                UIFontDescriptor *fontDescriptor = [font fontDescriptor];
                UIFontDescriptorSymbolicTraits symbolicTraits = fontDescriptor.symbolicTraits;
                if (isItalic) {
                    symbolicTraits |= UIFontDescriptorTraitItalic;
                }
                if (isCondensed) {
                    symbolicTraits |= UIFontDescriptorTraitCondensed;
                }
                fontDescriptor = [fontDescriptor fontDescriptorWithSymbolicTraits:symbolicTraits];
                font = [UIFont fontWithDescriptor:fontDescriptor size:fontSize];
            }
        }
    }

    // Gracefully handle being given a font name rather than font family, for
    // example: "Helvetica Light Oblique" rather than just "Helvetica".
    if (!didFindFont && [familyName length] > 0 && [UIFont fontNamesForFamilyName:familyName].count == 0) {
        familyName = font.familyName;
        fontWeight = weight ? fontWeight : weightOfFont(font);
        isItalic = style ? isItalic : isItalicFont(font);
        isCondensed = isCondensedFont(font);
        font = cachedSystemFont(fontSize, fontWeight);

        if (font) {
            // It's actually a font name, not a font family name,
            // but we'll do what was meant, not what was said.
            if (isItalic || isCondensed) {
                UIFontDescriptor *fontDescriptor = [font fontDescriptor];
                UIFontDescriptorSymbolicTraits symbolicTraits = fontDescriptor.symbolicTraits;
                if (isItalic) {
                    symbolicTraits |= UIFontDescriptorTraitItalic;
                }
                if (isCondensed) {
                    symbolicTraits |= UIFontDescriptorTraitCondensed;
                }
                fontDescriptor = [fontDescriptor fontDescriptorWithSymbolicTraits:symbolicTraits];
                font = [UIFont fontWithDescriptor:fontDescriptor size:fontSize];
            }

        } else {
            // Not a valid font or family
            HippyLogError(@"Unrecognized font family '%@'", familyName);
            if (@available(iOS 8.2, *)) {
                font = [UIFont systemFontOfSize:fontSize weight:fontWeight];
            } else if (fontWeight > UIFontWeightRegular) {
                font = [UIFont boldSystemFontOfSize:fontSize];
            } else {
                font = [UIFont systemFontOfSize:fontSize];
            }
        }
    }

    // Get the closest font that matches the given weight for the fontFamily
    CGFloat closestWeight = INFINITY;
    if ([familyName length] > 0) {
        for (NSString *name in [UIFont fontNamesForFamilyName:familyName]) {
            UIFont *match = [UIFont fontWithName:name size:fontSize];
            if (isItalic == isItalicFont(match) && (isCondensed == isCondensedFont(match) || !font)) {
                CGFloat testWeight = weightOfFont(match);
                if (ABS(testWeight - fontWeight) < ABS(closestWeight - fontWeight)) {
                    font = match;
                    closestWeight = testWeight;
                }
            }
        }
    }
    // Apply font variants to font object
    if (variant) {
        NSArray *fontFeatures = [HippyConvert HippyFontVariantDescriptorArray:variant];
        UIFontDescriptor *fontDescriptor =
            [font.fontDescriptor fontDescriptorByAddingAttributes:@{ UIFontDescriptorFeatureSettingsAttribute: fontFeatures }];
        font = [UIFont fontWithDescriptor:fontDescriptor size:fontSize];
    }
    return font;
}

+ (UIFont *)updateFont:(UIFont *)font withFamily:(NSString *)family {
    return [self updateFont:font withFamily:family size:nil weight:nil style:nil variant:nil scaleMultiplier:1];
}

+ (UIFont *)updateFont:(UIFont *)font withSize:(NSNumber *)size {
    return [self updateFont:font withFamily:nil size:size weight:nil style:nil variant:nil scaleMultiplier:1];
}

+ (UIFont *)updateFont:(UIFont *)font withWeight:(NSString *)weight {
    return [self updateFont:font withFamily:nil size:nil weight:weight style:nil variant:nil scaleMultiplier:1];
}

+ (UIFont *)updateFont:(UIFont *)font withStyle:(NSString *)style {
    return [self updateFont:font withFamily:nil size:nil weight:nil style:style variant:nil scaleMultiplier:1];
}

@end
