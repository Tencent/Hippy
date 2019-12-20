/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyJavaScriptLoader.h"

#import "HippyBridge.h"
#import "HippyConvert.h"
#import "HippyUtils.h"
#import "HippyPerformanceLogger.h"

#include <sys/stat.h>

NSString *const HippyJavaScriptLoaderErrorDomain = @"HippyJavaScriptLoaderErrorDomain";

@implementation HippyLoadingProgress

- (NSString *)description
{
    NSMutableString *desc = [NSMutableString new];
    [desc appendString:_status ?: @"Loading"];
    
    // MttRN: 解决Xcode警告
    //  if(_total > 0) {
    if (_total.integerValue > 0) {
        [desc appendFormat:@" %ld%% (%@/%@)", (long)(100 * [_done integerValue] / [_total integerValue]), _done, _total];
    }
    [desc appendString:@"…"];
    return desc;
}

@end

@implementation HippyJavaScriptLoader

HIPPY_NOT_IMPLEMENTED(- (instancetype)init)

+ (void)loadBundleAtURL:(NSURL *)scriptURL onProgress:(HippySourceLoadProgressBlock)onProgress onComplete:(HippySourceLoadBlock)onComplete
{
    attemptAsynchronousLoadOfBundleAtURL(scriptURL, onProgress, onComplete);
}

static void attemptAsynchronousLoadOfBundleAtURL(NSURL *scriptURL, __unused HippySourceLoadProgressBlock onProgress, HippySourceLoadBlock onComplete)
{
    //单签
    scriptURL = sanitizeURL(scriptURL);
    
    if (scriptURL.fileURL) {
        // Reading in a large bundle can be slow. Dispatch to the background queue to do it.
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            NSError *error = nil;
            NSData *source = [NSData dataWithContentsOfFile:scriptURL.path
                                                    options:NSDataReadingMappedIfSafe
                                                      error:&error];
            onComplete(error, source, source.length);
        });
        return;
    }
    
    NSURLSessionDataTask *dataTask = [[NSURLSession sharedSession] dataTaskWithURL:scriptURL completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        if (error) {
            if ([error.domain isEqualToString:NSURLErrorDomain]) {
                error = [NSError errorWithDomain:HippyJavaScriptLoaderErrorDomain
                                            code:HippyJavaScriptLoaderErrorURLLoadFailed
                                        userInfo:
                         @{
                           NSLocalizedDescriptionKey:
                               [@"Could not connect to development server.\n\n"
                                "Ensure the following:\n"
                                "- Node server is running and available on the same network - run 'npm start' from hippy-native root\n"
                                "- Node server URL is correctly set in AppDelegate\n\n"
                                "URL: " stringByAppendingString:scriptURL.absoluteString],
                           NSLocalizedFailureReasonErrorKey: error.localizedDescription,
                           NSUnderlyingErrorKey: error,
                           }];
            }
            else {
                
            }
            onComplete(error, nil, 0);
        }
        else {
            if ([response isKindOfClass:[NSHTTPURLResponse class]]) {
                NSHTTPURLResponse *httpResp = (NSHTTPURLResponse *)response;
                NSInteger statusCode = [httpResp statusCode];
                if (200 != statusCode) {
                    error = [NSError errorWithDomain:@"JSServer"
                                                code:statusCode
                                            userInfo:userInfoForRawResponse([[NSString alloc] initWithData:data ? data : [NSData data] encoding:NSUTF8StringEncoding])];
                    onComplete(error, nil, 0);
                    return;
                }
            }
            onComplete(nil, data, data.length);
        }
    }];
    [dataTask resume];
}

static NSURL *sanitizeURL(NSURL *url)
{
    // Why we do this is lost to time. We probably shouldn't; passing a valid URL is the caller's responsibility not ours.
    return [HippyConvert NSURL:url.absoluteString];
}

static NSDictionary *userInfoForRawResponse(NSString *rawText)
{
    NSDictionary *parsedResponse = HippyJSONParse(rawText, nil);
    if (![parsedResponse isKindOfClass:[NSDictionary class]]) {
        return @{NSLocalizedDescriptionKey: rawText ? : @""};
    }
    NSArray *errors = parsedResponse[@"errors"];
    if (![errors isKindOfClass:[NSArray class]]) {
        return @{NSLocalizedDescriptionKey: rawText ? : @""};
    }
    NSMutableArray<NSDictionary *> *fakeStack = [NSMutableArray new];
    for (NSDictionary *err in errors) {
        [fakeStack addObject:
         @{
           @"methodName": err[@"description"] ?: @"",
           @"file": err[@"filename"] ?: @"",
           @"lineNumber": err[@"lineNumber"] ?: @0
           }];
    }
    return @{NSLocalizedDescriptionKey: parsedResponse[@"message"] ?: @"No message provided", @"stack": [fakeStack copy]};
}

@end
