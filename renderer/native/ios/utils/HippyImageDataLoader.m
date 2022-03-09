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

#import "HippyImageDataLoader.h"
#import "HippyUtils.h"
#import "HippyImageCacheManager.h"
#import "HippyDownloadTask.h"

NSString *const HippyImageDataLoaderErrorDomain = @"HippyImageDataLoaderErrorDomain";

const NSUInteger HippyImageDataLoaderErrorFileNotExists = 1000;
const NSUInteger HippyImageDataLoaderErrorNoPathIncoming = 1001;
const NSUInteger HippyImageDataLoaderErrorPathToUrl = 1002;

typedef NS_ENUM(NSUInteger, ImagePathType) {
    ImagePathTypeUnknown,
    ImagePathTypeHTTPPath,
    ImagePathTypeFilePath,
    ImagePathTypeBase64Path,
};

typedef void(^DownloadProgress)(NSUInteger, NSUInteger);
typedef void(^CompletionBlock)(NSUInteger, id, NSURL *, NSError *);

static ImagePathType checkPathTypeFromUrl(NSURL *Url) {
    ImagePathType type = ImagePathTypeUnknown;
    if ([Url isFileURL]) {
        type = ImagePathTypeFilePath;
    }
    else {
        NSString *path = [Url absoluteString];
        if ([path hasPrefix:@"http"]) {
            type = ImagePathTypeHTTPPath;
        }
        else if ([path containsString:@"data:image/"] && [path containsString:@";base64,"]) {
            type = ImagePathTypeBase64Path;
        }
    }
    return type;
}

@interface HippyImageDataLoader ()<NSURLSessionDataDelegate> {
    ImagePathType _imagePathType;
    NSMutableDictionary<NSNumber *, HippyDownloadTask *> *_downloadTasks;
}

@end

@implementation HippyImageDataLoader

- (instancetype)init {
    self = [super init];
    if (self) {
        _downloadTasks = [NSMutableDictionary dictionaryWithCapacity:16];
    }
    return self;
}

- (void)dealloc {
    [_downloadTasks removeAllObjects];
}

#pragma mark HippyImageDataLoaderProtocol Implementation

- (BOOL)canHandleImageAtUrl:(NSURL *)Url {
    ImagePathType type = checkPathTypeFromUrl(Url);
    return ImagePathTypeUnknown != type;
}

- (void)loadImageAtUrl:(NSURL *)Url sequence:(NSUInteger)sequence progress:(DownloadProgress)progress
         completion:(CompletionBlock)dataCompletion {
    ImagePathType type = checkPathTypeFromUrl(Url);
    switch (type) {
        case ImagePathTypeHTTPPath:
            [self loadImageAtHTTPUrl:Url sequence:sequence progress:progress dataCompletion:dataCompletion];
            break;
        case ImagePathTypeFilePath:
            [self loadImageAtFileUrl:Url sequence:sequence progress:progress dataCompletion:dataCompletion];
            break;
        case ImagePathTypeBase64Path:
            [self loadImageAtBase64Url:Url sequence:sequence progress:progress dataCompletion:dataCompletion];
            break;
        default:
            break;
    }
}

- (void)cancelImageDownloadAtUrl:(NSURL *)Url {
    NSNumber *hash = @([Url hash]);
    HippyDownloadTask *task = [_downloadTasks objectForKey:hash];
    [task cancel];
}

#pragma mark Image Data Loader

- (void)loadImageAtHTTPUrl:(NSURL *)Url sequence:(NSUInteger)sequence progress:(DownloadProgress)progress dataCompletion:(CompletionBlock)dataCompletion {
    NSNumber *hash = @(sequence);
    HippyDownloadTask *task = [_downloadTasks objectForKey:hash];
    if (task) {
        [task cancel];
        [_downloadTasks removeObjectForKey:hash];
    }
    __weak __typeof(self) weakSelf = self;
    task = [[HippyDownloadTask alloc] initWithURL:Url progress:progress completion:^(NSData *data, NSURL *url, NSError *error) {
        if (weakSelf) {
            dataCompletion(sequence, data, url, error);
            __typeof(self) strongSelf = weakSelf;
            [strongSelf->_downloadTasks removeObjectForKey:hash];
        }
    }];
    [task beginTask];
    [_downloadTasks setObject:task forKey:hash];
}

- (void)loadImageAtFileUrl:(NSURL *)Url sequence:(NSUInteger)sequence progress:(DownloadProgress)progress dataCompletion:(CompletionBlock)dataCompletion {
    if (Url) {
        NSString *path = [Url path];
        BOOL isDirectory = NO;
        BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:path isDirectory:&isDirectory];
        if (fileExists) {
            NSError *error = nil;
            NSData *data = [NSData dataWithContentsOfFile:path options:NSDataReadingMappedIfSafe error:&error];
            if (error) {
                dataCompletion(sequence, nil, Url, error);
            }
            else {
                NSUInteger length = [data length];
                if (progress) {
                    progress(length, length);
                }
                if (dataCompletion) {
                    dataCompletion(sequence, data, Url, nil);
                }
            }
        }else {
            if (dataCompletion) {
                NSError *error = [NSError errorWithDomain:HippyImageDataLoaderErrorDomain code:HippyImageDataLoaderErrorFileNotExists userInfo:@{@"path": path}];
                dataCompletion(sequence, nil, Url, error);
            }
        }
    }else {
        if (dataCompletion) {
            NSError *error = [NSError errorWithDomain:HippyImageDataLoaderErrorDomain code:HippyImageDataLoaderErrorNoPathIncoming userInfo:nil];
            dataCompletion(sequence, nil, Url, error);
        }
    }
}

- (void)loadImageAtBase64Url:(NSURL *)Url sequence:(NSUInteger)sequence progress:(DownloadProgress)progress dataCompletion:(CompletionBlock)dataCompletion {
    if (Url) {
        if (Url) {
            NSError *error = nil;
            NSData *data = [NSData dataWithContentsOfURL:Url options:NSDataReadingMappedIfSafe error:&error];
            if (error) {
                dataCompletion(sequence, nil, Url, error);
            }else {
                NSUInteger length = [data length];
                if (progress) {
                    progress(length, length);
                }
                if (dataCompletion) {
                    dataCompletion(sequence, data, Url, nil);
                }
            }
        }else {
            if (dataCompletion) {
                NSError *error = [NSError errorWithDomain:HippyImageDataLoaderErrorDomain code:HippyImageDataLoaderErrorNoPathIncoming userInfo:nil];
                dataCompletion(sequence, nil, Url, error);
            }
        }
    }else {
        if (dataCompletion) {
            NSError *error = [NSError errorWithDomain:HippyImageDataLoaderErrorDomain code:HippyImageDataLoaderErrorNoPathIncoming userInfo:nil];
            dataCompletion(sequence, nil, Url, error);
        }
    }
}

@end
