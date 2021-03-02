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

static char fetchInfoKey;

static void setFetchInfoForSessionTask(NSURLSessionTask *task, HippyFetchInfo *fetchInfo) {
    objc_setAssociatedObject(task, &fetchInfoKey, fetchInfo, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

HippyFetchInfo *fetchInfoForSessionTask(NSURLSessionTask *task) {
    HippyFetchInfo *info = objc_getAssociatedObject(task, &fetchInfoKey);
    return info;
}

@implementation HippyNetWork

HIPPY_EXPORT_MODULE(network)

//clang-format off
HIPPY_EXPORT_METHOD(fetch:(NSDictionary *)params resolver:(__unused HippyPromiseResolveBlock)resolve rejecter:(__unused HippyPromiseRejectBlock)reject) {
//clang-format on
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
    [request setHTTPMethod: method];
	
	NSMutableDictionary *httpHeader = [NSMutableDictionary new];
	[header enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, id  _Nonnull obj, __unused BOOL *stop) {
		NSString *value = nil;
		if ([obj isKindOfClass: [NSArray class]]) {
			value = [[(NSArray *)obj valueForKey:@"description"] componentsJoinedByString:@","];
		} else if ([obj isKindOfClass: [NSString class]]) {
			value = obj;
		}
		
		[httpHeader setValue: value forKey: key];
	}];
    if (httpHeader.count) {
		[request setAllHTTPHeaderFields: httpHeader];
	}
    NSDictionary<NSString *, NSString *> *extraHeaders = [self extraHeaders];
    [extraHeaders enumerateKeysAndObjectsUsingBlock:^(NSString * _Nonnull key, NSString * _Nonnull obj, BOOL * _Nonnull stop) {
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
    HippyFetchInfo *fetchInfo = [[HippyFetchInfo alloc] initWithResolveBlock:resolve rejectBlock:reject report302Status:report302Status];
    NSURLSessionConfiguration *sessionConfiguration = [NSURLSessionConfiguration defaultSessionConfiguration];
    sessionConfiguration.protocolClasses = [self protocolClasses];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:sessionConfiguration delegate:self delegateQueue:nil];
    NSURLSessionTask *task = [session dataTaskWithRequest:request];
    setFetchInfoForSessionTask(task, fetchInfo);
    [task resume];
}

- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task
willPerformHTTPRedirection:(NSHTTPURLResponse *)response
        newRequest:(NSURLRequest *)request
 completionHandler:(void (^)(NSURLRequest * _Nullable))completionHandler {
    HippyFetchInfo *fetchInfo = fetchInfoForSessionTask(task);
    if (fetchInfo.report302Status) {
        HippyPromiseResolveBlock resolver = fetchInfo.resolveBlock;
        if (resolver) {
            NSDictionary *result = @{
                                     @"statusCode": @(response.statusCode),
                                     @"statusLine": @"",
                                     @"respHeaders": response.allHeaderFields ? : @{},
                                     @"respBody": @""
                                     };
            
            resolver(result);
        }
        completionHandler(nil);
    }
    else {
        completionHandler(request);
    }
}

- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task
didCompleteWithError:(nullable NSError *)error {
    BOOL is302Response = ([task.response isKindOfClass:[NSHTTPURLResponse class]] && 302 == [(NSHTTPURLResponse *)task.response statusCode]);
    HippyFetchInfo *fetchInfo = fetchInfoForSessionTask(task);
    //如果是302并且禁止自动跳转，那说明已经将302结果发送给服务器，不需要再次发送
    if (is302Response && fetchInfo.report302Status) {
        return;
    }
    if (error) {
        HippyPromiseRejectBlock rejector = fetchInfo.rejectBlock;
        NSString *code = [NSString stringWithFormat:@"%ld", (long)error.code];
        rejector(code,error.description, error);
    }
    else {
        HippyPromiseResolveBlock resolver = fetchInfo.resolveBlock;
        NSData *data = fetchInfo.fetchData;
        NSString *dataStr = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        NSHTTPURLResponse *resp = (NSHTTPURLResponse *) task.response;
        NSDictionary *result = @{
                                 @"statusCode": @(resp.statusCode),
                                 @"statusLine": @"",
                                 @"respHeaders": resp.allHeaderFields ? : @{},
                                 @"respBody": dataStr ? : @""
                                 };
        
        resolver(result);
    }
}

- (void)URLSession:(NSURLSession *)session dataTask:(NSURLSessionDataTask *)dataTask
    didReceiveData:(NSData *)data {
    NSMutableData *fetchData = fetchInfoForSessionTask(dataTask).fetchData;
    [fetchData appendData:data];
}

- (NSArray<Class> *) protocolClasses {
    return [NSArray array];
}

- (NSDictionary<NSString *, NSString *> *)extraHeaders {
    return nil;
}

//clang-format off
HIPPY_EXPORT_METHOD(getCookie:(NSString *)urlString resolver:(HippyPromiseResolveBlock)resolve rejecter:(__unused HippyPromiseRejectBlock)reject) {
//clang-format on
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

//clang-format off
HIPPY_EXPORT_METHOD(setCookie:(NSString *)urlString keyValue:(NSString *)keyValue expireString:(NSString *)expireString) {
//clang-format on
    NSData *uriData = [urlString dataUsingEncoding:NSUTF8StringEncoding];
    if (nil == uriData) {
        return;
    }
    CFURLRef urlRef = CFURLCreateWithBytes(NULL, [uriData bytes], [uriData length], kCFStringEncodingUTF8, NULL);
    if (NULL == urlRef) {
        return;
    }
    NSURL *source_url = CFBridgingRelease(urlRef);
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
                NSDictionary *dictionary = @{NSHTTPCookieName: value[0], NSHTTPCookieValue: value[1], NSHTTPCookieExpires: expireString, NSHTTPCookiePath: path, NSHTTPCookieDomain: domain};
                NSHTTPCookie *cookie = [NSHTTPCookie cookieWithProperties:dictionary];
                if (cookie) {
                    [cookies addObject:cookie];
                    //给ios11以上的系统设置WKCookie
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

@end
