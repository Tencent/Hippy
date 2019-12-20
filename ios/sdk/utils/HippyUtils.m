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

#import <mach/mach_time.h>
#import <objc/message.h>
#import <objc/runtime.h>

#import <UIKit/UIKit.h>

#import <CommonCrypto/CommonCrypto.h>

#import <zlib.h>
#import <dlfcn.h>

#import "HippyAssert.h"
#import "HippyLog.h"

NSString *const HippyErrorUnspecified = @"EUNSPECIFIED";

static NSString *__nullable _HippyJSONStringifyNoRetry(id __nullable jsonObject, NSError **error)
{
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
            collectionTypes = [NSSet setWithObjects:
                               [NSArray class], [NSMutableArray class],
                               [NSDictionary class], [NSMutableDictionary class], nil];
        }
    });
    
    @try {
        
        // Use JSONKit if available and object is not a fragment
        if (JSONKitSelector && [collectionTypes containsObject:[jsonObject classForCoder]]) {
            return ((NSString *(*)(id, SEL, int, NSError **))objc_msgSend)(jsonObject, JSONKitSelector, 0, error);
        }
        
        // Use Foundation JSON method
        NSData *jsonData = [NSJSONSerialization
                            dataWithJSONObject:jsonObject options:(NSJSONWritingOptions)NSJSONReadingAllowFragments
                            error:error];
        
        return jsonData ? [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding] : nil;
    }
    @catch (NSException *exception) {
        
        // Convert exception to error
        if (error) {
            *error = [NSError errorWithDomain:HippyErrorDomain code:0 userInfo:@{
                                                                               NSLocalizedDescriptionKey: exception.description ?: @""
                                                                               }];
        }
        return nil;
    }
}

NSString *__nullable HippyJSONStringify(id __nullable jsonObject, NSError **error)
{
    if (error) {
        return _HippyJSONStringifyNoRetry(jsonObject, error);
    } else {
        NSError *localError;
        NSString *json = _HippyJSONStringifyNoRetry(jsonObject, &localError);
        if (localError) {
            HippyLogError(@"HippyJSONStringify() encountered the following error: %@",
                        localError.localizedDescription);
            // Sanitize the data, then retry. This is slow, but it prevents uncaught
            // data issues from crashing in production
            return _HippyJSONStringifyNoRetry(HippyJSONClean(jsonObject), NULL);
        }
        return json;
    }
}

static id __nullable _HippyJSONParse(NSString *__nullable jsonString, BOOL mutable, NSError **error)
{
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
                    static const int options = (1 << 2); // loose unicode
                    SEL selector = mutable ? JSONKitMutableSelector : JSONKitSelector;
                    return ((id (*)(id, SEL, int, NSError **))objc_msgSend)(jsonString, selector, options, error);
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
                HippyLogWarn(@"HippyJSONParse received the following string, which could "
                           "not be losslessly converted to UTF8 data: '%@'", jsonString);
            } else {
                NSString *errorMessage = @"HippyJSONParse received invalid UTF8 data";
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
        return [NSJSONSerialization JSONObjectWithData:jsonData
                                               options:options
                                                 error:error];
    }
    return nil;
}

id __nullable HippyJSONParse(NSString *__nullable jsonString, NSError **error)
{
    return _HippyJSONParse(jsonString, NO, error);
}

id __nullable HippyJSONParseMutable(NSString *__nullable jsonString, NSError **error)
{
    return _HippyJSONParse(jsonString, YES, error);
}

id HippyJSONClean(id object)
{
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

NSString *HippyMD5Hash(NSString *string)
{
    const char *str = string.UTF8String;
    unsigned char result[CC_MD5_DIGEST_LENGTH];
    CC_MD5(str, (CC_LONG)strlen(str), result);
    
    return [NSString stringWithFormat:@"%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x",
            result[0], result[1], result[2], result[3],
            result[4], result[5], result[6], result[7],
            result[8], result[9], result[10], result[11],
            result[12], result[13], result[14], result[15]
            ];
}

BOOL HippyIsMainQueue()
{
    static void *mainQueueKey = &mainQueueKey;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        dispatch_queue_set_specific(dispatch_get_main_queue(),
                                    mainQueueKey, mainQueueKey, NULL);
    });
    return dispatch_get_specific(mainQueueKey) == mainQueueKey;
}

void HippyExecuteOnMainQueue(dispatch_block_t block)
{
    if (HippyIsMainQueue()) {
        block();
    } else {
        dispatch_async(dispatch_get_main_queue(), ^{
            block();
        });
    }
}

void HippyExecuteOnMainThread(dispatch_block_t block, BOOL sync)
{
    if (HippyIsMainQueue()) {
        block();
    } else if (sync) {
        dispatch_sync(dispatch_get_main_queue(), ^{
            block();
        });
    } else {
        dispatch_async(dispatch_get_main_queue(), ^{
            block();
        });
    }
}

CGFloat HippyScreenScale()
{
    static CGFloat scale;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        HippyExecuteOnMainThread(^{
            scale = [UIScreen mainScreen].scale;
        }, YES);
    });
    
    return scale;
}

CGSize HippyScreenSize()
{
    // FIXME: this caches the bounds at app start, whatever those were, and then
    // doesn't update when the device is rotated. We need to find another thread-
    // safe way to get the screen size.
    
    static CGSize size;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        HippyExecuteOnMainThread(^{
            size = [UIScreen mainScreen].bounds.size;
        }, YES);
    });
    
    return size;
}

CGFloat HippyRoundPixelValue(CGFloat value)
{
    CGFloat scale = HippyScreenScale();
    return round(value * scale) / scale;
}

CGFloat HippyCeilPixelValue(CGFloat value)
{
    CGFloat scale = HippyScreenScale();
    return ceil(value * scale) / scale;
}

CGFloat HippyFloorPixelValue(CGFloat value)
{
    CGFloat scale = HippyScreenScale();
    return floor(value * scale) / scale;
}

CGSize HippySizeInPixels(CGSize pointSize, CGFloat scale)
{
    return (CGSize){
        ceil(pointSize.width * scale),
        ceil(pointSize.height * scale),
    };
}

void HippySwapClassMethods(Class cls, SEL original, SEL replacement)
{
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

void HippySwapInstanceMethods(Class cls, SEL original, SEL replacement)
{
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

BOOL HippyClassOverridesClassMethod(Class cls, SEL selector)
{
    return HippyClassOverridesInstanceMethod(object_getClass(cls), selector);
}

BOOL HippyClassOverridesInstanceMethod(Class cls, SEL selector)
{
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

NSDictionary<NSString *, id> *HippyMakeError(NSString *message,
                                           id __nullable toStringify,
                                           NSDictionary<NSString *, id> *__nullable extraData)
{
    if (toStringify) {
        message = [message stringByAppendingString:[toStringify description]];
    }
    
    NSMutableDictionary<NSString *, id> *error = [extraData mutableCopy] ?: [NSMutableDictionary new];
    error[@"message"] = message;
    return error;
}

NSDictionary<NSString *, id> *HippyMakeAndLogError(NSString *message,
                                                 id __nullable toStringify,
                                                 NSDictionary<NSString *, id> *__nullable extraData)
{
    NSDictionary<NSString *, id> *error = HippyMakeError(message, toStringify, extraData);
    HippyLogError(@"\nError: %@", error);
    return error;
}

NSDictionary<NSString *, id> *HippyJSErrorFromNSError(NSError *error)
{
    NSString *codeWithDomain = [NSString stringWithFormat:@"E%@%ld", error.domain.uppercaseString, (long)error.code];
    return HippyJSErrorFromCodeMessageAndNSError(codeWithDomain,
                                               error.localizedDescription,
                                               error);
}

// TODO: Can we just replace HippyMakeError with this function instead?
NSDictionary<NSString *, id> *HippyJSErrorFromCodeMessageAndNSError(NSString *code,
                                                                  NSString *message,
                                                                  NSError *__nullable error)
{
    NSString *errorMessage;
    NSArray<NSString *> *stackTrace = [NSThread callStackSymbols];
    NSMutableDictionary<NSString *, id> *errorInfo =
    [NSMutableDictionary dictionaryWithObject:stackTrace forKey:@"nativeStackIOS"];
    
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

BOOL HippyRunningInTestEnvironment(void)
{
    static BOOL isTestEnvironment = NO;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        isTestEnvironment = objc_lookUpClass("SenTestCase") || objc_lookUpClass("XCTest");
    });
    return isTestEnvironment;
}

BOOL HippyRunningInAppExtension(void)
{
    return [[[[NSBundle mainBundle] bundlePath] pathExtension] isEqualToString:@"appex"];
}

UIApplication *__nullable HippySharedApplication(void)
{
    if (HippyRunningInAppExtension()) {
        return nil;
    }
    return [[UIApplication class] performSelector:@selector(sharedApplication)];
}

UIWindow *__nullable HippyKeyWindow(void)
{
    if (HippyRunningInAppExtension()) {
        return nil;
    }
    
    // TODO: replace with a more robust solution
    return HippySharedApplication().keyWindow;
}

UIViewController *__nullable HippyPresentedViewController(void)
{
    if (HippyRunningInAppExtension()) {
        return nil;
    }
    
    UIViewController *controller = HippyKeyWindow().rootViewController;
    
    while (controller.presentedViewController) {
        controller = controller.presentedViewController;
    }
    
    return controller;
}

BOOL HippyForceTouchAvailable(void)
{
    static BOOL forceSupported;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        forceSupported = [UITraitCollection class] &&
        [UITraitCollection instancesRespondToSelector:@selector(forceTouchCapability)];
    });
    
    BOOL forceTouchCapability = NO;
    if (@available(iOS 9.0, *)) {
        forceTouchCapability = (HippyKeyWindow() ?: [UIView new]).traitCollection.forceTouchCapability == UIForceTouchCapabilityAvailable;
    }
    return forceSupported && forceTouchCapability;
}

NSError *HippyErrorWithMessage(NSString *message)
{
    NSDictionary<NSString *, id> *errorInfo = @{NSLocalizedDescriptionKey: message};
    return [[NSError alloc] initWithDomain:HippyErrorDomain code:0 userInfo:errorInfo];
}

double HippyZeroIfNaN(double value)
{
    return isnan(value) || isinf(value) ? 0 : value;
}

NSURL *HippyDataURL(NSString *mimeType, NSData *data)
{
    return [NSURL URLWithString:
            [NSString stringWithFormat:@"data:%@;base64,%@", mimeType,
             [data base64EncodedStringWithOptions:(NSDataBase64EncodingOptions)0]]];
}

BOOL HippyIsGzippedData(NSData *__nullable); // exposed for unit testing purposes
BOOL HippyIsGzippedData(NSData *__nullable data)
{
    UInt8 *bytes = (UInt8 *)data.bytes;
    return (data.length >= 2 && bytes[0] == 0x1f && bytes[1] == 0x8b);
}

NSString *__nullable HippyBundlePathForURL(NSURL *__nullable URL)
{
    if (!URL.fileURL) {
        // Not a file path
        return nil;
    }
    NSString *path = URL.path;
    NSString *bundlePath = [[NSBundle mainBundle] resourcePath];
    if (![path hasPrefix:bundlePath]) {
        // Not a bundle-relative file
        return nil;
    }
    path = [path substringFromIndex:bundlePath.length];
    if ([path hasPrefix:@"/"]) {
        path = [path substringFromIndex:1];
    }
    return path;
}

BOOL HippyIsLocalAssetURL(NSURL *__nullable imageURL)
{
    NSString *name = HippyBundlePathForURL(imageURL);
    if (!name) {
        return NO;
    }
    
    NSString *extension = [name pathExtension];
    return [extension isEqualToString:@"png"] || [extension isEqualToString:@"jpg"];
}

HIPPY_EXTERN NSString *__nullable HippyTempFilePath(NSString *extension, NSError **error)
{
    static NSError *setupError = nil;
    static NSString *directory;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        directory = [NSTemporaryDirectory() stringByAppendingPathComponent:@"HippyNative"];
        // If the temporary directory already exists, we'll delete it to ensure
        // that temp files from the previous run have all been deleted. This is not
        // a security measure, it simply prevents the temp directory from using too
        // much space, as the circumstances under which iOS clears it automatically
        // are not well-defined.
        NSFileManager *fileManager = [NSFileManager new];
        if ([fileManager fileExistsAtPath:directory]) {
            [fileManager removeItemAtPath:directory error:NULL];
        }
        if (![fileManager fileExistsAtPath:directory]) {
            NSError *localError = nil;
            if (![fileManager createDirectoryAtPath:directory
                        withIntermediateDirectories:YES
                                         attributes:nil
                                              error:&localError]) {
                // This is bad
                HippyLogError(@"Failed to create temporary directory: %@", localError);
                setupError = localError;
                directory = nil;
            }
        }
    });
    
    if (!directory || setupError) {
        if (error) {
            *error = setupError;
        }
        return nil;
    }
    
    // Append a unique filename
    NSString *filename = [NSUUID new].UUIDString;
    if (extension) {
        filename = [filename stringByAppendingPathExtension:extension];
    }
    return [directory stringByAppendingPathComponent:filename];
}

static void HippyGetRGBAColorComponents(CGColorRef color, CGFloat rgba[4])
{
    CGColorSpaceModel model = CGColorSpaceGetModel(CGColorGetColorSpace(color));
    const CGFloat *components = CGColorGetComponents(color);
    switch (model)
    {
        case kCGColorSpaceModelMonochrome:
        {
            rgba[0] = components[0];
            rgba[1] = components[0];
            rgba[2] = components[0];
            rgba[3] = components[1];
            break;
        }
        case kCGColorSpaceModelRGB:
        {
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
        case kCGColorSpaceModelUnknown:
        {
            
#ifdef HIPPY_DEBUG
            //unsupported format
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

NSString *HippyColorToHexString(CGColorRef color)
{
    CGFloat rgba[4];
    HippyGetRGBAColorComponents(color, rgba);
    uint8_t r = rgba[0]*255;
    uint8_t g = rgba[1]*255;
    uint8_t b = rgba[2]*255;
    uint8_t a = rgba[3]*255;
    if (a < 255) {
        return [NSString stringWithFormat:@"#%02x%02x%02x%02x", r, g, b, a];
    } else {
        return [NSString stringWithFormat:@"#%02x%02x%02x", r, g, b];
    }
}

// (https://github.com/0xced/XCDFormInputAccessoryView/blob/master/XCDFormInputAccessoryView/XCDFormInputAccessoryView.m#L10-L14)
NSString *HippyUIKitLocalizedString(NSString *string)
{
    NSBundle *UIKitBundle = [NSBundle bundleForClass:[UIApplication class]];
    return UIKitBundle ? [UIKitBundle localizedStringForKey:string value:string table:nil] : string;
}

NSString *__nullable HippyGetURLQueryParam(NSURL *__nullable URL, NSString *param)
{
    HippyAssertParam(param);
    if (!URL) {
        return nil;
    }
    
    NSURLComponents *components = [NSURLComponents componentsWithURL:URL
                                             resolvingAgainstBaseURL:YES];
    for (NSURLQueryItem *queryItem in [components.queryItems reverseObjectEnumerator]) {
        if ([queryItem.name isEqualToString:param]) {
            return queryItem.value;
        }
    }
    
    return nil;
}

NSURL *__nullable HippyURLByReplacingQueryParam(NSURL *__nullable URL, NSString *param, NSString *__nullable value)
{
    HippyAssertParam(param);
    if (!URL) {
        return nil;
    }
    
    NSURLComponents *components = [NSURLComponents componentsWithURL:URL
                                             resolvingAgainstBaseURL:YES];
    
    __block NSInteger paramIndex = NSNotFound;
    NSMutableArray<NSURLQueryItem *> *queryItems = [components.queryItems mutableCopy];
    [queryItems enumerateObjectsWithOptions:NSEnumerationReverse usingBlock:
     ^(NSURLQueryItem *item, NSUInteger i, BOOL *stop) {
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
        NSURLQueryItem *newItem  = [NSURLQueryItem queryItemWithName:param
                                                               value:value];
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
        CFURLRef URLRef = CFURLCreateWithString(NULL, (CFStringRef)URLString, (CFURLRef)baseURL);
        if (URLRef) {
            return CFBridgingRelease(URLRef);
        }
    }
    return nil;
}
