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

extern NSString *const HippyJavaScriptLoaderErrorDomain;

NS_ENUM(NSInteger) {
    HippyJavaScriptLoaderErrorNoScriptURL = 1,
    HippyJavaScriptLoaderErrorFailedOpeningFile = 2,
    HippyJavaScriptLoaderErrorFailedReadingFile = 3,
    HippyJavaScriptLoaderErrorFailedStatingFile = 3,
    HippyJavaScriptLoaderErrorURLLoadFailed = 3,
    
    HippyJavaScriptLoaderErrorCannotBeLoadedSynchronously = 1000,
    };
    
    @interface HippyLoadingProgress : NSObject

@property (nonatomic, copy) NSString *status;
@property (strong, nonatomic) NSNumber *done;
@property (strong, nonatomic) NSNumber *total;

@end
    
    typedef void (^HippySourceLoadProgressBlock)(HippyLoadingProgress *progressData);
    typedef void (^HippySourceLoadBlock)(NSError *error, NSData *source, int64_t sourceLength);
    
    @interface HippyJavaScriptLoader : NSObject

+ (void)loadBundleAtURL:(NSURL *)scriptURL onProgress:(HippySourceLoadProgressBlock)onProgress onComplete:(HippySourceLoadBlock)onComplete;

@end
