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

#import "HippyBridge+LocalFileSource.h"
#import "objc/runtime.h"

NSErrorDomain const HippyLocalFileReadErrorDomain = @"HippyLocalFileReadErrorDomain";
NSInteger HippyLocalFileNOFilExist = 100;

@implementation HippyBridge (LocalFileSource)

- (void)setSandboxDirectory:(NSString *)sandboxDirectory {
    if (![sandboxDirectory hasSuffix:@"/"]) {
        sandboxDirectory = [NSString stringWithFormat:@"%@/", sandboxDirectory];
    }
    objc_setAssociatedObject(self, @selector(sandboxDirectory), sandboxDirectory, OBJC_ASSOCIATION_COPY_NONATOMIC);
}

- (NSString *)sandboxDirectory {
    NSString *sandboxDirectory = objc_getAssociatedObject(self, _cmd);
    return [sandboxDirectory copy];
}

+ (NSString *)defaultHippyLocalFileScheme {
    // hpfile://
    return @"hpfile://";
}

+ (BOOL)isHippyLocalFileURLString:(NSString *)string {
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
        NSURL *localFileURL = [NSURL URLWithString:relativeString relativeToURL:self.bundleURL];
        if ([localFileURL isFileURL]) {
            return [localFileURL path];
        }
    }
    return nil;
}
@end
