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

#import <CoreText/CoreText.h>

#import "HippyFont.h"
#import "HippyLog.h"


static NSCache *fontCache;

typedef CGFloat NativeRenderFontWeight;
static NativeRenderFontWeight weightOfFont(UIFont *font) {
    static const struct SuffixWeight{
        NSString *suffix;
        UIFontWeight weight;
    } suffixToWeight[] = {
        {@"normal",     UIFontWeightRegular},
        {@"bold",       UIFontWeightBold},
        {@"ultralight", UIFontWeightUltraLight},
        {@"thin",       UIFontWeightThin},
        {@"light",      UIFontWeightLight},
        {@"regular",    UIFontWeightRegular},
        {@"medium",     UIFontWeightMedium},
        {@"semibold",   UIFontWeightSemibold},
        {@"heavy",      UIFontWeightHeavy},
        {@"black",      UIFontWeightBlack},
    };

    NSString *fontName = font.fontName;
    if(fontName == nil){
        return 0.0;
    }
    CFStringCompareFlags options = kCFCompareCaseInsensitive | kCFCompareAnchored | kCFCompareBackwards;
    for(int i = 0; i < sizeof(suffixToWeight) / sizeof(suffixToWeight[0]); ++i){
        struct SuffixWeight item = suffixToWeight[i];
        if(CFStringFind((CFStringRef)fontName, (CFStringRef)item.suffix, options).location != kCFNotFound){
            return item.weight;
        }
    }

    NSDictionary *traits = (__bridge_transfer NSDictionary *)CTFontCopyTraits((CTFontRef)font);
    return (NativeRenderFontWeight)[traits[UIFontWeightTrait] doubleValue];
}

static BOOL isItalicFont(UIFont *font) {
    return font != nil && (CTFontGetSymbolicTraits((CTFontRef)font) & kCTFontTraitItalic) != 0;
}

static BOOL isCondensedFont(UIFont *font) {
    return font != nil && (CTFontGetSymbolicTraits((CTFontRef)font) & kCTFontTraitCondensed) != 0;
}

static UIFont *cachedSystemFont(CGFloat size, NativeRenderFontWeight weight) {
    struct __attribute__((__packed__)) CacheKey {
        CGFloat size;
        NativeRenderFontWeight weight;
    };
    CacheKey key{size, weight};
    NSValue *cacheKey = [[NSValue alloc] initWithBytes:&key objCType:@encode(CacheKey)];
    UIFont *font = [fontCache objectForKey:cacheKey];

    if (!font) {
        font = [UIFont systemFontOfSize:size weight:weight];
        [fontCache setObject:font forKey:cacheKey];
    }

    return font;
}

// Caching wrapper around expensive +[UIFont fontNamesForFamilyName:]
static NSArray<NSString *> *fontNamesForFamilyName(NSString *familyName)
{
    static NSCache<NSString *, NSArray<NSString *> *> *cache;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        cache = [NSCache new];
        [NSNotificationCenter.defaultCenter
         addObserverForName:(NSNotificationName)kCTFontManagerRegisteredFontsChangedNotification
         object:nil
         queue:nil
         usingBlock:^(NSNotification *note) {
            [cache removeAllObjects];
        }];
    });
    
    NSArray<NSString *> *names = [cache objectForKey:familyName];
    if (!names) {
        names = [UIFont fontNamesForFamilyName:familyName] ?: [NSArray new];
        [cache setObject:names forKey:familyName];
    }
    return names;
}

@implementation HippyConvert (NativeRenderFont)

+ (UIFont *)UIFont:(id)json {
    json = [self NSDictionary:json];
    return [HippyFont updateFont:nil withFamily:[HippyConvert NSString:json[@"fontFamily"]] size:[HippyConvert NSNumber:json[@"fontSize"]]
                          weight:[HippyConvert NSString:json[@"fontWeight"]]
                           style:[HippyConvert NSString:json[@"fontStyle"]]
                         variant:[HippyConvert NSStringArray:json[@"fontVariant"]]
                 scaleMultiplier:1];
}

HIPPY_ENUM_CONVERTER(NativeRenderFontWeight, (@{
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

typedef BOOL NativeRenderFontStyle;
HIPPY_ENUM_CONVERTER(NativeRenderFontStyle, (@{
    @"normal": @NO,
    @"italic": @YES,
    @"oblique": @YES,
}),
    NO, boolValue)

typedef NSDictionary NativeRenderFontVariantDescriptor;
+ (NativeRenderFontVariantDescriptor *)NativeRenderFontVariantDescriptor:(id)json {
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
    NativeRenderFontVariantDescriptor *value = mapping[json];
    if (HIPPY_DEBUG && !value && [json description].length > 0) {
        HippyLogError(@"Invalid NativeRenderFontVariantDescriptor '%@'. should be one of: %@", json,
                      [[mapping allKeys] sortedArrayUsingSelector:@selector(caseInsensitiveCompare:)]);
    }
    return value;
}

HIPPY_ARRAY_CONVERTER(NativeRenderFontVariantDescriptor)
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
               variant:(NSArray<NativeRenderFontVariantDescriptor *> *)variant
       scaleMultiplier:(CGFloat)scaleMultiplier {
    // Defaults
    static NSString *defaultFontFamily;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        defaultFontFamily = [UIFont systemFontOfSize:14].familyName;
    });
    const NativeRenderFontWeight defaultFontWeight = UIFontWeightRegular;
    const CGFloat defaultFontSize = 14;

    // Initialize properties to defaults
    CGFloat fontSize = defaultFontSize;
    NativeRenderFontWeight fontWeight = defaultFontWeight;
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
    isItalic = style ? [HippyConvert NativeRenderFontStyle:style] : isItalic;
    fontWeight = weight ? [HippyConvert NativeRenderFontWeight:weight] : fontWeight;

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
    if (!didFindFont && familyName.length > 0 && fontNamesForFamilyName(familyName).count == 0) {
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
            font = [UIFont systemFontOfSize:fontSize weight:fontWeight];
        }
    }

    NSArray<NSString *> *names;
    if (!didFindFont && familyName.length > 0) {
        names = fontNamesForFamilyName(familyName);
        // Get the closest font that matches the given weight for the fontFamily
        CGFloat closestWeight = INFINITY;
        for (NSString *name in names) {
            UIFont *match = [UIFont fontWithName:name size:fontSize];
            if (isItalic == isItalicFont(match) && isCondensed == isCondensedFont(match)) {
                CGFloat testWeight = weightOfFont(match);
                if (ABS(testWeight - fontWeight) < ABS(closestWeight - fontWeight)) {
                    font = match;
                    closestWeight = testWeight;
                }
            }
        }
    }

    if (!font && names.count > 0) {
        font = [UIFont fontWithName:names[0] size:fontSize];
    }
    
    // Apply font variants to font object
    if (variant) {
        NSArray *fontFeatures = [HippyConvert NativeRenderFontVariantDescriptorArray:variant];
        UIFontDescriptor *fontDescriptor =
            [font.fontDescriptor fontDescriptorByAddingAttributes:
             @{UIFontDescriptorFeatureSettingsAttribute: fontFeatures}];
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
