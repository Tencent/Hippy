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
#include "HippyVFSDefines.h"
#include "vfs/uri_loader.h"

extern NSString *const VFSErrorDomain;
extern NSString *const VFSParamsMethod;
extern NSString *const VFSParamsHeaders;
extern NSString *const VFSParamsBody;

class VFSUriHandler;

extern NSError *GetVFSError(hippy::vfs::UriHandler::RetCode retCode, NSString *urlString, NSURLResponse *response);

class VFSUriLoader : public hippy::vfs::UriLoader {
  public:
    VFSUriLoader() = default;
    ~VFSUriLoader() = default;

    virtual void RequestUntrustedContent(const string_view& uri,
                                         const std::unordered_map<std::string, std::string>& meta,
                                         std::function<void(RetCode, std::unordered_map<std::string, std::string>, bytes)> cb) override;

    virtual void RequestUntrustedContent(const string_view& uri,
                                         const std::unordered_map<std::string, std::string>& req_meta,
                                         RetCode& code,
                                         std::unordered_map<std::string, std::string>& rsp_meta,
                                         bytes& content) override;

    virtual void RequestUntrustedContent(const std::shared_ptr<hippy::RequestJob>& request, 
                                         std::shared_ptr<hippy::JobResponse> response) override;
    virtual void RequestUntrustedContent(const std::shared_ptr<hippy::RequestJob>& request, 
                                         const std::function<void(std::shared_ptr<hippy::JobResponse>)>& cb) override;

    //Foundation API convenient methods
    virtual void RegisterConvenientUriHandler(NSString *scheme,
                                              const std::shared_ptr<VFSUriHandler>& handler);

    virtual void AddConvenientDefaultHandler(const std::shared_ptr<VFSUriHandler>& handler);
    virtual const std::list<std::shared_ptr<VFSUriHandler>> &GetConvenientDefaultHandlers();
    
    virtual void RequestUntrustedContent(NSString *urlString,
                                         NSDictionary *extraInfo,
                                         NSOperationQueue *operationQueue,
                                         VFSHandlerProgressBlock progress,
                                         VFSHandlerCompletionBlock completion);
    virtual void RequestUntrustedContent(NSURLRequest *request,
                                         NSDictionary *extraInfo,
                                         NSOperationQueue *operationQueue,
                                         VFSHandlerProgressBlock progress,
                                         VFSHandlerCompletionBlock completion);
    
  private:
    std::shared_ptr<VFSUriHandler> GetNextConvinentHandler(std::list<std::shared_ptr<VFSUriHandler>>::iterator &cur_con_handler_it,
                                                           const std::list<std::shared_ptr<VFSUriHandler>>::iterator &end_con_handler_it);
    std::list<std::shared_ptr<VFSUriHandler>> default_convenient_handlers_;
    std::unordered_map<NSUInteger, std::list<std::shared_ptr<VFSUriHandler>>> convenint_handler_map_;
    std::mutex convenintMutex_;
};
