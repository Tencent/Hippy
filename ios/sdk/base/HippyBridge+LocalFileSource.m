//
//  HippyBridge+LocalFileSource.m
//  Hippy
//
//  Created by mengyanluo on 2018/9/25.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import "HippyBridge+LocalFileSource.h"
#import "objc/runtime.h"
static const void *HippyWorkerFolderKey = &HippyWorkerFolderKey;
NSErrorDomain const HippyLocalFileReadErrorDomain = @"HippyLocalFileReadErrorDomain";
NSInteger HippyLocalFileNOFilExist = 100;
@implementation HippyBridge (LocalFileSource)
- (void) setWorkFolder:(NSString *)workFolder {
    objc_setAssociatedObject(self, HippyWorkerFolderKey, workFolder, OBJC_ASSOCIATION_COPY_NONATOMIC);
}

- (NSString *) workFolder {
    NSString *string = objc_getAssociatedObject(self, HippyWorkerFolderKey);
    return string;
}

+ (NSString *) defaultHippyLocalFileScheme {
    //hpfile://
    static dispatch_once_t onceToken;
    static NSString *defaultScheme = nil;
    static NSString *pFile = @"pfile";
    dispatch_once(&onceToken, ^{
        defaultScheme = [[@"h" stringByAppendingString:pFile] stringByAppendingString:@"://"];
    });
    return defaultScheme;
}

+ (BOOL) isHippyLocalFileURLString:(NSString *)string {
    return [string hasPrefix:[HippyBridge defaultHippyLocalFileScheme]];
}

- (NSString *)absoluteStringFromHippyLocalFileURLString:(NSString *)string {
    if ([HippyBridge isHippyLocalFileURLString:string]) {
        NSString *filePrefix = [HippyBridge defaultHippyLocalFileScheme];
        NSString *relativeString = string;
        if ([string hasPrefix:filePrefix]) {
            NSRange range = NSMakeRange(0, [filePrefix length]);
            relativeString = [string stringByReplacingOccurrencesOfString:filePrefix withString:@"" options:0 range:range];
        }
        NSURL *workURL = [NSURL URLWithString:self.workFolder];
        NSURL *localFileURL = [NSURL URLWithString:relativeString relativeToURL:workURL];
        if ([localFileURL isFileURL]) {
            return [localFileURL path];
        }
    }
    return nil;
}
@end
