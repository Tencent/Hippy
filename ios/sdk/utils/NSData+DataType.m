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

#import "NSData+DataType.h"

static bool memcontains(const void *s, const void *t, size_t sl, size_t tl) {
    for (size_t i = 0; i < sl - tl; i++) {
        if (0 == memcmp(s + i, t, tl)) {
            return true;
        }
    }
    return false;
}

@implementation NSData (DataType)

- (BOOL)hippy_isGif
{
    if (self.length < 12) {
        return NO;
    }
    char bytes[12] = {0};
    
    [self getBytes:&bytes length:12];
    
    const char gif[3] = {'G', 'I', 'F'};
    if (!memcmp(bytes, gif, 3)) {
        return YES;
    }
    return NO;
}

- (BOOL)hippy_isAPNG {
    if ([self length] < 0x50) {
        return NO;
    }
    const void *bytes = [self bytes];
    const char pngSig[8] = {0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a};
    const char pngacTL[4] = {'a', 'c', 'T', 'L'};
    if (0 == memcmp(bytes, pngSig, 8) &&
        memcontains(bytes, pngacTL, 0x50, 4)) {
        return YES;
    }
    return NO;
}

- (BOOL)hippy_isAnimatedImage {
    do {
        if ([self hippy_isGif]) {
            return YES;
        }
        if ([self hippy_isAPNG]) {
            return YES;
        }
    } while (0);
    return NO;
}

@end
