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

#import <Foundation/Foundation.h>
#import "NativeRenderDefines.h"

/**
 * Generic utility functions for parsing Objective-C source code.
 */
NATIVE_RENDER_EXTERN BOOL NativeRenderReadChar(const char **input, char c);
NATIVE_RENDER_EXTERN BOOL NativeRenderReadString(const char **input, const char *string);
NATIVE_RENDER_EXTERN void NativeRenderSkipWhitespace(const char **input);
NATIVE_RENDER_EXTERN BOOL NativeRenderParseIdentifier(const char **input, NSString **string);

/**
 * Parse an Objective-C type into a form that can be used by NativeRenderConvert.
 * This doesn't really belong here, but it's used by both NativeRenderConvert and
 *  which makes it difficult to find a better home for it.
 */
NATIVE_RENDER_EXTERN NSString *NativeRenderParseType(const char **input);
