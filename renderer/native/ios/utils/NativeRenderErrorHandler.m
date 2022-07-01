/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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

#import "NativeRenderErrorHandler.h"
#import "NativeRenderLog.h"

NSString *const RenderFatalModuleName = @"RenderFatalModuleName";
NSString *const RenderErrorDomain = @"RenderErrorDomain";

static NativeRenderFatalHandler _fatalHandler;

NATIVE_RENDER_EXTERN void NativeRenderSetFatalHandler(NativeRenderFatalHandler fatalHandler) {
    _fatalHandler = fatalHandler;
}

NATIVE_RENDER_EXTERN NativeRenderFatalHandler NativeRenderGetFatalHandler(void) {
    return _fatalHandler;
}

void NativeRenderFatal(NSError *error) {
    NSString *failReason = error.localizedFailureReason;
    if (failReason && failReason.length >= 100) {
        failReason = [[failReason substringToIndex:100] stringByAppendingString:@"(...Description Too Long)"];
    }
    NSString *fatalMessage = nil;
    NSString *moduleDescription = [NSString stringWithFormat:@"Module:%@", error.userInfo[RenderFatalModuleName] ?: @"unknown"];
    if (failReason) {
        fatalMessage = [NSString stringWithFormat:@"%@,%@[Reason]: %@", moduleDescription, error.localizedDescription, failReason];
    } else {
        fatalMessage = [NSString stringWithFormat:@"%@,%@", moduleDescription, error.localizedDescription];
    }
    NativeRenderLogNativeInternal(NativeRenderLogLevelFatal, NULL, 0, @"%@", fatalMessage);

    NativeRenderFatalHandler fatalHandler = NativeRenderGetFatalHandler();
    if (fatalHandler) {
        fatalHandler(error);
    }
}
