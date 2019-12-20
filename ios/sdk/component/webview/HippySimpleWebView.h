//
//  HippyWebView.h
//  Hippy
//
//  Created by 万致远 on 2019/3/30.
//  Copyright © 2019 Tencent. All rights reserved.
//


#import <WebKit/WebKit.h>
#import "HippyComponent.h"

NS_ASSUME_NONNULL_BEGIN

@interface HippySimpleWebView : WKWebView<WKUIDelegate, WKNavigationDelegate>
@property (nonatomic, strong) NSString *url;
@property (nonatomic, strong) NSDictionary *source;
@property (nonatomic, copy) HippyDirectEventBlock onLoadStart;
@property (nonatomic, copy) HippyDirectEventBlock onLoadEnd;
@property (nonatomic, copy) HippyDirectEventBlock onLoad;

@end

NS_ASSUME_NONNULL_END
