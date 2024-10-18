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

#import <UIKit/UIKit.h>
#import "HippyFontLoaderModule.h"
#import <CoreText/CoreText.h>
#import "HippyBridge+Private.h"
#import "HippyBridge+VFSLoader.h"
#import "HippyLog.h"
#import "VFSUriLoader.h"
#import "HippyUIManager.h"


static NSString *const kFontLoaderModuleErrorDomain = @"kFontLoaderModuleErrorDomain";
static NSUInteger const FontLoaderErrorUrlError = 1;
static NSUInteger const FontLoaderErrorDirectoryError = 2;
static NSUInteger const FontLoaderErrorRequestError = 3;
static NSUInteger const FontLoaderErrorRegisterError = 4;

@interface HippyFontLoaderModule () {
}

@end

@implementation HippyFontLoaderModule

HIPPY_EXPORT_MODULE(FontLoaderModule)

@synthesize bridge = _bridge;

- (instancetype)init {
    if ((self = [super init])) {
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
        NSString *cachesDirectory = [paths objectAtIndex:0];
        _fontDir = [cachesDirectory stringByAppendingPathComponent:@"font"];
        _fontUrlCachePath = [_fontDir stringByAppendingPathComponent:@"fontUrlCache.plist"];
        
        static dispatch_once_t onceToken;
        dispatch_once(&onceToken, ^{
            NSNotificationCenter *notificationCenter = [NSNotificationCenter defaultCenter];
            [notificationCenter addObserver:self selector:@selector(loadAndRegisterFont:) name:HippyLoadFontNotification object:nil];
        });
    }
    return self;
}

- (void)loadAndRegisterFont:(NSNotification *)notification {
    NSLog(@"handle notification");
    NSString *urlString = [notification.userInfo objectForKey:@"fontUrl"];
    NSString *fontFamily = [notification.userInfo objectForKey:@"fontFamily"];
    [self load:fontFamily from:urlString resolver:^(id result) {} rejecter:^(NSString *code, NSString *message, NSError *error) {}];
}

- (NSString *)getFontPath:(NSString *)url{
    NSMutableDictionary *fontUrlDict = [NSMutableDictionary dictionaryWithContentsOfFile:self.fontUrlCachePath];
    if (fontUrlDict == nil) {
        fontUrlDict =  [NSMutableDictionary dictionary];
    }
    NSString *fontFile = fontUrlDict[url];
    if (!fontFile) {
        return nil;
    }
    NSString *fontPath = [self.fontDir stringByAppendingPathComponent:fontFile];
    NSFileManager *fileManager = [NSFileManager defaultManager];
    if (![fileManager fileExistsAtPath:fontPath]) {
        return nil;
    }
    return fontPath;
}

- (BOOL)isFontRegistered:(NSString *)fontName {
    NSArray *fontFamilyNames = [UIFont familyNames];
    for (NSString *familyName in fontFamilyNames) {
        NSArray *fontNames = [UIFont fontNamesForFamilyName:familyName];
        if ([fontNames containsObject:fontName]) {
            return YES;
        }
    }
    return NO;
}

- (BOOL)registerFontFromURL:(NSString *)urlString error:(NSError *)error {
    NSURL *url = [NSURL fileURLWithPath:urlString];
    CGDataProviderRef fontDataProvider = CGDataProviderCreateWithURL((CFURLRef)url);
    CGFontRef font = CGFontCreateWithDataProvider(fontDataProvider);
    CGDataProviderRelease(fontDataProvider);
    if (!font) {
        error = [NSError errorWithDomain:kFontLoaderModuleErrorDomain
                                    code:FontLoaderErrorRegisterError userInfo:@{@"reason": @"font dosen't exist"}];
        return NO;
    }
    CFStringRef fontNameRef = CGFontCopyPostScriptName(font);
    NSString *fontName = (__bridge_transfer NSString *)fontNameRef;
    if ([self isFontRegistered:fontName]) {
        NSLog(@"already registered");
        return YES;
    }
    CFErrorRef cfError;
    BOOL success = CTFontManagerRegisterGraphicsFont(font, &cfError);
    CFRelease(font);
    if (!success) {
        error = CFBridgingRelease(cfError);
        return NO;
    }
    NSLog(@"registering font success");
    return YES;
}

- (BOOL)cacheFont:(NSString *)fontFileName url:(NSString *)url {
    NSMutableDictionary *fontUrlDict = [NSMutableDictionary dictionaryWithContentsOfFile:self.fontUrlCachePath];
    if (fontUrlDict == nil) {
        fontUrlDict =  [NSMutableDictionary dictionary];
    }
    [fontUrlDict setObject:fontFileName forKey:url];
    return [fontUrlDict writeToFile:self.fontUrlCachePath atomically:YES];
}


HIPPY_EXPORT_METHOD(load:(NSString *)fontFamily from:(NSString *)urlString resolver:(HippyPromiseResolveBlock)resolve rejecter:(HippyPromiseRejectBlock)reject) {
    if (!urlString) {
        NSError *error = [NSError errorWithDomain:kFontLoaderModuleErrorDomain
                                             code:FontLoaderErrorUrlError userInfo:@{@"reason": @"url is empty"}];
        NSString *errorKey = [NSString stringWithFormat:@"%lu", FontLoaderErrorUrlError];
        reject(errorKey, @"url is empty", error);
        return;
    }
    NSFileManager *fileManager = [NSFileManager defaultManager];
    
    // Create font directory if not exist
    if (![fileManager fileExistsAtPath:self.fontDir]) {
        NSError *error;
        [fileManager createDirectoryAtPath:self.fontDir withIntermediateDirectories:YES attributes:nil error:&error];
        if (error) {
            NSString *errorKey = [NSString stringWithFormat:@"%lu", FontLoaderErrorDirectoryError];
            reject(errorKey, @"directory create error", error);
            return;
        }
    }
    NSLog(@"urlString: %@", urlString);
    
    [self.bridge loadContentsAsynchronouslyFromUrl:urlString
                                            method:@"Get"
                                            params:nil
                                              body:nil
                                             queue:nil
                                          progress:nil
                                 completionHandler:^(NSData *data, NSDictionary *userInfo, NSURLResponse *response, NSError *error) {
        NSLog(@"complete:");
        if (error) {
            NSString *errorKey = [NSString stringWithFormat:@"%lu", FontLoaderErrorRequestError];
            NSLog(@"font request error:%@", error.description);
            reject(errorKey, @"font request error", error);
            return;
        }
        NSString *fileName = [fontFamily stringByAppendingFormat:@".%@", [response.suggestedFilename pathExtension]];
        NSString *fontFilePath = [self.fontDir stringByAppendingPathComponent:fileName];
        NSLog(@"fontFilePath: %@", fontFilePath);
        [data writeToFile:fontFilePath atomically:YES];
        [self cacheFont:fileName url:urlString];
        
        if ([self registerFontFromURL:fontFilePath error:error]) {
            [[NSNotificationCenter defaultCenter] postNotificationName:HippyFontChangeTriggerNotification object:nil];
            resolve(nil);
        } else {
            NSString *errorKey = [NSString stringWithFormat:@"%lu", FontLoaderErrorRegisterError];
            reject(errorKey, @"register false", error);
        }
    }];
    NSLog(@"out:");
}

@end
