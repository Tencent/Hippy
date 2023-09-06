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

#import <WebKit/WKHTTPCookieStore.h>
#import <WebKit/WKWebsiteDataStore.h>

#import "HippyBridge+VFSLoader.h"
#import "HippyDefines.h"
#import "HippyNetWork.h"
#import "HPAsserts.h"
#import "HPToolUtils.h"

static NSStringEncoding GetStringEncodingFromURLResponse(NSURLResponse *response) {
    NSString *textEncoding = [response textEncodingName];
    if (!textEncoding) {
        return NSUTF8StringEncoding;
    }
    CFStringEncoding encoding = CFStringConvertIANACharSetNameToEncoding((CFStringRef)textEncoding);
    NSStringEncoding dataEncoding = CFStringConvertEncodingToNSStringEncoding(encoding);
    return dataEncoding;
}

@implementation HippyNetWork

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE(network)

HIPPY_EXPORT_METHOD(fetch:(NSDictionary *)params resolver:(__unused HippyPromiseResolveBlock)resolve rejecter:(__unused HippyPromiseRejectBlock)reject) {
    if (!resolve) {
        return;
    }
    NSString *method = params[@"method"];
    NSString *url = params[@"url"];
    NSDictionary *header = params[@"headers"];
    NSString *body = params[@"body"];
  
    HPAssertParam(url);
    HPAssertParam(method);

    NSMutableDictionary *vfsParams = [NSMutableDictionary new];
    [header enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, id  _Nonnull obj, __unused BOOL *stop) {
        NSString *value = nil;
        if ([obj isKindOfClass: [NSArray class]]) {
            value = [[(NSArray *)obj valueForKey:@"description"] componentsJoinedByString:@","];
        } else if ([obj isKindOfClass: [NSString class]]) {
            value = obj;
        }
        
        [vfsParams setValue: value forKey: key];
    }];
    NSData *data = nil;
    if (body) {
        data = [body dataUsingEncoding:NSUTF8StringEncoding];
    }
    [self.bridge loadContentsAsynchronouslyFromUrl:url
                                            method:method?:@"Get"
                                            params:vfsParams
                                              body:data
                                             queue:nil
                                          progress:nil
                                 completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        NSStringEncoding encoding = GetStringEncodingFromURLResponse(response);
        NSString *dataStr = [[NSString alloc] initWithData:data encoding:encoding];
        NSUInteger statusCode = 0;
        NSDictionary *headers = nil;
        if ([response isKindOfClass:[NSHTTPURLResponse class]]) {
            NSHTTPURLResponse *httpRes = (NSHTTPURLResponse *)response;
            statusCode = [httpRes statusCode];
            headers = [httpRes allHeaderFields];
        }
        NSDictionary *result =
            @{ @"statusCode": @(statusCode), @"statusLine": @"", @"respHeaders": headers ?: @ {}, @"respBody": dataStr ?: @"" };
        resolve(result);
    }];
}

HIPPY_EXPORT_METHOD(getCookie:(NSString *)urlString resolver:(HippyPromiseResolveBlock)resolve rejecter:(__unused HippyPromiseRejectBlock)reject) {
    NSData *uriData = [urlString dataUsingEncoding:NSUTF8StringEncoding];
    if (nil == uriData) {
        resolve(@"");
        return;
    }
    CFURLRef urlRef = CFURLCreateWithBytes(NULL, (const UInt8 *)[uriData bytes], [uriData length], kCFStringEncodingUTF8, NULL);
    NSURL *source_url = CFBridgingRelease(urlRef);
    NSArray<NSHTTPCookie *>* cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookiesForURL:source_url];
    NSMutableString *string = [NSMutableString stringWithCapacity:256];
    for (NSHTTPCookie *cookie in cookies) {
        [string appendFormat:@";%@=%@", cookie.name, cookie.value];
    }
    if ([string length] > 0) {
        [string deleteCharactersInRange:NSMakeRange(0, 1)];
    }
    resolve(string);
}

HIPPY_EXPORT_METHOD(setCookie:(NSString *)urlString keyValue:(NSString *)keyValue expireString:(NSString *)expireString) {
    NSData *uriData = [urlString dataUsingEncoding:NSUTF8StringEncoding];
    if (nil == uriData) {
        return;
    }
    CFURLRef urlRef = CFURLCreateWithBytes(NULL, (const UInt8 *)[uriData bytes], [uriData length], kCFStringEncodingUTF8, NULL);
    if (NULL == urlRef) {
        return;
    }
    NSURL *source_url = CFBridgingRelease(urlRef);
    keyValue = [keyValue stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
    if (![keyValue length]) {
        [self deleteCookiesForURL:source_url];
        return;
    }
    NSArray<NSString *> *keysvalues = [keyValue componentsSeparatedByString:@";"];
    NSMutableArray<NSHTTPCookie *>* cookies = [NSMutableArray arrayWithCapacity:[keysvalues count]];
    NSString *path = [source_url path];
    NSString *domain = [source_url host];
    if (nil == path || nil == domain) {
        return;
    }
    dispatch_async(dispatch_get_main_queue(), ^{
        for (NSString *allValues in keysvalues) {
            @autoreleasepool {
                NSArray<NSString *> *value = [allValues componentsSeparatedByString:@"="];
                if ([value count] < 2) {
                    continue;
                }
                static dispatch_once_t onceToken;
                static NSDateFormatter *dateFormatter = nil;
                dispatch_once(&onceToken, ^{
                    dateFormatter = [[NSDateFormatter alloc] init];
                    //Thu, 21-Jan-2023 00:00:00 GMT
                    dateFormatter.dateFormat = @"EEE, dd-MM-yyyy HH:mm:ss zzz";
                });
                NSMutableDictionary *cookiesData = [@{NSHTTPCookieName: value[0], NSHTTPCookiePath: path, NSHTTPCookieDomain: domain} mutableCopy];
                NSString *cookieValue = [value[1] stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
                //set cookie value for cookie object
                //if cookie value is empty, we assume this cookie should be deleted
                if ([cookieValue length]) {
                    [cookiesData setObject:cookieValue forKey:NSHTTPCookieValue];
                }
                else {
                    [cookiesData setObject:@"" forKey:NSHTTPCookieValue];
                    [cookiesData setObject:@(0) forKey:NSHTTPCookieMaximumAge];
                }
                //set cookie expire date
                if ([expireString length]) {
                    NSDate *expireDate = [dateFormatter dateFromString:expireString];
                    if (expireDate) {
                        [cookiesData setObject:expireDate forKey:NSHTTPCookieExpires];
                    }
                }
                NSHTTPCookie *cookie = [NSHTTPCookie cookieWithProperties:cookiesData];
                if (cookie) {
                    [cookies addObject:cookie];
                    //set WKCookie for system version abover iOS11
                    if (@available(iOS 11.0, *)) {
                        WKWebsiteDataStore *ds = [WKWebsiteDataStore defaultDataStore];
                        [ds.httpCookieStore setCookie:cookie completionHandler:NULL];
                    }
                }
            }
        }
        [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookies:cookies forURL:source_url mainDocumentURL:nil];
    });
}

- (void)deleteCookiesForURL:(NSURL *)url {
    NSString *path = [[url path] isEqualToString:@""]?@"/":[url path];
    NSString *domain = [url host];
    if (@available(iOS 11.0, *)) {
        dispatch_async(dispatch_get_main_queue(), ^{
            WKWebsiteDataStore *ds = [WKWebsiteDataStore defaultDataStore];
            [ds.httpCookieStore getAllCookies:^(NSArray<NSHTTPCookie *> * cookies) {
                for (NSHTTPCookie *cookie in cookies) {
                    if ([cookie.domain isEqualToString:domain] && [cookie.path isEqualToString:path]) {
                        [ds.httpCookieStore deleteCookie:cookie completionHandler:NULL];
                    }
                }
            }];
        });
    }
    NSArray<NSHTTPCookie *> *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookiesForURL:url];
    for (NSHTTPCookie *cookie in cookies) {
        [[NSHTTPCookieStorage sharedHTTPCookieStorage] deleteCookie:cookie];
    }
}

@end
