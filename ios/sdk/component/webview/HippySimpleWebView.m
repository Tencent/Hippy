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
#import "HippyAssert.h"
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
    if (source && [source[@"uri"] isKindOfClass:[NSString class]]) {
        NSString *urlString = source[@"uri"];
        [self loadUrl:urlString];
    }
}

- (void)loadUrl:(NSString *)urlString  {
    _url = urlString;
    NSURL *url = HippyURLWithString(urlString, NULL);
    if (!url) {
        HippyFatal(HippyErrorWithMessage(@"Error in [HippyWebview setUrl]: illegal url"));
        return;
    }
    NSURLRequest *request = [NSURLRequest requestWithURL:url];
    [self loadRequest:request];
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
        NSString *errString = [error localizedFailureReason];
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
        NSString *errString = [error localizedFailureReason];
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

- (WKWebView *)webView:(WKWebView *)webView createWebViewWithConfiguration:(WKWebViewConfiguration *)configuration forNavigationAction:(WKNavigationAction *)navigationAction windowFeatures:(WKWindowFeatures *)windowFeatures {
    [webView loadRequest:navigationAction.request];
    return nil;
}

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

@end
