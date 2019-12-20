/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <Foundation/Foundation.h>

#import "HippyDefines.h"
/**
 * Generic utility functions for parsing Objective-C source code.
 */
HIPPY_EXTERN BOOL HippyReadChar(const char **input, char c);
HIPPY_EXTERN BOOL HippyReadString(const char **input, const char *string);
HIPPY_EXTERN void HippySkipWhitespace(const char **input);
HIPPY_EXTERN BOOL HippyParseIdentifier(const char **input, NSString **string);

/**
 * Parse an Objective-C type into a form that can be used by HippyConvert.
 * This doesn't really belong here, but it's used by both HippyConvert and
 * HippyModuleMethod, which makes it difficult to find a better home for it.
 */
HIPPY_EXTERN NSString *HippyParseType(const char **input);
