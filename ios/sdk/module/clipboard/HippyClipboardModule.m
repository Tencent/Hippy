//
//  HippyClipboard.m
//  hippy
//
//  Created by 万致远 on 2019/5/30.
//  Copyright © 2019 Tencent. All rights reserved.
//

#import "HippyClipboardModule.h"

@implementation HippyClipboardModule
HIPPY_EXPORT_MODULE(ClipboardModule)

HIPPY_EXPORT_METHOD(getString:(HippyPromiseResolveBlock)resolve
                  reject:(__unused HippyPromiseRejectBlock)reject) {
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    NSString *paste = pasteboard.string == nil ? @"" : pasteboard.string;
    resolve(paste);
}

HIPPY_EXPORT_METHOD(setString:(NSString *)paste) {
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    pasteboard.string = paste;
}


@end
