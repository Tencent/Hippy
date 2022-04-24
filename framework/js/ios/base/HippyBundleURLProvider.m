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

#import "HippyBundleURLProvider.h"

NSString *const HippyBundleURLSchemeHttp = @"http";
NSString *const HippyBundleURLSchemetHttps = @"https";

@interface HippyBundleURLProvider ()

@property (nonatomic, copy) NSString *localhostIP;
@property (nonatomic, copy) NSString *localhostPort;
@property (nonatomic, copy) NSString *debugPathUrl;
@property (nonatomic, copy) NSString *versionId;
@property (nonatomic, copy) NSString *scheme;
@property (nonatomic, copy) NSString *wsURL;

@end

@implementation HippyBundleURLProvider

#pragma mark - Life cycle

+ (instancetype)sharedInstance {
    static HippyBundleURLProvider *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[HippyBundleURLProvider alloc] init];
    });
    return sharedInstance;
}

+ (NSString *)parseVersionId:(NSString *)path {
    if (path.length <= 0) {
        return @"";
    }
    if ([path hasPrefix:@"/"]) {
        path = [path substringFromIndex:1];
    }
    NSArray<NSString *> *pathArray = [path componentsSeparatedByString:@"/"];
    if (pathArray.count <= 1) {
        return @"";
    }
    return [pathArray firstObject];
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _scheme = HippyBundleURLSchemeHttp;
        _localhostIP = @"localhost";
        _localhostPort = @"38989";
        self.debugPathUrl = @"/index.bundle?platform=ios&dev=true&minify=false";
        // websocket url after url encode
        //_wsURL = @"debugUrl=wss%3A%2F%2Fdevtools.hippy.myqcloud.com%3A443%2Fdebugger-proxy";
    }
    return self;
}

#pragma mark - Public

- (void)setLocalhostIP:(NSString *)localhostIP localhostPort:(NSString *)localhostPort {
    if (localhostIP) {
        _localhostIP = localhostIP;
    }
    if (localhostPort) {
        _localhostPort = localhostPort;
    }
}

- (void)setScheme:(NSString *)scheme {
    if (scheme) {
        _scheme = scheme;
    }
}

- (void)setDebugPathUrl:(NSString *)debugPathUrl {
    if (debugPathUrl) {
        _debugPathUrl = debugPathUrl;
        _versionId = [HippyBundleURLProvider parseVersionId:_debugPathUrl];
    }
}

- (NSString *)localhost {
    return [NSString stringWithFormat:@"%@:%@", _localhostIP, _localhostPort];
}

- (NSString *)bundleURLString {
    NSString *scheme = _scheme.length > 0 ? _scheme : HippyBundleURLSchemeHttp;
    NSString *debugPath = _debugPathUrl;
    if (_wsURL.length > 0) {
        debugPath = [NSString stringWithFormat:@"%@&%@", debugPath, _wsURL];
    }
    return [NSString stringWithFormat:@"%@://%@%@", scheme, self.localhost, debugPath];
}

@end
