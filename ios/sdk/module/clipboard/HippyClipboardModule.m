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

#import "HippyClipboardModule.h"

@implementation HippyClipboardModule

HIPPY_EXPORT_MODULE(ClipboardModule)

// clang-format off
HIPPY_EXPORT_METHOD(getString:(HippyPromiseResolveBlock)resolve
                  reject:(__unused HippyPromiseRejectBlock)reject) {
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    NSString *paste = pasteboard.string == nil ? @"" : pasteboard.string;
    resolve(paste);
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(setString:(NSString *)paste) {
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    pasteboard.string = paste;
}
// clang-format on

@end
