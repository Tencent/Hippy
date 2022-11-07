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

#import <Foundation/Foundation.h>

#include "vfs/uri_loader.h"

extern NSString *const VFSErrorDomain;
extern NSString *const VFSParamsMethod;
extern NSString *const VFSParamsHeaders;
extern NSString *const VFSParamsBody;

@class HPUriLoader;

extern NSError *GetVFSError(hippy::vfs::UriHandler::RetCode retCode, NSString *urlString, NSURLResponse *response);

class VFSUriLoader : public hippy::vfs::UriLoader {
  public:
    VFSUriLoader() = default;
    ~VFSUriLoader() = default;

    //Foundation API convenient methods
    using URILoaderCompletion = std::function<void(NSData *, NSURLResponse *, NSError *)>;
    virtual void loadContentsAsynchronously(NSString *urlString, NSDictionary *headers, URILoaderCompletion completion);
    
    typedef void(^URILoaderCompletionBlock)(NSData *, NSURLResponse *, NSError *);
    void loadContentsAsynchronously(NSString *urlString, NSDictionary *headers, URILoaderCompletionBlock block);
    virtual NSData *loadContentsSynchronously(NSString *urlString, NSDictionary *headers, NSURLResponse **response, NSError **error);
    
    bool enableForward_;
};
