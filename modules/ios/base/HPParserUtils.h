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

#import <Foundation/Foundation.h>
#import "HippyDefines.h"

/**
 * Generic utility functions for parsing Objective-C source code.
 */
HIPPY_EXTERN BOOL HPParseReadChar(const char **input, char c);
HIPPY_EXTERN BOOL HPParseReadString(const char **input, const char *string);
HIPPY_EXTERN void HPParseSkipWhitespace(const char **input);
HIPPY_EXTERN BOOL HPParseIdentifier(const char **input, NSString **string);

/**
 * Parse an Objective-C type into a form that can be used by HPConvert.
 * This doesn't really belong here, but it's used by both HPConvert and
 *  which makes it difficult to find a better home for it.
 */
HIPPY_EXTERN NSString *HPParseType(const char **input);
