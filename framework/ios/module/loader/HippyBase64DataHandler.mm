/*
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#import "HippyBase64DataHandler.h"

void HippyBase64DataHandler::RequestUntrustedContent(NSURLRequest *request,
                                                     NSDictionary *extraInfo,
                                                     NSOperationQueue *queue,
                                                     VFSHandlerProgressBlock progress,
                                                     VFSHandlerCompletionBlock completion,
                                                     VFSGetNextHandlerBlock next) {
    if (!completion) {
        return;
    }
    NSURL *url = [request URL];
    if (!url) {
        completion(nil, nil, nil, [NSError errorWithDomain:NSURLErrorDomain code:NSURLErrorUnsupportedURL userInfo:nil]);
        return;
    }
    
    void (^opBlock)() = ^{
        NSError *error;
        NSData *fileData = [NSData dataWithContentsOfURL:url options:kNilOptions error:&error];
        NSURLResponse *rsp = [[NSURLResponse alloc] initWithURL:url
                                                       MIMEType:nil
                                          expectedContentLength:fileData.length
                                               textEncodingName:nil];
        completion(fileData, nil, rsp, error);
    };
    if (queue) {
        [queue addOperationWithBlock:opBlock];
    } else {
        opBlock();
    }
}
