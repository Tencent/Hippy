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

#import "HippyConvert.h"

#import <objc/message.h>

#import "HippyDefines.h"
#import "HippyParserUtils.h"
#import "HippyUtils.h"

@implementation HippyConvert

Hippy_CONVERTER(id, id, self)

Hippy_CONVERTER(BOOL, BOOL, boolValue)
Hippy_NUMBER_CONVERTER(double, doubleValue)
Hippy_NUMBER_CONVERTER(float, floatValue)
Hippy_NUMBER_CONVERTER(int, intValue)

Hippy_NUMBER_CONVERTER(int64_t, longLongValue);
Hippy_NUMBER_CONVERTER(uint64_t, unsignedLongLongValue);

Hippy_NUMBER_CONVERTER(NSInteger, integerValue)
Hippy_NUMBER_CONVERTER(NSUInteger, unsignedIntegerValue)

/**
 * This macro is used for creating converter functions for directly
 * representable json values that require no conversion.
 */
#if HIPPY_DEBUG
#define Hippy_JSON_CONVERTER(type)           \
+ (type *)type:(id)json                    \
{                                          \
if ([json isKindOfClass:[type class]]) {   \
return json;                               \
} else if (json) {                         \
HippyLogConvertError(json, @#type);          \
}                                          \
return nil;                                \
}
#else
#define Hippy_JSON_CONVERTER(type)           \
+ (type *)type:(id)json { return json; }
#endif

Hippy_JSON_CONVERTER(NSArray)
Hippy_JSON_CONVERTER(NSDictionary)
Hippy_JSON_CONVERTER(NSString)
Hippy_JSON_CONVERTER(NSNumber)

Hippy_CUSTOM_CONVERTER(NSSet *, NSSet, [NSSet setWithArray:json])
Hippy_CUSTOM_CONVERTER(NSData *, NSData, [json dataUsingEncoding:NSUTF8StringEncoding])

+ (NSIndexSet *)NSIndexSet:(id)json
{
    json = [self NSNumberArray:json];
    NSMutableIndexSet *indexSet = [NSMutableIndexSet new];
    for (NSNumber *number in json) {
        NSInteger index = number.integerValue;
        if (HIPPY_DEBUG && index < 0) {
            HippyLogError(@"Invalid index value %ld. Indices must be positive.", (long)index);
        }
        [indexSet addIndex:index];
    }
    return indexSet;
}

+ (NSURL *)NSURL:(id)json
{
    NSString *path = [self NSString:json];
    if (!path) {
        return nil;
    }
    
    @try { // NSURL has a history of crashing with bad input, so let's be safe
        
        NSURL *URL = HippyURLWithString(path, NULL);
        if (URL.scheme) { // Was a well-formed absolute URL
            return URL;
        }
        
        // Check if it has a scheme
        if ([path rangeOfString:@":"].location != NSNotFound) {
            NSData *uriData = [path dataUsingEncoding:NSUTF8StringEncoding];
            if (nil == uriData) {
                return nil;
            }
            CFURLRef urlRef = CFURLCreateWithBytes(NULL, (const UInt8 *)[uriData bytes], [uriData length], kCFStringEncodingUTF8, NULL);
            //bug:直接将CFURLRef转化为NSURL，如果包含有汉字字符，UIWebView载入之后，在shouldstartload中的request对应的URL会出现不正确的情况，不知道为什么。只能先转换为string，在转换为NSURL解决
            CFStringRef stringRef = CFURLGetString(urlRef);
            URL = HippyURLWithString((__bridge NSString *)stringRef, NULL);
            CFRelease(urlRef);
            if (URL) {
                return URL;
            }
        }
        
        // Assume that it's a local path
        path = path.stringByRemovingPercentEncoding;
        if ([path hasPrefix:@"~"]) {
            // Path is inside user directory
            path = path.stringByExpandingTildeInPath;
        } else if (!path.absolutePath) {
            // Assume it's a resource path
            path = [[NSBundle mainBundle].resourcePath stringByAppendingPathComponent:path];
        }
        if (!(URL = [NSURL fileURLWithPath:path])) {
            HippyLogConvertError(json, @"a valid URL");
        }
        return URL;
    }
    @catch (__unused NSException *e) {
        HippyLogConvertError(json, @"a valid URL");
        return nil;
    }
}

+ (NSURLRequest *)NSURLRequest:(id)json
{
    if ([json isKindOfClass:[NSString class]]) {
        NSURL *URL = [self NSURL:json];
        return URL ? [NSURLRequest requestWithURL:URL] : nil;
    }
    if ([json isKindOfClass:[NSDictionary class]]) {
        NSString *URLString = json[@"uri"] ?: json[@"url"];
        
        NSURL *URL;
        NSString *bundleName = json[@"bundle"];
        if (bundleName) {
            URLString = [NSString stringWithFormat:@"%@.bundle/%@", bundleName, URLString];
        }
        
        URL = [self NSURL:URLString];
        if (!URL) {
            return nil;
        }
        
        NSData *body = [self NSData:json[@"body"]];
        NSString *method = [self NSString:json[@"method"]].uppercaseString ?: @"GET";
        NSDictionary *headers = [self NSDictionary:json[@"headers"]];
        if ([method isEqualToString:@"GET"] && headers == nil && body == nil) {
            return [NSURLRequest requestWithURL:URL];
        }
        
        if (headers) {
            __block BOOL allHeadersAreStrings = YES;
            [headers enumerateKeysAndObjectsUsingBlock:^(__unused NSString *key, id header, BOOL *stop) {
                if (![header isKindOfClass:[NSString class]]) {
                    HippyLogError(@"Values of HTTP headers passed must be  of type string. "
                                "Value of header '%@' is not a string.", key);
                    allHeadersAreStrings = NO;
                    *stop = YES;
                }
            }];
            if (!allHeadersAreStrings) {
                // Set headers to nil here to avoid crashing later.
                headers = nil;
            }
        }
        
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:URL];
        request.HTTPBody = body;
        request.HTTPMethod = method;
        request.allHTTPHeaderFields = headers;
        return [request copy];
    }
    if (json) {
        HippyLogConvertError(json, @"a valid URLRequest");
    }
    return nil;
}

+ (HippyFileURL *)HippyFileURL:(id)json
{
    NSURL *fileURL = [self NSURL:json];
    if (!fileURL.fileURL) {
        HippyLogError(@"URI must be a local file, '%@' isn't.", fileURL);
        return nil;
    }
    if (![[NSFileManager defaultManager] fileExistsAtPath:fileURL.path]) {
        HippyLogError(@"File '%@' could not be found.", fileURL);
        return nil;
    }
    return fileURL;
}

+ (NSDate *)NSDate:(id)json
{
    if ([json isKindOfClass:[NSNumber class]]) {
        return [NSDate dateWithTimeIntervalSince1970:[self NSTimeInterval:json]];
    } else if ([json isKindOfClass:[NSString class]]) {
        static NSDateFormatter *formatter;
        static dispatch_once_t onceToken;
        dispatch_once(&onceToken, ^{
            formatter = [NSDateFormatter new];
            formatter.dateFormat = @"yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ";
            formatter.locale = [NSLocale localeWithLocaleIdentifier:@"en_US_POSIX"];
            formatter.timeZone = [NSTimeZone timeZoneWithName:@"UTC"];
        });
        NSDate *date = [formatter dateFromString:json];
        if (!date) {
            HippyLogError(@"JSON String '%@' could not be interpreted as a date. "
                        "Expected format: YYYY-MM-DD'T'HH:mm:ss.sssZ", json);
        }
        return date;
    } else if (json) {
        HippyLogConvertError(json, @"a date");
    }
    return nil;
}

// JS Standard for time is milliseconds
Hippy_CUSTOM_CONVERTER(NSTimeInterval, NSTimeInterval, [self double:json] / 1000.0)

// JS standard for time zones is minutes.
Hippy_CUSTOM_CONVERTER(NSTimeZone *, NSTimeZone, [NSTimeZone timeZoneForSecondsFromGMT:[self double:json] * 60.0])

NSNumber *HippyConvertEnumValue(__unused const char *typeName, NSDictionary *mapping, NSNumber *defaultValue, id json)
{
    if (!json) {
        return defaultValue;
    }
    if ([json isKindOfClass:[NSNumber class]]) {
        NSArray *allValues = mapping.allValues;
        if ([allValues containsObject:json] || [json isEqual:defaultValue]) {
            return json;
        }
        HippyLogError(@"Invalid %s '%@'. should be one of: %@", typeName, json, allValues);
        return defaultValue;
    }
    if (HIPPY_DEBUG && ![json isKindOfClass:[NSString class]]) {
        HippyLogError(@"Expected NSNumber or NSString for %s, received %@: %@",
                    typeName, [json classForCoder], json);
    }
    id value = mapping[json];
    if (HIPPY_DEBUG && !value && [json description].length > 0) {
        HippyLogError(@"Invalid %s '%@'. should be one of: %@", typeName, json, [[mapping allKeys] sortedArrayUsingSelector: @selector(caseInsensitiveCompare:)]);
    }
    return value ?: defaultValue;
}

NSNumber *HippyConvertMultiEnumValue(const char *typeName, NSDictionary *mapping, NSNumber *defaultValue, id json)
{
    if ([json isKindOfClass:[NSArray class]]) {
        if ([json count] == 0) {
            return defaultValue;
        }
        long long result = 0;
        for (id arrayElement in json) {
            NSNumber *value = HippyConvertEnumValue(typeName, mapping, defaultValue, arrayElement);
            result |= value.longLongValue;
        }
        return @(result);
    }
    return HippyConvertEnumValue(typeName, mapping, defaultValue, json);
}

HIPPY_ENUM_CONVERTER(NSLineBreakMode, (@{
                                       @"clip": @(NSLineBreakByClipping),
                                       @"head": @(NSLineBreakByTruncatingHead),
                                       @"tail": @(NSLineBreakByTruncatingTail),
                                       @"middle": @(NSLineBreakByTruncatingMiddle),
                                       @"wordWrapping": @(NSLineBreakByWordWrapping),
                                       }), NSLineBreakByTruncatingTail, integerValue)

HIPPY_ENUM_CONVERTER(NSTextAlignment, (@{
                                       @"auto": @(NSTextAlignmentNatural),
                                       @"left": @(NSTextAlignmentLeft),
                                       @"center": @(NSTextAlignmentCenter),
                                       @"right": @(NSTextAlignmentRight),
                                       @"justify": @(NSTextAlignmentJustified),
                                       }), NSTextAlignmentNatural, integerValue)

HIPPY_ENUM_CONVERTER(NSUnderlineStyle, (@{
                                        @"solid": @(NSUnderlineStyleSingle),
                                        @"double": @(NSUnderlineStyleDouble),
                                        @"dotted": @(NSUnderlinePatternDot | NSUnderlineStyleSingle),
                                        @"dashed": @(NSUnderlinePatternDash | NSUnderlineStyleSingle),
                                        }), NSUnderlineStyleSingle, integerValue)

HIPPY_ENUM_CONVERTER(HippyBorderStyle, (@{
                                      @"solid": @(HippyBorderStyleSolid),
                                      @"dotted": @(HippyBorderStyleDotted),
                                      @"dashed": @(HippyBorderStyleDashed),
                                      }), HippyBorderStyleSolid, integerValue)

HIPPY_ENUM_CONVERTER(HippyTextDecorationLineType, (@{
                                                 @"none": @(HippyTextDecorationLineTypeNone),
                                                 @"underline": @(HippyTextDecorationLineTypeUnderline),
                                                 @"line-through": @(HippyTextDecorationLineTypeStrikethrough),
                                                 @"underline line-through": @(HippyTextDecorationLineTypeUnderlineStrikethrough),
                                                 }), HippyTextDecorationLineTypeNone, integerValue)

HIPPY_ENUM_CONVERTER(NSWritingDirection, (@{
                                          @"auto": @(NSWritingDirectionNatural),
                                          @"ltr": @(NSWritingDirectionLeftToRight),
                                          @"rtl": @(NSWritingDirectionRightToLeft),
                                          }), NSWritingDirectionNatural, integerValue)

HIPPY_ENUM_CONVERTER(UITextAutocapitalizationType, (@{
                                                    @"none": @(UITextAutocapitalizationTypeNone),
                                                    @"words": @(UITextAutocapitalizationTypeWords),
                                                    @"sentences": @(UITextAutocapitalizationTypeSentences),
                                                    @"characters": @(UITextAutocapitalizationTypeAllCharacters)
                                                    }), UITextAutocapitalizationTypeSentences, integerValue)

HIPPY_ENUM_CONVERTER(UITextFieldViewMode, (@{
                                           @"never": @(UITextFieldViewModeNever),
                                           @"while-editing": @(UITextFieldViewModeWhileEditing),
                                           @"unless-editing": @(UITextFieldViewModeUnlessEditing),
                                           @"always": @(UITextFieldViewModeAlways),
                                           }), UITextFieldViewModeNever, integerValue)

HIPPY_ENUM_CONVERTER(UIKeyboardType, (@{
                                      @"default": @(UIKeyboardTypeDefault),
                                      @"phone-pad": @(UIKeyboardTypePhonePad),
                                      @"email": @(UIKeyboardTypeEmailAddress),
                                      @"numeric": @(UIKeyboardTypeDecimalPad),
                                      @"password": @(UIKeyboardTypeTwitter),
                                      
                                      @"ascii-capable": @(UIKeyboardTypeASCIICapable),
                                      @"numbers-and-punctuation": @(UIKeyboardTypeNumbersAndPunctuation),
                                      @"url": @(UIKeyboardTypeURL),
                                      @"number-pad": @(UIKeyboardTypeNumberPad),
                                      @"name-phone-pad": @(UIKeyboardTypeNamePhonePad),
                                      @"email-address": @(UIKeyboardTypeEmailAddress),
                                      @"decimal-pad": @(UIKeyboardTypeDecimalPad),
                                      @"twitter": @(UIKeyboardTypeTwitter),
                                      @"web-search": @(UIKeyboardTypeWebSearch),
                                      
                                      }), UIKeyboardTypeDefault, integerValue)

#if !TARGET_OS_TV
Hippy_MULTI_ENUM_CONVERTER(UIDataDetectorTypes, (@{
                                                 @"phoneNumber": @(UIDataDetectorTypePhoneNumber),
                                                 @"link": @(UIDataDetectorTypeLink),
                                                 @"address": @(UIDataDetectorTypeAddress),
                                                 @"calendarEvent": @(UIDataDetectorTypeCalendarEvent),
                                                 @"none": @(UIDataDetectorTypeNone),
                                                 @"all": @(UIDataDetectorTypeAll),
                                                 }), UIDataDetectorTypePhoneNumber, unsignedIntegerValue)
#endif

HIPPY_ENUM_CONVERTER(UIKeyboardAppearance, (@{
                                            @"default": @(UIKeyboardAppearanceDefault),
                                            @"light": @(UIKeyboardAppearanceLight),
                                            @"dark": @(UIKeyboardAppearanceDark),
                                            }), UIKeyboardAppearanceDefault, integerValue)

HIPPY_ENUM_CONVERTER(UIReturnKeyType, (@{
                                       @"default": @(UIReturnKeyDefault),
                                       @"go": @(UIReturnKeyGo),
                                       @"google": @(UIReturnKeyGoogle),
                                       @"join": @(UIReturnKeyJoin),
                                       @"next": @(UIReturnKeyNext),
                                       @"route": @(UIReturnKeyRoute),
                                       @"search": @(UIReturnKeySearch),
                                       @"send": @(UIReturnKeySend),
                                       @"yahoo": @(UIReturnKeyYahoo),
                                       @"done": @(UIReturnKeyDone),
                                       @"emergency-call": @(UIReturnKeyEmergencyCall)
                                       }), UIReturnKeyDefault, integerValue)

HIPPY_ENUM_CONVERTER(UIViewContentMode, (@{
                                         @"scale-to-fill": @(UIViewContentModeScaleToFill),
                                         @"scale-aspect-fit": @(UIViewContentModeScaleAspectFit),
                                         @"scale-aspect-fill": @(UIViewContentModeScaleAspectFill),
                                         @"redraw": @(UIViewContentModeRedraw),
                                         @"center": @(UIViewContentModeCenter),
                                         @"top": @(UIViewContentModeTop),
                                         @"bottom": @(UIViewContentModeBottom),
                                         @"left": @(UIViewContentModeLeft),
                                         @"right": @(UIViewContentModeRight),
                                         @"top-left": @(UIViewContentModeTopLeft),
                                         @"top-right": @(UIViewContentModeTopRight),
                                         @"bottom-left": @(UIViewContentModeBottomLeft),
                                         @"bottom-right": @(UIViewContentModeBottomRight),
                                         // Cross-platform values
                                         @"cover": @(UIViewContentModeScaleAspectFill),
                                         @"contain": @(UIViewContentModeScaleAspectFit),
                                         @"stretch": @(UIViewContentModeScaleToFill),
                                         }), UIViewContentModeScaleAspectFill, integerValue)

#if !TARGET_OS_TV
HIPPY_ENUM_CONVERTER(UIBarStyle, (@{
                                  @"default": @(UIBarStyleDefault),
                                  @"black": @(UIBarStyleBlack),
                                  }), UIBarStyleDefault, integerValue)
#endif

// TODO: normalise the use of w/width so we can do away with the alias values (#6566645)
static void HippyConvertCGStructValue(__unused const char *type, NSArray *fields, NSDictionary *aliases, CGFloat *result, id json)
{
    NSUInteger count = fields.count;
    if ([json isKindOfClass:[NSArray class]]) {
        if (HIPPY_DEBUG && [json count] != count) {
            HippyLogError(@"Expected array with count %lu, but count is %lu: %@", (unsigned long)count, (unsigned long)[json count], json);
        } else {
            for (NSUInteger i = 0; i < count; i++) {
                result[i] = [HippyConvert CGFloat:json[i]];
            }
        }
    } else if ([json isKindOfClass:[NSDictionary class]]) {
        if (aliases.count) {
            json = [json mutableCopy];
            for (NSString *alias in aliases) {
                NSString *key = aliases[alias];
                NSNumber *number = json[alias];
                if (number != nil) {
                    HippyLogWarn(@"Using deprecated '%@' property for '%s'. Use '%@' instead.", alias, type, key);
                    ((NSMutableDictionary *)json)[key] = number;
                }
            }
        }
        for (NSUInteger i = 0; i < count; i++) {
            result[i] = [HippyConvert CGFloat:json[fields[i]]];
        }
    } else if (json) {
        HippyLogConvertError(json, @(type));
    }
}

/**
 * This macro is used for creating converter functions for structs that consist
 * of a number of CGFloat properties, such as CGPoint, CGRect, etc.
 */
#define Hippy_CGSTRUCT_CONVERTER(type, values, aliases) \
+ (type)type:(id)json                                 \
{                                                     \
static NSArray *fields;                             \
static dispatch_once_t onceToken;                   \
dispatch_once(&onceToken, ^{                        \
fields = values;                                  \
});                                                 \
type result;                                        \
HippyConvertCGStructValue(#type, fields, aliases, (CGFloat *)&result, json); \
return result;                                      \
}

Hippy_CUSTOM_CONVERTER(CGFloat, CGFloat, [self double:json])
Hippy_CGSTRUCT_CONVERTER(CGPoint, (@[@"x", @"y"]), (@{@"l": @"x", @"t": @"y"}))
Hippy_CGSTRUCT_CONVERTER(CGSize, (@[@"width", @"height"]), (@{@"w": @"width", @"h": @"height"}))
Hippy_CGSTRUCT_CONVERTER(CGRect, (@[@"x", @"y", @"width", @"height"]), (@{@"l": @"x", @"t": @"y", @"w": @"width", @"h": @"height"}))
Hippy_CGSTRUCT_CONVERTER(UIEdgeInsets, (@[@"top", @"left", @"bottom", @"right"]), nil)

HIPPY_ENUM_CONVERTER(CGLineJoin, (@{
                                  @"miter": @(kCGLineJoinMiter),
                                  @"round": @(kCGLineJoinRound),
                                  @"bevel": @(kCGLineJoinBevel),
                                  }), kCGLineJoinMiter, intValue)

HIPPY_ENUM_CONVERTER(CGLineCap, (@{
                                 @"butt": @(kCGLineCapButt),
                                 @"round": @(kCGLineCapRound),
                                 @"square": @(kCGLineCapSquare),
                                 }), kCGLineCapButt, intValue)

//Hippy_CGSTRUCT_CONVERTER(CATransform3D, (@[
//  @"m11", @"m12", @"m13", @"m14",
//  @"m21", @"m22", @"m23", @"m24",
//  @"m31", @"m32", @"m33", @"m34",
//  @"m41", @"m42", @"m43", @"m44"
//]), nil)

Hippy_CGSTRUCT_CONVERTER(CGAffineTransform, (@[
                                             @"a", @"b", @"c", @"d", @"tx", @"ty"
                                             ]), nil)

+ (UIColor *)UIColor:(id)json
{
    if (!json) {
        return nil;
    }
    if ([json isKindOfClass:[NSArray class]]) {
        NSArray *components = [self NSNumberArray:json];
        CGFloat alpha = components.count > 3 ? [self CGFloat:components[3]] : 1.0;
        return [UIColor colorWithRed:[self CGFloat:components[0]]
                               green:[self CGFloat:components[1]]
                                blue:[self CGFloat:components[2]]
                               alpha:alpha];
    } else if ([json isKindOfClass:[NSNumber class]]) {
        NSUInteger argb = [self NSUInteger:json];
        CGFloat a = ((argb >> 24) & 0xFF) / 255.0;
        CGFloat r = ((argb >> 16) & 0xFF) / 255.0;
        CGFloat g = ((argb >> 8) & 0xFF) / 255.0;
        CGFloat b = (argb & 0xFF) / 255.0;
        return [UIColor colorWithRed:r green:g blue:b alpha:a];
    } else {
        HippyLogConvertError(json, @"a UIColor. Did you forget to call processColor() on the JS side?");
        return nil;
    }
}

+ (CGColorRef)CGColor:(id)json
{
    return [self UIColor:json].CGColor;
}

NSArray *HippyConvertArrayValue(SEL type, id json)
{
    __block BOOL copy = NO;
    __block NSArray *values = json = [HippyConvert NSArray:json];
    if ([values isKindOfClass:[NSArray class]]) {
        [json enumerateObjectsUsingBlock:^(id jsonValue, NSUInteger idx, __unused BOOL *stop) {
            id value = ((id(*)(Class, SEL, id))objc_msgSend)([HippyConvert class], type, jsonValue);
            if (copy) {
                if (value) {
                    [(NSMutableArray *)values addObject:value];
                }
            } else if (value != jsonValue) {
                // Converted value is different, so we'll need to copy the array
                values = [[NSMutableArray alloc] initWithCapacity:values.count];
                for (NSUInteger i = 0; i < idx; i++) {
                    [(NSMutableArray *)values addObject:json[i]];
                }
                if (value) {
                    [(NSMutableArray *)values addObject:value];
                }
                copy = YES;
            }
        }];
        return values;
    }
    else {
        return nil;
    }
}

SEL HippyConvertSelectorForType(NSString *type)
{
    const char *input = type.UTF8String;
    return NSSelectorFromString([HippyParseType(&input) stringByAppendingString:@":"]);
}

Hippy_ARRAY_CONVERTER(NSURL)
Hippy_ARRAY_CONVERTER(HippyFileURL)
Hippy_ARRAY_CONVERTER(UIColor)

/**
 * This macro is used for creating converter functions for directly
 * representable json array values that require no conversion.
 */
#if HIPPY_DEBUG
#define Hippy_JSON_ARRAY_CONVERTER(type) Hippy_ARRAY_CONVERTER(type)
#else
#define Hippy_JSON_ARRAY_CONVERTER(type) + (NSArray *)type##Array:(id)json { return json; }
#endif

Hippy_JSON_ARRAY_CONVERTER(NSArray)
Hippy_JSON_ARRAY_CONVERTER(NSString)
//Hippy_JSON_ARRAY_CONVERTER(NSStringArray)
+ (NSArray<NSArray<NSString *> *> *)NSStringArrayArray:(id)json {
    return HippyConvertArrayValue(@selector(NSStringArray:), json);
}
Hippy_JSON_ARRAY_CONVERTER(NSDictionary)
Hippy_JSON_ARRAY_CONVERTER(NSNumber)

// Can't use Hippy_ARRAY_CONVERTER due to bridged cast
+ (NSArray *)CGColorArray:(id)json
{
    NSMutableArray *colors = [NSMutableArray new];
    for (id value in [self NSArray:json]) {
        [colors addObject:(__bridge id)[self CGColor:value]];
    }
    return colors;
}

static id HippyConvertPropertyListValue(id json)
{
    if (!json || json == (id)kCFNull) {
        return nil;
    }
    
    if ([json isKindOfClass:[NSDictionary class]]) {
        __block BOOL copy = NO;
        NSMutableDictionary *values = [[NSMutableDictionary alloc] initWithCapacity:[json count]];
        [json enumerateKeysAndObjectsUsingBlock:^(NSString *key, id jsonValue, __unused BOOL *stop) {
            id value = HippyConvertPropertyListValue(jsonValue);
            if (value) {
                values[key] = value;
            }
            copy |= value != jsonValue;
        }];
        return copy ? values : json;
    }
    
    if ([json isKindOfClass:[NSArray class]]) {
        __block BOOL copy = NO;
        __block NSArray *values = json;
        [json enumerateObjectsUsingBlock:^(id jsonValue, NSUInteger idx, __unused BOOL *stop) {
            id value = HippyConvertPropertyListValue(jsonValue);
            if (copy) {
                if (value) {
                    [(NSMutableArray *)values addObject:value];
                }
            } else if (value != jsonValue) {
                // Converted value is different, so we'll need to copy the array
                values = [[NSMutableArray alloc] initWithCapacity:values.count];
                for (NSUInteger i = 0; i < idx; i++) {
                    [(NSMutableArray *)values addObject:json[i]];
                }
                if (value) {
                    [(NSMutableArray *)values addObject:value];
                }
                copy = YES;
            }
        }];
        return values;
    }
    
    // All other JSON types are supported by property lists
    return json;
}

+ (NSPropertyList)NSPropertyList:(id)json
{
    return HippyConvertPropertyListValue(json);
}

HIPPY_ENUM_CONVERTER(css_backface_visibility_t, (@{
                                                 @"hidden": @NO,
                                                 @"visible": @YES
                                                 }), YES, boolValue)

//hplayout
HIPPY_ENUM_CONVERTER(OverflowType, (@{
                                    @"hidden": @(OverflowHidden),
                                    @"visible": @(OverflowVisible),
                                    @"scroll": @(OverflowScroll),
                                    }), OverflowVisible, intValue)

HIPPY_ENUM_CONVERTER(FlexDirection, (@{
                                     @"row": @(FLexDirectionRow),
                                     @"row-reverse": @(FLexDirectionRowReverse),
                                     @"column": @(FLexDirectionColumn),
                                     @"column-reverse": @(FLexDirectionColumnReverse)
                                     }), FLexDirectionColumn, intValue)

HIPPY_ENUM_CONVERTER(FlexAlign, (@{
                                 @"auto": @(FlexAlignAuto),
                                 @"flex-start": @(FlexAlignStart),
                                 @"flex-end": @(FlexAlignEnd),
                                 @"center": @(FlexAlignCenter),
                                 @"space-between": @(FlexAlignSpaceBetween),
                                 @"stretch": @(FlexAlignStretch),
                                 @"baseline": @(FlexAlignBaseline),
                                 @"space-around": @(FlexAlignSpaceAround),
                                 @"space-evenly": @(FlexAlignSpaceEvenly)
                                 }), FlexAlignAuto, intValue)

HIPPY_ENUM_CONVERTER(PositionType, (@{
                                    @"absolute": @(PositionTypeAbsolute),
                                    @"relative": @(PositionTypeRelative)
                                    }), PositionTypeRelative, intValue)

HIPPY_ENUM_CONVERTER(FlexWrapMode, (@{
                                    @"wrap": @(FlexWrap),
                                    @"nowrap": @(FlexNoWrap)
                                    }), FlexNoWrap, intValue)

HIPPY_ENUM_CONVERTER(DisplayType, (@{
                                   @"flex": @(DisplayTypeFlex),
                                   @"block": @(DisplayTypeFlex),
                                   @"none": @(DisplayTypeNone)
                                   }), DisplayTypeFlex, intValue)

HIPPY_ENUM_CONVERTER(HippyPointerEvents, (@{
                                        @"none": @(HippyPointerEventsNone),
                                        @"box-only": @(HippyPointerEventsBoxOnly),
                                        @"box-none": @(HippyPointerEventsBoxNone),
                                        @"auto": @(HippyPointerEventsUnspecified)
                                        }), HippyPointerEventsUnspecified, integerValue)

HIPPY_ENUM_CONVERTER(HippyAnimationType, (@{
                                        @"spring": @(HippyAnimationTypeSpring),
                                        @"linear": @(HippyAnimationTypeLinear),
                                        @"easeIn": @(HippyAnimationTypeEaseIn),
                                        @"easeOut": @(HippyAnimationTypeEaseOut),
                                        @"easeInEaseOut": @(HippyAnimationTypeEaseInEaseOut),
                                        @"keyboard": @(HippyAnimationTypeKeyboard),
                                        }), HippyAnimationTypeEaseInEaseOut, integerValue)

@end


@implementation HippyConvert (Deprecated)

/* This method is only used when loading images synchronously, e.g. for tabbar icons */
+ (UIImage *)UIImage:(id)json
{
    if (!json) {
        return nil;
    }
    
    NSString *uri = [json isKindOfClass: [NSDictionary class]] ? [(NSDictionary *)json objectForKey: @"uri"] : nil;
    if (uri.length == 0) return nil;
    
    __block UIImage *image;
    if (!HippyIsMainQueue()) {
        // It seems that none of the UIImage loading methods can be guaranteed
        // thread safe, so we'll pick the lesser of two evils here and block rather
        // than run the risk of crashing
        HippyLogWarn(@"Calling [HippyConvert UIImage:] on a background thread is not recommended");
        dispatch_sync(dispatch_get_main_queue(), ^{
            image = [self UIImage:json];
        });
        return image;
    }
    
    NSURL *URL = HippyURLWithString(uri, NULL);
    NSString *scheme = URL.scheme.lowercaseString;
    if ([scheme isEqualToString:@"file"]) {
        NSString *assetName = HippyBundlePathForURL(URL);
        image = assetName ? [UIImage imageNamed:assetName] : nil;
        if (!image) {
            // Attempt to load from the file system
            NSString *filePath = URL.path;
            if (filePath.pathExtension.length == 0) {
                filePath = [filePath stringByAppendingPathExtension:@"png"];
            }
            image = [UIImage imageWithContentsOfFile:filePath];
            if (!image) {
                HippyLogConvertError(json, @"an image. File not found.");
            }
        }
    } else if ([scheme isEqualToString:@"data"]) {
        image = [UIImage imageWithData:[NSData dataWithContentsOfURL:URL]];
    } else {
        HippyLogConvertError(json, @"an image. Only base64 image data are supported.");
        return nil;
    }
    return image;
}

+ (CGImageRef)CGImage:(id)json
{
    return [self UIImage:json].CGImage;
}

@end
