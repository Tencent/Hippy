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

#import "HippyFontFaceTextController.h"
#import "HippyUtils.h"
#import <CoreText/CoreText.h>

NSString *HippyTextFontFaceErrorDomain = @"HippyTextFontFaceErrorDomain";

NSString *HippyTextFontFaceURLKey = @"HippyTextFontFaceURLKey";

@interface HippyFontFaceTextController () {
    NSMutableDictionary *_dicFontData;
}

@end

@implementation HippyFontFaceTextController

HIPPY_EXPORT_MODULE(FontFaceController)

static NSError *hippyTextFontFace(HippyTextFontFaceErrorCode code, NSURL *url) {
    if (url) {
        return [NSError errorWithDomain:HippyTextFontFaceErrorDomain code:code userInfo:@{HippyTextFontFaceURLKey: url}];
    }
    return nil;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _dicFontData = [NSMutableDictionary dictionary];
    }
    return self;
}

- (void)fontName:(NSString *)name fontSize:(CGFloat)fontSize URL:(NSURL *)url completion:(void (^)(UIFont *font, NSError *error))completionBlock {
    if (name) {
        UIFont *font = [UIFont fontWithName:name size:fontSize];
        if (font) {
            completionBlock(font, nil);
            return;
        }
        else {
            NSString *fontName = [_dicFontData objectForKey:name];
            if (fontName) {
                font = [UIFont fontWithName:fontName size:fontSize];
                if (font) {
                    completionBlock(font, nil);
                    return;
                }
            }
        }
    }
    if (nil == url) {
        completionBlock(nil, hippyTextFontFace(HippyTextFontFaceErrorURLUnavailable, url));
        return;
    }
        
    CGDataProviderRef dataProviderRef = CGDataProviderCreateWithURL(CFBridgingRetain(url));
    if (!dataProviderRef) {
        completionBlock(nil, hippyTextFontFace(HippyTextFontFaceErrorURLUnavailable, url));
        return;
    }
    CGFontRef fontRef = CGFontCreateWithDataProvider(dataProviderRef);
    if (!fontRef) {
        CGDataProviderRelease(dataProviderRef);
        completionBlock(nil, hippyTextFontFace(HippyTextFontFaceErrorDataUnavailable, url));
        return;
    }
    CFErrorRef errorRef = NULL;
    if (CTFontManagerRegisterGraphicsFont(fontRef, &errorRef)) {
        NSString *postScriptName = CFBridgingRelease(CGFontCopyPostScriptName(fontRef));
        if (postScriptName) {
            [_dicFontData setObject:postScriptName forKey:name];
        }
        UIFont *font = [UIFont fontWithName:postScriptName size:fontSize];
        if (font) {
            completionBlock(font, nil);
        }
        else {
            completionBlock(nil, hippyTextFontFace(HippyTextFontFaceErrorFontAcquireFailure, url));
        }
    }
    else if (errorRef) {
        CFRelease(errorRef);
        completionBlock(nil, hippyTextFontFace(HippyTextFontFaceErrorRegisterFailure, url));
    }
    CGFontRelease(fontRef);
    CGDataProviderRelease(dataProviderRef);
}

- (NSString *)downloadPathForFontURL:(NSURL *)URL {
    if (!URL) {
        return nil;
    }
    NSString *path = [NSTemporaryDirectory() stringByAppendingPathComponent:@"hippyDataFolder"];
    BOOL isDir = NO;
    BOOL folderReady = [[NSFileManager defaultManager] fileExistsAtPath:path isDirectory:&isDir] && isDir;
    if (!folderReady) {
        folderReady = [[NSFileManager defaultManager] createDirectoryAtPath:path withIntermediateDirectories:YES attributes:nil error:nil];
    }
    if (!folderReady) {
        return nil;
    }
    NSString *fileName = [[URL absoluteString] lastPathComponent];
    NSString *filePath = [path stringByAppendingPathComponent:fileName];
    return filePath;
}

@end
