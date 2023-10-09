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

#import <CommonCrypto/CommonCrypto.h>

#import "HippyUtils.h"
#import "HPAsserts.h"
#import "HippyLog.h"

#include <objc/message.h>

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
            *error = [NSError errorWithDomain:HPErrorDomain code:0 userInfo:@ { NSLocalizedDescriptionKey: exception.description ?: @"" }];
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
                    *error = HPErrorWithMessage(errorMessage);
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
            return @(HPZeroIfNaN([object doubleValue]));
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

NSString *HPMD5Hash(NSString *string) {
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
        errorInfo[@"domain"] = error.domain ?: HPErrorDomain;
    } else {
        errorMessage = @"Unknown error from a native module";
        errorInfo[@"domain"] = HPErrorDomain;
    }
    errorInfo[@"code"] = code ?: HippyErrorUnspecified;
    errorInfo[@"userInfo"] = HPNullIfNil(error.userInfo);

    // Allow for explicit overriding of the error message
    errorMessage = message ?: errorMessage;

    return HippyMakeError(errorMessage, nil, errorInfo);
}
