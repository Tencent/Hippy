/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.
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

#import "TurboConfig.h"
#import "HippyDefines.h"

@interface TurboConfig ()

@property (nonatomic, assign) BOOL enableVideo;
@property (nonatomic, copy) NSDictionary *videoInfo;
@property (nonatomic, copy) NSString *strInfo;

@end

@implementation TurboConfig

//- (instancetype)retain {
//    TurboConfig *obj = [super retain];
//    NSLog(@"test... retain %@", @(self.retainCount));
//    return obj;
//}
//
//- (oneway void)release {
//    [super release];
//    NSLog(@"test... release %@", @(self.retainCount));
//}
//
//- (void)dealloc {
//    [super dealloc];
//    NSLog(@"test...");
//}

- (NSString *)description {
    return [NSString stringWithFormat:@"%@(%p):<\nenableVideo:%@,\nstrInfo:%@\n>",
            NSStringFromClass([self class]),
            self,
            @(self.enableVideo),
            self.strInfo];
}

HIPPY_EXPORT_TURBO_MODULE(TurboConfig)

HIPPY_EXPORT_TURBO_METHOD(getInfo) {
    return self.strInfo;
}

HIPPY_EXPORT_TURBO_METHOD(setInfo:(NSString *)string) {
    self.strInfo = string;
    return @(YES);
}

HIPPY_EXPORT_TURBO_METHOD(nativeWithPromise:(nullable id)params
                          promise:(HippyPromiseResolveBlock)promise
                          reject:(HippyPromiseRejectBlock)reject) {
    promise([NSString stringWithFormat:@"iOS[%@]: Native call promise!",
             NSStringFromClass([self class])]);
    // reject(@"-1", @"xxxxx", [NSError errorWithDomain:@"test" code:-1 userInfo:nil]);
    return nil;
}

- (instancetype)init {
    if (self = [super init]) {
        self.enableVideo = YES;
        self.videoInfo = @{@"a": @"1"};
        self.strInfo = @"It is a default string!";
    }
    return self;
}

@end
