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

#import "HippyBridge+VFSLoader.h"
#import "FootstoneUtils.h"
#import "NSURLResponse+ToUnorderedMap.h"

#include <unordered_map>

#include "vfs/uri_handler.h"

NSString *const VFSErrorDomain = @"VFSErrorDomain";
NSString *const VFSParamsMethod = @"VFSParamsMethod";
NSString *const VFSParamsHeaders = @"VFSParamsHeaders";
NSString *const VFSParamsBody = @"VFSParamsBody";

using bytes = std::string;
using RetCode = hippy::vfs::UriHandler::RetCode;
using URLHeaderMap = std::unordered_map<std::string, std::string>;

static URLHeaderMap NSDictionaryToUnorderedMap(NSDictionary<NSString *, NSString *> *dictionary) {
    URLHeaderMap map;
    map.reserve([dictionary count]);
    for (NSString *key in dictionary) {
        NSString *value = dictionary[key];
        std::string mapKey = [key UTF8String];
        std::string mapValue = [value UTF8String];
        map[mapKey] = mapValue;
    }
    return map;
}

static NSURLResponse *ResponseMapToURLResponse(NSURL *url, RetCode retCode, URLHeaderMap &headerMap, size_t contentsLength) {
    NSURLResponse *response = nil;
    if ([[url absoluteString] hasPrefix:@"http"]) {
        NSDictionary<NSString *, NSString *> *headers = StringUnorderedMapToNSDictionary(headerMap);
        NSInteger statusCode = std::stoi(headerMap[kStatusCode]);
        response = [[NSHTTPURLResponse alloc] initWithURL:url statusCode:statusCode HTTPVersion:@"1.1" headerFields:headers];
    }
    else {
        NSString *mimeType = [NSString stringWithUTF8String:headerMap[kMIMEType].c_str()];
        NSString *textEncodingName = [NSString stringWithUTF8String:headerMap[kTextEncodingName].c_str()];
        response = [[NSURLResponse alloc] initWithURL:url MIMEType:mimeType expectedContentLength:contentsLength textEncodingName:textEncodingName];
    }
    return response;
}

static NSError *GetVFSError(RetCode retCode, NSURL *url, NSURLResponse *response) {
    if (RetCode::Success == retCode) {
        return nil;
    }
    int code = static_cast<int>(retCode);
    NSDictionary *userInfo = @{@"OriginRetCode": @(code), @"OriginURL": url, @"Response":response};
    NSError *error = [NSError errorWithDomain:VFSErrorDomain code:code userInfo:userInfo];
    return error;
}

@implementation HippyBridge (VFSLoader)

- (void)loadContentsAsynchronouslyFromUrl:(NSURL *)url
                                   params:(NSDictionary *)params
                        completionHandler:(void (^)(NSData *data, NSURLResponse *response, NSError *error))completionHandler {
    if (!completionHandler) {
        return;
    }
    footstone::string_view uri = NSStringToU16StringView([url absoluteString]);
    URLHeaderMap meta = NSDictionaryToUnorderedMap(params);
    auto cb = [completionHandler, url](RetCode code, URLHeaderMap map, bytes contents){
        NSData *data = [NSData dataWithBytes:reinterpret_cast<const void *>(contents.c_str()) length:contents.length()];
        NSURLResponse *response = ResponseMapToURLResponse(url, code, map, contents.length());
        NSError *error = GetVFSError(code, url, response);
        completionHandler(data, response, error);
    };
    self.uriLoader->RequestUntrustedContent(uri, meta, cb);
}

- (NSData *)loadContentsSynchronouslyFromUrl:(NSURL *)url
                                      params:(NSDictionary *)params
                           returningResponse:(NSURLResponse * _Nullable * _Nullable)response
                                       error:(NSError *_Nullable * _Nullable)error {
    footstone::string_view uri = NSStringToU16StringView([url absoluteString]);
    URLHeaderMap meta = NSDictionaryToUnorderedMap(params);
    RetCode code;
    URLHeaderMap resMeta;
    bytes contents;
    self.uriLoader->RequestUntrustedContent(uri, meta, code, resMeta, contents);
    NSData *data = [NSData dataWithBytes:reinterpret_cast<const void *>(contents.c_str()) length:contents.length()];
    *response = ResponseMapToURLResponse(url, code, resMeta, contents.length());
    *error = GetVFSError(code, url, *response);
    return data;
}

@end
