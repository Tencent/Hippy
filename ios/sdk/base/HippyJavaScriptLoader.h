/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
