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

#import "HippyUtils.h"
#import "HippyAssert.h"
#import "HippyLog.h"
#import <objc/message.h>
#import <CommonCrypto/CommonCrypto.h>

static NSString *colorDictionaryJSON = @"transparent:0x00000000,aliceblue:0xf0f8ffff,antiquewhite:0xfaebd7ff,aqua:0x00ffffff,aquamarine:0x7fffd4ff,azure:0xf0ffffff,beige:0xf5f5dcff,bisque:0xffe4c4ff,black:0x000000ff,blanchedalmond:0xffebcdff,blue:0x0000ffff,blueviolet:0x8a2be2ff,brown:0xa52a2aff,burlywood:0xdeb887ff,burntsienna:0xea7e5dff,cadetblue:0x5f9ea0ff,chartreuse:0x7fff00ff,chocolate:0xd2691eff,coral:0xff7f50ff,cornflowerblue:0x6495edff,cornsilk:0xfff8dcff,crimson:0xdc143cff,cyan:0x00ffffff,darkblue:0x00008bff,darkcyan:0x008b8bff,darkgoldenrod:0xb8860bff,darkgray:0xa9a9a9ff,darkgreen:0x006400ff,darkgrey:0xa9a9a9ff,darkkhaki:0xbdb76bff,darkmagenta:0x8b008bff,darkolivegreen:0x556b2fff,darkorange:0xff8c00ff,darkorchid:0x9932ccff,darkred:0x8b0000ff,darksalmon:0xe9967aff,darkseagreen:0x8fbc8fff,darkslateblue:0x483d8bff,darkslategray:0x2f4f4fff,darkslategrey:0x2f4f4fff,darkturquoise:0x00ced1ff,darkviolet:0x9400d3ff,deeppink:0xff1493ff,deepskyblue:0x00bfffff,dimgray:0x696969ff,dimgrey:0x696969ff,dodgerblue:0x1e90ffff,firebrick:0xb22222ff,floralwhite:0xfffaf0ff,forestgreen:0x228b22ff,fuchsia:0xff00ffff,gainsboro:0xdcdcdcff,ghostwhite:0xf8f8ffff,gold:0xffd700ff,goldenrod:0xdaa520ff,gray:0x808080ff,green:0x008000ff,greenyellow:0xadff2fff,grey:0x808080ff,honeydew:0xf0fff0ff,hotpink:0xff69b4ff,indianred:0xcd5c5cff,indigo:0x4b0082ff,ivory:0xfffff0ff,khaki:0xf0e68cff,lavender:0xe6e6faff,lavenderblush:0xfff0f5ff,lawngreen:0x7cfc00ff,lemonchiffon:0xfffacdff,lightblue:0xadd8e6ff,lightcoral:0xf08080ff,lightcyan:0xe0ffffff,lightgoldenrodyellow:0xfafad2ff,lightgray:0xd3d3d3ff,lightgreen:0x90ee90ff,lightgrey:0xd3d3d3ff,lightpink:0xffb6c1ff,lightsalmon:0xffa07aff,lightseagreen:0x20b2aaff,lightskyblue:0x87cefaff,lightslategray:0x778899ff,lightslategrey:0x778899ff,lightsteelblue:0xb0c4deff,lightyellow:0xffffe0ff,lime:0x00ff00ff,limegreen:0x32cd32ff,linen:0xfaf0e6ff,magenta:0xff00ffff,maroon:0x800000ff,mediumaquamarine:0x66cdaaff,mediumblue:0x0000cdff,mediumorchid:0xba55d3ff,mediumpurple:0x9370dbff,mediumseagreen:0x3cb371ff,mediumslateblue:0x7b68eeff,mediumspringgreen:0x00fa9aff,mediumturquoise:0x48d1ccff,mediumvioletred:0xc71585ff,midnightblue:0x191970ff,mintcream:0xf5fffaff,mistyrose:0xffe4e1ff,moccasin:0xffe4b5ff,navajowhite:0xffdeadff,navy:0x000080ff,oldlace:0xfdf5e6ff,olive:0x808000ff,olivedrab:0x6b8e23ff,orange:0xffa500ff,orangered:0xff4500ff,orchid:0xda70d6ff,palegoldenrod:0xeee8aaff,palegreen:0x98fb98ff,paleturquoise:0xafeeeeff,palevioletred:0xdb7093ff,papayawhip:0xffefd5ff,peachpuff:0xffdab9ff,peru:0xcd853fff,pink:0xffc0cbff,plum:0xdda0ddff,powderblue:0xb0e0e6ff,purple:0x800080ff,rebeccapurple:0x663399ff,red:0xff0000ff,rosybrown:0xbc8f8fff,royalblue:0x4169e1ff,saddlebrown:0x8b4513ff,salmon:0xfa8072ff,sandybrown:0xf4a460ff,seagreen:0x2e8b57ff,seashell:0xfff5eeff,sienna:0xa0522dff,silver:0xc0c0c0ff,skyblue:0x87ceebff,slateblue:0x6a5acdff,slategray:0x708090ff,slategrey:0x708090ff,snow:0xfffafaff,springgreen:0x00ff7fff,steelblue:0x4682b4ff,tan:0xd2b48cff,teal:0x008080ff,thistle:0xd8bfd8ff,tomato:0xff6347ff,turquoise:0x40e0d0ff,violet:0xee82eeff,wheat:0xf5deb3ff,white:0xffffffff,whitesmoke:0xf5f5f5ff,yellow:0xffff00ff,yellowgreen:0x9acd32ff";

BOOL HippyIsMainQueue(void) {
    static void *mainQueueKey = &mainQueueKey;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        dispatch_queue_set_specific(dispatch_get_main_queue(), mainQueueKey, mainQueueKey, NULL);
    });
    return dispatch_get_specific(mainQueueKey) == mainQueueKey;
}

void HippyExecuteOnMainQueue(dispatch_block_t block) {
    if (HippyIsMainQueue()) {
        block();
    } else {
        dispatch_async(dispatch_get_main_queue(), block);
    }
}

void HippyExecuteOnMainThread(dispatch_block_t block, BOOL sync) {
    if (HippyIsMainQueue()) {
        block();
    } else if (sync) {
        dispatch_sync(dispatch_get_main_queue(), block);
    } else {
        dispatch_async(dispatch_get_main_queue(), block);
    }
}

void HippySwapClassMethods(Class cls, SEL original, SEL replacement) {
    Method originalMethod = class_getClassMethod(cls, original);
    IMP originalImplementation = method_getImplementation(originalMethod);
    const char *originalArgTypes = method_getTypeEncoding(originalMethod);

    Method replacementMethod = class_getClassMethod(cls, replacement);
    IMP replacementImplementation = method_getImplementation(replacementMethod);
    const char *replacementArgTypes = method_getTypeEncoding(replacementMethod);

    if (class_addMethod(cls, original, replacementImplementation, replacementArgTypes)) {
        class_replaceMethod(cls, replacement, originalImplementation, originalArgTypes);
    } else {
        method_exchangeImplementations(originalMethod, replacementMethod);
    }
}

void HippySwapInstanceMethods(Class cls, SEL original, SEL replacement) {
    Method originalMethod = class_getInstanceMethod(cls, original);
    IMP originalImplementation = method_getImplementation(originalMethod);
    const char *originalArgTypes = method_getTypeEncoding(originalMethod);

    Method replacementMethod = class_getInstanceMethod(cls, replacement);
    IMP replacementImplementation = method_getImplementation(replacementMethod);
    const char *replacementArgTypes = method_getTypeEncoding(replacementMethod);

    if (class_addMethod(cls, original, replacementImplementation, replacementArgTypes)) {
        class_replaceMethod(cls, replacement, originalImplementation, originalArgTypes);
    } else {
        method_exchangeImplementations(originalMethod, replacementMethod);
    }
}

void HippySwapInstanceMethodWithBlock(Class cls, SEL original, id replacementBlock, SEL replacementSelector) {
    Method originalMethod = class_getInstanceMethod(cls, original);
    if (!originalMethod) {
        return;
    }
    
    IMP implementation = imp_implementationWithBlock(replacementBlock);
    class_addMethod(cls, replacementSelector, implementation, method_getTypeEncoding(originalMethod));
    Method newMethod = class_getInstanceMethod(cls, replacementSelector);
    method_exchangeImplementations(originalMethod, newMethod);
}

BOOL HippyClassOverridesClassMethod(Class cls, SEL selector) {
    return HippyClassOverridesInstanceMethod(object_getClass(cls), selector);
}

BOOL HippyClassOverridesInstanceMethod(Class cls, SEL selector) {
    unsigned int numberOfMethods;
    Method *methods = class_copyMethodList(cls, &numberOfMethods);
    for (unsigned int i = 0; i < numberOfMethods; i++) {
        if (method_getName(methods[i]) == selector) {
            free(methods);
            return YES;
        }
    }
    free(methods);
    return NO;
}

BOOL HippyRunningInTestEnvironment(void) {
    static BOOL isTestEnvironment = NO;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        isTestEnvironment = objc_lookUpClass("SenTestCase") || objc_lookUpClass("XCTest");
    });
    return isTestEnvironment;
}

BOOL HippyRunningInAppExtension(void) {
    return [[[[NSBundle mainBundle] bundlePath] pathExtension] isEqualToString:@"appex"];
}

UIApplication *__nullable HippySharedApplication(void) {
    if (HippyRunningInAppExtension()) {
        return nil;
    }
    return [[UIApplication class] performSelector:@selector(sharedApplication)];
}

UIWindow *__nullable HippyKeyWindow(void) {
    if (HippyRunningInAppExtension()) {
        return nil;
    }
    UIWindow *keyWindow = nil;
    UIApplication *application = HippySharedApplication();
    if (@available(iOS 13.0, *)) {
        NSArray<UIScene *> *scenes = [[application connectedScenes] allObjects];
        BOOL keyWindowFound = NO;
        for (UIScene *obj in scenes) {
            if (UISceneActivationStateForegroundActive != obj.activationState) {
                continue;
            }
            if ([obj isKindOfClass:[UIWindowScene class]]) {
                UIWindowScene *windowScene = (UIWindowScene *)obj;
                if (@available(iOS 15.0, *)) {
                    keyWindow = windowScene.keyWindow;
                    break;
                }
                else {
                    NSArray<UIWindow *> *windows = [windowScene windows];
                    for (UIWindow *window in windows) {
                        if (![window isKeyWindow]) {
                            continue;
                        }
                        keyWindow = window;
                        keyWindowFound = YES;
                        break;
                    }
                }
                if (keyWindowFound) {
                    break;
                }
            }
        }
    }
    if (!keyWindow && [application respondsToSelector:@selector(keyWindow)]) {
        keyWindow = [application keyWindow];
    }
    return keyWindow;
}

UIViewController *__nullable HippyPresentedViewController(void) {
    if (HippyRunningInAppExtension()) {
        return nil;
    }

    UIViewController *controller = HippyKeyWindow().rootViewController;

    while (controller.presentedViewController) {
        controller = controller.presentedViewController;
    }

    return controller;
}

BOOL HippyForceTouchAvailable(void) {
    static BOOL forceSupported;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        forceSupported = [UITraitCollection class] && [UITraitCollection instancesRespondToSelector:@selector(forceTouchCapability)];
    });

    BOOL forceTouchCapability = NO;
    if (@available(iOS 9.0, *)) {
        forceTouchCapability = (HippyKeyWindow() ?: [UIView new]).traitCollection.forceTouchCapability == UIForceTouchCapabilityAvailable;
    }
    return forceSupported && forceTouchCapability;
}

NSError *HippyErrorWithMessage(NSString *message) {
    NSDictionary<NSString *, id> *errorInfo = @ { NSLocalizedDescriptionKey: message };
    return [[NSError alloc] initWithDomain:HippyErrorDomain code:0 userInfo:errorInfo];
}

NSError *HippyErrorWithMessageAndModuleName(NSString *message, NSString *moduleName) {
    NSDictionary<NSString *, id> *errorInfo = @ { NSLocalizedDescriptionKey: message, HippyFatalModuleName: moduleName ?: @"unknown" };
    return [[NSError alloc] initWithDomain:HippyErrorDomain code:0 userInfo:errorInfo];
}

NSError *HippyErrorFromErrorAndModuleName(NSError *error, NSString *moduleName) {
    NSDictionary *userInfo = [error userInfo];
    if (userInfo) {
        NSMutableDictionary *ui = [NSMutableDictionary dictionaryWithDictionary:userInfo];
        [ui setObject:moduleName ?: @"unknown" forKey:HippyFatalModuleName];
        userInfo = [NSDictionary dictionaryWithDictionary:ui];
    } else {
        userInfo = @ { HippyFatalModuleName: moduleName ?: @"unknown" };
    }
    NSError *retError = [NSError errorWithDomain:error.domain code:error.code userInfo:userInfo];
    return retError;
}

double HippyZeroIfNaN(double value) {
    return isnan(value) || isinf(value) ? 0 : value;
}

BOOL HPIsGzippedData(NSData *__nullable);  // exposed for unit testing purposes
BOOL HPIsGzippedData(NSData *__nullable data) {
    UInt8 *bytes = (UInt8 *)data.bytes;
    return (data.length >= 2 && bytes[0] == 0x1f && bytes[1] == 0x8b);
}

static void HPGetRGBAColorComponents(CGColorRef color, CGFloat rgba[4]) {
    CGColorSpaceModel model = CGColorSpaceGetModel(CGColorGetColorSpace(color));
    const CGFloat *components = CGColorGetComponents(color);
    switch (model) {
        case kCGColorSpaceModelMonochrome: {
            rgba[0] = components[0];
            rgba[1] = components[0];
            rgba[2] = components[0];
            rgba[3] = components[1];
            break;
        }
        case kCGColorSpaceModelRGB: {
            rgba[0] = components[0];
            rgba[1] = components[1];
            rgba[2] = components[2];
            rgba[3] = components[3];
            break;
        }
        case kCGColorSpaceModelCMYK:
        case kCGColorSpaceModelDeviceN:
        case kCGColorSpaceModelIndexed:
        case kCGColorSpaceModelLab:
        case kCGColorSpaceModelPattern:
        case kCGColorSpaceModelUnknown: {
#if HIPPY_DEBUG
            // unsupported format
            HippyLogError(@"Unsupported color model: %i", model);
#endif

            rgba[0] = 0.0;
            rgba[1] = 0.0;
            rgba[2] = 0.0;
            rgba[3] = 1.0;
            break;
        }
        default:

            break;
    }
}

NSString *HippyColorToHexString(CGColorRef color) {
    CGFloat rgba[4];
    HPGetRGBAColorComponents(color, rgba);
    uint8_t r = rgba[0] * 255;
    uint8_t g = rgba[1] * 255;
    uint8_t b = rgba[2] * 255;
    uint8_t a = rgba[3] * 255;
    if (a < 255) {
        return [NSString stringWithFormat:@"#%02x%02x%02x%02x", r, g, b, a];
    } else {
        return [NSString stringWithFormat:@"#%02x%02x%02x", r, g, b];
    }
}

UIColor *defaultColorForString(NSString *colorString) {
    UIColor *color = nil;
    static dispatch_once_t onceToken;
    static NSDictionary<NSString *, UIColor *> *colorsDictionary = nil;
    dispatch_once(&onceToken, ^{
        NSArray<NSString *> *colorDics = [colorDictionaryJSON componentsSeparatedByString:@","];
        NSMutableDictionary<NSString *, UIColor *> *tmpColorDic = [NSMutableDictionary dictionaryWithCapacity:[colorDics count]];
        for (NSString *colors in colorDics) {
            NSArray<NSString *> *dics = [colors componentsSeparatedByString:@":"];
            NSCAssert([dics count] == 2, @"colors config not right");
            NSString *key = [dics firstObject];
            NSString *colorString = [dics objectAtIndex:1];
            NSScanner *scan = [NSScanner scannerWithString:colorString];
            unsigned int colorInteger;
            BOOL scanSuccess = [scan scanHexInt:&colorInteger];
            if (scanSuccess) {
                UIColor *tmpColor = HippyConvertNumberToColor(colorInteger);
                [tmpColorDic setObject:tmpColor forKey:key];
            }
        }
        colorsDictionary = [tmpColorDic copy];
    });
    if (colorString) {
        color = colorsDictionary[colorString];
    }
    return color;
}

UIColor *HippyConvertStringToColor(NSString *colorString) {
    if (!colorString) {
        return nil;
    }
    BOOL isHexString = NO;
    BOOL hasPrefixHashTag = NO;
    if ([colorString hasPrefix:@"#"]) {
        colorString = [colorString substringFromIndex:1];
        isHexString = YES;
        hasPrefixHashTag = YES;
    }
    else if ([colorString hasPrefix:@"0x"]) {
        colorString = [colorString substringFromIndex:2];
        isHexString = YES;
    }
    if (!isHexString) {
        UIColor *color = defaultColorForString(colorString);
        if (color) {
            return color;
        }
    }
    BOOL scanSuccess = NO;
    NSInteger scanResult;
    UIColor *color = nil;
    if (isHexString) {
        //hex string has three types:#2b2->#22bb22ff, #22bb22->#22bb22ff, #22bb22ff
        if (hasPrefixHashTag) {
            if ([colorString length] == 3) {
                NSMutableString *fullColorString = [NSMutableString stringWithString:colorString];
                [fullColorString insertString:[fullColorString substringWithRange:NSMakeRange(2, 1)] atIndex:2];
                [fullColorString insertString:[fullColorString substringWithRange:NSMakeRange(1, 1)] atIndex:1];
                [fullColorString insertString:[fullColorString substringWithRange:NSMakeRange(0, 1)] atIndex:0];
                [fullColorString appendString:@"ff"];
                colorString = [fullColorString copy];
            }
            else if ([colorString length] == 6) {
                colorString = [colorString stringByAppendingString:@"ff"];
            }
        }
        NSScanner *scan = [NSScanner scannerWithString:colorString];
        unsigned int colorInteger;
        scanSuccess = [scan scanHexInt:&colorInteger];
        scanResult = colorInteger;
    }
    else {
        NSScanner *scan = [NSScanner scannerWithString:colorString];
        NSInteger colorInteger;
        scanSuccess = [scan scanInteger:&colorInteger];
        scanResult = colorInteger;
    }
    if (scanSuccess) {
        color = HippyConvertNumberToColor(scanResult);
    }
    return color;
}

UIColor *HippyConvertNumberToColor(NSInteger colorNumber) {
    NSInteger a = (colorNumber >> 24) & 0xFF;
    NSInteger r = (colorNumber >> 16) & 0xFF;
    NSInteger g = (colorNumber >> 8) & 0xFF;
    NSInteger b = colorNumber & 0xFF;
    UIColor *color = [UIColor colorWithRed:r / 255.0f
                                     green:g / 255.0f
                                      blue:b / 255.0f
                                     alpha:a / 255.0f];
    return color;
}

// (https://github.com/0xced/XCDFormInputAccessoryView/blob/master/XCDFormInputAccessoryView/XCDFormInputAccessoryView.m#L10-L14)
NSString *HippyUIKitLocalizedString(NSString *string) {
    NSBundle *UIKitBundle = [NSBundle bundleForClass:[UIApplication class]];
    return UIKitBundle ? [UIKitBundle localizedStringForKey:string value:string table:nil] : string;
}

NSString *__nullable HippyGetURLQueryParam(NSURL *__nullable URL, NSString *param) {
    if (!URL) {
        return nil;
    }

    NSURLComponents *components = [NSURLComponents componentsWithURL:URL resolvingAgainstBaseURL:YES];
    for (NSURLQueryItem *queryItem in [components.queryItems reverseObjectEnumerator]) {
        if ([queryItem.name isEqualToString:param]) {
            return queryItem.value;
        }
    }

    return nil;
}

NSURL *__nullable HippyURLByReplacingQueryParam(NSURL *__nullable URL, NSString *param, NSString *__nullable value) {
    if (!URL) {
        return nil;
    }

    NSURLComponents *components = [NSURLComponents componentsWithURL:URL resolvingAgainstBaseURL:YES];

    __block NSInteger paramIndex = NSNotFound;
    NSMutableArray<NSURLQueryItem *> *queryItems = [components.queryItems mutableCopy];
    [queryItems enumerateObjectsWithOptions:NSEnumerationReverse usingBlock:^(NSURLQueryItem *item, NSUInteger i, BOOL *stop) {
        if ([item.name isEqualToString:param]) {
            paramIndex = i;
            *stop = YES;
        }
    }];

    if (!value) {
        if (paramIndex != NSNotFound) {
            [queryItems removeObjectAtIndex:paramIndex];
        }
    } else {
        NSURLQueryItem *newItem = [NSURLQueryItem queryItemWithName:param value:value];
        if (paramIndex == NSNotFound) {
            [queryItems addObject:newItem];
        } else {
            [queryItems replaceObjectAtIndex:paramIndex withObject:newItem];
        }
    }
    components.queryItems = queryItems;
    return components.URL;
}

NSURL *__nullable HippyURLWithString(NSString *URLString, NSString *baseURLString) {
    if (URLString) {
        NSURL *baseURL = HippyURLWithString(baseURLString, NULL);
        NSData *uriData = [URLString dataUsingEncoding:NSUTF8StringEncoding];
        if (nil == uriData) {
            return nil;
        }
        CFURLRef urlRef = CFURLCreateWithBytes(NULL, [uriData bytes], [uriData length], kCFStringEncodingUTF8, (__bridge CFURLRef)baseURL);
        NSURL *source_url = CFBridgingRelease(urlRef);
        return source_url;
    }
    return nil;
}

NSString *HippySchemeFromURLString(NSString *urlString) {
    NSUInteger location = [urlString rangeOfString:@":"].location;
    if (NSNotFound == location || 0 == location) {
        return @"";
    }
    return [urlString substringToIndex:location];
}

NSStringEncoding HippyGetStringEncodingFromURLResponse(NSURLResponse *response) {
    NSString *textEncoding = [response textEncodingName];
    if (!textEncoding) {
        return NSUTF8StringEncoding;
    }
    CFStringEncoding encoding = CFStringConvertIANACharSetNameToEncoding((CFStringRef)textEncoding);
    NSStringEncoding dataEncoding = CFStringConvertEncodingToNSStringEncoding(encoding);
    return dataEncoding;
}


NSString *const HippyErrorUnspecified = @"HippyErrorUnspecified";

static NSString *__nullable _HPJSONStringifyNoRetry(id __nullable jsonObject, NSError **error) {
    if (!jsonObject) {
        return nil;
    }
    
    static SEL JSONKitSelector = NULL;
    static NSSet<Class> *collectionTypes;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        SEL selector = NSSelectorFromString(@"JSONStringWithOptions:error:");
        if ([NSDictionary instancesRespondToSelector:selector]) {
            JSONKitSelector = selector;
            collectionTypes = [NSSet setWithObjects:[NSArray class], [NSMutableArray class], [NSDictionary class], [NSMutableDictionary class], nil];
        }
    });
    
    @try {
        // Use JSONKit if available and object is not a fragment
        if (JSONKitSelector && [collectionTypes containsObject:[jsonObject classForCoder]]) {
            return ((NSString * (*)(id, SEL, int, NSError **)) objc_msgSend)(jsonObject, JSONKitSelector, 0, error);
        }
        
        // Use Foundation JSON method
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:jsonObject options:(NSJSONWritingOptions)NSJSONReadingAllowFragments error:error];
        
        return jsonData ? [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding] : nil;
    } @catch (NSException *exception) {
        // Convert exception to error
        if (error) {
            *error = [NSError errorWithDomain:HippyErrorDomain code:0 userInfo:@ { NSLocalizedDescriptionKey: exception.description ?: @"" }];
        }
        return nil;
    }
}

NSString *__nullable HippyJSONStringify(id __nullable jsonObject, NSError **error) {
    if (error) {
        return _HPJSONStringifyNoRetry(jsonObject, error);
    } else {
        NSError *localError;
        NSString *json = _HPJSONStringifyNoRetry(jsonObject, &localError);
        if (localError) {
            HippyLogError(@"HPJSONStringify() encountered the following error: %@", localError.localizedDescription);
            // Sanitize the data, then retry. This is slow, but it prevents uncaught
            // data issues from crashing in production
            return _HPJSONStringifyNoRetry(HippyJSONClean(jsonObject), NULL);
        }
        return json;
    }
}

static id __nullable _HPJSONParse(NSString *__nullable jsonString, BOOL mutable, NSError **error) {
    static SEL JSONKitSelector = NULL;
    static SEL JSONKitMutableSelector = NULL;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        SEL selector = NSSelectorFromString(@"objectFromJSONStringWithParseOptions:error:");
        if ([NSString instancesRespondToSelector:selector]) {
            JSONKitSelector = selector;
            JSONKitMutableSelector = NSSelectorFromString(@"mutableObjectFromJSONStringWithParseOptions:error:");
        }
    });
    
    if (jsonString) {
        // Use JSONKit if available and string is not a fragment
        if (JSONKitSelector) {
            NSInteger length = jsonString.length;
            for (NSInteger i = 0; i < length; i++) {
                unichar c = [jsonString characterAtIndex:i];
                if (strchr("{[", c)) {
                    static const int options = (1 << 2);  // loose unicode
                    SEL selector = mutable ? JSONKitMutableSelector : JSONKitSelector;
                    return ((id(*)(id, SEL, int, NSError **))objc_msgSend)(jsonString, selector, options, error);
                }
                if (!strchr(" \r\n\t", c)) {
                    break;
                }
            }
        }
        
        // Use Foundation JSON method
        NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
        if (!jsonData) {
            jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding allowLossyConversion:YES];
            if (jsonData) {
                HippyLogWarn(@"HPJSONParse received the following string, which could "
                             "not be losslessly converted to UTF8 data: '%@'",
                             jsonString);
            } else {
                NSString *errorMessage = @"HPJSONParse received invalid UTF8 data";
                if (error) {
                    *error = HippyErrorWithMessage(errorMessage);
                } else {
                    HippyLogError(@"%@", errorMessage);
                }
                return nil;
            }
        }
        NSJSONReadingOptions options = NSJSONReadingAllowFragments;
        if (mutable) {
            options |= NSJSONReadingMutableContainers;
        }
        return [NSJSONSerialization JSONObjectWithData:jsonData options:options error:error];
    }
    return nil;
}

id __nullable HippyJSONParse(NSString *__nullable jsonString, NSError **error) {
    return _HPJSONParse(jsonString, NO, error);
}

id __nullable HippyJSONParseMutable(NSString *__nullable jsonString, NSError **error) {
    return _HPJSONParse(jsonString, YES, error);
}

id HippyJSONClean(id object) {
    static dispatch_once_t onceToken;
    static NSSet<Class> *validLeafTypes;
    dispatch_once(&onceToken, ^{
        validLeafTypes = [[NSSet alloc] initWithArray:@[
            [NSString class],
            [NSMutableString class],
            [NSNumber class],
            [NSNull class],
        ]];
    });
    
    if ([validLeafTypes containsObject:[object classForCoder]]) {
        if ([object isKindOfClass:[NSNumber class]]) {
            return @(HippyZeroIfNaN([object doubleValue]));
        }
        if ([object isKindOfClass:[NSString class]]) {
            if ([object UTF8String] == NULL) {
                return (id)kCFNull;
            }
        }
        return object;
    }
    
    if ([object isKindOfClass:[NSDictionary class]]) {
        __block BOOL copy = NO;
        NSMutableDictionary<NSString *, id> *values = [[NSMutableDictionary alloc] initWithCapacity:[object count]];
        [object enumerateKeysAndObjectsUsingBlock:^(NSString *key, id item, __unused BOOL *stop) {
            id value = HippyJSONClean(item);
            values[key] = value;
            copy |= value != item;
        }];
        return copy ? values : object;
    }
    
    if ([object isKindOfClass:[NSArray class]]) {
        __block BOOL copy = NO;
        __block NSArray *values = object;
        [object enumerateObjectsUsingBlock:^(id item, NSUInteger idx, __unused BOOL *stop) {
            id value = HippyJSONClean(item);
            if (copy) {
                [(NSMutableArray *)values addObject:value];
            } else if (value != item) {
                // Converted value is different, so we'll need to copy the array
                values = [[NSMutableArray alloc] initWithCapacity:values.count];
                for (NSUInteger i = 0; i < idx; i++) {
                    [(NSMutableArray *)values addObject:object[i]];
                }
                [(NSMutableArray *)values addObject:value];
                copy = YES;
            }
        }];
        return values;
    }
    
    return (id)kCFNull;
}

NSString *HippyMD5Hash(NSString *string) {
    const char *str = string.UTF8String;
    unsigned char result[CC_MD5_DIGEST_LENGTH];
    CC_MD5(str, (CC_LONG)strlen(str), result);
    
    return [NSString stringWithFormat:@"%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x", result[0], result[1], result[2], result[3],
            result[4], result[5], result[6], result[7], result[8], result[9], result[10], result[11], result[12], result[13], result[14],
            result[15]];
}

NSDictionary<NSString *, id> *HippyMakeError(NSString *message, id __nullable toStringify, NSDictionary<NSString *, id> *__nullable extraData) {
    if (toStringify) {
        message = [message stringByAppendingString:[toStringify description]];
    }
    
    NSMutableDictionary<NSString *, id> *error = [extraData mutableCopy] ?: [NSMutableDictionary new];
    error[@"message"] = message;
    return error;
}

NSDictionary<NSString *, id> *HippyMakeAndLogError(NSString *message, id __nullable toStringify, NSDictionary<NSString *, id> *__nullable extraData) {
    NSDictionary<NSString *, id> *error = HippyMakeError(message, toStringify, extraData);
    HippyLogError(@"\nError: %@", error);
    return error;
}

NSDictionary<NSString *, id> *HippyJSErrorFromNSError(NSError *error) {
    NSString *codeWithDomain = [NSString stringWithFormat:@"E%@%ld", error.domain.uppercaseString, (long)error.code];
    return HippyJSErrorFromCodeMessageAndNSError(codeWithDomain, error.localizedDescription, error);
}

NSDictionary<NSString *, id> *HippyJSErrorFromCodeMessageAndNSError(NSString *code, NSString *message, NSError *__nullable error) {
    NSString *errorMessage;
    NSArray<NSString *> *stackTrace = [NSThread callStackSymbols];
    NSMutableDictionary<NSString *, id> *errorInfo = [NSMutableDictionary dictionaryWithObject:stackTrace forKey:@"nativeStackIOS"];
    
    if (error) {
        errorMessage = error.localizedDescription ?: @"Unknown error from a native module";
        errorInfo[@"domain"] = error.domain ?: HippyErrorDomain;
    } else {
        errorMessage = @"Unknown error from a native module";
        errorInfo[@"domain"] = HippyErrorDomain;
    }
    errorInfo[@"code"] = code ?: HippyErrorUnspecified;
    errorInfo[@"userInfo"] = HippyNullIfNil(error.userInfo);
    
    // Allow for explicit overriding of the error message
    errorMessage = message ?: errorMessage;
    
    return HippyMakeError(errorMessage, nil, errorInfo);
}


#pragma mark - 

@implementation HippyUtils

+ (NSString *)sdkVersion {
    return @(HIPPY_STR(HIPPY_VERSION));
}

@end
