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


static NSString *const HippyLoadFontNotification = @"HippyLoadFontNotification";
static NSString *const HippyLoadFontUrlKey = @"fontUrl";
static NSString *const HippyLoadFontFamilyKey = @"fontFamily";
static NSString *const kFontLoaderModuleErrorDomain = @"kFontLoaderModuleErrorDomain";
static NSUInteger const FontLoaderErrorUrlError = 1;
static NSUInteger const FontLoaderErrorDirectoryError = 2;
static NSUInteger const FontLoaderErrorRequestError = 3;
static NSUInteger const FontLoaderErrorRegisterError = 4;
static NSUInteger const FontLoaderErrorWriteFileError = 4;
static NSString *const HippyFontDirName = @"HippyFonts";
static NSString *const HippyFontUrlCacheName = @"urlToFilePath.plist";
static NSString *const HippyFontFamilyCacheName = @"fontFaimilyToFiles.plist";

static dispatch_queue_t gSerialQueue;
static NSMutableDictionary *gUrlToFilePath;
static NSMutableDictionary *gFontFamilyToFiles;
static NSMutableDictionary *gUrlLoadState;
static NSMutableArray *gFontRegistered;
static NSString *gFontDirPath;
static NSString *gFontUrlSavePath;
static NSString *gFontFamilySavePath;


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
            gFontDirPath = [cachesDirectory stringByAppendingPathComponent:HippyFontDirName];
            gFontUrlSavePath = [gFontDirPath stringByAppendingPathComponent:HippyFontUrlCacheName];
            gFontFamilySavePath = [gFontDirPath stringByAppendingPathComponent:HippyFontFamilyCacheName];
            gSerialQueue = dispatch_queue_create("com.tencent.hippy.FontLoaderQueue", DISPATCH_QUEUE_SERIAL);
        });
    }
    return self;
}

+ (dispatch_queue_t)getFontSerialQueue {
    return gSerialQueue;
}

+ (void)setUrl:(NSString *)url state:(HippyFontUrlState)state {
    if (!gUrlLoadState) {
        gUrlLoadState = [NSMutableDictionary dictionary];
    }
    [gUrlLoadState setObject:@(state) forKey:url];
}

+ (BOOL)isUrlLoading:(NSString *)url {
    if (!gUrlLoadState) {
        gUrlLoadState = [NSMutableDictionary dictionary];
    }
    return [[gUrlLoadState objectForKey:url] integerValue] == HippyFontUrlLoading;
}

// Read file to init dict if needed. This function will be called asynchronously.
+ (void)initDictIfNeeded {
    if (gFontFamilyToFiles == nil) {
        gFontFamilyToFiles = [NSMutableDictionary dictionaryWithContentsOfFile:gFontFamilySavePath];
        if (gFontFamilyToFiles == nil) {
            gFontFamilyToFiles = [NSMutableDictionary dictionary];
        }
    }
    if (gUrlToFilePath == nil) {
        gUrlToFilePath = [NSMutableDictionary dictionaryWithContentsOfFile:gFontUrlSavePath];
        if (gUrlToFilePath == nil) {
            gUrlToFilePath =  [NSMutableDictionary dictionary];
        }
    }
}

+ (void)loadFontIfNeeded:(NSString *)fontFamily fromUrl:(NSString *)url {
    if (url && ![HippyFontLoaderModule isUrlLoading:url]) {
        dispatch_async([HippyFontLoaderModule getFontSerialQueue], ^{
            NSString *fontPath = [HippyFontLoaderModule getFontPath:url];
            if (!fontPath && fontFamily) {
                NSDictionary *userInfo = @{HippyLoadFontUrlKey: url, HippyLoadFontFamilyKey: fontFamily};
                [[NSNotificationCenter defaultCenter] postNotificationName:HippyLoadFontNotification object:nil userInfo:userInfo];
            }
        });
    }
}

- (void)loadFont:(NSNotification *)notification {
    NSString *urlString = [notification.userInfo objectForKey:HippyLoadFontUrlKey];
    NSString *fontFamily = [notification.userInfo objectForKey:HippyLoadFontFamilyKey];
    [self load:fontFamily from:urlString resolver:nil rejecter:nil];
}

+ (NSString *)getFontPath:(NSString *)url {
    [self initDictIfNeeded];
    NSString *fontFilePath = gUrlToFilePath[url];
    if (!fontFilePath) {
        return nil;
    }
    NSFileManager *fileManager = [NSFileManager defaultManager];
    if (![fileManager fileExistsAtPath:fontFilePath]) {
        return nil;
    }
    return fontFilePath;
}

+ (BOOL)registerFontIfNeeded:(NSString *)fontFamily {
    [self initDictIfNeeded];
    NSMutableArray *fontFiles = [gFontFamilyToFiles objectForKey:fontFamily];
    if (!gFontRegistered) {
        gFontRegistered = [NSMutableArray array];
    }
    BOOL isFontRegistered = NO;
    if (fontFiles) {
        NSMutableArray *fileNotExist = [NSMutableArray array];
        for (NSString *fontFile in fontFiles) {
            if (![gFontRegistered containsObject:fontFile]) {
                NSError *error = nil;
                if ([self registerFontFromURL:fontFile error:&error]) {
                    [gFontRegistered addObject:fontFile];
                    isFontRegistered = YES;
                    HippyLogInfo(@"register font \"%@\" success!", fontFile);
                } else {
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
    return isFontRegistered;
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
    [gUrlToFilePath setObject:filePath forKey:url];
    NSMutableArray *fontFiles = [gFontFamilyToFiles objectForKey:fontFamily];
    if (!fontFiles) {
        fontFiles = [NSMutableArray arrayWithObject:filePath];
        [gFontFamilyToFiles setObject:fontFiles forKey:fontFamily];
    } else {
        [fontFiles addObject:filePath];
    }
    [gUrlToFilePath writeToFile:gFontUrlSavePath atomically:YES];
    [gFontFamilyToFiles writeToFile:gFontFamilySavePath atomically:YES];
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
    [self.bridge loadContentsAsyncFromUrl:urlString
                                   params:nil
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
            @synchronized (strongSelf) {
                [HippyFontLoaderModule setUrl:urlString state:HippyFontUrlLoaded];
            }
        } else {  // is http url
            NSFileManager *fileManager = [NSFileManager defaultManager];
            if (![fileManager fileExistsAtPath:gFontDirPath]) {
                NSError *error;
                [fileManager createDirectoryAtPath:gFontDirPath withIntermediateDirectories:YES attributes:nil error:&error];
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
            NSString *fontFilePath = [gFontDirPath stringByAppendingPathComponent:fileName];
            if ([data writeToFile:fontFilePath atomically:YES]) {
                dispatch_async([HippyFontLoaderModule getFontSerialQueue], ^{
                    [strongSelf saveFontfamily:fontFamily url:urlString filePath:fontFilePath];
                    [HippyFontLoaderModule registerFontIfNeeded:fontFamily];
                });
                if (resolve) {
                    resolve([NSString stringWithFormat:@"download font file \"%@\" success!", fileName]);
                }
                [HippyFontLoaderModule setUrl:urlString state:HippyFontUrlLoaded];
            } else {
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
