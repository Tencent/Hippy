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

#import "HippySimpleWebView.h"
#import "HippyUtils.h"

@implementation HippySimpleWebView

- (instancetype)init {
    self = [super init];
    if (self) {
        self.UIDelegate = self;
        self.navigationDelegate = self;
    }
    return self;
}

- (void)setSource:(NSDictionary *)source {
    _source = source;
    if(source == nil){
        return;
    }
    
    if ([source[@"uri"] isKindOfClass:[NSString class]]) {
        // load uri
        NSString *uri = source[@"uri"];
        NSString *method = source[@"method"];
        NSDictionary* headers = source[@"headers"];
        NSString* body = source[@"body"];
        
        // Wait for other properties to be updated
        dispatch_async(dispatch_get_main_queue(), ^{
          //[self loadUrl:urlString withMethod:method];
            [self loadURI:uri method:method headers:headers body:body];
        });
    }else if([source[@"html"] isKindOfClass:[NSString class]]){
        // load html
        NSString* html = source[@"html"];
        NSString* baseUrl = source[@"baseUrl"];
        
        dispatch_async(dispatch_get_main_queue(), ^{
            [self loadHtml:html baseUrl:baseUrl];
        });
    }
}

- (void)loadURI:(NSString*)uri method:(NSString*)method headers:(NSDictionary*)headers body:(NSString*)body{
    _url = uri;
    NSURL *url = HippyURLWithString(uri, NULL);
    if (!url) {
        return;
    }

    NSMutableURLRequest* request = [NSMutableURLRequest requestWithURL:url];
    
    // set request method
    method = [method uppercaseString];
    if([method isEqualToString:@"GET"]){
        request.HTTPMethod = @"GET";
    }else if ([method isEqualToString:@"POST"]){
        request.HTTPMethod = @"POST";
        if(body){
            [request setHTTPBody:[body dataUsingEncoding:kCFStringEncodingUTF8]];
        }
    }else{
      // System default is 'GET' no need to be specified explicitly
    }
    
    // set request headers
    // FIXME: temporary disabled because we don't have the support in our android counterpart
    //  if(headers){
    //      [request setAllHTTPHeaderFields:headers];
    //  }

    // set user agent
    NSString* ua = self.userAgent;
    if(ua){
      self.customUserAgent = ua;
    }
    
    [self loadRequest:request];
}

- (void)loadHtml:(NSString*)html baseUrl:(NSString*)baseUrl{
    _url = baseUrl;
    NSURL *url = HippyURLWithString(baseUrl, NULL);
    if (url) {
        if(self.userAgent){
          self.customUserAgent = self.userAgent;
        }
        [self loadHTMLString:html baseURL:url];
    }
}

- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(WKNavigation *)navigation {
    if (_onLoadStart) {
        NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithCapacity:1];
        NSString *url = [[webView URL] absoluteString];
        if (url) {
            [dic setObject:url forKey:@"url"];
        }
        _onLoadStart(dic);
    }
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithCapacity:2];
    NSString *url = [[webView URL] absoluteString];
    if (url) {
        [dic setObject:url forKey:@"url"];
    }
    if (_onLoad) {
        _onLoad(dic);
    }
    if (_onLoadEnd) {
        [dic setObject:@(YES) forKey:@"success"];
        _onLoadEnd(dic);
    }
}

- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    if (_onLoadEnd) {
        NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithCapacity:3];
        NSString *url = [[webView URL] absoluteString];
        NSString *errString = [error localizedDescription];
        if (url) {
            [dic setObject:url forKey:@"url"];
        }
        if (errString) {
            [dic setObject:errString forKey:@"error"];
        }
        [dic setObject:@(NO) forKey:@"success"];
        _onLoadEnd(dic);
    }
}

- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error {
    if (_onLoadEnd) {
        NSMutableDictionary *dic = [NSMutableDictionary dictionaryWithCapacity:3];
        NSString *url = [[webView URL] absoluteString];
        NSString *errString = [error localizedDescription];
        if (url) {
            [dic setObject:url forKey:@"url"];
        }
        if (errString) {
            [dic setObject:errString forKey:@"error"];
        }
        [dic setObject:@(NO) forKey:@"success"];
        _onLoadEnd(dic);
    }
}

- (WKWebView *)webView:(WKWebView *)webView
    createWebViewWithConfiguration:(WKWebViewConfiguration *)configuration
               forNavigationAction:(WKNavigationAction *)navigationAction
                    windowFeatures:(WKWindowFeatures *)windowFeatures {
    [webView loadRequest:navigationAction.request];
    return nil;
}

@end
