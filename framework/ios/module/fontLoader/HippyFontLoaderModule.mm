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
#import "HippyVFSDefines.h"
#import "HippyUIManager.h"


NSString *const HippyLoadFontNotification = @"HippyLoadFontNotification";
static NSString *const kFontLoaderModuleErrorDomain = @"kFontLoaderModuleErrorDomain";
static NSUInteger const FontLoaderErrorUrlError = 1;
static NSUInteger const FontLoaderErrorDirectoryError = 2;
static NSUInteger const FontLoaderErrorRequestError = 3;
static NSUInteger const FontLoaderErrorRegisterError = 4;
static NSUInteger const FontLoaderErrorWriteFileError = 4;
NSString *const HippyFontDirName = @"HippyFonts";
NSString *const HippyFontUrlCacheName = @"urlToFilePath.plist";
NSString *const HippyFontFamilyCacheName = @"fontFaimilyToFiles.plist";

static dispatch_queue_t serialQueue;
static NSMutableDictionary *urlToFilePath;
static NSMutableDictionary *fontFamilyToFiles;
static NSMutableDictionary *urlLoadState;
static NSMutableArray *fontRegistered = [NSMutableArray array];
static NSString *fontDirPath;
static NSString *fontUrlSavePath;
static NSString *fontFamilySavePath;


@implementation HippyFontLoaderModule

HIPPY_EXPORT_MODULE(FontLoaderModule)

@synthesize bridge = _bridge;

- (instancetype)init {
    if ((self = [super init])) {
        static dispatch_once_t onceToken;
        dispatch_once(&onceToken, ^{
            NSNotificationCenter *notificationCenter = [NSNotificationCenter defaultCenter];
            [notificationCenter addObserver:self selector:@selector(loadFont:) name:HippyLoadFontNotification object:nil];
            
            NSArray *paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
            NSString *cachesDirectory = [paths objectAtIndex:0];
            fontDirPath = [cachesDirectory stringByAppendingPathComponent:HippyFontDirName];
            fontUrlSavePath = [fontDirPath stringByAppendingPathComponent:HippyFontUrlCacheName];
            fontFamilySavePath = [fontDirPath stringByAppendingPathComponent:HippyFontFamilyCacheName];
            serialQueue = dispatch_queue_create("com.tencent.hippy.FontLoaderQueue", DISPATCH_QUEUE_SERIAL);
        });
    }
    return self;
}

+ (dispatch_queue_t) getFontSerialQueue {
    return serialQueue;
}

+ (void) setUrl:(NSString *)url state:(HippyFontUrlState)state {
    [urlLoadState setObject:@(state) forKey:url];
}

+ (BOOL) isUrlLoading:(NSString *)url {
    return [[urlLoadState objectForKey:url] integerValue] == HippyFontUrlLoading;
}

+ (void) initDictIfNeeded {
    if (fontFamilyToFiles == nil) {
        fontFamilyToFiles = [NSMutableDictionary dictionaryWithContentsOfFile:fontFamilySavePath];
        if (fontFamilyToFiles == nil) {
            fontFamilyToFiles =  [NSMutableDictionary dictionary];
        }
    }
    if (urlToFilePath == nil) {
        urlToFilePath = [NSMutableDictionary dictionaryWithContentsOfFile:fontUrlSavePath];
        if (urlToFilePath == nil) {
            urlToFilePath =  [NSMutableDictionary dictionary];
        }
    }
}

- (void)loadFont:(NSNotification *)notification {
    NSString *urlString = [notification.userInfo objectForKey:@"fontUrl"];
    NSString *fontFamily = [notification.userInfo objectForKey:@"fontFamily"];
    [self load:fontFamily from:urlString resolver:nil rejecter:nil];
}

+ (NSString *)getFontPath:(NSString *)url {
    [self initDictIfNeeded];
    NSString *fontFilePath = urlToFilePath[url];
    if (!fontFilePath) {
        return nil;
    }
    NSFileManager *fileManager = [NSFileManager defaultManager];
    if (![fileManager fileExistsAtPath:fontFilePath]) {
        return nil;
    }
    return fontFilePath;
}

+ (void)registerFontIfNeeded:(NSString *)fontFamily {
    [self initDictIfNeeded];
    NSMutableArray *fontFiles = [fontFamilyToFiles objectForKey:fontFamily];
    BOOL isFontRegistered = NO;
    if (fontFiles) {
        NSMutableArray *fileNotExist = [NSMutableArray array];
        for (NSString *fontFile in fontFiles) {
            if (![fontRegistered containsObject:fontFile]) {
                NSError *error = nil;
                if ([self registerFontFromURL:fontFile error:&error]) {
                    [fontRegistered addObject:fontFile];
                    isFontRegistered = YES;
                    HippyLogInfo(@"register font \"%@\" success!", fontFile);
                }
                else {
                    if (error.domain == kFontLoaderModuleErrorDomain && error.code == FontLoaderErrorRegisterError) {
                        [fileNotExist addObject:fontFile];
                    }
                    HippyLogWarn(@"register font \"%@\" fail!", fontFile);
                }
            }
        }
        [fontFiles removeObjectsInArray:fileNotExist];
        if (isFontRegistered) {
            [[NSNotificationCenter defaultCenter] postNotificationName:HippyFontChangeTriggerNotification object:nil];
        }
    }
}


+ (BOOL)registerFontFromURL:(NSString *)urlString error:(NSError **)error {
    NSURL *url = [NSURL fileURLWithPath:urlString];
    CGDataProviderRef fontDataProvider = CGDataProviderCreateWithURL((CFURLRef)url);
    CGFontRef font = CGFontCreateWithDataProvider(fontDataProvider);
    CGDataProviderRelease(fontDataProvider);
    if (!font) {
        *error = [NSError errorWithDomain:kFontLoaderModuleErrorDomain
                                    code:FontLoaderErrorRegisterError userInfo:@{@"reason": @"font dosen't exist"}];
        return NO;
    }
    CFErrorRef cfError;
    BOOL success = CTFontManagerRegisterGraphicsFont(font, &cfError);
    CFRelease(font);
    if (!success) {
        *error = CFBridgingRelease(cfError);
        return NO;
    }
    return YES;
}

- (void)saveFontfamily:(NSString *)fontFamily url:(NSString *)url filePath:(NSString *)filePath {
    [HippyFontLoaderModule initDictIfNeeded];
    [urlToFilePath setObject:filePath forKey:url];
    NSMutableArray *fontFiles = [fontFamilyToFiles objectForKey:fontFamily];
    if (!fontFiles) {
        fontFiles = [NSMutableArray arrayWithObject:filePath];
        [fontFamilyToFiles setObject:fontFiles forKey:fontFamily];
    }
    else {
        [fontFiles addObject:filePath];
    }
    [urlToFilePath writeToFile:fontUrlSavePath atomically:YES];
    [fontFamilyToFiles writeToFile:fontFamilySavePath atomically:YES];
}


HIPPY_EXPORT_METHOD(load:(NSString *)fontFamily from:(NSString *)urlString resolver:(HippyPromiseResolveBlock)resolve rejecter:(HippyPromiseRejectBlock)reject) {
    if (!urlString) {
        NSError *error = [NSError errorWithDomain:kFontLoaderModuleErrorDomain
                                             code:FontLoaderErrorUrlError userInfo:@{@"reason": @"url is empty"}];
        NSString *errorKey = [NSString stringWithFormat:@"%lu", FontLoaderErrorUrlError];
        if (reject) {
            reject(errorKey, @"url is empty", error);
        }
        return;
    }
    
    @synchronized (self) {
        if ([HippyFontLoaderModule isUrlLoading:urlString]) {
            resolve([NSString stringWithFormat:@"url \"%@\" is downloading!", urlString]);
            return;
        }
        [HippyFontLoaderModule setUrl:urlString state:HippyFontUrlLoading];
    }
    
    __weak __typeof(self) weakSelf = self;
    [self.bridge loadContentsAsynchronouslyFromUrl:urlString
                                            method:@"Get"
                                            params:nil
                                              body:nil
                                             queue:nil
                                          progress:nil
                                 completionHandler:^(NSData *data, NSDictionary *userInfo, NSURLResponse *response, NSError *error) {
        __strong __typeof(weakSelf) strongSelf = weakSelf;
        if (error) {
            if (reject) {
                NSString *errorKey = [NSString stringWithFormat:@"%lu", FontLoaderErrorRequestError];
                reject(errorKey, @"font request error", error);
            }
            [HippyFontLoaderModule setUrl:urlString state:HippyFontUrlFailed];
            return;
        }
        // is local file url
        if ([userInfo[HippyVFSResponseURLTypeKey] integerValue] == HippyVFSURLTypeFile) {
            NSString *fontFilePath = userInfo[HippyVFSResponseAbsoluteURLStringKey] ?: urlString;
            dispatch_async([HippyFontLoaderModule getFontSerialQueue], ^{
                [strongSelf saveFontfamily:fontFamily url:urlString filePath:fontFilePath];
                [HippyFontLoaderModule registerFontIfNeeded:fontFamily];
            });
            if (resolve) {
                resolve([NSString stringWithFormat:@"load local font file \"%@\" success!", fontFilePath]);
            }
            [HippyFontLoaderModule setUrl:urlString state:HippyFontUrlLoaded];
        }
        // is http url
        else {
            NSFileManager *fileManager = [NSFileManager defaultManager];
            if (![fileManager fileExistsAtPath:fontDirPath]) {
                NSError *error;
                [fileManager createDirectoryAtPath:fontDirPath withIntermediateDirectories:YES attributes:nil error:&error];
                if (error) {
                    NSString *errorKey = [NSString stringWithFormat:@"%lu", FontLoaderErrorDirectoryError];
                    if (reject) {
                        reject(errorKey, @"directory create error", error);
                    }
                    [HippyFontLoaderModule setUrl:urlString state:HippyFontUrlFailed];
                    return;
                }
            }
            NSString *fileName = [fontFamily stringByAppendingFormat:@".%@", [response.suggestedFilename pathExtension]];
            NSString *fontFilePath = [fontDirPath stringByAppendingPathComponent:fileName];
            if ([data writeToFile:fontFilePath atomically:YES]) {
                dispatch_async([HippyFontLoaderModule getFontSerialQueue], ^{
                    [strongSelf saveFontfamily:fontFamily url:urlString filePath:fontFilePath];
                    [HippyFontLoaderModule registerFontIfNeeded:fontFamily];
                });
                if (resolve) {
                    resolve([NSString stringWithFormat:@"download font file \"%@\" success!", fileName]);
                }
                [HippyFontLoaderModule setUrl:urlString state:HippyFontUrlLoaded];
            }
            else {
                if (reject) {
                    NSString *errorKey = [NSString stringWithFormat:@"%lu", FontLoaderErrorWriteFileError];
                    reject(errorKey, @"font request error", error);
                }
                [HippyFontLoaderModule setUrl:urlString state:HippyFontUrlFailed];
            }
        }
    }];
}

@end
