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

#import "HippyDevCommand.h"

@interface HippyDevCommand () {
    NSString *_rawString;
    NSDictionary *_JSONObject;
}

@end

@implementation HippyDevCommand

- (instancetype)initWithRAWString:(NSString *)rawString {
    self = [super init];
    if (self) {
        _rawString = rawString;
    }
    return self;
}

- (NSDictionary *)toJSONObject {
    if (!_JSONObject) {
        NSData *data = [_rawString dataUsingEncoding:NSUTF8StringEncoding];
        _JSONObject = [NSJSONSerialization JSONObjectWithData:data options:(NSJSONReadingOptions)0 error:nil];
    }
    return _JSONObject;
}

- (NSNumber *)cmdID {
    return [self toJSONObject][@"id"];
}

- (NSString *)domain {
    @try {
        NSString *msg = [self toJSONObject][@"method"];
        NSArray<NSString *> *array = [msg componentsSeparatedByString:@"."];
        return array[0];
    } @catch (NSException *exception) {
        return nil;
    }
}

- (NSString *)method {
    @try {
        NSString *msg = [self toJSONObject][@"method"];
        NSArray<NSString *> *array = [msg componentsSeparatedByString:@"."];
        return array[1];
    } @catch (NSException *exception) {
        return nil;
    }
}

- (NSDictionary *)params {
    return [self toJSONObject][@"params"];
}

@end
