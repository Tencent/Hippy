//
//  HippyWebViewManager.m
//  Hippy
//
//  Created by 万致远 on 2019/3/30.
//  Copyright © 2019 Tencent. All rights reserved.
//

#import "HippySimpleWebViewManager.h"

@implementation HippySimpleWebViewManager
HIPPY_EXPORT_MODULE(WebView)

HIPPY_EXPORT_VIEW_PROPERTY(source, NSDictionary)
HIPPY_EXPORT_VIEW_PROPERTY(onLoadStart, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onLoadEnd, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onLoad, HippyDirectEventBlock)

- (UIView *)view {
    return [HippySimpleWebView new];
}

@end
