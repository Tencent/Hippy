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

#import "SettingsInfo.h"

static NSString *const kDriver = @"driver";
static NSString *const KRender = @"render";

static NSString *const kSettings = @"settings";

@implementation SettingsInfo

- (void)encodeWithCoder:(NSCoder *)coder {
    [coder encodeInteger:self.driver forKey:kDriver];
    [coder encodeInteger:self.render forKey:KRender];
}

- (nullable instancetype)initWithCoder:(NSCoder *)coder {
    self = [super init];
    if (self) {
        self.driver = [coder decodeIntegerForKey:kDriver];
        self.render = [coder decodeIntegerForKey:KRender];
    }
    return self;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        self.driver = DriverTypeReact;
        self.render = RenderTypeNative;
    }
    return self;
}

+ (nonnull instancetype)defaultSettings {
    SettingsInfo *settings = [[NSUserDefaults standardUserDefaults] objectForKey:kSettings];
    if (!settings) {
        settings = [[SettingsInfo alloc] init];
    }
    return settings;
}

- (void)writeToFile {
    [[NSUserDefaults standardUserDefaults] setObject:self forKey:kSettings];
}

+ (NSString *)driverDescriptionFromType:(DriverType)type {
    NSString *description = nil;
    switch (type) {
        case DriverTypeReact:
            description = @"Js React";
            break;
        case DriverTypeVue:
            description = @"Js Vue";
            break;
        default:
            break;
    }
    return description;
}

+ (NSString *)renderDescriptionFromType:(RenderType)type {
    NSString *description = nil;
    switch (type) {
        case RenderTypeNative:
            description = @"Native";
            break;
        default:
            break;
    }
    return description;
}

@end
