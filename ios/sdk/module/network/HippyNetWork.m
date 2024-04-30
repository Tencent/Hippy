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

#import "HippyNetWork.h"
#import "HippyAssert.h"
#import "HippyLog.h"
#import <WebKit/WKHTTPCookieStore.h>
#import <WebKit/WKWebsiteDataStore.h>
#import "HippyUtils.h"
#import "HippyFetchInfo.h"
#import "objc/runtime.h"
#import "HippyUtils.h"
#import "HippyWeakProxy.h"

static char fetchInfoKey;

static void setFetchInfoForSessionTask(NSURLSessionTask *task, HippyFetchInfo *fetchInfo) {
    objc_setAssociatedObject(task, &fetchInfoKey, fetchInfo, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

HippyFetchInfo *fetchInfoForSessionTask(NSURLSessionTask *task) {
    HippyFetchInfo *info = objc_getAssociatedObject(task, &fetchInfoKey);
    return info;
}

@implementation HippyNetWork
{
    NSURLSession *_session;
}

HIPPY_EXPORT_MODULE(network)

HIPPY_EXPORT_METHOD(fetch:(NSDictionary *)params
                    resolver:(HippyPromiseResolveBlock)resolve
                    rejecter:(HippyPromiseRejectBlock)reject) {
    NSString *method = params[@"method"];
    NSString *url = params[@"url"];
    NSDictionary *header = params[@"headers"];
    NSString *body = params[@"body"];
  
    HippyAssertParam(url);
    HippyAssertParam(method);
	
	if (![header isKindOfClass: [NSDictionary class]]) {
		header = @{};
	}
	
    NSURL *requestURL = HippyURLWithString(url, NULL);
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:requestURL];
    [request setHTTPMethod:method];
	
	NSMutableDictionary *httpHeader = [NSMutableDictionary new];
	[header enumerateKeysAndObjectsUsingBlock:^(id _Nonnull key, id _Nonnull obj, __unused BOOL *stop) {
		NSString *value = nil;
		if ([obj isKindOfClass: [NSArray class]]) {
			value = [[(NSArray *)obj valueForKey:@"description"] componentsJoinedByString:@","];
		} else if ([obj isKindOfClass: [NSString class]]) {
			value = obj;
		}
		
		[httpHeader setValue: value forKey: key];
	}];
    if (httpHeader.count) {
		[request setAllHTTPHeaderFields:httpHeader];
	}
    NSDictionary<NSString *, NSString *> *extraHeaders = [self extraHeaders];
    [extraHeaders enumerateKeysAndObjectsUsingBlock:^(NSString * _Nonnull key,
                                                      NSString * _Nonnull obj,
                                                      BOOL * _Nonnull stop) {
        [request addValue:obj forHTTPHeaderField:key];
    }];
    
    if (body.length) {
        NSData *postData = [body dataUsingEncoding: NSUTF8StringEncoding];
        if (postData) {
            [request setHTTPBody: postData];
        }
    }
    NSString *redirect = params[@"redirect"];
    BOOL report302Status = (nil == redirect || [redirect isEqualToString:@"manual"]);
    HippyFetchInfo *fetchInfo = [[HippyFetchInfo alloc] initWithResolveBlock:resolve
                                                                 rejectBlock:reject
                                                             report302Status:report302Status];
    
    // Lazy setup session
    if (!_session) {
        NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
        configuration.protocolClasses = [self protocolClasses];
        _session = [NSURLSession sessionWithConfiguration:configuration
                                                 delegate:(id)[HippyWeakProxy weakProxyForObject:self]
                                            delegateQueue:nil];
    }
    NSURLSessionTask *task = [_session dataTaskWithRequest:request];
    setFetchInfoForSessionTask(task, fetchInfo);
    [task resume];
}

- (void)URLSession:(NSURLSession *)session
                          task:(NSURLSessionTask *)task
    willPerformHTTPRedirection:(NSHTTPURLResponse *)response
                    newRequest:(NSURLRequest *)request
             completionHandler:(void (^)(NSURLRequest *_Nullable))completionHandler {
    HippyFetchInfo *fetchInfo = fetchInfoForSessionTask(task);
    if (fetchInfo.report302Status) {
        HippyPromiseResolveBlock resolver = fetchInfo.resolveBlock;
        if (resolver) {
            NSDictionary *result =
            @{
                @"statusCode": @(response.statusCode),
                @"statusLine": @"",
                @"respHeaders": response.allHeaderFields ?: @{},
                @"respBody": @""
            };
            resolver(result);
        }
        completionHandler(nil);
    } else {
        completionHandler(request);
    }
}

- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task didCompleteWithError:(nullable NSError *)error {
    BOOL is302Response = ([task.response isKindOfClass:[NSHTTPURLResponse class]] && 302 == [(NSHTTPURLResponse *)task.response statusCode]);
    HippyFetchInfo *fetchInfo = fetchInfoForSessionTask(task);
    if (is302Response && fetchInfo.report302Status) {
        setFetchInfoForSessionTask(task, nil);
        return;
    }
    if (error) {
        HippyPromiseRejectBlock rejector = fetchInfo.rejectBlock;
        NSString *code = [NSString stringWithFormat:@"%ld", (long)error.code];
        rejector(code, error.description, error);
    } else {
        HippyPromiseResolveBlock resolver = fetchInfo.resolveBlock;
        NSData *data = fetchInfo.fetchData;
        NSStringEncoding dataEncoding = HippyGetStringEncodingFromURLResponse(task.response);
        NSString *dataStr = [[NSString alloc] initWithData:data encoding:dataEncoding];
        NSHTTPURLResponse *resp = (NSHTTPURLResponse *)task.response;
        NSDictionary *result =
        @{
            @"statusCode": @(resp.statusCode),
            @"statusLine": @"",
            @"respHeaders": resp.allHeaderFields ?: @ {},
            @"respBody": dataStr ?: @""
        };
        resolver(result);
    }
    setFetchInfoForSessionTask(task, nil);
}

- (void)URLSession:(NSURLSession *)session
          dataTask:(NSURLSessionDataTask *)dataTask
    didReceiveData:(NSData *)data {
    NSMutableData *fetchData = fetchInfoForSessionTask(dataTask).fetchData;
    [fetchData appendData:data];
}

- (NSArray<Class> *)protocolClasses {
    return [NSArray array];
}

- (NSDictionary<NSString *, NSString *> *)extraHeaders {
    return nil;
}


#pragma mark - Cookie Related

HIPPY_EXPORT_METHOD(getCookie:(NSString *)urlString
                    resolver:(HippyPromiseResolveBlock)resolve
                    rejecter:(__unused HippyPromiseRejectBlock)reject) {
    NSData *uriData = [urlString dataUsingEncoding:NSUTF8StringEncoding];
    if (nil == uriData) {
        resolve(@"");
        return;
    }
    CFURLRef urlRef = CFURLCreateWithBytes(NULL, [uriData bytes], [uriData length], kCFStringEncodingUTF8, NULL);
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

HIPPY_EXPORT_METHOD(setCookie:(NSString *)urlString
                    keyValue:(NSString *)keyValue
                    expireString:(NSString *)expireString) {
    NSData *uriData = [urlString dataUsingEncoding:NSUTF8StringEncoding];
    if (nil == uriData) {
        return;
    }
    CFURLRef urlRef = CFURLCreateWithBytes(NULL, [uriData bytes], [uriData length], kCFStringEncodingUTF8, NULL);
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
