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

#import "HippyI18nUtils.h"
#import <UIKit/NSText.h>

@implementation HippyI18nUtils

+ (instancetype)sharedInstance {
    static dispatch_once_t onceToken;
    static HippyI18nUtils *instance = nil;
    dispatch_once(&onceToken, ^{
        instance = [[[self class] alloc] init];
    });
    return instance;
}

- (instancetype)copy {
    return self;
}

- (NSString *)currentAppLanguageCode {
    NSString *lan = nil;
    if ([self.delegate respondsToSelector:@selector(currentAppLanguage)]) {
        lan = [self.delegate currentAppLanguage];
    }
    if (!lan) {
        lan = [[NSLocale currentLocale] objectForKey:NSLocaleLanguageCode];
    }
    return lan;
}

- (NSString *)currentCountryCode {
    NSString *countryCode = [[NSLocale currentLocale] objectForKey:NSLocaleCountryCode];
    return countryCode;
}

- (NSWritingDirection)writingDirectionForCurrentAppLanguage {
    NSString *appLan = [self currentAppLanguageCode];
    return [NSParagraphStyle defaultWritingDirectionForLanguage:appLan];
}

@end
